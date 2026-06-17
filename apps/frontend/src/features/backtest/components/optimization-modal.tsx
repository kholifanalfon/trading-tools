import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { SparklesIcon, TrendingUpIcon, SlidersHorizontalIcon } from "lucide-react";
import { OptimizationBaseline, AiAlternativeResponse } from "../types/backtest.types";

interface OptimizationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "data" | "ai";
  onTabChange: (tab: "data" | "ai") => void;
  parameters: Record<string, number>;
  metrics?: {
    totalReturnPercent: number;
    winRatePercent: number;
    maxDrawdownPercent: number;
    totalTrades: number;
  };
  isGlobal: boolean;
  strategy: "day" | "swing" | "position";
  optimizationBaseline: OptimizationBaseline | null;
  aiAlternative: AiAlternativeResponse | null;
  isLoadingAiAlternative: boolean;
  getParameterChangeDesc: (key: string, before: number, after: number) => string;
  beforeThresholdValue: (key: string) => number | string;
  beforeWeightValue: (paramName: string) => number | string;
  onConfirmApply: () => void;
  onApplyAiAlternative: () => void;
}

export function OptimizationModal({
  isOpen,
  onOpenChange,
  activeTab,
  onTabChange,
  parameters,
  metrics,
  isGlobal,
  strategy,
  optimizationBaseline,
  aiAlternative,
  isLoadingAiAlternative,
  getParameterChangeDesc,
  beforeThresholdValue,
  beforeWeightValue,
  onConfirmApply,
  onApplyAiAlternative,
}: OptimizationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-2xl md:max-w-4xl p-4 sm:p-6 bg-card border border-border/80 backdrop-blur-lg overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-400">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            Apply Optimized Parameters
          </DialogTitle>
          <DialogDescription>
            {isGlobal ? (
              <span>
                Apply setup optimal ke Database untuk strategi <strong className="text-foreground uppercase">{strategy}</strong> secara global (Multi-Stock).
              </span>
            ) : (
              <span>
                Apply setup optimal ke form input untuk strategi <strong className="text-foreground uppercase">{strategy}</strong> lokal.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 min-w-0 w-full">
          {/* TAB HEADER */}
          <div className="flex bg-muted/40 border border-border/60 p-1 rounded-lg">
            <button
              onClick={() => onTabChange("data")}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === "data" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Grid Best (Data)
            </button>
            <button
              onClick={() => onTabChange("ai")}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "ai" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SparklesIcon className="h-3.5 w-3.5 animate-pulse" />
              AI Suggestion (Gemini)
            </button>
          </div>

          {/* TAB CONTENT: DATA VERSION */}
          {activeTab === "data" && (
            <div className="space-y-4 min-w-0 w-full">
              {/* Performance Comparison Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUpIcon className="h-3.5 w-3.5 text-indigo-400" />
                  Expected Performance Summary
                </h4>
                <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30">
                  <table className="w-full min-w-[500px] text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                        <th className="px-3 py-2">Metric</th>
                        <th className="px-3 py-2 text-right">Before</th>
                        <th className="px-3 py-2 text-right">After (Optimized)</th>
                        <th className="px-3 py-2 text-right">Improvement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {/* Return % */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2 font-medium text-muted-foreground">Total Return</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {optimizationBaseline ? `${optimizationBaseline.totalReturnPercent >= 0 ? "+" : ""}${optimizationBaseline.totalReturnPercent.toFixed(1)}%` : "N/A"}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono font-bold ${metrics && metrics.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                          {metrics ? `${metrics.totalReturnPercent >= 0 ? "+" : ""}${metrics.totalReturnPercent.toFixed(1)}%` : "N/A"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">
                          {optimizationBaseline && metrics ? (
                            <span>
                              {metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent >= 0 ? "▲ +" : "▼ "}
                              {(metrics.totalReturnPercent - optimizationBaseline.totalReturnPercent).toFixed(1)}%
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                      {/* Win Rate */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2 font-medium text-muted-foreground">Win Rate</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {optimizationBaseline ? `${optimizationBaseline.winRatePercent.toFixed(1)}%` : "N/A"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">{metrics ? `${metrics.winRatePercent.toFixed(1)}%` : "N/A"}</td>
                        <td
                          className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && metrics && metrics.winRatePercent - optimizationBaseline.winRatePercent >= 0 ? "text-emerald-400" : "text-destructive"}`}
                        >
                          {optimizationBaseline && metrics ? (
                            <span>
                              {metrics.winRatePercent - optimizationBaseline.winRatePercent >= 0 ? "▲ +" : "▼ "}
                              {(metrics.winRatePercent - optimizationBaseline.winRatePercent).toFixed(1)}%
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                      {/* Max Drawdown */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2 font-medium text-muted-foreground">Max Drawdown</td>
                        <td className="px-3 py-2 text-right font-mono text-destructive">
                          {optimizationBaseline ? `-${optimizationBaseline.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-destructive">{metrics ? `-${metrics.maxDrawdownPercent.toFixed(1)}%` : "N/A"}</td>
                        <td
                          className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && metrics && metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent <= 0 ? "text-emerald-400" : "text-destructive"}`}
                        >
                          {optimizationBaseline && metrics ? (
                            <span>
                              {metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent <= 0 ? "▲ -" : "▼ +"}
                              {Math.abs(metrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent).toFixed(1)}%
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parameter Threshold Adjustments Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                  Parameter Threshold Adjustments
                </h4>
                <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30">
                  <table className="w-full min-w-[600px] text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                        <th className="px-3 py-2">Parameter</th>
                        <th className="px-3 py-2 text-right">Before</th>
                        <th className="px-3 py-2 text-right">After</th>
                        <th className="px-3 py-2">Keterangan Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {Object.entries(parameters)
                        .filter(([k]) => !k.startsWith("_weight:"))
                        .map(([k, v]) => {
                          const beforeVal = beforeThresholdValue(k);
                          const hasChanged = beforeVal !== v;

                          return (
                            <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                              <td className="px-3 py-2 font-medium capitalize text-muted-foreground">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</td>
                              <td className="px-3 py-2 text-right font-mono text-muted-foreground">{beforeVal}</td>
                              <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-emerald-400" : "text-muted-foreground"}`}>{v}</td>
                              <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">{getParameterChangeDesc(k, beforeVal as number, v)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Indicator Weights adjustments Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                  Indicator Weights Adjustments
                </h4>
                <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30">
                  <table className="w-full min-w-[600px] text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                        <th className="px-3 py-2">Indicator Rule</th>
                        <th className="px-3 py-2 text-right">Before</th>
                        <th className="px-3 py-2 text-right">After</th>
                        <th className="px-3 py-2">Keterangan Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {Object.entries(parameters)
                        .filter(([k]) => k.startsWith("_weight:"))
                        .map(([k, v]) => {
                          const paramName = k.replace("_weight:", "");
                          const beforeWeight = beforeWeightValue(paramName);
                          const hasChanged = beforeWeight !== v;

                          return (
                            <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                              <td className="px-3 py-2 font-medium capitalize text-muted-foreground">{paramName.replace(/_/g, " ").toLowerCase()}</td>
                              <td className="px-3 py-2 text-right font-mono text-muted-foreground">{beforeWeight}</td>
                              <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-emerald-400" : "text-muted-foreground"}`}>{v}</td>
                              <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">{getParameterChangeDesc(k, beforeWeight as number, v)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI SUGGESTION VERSION */}
          {activeTab === "ai" && (
            <div className="space-y-4 min-w-0 w-full">
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="h-4 w-4 text-indigo-400 animate-pulse" />
                <h4 className="text-xs font-bold text-foreground">AI Proposed Setting Suggestion (Gemini)</h4>
              </div>

              {isLoadingAiAlternative ? (
                <div className="p-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-3 animate-pulse flex flex-col justify-center items-center h-48">
                  <SparklesIcon className="h-6 w-6 text-indigo-400 animate-bounce" />
                  <div className="h-3 w-1/3 bg-indigo-500/20 rounded"></div>
                  <div className="h-3 w-1/2 bg-indigo-500/10 rounded"></div>
                </div>
              ) : aiAlternative ? (
                <div className="space-y-4">
                  {/* AI Performance Comparison Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <TrendingUpIcon className="h-3.5 w-3.5 text-indigo-400" />
                      Expected Performance Summary (AI Suggestion)
                    </h4>
                    <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30">
                      <table className="w-full min-w-[500px] text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                            <th className="px-3 py-2">Metric</th>
                            <th className="px-3 py-2 text-right">Before</th>
                            <th className="px-3 py-2 text-right">After (AI Suggested)</th>
                            <th className="px-3 py-2 text-right">Improvement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {/* Return % */}
                          <tr className="hover:bg-muted/10 transition-colors">
                            <td className="px-3 py-2 font-medium text-muted-foreground">Total Return</td>
                            <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                              {optimizationBaseline ? `${optimizationBaseline.totalReturnPercent >= 0 ? "+" : ""}${optimizationBaseline.totalReturnPercent.toFixed(1)}%` : "N/A"}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-mono font-bold ${aiAlternative.alternativeMetrics && aiAlternative.alternativeMetrics.totalReturnPercent >= 0 ? "text-emerald-400" : "text-destructive"}`}
                            >
                              {aiAlternative.alternativeMetrics
                                ? `${aiAlternative.alternativeMetrics.totalReturnPercent >= 0 ? "+" : ""}${aiAlternative.alternativeMetrics.totalReturnPercent.toFixed(1)}%`
                                : "N/A"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">
                              {optimizationBaseline && aiAlternative.alternativeMetrics ? (
                                <span>
                                  {aiAlternative.alternativeMetrics.totalReturnPercent - optimizationBaseline.totalReturnPercent >= 0 ? "▲ +" : "▼ "}
                                  {(aiAlternative.alternativeMetrics.totalReturnPercent - optimizationBaseline.totalReturnPercent).toFixed(1)}%
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </td>
                          </tr>
                          {/* Win Rate */}
                          <tr className="hover:bg-muted/10 transition-colors">
                            <td className="px-3 py-2 font-medium text-muted-foreground">Win Rate</td>
                            <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                              {optimizationBaseline ? `${optimizationBaseline.winRatePercent.toFixed(1)}%` : "N/A"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                              {aiAlternative.alternativeMetrics ? `${aiAlternative.alternativeMetrics.winRatePercent.toFixed(1)}%` : "N/A"}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && aiAlternative.alternativeMetrics && aiAlternative.alternativeMetrics.winRatePercent - optimizationBaseline.winRatePercent >= 0 ? "text-emerald-400" : "text-destructive"}`}
                            >
                              {optimizationBaseline && aiAlternative.alternativeMetrics ? (
                                <span>
                                  {aiAlternative.alternativeMetrics.winRatePercent - optimizationBaseline.winRatePercent >= 0 ? "▲ +" : "▼ "}
                                  {(aiAlternative.alternativeMetrics.winRatePercent - optimizationBaseline.winRatePercent).toFixed(1)}%
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </td>
                          </tr>
                          {/* Max Drawdown */}
                          <tr className="hover:bg-muted/10 transition-colors">
                            <td className="px-3 py-2 font-medium text-muted-foreground">Max Drawdown</td>
                            <td className="px-3 py-2 text-right font-mono text-destructive">
                              {optimizationBaseline ? `-${optimizationBaseline.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-destructive">
                              {aiAlternative.alternativeMetrics ? `-${aiAlternative.alternativeMetrics.maxDrawdownPercent.toFixed(1)}%` : "N/A"}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-mono font-bold ${optimizationBaseline && aiAlternative.alternativeMetrics && aiAlternative.alternativeMetrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent <= 0 ? "text-emerald-400" : "text-destructive"}`}
                            >
                              {optimizationBaseline && aiAlternative.alternativeMetrics ? (
                                <span>
                                  {aiAlternative.alternativeMetrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent <= 0 ? "▲ -" : "▼ +"}
                                  {Math.abs(aiAlternative.alternativeMetrics.maxDrawdownPercent - optimizationBaseline.maxDrawdownPercent).toFixed(1)}%
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Parameter Threshold Adjustments (AI Suggestion) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                      Parameter Threshold Adjustments (AI Suggestion)
                    </h4>
                    <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30">
                      <table className="w-full min-w-[600px] text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                            <th className="px-3 py-2">Parameter</th>
                            <th className="px-3 py-2 text-right">Before</th>
                            <th className="px-3 py-2 text-right">AI Suggested</th>
                            <th className="px-3 py-2">AI Reason (Alasan Perubahan)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {Object.keys(parameters)
                            .filter((k) => !k.startsWith("_weight:"))
                            .map((k) => {
                              const beforeVal = beforeThresholdValue(k);
                              const aiItem = aiAlternative?.alternativeParams?.[k];
                              const aiVal = aiItem !== undefined ? aiItem.value : beforeVal;
                              const hasChanged = beforeVal !== aiVal;
                              const aiReason = hasChanged ? aiItem?.reason || "Disesuaikan oleh AI." : "Tidak ada perubahan.";

                              return (
                                <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                                  <td className="px-3 py-2 font-medium capitalize text-muted-foreground">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</td>
                                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{beforeVal}</td>
                                  <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-indigo-400" : "text-muted-foreground"}`}>{aiVal}</td>
                                  <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">{aiReason}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Indicator Weights Adjustments (AI Suggestion) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <SlidersHorizontalIcon className="h-3.5 w-3.5 text-indigo-400" />
                      Indicator Weights Adjustments (AI Suggestion)
                    </h4>
                    <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30">
                      <table className="w-full min-w-[600px] text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                            <th className="px-3 py-2">Indicator Rule</th>
                            <th className="px-3 py-2 text-right">Before</th>
                            <th className="px-3 py-2 text-right">AI Suggested</th>
                            <th className="px-3 py-2">AI Reason (Alasan Perubahan)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {Object.keys(parameters)
                            .filter((k) => k.startsWith("_weight:"))
                            .map((k) => {
                              const paramName = k.replace("_weight:", "");
                              const beforeWeight = beforeWeightValue(paramName);
                              const aiItem = aiAlternative?.alternativeParams?.[k];
                              const aiVal = aiItem !== undefined ? aiItem.value : beforeWeight;
                              const hasChanged = beforeWeight !== aiVal;
                              const aiReason = hasChanged ? aiItem?.reason || "Disesuaikan oleh AI." : "Tidak ada perubahan.";

                              return (
                                <tr key={k} className={`hover:bg-muted/10 transition-colors ${hasChanged ? "bg-indigo-500/5" : ""}`}>
                                  <td className="px-3 py-2 font-medium capitalize text-muted-foreground">{paramName.replace(/_/g, " ").toLowerCase()}</td>
                                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{beforeWeight}</td>
                                  <td className={`px-3 py-2 text-right font-mono font-bold ${hasChanged ? "text-indigo-400" : "text-muted-foreground"}`}>{aiVal}</td>
                                  <td className="px-3 py-2 text-[10px] text-muted-foreground leading-snug">{aiReason}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg border border-border/60 bg-background/20">
                  <p className="text-xs text-muted-foreground">AI suggestion could not be generated. Please try again.</p>
                </div>
              )}
            </div>
          )}

          {/* ACTION FOOTER */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-border/50">
            <Button size="sm" variant="outline" className="h-8 text-xs px-4 w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {activeTab === "ai" && aiAlternative ? (
              <Button
                size="sm"
                className="h-8 text-xs px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 w-full sm:w-auto"
                onClick={onApplyAiAlternative}
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                Apply AI Alternative
              </Button>
            ) : (
              <Button
                size="sm"
                className={`h-8 text-xs px-4 text-white font-bold w-full sm:w-auto ${isGlobal ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"}`}
                onClick={onConfirmApply}
              >
                Confirm & Apply Grid Best
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
