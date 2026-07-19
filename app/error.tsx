"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in a later phase.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="font-heading text-5xl font-semibold text-primary">
        Oops
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted-foreground">
          A little kitchen mishap on our end. Please try again — if it keeps
          happening, get in touch and we&apos;ll sort it out.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home />
            Back home
          </Link>
        </Button>
      </div>
    </Container>
  );
}
