"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, LayoutDashboard, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/orders",
    label: "Today's Orders",
    icon: CalendarClock,
    exact: false,
  },
  {
    href: "/admin/all-orders",
    label: "All Orders",
    icon: ShoppingBag,
    exact: false,
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 md:h-fit md:w-40 md:flex-col md:sticky md:top-20">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:flex-none",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
