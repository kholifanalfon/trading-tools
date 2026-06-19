import { StockSearchResult, StockQuote } from "@/modules/screener/screener.schema";

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockProviderSchema {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  peRatio: number | null;
  exchange: string;
}

export interface ScreenerProviderAdapter {
  searchStocks(query: string): Promise<StockSearchResult[]>;
  getQuote(symbol: string): Promise<StockQuote>;
  getHistoricalData(symbol: string, fromDate: Date, toDate: Date, interval?: string): Promise<HistoricalDataPoint[]>;
  getScreenedStocks(strategy: string | any, regions: string[], limit?: number, offset?: number, search?: string): Promise<StockProviderSchema[]>;
  getCorporateActions?(symbol: string, fromDate: Date, toDate: Date): Promise<{ dividends: any[]; splits: any[] }>;
}
