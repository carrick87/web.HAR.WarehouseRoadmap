import type { Claim } from "@/lib/types";

type SupabaseParticipantRef =
  | { id: string; name: string; number: number }
  | { id: string; name: string; number: number }[]
  | null;

export function normalizeClaim(claim: {
  id: string;
  event_id: string;
  claimer_id: string;
  target_number: number;
  target_participant_id: string;
  greeting: string;
  created_at: string;
  claimer?: SupabaseParticipantRef;
  target?: SupabaseParticipantRef;
}): Claim {
  const claimer = Array.isArray(claim.claimer)
    ? claim.claimer[0]
    : claim.claimer ?? undefined;
  const target = Array.isArray(claim.target)
    ? claim.target[0]
    : claim.target ?? undefined;

  return {
    ...claim,
    claimer,
    target,
  };
}
