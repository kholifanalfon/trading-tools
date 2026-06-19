import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    // Calculate progress percentage for track background
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="relative flex w-full touch-none select-none items-center py-2">
        <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
          {/* Active track range */}
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className={cn(
            "absolute w-full h-1.5 opacity-0 cursor-pointer z-10",
            className
          )}
          {...props}
        />
        {/* Visual custom thumb */}
        <div
          className="absolute h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-all duration-75 pointer-events-none hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          style={{
            left: `calc(${percentage}% - 8px)`,
          }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
