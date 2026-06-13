import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Terminal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { ApiError } from "@/shared/config/api";
import { Button } from "./button";

export interface ErrorDisplayProps extends React.ComponentProps<"div"> {
  error: unknown;
}

export function ErrorDisplay({
  error,
  className,
  ...props
}: ErrorDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showDevDetails, setShowDevDetails] = useState(false);

  if (!error) return null;

  // Extract properties
  let isServerError = false;
  let isFrontendSystemError = false;
  let message = "An unexpected error occurred";
  let code = "UNKNOWN_ERROR";
  let requestId: string | undefined = undefined;
  let traceId: string | undefined = undefined;
  let details: any = undefined;
  let stack: string | undefined = undefined;

  if (error instanceof ApiError) {
    isServerError = error.type === "server";
    message = error.message;
    code = error.code;
    requestId = error.requestId;
    stack = error.stack;
    details = error.details;
  } else if (error instanceof Error) {
    isFrontendSystemError = true; // Frontend JavaScript runtime errors are classified as system errors
    message = error.message;
    stack = error.stack;
    traceId = (error as any).traceId;
  } else if (typeof error === "string") {
    message = error;
  }

  const isSystemError = isServerError || isFrontendSystemError;
  const displayId = requestId || traceId;
  const idLabel = requestId ? "Request ID" : "Trace ID";

  let errorTitle = null;
  if (isServerError) {
    errorTitle = "Terjadi Kendala pada Server";
  } else if (isFrontendSystemError) {
    errorTitle = "Terjadi Kendala pada Aplikasi";
  }

  const handleCopyId = async () => {
    if (!displayId) return;
    try {
      await navigator.clipboard.writeText(displayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy ID:", err);
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 text-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300",
        "bg-rose-950/20 border-rose-500/30 text-rose-200 dark:bg-rose-950/30 dark:border-rose-500/20",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isSystemError ? (
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          {errorTitle && (
            <h4 className="font-semibold leading-tight">{errorTitle}</h4>
          )}
          <p className="text-xs opacity-90 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* ID Display section for server Request ID or frontend Trace ID */}
      {displayId && (
        <div
          className={cn(
            "mt-1 flex flex-col gap-2 rounded-md p-2.5 border font-mono text-[11px]",
            isSystemError
              ? "bg-rose-950/40 dark:bg-rose-950/50 border-rose-500/10 text-rose-300"
              : "bg-destructive/5 border-destructive/10 text-destructive/90",
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span
              className={cn(
                "font-semibold uppercase tracking-wider text-[9px] px-1 py-0.5 rounded",
                isSystemError
                  ? "bg-rose-500/10 text-rose-400"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {idLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopyId}
              className={cn(
                "h-6 w-6 shrink-0",
                isSystemError
                  ? "text-rose-300 hover:text-rose-100 hover:bg-rose-500/10"
                  : "text-destructive hover:text-destructive/80 hover:bg-destructive/10",
              )}
              title={`Salin ${idLabel}`}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <span className="break-all select-all text-[10px] leading-relaxed opacity-95">
            {displayId}
          </span>
        </div>
      )}

      {/* Developer Tracing details (collapsible) - Only visible in development mode */}
      {import.meta.env.DEV && (details || stack) && (
        <div className="border-t border-current/10 pt-2 mt-1">
          <button
            type="button"
            onClick={() => setShowDevDetails(!showDevDetails)}
            className="flex w-full items-center justify-between text-[11px] font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Terminal className="h-3.5 w-3.5" />
              Detail Developer (Tracing)
            </span>
            {showDevDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showDevDetails && (
            <div className="mt-2 space-y-2 rounded-md bg-black/30 p-2.5 font-mono text-[10px] text-muted-foreground overflow-x-auto max-h-40">
              <div>
                <span className="font-semibold text-current/80">
                  Error Code:
                </span>{" "}
                {code}
              </div>
              {details && (
                <div className="mt-1">
                  <span className="font-semibold text-current/80">
                    Details:
                  </span>
                  <pre className="mt-1 text-[9px] leading-tight overflow-x-auto">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              )}
              {stack && (
                <div className="mt-1">
                  <span className="font-semibold text-current/80">
                    Stack Trace:
                  </span>
                  <pre className="mt-1 text-[9px] leading-tight whitespace-pre overflow-x-auto">
                    {stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
