"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { playNotificationSound, primeAudio } from "@/lib/notification-sound";
import { formatPrice } from "@/lib/utils";

const POLL_INTERVAL_MS = 6000;

interface NotificationsResponse {
  newOrders: { id: string; orderNumber: string; customerName: string; total: number }[];
  newPreOrders: { id: string; fullName: string }[];
  serverTime: string;
}

/**
 * Keeps admin pages live via polling (not SSE). We're deployed on Vercel,
 * where serverless functions can't hold a shared in-memory EventEmitter open
 * across instances — the order that creates an event and the connection
 * listening for it can land on different instances, silently dropping the
 * "instant" push. Polling always eventually reflects the true Mongo state,
 * at the cost of a bounded ~6s delay instead of instant delivery.
 */
export function AdminRealtime() {
  const router = useRouter();
  // Cursor starts at "now" so we never replay orders that already existed
  // before this component mounted.
  const sinceRef = React.useRef<string>(new Date().toISOString());
  const inFlightRef = React.useRef(false);

  React.useEffect(() => {
    const poll = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const res = await fetch(
          `/api/admin/notifications?since=${encodeURIComponent(sinceRef.current)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as NotificationsResponse;
        sinceRef.current = data.serverTime;

        if (data.newOrders.length === 0 && data.newPreOrders.length === 0) {
          return;
        }

        for (const order of data.newOrders) {
          toast("🔔 New order received", {
            description: `${order.orderNumber} · ${order.customerName} · ${formatPrice(
              order.total,
            )}`,
            duration: 8000,
          });
        }
        if (data.newOrders.length > 0) {
          playNotificationSound(
            typeof document !== "undefined" && document.hidden,
          );
        }
        for (const preOrder of data.newPreOrders) {
          toast.info("New pre-order request", { description: preOrder.fullName });
        }

        router.refresh();
      } catch {
        // network hiccup — next poll will retry
      } finally {
        inFlightRef.current = false;
      }
    };

    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  // Unlock audio on the first interaction anywhere on the page, so a new-
  // order chime that arrives before the admin has clicked anything yet
  // still has a real chance of being audible (browsers block audio from an
  // AudioContext that's never been resumed off the back of a user gesture).
  React.useEffect(() => {
    const unlock = () => primeAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return null;
}
