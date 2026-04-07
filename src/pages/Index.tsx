import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SignalBadge } from "@/components/SignalBadge";
import { AnalysisResults } from "@/components/AnalysisResults";
import { StockChart } from "@/components/StockChart";
import { NewsList } from "@/components/NewsList";
import { RecentAnalyses } from "@/components/RecentAnalyses";
import { analyzeStock, type StockAnalysisResult } from "@/lib/stockApi";
import { Activity, Sparkles, Zap, Shield, BarChart3, Clock, Search, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const FEATURES = [
  { icon: Zap, title: "Instant Analysis", desc: "Real-time sentiment signals in seconds" },
  { icon: Shield, title: "Reduce Bias", desc: "Eliminate emotional trading decisions" },
  { icon: BarChart3, title: "Price + Sentiment", desc: "Combined analysis for accuracy" },
  { icon: Clock, title: "Save Time", desc: "Automated insights from news" },
];

export default function Index() {
  const [symbol, setSymbol] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<StockAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAnalyze = async () => {
    if (!symbol.trim()) {
      toast({ title: "Enter a stock symbol", description: "e.g. AAPL, TSLA, MSFT", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeStock(symbol.trim(), text.trim());
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["recent-analyses"] });
    } catch (err) {
      toast({ title: "Analysis failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto flex items-center gap-2.5 py-4 px-4">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">StockSentinel</h1>
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">PRO</span>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            AI Stock Market Predictor
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enter a stock symbol and optional news — get an instant prediction powered by sentiment analysis and price trends.
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-shrink-0 w-40">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="pl-9 text-base font-semibold uppercase"
                  maxLength={10}
                />
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste stock news or leave empty for auto-analysis..."
                className="min-h-[80px] resize-none text-sm flex-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Demo mode — using simulated data. Add API keys for real-time data.</span>
              </div>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Signal */}
            <div className="flex justify-center">
              <SignalBadge signal={result.signal} confidence={result.confidence} />
            </div>

            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Chart + Sentiment side by side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockChart
                prices={result.stockData.prices}
                currentPrice={result.stockData.currentPrice}
                previousClose={result.stockData.previousClose}
                trend={result.stockData.trend}
                symbol={symbol.toUpperCase()}
              />
              <AnalysisResults
                result={{
                  signal: result.signal,
                  confidence: result.confidence,
                  positiveScore: result.sentiment.positiveScore,
                  negativeScore: result.sentiment.negativeScore,
                  positiveWords: result.sentiment.positiveWords,
                  negativeWords: result.sentiment.negativeWords,
                  summary: result.summary,
                }}
              />
            </div>

            {/* News */}
            <NewsList news={result.news} />
          </div>
        )}

        {/* Features + Recent when no result */}
        {!result && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center space-y-2 p-4 rounded-xl bg-card border">
                  <Icon className="h-6 w-6 mx-auto text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <RecentAnalyses />
          </div>
        )}
      </main>
    </div>
  );
}
