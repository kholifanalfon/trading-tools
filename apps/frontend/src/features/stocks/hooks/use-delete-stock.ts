import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStockApi } from "../services/stocks.api";
import { stocksKeys } from "../stocks.keys";
import { ApiError } from "@/shared/config/api";

export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, number>({
    mutationFn: (id) => deleteStockApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stocksKeys.detail(id) });
    },
  });
}
