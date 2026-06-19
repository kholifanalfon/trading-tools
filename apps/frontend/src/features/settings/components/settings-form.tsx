import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, SaveIcon, SparklesIcon, TrendingUpIcon, RefreshCw, SlidersIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useSyncExchanges } from "../hooks/use-sync-exchanges";
import { UpdateSettingsFormSchema, UpdateSettingsFormInput } from "../settings.schema";
import { GeminiSettings } from "../types/settings.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { useGetAiScreenerRecommendation } from "../hooks/use-get-ai-screener-recommendation";
import { AiRecommendationDialog } from "./ai-recommendation-dialog";

export interface SettingsFormProps {
  settings: GeminiSettings | undefined;
  onSubmit: (data: UpdateSettingsFormInput) => void;
  isLoading: boolean;
  error: unknown;
}

const DEFAULT_DAY_RULES = [
  { field: "percentchange", operator: "gt", value: 0 },
  { field: "dayvolume", operator: "gt", value: 1000000 },
  { field: "eodprice", operator: "gt", value: 100 },
];

const DEFAULT_SWING_RULES = [
  { field: "dayvolume", operator: "gt", value: 500000 },
  { field: "intradaymarketcap", operator: "gt", value: 1000000000000 },
  { field: "percentchange", operator: "gt", value: 0 },
];

const DEFAULT_POSITION_RULES = [
  { field: "peratio.lasttwelvemonths", operator: "btwn", value: 5, valueMax: 25 },
  { field: "returnonequity.lasttwelvemonths", operator: "gt", value: 15 },
  { field: "avgdailyvol3m", operator: "gt", value: 2000000 },
];

