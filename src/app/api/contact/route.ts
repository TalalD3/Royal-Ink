import { NextRequest, NextResponse } from "next/server";
import type { ObjectId } from "mongodb";
import { contactMessageSchema } from "@/lib/validation";
import { clientIp, hit } from "@/lib/rate-limit";
import { messagesCol } from "@/lib/db/collections";
import { getSiteSettings } from "@/lib/site-settings";
import { buildContactEmail } from "@/lib/contact-email";
import { mailConfigured, sendMail } from "@/lib/mailer";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT FORM — POST /api/contact (public)
   1. at most 5 messages per 10 minutes from one visitor
   2. every field checked (zod); robots that fill the hidden field are
      answered "ok" and ignored
   3. a copy is saved in MongoDB ("messages"), so nothing is lost
   4. the message is emailed to the inbox set in the admin settings, with
      Reply-To = the customer, so «رد» answers them directly
   ══════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** The site's public address, for links inside the email */
function siteUrl(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  const limit = hit(`contact:${clientIp(req.headers)}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return fail("أرسلتم عدة رسائل في وقت قصير. حاولوا بعد قليل، أو اتصلوا بنا هاتفياً.", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "تحققوا من الحقول ثم أعيدوا الإرسال.", 400);
  const m = parsed.data;
  if (m.website) return NextResponse.json({ ok: true }); // a robot — ignore quietly

  const settings = await getSiteSettings();
  const callUs = `اتصلوا بنا على ${settings.phones[0]}`;
  const receivedAt = new Date();

  // 1. Keep a copy (the email still goes out if the database is down)
  let savedId: ObjectId | null = null;
  try {
    const res = await (await messagesCol()).insertOne({
      name: m.name,
      email: m.email,
      phone: m.phone,
      rc: m.rc,
      subject: m.subject,
      message: m.message,
      product: m.product,
      createdAt: receivedAt,
      emailStatus: "failed",
    });
    savedId = res.insertedId;
  } catch (err) {
    console.error("[contact] could not save the message:", (err as Error).message);
  }
  const reference = savedId
    ? savedId.toHexString().slice(-8).toUpperCase()
    : receivedAt.getTime().toString(36).toUpperCase();

  // 2. Email it
  if (!mailConfigured()) {
    console.error("[contact] SMTP_USER / SMTP_PASS are missing — message saved but not emailed");
    return fail(`تعذّر إرسال رسالتكم الآن. ${callUs}، أو حاولوا لاحقاً.`, 503);
  }
  try {
    const { subject, html, text } = buildContactEmail(m, { siteUrl: siteUrl(req), reference, receivedAt });
    await sendMail({ to: settings.formRecipient, replyTo: { name: m.name, address: m.email }, subject, html, text });
    if (savedId) await (await messagesCol()).updateOne({ _id: savedId }, { $set: { emailStatus: "sent" } }).catch(() => null);
    return NextResponse.json({ ok: true, reference });
  } catch (err) {
    const reason = (err as Error).message?.slice(0, 300) || "unknown";
    console.error("[contact] email failed:", reason);
    if (savedId) {
      await (await messagesCol())
        .updateOne({ _id: savedId }, { $set: { emailStatus: "failed", emailError: reason } })
        .catch(() => null);
    }
    return fail(`تعذّر إرسال رسالتكم الآن. ${callUs}، أو حاولوا لاحقاً.`, 502);
  }
}
