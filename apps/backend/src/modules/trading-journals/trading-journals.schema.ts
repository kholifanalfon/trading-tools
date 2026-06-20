import { z } from "zod";

export const CreateTradingJournalSchema = z.object({
  portfolioId: z.number().optional().nullable(),
  transactionId: z.number().optional().nullable(),
  symbol: z.string().min(1).max(10),
  direction: z.enum(["LONG", "SHORT"]),
  entryPrice: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Entry price must be a valid non-negative number"),
  exitPrice: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Exit price must be a valid non-negative number").optional().nullable(),
  quantity: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Quantity must be a valid non-negative number"),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  pnl: z.coerce.string().regex(/^-?\d+(\.\d+)?$/, "PnL must be a valid number").optional().nullable(),
  setup: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  emotions: z.string().max(100).optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  entryDate: z.string().datetime().optional().nullable(),
  exitDate: z.string().datetime().optional().nullable(),
});

export const UpdateTradingJournalSchema = z.object({
  portfolioId: z.number().optional().nullable(),
  transactionId: z.number().optional().nullable(),
  symbol: z.string().min(1).max(10).optional(),
  direction: z.enum(["LONG", "SHORT"]).optional(),
  entryPrice: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Entry price must be a valid non-negative number").optional(),
  exitPrice: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Exit price must be a valid non-negative number").optional().nullable(),
  quantity: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Quantity must be a valid non-negative number").optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  pnl: z.coerce.string().regex(/^-?\d+(\.\d+)?$/, "PnL must be a valid number").optional().nullable(),
  setup: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  emotions: z.string().max(100).optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  entryDate: z.string().datetime().optional().nullable(),
  exitDate: z.string().datetime().optional().nullable(),
});

export type CreateTradingJournalInput = z.infer<typeof CreateTradingJournalSchema>;
export type UpdateTradingJournalInput = z.infer<typeof UpdateTradingJournalSchema>;
