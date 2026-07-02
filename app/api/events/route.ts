import { NextResponse } from "next/server";
import { generateEventCode } from "@/lib/event-code";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createServiceClient();
    let code = generateEventCode();
    let attempts = 0;

    while (attempts < 5) {
      const { data, error } = await supabase
        .from("events")
        .insert({ code })
        .select("id, code, status, created_at")
        .single();

      if (!error) {
        return NextResponse.json(data);
      }

      if (error.code === "23505") {
        code = generateEventCode();
        attempts++;
        continue;
      }

      throw error;
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
