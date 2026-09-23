"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export interface CertificateItem {
  id: string;
  code: string;
  title: string;
  englishTitle?: string;
  description: string;
  logo: string;
  badge?: string;
}

export const COMPANY_CERTIFICATES: CertificateItem[] = [
  {
    id: "iso-9001",
    code: "ISO 9001",
    title: "نظام إدارة الجودة الدولي",
    englishTitle: "Quality Management System — ISO 9001",
    description:
      "شهادة اعتماد دولية تؤكد تطبيق معايير إدارة وتوكيد الجودة الصارمة لضمان ثبات أداء وموثوقية كل خرطوشة طباعة.",
    logo: "/images/certificate/Artboard 3.svg",
    badge: "توكيد جودة معتمد",
  },
  {
    id: "sgs",
    code: "SGS",
    title: "شهادة فحص واعتماد SGS الدولية",
    englishTitle: "SGS Certified — Inspection & Verification",
    description:
      "اعتماد وتفتيش دوري مستقل من هيئة SGS السويسرية الرائدة عالمياً في فحص ومطابقة معايير التصنيع والجودة الصارمة.",
    logo: "/images/certificate/Artboard 5.svg",
    badge: "اعتماد وتفتيش SGS",
  },
  {
    id: "iso-14001",
    code: "ISO 14001",
    title: "نظام الإدارة البيئية",
    englishTitle: "Environmental Management System",
    description:
      "شهادة الالتزام بالمعايير البيئية العالمية، وضبط الأثر البيئي، وإعادة التدوير المسؤول لمكونات ومخلفات التصنيع.",
    logo: "/images/certificate/Artboard 7.svg",
    badge: "بيئي معتمد",
  },
  {
    id: "reach",
    code: "REACH",
    title: "سلامة المواد الكيميائية",
    englishTitle: "REACH Compliant",
    description:
      "مطابقة كاملة للائحة الاتحاد الأوروبي الخاصة بتسجيل وتقييم وتقييد المواد الكيميائية لضمان أمان صحي وبيئي مطلق.",
    logo: "/images/certificate/Artboard 1.svg",
    badge: "مطابقة أوروبية",
  },
  {
    id: "rohs",
    code: "RoHS",
    title: "تقييد وحظر المواد الخطرة",
    englishTitle: "RoHS Compliant",
    description:
      "خلو خراطيش ومساحيق الحبر تماماً من الرصاص والزئبق والكادميوم والمعادن الثقيلة السامة وفق التوجيهات الأوروبية.",
    logo: "/images/certificate/Artboard 6.svg",
    badge: "خالٍ من السموم",
  },
  {
    id: "stmc",
    code: "STMC",
    title: "معايير فحص واختبار الخراطيش",
    englishTitle: "STMC Compliant Company",
    description:
      "اعتماد لجنة طرق الاختبار الموحدة العالمية (STMC) لقياس الكثافة البصرية وتدرج السواد ومردود الصفحات الفعلي بدقة.",
    logo: "/images/certificate/Artboard 8.svg",
    badge: "معيار طابعات عالمي",
  },
  {
    id: "ce",
    code: "CE",
    title: "علامة المطابقة الأوروبية",
    englishTitle: "European Conformity (CE)",
    description:
      "إقرار رسمي بمطابقة كافة منتجات روايال إنك للمعايير الأوروبية المعتمدة لحماية الصحة والسلامة والبيئة.",
    logo: "/images/certificate/ce.svg",
    badge: "معتمد أوروبياً",
  },
  {
    id: "gmc",
    code: "GMC",
    title: "شهادة الصانع العالمي المعتمد",
    englishTitle: "Global Manufacturer Certificate",
    description:
      "شهادة دولية معتمدة تؤكد تميز المصنع في القدرة الإنتاجية المتطورة، ضبط الجودة، وموثوقية التوريد العالمية.",
    logo: "/images/certificate/Artboard 4.svg",
    badge: "صانع عالمي معتمد",
  },
  {
    id: "bureau-veritas",
    code: "Bureau Veritas",
    title: "اعتماد بيرو فيريتاس الدولي",
    englishTitle: "Bureau Veritas Certified (1828)",
    description:
      "مصادقة وتفتيش دوري مستقل من هيئة Bureau Veritas العالمية الرائدة في التحقق من الامتثال ومعايير الجودة الصناعية.",
    logo: "/images/certificate/Artboard 9.svg",
    badge: "تفتيش واعتماد دولي",
  },
  {
    id: "china-environmental-label",
    code: "Ten Rings",
    title: "العلامة البيئية الصينية (Ten Rings)",
    englishTitle: "China Environmental Labelling (Ten Rings)",
    description:
      "شهادة الاعتماد البيئي الرسمية الرائدة لمستلزمات الطباعة، تؤكد الامتثال لأعلى معايير التصنيع الأخضر وخلو المنتجات من الانبعاثات الضارة.",
    logo: "/images/certificate/Artboard 10.svg",
    badge: "اعتماد بيئي أخضر",
  },
];

