import { Stock } from "../types/stocks.types";
import { Edit2Icon, Trash2Icon, PlusIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export interface StockTableProps {
  stocks: Stock[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (stock: Stock) => void;
  onDeleteClick: (stock: Stock) => void;
  isLoading: boolean;
}

export function StockTable({
  stocks,
  total,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isLoading,
}: StockTableProps) {
  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search symbol, name, sector..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button onClick={onAddClick} className="flex items-center gap-1.5 h-8 text-xs px-3">
          <PlusIcon className="h-3.5 w-3.5" />
          Add Stock
        </Button>
      </div>

      {/* Table Card Container */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-8 px-4 text-xs font-semibold">Symbol</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Name</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Sector</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Price (IDR)</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Last Updated</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  No stock records found.
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => (
                <TableRow key={stock.id} className="hover:bg-muted/20">
                  <TableCell className="py-2 px-4 font-semibold text-xs text-indigo-400 font-mono">
                    {stock.symbol}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs text-foreground font-medium">{stock.name}</TableCell>
                  <TableCell className="py-2 px-4 text-xs text-muted-foreground">{stock.sector}</TableCell>
                  <TableCell className="py-2 px-4 text-xs text-foreground font-mono">
                    {stock.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs text-muted-foreground">
                    {new Date(stock.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClick(stock)}
                        className="h-7 w-7 p-0"
                        title="Edit Stock"
                      >
                        <Edit2Icon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(stock)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete Stock"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/5">
            <span className="text-[10px] text-muted-foreground">
              Page {page} of {totalPages} ({total} stocks)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeftIcon className="h-3 w-3 mr-0.5" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="h-7 px-2 text-xs"
              >
                Next
                <ChevronRightIcon className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