export function SettingsForm({ settings, onSubmit, isLoading, error }: SettingsFormProps) {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showFinnhubKey, setShowFinnhubKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exchanges, setExchanges] = useState<any[]>([]);

  const { mutate: syncExchanges, isPending: isSyncing } = useSyncExchanges();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateSettingsFormInput>({
    resolver: zodResolver(UpdateSettingsFormSchema),
    defaultValues: {
      gemini_api_key: "",
      gemini_model: "gemini-1.5-flash",
      finnhub_api_key: "",
      stock_screener_provider: "yahoo_finance",
      exchanges_config: "",
      default_strategy: "day",
      screener_rules_day: JSON.stringify(DEFAULT_DAY_RULES),
      screener_rules_swing: JSON.stringify(DEFAULT_SWING_RULES),
      screener_rules_position: JSON.stringify(DEFAULT_POSITION_RULES),
    },
  });

  const selectedProvider = watch("stock_screener_provider");

  useEffect(() => {
    if (settings) {
      reset({
        gemini_api_key: settings.gemini_api_key || "",
        gemini_model: settings.gemini_model || "gemini-1.5-flash",
        finnhub_api_key: settings.finnhub_api_key || "",
        stock_screener_provider: settings.stock_screener_provider || "yahoo_finance",
        exchanges_config: settings.exchanges_config || "",
        default_strategy: settings.default_strategy || "day",
        screener_rules_day: settings.screener_rules_day && settings.screener_rules_day !== "[]" ? settings.screener_rules_day : JSON.stringify(DEFAULT_DAY_RULES),
        screener_rules_swing: settings.screener_rules_swing && settings.screener_rules_swing !== "[]" ? settings.screener_rules_swing : JSON.stringify(DEFAULT_SWING_RULES),
        screener_rules_position:
          settings.screener_rules_position && settings.screener_rules_position !== "[]" ? settings.screener_rules_position : JSON.stringify(DEFAULT_POSITION_RULES),
      });

      if (settings.exchanges_config) {
        try {
          setExchanges(JSON.parse(settings.exchanges_config));
        } catch (err) {
          console.error("Failed to parse exchanges_config:", err);
        }
      }
    }
  }, [settings, reset]);

  // Active Strategy Tab state
  const [activeStrategyTab, setActiveStrategyTab] = useState<"day" | "swing" | "position">("day");

  // AI recommendation query/mutation
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const { getRecommendations, isGeneratingRecommendations, recommendationError, recommendationData, resetRecommendations } = useGetAiScreenerRecommendation();

  const handleGetRecommendations = () => {
    setIsRecommendationOpen(true);
    getRecommendations(activeStrategyTab);
  };

  const handleApplyRecommendations = () => {
    if (recommendationData?.rules) {
      updateStrategyRules(activeStrategyTab, recommendationData.rules);
    }
    setIsRecommendationOpen(false);
  };

  const handleRecommendationOpenChange = (open: boolean) => {
    setIsRecommendationOpen(open);
    if (!open) {
      resetRecommendations();
    }
  };

  // Dynamic rule list state
  const [dayRules, setDayRules] = useState<any[]>([]);
  const [swingRules, setSwingRules] = useState<any[]>([]);
  const [positionRules, setPositionRules] = useState<any[]>([]);

  useEffect(() => {
    if (settings) {
      try {
        setDayRules(settings.screener_rules_day && settings.screener_rules_day !== "[]" ? JSON.parse(settings.screener_rules_day) : DEFAULT_DAY_RULES);
      } catch (e) {
        setDayRules(DEFAULT_DAY_RULES);
      }
      try {
        setSwingRules(settings.screener_rules_swing && settings.screener_rules_swing !== "[]" ? JSON.parse(settings.screener_rules_swing) : DEFAULT_SWING_RULES);
      } catch (e) {
        setSwingRules(DEFAULT_SWING_RULES);
      }
      try {
        setPositionRules(settings.screener_rules_position && settings.screener_rules_position !== "[]" ? JSON.parse(settings.screener_rules_position) : DEFAULT_POSITION_RULES);
      } catch (e) {
        setPositionRules(DEFAULT_POSITION_RULES);
      }
    }
  }, [settings]);

  const updateStrategyRules = (strategy: "day" | "swing" | "position", updated: any[]) => {
    if (strategy === "day") {
      setDayRules(updated);
      setValue("screener_rules_day", JSON.stringify(updated), { shouldDirty: true });
    } else if (strategy === "swing") {
      setSwingRules(updated);
      setValue("screener_rules_swing", JSON.stringify(updated), { shouldDirty: true });
    } else if (strategy === "position") {
      setPositionRules(updated);
      setValue("screener_rules_position", JSON.stringify(updated), { shouldDirty: true });
    }
  };

  const handleAddRule = (strategy: "day" | "swing" | "position") => {
    const list = strategy === "day" ? dayRules : strategy === "swing" ? swingRules : positionRules;
    const newRule = { field: "percentchange", operator: "gt", value: 0 };
    updateStrategyRules(strategy, [...list, newRule]);
  };

  const handleRemoveRule = (strategy: "day" | "swing" | "position", index: number) => {
    const list = strategy === "day" ? dayRules : strategy === "swing" ? swingRules : positionRules;
    const updated = list.filter((_, i) => i !== index);
    updateStrategyRules(strategy, updated);
  };

  const handleRuleChange = (strategy: "day" | "swing" | "position", index: number, key: string, val: any) => {
    const list = strategy === "day" ? dayRules : strategy === "swing" ? swingRules : positionRules;
    const updated = list.map((rule, i) => {
      if (i !== index) return rule;
      const updatedRule = { ...rule, [key]: val };
      // If operator changed to or from btwn, sync valueMax
      if (key === "operator") {
        if (val === "btwn") {
          updatedRule.valueMax = updatedRule.valueMax !== undefined ? updatedRule.valueMax : Number(updatedRule.value) || 0;
        } else {
          delete updatedRule.valueMax;
        }
      }
      return updatedRule;
    });
    updateStrategyRules(strategy, updated);
  };
  const OPERAND_GROUPS = [
    {
      label: "Market & Price (Harga & Pasar)",
      fields: [
        { value: "eodprice", label: "Price (EOD)" },
        { value: "percentchange", label: "Daily Return (%)" },
        { value: "intradaymarketcap", label: "Intraday Market Cap" },
        { value: "lastclose52weekhigh.lasttwelvemonths", label: "52-Week High" },
        { value: "lastclose52weeklow.lasttwelvemonths", label: "52-Week Low" },
      ],
    },
    {
      label: "Volume & Liquidity (Volume & Likuiditas)",
      fields: [
        { value: "dayvolume", label: "Daily Volume (shares)" },
        { value: "avgdailyvol3m", label: "Average Volume (3M)" },
        { value: "beta", label: "Beta" },
      ],
    },
    {
      label: "Valuation (Valuasi)",
      fields: [
        { value: "peratio.lasttwelvemonths", label: "Trailing P/E" },
        { value: "pricebookratio.quarterly", label: "Price to Book (P/B)" },
        { value: "pegratio_5y", label: "PEG Ratio (5Y)" },
        { value: "bookvalueshare.lasttwelvemonths", label: "Book Value per Share" },
        { value: "lastclosetevebit.lasttwelvemonths", label: "EV to EBIT" },
        { value: "lastclosetevebitda.lasttwelvemonths", label: "EV to EBITDA" },
      ],
    },
    {
      label: "Financial Performance & Growth (Kinerja & Pertumbuhan)",
      fields: [
        { value: "returnonequity.lasttwelvemonths", label: "Return on Equity (ROE %)" },
        { value: "returnonassets.lasttwelvemonths", label: "Return on Assets (ROA %)" },
        { value: "ebitdamargin.lasttwelvemonths", label: "EBITDA Margin (%)" },
        { value: "grossprofitmargin.lasttwelvemonths", label: "Gross Profit Margin (%)" },
        { value: "netincomemargin.lasttwelvemonths", label: "Net Income Margin (%)" },
        { value: "epsgrowth.lasttwelvemonths", label: "EPS Growth (%)" },
        { value: "quarterlyrevenuegrowth.quarterly", label: "Quarterly Revenue Growth (%)" },
        { value: "totalrevenues1yrgrowth.lasttwelvemonths", label: "Revenue 1Y Growth (%)" },
        { value: "forward_dividend_yield", label: "Forward Dividend Yield (%)" },
      ],
    },
    {
      label: "Liquidity & Leverage (Likuiditas & Utang)",
      fields: [
        { value: "currentratio.lasttwelvemonths", label: "Current Ratio" },
        { value: "quickratio.lasttwelvemonths", label: "Quick Ratio" },
        { value: "totaldebtequity.lasttwelvemonths", label: "Debt to Equity Ratio" },
        { value: "ltdebtequity.lasttwelvemonths", label: "Long-term Debt to Equity" },
        { value: "ebitinterestexpense.lasttwelvemonths", label: "EBIT Interest Coverage" },
        { value: "ebitdainterestexpense.lasttwelvemonths", label: "EBITDA Interest Coverage" },
        { value: "netdebtebitda.lasttwelvemonths", label: "Net Debt to EBITDA" },
        { value: "totaldebtebitda.lasttwelvemonths", label: "Total Debt to EBITDA" },
      ],
    },
    {
      label: "Ownership & Cash Flow (Kepemilikan & Arus Kas)",
      fields: [
        { value: "pctheldinsider", label: "Insider Ownership (%)" },
        { value: "pctheldinst", label: "Institutional Ownership (%)" },
        { value: "leveredfreecashflow.lasttwelvemonths", label: "Levered Free Cash Flow" },
        { value: "unleveredfreecashflow.lasttwelvemonths", label: "Unlevered Free Cash Flow" },
        { value: "capitalexpenditure.lasttwelvemonths", label: "Capital Expenditure" },
        { value: "cashfromoperations.lasttwelvemonths", label: "Cash from Operations (CFO)" },
      ],
    },
    {
      label: "Raw Financials (Laporan Keuangan Mentah)",
      fields: [
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
      ],
    },
    {
      label: "Short Interest (Minat Jual Kosong)",
      fields: [
        { value: "short_percentage_of_shares_outstanding.value", label: "Short % of Shares Outstanding" },
        { value: "short_interest.value", label: "Short Interest" },
        { value: "short_percentage_of_float.value", label: "Short % of Float" },
        { value: "days_to_cover_short.value", label: "Days to Cover Short" },
        { value: "short_interest_percentage_change.value", label: "Short Interest % Change" },
      ],
    },
    {
      label: "ESG & Statistics (ESG & Statistik)",
      fields: [
        { value: "esg_score", label: "ESG Score" },
        { value: "environmental_score", label: "Environmental Score" },
        { value: "social_score", label: "Social Score" },
        { value: "governance_score", label: "Governance Score" },
        { value: "highest_controversy", label: "Highest Controversy Level" },
        { value: "altmanzscoreusingtheaveragestockinformationforaperiod.lasttwelvemonths", label: "Altman Z-Score" },
      ],
    },
  ];

  const AVAILABLE_OPERATORS = [
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "eq", label: "Equal To" },
    { value: "btwn", label: "Between (Range)" },
    { value: "gte", label: "Greater Than or Equal" },
    { value: "lte", label: "Less Than or Equal" },
  ];

  const handleExchangeToggle = (id: string) => {
    const updated = exchanges.map((ex) => (ex.id === id ? { ...ex, enabled: !ex.enabled } : ex));
    setExchanges(updated);
    setValue("exchanges_config", JSON.stringify(updated), {
      shouldDirty: true,
    });
  };

  const handleLimitChange = (id: string, limit: number) => {
    const updated = exchanges.map((ex) => (ex.id === id ? { ...ex, limit: Math.max(1, limit) } : ex));
    setExchanges(updated);
    setValue("exchanges_config", JSON.stringify(updated), {
      shouldDirty: true,
    });
  };

  const renderStrategyRules = (strategy: "day" | "swing" | "position", title: string, rules: any[]) => {
    return (
      <div className="flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold text-indigo-400">{title}</h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
              {rules.length} {rules.length === 1 ? "Rule" : "Rules"}
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {rules.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">No filters configured.</p>
            ) : (
              <div className="space-y-2">
                {/* Column Headers */}
                <div className="hidden md:flex items-center gap-3 px-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/10">
                  <div className="w-[40%]">Operand</div>
                  <div className="w-[30%]">Operator</div>
                  <div className="w-[25%]">Value</div>
                  <div className="w-[5%]"></div>
                </div>

                <div className="space-y-2 pt-1">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 py-2 border-b border-border/10 md:border-b-0">
                      <div className="w-full md:w-[40%]">
                        <span className="block md:hidden text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Operand</span>
                        <select
                          value={rule.field}
                          onChange={(e) => handleRuleChange(strategy, idx, "field", e.target.value)}
                          className="flex h-8 w-full rounded-md border border-border/70 bg-background/50 px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                        >
                          {OPERAND_GROUPS.map((group) => (
                            <optgroup key={group.label} label={group.label} className="bg-background text-indigo-400 font-bold not-italic">
                              {group.fields.map((f) => (
                                <option key={f.value} value={f.value} className="text-foreground font-normal">
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-[30%]">
                        <span className="block md:hidden text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Operator</span>
                        <select
                          value={rule.operator}
                          onChange={(e) => handleRuleChange(strategy, idx, "operator", e.target.value)}
                          className="flex h-8 w-full rounded-md border border-border/70 bg-background/50 px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                        >
                          {AVAILABLE_OPERATORS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-[25%]">
                        <span className="block md:hidden text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Value</span>
                        {rule.operator === "btwn" ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="any"
                              value={rule.value ?? ""}
                              onChange={(e) => handleRuleChange(strategy, idx, "value", e.target.value === "" ? "" : Number(e.target.value))}
                              placeholder="Min"
                              className="bg-background/50 border-border/70 text-xs h-8 font-mono"
                            />
                            <Input
                              type="number"
                              step="any"
                              value={rule.valueMax ?? ""}
                              onChange={(e) => handleRuleChange(strategy, idx, "valueMax", e.target.value === "" ? "" : Number(e.target.value))}
                              placeholder="Max"
                              className="bg-background/50 border-border/70 text-xs h-8 font-mono"
                            />
                          </div>
                        ) : (
                          <Input
                            type="number"
                            step="any"
                            value={rule.value ?? ""}
                            onChange={(e) => handleRuleChange(strategy, idx, "value", e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="Value"
                            className="bg-background/50 border-border/70 text-xs h-8 font-mono"
                          />
                        )}
                      </div>

                      <div className="w-full md:w-[5%] flex justify-end md:justify-center pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(strategy, idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded hover:bg-destructive/10"
                          title="Remove rule"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 mt-4">
          <Button
            type="button"
            onClick={() => handleAddRule(strategy)}
            variant="outline"
            size="sm"
            className="w-full md:w-auto px-5 py-1.5 flex-1 flex items-center justify-center gap-1.5 border-dashed border-indigo-500/35 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 transition"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add Filter Rule
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetRecommendations}
            disabled={isLoading || isGeneratingRecommendations}
            className="w-full md:w-auto x-5 py-1.5 flex-1 flex items-center justify-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-md transition"
          >
            <SparklesIcon className="h-3.5 w-3.5 animate-pulse" />
            Optimize Rules
          </Button>
        </div>
      </div>
    );
  };

  const onFormSubmit = (data: UpdateSettingsFormInput) => {
    onSubmit(data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-5xl mx-auto">
      <ErrorDisplay error={error} />

      {/* Grid Layout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Gemini AI Configuration */}
        <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                <SparklesIcon className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-md font-bold text-foreground">Gemini AI Configuration</h2>
                <p className="text-[11px] text-muted-foreground">Configure Google Generative AI details.</p>
              </div>
            </div>

            <FieldGroup className="space-y-4">
              {/* Gemini API Key */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="gemini_api_key" className="text-xs font-semibold text-muted-foreground">
                  Gemini API Key
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="gemini_api_key"
                    type={showGeminiKey ? "text" : "password"}
                    placeholder="Enter Google AI Studio API Key (AIzaSy...)"
                    disabled={isLoading}
                    className="pr-10 bg-background/50 border-border/70 text-xs h-9"
                    {...register("gemini_api_key")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showGeminiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground leading-normal">API Key securely stored in PostgreSQL database.</p>
                {errors.gemini_api_key && <p className="text-xs text-destructive font-semibold mt-1">{errors.gemini_api_key.message}</p>}
              </Field>

              {/* Gemini Model */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="gemini_model" className="text-xs font-semibold text-muted-foreground">
                  Gemini Model
                </FieldLabel>
                <div className="relative">
                  <select
                    id="gemini_model"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("gemini_model")}
                  >
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Recommended, Fast & Cost-effective)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Accurate, Higher latency)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Latest Flash Model)</option>
                  </select>
                </div>
                {errors.gemini_model && <p className="text-xs text-destructive font-semibold mt-1">{errors.gemini_model.message}</p>}
              </Field>
            </FieldGroup>
          </div>
        </div>

        {/* Card 2: Stock Screener Configuration */}
        <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <TrendingUpIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-md font-bold text-foreground">Stock Screener Configuration</h2>
                <p className="text-[11px] text-muted-foreground">Choose your API provider.</p>
              </div>
            </div>

            <FieldGroup className="space-y-4">
              {/* Provider Selection */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="stock_screener_provider" className="text-xs font-semibold text-muted-foreground">
                  Screener API Provider
                </FieldLabel>
                <div className="relative">
                  <select
                    id="stock_screener_provider"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("stock_screener_provider")}
                  >
                    <option value="yahoo_finance">Yahoo Finance (Free, no API Key required)</option>
                    <option value="finnhub">Finnhub API (API Key required)</option>
                  </select>
                </div>
                {errors.stock_screener_provider && <p className="text-xs text-destructive font-semibold mt-1">{errors.stock_screener_provider.message}</p>}
              </Field>

              {/* Default Strategy Selection */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="default_strategy" className="text-xs font-semibold text-muted-foreground">
                  Default Trading Strategy
                </FieldLabel>
                <div className="relative">
                  <select
                    id="default_strategy"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("default_strategy")}
                  >
                    <option value="day">Day Trading</option>
                    <option value="swing">Swing Trading</option>
                    <option value="position">Position Trading</option>
                  </select>
                </div>
                <p className="text-[9px] text-muted-foreground leading-normal">Sets the default strategy in the screener list.</p>
                {errors.default_strategy && <p className="text-xs text-destructive font-semibold mt-1">{errors.default_strategy.message}</p>}
              </Field>

              {/* Finnhub API Key */}
              {selectedProvider === "finnhub" && (
                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="finnhub_api_key" className="text-xs font-semibold text-muted-foreground">
                    Finnhub API Key
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="finnhub_api_key"
                      type={showFinnhubKey ? "text" : "password"}
                      placeholder="Enter Finnhub API Key"
                      disabled={isLoading}
                      className="pr-10 bg-background/50 border-border/70 text-xs h-9"
                      {...register("finnhub_api_key")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFinnhubKey(!showFinnhubKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      tabIndex={-1}
                    >
                      {showFinnhubKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-normal">Get a free API key from finnhub.io.</p>
                  {errors.finnhub_api_key && <p className="text-xs text-destructive font-semibold mt-1">{errors.finnhub_api_key.message}</p>}
                </Field>
              )}
            </FieldGroup>

            <FieldGroup className="space-y-4">
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <FieldLabel htmlFor="stock_screener_provider" className="text-xs font-semibold text-muted-foreground">
                    Exchange List
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => syncExchanges()}
                    disabled={isSyncing || isLoading}
                    className="h-7 text-[10px] px-2 flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-md transition"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing..." : "Sync List"}
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto pr-1 divide-y divide-border/40 custom-scrollbar">
                  {exchanges.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between py-3 hover:bg-muted/5 transition px-1">
                      <div className="flex items-center gap-3">
                        <input
                          id={`checkbox-${ex.id}`}
                          type="checkbox"
                          checked={!!ex.enabled}
                          onChange={() => handleExchangeToggle(ex.id)}
                          disabled={isLoading}
                          className="rounded border-border/70 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-background cursor-pointer"
                        />
                        <label htmlFor={`checkbox-${ex.id}`} className="cursor-pointer select-none">
                          <p className="text-sm font-semibold text-foreground">{ex.name}</p>
                          <p className="text-[12px] text-muted-foreground">
                            {ex.country} &bull; Suffix: <strong className="text-indigo-400 font-mono">{ex.suffix || "[None]"}</strong>
                          </p>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">Stocks limit:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={ex.limit !== undefined ? ex.limit : 15}
                          disabled={!ex.enabled || isLoading}
                          onChange={(e) => handleLimitChange(ex.id, parseInt(e.target.value) || 1)}
                          className="w-14 h-7 rounded border border-border/70 bg-background/50 px-2 py-0.5 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* Card Group 2: Screener Parameter Settings */}
      <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              <SlidersIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-md font-bold text-foreground">Screener Filter Parameters</h2>
              <p className="text-[11px] text-muted-foreground">Adjust boundary settings used to pre-filter stocks for each strategy from Yahoo Finance.</p>
            </div>
          </div>

          {/* Strategy Tabs Switcher */}
          <div className="flex overflow-x-auto w-full sm:w-auto bg-background/50 border border-border/60 p-1 rounded-lg scrollbar-thin custom-scrollbar whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveStrategyTab("day")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${
                activeStrategyTab === "day" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day Strategy
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategyTab("swing")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${
                activeStrategyTab === "swing" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Swing Strategy
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategyTab("position")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${
                activeStrategyTab === "position" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Position Strategy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeStrategyTab === "day" && renderStrategyRules("day", "Day Strategy Filters", dayRules)}
          {activeStrategyTab === "swing" && renderStrategyRules("swing", "Swing Strategy Filters", swingRules)}
          {activeStrategyTab === "position" && renderStrategyRules("position", "Position Strategy Filters", positionRules)}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between p-4 bg-card/40 backdrop-blur rounded-xl border border-border/80">
        <div>{savedSuccess && !isDirty && <span className="text-xs text-emerald-400 font-semibold animate-fade-in">Settings saved successfully!</span>}</div>
        <Button
          type="submit"
          disabled={isLoading || (!isDirty && settings !== undefined)}
          className="flex items-center gap-2 h-9 text-xs px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
        >
          <SaveIcon className="h-3.5 w-3.5" />
          {isLoading ? "Saving Settings..." : "Save Configuration"}
        </Button>
      </div>
      {/* AI Recommendation Modal */}
      <AiRecommendationDialog
        open={isRecommendationOpen}
        onOpenChange={handleRecommendationOpenChange}
        activeStrategyTab={activeStrategyTab}
        isGeneratingRecommendations={isGeneratingRecommendations}
        recommendationError={recommendationError ? recommendationError.message || "Gagal mengambil rekomendasi AI. Pastikan API Key Gemini sudah dikonfigurasi." : null}
        recommendedRules={recommendationData?.rules || []}
        onApplyRecommendations={handleApplyRecommendations}
      />
    </form>
  );
}

export default SettingsForm;
