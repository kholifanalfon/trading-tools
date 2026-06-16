import { HistoricalDataPoint } from "@/core/types/api-stock-provider.types";
import { runBacktestSimulation } from "./backtest.engine";
import { ScoringRulesConfig } from "@/core/utils/scoring.utils";
import { BacktestParams, BacktestResult, OptimizationGridItem, WeightProfile } from "./backtest.types";

export const STRATEGY_WEIGHT_PROFILES: Record<"day" | "swing" | "position", WeightProfile[]> = {
  day: [
    {
      name: "Balanced (Default)",
      weights: {
        rvol_high_threshold: 35,
        rvol_medium_threshold: 25,
        rvol_low_threshold: 15,
        atr_high_threshold: 25,
        atr_medium_threshold: 15,
        gap_high_threshold: 15,
        gap_medium_threshold: 10,
        rsi_overbought: 15,
        rsi_oversold: 15,
        liquidity_high: 10,
        liquidity_medium: 5,
      },
    },
    {
      name: "Volume & Gap Momentum",
      weights: {
        rvol_high_threshold: 50,
        rvol_medium_threshold: 35,
        rvol_low_threshold: 20,
        atr_high_threshold: 15,
        atr_medium_threshold: 10,
        gap_high_threshold: 25,
        gap_medium_threshold: 15,
        rsi_overbought: 5,
        rsi_oversold: 5,
        liquidity_high: 5,
        liquidity_medium: 3,
      },
    },
    {
      name: "Volatility Heavy",
      weights: {
        rvol_high_threshold: 20,
        rvol_medium_threshold: 15,
        rvol_low_threshold: 10,
        atr_high_threshold: 50,
        atr_medium_threshold: 30,
        gap_high_threshold: 10,
        gap_medium_threshold: 5,
        rsi_overbought: 10,
        rsi_oversold: 10,
        liquidity_high: 10,
        liquidity_medium: 5,
      },
    },
  ],
  swing: [
    {
      name: "Balanced (Default)",
      weights: {
        trend_close_above_ema20: 15,
        trend_ema20_above_ema50: 20,
        macd_hist_positive: 10,
        macd_line_above_signal: 15,
        rsi_neutral_low: 20,
        rsi_neutral_high: 20,
        rsi_neutral_exit: 10,
        volume_above_average: 10,
        proximity_ema20_percent: 10,
      },
    },
    {
      name: "Trend Heavy",
      weights: {
        trend_close_above_ema20: 20,
        trend_ema20_above_ema50: 30,
        macd_hist_positive: 12,
        macd_line_above_signal: 18,
        rsi_neutral_low: 10,
        rsi_neutral_high: 10,
        rsi_neutral_exit: 5,
        volume_above_average: 5,
        proximity_ema20_percent: 5,
      },
    },
    {
      name: "Momentum Heavy",
      weights: {
        trend_close_above_ema20: 10,
        trend_ema20_above_ema50: 10,
        macd_hist_positive: 8,
        macd_line_above_signal: 12,
        rsi_neutral_low: 40,
        rsi_neutral_high: 40,
        rsi_neutral_exit: 15,
        volume_above_average: 10,
        proximity_ema20_percent: 20,
      },
    },
  ],
  position: [
    {
      name: "Balanced (Default)",
      weights: {
        trend_close_above_sma200: 15,
        trend_sma50_above_sma200: 25,
        strength_52w_high_diff: 25,
        momentum_1y_high: 20,
        momentum_1y_medium: 10,
        volatility_atr_low: 15,
        volatility_atr_medium: 5,
      },
    },
    {
      name: "Trend Following",
      weights: {
        trend_close_above_sma200: 25,
        trend_sma50_above_sma200: 35,
        strength_52w_high_diff: 20,
        momentum_1y_high: 10,
        momentum_1y_medium: 5,
        volatility_atr_low: 10,
        volatility_atr_medium: 5,
      },
    },
    {
      name: "Value & Growth Pullback",
      weights: {
        trend_close_above_sma200: 10,
        trend_sma50_above_sma200: 10,
        strength_52w_high_diff: 30,
        momentum_1y_high: 30,
        momentum_1y_medium: 15,
        volatility_atr_low: 20,
        volatility_atr_medium: 10,
      },
    },
  ],
};

