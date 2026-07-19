"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useLocationStore } from "@/lib/location-store";
import { useHydrated } from "@/lib/use-hydrated";
import { detectDeliveryArea } from "@/lib/geolocation";
import {
  DEFAULT_DELIVERY_AREA,
  DELIVERY_AREAS,
  type DeliveryArea,
} from "@/lib/constants";

type DetectStatus = "idle" | "detecting" | "detected" | "failed";

/**
 * First-visit delivery-area popup. Shown only when no area is saved; tries to
 * auto-detect via geolocation + reverse geocoding (non-blocking — the visitor
 * can pick manually meanwhile), then persists the choice to localStorage.
 */
export function LocationGate() {
  const hydrated = useHydrated();
  const savedArea = useLocationStore((s) => s.area);
  const setArea = useLocationStore((s) => s.setArea);

  const [selected, setSelected] =
    React.useState<DeliveryArea>(DEFAULT_DELIVERY_AREA);
  const [status, setStatus] = React.useState<DetectStatus>("idle");
  const [detectedLabel, setDetectedLabel] = React.useState<string | null>(null);
  const userTouched = React.useRef(false);
  const attempted = React.useRef(false);

  const open = hydrated && savedArea === null;

  // Auto-detect once when the popup opens (does not block manual selection).
  React.useEffect(() => {
    if (!open || attempted.current) return;
    attempted.current = true;
    setStatus("detecting");
    detectDeliveryArea()
      .then((res) => {
        setDetectedLabel(res.label ?? null);
        setStatus("detected");
        if (!userTouched.current) setSelected(res.area);
      })
      .catch(() => setStatus("failed"));
  }, [open]);

  // Lock body scroll while the popup is open.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const statusText: Record<DetectStatus, string> = {
    idle: "Choose your area so we can confirm delivery.",
    detecting: "Detecting your location…",
    detected: detectedLabel
      ? `Detected near ${detectedLabel}. Change it if that's not right.`
      : "We've suggested an area — change it if needed.",
    failed: "We couldn't detect your location — please choose your area.",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-secondary">
              <MapPin className="size-6" />
            </span>
            <h2
              id="location-title"
              className="mt-4 font-heading text-2xl font-semibold text-foreground"
            >
              Select Delivery Area
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground" aria-live="polite">
              {statusText[status]}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <label
                htmlFor="location-area"
                className="text-sm font-medium text-foreground"
              >
                Delivery area
              </label>
              <Select
                id="location-area"
                autoFocus
                value={selected}
                onChange={(e) => {
                  userTouched.current = true;
                  setSelected(e.target.value as DeliveryArea);
                }}
              >
                {DELIVERY_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                If your area isn&apos;t listed, simply choose Other or contact us
                to confirm delivery availability.
              </p>
            </div>

            <Button
              onClick={() => setArea(selected)}
              size="lg"
              className="mt-5 w-full"
            >
              Confirm area
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
