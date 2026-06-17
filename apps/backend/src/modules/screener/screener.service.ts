import { ScreenerRepository } from "./screener.repository";
import { AiAnalysisRepository } from "./ai-analysis.repository";
import { SettingsRepository } from "@/modules/settings/settings.repository";
import { decrypt } from "@/core/utils/crypto";
import { AppError } from "@/core/errors/app-error";
import { webSocketService } from "@/core/websocket";
import { NewStockData } from "@/db/schemas/stock-data.schema";
import { StockSearchResult, StockQuote, SyncHistoricalState } from "./screener.schema";
import { ScreenerProviderAdapter } from "@/core/types/api-stock-provider.types";
import { YahooFinanceAdapter } from "@/core/adapters/yahoo-finance.adapter";
import { FinnhubAdapter } from "@/core/adapters/finnhub.adapter";
import { calculateEMA, calculateRSI, calculateMACD, calculateSMA, calculateATR } from "@/core/utils/indicators";
import { calculateAllScores, mapRulesToConfig } from "@/core/utils/scoring.utils";
import { ScoringRulesRepository } from "./scoring-rules.repository";
import { ScoreMetrics } from "@/core/types/scoring.types";

let historicalSyncState: SyncHistoricalState = {
  status: "idle",
  error: null,
  lastSyncAt: null,
};

export class ScreenerService {
  private repository = new ScreenerRepository();
  private settingsRepo = new SettingsRepository();
  private scoringRulesRepo = new ScoringRulesRepository();

  getHistoricalSyncState(): SyncHistoricalState {
    return historicalSyncState;
  }

  async getLatestLogs() {
    return this.repository.getLatestLogs();
  }

  private logAndBroadcast(message: string) {
    console.log(message.removeNewline());
    webSocketService.broadcast(["screener", "sync-log"], {
      message,
    });
  }

  private async getProviderConfig() {
    const list = await this.settingsRepo.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    const provider = configObj.stock_screener_provider || "yahoo_finance";
    const encryptedKey = configObj.finnhub_api_key;
    const apiKey = encryptedKey ? decrypt(encryptedKey) : "";

    return { provider, apiKey };
  }

  private async getAdapter(): Promise<ScreenerProviderAdapter> {
    const { provider, apiKey } = await this.getProviderConfig();
    if (provider === "finnhub") {
      return new FinnhubAdapter(apiKey);
    }
    return new YahooFinanceAdapter();
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const adapter = await this.getAdapter();
    return adapter.searchStocks(query);
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const adapter = await this.getAdapter();
    return adapter.getQuote(symbol);
  }

  async startHistoricalSync(date?: string) {
    if (historicalSyncState.status === "running") {
      throw new AppError("Historical sync is already running.", 409);
    }

    historicalSyncState = {
      status: "running",
      error: null,
      lastSyncAt: historicalSyncState.lastSyncAt,
    };

    webSocketService.broadcast(["screener", "sync-status"], {
      status: "running",
      lastSyncAt: historicalSyncState.lastSyncAt,
    });

    // Run the sync asynchronously in the background
    this.pullHistoricalDataBackground(date).catch((err) => {
      console.error("Critical error in historical sync process:", err);
    });

    return {
      success: true,
      message: "Historical synchronization started in the background.",
    };
  }

