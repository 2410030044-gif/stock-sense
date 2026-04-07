const POSITIVE_WORDS = [
  "surge", "surges", "surging", "soar", "soars", "soaring", "rally", "rallies", "rallying",
  "gain", "gains", "gaining", "rise", "rises", "rising", "climb", "climbs", "climbing",
  "jump", "jumps", "jumping", "boost", "boosts", "boosting", "profit", "profits", "profitable",
  "growth", "growing", "grew", "upgrade", "upgraded", "upgrades", "outperform", "outperforms",
  "beat", "beats", "beating", "exceed", "exceeds", "exceeded", "record", "high", "bullish",
  "optimistic", "positive", "strong", "strengthen", "recovery", "recover", "recovering",
  "breakthrough", "innovation", "innovative", "dividend", "buyback", "expansion", "expand",
  "revenue", "earnings", "upbeat", "momentum", "opportunity", "opportunities", "success",
  "successful", "demand", "partnership", "acquisition", "approve", "approved", "launch",
  "launched", "impressive", "exceed", "exceeding", "milestone", "robust", "stellar",
  "uptick", "rebound", "rebounds", "rebounding", "upside", "boom", "booming",
  "invest", "investing", "investment", "recommend", "buy", "accumulate", "overweight",
];

const NEGATIVE_WORDS = [
  "crash", "crashes", "crashing", "plunge", "plunges", "plunging", "drop", "drops", "dropping",
  "fall", "falls", "falling", "decline", "declines", "declining", "loss", "losses", "losing",
  "sell", "selloff", "sell-off", "dump", "dumps", "dumping", "sink", "sinks", "sinking",
  "downgrade", "downgraded", "downgrades", "underperform", "underperforms", "miss", "misses",
  "missed", "below", "weak", "weaken", "weakening", "bearish", "pessimistic", "negative",
  "risk", "risky", "risks", "concern", "concerns", "concerning", "fear", "fears", "warning",
  "warn", "warns", "threat", "threatens", "recession", "inflation", "debt", "default",
  "bankruptcy", "bankrupt", "layoff", "layoffs", "cut", "cuts", "cutting", "fraud",
  "scandal", "investigation", "lawsuit", "penalty", "fine", "fined", "volatility", "volatile",
  "uncertainty", "uncertain", "overvalued", "bubble", "correction", "crisis", "turmoil",
  "slump", "slumps", "slumping", "downturn", "stagnation", "stagnant", "collapse",
  "underweight", "reduce", "avoid", "caution", "cautious",
];

const INTENSIFIERS = ["very", "extremely", "significantly", "sharply", "dramatically", "massively", "huge", "major"];
const NEGATORS = ["not", "no", "never", "neither", "nor", "doesn't", "don't", "didn't", "won't", "isn't", "aren't", "wasn't", "weren't"];

export type Signal = "BUY" | "SELL" | "HOLD";

export interface AnalysisResult {
  signal: Signal;
  confidence: number;
  positiveScore: number;
  negativeScore: number;
  positiveWords: string[];
  negativeWords: string[];
  summary: string;
}

export function analyzeSentiment(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(Boolean);

  let positiveScore = 0;
  let negativeScore = 0;
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : "";
    const isNegated = NEGATORS.includes(prevWord);
    const isIntensified = INTENSIFIERS.includes(prevWord);
    const multiplier = isIntensified ? 1.5 : 1;

    if (POSITIVE_WORDS.includes(word)) {
      if (isNegated) {
        negativeScore += multiplier;
        foundNegative.push(word);
      } else {
        positiveScore += multiplier;
        foundPositive.push(word);
      }
    }

    if (NEGATIVE_WORDS.includes(word)) {
      if (isNegated) {
        positiveScore += multiplier;
        foundPositive.push(word);
      } else {
        negativeScore += multiplier;
        foundNegative.push(word);
      }
    }
  }

  const total = positiveScore + negativeScore;
  const netScore = total > 0 ? (positiveScore - negativeScore) / total : 0;

  let signal: Signal;
  let summary: string;

  if (netScore > 0.15) {
    signal = "BUY";
    summary = "The news sentiment is predominantly positive, indicating bullish momentum. Consider buying or holding positions.";
  } else if (netScore < -0.15) {
    signal = "SELL";
    summary = "The news sentiment is predominantly negative, indicating bearish pressure. Consider selling or reducing exposure.";
  } else {
    signal = "HOLD";
    summary = "The news sentiment is mixed or neutral. No strong directional signal detected. Hold current positions and monitor.";
  }

  const confidence = total > 0 ? Math.min(Math.round(Math.abs(netScore) * 100 + (total * 3)), 99) : 10;

  return {
    signal,
    confidence,
    positiveScore: Math.round(positiveScore),
    negativeScore: Math.round(negativeScore),
    positiveWords: [...new Set(foundPositive)],
    negativeWords: [...new Set(foundNegative)],
    summary,
  };
}
