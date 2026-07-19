import Link from "next/link";
import { Home, UtensilsCrossed } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="font-heading text-7xl font-semibold text-primary sm:text-8xl">
        404
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          This page has crumbled
        </h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Let&apos;s get you back to something delicious.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home />
            Back home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">
            <UtensilsCrossed />
            Browse the menu
          </Link>
        </Button>
      </div>
    </Container>
  );
}
