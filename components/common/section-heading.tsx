import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Heading level for correct document outline. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  titleClassName?: string;
  invert?: boolean;
}

/** Consistent editorial heading: caramel eyebrow, serif title, muted intro. */
function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  className,
  titleClassName,
  invert = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
            invert ? "text-accent" : "text-secondary",
          )}
        >
          <span className="h-px w-6 bg-accent" aria-hidden />
          {eyebrow}
        </span>
      )}
      <Heading
        className={cn(
          "text-balance text-3xl font-semibold leading-tight sm:text-4xl md:text-[2.75rem]",
          invert ? "text-primary-foreground" : "text-foreground",
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "text-pretty text-base leading-relaxed sm:text-lg",
            invert ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export { SectionHeading };
