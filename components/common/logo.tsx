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
}

/** Brand lockup: logo mark + wordmark, linking home. Reused in nav & footer. */
function Logo({ className, showWordmark = true, invert = false }: LogoProps) {
  return (
    <Link
      href="/products"
      aria-label={`${siteConfig.name} — menu`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg",
        className,
      )}
    >
      <Image
        src={logoImg}
        alt=""
        aria-hidden
        sizes="44px"
        className="h-9 w-auto object-contain transition-transform duration-300 ease-lux group-hover:scale-105 md:h-10"
      />
      {showWordmark && (
        <span
          className={cn(
            "font-heading text-xl font-semibold tracking-tight",
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
