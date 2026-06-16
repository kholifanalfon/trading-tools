import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettingsApi } from "../services/settings.api";
import { UpdateGeminiSettingsPayload, GeminiSettings } from "../types/settings.types";
import { settingsKeys } from "../settings.keys";
import { ApiError } from "@/shared/config/api";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<GeminiSettings, ApiError, UpdateGeminiSettingsPayload>({
    mutationFn: (data: UpdateGeminiSettingsPayload) => updateSettingsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
