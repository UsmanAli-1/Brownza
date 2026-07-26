"use client";

import * as React from "react";

/**
 * Forces the menu page to open at the very top on a fresh load/navigation,
 * overriding any restored scroll position or leftover hash-scroll from a
 * previous visit (e.g. arriving with #brownies still in the URL, or the
 * browser's native scroll restoration kicking in after the `/`→`/products`
 * redirect). Category-pill navigation still works normally afterward since
 * this only runs once on mount.
 */
export function ScrollToTopOnLoad() {
  React.useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return null;
}