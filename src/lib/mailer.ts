import nodemailer, { type Transporter } from "nodemailer";

/* ══════════════════════════════════════════════════════════════════════
   MAILER — server only. Sends email through the company Gmail account.

   .env.local / hosting panel:
     SMTP_USER   the Gmail address that sends (royalink.support@gmail.com)
     SMTP_PASS   a Gmail "app password" for that account (16 letters) —
                 not the normal Gmail password
     SMTP_HOST   optional, default smtp.gmail.com
     SMTP_PORT   optional, default 465 (SSL)
   ══════════════════════════════════════════════════════════════════════ */

let transporter: Transporter | null = null;

export function mailConfigured(): boolean {
  return !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
}

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT) || 465;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      // Google shows app passwords in groups of four ("abcd efgh …")
      pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: { name: string; address: string };
  fromName?: string;
}): Promise<void> {
  if (!mailConfigured()) throw new Error("SMTP_USER / SMTP_PASS are not set");
  const from = process.env.SMTP_USER as string;
  await getTransporter().sendMail({
    from: { name: options.fromName || "موقع روايال إنك", address: from },
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
