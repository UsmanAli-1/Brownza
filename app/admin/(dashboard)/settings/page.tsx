import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const metadata: Metadata = { title: "Account settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Account settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.sub}</span>
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Change password
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
