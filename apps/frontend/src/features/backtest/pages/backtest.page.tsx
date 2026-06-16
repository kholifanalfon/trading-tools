import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MarkdownPreview } from "@/shared/components/ui/markdown-preview";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { settingsKeys } from "@/features/settings/settings.keys";
import { getScoringRulesApi, updateScoringRulesApi } from "@/features/settings/services/settings.api";
import {
  PlayIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  LineChartIcon,
  SparklesIcon,
  HistoryIcon,
  GlobeIcon,
} from "lucide-react";
import {
  runBacktestApi,
  runOptimizationApi,
  runMultiStockOptimizationApi,
  getBacktestReportsApi,
  getAiAlternativeApi,
  RunBacktestPayload,
  BacktestResult,
  OptimizationGridItem,
  SavedReport,
  OptimizationBaseline,
  AiAlternativeResponse,
} from "../services/backtest.api";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { useGetStocks } from "@/features/stocks/hooks/use-get-stocks";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export function BacktestPage() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"chart" | "trades" | "optimize" | "reports">("chart");
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [optimizationGrid, setOptimizationGrid] = useState<OptimizationGridItem[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
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

  const [aiAlternative, setAiAlternative] = useState<AiAlternativeResponse | null>(null);
  const [isLoadingAiAlternative, setIsLoadingAiAlternative] = useState(false);

  const openConfirmModal = (parameters: Record<string, number>, metrics: any, isGlobal: boolean) => {
    setConfirmModal({
      isOpen: true,
      parameters,
      metrics,
      isGlobal,
      activeTab: "data",
    });
    setAiAlternative(null);
  };

  const handleTabChange = (tab: "data" | "ai") => {
    setConfirmModal((prev) => ({ ...prev, activeTab: tab }));
    if (tab === "ai" && !aiAlternative && !isLoadingAiAlternative) {
      fetchAiAlternative(confirmModal.parameters, confirmModal.metrics);
    }
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

  const fetchAiAlternative = async (
    targetParams: Record<string, number>,
    targetMetrics: any
  ) => {
    setIsLoadingAiAlternative(true);
    setAiAlternative(null);
    try {
      const strategy = watch("strategy");
      
      const beforeParams: Record<string, number> = {};
      const beforeMetrics: Record<string, number> = {
        totalReturnPercent: optimizationBaseline?.totalReturnPercent ?? 0,
        winRatePercent: optimizationBaseline?.winRatePercent ?? 0,
        maxDrawdownPercent: optimizationBaseline?.maxDrawdownPercent ?? 0,
        totalTrades: optimizationBaseline?.totalTrades ?? 0,
      };

      const paramKeys = Object.keys(targetParams).filter((k) => !k.startsWith("_weight:"));
      paramKeys.forEach((k) => {
        beforeParams[k] = watch(k as any);
      });

      Object.keys(targetParams)
        .filter((k) => k.startsWith("_weight:"))
        .forEach((k) => {
          const paramName = k.replace("_weight:", "");
          beforeParams[k] = dbScoringRules.find(
            (r) => r.strategy === strategy && r.parameterName === paramName
          )?.weight ?? 0;
        });

      const res = await getAiAlternativeApi({
        strategy,
        beforeParams,
        beforeMetrics,
        afterParams: targetParams,
        afterMetrics: {
          totalReturnPercent: targetMetrics?.totalReturnPercent ?? 0,
          winRatePercent: targetMetrics?.winRatePercent ?? 0,
          maxDrawdownPercent: targetMetrics?.maxDrawdownPercent ?? 0,
          totalTrades: targetMetrics?.totalTrades ?? 0,
        },
      });
      setAiAlternative(res);
    } catch (err) {
      console.error("Failed to load AI alternative suggestion:", err);
      toast.error("Failed to load AI alternative suggestion.");
    } finally {
      setIsLoadingAiAlternative(false);
    }
  };

  const loadDbScoringRules = async () => {
    try {
      const data = await getScoringRulesApi();
      setDbScoringRules(data);
    } catch (err) {
      console.error("Failed to load DB scoring rules:", err);
    }
  };
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeLogs, setOptimizeLogs] = useState<string[]>([]);

  useWebSocket(["backtest", "optimize-log"], (data) => {
    if (data && data.message) {
      setOptimizeLogs((prev) => [...prev.slice(-40), data.message]);
    }
  });

  const { data: watchlistedStocks } = useGetStocks({ page: 1, limit: 100, watchlist: true });

  const { register, handleSubmit, setValue, watch } = useForm<RunBacktestPayload>({
    defaultValues: {
      symbol: "BBRI.JK",
      strategy: "day",
      buyThreshold: 70,
      sellThreshold: 30,
      stopLossPercent: -2.0,
      takeProfitPercent: 6.0,
    },
  });

  const loadReports = async () => {
    try {
      const data = await getBacktestReportsApi();
      setSavedReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  useEffect(() => {
    loadReports();
    loadDbScoringRules();
  }, []);

  useEffect(() => {
    if (watchlistedStocks?.items && watchlistedStocks.items.length > 0) {
      setValue("symbol", watchlistedStocks.items[0].symbol);
    }
  }, [watchlistedStocks, setValue]);

  const onRunSimulation = async (data: RunBacktestPayload) => {
    setIsSimulating(true);
    setBacktestResult(null);
    setAiInsights("");
    try {
      const response = await runBacktestApi({
        ...data,
        symbol: data.symbol.toUpperCase(),
        buyThreshold: Number(data.buyThreshold),
        sellThreshold: Number(data.sellThreshold),
        stopLossPercent: Number(data.stopLossPercent),
        takeProfitPercent: Number(data.takeProfitPercent),
      });
      setBacktestResult(response.result);
      setAiInsights(response.aiInsights);
      toast.success("Simulation finished successfully!");
      loadReports();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to run simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  const onOptimizeParameters = async () => {
    setIsOptimizing(true);
    setOptimizationGrid([]);
    setOptimizedStocks([]);
    setOptimizationType("single");
    setOptimizeLogs([]);
    setOptimizationBaseline(null);
    setActiveSubTab("optimize");
    const values = watch();
    try {
      const response = await runOptimizationApi({
        ...values,
        symbol: values.symbol.toUpperCase(),
        buyThreshold: Number(values.buyThreshold),
        sellThreshold: Number(values.sellThreshold),
        stopLossPercent: Number(values.stopLossPercent),
        takeProfitPercent: Number(values.takeProfitPercent),
      });
      setOptimizationGrid(response.grid);
      setOptimizationBaseline(response.baseline);
      toast.success("Optimization search completed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to run strategy optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  const onOptimizeGlobally = async () => {
    setIsOptimizing(true);
    setOptimizationGrid([]);
    setOptimizedStocks([]);
    setOptimizationType("global");
    setOptimizeLogs([]);
    setOptimizationBaseline(null);
    setActiveSubTab("optimize");
    const values = watch();
    try {
      const response = await runMultiStockOptimizationApi({
        strategy: values.strategy,
        buyThreshold: Number(values.buyThreshold),
        sellThreshold: Number(values.sellThreshold),
        stopLossPercent: Number(values.stopLossPercent),
        takeProfitPercent: Number(values.takeProfitPercent),
      });
      setOptimizationGrid(response.grid);
      setOptimizedStocks(response.symbols);
      setOptimizationBaseline(response.baseline);
      toast.success(`Global multi-stock optimization completed for: ${response.symbols.join(", ")}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to run global strategy optimization");
    } finally {
      setIsOptimizing(false);
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

  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000_000) return `Rp ${(val / 1_000_000_000_000).toFixed(2)} T`;
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(2)} B`;
    return `Rp ${val.toLocaleString()}`;
  };

  const formattedChartData = backtestResult?.equityCurve?.map((c) => ({
    ...c,
    date: new Date(c.date).toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
    Strategy: Number((c.capital / backtestResult.initialCapital * 100).toFixed(1)),
    Benchmark: Number((c.benchmark / backtestResult.initialCapital * 100).toFixed(1)),
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Backtesting & Optimization</h1>
        <p className="text-sm text-muted-foreground">
          Simulate trading strategies on historical candles, discover optimized parameters, and read AI insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Parameters Settings Panel */}
        <div className="lg:col-span-1 bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-5 shadow-md space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <SlidersHorizontalIcon className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Strategy Parameters</h2>
          </div>

          <form onSubmit={handleSubmit(onRunSimulation)} className="space-y-4">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">Ticker Symbol</FieldLabel>
              <select
                className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 text-foreground font-mono"
                {...register("symbol")}
              >
                {watchlistedStocks?.items && watchlistedStocks.items.length > 0 ? (
                  watchlistedStocks.items.map((stock) => (
                    <option key={stock.id} value={stock.symbol}>
                      {stock.symbol.toUpperCase()} - {stock.name}
                    </option>
                  ))
                ) : (
                  <option value="BBRI.JK">BBRI.JK (Default - No watchlisted stocks)</option>
                )}
              </select>
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">Scoring Strategy</FieldLabel>
              <select
                className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 text-foreground"
                {...register("strategy")}
              >
                <option value="day">Day Trading (RVOL, ATR, Gap, RSI)</option>
                <option value="swing">Swing Trading (EMAs, MACD, RSI, Vol)</option>
                <option value="position">Position Trading (SMAs, 52W High, 1Y Return)</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-semibold text-muted-foreground">Buy Threshold Score</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="text-xs h-9 bg-background/50 border-border/70 text-foreground font-mono"
                  {...register("buyThreshold", { valueAsNumber: true })}
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-semibold text-muted-foreground">Sell Threshold Score</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="text-xs h-9 bg-background/50 border-border/70 text-foreground font-mono"
                  {...register("sellThreshold", { valueAsNumber: true })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-semibold text-muted-foreground">Stop Loss %</FieldLabel>
                <Input
                  type="number"
                  step="0.1"
                  max={0}
                  className="text-xs h-9 bg-background/50 border-border/70 text-foreground font-mono text-destructive"
                  {...register("stopLossPercent", { valueAsNumber: true })}
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-semibold text-muted-foreground">Take Profit %</FieldLabel>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  className="text-xs h-9 bg-background/50 border-border/70 text-foreground font-mono text-emerald-400"
                  {...register("takeProfitPercent", { valueAsNumber: true })}
                />
              </Field>
            </div>

            <div className="pt-2 space-y-2.5">
              <Button
                type="submit"
                disabled={isSimulating || isOptimizing}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                <PlayIcon className="h-3.5 w-3.5 fill-current" />
                {isSimulating ? "Simulating..." : "Run Backtest"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onOptimizeParameters}
                disabled={isSimulating || isOptimizing}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-bold border-indigo-500/35 hover:bg-indigo-500/10 text-indigo-400 transition"
              >
                <TrendingUpIcon className="h-3.5 w-3.5" />
                {isOptimizing && optimizationType === "single" ? "Optimizing Grid..." : "Optimize Parameters"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onOptimizeGlobally}
                disabled={isSimulating || isOptimizing}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-bold border-emerald-500/35 hover:bg-emerald-500/10 text-emerald-400 transition"
              >
                <GlobeIcon className="h-3.5 w-3.5" />
                {isOptimizing && optimizationType === "global" ? "Optimizing Global Grid..." : "Optimize Globally (Multi-Stock)"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Charts & Analysis Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulation metrics cards */}
          {backtestResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card/45 border border-border/80 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-muted-foreground">Total Return</p>
                <p className={`text-lg font-extrabold mt-1 ${backtestResult.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                  {backtestResult.totalReturnPercent >= 0 ? "+" : ""}
                  {backtestResult.totalReturnPercent.toFixed(2)}%
                </p>
              </div>
              <div className="bg-card/45 border border-border/80 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-muted-foreground">Win Rate</p>
                <p className="text-lg font-extrabold text-foreground mt-1">
                  {backtestResult.winRatePercent.toFixed(1)}%
                </p>
              </div>
              <div className="bg-card/45 border border-border/80 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-muted-foreground">Max Drawdown</p>
                <p className="text-lg font-extrabold text-destructive mt-1">
                  -{backtestResult.maxDrawdownPercent.toFixed(1)}%
                </p>
              </div>
              <div className="bg-card/45 border border-border/80 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-muted-foreground">Final Capital</p>
                <p className="text-xs font-bold text-foreground mt-2 truncate">
                  {formatIDR(backtestResult.finalCapital)}
                </p>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex bg-card/60 border border-border/80 rounded-lg p-1 max-w-sm">
            <button
              onClick={() => setActiveSubTab("chart")}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition ${
                activeSubTab === "chart" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LineChartIcon className="h-3 w-3" />
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
            {/* Tab Content: Equity Curve */}
            {activeSubTab === "chart" && (
              <div className="h-72 w-full flex items-center justify-center">
                {backtestResult ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="date" stroke="#888888" fontSize={9} />
                      <YAxis stroke="#888888" fontSize={9} tickFormatter={(val) => `${val}%`} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", fontSize: 10 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Strategy" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Benchmark" stroke="#888888" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center space-y-2">
                    <LineChartIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">Run a backtest simulation to view the equity performance curve.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Trades Log */}
            {activeSubTab === "trades" && (
              <div className="max-h-72 overflow-y-auto pr-1">
                {backtestResult && backtestResult.trades.length > 0 ? (
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase font-bold">
                        <th className="py-2">No</th>
                        <th className="py-2">Entry</th>
                        <th className="py-2">Exit</th>
                        <th className="py-2">Holding</th>
                        <th className="py-2 text-right">Profit (%)</th>
                        <th className="py-2 text-right">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResult.trades.map((t) => (
                        <tr key={t.id} className="border-b border-border/30 hover:bg-muted/10">
                          <td className="py-2 font-mono">{t.id}</td>
                          <td className="py-2">
                            {new Date(t.entryDate).toLocaleDateString()}
                            <span className="block text-[8px] text-muted-foreground font-mono">@{t.entryPrice.toLocaleString()}</span>
                          </td>
                          <td className="py-2">
                            {new Date(t.exitDate).toLocaleDateString()}
                            <span className="block text-[8px] text-muted-foreground font-mono">@{t.exitPrice.toLocaleString()}</span>
                          </td>
                          <td className="py-2 font-mono">{t.holdingDays} days</td>
                          <td className={`py-2 text-right font-bold font-mono ${t.profitPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {t.profitPercent >= 0 ? "+" : ""}
                            {t.profitPercent.toFixed(1)}%
                          </td>
                          <td className="py-2 text-right text-muted-foreground capitalize">{t.exitReason.replace(/_/g, " ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <HistoryIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">No completed trades to display.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Optimizations */}
            {activeSubTab === "optimize" && (
              <div className="space-y-3">
                {isOptimizing ? (
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

            {/* Tab Content: Saved Reports History */}
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
                        <tr key={report.id} className="border-b border-border/30 hover:bg-muted/10 cursor-pointer" onClick={() => {
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
                        }}>
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

      {/* Before / After Confirmation Dialog Overlay */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmModal({ isOpen: false, parameters: {}, isGlobal: false, activeTab: "data" });
          }
        }}
      >
        <DialogContent className="max-w-3xl p-6 gap-5 bg-card/95 border border-border/80 text-foreground">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${confirmModal.isGlobal ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                  <SlidersHorizontalIcon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Confirm {confirmModal.isGlobal ? "Global" : "Local"} Parameter Changes
                </h3>
              </div>

              {/* TABS SELECTOR (DATA vs AI) */}
              <div className="flex bg-muted/40 border border-border/55 rounded-lg p-0.5 max-w-xs mr-6">
                <button
                  type="button"
                  onClick={() => handleTabChange("data")}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition ${
                    confirmModal.activeTab === "data" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontalIcon className="h-3 w-3" />
                  Grid Best (Data)
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("ai")}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition ${
                    confirmModal.activeTab === "ai" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <SparklesIcon className="h-3 w-3 animate-pulse text-yellow-400" />
                  AI Suggestion
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {confirmModal.isGlobal
                ? "Are you sure you want to apply these parameters globally to the database? This will update scoring rules affecting the live stock list and all future screenings."
                : "Are you sure you want to apply these parameters to your current backtesting form fields?"}
            </p>

            {/* TAB CONTENT: DATA VERSION */}
            {confirmModal.activeTab === "data" && (
              <div className="space-y-4">
                {/* Performance Comparison Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUpIcon className="h-3.5 w-3.5 text-indigo-400" />
                    Expected Performance Summary
                  </h4>
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-background/30">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                          <th className="px-3 py-2">Metric</th>
                          <th className="px-3 py-2 text-right">Before</th>
                          <th className="px-3 py-2 text-right">After (Optimized Grid)</th>
                          <th className="px-3 py-2 text-right">Improvement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {/* Return % */}
                        <tr className="hover:bg-muted/10 transition-colors">
                          <td className="px-3 py-2 font-medium text-muted-foreground">Total Return</td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                            {optimizationBaseline ? `${optimizationBaseline.totalReturnPercent >= 0 ? "+" : ""}${optimizationBaseline.totalReturnPercent.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${confirmModal.metrics && confirmModal.metrics.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {confirmModal.metrics ? `${confirmModal.metrics.totalReturnPercent >= 0 ? "+" : ""}${confirmModal.metrics.totalReturnPercent.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">
                            {optimizationBaseline && confirmModal.metrics ? (
                              <span>
                                {(confirmModal.metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent) >= 0 ? "▲ +" : "▼ "}
                                {(confirmModal.metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent).toFixed(1)}%
                              </span>
                            ) : "N/A"}
                          </td>
                        </tr>
                        {/* Win Rate */}
                        <tr className="hover:bg-muted/10 transition-colors">
                          <td className="px-3 py-2 font-medium text-muted-foreground">Win Rate</td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                            {optimizationBaseline ? `${optimizationBaseline.winRatePercent.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                            {confirmModal.metrics ? `${confirmModal.metrics.winRatePercent.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && confirmModal.metrics && (confirmModal.metrics.winRatePercent - optimizationBaseline.winRatePercent) >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {optimizationBaseline && confirmModal.metrics ? (
                              <span>
                                {(confirmModal.metrics.winRatePercent - optimizationBaseline.winRatePercent) >= 0 ? "▲ +" : "▼ "}
                                {(confirmModal.metrics.winRatePercent - optimizationBaseline.winRatePercent).toFixed(1)}%
                              </span>
                            ) : "N/A"}
                          </td>
                        </tr>
                        {/* Max Drawdown */}
                        <tr className="hover:bg-muted/10 transition-colors">
                          <td className="px-3 py-2 font-medium text-muted-foreground">Max Drawdown</td>
                          <td className="px-3 py-2 text-right font-mono text-destructive">
                            {optimizationBaseline ? `-${optimizationBaseline.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-destructive">
                            {confirmModal.metrics ? `-${confirmModal.metrics.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && confirmModal.metrics && (confirmModal.metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent) <= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {optimizationBaseline && confirmModal.metrics ? (
                              <span>
                                {(confirmModal.metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent) <= 0 ? "▲ -" : "▼ +"}
                                {Math.abs(confirmModal.metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent).toFixed(1)}%
                              </span>
                            ) : "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Parameter Threshold Adjustments Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                    Parameter Threshold Adjustments
                  </h4>
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-background/30">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                          <th className="px-3 py-2">Parameter</th>
                          <th className="px-3 py-2 text-right">Before</th>
                          <th className="px-3 py-2 text-right">After</th>
                          <th className="px-3 py-2">Keterangan Perubahan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {Object.entries(confirmModal.parameters)
                          .filter(([k]) => !k.startsWith("_weight:"))
                          .map(([k, v]) => {
                            const strategy = watch("strategy");
                            const beforeValue = confirmModal.isGlobal
                              ? dbScoringRules.find((r) => r.strategy === strategy && r.parameterName === k)?.value ?? "N/A"
                              : watch(k as any);
                            
                            const hasChanged = beforeValue !== v;

                            return (
                              <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                                <td className="px-3 py-2 font-medium capitalize text-muted-foreground">
                                  {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                  {beforeValue}
                                </td>
                                <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-emerald-400" : "text-muted-foreground"}`}>
                                  {v}
                                </td>
                                <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">
                                  {getParameterChangeDesc(k, beforeValue as number, v)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Indicator Weights adjustments Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                    Indicator Weights Adjustments
                  </h4>
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-background/30">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                          <th className="px-3 py-2">Indicator Rule</th>
                          <th className="px-3 py-2 text-right">Before</th>
                          <th className="px-3 py-2 text-right">After</th>
                          <th className="px-3 py-2">Keterangan Perubahan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {Object.entries(confirmModal.parameters)
                          .filter(([k]) => k.startsWith("_weight:"))
                          .map(([k, v]) => {
                            const paramName = k.replace("_weight:", "");
                            const strategy = watch("strategy");
                            const beforeWeight = dbScoringRules.find(
                              (r) => r.strategy === strategy && r.parameterName === paramName
                            )?.weight ?? "N/A";
                            
                            const hasChanged = beforeWeight !== v;

                            return (
                              <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                                <td className="px-3 py-2 font-medium capitalize text-muted-foreground">
                                  {paramName.replace(/_/g, " ").toLowerCase()}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                  {beforeWeight}
                                </td>
                                <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-emerald-400" : "text-muted-foreground"}`}>
                                  {v}
                                </td>
                                <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">
                                  {getParameterChangeDesc(k, beforeWeight as number, v)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI SUGGESTION VERSION */}
            {confirmModal.activeTab === "ai" && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-foreground">AI Proposed Setting Suggestion (Gemini)</h4>
                </div>

                {isLoadingAiAlternative ? (
                  <div className="p-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-3 animate-pulse flex flex-col justify-center items-center h-48">
                    <SparklesIcon className="h-6 w-6 text-indigo-400 animate-bounce" />
                    <div className="h-3 w-1/3 bg-indigo-500/20 rounded"></div>
                    <div className="h-3 w-1/2 bg-indigo-500/10 rounded"></div>
                  </div>
                ) : aiAlternative ? (
                  <div className="space-y-4">
                    {/* AI Performance Comparison Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <TrendingUpIcon className="h-3.5 w-3.5 text-indigo-400" />
                        Expected Performance Summary (AI Suggestion)
                      </h4>
                      <div className="rounded-lg border border-border/60 overflow-hidden bg-background/30">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                              <th className="px-3 py-2">Metric</th>
                              <th className="px-3 py-2 text-right">Before</th>
                              <th className="px-3 py-2 text-right">After (AI Suggested)</th>
                              <th className="px-3 py-2 text-right">Improvement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {/* Return % */}
                            <tr className="hover:bg-muted/10 transition-colors">
                              <td className="px-3 py-2 font-medium text-muted-foreground">Total Return</td>
                              <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                {optimizationBaseline ? `${optimizationBaseline.totalReturnPercent >= 0 ? "+" : ""}${optimizationBaseline.totalReturnPercent.toFixed(1)}%` : "N/A"}
                              </td>
                              <td className={`px-3 py-2 text-right font-mono font-bold ${aiAlternative.alternativeMetrics && aiAlternative.alternativeMetrics.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                                {aiAlternative.alternativeMetrics ? `${aiAlternative.alternativeMetrics.totalReturnPercent >= 0 ? "+" : ""}${aiAlternative.alternativeMetrics.totalReturnPercent.toFixed(1)}%` : "N/A"}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">
                                {optimizationBaseline && aiAlternative.alternativeMetrics ? (
                                  <span>
                                    {(aiAlternative.alternativeMetrics.totalReturnPercent - optimizationBaseline.totalReturnPercent) >= 0 ? "▲ +" : "▼ "}
                                    {(aiAlternative.alternativeMetrics.totalReturnPercent - optimizationBaseline.totalReturnPercent).toFixed(1)}%
                                  </span>
                                ) : "N/A"}
                              </td>
                            </tr>
                            {/* Win Rate */}
                            <tr className="hover:bg-muted/10 transition-colors">
                              <td className="px-3 py-2 font-medium text-muted-foreground">Win Rate</td>
                              <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                {optimizationBaseline ? `${optimizationBaseline.winRatePercent.toFixed(1)}%` : "N/A"}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                                {aiAlternative.alternativeMetrics ? `${aiAlternative.alternativeMetrics.winRatePercent.toFixed(1)}%` : "N/A"}
                              </td>
                              <td className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && aiAlternative.alternativeMetrics && (aiAlternative.alternativeMetrics.winRatePercent - optimizationBaseline.winRatePercent) >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                                {optimizationBaseline && aiAlternative.alternativeMetrics ? (
                                  <span>
                                    {(aiAlternative.alternativeMetrics.winRatePercent - optimizationBaseline.winRatePercent) >= 0 ? "▲ +" : "▼ "}
                                    {(aiAlternative.alternativeMetrics.winRatePercent - optimizationBaseline.winRatePercent).toFixed(1)}%
                                  </span>
                                ) : "N/A"}
                              </td>
                            </tr>
                            {/* Max Drawdown */}
                            <tr className="hover:bg-muted/10 transition-colors">
                              <td className="px-3 py-2 font-medium text-muted-foreground">Max Drawdown</td>
                              <td className="px-3 py-2 text-right font-mono text-destructive">
                                {optimizationBaseline ? `-${optimizationBaseline.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-destructive">
                                {aiAlternative.alternativeMetrics ? `-${aiAlternative.alternativeMetrics.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                              </td>
                              <td className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && aiAlternative.alternativeMetrics && (aiAlternative.alternativeMetrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent) <= 0 ? "text-emerald-400" : "text-destructive"}`}>
                                {optimizationBaseline && aiAlternative.alternativeMetrics ? (
                                  <span>
                                    {(aiAlternative.alternativeMetrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent) <= 0 ? "▲ -" : "▼ +"}
                                    {Math.abs(aiAlternative.alternativeMetrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent).toFixed(1)}%
                                  </span>
                                ) : "N/A"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Parameter Threshold Adjustments (AI Suggestion) */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                        Parameter Threshold Adjustments (AI Suggestion)
                      </h4>
                      <div className="rounded-lg border border-border/60 overflow-hidden bg-background/30">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                              <th className="px-3 py-2">Parameter</th>
                              <th className="px-3 py-2 text-right">Before</th>
                              <th className="px-3 py-2 text-right">AI Suggested</th>
                              <th className="px-3 py-2">AI Reason (Alasan Perubahan)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {Object.keys(confirmModal.parameters)
                              .filter((k) => !k.startsWith("_weight:"))
                              .map((k) => {
                                const strategy = watch("strategy");
                                const beforeValue = confirmModal.isGlobal
                                  ? dbScoringRules.find((r) => r.strategy === strategy && r.parameterName === k)?.value ?? "N/A"
                                  : watch(k as any);
                                
                                const aiItem = aiAlternative?.alternativeParams?.[k];
                                const aiVal = aiItem !== undefined ? aiItem.value : beforeValue;
                                const hasChanged = beforeValue !== aiVal;
                                const aiReason = hasChanged 
                                  ? (aiItem?.reason || "Disesuaikan oleh AI.") 
                                  : "Tidak ada perubahan.";

                                return (
                                  <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                                    <td className="px-3 py-2 font-medium capitalize text-muted-foreground">
                                      {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                      {beforeValue}
                                    </td>
                                    <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-indigo-400" : "text-muted-foreground"}`}>
                                      {aiVal}
                                    </td>
                                    <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">
                                      {aiReason}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Indicator Weights Adjustments (AI Suggestion) */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                        Indicator Weights Adjustments (AI Suggestion)
                      </h4>
                      <div className="rounded-lg border border-border/60 overflow-hidden bg-background/30">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                              <th className="px-3 py-2">Indicator Rule</th>
                              <th className="px-3 py-2 text-right">Before</th>
                              <th className="px-3 py-2 text-right">AI Suggested</th>
                              <th className="px-3 py-2">AI Reason (Alasan Perubahan)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {Object.keys(confirmModal.parameters)
                              .filter((k) => k.startsWith("_weight:"))
                              .map((k) => {
                                const paramName = k.replace("_weight:", "");
                                const strategy = watch("strategy");
                                const beforeWeight = dbScoringRules.find(
                                  (r) => r.strategy === strategy && r.parameterName === paramName
                                )?.weight ?? "N/A";
                                
                                const aiItem = aiAlternative?.alternativeParams?.[k];
                                const aiVal = aiItem !== undefined ? aiItem.value : beforeWeight;
                                const hasChanged = beforeWeight !== aiVal;
                                const aiReason = hasChanged 
                                  ? (aiItem?.reason || "Disesuaikan oleh AI.") 
                                  : "Tidak ada perubahan.";

                                return (
                                  <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                                    <td className="px-3 py-2 font-medium capitalize text-muted-foreground">
                                      {paramName.replace(/_/g, " ").toLowerCase()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                      {beforeWeight}
                                    </td>
                                    <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-indigo-400" : "text-muted-foreground"}`}>
                                      {aiVal}
                                    </td>
                                    <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">
                                      {aiReason}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-lg border border-border/60 bg-background/20">
                    <p className="text-xs text-muted-foreground">AI suggestion could not be generated. Please try again.</p>
                  </div>
                )}
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs px-4"
                onClick={() => setConfirmModal({ isOpen: false, parameters: {}, isGlobal: false, activeTab: "data" })}
              >
                Cancel
              </Button>
              {confirmModal.activeTab === "ai" && aiAlternative ? (
                <Button
                  size="sm"
                  className="h-8 text-xs px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5"
                  onClick={handleApplyAiAlternative}
                >
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Apply AI Alternative
                </Button>
              ) : (
                <Button
                  size="sm"
                  className={`h-8 text-xs px-4 text-white font-bold ${
                    confirmModal.isGlobal
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                  onClick={handleConfirmApply}
                >
                  Confirm & Apply Grid Best
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BacktestPage;
