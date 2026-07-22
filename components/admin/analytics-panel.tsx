import { formatPrice } from "@/lib/utils";
import type { AnalyticsData } from "@/types/order";

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-base font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function AnalyticsPanel({ analytics: a }: { analytics: AnalyticsData }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Sales analytics
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <MiniStat label="Orders this week" value={String(a.ordersThisWeek)} />
        <MiniStat label="Orders this month" value={String(a.ordersThisMonth)} />
        <MiniStat
          label="Revenue this month"
          value={formatPrice(a.revenueThisMonth)}
        />
        <MiniStat
          label="Avg delivery fee"
          value={formatPrice(a.averageDeliveryFee)}
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-foreground">
          Top selling products
        </p>
        {a.topProducts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-2">
            {a.topProducts.map((p, i) => (
              <li
                key={p.productName}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[0.7rem] font-semibold text-secondary">
                    {i + 1}
                  </span>
                  <span className="truncate text-foreground">
                    {p.productName}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {p.quantity} sold
                </span>
              </li>
            ))}
          </ol>
        )}
        {a.mostOrderedProduct && (
          <p className="mt-3 text-xs text-muted-foreground">
            Most ordered:{" "}
            <span className="font-medium text-foreground">
              {a.mostOrderedProduct}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
