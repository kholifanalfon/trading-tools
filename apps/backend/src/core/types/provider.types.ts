import { StockSearchResult, StockQuote } from "@/modules/screener/screener.schema";

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ScreenerProviderAdapter {
  searchStocks(query: string): Promise<StockSearchResult[]>;
  getQuote(symbol: string): Promise<StockQuote>;
  getHistoricalData(symbol: string, fromDate: Date, toDate: Date, interval?: string): Promise<HistoricalDataPoint[]>;
}
