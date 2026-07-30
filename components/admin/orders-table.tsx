import Link from "next/link";
import { Eye } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderRecord } from "@/types/order";

/** An order counts as "new" if it's still pending and landed within the
 * last 15 minutes — long enough for an admin to notice it, short enough
 * that it doesn't linger as "new" all day once it's just sitting pending. */
const NEW_WINDOW_MS = 15 * 60 * 1000;

function isNew(order: OrderRecord): boolean {
  if (order.status !== "pending") return false;
  return Date.now() - new Date(order.createdAt).getTime() < NEW_WINDOW_MS;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentBadge({ order }: { order: OrderRecord }) {
  if (order.payment.method === "COD") {
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-foreground">
        COD
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
        order.payment.paymentVerified
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800",
      )}
    >
      {order.payment.paymentVerified ? "Online · Verified" : "Online · Unverified"}
    </span>
  );
}

export function OrdersTable({
  orders,
  showDelete = false,
}: {
  orders: OrderRecord[];
  showDelete?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        No orders found.
      </div>
    );
  }

  const th =
    "sticky top-0 z-10 bg-card px-3 py-2.5 text-left font-medium first:pl-4 last:pr-4";

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
          {orders.map((o) => (
            <tr
              key={o._id}
              className={cn(
                "border-t border-border/60 transition-colors hover:bg-muted/40",
                isNew(o) && "bg-accent-soft/30",
              )}
            >
              <td className="px-3 py-2.5 pl-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/orders/${o._id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  {isNew(o) && (
                    <span className="inline-flex items-center rounded-full bg-danger px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                      New
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                {formatDate(o.createdAt)}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-foreground">
                {formatPrice(o.total)}
              </td>
              <td className="px-3 py-2.5">
                <PaymentBadge order={o} />
              </td>
              <td className="px-3 py-2.5">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="px-3 py-2.5 pr-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/orders/${o._id}`}
                    aria-label={`View order ${o.orderNumber}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:text-primary"
                  >
                    <Eye className="size-4" />
                  </Link>
                  <StatusSelect
                    orderId={o._id}
                    orderNumber={o.orderNumber}
                    status={o.status}
                  />
                  {showDelete && (
                    <DeleteOrderButton
                      orderId={o._id}
                      orderNumber={o.orderNumber}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}