import { useState, useEffect, useRef } from "react";
import { useGetSyncLogs } from "../hooks/use-get-sync-logs";
import { useSyncHistorical } from "../hooks/use-sync-historical";
import { getHistoricalSyncStatusApi } from "../services/screener.api";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { useQueryClient } from "@tanstack/react-query";
import { screenerKeys } from "../screener.keys";
import { toast } from "sonner";
import {
  HistoryIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export function IngestionLogsPage() {
  const getTodayDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("Idle");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: logs, isLoading: isLoadingLogs } = useGetSyncLogs();
  const syncHistoricalMutation = useSyncHistorical();

  // Listen to live logs
  useWebSocket(["screener", "sync-log"], (data) => {
    if (data.message) {
      setSyncLogs((prev) => [...prev, data.message]);
    }
  });

  // Auto scroll to bottom of logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [syncLogs, isSyncing]);

  // Listen to historical sync updates in real-time via WebSockets
  useWebSocket(["screener", "sync-status"], (data) => {
    if (data.status === "running") {
      setIsSyncing(true);
      setSyncStatusText("Syncing...");
    } else if (data.status === "success") {
      setIsSyncing(false);
      setSyncStatusText("Success");
      toast.success("Historical stock data synchronized successfully!");
      queryClient.invalidateQueries({
        queryKey: [...screenerKeys.all, "logs"],
      });
    } else if (data.status === "failed") {
      setIsSyncing(false);
      setSyncStatusText("Failed");
      toast.error(
        `Historical stock sync failed: ${data.error || "Unknown error"}`
      );
      queryClient.invalidateQueries({
        queryKey: [...screenerKeys.all, "logs"],
      });
    }
  });

  // Check initial sync status on mount
  useEffect(() => {
    let active = true;
    const checkInitialSyncStatus = async () => {
      try {
        const state = await getHistoricalSyncStatusApi();
        if (active) {
          if (state.status === "running") {
            setIsSyncing(true);
            setSyncStatusText("Syncing...");
          } else {
            setSyncStatusText(
              state.status.charAt(0).toUpperCase() + state.status.slice(1),
            );
          }
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

  const handleSyncHistorical = async () => {
    try {
      setIsSyncing(true);
      setSyncStatusText("Syncing...");
      setSyncLogs([]);
      await syncHistoricalMutation.mutateAsync(selectedDate);
      toast.success("Historical data sync started in the background!");
    } catch (err) {
      console.error("Failed to start sync:", err);
      toast.error(err instanceof Error ? err.message : "Sync trigger failed");
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Ingestion Logs
            </h1>
            <p className="text-sm text-muted-foreground">
              View historical logs of stock price synchronization runs from
              Yahoo Finance.
            </p>
          </div>
        </div>

        {/* Sync Trigger Card */}
        <div className="flex flex-wrap items-center gap-3 bg-card/40 backdrop-blur border border-border/60 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-muted-foreground font-semibold">
              Sync Target Date:
            </span>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Select date..."
              className="w-50"
              disabled={isSyncing}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">
              Historical Status:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                syncStatusText === "Syncing..."
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : syncStatusText === "Success"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : syncStatusText === "Failed"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      : "bg-muted/80 text-muted-foreground border border-border"
              }`}
            >
              {syncStatusText === "Syncing..." && (
                <RefreshCwIcon className="h-2.5 w-2.5 animate-spin" />
              )}
              {syncStatusText === "Success" && (
                <CheckCircle2Icon className="h-2.5 w-2.5" />
              )}
              {syncStatusText === "Failed" && (
                <AlertCircleIcon className="h-2.5 w-2.5" />
              )}
              {syncStatusText}
            </span>
          </div>
          <Button
            onClick={handleSyncHistorical}
            disabled={isSyncing}
            className="flex items-center gap-1.5 h-8 text-xs px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
          >
            <RefreshCwIcon
              className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
            />
            Sync History
          </Button>
        </div>
      </div>

      {/* Live Logs Terminal */}
      {isSyncing && (
        <div
          ref={terminalRef}
          className="bg-zinc-950 border border-border/80 rounded-xl p-4 font-mono text-[11px] text-zinc-300 space-y-1 h-52 overflow-y-auto shadow-inner select-text"
        >
          <div className="text-zinc-500 pb-1.5 border-b border-zinc-800/60 flex items-center justify-between font-sans text-xs">
            <span className="font-semibold tracking-wider text-indigo-400">
              LIVE SYNCHRONIZATION CONSOLE
            </span>
            <span className="animate-pulse text-amber-500 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              RUNNING
            </span>
          </div>
          <div className="pt-2 space-y-1">
            {syncLogs.length === 0 ? (
              <div className="text-zinc-600 italic">
                Waiting for sync process to start broadcasting logs...
              </div>
            ) : (
              syncLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed">
                  <span className="text-zinc-600">
                    [{new Date().toLocaleTimeString()}]
                  </span>{" "}
                  <span
                    className={
                      log.includes("[ERROR]")
                        ? "text-red-400 font-semibold"
                        : log.includes("[FAILED]")
                          ? "text-rose-400 font-semibold"
                          : log.includes("[SUCCESS]")
                            ? "text-emerald-400 font-semibold"
                            : "text-zinc-300"
                    }
                  >
                    {log}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Logs Table Card */}
      <div className="rounded-lg border border-border bg-card/45 backdrop-blur-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-9 px-4 text-xs font-semibold">
                ID
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold">
                Status
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold">
                Message
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold">
                Symbols Count
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold text-right">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingLogs ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading ingestion logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !logs || logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  No synchronization runs logged. Use the "Sync History" button
                  to start ingestion.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  <TableCell className="py-2.5 px-4 font-semibold text-xs text-muted-foreground">
                    #{log.id}
                  </TableCell>
                  <TableCell className="py-2.5 px-4 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        log.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {log.status === "success" ? (
                        <CheckCircle2Icon className="h-3 w-3" />
                      ) : (
                        <AlertCircleIcon className="h-3 w-3" />
                      )}
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell
                    className="py-2.5 px-4 text-xs text-foreground font-medium max-w-md truncate"
                    title={log.message}
                  >
                    {log.message}
                  </TableCell>
                  <TableCell className="py-2.5 px-4 text-xs text-muted-foreground font-mono">
                    {log.symbolsCount}
                  </TableCell>
                  <TableCell className="py-2.5 px-4 text-xs text-muted-foreground text-right">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default IngestionLogsPage;
