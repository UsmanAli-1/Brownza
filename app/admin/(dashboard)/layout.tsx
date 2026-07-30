import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileMenuButton } from "@/components/admin/admin-mobile-menu-button";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminRealtime } from "@/components/admin/admin-realtime";
import { countUnreadPreOrders } from "@/lib/services/pre-order-service";
import logoImg from "@/public/logo.png";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Brownza Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const formDataUnread = await countUnreadPreOrders();

  return (
    <div className="min-h-dvh bg-muted/30">
      <AdminRealtime />
      <header className="fixed inset-x-0 top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <AdminMobileMenuButton />
            </div>
            <div className="hidden items-center gap-3 md:flex">
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
          </div>

          {/* Mobile: logo centered in the header, no text — doesn't affect
              flex layout of the hamburger/logout either side. */}
          <Image
            src={logoImg}
            alt="Brownza"
            sizes="36px"
            className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover md:hidden"
          />

          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 pt-20 pb-4 sm:px-5 sm:pt-24 sm:pb-6 md:flex-row md:gap-6">
        <AdminNav formDataUnread={formDataUnread} username={session.sub} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}