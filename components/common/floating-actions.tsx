"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/social";
import { CONTACT } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom-right stack: a green WhatsApp button (always visible) and a
 * scroll-to-top button that fades in after scrolling. Same layout on all
 * breakpoints. Sits below the location popup (z-70) but above content.
 */
export function FloatingActions() {
  const [showTop, setShowTop] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">
      <a
        href={CONTACT.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-300 ease-lux hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-14"
      >
        <WhatsappIcon className="size-6 sm:size-7" />
      </a>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className={cn(
          "flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-all duration-300 ease-lux hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-12",
          showTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ArrowUp className="size-5" />
      </button>
    </div>
  );
}
