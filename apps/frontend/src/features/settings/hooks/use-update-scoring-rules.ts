import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScoringRulesApi } from "../services/settings.api";
import { ScoringRule, UpdateScoringRulesBatchPayload } from "../types/settings.types";
import { settingsKeys } from "../settings.keys";
import { ApiError } from "@/shared/config/api";

export function useUpdateScoringRules() {
  const queryClient = useQueryClient();

  return useMutation<ScoringRule[], ApiError, UpdateScoringRulesBatchPayload>({
    mutationFn: (data: UpdateScoringRulesBatchPayload) => updateScoringRulesApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.scoringRules });
    },
  });
}
