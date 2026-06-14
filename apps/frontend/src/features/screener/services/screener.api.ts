import { api } from "@/shared/config/api";
import { StockSearchResult, StockQuote, StockDataQueryParams } from "../types/screener.types";

export async function searchStocksApi(q: string): Promise<StockSearchResult[]> {
  const response = await api.get<{ success: boolean; data: StockSearchResult[] }>(
    "/screener/search",
    { params: { q } }
  );
  return response.data.data;
}

export async function getStockQuoteApi(symbol: string): Promise<StockQuote> {
  const response = await api.get<{ success: boolean; data: StockQuote }>("/screener/quote", {
    params: { symbol },
  });
  return response.data.data;
}

export async function syncHistoricalDataApi(date?: string): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; data: { success: boolean; message: string } }>("/screener/sync-history", { date });
  return response.data.data;
}


export async function getHistoricalSyncStatusApi(): Promise<{ status: string; error: string | null; lastSyncAt: string | null }> {
  const response = await api.get<{ success: boolean; data: { status: string; error: string | null; lastSyncAt: string | null } }>("/screener/sync-history/status");
  return response.data.data;
}

export async function getSyncLogsApi(): Promise<any[]> {
  const response = await api.get<{ success: boolean; data: any[] }>("/screener/sync-history/logs");
  return response.data.data;
}

export async function getStockDataApi(params: StockDataQueryParams): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
  console.log(params);
  const response = await api.get<{ success: boolean; data: any }>("/screener/data", { params });
  return response.data.data;
}

export async function getStockHistoricalDataApi(symbol: string, limit?: number, timeframe?: string, strategy?: string): Promise<any[]> {
  const response = await api.get<{ success: boolean; data: any[] }>(`/screener/data/${symbol}`, {
    params: { limit, timeframe, strategy },
  });
  return response.data.data;
}


