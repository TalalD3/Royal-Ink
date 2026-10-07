import type { ContactMessage } from "@/lib/validation";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT EMAIL — what the company receives for each form message.
   Arabic, right-to-left, in the brand colours; tables and inline styles
   so it looks the same in Gmail, Outlook and phone mail apps. Replying
   answers the customer directly (Reply-To is their address); buttons
   open a reply, a call or WhatsApp in one tap.
   ══════════════════════════════════════════════════════════════════════ */

const BLACK = "#1D1D1B";
const RED = "#E30B17";
const MIST = "#F4F4F2";
const LINE = "#E6E6E3";
const GRAY = "#6B6B6B";
const FONT = "Tahoma, 'Segoe UI', Arial, sans-serif";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const multiline = (s: string) => esc(s).replace(/\r?\n/g, "<br>");
const ltr = (html: string) => `<span dir="ltr" style="unicode-bidi:isolate;">${html}</span>`;

/** The phone in international form (an Algerian 0… number becomes 213…) */
function intlDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `213${d.slice(1)}`;
  return d;
}

export function buildContactEmail(
  m: ContactMessage,
  ctx: { siteUrl: string; reference: string; receivedAt: Date }
): { subject: string; html: string; text: string } {
  const when = new Intl.DateTimeFormat("ar-DZ-u-nu-latn", {
    timeZone: "Africa/Algiers",
    dateStyle: "full",
    timeStyle: "short",
  }).format(ctx.receivedAt);
  const topic = m.subject || (m.product ? `استفسار عن المنتج ${m.product}` : "بدون موضوع");
  const subject = `رسالة جديدة من الموقع: ${topic} — ${m.name}`;

  const phone = intlDigits(m.phone);
  const replyHref = `mailto:${m.email}?subject=${encodeURIComponent(`رد: ${topic} — روايال إنك`)}`;
  const callHref = `tel:+${phone}`;
  const whatsappHref = `https://wa.me/${phone}`;
  const productHref = m.product ? `${ctx.siteUrl}/compatibility?q=${encodeURIComponent(m.product)}` : "";

  const rows: [string, string][] = [
    ["الاسم أو الشركة", esc(m.name)],
    ["البريد الإلكتروني", ltr(`<a href="mailto:${esc(m.email)}" style="color:${RED};text-decoration:none;">${esc(m.email)}</a>`)],
    ["الهاتف", ltr(`<a href="${callHref}" style="color:${BLACK};text-decoration:none;">${esc(m.phone)}</a>`)],
    ["السجل التجاري", ltr(esc(m.rc))],
  ];
  if (m.product) {
    rows.push([
      "المنتج المعني",
      `${ltr(esc(m.product))} &nbsp;<a href="${productHref}" style="color:${RED};font-weight:normal;font-size:13px;">عرض في دليل التوافق</a>`,
    ]);
  }

  const rowHtml = rows
    .map(
      ([label, value], i) => `
          <tr>
            <td style="padding:12px 0;${i ? `border-top:1px solid ${LINE};` : ""}width:140px;vertical-align:top;color:${GRAY};font-size:13px;">${label}</td>
            <td style="padding:12px 0;${i ? `border-top:1px solid ${LINE};` : ""}vertical-align:top;color:${BLACK};font-size:15px;font-weight:bold;">${value}</td>
          </tr>`
    )
    .join("");

  const button = (href: string, label: string, bg: string, fg: string, border = bg) =>
    `<a href="${href}" style="display:inline-block;margin:0 0 8px 8px;padding:12px 22px;background:${bg};color:${fg};border:1px solid ${border};font-family:${FONT};font-size:14px;font-weight:bold;text-decoration:none;">${label}</a>`;

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${MIST};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" style="max-width:620px;background:#ffffff;border:1px solid ${LINE};font-family:${FONT};text-align:right;">
        <tr><td style="padding:0;font-size:0;line-height:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="64%" style="height:5px;background:${BLACK};font-size:0;line-height:0;">&nbsp;</td>
            <td width="36%" style="height:5px;background:${RED};font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td style="background:${BLACK};padding:24px 28px;color:#ffffff;">
          <div style="font-size:12px;font-weight:bold;color:${RED};">موقع روايال إنك · نموذج التواصل</div>
          <div style="margin-top:8px;font-size:22px;font-weight:bold;line-height:1.5;">رسالة جديدة من عميل</div>
          <div style="margin-top:6px;font-size:13px;color:#BDBDBD;">${esc(when)}</div>
        </td></tr>

        <tr><td style="background:${RED};padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;line-height:1.6;">
          الموضوع: ${esc(topic)}
        </td></tr>

        <tr><td style="padding:24px 28px 8px;">
          <div style="font-size:13px;font-weight:bold;color:${RED};">بيانات المرسل</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;border-collapse:collapse;">${rowHtml}
          </table>
        </td></tr>

        <tr><td style="padding:16px 28px 8px;">
          <div style="font-size:13px;font-weight:bold;color:${RED};">نص الرسالة</div>
          <div style="margin-top:10px;padding:16px 18px;background:${MIST};border-right:4px solid ${BLACK};color:${BLACK};font-size:15px;line-height:1.9;">${multiline(m.message)}</div>
        </td></tr>

        <tr><td style="padding:20px 28px 20px;">
          ${button(replyHref, "الرد بالبريد", RED, "#ffffff")}${button(callHref, "اتصال", BLACK, "#ffffff")}${button(whatsappHref, "واتساب", "#ffffff", BLACK, BLACK)}
        </td></tr>

        <tr><td style="background:${MIST};padding:16px 28px;color:${GRAY};font-size:12px;line-height:1.9;border-top:1px solid ${LINE};">
          للرد على العميل يكفي الضغط على «رد» في بريدك، فيصل الرد مباشرة إلى ${ltr(esc(m.email))}.<br>
          مرجع الرسالة: ${ltr(esc(ctx.reference))} — نسخة منها محفوظة في قاعدة بيانات الموقع.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const line = "────────────────────";
  const text = [
    "رسالة جديدة من نموذج التواصل — موقع روايال إنك",
    when,
    "",
    `الموضوع: ${topic}`,
    line,
    `الاسم أو الشركة: ${m.name}`,
    `البريد الإلكتروني: ${m.email}`,
    `الهاتف: ${m.phone}`,
    `السجل التجاري: ${m.rc}`,
    ...(m.product ? [`المنتج المعني: ${m.product} — ${productHref}`] : []),
    line,
    "نص الرسالة:",
    m.message,
    line,
    `للرد: اضغط «رد» في بريدك. واتساب: ${whatsappHref}`,
    `مرجع الرسالة: ${ctx.reference}`,
  ].join("\n");

  return { subject, html, text };
}
