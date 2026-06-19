import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { SaveIcon, SlidersIcon, SparklesIcon } from "lucide-react";
import { ScoringRule, UpdateScoringRulesBatchPayload } from "../types/settings.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { useGetAiScoringRulesRecommendation } from "../hooks/use-get-ai-scoring-rules-recommendation";
import { AiScoringRecommendationDialog } from "./ai-scoring-recommendation-dialog";

export interface ScoringRulesFormProps {
  rules: ScoringRule[] | undefined;
  onSubmit: (data: UpdateScoringRulesBatchPayload) => void;
  isLoading: boolean;
  error: unknown;
}

interface FormInput {
  rules: {
    id: number;
    strategy: string;
    parameterName: string;
    value: number;
    weight: number;
  }[];
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

export function ScoringRulesForm({ rules, onSubmit, isLoading, error }: ScoringRulesFormProps) {
  const [activeTab, setActiveTab] = useState<"day" | "swing" | "position">("day");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const { getRecommendations, isGeneratingRecommendations, recommendationError, recommendationData, resetRecommendations } = useGetAiScoringRulesRecommendation();

  const handleGetRecommendations = () => {
    setIsRecommendationOpen(true);
    getRecommendations(activeTab);
  };

  const handleApplyRecommendations = () => {
    if (recommendationData?.recommendations) {
      const updatedRules = fields.map((field) => {
        const recommended = recommendationData.recommendations.find(
          (r) => r.parameterName === field.parameterName
        );
        if (recommended) {
          return {
            ...field,
            value: recommended.value,
            weight: recommended.weight !== undefined ? recommended.weight : field.weight,
          };
        }
        return field;
      });
      reset({ rules: updatedRules });
    }
    setIsRecommendationOpen(false);
  };

  const handleRecommendationOpenChange = (open: boolean) => {
    setIsRecommendationOpen(open);
    if (!open) {
      resetRecommendations();
    }
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormInput>({
    defaultValues: {
      rules: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "rules",
  });

  useEffect(() => {
    if (rules) {
      reset({
        rules: rules.map((r) => ({
          id: r.id,
          strategy: r.strategy,
          parameterName: r.parameterName,
          value: Number(r.value),
          weight: Number(r.weight),
        })),
      });
    }
  }, [rules, reset]);

  const onFormSubmit = (data: FormInput) => {
    onSubmit({
      rules: data.rules.map((r) => ({
        id: r.id,
        value: Number(r.value),
        weight: Number(r.weight),
      })),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getStepForParam = (name: string): string => {
    if (name.includes("volume") || name.includes("liquidity")) return "10000";
    if (name.includes("percent") || name.includes("diff") || name.includes("threshold") || name.includes("rsi") || name.includes("pe") || name.includes("return")) return "0.01";
    return "1";
  };

  const filteredFieldsWithIndex = fields.map((field, index) => ({ field, index })).filter(({ field }) => field.strategy === activeTab || field.strategy === `risk_${activeTab}`);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-5xl mx-auto">
      <ErrorDisplay error={error} />

      {/* Strategy Selector Tabs */}
      <div className="flex overflow-x-auto w-full sm:w-auto bg-background/50 border border-border/60 p-1 rounded-lg scrollbar-thin custom-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab("day")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === "day" ? "border-indigo-500 text-indigo-400 font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersIcon className="h-3.5 w-3.5" />
          Day Strategy Rules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("swing")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === "swing" ? "border-indigo-500 text-indigo-400 font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersIcon className="h-3.5 w-3.5" />
          Swing Strategy Rules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("position")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === "position" ? "border-indigo-500 text-indigo-400 font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersIcon className="h-3.5 w-3.5" />
          Position Strategy Rules
        </button>
      </div>

      {/* Rules list */}
      <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md space-y-6">
        <div className="border-b border-border/50 pb-4">
          <h2 className="text-md font-bold text-foreground capitalize">{activeTab} Trading Parameters</h2>
          <p className="text-[11px] text-muted-foreground">Adjust indicator trigger boundaries and point weighting allocations.</p>
        </div>

        <div className="divide-y divide-border/40">
          {filteredFieldsWithIndex.map(({ field, index }) => (
            <div
              key={field.id}
              className="flex flex-col md:flex-row md:items-center justify-between py-4 hover:bg-muted/5 transition gap-4"
            >
              <div className="space-y-1 max-w-md">
                <span className="text-xs font-bold text-foreground">{formatParamName(field.parameterName)}</span>
                <p className="text-[10px] text-muted-foreground">Define threshold setting and score reward allocation for {field.parameterName}.</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Rule Value Input */}
                <Field className="space-y-1">
                  <FieldLabel className="text-[10px] font-semibold text-muted-foreground">Threshold Value</FieldLabel>
                  <Input
                    type="number"
                    step={getStepForParam(field.parameterName)}
                    disabled={isLoading}
                    className="w-32 h-8 text-xs font-mono bg-background/50 border-border/70 text-foreground"
                    {...register(`rules.${index}.value` as const, { valueAsNumber: true })}
                  />
                </Field>

                {/* Rule Weight Input */}
                <Field className="space-y-1">
                  <FieldLabel className="text-[10px] font-semibold text-muted-foreground">Score Weight (pts)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    disabled={isLoading}
                    className="w-24 h-8 text-xs font-mono bg-background/50 border-border/70 text-foreground text-center"
                    {...register(`rules.${index}.weight` as const, { valueAsNumber: true })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Action Footer */}
      <div className="flex items-center justify-between p-4 bg-card/40 backdrop-blur rounded-xl border border-border/80">
        <div>{savedSuccess && !isDirty && <span className="text-xs text-emerald-400 font-semibold animate-fade-in">Scoring rules saved successfully!</span>}</div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetRecommendations}
            disabled={isLoading || isGeneratingRecommendations}
            className="flex items-center gap-1.5 h-9 text-xs px-4 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-md transition"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            Optimize Parameters
          </Button>

          <Button
            type="submit"
            disabled={isLoading || (!isDirty && rules !== undefined)}
            className="flex items-center gap-2 h-9 text-xs px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            <SaveIcon className="h-3.5 w-3.5" />
            {isLoading ? "Saving Parameters..." : "Save Parameters"}
          </Button>
        </div>
      </div>

      {/* AI Scoring Recommendation Dialog */}
      <AiScoringRecommendationDialog
        open={isRecommendationOpen}
        onOpenChange={handleRecommendationOpenChange}
        activeStrategyTab={activeTab}
        isGeneratingRecommendations={isGeneratingRecommendations}
        recommendationError={recommendationError ? recommendationError.message || "Gagal mengambil rekomendasi AI." : null}
        recommendedRules={recommendationData?.recommendations || []}
        onApplyRecommendations={handleApplyRecommendations}
      />
    </form>
  );
}

export default ScoringRulesForm;
