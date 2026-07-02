"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CountdownTimer } from "@/components/countdown-timer";
import { CreativeRankings } from "@/components/creative-rankings";
import { GreetingModal } from "@/components/greeting-modal";
import { NumberGrid } from "@/components/number-grid";
import { ResultsList } from "@/components/results-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEventRealtime } from "@/hooks/use-event-realtime";
import { loadSession, saveSession } from "@/lib/session";
import type { Participant } from "@/lib/types";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const eventCode = code.toUpperCase();
  const { data, loading, error, refresh } = useEventRealtime(eventCode);

  const [name, setName] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [joining, setJoining] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(
    () => loadSession(eventCode) === null
  );
  const finalizeRequestedRef = useRef(false);

  const finalizeEvent = useCallback(async () => {
    if (finalizeRequestedRef.current) return;
    finalizeRequestedRef.current = true;
    try {
      await fetch(`/api/events/${eventCode}/finalize`, { method: "POST" });
      await refresh();
    } catch {
      finalizeRequestedRef.current = false;
    }
  }, [eventCode, refresh]);

  const handleTimerExpire = useCallback(() => {
    if (data?.event.status === "active") {
      void finalizeEvent();
    }
  }, [data?.event.status, finalizeEvent]);

  useEffect(() => {
    const session = loadSession(eventCode);
    if (!session) return;

    let cancelled = false;

    void fetch(
      `/api/participants?eventCode=${eventCode}&token=${session.token}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((p: Participant | null) => {
        if (!cancelled && p) setParticipant(p);
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [eventCode]);

  const claimedNumbers = useMemo(() => {
    return new Set((data?.claims ?? []).map((c) => c.target_number));
  }, [data?.claims]);

  const availableNumbers = useMemo(() => {
    if (!participant || !data?.participants) return [];
    return data.participants
      .map((p) => p.number)
      .filter((n) => n !== participant.number && !claimedNumbers.has(n));
  }, [participant, data, claimedNumbers]);

  const view = useMemo(() => {
    if (!sessionChecked) return "loading" as const;
    if (!participant) return "name" as const;
    if (!data?.event) return "loading" as const;

    if (data.event.status === "results") return "results" as const;
    if (data.event.status === "waiting") return "waiting" as const;
    if (data.event.status === "active") {
      return participant.greeting_sent ? ("done" as const) : ("game" as const);
    }

    return "waiting" as const;
  }, [sessionChecked, participant, data?.event]);

  useEffect(() => {
    if (!data?.event || data.event.status !== "active") return;
    const allGreeted =
      data.participants.length > 0 &&
      data.participants.every((p) => p.greeting_sent);
    if (allGreeted) void finalizeEvent();
  }, [data, finalizeEvent]);

  const joinEvent = async () => {
    if (!name.trim()) return;
    setJoining(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventCode, name: name.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to join");

      const p = body as Participant;
      setParticipant(p);
      saveSession({
        participantId: p.id,
        token: p.token,
        eventCode,
      });
      toast.success(`You are #${p.number}!`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  const submitGreeting = async (greeting: string) => {
    if (!participant || selectedNumber === null) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventCode,
          claimerToken: participant.token,
          targetNumber: selectedNumber,
          greeting,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to send greeting");

      setSelectedNumber(null);
      setParticipant({ ...participant, greeting_sent: true });
      toast.success("Greeting sent!");
      await refresh();

      if (body.allGreeted) {
        await finalizeEvent();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || view === "loading") {
    return (
      <main className="mx-auto flex min-h-full max-w-lg items-center justify-center px-4 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-12">
        <p className="text-red-600">{error ?? "Event not found"}</p>
      </main>
    );
  }

  if (view === "name") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Join event {eventCode}</CardTitle>
            <CardDescription>Enter your name to get a number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              onKeyDown={(e) => e.key === "Enter" && joinEvent()}
            />
            <Button
              className="w-full"
              onClick={joinEvent}
              disabled={joining || !name.trim()}
            >
              {joining ? "Joining..." : "Join"}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (view === "waiting") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Hi, {participant?.name}!</CardTitle>
            <CardDescription>
              Your number is{" "}
              <span className="text-2xl font-bold text-foreground">
                #{participant?.number}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Waiting for the host to start the event...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (view === "game" && participant) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold">Pick a number</h1>
          <p className="text-sm text-muted-foreground">
            Tap a box and send a greeting to that person
          </p>
        </div>
        <div className="mb-6">
          <CountdownTimer
            endsAt={data.event.timer_ends_at}
            onExpire={handleTimerExpire}
          />
        </div>
        <NumberGrid
          availableNumbers={availableNumbers}
          participantId={participant.id}
          onSelect={setSelectedNumber}
        />
        <GreetingModal
          open={selectedNumber !== null}
          targetNumber={selectedNumber}
          onClose={() => setSelectedNumber(null)}
          onSubmit={submitGreeting}
          loading={submitting}
        />
      </main>
    );
  }

  if (view === "done") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Greeting sent!</CardTitle>
            <CardDescription>
              Waiting for others to finish or for time to run out...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CountdownTimer
              endsAt={data.event.timer_ends_at}
              onExpire={handleTimerExpire}
            />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-sm text-muted-foreground">Here are all the greetings</p>
      </div>
      <CreativeRankings rankings={data.event.ai_rankings ?? []} />
      <ResultsList claims={data.claims} />
      <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
        Done
      </Button>
    </main>
  );
}
