import { z } from "zod";

export const LiveStockDataQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  search: z.string().optional(),
  watchlist: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  exchange: z.string().optional(),
  strategy: z.string().optional(),
  refresh: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
});

export type LiveStockDataQuery = z.infer<typeof LiveStockDataQuerySchema>;
