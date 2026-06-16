import { ScoringRulesConfig } from "@/core/utils/scoring.utils";

export interface BacktestParams {
  strategy: "day" | "swing" | "position";
  rulesConfig: ScoringRulesConfig;
  buyThreshold: number;
  sellThreshold: number;
  stopLossPercent: number; // e.g. -2.0 for -2%
  takeProfitPercent: number; // e.g. 6.0 for +6%
  initialCapital?: number;
}

export interface TradeLog {
  id: number;
  symbol: string;
  entryDate: Date;
  entryPrice: number;
  exitDate: Date;
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
  equityCurve: { date: Date; capital: number; benchmark: number }[];
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

export interface WeightProfile {
  name: string;
  weights: Record<string, number>;
}
