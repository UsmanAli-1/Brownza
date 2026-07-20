import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatusActions } from "@/components/admin/status-actions";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderRecord } from "@/types/order";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrdersTableProps {
  orders: OrderRecord[];
  /** Show inline status actions (orders page) vs. read-only overview (dashboard). */
  showControls?: boolean;
}

export function OrdersTable({ orders, showControls = true }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">
                {o.orderNumber}
              </td>
              <td className="px-4 py-3">
                <div className="text-foreground">{o.customer.name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.customer.phone}
                </div>
              </td>
              <td className="px-4 py-3 tabular-nums text-foreground">
                {formatPrice(o.total)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-foreground">{o.payment.method}</span>
                {o.payment.method === "ONLINE" && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                      o.payment.paymentVerified
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {o.payment.paymentVerified ? "Verified" : "Unverified"}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDate(o.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  {showControls && (
                    <StatusActions
                      orderId={o._id}
                      orderNumber={o.orderNumber}
                      status={o.status}
                    />
                  )}
                  <Link
                    href={`/admin/orders/${o._id}`}
                    className="shrink-0 text-sm font-medium text-secondary hover:text-primary"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
