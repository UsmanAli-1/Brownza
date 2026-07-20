import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-token";

/**
 * Request-boundary guard for the admin dashboard (Next 16 `proxy`, formerly
 * middleware). Redirects unauthenticated visitors to the login page BEFORE any
 * admin page renders or queries the database. The admin API routes enforce
 * auth independently.
 */
export const config = {
  matcher: ["/admin/:path*"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page must stay publicly reachable.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
