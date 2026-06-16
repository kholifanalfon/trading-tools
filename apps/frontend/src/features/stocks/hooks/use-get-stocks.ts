import { useQuery } from "@tanstack/react-query";
import { getStocksApi } from "../services/stocks.api";
import { StockQuery } from "../types/stocks.types";
import { stocksKeys } from "../stocks.keys";

export function useGetStocks(query: StockQuery) {
  return useQuery({
    queryKey: stocksKeys.list(query),
    queryFn: () => getStocksApi(query),
  });
}
