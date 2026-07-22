import type { Metadata } from "next";
import { getTodayStats, listOrders } from "@/lib/services/order-service";
import { OrdersTable } from "@/components/admin/orders-table";
import { StatCard } from "@/components/admin/stat-card";

export const metadata: Metadata = { title: "Today's Orders" };
export const dynamic = "force-dynamic";

export default async function TodaysOrdersPage() {
  const [today, list] = await Promise.all([
    getTodayStats(),
    listOrders({ todayOnly: true, sort: "operational", pageSize: 100 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Today&apos;s Orders
        </h1>
        <p className="text-sm text-muted-foreground">Orders placed today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
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

      <OrdersTable orders={list.orders} />
    </div>
  );
}
