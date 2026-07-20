import type { Metadata } from "next";
import Link from "next/link";
import {
  getDashboardStats,
  getLatestOrders,
} from "@/lib/services/order-service";
import { StatCard } from "@/components/admin/stat-card";
import { OrdersTable } from "@/components/admin/orders-table";
import { RecentActivity } from "@/components/admin/recent-activity";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { DeleteScreenshotsButton } from "@/components/admin/delete-screenshots-button";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, latest] = await Promise.all([
    getDashboardStats(),
    getLatestOrders(8),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <DeleteScreenshotsButton />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Total orders" value={stats.total} />
        <StatCard
          label="Pending"
          value={stats.byStatus.pending}
          accentClassName="text-yellow-600"
        />
        <StatCard
          label="Accepted"
          value={stats.byStatus.accepted}
          accentClassName="text-blue-600"
        />
        <StatCard
          label="Preparing"
          value={stats.byStatus.preparing}
          accentClassName="text-orange-600"
        />
        <StatCard
          label="Ready"
          value={stats.byStatus.ready}
          accentClassName="text-purple-600"
        />
        <StatCard
          label="Out for delivery"
          value={stats.byStatus["out-for-delivery"]}
          accentClassName="text-indigo-600"
        />
        <StatCard
          label="Delivered"
          value={stats.byStatus.delivered}
          accentClassName="text-green-600"
        />
        <StatCard
          label="Cancelled"
          value={stats.byStatus.cancelled}
          accentClassName="text-red-600"
        />
      </div>

      {/* Business metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Today's orders" value={stats.todayOrders} />
        <StatCard label="Today's revenue" value={stats.todayRevenue} currency />
        <StatCard label="Total revenue" value={stats.totalRevenue} currency />
        <StatCard
          label="Pending online payments"
          value={stats.pendingOnlinePayments}
          accentClassName="text-amber-600"
        />
        <StatCard
          label="Avg order value"
          value={stats.averageOrderValue}
          currency
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Latest orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-secondary hover:text-primary"
            >
              View all
            </Link>
          </div>
          <OrdersTable orders={latest} showControls={false} />
        </div>

        <div className="flex flex-col gap-6">
          <RecentActivity />
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}
