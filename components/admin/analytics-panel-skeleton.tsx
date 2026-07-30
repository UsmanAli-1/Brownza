import { Skeleton } from "@/components/ui/skeleton";

/** Matches AnalyticsPanel's layout so the panel holds its shape while data loads. */
export function AnalyticsPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <Skeleton className="h-5 w-32" />

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-muted/50 px-3 py-2.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1.5 h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
