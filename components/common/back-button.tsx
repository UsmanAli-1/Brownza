"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Where to go if there's no browser history to go back to. */
  fallbackHref?: string;
  label?: string;
  className?: string;
}

/** Navigates back in history, falling back to a route on a fresh/direct visit. */
export function BackButton({
  fallbackHref = "/products",
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        className,
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
