"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenshotUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

/**
 * Controlled payment-screenshot upload (UI only — no backend yet).
 * Cloudinary will replace the storage layer later; the `value`/`onChange`
 * contract stays the same, so callers won't change.
 */
export function ScreenshotUpload({
  value,
  onChange,
  error,
}: ScreenshotUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Derive the preview URL from the file; the effect only revokes it on change
  // / unmount (no setState-in-effect).
  const preview = React.useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  React.useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload payment screenshot"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset */}
            <img
              src={preview}
              alt="Payment screenshot preview"
              className="mx-auto max-h-64 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove screenshot"
              className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-dark/70 text-white transition-colors hover:bg-danger focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="dropzone"
            type="button"
            onClick={() => inputRef.current?.click()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
              error
                ? "border-danger/60 bg-danger/5"
                : "border-border bg-muted/40 hover:border-accent hover:bg-accent-soft/30",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-secondary">
              <ImageUp className="size-6" />
            </span>
            <span className="text-sm font-medium text-foreground">
              Upload payment screenshot
            </span>
            <span className="text-xs text-muted-foreground">
              PNG or JPG · tap to browse
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
