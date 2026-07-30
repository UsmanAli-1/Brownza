import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPreOrderById,
  markPreOrderRead,
} from "@/lib/services/pre-order-service";
import { BackButton } from "@/components/common/back-button";
import { DeletePreOrderButton } from "@/components/admin/delete-preorder-button";
import { MarkReadRefresh } from "@/components/admin/mark-read-refresh";

export const metadata: Metadata = { title: "Pre-order request" };
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

export default async function PreOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const preOrder = await getPreOrderById(id);
  if (!preOrder) notFound();
  // Viewing this page is what clears the unread badge for this one request.
  // Awaited (not fire-and-forget) so the write is guaranteed to land before
  // <MarkReadRefresh> asks the parent layout to recompute the badge count.
  await markPreOrderRead(id);

  const submittedAt = new Date(preOrder.createdAt).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const neededBy = new Date(preOrder.preferredDateTime).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <MarkReadRefresh />
      <BackButton fallbackHref="/admin/form-data" label="Back to Form Data" />

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <section className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="font-heading text-xl font-semibold text-primary">
                {preOrder.fullName}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-secondary">
                  {preOrder.orderType}
                </span>
                <span className="text-xs text-muted-foreground">
                  Submitted {submittedAt}
                </span>
              </div>
            </div>
            <DeletePreOrderButton
              preOrderId={String(preOrder._id)}
              fullName={preOrder.fullName}
            />
          </div>

          <dl className="grid gap-x-6 gap-y-3 border-t border-border pt-3 sm:grid-cols-3">
            <Field label="Phone" value={preOrder.phone} />
            <Field label="Email" value={preOrder.email || "—"} />
            <Field label="Needed by" value={neededBy} />
          </dl>

          <div className="border-t border-border pt-3">
            <SectionLabel>Description</SectionLabel>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm text-foreground">
              {preOrder.description}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
