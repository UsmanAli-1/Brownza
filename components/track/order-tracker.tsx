"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Package, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { readLastOrder } from "@/lib/last-order";
import { useHydrated } from "@/lib/use-hydrated";
import { useOrderStream } from "@/lib/hooks/use-order-stream";
import { LIFECYCLE_STEPS, ORDER_STATUS_META } from "@/lib/order-status";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderEvent, OrderTrackView } from "@/types/order";

type LoadState = "idle" | "loading" | "loaded" | "empty" | "notfound" | "error";

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-secondary">
        <Package className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="max-w-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild size="lg">
        <Link href="/products">
          Browse the menu
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}

function Timeline({ current }: { current: OrderTrackView["status"] }) {
  const currentIndex = LIFECYCLE_STEPS.indexOf(current);
  return (
    <ol className="flex flex-col gap-0">
      {LIFECYCLE_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const meta = ORDER_STATUS_META[step];
        const isLast = i === LIFECYCLE_STEPS.length - 1;
        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done && "border-success bg-success text-white",
                  active && "border-accent bg-accent text-accent-foreground",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-4" />
                ) : (
                  <span className="size-2 rounded-full bg-current" />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1",
                    i < currentIndex ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {meta.label}
              </p>
              {active && (
                <p className="text-xs text-accent">In progress</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderTracker() {
  const hydrated = useHydrated();
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<OrderTrackView | null>(null);
  const [state, setState] = React.useState<LoadState>("idle");

  React.useEffect(() => {
    if (!hydrated) return;
    let active = true;
    void (async () => {
      const last = readLastOrder();
      if (!last) {
        if (active) setState("empty");
        return;
      }
      if (!active) return;
      setOrderId(last.id);
      setState("loading");
      try {
        const res = await fetch(`/api/orders/track/${last.id}`);
        if (!active) return;
        if (res.status === 404) return setState("notfound");
        if (!res.ok) return setState("error");
        const data = (await res.json()) as { order: OrderTrackView };
        setOrder(data.order);
        setState("loaded");
      } catch {
        if (active) setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [hydrated]);

  const onEvent = React.useCallback((event: OrderEvent) => {
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: event.status,
            paymentVerified: event.paymentVerified,
            cancellationReason: event.cancellationReason ?? prev.cancellationReason,
          }
        : prev,
    );
  }, []);
  useOrderStream(onEvent, orderId ?? undefined);

  if (!hydrated || state === "loading" || state === "idle") {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <EmptyState
        title="No recent order"
        description="Once you place an order it'll appear here so you can track it live."
      />
    );
  }

  if (state === "notfound" || state === "error" || !order) {
    return (
      <EmptyState
        title="We couldn't load your order"
        description="Your order may have been cleared. Place a new order to start tracking again."
      />
    );
  }

  const isCancelled = order.status === "cancelled";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Order
            </p>
            <p className="font-heading text-2xl font-semibold text-primary">
              {order.orderNumber}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              ORDER_STATUS_META[order.status].className,
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                ORDER_STATUS_META[order.status].dot,
              )}
            />
            {ORDER_STATUS_META[order.status].label}
          </span>
        </div>

        <Separator className="my-6" />

        {isCancelled ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-4 py-8 text-center">
            <XCircle className="size-8 text-red-600" />
            <p className="font-heading text-lg font-semibold text-foreground">
              Order cancelled
            </p>
            {order.cancellationReason && (
              <p className="max-w-sm text-sm text-muted-foreground">
                {order.cancellationReason}
              </p>
            )}
          </div>
        ) : (
          <Timeline current={order.status} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Order summary
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <span className="truncate text-foreground">
                    {item.productName}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery area</dt>
              <dd className="font-medium text-foreground">
                {order.deliveryArea}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="font-medium text-foreground">
                {order.paymentMethod === "COD"
                  ? "Cash on delivery"
                  : order.paymentVerified
                    ? "Online · Verified"
                    : "Online · Awaiting verification"}
              </dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-heading text-base font-semibold text-foreground">
                Total
              </dt>
              <dd className="font-heading text-xl font-semibold tabular-nums text-primary">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <Button asChild variant="outline">
          <Link href="/products">Order again</Link>
        </Button>
      </div>
    </div>
  );
}
