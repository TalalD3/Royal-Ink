"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Printer, ArrowDown, Check, ChevronLeft } from "lucide-react";

export function CompatibilityTeaserSection() {
  return (
    <section className="w-full bg-[var(--paper)] py-14 lg:py-20 border-y border-[var(--line)]">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center"
        >
          {/* Right column (text block in RTL) */}
          <div className="flex flex-col items-start text-right">
            {/* Eyebrow */}
            <span className="text-sm font-bold text-[var(--red)] mb-3 inline-block">
              دليل التوافق
            </span>

            {/* Heading — one weight, one color */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] leading-tight mb-4">
              ابحث عن الحبر المتوافق تماماً مع طابعتك
            </h2>

            {/* Supporting sentence */}
            <p className="text-base md:text-lg text-[var(--gray)] max-w-[460px] leading-relaxed mb-8">
              أدخل موديل طابعتك أو رمز الخرطوشة، واحصل فوراً على المنتج المتوافق المضمون من روايال إنك — بلا حيرة، وبلا خطأ في الاختيار.
            </p>

            {/* CTA Button */}
            <Link
              href="/compatibility"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--red)] hover:bg-[var(--red-dark)] text-white text-base font-bold transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>افتح دليل التوافق الكامل</span>
            </Link>

            {/* Muted caption setting expectations */}
            <p className="text-xs text-[var(--gray)] mt-2">
              معاينة فقط — البحث الفعلي متاح داخل صفحة دليل التوافق.
            </p>
          </div>

          {/* Left column (illustrative preview graphic in RTL) */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none bg-white border border-[var(--line)] rounded-2xl p-6 max-w-md w-full mx-auto lg:mr-auto lg:ml-0"
          >
            {/* Preview pill */}
            <div className="flex items-center justify-start mb-4">
              <span className="px-2.5 py-1 rounded-full bg-[var(--ink)] text-white text-[11px] font-medium leading-none tracking-wide">
                معاينة
              </span>
            </div>

            {/* Static simulated input row */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
              <Printer className="w-5 h-5 text-[var(--gray)] shrink-0" />
              <span className="text-sm text-[var(--gray)]">
                مثال: HP LaserJet M404
              </span>
            </div>

            {/* Static down arrow */}
            <div className="flex justify-center py-2.5">
              <ArrowDown className="w-4 h-4 text-[var(--gray)]" />
            </div>

            {/* Result row */}
            <div className="bg-[#FBF3F2] border border-[#E6D3D1] rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--red)] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-[var(--ink)] leading-snug">
                  خرطوشة متوافقة — 58A
                </span>
                <span className="text-xs text-[var(--gray)] mt-0.5">
                  ضمن كتالوج روايال إنك
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
