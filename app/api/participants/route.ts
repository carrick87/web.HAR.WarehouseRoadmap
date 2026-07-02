import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { shuffle } from "@/lib/shuffle";

export async function POST(request: Request) {
  try {
    const { eventCode, name } = await request.json();

    if (!eventCode || !name?.trim()) {
      return NextResponse.json(
        { error: "Event code and name are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const code = String(eventCode).toUpperCase();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status")
      .eq("code", code)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "waiting") {
      return NextResponse.json(
        { error: "Event has already started. Late joins are not allowed." },
        { status: 400 }
      );
    }

    const { data: existingParticipants } = await supabase
      .from("participants")
      .select("number")
      .eq("event_id", event.id);

    const usedNumbers = new Set(
      (existingParticipants ?? []).map((p) => p.number)
    );
    const count = usedNumbers.size;

    const availableNumbers: number[] = [];
    for (let i = 1; i <= count + 1; i++) {
      if (!usedNumbers.has(i)) availableNumbers.push(i);
    }

    const shuffled = shuffle(availableNumbers);
    const assignedNumber = shuffled[0];

    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        event_id: event.id,
        name: name.trim(),
        number: assignedNumber,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Join event error:", error);
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventCode = searchParams.get("eventCode");
    const token = searchParams.get("token");

    if (!eventCode || !token) {
      return NextResponse.json(
        { error: "Event code and token are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .eq("token", token)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Get participant error:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 }
    );
  }
}
