import z from "zod";

export const RunBacktestSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  strategy: z.enum(["day", "swing", "position"]),
  buyThreshold: z.number().min(0).max(100),
  sellThreshold: z.number().min(0).max(100),
  stopLossPercent: z.number(),
  takeProfitPercent: z.number(),
});

export const RunMultiBacktestSchema = z.object({
  strategy: z.enum(["day", "swing", "position"]),
  buyThreshold: z.number().min(0).max(100),
  sellThreshold: z.number().min(0).max(100),
  stopLossPercent: z.number(),
  takeProfitPercent: z.number(),
});

export const AiAlternativeSchema = z.object({
  strategy: z.enum(["day", "swing", "position"]),
  beforeParams: z.record(z.any()),
  beforeMetrics: z.record(z.any()),
  afterParams: z.record(z.any()),
  afterMetrics: z.record(z.any()),
});
