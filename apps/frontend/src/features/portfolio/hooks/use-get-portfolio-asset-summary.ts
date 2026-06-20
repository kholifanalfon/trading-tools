import { useQuery } from "@tanstack/react-query";
import { getPortfoliosAssetSummaryApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";

export function useGetPortfolioAssetSummary(symbol: string) {
  return useQuery({
    queryKey: [...portfolioKeys.all, "asset-summary", symbol],
    queryFn: () => getPortfoliosAssetSummaryApi(symbol),
    enabled: !!symbol,
  });
}
