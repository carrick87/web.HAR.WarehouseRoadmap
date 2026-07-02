import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const GAME_DURATION_MS = 5 * 60 * 1000;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status")
      .eq("code", code.toUpperCase())
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "waiting") {
      return NextResponse.json(
        { error: "Event has already started" },
        { status: 400 }
      );
    }

    const { count } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id);

    if ((count ?? 0) < 2) {
      return NextResponse.json(
        { error: "At least 2 participants required" },
        { status: 400 }
      );
    }

    const timerEndsAt = new Date(Date.now() + GAME_DURATION_MS).toISOString();

    const { data, error } = await supabase
      .from("events")
      .update({
        status: "active",
        timer_ends_at: timerEndsAt,
      })
      .eq("id", event.id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Start event error:", error);
    return NextResponse.json(
      { error: "Failed to start event" },
      { status: 500 }
    );
  }
}
