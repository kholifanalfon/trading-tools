import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetInfiniteStockData } from "../hooks/use-get-stock-data";
import { useSyncHistorical } from "../hooks/use-sync-historical";
import { getHistoricalSyncStatusApi } from "../services/screener.api";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { useQueryClient } from "@tanstack/react-query";
import { screenerKeys } from "../screener.keys";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { updateStockApi } from "@/features/stocks/services/stocks.api";
import {
  TrendingUpIcon,
  SearchIcon,
  RefreshCw,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DatePicker } from "@/shared/components/ui/date-picker";

export function ScreenerPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string>("ALL");

  const handleWatchlistToggle = async (stockId: number, currentWatchlist: boolean, symbol: string) => {
    try {
      await updateStockApi(stockId, { watchlist: !currentWatchlist });
      queryClient.invalidateQueries({
        queryKey: [...screenerKeys.all, "data"],
      });
      toast.success(`${symbol} ${!currentWatchlist ? "added to" : "removed from"} watchlist.`);
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
      toast.error("Failed to update watchlist status.");
    }
  };

  const queryClient = useQueryClient();
  const syncHistoricalMutation = useSyncHistorical();
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Listen to historical sync updates in real-time via WebSockets
  useWebSocket(["screener", "sync-status"], (data) => {
    if (data.status === "running") {
      setIsSyncing(true);
    } else if (data.status === "success") {
      setIsSyncing(false);
      toast.success("Historical stock data synchronized successfully!");
      queryClient.invalidateQueries({
        queryKey: [...screenerKeys.all, "data"],
      });
    } else if (data.status === "failed") {
      setIsSyncing(false);
      toast.error(
        `Historical stock sync failed: ${data.error || "Unknown error"}`,
      );
      queryClient.invalidateQueries({
        queryKey: [...screenerKeys.all, "data"],
      });
    }
  });

  // Check initial sync status on mount
  useEffect(() => {
    let active = true;
    const checkInitialSyncStatus = async () => {
      try {
        const state = await getHistoricalSyncStatusApi();
        if (active) {
          if (state.status === "running") {
            setIsSyncing(true);
          }
        }
      } catch (err) {
        console.error("Error checking sync status:", err);
      }
    };

    checkInitialSyncStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleSyncHistorical = async () => {
    try {
      setIsSyncing(true);
      const targetDate = selectedDate || new Date().toISOString().split("T")[0];
      await syncHistoricalMutation.mutateAsync(targetDate);
      toast.success(
        `Historical data sync started for ${targetDate} in the background!`,
      );
    } catch (err) {
      console.error("Failed to start sync:", err);
      toast.error(err instanceof Error ? err.message : "Sync trigger failed");
      setIsSyncing(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useGetInfiniteStockData({
      limit: 16, // Use multiple of 1, 2, 4 for clean grid matching
      search: debouncedSearch || undefined,
      date: selectedDate || undefined,
      watchlist: onlyWatchlist ? true : undefined,
      exchange: selectedExchange !== "ALL" ? selectedExchange : undefined,
    });

  // Fetch next page when bottom is reached
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten items across all fetched pages
  const stockDataItems = data?.pages.flatMap((page) => page.items) || [];
  const total = data?.pages[0]?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-border/50 pb-5">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <TrendingUpIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Stock Screener
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyze historical daily stock prices loaded from local database
            ingestion runs.
          </p>
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

          {/* Date Filter */}
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Filter by date..."
            className="w-full sm:w-48"
          />

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
            className="h-8 text-xs bg-background/50 border border-border/70 rounded-md px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/35 cursor-pointer font-medium shrink-0"
          >
            <option value="ALL">All Exchanges</option>
            <option value="IDX">IDX (Indonesia)</option>
            <option value="NYSE">NYSE (USA)</option>
            <option value="NASDAQ">NASDAQ (USA)</option>
          </select>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncHistorical}
            disabled={isSyncing}
            size="sm"
            className="h-8 text-xs px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Stock Data"}
          </Button>
        </div>
      </div>

      {/* Historical Stock Data Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground border border-border bg-card/45 backdrop-blur-md rounded-lg shadow-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading database records...</span>
          </div>
        ) : stockDataItems.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground p-4 text-center border border-border bg-card/45 backdrop-blur-md rounded-lg shadow-sm">
            No stock data records found in database. Please run historical sync
            on Ingestion Logs.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stockDataItems.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/screener/${item.symbol}`}
                  className="p-4 rounded-xl border border-border bg-card/45 backdrop-blur-md hover:bg-muted/5 transition-all duration-300 flex flex-col justify-between shadow-sm cursor-pointer hover:border-indigo-500/40 hover:shadow-indigo-500/5 group"
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
                        <span className="font-bold text-xs text-indigo-400 font-mono">
                          {item.symbol}
                        </span>
                        {item.exchange && (
                          <span className="text-[8px] font-bold font-mono text-muted-foreground/50 bg-muted px-1 rounded border border-border/20 uppercase">
                            {item.exchange}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 font-mono">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Row 2: Price | Icon Change (Change%) */}
                    <div className="flex justify-between items-center gap-1.5 flex-wrap">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground/60 uppercase">
                          Harga Terakhir
                        </span>
                        <span className="text-md font-bold font-mono text-foreground">
                          {item.close.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                          <span
                            className={`text-[10px] pl-2 ${
                              item.change >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {item.change >= 0 ? "+" : "-"}
                            {Math.abs(item.change).toFixed(2)}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-muted-foreground/60 uppercase">
                          Perubahan Harian
                        </span>
                        {item.change !== null &&
                        item.change !== undefined &&
                        item.changePercent !== null &&
                        item.changePercent !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-0.5 text-,d font-bold font-mono ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {item.change >= 0 ? (
                              <ArrowUpIcon className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <ArrowDownIcon className="h-3.5 w-3.5 shrink-0" />
                            )}
                            {Math.abs(item.changePercent).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/45">
                            -
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Company Name */}
                    <div
                      className="text-[10px] text-muted-foreground truncate font-medium border-t border-border/20 uppercase"
                      title={item.name}
                    >
                      {item.name || "-"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="py-6 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading more stocks...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-xs text-muted-foreground/60">
                  Scroll down to load more
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/40 font-medium">
                  Showing all {total} stocks
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ScreenerPage;
