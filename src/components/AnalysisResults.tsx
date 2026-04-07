import { type AnalysisResult } from "@/lib/sentimentAnalyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignalBadge } from "@/components/SignalBadge";
import { BarChart3, ThumbsUp, ThumbsDown } from "lucide-react";

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  const total = result.positiveScore + result.negativeScore;
  const positivePercent = total > 0 ? Math.round((result.positiveScore / total) * 100) : 50;
  const negativePercent = total > 0 ? Math.round((result.negativeScore / total) * 100) : 50;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center">
        <SignalBadge signal={result.signal} confidence={result.confidence} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Sentiment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-signal-buy" /> Positive</span>
              <span className="font-medium">{positivePercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-signal-buy transition-all duration-700" style={{ width: `${positivePercent}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><ThumbsDown className="h-3.5 w-3.5 text-signal-sell" /> Negative</span>
              <span className="font-medium">{negativePercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-signal-sell transition-all duration-700" style={{ width: `${negativePercent}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {(result.positiveWords.length > 0 || result.negativeWords.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detected Keywords</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.positiveWords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.positiveWords.map((w) => (
                  <Badge key={w} className="bg-signal-buy/15 text-signal-buy border-0 hover:bg-signal-buy/25">{w}</Badge>
                ))}
              </div>
            )}
            {result.negativeWords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.negativeWords.map((w) => (
                  <Badge key={w} className="bg-signal-sell/15 text-signal-sell border-0 hover:bg-signal-sell/25">{w}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
