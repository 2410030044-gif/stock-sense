
CREATE TABLE public.stock_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_symbol TEXT NOT NULL,
  input_text TEXT NOT NULL,
  signal TEXT NOT NULL CHECK (signal IN ('BUY', 'SELL', 'HOLD')),
  confidence INTEGER NOT NULL DEFAULT 0,
  sentiment_score NUMERIC NOT NULL DEFAULT 0,
  positive_words TEXT[] DEFAULT '{}',
  negative_words TEXT[] DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view analyses" ON public.stock_analyses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analyses" ON public.stock_analyses FOR INSERT WITH CHECK (true);
