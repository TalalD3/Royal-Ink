import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminsCol } from "@/lib/db/collections";
import { getAdminSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { clientIp, hit, reset } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/* Admin login: email + password checked against the bcrypt hash stored in
   the admins collection. 5 failed tries per IP per 15 minutes, then wait. */

const FAILED = "بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.";

// Compared against when the email is unknown, so a wrong email and a wrong
// password take the same time (no hint about which accounts exist)
let dummyHash: string | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("no-such-admin-account", 12));

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limit = hit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `محاولات كثيرة. حاول مجدداً بعد ${Math.ceil(limit.retryAfterSec / 60)} دقيقة.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: FAILED }, { status: 400 });
  const { email, password } = parsed.data;

  try {
    const col = await adminsCol();
    const admin = await col.findOne({ email });
    const ok = await bcrypt.compare(password, admin?.passwordHash ?? getDummyHash());
    if (!admin || !ok) return NextResponse.json({ error: FAILED }, { status: 401 });

    const session = await getAdminSession();
    session.adminId = admin._id.toHexString();
    session.email = admin.email;
    await session.save();
    await col.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });
    reset(`login:${ip}`);
    return NextResponse.json({ ok: true, email: admin.email });
  } catch (err) {
    console.error("[login]", (err as Error).message);
    return NextResponse.json({ error: "حدث خطأ أثناء الاتصال بالخادم. حاول مجدداً." }, { status: 500 });
  }
}
