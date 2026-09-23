"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, ArrowRight, Phone, Building2 } from "lucide-react";
import { AlgeriaMapInteractive } from "@/components/ui/algeria-map";
import { useDistributors } from "@/hooks/use-distributors";

/* ══════════════════════════════════════════════════════════════════════
   FIND US PAGE — /find-us
   
   Full-page store locator with interactive map and distributor info
   ══════════════════════════════════════════════════════════════════════ */

export default function FindUsPage() {
  const { distributors: liveDistributors, activeWilayaCodes } = useDistributors();
  const totalDistributors = liveDistributors.length;
  const totalWilayas = activeWilayaCodes.size;

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════
          HERO / PAGE HEADER
          ═══════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════
          HERO / PAGE HEADER — FULL-BLEED GRAND DISTRIBUTION MAP COVER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative isolate pt-0 md:pt-12 pb-12 md:pb-16 overflow-hidden min-h-[480px] md:min-h-[540px] lg:min-h-[600px] flex items-center">
        {/* Ambient subtle background gradients */}
        <div className="absolute inset-0 bg-gradient-to-bl from-muted/30 via-background to-background z-0 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ── Grand Background Map Cover Layer (Covers the whole hero area) ── */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          {/* Map Image: Fills and covers the hero area */}
          <img
            src="/images/algeria-distribution-cover.jpg"
            alt="شبكة توزيع منتجات روايال إنك مع سطيف المقر الرئيسي"
            className="w-full h-full object-cover object-[25%_center] lg:object-[20%_center] xl:object-[18%_center]"
            loading="eager"
          />

          {/* ── Desktop & Tablet Fade: Smoothly dissolves over the area that has texts (right side in RTL) ── */}
          <div
            className="hidden md:block absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, transparent 30%, hsl(var(--background) / 0.5) 44%, hsl(var(--background) / 0.92) 58%, hsl(var(--background)) 70%, hsl(var(--background)) 100%)",
            }}
          />

          {/* Bottom edge fade: seamless transition into next section */}
          <div className="hidden md:block absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          {/* Top edge fade on desktop */}
          <div className="hidden md:block absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none" />

          {/* ── Mobile Fade: Flush with header at top, dissolves downwards before texts ── */}
          <div
            className="block md:hidden absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 32%, hsl(var(--background) / 0.6) 48%, hsl(var(--background) / 0.95) 62%, hsl(var(--background)) 72%, hsl(var(--background)) 100%)",
            }}
          />
        </div>

        {/* ── Hero Text Content: Aligned inside website container on the right ── */}
        <div className="container mx-auto px-4 relative z-10 w-full py-6 md:py-12">
          <div className="pt-48 sm:pt-56 md:pt-0 max-w-xl lg:max-w-2xl">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <Link
                href="/"
                className="hover:text-primary transition-colors"
              >
                الرئيسية
              </Link>
              <ArrowRight className="w-3 h-3 rotate-180" />
              <span className="text-foreground font-semibold">
                نقاط البيع
              </span>
            </motion.div>

            {/* Section Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-primary bg-primary/10 rounded-full px-4 py-2 mb-5 backdrop-blur-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              أين تجدنا
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-5"
            >
              نقاط بيع{" "}
              <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">
                منتجاتنا
              </span>
            </motion.h1>

            {/* Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
            >
              منتجات روايال إنك متوفرة عبر شبكة من الموزعين ونقاط البيع المعتمدة
              في مختلف ولايات الوطن، انطلاقاً من مركزنا الرئيسي بولاية سطيف.
              اضغط على أي نقطة على الخريطة لعرض معلومات نقاط البيع في تلك المدينة.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-2"
            >
              {/* Stat 1: نقاط البيع */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-black text-foreground">
                    {totalDistributors}+
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    نقطة بيع معتمدة
                  </span>
                </div>
              </div>

              {/* Stat 2: الولايات */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-black text-foreground">
                    {totalWilayas}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    ولاية مغطاة
                  </span>
                </div>
              </div>

              {/* Stat 3: الدعم */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-black text-foreground">
                    24/7
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    دعم متواصل
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE MAP SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <AlgeriaMapInteractive distributors={liveDistributors} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BECOME A DISTRIBUTOR CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center rounded-3xl gradient-bg text-white p-10 md:p-16 relative overflow-hidden"
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
                هل ترغب في بيع منتجات روايال إنك؟
              </h2>
              <p className="text-white/80 mb-8 text-base md:text-lg max-w-xl mx-auto">
                انضم إلى شبكة موزعينا المعتمدين واستفد من منتجات عالية الجودة
                وأسعار تنافسية ودعم متواصل.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-white/90 transition-all shadow-lg text-sm hover:-translate-y-0.5"
              >
                تواصل معنا للشراكة
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
