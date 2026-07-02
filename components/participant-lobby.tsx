import type { Participant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ParticipantLobbyProps {
  participants: Participant[];
}

export function ParticipantLobby({ participants }: ParticipantLobbyProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>
          {participants.length} joined
          {participants.length < 2 && " — need at least 2 to start"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Waiting for attendees to scan the QR code...
          </p>
        ) : (
          <ul className="space-y-2">
            {participants.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span className="font-medium">{p.name}</span>
                <Badge variant="secondary">#{p.number}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
