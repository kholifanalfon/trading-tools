export interface StockSearchResult {
  symbol: string;
  description: string;
  type: string;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  lastUpdateTime?: string;
  delayedMinutes?: number;
}

export interface StockDataQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
  watchlist?: boolean;
  exchange?: string;
  strategy?: string;
  refresh?: boolean;
}
