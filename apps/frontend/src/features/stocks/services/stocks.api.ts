import { api } from "@/shared/config/api";
import { CreateStockPayload, UpdateStockPayload, Stock, StockListResponse, StockQuery } from "../types/stocks.types";

export async function getStocksApi(query: StockQuery): Promise<StockListResponse> {
  const response = await api.get<StockListResponse>("/stocks", {
    params: query,
  });
  return response.data;
}

export async function getStockByIdApi(id: number): Promise<Stock> {
  const response = await api.get<Stock>(`/stocks/${id}`);
  return response.data;
}

export async function createStockApi(data: CreateStockPayload): Promise<Stock> {
  const response = await api.post<Stock>("/stocks", data);
  return response.data;
}

export async function updateStockApi(id: number, data: UpdateStockPayload): Promise<Stock> {
  const response = await api.put<Stock>(`/stocks/${id}`, data);
  return response.data;
}

export async function deleteStockApi(id: number): Promise<{ success: boolean }> {
  const response = await api.delete<{ success: boolean }>(`/stocks/${id}`);
  return response.data;
}

export interface SyncStateResponse {
  status: "idle" | "running" | "success" | "failed";
  error: string | null;
  lastSyncAt: string | null;
}

export async function syncStockApi(): Promise<any> {
  const response = await api.post<any>("/stocks/sync");
  return response.data;
}

export async function getSyncStatusApi(): Promise<SyncStateResponse> {
  const response = await api.get<SyncStateResponse>("/stocks/sync-status");
  return response.data;
}


