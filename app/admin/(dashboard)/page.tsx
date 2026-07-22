import type { Metadata } from "next";
import { getAnalytics, getDashboardStats } from "@/lib/services/order-service";
import { StatCard } from "@/components/admin/stat-card";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, analytics] = await Promise.all([
    getDashboardStats(),
    getAnalytics(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Business performance at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={stats.totalRevenue}
          currency
          accentClassName="text-primary"
        />
        <StatCard
          label="Monthly revenue"
          value={analytics.revenueThisMonth}
          currency
        />
        <StatCard
          label="Total delivered orders"
          value={stats.byStatus.delivered}
          accentClassName="text-green-600"
        />
        <StatCard
          label="Average order value"
          value={stats.averageOrderValue}
          currency
        />
      </div>

      <AnalyticsPanel analytics={analytics} />
    </div>
  );
}
