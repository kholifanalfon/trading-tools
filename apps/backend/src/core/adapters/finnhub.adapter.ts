import { ScreenerProviderAdapter, HistoricalDataPoint } from "./provider.adapter";
import { StockSearchResult, StockQuote } from "@/modules/screener/screener.schema";
import { getFinnhubClient } from "@/core/finnhub";
import { FinnhubError } from "@/core/errors/finnhub-error";

export class FinnhubAdapter implements ScreenerProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new FinnhubError(
        "Finnhub API key is not configured. Please set it in Settings.",
        400,
      );
    }
    this.apiKey = apiKey;
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const client = getFinnhubClient(this.apiKey);
    try {
      const data: any = await new Promise((resolve, reject) => {
        client.symbolSearch(query, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data);
        });
      });
      const results = (data.result || []) as any[];
      return results.map((item) => ({
        symbol: item.symbol || "",
        description: item.description || item.symbol || "",
        type: item.type || "Common Stock",
      }));
    } catch (err) {
      throw new FinnhubError(
        `Finnhub search failed: ${err instanceof Error ? err.message : String(err)}`,
        500,
      );
    }
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const client = getFinnhubClient(this.apiKey);
    try {
      const data: any = await new Promise((resolve, reject) => {
        client.quote(symbol.toUpperCase(), (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data);
        });
      });
      if (data.c === 0 && data.o === 0) {
        throw new FinnhubError(
          `Symbol ${symbol} not found on Finnhub or has no quote data.`,
          404,
        );
      }
      return {
        symbol: symbol.toUpperCase(),
        currentPrice: data.c || 0,
        change: data.d || 0,
        percentChange: data.dp || 0,
        high: data.h || 0,
        low: data.l || 0,
        open: data.o || 0,
        previousClose: data.pc || 0,
      };
    } catch (err) {
      throw new FinnhubError(
        `Finnhub quote failed: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof FinnhubError ? err.status : 500,
      );
    }
  }

  async getHistoricalData(
    symbol: string,
    fromDate: Date,
    toDate: Date,
    interval = "1d",
  ): Promise<HistoricalDataPoint[]> {
    const client = getFinnhubClient(this.apiKey);
    try {
      const fromUnix = Math.floor(fromDate.getTime() / 1000);
      const toUnix = Math.floor(toDate.getTime() / 1000);
      
      // Translate interval: 60m -> '60', 90m -> 'D' (Finnhub doesn't support 90m directly, fallback to 'D' or '60')
      let resolution = "D";
      if (interval === "60m" || interval === "60") {
        resolution = "60";
      } else if (interval === "90m" || interval === "90") {
        resolution = "60"; // Finnhub fallback
      }

      // Resolution: 'D' for daily candles
      const data: any = await new Promise((resolve, reject) => {
        client.stockCandles(
          symbol.toUpperCase(),
          resolution,
          fromUnix,
          toUnix,
          (error: any, data: any) => {
            if (error) reject(error);
            else resolve(data);
          },
        );
      });

      if (!data || data.s !== "ok" || !Array.isArray(data.t)) {
        return [];
      }

      const points: HistoricalDataPoint[] = [];
      for (let i = 0; i < data.t.length; i++) {
        const close = data.c[i];
        if (close === null || close === undefined) continue;

        points.push({
          date: new Date(data.t[i] * 1000),
          open: data.o[i] ?? close,
          high: data.h[i] ?? close,
          low: data.l[i] ?? close,
          close: close,
          volume: data.v[i] ?? 0,
        });
      }
      return points;
    } catch (err) {
      console.warn("Finnhub stockCandles failed for symbol:", symbol, err);
      return [];
    }
  }
}
