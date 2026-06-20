import { z } from "zod";

export const CreatePortfolioFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  balance: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid non-negative number").default("0"),
});

export const TransactionFormSchema = z.object({
  type: z.enum(["BUY", "SELL", "DEPOSIT", "WITHDRAW"]),
  symbol: z.string().max(10).optional().or(z.literal("")),
  quantity: z.string().optional().or(z.literal("")),
  price: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid positive number").or(z.literal("")),
  fee: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid non-negative number").default("0"),
  notes: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.type === "BUY" || data.type === "SELL") {
    if (!data.symbol || data.symbol.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Symbol is required for BUY/SELL",
        path: ["symbol"],
      });
    }
    if (!data.quantity || data.quantity.trim() === "" || Number(data.quantity) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity must be greater than 0",
        path: ["quantity"],
      });
    }
    if (!data.price || data.price.trim() === "" || Number(data.price) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be greater than 0",
        path: ["price"],
      });
    }
  } else {
    // Deposit / Withdraw
    if (!data.price || data.price.trim() === "" || Number(data.price) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount is required and must be greater than 0",
        path: ["price"],
      });
    }
  }
});

export type CreatePortfolioFormValues = z.infer<typeof CreatePortfolioFormSchema>;
export type TransactionFormValues = z.infer<typeof TransactionFormSchema>;
