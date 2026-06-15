import { ScreenerProviderAdapter, HistoricalDataPoint, StockProviderSchema } from "../types/api-stock-provider.types";
import { StockSearchResult, StockQuote } from "@/modules/screener/screener.schema";
import { yahooFinance } from "@/core/yahoo-finance";
import { AppError } from "@/core/errors/app-error";
import { logger } from "../logger";

export class YahooFinanceAdapter implements ScreenerProviderAdapter {
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      const data = await yahooFinance.search(query);
      const quotes = (data.quotes || []) as any[];
      return quotes
        .filter((q) => q.quoteType === "EQUITY" || q.quoteType === "ETF" || q.quoteType === "MUTUALFUND")
        .map((item) => ({
          symbol: item.symbol || "",
          description: item.longname || item.shortname || item.symbol || "",
          type: item.quoteType || "EQUITY",
        }));
    } catch (err) {
      throw new AppError(`Yahoo Finance search failed: ${err instanceof Error ? err.message : String(err)}`, 500);
    }
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const quote = await yahooFinance.quote(symbol.toUpperCase());
      return {
        symbol: symbol.toUpperCase(),
        currentPrice: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        percentChange: quote.regularMarketChangePercent || 0,
        high: quote.regularMarketDayHigh || quote.regularMarketPrice || 0,
        low: quote.regularMarketDayLow || quote.regularMarketPrice || 0,
        open: quote.regularMarketOpen || quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
      };
    } catch (err) {
      throw new AppError(`Yahoo Finance quote failed: ${err instanceof Error ? err.message : String(err)}`, 404);
    }
  }

  async getHistoricalData(symbol: string, fromDate: Date, toDate: Date, interval = "1d"): Promise<HistoricalDataPoint[]> {
    try {
      // For intraday intervals (60m, 90m, etc.), Yahoo Finance chart requires period1 and period2
      // as Date objects or epoch timestamps, not simple YYYY-MM-DD strings.
      const period1 = fromDate;
      const period2 = toDate;
      const result = await yahooFinance.chart(symbol, {
        period1: period1 as any,
        period2: period2 as any,
        interval: interval as any,
      });

      if (!result || !result.quotes) return [];

      return result.quotes
        .filter((q): q is typeof q & { date: Date; close: number } => q.date !== null && q.date !== undefined && q.close !== null && q.close !== undefined)
        .map((q) => ({
          date: new Date(q.date),
          open: q.open ?? q.close,
          high: q.high ?? q.close,
          low: q.low ?? q.close,
          close: q.close,
          volume: q.volume ?? 0,
        }));
    } catch (err) {
      // Return empty array if request fails (e.g. invalid symbol or offline)
      console.warn("Yahoo Finance chart failed for symbol:", symbol.removeNewline(), err);
      return [];
    }
  }

  async getScreenedStocks(strategy: string, regions: string[], limit: number = 50, page: number = 1, search?: string): Promise<StockProviderSchema[]> {
    // Warm up the cookie store to ensure getCrumb doesn't fail on direct fetch
    try {
      await yahooFinance.screener("day_gainers", { scrIds: "day_gainers", count: 1 });
    } catch (err) {
      console.warn("Failed to warm up cookie jar:", err);
    }

    // Custom POST screener for Indonesia (IDX) region since predefined screeners don't support ID
    let sortField = "percentchange";
    let sortType = "DESC";
    const operands: any[] = [
      {
        operator: "eq",
        operands: ["region", "id"],
      },
    ];

    if (search) {
      operands.push({
        operator: "eq",
        operands: ["symbol", search.toUpperCase()],
      });
    }

    if (strategy === "day") {
      sortField = "percentchange";
      sortType = "DESC";
      // Filter stocks with positive daily gain
      operands.push({
        operator: "gt",
        operands: ["percentchange", 0],
      });
      // Filter for highly liquid stocks with daily volume > 1,000,000 shares
      operands.push({
        operator: "gt",
        operands: ["dayvolume", 1000000],
      });
      // Filter out cheap/penny stocks by requiring price > Rp100
      operands.push({
        operator: "gt",
        operands: ["regularmarketprice", 100],
      });
    } else if (strategy === "swing") {
      sortField = "percentchange";
      sortType = "DESC";
      // Filter for active stocks with daily volume > 500,000 shares
      operands.push({
        operator: "gt",
        operands: ["dayvolume", 500000],
      });
      // Filter for mid-to-large-cap stocks with market cap > Rp 1 T
      operands.push({
        operator: "gt",
        operands: ["intradaymarketcap", 1000000000000],
      });
      // Filter stocks with positive daily gain
      operands.push({
        operator: "gt",
        operands: ["percentchange", 0],
      });
    } else if (strategy === "professional") {
      sortField = "intradaymarketcap";
      sortType = "DESC";
      // Filter for value-oriented stocks with Forward P/E between 5 and 25
      operands.push({
        operator: "btwn",
        operands: ["forwardpe", 5, 25],
      });
      // Filter for highly profitable companies with Return on Equity (ROE) > 15%
      operands.push({
        operator: "gt",
        operands: ["returnonequity", 15],
      });
      // Filter for high-liquidity stocks with average volume > 2,000,000 shares
      operands.push({
        operator: "gt",
        operands: ["averagevolume", 2000000],
      });
    }

    const body = {
      size: limit,
      offset: (page - 1) * limit,
      sortField,
      sortType,
      quoteType: "EQUITY",
      query: {
        operator: "and",
        operands,
      },
    };

    try {
      const url = "https://query2.finance.yahoo.com/v1/finance/screener";
      const result: any = await yahooFinance._fetch(
        url,
        {}, // params
        {
          fetchOptions: {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
          },
        },
        "json",
        true, // needsCrumb
      );

      const quotes = (result?.finance?.result?.[0]?.quotes || []) as any[];
      return quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.longName || q.shortName || q.displayName || q.symbol,
        price: q.regularMarketPrice || 0,
        change: q.regularMarketChange || 0,
        changePercent: q.regularMarketChangePercent || 0,
        marketCap: q.marketCap || 0,
        volume: q.regularMarketVolume || 0,
        peRatio: q.trailingPE || null,
        exchange: q.exchange === "JKT" ? "IDX" : q.exchange || "IDX",
      }));
    } catch (err) {
      throw new AppError(`Yahoo Finance custom ID screener failed: ${err instanceof Error ? err.message : String(err)}`, 500);
    }
  }
}
