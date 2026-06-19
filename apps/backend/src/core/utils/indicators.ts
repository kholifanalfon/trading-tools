/**
 * Exponential Moving Average (EMA)
 * Rata-rata pergerakan harga yang memberikan bobot lebih besar pada data harga terbaru.
 * 
 * RUMUS:
 * Multiplier (k) = 2 / (period + 1)
 * EMA_Hari_Ini = (Harga_Hari_Ini * k) + (EMA_Kemarin * (1 - k))
 * 
 * @param prices Seri harga penutupan (Close prices)
 * @param period Periode waktu (misal: 9, 21, 50, 200)
 * @returns Array berisi nilai EMA atau null jika data belum mencukupi periode
 */
export function calculateEMA(prices: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length < period) {
    return ema;
  }

  const k = 2 / (period + 1);

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
 * Simple Moving Average (SMA)
 * Rata-rata aritmatika sederhana dari harga penutupan selama periode waktu tertentu.
 * 
 * RUMUS:
 * SMA = (Harga_1 + Harga_2 + ... + Harga_n) / n
 * di mana n adalah jumlah hari periode.
 * 
 * @param prices Seri harga penutupan (Close prices)
 * @param period Periode waktu (misal: 50, 200)
 * @returns Array berisi nilai SMA atau null jika data belum mencukupi
 */
export function calculateSMA(prices: number[], period: number): (number | null)[] {
  const sma: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length < period) return sma;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  sma[period - 1] = sum / period;

  for (let i = period; i < prices.length; i++) {
    sum = sum + prices[i] - prices[i - period];
    sma[i] = sum / period;
  }
  return sma;
}

/**
 * Average True Range (ATR)
 * Mengukur tingkat volatilitas pasar dengan menghitung rata-rata True Range (rentang harga riil).
 * 
 * RUMUS:
 * 1. True Range (TR) adalah nilai terbesar dari:
 *    - (High - Low)
 *    - Absolut (High - Close_Kemarin)
 *    - Absolut (Low - Close_Kemarin)
 * 2. ATR dihaluskan menggunakan Wilder's Smoothing:
 *    ATR_Hari_Ini = ((ATR_Kemarin * (period - 1)) + TR_Hari_Ini) / period
 * 
 * @param highs Seri harga tertinggi
 * @param lows Seri harga terendah
 * @param closes Seri harga penutupan
 * @param period Periode waktu (default: 14)
 * @returns Array berisi nilai ATR atau null jika data belum mencukupi
 */
export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): (number | null)[] {
  const atr: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period) return atr;

  const tr: number[] = new Array(closes.length).fill(0);
  for (let i = 1; i < closes.length; i++) {
    const h = highs[i];
    const l = lows[i];
    const pc = closes[i - 1];
    tr[i] = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
  }

  let sumTR = 0;
  for (let i = 1; i <= period; i++) {
    sumTR += tr[i];
  }
  atr[period] = sumTR / period;

  for (let i = period + 1; i < closes.length; i++) {
    atr[i] = (atr[i - 1]! * (period - 1) + tr[i]) / period;
  }

  return atr;
}

/**
 * Relative Strength Index (RSI)
 * Indikator momentum untuk mengukur kecepatan dan perubahan harga (skala 0 - 100).
 * Menggunakan Wilder's smoothing untuk menghitung rata-rata kenaikan dan penurunan.
 * 
 * RUMUS:
 * RS = Rata-rata Kenaikan / Rata-rata Penurunan
 * RSI = 100 - (100 / (1 + RS))
 * 
 * @param prices Seri harga penutupan (Close prices)
 * @param period Periode waktu (default: 14)
 * @returns Array berisi nilai RSI atau null jika data belum mencukupi
 */
