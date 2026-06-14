import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getStockDataApi } from "../services/screener.api";
import { StockDataQueryParams } from "../types/screener.types";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetStockData(params: StockDataQueryParams) {
  return useQuery<any, ApiError>({
    queryKey: [...screenerKeys.all, "data", params],
    queryFn: () => getStockDataApi(params),
    staleTime: 15000,
  });
}

export function useGetInfiniteStockData(params: StockDataQueryParams) {
  return useInfiniteQuery<any, ApiError>({
    queryKey: [...screenerKeys.all, "data", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getStockDataApi({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 15000,
  });
}
