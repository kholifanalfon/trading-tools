import { useInfiniteQuery } from "@tanstack/react-query";
import { getLiveStockDataApi } from "../services/live-screener.api";
import { StockDataQueryParams } from "@/features/screener/types/screener.types";
import { liveScreenerKeys } from "../live-screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetInfiniteLiveStockData(params: StockDataQueryParams, options?: { enabled?: boolean }) {
  return useInfiniteQuery<any, ApiError>({
    queryKey: [...liveScreenerKeys.all, "data", "infinite", params],
    queryFn: ({ pageParam = 1 }) => getLiveStockDataApi({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 15000,
    ...options,
  });
}
