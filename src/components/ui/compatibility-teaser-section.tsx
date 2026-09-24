"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Printer, ArrowDown, Check, ChevronLeft, Search } from "lucide-react";

export function CompatibilityTeaserSection() {
  return (
    <section className="w-full gradient-bg py-16 lg:py-24 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10" dir="rtl">
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
            <span className="text-sm font-bold text-white/90 mb-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 backdrop-blur-sm">
              <Search className="w-3.5 h-3.5" />
              دليل التوافق
            </span>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
              ابحث عن الحبر المتوافق
              <br />
              تماماً مع طابعتك
            </h2>

            {/* Supporting sentence */}
            <p className="text-base md:text-lg text-white/80 max-w-[460px] leading-relaxed mb-8">
              أدخل موديل طابعتك أو رمز الخرطوشة، واحصل فوراً على المنتج المتوافق المضمون من روايال إنك — بلا حيرة، وبلا خطأ في الاختيار.
            </p>

            {/* CTA Button */}
            <Link
              href="/compatibility"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-white/90 text-primary text-base font-bold transition-all shadow-lg hover:-translate-y-0.5"
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>افتح دليل التوافق الكامل</span>
            </Link>
          </div>

          {/* Left column (illustrative preview graphic in RTL) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            aria-hidden="true"
            className="pointer-events-none select-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-md w-full mx-auto lg:mr-auto lg:ml-0"
          >
            {/* Preview pill */}
            <div className="flex items-center justify-start mb-4">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-medium leading-none tracking-wide">
                معاينة
              </span>
            </div>

            {/* Static simulated input row */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20">
              <Printer className="w-5 h-5 text-white/60 shrink-0" />
              <span className="text-sm text-white/60">
                مثال: HP LaserJet M404
              </span>
            </div>

            {/* Static down arrow */}
            <div className="flex justify-center py-2.5">
              <ArrowDown className="w-4 h-4 text-white/50" />
            </div>

            {/* Result row */}
            <div className="bg-white/15 border border-white/20 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-white leading-snug">
                  خرطوشة متوافقة — 58A
                </span>
                <span className="text-xs text-white/70 mt-0.5">
                  ضمن كتالوج روايال إنك
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

