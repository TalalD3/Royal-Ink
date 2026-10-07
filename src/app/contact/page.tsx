import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Search, ShieldCheck } from "lucide-react";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactSection } from "@/components/contact/contact-form";
import { ContactFaq } from "@/components/contact/contact-faq";
import { StoreVisit } from "@/components/ui/store-visit";
import { getSiteSettings } from "@/lib/site-settings";
import { telHref } from "@/types/site-settings";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT PAGE — /contact

   1. Header     — black block (title, call / write, facts) with the
                   product photo on a red block, over the direct channels
   2. Form       — for businesses, with tips for a faster answer, who we
                   work with, and the official accounts
   3. Shortcuts  — answers visitors can find themselves
   4. Visit      — the El Eulma shop front, address and directions
   5. FAQ        — the seven questions from the content document
   ══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "اتصل بنا — Royal Ink روايال إنك",
  description:
    "تواصلوا مع روايال إنك: هاتف، بريد إلكتروني، ونموذج تواصل للمؤسسات والمهنيين. متجرنا في العلمة، ولاية سطيف، والتوصيل إلى 58 ولاية.",
};

const SHORTCUTS = [
  {
    href: "/compatibility",
    icon: Search,
    title: "دليل التوافق",
    text: "اعرفوا المستلزم المناسب لطابعتكم بالبحث بالطراز أو بكود الخرطوشة.",
    cta: "ابحث عن طابعتك",
  },
  {
    href: "/find-us",
    icon: MapPin,
    title: "نقاط البيع",
    text: "أقرب نقطة بيع معتمدة إليكم، مع أرقامها وموقعها على الخريطة.",
    cta: "اعثر على أقرب نقطة",
  },
  {
    href: "/quality",
    icon: ShieldCheck,
    title: "الجودة",
    text: "مراحل الفحص التي تمر بها كل عبوة قبل أن تصل إليكم، وشهاداتنا.",
    cta: "اكتشف مراحل الجودة",
  },
];

export default async function ContactPage() {
  const { phones } = await getSiteSettings();

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HEADER */}
      <ContactHero />

      {/* 2. FORM */}
      <section id="contact-form" className="scroll-mt-20 bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="min-h-[640px]" />}>
            <ContactSection />
          </Suspense>
        </div>
      </section>

      {/* 3. SHORTCUTS */}
      <section className="bg-brand-mist py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl md:mb-10">
            <p className="ri-eyebrow mb-4">قبل أن تراسلونا</p>
            <h2 className="ri-h2">ربما تجدون الجواب هنا</h2>
          </div>
          <div className="grid grid-cols-1 gap-px border border-brand-line bg-brand-line md:grid-cols-3">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group relative flex flex-col bg-white p-6 transition-colors hover:bg-white sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-brand-red transition-transform duration-300 group-hover:scale-x-100"
                />
                <span className="flex h-12 w-12 items-center justify-center bg-brand-black text-white transition-colors group-hover:bg-brand-red">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-brand-black">{s.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-7 text-brand-gray">{s.text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-red">
                  {s.cta}
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VISIT */}
      <section id="visit" className="scroll-mt-20 bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <StoreVisit />
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="bg-brand-mist py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="ri-eyebrow mb-4">الأسئلة الشائعة</p>
              <h2 className="ri-h2">أسئلة تصلنا كثيراً</h2>
              <p className="ri-lead mt-3">لم تجدوا سؤالكم؟ فريقنا يجيبكم مباشرة.</p>
              <a
                href={telHref(phones[0])}
                className="ri-btn ri-btn-black mt-6"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span dir="ltr" className="tabular-nums">
                  {phones[0]}
                </span>
              </a>
            </div>
            <ContactFaq />
          </div>
        </div>
      </section>
    </div>
  );
}