export function calculateRSI(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length <= period) {
    return rsi;
  }

  let gains = 0;
  let losses = 0;

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
 * Moving Average Convergence Divergence (MACD)
 * Indikator momentum tren yang melihat hubungan antara EMA cepat (12) dan EMA lambat (26).
 * 
 * RUMUS:
 * Garis MACD = EMA_12 - EMA_26
 * Garis Sinyal = EMA_9 dari Garis MACD
 * Histogram = Garis MACD - Garis Sinyal
 * 
 * @param prices Seri harga penutupan (Close prices)
 * @param fastPeriod Periode EMA Cepat (default: 12)
 * @param slowPeriod Periode EMA Lambat (default: 26)
 * @param signalPeriod Periode EMA Sinyal (default: 9)
 * @returns Object berisi array macd, signal, dan histogram
 */
export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
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

  for (let i = 0; i < prices.length; i++) {
    const fastVal = emaFast[i];
    const slowVal = emaSlow[i];
    if (fastVal !== null && slowVal !== null) {
      macd[i] = fastVal - slowVal;
    }
  }

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

/**
 * Bollinger Bands
 * Mengukur tingkat kejenuhan harga (oversold/overbought) menggunakan standar deviasi.
 * 
 * RUMUS:
 * Pita Tengah (Middle) = SMA_20
 * Pita Atas (Upper) = SMA_20 + (Multiplier * Standar Deviasi)
 * Pita Bawah (Lower) = SMA_20 - (Multiplier * Standar Deviasi)
 * 
 * @param prices Seri harga penutupan (Close prices)
 * @param period Periode SMA (default: 20)
 * @param stdDevMultiplier Pengali standar deviasi (default: 2)
 * @returns Object berisi array upper, middle, dan lower
 */
export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDevMultiplier = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const upper: (number | null)[] = new Array(prices.length).fill(null);
  const middle: (number | null)[] = new Array(prices.length).fill(null);
  const lower: (number | null)[] = new Array(prices.length).fill(null);

  const sma = calculateSMA(prices, period);

  for (let i = period - 1; i < prices.length; i++) {
    const smaVal = sma[i];
    if (smaVal !== null) {
      // Calculate standard deviation
      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const diff = prices[j] - smaVal;
        sumSqDiff += diff * diff;
      }
      const variance = sumSqDiff / period;
      const stdDev = Math.sqrt(variance);

      middle[i] = smaVal;
      upper[i] = smaVal + stdDev * stdDevMultiplier;
      lower[i] = smaVal - stdDev * stdDevMultiplier;
    }
  }

  return { upper, middle, lower };
}

/**
 * Volume Weighted Average Price (VWAP)
 * Menghitung harga transaksi rata-rata tertimbang berdasarkan volume perdagangan.
 * 
 * RUMUS:
 * Typical Price = (High + Low + Close) / 3
 * VWAP = Sum(Typical Price * Volume) / Sum(Volume)
 * 
 * @param highs Seri harga tertinggi
 * @param lows Seri harga terendah
 * @param closes Seri harga penutupan
 * @param volumes Seri volume transaksi
 * @param period Periode waktu (default: 20)
 * @returns Array berisi nilai VWAP atau null jika data belum mencukupi
 */
export function calculateVWAP(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  period = 20
): (number | null)[] {
  const vwap: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period) return vwap;

  for (let i = period - 1; i < closes.length; i++) {
    let sumTypicalPriceVolume = 0;
    let sumVolume = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const typicalPrice = (highs[j] + lows[j] + closes[j]) / 3;
      sumTypicalPriceVolume += typicalPrice * volumes[j];
      sumVolume += volumes[j];
    }
    vwap[i] = sumVolume > 0 ? sumTypicalPriceVolume / sumVolume : closes[i];
  }

  return vwap;
}

/**
 * Average Directional Index (ADX)
 * Mengukur kekuatan tren pergerakan harga tanpa memperhitungkan arahnya.
 * ADX > 25 mengindikasikan adanya tren yang kuat.
 * 
 * RUMUS:
 * 1. Hitung Directional Movement (+DM dan -DM)
 * 2. Hitung Directional Indicator (+DI dan -DI) dengan membaginya terhadap smoothed ATR.
 * 3. DX = 100 * |(+DI) - (-DI)| / ((+DI) + (-DI))
 * 4. ADX = Wilder's smoothing dari DX
 * 
 * @param highs Seri harga tertinggi
 * @param lows Seri harga terendah
 * @param closes Seri harga penutupan
 * @param period Periode waktu (default: 14)
 * @returns Array berisi nilai ADX atau null jika data belum mencukupi
 */
