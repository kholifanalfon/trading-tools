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

export interface LiveScreenerStockItem {
  id: string | number;
  stockId: string | number;
  symbol: string;
  name: string;
  exchange: string;
  watchlist: boolean;
  date?: string | Date;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  price?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  dayScore?: number | null;
  swingScore?: number | null;
  positionScore?: number | null;
  dayMaxScore?: number;
  swingMaxScore?: number;
  positionMaxScore?: number;
  scorePayload?: any;
  isCalculated?: boolean;
}

