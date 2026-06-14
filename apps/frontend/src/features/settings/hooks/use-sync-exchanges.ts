import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncExchangesApi } from "../services/settings.api";
import { GeminiSettings } from "../types/settings.types";
import { settingsKeys } from "../settings.keys";
import { ApiError } from "@/shared/config/api";

export function useSyncExchanges() {
  const queryClient = useQueryClient();

  return useMutation<GeminiSettings, ApiError, void>({
    mutationFn: () => syncExchangesApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
