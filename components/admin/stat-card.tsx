import { cn, formatPrice } from "@/lib/utils";

export function StatCard({
  label,
  value,
  currency = false,
  accentClassName,
}: {
  label: string;
  value: number;
  currency?: boolean;
  accentClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-heading text-xl font-semibold tabular-nums sm:text-2xl",
          accentClassName ?? "text-foreground",
        )}
      >
        {currency ? formatPrice(value) : value.toLocaleString("en-PK")}
      </p>
    </div>
  );
}
