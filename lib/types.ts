export type EventStatus = "waiting" | "active" | "results";

export interface Event {
  id: string;
  code: string;
  status: EventStatus;
  timer_ends_at: string | null;
  ai_rankings: AiRanking[] | null;
  created_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  number: number;
  token: string;
  greeting_sent: boolean;
  created_at: string;
}

export interface ClaimParticipant {
  id: string;
  name: string;
  number: number;
}

export interface Claim {
  id: string;
  event_id: string;
  claimer_id: string;
  target_number: number;
  target_participant_id: string;
  greeting: string;
  created_at: string;
  claimer?: ClaimParticipant;
  target?: ClaimParticipant;
}

export interface AiRanking {
  rank: number;
  claimerName: string;
  targetName: string;
  greeting: string;
  reason: string;
}

export interface ParticipantSession {
  participantId: string;
  token: string;
  eventCode: string;
}
