import { api } from "@/shared/config/api";

export interface RunBacktestPayload {
  symbol: string;
  strategy: "day" | "swing" | "position";
  buyThreshold: number;
  sellThreshold: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

export interface TradeLog {
  id: number;
  symbol: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  profitPercent: number;
  profitAmount: number;
  exitReason: "score_crossover" | "stop_loss" | "take_profit" | "end_of_period";
  holdingDays: number;
}

export interface BacktestResult {
  initialCapital: number;
  finalCapital: number;
  totalReturnPercent: number;
  winRatePercent: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  trades: TradeLog[];
  equityCurve: { date: string; capital: number; benchmark: number }[];
}

export interface RunBacktestResponse {
  reportId: number;
  result: BacktestResult;
  aiInsights: string;
}

export interface OptimizationGridItem {
  parameters: Record<string, number>;
  weightProfile?: string;
  metrics: {
    totalReturnPercent: number;
    winRatePercent: number;
    maxDrawdownPercent: number;
    totalTrades: number;
  };
}

export interface OptimizationBaseline {
  totalReturnPercent: number;
  winRatePercent: number;
  maxDrawdownPercent: number;
  totalTrades: number;
}

export interface RunOptimizationResponse {
  baseline: OptimizationBaseline;
  grid: OptimizationGridItem[];
}

export interface SavedReport {
  id: number;
  symbol: string;
  strategy: string;
  parameters: any;
  metrics: any;
  trades: any[];
  equityCurve?: any[];
  aiInsights: string;
  createdAt: string;
}

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

export interface RunMultiStockOptimizationPayload {
  strategy: "day" | "swing" | "position";
  buyThreshold: number;
  sellThreshold: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

export interface RunMultiStockOptimizationResponse {
  symbols: string[];
  baseline: OptimizationBaseline;
  grid: OptimizationGridItem[];
}

export async function runMultiStockOptimizationApi(
  data: RunMultiStockOptimizationPayload
): Promise<RunMultiStockOptimizationResponse> {
  const response = await api.post<RunMultiStockOptimizationResponse>("/backtest/optimize-multi", data);
  return response.data;
}

export interface AiAlternativeRequest {
  strategy: "day" | "swing" | "position";
  beforeParams: Record<string, number>;
  beforeMetrics: Record<string, number>;
  afterParams: Record<string, number>;
  afterMetrics: Record<string, number>;
}

export interface AiAlternativeResponse {
  alternativeParams: Record<string, { value: number; reason: string }>;
  alternativeMetrics?: {
    totalReturnPercent: number;
    winRatePercent: number;
    maxDrawdownPercent: number;
    totalTrades: number;
  };
}

export async function getAiAlternativeApi(data: AiAlternativeRequest): Promise<AiAlternativeResponse> {
  const response = await api.post<AiAlternativeResponse>("/backtest/ai-alternative", data);
  return response.data;
}
