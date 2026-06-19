import { useInfiniteQuery } from "@tanstack/react-query";
import { getLiveStockDataApi } from "../services/live-screener.api";
import { StockDataQueryParams } from "@/features/screener/types/screener.types";
import { liveScreenerKeys } from "../live-screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetInfiniteLiveStockData(params: StockDataQueryParams & { getExtraParams?: () => any }, options?: { enabled?: boolean }) {
  const { getExtraParams, ...queryParams } = params;
  return useInfiniteQuery<any, ApiError>({
    queryKey: [...liveScreenerKeys.all, "data", "infinite", queryParams],
    queryFn: ({ pageParam = 1 }) => {
      const extra = getExtraParams ? getExtraParams() : {};
      return getLiveStockDataApi({ ...queryParams, ...extra, page: pageParam as number });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // Keep cache in memory for 60 minutes
    ...options,
  });
}
