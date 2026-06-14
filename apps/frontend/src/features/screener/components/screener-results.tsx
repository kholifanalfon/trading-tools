import { StockSearchResult } from "../types/screener.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { TrendingUpIcon } from "lucide-react";

export interface ScreenerResultsProps {
  results: StockSearchResult[];
  onSelectSymbol: (symbol: string) => void;
  isLoading: boolean;
  selectedSymbol: string | null;
}

export function ScreenerResults({
  results,
  onSelectSymbol,
  isLoading,
  selectedSymbol,
}: ScreenerResultsProps) {
  return (
    <div className="rounded-lg border border-border bg-card/45 backdrop-blur-md shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-9 px-4 text-xs font-semibold">Symbol</TableHead>
            <TableHead className="h-9 px-4 text-xs font-semibold">Company Name</TableHead>
            <TableHead className="h-9 px-4 text-xs font-semibold">Instrument Type</TableHead>
            <TableHead className="h-9 px-4 text-xs font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Searching stocks...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                No matching stocks found. Try searching for a different ticker or name.
              </TableCell>
            </TableRow>
          ) : (
            results.map((item) => (
              <TableRow
                key={item.symbol}
                className={`hover:bg-muted/20 transition-colors ${
                  selectedSymbol === item.symbol ? "bg-indigo-500/5 hover:bg-indigo-500/10" : ""
                }`}
              >
                <TableCell className="py-2.5 px-4 font-semibold text-xs text-indigo-400 font-mono">
                  {item.symbol}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-xs text-foreground font-medium">
                  {item.description}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-xs text-muted-foreground">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-muted/65 text-[10px] uppercase font-semibold">
                    {item.type}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 px-4 text-right">
                  <Button
                    onClick={() => onSelectSymbol(item.symbol)}
                    className="flex items-center gap-1 h-7 text-[10px] px-2.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-400 border border-indigo-500/25 transition font-semibold"
                  >
                    <TrendingUpIcon className="h-3 w-3" />
                    Get Quote
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
