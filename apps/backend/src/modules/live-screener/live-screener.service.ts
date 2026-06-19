import { LiveScreenerRepository } from "./live-screener.repository";
import { SettingsRepository } from "@/modules/settings/settings.repository";
import { decrypt } from "@/core/utils/crypto";
import { YahooFinanceAdapter } from "@/core/adapters/yahoo-finance.adapter";
import { FinnhubAdapter } from "@/core/adapters/finnhub.adapter";
import { ScreenerProviderAdapter, HistoricalDataPoint } from "@/core/types/api-stock-provider.types";
import { calculateAllScores, mapRulesToConfig, calculateMetricsAndScores } from "@/core/utils/scoring.utils";
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
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes
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

    if (query.refresh) {
      this.cache.delete(cacheKey);
      this.logAndBroadcast(`[Live Stock Data] Refresh requested. Cleared cache for key: ${cacheKey}`);
    }

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
          if (stock.isCalculated) {
            this.logAndBroadcast(`[Live Stock Data] [CACHE HIT] Using cached calculations for ${stock.symbol}`);
            return stock;
          }

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
              const result = {
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
                isCalculated: true,
              };

              const cachedEntry = this.cache.get(cacheKey);
              if (cachedEntry) {
                const idx = cachedEntry.items.findIndex((item) => item.symbol === stock.symbol);
                if (idx !== -1) {
                  cachedEntry.items[idx] = result;
                }
              }

              return result;
            }

            // Calculate indicators and metrics using centralized function
            const calculated = calculateMetricsAndScores(points, rulesConfig);
            const latestIdx = calculated.length - 1;
            const latestCalculated = calculated[latestIdx];

            const latestPoint = points[latestIdx];
            const prevClose = latestIdx > 0 ? points[latestIdx - 1].close : latestPoint.open;

            // Prefer live/real-time values from the screener adapter (so it matches filtering)
            const change = stock.change !== null && stock.change !== undefined ? stock.change : latestPoint.close - prevClose;
            const changePercent = stock.changePercent !== null && stock.changePercent !== undefined ? stock.changePercent : prevClose !== 0 ? (change / prevClose) * 100 : 0;
            const liveClose = stock.price !== null && stock.price !== undefined && stock.price > 0 ? stock.price : latestPoint.close;

            // Merge live price data into the metrics for scoring
            latestCalculated.metrics.close = liveClose;

            // Re-calculate scores using live close price
            const scores = calculateAllScores(latestCalculated.metrics, rulesConfig);

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
                    close: liveClose,
                    volume: latestPoint.volume,
                    ema9: latestCalculated.ema9,
                    ema21: latestCalculated.ema21,
                    ema50: latestCalculated.ema50,
                    ema200: latestCalculated.ema200,
                    rsi: latestCalculated.rsi,
                    macd: latestCalculated.macd,
                    macdSignal: latestCalculated.macdSignal,
                    macdHist: latestCalculated.macdHist,
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

            // Calculate max score dynamically based on active rules
            let dayMaxScore = 35 + 25 + 15 + 15 + 10; // base parameters
            if (scores.dayScore.bbBounce !== undefined) dayMaxScore += 15;
            if (scores.dayScore.priceAboveVwap !== undefined) dayMaxScore += 20;
            if (scores.dayScore.zscoreExtreme !== undefined) dayMaxScore += 20;
            if (scores.dayScore.adLineUptrend !== undefined) dayMaxScore += 15;

            let swingMaxScore = 35 + 25 + 20 + 10 + 10; // base parameters
            if (scores.swingScore.macdGoldenCross !== undefined) swingMaxScore += 20;
            if (scores.swingScore.adxStrongTrend !== undefined) swingMaxScore += 15;
            if (scores.swingScore.vwapDeviationExhaustion !== undefined) swingMaxScore += 10;

            let positionMaxScore = 40 + 25 + 20 + 15; // base parameters
            if (scores.positionScore.pocPullbackProximity !== undefined) positionMaxScore += 20;
            if (scores.positionScore.rvolBreakoutConfirm !== undefined) positionMaxScore += 15;

            const result = {
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
              close: liveClose,
              volume: latestPoint.volume,
              change,
              changePercent,
              dayScore: scores.dayScore.total,
              swingScore: scores.swingScore.total,
              positionScore: scores.positionScore.total,
              dayMaxScore,
              swingMaxScore,
              positionMaxScore,
              scorePayload: scores,
              ema9: latestCalculated.ema9,
              ema21: latestCalculated.ema21,
              ema50: latestCalculated.ema50,
              ema200: latestCalculated.ema200,
              rsi: latestCalculated.rsi,
              macd: latestCalculated.macd,
              macdSignal: latestCalculated.macdSignal,
              macdHist: latestCalculated.macdHist,
              isCalculated: true,
            };

            const cachedEntry = this.cache.get(cacheKey);
            if (cachedEntry) {
              const idx = cachedEntry.items.findIndex((item) => item.symbol === stock.symbol);
              if (idx !== -1) {
                cachedEntry.items[idx] = result;
              }
            }

            return result;
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
