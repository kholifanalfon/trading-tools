import { ScoreMetrics, ScorePayload } from "@/core/types/scoring.types";
import { ScoringRule } from "@/db/schema";
import { HistoricalDataPoint } from "@/core/types/api-stock-provider.types";
import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateSMA,
  calculateATR,
  calculateBollingerBands,
  calculateVWAP,
  calculateADX,
  calculateZScore,
  calculatePOC,
  calculateAccumulationDistribution,
} from "./indicators";

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

  // New parameters (Bonus/Supplementary)
  const bbBounceRule = getRule(config, "day", "bb_lower_bounce", 0.0, 15);
  let bbBounceScore = 0;
  if (metrics.bbBounce) {
    bbBounceScore = bbBounceRule.weight;
  }

  const priceAboveVwapRule = getRule(config, "day", "price_above_vwap", 0.0, 20);
  let priceAboveVwapScore = 0;
  if (metrics.vwap !== null && metrics.close > metrics.vwap) {
    priceAboveVwapScore = priceAboveVwapRule.weight;
  }

  const zscoreExtremeRule = getRule(config, "day", "zscore_extreme_reversal", 2.5, 20);
  let zscoreExtremeScore = 0;
  if (metrics.zScore !== null && Math.abs(metrics.zScore) >= zscoreExtremeRule.value) {
    zscoreExtremeScore = zscoreExtremeRule.weight;
  }

  const adLineUptrendRule = getRule(config, "day", "ad_line_uptrend", 0.0, 15);
  let adLineUptrendScore = 0;
  if (metrics.high > metrics.low) {
    const moneyFlowMultiplier = (metrics.close - metrics.low - (metrics.high - metrics.close)) / (metrics.high - metrics.low);
    if (moneyFlowMultiplier > 0) {
      adLineUptrendScore = adLineUptrendRule.weight;
    }
  }

  score = rvolScore + atrScore + gapScore + rsiScore + liquidityScore + bbBounceScore + priceAboveVwapScore + zscoreExtremeScore + adLineUptrendScore;

  return {
    total: score,
    rvol: rvolScore,
    atr: atrScore,
    gap: gapScore,
    rsi: rsiScore,
    liquidity: liquidityScore,
    bbBounce: bbBounceScore,
    priceAboveVwap: priceAboveVwapScore,
    zscoreExtreme: zscoreExtremeScore,
    adLineUptrend: adLineUptrendScore,
  };
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

  // New parameters (Bonus/Supplementary)
  const macdGoldenCrossRule = getRule(config, "swing", "macd_golden_cross", 0.0, 20);
  let macdGoldenCrossScore = 0;
  if (metrics.macdGoldenCross) {
    macdGoldenCrossScore = macdGoldenCrossRule.weight;
  }

  const adxStrongTrendRule = getRule(config, "swing", "adx_strong_trend", 25.0, 15);
  let adxStrongTrendScore = 0;
  if (metrics.adx !== null && metrics.adx > adxStrongTrendRule.value) {
    adxStrongTrendScore = adxStrongTrendRule.weight;
  }

  const vwapDeviationExhaustionRule = getRule(config, "swing", "vwap_deviation_exhaustion", 2.0, 10);
  let vwapDeviationExhaustionScore = 0;
  if (metrics.zScore !== null && Math.abs(metrics.zScore) >= vwapDeviationExhaustionRule.value) {
    vwapDeviationExhaustionScore = vwapDeviationExhaustionRule.weight;
  }

  score = trendScore + macdScore + rsiScore + volumeScore + proximityScore + macdGoldenCrossScore + adxStrongTrendScore + vwapDeviationExhaustionScore;

  return {
    total: score,
    trend: trendScore,
    macd: macdScore,
    rsi: rsiScore,
    volume: volumeScore,
    proximity: proximityScore,
    macdGoldenCross: macdGoldenCrossScore,
    adxStrongTrend: adxStrongTrendScore,
    vwapDeviationExhaustion: vwapDeviationExhaustionScore,
  };
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

  // New parameters (Bonus/Supplementary)
  const pocPullbackRule = getRule(config, "position", "poc_pullback_proximity", 0.05, 20);
  let pocPullbackScore = 0;
  if (metrics.poc !== null && metrics.close > 0) {
    const diffPercent = Math.abs(metrics.close - metrics.poc) / metrics.poc;
    if (diffPercent <= pocPullbackRule.value) {
      pocPullbackScore = pocPullbackRule.weight;
    }
  }

  const rvolConfirmRule = getRule(config, "position", "rvol_breakout_confirm", 1.5, 15);
  let rvolConfirmScore = 0;
  const avgVolPos = metrics.avgVolume20 || metrics.avgVolume10 || 0;
  if (avgVolPos > 0) {
    const rvol = metrics.volume / avgVolPos;
    if (rvol > rvolConfirmRule.value) {
      rvolConfirmScore = rvolConfirmRule.weight;
    }
  }

  score = trendScore + priceStrengthScore + momentumScore + volatilityScore + pocPullbackScore + rvolConfirmScore;

  return {
    total: score,
    trend: trendScore,
    priceStrength: priceStrengthScore,
    momentum: momentumScore,
    volatility: volatilityScore,
    pocPullbackProximity: pocPullbackScore,
    rvolBreakoutConfirm: rvolConfirmScore,
  };
}

