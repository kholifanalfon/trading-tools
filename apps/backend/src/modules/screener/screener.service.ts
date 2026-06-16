import { ScreenerRepository } from "./screener.repository";
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
}
