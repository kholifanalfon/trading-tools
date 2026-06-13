export interface GeminiSettings {
  gemini_api_key: string;
  gemini_model: string;
}

export interface UpdateGeminiSettingsPayload {
  gemini_api_key?: string;
  gemini_model: string;
}
