import { useQuery } from "@tanstack/react-query";
import { getPortfoliosApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";

export function useGetPortfolios() {
  return useQuery({
    queryKey: portfolioKeys.lists(),
    queryFn: getPortfoliosApi,
  });
}
