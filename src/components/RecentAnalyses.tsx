import { useQuery } from "@tanstack/react-query";
import { getRecentAnalyses } from "@/lib/stockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

const signalStyle: Record<string, string> = {
  BUY: "bg-signal-buy/15 text-signal-buy border-0",
  SELL: "bg-signal-sell/15 text-signal-sell border-0",
  HOLD: "bg-signal-hold/15 text-signal-hold border-0",
};

export function RecentAnalyses() {
  const { data: analyses } = useQuery({
    queryKey: ["recent-analyses"],
    queryFn: getRecentAnalyses,
  });

  if (!analyses?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" /> Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {analyses.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-foreground">{a.stock_symbol}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {a.input_text || "No input"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={signalStyle[a.signal]}>{a.signal}</Badge>
                <span className="text-xs text-muted-foreground">{a.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
