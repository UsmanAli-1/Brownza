"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/** Payment screenshot with a skeleton shown while the image itself loads
 * from Cloudinary — so the admin sees "something is coming" instead of a
 * blank gap during the fetch. */
export function PaymentScreenshot({ url }: { url: string }) {
  const [loaded, setLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // If the browser already had this image cached, next/image's onLoad can
  // fire before this component mounts and attaches the handler — leaving
  // `loaded` stuck at false forever (the image renders, but stays
  // permanently invisible under opacity-0). Check `.complete` on mount to
  // catch that case.
  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-fit overflow-hidden rounded-xl border border-border"
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex h-80 w-60 animate-pulse items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Loading image…</span>
        </div>
      )}
      <Image
        ref={imgRef}
        src={url}
        alt="Payment screenshot"
        width={480}
        height={640}
        onLoad={() => setLoaded(true)}
        className={cn(
          "max-h-80 w-auto bg-muted object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-dark/70 px-2.5 py-1 text-xs font-medium text-white">
        <ExternalLink className="size-3" />
        Open
      </span>
    </a>
  );
}
