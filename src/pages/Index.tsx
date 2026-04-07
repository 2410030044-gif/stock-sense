import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResults } from "@/components/AnalysisResults";
import { analyzeSentiment, type AnalysisResult } from "@/lib/sentimentAnalyzer";
import { Activity, Sparkles, Zap, Shield, BarChart3, Clock } from "lucide-react";

const EXAMPLES = [
  "Apple stock surges 8% after reporting record-breaking quarterly earnings, beating analyst expectations significantly.",
  "Tesla shares plunge amid concerns over declining demand, production cuts, and increased competition in the EV market.",
  "Microsoft reports steady growth but faces uncertainty due to regulatory scrutiny on its AI investments.",
];

const FEATURES = [
  { icon: Zap, title: "Instant Analysis", desc: "Get real-time sentiment signals in seconds" },
  { icon: Shield, title: "Reduce Bias", desc: "Eliminate emotional decisions from trading" },
  { icon: BarChart3, title: "Bulk Analysis", desc: "Process large volumes of news at once" },
  { icon: Clock, title: "Save Time", desc: "Faster decisions with automated insights" },
];

export default function Index() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(analyzeSentiment(text));
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto flex items-center gap-2.5 py-4 px-4">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">StockSentinel</h1>
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">AI</span>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Stock News Sentiment Analyzer
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Paste any stock-related news and get an instant BUY, SELL, or HOLD signal powered by sentiment analysis.
          </p>
        </div>

        {/* Input */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste stock news, social media posts, or financial headlines here..."
              className="min-h-[140px] resize-none text-base"
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setText(ex)}
                    className="text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-full px-3 py-1 transition-colors"
                  >
                    Example {i + 1}
                  </button>
                ))}
              </div>
              <Button onClick={handleAnalyze} disabled={!text.trim() || isAnalyzing} size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && <AnalysisResults result={result} />}

        {/* Features */}
        {!result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-2 p-4 rounded-xl bg-card border">
                <Icon className="h-6 w-6 mx-auto text-primary" />
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
