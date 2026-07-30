"use client";

import { Menu } from "lucide-react";
import { useAdminMobileMenuStore } from "@/lib/admin-mobile-menu-store";

export function AdminMobileMenuButton() {
  const toggle = useAdminMobileMenuStore((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open menu"
      className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
    >
      <Menu className="size-5" />
    </button>
  );
}
