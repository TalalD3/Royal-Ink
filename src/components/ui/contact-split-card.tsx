"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/components/site-settings-provider";
import { telHref } from "@/types/site-settings";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT SPLIT CARD — closing block for the inner pages
   A red block (message + button) beside a black block (direct contacts).
   ══════════════════════════════════════════════════════════════════════ */

export function ContactSplitCard({
  eyebrow,
  title,
  text,
  cta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: React.ReactNode;
  cta: { href: string; label: string };
}) {
  const { phones, email } = useSiteSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="ri-crop grid grid-cols-1 text-white lg:grid-cols-[minmax(0,64fr)_minmax(0,36fr)]"
    >
      {/* Message, on red */}
      <div className="bg-brand-red p-6 sm:p-8 lg:p-10">
        <p className="ri-eyebrow ri-eyebrow-onred mb-3">{eyebrow}</p>
        <h2 className="text-[1.375rem] font-extrabold leading-snug sm:text-[1.75rem] lg:text-[2rem]">
          {title}
        </h2>
        <p className="mt-2.5 max-w-xl text-sm font-medium leading-7 sm:text-base">
          {text}
        </p>
        <Link href={cta.href} className="ri-btn ri-btn-white mt-5 h-11 px-6 text-sm">
          <span>{cta.label}</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Direct contacts, on black */}
      <div className="flex flex-col justify-center bg-brand-black p-6 sm:p-8 lg:p-10">
        <p className="text-[13px] font-bold text-white/60">أو اتصل بنا مباشرة</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {phones.map((phone) => (
            <a
              key={phone}
              href={telHref(phone)}
              className="inline-flex h-10 items-center gap-2 bg-white/10 px-4 text-sm font-bold transition-colors hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr" className="tabular-nums">
                {phone}
              </span>
            </a>
          ))}
        </div>
        <a
          href={`mailto:${email}`}
          className="mt-4 inline-flex items-center gap-2.5 text-[13px] text-white/70 transition-colors hover:text-white"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>{email}</span>
        </a>
      </div>
    </motion.div>
  );
}

export default ContactSplitCard;
