import type { ParticipantSession } from "./types";

const STORAGE_KEY = "icebreaker-session";

export function saveSession(session: ParticipantSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(eventCode: string): ParticipantSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as ParticipantSession;
    if (session.eventCode !== eventCode) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
