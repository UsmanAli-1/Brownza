"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "default";
  className?: string;
  ariaLabel?: string;
}

/** Accessible, controlled quantity stepper. Reused on cards and the cart. */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = MAX_QUANTITY_PER_ITEM,
  size = "default",
  className,
  ariaLabel = "Quantity",
}: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  const btn = size === "sm" ? "size-8" : "size-9";
  const value_w = size === "sm" ? "min-w-7" : "min-w-9";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          btn,
          "inline-flex items-center justify-center rounded-full text-primary transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      >
        <Minus className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          value_w,
          "text-center text-sm font-semibold tabular-nums text-foreground",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          btn,
          "inline-flex items-center justify-center rounded-full text-primary transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
