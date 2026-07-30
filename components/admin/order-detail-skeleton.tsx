import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <section className="flex flex-col gap-3 p-5">
      <Skeleton className="h-3 w-24" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-2/3" />
        ))}
      </div>
    </section>
  );
}

/** Matches the order-details page's card layout while the order loads —
 * including an image-shaped placeholder where the payment screenshot will
 * land, so it's clear one is on the way rather than just missing. */
export function OrderDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Skeleton className="h-9 w-36" />

      <div className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft">
        <SectionSkeleton lines={3} />
        <SectionSkeleton lines={4} />
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-16" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-64 w-48 rounded-xl" />
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
            <Skeleton className="h-3 w-16" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <SectionSkeleton lines={1} />
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <SectionSkeleton lines={3} />
      </div>
    </div>
  );
}
