import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePortfolioApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";
import { UpdatePortfolioPayload } from "../types/portfolio.types";

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioPayload }) => updatePortfolioApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(variables.id) });
    },
  });
}
