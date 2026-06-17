import { HistoryIcon } from "lucide-react";
import { BacktestResult } from "../types/backtest.types";

interface TradesTableProps {
  backtestResult: BacktestResult | null;
}

export function TradesTable({ backtestResult }: TradesTableProps) {
  return (
    <div className="max-h-72 overflow-y-auto overflow-x-auto pr-1 w-full">
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
  );
}
