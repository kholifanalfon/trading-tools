import { useQuery } from "@tanstack/react-query";
import { getPortfolioByIdApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";

export function useGetPortfolio(id: number) {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: () => getPortfolioByIdApi(id),
    enabled: !isNaN(id),
  });
}
