import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTransactionApi } from "../services/portfolio.api";
import { portfolioKeys } from "../portfolio.keys";
import { AddTransactionPayload } from "../types/portfolio.types";

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portfolioId, data }: { portfolioId: number; data: AddTransactionPayload }) =>
      addTransactionApi(portfolioId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(variables.portfolioId) });
      // Invalidate trading journals query cache since BUY/SELL auto-generates journal entries
      queryClient.invalidateQueries({ queryKey: ["trading-journals"] });
    },
  });
}
