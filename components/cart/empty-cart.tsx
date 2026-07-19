import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyCartProps {
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
}

export function EmptyCart({
  title = "Your cart is empty",
  description = "Looks like you haven't added anything yet. Explore our freshly baked menu and treat yourself.",
  cta = { label: "Browse the menu", href: "/products" },
}: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-secondary">
        <ShoppingBag className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="max-w-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild size="lg">
        <Link href={cta.href}>
          {cta.label}
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
