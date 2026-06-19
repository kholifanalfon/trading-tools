import { useMutation } from "@tanstack/react-query";
import { getAiScoringRulesRecommendationApi, ScoringRulesRecommendationResponse } from "../services/settings.api";
import { ApiError } from "@/shared/config/api";

export function useGetAiScoringRulesRecommendation() {
  const apiScoringRecommend = useMutation<ScoringRulesRecommendationResponse, ApiError, "day" | "swing" | "position">({
    mutationFn: (strategy) => getAiScoringRulesRecommendationApi(strategy),
  });

  return {
    getRecommendations: apiScoringRecommend.mutateAsync,
    isGeneratingRecommendations: apiScoringRecommend.isPending,
    recommendationError: apiScoringRecommend.error,
    recommendationData: apiScoringRecommend.data,
    resetRecommendations: apiScoringRecommend.reset,
  };
}
