import { useGetSettings } from "../hooks/use-get-settings";
import { useUpdateSettings } from "../hooks/use-update-settings";
import { SettingsForm } from "../components/settings-form";
import { UpdateGeminiSettingsPayload } from "../types/settings.types";
import { toast } from "sonner";

export function SettingsPage() {
  const { data: settings, isLoading: isFetching, error: fetchError } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();

  const handleFormSubmit = async (formData: UpdateGeminiSettingsPayload) => {
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage system configurations, API credentials, and application preferences.</p>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Loading configurations...</span>
        </div>
      ) : fetchError ? (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-center text-xs text-destructive font-semibold">
          Error loading settings: {(fetchError as Error).message}
        </div>
      ) : (
        <SettingsForm settings={settings} onSubmit={handleFormSubmit} isLoading={updateSettingsMutation.isPending} error={updateSettingsMutation.error} />
      )}
    </div>
  );
}
export default SettingsPage;
