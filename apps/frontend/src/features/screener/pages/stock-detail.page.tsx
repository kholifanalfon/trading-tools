import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useGetStockHistoricalData } from "../hooks/use-get-stock-detail";
import { useGetQuote } from "../hooks/use-get-quote";
import { useGetSettings } from "@/features/settings/hooks/use-get-settings";
import { ChevronLeftIcon, ActivityIcon, DollarSignIcon, TrendingUpIcon, TrendingDownIcon, MoveRightIcon, SparklesIcon, CalculatorIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { StrategyScoreCard } from "../components/strategy-score-card";
import { StockChartCanvas } from "../components/stock-chart-canvas";
import { AiAnalysisCard } from "../components/ai-analysis-card";
import { useGetAiAnalysis, useRefreshAiAnalysis } from "../hooks/use-ai-analysis";
import { useGetCorporateActions } from "../hooks/use-get-corporate-actions";
import { PositionSizingCalculator } from "../components/position-sizing-calculator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useGetPortfolios } from "@/features/portfolio/hooks/use-get-portfolios";
import { useAddTransaction } from "@/features/portfolio/hooks/use-add-transaction";
import { useGetPortfolioAssetSummary } from "@/features/portfolio/hooks/use-get-portfolio-asset-summary";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
function formatRupiahInput(value: string): string {
  if (!value) return "";
  const clean = value.replace(/[^0-9.,]/g, "");
  if (!clean) return "";
  const standard = clean.replace(/,/g, ".");
  const parts = standard.split(".");
  const integerPart = parts[0].replace(/\D/g, "");
  const formattedInteger = integerPart ? Number(integerPart).toLocaleString("id-ID") : "";
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, "").slice(0, 2);
    return `${formattedInteger},${decimalPart}`;
  }
  if (clean.endsWith(",") || clean.endsWith(".")) {
    return `${formattedInteger},`;
  }
  return formattedInteger;
}

function parseRupiahInput(value: string): string {
  if (!value) return "";
  const noDots = value.replace(/\./g, "");
  const standardDecimals = noDots.replace(/,/g, ".");
  return standardDecimals;
}

