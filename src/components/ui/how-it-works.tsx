"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export interface Step {
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  colorTheme?: "red" | "orange" | "blue" | "purple" | "emerald";
  colors?: {
    bg: string;
    text: string;
    border: string;
    pin?: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface CardProps {
  number: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  colorTheme?: "red" | "orange" | "blue" | "purple" | "emerald";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
    pin?: string;
  };
}

export const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

export const Card = ({
  number,
  title,
  subtitle,
  description,
  image,
  imageAlt,
  colorTheme = "red",
  className = "",
  rotate = "",
  colors: customColors,
}: CardProps) => {
  const defaultBgColors = {
    red: "bg-red-500/5 dark:bg-red-500/10",
    orange: "bg-orange-50 dark:bg-orange-500/10",
    blue: "bg-blue-50 dark:bg-blue-500/10",
    purple: "bg-purple-50 dark:bg-purple-500/10",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10",
  };
  const defaultTextColors = {
    red: "text-red dark:text-red-400",
    orange: "text-orange-500 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };
  const defaultBorderColors = {
    red: "border-red/20 dark:border-red/30",
    orange: "border-orange-200 dark:border-orange-500/20",
    blue: "border-blue-200 dark:border-blue-500/20",
    purple: "border-purple-200 dark:border-purple-500/20",
    emerald: "border-emerald-200 dark:border-emerald-500/20",
  };
  const defaultPinColors = {
    red: "text-red drop-shadow-[0_4px_6px_rgba(220,38,38,0.35)]",
    orange: "text-orange-500 drop-shadow-[0_4px_6px_rgba(249,115,22,0.35)]",
    blue: "text-blue-600 drop-shadow-[0_4px_6px_rgba(37,99,235,0.35)]",
    purple: "text-purple-600 drop-shadow-[0_4px_6px_rgba(147,51,234,0.35)]",
    emerald: "text-emerald-600 drop-shadow-[0_4px_6px_rgba(5,150,105,0.35)]",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];
  const pinColor = customColors?.pin || defaultPinColors[colorTheme];

  return (
    <div
      className={`relative w-full transition-all duration-300 hover:z-30 hover:scale-[1.03] hover:rotate-0 ${rotate} ${className}`}
    >
      {/* Pin positioned at top center */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 transition-transform duration-300 group-hover:-translate-y-1">
        <Pin className={`w-7 h-7 ${pinColor}`} />
      </div>

      <div className="bg-white dark:bg-neutral-900 pt-5 p-3 rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] border border-neutral-200/80 dark:border-neutral-800 flex flex-col h-full">
        {/* Step Image */}
        {image && (
          <div className="relative w-full h-44 sm:h-48 rounded-[16px] overflow-hidden mb-3.5 bg-neutral-100 dark:bg-neutral-800 group/img border border-black/5 dark:border-white/5">
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover transition-transform duration-500 ease-out group-hover/img:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Number badge on image corner */}
            <span
              className="absolute top-2.5 right-2.5 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black shadow-md tracking-wider text-neutral-800 dark:text-neutral-100 border border-black/5"
            >
              {number}
            </span>
          </div>
        )}

        {/* Card Body with note styling */}
        <div
          className={`${bgColor} border ${borderColor} rounded-[16px] p-4 flex-1 flex flex-col relative overflow-hidden text-right`}
        >
          {!image && (
            <span
              className={`${textColor} text-3xl font-black mb-2 inline-block`}
              style={{
                fontFamily: '"Tajawal", "Chalkboard SE", sans-serif',
              }}
            >
              {number}
            </span>
          )}

          {subtitle && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
              {subtitle}
            </span>
          )}

          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-snug mb-2">
            {title}
          </h3>

          <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-[13px] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
  orientation?: "horizontal" | "vertical";
  title?: string;
  subtitle?: string;
  badge?: string;
}

const DEFAULT_CARD_ROTATIONS = [
  "rotate-1",
  "-rotate-2",
  "rotate-2",
  "-rotate-1",
  "rotate-1",
  "-rotate-2",
  "rotate-2",
  "-rotate-1",
  "rotate-1",
];

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-8" },
  {
    className: "md:absolute md:top-[120px] md:right-[15%]",
    rotate: "-rotate-8",
  },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-8" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-8",
  },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "rotate-8" },
];

