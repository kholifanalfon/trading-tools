import { useQuery } from "@tanstack/react-query";
import { getScoringRulesApi } from "../services/settings.api";
import { settingsKeys } from "../settings.keys";

export function useGetScoringRules() {
  return useQuery({
    queryKey: settingsKeys.scoringRules,
    queryFn: getScoringRulesApi,
  });
}
