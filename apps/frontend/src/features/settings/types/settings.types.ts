export interface GeminiSettings {
  gemini_api_key: string;
  gemini_model: string;
  finnhub_api_key?: string;
  stock_screener_provider?: "finnhub" | "yahoo_finance";
  exchanges_config?: string;
  default_strategy?: string;
}

export interface UpdateGeminiSettingsPayload {
  gemini_api_key?: string;
  gemini_model: string;
  finnhub_api_key?: string;
  stock_screener_provider?: "finnhub" | "yahoo_finance";
  exchanges_config?: string;
  default_strategy?: string;
}
