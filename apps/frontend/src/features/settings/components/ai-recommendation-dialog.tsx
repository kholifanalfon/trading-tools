import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { AiRecommendationRule } from "../settings.schema";

export interface AiRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeStrategyTab: "day" | "swing" | "position";
  isGeneratingRecommendations: boolean;
  recommendationError: string | null;
  recommendedRules: AiRecommendationRule[];
  onApplyRecommendations: () => void;
}

const AVAILABLE_FIELDS = [
  { value: "percentchange", label: "Daily Return (%)" },
  { value: "dayvolume", label: "Daily Volume (shares)" },
  { value: "eodprice", label: "Price (EOD)" },
  { value: "intradaymarketcap", label: "Intraday Market Cap" },
  { value: "lastclose52weekhigh.lasttwelvemonths", label: "52-Week High" },
  { value: "lastclose52weeklow.lasttwelvemonths", label: "52-Week Low" },
  { value: "avgdailyvol3m", label: "Average Volume (3M)" },
  { value: "beta", label: "Beta" },
  { value: "peratio.lasttwelvemonths", label: "Trailing P/E" },
  { value: "pricebookratio.quarterly", label: "Price to Book (P/B)" },
  { value: "pegratio_5y", label: "PEG Ratio (5Y)" },
  { value: "bookvalueshare.lasttwelvemonths", label: "Book Value per Share" },
  { value: "lastclosetevebit.lasttwelvemonths", label: "EV to EBIT" },
  { value: "lastclosetevebitda.lasttwelvemonths", label: "EV to EBITDA" },
  { value: "returnonequity.lasttwelvemonths", label: "Return on Equity (ROE %)" },
  { value: "returnonassets.lasttwelvemonths", label: "Return on Assets (ROA %)" },
  { value: "ebitdamargin.lasttwelvemonths", label: "EBITDA Margin (%)" },
  { value: "grossprofitmargin.lasttwelvemonths", label: "Gross Profit Margin (%)" },
  { value: "netincomemargin.lasttwelvemonths", label: "Net Income Margin (%)" },
  { value: "epsgrowth.lasttwelvemonths", label: "EPS Growth (%)" },
  { value: "quarterlyrevenuegrowth.quarterly", label: "Quarterly Revenue Growth (%)" },
  { value: "totalrevenues1yrgrowth.lasttwelvemonths", label: "Revenue 1Y Growth (%)" },
  { value: "forward_dividend_yield", label: "Forward Dividend Yield (%)" },
  { value: "currentratio.lasttwelvemonths", label: "Current Ratio" },
  { value: "quickratio.lasttwelvemonths", label: "Quick Ratio" },
  { value: "totaldebtequity.lasttwelvemonths", label: "Debt to Equity Ratio" },
  { value: "ltdebtequity.lasttwelvemonths", label: "Long-term Debt to Equity" },
  { value: "ebitinterestexpense.lasttwelvemonths", label: "EBIT Interest Coverage" },
  { value: "ebitdainterestexpense.lasttwelvemonths", label: "EBITDA Interest Coverage" },
  { value: "netdebtebitda.lasttwelvemonths", label: "Net Debt to EBITDA" },
  { value: "totaldebtebitda.lasttwelvemonths", label: "Total Debt to EBITDA" },
  { value: "pctheldinsider", label: "Insider Ownership (%)" },
  { value: "pctheldinst", label: "Institutional Ownership (%)" },
  { value: "leveredfreecashflow.lasttwelvemonths", label: "Levered Free Cash Flow" },
  { value: "unleveredfreecashflow.lasttwelvemonths", label: "Unlevered Free Cash Flow" },
  { value: "capitalexpenditure.lasttwelvemonths", label: "Capital Expenditure" },
  { value: "cashfromoperations.lasttwelvemonths", label: "Cash from Operations (CFO)" },
  { value: "totalrevenues.lasttwelvemonths", label: "Total Revenue" },
  { value: "netincomeis.lasttwelvemonths", label: "Net Income" },
  { value: "ebitda.lasttwelvemonths", label: "EBITDA" },
  { value: "operatingincome.lasttwelvemonths", label: "Operating Income" },
  { value: "totalassets.lasttwelvemonths", label: "Total Assets" },
  { value: "totaldebt.lasttwelvemonths", label: "Total Debt" },
  { value: "totalequity.lasttwelvemonths", label: "Total Equity" },
  { value: "totalcurrentassets.lasttwelvemonths", label: "Total Current Assets" },
  { value: "totalcurrentliabilities.lasttwelvemonths", label: "Total Current Liabilities" },
  { value: "totalcommonsharesoutstanding.lasttwelvemonths", label: "Shares Outstanding" },
  { value: "short_percentage_of_shares_outstanding.value", label: "Short % of Shares Outstanding" },
  { value: "short_interest.value", label: "Short Interest" },
  { value: "short_percentage_of_float.value", label: "Short % of Float" },
  { value: "days_to_cover_short.value", label: "Days to Cover Short" },
  { value: "short_interest_percentage_change.value", label: "Short Interest % Change" },
  { value: "esg_score", label: "ESG Score" },
  { value: "environmental_score", label: "Environmental Score" },
  { value: "social_score", label: "Social Score" },
  { value: "governance_score", label: "Governance Score" },
  { value: "highest_controversy", label: "Highest Controversy Level" },
  { value: "altmanzscoreusingtheaveragestockinformationforaperiod.lasttwelvemonths", label: "Altman Z-Score" },
];

const AVAILABLE_OPERATORS = [
  { value: "gt", label: "Greater Than" },
  { value: "lt", label: "Less Than" },
  { value: "eq", label: "Equal To" },
  { value: "btwn", label: "Between (Range)" },
  { value: "gte", label: "Greater Than or Equal" },
  { value: "lte", label: "Less Than or Equal" },
];

export function AiRecommendationDialog({
  open,
  onOpenChange,
  activeStrategyTab,
  isGeneratingRecommendations,
  recommendationError,
  recommendedRules,
  onApplyRecommendations,
}: AiRecommendationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-2xl md:max-w-4xl p-4 sm:p-6 bg-card border border-border/80 backdrop-blur-lg overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-400">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            Rekomendasi AI Filter Screener
          </DialogTitle>
          <DialogDescription>
            Gemini merekomendasikan parameter filter pre-screen untuk strategi <strong className="text-foreground uppercase">{activeStrategyTab}</strong> berdasarkan kondisi pasar saat ini.
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
                      <th className="p-3">Operand</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Rekomendasi Nilai</th>
                      <th className="p-3">Justifikasi AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recommendedRules.map((rule, index) => {
                      const operandLabel = AVAILABLE_FIELDS.find((f) => f.value === rule.field)?.label || rule.field;
                      const operatorLabel = AVAILABLE_OPERATORS.find((o) => o.value === rule.operator)?.label || rule.operator;
                      const displayVal = rule.operator === "btwn" ? `${rule.value} s/d ${rule.valueMax}` : rule.value;
                      return (
                        <tr key={index} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{operandLabel}</td>
                          <td className="p-3 text-muted-foreground">{operatorLabel}</td>
                          <td className="p-3 font-mono text-indigo-400 font-bold">{displayVal}</td>
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
