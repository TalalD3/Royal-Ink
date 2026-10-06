import { NextResponse, type NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { SESSION_COOKIE, SESSION_TTL, type AdminSession } from "@/lib/session-config";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN GATE — runs before every /admin page and /api/admin route.
   Without a valid session cookie: pages redirect to the login screen,
   API routes answer 401. (Each API route checks again on its own.)
   ══════════════════════════════════════════════════════════════════════ */

const PUBLIC = new Set(["/admin/login", "/api/admin/login"]);

async function hasSession(req: NextRequest): Promise<boolean> {
  const seal = req.cookies.get(SESSION_COOKIE)?.value;
  const password = process.env.SESSION_SECRET;
  if (!seal || !password) return false;
  try {
    const data = await unsealData<AdminSession>(seal, { password, ttl: SESSION_TTL });
    return !!data?.adminId;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();
  if (await hasSession(req)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