interface CaseProps {
  certificates?: CertificateItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

function Case({
  certificates = COMPANY_CERTIFICATES,
  title = "شهادات الجودة والاعتمادات العالمية",
  subtitle = "نلتزم بأعلى المقاييس الدولية في تصنيع مستلزمات الطباعة — مرر المؤشر على أي شهادة لاكتشاف تفاصيلها ومعاييرها الدقيقة.",
  badge = "شهاداتنا المعتمدة",
  className,
}: CaseProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCertKey, setActiveCertKey] = useState<string | null>(null);

  // Triple buffer (24 items) to ensure a 100% continuous infinite loop with zero blank spaces
  const displayCertificates = [
    ...certificates.map((c, i) => ({ ...c, uniqueKey: `rep1-${c.id || i}` })),
    ...certificates.map((c, i) => ({ ...c, uniqueKey: `rep2-${c.id || i}` })),
    ...certificates.map((c, i) => ({ ...c, uniqueKey: `rep3-${c.id || i}` })),
  ];

  // Listen to Embla's "select" event so points (dots) update immediately on arrow clicks, drag, or auto-scroll
  const onSelect = useCallback(() => {
    if (!api) return;
    const snap = api.selectedScrollSnap();
    setSelectedIndex(snap % certificates.length);
  }, [api, certificates.length]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  // Auto-scroll every 5 seconds by exactly 1 card, pause when hovered or tapped
  useEffect(() => {
    if (!api || isHovered || activeCertKey) {
      return;
    }

    const timer = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [api, isHovered, activeCertKey]);

  return (
    <section
      className={cn(
        "w-full py-16 md:py-24 bg-gradient-to-b from-paper/40 via-background to-background relative overflow-hidden",
        className
      )}
      dir="rtl"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col gap-10">
          {/* Header section */}
          <div className="flex text-center justify-center items-center gap-4 flex-col">
            {badge && (
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-red bg-red/10 rounded-full px-4 py-2 border border-red/20 shadow-xs">
                {badge}
              </div>
            )}
            <div className="flex gap-2 flex-col max-w-3xl">
              <h2 className="text-3xl md:text-5xl tracking-tight font-extrabold text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 px-3 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-700/60">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isHovered || activeCertKey ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-ping"
                )}
              />
              <span>
                {isHovered || activeCertKey
                  ? "التمرير متوقف مؤقتاً (معاينة)"
                  : "التمرير التلقائي مفعّل (كل 5 ثوانٍ)"}
              </span>
            </div>

            {/* Mobile-only 3-second recurring tap hint */}
            <div className="md:hidden flex items-center justify-center pt-2">
              <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red/10 border border-red/25 text-red text-xs font-bold shadow-xs">
                <motion.span
                  animate={{
                    scale: [0.8, 1.8, 2.3],
                    opacity: [0.8, 0.35, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 1.8,
                    ease: "easeOut",
                  }}
                  className="absolute right-3.5 w-5 h-5 rounded-full bg-red/35 pointer-events-none"
                />
                <motion.span
                  animate={{
                    scale: [1, 0.75, 1.2, 1],
                    y: [0, 2, -1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 1.8,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 text-sm select-none"
                >
                  👆
                </motion.span>
                <span className="relative z-10">المس أي شهادة لمعاينة التفاصيل والمعايير</span>
              </div>
            </div>
          </div>

          {/* Carousel Track: Container uses dir="ltr" to eliminate Embla RTL coordinate flip bugs, while each card preserves native Arabic RTL */}
          <div
            className="relative px-3 sm:px-6"
            dir="ltr"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              {/* pb-16 provides ample clearance so card drop shadow is never cut off */}
              <CarouselContent className="-ml-4 md:-ml-6 pt-4 pb-16">
                {displayCertificates.map((cert) => {
                  const isCardActive = activeCertKey === cert.uniqueKey;

                  return (
                    <CarouselItem
                      className="pl-4 md:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                      key={cert.uniqueKey}
                    >
                      <div className="py-2 px-1">
                        <div
                          dir="rtl"
                          onClick={() => setActiveCertKey(isCardActive ? null : cert.uniqueKey)}
                          className={cn(
                            "group relative flex flex-col rounded-2xl aspect-[4/3] sm:aspect-square bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_45px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_22px_45px_rgba(0,0,0,0.6)] transition-all duration-500 overflow-hidden items-center justify-center p-6 cursor-pointer",
                            isCardActive && "ring-2 ring-red/40 shadow-xl"
                          )}
                        >
                          {/* Badge in top corner */}
                          <span
                            className={cn(
                              "absolute top-3.5 right-3.5 z-0 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 transition-opacity duration-300",
                              isCardActive ? "opacity-0" : "group-hover:opacity-0"
                            )}
                          >
                            {cert.code}
                          </span>

                          {/* Certificate Logo (SVG) with zoom-out and white blur on hover/active */}
                          <div className="w-full h-full flex items-center justify-center relative p-4">
                            <img
                              src={cert.logo}
                              alt={cert.code}
                              className={cn(
                                "w-full h-full max-h-[120px] object-contain transition-all duration-500 ease-out select-none dark:invert-[0.1]",
                                isCardActive
                                  ? "scale-90 blur-[2.5px] opacity-15"
                                  : "group-hover:scale-90 group-hover:blur-[2.5px] group-hover:opacity-15"
                              )}
                              loading="lazy"
                            />
                          </div>

                          {/* Hover/Active Overlay with red text explanation */}
                          <div
                            className={cn(
                              "absolute inset-0 z-10 flex flex-col items-center justify-center p-5 text-center transition-all duration-500 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md rounded-2xl border-2 border-red/20",
                              isCardActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100"
                            )}
                          >
                            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-red bg-red/10 rounded-full px-3 py-1 mb-2 border border-red/20 shadow-xs">
                              {cert.code}
                            </span>

                            <h4 className="text-base md:text-lg font-bold text-red dark:text-red-400 mb-1.5 leading-snug">
                              {cert.title}
                            </h4>

                          {cert.englishTitle && (
                            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                              {cert.englishTitle}
                            </span>
                          )}

                          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-[230px]">
                            {cert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
              </CarouselContent>

              {/* Navigation controls */}
              <CarouselPrevious className="-left-4 sm:-left-6 bg-white/95 dark:bg-neutral-900/95 shadow-md border-neutral-200 dark:border-neutral-800 hover:bg-red hover:text-white transition-colors" />
              <CarouselNext className="-right-4 sm:-right-6 bg-white/95 dark:bg-neutral-900/95 shadow-md border-neutral-200 dark:border-neutral-800 hover:bg-red hover:text-white transition-colors" />
            </Carousel>
          </div>

          {/* Dots indicators representing the 8 distinct certificates, dynamically updated via onSelect */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {certificates.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!api) return;
                  const currentSnap = api.selectedScrollSnap();
                  const currentCycle = Math.floor(
                    currentSnap / certificates.length
                  );
                  api.scrollTo(currentCycle * certificates.length + i);
                }}
                aria-label={`انتقال إلى الشهادة ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selectedIndex === i
                    ? "w-8 bg-red"
                    : "w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { Case, Case as CertificatesCarousel };
export default Case;
