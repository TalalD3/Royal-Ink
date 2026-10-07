"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { useSiteSettings } from "@/components/site-settings-provider";
import { platformName, telHref, visibleSocials } from "@/types/site-settings";
import { SocialIcon } from "@/components/contact/social-icons";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT FORM + side notes
   The form is for businesses (the commercial register number is asked).
   Arriving from a product page (/contact?product=CODE) fills the subject.
   Sending posts to /api/contact, which saves a copy and emails the
   company inbox set in the admin settings.
   ══════════════════════════════════════════════════════════════════════ */

const fieldCls =
  "h-12 w-full border border-brand-line bg-white px-4 text-[15px] text-brand-black outline-none transition-[border-color,box-shadow] placeholder:text-brand-gray/60 focus:border-brand-black focus:shadow-[inset_0_-2px_0_rgb(var(--brand-red))]";

const TIPS = [
  {
    title: "طراز الطابعة",
    text: "مثل HP LaserJet Pro M404dn — تجدونه على واجهة الطابعة أو على ملصقها الخلفي.",
  },
  {
    title: "كود المستلزم",
    text: "المطبوع على الخرطوشة أو علبتها، مثل 85A أو CE285A.",
  },
  {
    title: "الكمية وولايتكم",
    text: "لنقترح عليكم أقرب نقطة بيع أو طريقة التوصيل المناسبة.",
  },
];

const CLIENTS = [
  "الإدارات والهيئات",
  "تجار الجملة",
  "المطابع ووكالات الإشهار",
  "محلات الإعلام الآلي والمكتبات",
  "مصلحو الطابعات",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  rc: string;
  subject: string;
  message: string;
};

const EMPTY: FormState = { name: "", email: "", phone: "", rc: "", subject: "", message: "" };