export function StockDetailPage() {
  const { symbol = "" } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlStrategy = searchParams.get("strategy");
  const { data: settings } = useGetSettings();

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Transaction dialog states
  const { data: portfolios } = useGetPortfolios();
  const addTransactionMutation = useAddTransaction();
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [txType, setTxType] = useState<"BUY" | "SELL">("BUY");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | "">("");
  const [txQty, setTxQty] = useState("");
  const [txPrice, setTxPrice] = useState("");
  const [txFee, setTxFee] = useState("0");
  const [txTakeProfit, setTxTakeProfit] = useState("");
  const [txStopLoss, setTxStopLoss] = useState("");
  const [txNotes, setTxNotes] = useState("");

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPortfolioId) {
      toast.error("Please select a portfolio");
      return;
    }
    if (!txQty || Number(txQty) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (!txPrice || Number(txPrice) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      await addTransactionMutation.mutateAsync({
        portfolioId: Number(selectedPortfolioId),
        data: {
          type: txType,
          symbol: symbol.toUpperCase(),
          quantity: (Number(txQty) * 100).toString(),
          price: txPrice,
          fee: txFee || "0",
          takeProfit: txType === "BUY" && txTakeProfit ? txTakeProfit : null,
          stopLoss: txType === "BUY" && txStopLoss ? txStopLoss : null,
          notes: txNotes || null,
        },
      });
      toast.success(`${txType} transaction recorded successfully!`);
      setIsTxOpen(false);
      refetchSummary();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record transaction");
      console.error(err);
    }
  };

  // Google Stock style timeframes
  // 1D: 1 day, 5D: 5 days, 1M: ~22 trading days, 6M: ~130 trading days,
  // YTD: from Jan 1st of current year, 1Y: ~252 trading days, 5Y: ~1260 trading days, MAX: 5000 days
  const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX">("1M");
  const [activeScoreTab, setActiveScoreTab] = useState<"day" | "swing" | "position">("day");
  const [activeMainTab, setActiveMainTab] = useState<"technical" | "corporate" | "portfolio">("technical");

  useEffect(() => {
    if (urlStrategy === "day" || urlStrategy === "swing" || urlStrategy === "position") {
      setActiveScoreTab(urlStrategy);
    } else if (settings?.default_strategy) {
      setActiveScoreTab(settings.default_strategy as any);
    }
  }, [urlStrategy, settings]);

  const getLimitFromTimeframe = () => {
    switch (timeframe) {
      case "1D":
        return 1;
      case "5D":
        return 5;
      case "1M":
        return 22;
      case "6M":
        return 130;
      case "YTD":
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const diffTime = Math.abs(new Date().getTime() - startOfYear.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Approximate trading days since start of year (roughly 5/7th of calendar days)
        return Math.max(1, Math.round((diffDays * 5) / 7));
      case "1Y":
        return 252;
      case "5Y":
        return 1260;
      case "MAX":
        return 5000;
      default:
        return 50;
    }
  };

  const currentLimit = getLimitFromTimeframe();

  // EMA individual checkbox toggles
  const [showEma9, setShowEma9] = useState(true);
  const [showEma21, setShowEma21] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showEma200, setShowEma200] = useState(true);

  // Indicator visibility toggles
  const [showRsi, setShowRsi] = useState(true);
  const [showMacd, setShowMacd] = useState(true);
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");

  const { data: historicalData = [], isLoading } = useGetStockHistoricalData(symbol, currentLimit, timeframe, activeScoreTab);

  const { data: quote } = useGetQuote(symbol);
  const { data: corpActions, isLoading: isCorpLoading } = useGetCorporateActions(symbol);

  // Fetch specific portfolio asset summary for this stock ticker
  const { data: portfolioSummary, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetPortfolioAssetSummary(symbol);

  // AI Analysis — auto-load if no cached data on first visit
  const { data: aiAnalysis, isLoading: isAiLoading } = useGetAiAnalysis(symbol);
  const { mutate: triggerAiRefresh, isPending: isAiPending } = useRefreshAiAnalysis(symbol);

  useEffect(() => {
    if (!isAiLoading && aiAnalysis === null && symbol) {
      triggerAiRefresh();
    }
  }, [isAiLoading, aiAnalysis, symbol]);

  const isAiProcessing = isAiPending || (isAiLoading && !aiAnalysis);

  // Latest entry (most recent day)
  const latestData = historicalData[historicalData.length - 1] || null;
  const companyName = latestData?.name || symbol;

  // Find the latest point with score payload, or fall back to the latest entry
  const latestDataWithScore = [...historicalData].reverse().find((d) => d.scorePayload) || latestData;

  // Safe parse scorePayload
  let scorePayload: any = null;
  if (latestDataWithScore?.scorePayload) {
    if (typeof latestDataWithScore.scorePayload === "string") {
      try {
        scorePayload = JSON.parse(latestDataWithScore.scorePayload);
      } catch (e) {
        console.error("Failed to parse scorePayload:", e);
      }
    } else {
      scorePayload = latestDataWithScore.scorePayload;
    }
  }

  const handleOpenTx = (type: "BUY" | "SELL") => {
    setTxType(type);
    setTxPrice((quote?.currentPrice || latestData?.close || 0).toString());
    setTxQty("");
    setTxFee("0");

    if (type === "BUY" && scorePayload?.riskValidation) {
      const riskData = scorePayload.riskValidation[activeScoreTab] || scorePayload.riskValidation;
      const tpValue = riskData.targetProfit !== undefined && riskData.targetProfit !== null ? Number(riskData.targetProfit) : NaN;
      const slValue = riskData.stopLoss !== undefined && riskData.stopLoss !== null ? Number(riskData.stopLoss) : NaN;
      setTxTakeProfit(!isNaN(tpValue) ? tpValue.toFixed(2) : "");
      setTxStopLoss(!isNaN(slValue) ? slValue.toFixed(2) : "");
    } else {
      setTxTakeProfit("");
      setTxStopLoss("");
    }

    setTxNotes("");
    if (portfolios && portfolios.length > 0) {
      setSelectedPortfolioId(portfolios[0].id);
    } else {
      setSelectedPortfolioId("");
    }
    setIsTxOpen(true);
  };

  // Retrieve change and percentChange from the quote query
  const priceChange = quote?.change ?? 0;
  const priceChangePercent = quote?.percentChange ?? 0;

  // We've moved the lightweight-charts rendering logic to StockChartCanvas component

  const fromPath = searchParams.get("from");

  return (
    <div className="space-y-6 pb-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(fromPath || location.state?.from || "/screener")} className="h-8 w-8 p-0 rounded-xl">
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{symbol}</span>
              <h1 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{companyName}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Historical performance data & technical indicators analytics</p>
          </div>
        </div>

        {/* Latest Price Summary & Trade Buttons */}
        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
          {quote && (
            <div className="flex w-full items-center gap-4 bg-muted/20 px-4 py-2 rounded-xl border border-border/40">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Latest Close Price</span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-bold font-mono text-foreground">
                    {quote.currentPrice.toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </span>
                  <span className={`text-xs font-bold font-mono ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
                {quote.lastUpdateTime && (
                  <span className="text-[9px] text-muted-foreground font-mono font-medium">
                    ({new Date(quote.lastUpdateTime).toLocaleDateString("id-ID", { month: "short", day: "numeric" })},{" "}
                    {new Date(quote.lastUpdateTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    {quote.delayedMinutes ? ` | delayed ${quote.delayedMinutes}m` : ""})
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-1 w-full items-center gap-2">
            <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4" onClick={() => handleOpenTx("BUY")}>
              BUY
            </Button>
            <Button className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold px-4" onClick={() => handleOpenTx("SELL")}>
              SELL
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs Switcher */}
      <div className="flex border-b border-border/40 gap-6 mb-4">
        <button
          onClick={() => setActiveMainTab("technical")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all duration-200 ${
            activeMainTab === "technical" ? "border-indigo-500 text-indigo-400 font-semibold" : "border-transparent text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          Analisis Teknikal
        </button>
        <button
          onClick={() => setActiveMainTab("corporate")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all duration-200 ${
            activeMainTab === "corporate" ? "border-indigo-500 text-indigo-400 font-semibold" : "border-transparent text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          Aksi Korporasi (Corporate Actions)
        </button>
        <button
          onClick={() => setActiveMainTab("portfolio")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all duration-200 ${
            activeMainTab === "portfolio" ? "border-indigo-500 text-indigo-400 font-semibold" : "border-transparent text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          Portofolio Saya (My Portfolio)
        </button>
      </div>

      {/* Main Grid content (split chart and statistics panels) */}
      {activeMainTab === "technical" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Side: Charts */}
          <div className="lg:col-span-3 space-y-4">
            {/* Chart Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/10 p-2 rounded-xl border border-border/40 shrink-0">
              <div className="text-xs font-semibold px-2 text-muted-foreground flex items-center gap-1.5">
                <ActivityIcon className="h-3.5 w-3.5 text-indigo-400" />
                Technical Analysis Charts
              </div>

              {/* Selector for indicator toggles & range limit */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Individual EMA Checkboxes (styled with line colors) */}
                <div className="flex flex-wrap items-center gap-3 bg-muted/20 px-2.5 py-1 rounded-lg border border-border/20">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-400 select-none">
                    <input
                      type="checkbox"
                      checked={showEma9}
                      onChange={(e) => setShowEma9(e.target.checked)}
                      className="rounded border-border bg-[#09090b] text-blue-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer accent-[#3b82f6]"
                    />
                    EMA 9
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-400 select-none">
                    <input
                      type="checkbox"
                      checked={showEma21}
                      onChange={(e) => setShowEma21(e.target.checked)}
                      className="rounded border-border bg-[#09090b] text-emerald-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer accent-[#10b981]"
                    />
                    EMA 21
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-amber-500 select-none">
                    <input
                      type="checkbox"
                      checked={showEma50}
                      onChange={(e) => setShowEma50(e.target.checked)}
                      className="rounded border-border bg-[#09090b] text-amber-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer accent-[#f59e0b]"
                    />
                    EMA 50
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-red-500 select-none">
                    <input
                      type="checkbox"
                      checked={showEma200}
                      onChange={(e) => setShowEma200(e.target.checked)}
                      className="rounded border-border bg-[#09090b] text-red-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer accent-[#ef4444]"
                    />
                    EMA 200
                  </label>
                </div>

                {/* Indicator Visibility Checkboxes */}
                <div className="flex flex-wrap items-center gap-3 bg-muted/20 px-2.5 py-1 rounded-lg border border-border/20">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-amber-500 select-none">
                    <input
                      type="checkbox"
                      checked={showRsi}
                      onChange={(e) => setShowRsi(e.target.checked)}
                      className="rounded border-border bg-[#09090b] text-amber-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer accent-[#f59e0b]"
                    />
                    RSI
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-pink-400 select-none">
                    <input
                      type="checkbox"
                      checked={showMacd}
                      onChange={(e) => setShowMacd(e.target.checked)}
                      className="rounded border-border bg-[#09090b] text-pink-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer accent-[#ec4899]"
                    />
                    MACD
                  </label>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/30">
                  <Button
                    variant={chartType === "candlestick" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-[10px] md:text-xs px-2.5 font-semibold transition-all duration-200"
                    onClick={() => setChartType("candlestick")}
                  >
                    Candle
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-[10px] md:text-xs px-2.5 font-semibold transition-all duration-200"
                    onClick={() => setChartType("line")}
                  >
                    Line
                  </Button>
                </div>

                {/* Google Stock Timeframe Selector */}
                <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/30 w-full">
                  {(["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"] as const).map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-[10px] md:text-xs px-2 font-semibold transition-all duration-200 flex-1"
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Display Panel */}
            <StockChartCanvas
              historicalData={historicalData}
              isLoading={isLoading}
              timeframe={timeframe}
              showEma9={showEma9}
              showEma21={showEma21}
              showEma50={showEma50}
              showEma200={showEma200}
              showRsi={showRsi}
              showMacd={showMacd}
              chartType={chartType}
            />
            <AiAnalysisCard symbol={symbol} isProcessing={isAiProcessing} />

            {/* Stastistics & Indicators Grid directly below AI Strategic Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-4 gap-y-4 pt-2">
              {/* Technical Indicators Summary */}
              <div className="col-span-2 bg-card/45 border border-border p-4 rounded-xl space-y-3 shadow-sm h-full">
                <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <ActivityIcon className="h-3.5 w-3.5" />
                  Technical Indicators
                </h3>
                {latestData ? (
                  <div className="space-y-3.5 text-xs pr-1">
                    {/* RSI Indicator Summary */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground">RSI (14)</span>
                        <span className="font-bold text-amber-500">{latestData.rsi ? latestData.rsi.toFixed(2) : "-"}</span>
                      </div>
                      {latestData.rsi && (
                        <div className="text-[10px] text-muted-foreground italic">
                          {latestData.rsi >= 70 ? (
                            <span className="text-red-500 font-semibold">Overbought (Sell Signal)</span>
                          ) : latestData.rsi <= 30 ? (
                            <span className="text-green-500 font-semibold">Oversold (Buy Signal)</span>
                          ) : (
                            <span>Neutral Momentum</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* EMAs Alignment */}
                    <div className="space-y-1.5">
                      <span className="text-muted-foreground block">Moving Averages (EMA)</span>
                      <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                        <div className="flex justify-between border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground">EMA 9:</span>
                          <span>{latestData.ema9 ? latestData.ema9.toFixed(2) : "-"}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground">EMA 21:</span>
                          <span>{latestData.ema21 ? latestData.ema21.toFixed(2) : "-"}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground">EMA 50:</span>
                          <span>{latestData.ema50 ? latestData.ema50.toFixed(2) : "-"}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground">EMA 200:</span>
                          <span>{latestData.ema200 ? latestData.ema200.toFixed(2) : "-"}</span>
                        </div>
                      </div>
                      {latestData.ema9 && latestData.ema21 && (
                        <div className="text-[10px] text-muted-foreground italic pt-1">
                          {latestData.ema9 > latestData.ema21 ? (
                            <span className="text-green-500 font-semibold">Bullish Crossover (EMA 9 &gt; 21)</span>
                          ) : (
                            <span className="text-red-500 font-semibold">Bearish Crossover (EMA 9 &lt; 21)</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* MACD Analytics */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground">MACD</span>
                        <span>{latestData.macd ? latestData.macd.toFixed(2) : "-"}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                        <span>Signal Line:</span>
                        <span>{latestData.macdSignal ? latestData.macdSignal.toFixed(2) : "-"}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-muted-foreground border-b border-border/30 pb-1.5">
                        <span>Histogram:</span>
                        <span className={latestData.macdHist >= 0 ? "text-green-500" : "text-red-500"}>{latestData.macdHist ? latestData.macdHist.toFixed(2) : "-"}</span>
                      </div>
                      {latestData.macd && latestData.macdSignal && (
                        <div className="text-[10px] text-muted-foreground italic border-b border-border/30 pb-2">
                          {latestData.macd > latestData.macdSignal ? (
                            <span className="text-green-500 font-semibold">Bullish MACD crossover</span>
                          ) : (
                            <span className="text-red-500 font-semibold">Bearish MACD crossover</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bollinger Bands */}
                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-semibold">Bollinger Bands (20, 2)</span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                        <div className="flex flex-col border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground text-[8px] uppercase">Lower:</span>
                          <span className="font-bold">{latestData.bbLower ? latestData.bbLower.toFixed(2) : "-"}</span>
                        </div>
                        <div className="flex flex-col border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground text-[8px] uppercase">Middle:</span>
                          <span className="font-bold">{latestData.ema21 ? latestData.ema21.toFixed(2) : "-"}</span>
                        </div>
                        <div className="flex flex-col border-b border-border/30 pb-0.5">
                          <span className="text-muted-foreground text-[8px] uppercase">Upper:</span>
                          <span className="font-bold">{latestData.bbUpper ? latestData.bbUpper.toFixed(2) : "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* VWAP */}
                    <div className="flex justify-between font-mono border-b border-border/30 pb-1.5">
                      <span className="text-muted-foreground">VWAP:</span>
                      <span className="font-bold text-foreground">{latestData.vwap ? latestData.vwap.toFixed(2) : "-"}</span>
                    </div>

                    {/* ADX */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground">ADX (14)</span>
                        <span className="font-bold text-indigo-400">{latestData.adx ? latestData.adx.toFixed(2) : "-"}</span>
                      </div>
                      {latestData.adx && (
                        <div className="text-[10px] text-muted-foreground italic border-b border-border/30 pb-1.5">
                          {latestData.adx > 25 ? (
                            <span className="text-green-500 font-semibold">Strong Trend ({latestData.adx.toFixed(1)})</span>
                          ) : latestData.adx < 20 ? (
                            <span className="text-amber-500 font-semibold">Weak/Sideways ({latestData.adx.toFixed(1)})</span>
                          ) : (
                            <span>Developing Trend</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Z-Score */}
                    <div className="flex justify-between font-mono border-b border-border/30 pb-1.5">
                      <span className="text-muted-foreground">Z-Score:</span>
                      <span className={`font-bold ${latestData.zScore !== null && Math.abs(latestData.zScore) >= 2.5 ? "text-red-500" : "text-foreground"}`}>
                        {latestData.zScore ? latestData.zScore.toFixed(2) : "-"}
                      </span>
                    </div>

                    {/* POC */}
                    <div className="flex justify-between font-mono border-b border-border/30 pb-1.5">
                      <span className="text-muted-foreground">Volume Profile POC:</span>
                      <span className="font-bold text-indigo-400">{latestData.poc ? latestData.poc.toFixed(2) : "-"}</span>
                    </div>

                    {/* Accumulation/Distribution */}
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">A/D Line (CVD Proxy):</span>
                      <span className="font-bold text-foreground">{latestData.adLine ? latestData.adLine.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "-"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No indicator data available.</p>
                )}
              </div>
              <div className="flex flex-col gap-5 w-full">
                {/* Latest Stock Metrics */}
                <div className="bg-card/45 border border-border p-4 rounded-xl space-y-3 shadow-sm flex flex-col">
                  <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <DollarSignIcon className="h-3.5 w-3.5" />
                    Latest Prices
                  </h3>
                  {quote ? (
                    <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                      <div className="bg-muted/10 rounded-lg border border-border/20 p-2">
                        <span className="block text-[9px] text-muted-foreground uppercase">Open</span>
                        <span className="font-bold text-foreground">{quote.open?.toLocaleString()}</span>
                      </div>
                      <div className="bg-muted/10 rounded-lg border border-border/20 p-2">
                        <span className="block text-[9px] text-muted-foreground uppercase">Close</span>
                        <span className="font-bold text-foreground">{quote.currentPrice?.toLocaleString()}</span>
                      </div>
                      <div className="bg-muted/10 rounded-lg border border-border/20 p-2">
                        <span className="block text-[9px] text-muted-foreground uppercase">High</span>
                        <span className="font-bold text-foreground text-green-500">{quote.high?.toLocaleString()}</span>
                      </div>
                      <div className="bg-muted/10 rounded-lg border border-border/20 p-2">
                        <span className="block text-[9px] text-muted-foreground uppercase">Low</span>
                        <span className="font-bold text-foreground text-red-500">{quote.low?.toLocaleString()}</span>
                      </div>
                      <div className="col-span-2 bg-muted/10 rounded-lg border border-border/20 p-2 flex flex-col justify-center">
                        <span className="block text-[9px] text-muted-foreground uppercase">Volume</span>
                        <span className="font-bold text-foreground">{latestData?.volume?.toLocaleString() ?? "-"}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No latest quote available.</p>
                  )}
                </div>
                {/* AI Summary Bar */}
                <div className="h-full">
                  <AiSummaryBar symbol={symbol} isProcessing={isAiProcessing} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Stats & Indicator Interpretations */}
          <div className="space-y-4">
            <StrategyScoreCard
              scorePayload={scorePayload}
              date={latestDataWithScore?.date || null}
              activeScoreTab={activeScoreTab}
              setActiveScoreTab={setActiveScoreTab}
              metrics={latestDataWithScore}
            />
          </div>
        </div>
      )}

      {/* Corporate Actions Tab Content */}
      {activeMainTab === "corporate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dividends Card */}
          <div className="bg-card/45 border border-border p-5 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSignIcon className="h-4 w-4 text-indigo-400" />
              Riwayat Dividen (Dividend History)
            </h3>
            {isCorpLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-muted/40 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-muted/40 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-muted/40 rounded animate-pulse w-4/5"></div>
              </div>
            ) : corpActions?.dividends && corpActions.dividends.length > 0 ? (
              <div className="border border-border/40 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/30 border-b border-border/30 text-muted-foreground">
                    <tr>
                      <th className="p-3 font-semibold">Tanggal Ex-Dividen</th>
                      <th className="p-3 font-semibold text-right">Jumlah (Amount)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {corpActions.dividends.map((div: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 text-foreground font-medium">
                          {new Date(div.date).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-right text-green-500 font-bold">{div.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground italic text-xs">Tidak ada data riwayat dividen yang ditemukan.</div>
            )}
          </div>

          {/* Stock Splits Card */}
          <div className="bg-card/45 border border-border p-5 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ActivityIcon className="h-4 w-4 text-indigo-400" />
              Pecahan Saham (Stock Splits)
            </h3>
            {isCorpLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-muted/40 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-muted/40 rounded animate-pulse w-5/6"></div>
              </div>
            ) : corpActions?.splits && corpActions.splits.length > 0 ? (
              <div className="border border-border/40 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/30 border-b border-border/30 text-muted-foreground">
                    <tr>
                      <th className="p-3 font-semibold">Tanggal Split</th>
                      <th className="p-3 font-semibold text-right">Rasio Split</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {corpActions.splits.map((split: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 text-foreground font-medium">
                          {new Date(split.date).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-right text-indigo-400 font-bold">{split.splitRatio || `${split.numerator}:${split.denominator}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground italic text-xs">Tidak ada data pecahan saham (stock split) yang ditemukan.</div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Tab Content */}
      {activeMainTab === "portfolio" && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Holdings Card */}
            <Card className="bg-card/45 border border-border p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kepemilikan Aset (Holdings)</h3>
              {isSummaryLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted/40 rounded w-full"></div>
                  <div className="h-4 bg-muted/40 rounded w-5/6"></div>
                </div>
              ) : !portfolioSummary?.assets || portfolioSummary.assets.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Anda tidak memiliki saham {symbol} di portofolio manapun.</p>
              ) : (
                <div className="border border-border/40 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Portfolio</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Avg Price</TableHead>
                        <TableHead className="text-right">Total Cost Basis</TableHead>
                        <TableHead className="text-right text-emerald-400">Target TP</TableHead>
                        <TableHead className="text-right text-rose-400">Stop Loss</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolioSummary.assets.map((asset) => {
                        const qty = Number(asset.quantity);
                        const avg = Number(asset.averagePurchasePrice);
                        const tpVal = asset.takeProfit ? Number(asset.takeProfit) : null;
                        const slVal = asset.stopLoss ? Number(asset.stopLoss) : null;
                        const current = quote?.currentPrice || latestData?.close || 0;

                        let statusBadge: React.ReactNode;
                        if (tpVal && current >= tpVal) {
                          statusBadge = <Badge variant="emerald">TP Hit 🟢</Badge>;
                        } else if (slVal && current <= slVal) {
                          statusBadge = <Badge variant="destructive">SL Hit 🔴</Badge>;
                        } else if (tpVal || slVal) {
                          statusBadge = (
                            <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                              Within Target
                            </Badge>
                          );
                        } else {
                          statusBadge = <span className="text-muted-foreground text-xs">-</span>;
                        }

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="font-semibold text-indigo-400">{asset.portfolioName}</TableCell>
                            <TableCell className="text-right">{qty.toLocaleString("id-ID")}</TableCell>
                            <TableCell className="text-right">IDR {avg.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right">IDR {(qty * avg).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right text-emerald-400">
                              {tpVal ? `IDR ${tpVal.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                            </TableCell>
                            <TableCell className="text-right text-rose-400">
                              {slVal ? `IDR ${slVal.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                            </TableCell>
                            <TableCell className="text-center">{statusBadge}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>

            {/* Total Summary */}
            <Card className="bg-card/45 border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Ringkasan Akumulasi (Accumulated Summary)</h3>
                {portfolioSummary?.assets && portfolioSummary.assets.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Saham Dimiliki</span>
                      <span className="text-xl font-bold text-foreground">
                        {portfolioSummary.assets.reduce((sum, a) => sum + Number(a.quantity), 0).toLocaleString("id-ID")} Shares
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Rata-rata Harga Beli (Weighted)</span>
                      <span className="text-xl font-bold text-indigo-400">
                        IDR{" "}
                        {(() => {
                          const totalQty = portfolioSummary.assets.reduce((sum, a) => sum + Number(a.quantity), 0);
                          const totalCost = portfolioSummary.assets.reduce((sum, a) => sum + Number(a.quantity) * Number(a.averagePurchasePrice), 0);
                          return totalQty > 0 ? (totalCost / totalQty).toLocaleString("id-ID", { minimumFractionDigits: 2 }) : "0";
                        })()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Tidak ada data posisi portofolio.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Transactions Card */}
          <Card className="bg-card/45 border border-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Riwayat Transaksi Saham {symbol}</h3>
            {isSummaryLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted/40 rounded w-full"></div>
                <div className="h-4 bg-muted/40 rounded w-5/6"></div>
              </div>
            ) : !portfolioSummary?.transactions || portfolioSummary.transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Belum ada riwayat transaksi untuk saham {symbol}.</p>
            ) : (
              <div className="border border-border/40 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Portfolio</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioSummary.transactions.map((tx) => {
                      const qty = Number(tx.quantity || 0);
                      const priceVal = Number(tx.price || 0);
                      const feeVal = Number(tx.fee || 0);
                      const isBuy = tx.type === "BUY";
                      const totalValTx = isBuy ? qty * priceVal + feeVal : qty * priceVal - feeVal;

                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs text-muted-foreground">{new Date(tx.transactionDate).toLocaleString("id-ID")}</TableCell>
                          <TableCell className="font-semibold">{tx.portfolioName}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                isBuy
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20"
                              }
                            >
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{qty.toLocaleString("id-ID")}</TableCell>
                          <TableCell className="text-right">IDR {priceVal.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">IDR {feeVal.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-medium">IDR {totalValTx.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate" title={tx.notes || ""}>
                            {tx.notes || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}
      {/* Floating Calculator Button */}
      {createPortal(
        <div className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50">
          <Button
            onClick={() => setIsCalculatorOpen(true)}
            className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border border-indigo-400/25 p-0"
            title="Open Position Sizing Calculator"
          >
            <CalculatorIcon className="h-5 w-5" />
          </Button>
        </div>,
        document.body,
      )}

      {/* Position Sizing Calculator Modal */}
      <PositionSizingCalculator
        symbol={symbol}
        currentPrice={quote?.currentPrice || latestData?.close || 0}
        defaultStopLoss={scorePayload?.riskValidation ? scorePayload.riskValidation[activeScoreTab]?.stopLoss || scorePayload.riskValidation.stopLoss : undefined}
        defaultTargetProfit={scorePayload?.riskValidation ? scorePayload.riskValidation[activeScoreTab]?.targetProfit || scorePayload.riskValidation.targetProfit : undefined}
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Transaction Dialog */}
      <Dialog open={isTxOpen} onOpenChange={setIsTxOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleTxSubmit}>
            <DialogHeader>
              <DialogTitle>
                Record {txType} Transaction for {symbol}
              </DialogTitle>
              <DialogDescription>Select a portfolio and enter the transaction details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tx-portfolio">Portfolio</Label>
                <select
                  id="tx-portfolio"
                  className="w-full bg-[#09090b] border border-border rounded-md p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedPortfolioId}
                  onChange={(e) => setSelectedPortfolioId(e.target.value ? Number(e.target.value) : "")}
                  required
                >
                  <option value="">Select Portfolio</option>
                  {portfolios?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Balance: IDR {Number(p.balance).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tx-qty">Quantity (Lot)</Label>
                  <Input id="tx-qty" type="number" placeholder="0" value={txQty} onChange={(e) => setTxQty(e.target.value)} required />
                  {txQty && (
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      = {(Number(txQty) * 100).toLocaleString("id-ID")} Shares
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tx-price">Price per Share</Label>
                  <Input id="tx-price" type="text" placeholder="0" value={formatRupiahInput(txPrice)} onChange={(e) => setTxPrice(parseRupiahInput(e.target.value))} required />
                </div>
              </div>

              {txType === "BUY" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tx-tp">Target TP (IDR)</Label>
                    <Input id="tx-tp" type="text" placeholder="Optional" value={formatRupiahInput(txTakeProfit)} onChange={(e) => setTxTakeProfit(parseRupiahInput(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tx-sl">Stop Loss (IDR)</Label>
                    <Input id="tx-sl" type="text" placeholder="Optional" value={formatRupiahInput(txStopLoss)} onChange={(e) => setTxStopLoss(parseRupiahInput(e.target.value))} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tx-fee">Transaction Fee (IDR)</Label>
                <Input id="tx-fee" type="text" placeholder="0" value={formatRupiahInput(txFee)} onChange={(e) => setTxFee(parseRupiahInput(e.target.value))} />
              </div>

              {txQty && txPrice && (
                <div className="bg-muted/30 border border-border/40 p-3 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-mono font-medium">
                      {Number(txQty).toLocaleString("id-ID")} Lot ({(Number(txQty) * 100).toLocaleString("id-ID")} Shares)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Share:</span>
                    <span className="font-mono font-medium">IDR {Number(txPrice).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1.5">
                    <span className="text-muted-foreground">Gross Amount:</span>
                    <span className="font-mono font-medium text-foreground">
                      IDR {(Number(txQty) * 100 * Number(txPrice)).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xs text-muted-foreground">
                    <span>Fee:</span>
                    <span className="font-mono">IDR {Number(txFee || 0).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-indigo-400 pt-1 text-sm border-t border-border/20 mt-1">
                    <span>{txType === "BUY" ? "Total Estimated Cost:" : "Total Net Proceeds:"}</span>
                    <span className="font-mono text-indigo-400">
                      IDR {(() => {
                        const gross = Number(txQty) * 100 * Number(txPrice);
                        const fee = Number(txFee || 0);
                        const total = txType === "BUY" ? (gross + fee) : (gross - fee);
                        return total.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tx-notes">Notes (Optional)</Label>
                <Input id="tx-notes" placeholder="Notes or setup context" value={txNotes} onChange={(e) => setTxNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTxOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addTransactionMutation.isPending}>
                {addTransactionMutation.isPending ? "Recording..." : "Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── AI Summary Bar ──────────────────────────────────────────────────────────
// Compact prediction / call / confidence strip shown directly below the chart

function AiSummaryBar({ symbol, isProcessing }: { symbol: string; isProcessing?: boolean }) {
  const { data: analysis, isLoading } = useGetAiAnalysis(symbol);
  const { isPending } = useRefreshAiAnalysis(symbol);

  if (isLoading || isPending || isProcessing) {
    return (
      <div className="bg-card/45 border border-indigo-500/20 p-4 rounded-xl space-y-3 shadow-sm animate-pulse flex flex-col justify-center items-center py-6">
        <SparklesIcon className="h-5 w-5 text-indigo-400 animate-bounce" />
        <div className="h-2.5 w-2/3 bg-indigo-500/20 rounded"></div>
        <div className="h-2 w-1/2 bg-indigo-500/10 rounded"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const pred = (analysis.prediction || "").toUpperCase();
  const rec = (analysis.recommendation || "").toUpperCase();
  const conf = analysis.confidence ?? 0;

  const preditionInfo = (() => {
    if (pred === "UP" || pred === "BULLISH")
      return { label: "UP", icon: <TrendingUpIcon className="h-3.5 w-3.5" />, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" };
    if (pred === "DOWN" || pred === "BEARISH") return { label: "DOWN", icon: <TrendingDownIcon className="h-3.5 w-3.5" />, cls: "text-red-400 bg-red-500/10 border-red-500/25" };
    return { label: "SIDEWAYS", icon: <MoveRightIcon className="h-3.5 w-3.5" />, cls: "text-amber-400 bg-amber-500/10 border-amber-500/25" };
  })();

  const recInfo = (() => {
    if (rec === "BUY") return { cls: "bg-emerald-600 text-white shadow-emerald-600/20" };
    if (rec === "HOLD") return { cls: "bg-amber-600 text-white shadow-amber-600/20" };
    return { cls: "bg-rose-600 text-white shadow-rose-600/20" };
  })();

  const confColor = conf >= 70 ? "from-emerald-500 to-emerald-600" : conf >= 45 ? "from-amber-500 to-amber-600" : "from-red-500 to-red-600";

  return (
    <div className="bg-card/45 border border-border p-4 rounded-xl space-y-3 shadow-sm">
      {/* Card Header */}
      <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
        <SparklesIcon className="h-3.5 w-3.5 text-indigo-400" />
        AI Analysis Summary
      </h3>

      <div className="space-y-3 text-xs">
        {/* Prediction */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Trend Prediction</span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${preditionInfo.cls}`}>
            {preditionInfo.icon}
            {preditionInfo.label}
          </span>
        </div>

        {/* Call Action */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">AI Call Action</span>
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${recInfo.cls}`}>{rec}</span>
        </div>

        {/* Confidence */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-mono font-bold text-indigo-400">{conf}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden border border-border/40">
            <div className={`h-full bg-gradient-to-r ${confColor} rounded-full transition-all duration-500`} style={{ width: `${conf}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetailPage;
