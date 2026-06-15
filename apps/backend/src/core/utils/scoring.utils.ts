import { ScoreMetrics, ScorePayload } from "@/core/types/scoring.types";
import { ScoringRule } from "@/db/schema";

export interface ScoringRulesConfig {
  [key: string]: { value: number; weight: number };
}

export function mapRulesToConfig(rules: ScoringRule[]): ScoringRulesConfig {
  const config: ScoringRulesConfig = {};
  for (const rule of rules) {
    config[`${rule.strategy}:${rule.parameterName}`] = {
      value: rule.value,
      weight: rule.weight,
    };
  }
  return config;
}

function getRule(config: ScoringRulesConfig | undefined, strategy: string, name: string, defaultVal: number, defaultWeight: number) {
  const rule = config?.[`${strategy}:${name}`];
  return {
    value: rule !== undefined ? rule.value : defaultVal,
    weight: rule !== undefined ? rule.weight : defaultWeight,
  };
}

export function calculateDayScore(metrics: ScoreMetrics, config?: ScoringRulesConfig) {
  let score = 0;
  let rvolScore = 0;
  let atrScore = 0;
  let gapScore = 0;
  let rsiScore = 0;
  let liquidityScore = 0;

  // 1. Relative Volume (RVOL) [35 pts]
  const rvolHigh = getRule(config, "day", "rvol_high_threshold", 2.0, 35);
  const rvolMed = getRule(config, "day", "rvol_medium_threshold", 1.5, 25);
  const rvolLow = getRule(config, "day", "rvol_low_threshold", 1.0, 15);

  const avgVol = metrics.avgVolume10 || metrics.avgVolume20 || 0;
  if (avgVol > 0) {
    const rvol = metrics.volume / avgVol;
    if (rvol > rvolHigh.value) rvolScore = rvolHigh.weight;
    else if (rvol > rvolMed.value) rvolScore = rvolMed.weight;
    else if (rvol > rvolLow.value) rvolScore = rvolLow.weight;
  }

  // 2. Volatility (ATR %) [25 pts]
  const atrHigh = getRule(config, "day", "atr_high_threshold", 5.0, 25);
  const atrMed = getRule(config, "day", "atr_medium_threshold", 3.0, 15);

  if (metrics.atr14 !== null && metrics.close > 0) {
    const atrPercent = (metrics.atr14 / metrics.close) * 100;
    if (atrPercent > atrHigh.value) atrScore = atrHigh.weight;
    else if (atrPercent > atrMed.value) atrScore = atrMed.weight;
  }

  // 3. Gap % [15 pts]
  const gapHigh = getRule(config, "day", "gap_high_threshold", 2.0, 15);
  const gapMed = getRule(config, "day", "gap_medium_threshold", 1.0, 10);

  if (metrics.prevClose !== null && metrics.prevClose > 0) {
    const gapPercent = ((metrics.open - metrics.prevClose) / metrics.prevClose) * 100;
    if (gapPercent > gapHigh.value || gapPercent < -gapHigh.value) gapScore = gapHigh.weight;
    else if (gapPercent > gapMed.value || gapPercent < -gapMed.value) gapScore = gapMed.weight;
  }

  // 4. Short-term Momentum (RSI 14) [15 pts]
  const rsiOverbought = getRule(config, "day", "rsi_overbought", 60.0, 15);
  const rsiOversold = getRule(config, "day", "rsi_oversold", 30.0, 15);

  if (metrics.rsi14 !== null) {
    if (metrics.rsi14 > rsiOverbought.value || metrics.rsi14 < rsiOversold.value) {
      rsiScore = metrics.rsi14 > rsiOverbought.value ? rsiOverbought.weight : rsiOversold.weight;
    }
  }

  // 5. Liquidity [10 pts]
  const liqHigh = getRule(config, "day", "liquidity_high", 1000000.0, 10);
  const liqMed = getRule(config, "day", "liquidity_medium", 500000.0, 5);

  if (avgVol > liqHigh.value) liquidityScore = liqHigh.weight;
  else if (avgVol > liqMed.value) liquidityScore = liqMed.weight;

  score = rvolScore + atrScore + gapScore + rsiScore + liquidityScore;

  return { total: score, rvol: rvolScore, atr: atrScore, gap: gapScore, rsi: rsiScore, liquidity: liquidityScore };
}

