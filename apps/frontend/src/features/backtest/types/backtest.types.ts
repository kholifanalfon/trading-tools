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
