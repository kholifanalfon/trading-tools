import z from "zod";

export const BacktestFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  strategy: z.enum(["day", "swing", "position"]),
  buyThreshold: z.coerce.number().min(0, "Minimal 0").max(100, "Maksimal 100"),
  sellThreshold: z.coerce.number().min(0, "Minimal 0").max(100, "Maksimal 100"),
  stopLossPercent: z.coerce.number(),
  takeProfitPercent: z.coerce.number(),
});

export type BacktestFormInput = z.infer<typeof BacktestFormSchema>;
