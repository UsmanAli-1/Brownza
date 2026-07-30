import type { Metadata } from "next";
import { Suspense } from "react";
import { listOrders } from "@/lib/services/order-service";
import { OrdersTable } from "@/components/admin/orders-table";
import { OrdersTableSkeleton } from "@/components/admin/orders-table-skeleton";
import { OrderSearch } from "@/components/admin/order-search";
import { Pagination } from "@/components/admin/pagination";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { DeleteAllOrdersButton } from "@/components/admin/delete-all-orders-button";
import { DeleteAllImagesButton } from "@/components/admin/delete-all-images-button";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export const metadata: Metadata = { title: "All Orders" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface AllOrdersSearchParams {
  status?: string;
  search?: string;
  page?: string;
}

async function AllOrdersResults({
  status,
  search,
  page,
}: {
  status?: OrderStatus;
  search?: string;
  page: number;
}) {
  const result = await listOrders({
    status,
    search,
    page,
    pageSize: PAGE_SIZE,
    sort: "recent",
  });

  return (
    <>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {result.total} order{result.total === 1 ? "" : "s"}
        {result.totalPages > 1 &&
          ` · page ${result.page} of ${result.totalPages}`}
      </p>

      <OrdersTable orders={result.orders} showDelete />

      <Pagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}

export default async function AllOrdersPage({
  searchParams,
}: {
  searchParams: Promise<AllOrdersSearchParams>;
}) {
  const sp = await searchParams;
  const status =
    sp.status && ORDER_STATUSES.includes(sp.status as OrderStatus)
      ? (sp.status as OrderStatus)
      : undefined;
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="shrink-0 font-heading text-lg font-semibold text-foreground sm:text-2xl">
          All Orders
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ExportCsvButton status={status} search={search} />
          <DeleteAllImagesButton />
          <DeleteAllOrdersButton />
        </div>
      </div>

      <Suspense fallback={<div className="h-11" />}>
        <OrderSearch />
      </Suspense>

      <p className="text-xs text-muted-foreground lg:max-w-md">
        Deleting orders never affects Total/Monthly revenue — those are
        tracked separately and only grow. Deleting images just frees up
        space in Cloudinary; it doesn&apos;t touch any order data.
      </p>

      <Suspense
        key={`${status ?? ""}:${search ?? ""}:${page}`}
        fallback={<OrdersTableSkeleton rows={PAGE_SIZE} />}
      >
        <AllOrdersResults status={status} search={search} page={page} />
      </Suspense>
    </div>
  );
}
