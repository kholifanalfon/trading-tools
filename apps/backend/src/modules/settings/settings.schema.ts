import { z } from "zod";

export const UpdateSettingsSchema = z.object({
  gemini_api_key: z.string().optional(),
  gemini_model: z.string().min(1, "Gemini Model is required"),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