export function ContactSection() {
  const params = useSearchParams();
  const product = params.get("product")?.trim().slice(0, 80) || "";
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  // Hidden from people; spam robots fill it in
  const [website, setWebsite] = useState("");
  const settings = useSiteSettings();
  const socials = visibleSocials(settings);

  // From a product page: the subject names the product
  useEffect(() => {
    if (product) setForm((f) => (f.subject ? f : { ...f, subject: `استفسار عن المنتج ${product}` }));
  }, [product]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const digits = form.phone.replace(/\D/g, "").length;
    if (digits < 9 || digits > 15) {
      setError("رقم الهاتف غير صحيح. اكتبوه كاملاً، مثل 0550 00 00 00.");
      document.getElementById("cf-phone")?.focus();
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "تعذّر إرسال رسالتكم الآن. حاولوا لاحقاً أو اتصلوا بنا هاتفياً.");
      setReference(json.reference || "");
      setForm(EMPTY);
      setStatus("sent");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "تعذّر الاتصال بالموقع. تحققوا من اتصالكم بالإنترنت ثم أعيدوا المحاولة."
          : (err as Error).message
      );
      setStatus("idle");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      {/* ── The form ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="ri-eyebrow mb-4">نموذج التواصل</p>
        <h2 className="ri-h2">أرسل لنا رسالة</h2>
        <p className="ri-lead mt-3 max-w-2xl">
          هذا النموذج مخصص للمؤسسات والمهنيين. للشراء كفرد، تجدون منتجاتنا لدى{" "}
          <Link href="/find-us" className="font-bold text-brand-red underline-offset-4 hover:underline">
            نقاط البيع المعتمدة
          </Link>
          .
        </p>

        {status === "sent" ? (
          /* ── Sent ── */
          <div role="status" className="ri-strip mt-8 border border-brand-line bg-white p-6 pt-9 sm:p-10">
            <span className="flex h-14 w-14 items-center justify-center bg-brand-black text-white">
              <CheckCircle2 className="h-7 w-7 text-brand-red" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-2xl font-extrabold text-brand-black">وصلتنا رسالتكم، شكراً لكم</h3>
            <p className="mt-3 max-w-xl text-base leading-8 text-brand-gray">
              سيطّلع عليها فريقنا ويعود إليكم في أقرب وقت عبر البريد الإلكتروني أو الهاتف. وللطلبات المستعجلة اتصلوا بنا
              على{" "}
              <a dir="ltr" href={telHref(settings.phones[0])} className="font-extrabold text-brand-black hover:text-brand-red">
                {settings.phones[0]}
              </a>
              .
            </p>
            {reference && (
              <p className="mt-5 inline-flex items-center gap-2 bg-brand-mist px-3 py-2 text-sm text-brand-gray">
                مرجع رسالتكم:
                <span dir="ltr" className="font-extrabold tracking-wider text-brand-black">
                  {reference}
                </span>
              </p>
            )}
            <div className="mt-7 border-t border-brand-line pt-6">
              <button type="button" onClick={() => setStatus("idle")} className="ri-btn ri-btn-black">
                <span>إرسال رسالة أخرى</span>
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="relative ri-strip mt-8 border border-brand-line bg-white p-5 pt-8 sm:p-8 sm:pt-10">
          {/* Spam trap: invisible to people, robots fill it */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="cf-website">الموقع الإلكتروني</label>
            <input
              id="cf-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="الاسم الكامل أو اسم الشركة" htmlFor="cf-name" required className="sm:col-span-2">
              <input
                id="cf-name"
                required
                autoComplete="organization"
                value={form.name}
                onChange={set("name")}
                placeholder="مثال: مؤسسة النور للطباعة"
                className={fieldCls}
              />
            </Field>
            <Field label="البريد الإلكتروني" htmlFor="cf-email" required>
              <input
                id="cf-email"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                value={form.email}
                onChange={set("email")}
                placeholder="name@company.dz"
                className={cn(fieldCls, "text-right")}
              />
            </Field>
            <Field label="رقم الهاتف" htmlFor="cf-phone" required>
              <input
                id="cf-phone"
                type="tel"
                required
                autoComplete="tel"
                dir="ltr"
                value={form.phone}
                onChange={set("phone")}
                placeholder="0550 00 00 00"
                className={cn(fieldCls, "text-right")}
              />
            </Field>
            <Field label="رقم السجل التجاري (RC)" htmlFor="cf-rc" required>
              <input
                id="cf-rc"
                required
                dir="ltr"
                value={form.rc}
                onChange={set("rc")}
                placeholder="19/00-0000000 B 00"
                className={cn(fieldCls, "text-right")}
              />
            </Field>
            <Field label="الموضوع" htmlFor="cf-subject" hint="اختياري">
              <input
                id="cf-subject"
                value={form.subject}
                onChange={set("subject")}
                placeholder="طلب عرض سعر، استفسار عن منتج…"
                className={fieldCls}
              />
            </Field>
            <Field label="الرسالة" htmlFor="cf-message" required className="sm:col-span-2">
              <textarea
                id="cf-message"
                required
                minLength={10}
                rows={6}
                value={form.message}
                onChange={set("message")}
                placeholder="اكتبوا طلبكم: طراز الطابعة، كود المستلزم، الكمية…"
                className={cn(fieldCls, "h-auto resize-y py-3 leading-7")}
              />
            </Field>
          </div>

          {error && (
            <p role="alert" className="mt-6 border-s-4 border-brand-red bg-brand-red/5 px-4 py-3 text-sm font-bold text-brand-red">
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-col gap-4 border-t border-brand-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-6 text-brand-gray">
              الحقول المعلّمة بـ <span className="font-bold text-brand-red">*</span> مطلوبة.
            </p>
            <button
              type="submit"
              disabled={status === "sending"}
              className="ri-btn ri-btn-red w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>جارٍ الإرسال…</span>
                </>
              ) : (
                <>
                  <span>إرسال الرسالة</span>
                  <Send className="h-4 w-4 -scale-x-100" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </motion.div>

      {/* ── Side notes ── */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        className="space-y-10 lg:pt-2"
      >
        {/* For a faster, exact answer */}
        <section>
          <h3 className="text-lg font-extrabold text-brand-black">لإجابة أسرع وأدق، اذكروا لنا</h3>
          <ol className="mt-5 border-t border-brand-line">
            {TIPS.map((t, i) => (
              <li key={t.title} className="flex gap-4 border-b border-brand-line py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-black text-sm font-extrabold tabular-nums text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold text-brand-black">{t.title}</p>
                  <p className="mt-1 text-sm leading-7 text-brand-gray">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/compatibility" className="ri-link mt-6">
            <span>ابحث بنفسك في دليل التوافق</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        {/* Who the form is for */}
        <section>
          <h3 className="text-lg font-extrabold text-brand-black">نعمل مع المهنيين</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CLIENTS.map((c) => (
              <li key={c} className="bg-brand-mist px-3 py-2 text-sm font-bold text-brand-black">
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Official accounts (those switched on in the admin, with a link) */}
        {socials.length > 0 && (
          <section>
            <h3 className="text-lg font-extrabold text-brand-black">تابعونا</h3>
            <p className="mt-2 text-sm leading-7 text-brand-gray">
              كونوا أول من يطّلع على عروضنا ومستجداتنا عبر حساباتنا الرسمية.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-px border border-brand-line bg-brand-line">
              {socials.map((s, i) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex items-center gap-3 bg-white p-4 transition-colors hover:bg-brand-mist",
                    // An odd last account takes the whole row
                    socials.length % 2 === 1 && i === socials.length - 1 && "col-span-2"
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-black text-white transition-colors group-hover:bg-brand-red">
                    <SocialIcon id={s.id} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-brand-gray">{platformName(s.id)}</span>
                    <span dir="ltr" className="block truncate text-right text-sm font-extrabold text-brand-black">
                      {s.handle || platformName(s.id)}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </motion.aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline gap-2 text-sm font-extrabold text-brand-black">
        {label}
        {required && <span className="text-brand-red">*</span>}
        {hint && <span className="text-xs font-semibold text-brand-gray">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export default ContactSection;
