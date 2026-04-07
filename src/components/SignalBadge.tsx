import { type Signal } from "@/lib/sentimentAnalyzer";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const config: Record<Signal, { bg: string; text: string; icon: typeof TrendingUp }> = {
  BUY: { bg: "bg-signal-buy", text: "text-signal-buy-foreground", icon: TrendingUp },
  SELL: { bg: "bg-signal-sell", text: "text-signal-sell-foreground", icon: TrendingDown },
  HOLD: { bg: "bg-signal-hold", text: "text-signal-hold-foreground", icon: Minus },
};

export function SignalBadge({ signal, confidence }: { signal: Signal; confidence: number }) {
  const { bg, text, icon: Icon } = config[signal];

  return (
    <div className={`${bg} ${text} rounded-2xl px-8 py-6 flex flex-col items-center gap-2 shadow-lg animate-in fade-in zoom-in-95 duration-300`}>
      <Icon className="h-10 w-10" />
      <span className="text-4xl font-bold tracking-tight">{signal}</span>
      <span className="text-sm opacity-90">{confidence}% confidence</span>
    </div>
  );
}
