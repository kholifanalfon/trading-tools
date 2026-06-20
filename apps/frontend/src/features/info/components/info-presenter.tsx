import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TechStackInfo } from "../types/info.types";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { Portfolio, UserHoldingAsset } from "../../portfolio/types/portfolio.types";
import { TradingJournal } from "../../journal/types/journal.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { ArrowUpRight, TrendingUp, TrendingDown, Percent, Wallet, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { LiveScreenerStockItem } from "@/features/screener/types/screener.types";

export interface InfoPresenterProps {
  backendStack: TechStackInfo | undefined;
  isLoading: boolean;
  error: unknown;
  frontendStack: Array<{ name: string; desc: string; type: string }>;
  onTestFrontendSentry: () => void;
  onTestBackendSentry: () => void;
  portfolios?: Portfolio[];
  journals?: TradingJournal[];
  topStocks?: LiveScreenerStockItem[];
  holdings?: UserHoldingAsset[];
}

export function InfoPresenter({
  backendStack,
  isLoading,
  error,
  frontendStack,
  onTestFrontendSentry,
  onTestBackendSentry,
  portfolios = [],
  journals = [],
  topStocks = [],
  holdings = [],
}: InfoPresenterProps) {
  // Aggregate portfolio data
  const totalBalance = portfolios.reduce((sum, p) => sum + Number(p.balance || 0), 0);

  // Aggregate journal data
  const closedJournals = journals.filter((j) => j.status === "CLOSED");
  const totalRealizedPnL = closedJournals.reduce((sum, j) => sum + Number(j.pnl || 0), 0);
  const winTrades = closedJournals.filter((j) => Number(j.pnl || 0) > 0).length;
  const winRate = closedJournals.length > 0 ? (winTrades / closedJournals.length) * 100 : 0;
  const openTrades = journals.filter((j) => j.status === "OPEN").length;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
          <div>
            <Badge variant="indigo" className="px-2.5 py-0.5 font-mono tracking-wider mb-2">
              TRADING ENGINE ACTIVE
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back, Trader</h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time portfolio summary, journal statistics, and live screener insights.</p>
          </div>

          <div className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-border bg-card shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">System Status:</span>
            {isLoading ? (
              <div className="flex items-center gap-1.5 text-yellow-500 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Syncing...
              </div>
            ) : error ? (
              <div className="flex items-center gap-1.5 text-destructive text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-destructive"></span>
                Error
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </div>
            )}
          </div>
        </div>

        {/* error message display */}
        {!!error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Portfolio Overview Row */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
            <CardHeader className="p-3">
              <CardDescription className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Total Cash Balance
                <Wallet className="h-4 w-4 text-indigo-400" />
              </CardDescription>
              <CardTitle className="text-lg font-bold text-foreground">IDR {totalBalance.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</CardTitle>
            </CardHeader>
          </Card>

          <Card className={`bg-gradient-to-br border-border/30 ${totalRealizedPnL >= 0 ? "from-emerald-500/10" : "from-rose-500/10"}`}>
            <CardHeader className="p-3">
              <CardDescription className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Net Realized PnL
                {totalRealizedPnL >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-rose-400" />}
              </CardDescription>
              <CardTitle className={`text-lg font-bold ${totalRealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                IDR {totalRealizedPnL.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardDescription className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Win Rate (Closed)
                <Percent className="h-4 w-4 text-amber-400" />
              </CardDescription>
              <CardTitle className="text-lg font-bold text-amber-400">{winRate.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardDescription className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Open Positions
                <Activity className="h-4 w-4 text-sky-400" />
              </CardDescription>
              <CardTitle className="text-lg font-bold text-sky-400">{openTrades} Active</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Active Holdings & Target TP/SL Status */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">Active Stock Positions & Targets (TP/SL)</h2>
              <p className="text-xs text-muted-foreground">Real-time status of your active holdings and risk management parameters</p>
            </div>
            <Badge variant="indigo" className="font-mono text-xs">
              {holdings.length} Positions
            </Badge>
          </div>

          {holdings.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm border-dashed">
              {isLoading ? "Fetching active holdings..." : "No active holdings found in your portfolios. Start buying stocks to set TP/SL targets!"}
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {holdings.map((holding) => {
                const qty = Number(holding.quantity);
                const avg = Number(holding.averagePurchasePrice);
                const tpVal = holding.takeProfit ? Number(holding.takeProfit) : null;
                const slVal = holding.stopLoss ? Number(holding.stopLoss) : null;

                // Match current price from topStocks or live screeners
                const matchedStock = topStocks.find((s) => s.symbol.toUpperCase() === holding.symbol.toUpperCase());
                const currentPrice = matchedStock ? Number(matchedStock.close || matchedStock.price || 0) : null;

                const isTpHit = !!(currentPrice && tpVal && currentPrice >= tpVal);
                const isSlHit = !!(currentPrice && slVal && currentPrice <= slVal);

                let cardBorderClass = "border-border/60 hover:border-indigo-500/30";
                if (isTpHit) {
                  cardBorderClass = "border-emerald-500 bg-emerald-950/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20";
                } else if (isSlHit) {
                  cardBorderClass = "border-rose-500 bg-rose-950/10 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/20";
                }

                let cardBackground = "";
                if (isTpHit) cardBackground = "bg-emerald-500/10";
                if (isSlHit) cardBackground = "bg-rose-500/10";

                let statusBadge: React.ReactNode;
                if (currentPrice) {
                  if (isTpHit) {
                    statusBadge = (
                      <Badge variant="emerald" className="animate-bounce text-[9px] px-1.5 py-0.5 h-auto">
                        TP Hit 🟢
                      </Badge>
                    );
                  } else if (isSlHit) {
                    statusBadge = (
                      <Badge variant="destructive" className="animate-pulse text-[9px] px-1.5 py-0.5 h-auto">
                        SL Hit 🔴
                      </Badge>
                    );
                  } else if (tpVal || slVal) {
                    statusBadge = (
                      <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[9px] px-1.5 py-0.5 h-auto">
                        Within Target
                      </Badge>
                    );
                  } else {
                    statusBadge = <span className="text-muted-foreground text-[10px]">No Target Set</span>;
                  }
                } else {
                  statusBadge = (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[9px] px-1.5 py-0.5 h-auto">
                      Within Target
                    </Badge>
                  );
                }

                return (
                  <Card key={holding.id} className={`relative overflow-hidden border transition-all hover:shadow-md ${cardBorderClass}`}>
                    {isTpHit && (
                      <div className="bg-emerald-600 text-white font-extrabold text-center text-[8px] py-0.5 animate-pulse uppercase tracking-wider">
                        ⚠️ TP HIT - JUAL SEKARANG! 🟢
                      </div>
                    )}
                    {isSlHit && (
                      <div className="bg-rose-600 text-white font-extrabold text-center text-[8px] py-0.5 animate-pulse uppercase tracking-wider">
                        ⚠️ SL HIT - JUAL SEKARANG! 🔴
                      </div>
                    )}
                    <div className={`p-3 space-y-2 ${cardBackground}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <Link to={`/screener/${holding.symbol}`} className="text-sm font-bold text-indigo-400 hover:underline">
                            {holding.symbol}
                          </Link>
                          <p className="text-[9px] text-muted-foreground">{holding.portfolioName}</p>
                        </div>
                        <div>{statusBadge}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs border-t border-b border-border/40 py-1.5">
                        <div className="flex flex-col justify-between">
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="font-semibold text-foreground">{(qty / 100).toLocaleString("id-ID")} Lot</span>
                        </div>
                        <div className="flex flex-col justify-between">
                          <span className="text-muted-foreground font-medium">Last Price:</span>
                          <span className="font-bold text-foreground">{currentPrice ? `IDR ${currentPrice.toLocaleString("id-ID")}` : "-"}</span>
                        </div>
                        <div className="flex flex-col justify-between">
                          <span className="text-muted-foreground">Avg:</span>
                          <span className="font-semibold text-foreground">IDR {avg.toLocaleString("id-ID")}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <div>
                          <span>TP Target: </span>
                          <span className="font-semibold text-emerald-500/90">
                            {tpVal ? `IDR ${tpVal.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span>SL Target: </span>
                          <span className="font-semibold text-rose-500/90">
                            {slVal ? `IDR ${slVal.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Screener Top 5 Stocks & Quick Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top 5 Stocks Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Top 5 Live Screener Stocks</CardTitle>
                <CardDescription>Highest technical score recommendations for active day strategy</CardDescription>
              </div>
              <Link to="/live-screener" className="w-full md:w-auto">
                <Button size="sm" variant="outline" className="text-xs w-full md:w-auto">
                  Full Screener <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Symbol</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right pr-6">Day Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                        {isLoading ? "Fetching top stock screeners..." : "No live stock data found. Verify your stock screener setup."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    topStocks.map((stock) => {
                      const isPositive = (stock.changePercent ?? 0) >= 0;
                      return (
                        <TableRow key={stock.symbol} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="pl-6 font-bold text-foreground">
                            <Link to={`/screener/${stock.symbol}`} className="hover:text-indigo-400">
                              {stock.symbol}
                              <div className="text-[10px] font-normal text-muted-foreground leading-tight">({stock.name})</div>
                            </Link>
                          </TableCell>
                          <TableCell className="w-[100px] text-xs text-right font-medium">
                            IDR {Number(stock.close || stock.price || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className={`text-xs text-right font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPositive ? "+" : ""}
                            {stock.changePercent?.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Badge variant={(stock.dayScore ?? 0) >= 70 ? "emerald" : "indigo"} className="font-mono text-xs px-2 py-0.5">
                              {stock.dayScore ?? "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions & Sentry Sandbox Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription>Shortcut tools to manage your portfolio holdings</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4">
                <Link to="/portfolio">
                  <Button className="w-full justify-start text-xs font-semibold py-5" variant="default">
                    💼 Go to My Portfolios
                  </Button>
                </Link>
                <Link to="/journal">
                  <Button className="w-full justify-start text-xs font-semibold py-5" variant="outline">
                    📝 Open Trading Journal
                  </Button>
                </Link>
                <Link to="/live-screener">
                  <Button className="w-full justify-start text-xs font-semibold py-5" variant="secondary">
                    🔍 Scan Market Stocks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-semibold">Diagnostics & Sentry Sandbox</CardTitle>
                <CardDescription className="text-xs">Trigger exceptions to test Sentry capturing</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4">
                <Button variant="outline" size="sm" className="text-xs justify-start h-9" onClick={onTestFrontendSentry}>
                  🚨 Test Frontend Sentry
                </Button>
                <Button variant="outline" size="sm" className="text-xs justify-start h-9" onClick={onTestBackendSentry} disabled={isLoading || !!error}>
                  ⚡ Test Backend Sentry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Collapsible/Details Tech Stack Section */}
        <details className="group border border-border/60 bg-muted/20 rounded-lg overflow-hidden transition-all">
          <summary className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 cursor-pointer select-none hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono group-open:rotate-90 transition-transform">▶</span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Developer Specifications & Tech Stack Configuration</span>
            </div>
            <Badge variant="indigo" className="text-xs font-mono mt-2 md:mt-0">
              Click to view details
            </Badge>
          </summary>

          <div className="p-6 border-t border-border/40 bg-card grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend Stack */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-indigo-400">Frontend Application (React + Vite)</h3>
              <div className="divide-y divide-border text-xs">
                {frontendStack.map((tech) => (
                  <div key={tech.name} className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">{tech.name}</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">{tech.desc}</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border font-mono whitespace-nowrap">{tech.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Stack */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-emerald-400">Backend Module (Express + Bun)</h3>
              {backendStack ? (
                <div className="divide-y divide-border text-xs">
                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Runtime Engine</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">High-performance JavaScript runtime</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.runtime}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">HTTP Framework</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">Minimalist and flexible routing layer</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.framework}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Database ORM</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">Type-safe SQL queries</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.orm}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Primary Database</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">Relational database and connection layer</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.database}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Structured Logger</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">Performance-focused logger</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.logger}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Input Validation</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">TypeScript-first schema validation</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.validation}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Authentication</h4>
                      <p className="text-2xs text-muted-foreground mt-0.5">JWT payload sign, verify, and encryption</p>
                    </div>
                    <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.auth}</span>
                  </div>

                  {backendStack.version && (
                    <div className="py-2.5 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">API Version</h4>
                        <p className="text-2xs text-muted-foreground mt-0.5">Current active endpoint version</p>
                      </div>
                      <span className="text-2xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono">{backendStack.version}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-xs">
                  <span>No backend stack specifications loaded.</span>
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
