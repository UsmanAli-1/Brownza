"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSuccess } from "@/components/checkout/order-success";
import { OrderSummary } from "@/components/cart/order-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/cart-store";
import { useDetailedCart } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";
import { useLocationStore } from "@/lib/location-store";
import { nextOrderId } from "@/lib/order-id";
import { DEFAULT_DELIVERY_AREA } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import type { PlacedOrder } from "@/types";

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function CheckoutView() {
  const hydrated = useHydrated();
  const { lines, totals, isEmpty } = useDetailedCart();
  const clear = useCartStore((s) => s.clear);
  const savedArea = useLocationStore((s) => s.area);
  const [placed, setPlaced] = React.useState<PlacedOrder | null>(null);

  const handlePlaceOrder = async (values: CheckoutFormValues) => {
    // Simulate an async submission. A real backend/API is wired in later.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const order: PlacedOrder = {
      id: nextOrderId(),
      customerName: values.fullName,
      phone: values.phone,
      deliveryArea: values.deliveryArea,
      paymentMethod: values.paymentMethod,
      lines, // snapshot before clearing the cart
      totals,
      status: "pending",
    };
    clear();
    setPlaced(order);
    toast.success("Order placed!", { description: `Reference ${order.id}` });
  };

  if (!hydrated) return <CheckoutSkeleton />;
  if (placed) return <OrderSuccess order={placed} />;
  if (isEmpty) {
    return (
      <EmptyCart
        title="Your cart is empty"
        description="Add a few treats to your cart before checking out."
        cta={{ label: "Browse the menu", href: "/products" }}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <CheckoutForm
        initialArea={savedArea ?? DEFAULT_DELIVERY_AREA}
        onPlaceOrder={handlePlaceOrder}
      />

      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Your order
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((line) => (
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
        </div>

        <OrderSummary totals={totals} title="Payable" />
      </div>
    </div>
  );
}
