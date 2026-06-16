import { LiveScreenerRepository } from "./live-screener.repository";
import { SettingsRepository } from "@/modules/settings/settings.repository";
import { decrypt } from "@/core/utils/crypto";
import { YahooFinanceAdapter } from "@/core/adapters/yahoo-finance.adapter";
import { FinnhubAdapter } from "@/core/adapters/finnhub.adapter";
import { ScreenerProviderAdapter, HistoricalDataPoint } from "@/core/types/api-stock-provider.types";
import { calculateEMA, calculateRSI, calculateMACD, calculateSMA, calculateATR } from "@/core/utils/indicators";
import { calculateAllScores, mapRulesToConfig } from "@/core/utils/scoring.utils";
import { ScoringRulesRepository } from "../screener/scoring-rules.repository";
import { ScoreMetrics } from "@/core/types/scoring.types";
import { LiveStockDataQuery } from "./live-screener.schema";
import { SettingsClientService } from "../settings/settings-client.service";
import { webSocketService } from "@/core/websocket";
import { StocksRepository } from "../stocks/stocks.repository";
import { db } from "@/db/db";
import { stockData } from "@/db/schema";
import { sql } from "drizzle-orm";

interface CacheEntry {
  timestamp: number;
  items: any[];
}

export class LiveScreenerService {
  private repository = new LiveScreenerRepository();
  private settingsRepo = new SettingsRepository();
  private settingsClient = new SettingsClientService();
  private stocksRepo = new StocksRepository();
  private cache = new Map<string, CacheEntry>();
  private CACHE_TTL = 60 * 1000; // 60 seconds
  private scoringRulesRepo = new ScoringRulesRepository();

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

  private logAndBroadcast(message: string) {
    console.log(message.removeNewline());
    webSocketService.broadcast(["screener", "sync-log"], {
      message,
    });
  }

  private async getAdapter(): Promise<ScreenerProviderAdapter> {
    const { provider, apiKey } = await this.getProviderConfig();
    if (provider === "finnhub") {
      return new FinnhubAdapter(apiKey);
    }
    return new YahooFinanceAdapter();
  }

  async getLiveStockData(query: LiveStockDataQuery) {
    const { search, exchange, strategy, page, limit } = query;

    const rules = await this.scoringRulesRepo.getAllRules();
    const rulesConfig = mapRulesToConfig(rules);

    let screenedStocks: any[] = [];
    this.logAndBroadcast(`[Live Stock Data] Starting live stock data sync`);

    const adapter = await this.getAdapter();
    const cacheKey = JSON.stringify({ search, exchange, strategy });
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      this.logAndBroadcast(`[Live Stock Data] Using cached screened stocks (${cached.items.length} symbols)`);
      screenedStocks = cached.items;
    } else {
      this.logAndBroadcast(`[Live Stock Data] Fetching exchanges`);

      const exchanges = await this.settingsClient.getExchanges();
      const regions = exchanges.map((e) => e.countryId);

      this.logAndBroadcast(`[Live Stock Data] Fetching stocks from Yahoo screener for strategy ${strategy} and regions ${regions.join(", ")}`);

      screenedStocks = await adapter.getScreenedStocks(strategy, regions, 100, 1, search);

      this.logAndBroadcast(`[Live Stock Data] Retrieved ${screenedStocks.length} screened symbols`);
      this.cache.set(cacheKey, { timestamp: now, items: screenedStocks });
    }

    // Now, apply pagination on the screened stocks list first
    const total = screenedStocks.length;
    const startIndex = (page - 1) * limit;
    const paginatedStocks = screenedStocks.slice(startIndex, startIndex + limit);

    this.logAndBroadcast(`[Live Stock Data] Processing page ${page} (stocks: ${paginatedStocks.map((s) => s.symbol).join(", ")})`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365); // 365 days of history for EMAs/Scores

    // Calculate indicators and scores ONLY for the paginated stocks in chunks to avoid hitting concurrent rate limits
    const chunkSize = 4;
    const results: any[] = [];

