import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus, PaymentMethod, PlacedOrder } from "@/types";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  online: "Online payment",
};

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmed", className: "bg-sky-100 text-sky-800" },
  preparing: { label: "Preparing", className: "bg-sky-100 text-sky-800" },
  "out-for-delivery": {
    label: "Out for delivery",
    className: "bg-indigo-100 text-indigo-800",
  },
  delivered: { label: "Delivered", className: "bg-success/12 text-success" },
  cancelled: { label: "Cancelled", className: "bg-danger/12 text-danger" },
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function OrderSuccess({ order }: { order: PlacedOrder }) {
  const status = STATUS_STYLES[order.status];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      {/* Confirmation header */}
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-soft">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Thank you, {order.customerName.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Your order has been placed. We&apos;ll call you shortly to confirm.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-2xl bg-muted/70 px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Order&nbsp;ID
            </span>{" "}
            <span className="font-heading text-lg font-semibold text-primary">
              {order.id}
            </span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              status.className,
            )}
          >
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {status.label}
          </span>
        </div>
      </div>

      {order.paymentMethod === "online" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Your order will remain <strong>Pending</strong> until the bakery
          verifies your payment screenshot.
        </div>
      )}

      {/* Order details */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Order details
        </h2>
        <dl className="mt-3 divide-y divide-border">
          <DetailRow label="Customer" value={order.customerName} />
          <DetailRow label="Phone" value={order.phone} />
          <DetailRow label="Delivery area" value={order.deliveryArea} />
          <DetailRow
            label="Payment method"
            value={PAYMENT_LABELS[order.paymentMethod]}
          />
        </dl>
      </div>

      {/* Order summary */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Order summary
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {order.lines.map((line) => (
            <li
              key={line.product.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {line.quantity}
                </span>
                <span className="truncate text-foreground">
                  {line.product.name}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatPrice(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {formatPrice(order.totals.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="font-medium tabular-nums">
              {order.totals.delivery === 0 ? (
                <span className="text-success">Free</span>
              ) : (
                formatPrice(order.totals.delivery)
              )}
            </dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
            <dt className="font-heading text-base font-semibold text-foreground">
              Grand total
            </dt>
            <dd className="font-heading text-xl font-semibold tabular-nums text-primary">
              {formatPrice(order.totals.total)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/products">
            Order again
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
