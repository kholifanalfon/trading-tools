import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStockApi } from "../services/stocks.api";
import { CreateStockPayload } from "../types/stocks.types";
import { stocksKeys } from "../stocks.keys";
import { ApiError } from "@/shared/config/api";

export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, CreateStockPayload>({
    mutationFn: (data: CreateStockPayload) => createStockApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.lists() });
    },
  });
}
