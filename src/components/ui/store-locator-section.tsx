"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AlgeriaMapPreview } from "@/components/ui/algeria-map";

/* ══════════════════════════════════════════════════════════════════════
   STORE LOCATOR SECTION — Home Page

   Desktop: copy and key figures beside a live preview map of Algeria.
   Phones:  the map and the figures are gathered into one black card.
   ══════════════════════════════════════════════════════════════════════ */

const FIGURES = [
  { value: "58", label: "ولاية تغطيها شبكتنا", short: "ولاية" },
  { value: "+16", label: "سنة خبرة في الطباعة", short: "سنة خبرة" },
  { value: "10", label: "شهادات واعتمادات دولية", short: "شهادات دولية" },
];

export function StoreLocatorSection() {
  return (
    <section className="overflow-hidden bg-brand-mist py-16 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="ri-eyebrow mb-4">شبكتنا الوطنية</p>
            <h2 className="ri-h2">اعثر على منتجاتنا في مدينتك</h2>
            <p className="ri-lead mt-4 max-w-lg lg:mt-5">
              شبكة توزيع واسعة تغطي أهم ولايات الوطن — ابحث عن أقرب نقطة بيع
              إليك.
            </p>

            {/* Figures — desktop */}
            <dl className="mt-10 hidden grid-cols-3 border-t border-brand-black/15 lg:grid">
              {FIGURES.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex flex-col-reverse justify-end gap-3 pt-6 ${
                    i > 0 ? "border-s border-brand-black/15 ps-6" : ""
                  } ${i < FIGURES.length - 1 ? "pe-6" : ""}`}
                >
                  <dt className="text-sm leading-6 text-brand-gray">{f.label}</dt>
                  <dd
                    dir="ltr"
                    className="text-end text-5xl font-extrabold leading-none text-brand-black"
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href="/find-us"
              className="ri-btn ri-btn-red mt-10 hidden lg:inline-flex"
            >
              <span>اكتشف نقاط بيع منتجاتنا</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Map preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
          >
            {/* On phones this wrapper is a black card and the map switches to
                lighter greys so the country reads against it */}
            <div className="overflow-hidden bg-brand-black [--map-base:#30302D] [--map-dist:#5A5A55] [--map-dist-hover:#77776F] [--map-hover:#3F3F3B] lg:overflow-visible lg:bg-transparent lg:[--map-base:#1D1D1B] lg:[--map-dist:#4A4A46] lg:[--map-dist-hover:#6B6B66] lg:[--map-hover:#34342F]">
              <div className="px-2 pt-5 lg:p-0">
                <AlgeriaMapPreview />
              </div>

              {/* Figures — phones, inside the card */}
              <dl className="grid grid-cols-3 border-t border-white/15 lg:hidden">
                {FIGURES.map((f, i) => (
                  <div
                    key={f.label}
                    className={`flex flex-col-reverse items-center gap-2 px-2 py-5 text-center ${
                      i > 0 ? "border-s border-white/15" : ""
                    }`}
                  >
                    <dt className="text-xs font-medium text-white/65">
                      {f.short}
                    </dt>
                    <dd
                      dir="ltr"
                      className="text-[1.75rem] font-extrabold leading-none text-white"
                    >
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Link
              href="/find-us"
              className="ri-btn ri-btn-red mt-5 w-full lg:hidden"
            >
              <span>اكتشف نقاط بيع منتجاتنا</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
