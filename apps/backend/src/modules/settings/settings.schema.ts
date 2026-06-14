import { z } from "zod";

export const UpdateSettingsSchema = z.object({
  gemini_api_key: z.string().optional(),
  gemini_model: z.string().min(1, "Gemini Model is required"),
  finnhub_api_key: z.string().optional(),
  stock_screener_provider: z.enum(["finnhub", "yahoo_finance"]),
  exchanges_config: z.string().optional(),
});


export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

