"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create event");
      router.push(`/host/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Ice Breaker</CardTitle>
          <CardDescription>
            A fun seminar activity — attendees scan a QR code, pick a number,
            and send creative greetings to each other.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={createEvent}
            disabled={loading}
          >
            {loading ? "Creating event..." : "Start new event"}
          </Button>
          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
