import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
  signAdminToken,
  verifyAdminCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;
  if (!(await verifyAdminCredentials(username, password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Only mark the cookie Secure on real HTTPS so local `next start` (http)
  // can log in too; production behind HTTPS still gets a Secure cookie.
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";

  const token = signAdminToken(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: ADMIN_TOKEN_MAX_AGE,
  });
  return res;
}
