import type { Metadata } from "next";
import { Suspense } from "react";
import { listOrders } from "@/lib/services/order-service";
import { OrdersTable } from "@/components/admin/orders-table";
import { OrderSearch } from "@/components/admin/order-search";
import { Pagination } from "@/components/admin/pagination";
import { DeleteAllOrdersButton } from "@/components/admin/delete-all-orders-button";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export const metadata: Metadata = { title: "All Orders" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AllOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status && ORDER_STATUSES.includes(sp.status as OrderStatus)
      ? (sp.status as OrderStatus)
      : undefined;
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const result = await listOrders({
    status,
    search,
    page,
    pageSize: PAGE_SIZE,
    sort: "recent",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            All Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete order history — newest first.
          </p>
        </div>
        <DeleteAllOrdersButton />
      </div>

      <Suspense fallback={<div className="h-11" />}>
        <OrderSearch />
      </Suspense>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {result.total} order{result.total === 1 ? "" : "s"}
        {result.totalPages > 1 &&
          ` · page ${result.page} of ${result.totalPages}`}
      </p>

      <OrdersTable orders={result.orders} showDelete />

      <Suspense fallback={null}>
        <Pagination page={result.page} totalPages={result.totalPages} />
      </Suspense>
    </div>
  );
}