export default function HowItWorks({
  features,
  className = "",
  stepPositions,
  orientation = "horizontal",
  title,
  subtitle,
  badge,
}: HowItWorksProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const defaultFeatures: Step[] = [
    {
      title: "فحص المواد الخام الخارجي",
      subtitle: "Raw Materials Exterior Inspection",
      description:
        "فحص دقيق لكافة المكونات الأساسية مثل أسطوانات OPC والتروس للتأكد من خلوها من أي شوائب أو خدوش.",
      colorTheme: "red",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "فحص طباعة المواد الخام",
      subtitle: "Raw Materials Printing Inspection",
      description:
        "فحص عينات الطباعة الأولى لقياس درجة الكثافة الضوئية وتجانس بودرة الحبر ومطابقتها للمواصفات القياسية.",
      colorTheme: "orange",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "اختبار العمر الافتراضي للمواد",
      subtitle: "Raw Materials Lifetime Testing",
      description:
        "إجراء اختبارات متواصلة على منصات ميكانيكية لتقييم صلابة القطع ومقاومتها للاحتكاك في الدورات الطويلة.",
      colorTheme: "blue",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "تجميع وتركيب المنتج",
      subtitle: "Product Assembling",
      description:
        "تجميع خراطيش الحبر في بيئة صناعية محكمة وبواسطة فنيين معتمدين بأعلى معايير الدقة والاتساق.",
      colorTheme: "purple",
      image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "تخزين المنتجات نصف المصنعة",
      subtitle: "Semi-Finished Product Warehousing",
      description:
        "تخزين الخراطيش في مستودعات منظمة مع تحكم بيئي كامل في درجات الحرارة والرطوبة لحماية كفاءتها.",
      colorTheme: "emerald",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "فحص إحكام الإغلاق والتفريغ",
      subtitle: "Airtight Inspection",
      description:
        "اختبار غرف الضغط والتفريغ الهوائي للتأكد 100% من عدم حدوث أي تسريب للحبر أثناء النقل أو الاستخدام.",
      colorTheme: "red",
      image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "اختبار الاهتزاز والصدمات",
      subtitle: "Vibrating Inspection",
      description:
        "محاكاة ظروف الشحن القاسية ومنصات الاهتزاز لضمان وصول علب منتجات روايال إنك بحالة مثالية تماماً.",
      colorTheme: "orange",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "فحص جودة الطباعة الأولي (PQ1)",
      subtitle: "PQ1 Printing Inspection",
      description:
        "تحليل دقيق لدرجات السواد والألوان ووضوح الحواف الدقيقة عبر مستشعرات متطورة ونماذج اختبار قياسية.",
      colorTheme: "blue",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "اختبار دورة الحياة والجهد النهائي (PQ2)",
      subtitle: "PQ2 Lifetime Testing",
      description:
        "تشغيل الطابعات على آلاف الصفحات للتأكد من ثبات نقاء الحبر والمردود الكامل حتى آخر ورقة قبل التعبئة النهائية.",
      colorTheme: "purple",
      image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;

  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollLeft = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollRight(scrollLeft > 10);
    setCanScrollLeft(scrollLeft < maxScroll - 10);

    const cardWidth = 320;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveStepIndex(Math.min(index, data.length - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [data.length]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = 340;
    const multiplier = direction === "right" ? -1 : 1;
    el.scrollBy({ left: multiplier * cardWidth, behavior: "smooth" });
  };

  // If vertical orientation requested, fallback to vertical flow
  if (orientation === "vertical") {
    const positions = stepPositions || DEFAULT_CARD_POSITIONS;
    let height = 1130;
    if (data.length === 1) height = 400;
    else if (data.length === 2) height = 450;
    else if (data.length === 3) height = 800;
    else if (data.length === 4) height = 900;
    else height = 1130;

    return (
      <LazyMotion features={domAnimation}>
        <div className={`bg-white dark:bg-black max-md:pt-10 max-md:pb-25 md:py-20 px-8 relative ${className}`}>
          <div className="max-w-6xl mx-auto relative z-10">
            <div
              className="relative w-full max-w-[1000px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block h-auto md:h-[var(--md-height)]"
              style={{ "--md-height": `${height}px` } as React.CSSProperties}
            >
              {data.map((step, index) => {
                const position = positions[index % positions.length];
                return (
                  <Card
                    key={step.title}
                    number={`0${index + 1}`}
                    title={step.title}
                    subtitle={step.subtitle}
                    description={step.description}
                    image={step.image}
                    imageAlt={step.imageAlt}
                    colorTheme={step.colorTheme || "blue"}
                    colors={step.colors}
                    rotate={position.rotate}
                    className={position.className}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <section
        className={`bg-white dark:bg-neutral-950 py-16 md:py-24 relative overflow-hidden ${className}`}
        dir="rtl"
      >
        {/* Ruled notebook line background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.12]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
            backgroundSize: "100% 36px",
            marginTop: "6px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "100% 36px",
            marginTop: "6px",
          }}
        />

        {/* Edge gradient masks */}
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-8 md:w-20 bg-gradient-to-l z-20" />
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-8 md:w-20 bg-gradient-to-r z-20" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Controls */}
          {(title || subtitle || badge) && (
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                {badge && (
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-red bg-red/10 rounded-full px-4 py-1.5 mb-4">
                    {badge}
                  </span>
                )}
                {title && (
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink dark:text-white leading-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="hidden sm:flex items-center text-xs font-bold text-neutral-400 dark:text-neutral-500 ml-4">
                  <span>المرحلة {activeStepIndex + 1} من {data.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  aria-label="السابق"
                  className="w-11 h-11 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 shadow-sm flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95 text-neutral-700 dark:text-neutral-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  aria-label="التالي"
                  className="w-11 h-11 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 shadow-sm flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95 text-neutral-700 dark:text-neutral-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Horizontal Track Container */}
          <div className="relative">
            {/* Animated SVG horizontal dashed connecting ribbon */}
            <div className="absolute top-[18px] left-0 right-0 h-10 pointer-events-none hidden md:block z-0 overflow-visible">
              <svg
                className="w-full h-full"
                viewBox="0 0 2400 40"
                fill="none"
                preserveAspectRatio="none"
              >
                <m.path
                  d="M 0,20 Q 200,4 400,20 T 800,20 T 1200,20 T 1600,20 T 2000,20 T 2400,20"
                  stroke="currentColor"
                  className="text-red/30 dark:text-red/40"
                  strokeWidth="2.5"
                  strokeDasharray="9 7"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -160 }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            </div>

            {/* Scrollable Track */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {data.map((step, index) => {
                const rotation =
                  DEFAULT_CARD_ROTATIONS[index % DEFAULT_CARD_ROTATIONS.length];

                return (
                  <div
                    key={step.title + index}
                    className="w-[280px] sm:w-[310px] md:w-[330px] shrink-0 snap-center"
                  >
                    <Card
                      number={`0${index + 1}`}
                      title={step.title}
                      subtitle={step.subtitle}
                      description={step.description}
                      image={step.image}
                      imageAlt={step.imageAlt}
                      colorTheme={step.colorTheme || "red"}
                      colors={step.colors}
                      rotate={rotation}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress track at bottom */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {data.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeStepIndex
                    ? "w-8 bg-red"
                    : "w-2 bg-neutral-300 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
