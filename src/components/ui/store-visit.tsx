"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpLeft, Mail, MapPin, Phone } from "lucide-react";
import { BlockReveal } from "@/components/ui/block-reveal";

/* ══════════════════════════════════════════════════════════════════════
   STORE VISIT — "visit us" block for the El Eulma store

   The shop front (the logo in real life: black ROYAL, red INK) beside the
   address, phones and a link to directions.
   ══════════════════════════════════════════════════════════════════════ */

const ADDRESS = "دبي، العلمة 19001 — ولاية سطيف";
const PHONES = ["+213 666 50 99 41", "+213 550 89 94 84"];
const EMAIL = "royalinkdz@gmail.com";
/** Directions — a search until the store's exact Google Maps pin is added */
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Royal Ink, Dubai, El Eulma, Sétif, Algeria");

export function StoreVisit() {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="ri-eyebrow mb-4">زورونا</p>
        <h2 className="ri-h2">متجرنا في العلمة</h2>
        <p className="ri-lead mt-4">
          مرحباً بكم في متجرنا الرئيسي بمدينة العلمة، ولاية سطيف. تجدون فيه
          تشكيلة <span dir="ltr">ROYALiNK</span> من مستلزمات الطباعة، إلى جانب
          طابعات وأجهزة من علامات عالمية، وفريقاً يساعدكم على اختيار المستلزم
          المناسب لطابعتكم.
        </p>

        <dl className="mt-7 border-t border-brand-line">
          <div className="flex items-start gap-4 border-b border-brand-line py-4">
            <dt className="flex w-32 shrink-0 items-center gap-2.5 text-sm text-brand-gray">
              <MapPin className="h-4 w-4 text-brand-red" aria-hidden="true" />
              العنوان
            </dt>
            <dd className="text-sm font-extrabold leading-6 text-brand-black">{ADDRESS}</dd>
          </div>
          <div className="flex items-start gap-4 border-b border-brand-line py-4">
            <dt className="flex w-32 shrink-0 items-center gap-2.5 text-sm text-brand-gray">
              <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
              الهاتف
            </dt>
            <dd className="flex flex-col gap-1.5">
              {PHONES.map((p) => (
                <a
                  key={p}
                  href={`tel:${p.replace(/\s/g, "")}`}
                  dir="ltr"
                  className="text-right text-sm font-extrabold tabular-nums text-brand-black transition-colors hover:text-brand-red"
                >
                  {p}
                </a>
              ))}
            </dd>
          </div>
          <div className="flex items-start gap-4 border-b border-brand-line py-4">
            <dt className="flex w-32 shrink-0 items-center gap-2.5 text-sm text-brand-gray">
              <Mail className="h-4 w-4 text-brand-red" aria-hidden="true" />
              البريد
            </dt>
            <dd>
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm font-extrabold text-brand-black transition-colors hover:text-brand-red"
              >
                {EMAIL}
              </a>
            </dd>
          </div>
        </dl>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ri-btn ri-btn-red mt-7"
        >
          <span>الاتجاهات على الخريطة</span>
          <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
        </a>
      </motion.div>

      {/* The shop front — above the details on phones */}
      <div className="ri-crop order-first lg:order-none">
        <BlockReveal className="aspect-[1470/1070] bg-brand-black">
          <Image
            src="/images/store-el-eulma.jpg"
            alt="واجهة متجر روايال إنك في العلمة: لافتة ROYAL بالأسود وINK بالأحمر، وواجهة زجاجية تعرض الطابعات والمستلزمات"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </BlockReveal>
      </div>
    </div>
  );
}

export default StoreVisit;
