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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { getAiScreenerRecommendationApi } from "../services/settings.api";

export interface SettingsFormProps {
  settings: GeminiSettings | undefined;
  onSubmit: (data: UpdateSettingsFormInput) => void;
  isLoading: boolean;
  error: unknown;
}

const DEFAULT_DAY_RULES = [
  { field: "percentchange", operator: "gt", value: 0 },
  { field: "dayvolume", operator: "gt", value: 1000000 },
  { field: "regularmarketprice", operator: "gt", value: 100 },
];

const DEFAULT_SWING_RULES = [
  { field: "dayvolume", operator: "gt", value: 500000 },
  { field: "intradaymarketcap", operator: "gt", value: 1000000000000 },
  { field: "percentchange", operator: "gt", value: 0 },
];

const DEFAULT_POSITION_RULES = [
  { field: "forwardpe", operator: "btwn", value: 5, valueMax: 25 },
  { field: "returnonequity", operator: "gt", value: 15 },
  { field: "averagevolume", operator: "gt", value: 2000000 },
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

  // AI recommendation states
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendedRules, setRecommendedRules] = useState<any[]>([]);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    setRecommendationError(null);
    setIsRecommendationOpen(true);
    try {
      const response = await getAiScreenerRecommendationApi(activeStrategyTab);
      setRecommendedRules(response.rules || []);
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
      setRecommendationError("Gagal mengambil rekomendasi AI. Pastikan API Key Gemini sudah dikonfigurasi.");
      setRecommendedRules([]);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleApplyRecommendations = () => {
    updateStrategyRules(activeStrategyTab, recommendedRules);
    setIsRecommendationOpen(false);
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

  const AVAILABLE_FIELDS = [
    { value: "percentchange", label: "Daily Return (%)" },
    { value: "dayvolume", label: "Daily Volume (shares)" },
    { value: "regularmarketprice", label: "Regular Price" },
    { value: "intradaymarketcap", label: "Intraday Market Cap" },
    { value: "forwardpe", label: "Forward P/E" },
    { value: "returnonequity", label: "Return on Equity (ROE %)" },
    { value: "averagevolume", label: "Average Volume" },
    { value: "trailingpe", label: "Trailing P/E" },
    { value: "pricetobook", label: "Price to Book (P/B)" },
    { value: "dividendyield", label: "Dividend Yield (%)" },
    { value: "operatingmargins", label: "Operating Margin (%)" },
    { value: "epsforward", label: "Forward EPS" },
    { value: "pegratio", label: "PEG Ratio" },
    { value: "twohundreddaymovingaverage", label: "200-Day Moving Average" },
    { value: "fiftydaymovingaverage", label: "50-Day Moving Average" },
    { value: "fiftytwoweekhigh", label: "52-Week High" },
    { value: "fiftytwoweeklow", label: "52-Week Low" },
  ];

  const OPERAND_GROUPS = [
    {
      label: "Market & Price (Harga & Pasar)",
      fields: [
        { value: "regularmarketprice", label: "Regular Price" },
        { value: "percentchange", label: "Daily Return (%)" },
        { value: "intradaymarketcap", label: "Intraday Market Cap" },
        { value: "fiftytwoweekhigh", label: "52-Week High" },
        { value: "fiftytwoweeklow", label: "52-Week Low" },
        { value: "fiftydaymovingaverage", label: "50-Day Moving Average" },
        { value: "twohundreddaymovingaverage", label: "200-Day Moving Average" },
      ],
    },
    {
      label: "Volume & Liquidity (Volume & Likuiditas)",
      fields: [
        { value: "dayvolume", label: "Daily Volume (shares)" },
        { value: "averagevolume", label: "Average Volume" },
      ],
    },
    {
      label: "Valuation (Valuasi)",
      fields: [
        { value: "forwardpe", label: "Forward P/E" },
        { value: "trailingpe", label: "Trailing P/E" },
        { value: "pricetobook", label: "Price to Book (P/B)" },
        { value: "pegratio", label: "PEG Ratio" },
      ],
    },
    {
      label: "Financial Performance (Kinerja Keuangan)",
      fields: [
        { value: "returnonequity", label: "Return on Equity (ROE %)" },
        { value: "operatingmargins", label: "Operating Margin (%)" },
        { value: "epsforward", label: "Forward EPS" },
        { value: "dividendyield", label: "Dividend Yield (%)" },
      ],
    },
  ];

  const AVAILABLE_OPERATORS = [
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "eq", label: "Equal To" },
    { value: "btwn", label: "Between (Range)" },
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
      <Dialog open={isRecommendationOpen} onOpenChange={setIsRecommendationOpen}>
        <DialogContent className="w-[92vw] max-w-2xl md:max-w-4xl p-4 sm:p-6 bg-card border border-border/80 backdrop-blur-lg overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-400">
              <SparklesIcon className="h-5 w-5 animate-pulse" />
              Rekomendasi AI Filter Screener
            </DialogTitle>
            <DialogDescription>
              Gemini merekomendasikan parameter filter pre-screen untuk strategi <strong className="text-foreground uppercase">{activeStrategyTab}</strong> berdasarkan kondisi
              pasar saat ini.
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
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsRecommendationOpen(false)} className="h-9 px-4 text-xs font-semibold w-full sm:w-auto">
                    Batal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyRecommendations}
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
    </form>
  );
}

export default SettingsForm;
