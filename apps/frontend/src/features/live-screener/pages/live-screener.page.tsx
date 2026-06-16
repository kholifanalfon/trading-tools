import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useGetInfiniteLiveStockData } from "../hooks/use-get-live-stock-data";
import { useQueryClient } from "@tanstack/react-query";
import { liveScreenerKeys } from "../live-screener.keys";
import { toast } from "sonner";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { updateStockApi } from "@/features/stocks/services/stocks.api";
import { TrendingUpIcon, SearchIcon, RefreshCw, ArrowUpIcon, ArrowDownIcon, StarIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useGetSettings } from "@/features/settings/hooks/use-get-settings";

export function LiveScreenerPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string>("ALL");
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendSearch, setBackendSearch] = useState<string | undefined>(undefined);
  const { data: settings } = useGetSettings();

  const toastIdRef = useRef<string | number | null>(null);
  const processedCountRef = useRef(0);
  const totalCountRef = useRef(0);

  // Listen to live sync logs via WebSockets
  useWebSocket(["screener", "sync-log"], (data) => {
    const log = data.message;
    if (!log) return;

    if (log.includes("Starting live stock data sync")) {
      processedCountRef.current = 0;
      totalCountRef.current = 0;
      toastIdRef.current = toast.loading("Starting live stock data sync", {
        position: "bottom-right",
      });
    } else if (log.includes("Fetching exchanges")) {
      if (toastIdRef.current) {
        toast.loading("Fetching exchanges ...", {
          id: toastIdRef.current,
          position: "bottom-right",
        });
      }
    } else if (log.includes("Retrieved") && log.includes("symbols")) {
      const match = log.match(/Retrieved (\d+) screened/);
      const count = match ? match[1] : "...";
      if (toastIdRef.current) {
        toast.loading(`Retrieved ${count} screened symbols`, {
          id: toastIdRef.current,
          position: "bottom-right",
        });
      }
    } else if (log.includes("Processing page")) {
      const match = log.match(/stocks: ([^)]+)/);
      if (match) {
        const symbols = match[1].split(",").map((s: string) => s.trim());
        totalCountRef.current = symbols.length;
        processedCountRef.current = 0;
      }
      if (toastIdRef.current) {
        toast.loading(`Processing 0/${totalCountRef.current || "..."} ...`, {
          id: toastIdRef.current,
          position: "bottom-right",
        });
      }
    } else if (log.includes("Fetching history & calculating scores for")) {
      const match = log.match(/calculating scores for ([A-Z0-9.-]+)/i);
      const symbol = match ? match[1] : "...";
      if (toastIdRef.current) {
        const displayProgress = totalCountRef.current ? Math.min(processedCountRef.current, totalCountRef.current) : processedCountRef.current;
        toast.loading(`Processing ${displayProgress}/${totalCountRef.current || "..."} ...\nFetching history & calculating scores (${symbol})`, {
          id: toastIdRef.current,
          position: "bottom-right",
        });
      }
    } else if (log.includes("[SUCCESS]") || log.includes("[FAILED]")) {
      processedCountRef.current += 1;
      const match = log.match(/(?:SUCCESS|FAILED)\]\s+([A-Z0-9.-]+)/i);
      const symbol = match ? match[1] : "...";
      if (toastIdRef.current) {
        const displayProgress = totalCountRef.current ? Math.min(processedCountRef.current, totalCountRef.current) : processedCountRef.current;
        toast.loading(`Processing ${displayProgress}/${totalCountRef.current || "..."} ...\nFetching history & calculating scores (${symbol})`, {
          id: toastIdRef.current,
          position: "bottom-right",
        });
      }
    } else if (log.includes("Completed page processing")) {
      if (toastIdRef.current) {
        toast.success("Complete page processing", {
          id: toastIdRef.current,
          position: "bottom-right",
        });
        toastIdRef.current = null;
      }
    }
  });

  useEffect(() => {
    if (settings && !selectedStrategy) {
      setSelectedStrategy(settings.default_strategy || "day");
    }
  }, [settings, selectedStrategy]);

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: liveScreenerKeys.all,
      });
      toast.success("Live stock data refreshed successfully!");
    } catch (err) {
      toast.error("Failed to refresh live data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const activeStrategy = selectedStrategy || settings?.default_strategy || "day";

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useGetInfiniteLiveStockData(
    {
      limit: 16, // Use multiple of 1, 2, 4 for clean grid matching
      search: backendSearch || undefined,
      exchange: selectedExchange !== "ALL" ? selectedExchange : undefined,
      strategy: activeStrategy,
    },
    {
      enabled: !!settings,
    },
  );

  // Flatten items across all fetched pages
  const rawStockDataItems = data?.pages.flatMap((page) => page.items) || [];

  // Check client-side matches first. If none, trigger backend search
  useEffect(() => {
    if (!debouncedSearch) {
      setBackendSearch(undefined);
      return;
    }

    const hasLocalMatches = rawStockDataItems.some(
      (item: any) => item.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()) || item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );

    if (!hasLocalMatches) {
      setBackendSearch(debouncedSearch);
    } else {
      setBackendSearch(undefined);
    }
  }, [debouncedSearch]);

  const handleWatchlistToggle = async (stockId: number | string, currentWatchlist: boolean, symbol: string) => {
    try {
      const item = rawStockDataItems.find((s) => s.symbol === symbol);
      if (item) {
        // Optimistically update frontend cache
        queryClient.setQueryData(
          [
            ...liveScreenerKeys.all,
            "data",
            "infinite",
            {
              limit: 16,
              search: backendSearch || undefined,
              exchange: selectedExchange !== "ALL" ? selectedExchange : undefined,
              strategy: activeStrategy,
            },
          ],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                items: page.items.map((stock: any) => (stock.symbol === symbol ? { ...stock, watchlist: !currentWatchlist } : stock)),
              })),
            };
          },
        );

        const updatedStock = await updateStockApi(stockId, {
          symbol: item.symbol,
          name: item.name,
          exchange: item.exchange,
          price: Math.round(item.close || item.price || 0),
          watchlist: !currentWatchlist,
        });

        // Update the resolved stock ID if it was inserted
        if (updatedStock && typeof stockId === "string") {
          queryClient.setQueryData(
            [
              ...liveScreenerKeys.all,
              "data",
              "infinite",
              {
                limit: 16,
                search: backendSearch || undefined,
                exchange: selectedExchange !== "ALL" ? selectedExchange : undefined,
                strategy: activeStrategy,
              },
            ],
            (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  items: page.items.map((stock: any) => (stock.symbol === symbol ? { ...stock, stockId: updatedStock.id } : stock)),
                })),
              };
            },
          );
        }

        toast.success(`${symbol} ${!currentWatchlist ? "added to" : "removed from"} watchlist.`);
      }
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
      toast.error("Failed to update watchlist status.");
    }
  };

  // Filter items on the client-side unless a backend search is active (since backend already filtered it)
  const displayedItems = rawStockDataItems.filter((item: any) => {
    // Watchlist filter
    if (onlyWatchlist && !item.watchlist) return false;

    // Search filter (unless backend search is active)
    if (!backendSearch && search) {
      const query = search.toLowerCase();
      const matchSearch = item.symbol.toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
      if (!matchSearch) return false;
    }

    return true;
  });

  const stockDataItems = [...displayedItems].sort((a, b) => {
    if (activeStrategy === "day") {
      return (b.dayScore ?? -1) - (a.dayScore ?? -1);
    } else if (activeStrategy === "swing") {
      return (b.swingScore ?? -1) - (a.swingScore ?? -1);
    } else if (activeStrategy === "position") {
      return (b.positionScore ?? -1) - (a.positionScore ?? -1);
    }
    return 0;
  });
  const total = data?.pages[0]?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-border/50 pb-5">
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
          <TrendingUpIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Live Screener</h1>
          <p className="text-sm text-muted-foreground">Analyze real-time stock prices and dynamic indicator scoring calculated on-the-fly.</p>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
          {/* Ticker Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by stock ticker symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/50 border-border/70"
            />
          </div>

          {/* Watchlist Toggle */}
          <Button
            variant={onlyWatchlist ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyWatchlist(!onlyWatchlist)}
            className="h-8 text-xs flex items-center gap-1.5 shrink-0"
          >
            <StarIcon className={`h-3.5 w-3.5 ${onlyWatchlist ? "fill-current text-amber-400" : "text-muted-foreground"}`} />
            Watchlist Only
          </Button>

          {/* Exchange Filter */}
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="h-8 text-xs bg-background/50 border border-border/70 rounded-md px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/35 cursor-pointer font-medium shrink-0"
          >
            <option value="ALL">All Exchanges</option>
            <option value="IDX">IDX (Indonesia)</option>
            <option value="NYSE">NYSE (USA)</option>
            <option value="NASDAQ">NASDAQ (USA)</option>
          </select>

          {/* Strategy Filter */}
          <select
            value={activeStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="h-8 text-xs bg-background/50 border border-border/70 rounded-md px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/35 cursor-pointer font-medium shrink-0"
          >
            <option value="day">Day Trading</option>
            <option value="swing">Swing Trading</option>
            <option value="position">Position Trading</option>
          </select>
        </div>

        {/* Refresh Control */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            size="sm"
            className="h-8 text-xs px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Live Data"}
          </Button>
        </div>
      </div>

      {/* Live Stock Data Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground border border-border bg-card/45 backdrop-blur-md rounded-lg shadow-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading live data and calculating scores...</span>
          </div>
        ) : stockDataItems.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground p-4 text-center border border-border bg-card/45 backdrop-blur-md rounded-lg shadow-sm">
            No live stock records found. Check search filters or active provider settings.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stockDataItems.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/screener/${item.symbol}?strategy=${activeStrategy}`}
                  state={{ from: "/live-screener" }}
                  className="p-4 rounded-xl border border-border bg-card/45 backdrop-blur-md hover:bg-muted/5 transition-all duration-300 flex flex-col justify-between shadow-sm cursor-pointer hover:border-emerald-500/40 hover:shadow-emerald-500/5 group"
                >
                  <div className="space-y-2">
                    {/* Row 1: Symbol & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWatchlistToggle(item.stockId, !!item.watchlist, item.symbol);
                          }}
                          className="text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                          title={item.watchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          <StarIcon className={`h-3.5 w-3.5 ${item.watchlist ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                        </button>
                        <span className="font-bold text-xs text-emerald-400 font-mono">{item.symbol}</span>
                        {item.exchange && (
                          <span className="text-[8px] font-bold font-mono text-muted-foreground/50 bg-muted px-1 rounded border border-border/20 uppercase">{item.exchange}</span>
                        )}
                        <span className="text-[9px] text-muted-foreground/60 font-mono">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex gap-1 items-center justify-center">
                        {activeStrategy === "day" && item.dayScore !== null && (
                          <span
                            className={`text-[9px] font-bold py-[2px] px-[8px] rounded-full ${
                              item.dayScore >= 70 ? "text-emerald-500 bg-emerald-500/20" : item.dayScore >= 40 ? "text-amber-500 bg-amber-500/20" : "text-rose-500 bg-rose-500/20"
                            }`}
                          >
                            {item.dayScore} / 100
                          </span>
                        )}
                        {activeStrategy === "swing" && item.swingScore !== null && (
                          <span
                            className={`text-[9px] font-bold py-[2px] px-[8px] rounded-full ${
                              item.swingScore >= 70
                                ? "text-emerald-500 bg-emerald-500/20"
                                : item.swingScore >= 40
                                  ? "text-amber-500 bg-amber-500/20"
                                  : "text-rose-500 bg-rose-500/20"
                            }`}
                          >
                            {item.swingScore} / 100
                          </span>
                        )}
                        {activeStrategy === "position" && item.positionScore !== null && (
                          <span
                            className={`text-[9px] font-bold py-[2px] px-[8px] rounded-full ${
                              item.positionScore >= 70
                                ? "text-emerald-500 bg-emerald-500/20"
                                : item.positionScore >= 40
                                  ? "text-amber-500 bg-amber-500/20"
                                  : "text-rose-500 bg-rose-500/20"
                            }`}
                          >
                            {item.positionScore} / 100
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Price | Icon Change (Change%) */}
                    <div className="flex justify-between items-center gap-1.5 flex-wrap">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground/60 uppercase">Harga Terakhir</span>
                        <span className="text-md font-bold font-mono text-foreground">
                          {item.close.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                          <span className={`text-[10px] pl-2 ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {item.change >= 0 ? "+" : "-"}
                            {Math.abs(item.change).toFixed(2)}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-muted-foreground/60 uppercase">Perubahan Harian</span>
                        {item.change !== null && item.change !== undefined && item.changePercent !== null && item.changePercent !== undefined ? (
                          <span className={`inline-flex items-center gap-0.5 text-md font-bold font-mono ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {item.change >= 0 ? <ArrowUpIcon className="h-3.5 w-3.5 shrink-0" /> : <ArrowDownIcon className="h-3.5 w-3.5 shrink-0" />}
                            {Math.abs(item.changePercent).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/45">-</span>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Company Name */}
                    <div className="text-[10px] text-muted-foreground truncate font-medium border-t border-border/20 uppercase pt-2 mt-2" title={item.name}>
                      {item.name || "-"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Manual Pagination Trigger */}
            <div className="py-6 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading more stocks...</span>
                </div>
              ) : hasNextPage ? (
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isRefreshing || isFetchingNextPage}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold px-4 py-2 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/10"
                >
                  Load More Stocks
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground/40 font-medium">Showing all {total} stocks</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LiveScreenerPage;
