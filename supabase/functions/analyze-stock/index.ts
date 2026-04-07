import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// === Sentiment word lists ===
const POSITIVE = new Set([
  "surge","surges","surging","soar","soars","soaring","rally","rallies","rallying",
  "gain","gains","gaining","rise","rises","rising","climb","climbs","climbing",
  "jump","jumps","jumping","boost","profit","profits","profitable","growth","growing",
  "upgrade","upgraded","outperform","beat","beats","record","high","bullish","optimistic",
  "positive","strong","recovery","recover","breakthrough","innovation","dividend",
  "expansion","revenue","earnings","upbeat","momentum","opportunity","success",
  "demand","partnership","acquisition","approve","approved","launch","impressive",
  "milestone","robust","stellar","rebound","upside","boom","booming","buy","accumulate",
]);

const NEGATIVE = new Set([
  "crash","crashes","crashing","plunge","plunges","plunging","drop","drops","dropping",
  "fall","falls","falling","decline","declines","declining","loss","losses","losing",
  "selloff","sell-off","dump","dumps","sink","sinks","sinking","downgrade","downgraded",
  "underperform","miss","misses","missed","weak","weaken","bearish","pessimistic","negative",
  "risk","risky","concern","concerns","fear","fears","warning","warn","threat","recession",
  "inflation","debt","default","bankruptcy","layoff","layoffs","cut","cuts","fraud",
  "scandal","lawsuit","penalty","volatility","volatile","uncertainty","overvalued",
  "bubble","correction","crisis","turmoil","slump","downturn","stagnation","collapse",
  "underweight","reduce","avoid","caution","cautious",
]);

const NEGATORS = new Set(["not","no","never","doesn't","don't","didn't","won't","isn't","aren't"]);
const INTENSIFIERS = new Set(["very","extremely","significantly","sharply","dramatically","massively","huge","major"]);

// === Demo stock data generator ===
function generateDemoStockData(symbol: string) {
  const basePrice = symbol.length * 25 + 100;
  const days = 30;
  const prices: { date: string; close: number; volume: number }[] = [];
  let price = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * 5;
    price = Math.max(10, price + change);
    prices.push({
      date: date.toISOString().split("T")[0],
      close: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    });
  }

  const current = prices[prices.length - 1].close;
  const previous = prices[prices.length - 2].close;
  const trend = current > previous ? "up" : current < previous ? "down" : "flat";

  return { prices, currentPrice: current, previousClose: previous, trend };
}

// === Demo news generator ===
function generateDemoNews(symbol: string) {
  const positiveNews = [
    `${symbol} reports record quarterly earnings, beating analyst expectations`,
    `${symbol} announces major expansion into new markets, stock rallies`,
    `Analysts upgrade ${symbol} citing strong growth potential`,
    `${symbol} secures billion-dollar partnership deal`,
    `${symbol} stock surges on breakthrough product announcement`,
  ];
  const negativeNews = [
    `${symbol} faces regulatory scrutiny over business practices`,
    `${symbol} reports declining revenue amid market uncertainty`,
    `Analysts downgrade ${symbol} citing competitive concerns`,
    `${symbol} announces layoffs as part of cost-cutting measures`,
    `${symbol} stock drops on disappointing guidance`,
  ];
  const neutralNews = [
    `${symbol} maintains steady performance in latest quarter`,
    `Market analysts split on ${symbol} outlook for next year`,
    `${symbol} CEO discusses future strategy at industry conference`,
  ];

  const allNews = [...positiveNews, ...negativeNews, ...neutralNews];
  const shuffled = allNews.sort(() => Math.random() - 0.5).slice(0, 5);
  return shuffled.map((title, i) => ({
    title,
    source: ["Reuters", "Bloomberg", "CNBC", "MarketWatch", "Financial Times"][i % 5],
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

// === Sentiment analysis ===
function analyzeSentiment(text: string) {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  let pos = 0, neg = 0;
  const foundPos: string[] = [], foundNeg: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = i > 0 ? words[i - 1] : "";
    const negated = NEGATORS.has(prev);
    const mult = INTENSIFIERS.has(prev) ? 1.5 : 1;

    if (POSITIVE.has(w)) {
      if (negated) { neg += mult; foundNeg.push(w); }
      else { pos += mult; foundPos.push(w); }
    }
    if (NEGATIVE.has(w)) {
      if (negated) { pos += mult; foundPos.push(w); }
      else { neg += mult; foundNeg.push(w); }
    }
  }

  const total = pos + neg;
  const score = total > 0 ? (pos - neg) / total : 0;
  return { score, positiveScore: pos, negativeScore: neg, positiveWords: [...new Set(foundPos)], negativeWords: [...new Set(foundNeg)] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symbol, userText } = await req.json();
    if (!symbol) {
      return new Response(JSON.stringify({ error: "Symbol is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get stock data (demo mode)
    const stockData = generateDemoStockData(symbol.toUpperCase());

    // Get news (demo mode)
    const news = generateDemoNews(symbol.toUpperCase());

    // Combine user text + news headlines for sentiment
    const allText = [userText || "", ...news.map((n) => n.title)].join(". ");
    const sentiment = analyzeSentiment(allText);

    // Decision logic: sentiment + stock trend
    let signal: string;
    let summary: string;

    if (sentiment.score > 0.1 && stockData.trend === "up") {
      signal = "BUY";
      summary = `Positive sentiment (${(sentiment.score * 100).toFixed(0)}%) combined with upward price trend suggests buying opportunity.`;
    } else if (sentiment.score < -0.1 && stockData.trend === "down") {
      signal = "SELL";
      summary = `Negative sentiment (${(Math.abs(sentiment.score) * 100).toFixed(0)}%) combined with downward price trend suggests selling.`;
    } else {
      signal = "HOLD";
      summary = `Mixed signals detected. Sentiment is ${sentiment.score > 0 ? "slightly positive" : sentiment.score < 0 ? "slightly negative" : "neutral"} and price trend is ${stockData.trend}. Hold and monitor.`;
    }

    const confidence = Math.min(Math.round(Math.abs(sentiment.score) * 100 + (sentiment.positiveScore + sentiment.negativeScore) * 3), 95);

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("stock_analyses").insert({
      stock_symbol: symbol.toUpperCase(),
      input_text: userText || "",
      signal,
      confidence,
      sentiment_score: sentiment.score,
      positive_words: sentiment.positiveWords,
      negative_words: sentiment.negativeWords,
      summary,
    });

    return new Response(JSON.stringify({
      signal,
      confidence,
      summary,
      sentiment,
      stockData,
      news,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
