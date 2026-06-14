import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  SparklesIcon,
  TrendingUpIcon,
  RefreshCw,
} from "lucide-react";
import { useSyncExchanges } from "../hooks/use-sync-exchanges";
import {
  UpdateSettingsFormSchema,
  UpdateSettingsFormInput,
} from "../settings.schema";
import { GeminiSettings } from "../types/settings.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { ErrorDisplay } from "@/shared/components/ui/error-display";

export interface SettingsFormProps {
  settings: GeminiSettings | undefined;
  onSubmit: (data: UpdateSettingsFormInput) => void;
  isLoading: boolean;
  error: unknown;
}

export function SettingsForm({
  settings,
  onSubmit,
  isLoading,
  error,
}: SettingsFormProps) {
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
    },
  });

  const selectedProvider = watch("stock_screener_provider");

  useEffect(() => {
    if (settings) {
      reset({
        gemini_api_key: settings.gemini_api_key || "",
        gemini_model: settings.gemini_model || "gemini-1.5-flash",
        finnhub_api_key: settings.finnhub_api_key || "",
        stock_screener_provider:
          settings.stock_screener_provider || "yahoo_finance",
        exchanges_config: settings.exchanges_config || "",
        default_strategy: settings.default_strategy || "day",
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

  const handleExchangeToggle = (id: string) => {
    const updated = exchanges.map((ex) =>
      ex.id === id ? { ...ex, enabled: !ex.enabled } : ex,
    );
    setExchanges(updated);
    setValue("exchanges_config", JSON.stringify(updated), {
      shouldDirty: true,
    });
  };

  const handleLimitChange = (id: string, limit: number) => {
    const updated = exchanges.map((ex) =>
      ex.id === id ? { ...ex, limit: Math.max(1, limit) } : ex,
    );
    setExchanges(updated);
    setValue("exchanges_config", JSON.stringify(updated), {
      shouldDirty: true,
    });
  };

  const onFormSubmit = (data: UpdateSettingsFormInput) => {
    onSubmit(data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 max-w-5xl mx-auto"
    >
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
                <h2 className="text-md font-bold text-foreground">
                  Gemini AI Configuration
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Configure Google Generative AI details.
                </p>
              </div>
            </div>

            <FieldGroup className="space-y-4">
              {/* Gemini API Key */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="gemini_api_key"
                  className="text-xs font-semibold text-muted-foreground"
                >
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
                    {showGeminiKey ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground leading-normal">
                  API Key securely stored in PostgreSQL database.
                </p>
                {errors.gemini_api_key && (
                  <p className="text-xs text-destructive font-semibold mt-1">
                    {errors.gemini_api_key.message}
                  </p>
                )}
              </Field>

              {/* Gemini Model */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="gemini_model"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Gemini Model
                </FieldLabel>
                <div className="relative">
                  <select
                    id="gemini_model"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("gemini_model")}
                  >
                    <option value="gemini-3.1-flash-lite">
                      gemini-3.1-flash-lite (Recommended, Fast & Cost-effective)
                    </option>
                    <option value="gemini-3.5-flash">
                      gemini-3.5-flash (Accurate, Higher latency)
                    </option>
                    <option value="gemini-3.1-pro-preview">
                      gemini-3.1-pro-preview (Latest Flash Model)
                    </option>
                  </select>
                </div>
                {errors.gemini_model && (
                  <p className="text-xs text-destructive font-semibold mt-1">
                    {errors.gemini_model.message}
                  </p>
                )}
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
                <h2 className="text-md font-bold text-foreground">
                  Stock Screener Configuration
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Choose your API provider.
                </p>
              </div>
            </div>

            <FieldGroup className="space-y-4">
              {/* Provider Selection */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="stock_screener_provider"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Screener API Provider
                </FieldLabel>
                <div className="relative">
                  <select
                    id="stock_screener_provider"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-border/70 bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("stock_screener_provider")}
                  >
                    <option value="yahoo_finance">
                      Yahoo Finance (Free, no API Key required)
                    </option>
                    <option value="finnhub">
                      Finnhub API (API Key required)
                    </option>
                  </select>
                </div>
                {errors.stock_screener_provider && (
                  <p className="text-xs text-destructive font-semibold mt-1">
                    {errors.stock_screener_provider.message}
                  </p>
                )}
              </Field>

              {/* Default Strategy Selection */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="default_strategy"
                  className="text-xs font-semibold text-muted-foreground"
                >
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
                <p className="text-[9px] text-muted-foreground leading-normal">
                  Sets the default strategy in the screener list.
                </p>
                {errors.default_strategy && (
                  <p className="text-xs text-destructive font-semibold mt-1">
                    {errors.default_strategy.message}
                  </p>
                )}
              </Field>

              {/* Finnhub API Key */}
              {selectedProvider === "finnhub" && (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="finnhub_api_key"
                    className="text-xs font-semibold text-muted-foreground"
                  >
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
                      {showFinnhubKey ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-normal">
                    Get a free API key from finnhub.io.
                  </p>
                  {errors.finnhub_api_key && (
                    <p className="text-xs text-destructive font-semibold mt-1">
                      {errors.finnhub_api_key.message}
                    </p>
                  )}
                </Field>
              )}
            </FieldGroup>

            <FieldGroup className="space-y-4">
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <FieldLabel
                    htmlFor="stock_screener_provider"
                    className="text-xs font-semibold text-muted-foreground"
                  >
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
                    <RefreshCw
                      className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Sync List"}
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {exchanges.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/30 hover:bg-muted/10 transition"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={`checkbox-${ex.id}`}
                          type="checkbox"
                          checked={!!ex.enabled}
                          onChange={() => handleExchangeToggle(ex.id)}
                          disabled={isLoading}
                          className="rounded border-border/70 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-background cursor-pointer"
                        />
                        <label
                          htmlFor={`checkbox-${ex.id}`}
                          className="cursor-pointer select-none"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {ex.name}
                          </p>
                          <p className="text-[12px] text-muted-foreground">
                            {ex.country} &bull; Suffix:{" "}
                            <strong className="text-indigo-400 font-mono">
                              {ex.suffix || "[None]"}
                            </strong>
                          </p>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Stocks limit:
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={ex.limit !== undefined ? ex.limit : 15}
                          disabled={!ex.enabled || isLoading}
                          onChange={(e) =>
                            handleLimitChange(ex.id, parseInt(e.target.value) || 1)
                          }
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

      {/* Action Footer */}
      <div className="flex items-center justify-between p-4 bg-card/40 backdrop-blur rounded-xl border border-border/80">
        <div>
          {savedSuccess && !isDirty && (
            <span className="text-xs text-emerald-400 font-semibold animate-fade-in">
              Settings saved successfully!
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || (!isDirty && settings !== undefined)}
          className="flex items-center gap-2 h-9 text-xs px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
        >
          <SaveIcon className="h-3.5 w-3.5" />
          {isLoading ? "Saving Settings..." : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
}

export default SettingsForm;
