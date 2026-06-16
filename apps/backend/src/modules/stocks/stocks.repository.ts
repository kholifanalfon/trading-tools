import { eq, like, or, sql, asc, and } from "drizzle-orm";
import { db } from "@/db/db";
import { stocks } from "@/db/schema";
import { CreateStockInput, UpdateStockInput, StockQueryInput } from "./stocks.schema";

export class StocksRepository {
  async getStocks(query: StockQueryInput) {
    const offset = (query.page - 1) * query.limit;

    const searchFilter = query.search ? or(like(stocks.symbol, `%${query.search}%`), like(stocks.name, `%${query.search}%`), like(stocks.sector, `%${query.search}%`)) : undefined;

    const watchlistFilter = query.watchlist !== undefined ? eq(stocks.watchlist, query.watchlist) : undefined;

    const exchangeFilter = query.exchange ? eq(stocks.exchange, query.exchange) : undefined;

    const filters = and(searchFilter, watchlistFilter, exchangeFilter);

    const items = await db.select().from(stocks).where(filters).limit(query.limit).offset(offset).orderBy(asc(stocks.symbol));

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stocks)
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

  async getStockById(id: number) {
    const result = await db.select().from(stocks).where(eq(stocks.id, id)).limit(1);
    return result[0] || null;
  }

  async getStockBySymbol(symbol: string) {
    const result = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
    return result[0] || null;
  }

  async createStock(data: CreateStockInput & { exchange?: string; watchlist?: boolean }) {
    const result = await db
      .insert(stocks)
      .values({
        symbol: data.symbol,
        name: data.name,
        sector: data.sector,
        price: data.price,
        watchlist: data.watchlist ?? false,
        exchange: data.exchange ?? "IDX",
      })
      .returning();
    return result[0];
  }

  async updateStock(id: number, data: UpdateStockInput) {
    const updateData: any = {};
    if (data.symbol !== undefined) updateData.symbol = data.symbol;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.watchlist !== undefined) updateData.watchlist = data.watchlist;
    if (data.exchange !== undefined) updateData.exchange = data.exchange;
    updateData.updatedAt = new Date();

    const result = await db.update(stocks).set(updateData).where(eq(stocks.id, id)).returning();
    return result[0] || null;
  }

  async deleteStock(id: number) {
    const result = await db.delete(stocks).where(eq(stocks.id, id)).returning({
      id: stocks.id,
    });
    return result[0] || null;
  }

  async upsertStock(data: CreateStockInput & { exchange?: string; watchlist?: boolean }) {
    const result = await db
      .insert(stocks)
      .values({
        symbol: data.symbol,
        name: data.name,
        sector: data.sector,
        price: data.price,
        watchlist: data.watchlist ?? false,
        exchange: data.exchange ?? "IDX",
      })
      .onConflictDoUpdate({
        target: stocks.symbol,
        set: {
          name: data.name,
          sector: data.sector,
          price: data.price,
          exchange: data.exchange ?? "IDX",
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }
}
