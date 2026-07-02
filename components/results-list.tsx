import type { Claim } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResultsListProps {
  claims: Claim[];
}

export function ResultsList({ claims }: ResultsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All greetings</CardTitle>
        <CardDescription>{claims.length} greetings sent</CardDescription>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <p className="text-sm text-muted-foreground">No greetings yet.</p>
        ) : (
          <ul className="space-y-3">
            {claims.map((claim) => {
              const claimerName =
                claim.claimer?.name ?? "Someone";
              const targetName =
                claim.target?.name ?? `#${claim.target_number}`;

              return (
                <li
                  key={claim.id}
                  className="rounded-lg border px-4 py-3 text-sm leading-relaxed"
                >
                  <span className="font-semibold">{claimerName}</span> greeted{" "}
                  <span className="italic">&ldquo;{claim.greeting}&rdquo;</span>{" "}
                  to <span className="font-semibold">{targetName}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
