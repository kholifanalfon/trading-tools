import { api } from "@/shared/config/api";
import { GeminiSettings, UpdateGeminiSettingsPayload, ScoringRule, UpdateScoringRulesBatchPayload } from "../types/settings.types";

export async function getSettingsApi(): Promise<GeminiSettings> {
  const response = await api.get<GeminiSettings>("/settings");
  return response.data;
}

export async function updateSettingsApi(data: UpdateGeminiSettingsPayload): Promise<GeminiSettings> {
  const response = await api.put<GeminiSettings>("/settings", data);
  return response.data;
}

export async function syncExchangesApi(): Promise<GeminiSettings> {
  const response = await api.post<GeminiSettings>("/settings/exchanges/sync");
  return response.data;
}

export async function getScoringRulesApi(): Promise<ScoringRule[]> {
  const response = await api.get<ScoringRule[]>("/settings/scoring-rules");
  return response.data;
}

export async function updateScoringRulesApi(data: UpdateScoringRulesBatchPayload): Promise<ScoringRule[]> {
  const response = await api.put<ScoringRule[]>("/settings/scoring-rules", data);
  return response.data;
}

