"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: string | null;
  onExpire?: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function CountdownTimer({ endsAt, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endsAt) return;

    const tick = () => {
      const ms = new Date(endsAt).getTime() - Date.now();
      setRemaining(ms);
      if (ms <= 0) onExpire?.();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, onExpire]);

  if (!endsAt) return null;

  const isLow = remaining < 60_000;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center ${isLow ? "border-red-300 bg-red-50 text-red-700" : "bg-muted"}`}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Time remaining
      </p>
      <p className="text-3xl font-bold tabular-nums">{formatTime(remaining)}</p>
    </div>
  );
}
