import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";
import type { AiRanking } from "@/lib/types";
import { createServiceClient } from "@/lib/supabase/server";

const rankingSchema = z.object({
  rankings: z.array(
    z.object({
      rank: z.number(),
      claimerName: z.string(),
      targetName: z.string(),
      greeting: z.string(),
      reason: z.string(),
    })
  ),
});

async function rankGreetings(
  claims: Array<{
    greeting: string;
    claimer: { name: string } | null;
    target: { name: string } | null;
  }>
): Promise<AiRanking[]> {
  if (claims.length === 0) return [];

  const greetingList = claims
    .map(
      (c, i) =>
        `${i + 1}. ${c.claimer?.name ?? "Unknown"} to ${c.target?.name ?? "Unknown"}: "${c.greeting}"`
    )
    .join("\n");

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: rankingSchema,
      prompt: `You are judging creative ice-breaker greetings at a seminar. Rank these greetings from most creative (rank 1) to least creative. Consider originality, humor, warmth, and playfulness.

Greetings:
${greetingList}

Return rankings for ALL greetings with rank numbers starting at 1.`,
    });

    return object.rankings.sort((a, b) => a.rank - b.rank);
  } catch (error) {
    console.error("AI ranking error:", error);
    return claims.map((c, i) => ({
      rank: i + 1,
      claimerName: c.claimer?.name ?? "Unknown",
      targetName: c.target?.name ?? "Unknown",
      greeting: c.greeting,
      reason: "Ranking unavailable",
    }));
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status === "results") {
      return NextResponse.json({
        event,
        rankings: event.ai_rankings ?? [],
      });
    }

    if (event.status !== "active") {
      return NextResponse.json(
        { error: "Event is not active" },
        { status: 400 }
      );
    }

    const { data: claims, error: claimsError } = await supabase
      .from("claims")
      .select(
        `
        greeting,
        claimer:participants!claims_claimer_id_fkey(name),
        target:participants!claims_target_participant_id_fkey(name)
      `
      )
      .eq("event_id", event.id);

    if (claimsError) throw claimsError;

    const normalizedClaims = (claims ?? []).map((c) => ({
      greeting: c.greeting as string,
      claimer: Array.isArray(c.claimer) ? c.claimer[0] ?? null : c.claimer,
      target: Array.isArray(c.target) ? c.target[0] ?? null : c.target,
    }));

    const rankings = await rankGreetings(normalizedClaims);

    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        status: "results",
        ai_rankings: rankings,
      })
      .eq("id", event.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      event: updatedEvent,
      rankings,
    });
  } catch (error) {
    console.error("Finalize event error:", error);
    return NextResponse.json(
      { error: "Failed to finalize event" },
      { status: 500 }
    );
  }
}
