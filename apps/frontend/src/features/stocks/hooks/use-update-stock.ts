import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStockApi } from "../services/stocks.api";
import { UpdateStockPayload } from "../types/stocks.types";
import { stocksKeys } from "../stocks.keys";
import { ApiError } from "@/shared/config/api";

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, { id: number; data: UpdateStockPayload }>({
    mutationFn: ({ id, data }) => updateStockApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stocksKeys.detail(variables.id) });
    },
  });
}
