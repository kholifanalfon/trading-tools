import { useQuery } from "@tanstack/react-query";
import { getSettingsApi } from "../services/settings.api";
import { settingsKeys } from "../settings.keys";

export function useGetSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: getSettingsApi,
  });
}
