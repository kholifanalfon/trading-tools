import { api } from "@/shared/config/api";
import {
  RunBacktestPayload,
  RunBacktestResponse,
  RunOptimizationResponse,
  SavedReport,
  RunMultiStockOptimizationPayload,
  RunMultiStockOptimizationResponse,
  AiAlternativeRequest,
  AiAlternativeResponse,
} from "../types/backtest.types";

export async function runBacktestApi(data: RunBacktestPayload): Promise<RunBacktestResponse> {
  const response = await api.post<RunBacktestResponse>("/backtest/run", data);
  return response.data;
}

export async function runOptimizationApi(data: RunBacktestPayload): Promise<RunOptimizationResponse> {
  const response = await api.post<RunOptimizationResponse>("/backtest/optimize", data);
  return response.data;
}

export async function getBacktestReportsApi(): Promise<SavedReport[]> {
  const response = await api.get<SavedReport[]>("/backtest/reports");
  return response.data;
}

export async function runMultiStockOptimizationApi(
  data: RunMultiStockOptimizationPayload
): Promise<RunMultiStockOptimizationResponse> {
  const response = await api.post<RunMultiStockOptimizationResponse>("/backtest/optimize-multi", data);
  return response.data;
}

export async function getAiAlternativeApi(data: AiAlternativeRequest): Promise<AiAlternativeResponse> {
  const response = await api.post<AiAlternativeResponse>("/backtest/ai-alternative", data);
  return response.data;
}
