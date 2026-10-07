"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ChevronLeft, Mail, MapPin, Phone } from "lucide-react";
import { BlockReveal } from "@/components/ui/block-reveal";
import { useSiteSettings } from "@/components/site-settings-provider";
import { telHref } from "@/types/site-settings";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT HERO — the label again: a black block (title, the two ways to
   start, a few facts) with the product photo framed across a red block,
   over a red strip carrying the three direct channels.
   ══════════════════════════════════════════════════════════════════════ */

export function ContactHero() {
  // Phones, email, address, photo and facts come from the admin settings
  const { phones, email, address, contactHeroImage, contactFacts } = useSiteSettings();

  return (
    <section className="relative isolate overflow-hidden bg-brand-black text-white">
      {/* The red block behind the photo — the end-side column on desktop */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 -z-10 hidden w-[34%] bg-brand-red lg:block"
      />
      {/* Print raster on the black block, fading towards the photo */}
      <div
        aria-hidden="true"
        className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_left,#000,transparent_60%)]"
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 pb-12 pt-10 md:pt-14 lg:min-h-[560px] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14 lg:py-16">
          {/* ── Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <nav aria-label="مسار الصفحة" className="mb-6 flex items-center gap-2 text-sm text-white/55 sm:mb-8">
              <Link href="/" className="transition-colors hover:text-white">
                الرئيسية
              </Link>
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-bold text-white">اتصل بنا</span>
            </nav>

            <p className="ri-eyebrow ri-eyebrow-light mb-4 sm:mb-5">تواصل معنا</p>
            <h1 className="text-balance text-[2rem] font-extrabold leading-[1.25] sm:text-[2.5rem] lg:text-[3.25rem]">
              لنتحدث عن احتياجاتك من الطباعة
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75 md:text-lg md:leading-9">
              فريقنا جاهز للإجابة عن استفساراتكم وتقديم الدعم المناسب، أينما كنتم في الجزائر. اتصلوا بنا
              مباشرة، أو أرسلوا رسالتكم وسنعود إليكم.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact-form" className="ri-btn ri-btn-red">
                <span>أرسل رسالة</span>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={telHref(phones[0])} className="ri-btn ri-btn-outline-light">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>اتصل الآن</span>
              </a>
            </div>

            {contactFacts.length > 0 && (
              <ul className="mt-8 flex flex-col gap-2.5 border-t border-white/10 pt-6 text-sm text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-7">
                {contactFacts.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 bg-brand-red" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* ── The product, framed by crop marks across the seam ── */}
          <div className="ri-crop ri-crop-light">
            <BlockReveal
              immediate
              delay={0.15}
              className="relative aspect-[6/5] overflow-hidden bg-white shadow-[0_28px_60px_-24px_rgba(0,0,0,0.6)]"
            >
              <Image
                src={contactHeroImage.url}
                alt="منتجات ROYALiNK"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-top"
              />
              {/* The store, on a solid tag (never text straight on the photo) */}
              <a
                href="#visit"
                className="group absolute bottom-0 start-0 z-[2] flex items-center gap-3 bg-brand-black px-4 py-3 text-white transition-colors hover:bg-brand-red sm:px-5"
              >
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-sm font-bold">متجرنا في العلمة</span>
                <ChevronLeft className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
              </a>
            </BlockReveal>
          </div>
        </div>
      </div>

      {/* ── Red strip: the direct channels ── */}
      <div className="bg-brand-red">
        <div className="container mx-auto px-4">
          <motion.dl
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-x-reverse"
          >
            <Channel icon={<Phone className="h-5 w-5" />} label="اتصلوا بنا">
              <span className="flex flex-col gap-1">
                {phones.map((p) => (
                  <a key={p} href={telHref(p)} dir="ltr" className="text-right tabular-nums hover:underline">
                    {p}
                  </a>
                ))}
              </span>
            </Channel>
            <Channel icon={<Mail className="h-5 w-5" />} label="راسلونا">
              <a href={`mailto:${email}`} className="break-all hover:underline">
                {email}
              </a>
            </Channel>
            <Channel icon={<MapPin className="h-5 w-5" />} label="زورونا">
              <a href="#visit" className="hover:underline">
                {address}
              </a>
            </Channel>
          </motion.dl>
        </div>
      </div>
    </section>
  );
}

function Channel({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-5 md:px-6 md:py-7 md:first:ps-0 md:last:pe-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-white/15" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-white/85">{label}</dt>
        <dd className="mt-1 text-[15px] font-extrabold leading-7">{children}</dd>
      </div>
    </div>
  );
}

export default ContactHero;
