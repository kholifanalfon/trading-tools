import { useState, useEffect } from "react";
import { useGetStocks } from "../hooks/use-get-stocks";
import { useCreateStock } from "../hooks/use-create-stock";
import { useUpdateStock } from "../hooks/use-update-stock";
import { useDeleteStock } from "../hooks/use-delete-stock";
import { useSyncStock } from "../hooks/use-sync-stock";
import { StockTable } from "../components/stock-table";
import { StockFormDialog } from "../components/stock-form-dialog";
import { Stock } from "../types/stocks.types";
import { getSyncStatusApi } from "../services/stocks.api";
import { toast } from "sonner";
import { useWebSocket } from "@/shared/hooks/use-websocket";

export function StockListPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Listen to sync status updates in real-time via WebSockets to update button states
  useWebSocket(["stocks", "sync-status"], () => {
    setIsSyncing(false);
  });

  // Check initial sync status on mount
  useEffect(() => {
    let active = true;
    const checkInitialSyncStatus = async () => {
      try {
        const state = await getSyncStatusApi();
        if (active && state.status === "running") {
          setIsSyncing(true);
        }
      } catch (err) {
        console.error("Error checking sync status:", err);
      }
    };

    checkInitialSyncStatus();
    return () => {
      active = false;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // TanStack Query & Mutations
  const { data, isLoading } = useGetStocks({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const createStockMutation = useCreateStock();
  const updateStockMutation = useUpdateStock();
  const deleteStockMutation = useDeleteStock();
  const syncStockMutation = useSyncStock();

  const handleAddClick = () => {
    setSelectedStock(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (stock: Stock) => {
    setSelectedStock(stock);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (stock: Stock) => {
    if (confirm(`Are you sure you want to delete stock ${stock.symbol}?`)) {
      try {
        await deleteStockMutation.mutateAsync(stock.id);
      } catch (err) {
        console.error("Failed to delete stock:", err);
      }
    }
  };

  const handleSyncClick = async () => {
    try {
      setIsSyncing(true);
      await syncStockMutation.mutateAsync();
      toast.success("Stock synchronization started in the background. The list will update shortly!");
    } catch (err) {
      console.error("Sync failed:", err);
      toast.error(err instanceof Error ? err.message : "Sync failed");
      setIsSyncing(false);
    }
  };

  const handleWatchlistToggle = async (stock: Stock) => {
    try {
      await updateStockMutation.mutateAsync({
        id: stock.id,
        data: { watchlist: !stock.watchlist },
      });
      toast.success(`${stock.symbol} ${!stock.watchlist ? "added to" : "removed from"} watchlist.`);
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
      toast.error("Failed to update watchlist status.");
    }
  };


  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedStock) {
        await updateStockMutation.mutateAsync({
          id: selectedStock.id,
          data: formData,
        });
      } else {
        await createStockMutation.mutateAsync(formData);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Form submit failed:", err);
    }
  };

  const activeMutation = selectedStock ? updateStockMutation : createStockMutation;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock Management</h1>
        <p className="text-sm text-muted-foreground">
          View, add, modify, and delete stock ticker records in the database.
        </p>
      </div>

      <StockTable
        stocks={data?.items || []}
        total={data?.total || 0}
        page={page}
        totalPages={data?.totalPages || 1}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onSyncClick={handleSyncClick}
        onWatchlistToggle={handleWatchlistToggle}
        isLoading={isLoading}
        isSyncing={isSyncing}
      />

      <StockFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        stock={selectedStock}
        isLoading={activeMutation.isPending}
        error={activeMutation.error}
      />
    </div>
  );
}
export default StockListPage;


