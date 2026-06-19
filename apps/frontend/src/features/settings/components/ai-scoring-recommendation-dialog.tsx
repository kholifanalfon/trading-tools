import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { SparklesIcon } from "lucide-react";

export interface AiScoringRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeStrategyTab: "day" | "swing" | "position";
  isGeneratingRecommendations: boolean;
  recommendationError: string | null;
  recommendedRules: { parameterName: string; value: number; justification: string }[];
  onApplyRecommendations: () => void;
}

function formatParamName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace("Rsi", "RSI")
    .replace("Rvol", "RVOL")
    .replace("Atr", "ATR")
    .replace("Ema", "EMA")
    .replace("Sma", "SMA")
    .replace("Macd", "MACD")
    .replace("1y", "1-Year")
    .replace("52w", "52-Week")
    .replace("Sl", "SL")
    .replace("Tp", "TP");
}

export function AiScoringRecommendationDialog({
  open,
  onOpenChange,
  activeStrategyTab,
  isGeneratingRecommendations,
  recommendationError,
  recommendedRules,
  onApplyRecommendations,
}: AiScoringRecommendationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-2xl md:max-w-4xl p-4 sm:p-6 bg-card border border-border/80 backdrop-blur-lg overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-400">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            Rekomendasi AI Parameter Scoring & Risiko
          </DialogTitle>
          <DialogDescription>
            Gemini merekomendasikan nilai batas indikator dan parameter manajemen risiko untuk strategi <strong className="text-foreground uppercase">{activeStrategyTab}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-w-0 w-full">
          {isGeneratingRecommendations ? (
            <div className="p-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-3 animate-pulse flex flex-col justify-center items-center h-48">
              <SparklesIcon className="h-6 w-6 text-indigo-400 animate-bounce" />
              <div className="h-3 w-1/3 bg-indigo-500/20 rounded"></div>
              <div className="h-3 w-1/2 bg-indigo-500/10 rounded"></div>
            </div>
          ) : recommendationError ? (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center">{recommendationError}</div>
          ) : (
            <div className="space-y-4 min-w-0 w-full">
              <div className="rounded-lg border border-border/60 overflow-x-auto w-full bg-background/30 animate-fade-in">
                <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                      <th className="p-3">Nama Parameter</th>
                      <th className="p-3">Rekomendasi Nilai</th>
                      <th className="p-3">Justifikasi AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recommendedRules.map((rule, index) => {
                      return (
                        <tr key={index} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{formatParamName(rule.parameterName)}</td>
                          <td className="p-3 font-mono text-indigo-400 font-bold">{rule.value}</td>
                          <td className="p-3 text-muted-foreground leading-normal max-w-xs">{rule.justification}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-border/50">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 text-xs font-semibold w-full sm:w-auto">
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={onApplyRecommendations}
                  className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Terapkan Rekomendasi
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
