import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import logoImg from "@/public/logo.png";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  /** Use light text on dark surfaces (e.g. footer). */
  invert?: boolean;
  /** "lg" for prominent placements (e.g. the footer brand block). */
  size?: "md" | "lg";
}

/** Brand lockup: logo mark + wordmark, linking home. Reused in nav & footer. */
function Logo({
  className,
  showWordmark = true,
  invert = false,
  size = "md",
}: LogoProps) {
  return (
    <Link
      href="/products"
      aria-label={`${siteConfig.name} — menu`}
      className={cn(
        "group inline-flex items-center rounded-lg",
        size === "lg" ? "gap-3.5" : "gap-2.5",
        className,
      )}
    >
      <Image
        src={logoImg}
        alt=""
        aria-hidden
        sizes={size === "lg" ? "80px" : "44px"}
        className={cn(
          "w-auto object-contain transition-transform duration-300 ease-lux group-hover:scale-105",
          size === "lg" ? "h-16 md:h-20" : "h-9 md:h-10",
        )}
      />
      {showWordmark && (
        <span
          className={cn(
            "font-heading font-semibold tracking-tight",
            size === "lg" ? "text-3xl md:text-4xl" : "text-xl",
            invert ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}

export { Logo };
