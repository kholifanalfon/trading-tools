import { useQuery } from "@tanstack/react-query";
import { searchStocksApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useSearchStocks(query: string) {
  return useQuery<unknown, ApiError, any>({
    queryKey: screenerKeys.search(query),
    queryFn: () => searchStocksApi(query),
    enabled: query.trim().length > 0,
    retry: false,
    staleTime: 60000, // 1 minute stale time
  });
}
