import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAiAnalysisApi, refreshAiAnalysisApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";
import { toast } from "sonner";

export function useGetAiAnalysis(symbol: string) {
  return useQuery<any, ApiError>({
    queryKey: screenerKeys.aiAnalysis(symbol),
    queryFn: () => getAiAnalysisApi(symbol),
    enabled: !!symbol,
    staleTime: 60000 * 5, // 5 minutes cache stale time
  });
}

export function useRefreshAiAnalysis(symbol: string) {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => refreshAiAnalysisApi(symbol),
    onSuccess: (data) => {
      queryClient.setQueryData(screenerKeys.aiAnalysis(symbol), data);
      toast.success("Analisis AI diperbarui sukses!");
    },
    onError: (err) => {
      console.error("Failed to refresh AI Analysis:", err);
      toast.error(err.message || "Gagal memperbarui analisis AI.");
    },
  });
}
