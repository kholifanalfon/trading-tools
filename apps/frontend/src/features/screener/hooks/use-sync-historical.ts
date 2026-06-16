import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncHistoricalDataApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useSyncHistorical() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, ApiError, string | undefined>({
    mutationFn: (date) => syncHistoricalDataApi(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...screenerKeys.all, "sync-status"] });
      queryClient.invalidateQueries({ queryKey: [...screenerKeys.all, "logs"] });
    },
  });
}
