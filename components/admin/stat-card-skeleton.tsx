import { Skeleton } from "@/components/ui/skeleton";

/** Matches StatCard's layout so the grid holds its shape while data loads. */
export function StatCardSkeleton() {
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border border-border bg-card p-2.5 shadow-soft sm:p-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="size-7 shrink-0 rounded-lg sm:size-8" />
    </div>
  );
}

export function StatCardGridSkeleton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
