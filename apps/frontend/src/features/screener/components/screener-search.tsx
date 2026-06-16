import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export interface ScreenerSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function ScreenerSearch({ onSearch, isLoading }: ScreenerSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  const suggestions = ["AAPL", "MSFT", "TSLA", "BBCA", "TLKM", "NVDA"];

  return (
    <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-5 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-indigo-400" />
        Search Global & Indonesian Stocks
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ticker symbol or company name (e.g., Apple, BBCA, MSFT)..."
            className="pl-9 bg-background/50 border-border/70 text-xs h-10"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()} className="h-10 text-xs px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition">
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Popular ticker shortcuts:</span>
        {suggestions.map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => handleSuggestionClick(symbol)}
            className="px-2 py-1 rounded bg-muted/50 hover:bg-indigo-500/10 hover:text-indigo-400 border border-border/60 hover:border-indigo-500/30 text-[10px] font-mono font-bold transition"
            disabled={isLoading}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
