import jwt from "jsonwebtoken";

/**
 * JWT/credential helpers with no `next/headers` dependency, so this module is
 * safe to import from `proxy.ts` (the request-boundary guard) as well as from
 * route handlers and server components (via `@/lib/auth`).
 */
export const ADMIN_COOKIE = "brownza_admin_token";
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

export interface AdminTokenPayload {
  role: "admin";
  sub: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in the environment.");
  return secret;
}

export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  return (
    !!process.env.ADMIN_USERNAME &&
    !!process.env.ADMIN_PASSWORD &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function signAdminToken(username: string): string {
  const payload: AdminTokenPayload = { role: "admin", sub: username };
  return jwt.sign(payload, getSecret(), { expiresIn: ADMIN_TOKEN_MAX_AGE });
}

export function verifyAdminToken(
  token: string | undefined,
): AdminTokenPayload | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret());
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      (decoded as AdminTokenPayload).role === "admin"
    ) {
      return decoded as AdminTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}
