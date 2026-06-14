import { ScoreMetrics, ScorePayload } from "@/core/types/scoring.types";

export function calculateDayScore(metrics: ScoreMetrics) {
  let score = 0;
  let rvolScore = 0;
  let atrScore = 0;
  let gapScore = 0;
  let rsiScore = 0;
  let liquidityScore = 0;

  // 1. Relative Volume (RVOL) [35 pts]
  const avgVol = metrics.avgVolume10 || metrics.avgVolume20 || 0;
  if (avgVol > 0) {
    const rvol = metrics.volume / avgVol;
    if (rvol > 2.0) rvolScore = 35;
    else if (rvol > 1.5) rvolScore = 25;
    else if (rvol > 1.0) rvolScore = 15;
  }

  // 2. Volatility (ATR %) [25 pts]
  if (metrics.atr14 !== null && metrics.close > 0) {
    const atrPercent = (metrics.atr14 / metrics.close) * 100;
    if (atrPercent > 5) atrScore = 25;
    else if (atrPercent > 3) atrScore = 15;
  }

  // 3. Gap % [15 pts]
  if (metrics.prevClose !== null && metrics.prevClose > 0) {
    const gapPercent = ((metrics.open - metrics.prevClose) / metrics.prevClose) * 100;
    if (gapPercent > 2 || gapPercent < -2) gapScore = 15;
    else if (gapPercent > 1 || gapPercent < -1) gapScore = 10;
  }

  // 4. Short-term Momentum (RSI 14) [15 pts]
  if (metrics.rsi14 !== null) {
    if (metrics.rsi14 > 60 || metrics.rsi14 < 30) rsiScore = 15;
  }

  // 5. Liquidity [10 pts]
  if (avgVol > 1_000_000) liquidityScore = 10;
  else if (avgVol > 500_000) liquidityScore = 5;

  score = rvolScore + atrScore + gapScore + rsiScore + liquidityScore;

  return { total: score, rvol: rvolScore, atr: atrScore, gap: gapScore, rsi: rsiScore, liquidity: liquidityScore };
}

export function calculateSwingScore(metrics: ScoreMetrics) {
  let score = 0;
  let trendScore = 0;
  let macdScore = 0;
  let rsiScore = 0;
  let volumeScore = 0;
  let proximityScore = 0; // Simplified for now

  // 1. Trend Alignment [35 pts]
  if (metrics.ema20 !== null && metrics.close > metrics.ema20) trendScore += 15;
  if (metrics.ema20 !== null && metrics.ema50 !== null && metrics.ema20 > metrics.ema50) trendScore += 20;

  // 2. MACD Setup [25 pts]
  if (metrics.macdHist !== null && metrics.macdHist > 0) macdScore += 10;
  if (metrics.macdLine !== null && metrics.macdSignal !== null && metrics.macdLine > metrics.macdSignal) macdScore += 15;

  // 3. RSI Setup [20 pts]
  if (metrics.rsi14 !== null) {
    if (metrics.rsi14 >= 40 && metrics.rsi14 <= 65) rsiScore = 20;
    else if (metrics.rsi14 > 65 && metrics.rsi14 <= 70) rsiScore = 10;
    // > 70 is 0
  }

  // 4. Volume Trend [10 pts]
  if (metrics.avgVolume20 !== null && metrics.volume > metrics.avgVolume20 && metrics.close > (metrics.prevClose || 0)) {
    volumeScore = 10;
  }

  // 5. Proximity [10 pts]
  // Simplified: If it's near EMA20 (within 2%) we consider it good proximity
  if (metrics.ema20 !== null) {
    const diff = Math.abs(metrics.close - metrics.ema20) / metrics.ema20;
    if (diff < 0.02) proximityScore = 10;
  }

  score = trendScore + macdScore + rsiScore + volumeScore + proximityScore;

  return { total: score, trend: trendScore, macd: macdScore, rsi: rsiScore, volume: volumeScore, proximity: proximityScore };
}

export function calculatePositionScore(metrics: ScoreMetrics) {
  let score = 0;
  let trendScore = 0;
  let priceStrengthScore = 0;
  let momentumScore = 0;
  let volatilityScore = 0;

  // 1. Long-Term Trend [40 pts]
  if (metrics.sma200 !== null && metrics.close > metrics.sma200) trendScore += 15;
  if (metrics.sma50 !== null && metrics.sma200 !== null && metrics.sma50 > metrics.sma200) trendScore += 25;

  // 2. Price Strength (52-Week High) [25 pts]
  if (metrics.yearHigh !== null && metrics.yearHigh > 0) {
    const diffToHigh = (metrics.yearHigh - metrics.close) / metrics.yearHigh;
    if (diffToHigh <= 0.1) priceStrengthScore = 25;
  }

  // 3. Long-term Momentum (1-Year Return) [20 pts]
  if (metrics.priceReturn1Y !== null) {
    if (metrics.priceReturn1Y > 20)
      momentumScore = 20; // > 20% return
    else if (metrics.priceReturn1Y > 10) momentumScore = 10;
  }

  // 4. Low Volatility (Steady Growth) [15 pts]
  if (metrics.atr14 !== null && metrics.close > 0) {
    const atrPercent = (metrics.atr14 / metrics.close) * 100;
    if (atrPercent < 3)
      volatilityScore = 15; // Low ATR is good for position
    else if (atrPercent < 5) volatilityScore = 5;
  }

  score = trendScore + priceStrengthScore + momentumScore + volatilityScore;

  return { total: score, trend: trendScore, priceStrength: priceStrengthScore, momentum: momentumScore, volatility: volatilityScore };
}

export function calculateAllScores(metrics: ScoreMetrics): ScorePayload {
  return {
    dayScore: calculateDayScore(metrics),
    swingScore: calculateSwingScore(metrics),
    positionScore: calculatePositionScore(metrics),
  };
}
