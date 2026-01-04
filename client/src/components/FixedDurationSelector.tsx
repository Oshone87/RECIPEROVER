import React from "react";
import { Label } from "@/components/ui/label";

interface Props {
  value: number;
  onChange: (days: number) => void;
  options?: number[];
  label?: string;
  className?: string;
  showSelected?: boolean;
}

export function FixedDurationSelector({
  value,
  onChange,
  options = [7, 14, 30, 60],
  label = "Choose your earning cycle",
  className = "",
  showSelected = true,
}: Props) {
  return (
    <div className={className}>
      <Label className="mb-2">{label}</Label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-muted"
              }`}
              aria-pressed={selected}
              data-testid={`fixed-duration-${opt}`}
            >
              {opt} days
            </button>
          );
        })}
      </div>
      {showSelected && (
        <div className="text-sm text-muted-foreground mt-2">Selected: {value} days</div>
      )}
    </div>
  );
}

export default FixedDurationSelector;
