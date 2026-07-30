import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { XCircle } from "lucide-react";
import { getOrderById } from "@/lib/services/order-service";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { VerifyPaymentButton } from "@/components/admin/verify-payment-button";
import { PaymentScreenshot } from "@/components/admin/payment-screenshot";
import { OrderDetailSkeleton } from "@/components/admin/order-detail-skeleton";
import { BackButton } from "@/components/common/back-button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details" };
export const dynamic = "force-dynamic";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}

async function OrderDetailContent({ id }: { id: string }) {
  const order = await getOrderById(id);
  if (!order) notFound();

  const placedAt = new Date(order.createdAt).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const verifiedAt = order.payment.paymentVerifiedAt
    ? new Date(order.payment.paymentVerifiedAt).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <BackButton fallbackHref="/admin/orders" label="Back to orders" />

      {order.status === "cancelled" && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <XCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Order cancelled</p>
            {order.cancellationReason && (
              <p className="mt-0.5 text-red-700">{order.cancellationReason}</p>
            )}
          </div>
        </div>
      )}

      {/* Order information + Products */}
      <div className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft">
        <section className="flex flex-col gap-4 p-5">
          <SectionLabel>Order information</SectionLabel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-heading text-2xl font-semibold text-primary">
                {order.orderNumber}
              </p>
              <p className="text-sm text-muted-foreground">Placed {placedAt}</p>
              <OrderStatusBadge status={order.status} className="w-fit" />
            </div>
            <StatusSelect
              orderId={order._id}
              orderNumber={order.orderNumber}
              status={order.status}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 p-5">
          <SectionLabel>Products</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 text-center font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Unit price</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="py-2 pr-2 text-foreground">
                      {item.productName}
                    </td>
                    <td className="py-2 text-center tabular-nums text-muted-foreground">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-medium tabular-nums text-foreground">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Payment (screenshot) + Customer, side by side */}
      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <SectionLabel>Payment</SectionLabel>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field
                label="Method"
                value={
                  order.payment.method === "COD"
                    ? "Cash on delivery"
                    : "Online payment"
                }
              />
              <Field
                label="Verification status"
                value={order.payment.paymentVerified ? "Verified" : "Unverified"}
              />
              {verifiedAt && <Field label="Verified at" value={verifiedAt} />}
            </dl>

            {order.payment.method === "ONLINE" && (
              <div className="mt-1 flex flex-col items-start gap-3">
                {order.payment.screenshotUrl ? (
                  <PaymentScreenshot url={order.payment.screenshotUrl} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No screenshot uploaded.
                  </p>
                )}
                <VerifyPaymentButton
                  orderId={order._id}
                  orderNumber={order.orderNumber}
                  verified={order.payment.paymentVerified}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
            <SectionLabel>Customer</SectionLabel>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field label="Name" value={order.customer.name} />
              <Field label="Phone" value={order.customer.phone} />
              <Field label="WhatsApp" value={order.customer.whatsapp} />
              <Field label="Email" value={order.customer.email || "—"} />
            </dl>
          </div>
        </div>
      </div>

      {/* Delivery — one row */}
      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <section className="flex flex-col gap-3 p-5">
          <SectionLabel>Delivery</SectionLabel>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <Field label="Area" value={order.delivery.city} />
            <Field label="Address" value={order.delivery.address} />
            <Field label="Notes" value={order.delivery.notes || "—"} />
          </dl>
        </section>
      </div>

      {/* Order summary */}
      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <section className="flex flex-col gap-3 p-5">
          <SectionLabel>Order summary</SectionLabel>
          <dl className="flex max-w-xs flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {formatPrice(order.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {formatPrice(order.deliveryFee)}
              </dd>
            </div>
            <Separator className="my-1" />
            <div className="flex items-baseline justify-between">
              <dt className="font-heading text-base font-semibold text-foreground">
                Total
              </dt>
              <dd className="font-heading text-xl font-semibold tabular-nums text-primary">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent id={id} />
    </Suspense>
  );
}