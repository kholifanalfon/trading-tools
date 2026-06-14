import { useEffect, useRef } from "react";
import { useTheme } from "@/shared/components/theme-provider";
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from "lightweight-charts";

export interface StockChartCanvasProps {
  historicalData: any[];
  isLoading: boolean;
  timeframe: string;
  showEma9: boolean;
  showEma21: boolean;
  showEma50: boolean;
  showEma200: boolean;
  showRsi: boolean;
  showMacd: boolean;
  chartType: "candlestick" | "line";
}

export function StockChartCanvas({ historicalData, isLoading, timeframe, showEma9, showEma21, showEma50, showEma200, showRsi, showMacd, chartType }: StockChartCanvasProps) {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Count active panes
  const activePanesCount = 1 + (showRsi ? 1 : 0) + (showMacd ? 1 : 0);

  // Determine dynamic chart dimensions based on viewport height
  const getChartDimensions = () => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const offset = isMobile ? 150 : 260;
    const availableHeight = Math.max(300, vh - offset);

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
    if (isLoading || historicalData.length === 0 || !chartContainerRef.current) {
      return;
    }

    const container = chartContainerRef.current;

    const chartData = historicalData
      .map((d) => {
        const dateObj = new Date(d.date);
        return {
          time: Math.floor(dateObj.getTime() / 1000) as any,
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
      .filter((item, index, self) => item.time && self.findIndex((t) => Math.abs(t.time - item.time) < 60) === index)
      .sort((a, b) => a.time - b.time);

    if (chartData.length === 0) return;

    const isDark = document.documentElement.classList.contains("dark") || theme === "dark";

    const colors = {
      background: isDark ? "#09090b" : "#ffffff",
      text: isDark ? "#a1a1aa" : "#4b5563",
      grid: isDark ? "rgba(39, 39, 42, 0.15)" : "rgba(209, 213, 219, 0.3)",
      border: isDark ? "rgba(39, 39, 42, 0.6)" : "rgba(209, 213, 219, 0.8)",
      separator: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
    };

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "Geist, sans-serif",
        panes: {
          enableResize: false,
          separatorColor: colors.separator,
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
        timeVisible: timeframe === "1D" || timeframe === "5D",
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
          style: 3,
        },
        horzLine: {
          color: "rgba(99, 102, 241, 0.5)",
          width: 1,
          style: 3,
        },
      },
    });

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

    const updatePaneHeights = () => {
      const panes = chart.panes();
      const totalHeight = dims.height;
      if (activePanesCount === 3) {
        if (panes[0]) panes[0].setHeight(Math.round(totalHeight * 0.48));
        if (panes[1]) panes[1].setHeight(Math.round(totalHeight * 0.3));
        if (panes[2]) panes[2].setHeight(Math.round(totalHeight * 0.22));
      } else if (activePanesCount === 2) {
        if (panes[0]) panes[0].setHeight(Math.round(totalHeight * 0.6));
        if (panes[1]) panes[1].setHeight(Math.round(totalHeight * 0.4));
      } else {
        if (panes[0]) panes[0].setHeight(totalHeight);
      }
    };

    setTimeout(() => {
      updatePaneHeights();
    }, 50);

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
      mainSeries.setData(chartData.map((d) => ({ time: d.time, value: d.close })));
    }

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
        top: 0.8,
        bottom: 0,
      },
    });
    volumeOverlaySeries.setData(
      chartData.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
      })),
    );

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
      const rsiData = chartData.filter((d) => d.rsi !== null).map((d) => ({ time: d.time, value: Number(d.rsi) }));
      rsiSeries.setData(rsiData);

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
          color: Number(d.macdHist) >= 0 ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.6)",
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
      const macdLineData = chartData.filter((d) => d.macd !== null).map((d) => ({ time: d.time, value: Number(d.macd) }));
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
      const signalLineData = chartData.filter((d) => d.macdSignal !== null).map((d) => ({ time: d.time, value: Number(d.macdSignal) }));
      signalSeries.setData(signalLineData);
    }

    const handleResize = () => {
      const currentDims = getChartDimensions();
      updatePaneHeights();
      chart.resize(container.clientWidth, currentDims.height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const handleCrosshairMove = (param: any) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      if (param.point === undefined || !param.time || param.point.x < 0 || param.point.x > container.clientWidth || param.point.y < 0 || param.point.y > dims.height) {
        tooltip.style.display = "none";
        return;
      }

      const barTime = param.time as number;
      const bar = chartData.find((d) => d.time === barTime);
      if (!bar) {
        tooltip.style.display = "none";
        return;
      }

      const dateObj = new Date((param.time as number) * 1000);
      const dateStr = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: timeframe === "1D" || timeframe === "5D" ? "2-digit" : undefined,
        minute: timeframe === "1D" || timeframe === "5D" ? "2-digit" : undefined,
      });

      const openVal = Number(bar.open) ?? 0;
      const highVal = Number(bar.high) ?? 0;
      const lowVal = Number(bar.low) ?? 0;
      const closeVal = Number(bar.close) ?? 0;
      const changeVal = closeVal - openVal;
      const changePercent = openVal !== 0 ? (changeVal / openVal) * 100 : 0;

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

      const coordinateY = mainSeries.priceToCoordinate(chartType === "candlestick" ? highVal : closeVal);
      const coordinateX = param.point.x;

      const tooltipWidth = 160;
      const tooltipHeight = 135;

      let left = coordinateX - tooltipWidth / 2;
      if (left < 10) {
        left = 10;
      } else if (left + tooltipWidth > container.clientWidth - 10) {
        left = container.clientWidth - tooltipWidth - 10;
      }

      let top = 0;
      if (coordinateY === null || isNaN(coordinateY)) {
        top = param.point.y - tooltipHeight - 15;
      } else {
        top = coordinateY - tooltipHeight - 15;
        if (top < 10) {
          const coordinateYLow = mainSeries.priceToCoordinate(chartType === "candlestick" ? lowVal : closeVal);
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

    if (timeframe === "1D" && chartData.length > 0) {
      const barsToShow = dims.isMobile ? 5 : 7;
      const fromIndex = Math.max(0, chartData.length - barsToShow);
      chart.timeScale().setVisibleRange({
        from: chartData[fromIndex].time,
        to: chartData[chartData.length - 1].time,
      });
    } else if (timeframe === "5D" && chartData.length > 0) {
      const barsToShow = dims.isMobile ? 15 : 35;
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
  }, [historicalData, isLoading, showEma9, showEma21, showEma50, showEma200, showRsi, showMacd, chartType, theme, timeframe, dims.height, activePanesCount]);

  return (
    <div className="bg-[#09090b] border border-border/80 rounded-xl min-h-[350px] relative overflow-hidden flex flex-col justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading chart analytics...</span>
        </div>
      ) : historicalData.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground">No historical records found.</div>
      ) : (
        <div style={{ height: dims.height }} className="relative w-full transition-all duration-300">
          <div ref={chartContainerRef} className="w-full h-full" />
          <div
            ref={tooltipRef}
            className="absolute hidden z-50 pointer-events-none rounded-xl border border-border bg-background/95 backdrop-blur-md p-3 shadow-xl text-[10px] font-mono w-[160px] text-foreground transition-opacity duration-150"
            style={{ left: 0, top: 0 }}
          />
        </div>
      )}
    </div>
  );
}