export function runStrategyOptimization(
  symbol: string,
  candles: HistoricalDataPoint[],
  strategy: "day" | "swing" | "position",
  baseConfig: ScoringRulesConfig,
  buyThreshold: number,
  sellThreshold: number,
  stopLossPercent: number,
  takeProfitPercent: number,
  onProgress?: (message: string) => void,
): OptimizationGridItem[] {
  const results: OptimizationGridItem[] = [];

  // Define parameter search ranges depending on strategy
  const variations: { paramName: string; values: number[] }[] = [];

  if (strategy === "day") {
    variations.push({
      paramName: "rvol_high_threshold",
      values: [1.5, 2.0, 2.5],
    });
    variations.push({
      paramName: "rsi_oversold",
      values: [25, 30, 35],
    });
  } else if (strategy === "swing") {
    variations.push({
      paramName: "rsi_neutral_low",
      values: [35, 40, 45],
    });
    variations.push({
      paramName: "proximity_ema20_percent",
      values: [0.01, 0.02, 0.03],
    });
  } else if (strategy === "position") {
    variations.push({
      paramName: "strength_52w_high_diff",
      values: [0.05, 0.1, 0.15],
    });
    variations.push({
      paramName: "volatility_atr_low",
      values: [2.0, 3.0, 4.0],
    });
  }

  if (variations.length < 2) {
    return [];
  }

  const [varA, varB] = variations;
  const profiles = STRATEGY_WEIGHT_PROFILES[strategy] || [];

  // Grid search Profiles x A x B combinations (27 iterations total, very fast)
  for (const profile of profiles) {
    for (const valA of varA.values) {
      for (const valB of varB.values) {
        if (onProgress) {
          onProgress(`Testing setup [${profile.name}]: ${varA.paramName.replace(/_/g, " ")} = ${valA}, ${varB.paramName.replace(/_/g, " ")} = ${valB}`);
        }
        // Clone base config and inject test parameters
        const testConfig: ScoringRulesConfig = JSON.parse(JSON.stringify(baseConfig));

        // Inject weights profile
        Object.entries(profile.weights).forEach(([paramName, wVal]) => {
          const key = `${strategy}:${paramName}`;
          if (testConfig[key]) {
            testConfig[key].weight = wVal;
          }
        });

        const keyA = `${strategy}:${varA.paramName}`;
        const keyB = `${strategy}:${varB.paramName}`;

        if (testConfig[keyA]) testConfig[keyA].value = valA;
        if (testConfig[keyB]) testConfig[keyB].value = valB;

        const simParams: BacktestParams = {
          strategy,
          rulesConfig: testConfig,
          buyThreshold,
          sellThreshold,
          stopLossPercent,
          takeProfitPercent,
        };

        const result: BacktestResult = runBacktestSimulation(symbol, candles, simParams);

        const parametersOut: Record<string, number> = {
          [varA.paramName]: valA,
          [varB.paramName]: valB,
        };

        // Add weights prefixed so frontend can distinguish them
        Object.entries(profile.weights).forEach(([paramName, wVal]) => {
          parametersOut[`_weight:${paramName}`] = wVal;
        });

        results.push({
          parameters: parametersOut,
          weightProfile: profile.name,
          metrics: {
            totalReturnPercent: result.totalReturnPercent,
            winRatePercent: result.winRatePercent,
            maxDrawdownPercent: result.maxDrawdownPercent,
            totalTrades: result.totalTrades,
          },
        });
      }
    }
  }

  // Sort by totalReturnPercent descending
  return results.sort((a, b) => b.metrics.totalReturnPercent - a.metrics.totalReturnPercent);
}

