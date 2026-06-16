import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LineChartIcon } from "lucide-react";
import { BacktestResult } from "../types/backtest.types";

interface BacktestChartsProps {
  backtestResult: BacktestResult | null;
}

export function BacktestCharts({ backtestResult }: BacktestChartsProps) {
  const formattedChartData =
    backtestResult?.equityCurve?.map((c) => ({
      ...c,
      date: new Date(c.date).toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
      Strategy: Number(((c.capital / backtestResult.initialCapital) * 100).toFixed(1)),
      Benchmark: Number(((c.benchmark / backtestResult.initialCapital) * 100).toFixed(1)),
    })) || [];

  return (
    <div className="h-72 w-full flex items-center justify-center">
      {backtestResult ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="date" stroke="#888888" fontSize={9} />
            <YAxis stroke="#888888" fontSize={9} tickFormatter={(val) => `${val}%`} />
            <Tooltip contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="Strategy" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Benchmark" stroke="#888888" strokeWidth={1} dot={false} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center space-y-2">
          <LineChartIcon className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">Run a backtest simulation to view the equity performance curve.</p>
        </div>
      )}
    </div>
  );
}
