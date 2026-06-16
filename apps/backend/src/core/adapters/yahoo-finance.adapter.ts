import { ScreenerProviderAdapter, HistoricalDataPoint, StockProviderSchema } from "../types/api-stock-provider.types";
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
        lastUpdateTime: quote.regularMarketTime
          ? quote.regularMarketTime instanceof Date
            ? quote.regularMarketTime.toISOString()
            : new Date(Number(quote.regularMarketTime) * (String(quote.regularMarketTime).length <= 10 ? 1000 : 1)).toISOString()
          : undefined,
        delayedMinutes: quote.exchangeDataDelayedBy ?? undefined,
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

    // Dynamically build operands from database settings based on prefix
    try {
      const { db } = await import("@/db/db");
      const { settings } = await import("@/db/schema");
      const dbSettings = await db.select().from(settings);

      const keyName = `screener_rules_${strategy}`;
      const rulesSetting = dbSettings.find((s) => s.key === keyName);

      if (rulesSetting && rulesSetting.value) {
        const rules = JSON.parse(rulesSetting.value);
        for (const rule of rules) {
          if (!rule.field || !rule.operator) continue;

          if (rule.operator === "btwn") {
            const valMin = rule.value !== undefined ? Number(rule.value) : 0;
            const valMax = rule.valueMax !== undefined ? Number(rule.valueMax) : 0;
            operands.push({
              operator: "btwn",
              operands: [rule.field, valMin, valMax],
            });
          } else {
            const val = rule.value !== undefined ? Number(rule.value) : 0;
            operands.push({
              operator: rule.operator,
              operands: [rule.field, val],
            });
          }
        }
      } else {
        throw new Error(`Settings key ${keyName} not found or empty`);
      }
    } catch (dbErr: any) {
      console.warn("Failed to fetch custom settings for Yahoo Finance adapter, falling back to static defaults:", dbErr.removeNewline());
      // Fallback defaults if database queries fail
      if (strategy === "day") {
        operands.push(
          { operator: "gt", operands: ["percentchange", 0] },
          { operator: "gt", operands: ["dayvolume", 1000000] },
          { operator: "gt", operands: ["regularmarketprice", 100] },
        );
      } else if (strategy === "swing") {
        operands.push(
          { operator: "gt", operands: ["dayvolume", 500000] },
          { operator: "gt", operands: ["intradaymarketcap", 1000000000000] },
          { operator: "gt", operands: ["percentchange", 0] },
        );
      } else if (strategy === "position") {
        operands.push(
          { operator: "btwn", operands: ["forwardpe", 5, 25] },
          { operator: "gt", operands: ["returnonequity", 15] },
          { operator: "gt", operands: ["averagevolume", 2000000] },
        );
      }
    }

    if (strategy === "day") {
      sortField = "percentchange";
      sortType = "DESC";
    } else if (strategy === "swing") {
      sortField = "percentchange";
      sortType = "DESC";
    } else if (strategy === "position") {
      sortField = "intradaymarketcap";
      sortType = "DESC";
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
