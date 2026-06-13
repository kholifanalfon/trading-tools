import { z } from "zod";

export const UpdateSettingsFormSchema = z.object({
  gemini_api_key: z.string().optional(),
  gemini_model: z.string().min(1, "Gemini Model is required"),
});

export type UpdateSettingsFormInput = z.infer<typeof UpdateSettingsFormSchema>;
