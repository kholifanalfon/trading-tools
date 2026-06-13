import { z } from "zod";

export const CreateStockSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be at most 10 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  sector: z
    .string()
    .min(1, "Sector is required")
    .max(50, "Sector must be at most 50 characters"),
  price: z.number().int().min(0, "Price must be non-negative"),
});

export const UpdateStockSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be at most 10 characters")
    .transform((val) => val.toUpperCase())
    .optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  sector: z
    .string()
    .min(1, "Sector is required")
    .max(50, "Sector must be at most 50 characters")
    .optional(),
  price: z.number().int().min(0, "Price must be non-negative").optional(),
});

export const StockQuerySchema = z.object({
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).default(1),
  limit: z
    .preprocess((val) => Number(val) || 10, z.number().min(1).max(100))
    .default(10),
  search: z.string().optional(),
});

export const SyncStateSchema = z.object({
  status: z.enum(["idle", "running", "success", "failed"]),
  error: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
});

export type CreateStockInput = z.infer<typeof CreateStockSchema>;
export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
export type StockQueryInput = z.infer<typeof StockQuerySchema>;
export type SyncState = z.infer<typeof SyncStateSchema>;