  private async pullHistoricalDataBackground(date?: string) {
    const allStocks = await this.repository.getAllStocks();

    const getLocalDateString = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - offset * 60 * 1000);
      return localDate.toISOString().split("T")[0];
    };

    const targetDateStr = date || getLocalDateString(new Date());

    if (allStocks.length === 0) {
      historicalSyncState = {
        status: "success",
        error: null,
        lastSyncAt: new Date().toISOString(),
      };
      await this.repository.createStockLog({
        status: "success",
        message: `No stocks registered to sync (Target: ${targetDateStr}).`,
        symbolsCount: 0,
      });
      webSocketService.broadcast(["screener", "sync-status"], {
        status: "success",
        lastSyncAt: historicalSyncState.lastSyncAt,
      });
      return;
    }

    // Fetch individually in parallel chunks of 10
    try {
      const rules = await this.scoringRulesRepo.getAllRules();
      const rulesConfig = mapRulesToConfig(rules);

      this.logAndBroadcast(`[Historical Sync] Starting historical sync for target date: ${targetDateStr}. Total symbols: ${allStocks.length}`);
      let insertedCount = 0;
      const failedSymbols: string[] = [];
      const chunkSize = 10;
      const adapter = await this.getAdapter();

      for (let i = 0; i < allStocks.length; i += chunkSize) {
        const chunk = allStocks.slice(i, i + chunkSize);
        this.logAndBroadcast(`[Historical Sync] Processing batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(allStocks.length / chunkSize)} (${chunk.length} symbols)...`);

        await Promise.all(
          chunk.map(async (stock) => {
            try {
              let symbolToQuery = stock.symbol.toUpperCase();
              const startDate = new Date();
              startDate.setDate(startDate.getDate() - 365); // Fetch 365 days of historical data for EMAs

              let points = await adapter.getHistoricalData(symbolToQuery, startDate, new Date());

              // Auto-append .JK suffix if 4-letter Indonesian stock fails
              if (points.length === 0 && symbolToQuery.length === 4 && !symbolToQuery.includes(".")) {
                symbolToQuery = `${symbolToQuery}.JK`;
                points = await adapter.getHistoricalData(symbolToQuery, startDate, new Date());
              }

              if (points && points.length > 0) {
                // Ensure points are sorted by date ascending for correct technical indicator calculation
                points.sort((a, b) => a.date.getTime() - b.date.getTime());

                const closePrices = points.map((p) => p.close);
                const openPrices = points.map((p) => p.open);
                const highPrices = points.map((p) => p.high);
                const lowPrices = points.map((p) => p.low);
                const volumeVals = points.map((p) => p.volume);

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

                // Compute 1Y highs/lows for position score (lookback 252 days)
                const yearHighVals: (number | null)[] = new Array(points.length).fill(null);
                const yearLowVals: (number | null)[] = new Array(points.length).fill(null);
                const priceReturn1YVals: (number | null)[] = new Array(points.length).fill(null);

                for (let i = 0; i < points.length; i++) {
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

                const { macd: macdVals, signal: macdSignalVals, histogram: macdHistVals } = calculateMACD(closePrices);

                const insertItems: NewStockData[] = [];

                for (let j = 0; j < points.length; j++) {
                  const p = points[j];
                  const dataPointDateStr = getLocalDateString(p.date);

                  // Filter by target date
                  if (dataPointDateStr !== targetDateStr) continue;

                  const prevClose = j > 0 ? points[j - 1].close : p.open;
                  const change = p.close - prevClose;
                  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

                  const metrics: ScoreMetrics = {
                    close: p.close,
                    open: p.open,
                    prevClose,
                    volume: p.volume,
                    avgVolume10: avgVol10Vals[j],
                    avgVolume20: avgVol20Vals[j],
                    atr14: atrVals[j],
                    rsi14: rsiVals[j],
                    ema20: ema21Vals[j], // using 21 as 20
                    ema50: ema50Vals[j],
                    sma50: sma50Vals[j],
                    sma200: sma200Vals[j],
                    macdLine: macdVals[j],
                    macdSignal: macdSignalVals[j],
                    macdHist: macdHistVals[j],
                    yearHigh: yearHighVals[j],
                    priceReturn1Y: priceReturn1YVals[j],
                  };

                  const scores = calculateAllScores(metrics, rulesConfig);

                  insertItems.push({
                    stockId: stock.id,
                    symbol: stock.symbol.toUpperCase(),
                    date: p.date,
                    open: p.open,
                    high: p.high,
                    low: p.low,
                    close: p.close,
                    volume: p.volume,
                    change,
                    changePercent,
                    dayScore: scores.dayScore.total,
                    swingScore: scores.swingScore.total,
                    positionScore: scores.positionScore.total,
                    scorePayload: scores,
                    ema9: ema9Vals[j],
                    ema21: ema21Vals[j],
                    ema50: ema50Vals[j],
                    ema200: ema200Vals[j],
                    rsi: rsiVals[j],
                    macd: macdVals[j],
                    macdSignal: macdSignalVals[j],
                    macdHist: macdHistVals[j],
                  });
                }

                if (insertItems.length > 0) {
                  const upserted = await this.repository.upsertStockData(insertItems);
                  insertedCount += upserted.length;
                  this.logAndBroadcast(`[Historical Sync] [SUCCESS] ${stock.symbol} synced successfully. Saved ${upserted.length} bars.`);
                } else {
                  this.logAndBroadcast(`[Historical Sync] [SUCCESS] ${stock.symbol} synced successfully. No data points matched target date ${targetDateStr}`);
                }
              } else {
                this.logAndBroadcast(`[Historical Sync] [FAILED] ${stock.symbol} failed to fetch chart/historical data.`);
                failedSymbols.push(stock.symbol);
              }
            } catch (err) {
              this.logAndBroadcast(`[Historical Sync] [ERROR] Error syncing individual stock ${stock.symbol}: ${err instanceof Error ? err.message : String(err)}`);
              failedSymbols.push(stock.symbol);
            }
          }),
        );
      }

      const successCount = allStocks.length - failedSymbols.length;
      this.logAndBroadcast(`[Historical Sync] Sync completed. Success: ${successCount}/${allStocks.length} symbols. Saved ${insertedCount} total points.`);

      historicalSyncState = {
        status: "success",
        error: failedSymbols.length > 0 ? `Synced with warnings. Failed symbols: ${failedSymbols.join(", ")}` : null,
        lastSyncAt: new Date().toISOString(),
      };

      await this.repository.createStockLog({
        status: failedSymbols.length === allStocks.length ? "failed" : "success",
        message: `Sync completed for target date: ${targetDateStr}. Success ${successCount}/${allStocks.length} symbols. Total points: ${insertedCount}.`,
        symbolsCount: insertedCount,
      });

      webSocketService.broadcast(["screener", "sync-status"], {
        status: "success",
        lastSyncAt: historicalSyncState.lastSyncAt,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      historicalSyncState = {
        status: "failed",
        error: errMsg,
        lastSyncAt: new Date().toISOString(),
      };

      await this.repository.createStockLog({
        status: "failed",
        message: `Sync failed for date ${targetDateStr}: ${errMsg}`,
        symbolsCount: 0,
      });

      webSocketService.broadcast(["screener", "sync-status"], {
        status: "failed",
        error: errMsg,
        lastSyncAt: historicalSyncState.lastSyncAt,
      });
    }
  }

  async getStockData(query: { page: number; limit: number; search?: string; date?: string; watchlist?: boolean; exchange?: string; strategy?: string }) {
    return this.repository.getStockData(query);
  }

  async getStockHistoricalData(symbol: string, limit = 100, timeframe?: string, strategy?: string) {
    try {
      const adapter = await this.getAdapter();
      let symbolToQuery = symbol.toUpperCase();

      const startDate = new Date();
      let interval: string;

      // Configure start date and interval based on timeframe
      if (timeframe === "1D") {
        // Fetch last 30 days of 60m data so we have enough candles (>200) to calculate EMA 200
        startDate.setDate(startDate.getDate() - 30);
        interval = "60m";
      } else if (timeframe === "5D") {
        // Fetch last 60 days of 90m data so we have enough candles (>200) to calculate EMA 200
        startDate.setDate(startDate.getDate() - 60);
        interval = "90m";
      } else {
        // Fetch 365 days of data to have enough history to calculate EMA 200
        startDate.setDate(startDate.getDate() - 365);
        interval = "1d";
      }

      let points = await adapter.getHistoricalData(symbolToQuery, startDate, new Date(), interval);

      // Auto-append .JK suffix if 4-letter Indonesian stock fails
      if (points.length === 0 && symbolToQuery.length === 4 && !symbolToQuery.includes(".")) {
        symbolToQuery = `${symbolToQuery}.JK`;
        points = await adapter.getHistoricalData(symbolToQuery, startDate, new Date(), interval);
      }

      if (!points || points.length === 0) {
        console.warn("[ScreenerService] External API returned 0 points for symbol. Falling back to DB. Symbol:", symbol.removeNewline());
        return this.repository.getStockHistoricalData(symbol, limit);
      }

      // Sort ascending for calculations
      points.sort((a, b) => a.date.getTime() - b.date.getTime());

      const closePrices = points.map((p) => p.close);
      const ema9Vals = calculateEMA(closePrices, 9);
      const ema21Vals = calculateEMA(closePrices, 21);
      const ema50Vals = calculateEMA(closePrices, 50);
      const ema200Vals = calculateEMA(closePrices, 200);
      const rsiVals = calculateRSI(closePrices, 14);
      const { macd: macdVals, signal: macdSignalVals, histogram: macdHistVals } = calculateMACD(closePrices);

      // Fetch stock metadata (company name) from database if possible
      const stockRecord = await this.repository.getAllStocks().then((list) => list.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase()));
      const companyName = stockRecord?.name || symbol;

      // Fetch scores from database to merge with live data
      const dbPoints = await this.repository.getStockHistoricalData(symbol, 5000);
      const dbScoresMap = new Map<
        string,
        {
          dayScore: number | null;
          swingScore: number | null;
          positionScore: number | null;
          scorePayload: any;
        }
      >();
      for (const dbPt of dbPoints) {
        const dateStr = dbPt.date instanceof Date ? dbPt.date.toISOString().split("T")[0] : new Date(dbPt.date).toISOString().split("T")[0];
        dbScoresMap.set(dateStr, {
          dayScore: dbPt.dayScore,
          swingScore: dbPt.swingScore,
          positionScore: dbPt.positionScore,
          scorePayload: dbPt.scorePayload,
        });
      }

      const formattedPoints = points.map((p, index) => {
        const dateStr = p.date instanceof Date ? p.date.toISOString().split("T")[0] : new Date(p.date).toISOString().split("T")[0];
        const dbScore = dbScoresMap.get(dateStr);

        return {
          id: index,
          symbol: symbol.toUpperCase(),
          name: companyName,
          date: p.date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume,
          ema9: ema9Vals[index],
          ema21: ema21Vals[index],
          ema50: ema50Vals[index],
          ema200: ema200Vals[index],
          rsi: rsiVals[index],
          macd: macdVals[index],
          macdSignal: macdSignalVals[index],
          macdHist: macdHistVals[index],
          dayScore: dbScore?.dayScore ?? null,
          swingScore: dbScore?.swingScore ?? null,
          positionScore: dbScore?.positionScore ?? null,
          scorePayload: dbScore?.scorePayload ?? null,
        };
      });

      // Return the latest N items specified by limit
      if (timeframe === "1D" || timeframe === "5D") {
        return formattedPoints;
      }
      return formattedPoints.slice(-limit);
    } catch (error) {
      console.error("[ScreenerService] Failed to get live historical data for symbol:", symbol.removeNewline(), error);
      // Fallback to database
      return this.repository.getStockHistoricalData(symbol, limit);
    }
  }

  private aiAnalysisRepo = new AiAnalysisRepository();

  async getAiAnalysis(symbol: string) {
    return this.aiAnalysisRepo.getAnalysisBySymbol(symbol);
  }

  async refreshAiAnalysis(symbol: string) {
    // 1. Fetch latest historical data to get current metrics/indicators
    const historicalData = await this.getStockHistoricalData(symbol, 30);
    const latest = historicalData[historicalData.length - 1];
    if (!latest) {
      throw new AppError(`No stock data available for symbol ${symbol} to perform analysis.`, 404);
    }

    // 2. Fetch Gemini settings
    const list = await this.settingsRepo.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    const encryptedKey = configObj.gemini_api_key;
    const apiKey = encryptedKey ? decrypt(encryptedKey) : "";
    const modelName = configObj.gemini_model || "gemini-1.5-flash";

    if (!apiKey) {
      throw new AppError("Gemini API key is missing. Please configure it in settings first.", 400);
    }

    // 3. Initialize Gemini
    const { GeminiAdapter } = await import("@/core/adapters/gemini.adapter");
    const gemini = new GeminiAdapter(apiKey, modelName);

    // 4. Resolve strategy scores — use DB values if present, otherwise calculate on-the-fly
    let dayScore = latest.dayScore;
    let swingScore = latest.swingScore;
    let positionScore = latest.positionScore;

    if (dayScore === null || swingScore === null || positionScore === null) {
      // Build ScoreMetrics from live indicator data already present in latest
      const metrics: ScoreMetrics = {
        close: latest.close,
        open: latest.open,
        prevClose: historicalData.length >= 2 ? historicalData[historicalData.length - 2].close : null,
        volume: latest.volume,
        avgVolume10: null, // not available from live data
        avgVolume20: null, // not available from live data
        atr14: null,       // not available from live data
        rsi14: latest.rsi ?? null,
        ema20: latest.ema21 ?? null, // ema21 is the closest proxy for ema20
        ema50: latest.ema50 ?? null,
        sma50: latest.ema50 ?? null,
        sma200: latest.ema200 ?? null,
        macdLine: latest.macd ?? null,
        macdSignal: latest.macdSignal ?? null,
        macdHist: latest.macdHist ?? null,
        yearHigh: null,
        priceReturn1Y: null,
      };

      // Load scoring rules config if available
      const scoringRulesRepo = new ScoringRulesRepository();
      const rules = await scoringRulesRepo.getAllRules();
      const rulesConfig = rules.length > 0 ? mapRulesToConfig(rules) : undefined;

      const computed = calculateAllScores(metrics, rulesConfig);
      dayScore = computed.dayScore.total;
      swingScore = computed.swingScore.total;
      positionScore = computed.positionScore.total;
    }

    // 5. Construct prompt
    const prompt = `You are an elite quantitative researcher and macro portfolio manager. Perform a rigorous, multi-factor analysis on the stock symbol "${symbol.toUpperCase()}" (Company: "${latest.name || symbol}").

Here are the inputs for your analysis:
- Latest Close Price: ${latest.close}
- Daily Volume: ${latest.volume}
- Technical Indicators:
  * RSI (14): ${latest.rsi ? latest.rsi.toFixed(2) : "N/A"}
  * EMA 9: ${latest.ema9 ? latest.ema9.toFixed(2) : "N/A"}
  * EMA 21: ${latest.ema21 ? latest.ema21.toFixed(2) : "N/A"}
  * EMA 50: ${latest.ema50 ? latest.ema50.toFixed(2) : "N/A"}
  * EMA 200: ${latest.ema200 ? latest.ema200.toFixed(2) : "N/A"}
  * MACD: ${latest.macd ? latest.macd.toFixed(2) : "N/A"}
  * MACD Signal: ${latest.macdSignal ? latest.macdSignal.toFixed(2) : "N/A"}
  * MACD Histogram: ${latest.macdHist ? latest.macdHist.toFixed(2) : "N/A"}
- System Strategy Scores (0 to 100, calculated by our rule-based engine):
  * System Day Trading Score: ${dayScore ?? "N/A"}
  * System Swing Trading Score: ${swingScore ?? "N/A"}
  * System Position Trading Score: ${positionScore ?? "N/A"}

--- YOUR TASK ---

STEP 1 – COMPUTE YOUR OWN AI SCORES (0 to 100 each):
Using the rubric below, independently score this stock for each strategy. Do NOT copy the system scores.

Day Trading Score rubric (max 100):
- Momentum: RSI above 60 or below 30 → +25 pts; RSI 50–60 → +10 pts
- MACD Histogram positive and growing → +25 pts; positive only → +15 pts
- EMA 9 above EMA 21 (bullish crossover) → +20 pts
- Volume spike (qualitative assessment) → +15 pts
- Gap from previous session (qualitative) → +15 pts

Swing Trading Score rubric (max 100):
- EMA 21 above EMA 50 (uptrend alignment) → +30 pts
- MACD line above signal line → +25 pts
- RSI in 40–65 range (healthy swing zone) → +20 pts
- Close above EMA 21 (price above mid-term trend) → +15 pts
- EMA 50 slope upward (qualitative) → +10 pts

Position Trading Score rubric (max 100):
- EMA 50 above EMA 200 (golden cross zone) → +35 pts
- Close above EMA 200 (long-term uptrend) → +25 pts
- RSI above 50 (sustained momentum) → +20 pts
- MACD histogram sustained positive → +20 pts

STEP 2 – COMPARE AND GIVE A VERDICT:
Compare your AI scores with the system scores for all 3 strategies.
- "AGREE" if all 3 AI scores are within 15 points of their system counterparts
- "PARTIAL" if 1 or 2 scores differ by more than 15 points
- "DISAGREE" if all 3 differ by more than 15 points, or if the overall sentiment direction is opposite

STEP 3 – WRITE YOUR ANALYSES IN INDONESIAN.

Return a single JSON object with these exact keys:
- "prediction": one of "UP", "DOWN", or "SIDEWAYS"
- "recommendation": one of "BUY", "HOLD", or "AVOID"
- "confidence": number 0-100
- "aiDayScore": your computed day trading score (number 0-100)
- "aiSwingScore": your computed swing trading score (number 0-100)
- "aiPositionScore": your computed position trading score (number 0-100)
- "scoreVerdict": one of "AGREE", "PARTIAL", or "DISAGREE"
- "analysisDetail": technical analysis in Indonesian — cover RSI momentum, EMA crossover alignments, and MACD trend
- "scoreComparison": in Indonesian — show your AI scores vs system scores for each strategy, explain why they agree or differ, and state your overall verdict
- "macroEconomics": macroeconomic context in Indonesian — cover interest rates, sector trends, inflation, and company-relevant news`;

    // 6. Call Gemini with JSON mode (guaranteed valid JSON output)
    const result = await gemini.generateJsonAnalysis(prompt);

    // 7. Upsert to DB by symbol (no stocks table lookup needed)
    const saved = await this.aiAnalysisRepo.upsertAnalysis({
      symbol: symbol.toUpperCase(),
      prediction: (result.prediction as string) || "SIDEWAYS",
      recommendation: (result.recommendation as string) || "HOLD",
      confidence: Number(result.confidence) || 50,
      aiDayScore: result.aiDayScore != null ? Number(result.aiDayScore) : null,
      aiSwingScore: result.aiSwingScore != null ? Number(result.aiSwingScore) : null,
      aiPositionScore: result.aiPositionScore != null ? Number(result.aiPositionScore) : null,
      sysDayScore: dayScore != null ? Number(dayScore) : null,
      sysSwingScore: swingScore != null ? Number(swingScore) : null,
      sysPosScore: positionScore != null ? Number(positionScore) : null,
      scoreVerdict: (result.scoreVerdict as string) || null,
      analysisDetail: (result.analysisDetail as string) || "N/A",
      scoreComparison: (result.scoreComparison as string) || "N/A",
      macroEconomics: (result.macroEconomics as string) || "N/A",
    });

    return saved;
  }
}
