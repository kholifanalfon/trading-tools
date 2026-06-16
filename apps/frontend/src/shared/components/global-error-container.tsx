import { useErrorStore } from "@/shared/stores/error.store";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function GlobalErrorContainer() {
  const { errors, removeError } = useErrorStore();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm p-4 pointer-events-none">
      {errors.map(({ id, error }) => (
        <div
          key={id}
          className="relative shadow-2xl rounded-lg bg-card pointer-events-auto animate-in slide-in-from-top-5 fade-in duration-300"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeError(id)}
            className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-60 hover:opacity-100 hover:bg-muted text-foreground z-50"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <ErrorDisplay error={error} className="border border-border shadow-xl" />
        </div>
      ))}
    </div>
  );
}