export function calculateADX(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): (number | null)[] {
  const adx: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period * 2) return adx;

  const plusDM: number[] = new Array(closes.length).fill(0);
  const minusDM: number[] = new Array(closes.length).fill(0);
  const tr: number[] = new Array(closes.length).fill(0);

  for (let i = 1; i < closes.length; i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];

    if (upMove > downMove && upMove > 0) {
      plusDM[i] = upMove;
    } else {
      plusDM[i] = 0;
    }

    if (downMove > upMove && downMove > 0) {
      minusDM[i] = downMove;
    } else {
      minusDM[i] = 0;
    }

    const h = highs[i];
    const l = lows[i];
    const pc = closes[i - 1];
    tr[i] = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
  }

  // Smooth using Wilder's smoothing
  const smoothedTR: number[] = new Array(closes.length).fill(0);
  const smoothedPlusDM: number[] = new Array(closes.length).fill(0);
  const smoothedMinusDM: number[] = new Array(closes.length).fill(0);

  let initialTR = 0;
  let initialPlusDM = 0;
  let initialMinusDM = 0;

  for (let i = 1; i <= period; i++) {
    initialTR += tr[i];
    initialPlusDM += plusDM[i];
    initialMinusDM += minusDM[i];
  }

  smoothedTR[period] = initialTR;
  smoothedPlusDM[period] = initialPlusDM;
  smoothedMinusDM[period] = initialMinusDM;

  for (let i = period + 1; i < closes.length; i++) {
    smoothedTR[i] = smoothedTR[i - 1] - smoothedTR[i - 1] / period + tr[i];
    smoothedPlusDM[i] = smoothedPlusDM[i - 1] - smoothedPlusDM[i - 1] / period + plusDM[i];
    smoothedMinusDM[i] = smoothedMinusDM[i - 1] - smoothedMinusDM[i - 1] / period + minusDM[i];
  }

  const dx: number[] = new Array(closes.length).fill(0);

  for (let i = period; i < closes.length; i++) {
    const trVal = smoothedTR[i];
    const plusDI = trVal > 0 ? 100 * (smoothedPlusDM[i] / trVal) : 0;
    const minusDI = trVal > 0 ? 100 * (smoothedMinusDM[i] / trVal) : 0;
    const diff = Math.abs(plusDI - minusDI);
    const sum = plusDI + minusDI;
    dx[i] = sum > 0 ? 100 * (diff / sum) : 0;
  }

  // ADX is the SMA of DX
  let sumDX = 0;
  for (let i = period; i < period * 2; i++) {
    sumDX += dx[i];
  }
  adx[period * 2 - 1] = sumDX / period;

  for (let i = period * 2; i < closes.length; i++) {
    adx[i] = (adx[i - 1]! * (period - 1) + dx[i]) / period;
  }

  return adx;
}

/**
 * Z-Score
 * Mengukur tingkat deviasi harga penutupan saat ini dari rata-ratanya dalam satuan standar deviasi.
 * Berguna untuk mendeteksi potensi pembalikan harga (mean reversion) jika nilainya ekstrem (>= 2.5 atau <= -2.5).
 * 
 * RUMUS:
 * Z-Score = (Harga_Saat_Ini - SMA_20) / Standar_Deviasi_20
 * 
 * @param prices Seri harga penutupan (Close prices)
 * @param period Periode waktu (default: 20)
 * @returns Array berisi nilai Z-Score atau null jika data belum mencukupi
 */
export function calculateZScore(prices: number[], period = 20): (number | null)[] {
  const zScore: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length < period) return zScore;

  const sma = calculateSMA(prices, period);

  for (let i = period - 1; i < prices.length; i++) {
    const smaVal = sma[i];
    if (smaVal !== null) {
      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const diff = prices[j] - smaVal;
        sumSqDiff += diff * diff;
      }
      const variance = sumSqDiff / period;
      const stdDev = Math.sqrt(variance);

      zScore[i] = stdDev > 0 ? (prices[i] - smaVal) / stdDev : 0;
    }
  }

  return zScore;
}

