import { supabase } from "@/integrations/supabase/client";

export interface StockPrice {
  date: string;
  close: number;
  volume: number;
}

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
}

export interface StockAnalysisResult {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  summary: string;
  sentiment: {
    score: number;
    positiveScore: number;
    negativeScore: number;
    positiveWords: string[];
    negativeWords: string[];
  };
  stockData: {
    prices: StockPrice[];
    currentPrice: number;
    previousClose: number;
    trend: "up" | "down" | "flat";
  };
  news: NewsItem[];
}

export async function analyzeStock(symbol: string, userText: string): Promise<StockAnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-stock", {
    body: { symbol, userText },
  });

  if (error) throw new Error(error.message || "Failed to analyze stock");
  if (data?.error) throw new Error(data.error);
  return data as StockAnalysisResult;
}

export async function getRecentAnalyses() {
  const { data, error } = await supabase
    .from("stock_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}
