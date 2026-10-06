/* ══════════════════════════════════════════════════════════════════════
   ADMIN SESSION SETTINGS — shared by the server code and the middleware
   (kept free of server-only imports so the middleware can use it).

   The session is an encrypted cookie (iron-session). The browser can't
   read it (httpOnly), it is only sent over HTTPS in production, and only
   to requests made from this site (SameSite=Strict). It expires after 8
   hours; SESSION_SECRET encrypts it.
   ══════════════════════════════════════════════════════════════════════ */
import type { SessionOptions } from "iron-session";

export interface AdminSession {
  adminId?: string;
  email?: string;
}

export const SESSION_COOKIE = "ri_admin";
export const SESSION_TTL = 60 * 60 * 8; // 8 hours

export function sessionPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
  }
  return secret;
}

export function sessionOptions(): SessionOptions {
  return {
    cookieName: SESSION_COOKIE,
    password: sessionPassword(),
    ttl: SESSION_TTL,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    },
  };
}
