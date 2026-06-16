import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBacktestReportsApi,
  runBacktestApi,
  runOptimizationApi,
  runMultiStockOptimizationApi,
  getAiAlternativeApi,
} from "../services/backtest.api";
import {
  RunBacktestPayload,
  RunBacktestResponse,
  RunOptimizationResponse,
  RunMultiStockOptimizationPayload,
  RunMultiStockOptimizationResponse,
  AiAlternativeRequest,
  AiAlternativeResponse,
  SavedReport,
} from "../types/backtest.types";
import { backtestKeys } from "../backtest.keys";
import { ApiError } from "@/shared/config/api";

export function useGetBacktestReports() {
  return useQuery<SavedReport[], ApiError>({
    queryKey: backtestKeys.reports(),
    queryFn: getBacktestReportsApi,
  });
}

export function useRunBacktest() {
  const queryClient = useQueryClient();
  return useMutation<RunBacktestResponse, ApiError, RunBacktestPayload>({
    mutationFn: (data: RunBacktestPayload) => runBacktestApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backtestKeys.reports() });
    },
  });
}

export function useRunOptimization() {
  return useMutation<RunOptimizationResponse, ApiError, RunBacktestPayload>({
    mutationFn: (data: RunBacktestPayload) => runOptimizationApi(data),
  });
}

export function useRunMultiStockOptimization() {
  return useMutation<RunMultiStockOptimizationResponse, ApiError, RunMultiStockOptimizationPayload>({
    mutationFn: (data: RunMultiStockOptimizationPayload) => runMultiStockOptimizationApi(data),
  });
}

export function useGetAiAlternative() {
  return useMutation<AiAlternativeResponse, ApiError, AiAlternativeRequest>({
    mutationFn: (data: AiAlternativeRequest) => getAiAlternativeApi(data),
  });
}
