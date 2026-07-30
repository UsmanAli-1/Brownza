"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  ShoppingBag,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminMobileMenuStore } from "@/lib/admin-mobile-menu-store";

interface AdminNavProps {
  /** Unread pre-order count — renders as a badge on "Form Data". 0 = no badge. */
  formDataUnread?: number;
  username: string;
}

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
  {
    href: "/admin/form-data",
    label: "Form Data",
    icon: FileText,
    exact: false,
  },
] as const;

function NavLinks({
  pathname,
  formDataUnread,
  onNavigate,
}: {
  pathname: string;
  formDataUnread: number;
  onNavigate?: () => void;
}) {
  return (
    <>
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;
        const showBadge = link.href === "/admin/form-data" && formDataUnread > 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:flex-none",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
            {showBadge && (
              <span
                aria-label={`${formDataUnread} new submissions`}
                className={cn(
                  "ml-auto flex size-5 items-center justify-center rounded-full text-[0.7rem] font-semibold",
                  active
                    ? "bg-primary-foreground text-primary"
                    : "bg-danger text-white",
                )}
              >
                {formDataUnread > 9 ? "9+" : formDataUnread}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function ProfileBlock({
  username,
  onNavigate,
}: {
  username: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/admin/settings"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-secondary">
        {username.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {username}
        </p>
        <p className="text-xs text-muted-foreground">Account settings</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function AdminNav({ formDataUnread = 0, username }: AdminNavProps) {
  const pathname = usePathname();
  const mobileOpen = useAdminMobileMenuStore((s) => s.open);
  const closeMobile = useAdminMobileMenuStore((s) => s.close);

  return (
    <>
      {/* Mobile: full-screen overlay drawer (trigger lives in the header) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-dark/50"
            onClick={closeMobile}
            aria-hidden
          />
          <div className="relative flex w-72 max-w-[85vw] flex-col gap-1 bg-card p-4 shadow-lift">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-foreground">
                Menu
              </span>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLinks
                pathname={pathname}
                formDataUnread={formDataUnread}
                onNavigate={closeMobile}
              />
            </nav>
            <div className="mt-auto border-t border-border pt-3">
              <ProfileBlock username={username} onNavigate={closeMobile} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop: fixed sidebar column (not sticky — sticky anchors to this
          flex row's own box, which reflows and visibly jitters every time
          admin-realtime triggers a router.refresh()). The outer div mirrors
          the header/content's own `mx-auto max-w-[1600px]` so the fixed
          nav's left edge always lines up, at any viewport width, without
          hardcoding an offset. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-[4.25rem] z-20 mx-auto hidden h-[calc(100dvh-4.25rem)] max-w-[1600px] px-3 sm:px-5 md:block"
        aria-hidden={false}
      >
        <nav className="pointer-events-auto flex h-full w-48 flex-col border-r border-border pr-4">
          <div className="flex flex-col gap-1">
            <NavLinks pathname={pathname} formDataUnread={formDataUnread} />
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <div className="mb-1 border-t border-border" />
            <ProfileBlock username={username} />
          </div>
        </nav>
      </div>
      {/* Reserves the sidebar's width in the flex row so main content isn't
          hidden underneath the fixed nav above. */}
      <div className="hidden w-48 shrink-0 md:block" aria-hidden />
    </>
  );
}
