import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePortfolioApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";

export function useDeletePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePortfolioApi,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(id) });
    },
  });
}
