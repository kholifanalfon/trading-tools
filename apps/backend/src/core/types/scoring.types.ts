export interface ScoreMetrics {
  close: number;
  open: number;
  prevClose: number | null;
  volume: number;
  avgVolume10: number | null;
  avgVolume20: number | null;
  atr14: number | null;
  rsi14: number | null;
  ema20: number | null;
  ema50: number | null;
  sma50: number | null;
  sma200: number | null;
  macdLine: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  yearHigh: number | null;
  priceReturn1Y: number | null;
}

export interface ScorePayload {
  dayScore: {
    total: number;
    rvol: number;
    atr: number;
    gap: number;
    rsi: number;
    liquidity: number;
  };
  swingScore: {
    total: number;
    trend: number;
    macd: number;
    rsi: number;
    volume: number;
    proximity: number;
  };
  positionScore: {
    total: number;
    trend: number;
    priceStrength: number;
    momentum: number;
    volatility: number;
  };
}
