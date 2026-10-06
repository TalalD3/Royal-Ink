import type { NextRequest } from "next/server";
import { currentAdmin } from "@/lib/session";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN CHECK — every admin API route calls this before doing anything,
   in addition to the middleware. It reads the encrypted session cookie
   and confirms the admin still exists in the database.
   ══════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function isAdminRequest(_req: NextRequest): Promise<boolean> {
  try {
    return !!(await currentAdmin());
  } catch {
    return false;
  }
}
