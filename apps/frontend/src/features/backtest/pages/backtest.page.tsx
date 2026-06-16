import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { settingsKeys } from "@/features/settings/settings.keys";
import { getScoringRulesApi, updateScoringRulesApi } from "@/features/settings/services/settings.api";
import {
  PlayIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  SparklesIcon,
  HistoryIcon,
  GlobeIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { useGetStocks } from "@/features/stocks/hooks/use-get-stocks";
import { MarkdownPreview } from "@/shared/components/ui/markdown-preview";

// Extracted Items
import { BacktestFormSchema, BacktestFormInput } from "../backtest.schema";
import { BacktestResult, OptimizationGridItem, OptimizationBaseline } from "../types/backtest.types";
import {
  useGetBacktestReports,
  useRunBacktest,
  useRunOptimization,
  useRunMultiStockOptimization,
  useGetAiAlternative,
} from "../hooks/use-backtest";
import { BacktestCharts } from "../components/backtest-charts";
import { TradesTable } from "../components/trades-table";
import { OptimizationModal } from "../components/optimization-modal";

export function BacktestPage() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"chart" | "trades" | "optimize" | "reports">("chart");
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [optimizationGrid, setOptimizationGrid] = useState<OptimizationGridItem[]>([]);
  const [optimizationType, setOptimizationType] = useState<"single" | "global">("single");
  const [optimizedStocks, setOptimizedStocks] = useState<string[]>([]);
  const [optimizationBaseline, setOptimizationBaseline] = useState<OptimizationBaseline | null>(null);
  const [dbScoringRules, setDbScoringRules] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    parameters: Record<string, number>;
    metrics?: {
      totalReturnPercent: number;
      winRatePercent: number;
      maxDrawdownPercent: number;
      totalTrades: number;
    };
    isGlobal: boolean;
    activeTab: "data" | "ai";
  }>({ isOpen: false, parameters: {}, isGlobal: false, activeTab: "data" });

  const [optimizeLogs, setOptimizeLogs] = useState<string[]>([]);

  // TanStack Query custom hooks
  const { data: savedReports = [] } = useGetBacktestReports();
  const runBacktestMutation = useRunBacktest();
  const runOptimizationMutation = useRunOptimization();
  const runMultiStockOptimizationMutation = useRunMultiStockOptimization();
  const getAiAlternativeMutation = useGetAiAlternative();

  useWebSocket(["backtest", "optimize-log"], (data) => {
    if (data && data.message) {
      setOptimizeLogs((prev) => [...prev.slice(-40), data.message]);
    }
  });

  const { data: watchlistedStocks } = useGetStocks({ page: 1, limit: 100, watchlist: true });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BacktestFormInput>({
    resolver: zodResolver(BacktestFormSchema),
    defaultValues: {
      symbol: "BBRI.JK",
      strategy: "day",
      buyThreshold: 70,
      sellThreshold: 30,
      stopLossPercent: -2.0,
      takeProfitPercent: 6.0,
    },
  });

  const loadDbScoringRules = async () => {
    try {
      const data = await getScoringRulesApi();
      setDbScoringRules(data);
    } catch (err) {
      console.error("Failed to load DB scoring rules:", err);
    }
  };

  useEffect(() => {
    loadDbScoringRules();
  }, []);

  useEffect(() => {
    if (watchlistedStocks?.items && watchlistedStocks.items.length > 0) {
      setValue("symbol", watchlistedStocks.items[0].symbol);
    }
  }, [watchlistedStocks, setValue]);

  const onRunSimulation = async (data: BacktestFormInput) => {
    setBacktestResult(null);
    setAiInsights("");
    try {
      const response = await runBacktestMutation.mutateAsync({
        ...data,
        symbol: data.symbol.toUpperCase(),
      });
      setBacktestResult(response.result);
      setAiInsights(response.aiInsights);
      toast.success("Simulation finished successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to run simulation");
    }
  };

  const onOptimizeParameters = async () => {
    setOptimizationGrid([]);
    setOptimizedStocks([]);
    setOptimizationType("single");
    setOptimizeLogs([]);
    setOptimizationBaseline(null);
    setActiveSubTab("optimize");
    const values = watch();
    try {
      const response = await runOptimizationMutation.mutateAsync({
        ...values,
        symbol: values.symbol.toUpperCase(),
      });
      setOptimizationGrid(response.grid);
      setOptimizationBaseline(response.baseline);
      toast.success("Optimization search completed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to run strategy optimization");
    }
  };

  const onOptimizeGlobally = async () => {
    setOptimizationGrid([]);
    setOptimizedStocks([]);
    setOptimizationType("global");
    setOptimizeLogs([]);
    setOptimizationBaseline(null);
    setActiveSubTab("optimize");
    const values = watch();
    try {
      const response = await runMultiStockOptimizationMutation.mutateAsync({
        strategy: values.strategy,
        buyThreshold: values.buyThreshold,
        sellThreshold: values.sellThreshold,
        stopLossPercent: values.stopLossPercent,
        takeProfitPercent: values.takeProfitPercent,
      });
      setOptimizationGrid(response.grid);
      setOptimizedStocks(response.symbols);
      setOptimizationBaseline(response.baseline);
      toast.success(`Global multi-stock optimization completed for: ${response.symbols.join(", ")}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to run global strategy optimization");
    }
  };

  const openConfirmModal = (parameters: Record<string, number>, metrics: any, isGlobal: boolean) => {
    setConfirmModal({
      isOpen: true,
      parameters,
      metrics,
      isGlobal,
      activeTab: "data",
    });
  };

  const handleTabChange = async (tab: "data" | "ai") => {
    setConfirmModal((prev) => ({ ...prev, activeTab: tab }));
    if (tab === "ai" && !getAiAlternativeMutation.data && !getAiAlternativeMutation.isPending) {
      try {
        const strategy = watch("strategy");
        const beforeParams: Record<string, number> = {};
        const beforeMetrics: Record<string, number> = {
          totalReturnPercent: optimizationBaseline?.totalReturnPercent ?? 0,
          winRatePercent: optimizationBaseline?.winRatePercent ?? 0,
          maxDrawdownPercent: optimizationBaseline?.maxDrawdownPercent ?? 0,
          totalTrades: optimizationBaseline?.totalTrades ?? 0,
        };

        const paramKeys = Object.keys(confirmModal.parameters).filter((k) => !k.startsWith("_weight:"));
        paramKeys.forEach((k) => {
          beforeParams[k] = watch(k as any);
        });

        Object.keys(confirmModal.parameters)
          .filter((k) => k.startsWith("_weight:"))
          .forEach((k) => {
            const paramName = k.replace("_weight:", "");
            beforeParams[k] = dbScoringRules.find(
              (r) => r.strategy === strategy && r.parameterName === paramName
            )?.weight ?? 0;
          });

        await getAiAlternativeMutation.mutateAsync({
          strategy,
          beforeParams,
          beforeMetrics,
          afterParams: confirmModal.parameters,
          afterMetrics: {
            totalReturnPercent: confirmModal.metrics?.totalReturnPercent ?? 0,
            winRatePercent: confirmModal.metrics?.winRatePercent ?? 0,
            maxDrawdownPercent: confirmModal.metrics?.maxDrawdownPercent ?? 0,
            totalTrades: confirmModal.metrics?.totalTrades ?? 0,
          },
        });
      } catch (err) {
        console.error("Failed to load AI suggestion:", err);
      }
    }
  };

  const applyOptimizedParamGlobally = async (parameters: Record<string, number>) => {
    try {
      const activeRules = await getScoringRulesApi();
      const ruleUpdates: Record<number, { id: number; value: number; weight: number }> = {};
      const strategy = watch("strategy");

      Object.entries(parameters).forEach(([k, v]) => {
        if (k.startsWith("_weight:")) {
          const paramName = k.replace("_weight:", "");
          const match = activeRules.find((r) => r.strategy === strategy && r.parameterName === paramName);
          if (match) {
            if (!ruleUpdates[match.id]) {
              ruleUpdates[match.id] = { id: match.id, value: match.value, weight: v };
            } else {
              ruleUpdates[match.id].weight = v;
            }
          }
        } else {
          const match = activeRules.find((r) => r.strategy === strategy && r.parameterName === k);
          if (match) {
            if (!ruleUpdates[match.id]) {
              ruleUpdates[match.id] = { id: match.id, value: v, weight: match.weight };
            } else {
              ruleUpdates[match.id].value = v;
            }
          }
        }
      });

      const payloadRules = Object.values(ruleUpdates);

      if (payloadRules.length === 0) {
        toast.error("No matching scoring rules found in database to update globally.");
        return;
      }

      await updateScoringRulesApi({ rules: payloadRules });
      await queryClient.invalidateQueries({ queryKey: settingsKeys.scoringRules });
      await loadDbScoringRules();
      toast.success("Scoring rules updated globally in database!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update global scoring rules");
    }
  };

  const handleConfirmApply = async () => {
    if (confirmModal.isGlobal) {
      await applyOptimizedParamGlobally(confirmModal.parameters);
    } else {
      Object.entries(confirmModal.parameters).forEach(([k, v]) => {
        if (!k.startsWith("_weight:")) {
          setValue(k as any, v);
        }
      });
      toast.success("Applied optimized parameters locally!");
    }
    setConfirmModal({ isOpen: false, parameters: {}, isGlobal: false, activeTab: "data" });
  };

  const handleApplyAiAlternative = async () => {
    const aiAlternative = getAiAlternativeMutation.data;
    if (!aiAlternative) return;
    const flatParams: Record<string, number> = {};
    Object.entries(aiAlternative.alternativeParams).forEach(([k, item]) => {
      flatParams[k] = item.value;
    });

    if (confirmModal.isGlobal) {
      await applyOptimizedParamGlobally(flatParams);
    } else {
      Object.entries(flatParams).forEach(([k, v]) => {
        if (!k.startsWith("_weight:")) {
          setValue(k as any, v);
        }
      });
      toast.success("Applied AI suggested parameters locally!");
    }
    setConfirmModal({ isOpen: false, parameters: {}, isGlobal: false, activeTab: "data" });
  };

  const getParameterChangeDesc = (key: string, before: number, after: number) => {
    const diff = after - before;
    if (diff === 0) return "Tidak ada perubahan.";

    const action = diff > 0 ? "Menaikkan" : "Menurunkan";
    const formattedDiff = Math.abs(diff).toFixed(2);

    if (key.startsWith("_weight:")) {
      const paramName = key.replace("_weight:", "");
      const cleanName = paramName.replace(/_/g, " ").toUpperCase();
      return `${action} bobot pengaruh indikator ${cleanName} sebesar ${diff > 0 ? "+" : ""}${diff.toFixed(0)}.`;
    }

    const cleanKey = key.replace(/([A-Z])/g, " $1").toLowerCase();
    switch (key) {
      case "buyThreshold":
        return `${action} batas skor beli menjadi ${after} untuk ${diff > 0 ? "memperketat" : "mempermudah"} kriteria entri.`;
      case "sellThreshold":
        return `${action} batas skor jual menjadi ${after} untuk ${diff > 0 ? "mempercepat" : "memperlambat"} kriteria keluar.`;
      case "stopLossPercent":
        return `${action} batas stop loss menjadi ${after}% untuk ${diff < 0 ? "memperketat proteksi risiko" : "memberikan ruang fluktuasi lebih"}.`;
      case "takeProfitPercent":
        return `${action} target take profit menjadi ${after}% untuk ${diff > 0 ? "mengejar keuntungan lebih besar" : "mengamankan profit lebih cepat"}.`;
      default:
        return `${action} parameter ${cleanKey} dari ${before} menjadi ${after} (${diff > 0 ? "+" : ""}${formattedDiff}).`;
    }
  };

  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000_000) return `Rp ${(val / 1_000_000_000_000).toFixed(2)} T`;
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(2)} B`;
    return `Rp ${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Backtesting & Optimization</h1>
        <p className="text-sm text-muted-foreground">
          Simulate trading strategies on historical candles, discover optimized parameters, and read AI insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Parameters Settings Form */}
        <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-5 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <SlidersHorizontalIcon className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-foreground">Simulation Settings</h2>
          </div>

          <form onSubmit={handleSubmit(onRunSimulation)} className="space-y-3">
            <Field>
              <FieldLabel className="text-[10px] text-muted-foreground uppercase font-bold">Ticker Symbol</FieldLabel>
              <Input
                placeholder="e.g. BBCA.JK"
                className={`bg-background/50 border-border/70 text-xs h-9 font-semibold uppercase ${errors.symbol ? "border-destructive/60" : ""}`}
                {...register("symbol")}
              />
              {errors.symbol && <span className="text-[9px] text-destructive font-medium">{errors.symbol.message}</span>}
            </Field>

            <Field>
              <FieldLabel className="text-[10px] text-muted-foreground uppercase font-bold">Strategy Model</FieldLabel>
              <select
                className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-semibold"
                {...register("strategy")}
              >
                <option value="day">Day Strategy</option>
                <option value="swing">Swing Strategy</option>
                <option value="position">Position Strategy</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-[10px] text-muted-foreground uppercase font-bold">Buy Score Threshold</FieldLabel>
                <Input
                  type="number"
                  placeholder="Min score to buy"
                  className={`bg-background/50 border-border/70 text-xs h-9 font-mono ${errors.buyThreshold ? "border-destructive/60" : ""}`}
                  {...register("buyThreshold")}
                />
                {errors.buyThreshold && <span className="text-[9px] text-destructive font-medium">{errors.buyThreshold.message}</span>}
              </Field>

              <Field>
                <FieldLabel className="text-[10px] text-muted-foreground uppercase font-bold">Sell Score Threshold</FieldLabel>
                <Input
                  type="number"
                  placeholder="Max score to exit"
                  className={`bg-background/50 border-border/70 text-xs h-9 font-mono ${errors.sellThreshold ? "border-destructive/60" : ""}`}
                  {...register("sellThreshold")}
                />
                {errors.sellThreshold && <span className="text-[9px] text-destructive font-medium">{errors.sellThreshold.message}</span>}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-[10px] text-muted-foreground uppercase font-bold">Stop Loss (%)</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. -2"
                  className={`bg-background/50 border-border/70 text-xs h-9 font-mono ${errors.stopLossPercent ? "border-destructive/60" : ""}`}
                  {...register("stopLossPercent")}
                />
                {errors.stopLossPercent && <span className="text-[9px] text-destructive font-medium">{errors.stopLossPercent.message}</span>}
              </Field>

              <Field>
                <FieldLabel className="text-[10px] text-muted-foreground uppercase font-bold">Take Profit (%)</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 6"
                  className={`bg-background/50 border-border/70 text-xs h-9 font-mono ${errors.takeProfitPercent ? "border-destructive/60" : ""}`}
                  {...register("takeProfitPercent")}
                />
                {errors.takeProfitPercent && <span className="text-[9px] text-destructive font-medium">{errors.takeProfitPercent.message}</span>}
              </Field>
            </div>

            <Button
              type="submit"
              disabled={runBacktestMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-9 text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <PlayIcon className="h-3.5 w-3.5 fill-white text-white" />
              {runBacktestMutation.isPending ? "Running simulation..." : "Run Backtest Simulation"}
            </Button>

            <div className="flex gap-2.5 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={runOptimizationMutation.isPending || runMultiStockOptimizationMutation.isPending}
                onClick={onOptimizeParameters}
                className="flex-1 text-[10px] h-8 flex items-center justify-center gap-1 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 font-bold"
              >
                <SlidersHorizontalIcon className="h-3 w-3" />
                Optimize Parameters
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={runOptimizationMutation.isPending || runMultiStockOptimizationMutation.isPending}
                onClick={onOptimizeGlobally}
                className="flex-1 text-[10px] h-8 flex items-center justify-center gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-bold"
              >
                <GlobeIcon className="h-3 w-3" />
                Optimize Globally
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Results & Charts container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metrics summary cards */}
          {backtestResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-4 shadow-md text-left">
                <p className="text-[10px] font-semibold text-muted-foreground">Total Return</p>
                <p className={`text-md font-bold font-mono ${backtestResult.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                  {backtestResult.totalReturnPercent >= 0 ? "+" : ""}
                  {backtestResult.totalReturnPercent.toFixed(1)}%
                </p>
              </div>

              <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-4 shadow-md text-left">
                <p className="text-[10px] font-semibold text-muted-foreground">Win Rate</p>
                <p className="text-md font-bold font-mono text-foreground">{backtestResult.winRatePercent.toFixed(1)}%</p>
              </div>

              <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-4 shadow-md text-left">
                <p className="text-[10px] font-semibold text-muted-foreground">Max Drawdown</p>
                <p className="text-md font-bold font-mono text-destructive">-{backtestResult.maxDrawdownPercent.toFixed(1)}%</p>
              </div>

              <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-4 shadow-md text-left">
                <p className="text-[10px] font-semibold text-muted-foreground">Final Capital</p>
                <p className="text-md font-bold font-mono text-foreground">{formatIDR(backtestResult.finalCapital)}</p>
              </div>
            </div>
          )}

          {/* Sub-tabs header */}
          <div className="flex bg-card/60 border border-border/85 rounded-lg p-0.5 max-w-sm">
            <button
              onClick={() => setActiveSubTab("chart")}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition ${
                activeSubTab === "chart" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUpIcon className="h-3 w-3" />
              Equity Curve
            </button>
            <button
              onClick={() => setActiveSubTab("trades")}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition ${
                activeSubTab === "trades" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="h-3 w-3" />
              Trades Log
            </button>
            <button
              onClick={() => setActiveSubTab("optimize")}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition ${
                activeSubTab === "optimize" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontalIcon className="h-3 w-3" />
              Optimizations
            </button>
            <button
              onClick={() => setActiveSubTab("reports")}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition ${
                activeSubTab === "reports" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="h-3 w-3" />
              History
            </button>
          </div>

          <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-5 shadow-md min-h-[320px] flex flex-col justify-between">
            {activeSubTab === "chart" && <BacktestCharts backtestResult={backtestResult} />}

            {activeSubTab === "trades" && <TradesTable backtestResult={backtestResult} />}

            {activeSubTab === "optimize" && (
              <div className="space-y-3">
                {runOptimizationMutation.isPending || runMultiStockOptimizationMutation.isPending ? (
                  <div className="bg-black/90 font-mono text-[9px] text-emerald-400 p-4 rounded-lg border border-emerald-500/30 shadow-inner h-60 overflow-y-auto space-y-1">
                    <div className="text-muted-foreground animate-pulse mb-2">⚡ Running live optimization search...</div>
                    {optimizeLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed">{log}</div>
                    ))}
                  </div>
                ) : (
                  <>
                    {optimizationType === "global" && optimizedStocks.length > 0 && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                        Optimized on multi-stock list from live screener: <strong>{optimizedStocks.join(", ")}</strong> (Aggregated Performance)
                      </div>
                    )}
                    {optimizationGrid.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                          <Button
                            size="sm"
                            className="h-7 px-3 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md"
                            onClick={() => {
                              const best = optimizationGrid[0];
                              openConfirmModal(best.parameters, best.metrics, false);
                            }}
                          >
                            Apply Best Setup (Local)
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md"
                            onClick={() => {
                              const best = optimizationGrid[0];
                              openConfirmModal(best.parameters, best.metrics, true);
                            }}
                          >
                            Apply Best Setup Globally
                          </Button>
                        </div>
                        {optimizationBaseline && (
                          <div className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-foreground">
                            <div>
                              <span className="block text-muted-foreground font-semibold">Baseline Return</span>
                              <span className={`font-bold font-mono ${optimizationBaseline.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                                {optimizationBaseline.totalReturnPercent >= 0 ? "+" : ""}
                                {optimizationBaseline.totalReturnPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground font-semibold">Baseline Win Rate</span>
                              <span className="font-bold font-mono text-foreground">{optimizationBaseline.winRatePercent.toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground font-semibold">Baseline Drawdown</span>
                              <span className="font-bold font-mono text-destructive">-{optimizationBaseline.maxDrawdownPercent.toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground font-semibold">Baseline Trades</span>
                              <span className="font-bold font-mono text-foreground">{optimizationBaseline.totalTrades} trades</span>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-y-auto pr-1">
                          <table className="w-full text-[10px] text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border/50 text-muted-foreground uppercase font-bold">
                                <th className="py-2">Parameter Setups</th>
                                <th className="py-2 text-right">Total Return</th>
                                <th className="py-2 text-right">Win Rate</th>
                                <th className="py-2 text-right">Drawdown</th>
                                <th className="py-2 text-right">Trades</th>
                                <th className="py-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {optimizationGrid.map((item, idx) => (
                                <tr key={idx} className="border-b border-border/30 hover:bg-muted/10">
                                  <td className="py-2 font-mono">
                                    {item.weightProfile && (
                                      <span className="block text-[9px] text-indigo-400 font-semibold mb-1">
                                        Profile: {item.weightProfile}
                                      </span>
                                    )}
                                    {Object.entries(item.parameters)
                                      .filter(([k]) => !k.startsWith("_weight:"))
                                      .map(([k, v]) => (
                                        <span key={k} className="block text-[9px]">
                                          {k.replace(/_/g, " ")}: <strong>{v}</strong>
                                        </span>
                                      ))}
                                  </td>
                                  <td className={`py-2 text-right font-bold font-mono ${item.metrics.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                                    <div>
                                      {item.metrics.totalReturnPercent >= 0 ? "+" : ""}
                                      {item.metrics.totalReturnPercent.toFixed(1)}%
                                    </div>
                                    {optimizationBaseline && (
                                      <span className={`block text-[8px] font-semibold mt-0.5 ${
                                        item.metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"
                                      }`}>
                                        {item.metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent >= 0 ? "▲ +" : "▼ "}
                                        {(item.metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent).toFixed(1)}%
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 text-right font-mono font-bold text-foreground">
                                    <div>{item.metrics.winRatePercent.toFixed(1)}%</div>
                                    {optimizationBaseline && (
                                      <span className={`block text-[8px] font-semibold mt-0.5 ${
                                        item.metrics.winRatePercent - optimizationBaseline.winRatePercent >= 0 ? "text-emerald-400" : "text-destructive"
                                      }`}>
                                        {item.metrics.winRatePercent - optimizationBaseline.winRatePercent >= 0 ? "▲ +" : "▼ "}
                                        {(item.metrics.winRatePercent - optimizationBaseline.winRatePercent).toFixed(1)}%
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 text-right text-destructive font-mono">
                                    <div>-{item.metrics.maxDrawdownPercent.toFixed(1)}%</div>
                                    {optimizationBaseline && (
                                      <span className={`block text-[8px] font-semibold mt-0.5 ${
                                        item.metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent <= 0 ? "text-emerald-400" : "text-destructive"
                                      }`}>
                                        {item.metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent <= 0 ? "▲ -" : "▼ +"}
                                        {Math.abs(item.metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent).toFixed(1)}%
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 text-right font-mono">
                                    <div>{item.metrics.totalTrades}</div>
                                    {optimizationBaseline && (
                                      <span className="block text-[8px] text-muted-foreground/80 mt-0.5 font-semibold">
                                        diff: {item.metrics.totalTrades - optimizationBaseline.totalTrades >= 0 ? "+" : ""}
                                        {item.metrics.totalTrades - optimizationBaseline.totalTrades}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 text-right space-x-1.5 whitespace-nowrap">
                                    {Object.entries(item.parameters).some(([k, v]) => watch(k as any) !== v) ? (
                                      <>
                                        <Button
                                          size="sm"
                                          className="h-6 px-2 text-[9px] bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                          onClick={() => {
                                            openConfirmModal(item.parameters, item.metrics, false);
                                          }}
                                        >
                                          Apply
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-6 px-2 text-[9px] bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                          onClick={() => {
                                            openConfirmModal(item.parameters, item.metrics, true);
                                          }}
                                        >
                                          Apply Globally
                                        </Button>
                                      </>
                                    ) : (
                                      <span className="text-[9px] text-muted-foreground/60 font-medium select-none">Applied</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <SlidersHorizontalIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground">Click "Optimize Parameters" to run the Grid Search scanner.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeSubTab === "reports" && (
              <div className="max-h-72 overflow-y-auto pr-1">
                {savedReports.length > 0 ? (
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase font-bold">
                        <th className="py-2">Date</th>
                        <th className="py-2">Ticker</th>
                        <th className="py-2">Strategy</th>
                        <th className="py-2 text-right">Return</th>
                        <th className="py-2 text-right">Win Rate</th>
                        <th className="py-2 text-right">Total Trades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedReports.map((report) => (
                        <tr
                          key={report.id}
                          className="border-b border-border/30 hover:bg-muted/10 cursor-pointer"
                          onClick={() => {
                            setBacktestResult({
                              initialCapital: report.metrics.initialCapital || 1000000000000,
                              finalCapital: report.metrics.finalCapital,
                              totalReturnPercent: report.metrics.totalReturnPercent,
                              winRatePercent: report.metrics.winRatePercent,
                              maxDrawdownPercent: report.metrics.maxDrawdownPercent || 0,
                              sharpeRatio: report.metrics.sharpeRatio || 0,
                              totalTrades: report.metrics.totalTrades,
                              winningTrades: 0,
                              losingTrades: 0,
                              trades: report.trades || [],
                              equityCurve: report.equityCurve || [],
                            });
                            setAiInsights(report.aiInsights);
                            setActiveSubTab("chart");
                            toast.info(`Loaded report #${report.id} for ${report.symbol}`);
                          }}
                        >
                          <td className="py-2 text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</td>
                          <td className="py-2 font-mono font-bold uppercase">{report.symbol}</td>
                          <td className="py-2 capitalize">{report.strategy}</td>
                          <td className={`py-2 text-right font-mono font-bold ${report.metrics.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {report.metrics.totalReturnPercent >= 0 ? "+" : ""}
                            {Number(report.metrics.totalReturnPercent).toFixed(1)}%
                          </td>
                          <td className="py-2 text-right font-mono">{Number(report.metrics.winRatePercent).toFixed(1)}%</td>
                          <td className="py-2 text-right font-mono">{report.metrics.totalTrades}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <HistoryIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">No saved backtest logs found.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Side: AI Insights Recommendations */}
          {aiInsights && (
            <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-5 shadow-md space-y-3">
              <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <SparklesIcon className="h-4 w-4 text-indigo-400 animate-pulse" />
                <h3 className="text-xs font-bold text-foreground">AI Advisor Insights (Gemini)</h3>
              </div>
              <MarkdownPreview content={aiInsights} />
            </div>
          )}
        </div>
      </div>

      {/* Extracted Confirmation Optimization Dialog */}
      <OptimizationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmModal({ isOpen: false, parameters: {}, isGlobal: false, activeTab: "data" });
          }
        }}
        activeTab={confirmModal.activeTab}
        onTabChange={handleTabChange}
        parameters={confirmModal.parameters}
        metrics={confirmModal.metrics}
        isGlobal={confirmModal.isGlobal}
        strategy={watch("strategy")}
        optimizationBaseline={optimizationBaseline}
        aiAlternative={getAiAlternativeMutation.data || null}
        isLoadingAiAlternative={getAiAlternativeMutation.isPending}
        getParameterChangeDesc={getParameterChangeDesc}
        beforeThresholdValue={(k) => (confirmModal.isGlobal ? dbScoringRules.find((r) => r.strategy === watch("strategy") && r.parameterName === k)?.value ?? "N/A" : watch(k as any))}
        beforeWeightValue={(paramName) => dbScoringRules.find((r) => r.strategy === watch("strategy") && r.parameterName === paramName)?.weight ?? "N/A"}
        onConfirmApply={handleConfirmApply}
        onApplyAiAlternative={handleApplyAiAlternative}
      />
    </div>
  );
}

export default BacktestPage;
