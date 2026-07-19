import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder that mirrors the product card layout. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:rounded-3xl">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <Skeleton className="h-4 w-3/4 sm:h-5" />
        <Skeleton className="h-3 w-full sm:h-4" />
        <Skeleton className="h-3 w-2/3 sm:h-4" />
        <div className="mt-auto flex flex-col gap-2.5 pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
