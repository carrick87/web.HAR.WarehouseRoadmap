import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { eventCode, claimerToken, targetNumber, greeting } =
      await request.json();

    if (!eventCode || !claimerToken || !targetNumber || !greeting?.trim()) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (greeting.trim().length > 200) {
      return NextResponse.json(
        { error: "Greeting must be 200 characters or less" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const code = String(eventCode).toUpperCase();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status, timer_ends_at")
      .eq("code", code)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "active") {
      return NextResponse.json(
        { error: "Event is not active" },
        { status: 400 }
      );
    }

    if (event.timer_ends_at && new Date(event.timer_ends_at) < new Date()) {
      return NextResponse.json({ error: "Time is up" }, { status: 400 });
    }

    const { data: claimer, error: claimerError } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .eq("token", claimerToken)
      .single();

    if (claimerError || !claimer) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    if (claimer.greeting_sent) {
      return NextResponse.json(
        { error: "You have already sent a greeting" },
        { status: 400 }
      );
    }

    if (claimer.number === targetNumber) {
      return NextResponse.json(
        { error: "You cannot greet yourself" },
        { status: 400 }
      );
    }

    const { data: target, error: targetError } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .eq("number", targetNumber)
      .single();

    if (targetError || !target) {
      return NextResponse.json(
        { error: "Target participant not found" },
        { status: 404 }
      );
    }

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .insert({
        event_id: event.id,
        claimer_id: claimer.id,
        target_number: targetNumber,
        target_participant_id: target.id,
        greeting: greeting.trim(),
      })
      .select("*")
      .single();

    if (claimError) {
      if (claimError.code === "23505") {
        return NextResponse.json(
          { error: "This number has already been taken" },
          { status: 409 }
        );
      }
      throw claimError;
    }

    await supabase
      .from("participants")
      .update({ greeting_sent: true })
      .eq("id", claimer.id);

    const { count: participantCount } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id);

    const { count: greetedCount } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("greeting_sent", true);

    const allGreeted =
      (participantCount ?? 0) > 0 && greetedCount === participantCount;

    return NextResponse.json({ claim, allGreeted });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to submit greeting" },
      { status: 500 }
    );
  }
}
