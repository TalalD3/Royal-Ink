"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentItem {
  id: number;
  englishTitle: string;
  arabicTitle: string;
  slogan: string;
  sloganArabic: string;
  desc: string;
  features: string[];
  img: string;
  alt: string;
  shapeSide: "left" | "right";
  bgColor: string;
  textColor: string;
  subtextColor: string;
  pillStyle: string;
  cardGlow: string;
}

const SEGMENTS: SegmentItem[] = [
  {
    id: 1,
    englishTitle: "OFFICE",
    arabicTitle: "المؤسسات والشركات",
    slogan: "Perfect color",
    sloganArabic: "ألوان دقيقة واقتصاد إداري",
    desc: "خراطيش ليزر عالية السعة (High-Yield) تلبي أعباء المكاتب الكبرى، مع توفير حتى 60% وثبات فائق للتقارير والعقود الرسمية.",
    features: [
      "خراطيش High-Yield بسعة مضاعفة",
      "توفير يصل إلى 60% من التكلفة",
      "ثبات فائق للعقود والمستندات",
    ],
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    alt: "فريق عمل في مكتب اجتماعات حديث",
    shapeSide: "left",
    bgColor: "bg-[#DC2626]",
    textColor: "text-white",
    subtextColor: "text-white/90",
    pillStyle: "bg-white/15 text-white border-white/25",
    cardGlow: "md:hover:shadow-[0_22px_45px_-10px_rgba(220,38,38,0.35)]",
  },
  {
    id: 2,
    englishTitle: "SCHOOL",
    arabicTitle: "المؤسسات التعليمية",
    slogan: "Print as what you see",
    sloganArabic: "وضوح فائق يدعم التعليم",
    desc: "مساحيق طباعة معتمدة خالية من السموم (RoHS)، تتحمل أعباء طباعة الامتحانات والمذكرات بوضوح نصوص فائق وأسعار تفضيلية.",
    features: [
      "آمنة وصحية 100% للطلاب والأساتذة",
      "وضوح نصوص ورسومات للامتحانات",
      "أسعار خاصة تدعم التعليم",
    ],
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
    alt: "تلاميذ وأطفال في مدرسة يتعلمون بابتسامة",
    shapeSide: "right",
    bgColor: "bg-[#0284C7]",
    textColor: "text-white",
    subtextColor: "text-white/90",
    pillStyle: "bg-white/15 text-white border-white/25",
    cardGlow: "md:hover:shadow-[0_22px_45px_-10px_rgba(2,132,199,0.35)]",
  },
  {
    id: 3,
    englishTitle: "HOME",
    arabicTitle: "الاستخدام المنزلي",
    slogan: "Perfect color",
    sloganArabic: "ألوان زاهية وراحة في كل بيت",
    desc: "خراطيش اقتصادية سهلة التركيب الذاتي دون أي تلطيخ، تمنحك جودة المختبر لطباعة صور العائلة والواجبات المدرسية بأقل تكلفة.",
    features: [
      "تركيب سهل دون أي تلطيخ للحبر",
      "توافق تام مع مختلف الطابعات",
      "ألوان زاهية وتكلفة موفرة",
    ],
    img: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1600&q=80",
    alt: "مكتب منزلي مريح وعصري مع حاسوب وكتب",
    shapeSide: "left",
    bgColor: "bg-[#FACC15]",
    textColor: "text-neutral-950",
    subtextColor: "text-neutral-850",
    pillStyle: "bg-black/10 text-neutral-950 border-black/15 font-semibold",
    cardGlow: "md:hover:shadow-[0_22px_45px_-10px_rgba(250,204,21,0.35)]",
  },
  {
    id: 4,
    englishTitle: "GOVERNMENT",
    arabicTitle: "الهيئات الحكومية والمطابع",
    slogan: "Print as what you see",
    sloganArabic: "معايير سيادية للصفقات الكبرى",
    desc: "خراطيش حبر ليزر معتمدة دولياً ومطابقة لدفاتر الشروط والصفقات العمومية بمعايير ISO & STMC، مع ضمان استمرارية التوريد الرسمي.",
    features: [
      "شهادات معتمدة (ISO & STMC)",
      "جاهزية لدفاتر الشروط والصفقات",
      "ضمان رسمي وفواتير معتمدة",
    ],
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    alt: "مبنى إدارة ومكاتب حكومية ضخمة وواسعة",
    shapeSide: "right",
    bgColor: "bg-[#16A34A]",
    textColor: "text-white",
    subtextColor: "text-white/90",
    pillStyle: "bg-white/15 text-white border-white/25",
    cardGlow: "md:hover:shadow-[0_22px_45px_-10px_rgba(22,163,74,0.35)]",
  },
];

