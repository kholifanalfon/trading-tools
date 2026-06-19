import { useState } from "react";
import { useGetSettings } from "../hooks/use-get-settings";
import { useUpdateSettings } from "../hooks/use-update-settings";
import { useGetScoringRules } from "../hooks/use-get-scoring-rules";
import { useUpdateScoringRules } from "../hooks/use-update-scoring-rules";
import { SettingsForm } from "../components/settings-form";
import { ScoringRulesForm } from "../components/scoring-rules-form";
import { UpdateGeminiSettingsPayload, UpdateScoringRulesBatchPayload } from "../types/settings.types";
import { toast } from "sonner";
import { CogIcon, ShieldAlertIcon, CheckCircle2Icon, AlertTriangleIcon, RefreshCwIcon, DownloadIcon } from "lucide-react";
import { usePwa } from "@/shared/providers/pwa-provider";

export function SettingsPage() {
  const [currentTab, setCurrentTab] = useState<"general" | "scoring">("general");
  const [isChecking, setIsChecking] = useState(false);

  const { data: settings, isLoading: isFetchingSettings, error: settingsError } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();

  const { data: rules, isLoading: isFetchingRules, error: rulesError } = useGetScoringRules();
  const updateRulesMutation = useUpdateScoringRules();

  const { needRefresh, checkForUpdates, updateServiceWorker } = usePwa();

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

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    const toastId = toast.loading("Checking for updates...");
    try {
      // Small delay to let checking progress feel natural and ensure PWA registry processes updates
      await checkForUpdates();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (needRefresh) {
        toast.success("A new update is available!", { id: toastId });
      } else {
        toast.info("The application is up to date.", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to check for updates.", { id: toastId });
    } finally {
      setIsChecking(false);
    }
  };

  const isLoading = currentTab === "general" ? isFetchingSettings : isFetchingRules;
  const error = currentTab === "general" ? settingsError : rulesError;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
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
        <div className="space-y-6">
          <SettingsForm
            settings={settings}
            onSubmit={handleFormSubmit}
            isLoading={updateSettingsMutation.isPending}
            error={updateSettingsMutation.error}
          />

          {/* System & PWA Status Card */}
          <div className="max-w-5xl mx-auto bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  System & PWA Status
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Verify the Progressive Web App status and check for updates manually.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCheckUpdates}
                  disabled={isChecking}
                  className="flex items-center gap-1.5 h-8 text-[11px] font-semibold px-4 rounded-md border border-border/75 hover:bg-muted/50 transition duration-150 disabled:opacity-50 text-foreground"
                >
                  <RefreshCwIcon className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
                  {isChecking ? "Checking..." : "Check for Updates"}
                </button>

                {needRefresh && (
                  <button
                    onClick={() => updateServiceWorker(true)}
                    className="flex items-center gap-1.5 h-8 text-[11px] font-semibold px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition duration-150 animate-bounce"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    Update & Reload
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
              {needRefresh ? (
                <div className="flex items-start gap-2.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 rounded-lg w-full">
                  <AlertTriangleIcon className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold">New update available!</h4>
                    <p className="text-[10px] text-amber-500/80 mt-0.5 leading-relaxed">
                      A new version of the trading platform has been downloaded in the background. Click the "Update & Reload" button above to activate it immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-lg w-full">
                  <CheckCircle2Icon className="h-4.5 w-4.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold">Application is up to date</h4>
                    <p className="text-[10px] text-emerald-500/80 mt-0.5">
                      You are currently running the latest version of the Trading Screener & Backtest platform.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
