import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Who is logged in (used by the admin screens) */
export async function GET() {
  const admin = await currentAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ email: admin.email });
}
