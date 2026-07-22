"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Themed Sonner toaster. Mounted once in the root layout.
 * Toast surfaces use the same warm card + border tokens as the rest of the UI.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      visibleToasts={3}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !text-foreground !border !border-border !shadow-card !rounded-2xl !font-sans",
          title: "!font-medium",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground !rounded-full",
          cancelButton: "!bg-muted !text-foreground !rounded-full",
          icon: "!text-accent",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
