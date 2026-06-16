import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateStockFormSchema, UpdateStockFormSchema } from "../stocks.schema";
import { Stock } from "../types/stocks.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

export interface StockFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  stock?: Stock | null;
  isLoading: boolean;
  error: unknown;
}

export function StockFormDialog({ isOpen, onClose, onSubmit, stock, isLoading, error }: StockFormDialogProps) {
  const isEdit = !!stock;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? UpdateStockFormSchema : CreateStockFormSchema),
    defaultValues: {
      symbol: "",
      name: "",
      sector: "",
      price: "",
      exchange: "IDX",
      watchlist: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (stock) {
        reset({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: String(stock.price),
          exchange: stock.exchange || "IDX",
          watchlist: !!stock.watchlist,
        });
      } else {
        reset({
          symbol: "",
          name: "",
          sector: "",
          price: "",
          exchange: "IDX",
          watchlist: false,
        });
      }
    }
  }, [isOpen, stock, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Stock Record" : "Add New Stock"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modify the selected stock's properties below." : "Register a new stock symbol and details in the database."}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FieldGroup>
            <ErrorDisplay error={error} />

            {/* Symbol */}
            <Field>
              <FieldLabel htmlFor="symbol">Ticker Symbol</FieldLabel>
              <Input id="symbol" type="text" placeholder="e.g. BBCA" disabled={isLoading} {...register("symbol")} className="uppercase" />
              {errors.symbol && <p className="text-xs text-destructive font-semibold mt-1">{errors.symbol.message as string}</p>}
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel htmlFor="name">Stock Name</FieldLabel>
              <Input id="name" type="text" placeholder="e.g. Bank Central Asia Tbk" disabled={isLoading} {...register("name")} />
              {errors.name && <p className="text-xs text-destructive font-semibold mt-1">{errors.name.message as string}</p>}
            </Field>

            {/* Sector */}
            <Field>
              <FieldLabel htmlFor="sector">Sector</FieldLabel>
              <Input id="sector" type="text" placeholder="e.g. Financials" disabled={isLoading} {...register("sector")} />
              {errors.sector && <p className="text-xs text-destructive font-semibold mt-1">{errors.sector.message as string}</p>}
            </Field>

            {/* Price */}
            <Field>
              <FieldLabel htmlFor="price">Price (IDR)</FieldLabel>
              <Input id="price" type="number" placeholder="e.g. 10000" disabled={isLoading} {...register("price")} />
              {errors.price && <p className="text-xs text-destructive font-semibold mt-1">{errors.price.message as string}</p>}
            </Field>

            {/* Exchange */}
            <Field>
              <FieldLabel htmlFor="exchange">Exchange</FieldLabel>
              <Input id="exchange" type="text" placeholder="e.g. IDX, NYSE, NASDAQ" disabled={isLoading} {...register("exchange")} />
              {errors.exchange && <p className="text-xs text-destructive font-semibold mt-1">{errors.exchange.message as string}</p>}
            </Field>

            {/* Watchlist */}
            <Field className="flex items-center gap-2 pt-2">
              <input
                id="watchlist"
                type="checkbox"
                disabled={isLoading}
                {...register("watchlist")}
                className="rounded border-border bg-[#09090b] text-indigo-500 h-4 w-4 focus:ring-0 cursor-pointer accent-indigo-500"
              />
              <FieldLabel htmlFor="watchlist" className="cursor-pointer select-none text-xs font-semibold">
                Add to Watchlist
              </FieldLabel>
            </Field>
          </FieldGroup>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving changes..." : isEdit ? "Save Changes" : "Add Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
