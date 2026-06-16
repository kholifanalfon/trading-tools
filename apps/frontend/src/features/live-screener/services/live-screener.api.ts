import { api } from "@/shared/config/api";
import { StockDataQueryParams } from "@/features/screener/types/screener.types";

export async function getLiveStockDataApi(params: StockDataQueryParams): Promise<{
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const response = await api.get<{ success: boolean; data: any }>("/live-screener", { params });
  return response.data.data;
}
