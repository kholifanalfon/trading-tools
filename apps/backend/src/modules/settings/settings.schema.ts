import { z } from "zod";

export const UpdateSettingsSchema = z.object({
  gemini_api_key: z.string().optional(),
  gemini_model: z.string().min(1, "Gemini Model is required"),
  finnhub_api_key: z.string().optional(),
  stock_screener_provider: z.enum(["finnhub", "yahoo_finance"]),
  exchanges_config: z.string().optional(),
  default_strategy: z.string().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

export const UpdateScoringRuleSchema = z.object({
  id: z.number(),
  value: z.number(),
  weight: z.number().int(),
});

export const UpdateScoringRulesBatchSchema = z.object({
  rules: z.array(UpdateScoringRuleSchema),
});

export type UpdateScoringRulesBatchInput = z.infer<typeof UpdateScoringRulesBatchSchema>;

