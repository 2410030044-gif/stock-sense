import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type StockPrice } from "@/lib/stockApi";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  prices: StockPrice[];
  currentPrice: number;
  previousClose: number;
  trend: "up" | "down" | "flat";
  symbol: string;
}

export function StockChart({ prices, currentPrice, previousClose, trend, symbol }: Props) {
  const change = currentPrice - previousClose;
  const changePercent = ((change / previousClose) * 100).toFixed(2);
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{symbol} Price Chart</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">${currentPrice.toFixed(2)}</span>
            <span className={`flex items-center gap-0.5 text-sm font-medium ${isPositive ? "text-signal-buy" : "text-signal-sell"}`}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isPositive ? "+" : ""}{change.toFixed(2)} ({changePercent}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prices}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={["auto", "auto"]}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
                labelFormatter={(l) => `Date: ${l}`}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
