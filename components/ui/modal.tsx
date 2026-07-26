"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  labelledBy?: string;
  className?: string;
}

/**
 * Accessible, animated modal shell. Rendered via a React portal straight
 * into `document.body` — critical because `position: fixed` is relative to
 * the nearest ancestor with a `transform` (or `filter`/`perspective`), and
 * product cards use `hover:-translate-y-1`. Without the portal, opening a
 * modal while the triggering card is mid-hover pins the "fixed" modal to
 * that card's box instead of the viewport, which is why it looked correct
 * only once the cursor moved away and the card's transform cleared.
 */
export function Modal({
  open,
  onOpenChange,
  children,
  labelledBy,
  className,
}: ModalProps) {
  const mounted = useHydrated();

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-lift sm:max-h-[85vh] sm:rounded-3xl",
              className,
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}