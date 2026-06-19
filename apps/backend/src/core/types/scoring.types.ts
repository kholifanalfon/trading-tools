export interface ScoreMetrics {
  close: number;
  open: number;
  high: number;
  low: number;
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
  // New indicators
  bbLower: number | null;
  bbUpper: number | null;
  vwap: number | null;
  adx: number | null;
  zScore: number | null;
  poc: number | null;
  adLine: number | null; // Accumulation/Distribution Line (CVD proxy)
  macdGoldenCross: boolean | null;
  bbBounce: boolean | null;
}

export interface ScorePayload {
  dayScore: {
    total: number;
    rvol: number;
    atr: number;
    gap: number;
    rsi: number;
    liquidity: number;
    bbBounce: number;
    priceAboveVwap: number;
    zscoreExtreme: number;
    adLineUptrend: number;
  };
  swingScore: {
    total: number;
    trend: number;
    macd: number;
    rsi: number;
    volume: number;
    proximity: number;
    macdGoldenCross: number;
    adxStrongTrend: number;
    vwapDeviationExhaustion: number;
  };
  positionScore: {
    total: number;
    trend: number;
    priceStrength: number;
    momentum: number;
    volatility: number;
    pocPullbackProximity: number;
    rvolBreakoutConfirm: number;
  };
  riskValidation?: {
    day: { stopLoss: number; targetProfit: number; rewardRiskRatio: number; passed: boolean };
    swing: { stopLoss: number; targetProfit: number; rewardRiskRatio: number; passed: boolean };
    position: { stopLoss: number; targetProfit: number; rewardRiskRatio: number; passed: boolean };
  };
}

