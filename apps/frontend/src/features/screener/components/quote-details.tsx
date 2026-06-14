import { StockQuote } from "../types/screener.types";
import { ArrowUpRightIcon, ArrowDownRightIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface QuoteDetailsProps {
  quote: StockQuote | undefined;
  symbol: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function QuoteDetails({ quote, symbol, isLoading, onRefresh }: QuoteDetailsProps) {
  if (isLoading) {
    return (
      <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md flex flex-col items-center justify-center h-48 text-muted-foreground text-xs gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Fetching real-time quote for {symbol.toUpperCase()}...</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md flex items-center justify-center h-48 text-muted-foreground text-xs">
        Select a stock from the results list to view real-time market quotes.
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 shadow-md overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`} />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h3 className="text-xl font-bold font-mono tracking-wider text-indigo-400">
              {quote.symbol}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Real-Time Quote</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 px-2.5 text-xs flex items-center gap-1.5"
            title="Refresh Quote"
          >
            <RefreshCwIcon className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Price & Changes */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <span className="text-3xl font-extrabold font-mono text-foreground">
              {quote.currentPrice.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {isPositive ? <ArrowUpRightIcon className="h-4.5 w-4.5" /> : <ArrowDownRightIcon className="h-4.5 w-4.5" />}
            <span className="font-mono">
              {isPositive ? "+" : ""}
              {quote.change.toLocaleString("en-US", { maximumFractionDigits: 4 })} (
              {isPositive ? "+" : ""}
              {quote.percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
          <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Open</span>
            <span className="text-xs font-bold font-mono text-foreground">
              {quote.open.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Prev Close</span>
            <span className="text-xs font-bold font-mono text-foreground">
              {quote.previousClose.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Daily High</span>
            <span className="text-xs font-bold font-mono text-foreground text-emerald-400">
              {quote.high.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Daily Low</span>
            <span className="text-xs font-bold font-mono text-foreground text-rose-400">
              {quote.low.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
