import type { Metadata } from "next";
import { Suspense } from "react";
import { Wallet, TrendingUp, PackageCheck, Receipt } from "lucide-react";
import { getAnalytics, getDashboardStats } from "@/lib/services/order-service";
import { StatCard } from "@/components/admin/stat-card";
import { StatCardGridSkeleton } from "@/components/admin/stat-card-skeleton";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { AnalyticsPanelSkeleton } from "@/components/admin/analytics-panel-skeleton";
import { ResetAllDataButton } from "@/components/admin/reset-all-data-button";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const STAT_GRID_CLASS = "grid grid-cols-2 gap-3 lg:grid-cols-4";

/**
 * Stats and analytics are already fetched together (Promise.all) since the
 * top stat cards need one field (revenueThisMonth) off the same analytics
 * query the panel below renders in full — one Suspense boundary, one fetch,
 * both pieces reveal together instead of double-querying getAnalytics().
 */
async function DashboardData() {
  const [stats, analytics] = await Promise.all([
    getDashboardStats(),
    getAnalytics(),
  ]);

  return (
    <>
      <div className={STAT_GRID_CLASS}>
        <StatCard
          label="Total revenue"
          value={stats.totalRevenue}
          currency
          accentClassName="text-primary"
          icon={Wallet}
        />
        <StatCard
          label="Monthly revenue"
          value={analytics.revenueThisMonth}
          currency
          icon={TrendingUp}
        />
        <StatCard
          label="Total delivered orders"
          value={stats.byStatus.delivered}
          accentClassName="text-green-600"
          icon={PackageCheck}
        />
        <StatCard
          label="Average order value"
          value={stats.averageOrderValue}
          currency
          icon={Receipt}
        />
      </div>

      <AnalyticsPanel analytics={analytics} />
    </>
  );
}

export default function AdminDashboardPage() {
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

      <Suspense
        fallback={
          <>
            <StatCardGridSkeleton count={4} className={STAT_GRID_CLASS} />
            <AnalyticsPanelSkeleton />
          </>
        }
      >
        <DashboardData />
      </Suspense>

      <ResetAllDataButton />
    </div>
  );
}