/**
 * Point of Control (POC) / Volume Profile
 * Menentukan tingkat harga spesifik yang paling banyak diperdagangkan dalam jangka waktu lookback.
 * Bertindak sebagai magnet harga atau level support/resistance yang sangat kuat.
 * 
 * CARA KERJA:
 * 1. Cari harga terendah (Min) dan tertinggi (Max) dalam jendela lookback.
 * 2. Bagi selisihnya menjadi 10 keranjang (bins) harga dengan lebar yang sama.
 * 3. Masukkan volume transaksi harian ke bins berdasarkan typical price pada hari itu.
 * 4. Temukan bin dengan akumulasi volume transaksi terbesar.
 * 5. POC diestimasi sebagai nilai tengah (midpoint) dari bin terbaik tersebut.
 * 
 * @param highs Seri harga tertinggi
 * @param lows Seri harga terendah
 * @param closes Seri harga penutupan
 * @param volumes Seri volume transaksi
 * @param lookbackPeriod Jendela waktu ke belakang (default: 20)
 * @returns Array berisi nilai harga POC atau null jika data belum mencukupi
 */
export function calculatePOC(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  lookbackPeriod = 20
): (number | null)[] {
  const poc: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < lookbackPeriod) return poc;

  for (let i = lookbackPeriod - 1; i < closes.length; i++) {
    // Find min and max price in the window
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (let j = i - lookbackPeriod + 1; j <= i; j++) {
      if (lows[j] < minPrice) minPrice = lows[j];
      if (highs[j] > maxPrice) maxPrice = highs[j];
    }

    if (minPrice === maxPrice || minPrice === Infinity) {
      poc[i] = closes[i];
      continue;
    }

    // Slice range into 10 bins
    const numBins = 10;
    const binSize = (maxPrice - minPrice) / numBins;
    const binVolumes = new Array(numBins).fill(0);

    for (let j = i - lookbackPeriod + 1; j <= i; j++) {
      const typicalPrice = (highs[j] + lows[j] + closes[j]) / 3;
      const binIndex = Math.min(numBins - 1, Math.floor((typicalPrice - minPrice) / binSize));
      if (binIndex >= 0 && binIndex < numBins) {
        binVolumes[binIndex] += volumes[j];
      }
    }

    // Find bin with highest volume
    let maxVol = -1;
    let bestBinIdx = 0;
    for (let b = 0; b < numBins; b++) {
      if (binVolumes[b] > maxVol) {
        maxVol = binVolumes[b];
        bestBinIdx = b;
      }
    }

    // POC price is the middle of the best bin
    poc[i] = minPrice + bestBinIdx * binSize + binSize / 2;
  }

  return poc;
}

/**
 * Accumulation/Distribution (A/D) Line
 * Mengukur akumulasi/distribusi modal di pasar berdasarkan letak harga penutupan di dalam rentang harga harian.
 * Bertindak sebagai CVD (Cumulative Volume Delta) proxy.
 * 
 * RUMUS:
 * Money Flow Multiplier = ((Close - Low) - (High - Close)) / (High - Low)
 * Money Flow Volume = Money Flow Multiplier * Volume
 * A/D Line = A/D Line Kemarin + Money Flow Volume
 * 
 * @param highs Seri harga tertinggi
 * @param lows Seri harga terendah
 * @param closes Seri harga penutupan
 * @param volumes Seri volume transaksi
 * @returns Array berisi nilai kumulatif A/D Line atau null jika data kosong
 */
export function calculateAccumulationDistribution(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
): (number | null)[] {
  const adLine: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length === 0) return adLine;

  let currentAD = 0;
  for (let i = 0; i < closes.length; i++) {
    const h = highs[i];
    const l = lows[i];
    const c = closes[i];
    const v = volumes[i];

    let moneyFlowMultiplier = 0;
    if (h !== l) {
      moneyFlowMultiplier = ((c - l) - (h - c)) / (h - l);
    }
    const moneyFlowVolume = moneyFlowMultiplier * v;
    currentAD += moneyFlowVolume;
    adLine[i] = currentAD;
  }

  return adLine;
}

