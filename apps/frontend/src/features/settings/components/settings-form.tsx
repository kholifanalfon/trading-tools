import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, SaveIcon, SparklesIcon } from "lucide-react";
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
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateSettingsFormInput>({
    resolver: zodResolver(UpdateSettingsFormSchema),
    defaultValues: {
      gemini_api_key: "",
      gemini_model: "gemini-1.5-flash",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        gemini_api_key: settings.gemini_api_key || "",
        gemini_model: settings.gemini_model || "gemini-1.5-flash",
      });
    }
  }, [settings, reset]);

  const onFormSubmit = (data: UpdateSettingsFormInput) => {
    onSubmit(data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 shadow-lg overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-border/50 pb-5">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Gemini AI Configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure parameters to connect to Google Generative AI for stock
              details syncing.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <FieldGroup className="space-y-5">
            <ErrorDisplay error={error} />

            {/* Gemini API Key */}
            <Field className="space-y-2">
              <FieldLabel
                htmlFor="gemini_api_key"
                className="text-xs font-semibold text-muted-foreground"
              >
                Gemini API Key
              </FieldLabel>
              <div className="relative">
                <Input
                  id="gemini_api_key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter Google AI Studio API Key (AIzaSy...)"
                  disabled={isLoading}
                  className="pr-10 bg-background/50 border-border/70 text-xs h-9"
                  {...register("gemini_api_key")}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showApiKey ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Get an API key from Google AI Studio. It will be securely stored
                in the PostgreSQL database.
              </p>
              {errors.gemini_api_key && (
                <p className="text-xs text-destructive font-semibold mt-1">
                  {errors.gemini_api_key.message}
                </p>
              )}
            </Field>

            {/* Gemini Model */}
            <Field className="space-y-2">
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

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
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
      </div>
    </div>
  );
}
