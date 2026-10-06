import { cookies } from "next/headers";
import { getIronSession, type CookieStore } from "iron-session";
import { adminsCol, toObjectId } from "@/lib/db/collections";
import { sessionOptions, type AdminSession } from "@/lib/session-config";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN SESSION — server only (route handlers)
   ══════════════════════════════════════════════════════════════════════ */

export async function getAdminSession() {
  return getIronSession<AdminSession>(cookies() as unknown as CookieStore, sessionOptions());
}

/** The logged-in admin, re-checked against the database (a deleted admin
    loses access at once), or null */
export async function currentAdmin(): Promise<{ id: string; email: string } | null> {
  const session = await getAdminSession();
  const _id = toObjectId(session.adminId);
  if (!_id) return null;
  const admin = await (await adminsCol()).findOne({ _id }, { projection: { email: 1 } });
  return admin ? { id: admin._id.toHexString(), email: admin.email } : null;
}