export function calculateAllScores(metrics: ScoreMetrics, config?: ScoringRulesConfig): ScorePayload {
  const day = calculateDayScore(metrics, config);
  const swing = calculateSwingScore(metrics, config);
  const position = calculatePositionScore(metrics, config);

  // Helper function to calculate validation per strategy
  const getValidationForStrategy = (strategy: "day" | "swing" | "position") => {
    let defaultFallback = 0.01;
    let defaultSL = 1.0;
    let defaultTP = 2.0;
    let defaultMinRR = 1.5;

    if (strategy === "swing") {
      defaultFallback = 0.02;
      defaultSL = 2.0;
      defaultTP = 6.0;
      defaultMinRR = 2.0;
    } else if (strategy === "position") {
      defaultFallback = 0.05;
      defaultSL = 3.0;
      defaultTP = 15.0;
      defaultMinRR = 5.0;
    }

    const fallbackAtrPercent = getRule(config, `risk_${strategy}`, "fallback_atr_percent", defaultFallback, 0).value;
    const slMultiplier = getRule(config, `risk_${strategy}`, "sl_multiplier", defaultSL, 0).value;
    const tpMultiplier = getRule(config, `risk_${strategy}`, "tp_multiplier", defaultTP, 0).value;
    const minRewardRiskRatio = getRule(config, `risk_${strategy}`, "min_reward_risk_ratio", defaultMinRR, 0).value;

    // PROTECTION GUARD: If real ATR is 0/null (dormant stock like POOL) or average volume is extremely low, immediately FAIL
    const avgVol = metrics.avgVolume10 || metrics.avgVolume20 || 0;
    if (!metrics.atr14 || metrics.atr14 === 0 || avgVol < 5000) {
      return {
        stopLoss: metrics.close,
        targetProfit: metrics.close,
        rewardRiskRatio: 0,
        passed: false,
      };
    }

    const fallbackAtrValue = metrics.close * fallbackAtrPercent;
    const atr = metrics.atr14 || fallbackAtrValue;

    const stopLoss = metrics.close - slMultiplier * atr;
    let targetProfit = metrics.close + tpMultiplier * atr;

    // Optimize targetProfit dynamically based on technical resistance levels
    if (strategy === "day") {
      // Day Strategy: Bollinger Band Upper acts as a strong dynamic resistance/target
      if (metrics.bbUpper !== null && metrics.bbUpper > metrics.close) {
        targetProfit = Math.min(targetProfit, metrics.bbUpper);
      }
    } else if (strategy === "swing") {
      // Swing Strategy: Blend the ATR-based target with BB Upper, and cap at Year High
      if (metrics.bbUpper !== null && metrics.bbUpper > metrics.close) {
        targetProfit = (targetProfit + metrics.bbUpper) / 2;
      }
      if (metrics.yearHigh !== null && metrics.yearHigh > metrics.close) {
        targetProfit = Math.min(targetProfit, metrics.yearHigh);
      }
    } else if (strategy === "position") {
      // Position Strategy: 52-week High is the primary long-term target, allowing for a 10% breakout buffer
      if (metrics.yearHigh !== null && metrics.yearHigh > metrics.close) {
        targetProfit = Math.min(targetProfit, metrics.yearHigh * 1.1);
      }
    }

    const riskAmount = metrics.close - stopLoss;
    const rewardAmount = targetProfit - metrics.close;

    const rewardRiskRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;
    const passed = rewardRiskRatio >= minRewardRiskRatio;

    return {
      stopLoss,
      targetProfit,
      rewardRiskRatio,
      passed,
    };
  };

  return {
    dayScore: day,
    swingScore: swing,
    positionScore: position,
    riskValidation: {
      day: getValidationForStrategy("day"),
      swing: getValidationForStrategy("swing"),
      position: getValidationForStrategy("position"),
    } as any,
  };
}

export interface CalculatedPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
  metrics: ScoreMetrics;
  scorePayload: ScorePayload;
  ema9: number | null;
  ema21: number | null;
  ema50: number | null;
  ema200: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
}

