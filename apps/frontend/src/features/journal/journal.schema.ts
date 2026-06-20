import { z } from "zod";

export const JournalFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  direction: z.enum(["LONG", "SHORT"]),
  entryPrice: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid positive number"),
  exitPrice: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid non-negative number").optional().or(z.literal("")),
  quantity: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid positive number"),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  setup: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  emotions: z.string().max(100).optional().or(z.literal("")),
  rating: z.coerce.number().min(1).max(5).optional().or(z.null()),
  entryDate: z.string().optional().or(z.literal("")),
  exitDate: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.status === "CLOSED") {
    if (!data.exitPrice || data.exitPrice.trim() === "" || Number(data.exitPrice) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exit price is required when trade is CLOSED",
        path: ["exitPrice"],
      });
    }
  }
});

export type JournalFormValues = z.infer<typeof JournalFormSchema>;
