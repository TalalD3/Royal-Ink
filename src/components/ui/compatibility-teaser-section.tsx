"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function CompatibilityTeaserSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background border-y border-border/50">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-rose-500/5 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10" dir="rtl">
        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-card/90 dark:bg-card/70 border border-primary/25 shadow-2xl shadow-primary/10 backdrop-blur-md p-6 sm:p-10 md:p-14 overflow-hidden"
        >
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-primary" />

          {/* Grid Layout: Header & CTA on Right/Top, Value Highlights on Left */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Right Side: Headline, Descriptions, Key Benefits & Gateway Button */}
            <div className="lg:col-span-7 space-y-6 text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>دليل التوافق الذكي — Royal Ink</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-[1.3] tracking-tight">
                هل تبحث عن الحبر{" "}
                <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">
                  المتوافق تماماً
                </span>{" "}
                مع طابعتك؟
              </h2>

              {/* Descriptions & Attractive Text */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                لا داعي للقلق بشأن اختيار خرطوشة غير مطابقة! لقد صممنا لك دليلاً شاملاً وسهل الاستخدام يتيح لك معرفة المستلزمات المتوافقة بنسبة 100% والمضمونة بجودة أصلية لحماية طابعتك وضمان أفضل نتائج الطباعة.
              </p>

              {/* Feature Check Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium bg-muted/40 p-3 rounded-xl border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>تغطية لأشهر الماركات (HP, Canon, Epson, Brother)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium bg-muted/40 p-3 rounded-xl border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>فحص بالاتجاهين: بالطابعة أو برمز الخرطوشة</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium bg-muted/40 p-3 rounded-xl border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>خراطيش معتمدة لحماية رؤوس وأجزاء الطابعة</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium bg-muted/40 p-3 rounded-xl border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>توصيل سريع ومضمون إلى كافة الـ 58 ولاية</span>
                </div>
              </div>

              {/* The Call-To-Action Button leading to the page */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/compatibility"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-primary text-white text-sm sm:text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-center cursor-pointer"
                >
                  <span>دخول دليل التوافق الشامل</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <span className="text-xs text-muted-foreground text-center sm:text-right">
                  قاعدة بيانات محدثة وشاملة لجميع الموديلات
                </span>
              </div>
            </div>

            {/* Left Side: Visual Value Cards */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* Card 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/70 flex items-start gap-4 hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    دليل ذكي بالاتجاهين
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ابحث بموديل الطابعة لمعرفة حبرها، أو ابحث برمز الحبر لمعرفة جميع الطابعات التي تدعمه بدقة متناهية.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/70 flex items-start gap-4 hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    توافق مضمون وحماية للطابعة
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    خراطيش تونر وأحبار سائلة مصنعة بمقاييس دقيقة تضمن أعلى جودة طباعة وتحافظ على سلامة جهازك.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/70 flex items-start gap-4 hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    طلب مباشر وتوصيل سريع
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    إمكانية طلب الحبر المتوافق فوراً مع تأكيد سريع عبر واتساب والتوصيل حتى باب منزلك أو مكتبك.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Metric Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                    <Printer className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    أكثر من 500+ طابعة وخرطوشة مسجلة
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  متوافق 100%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
