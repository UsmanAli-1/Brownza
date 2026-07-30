"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * The pre-order detail page (server component) marks the request as read
 * during its own render, but Next.js reuses the already-rendered parent
 * layout on a same-layout navigation — so the sidebar's unread badge
 * (computed in that layout) doesn't recompute on its own. One refresh on
 * mount is enough to pick up the new count.
 */
export function MarkReadRefresh() {
  const router = useRouter();
  React.useEffect(() => {
    router.refresh();
    // Intentionally run once per mount only — refreshing on every render
    // would re-fetch the whole route tree in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
