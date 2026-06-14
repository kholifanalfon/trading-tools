import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export interface DatePickerProps {
  value?: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? new Date(value) : undefined;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const offset = selectedDate.getTimezoneOffset();
      const localDate = new Date(selectedDate.getTime() - offset * 60 * 1000);
      onChange(localDate.toISOString().split("T")[0]);
    } else {
      onChange("");
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal h-8 text-xs bg-background/50 border-border/70 text-foreground",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{date ? format(date, "PPP") : placeholder}</span>
          </div>
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-muted/30 text-muted-foreground hover:text-foreground transition ml-2"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
