export interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockPayload {
  symbol: string;
  name: string;
  sector: string;
  price: number;
}

export interface UpdateStockPayload {
  symbol?: string;
  name?: string;
  sector?: string;
  price?: number;
}

export interface StockQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface StockListResponse {
  items: Stock[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