export function ClientSegments() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const toggleSegment = (id: number) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      onClick={() => setActiveId(null)}
      className="py-20 md:py-28 bg-background relative overflow-hidden"
    >
      {/* Ambient soft glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red/50" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-red bg-red/10 px-4 py-1.5 rounded-full border border-red/20 shadow-xs">
              القطاعات المستهدفة
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight"
          >
            نخدم مختلف القطاعات بحلول مخصصة
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            من كبرى الإدارات والمؤسسات الحكومية إلى الاستخدام المنزلي اليومي —
            اضغط على أي قطاع لاكتشاف مزاياه الخاصة.
          </motion.p>
        </div>

        {/* Diagonal Strips Stack Layout */}
        <div className="space-y-4 md:space-y-5">
          {SEGMENTS.map((seg, idx) => {
            const isLeft = seg.shapeSide === "left";
            const isExpanded = activeId === seg.id;

            return (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                {/* Non-navigating interactive card container */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSegment(seg.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSegment(seg.id);
                    }
                  }}
                  className={cn(
                    "group relative block w-full rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-neutral-200/80 dark:border-neutral-800/80 shadow-md transition-all duration-500 select-none",
                    // Mobile: comfortable constant height to prevent page jumps; Desktop: responsive heights
                    "h-[310px] sm:h-[320px] md:h-[280px] lg:h-[300px]",
                    seg.cardGlow
                  )}
                >
                  {/* 1. Full Background Photo */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={seg.img}
                      alt={seg.alt}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-700 ease-out md:group-hover:scale-105",
                        isExpanded && "scale-105"
                      )}
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-neutral-950/20 dark:bg-neutral-950/40" />
                  </div>

                  {/* 2. Diagonal Colored Shape Overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 z-10",
                      isLeft ? "segment-shape-left" : "segment-shape-right",
                      seg.bgColor,
                      isExpanded && "is-expanded"
                    )}
                  />

                  {/* 3. Text Layer */}
                  <div
                    className={cn(
                      "absolute z-20 flex flex-col transition-all duration-500 text-right",
                      // Mobile: at idle, sits in lower half (bottom-0); when clicked, expands to cover whole card (inset-0 justify-center)
                      isExpanded
                        ? "inset-0 w-full justify-center p-6 sm:p-7"
                        : "bottom-0 left-0 right-0 w-full justify-end p-4 sm:p-5",
                      // Desktop: side-anchored with fixed 44% width inside the colored shape
                      isLeft
                        ? "md:inset-y-0 md:left-0 md:right-auto md:w-[44%] lg:w-[44%] md:justify-center md:p-8 lg:p-10"
                        : "md:inset-y-0 md:right-0 md:left-auto md:w-[44%] lg:w-[44%] md:justify-center md:p-8 lg:p-10",
                      seg.textColor
                    )}
                  >
                    {/* Top Header: English Hero Word & Arabic Name */}
                    <div className="mb-1">
                      <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-1">
                        <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none drop-shadow-xs">
                          {seg.englishTitle}
                        </h3>
                        <span className="text-base sm:text-lg md:text-xl font-bold opacity-95">
                          {seg.arabicTitle}
                        </span>
                      </div>

                      <p
                        className={cn(
                          "text-[11px] sm:text-xs font-bold tracking-wider uppercase",
                          seg.subtextColor
                        )}
                      >
                        <span>{seg.slogan}</span>
                        <span className="mx-1.5 opacity-60">•</span>
                        <span>{seg.sloganArabic}</span>
                      </p>
                    </div>

                    {/* Description:
                        - Mobile: revealed with smooth transition when card is expanded
                        - Desktop: always displayed comfortably inside the side column
                    */}
                    <div
                      className={cn(
                        "transition-all duration-500 ease-out overflow-hidden",
                        isExpanded
                          ? "max-h-48 opacity-100 mt-2 mb-2"
                          : "max-h-0 opacity-0 md:max-h-none md:opacity-100 md:mt-2 md:mb-1"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs sm:text-sm leading-relaxed font-medium",
                          seg.subtextColor
                        )}
                      >
                        {seg.desc}
                      </p>
                    </div>

                    {/* Feature Badges:
                        - Mobile: revealed on click along with description
                        - Desktop: revealed on hover or click
                    */}
                    <div
                      className={cn(
                        "flex flex-wrap gap-1.5 sm:gap-2 transition-all duration-500 ease-out overflow-hidden",
                        isExpanded
                          ? "max-h-36 opacity-100 translate-y-0 pt-1 pb-1"
                          : "max-h-0 opacity-0 -translate-y-2 md:group-hover:max-h-36 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pt-1.5"
                      )}
                    >
                      {seg.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className={cn(
                            "text-[10.5px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full border flex items-center gap-1.5 font-medium shadow-2xs whitespace-nowrap",
                            seg.pillStyle
                          )}
                        >
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Tap/Click toggle cue (mobile only) */}
                    <div className="pt-2 md:hidden">
                      <span
                        className={cn(
                          "text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 transition-all shadow-2xs",
                          isExpanded
                            ? "bg-black/20 text-white border border-white/20"
                            : "bg-black/10 dark:bg-black/25 border border-black/10",
                          seg.textColor
                        )}
                      >
                        {isExpanded ? (
                          <>
                            <span>انقر للعودة</span>
                            <span className="text-xs">▴</span>
                          </>
                        ) : (
                          <>
                            <span>انقر للتفاصيل</span>
                            <span className="text-xs">▾</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
