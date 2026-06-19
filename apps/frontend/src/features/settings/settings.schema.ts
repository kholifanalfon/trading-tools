import { z } from "zod";

export const UpdateSettingsFormSchema = z.object({
  gemini_api_key: z.string().optional(),
  gemini_model: z.string().min(1, "Gemini Model is required"),
  finnhub_api_key: z.string().optional(),
  stock_screener_provider: z.enum(["finnhub", "yahoo_finance"]).default("yahoo_finance"),
  exchanges_config: z.string().optional(),
  default_strategy: z.string().optional(),
  screener_rules_day: z.string().optional(),
  screener_rules_swing: z.string().optional(),
  screener_rules_position: z.string().optional(),
});

export type UpdateSettingsFormInput = z.infer<typeof UpdateSettingsFormSchema>;

export const AiRecommendationRuleSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.number(),
  valueMax: z.number().optional(),
  justification: z.string(),
});

export const AiRecommendationResponseSchema = z.object({
  rules: z.array(AiRecommendationRuleSchema),
});

export type AiRecommendationRule = z.infer<typeof AiRecommendationRuleSchema>;
export type AiRecommendationResponse = z.infer<typeof AiRecommendationResponseSchema>;
