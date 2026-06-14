/**
 * Helper to calculate Exponential Moving Average (EMA)
 * Returns an array of numbers or null (if there is not enough data for the period)
 */
export function calculateEMA(prices: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length < period) {
    return ema;
  }

  const k = 2 / (period + 1);
  
  // Calculate initial Simple Moving Average (SMA) for the first 'period' elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEMA = sum / period;
  ema[period - 1] = prevEMA;

  for (let i = period; i < prices.length; i++) {
    const curEMA = prices[i] * k + prevEMA * (1 - k);
    ema[i] = curEMA;
    prevEMA = curEMA;
  }
  return ema;
}

/**
 * Helper to calculate Relative Strength Index (RSI) using Wilder's smoothing
 */
export function calculateRSI(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length <= period) {
    return rsi;
  }

  let gains = 0;
  let losses = 0;

  // First period changes
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsi;
}

/**
 * Helper to calculate MACD (12, 26, 9)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const macd: (number | null)[] = new Array(prices.length).fill(null);
  const signal: (number | null)[] = new Array(prices.length).fill(null);
  const histogram: (number | null)[] = new Array(prices.length).fill(null);

  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);

  // MACD Line = EMA(12) - EMA(26)
  for (let i = 0; i < prices.length; i++) {
    const fastVal = emaFast[i];
    const slowVal = emaSlow[i];
    if (fastVal !== null && slowVal !== null) {
      macd[i] = fastVal - slowVal;
    }
  }

  // Signal Line = EMA(9) of MACD Line
  // Filter out the non-null MACD values to calculate the signal line EMA
  const firstMacdIdx = macd.findIndex((val) => val !== null);
  if (firstMacdIdx !== -1 && prices.length >= firstMacdIdx + signalPeriod) {
    const macdSub = macd.slice(firstMacdIdx) as number[];
    const signalSub = calculateEMA(macdSub, signalPeriod);

    for (let i = 0; i < signalSub.length; i++) {
      const signalVal = signalSub[i];
      if (signalVal !== null) {
        signal[firstMacdIdx + i] = signalVal;
        const macdVal = macd[firstMacdIdx + i];
        if (macdVal !== null) {
          histogram[firstMacdIdx + i] = macdVal - signalVal;
        }
      }
    }
  }

  return { macd, signal, histogram };
}
