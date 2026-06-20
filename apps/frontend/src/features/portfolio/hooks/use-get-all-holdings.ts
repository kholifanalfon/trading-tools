import { useQuery } from "@tanstack/react-query";
import { getAllHoldingsApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";

export function useGetAllHoldings() {
  return useQuery({
    queryKey: [...portfolioKeys.all, "holdings", "all"],
    queryFn: getAllHoldingsApi,
  });
}
