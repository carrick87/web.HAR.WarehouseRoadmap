import { NextResponse } from "next/server";
import { normalizeClaim } from "@/lib/normalize-claim";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createServiceClient();

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: participants } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .order("number", { ascending: true });

    const { data: claims } = await supabase
      .from("claims")
      .select(
        `
        *,
        claimer:participants!claims_claimer_id_fkey(id, name, number),
        target:participants!claims_target_participant_id_fkey(id, name, number)
      `
      )
      .eq("event_id", event.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      event,
      participants: participants ?? [],
      claims: (claims ?? []).map(normalizeClaim),
    });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
