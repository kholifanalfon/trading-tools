import { z } from "zod";

export const StockSearchQuerySchema = z.object({
  q: z.string().min(1, "Search query 'q' is required"),
});

export const StockQuoteQuerySchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required"),
});

export const StockDataQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  search: z.string().optional(),
  date: z.string().optional(),
  watchlist: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  exchange: z.string().optional(),
  strategy: z.string().optional(),
});

export type StockSearchQuery = z.infer<typeof StockSearchQuerySchema>;
export type StockQuoteQuery = z.infer<typeof StockQuoteQuerySchema>;
export type StockDataQuery = z.infer<typeof StockDataQuerySchema>;

export const SyncHistoryBodySchema = z.object({
  date: z.string().optional(),
});

export const StockSearchResultSchema = z.object({
  symbol: z.string(),
  description: z.string(),
  type: z.string(),
});

export const StockQuoteSchema = z.object({
  symbol: z.string(),
  currentPrice: z.number(),
  change: z.number(),
  percentChange: z.number(),
  high: z.number(),
  low: z.number(),
  open: z.number(),
  previousClose: z.number(),
});

export const SyncHistoricalStateSchema = z.object({
  status: z.enum(["idle", "running", "success", "failed"]),
  error: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
});

export type StockSearchResult = z.infer<typeof StockSearchResultSchema>;
export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type SyncHistoricalState = z.infer<typeof SyncHistoricalStateSchema>;
