import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 ease-lux outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-secondary",
        accent:
          "bg-accent text-accent-foreground shadow-soft hover:brightness-105",
        secondary: "bg-muted text-foreground hover:bg-accent-soft",
        outline:
          "border border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-danger text-white shadow-soft hover:brightness-95",
        link: "text-secondary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 gap-1.5 px-4 text-xs",
        default: "h-11 px-6",
        lg: "h-13 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
