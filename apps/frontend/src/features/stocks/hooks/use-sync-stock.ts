import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncStockApi } from "../services/stocks.api";
import { stocksKeys } from "../stocks.keys";
import { ApiError } from "@/shared/config/api";

export function useSyncStock() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, void>({
    mutationFn: () => syncStockApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.lists() });
    },
  });
}
