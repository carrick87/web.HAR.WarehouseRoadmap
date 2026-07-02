"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Claim, Event, Participant } from "@/lib/types";

interface EventData {
  event: Event;
  participants: Participant[];
  claims: Claim[];
}

export function useEventRealtime(code: string) {
  const [data, setData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${code}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Failed to load event");
    }
    const json = (await res.json()) as EventData;
    setData(json);
    setError(null);
    return json;
  }, [code]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await fetchEvent();
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const supabase = createClient();
    const channel = supabase
      .channel(`event-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          void fetchEvent().catch(() => undefined);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => {
          void fetchEvent().catch(() => undefined);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claims" },
        () => {
          void fetchEvent().catch(() => undefined);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [code, fetchEvent]);

  const refresh = useCallback(() => fetchEvent(), [fetchEvent]);

  return { data, loading, error, refresh };
}
