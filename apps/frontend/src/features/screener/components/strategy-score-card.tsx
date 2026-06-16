import { ActivityIcon } from "lucide-react";

export interface StrategyScoreCardProps {
  scorePayload: any;
  date: string | null;
  activeScoreTab: "day" | "swing" | "position";
  setActiveScoreTab: (tab: "day" | "swing" | "position") => void;
}

export function StrategyScoreCard({ scorePayload, date, activeScoreTab, setActiveScoreTab }: StrategyScoreCardProps) {
  if (!scorePayload) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getBarColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-card/45 border border-border p-4 rounded-xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <ActivityIcon className="h-3.5 w-3.5 text-indigo-400" />
          Strategy Score Breakdown
        </h3>
        <div className="text-[10px] text-muted-foreground font-semibold font-mono">
          {date &&
            new Date(date).toLocaleDateString("id-ID", {
              month: "short",
              day: "numeric",
            })}
        </div>
      </div>

      {/* Tabs for activeScoreTab */}
      <div className="grid grid-cols-3 gap-1 bg-muted/30 p-0.5 rounded-lg border border-border/30">
        {(["day", "swing", "position"] as const).map((tab) => {
          const isActive = activeScoreTab === tab;
          const label = tab === "day" ? "Day" : tab === "swing" ? "Swing" : "Position";
          return (
            <button
              key={tab}
              onClick={() => setActiveScoreTab(tab)}
              className={`py-1 text-[10px] font-bold rounded transition-all duration-200 capitalize ${
                isActive ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted/20"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Score content based on tab */}
      {(() => {
        if (activeScoreTab === "day" && scorePayload.dayScore) {
          const d = scorePayload.dayScore;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/10 p-2 rounded-lg border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Total Day Score</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border font-mono ${getScoreColor(d.total)}`}>{d.total} / 100</span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Relative Volume (RVOL)</span>
                    <span className="font-bold text-foreground">{d.rvol} / 35</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(d.rvol)}`} style={{ width: `${(d.rvol / 35) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Volatility (ATR %)</span>
                    <span className="font-bold text-foreground">{d.atr} / 25</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(d.atr)}`} style={{ width: `${(d.atr / 25) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Gap %</span>
                    <span className="font-bold text-foreground">{d.gap} / 15</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(d.gap)}`} style={{ width: `${(d.gap / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Momentum (RSI 14)</span>
                    <span className="font-bold text-foreground">{d.rsi} / 15</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(d.rsi)}`} style={{ width: `${(d.rsi / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Liquidity</span>
                    <span className="font-bold text-foreground">{d.liquidity} / 10</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(d.liquidity)}`} style={{ width: `${(d.liquidity / 10) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (activeScoreTab === "swing" && scorePayload.swingScore) {
          const s = scorePayload.swingScore;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/10 p-2 rounded-lg border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Total Swing Score</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border font-mono ${getScoreColor(s.total)}`}>{s.total} / 100</span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Trend Alignment</span>
                    <span className="font-bold text-foreground">{s.trend} / 35</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(s.trend)}`} style={{ width: `${(s.trend / 35) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">MACD Setup</span>
                    <span className="font-bold text-foreground">{s.macd} / 25</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(s.macd)}`} style={{ width: `${(s.macd / 25) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">RSI Setup</span>
                    <span className="font-bold text-foreground">{s.rsi} / 20</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(s.rsi)}`} style={{ width: `${(s.rsi / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Volume Trend</span>
                    <span className="font-bold text-foreground">{s.volume} / 10</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(s.volume)}`} style={{ width: `${(s.volume / 10) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Proximity</span>
                    <span className="font-bold text-foreground">{s.proximity} / 10</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(s.proximity)}`} style={{ width: `${(s.proximity / 10) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (activeScoreTab === "position" && scorePayload.positionScore) {
          const p = scorePayload.positionScore;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/10 p-2 rounded-lg border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Total Position Score</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border font-mono ${getScoreColor(p.total)}`}>{p.total} / 100</span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Long-Term Trend</span>
                    <span className="font-bold text-foreground">{p.trend} / 40</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(p.trend)}`} style={{ width: `${(p.trend / 40) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Price Strength (52W High)</span>
                    <span className="font-bold text-foreground">{p.priceStrength} / 25</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(p.priceStrength)}`}
                      style={{
                        width: `${(p.priceStrength / 25) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Long-term Momentum</span>
                    <span className="font-bold text-foreground">{p.momentum} / 20</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(p.momentum)}`} style={{ width: `${(p.momentum / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground font-semibold">Low Volatility</span>
                    <span className="font-bold text-foreground">{p.volatility} / 15</span>
                  </div>
                  <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${getBarColor(p.volatility)}`} style={{ width: `${(p.volatility / 15) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return <div className="text-xs text-muted-foreground italic text-center py-2">Tidak ada data score breakdown.</div>;
      })()}
    </div>
  );
}
