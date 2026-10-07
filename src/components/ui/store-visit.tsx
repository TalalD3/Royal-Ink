"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpLeft, Clock, Mail, MapPin, Phone } from "lucide-react";
import { BlockReveal } from "@/components/ui/block-reveal";
import { useSiteSettings } from "@/components/site-settings-provider";
import { telHref } from "@/types/site-settings";

/* ══════════════════════════════════════════════════════════════════════
   STORE VISIT — "visit us" block for the El Eulma store

   The shop front (the logo in real life: black ROYAL, red INK) beside the
   address, phones and a link to directions. Every detail, the photo and
   the map link come from the admin settings.
   ══════════════════════════════════════════════════════════════════════ */

export function StoreVisit() {
  const { address, phones, email, hours, mapsUrl, storeImage } = useSiteSettings();

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
            <dd className="text-sm font-extrabold leading-6 text-brand-black">{address}</dd>
          </div>
          {hours && (
            <div className="flex items-start gap-4 border-b border-brand-line py-4">
              <dt className="flex w-32 shrink-0 items-center gap-2.5 text-sm text-brand-gray">
                <Clock className="h-4 w-4 text-brand-red" aria-hidden="true" />
                أوقات العمل
              </dt>
              <dd className="whitespace-pre-line text-sm font-extrabold leading-6 text-brand-black">{hours}</dd>
            </div>
          )}
          <div className="flex items-start gap-4 border-b border-brand-line py-4">
            <dt className="flex w-32 shrink-0 items-center gap-2.5 text-sm text-brand-gray">
              <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
              الهاتف
            </dt>
            <dd className="flex flex-col gap-1.5">
              {phones.map((p) => (
                <a
                  key={p}
                  href={telHref(p)}
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
                href={`mailto:${email}`}
                className="text-sm font-extrabold text-brand-black transition-colors hover:text-brand-red"
              >
                {email}
              </a>
            </dd>
          </div>
        </dl>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ri-btn ri-btn-red mt-7"
          >
            <span>الاتجاهات على الخريطة</span>
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </motion.div>

      {/* The shop front — above the details on phones */}
      <div className="ri-crop order-first lg:order-none">
        <BlockReveal className="relative aspect-[1470/1070] overflow-hidden bg-brand-black">
          <Image
            src={storeImage.url}
            alt="واجهة متجر روايال إنك في العلمة"
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
