import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetStockHistoricalData } from "../hooks/use-get-stock-detail";
import { useGetQuote } from "../hooks/use-get-quote";
import { ChevronLeftIcon, ActivityIcon, DollarSignIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTheme } from "@/shared/components/theme-provider";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";

export function StockDetailPage() {
  const { theme } = useTheme();
  const { symbol = "" } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  // Google Stock style timeframes
  // 1D: 1 day, 5D: 5 days, 1M: ~22 trading days, 6M: ~130 trading days,
  // YTD: from Jan 1st of current year, 1Y: ~252 trading days, 5Y: ~1260 trading days, MAX: 5000 days
  const [timeframe, setTimeframe] = useState<
    "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX"
  >("1M");

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
  const [chartType, setChartType] = useState<"candlestick" | "line">(
    "candlestick",
  );

  const { data: historicalData = [], isLoading } = useGetStockHistoricalData(
    symbol,
    currentLimit,
    timeframe,
  );

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { data: quote } = useGetQuote(symbol);

  // Latest entry (most recent day)
  const latestData = historicalData[historicalData.length - 1] || null;
  const companyName = latestData?.name || symbol;

  // Retrieve change and percentChange from the quote query
  const priceChange = quote?.change ?? 0;
  const priceChangePercent = quote?.percentChange ?? 0;

  // Count active panes
  const activePanesCount = 1 + (showRsi ? 1 : 0) + (showMacd ? 1 : 0);

  // Determine dynamic chart dimensions based on viewport height
  const getChartDimensions = () => {
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 768 : false;

    // We want to calculate a height based on the viewport height (window.innerHeight)
    // to dynamically fit the screen.
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Calculate available height: subtract header, controls, padding margins (approx 280px on desktop, 320px on mobile)
    const offset = isMobile ? 150 : 260;
    const availableHeight = Math.max(300, vh - offset);

    // Limit heights based on active panes
    let height = availableHeight;
    if (activePanesCount === 1) {
      height = Math.min(height, 500);
    } else if (activePanesCount === 2) {
      height = Math.min(height, 650);
    } else {
      height = Math.min(height, 900);
    }

    return { isMobile, height };
  };

  const dims = getChartDimensions();

  useEffect(() => {
    if (
      isLoading ||
      historicalData.length === 0 ||
      !chartContainerRef.current
    ) {
      return;
    }

    const container = chartContainerRef.current;

    // Standardize & unique times
    // For intraday (1D/5D) data, we need a UNIX timestamp in seconds instead of a daily string,
    // so we parse date to getTime() / 1000.
    const chartData = historicalData
      .map((d) => {
        const dateObj = new Date(d.date);
        return {
          time: Math.floor(dateObj.getTime() / 1000) as any, // Unix timestamp in seconds
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
          volume: Number(d.volume),
          ema9: d.ema9 ? Number(d.ema9) : null,
          ema21: d.ema21 ? Number(d.ema21) : null,
          ema50: d.ema50 ? Number(d.ema50) : null,
          ema200: d.ema200 ? Number(d.ema200) : null,
          rsi: d.rsi ? Number(d.rsi) : null,
          macd: d.macd ? Number(d.macd) : null,
          macdSignal: d.macdSignal ? Number(d.macdSignal) : null,
          macdHist: d.macdHist ? Number(d.macdHist) : null,
        };
      })
      .filter(
        (item, index, self) =>
          item.time &&
          self.findIndex((t) => Math.abs(t.time - item.time) < 60) === index,
      )
      .sort((a, b) => a.time - b.time);

    if (chartData.length === 0) return;

    // Determine color codes based on theme (dark / light)
    // Tailwind root .dark class dictates if it's dark
    const isDark =
      document.documentElement.classList.contains("dark") || theme === "dark";

    const colors = {
      background: isDark ? "#09090b" : "#ffffff",
      text: isDark ? "#a1a1aa" : "#4b5563",
      grid: isDark ? "rgba(39, 39, 42, 0.15)" : "rgba(209, 213, 219, 0.3)",
      border: isDark ? "rgba(39, 39, 42, 0.6)" : "rgba(209, 213, 219, 0.8)",
      separator: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
    };

    // Create chart
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "Geist, sans-serif",
        panes: {
          enableResize: false, // Disable manual pane resizing
          separatorColor: colors.separator, // Theme adaptive border color for pane lines
          separatorHoverColor: colors.separator,
        },
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      width: container.clientWidth,
      height: dims.height,
      timeScale: {
        borderColor: colors.border,
        timeVisible: timeframe === "1D" || timeframe === "5D", // Show time (hours/minutes) for intraday data
        secondsVisible: false,
      },
      localization: {
        timeFormatter: (timestamp: number) => {
          const date = new Date(timestamp * 1000);
          if (timeframe === "1D" || timeframe === "5D") {
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          }
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      rightPriceScale: {
        borderColor: colors.border,
      },
      crosshair: {
        vertLine: {
          color: "rgba(99, 102, 241, 0.5)",
          width: 1,
          style: 3, // Dashed
        },
        horzLine: {
          color: "rgba(99, 102, 241, 0.5)",
          width: 1,
          style: 3, // Dashed
        },
      },
    });

    // Add extra panes depending on active toggles
    let nextPaneIndex = 1;
    let rsiPaneIndex = -1;
    let macdPaneIndex = -1;

    if (showRsi) {
      chart.addPane();
      rsiPaneIndex = nextPaneIndex;
      nextPaneIndex++;
    }
    if (showMacd) {
      chart.addPane();
      macdPaneIndex = nextPaneIndex;
      nextPaneIndex++;
    }

    // Set height distribution dynamically
    const updatePaneHeights = () => {
      const panes = chart.panes();
      const totalHeight = dims.height;
      if (activePanesCount === 3) {
        // Price pane: 48%, RSI pane: 30%, MACD pane: 22%
        if (panes[0]) panes[0].setHeight(Math.round(totalHeight * 0.48));
        if (panes[1]) panes[1].setHeight(Math.round(totalHeight * 0.3));
        if (panes[2]) panes[2].setHeight(Math.round(totalHeight * 0.22));
      } else if (activePanesCount === 2) {
        // Price pane: 60%, Ind pane: 40%
        if (panes[0]) panes[0].setHeight(Math.round(totalHeight * 0.6));
        if (panes[1]) panes[1].setHeight(Math.round(totalHeight * 0.4));
      } else {
        if (panes[0]) panes[0].setHeight(totalHeight);
      }
    };

    // Run updatePaneHeights after series are added to ensure correct initialization
    setTimeout(() => {
      updatePaneHeights();
    }, 50);

    // --- PANE 0: Price (Candlestick or Line) ---
    const mainSeries =
      chartType === "candlestick"
        ? chart.addSeries(
            CandlestickSeries,
            {
              upColor: "#22c55e",
              downColor: "#ef4444",
              borderVisible: false,
              wickUpColor: "#22c55e",
              wickDownColor: "#ef4444",
              title: "Price",
            },
            0,
          )
        : chart.addSeries(
            LineSeries,
            {
              color: "#3b82f6",
              lineWidth: 2,
              title: "Price",
            },
            0,
          );

    if (chartType === "candlestick") {
      mainSeries.setData(chartData);
    } else {
      mainSeries.setData(
        chartData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    // Add EMA overlays if checked
    const emas = [
      { key: "ema9", color: "#3B82F6", enabled: showEma9, name: "EMA 9" },
      { key: "ema21", color: "#EAB308", enabled: showEma21, name: "EMA 21" },
      { key: "ema50", color: "#A855F7", enabled: showEma50, name: "EMA 50" },
      { key: "ema200", color: "#EC4899", enabled: showEma200, name: "EMA 200" },
    ];
    emas.forEach((ema) => {
      if (ema.enabled) {
        const emaData = chartData
          .filter((d) => d[ema.key as keyof typeof d] !== null)
          .map((d) => ({
            time: d.time,
            value: Number(d[ema.key as keyof typeof d]),
          }));
        if (emaData.length > 0) {
          const emaSeries = chart.addSeries(
            LineSeries,
            {
              color: ema.color,
              lineWidth: 1,
              lastValueVisible: true,
              priceLineVisible: false,
              title: ema.name,
            },
            0,
          );
          emaSeries.setData(emaData);
        }
      }
    });

    // Add semi-transparent volume overlay at the bottom of Price pane
    const volumeOverlaySeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume-overlay",
      },
      0,
    );
    chart.priceScale("volume-overlay", 0).applyOptions({
      scaleMargins: {
        top: 0.8, // display at the bottom 20%
        bottom: 0,
      },
    });
    volumeOverlaySeries.setData(
      chartData.map((d) => ({
        time: d.time,
        value: d.volume,
        color:
          d.close >= d.open
            ? "rgba(34, 197, 94, 0.15)"
            : "rgba(239, 68, 68, 0.15)",
      })),
    );

    // --- PANE 1: RSI (14) if enabled ---
    if (showRsi && rsiPaneIndex !== -1) {
      const rsiSeries = chart.addSeries(
        LineSeries,
        {
          color: "#f59e0b",
          lineWidth: 3,
          lastValueVisible: true,
          title: "RSI (14)",
        },
        rsiPaneIndex,
      );
      const rsiData = chartData
        .filter((d) => d.rsi !== null)
        .map((d) => ({ time: d.time, value: Number(d.rsi) }));
      rsiSeries.setData(rsiData);

      // Overbought/Oversold indicators in RSI pane
      rsiSeries.createPriceLine({
        price: 70,
        color: "rgba(239, 68, 68, 0.4)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Overbought (70)",
      });
      rsiSeries.createPriceLine({
        price: 30,
        color: "rgba(34, 197, 94, 0.4)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Oversold (30)",
      });
    }

    // --- PANE 2: MACD if enabled ---
    if (showMacd && macdPaneIndex !== -1) {
      const macdHistSeries = chart.addSeries(
        HistogramSeries,
        {
          priceScaleId: "macd-hist",
        },
        macdPaneIndex,
      );
      chart.priceScale("macd-hist", macdPaneIndex).applyOptions({
        scaleMargins: {
          top: 0.5,
          bottom: 0.1,
        },
      });
      const histData = chartData
        .filter((d) => d.macdHist !== null)
        .map((d) => ({
          time: d.time,
          value: Number(d.macdHist),
          color:
            Number(d.macdHist) >= 0
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(239, 68, 68, 0.6)",
        }));
      macdHistSeries.setData(histData);

      const macdSeries = chart.addSeries(
        LineSeries,
        {
          color: "#ec4899",
          lineWidth: 1,
          lastValueVisible: true,
          title: "MACD",
        },
        macdPaneIndex,
      );
      const macdLineData = chartData
        .filter((d) => d.macd !== null)
        .map((d) => ({ time: d.time, value: Number(d.macd) }));
      macdSeries.setData(macdLineData);

      const signalSeries = chart.addSeries(
        LineSeries,
        {
          color: "#3b82f6",
          lineWidth: 1,
          lastValueVisible: true,
          title: "Signal",
        },
        macdPaneIndex,
      );
      const signalLineData = chartData
        .filter((d) => d.macdSignal !== null)
        .map((d) => ({ time: d.time, value: Number(d.macdSignal) }));
      signalSeries.setData(signalLineData);
    }

    // Resize observer
    const handleResize = () => {
      const currentDims = getChartDimensions();
      updatePaneHeights();
      chart.resize(container.clientWidth, currentDims.height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Tooltip subscribe crosshair move
    const handleCrosshairMove = (param: any) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > dims.height
      ) {
        tooltip.style.display = "none";
        return;
      }

      // Find the specific bar data in chartData by timestamp
      const barTime = param.time as number;
      const bar = chartData.find((d) => d.time === barTime);
      if (!bar) {
        tooltip.style.display = "none";
        return;
      }

      // Format date
      const dateObj = new Date((param.time as number) * 1000);
      const dateStr = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: timeframe === "1D" || timeframe === "5D" ? "2-digit" : undefined,
        minute:
          timeframe === "1D" || timeframe === "5D" ? "2-digit" : undefined,
      });

      const openVal = Number(bar.open) ?? 0;
      const highVal = Number(bar.high) ?? 0;
      const lowVal = Number(bar.low) ?? 0;
      const closeVal = Number(bar.close) ?? 0;
      const changeVal = closeVal - openVal;
      const changePercent = openVal !== 0 ? (changeVal / openVal) * 100 : 0;

      // Try to find volume from the overlay series
      const volData = param.seriesData.get(volumeOverlaySeries);
      const volumeVal = volData?.value ?? 0;

      const colorClass = changeVal >= 0 ? "text-green-500" : "text-red-500";
      const changeSign = changeVal >= 0 ? "+" : "";

      tooltip.innerHTML = `
        <div class="space-y-1">
          <div class="font-bold border-b border-border/40 pb-1 text-muted-foreground">${dateStr}</div>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1">
            <span class="text-muted-foreground">Open:</span><span class="text-right font-semibold">${openVal.toFixed(2)}</span>
            <span class="text-muted-foreground">High:</span><span class="text-right text-green-400 font-semibold">${highVal.toFixed(2)}</span>
            <span class="text-muted-foreground">Low:</span><span class="text-right text-red-400 font-semibold">${lowVal.toFixed(2)}</span>
            <span class="text-muted-foreground">Close:</span><span class="text-right font-semibold">${closeVal.toFixed(2)}</span>
            <span class="text-muted-foreground">Vol:</span><span class="text-right font-semibold">${volumeVal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div class="pt-1.5 border-t border-border/40 font-bold ${colorClass} text-center">
            ${changeSign}${changeVal.toFixed(2)} (${changeSign}${changePercent.toFixed(2)}%)
          </div>
        </div>
      `;

      // Position the tooltip above the price coordinate (high for candlestick, close for line)
      const coordinateY = mainSeries.priceToCoordinate(
        chartType === "candlestick" ? highVal : closeVal,
      );
      const coordinateX = param.point.x;

      const tooltipWidth = 160;
      const tooltipHeight = 135; // approximate height

      let left = coordinateX - tooltipWidth / 2;
      // boundary check for left/right edges
      if (left < 10) {
        left = 10;
      } else if (left + tooltipWidth > container.clientWidth - 10) {
        left = container.clientWidth - tooltipWidth - 10;
      }

      // Place it directly above the high of the candle or close value of the line (coordinateY)
      let top = 0;
      if (coordinateY === null || isNaN(coordinateY)) {
        top = param.point.y - tooltipHeight - 15;
      } else {
        top = coordinateY - tooltipHeight - 15;
        if (top < 10) {
          // If it overflows the top pane, show it below the candle
          const coordinateYLow = mainSeries.priceToCoordinate(
            chartType === "candlestick" ? lowVal : closeVal,
          );
          if (coordinateYLow !== null && !isNaN(coordinateYLow)) {
            top = coordinateYLow + 15;
          } else {
            top = coordinateY + 15;
          }
        }
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.display = "block";
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Zoom default view based on timeframe and device
    // Since we fetch 30/60 days of historical data to compute EMA 200 on 1D/5D,
    // we must zoom the viewport into the targeted subset (e.g., last 7 bars for 1D, last 35 bars for 5D)
    if (timeframe === "1D" && chartData.length > 0) {
      const barsToShow = dims.isMobile ? 5 : 7; // Approx 7 trading hours per day
      const fromIndex = Math.max(0, chartData.length - barsToShow);
      chart.timeScale().setVisibleRange({
        from: chartData[fromIndex].time,
        to: chartData[chartData.length - 1].time,
      });
    } else if (timeframe === "5D" && chartData.length > 0) {
      const barsToShow = dims.isMobile ? 15 : 35; // Approx 35 trading hours over 5 days (7 hours * 5 days)
      const fromIndex = Math.max(0, chartData.length - barsToShow);
      chart.timeScale().setVisibleRange({
        from: chartData[fromIndex].time,
        to: chartData[chartData.length - 1].time,
      });
    } else {
      if (dims.isMobile && chartData.length > 3) {
        const fromIndex = Math.max(0, chartData.length - 4);
        chart.timeScale().setVisibleRange({
          from: chartData[fromIndex].time,
          to: chartData[chartData.length - 1].time,
        });
      } else {
        chart.timeScale().fitContent();
      }
    }

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [
    historicalData,
    isLoading,
    showEma9,
    showEma21,
    showEma50,
    showEma200,
    showRsi,
    showMacd,
    chartType,
    theme,
    timeframe,
  ]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/screener")}
            className="h-8 w-8 p-0 rounded-xl"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {symbol}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
                {companyName}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical performance data & technical indicators analytics
            </p>
          </div>
        </div>

        {/* Latest Price Summary */}
        {quote && (
          <div className="flex items-center gap-4 bg-muted/20 px-4 py-2 rounded-xl border border-border/40">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Latest Close Price
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono text-foreground">
                  {quote.currentPrice.toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    priceChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {priceChange >= 0 ? "+" : ""}
                  {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
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
                {(
                  ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"] as const
                ).map((tf) => (
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
          <div className="bg-[#09090b] border border-border/80 rounded-xl min-h-[350px] relative overflow-hidden flex flex-col justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading chart analytics...</span>
              </div>
            ) : historicalData.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground">
                No historical records found.
              </div>
            ) : (
              <div
                style={{ height: dims.height }}
                className="relative w-full transition-all duration-300"
              >
                {/* Div Container for lightweight-charts canvas rendering */}
                <div ref={chartContainerRef} className="w-full h-full" />
                {/* Custom Candlestick Hover Tooltip */}
                <div
                  ref={tooltipRef}
                  className="absolute hidden z-50 pointer-events-none rounded-xl border border-border bg-background/95 backdrop-blur-md p-3 shadow-xl text-[10px] font-mono w-[160px] text-foreground transition-opacity duration-150"
                  style={{ left: 0, top: 0 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Stats & Indicator Interpretations */}
        <div className="space-y-4">
          {/* Latest Stock Metrics */}
          <div className="bg-card/45 border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSignIcon className="h-3.5 w-3.5" />
              Latest Prices
            </h3>
            {quote ? (
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-muted/10 p-2 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">
                    Open
                  </span>
                  <span className="font-bold text-foreground">
                    {quote.open?.toLocaleString()}
                  </span>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">
                    Close
                  </span>
                  <span className="font-bold text-foreground">
                    {quote.currentPrice?.toLocaleString()}
                  </span>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">
                    High
                  </span>
                  <span className="font-bold text-foreground text-green-500">
                    {quote.high?.toLocaleString()}
                  </span>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">
                    Low
                  </span>
                  <span className="font-bold text-foreground text-red-500">
                    {quote.low?.toLocaleString()}
                  </span>
                </div>
                <div className="col-span-2 bg-muted/10 p-2 rounded-lg border border-border/20">
                  <span className="block text-[9px] text-muted-foreground uppercase">
                    Volume
                  </span>
                  <span className="font-bold text-foreground">
                    {latestData?.volume?.toLocaleString() ?? "-"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No latest quote available.
              </p>
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
                    <span className="font-bold text-amber-500">
                      {latestData.rsi ? latestData.rsi.toFixed(2) : "-"}
                    </span>
                  </div>
                  {latestData.rsi && (
                    <div className="text-[10px] text-muted-foreground italic">
                      {latestData.rsi >= 70 ? (
                        <span className="text-red-500 font-semibold">
                          Overbought (Sell Signal)
                        </span>
                      ) : latestData.rsi <= 30 ? (
                        <span className="text-green-500 font-semibold">
                          Oversold (Buy Signal)
                        </span>
                      ) : (
                        <span>Neutral Momentum</span>
                      )}
                    </div>
                  )}
                </div>

                {/* EMAs Alignment */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block">
                    Moving Averages (EMA)
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                    <div className="flex justify-between border-b border-border/30 pb-0.5">
                      <span className="text-muted-foreground">EMA 9:</span>
                      <span>
                        {latestData.ema9 ? latestData.ema9.toFixed(2) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-0.5">
                      <span className="text-muted-foreground">EMA 21:</span>
                      <span>
                        {latestData.ema21 ? latestData.ema21.toFixed(2) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-0.5">
                      <span className="text-muted-foreground">EMA 50:</span>
                      <span>
                        {latestData.ema50 ? latestData.ema50.toFixed(2) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-0.5">
                      <span className="text-muted-foreground">EMA 200:</span>
                      <span>
                        {latestData.ema200 ? latestData.ema200.toFixed(2) : "-"}
                      </span>
                    </div>
                  </div>
                  {latestData.ema9 && latestData.ema21 && (
                    <div className="text-[10px] text-muted-foreground italic pt-1">
                      {latestData.ema9 > latestData.ema21 ? (
                        <span className="text-green-500 font-semibold">
                          Bullish Crossover (EMA 9 &gt; 21)
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Bearish Crossover (EMA 9 &lt; 21)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* MACD Analytics */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">MACD</span>
                    <span>
                      {latestData.macd ? latestData.macd.toFixed(2) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                    <span>Signal Line:</span>
                    <span>
                      {latestData.macdSignal
                        ? latestData.macdSignal.toFixed(2)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-muted-foreground border-b border-border/30 pb-1.5">
                    <span>Histogram:</span>
                    <span
                      className={
                        latestData.macdHist >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {latestData.macdHist
                        ? latestData.macdHist.toFixed(2)
                        : "-"}
                    </span>
                  </div>
                  {latestData.macd && latestData.macdSignal && (
                    <div className="text-[10px] text-muted-foreground italic">
                      {latestData.macd > latestData.macdSignal ? (
                        <span className="text-green-500 font-semibold">
                          Bullish MACD crossover
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Bearish MACD crossover
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No indicator data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetailPage;
