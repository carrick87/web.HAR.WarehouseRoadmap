import type { AiRanking } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CreativeRankingsProps {
  rankings: AiRanking[];
}

export function CreativeRankings({ rankings }: CreativeRankingsProps) {
  const topThree = rankings.slice(0, 3);

  if (topThree.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most creative greetings</CardTitle>
        <CardDescription>Ranked by AI for originality and flair</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topThree.map((item) => (
          <div
            key={`${item.rank}-${item.claimerName}`}
            className="rounded-lg border px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge>#{item.rank}</Badge>
              <span className="font-semibold">
                {item.claimerName} → {item.targetName}
              </span>
            </div>
            <p className="italic">&ldquo;{item.greeting}&rdquo;</p>
            <p className="mt-2 text-xs text-muted-foreground">{item.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
