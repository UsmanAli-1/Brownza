import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { listPreOrders } from "@/lib/services/pre-order-service";
import { DeletePreOrderButton } from "@/components/admin/delete-preorder-button";
import { DeleteAllPreOrdersButton } from "@/components/admin/delete-all-preorders-button";
import { Pagination } from "@/components/admin/pagination";

export const metadata: Metadata = { title: "Form Data" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FormDataPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { submissions, total, totalPages } = await listPreOrders({
    page,
    pageSize: PAGE_SIZE,
  });

  const th =
    "sticky top-0 z-10 bg-card px-3 py-2.5 text-left font-medium first:pl-4 last:pr-4";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-heading text-lg font-semibold text-foreground sm:text-2xl">
            Form Data
          </h1>
          {total > 0 && <DeleteAllPreOrdersButton />}
        </div>
        <p className="text-sm text-muted-foreground">
          Pre-order enquiries submitted from the website.
        </p>
        {total > 0 && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {total} submission{total === 1 ? "" : "s"}
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}
          </p>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {total === 0
            ? "No pre-order requests yet."
            : "No submissions on this page."}
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_var(--color-border)]">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Type</th>
                <th className={th}>Contact</th>
                <th className={th}>Needed by</th>
                <th className={th}>Submitted</th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2.5 text-right font-medium last:pr-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr
                  key={String(s._id)}
                  className="border-t border-border/60 transition-colors hover:bg-muted/40"
                >
                  <td className="px-3 py-2.5 pl-4 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {s.fullName}
                      {!s.read && (
                        <span className="inline-flex items-center rounded-full bg-danger px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-secondary">
                      {s.orderType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{s.phone}</span>
                      {s.email && <span className="text-xs">{s.email}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                    {formatDate(s.preferredDateTime)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-3 py-2.5 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/form-data/${s._id}`}
                        aria-label={`View ${s.fullName}'s request`}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:text-primary"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <DeletePreOrderButton
                        preOrderId={String(s._id)}
                        fullName={s.fullName}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}