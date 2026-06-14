import { ScreenerProviderAdapter, HistoricalDataPoint } from "./provider.adapter";
import { StockSearchResult, StockQuote } from "@/modules/screener/screener.schema";
import { yahooFinance } from "@/core/yahoo-finance";
import { AppError } from "@/core/errors/app-error";

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
      const isIntraday = interval.endsWith("m") || interval.endsWith("h");
      const period1 = isIntraday ? fromDate : fromDate.toISOString().split("T")[0];
      const period2 = isIntraday ? toDate : toDate.toISOString().split("T")[0];
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
}
