"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentItem {
  id: number;
  englishTitle: string;
  arabicTitle: string;
  sloganArabic: string;
  desc: string;
  features: string[];
  img: string;
  alt: string;
}

const SEGMENTS: SegmentItem[] = [
  {
    id: 1,
    englishTitle: "OFFICE",
    arabicTitle: "المؤسسات والشركات",
    sloganArabic: "ألوان دقيقة واقتصاد إداري",
    desc: "خراطيش ليزر عالية السعة (High-Yield) تلبي أعباء المكاتب الكبرى، مع توفير حتى 60% وثبات فائق للتقارير والعقود الرسمية.",
    features: [
      "خراطيش High-Yield بسعة مضاعفة",
      "توفير يصل إلى 60% من التكلفة",
      "ثبات فائق للعقود والمستندات",
    ],
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    alt: "فريق عمل في مكتب اجتماعات حديث",
  },
  {
    id: 2,
    englishTitle: "SCHOOL",
    arabicTitle: "المؤسسات التعليمية",
    sloganArabic: "وضوح فائق يدعم التعليم",
    desc: "مساحيق طباعة معتمدة خالية من السموم (RoHS)، تتحمل أعباء طباعة الامتحانات والمذكرات بوضوح نصوص فائق وأسعار تفضيلية.",
    features: [
      "آمنة وصحية 100% للطلاب والأساتذة",
      "وضوح نصوص ورسومات للامتحانات",
      "أسعار خاصة تدعم التعليم",
    ],
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
    alt: "تلاميذ وأطفال في مدرسة يتعلمون بابتسامة",
  },
  {
    id: 3,
    englishTitle: "HOME",
    arabicTitle: "الاستخدام المنزلي",
    sloganArabic: "ألوان زاهية وراحة في كل بيت",
    desc: "خراطيش اقتصادية سهلة التركيب الذاتي دون أي تلطيخ، تمنحك جودة المختبر لطباعة صور العائلة والواجبات المدرسية بأقل تكلفة.",
    features: [
      "تركيب سهل دون أي تلطيخ للحبر",
      "توافق تام مع مختلف الطابعات",
      "ألوان زاهية وتكلفة موفرة",
    ],
    img: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1600&q=80",
    alt: "مكتب منزلي مريح وعصري مع حاسوب وكتب",
  },
  {
    id: 4,
    englishTitle: "GOVERNMENT",
    arabicTitle: "الهيئات الحكومية والمطابع",
    sloganArabic: "معايير سيادية للصفقات الكبرى",
    desc: "خراطيش حبر ليزر معتمدة دولياً ومطابقة لدفاتر الشروط والصفقات العمومية بمعايير ISO & STMC، مع ضمان استمرارية التوريد الرسمي.",
    features: [
      "شهادات معتمدة (ISO & STMC)",
      "جاهزية لدفاتر الشروط والصفقات",
      "ضمان رسمي وفواتير معتمدة",
    ],
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    alt: "مبنى إدارة ومكاتب حكومية ضخمة وواسعة",
  },
];

/* Four sector panels on the black block. One is always open; the others
   stay as slim panels. Hover or focus opens on desktop, tap on phones. */
export function ClientSegments() {
  const [activeId, setActiveId] = useState<number>(SEGMENTS[0].id);

  return (
    <section className="overflow-hidden bg-brand-black py-20 text-white md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 flex flex-col gap-5 md:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
        >
          <div className="max-w-2xl">
            <p className="ri-eyebrow ri-eyebrow-light mb-4">القطاعات المستهدفة</p>
            <h2 className="ri-h2 text-white">نخدم مختلف القطاعات بحلول مخصصة</h2>
          </div>
          <p className="max-w-md text-base leading-8 text-white/70 md:text-[17px]">
            من كبرى الإدارات والمؤسسات الحكومية إلى الاستخدام المنزلي اليومي —
            اختر أي قطاع لاكتشاف مزاياه الخاصة.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
          className="ri-crop ri-crop-light flex flex-col gap-3 md:h-[480px] md:flex-row"
        >
          {SEGMENTS.map((seg, idx) => {
            const isActive = activeId === seg.id;

            return (
              <div
                key={seg.id}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                onMouseEnter={() => setActiveId(seg.id)}
                onFocus={() => setActiveId(seg.id)}
                onClick={() => setActiveId(seg.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId(seg.id);
                  }
                }}
                className={cn(
                  "group relative cursor-pointer overflow-hidden bg-[#242422]",
                  "transition-[flex-grow,height] duration-500 ease-out motion-reduce:transition-none",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  "md:h-auto md:min-w-0 md:basis-0",
                  isActive ? "h-[420px] md:grow-[2.6]" : "h-[84px] md:grow"
                )}
              >
                {/* Photo */}
                <Image
                  src={seg.img}
                  alt={seg.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={idx === 0}
                  className={cn(
                    "object-cover transition-[filter,transform] duration-700 ease-out",
                    isActive ? "scale-100" : "scale-105 brightness-[0.6] grayscale"
                  )}
                />


                {/* Active marker */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 origin-right bg-brand-red transition-transform duration-500 ease-out",
                    isActive ? "scale-x-100" : "scale-x-0"
                  )}
                />

                {/* Copy — on a solid panel that only fades out above the
                    text, so the words never sit on raw photo */}
                <div className="ri-segment-copy absolute inset-x-0 bottom-0 flex flex-col p-5 pt-20 md:p-7 md:pt-24">
                  <span
                    dir="ltr"
                    className={cn(
                      "self-start text-[11px] font-bold uppercase tracking-[0.22em] text-white/60",
                      !isActive && "hidden md:block"
                    )}
                  >
                    {seg.englishTitle}
                  </span>
                  <h3
                    className={cn(
                      "font-extrabold leading-snug text-white md:mt-2",
                      isActive ? "mt-2 text-2xl md:text-[1.75rem]" : "text-lg"
                    )}
                  >
                    {seg.arabicTitle}
                  </h3>

                  {/* Details — revealed for the open panel */}
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
                      isActive
                        ? "grid-rows-[1fr] opacity-100 delay-200"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-2 text-sm font-bold text-white/70">
                        {seg.sloganArabic}
                      </p>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 md:text-[15px]">
                        {seg.desc}
                      </p>
                      <ul className="mt-4 flex flex-col gap-2 border-t border-white/15 pt-4 lg:flex-row lg:flex-wrap lg:gap-x-6">
                        {seg.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-center gap-2 text-[13px] font-medium text-white"
                          >
                            <Check
                              className="h-4 w-4 shrink-0 text-brand-red"
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
