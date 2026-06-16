import { useState } from "react";
import { useGetSettings } from "../hooks/use-get-settings";
import { useUpdateSettings } from "../hooks/use-update-settings";
import { useGetScoringRules } from "../hooks/use-get-scoring-rules";
import { useUpdateScoringRules } from "../hooks/use-update-scoring-rules";
import { SettingsForm } from "../components/settings-form";
import { ScoringRulesForm } from "../components/scoring-rules-form";
import { UpdateGeminiSettingsPayload, UpdateScoringRulesBatchPayload } from "../types/settings.types";
import { toast } from "sonner";
import { CogIcon, ShieldAlertIcon } from "lucide-react";

export function SettingsPage() {
  const [currentTab, setCurrentTab] = useState<"general" | "scoring">("general");

  const { data: settings, isLoading: isFetchingSettings, error: settingsError } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();

  const { data: rules, isLoading: isFetchingRules, error: rulesError } = useGetScoringRules();
  const updateRulesMutation = useUpdateScoringRules();

  const handleFormSubmit = async (formData: UpdateGeminiSettingsPayload) => {
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const handleRulesSubmit = async (formData: UpdateScoringRulesBatchPayload) => {
    try {
      await updateRulesMutation.mutateAsync(formData);
      toast.success("Scoring rules saved successfully!");
    } catch (err) {
      console.error("Failed to update scoring rules:", err);
    }
  };

  const isLoading = currentTab === "general" ? isFetchingSettings : isFetchingRules;
  const error = currentTab === "general" ? settingsError : rulesError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage system configurations, API credentials, and scoring parameters.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-card/60 border border-border/80 rounded-lg p-1">
          <button
            onClick={() => setCurrentTab("general")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              currentTab === "general"
                ? "bg-indigo-600 text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CogIcon className="h-3.5 w-3.5" />
            General Config
          </button>
          <button
            onClick={() => setCurrentTab("scoring")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              currentTab === "scoring"
                ? "bg-indigo-600 text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldAlertIcon className="h-3.5 w-3.5" />
            Scoring Rules
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Loading configurations...</span>
        </div>
      ) : error ? (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-center text-xs text-destructive font-semibold">
          Error loading configuration: {(error as Error).message}
        </div>
      ) : currentTab === "general" ? (
        <SettingsForm
          settings={settings}
          onSubmit={handleFormSubmit}
          isLoading={updateSettingsMutation.isPending}
          error={updateSettingsMutation.error}
        />
      ) : (
        <ScoringRulesForm
          rules={rules}
          onSubmit={handleRulesSubmit}
          isLoading={updateRulesMutation.isPending}
          error={updateRulesMutation.error}
        />
      )}
    </div>
  );
}

export default SettingsPage;
