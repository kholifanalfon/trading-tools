import { HistoricalDataPoint } from "@/core/types/api-stock-provider.types";
import { calculateEMA, calculateRSI, calculateMACD, calculateSMA, calculateATR, calculateBollingerBands, calculateVWAP, calculateADX, calculateZScore, calculatePOC, calculateAccumulationDistribution } from "@/core/utils/indicators";
import { calculateDayScore, calculateSwingScore, calculatePositionScore } from "@/core/utils/scoring.utils";
import { ScoreMetrics } from "@/core/types/scoring.types";
import { BacktestParams, BacktestResult, TradeLog } from "./backtest.types";

export function runBacktestSimulation(symbol: string, candles: HistoricalDataPoint[], params: BacktestParams): BacktestResult {
  const initialCapital = params.initialCapital || 1_000_000_000_000; // 1 Trillion IDR
  const { strategy, rulesConfig, buyThreshold, sellThreshold, stopLossPercent, takeProfitPercent } = params;

  if (candles.length < 50) {
    return {
      initialCapital,
      finalCapital: initialCapital,
      totalReturnPercent: 0,
      winRatePercent: 0,
      maxDrawdownPercent: 0,
      sharpeRatio: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      trades: [],
      equityCurve: [],
    };
  }

  // Pre-calculate indicators
  const closePrices = candles.map((p) => p.close);
  const highPrices = candles.map((p) => p.high);
  const lowPrices = candles.map((p) => p.low);
  const volumeVals = candles.map((p) => p.volume);

  const ema21Vals = calculateEMA(closePrices, 21);
  const ema50Vals = calculateEMA(closePrices, 50);
  const sma50Vals = calculateSMA(closePrices, 50);
  const sma200Vals = calculateSMA(closePrices, 200);
  const rsiVals = calculateRSI(closePrices, 14);
  const atrVals = calculateATR(highPrices, lowPrices, closePrices, 14);
  const avgVol10Vals = calculateSMA(volumeVals, 10);
  const avgVol20Vals = calculateSMA(volumeVals, 20);

  const yearHighVals: (number | null)[] = new Array(candles.length).fill(null);
  const priceReturn1YVals: (number | null)[] = new Array(candles.length).fill(null);

  for (let i = 0; i < candles.length; i++) {
    const startIdx = Math.max(0, i - 252);
    let highest = -Infinity;
    for (let k = startIdx; k <= i; k++) {
      if (highPrices[k] > highest) highest = highPrices[k];
    }
    yearHighVals[i] = highest;
    const prevYearPrice = closePrices[startIdx];
    priceReturn1YVals[i] = prevYearPrice !== 0 ? ((closePrices[i] - prevYearPrice) / prevYearPrice) * 100 : 0;
  }

  const { macd: macdVals, signal: macdSignalVals, histogram: macdHistVals } = calculateMACD(closePrices);

  const { upper: bbUpperVals, lower: bbLowerVals } = calculateBollingerBands(closePrices);
  const vwapVals = calculateVWAP(highPrices, lowPrices, closePrices, volumeVals);
  const adxVals = calculateADX(highPrices, lowPrices, closePrices);
  const zScoreVals = calculateZScore(closePrices);
  const pocVals = calculatePOC(highPrices, lowPrices, closePrices, volumeVals);
  const adLineVals = calculateAccumulationDistribution(highPrices, lowPrices, closePrices, volumeVals);

  const macdGoldenCrossVals = new Array(candles.length).fill(false);
  const bbBounceVals = new Array(candles.length).fill(false);
  for (let k = 1; k < candles.length; k++) {
    const prevHist = macdHistVals[k - 1];
    const currHist = macdHistVals[k];
    if (prevHist !== null && currHist !== null && prevHist <= 0 && currHist > 0) {
      macdGoldenCrossVals[k] = true;
    }
    const prevLower = bbLowerVals[k - 1];
    const currLower = bbLowerVals[k];
    if (currLower !== null && prevLower !== null) {
      const touchedOrBelow = lowPrices[k] <= currLower || closePrices[k - 1] <= prevLower;
      const closedAbove = closePrices[k] > currLower;
      if (touchedOrBelow && closedAbove) {
        bbBounceVals[k] = true;
      }
    }
  }

  // Initialize simulation states
  let capital = initialCapital;
  let holding = false;
  let entryPrice = 0;
  let entryDate: Date | null = null;
  let sharesCount = 0;
  let maxCapital = initialCapital;
  let maxDrawdown = 0;

  const trades: TradeLog[] = [];
  const equityCurve: { date: Date; capital: number; benchmark: number }[] = [];

  const initialStockPrice = candles[0].close;

  for (let i = 20; i < candles.length; i++) {
    const candle = candles[i];
    const prevClose = closePrices[i - 1];

    const metrics: ScoreMetrics = {
      close: candle.close,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      prevClose,
      volume: candle.volume,
      avgVolume10: avgVol10Vals[i],
      avgVolume20: avgVol20Vals[i],
      atr14: atrVals[i],
      rsi14: rsiVals[i],
      ema20: ema21Vals[i],
      ema50: ema50Vals[i],
      sma50: sma50Vals[i],
      sma200: sma200Vals[i],
      macdLine: macdVals[i],
      macdSignal: macdSignalVals[i],
      macdHist: macdHistVals[i],
      yearHigh: yearHighVals[i],
      priceReturn1Y: priceReturn1YVals[i],
      bbLower: bbLowerVals[i],
      bbUpper: bbUpperVals[i],
      vwap: vwapVals[i],
      adx: adxVals[i],
      zScore: zScoreVals[i],
      poc: pocVals[i],
      adLine: adLineVals[i],
      macdGoldenCross: macdGoldenCrossVals[i],
      bbBounce: bbBounceVals[i],
    };

    let score = 0;
    if (strategy === "day") {
      score = calculateDayScore(metrics, rulesConfig).total;
    } else if (strategy === "swing") {
      score = calculateSwingScore(metrics, rulesConfig).total;
    } else if (strategy === "position") {
      score = calculatePositionScore(metrics, rulesConfig).total;
    }

    const currentPrice = candle.close;
    const currentCapital = holding ? sharesCount * currentPrice : capital;

    // Track Max Drawdown
    if (currentCapital > maxCapital) {
      maxCapital = currentCapital;
    }
    const drawdown = maxCapital > 0 ? ((maxCapital - currentCapital) / maxCapital) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    const benchmarkReturn = initialStockPrice > 0 ? (currentPrice / initialStockPrice) * initialCapital : initialCapital;

    equityCurve.push({
      date: candle.date,
      capital: currentCapital,
      benchmark: benchmarkReturn,
    });

    if (!holding) {
      // Buy Trigger
      if (score >= buyThreshold) {
        holding = true;
        entryPrice = currentPrice;
        entryDate = candle.date;
        sharesCount = capital / entryPrice;
        capital = 0;
      }
    } else {
      // Sell Trigger check
      const profitPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
      let shouldSell = false;
      let exitReason: TradeLog["exitReason"] = "score_crossover";

      if (score < sellThreshold) {
        shouldSell = true;
        exitReason = "score_crossover";
      } else if (stopLossPercent !== 0 && profitPercent <= stopLossPercent) {
        shouldSell = true;
        exitReason = "stop_loss";
      } else if (takeProfitPercent !== 0 && profitPercent >= takeProfitPercent) {
        shouldSell = true;
        exitReason = "take_profit";
      }

      if (shouldSell || i === candles.length - 1) {
        if (i === candles.length - 1 && !shouldSell) {
          exitReason = "end_of_period";
        }

        capital = sharesCount * currentPrice;
        const profitAmount = capital - sharesCount * entryPrice;
        const holdingDays = entryDate ? Math.ceil((candle.date.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        trades.push({
          id: trades.length + 1,
          symbol,
          entryDate: entryDate!,
          entryPrice,
          exitDate: candle.date,
          exitPrice: currentPrice,
          profitPercent,
          profitAmount,
          exitReason,
          holdingDays,
        });

        holding = false;
        entryPrice = 0;
        entryDate = null;
        sharesCount = 0;
      }
    }
  }

  const finalCapital = holding ? sharesCount * candles[candles.length - 1].close : capital;
  const totalReturnPercent = ((finalCapital - initialCapital) / initialCapital) * 100;

  const winningTrades = trades.filter((t) => t.profitPercent > 0).length;
  const losingTrades = trades.length - winningTrades;
  const winRatePercent = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  // Calculate Sharpe Ratio (simplified: avg trade return / std dev of trade returns)
  let sharpeRatio = 0;
  if (trades.length > 1) {
    const returns = trades.map((t) => t.profitPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.map((r) => Math.pow(r - avgReturn, 2)).reduce((a, b) => a + b, 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
  } else if (trades.length === 1) {
    sharpeRatio = trades[0].profitPercent > 0 ? 1 : -1;
  }

  return {
    initialCapital,
    finalCapital,
    totalReturnPercent,
    winRatePercent,
    maxDrawdownPercent: maxDrawdown,
    sharpeRatio,
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    trades,
    equityCurve,
  };
}
