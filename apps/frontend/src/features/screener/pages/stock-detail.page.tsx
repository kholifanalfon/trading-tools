import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useGetStockHistoricalData } from "../hooks/use-get-stock-detail";
import { useGetQuote } from "../hooks/use-get-quote";
import { useGetSettings } from "@/features/settings/hooks/use-get-settings";
import { ChevronLeftIcon, ActivityIcon, DollarSignIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { StrategyScoreCard } from "../components/strategy-score-card";
import { StockChartCanvas } from "../components/stock-chart-canvas";

export function StockDetailPage() {
  const { symbol = "" } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlStrategy = searchParams.get("strategy");
  const { data: settings } = useGetSettings();

  // Google Stock style timeframes
  // 1D: 1 day, 5D: 5 days, 1M: ~22 trading days, 6M: ~130 trading days,
  // YTD: from Jan 1st of current year, 1Y: ~252 trading days, 5Y: ~1260 trading days, MAX: 5000 days
  const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX">("1M");
  const [activeScoreTab, setActiveScoreTab] = useState<"day" | "swing" | "position">("day");

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

  // Retrieve change and percentChange from the quote query
  const priceChange = quote?.change ?? 0;
  const priceChangePercent = quote?.percentChange ?? 0;

  // We've moved the lightweight-charts rendering logic to StockChartCanvas component

  return (
    <div className="space-y-6 pb-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(location.state?.from || "/screener")} className="h-8 w-8 p-0 rounded-xl">
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

        {/* Latest Price Summary */}
        {quote && (
          <div className="flex items-center gap-4 bg-muted/20 px-4 py-2 rounded-xl border border-border/40">
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
      </div>

      {/* Main Grid content (split chart and statistics panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
        </div>

        {/* Right Side: Detailed Stats & Indicator Interpretations */}
        <div className="space-y-4">
          <StrategyScoreCard scorePayload={scorePayload} date={latestDataWithScore?.date || null} activeScoreTab={activeScoreTab} setActiveScoreTab={setActiveScoreTab} />

          {/* Latest Stock Metrics */}
          <div className="bg-card/45 border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSignIcon className="h-3.5 w-3.5" />
              Latest Prices
            </h3>
            {quote ? (
              <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                <div className="bg-muted/10 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">Open</span>
                  <span className="font-bold text-foreground">{quote.open?.toLocaleString()}</span>
                </div>
                <div className="bg-muted/10 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">Close</span>
                  <span className="font-bold text-foreground">{quote.currentPrice?.toLocaleString()}</span>
                </div>
                <div className="bg-muted/10 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">High</span>
                  <span className="font-bold text-foreground text-green-500">{quote.high?.toLocaleString()}</span>
                </div>
                <div className="bg-muted/10 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">Low</span>
                  <span className="font-bold text-foreground text-red-500">{quote.low?.toLocaleString()}</span>
                </div>
                <div className="col-span-2 bg-muted/10 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">Volume</span>
                  <span className="font-bold text-foreground">{latestData?.volume?.toLocaleString() ?? "-"}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No latest quote available.</p>
            )}
          </div>

          {/* Technical Indicators Summary */}
          <div className="bg-card/45 border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ActivityIcon className="h-3.5 w-3.5" />
              Technical Indicators
            </h3>
            {latestData ? (
              <div className="space-y-3.5 text-xs">
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
                    <div className="text-[10px] text-muted-foreground italic">
                      {latestData.macd > latestData.macdSignal ? (
                        <span className="text-green-500 font-semibold">Bullish MACD crossover</span>
                      ) : (
                        <span className="text-red-500 font-semibold">Bearish MACD crossover</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No indicator data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetailPage;