export function calculateMetricsAndScores(points: HistoricalDataPoint[], rulesConfig: ScoringRulesConfig): CalculatedPoint[] {
  const sortedPoints = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());

  const closePrices = sortedPoints.map((p) => p.close);
  const highPrices = sortedPoints.map((p) => p.high);
  const lowPrices = sortedPoints.map((p) => p.low);
  const volumeVals = sortedPoints.map((p) => p.volume);

  const ema9Vals = calculateEMA(closePrices, 9);
  const ema21Vals = calculateEMA(closePrices, 21);
  const ema50Vals = calculateEMA(closePrices, 50);
  const ema200Vals = calculateEMA(closePrices, 200);
  const sma50Vals = calculateSMA(closePrices, 50);
  const sma200Vals = calculateSMA(closePrices, 200);
  const rsiVals = calculateRSI(closePrices, 14);
  const atrVals = calculateATR(highPrices, lowPrices, closePrices, 14);
  const avgVol10Vals = calculateSMA(volumeVals, 10);
  const avgVol20Vals = calculateSMA(volumeVals, 20);

  const { macd: macdVals, signal: macdSignalVals, histogram: macdHistVals } = calculateMACD(closePrices);

  const { upper: bbUpperVals, lower: bbLowerVals } = calculateBollingerBands(closePrices);
  const vwapVals = calculateVWAP(highPrices, lowPrices, closePrices, volumeVals);
  const adxVals = calculateADX(highPrices, lowPrices, closePrices);
  const zScoreVals = calculateZScore(closePrices);
  const pocVals = calculatePOC(highPrices, lowPrices, closePrices, volumeVals);
  const adLineVals = calculateAccumulationDistribution(highPrices, lowPrices, closePrices, volumeVals);

  const macdGoldenCrossVals = new Array(sortedPoints.length).fill(false);
  const bbBounceVals = new Array(sortedPoints.length).fill(false);
  for (let k = 1; k < sortedPoints.length; k++) {
    const prevHist = macdHistVals[k - 1];
    const currHist = macdHistVals[k];
    if (prevHist !== null && currHist !== null && prevHist <= 0 && currHist > 0) {
      macdGoldenCrossVals[k] = true;
    }
    const prevLower = bbLowerVals[k - 1];
    const currLower = bbLowerVals[k];
    if (currLower !== null && prevLower !== null) {
      const touchedOrBelow = sortedPoints[k].low <= currLower || sortedPoints[k - 1].close <= prevLower;
      const closedAbove = sortedPoints[k].close > currLower;
      if (touchedOrBelow && closedAbove) {
        bbBounceVals[k] = true;
      }
    }
  }

  const yearHighVals: (number | null)[] = new Array(sortedPoints.length).fill(null);
  const yearLowVals: (number | null)[] = new Array(sortedPoints.length).fill(null);
  const priceReturn1YVals: (number | null)[] = new Array(sortedPoints.length).fill(null);

  for (let i = 0; i < sortedPoints.length; i++) {
    let startIdx = Math.max(0, i - 252);
    if (i >= 252) {
      let highest = -Infinity;
      let lowest = Infinity;
      for (let k = startIdx; k <= i; k++) {
        if (highPrices[k] > highest) highest = highPrices[k];
        if (lowPrices[k] < lowest) lowest = lowPrices[k];
      }
      yearHighVals[i] = highest;
      yearLowVals[i] = lowest;
      const prevYearPrice = closePrices[startIdx];
      priceReturn1YVals[i] = ((closePrices[i] - prevYearPrice) / prevYearPrice) * 100;
    }
  }

  return sortedPoints.map((p, index) => {
    const prevClose = index > 0 ? sortedPoints[index - 1].close : p.open;
    const changePercent = prevClose !== 0 ? ((p.close - prevClose) / prevClose) * 100 : 0;

    const metrics: ScoreMetrics = {
      close: p.close,
      open: p.open,
      high: p.high,
      low: p.low,
      prevClose,
      volume: p.volume,
      avgVolume10: avgVol10Vals[index],
      avgVolume20: avgVol20Vals[index],
      atr14: atrVals[index],
      rsi14: rsiVals[index],
      ema20: ema21Vals[index], // 21 as 20
      ema50: ema50Vals[index],
      sma50: sma50Vals[index],
      sma200: sma200Vals[index],
      macdLine: macdVals[index],
      macdSignal: macdSignalVals[index],
      macdHist: macdHistVals[index],
      yearHigh: yearHighVals[index],
      priceReturn1Y: priceReturn1YVals[index],
      bbLower: bbLowerVals[index],
      bbUpper: bbUpperVals[index],
      vwap: vwapVals[index],
      adx: adxVals[index],
      zScore: zScoreVals[index],
      poc: pocVals[index],
      adLine: adLineVals[index],
      macdGoldenCross: macdGoldenCrossVals[index],
      bbBounce: bbBounceVals[index],
    };

    const scorePayload = calculateAllScores(metrics, rulesConfig);

    return {
      date: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
      changePercent,
      metrics,
      scorePayload,
      ema9: ema9Vals[index],
      ema21: ema21Vals[index],
      ema50: ema50Vals[index],
      ema200: ema200Vals[index],
      rsi: rsiVals[index],
      macd: macdVals[index],
      macdSignal: macdSignalVals[index],
      macdHist: macdHistVals[index],
    };
  });
}
