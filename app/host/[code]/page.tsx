"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CountdownTimer } from "@/components/countdown-timer";
import { CreativeRankings } from "@/components/creative-rankings";
import { ParticipantLobby } from "@/components/participant-lobby";
import { QrDisplay } from "@/components/qr-display";
import { ResultsList } from "@/components/results-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEventRealtime } from "@/hooks/use-event-realtime";

export default function HostPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { data, loading, error, refresh } = useEventRealtime(code);
  const [starting, setStarting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const joinUrl =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/join/${code.toUpperCase()}`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/join/${code.toUpperCase()}`;

  const finalizeRequestedRef = useRef(false);

  const finalizeEvent = useCallback(async () => {
    if (finalizing) return;
    setFinalizing(true);
    try {
      const res = await fetch(`/api/events/${code}/finalize`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status !== 400) {
          throw new Error(body.error ?? "Failed to finalize");
        }
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to finalize");
    } finally {
      setFinalizing(false);
    }
  }, [code, finalizing, refresh]);

  const handleTimerExpire = useCallback(() => {
    if (data?.event.status === "active") {
      finalizeEvent();
    }
  }, [data?.event.status, finalizeEvent]);

  useEffect(() => {
    if (!data?.event) return;
    const { event, participants } = data;

    if (event.status !== "active") return;

    const allGreeted =
      participants.length > 0 &&
      participants.every((p) => p.greeting_sent);

    if (allGreeted && !finalizeRequestedRef.current) {
      finalizeRequestedRef.current = true;
      void finalizeEvent();
    }
  }, [data, finalizeEvent]);

  const startEvent = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/events/${code}/start`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to start");
      toast.success("Event started!");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-full max-w-2xl items-center justify-center px-4 py-12">
        <p className="text-muted-foreground">Loading event...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-12">
        <p className="text-red-600">{error ?? "Event not found"}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back home
        </Button>
      </main>
    );
  }

  const { event, participants, claims } = data;
  const greetedCount = participants.filter((p) => p.greeting_sent).length;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Host dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your ice breaker session
          </p>
        </div>
        <Badge variant="outline">{event.status}</Badge>
      </div>

      {event.status === "waiting" && (
        <div className="space-y-6">
          {joinUrl.startsWith("http") && (
            <QrDisplay url={joinUrl} code={code.toUpperCase()} />
          )}
          <ParticipantLobby participants={participants} />
          <Button
            className="w-full"
            size="lg"
            onClick={startEvent}
            disabled={starting || participants.length < 2}
          >
            {starting ? "Starting..." : "Start event"}
          </Button>
        </div>
      )}

      {event.status === "active" && (
        <div className="space-y-6">
          <CountdownTimer
            endsAt={event.timer_ends_at}
            onExpire={handleTimerExpire}
          />
          <div className="rounded-xl border p-4 text-center">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold">
              {greetedCount} / {participants.length} greeted
            </p>
          </div>
          <ParticipantLobby participants={participants} />
          <Button
            variant="outline"
            className="w-full"
            onClick={finalizeEvent}
            disabled={finalizing}
          >
            {finalizing ? "Finalizing..." : "End early & show results"}
          </Button>
        </div>
      )}

      {event.status === "results" && (
        <div className="space-y-6">
          <CreativeRankings rankings={event.ai_rankings ?? []} />
          <ResultsList claims={claims} />
          <Button className="w-full" onClick={() => router.push("/")}>
            Start another event
          </Button>
        </div>
      )}
    </main>
  );
}
