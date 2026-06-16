import { eq, like, or, and } from "drizzle-orm";
import { db } from "@/db/db";
import { stocks } from "@/db/schema";

export class LiveScreenerRepository {
  async getFilteredStocks(query: { search?: string; watchlist?: boolean; exchange?: string }) {
    const searchFilter = query.search
      ? or(
          like(stocks.symbol, `%${query.search.toUpperCase()}%`),
          like(stocks.name, `%${query.search}%`),
          like(stocks.sector, `%${query.search}%`)
        )
      : undefined;

    const watchlistFilter = query.watchlist !== undefined ? eq(stocks.watchlist, query.watchlist) : undefined;
    const exchangeFilter = query.exchange && query.exchange !== "ALL" ? eq(stocks.exchange, query.exchange) : undefined;

    const filters = and(searchFilter, watchlistFilter, exchangeFilter);

    return db.select().from(stocks).where(filters);
  }
}
