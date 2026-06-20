import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortfolioApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPortfolioApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
    },
  });
}
