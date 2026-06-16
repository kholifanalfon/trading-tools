import { useQuery } from "@tanstack/react-query";
import { getStockQuoteApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetQuote(symbol: string) {
  return useQuery<unknown, ApiError, any>({
    queryKey: screenerKeys.quote(symbol),
    queryFn: () => getStockQuoteApi(symbol),
    enabled: symbol.trim().length > 0,
    retry: false,
    refetchInterval: 30000, // auto-refresh quote every 30 seconds
  });
}
