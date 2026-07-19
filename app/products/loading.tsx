import { Container } from "@/components/common/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";

export default function Loading() {
  return (
    <>
      <section className="bg-cocoa-gradient py-20 md:py-28">
        <Container className="flex flex-col items-center gap-5 text-center">
          <Skeleton className="h-4 w-40 bg-primary-foreground/15" />
          <Skeleton className="h-12 w-80 max-w-full bg-primary-foreground/15" />
          <Skeleton className="h-4 w-96 max-w-full bg-primary-foreground/10" />
          <Skeleton className="mt-2 h-12 w-40 rounded-full bg-primary-foreground/15" />
        </Container>
      </section>
      <section className="py-14 md:py-20">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
          </div>
          <ProductGridSkeleton count={8} />
        </Container>
      </section>
    </>
  );
}
