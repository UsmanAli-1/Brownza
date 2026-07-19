import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        accent: "bg-accent text-accent-foreground",
        solid: "bg-primary text-primary-foreground",
        soft: "bg-accent-soft text-secondary",
        outline: "border border-border text-muted-foreground",
        success: "bg-success/12 text-success",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.65rem]",
        default: "px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
