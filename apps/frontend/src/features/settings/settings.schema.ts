import { z } from "zod";

export const UpdateSettingsFormSchema = z.object({
  gemini_api_key: z.string().optional(),
  gemini_model: z.string().min(1, "Gemini Model is required"),
  finnhub_api_key: z.string().optional(),
  stock_screener_provider: z.enum(["finnhub", "yahoo_finance"]).default("yahoo_finance"),
  exchanges_config: z.string().optional(),
  default_strategy: z.string().optional(),
});


export type UpdateSettingsFormInput = z.infer<typeof UpdateSettingsFormSchema>;

