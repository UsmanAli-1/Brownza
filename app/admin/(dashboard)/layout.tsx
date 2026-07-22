import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminRealtime } from "@/components/admin/admin-realtime";
import logoImg from "@/public/logo.png";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Brownza Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-muted/30">
      <AdminRealtime />
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Image
              src={logoImg}
              alt="Brownza"
              sizes="36px"
              className="size-9 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="font-heading text-base font-semibold text-foreground">
                Brownza Admin
              </p>
              <p className="text-xs text-muted-foreground">Order management</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6 md:flex-row md:gap-6">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
