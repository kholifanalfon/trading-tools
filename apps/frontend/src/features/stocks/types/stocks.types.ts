export interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  watchlist: boolean;
  exchange: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockPayload {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  watchlist?: boolean;
  exchange?: string;
}

export interface UpdateStockPayload {
  symbol?: string;
  name?: string;
  sector?: string;
  price?: number;
  watchlist?: boolean;
  exchange?: string;
}

export interface StockQuery {
  page: number;
  limit: number;
  search?: string;
  watchlist?: boolean;
  exchange?: string;
}

export interface StockListResponse {
  items: Stock[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
