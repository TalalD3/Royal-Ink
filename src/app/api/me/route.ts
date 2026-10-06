import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Is the current visitor a logged-in admin? Used by the floating admin
    button on the public pages. Answers only yes/no (+ the admin's email
    when yes) — never anything else. */
export async function GET() {
  const admin = await currentAdmin().catch(() => null);
  return NextResponse.json(admin ? { admin: true, email: admin.email } : { admin: false }, {
    headers: { "Cache-Control": "no-store" },
  });
}