    for (let i = 0; i < paginatedStocks.length; i += chunkSize) {
      const chunk = paginatedStocks.slice(i, i + chunkSize);
      this.logAndBroadcast(`[Live Stock Data] Processing batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(paginatedStocks.length / chunkSize)} (${chunk.length} symbols)...`);

      const chunkResults = await Promise.all(
        chunk.map(async (stock) => {
          try {
            this.logAndBroadcast(`[Live Stock Data] Fetching history & calculating scores for ${stock.symbol}`);

            const dbStock = await this.stocksRepo.getStockBySymbol(stock.symbol);
            const resolvedStockId = dbStock ? dbStock.id : stock.symbol;
            const isWatchlisted = dbStock ? dbStock.watchlist : false;

            let symbolToQuery = stock.symbol.toUpperCase();
            let points = await adapter.getHistoricalData(symbolToQuery, startDate, new Date());

            // Auto-append .JK if Indonesian stock fails
            if (points.length === 0 && symbolToQuery.length === 4 && !symbolToQuery.includes(".")) {
              symbolToQuery = `${symbolToQuery}.JK`;
              points = await adapter.getHistoricalData(symbolToQuery, startDate, new Date());
            }

            if (!points || points.length === 0) {
              this.logAndBroadcast(`[Live Stock Data] [SUCCESS] ${stock.symbol} calculated (Fallback applied, no history found)`);
              if (isWatchlisted && dbStock) {
                try {
                  await db
                    .insert(stockData)
                    .values({
                      stockId: dbStock.id,
                      symbol: stock.symbol,
                      date: new Date(),
                      open: stock.price,
                      high: stock.price,
                      low: stock.price,
                      close: stock.price,
                      volume: stock.volume,
                      change: stock.change,
                      changePercent: stock.changePercent,
                    })
                    .onConflictDoUpdate({
                      target: [stockData.symbol, stockData.date],
                      set: {
                        open: sql`EXCLUDED.open`,
                        high: sql`EXCLUDED.high`,
                        low: sql`EXCLUDED.low`,
                        close: sql`EXCLUDED.close`,
                        volume: sql`EXCLUDED.volume`,
                        change: sql`EXCLUDED.change`,
                        changePercent: sql`EXCLUDED.change_percent`,
                      },
                    });
                } catch (dbErr: any) {
                  console.error(`Failed to upsert stock_data fallback for watchlisted stock ${stock.symbol}:`, dbErr.removeNewline());
                }
              }
              return {
                id: stock.symbol,
                stockId: resolvedStockId,
                symbol: stock.symbol,
                name: stock.name,
                exchange: stock.exchange,
                watchlist: isWatchlisted,
                date: new Date(),
                open: stock.price,
                high: stock.price,
                low: stock.price,
                close: stock.price,
                volume: stock.volume,
                change: stock.change,
                changePercent: stock.changePercent,
                dayScore: null,
                swingScore: null,
                positionScore: null,
                scorePayload: null,
              };
            }

            // Sort ascending for technical indicator calculations
            points.sort((a: HistoricalDataPoint, b: HistoricalDataPoint) => a.date.getTime() - b.date.getTime());

            const closePrices = points.map((p: HistoricalDataPoint) => p.close);
            const highPrices = points.map((p: HistoricalDataPoint) => p.high);
            const lowPrices = points.map((p: HistoricalDataPoint) => p.low);
            const volumeVals = points.map((p: HistoricalDataPoint) => p.volume);

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

            // 52-week lookback (252 bars)
            const n = points.length;
            const latestIdx = n - 1;

            let yearHigh = null;
            let priceReturn1Y = null;

            if (n >= 252) {
              let highest = -Infinity;
              const startIdx = Math.max(0, latestIdx - 252);
              for (let k = startIdx; k <= latestIdx; k++) {
                if (highPrices[k] > highest) highest = highPrices[k];
              }
              yearHigh = highest;
              const prevYearPrice = closePrices[startIdx];
              priceReturn1Y = ((closePrices[latestIdx] - prevYearPrice) / prevYearPrice) * 100;
            }

            const { macd: macdVals, signal: macdSignalVals, histogram: macdHistVals } = calculateMACD(closePrices);

            const latestPoint = points[latestIdx];
            const prevClose = latestIdx > 0 ? points[latestIdx - 1].close : latestPoint.open;
            const change = latestPoint.close - prevClose;
            const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

            const metrics: ScoreMetrics = {
              close: latestPoint.close,
              open: latestPoint.open,
              prevClose,
              volume: latestPoint.volume,
              avgVolume10: avgVol10Vals[latestIdx],
              avgVolume20: avgVol20Vals[latestIdx],
              atr14: atrVals[latestIdx],
              rsi14: rsiVals[latestIdx],
              ema20: ema21Vals[latestIdx], // 21 as 20
              ema50: ema50Vals[latestIdx],
              sma50: sma50Vals[latestIdx],
              sma200: sma200Vals[latestIdx],
              macdLine: macdVals[latestIdx],
              macdSignal: macdSignalVals[latestIdx],
              macdHist: macdHistVals[latestIdx],
              yearHigh,
              priceReturn1Y,
            };

            const scores = calculateAllScores(metrics, rulesConfig);

            this.logAndBroadcast(
              `[Live Stock Data] [SUCCESS] ${stock.symbol} calculated: Day ${scores.dayScore.total}, Swing ${scores.swingScore.total}, Position ${scores.positionScore.total}`,
            );

            if (isWatchlisted && dbStock) {
              try {
                await db
                  .insert(stockData)
                  .values({
                    stockId: dbStock.id,
                    symbol: stock.symbol,
                    date: latestPoint.date,
                    open: latestPoint.open,
                    high: latestPoint.high,
                    low: latestPoint.low,
                    close: latestPoint.close,
                    volume: latestPoint.volume,
                    ema9: ema9Vals[latestIdx],
                    ema21: ema21Vals[latestIdx],
                    ema50: ema50Vals[latestIdx],
                    ema200: ema200Vals[latestIdx],
                    rsi: rsiVals[latestIdx],
                    macd: macdVals[latestIdx],
                    macdSignal: macdSignalVals[latestIdx],
                    macdHist: macdHistVals[latestIdx],
                    change,
                    changePercent,
                    dayScore: scores.dayScore.total,
                    swingScore: scores.swingScore.total,
                    positionScore: scores.positionScore.total,
                    scorePayload: scores,
                  })
                  .onConflictDoUpdate({
                    target: [stockData.symbol, stockData.date],
                    set: {
                      open: sql`EXCLUDED.open`,
                      high: sql`EXCLUDED.high`,
                      low: sql`EXCLUDED.low`,
                      close: sql`EXCLUDED.close`,
                      volume: sql`EXCLUDED.volume`,
                      ema9: sql`EXCLUDED.ema_9`,
                      ema21: sql`EXCLUDED.ema_21`,
                      ema50: sql`EXCLUDED.ema_50`,
                      ema200: sql`EXCLUDED.ema_200`,
                      rsi: sql`EXCLUDED.rsi`,
                      macd: sql`EXCLUDED.macd`,
                      macdSignal: sql`EXCLUDED.macd_signal`,
                      macdHist: sql`EXCLUDED.macd_hist`,
                      change: sql`EXCLUDED.change`,
                      changePercent: sql`EXCLUDED.change_percent`,
                      dayScore: sql`EXCLUDED.day_score`,
                      swingScore: sql`EXCLUDED.swing_score`,
                      positionScore: sql`EXCLUDED.position_score`,
                      scorePayload: sql`EXCLUDED.score_payload`,
                    },
                  });
              } catch (dbErr: any) {
                console.error(`Failed to upsert stock_data for watchlisted stock ${stock.symbol}:`, dbErr.removeNewline());
              }
            }

            return {
              id: stock.symbol,
              stockId: resolvedStockId,
              symbol: stock.symbol,
              name: stock.name,
              exchange: stock.exchange,
              watchlist: isWatchlisted,
              date: latestPoint.date,
              open: latestPoint.open,
              high: latestPoint.high,
              low: latestPoint.low,
              close: latestPoint.close,
              volume: latestPoint.volume,
              change,
              changePercent,
              dayScore: scores.dayScore.total,
              swingScore: scores.swingScore.total,
              positionScore: scores.positionScore.total,
              scorePayload: scores,
              ema9: ema9Vals[latestIdx],
              ema21: ema21Vals[latestIdx],
              ema50: ema50Vals[latestIdx],
              ema200: ema200Vals[latestIdx],
              rsi: rsiVals[latestIdx],
              macd: macdVals[latestIdx],
              macdSignal: macdSignalVals[latestIdx],
              macdHist: macdHistVals[latestIdx],
            };
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            this.logAndBroadcast(`[Live Stock Data] [FAILED] ${stock.symbol} calculation failed: ${errMsg}`);
            console.error(`Error calculating live scores for ${stock.symbol}:`, err);
            return null;
          }
        }),
      );

      results.push(...chunkResults);
    }

    const items = results.filter((item): item is Exclude<typeof item, null> => item !== null);
    this.logAndBroadcast(`[Live Stock Data] Completed page processing. Returning ${items.length} items`);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
