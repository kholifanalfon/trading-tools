import { z } from "zod";

export const CreatePortfolioSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  balance: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Balance must be a valid non-negative number").default("0"),
});

export const UpdatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const AddTransactionSchema = z.object({
  symbol: z.string().min(1).max(10).optional().nullable(),
  type: z.enum(["BUY", "SELL", "DEPOSIT", "WITHDRAW"]),
  quantity: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Quantity must be a valid non-negative number").optional().nullable(),
  price: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Price must be a valid non-negative number").optional().nullable(),
  fee: z.coerce.string().regex(/^\d+(\.\d+)?$/, "Fee must be a valid non-negative number").default("0"),
  takeProfit: z.string().regex(/^\d+(\.\d+)?$/, "Take profit must be a valid non-negative number").optional().nullable(),
  stopLoss: z.string().regex(/^\d+(\.\d+)?$/, "Stop loss must be a valid non-negative number").optional().nullable(),
  transactionDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.type === "BUY" || data.type === "SELL") {
      return !!data.symbol && !!data.quantity && !!data.price;
    }
    return true;
  },
  {
    message: "Symbol, quantity, and price are required for BUY or SELL transactions",
    path: ["symbol"],
  }
);

export type CreatePortfolioInput = z.infer<typeof CreatePortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof UpdatePortfolioSchema>;
export type AddTransactionInput = z.infer<typeof AddTransactionSchema>;
