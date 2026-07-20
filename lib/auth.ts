import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-token";
import type { AdminTokenPayload } from "@/lib/admin-token";

export * from "@/lib/admin-token";

/** Read + verify the admin session from cookies (server components / routes). */
export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}
