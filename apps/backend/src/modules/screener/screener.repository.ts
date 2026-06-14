import { db } from "@/db/db";
import { stockData, stockLogs, stocks, NewStockLog } from "@/db/schema";
import { NewStockData } from "@/db/schemas/stock-data.schema";
import { desc } from "drizzle-orm";

export class ScreenerRepository {
  async getAllStocks() {
    return db.select().from(stocks);
  }

  async upsertStockData(items: NewStockData[]) {
    if (items.length === 0) return [];

    // Process in batches of 100 to avoid query parameter limit issues
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResult = await db
        .insert(stockData)
        .values(batch)
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
          },
        })
        .returning();
      results.push(...batchResult);
    }

    return results;
  }

  async createStockLog(data: NewStockLog) {
    const result = await db.insert(stockLogs).values(data).returning();
    return result[0];
  }

  async getLatestLogs(limit = 10) {
    return db
      .select()
      .from(stockLogs)
      .orderBy(desc(stockLogs.createdAt))
      .limit(limit);
  }

  async getStockData(query: {
    page: number;
    limit: number;
    search?: string;
    date?: string;
    watchlist?: boolean;
    exchange?: string;
  }) {
    const offset = (query.page - 1) * query.limit;

    const searchFilter = query.search
      ? like(stockData.symbol, `%${query.search.toUpperCase()}%`)
      : undefined;

    const dateFilter = query.date
      ? eq(sql`${stockData.date}::date`, sql`${query.date}::date`)
      : undefined;

    const watchlistFilter = query.watchlist !== undefined
      ? eq(stocks.watchlist, query.watchlist)
      : undefined;

    const exchangeFilter = query.exchange
      ? eq(stocks.exchange, query.exchange)
      : undefined;

    const filters = and(searchFilter, dateFilter, watchlistFilter, exchangeFilter);

    const items = await db
      .select({
        id: stockData.id,
        stockId: stockData.stockId,
        symbol: stockData.symbol,
        date: stockData.date,
        open: stockData.open,
        high: stockData.high,
        low: stockData.low,
        close: stockData.close,
        volume: stockData.volume,
        ema9: stockData.ema9,
        ema21: stockData.ema21,
        ema50: stockData.ema50,
        ema200: stockData.ema200,
        rsi: stockData.rsi,
        macd: stockData.macd,
        macdSignal: stockData.macdSignal,
        macdHist: stockData.macdHist,
        change: stockData.change,
        changePercent: stockData.changePercent,
        name: stocks.name,
        watchlist: stocks.watchlist,
      })
      .from(stockData)
      .leftJoin(stocks, eq(stockData.stockId, stocks.id))
      .where(filters)
      .limit(query.limit)
      .offset(offset)
      .orderBy(desc(stockData.date));

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stockData)
      .leftJoin(stocks, eq(stockData.stockId, stocks.id))
      .where(filters);
    const total = Number(totalResult[0]?.count || 0);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getStockHistoricalData(symbol: string, limit = 100) {
    const items = await db
      .select({
        id: stockData.id,
        stockId: stockData.stockId,
        symbol: stockData.symbol,
        date: stockData.date,
        open: stockData.open,
        high: stockData.high,
        low: stockData.low,
        close: stockData.close,
        volume: stockData.volume,
        ema9: stockData.ema9,
        ema21: stockData.ema21,
        ema50: stockData.ema50,
        ema200: stockData.ema200,
        rsi: stockData.rsi,
        macd: stockData.macd,
        macdSignal: stockData.macdSignal,
        macdHist: stockData.macdHist,
        change: stockData.change,
        changePercent: stockData.changePercent,
        name: stocks.name,
      })
      .from(stockData)
      .leftJoin(stocks, eq(stockData.stockId, stocks.id))
      .where(eq(stockData.symbol, symbol.toUpperCase().trim()))
      .limit(limit)
      .orderBy(desc(stockData.date));

    return items.reverse();
  }
}

// Helper sql tag import if required
import { sql, like, and, eq } from "drizzle-orm";