export function calculateSwingScore(metrics: ScoreMetrics, config?: ScoringRulesConfig) {
  let score = 0;
  let trendScore = 0;
  let macdScore = 0;
  let rsiScore = 0;
  let volumeScore = 0;
  let proximityScore = 0;

  // 1. Trend Alignment [35 pts]
  const trendEma20 = getRule(config, "swing", "trend_close_above_ema20", 0.0, 15);
  const trendEma50 = getRule(config, "swing", "trend_ema20_above_ema50", 0.0, 20);

  if (metrics.ema20 !== null && metrics.close > metrics.ema20) trendScore += trendEma20.weight;
  if (metrics.ema20 !== null && metrics.ema50 !== null && metrics.ema20 > metrics.ema50) trendScore += trendEma50.weight;

  // 2. MACD Setup [25 pts]
  const macdHistPos = getRule(config, "swing", "macd_hist_positive", 0.0, 10);
  const macdLineSig = getRule(config, "swing", "macd_line_above_signal", 0.0, 15);

  if (metrics.macdHist !== null && metrics.macdHist > 0) macdScore += macdHistPos.weight;
  if (metrics.macdLine !== null && metrics.macdSignal !== null && metrics.macdLine > metrics.macdSignal) macdScore += macdLineSig.weight;

  // 3. RSI Setup [20 pts]
  const rsiLow = getRule(config, "swing", "rsi_neutral_low", 40.0, 20);
  const rsiHigh = getRule(config, "swing", "rsi_neutral_high", 65.0, 20);
  const rsiExit = getRule(config, "swing", "rsi_neutral_exit", 70.0, 10);

  if (metrics.rsi14 !== null) {
    if (metrics.rsi14 >= rsiLow.value && metrics.rsi14 <= rsiHigh.value) rsiScore = rsiLow.weight;
    else if (metrics.rsi14 > rsiHigh.value && metrics.rsi14 <= rsiExit.value) rsiScore = rsiExit.weight;
  }

  // 4. Volume Trend [10 pts]
  const volAvg = getRule(config, "swing", "volume_above_average", 0.0, 10);

  if (metrics.avgVolume20 !== null && metrics.volume > metrics.avgVolume20 && metrics.close > (metrics.prevClose || 0)) {
    volumeScore = volAvg.weight;
  }

  // 5. Proximity [10 pts]
  const proximityEma = getRule(config, "swing", "proximity_ema20_percent", 0.02, 10);

  if (metrics.ema20 !== null) {
    const diff = Math.abs(metrics.close - metrics.ema20) / metrics.ema20;
    if (diff < proximityEma.value) proximityScore = proximityEma.weight;
  }

  score = trendScore + macdScore + rsiScore + volumeScore + proximityScore;

  return { total: score, trend: trendScore, macd: macdScore, rsi: rsiScore, volume: volumeScore, proximity: proximityScore };
}

export function calculatePositionScore(metrics: ScoreMetrics, config?: ScoringRulesConfig) {
  let score = 0;
  let trendScore = 0;
  let priceStrengthScore = 0;
  let momentumScore = 0;
  let volatilityScore = 0;

  // 1. Long-Term Trend [40 pts]
  const trendSma200 = getRule(config, "position", "trend_close_above_sma200", 0.0, 15);
  const trendSma50 = getRule(config, "position", "trend_sma50_above_sma200", 0.0, 25);

  if (metrics.sma200 !== null && metrics.close > metrics.sma200) trendScore += trendSma200.weight;
  if (metrics.sma50 !== null && metrics.sma200 !== null && metrics.sma50 > metrics.sma200) trendScore += trendSma50.weight;

  // 2. Price Strength (52-Week High) [25 pts]
  const strength52w = getRule(config, "position", "strength_52w_high_diff", 0.1, 25);

  if (metrics.yearHigh !== null && metrics.yearHigh > 0) {
    const diffToHigh = (metrics.yearHigh - metrics.close) / metrics.yearHigh;
    if (diffToHigh <= strength52w.value) priceStrengthScore = strength52w.weight;
  }

  // 3. Long-term Momentum (1-Year Return) [20 pts]
  const momHigh = getRule(config, "position", "momentum_1y_high", 20.0, 20);
  const momMed = getRule(config, "position", "momentum_1y_medium", 10.0, 10);

  if (metrics.priceReturn1Y !== null) {
    if (metrics.priceReturn1Y > momHigh.value) momentumScore = momHigh.weight;
    else if (metrics.priceReturn1Y > momMed.value) momentumScore = momMed.weight;
  }

  // 4. Low Volatility (Steady Growth) [15 pts]
  const volLow = getRule(config, "position", "volatility_atr_low", 3.0, 15);
  const volMed = getRule(config, "position", "volatility_atr_medium", 5.0, 5);

  if (metrics.atr14 !== null && metrics.close > 0) {
    const atrPercent = (metrics.atr14 / metrics.close) * 100;
    if (atrPercent < volLow.value) volatilityScore = volLow.weight;
    else if (atrPercent < volMed.value) volatilityScore = volMed.weight;
  }

  score = trendScore + priceStrengthScore + momentumScore + volatilityScore;

  return { total: score, trend: trendScore, priceStrength: priceStrengthScore, momentum: momentumScore, volatility: volatilityScore };
}

export function calculateAllScores(metrics: ScoreMetrics, config?: ScoringRulesConfig): ScorePayload {
  return {
    dayScore: calculateDayScore(metrics, config),
    swingScore: calculateSwingScore(metrics, config),
    positionScore: calculatePositionScore(metrics, config),
  };
}
