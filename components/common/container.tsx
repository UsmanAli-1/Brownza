import * as React from "react";
import { cn } from "@/lib/utils";

/** Consistent page gutter + max width used across all sections. Padding
 * halved from the original (px-5/8/10) per request — px-2.5/4/5. */
function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-2.5 sm:px-4 lg:px-5", className)}
      {...props}
    />
  );
}

export { Container };