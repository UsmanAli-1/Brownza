import type { Metadata } from "next";
import { Suspense } from "react";
import { getTodayStats, listOrders } from "@/lib/services/order-service";
import { OrdersTable } from "@/components/admin/orders-table";
import { OrdersTableSkeleton } from "@/components/admin/orders-table-skeleton";
import { StatCard } from "@/components/admin/stat-card";
import { StatCardGridSkeleton } from "@/components/admin/stat-card-skeleton";
import { OrderSearch } from "@/components/admin/order-search";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Today's Orders" };
export const dynamic = "force-dynamic";

const STAT_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9";

async function TodaysStats() {
  const today = await getTodayStats();
  return (
    <div className={STAT_GRID_CLASS}>
      <StatCard label="Today's orders" value={today.todayOrders} />
      <StatCard
        label="Pending"
        value={today.byStatus.pending}
        accentClassName="text-yellow-600"
      />
      <StatCard
        label="Accepted"
        value={today.byStatus.accepted}
        accentClassName="text-blue-600"
      />
      <StatCard
        label="Preparing"
        value={today.byStatus.preparing}
        accentClassName="text-orange-600"
      />
      <StatCard
        label="Ready"
        value={today.byStatus.ready}
        accentClassName="text-purple-600"
      />
      <StatCard
        label="Out for delivery"
        value={today.byStatus["out-for-delivery"]}
        accentClassName="text-indigo-600"
      />
      <StatCard
        label="Delivered"
        value={today.byStatus.delivered}
        accentClassName="text-green-600"
      />
      <StatCard
        label="Cancelled"
        value={today.byStatus.cancelled}
        accentClassName="text-red-600"
      />
      <StatCard label="Today's revenue" value={today.todayRevenue} currency />
    </div>
  );
}

async function TodaysOrdersList({
  status,
  search,
}: {
  status?: OrderStatus;
  search?: string;
}) {
  const list = await listOrders({
    todayOnly: true,
    sort: "operational",
    pageSize: 100,
    status,
    search,
  });
  return <OrdersTable orders={list.orders} />;
}

export default async function TodaysOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status && ORDER_STATUSES.includes(sp.status as OrderStatus)
      ? (sp.status as OrderStatus)
      : undefined;
  const search = sp.search?.trim() || undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Today&apos;s Orders
          </h1>
          <p className="text-sm text-muted-foreground">Orders placed today.</p>
        </div>
        <Suspense fallback={<div className="h-11" />}>
          <OrderSearch />
        </Suspense>
      </div>

      <Suspense fallback={<StatCardGridSkeleton count={9} className={STAT_GRID_CLASS} />}>
        <TodaysStats />
      </Suspense>

      <Suspense
        key={`${status ?? ""}:${search ?? ""}`}
        fallback={<OrdersTableSkeleton rows={10} />}
      >
        <TodaysOrdersList status={status} search={search} />
      </Suspense>
    </div>
  );
}
