import type { LucideIcon } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export function StatCard({
  label,
  value,
  currency = false,
  accentClassName,
  icon: Icon,
}: {
  label: string;
  value: number;
  currency?: boolean;
  accentClassName?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border border-border bg-card p-2.5 shadow-soft sm:p-3.5">
      <div className="min-w-0">
        <p className="truncate text-[0.7rem] text-muted-foreground sm:text-xs">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate font-heading text-base font-semibold tabular-nums sm:text-lg",
            accentClassName ?? "text-foreground",
          )}
        >
          {currency ? formatPrice(value) : value.toLocaleString("en-PK")}
        </p>
      </div>
      {Icon && (
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/70 sm:size-8",
            accentClassName,
          )}
        >
          <Icon className="size-3.5" />
        </span>
      )}
    </div>
  );
}