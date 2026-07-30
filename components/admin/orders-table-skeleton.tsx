import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Matches OrdersTable's shape so the layout holds while orders load. */
export function OrdersTableSkeleton({ rows = 8 }: { rows?: number }) {
  const th =
    "px-3 py-2.5 text-left first:pl-4 last:pr-4";

  return (
    <div className="max-h-[70vh] overflow-auto rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_var(--color-border)]">
          <tr>
            <th className={th}>Order</th>
            <th className={th}>Time</th>
            <th className={th}>Total</th>
            <th className={th}>Payment</th>
            <th className={th}>Status</th>
            <th className={cn(th, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-border/60">
              <td className="px-3 py-3 pl-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20 rounded-full" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-16 rounded-full" />
              </td>
              <td className="px-3 py-3 pr-4">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
