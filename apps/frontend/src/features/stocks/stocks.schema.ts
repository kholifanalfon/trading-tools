import { z } from "zod";

export const CreateStockFormSchema = z.object({
  symbol: z
    .string()
    .min(1, { message: "Ticker symbol is required" })
    .max(10, { message: "Ticker must be at most 10 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Ticker symbol must be alphanumeric" }),
  name: z.string().min(1, { message: "Stock name is required" }),
  sector: z.string().min(1, { message: "Sector is required" }),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: "Price must be non-negative" })
  ),
});

export const UpdateStockFormSchema = z.object({
  symbol: z
    .string()
    .min(1, { message: "Ticker symbol is required" })
    .max(10, { message: "Ticker must be at most 10 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Ticker symbol must be alphanumeric" }),
  name: z.string().min(1, { message: "Stock name is required" }),
  sector: z.string().min(1, { message: "Sector is required" }),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: "Price must be non-negative" })
  ),
});

export type CreateStockFormInput = z.infer<typeof CreateStockFormSchema>;
export type UpdateStockFormInput = z.infer<typeof UpdateStockFormSchema>;