export function runMultiStockOptimization(
  symbols: string[],
  candlesMap: Record<string, HistoricalDataPoint[]>,
  strategy: "day" | "swing" | "position",
  baseConfig: ScoringRulesConfig,
  buyThreshold: number,
  sellThreshold: number,
  stopLossPercent: number,
  takeProfitPercent: number,
  onProgress?: (message: string) => void,
): OptimizationGridItem[] {
  const results: OptimizationGridItem[] = [];

  // Define parameter search ranges depending on strategy
  const variations: { paramName: string; values: number[] }[] = [];

  if (strategy === "day") {
    variations.push({
      paramName: "rvol_high_threshold",
      values: [1.5, 2.0, 2.5],
    });
    variations.push({
      paramName: "rsi_oversold",
      values: [25, 30, 35],
    });
  } else if (strategy === "swing") {
    variations.push({
      paramName: "rsi_neutral_low",
      values: [35, 40, 45],
    });
    variations.push({
      paramName: "proximity_ema20_percent",
      values: [0.01, 0.02, 0.03],
    });
  } else if (strategy === "position") {
    variations.push({
      paramName: "strength_52w_high_diff",
      values: [0.05, 0.1, 0.15],
    });
    variations.push({
      paramName: "volatility_atr_low",
      values: [2.0, 3.0, 4.0],
    });
  }

  if (variations.length < 2) {
    return [];
  }

  const [varA, varB] = variations;
  const profiles = STRATEGY_WEIGHT_PROFILES[strategy] || [];

  // Grid search Profiles x A x B combinations
  for (const profile of profiles) {
    for (const valA of varA.values) {
      for (const valB of varB.values) {
        if (onProgress) {
          onProgress(`Testing global setup [${profile.name}]: ${varA.paramName.replace(/_/g, " ")} = ${valA}, ${varB.paramName.replace(/_/g, " ")} = ${valB} across all stocks`);
        }
        // Clone base config and inject test parameters
        const testConfig: ScoringRulesConfig = JSON.parse(JSON.stringify(baseConfig));

        // Inject weights profile
        Object.entries(profile.weights).forEach(([paramName, wVal]) => {
          const key = `${strategy}:${paramName}`;
          if (testConfig[key]) {
            testConfig[key].weight = wVal;
          }
        });

        const keyA = `${strategy}:${varA.paramName}`;
        const keyB = `${strategy}:${varB.paramName}`;

        if (testConfig[keyA]) testConfig[keyA].value = valA;
        if (testConfig[keyB]) testConfig[keyB].value = valB;

        let totalReturnSum = 0;
        let winRateSum = 0;
        let maxDrawdownSum = 0;
        let totalTradesSum = 0;
        let activeCount = 0;

        for (const symbol of symbols) {
          const candles = candlesMap[symbol];
          if (!candles || candles.length === 0) continue;

          const simParams: BacktestParams = {
            strategy,
            rulesConfig: testConfig,
            buyThreshold,
            sellThreshold,
            stopLossPercent,
            takeProfitPercent,
          };

          const result: BacktestResult = runBacktestSimulation(symbol, candles, simParams);
          totalReturnSum += result.totalReturnPercent;
          winRateSum += result.winRatePercent;
          maxDrawdownSum += result.maxDrawdownPercent;
          totalTradesSum += result.totalTrades;
          activeCount++;
        }

        const divisor = activeCount || 1;

        const parametersOut: Record<string, number> = {
          [varA.paramName]: valA,
          [varB.paramName]: valB,
        };

        // Add weights prefixed so frontend can distinguish them
        Object.entries(profile.weights).forEach(([paramName, wVal]) => {
          parametersOut[`_weight:${paramName}`] = wVal;
        });

        results.push({
          parameters: parametersOut,
          weightProfile: profile.name,
          metrics: {
            totalReturnPercent: totalReturnSum / divisor,
            winRatePercent: winRateSum / divisor,
            maxDrawdownPercent: maxDrawdownSum / divisor,
            totalTrades: totalTradesSum,
          },
        });
      }
    }
  }

  // Sort by average totalReturnPercent descending
  return results.sort((a, b) => b.metrics.totalReturnPercent - a.metrics.totalReturnPercent);
}
