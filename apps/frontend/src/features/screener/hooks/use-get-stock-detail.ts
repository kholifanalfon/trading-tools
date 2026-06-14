import { useQuery } from "@tanstack/react-query";
import { getStockHistoricalDataApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetStockHistoricalData(symbol: string, limit?: number, timeframe?: string) {
  return useQuery<any[], ApiError>({
    queryKey: [...screenerKeys.all, "data", "detail", symbol, limit, timeframe],
    queryFn: () => getStockHistoricalDataApi(symbol, limit, timeframe),
    enabled: !!symbol,
    staleTime: 15000,
  });
}
