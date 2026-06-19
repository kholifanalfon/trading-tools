import { useMutation } from "@tanstack/react-query";
import { getAiScreenerRecommendationApi } from "../services/settings.api";
import { ApiError } from "@/shared/config/api";
import { AiRecommendationResponse } from "../settings.schema";

export function useGetAiScreenerRecommendation() {
  const apiScreenerRecomend = useMutation<AiRecommendationResponse, ApiError, "day" | "swing" | "position">({
    mutationFn: (strategy) => getAiScreenerRecommendationApi(strategy),
  });

  return {
    getRecommendations: apiScreenerRecomend.mutateAsync,
    isGeneratingRecommendations: apiScreenerRecomend.isPending,
    recommendationError: apiScreenerRecomend.error,
    recommendationData: apiScreenerRecomend.data,
    resetRecommendations: apiScreenerRecomend.reset,
  };
}
