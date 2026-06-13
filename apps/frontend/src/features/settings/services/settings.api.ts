import { api } from "@/shared/config/api";
import { GeminiSettings, UpdateGeminiSettingsPayload } from "../types/settings.types";

export async function getSettingsApi(): Promise<GeminiSettings> {
  const response = await api.get<GeminiSettings>("/settings");
  return response.data;
}

export async function updateSettingsApi(data: UpdateGeminiSettingsPayload): Promise<GeminiSettings> {
  const response = await api.put<GeminiSettings>("/settings", data);
  return response.data;
}
