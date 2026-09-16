"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

/* ══════════════════════════ COLLAGE IMAGE DATA ══════════════════════════ */
/*
  Each image is positioned via percentage-based top/left within the full track.
  The track is one continuous strip. Percentages are relative to the track's dimensions.
*/

interface CollageImage {
  src: string;
  label: string;
  year: string;
  /** Width in px (at desktop). Responsive scaling applied via CSS. */
  w: number;
  /** Height in px */
  h: number;
  /** Top position as percentage of viewport height */
  topPct: number;
  /** Right position as percentage of total track width (since it's RTL) */
  rightPct: number;
  z?: number;
}

interface Quote {
  text: string;
  author: string;
  topPct: number;
  rightPct: number;
}

const images: CollageImage[] = [
  // --- Early Era (right side of track, visible first in RTL) ---
  { src: "/images/timeline-workshop.jpg", label: "الورشة الأولى", year: "2007", w: 300, h: 220, topPct: 8, rightPct: 3, z: 2 },
  { src: "/images/hero-office.jpg", label: "بداية الطباعة", year: "2007", w: 200, h: 160, topPct: 55, rightPct: 12, z: 3 },
  { src: "/images/ri1.jpg", label: "النمو الأول", year: "2009", w: 380, h: 300, topPct: 10, rightPct: 22, z: 4 },
  { src: "/images/ink-cartridges.jpg", label: "المستلزمات", year: "2010", w: 220, h: 180, topPct: 60, rightPct: 32, z: 2 },

  // --- Middle Era ---
  { src: "/images/ri.jpg", label: "الخبرة", year: "2011", w: 260, h: 340, topPct: 5, rightPct: 42, z: 5 },
  { src: "/images/hero-office.jpg", label: "الورشة المتخصصة", year: "2013", w: 280, h: 230, topPct: 50, rightPct: 52, z: 3 },
  { src: "/images/timeline-workshop.jpg", label: "التوسع", year: "2015", w: 240, h: 300, topPct: 8, rightPct: 60, z: 2 },

  // --- Late Era (left side of track, revealed by scrolling) ---
  { src: "/images/ri1.jpg", label: "وكالة الإشهار", year: "2017", w: 360, h: 280, topPct: 45, rightPct: 68, z: 4 },
  { src: "/images/ink-cartridges.jpg", label: "روايال إنك", year: "2022", w: 400, h: 320, topPct: 6, rightPct: 78, z: 5 },
  { src: "/images/ri.jpg", label: "المستقبل", year: "2024", w: 260, h: 200, topPct: 58, rightPct: 88, z: 3 },
];

const quotes: Quote[] = [
  {
    text: "بدأنا من شغف حقيقي بالطباعة...\nمن ورشة صغيرة إلى حلم كبير.",
    author: "— المؤسس",
    topPct: 42,
    rightPct: 15,
  },
  {
    text: "لا يهم من أين تبدأ،\nالمهم كيف تتقدم من هناك.",
    author: "— تيتانو كلاس",
    topPct: 35,
    rightPct: 55,
  },
  {
    text: "اجتمعت المسيرتان\nلتأسيس علامة يطلبها\nالمستخدم بالاسم.",
    author: "— روايال إنك",
    topPct: 48,
    rightPct: 82,
  },
];

/** Total track width as a multiplier of viewport width. */
const TRACK_WIDTH_VW = 350;

const yearLabels = ["2007", "2011", "2012", "2017", "2022"];

/* ══════════════════════════ MAIN PAGE ══════════════════════════ */

export default function TimelinePage() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* ─── Detect environment ─── */
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const onResize = () => check();
    const onMotion = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    window.addEventListener("resize", onResize);
    mql.addEventListener("change", onMotion);
    return () => {
      window.removeEventListener("resize", onResize);
      mql.removeEventListener("change", onMotion);
    };
  }, []);

  /* ─── GSAP ScrollTrigger ─── */
  useEffect(() => {
    if (!mounted || isMobile || prefersReducedMotion) return;

    let ctx: any;

    const init = async () => {
      const gsapMod = await import("gsap");
      const gsap = gsapMod.default || gsapMod;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track) return;

      // Wait two frames for layout to fully settle
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Calculate from known width, not scrollWidth (more reliable)
      const getDistance = () => (TRACK_WIDTH_VW / 100) * window.innerWidth - window.innerWidth;

      ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => getDistance(), // Positive value translates track to the right, revealing left content (RTL mode)
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top 80px", // Account for sticky header h-20 = 80px
            end: () => `+=${getDistance()}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self: any) => {
              setProgress(self.progress);
              if (self.progress > 0.01) setShowHint(false);
            },
          },
        });
      }, pin);
    };

    // Delay init slightly so DOM is ready
    const t = setTimeout(init, 150);
    return () => {
      clearTimeout(t);
      if (ctx) ctx.revert();
    };
  }, [mounted, isMobile, prefersReducedMotion]);

  /* ─── Auto-dismiss hint ─── */
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const activeYearIdx = Math.min(
    Math.floor(progress * yearLabels.length),
    yearLabels.length - 1
  );

  /* Background color segments based on scroll progress */
  const getBgColor = () => {
    if (progress < 0.35) return "#f5f0eb"; // warm cream
    if (progress < 0.65) return "#8a8677"; // olive stone
    return "#2c2c2c"; // dark
  };
  const getTextColor = () => {
    if (progress < 0.35) return "#2c2c2c";
    return "#f5f0eb";
  };

  return (
    <div className="flex flex-col">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden bg-[#f5f0eb]">
        <div className="absolute inset-0">
          <Image src="/images/ri.jpg" alt="Royal Ink" fill className="object-cover opacity-15" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0eb]/90 via-[#f5f0eb]/70 to-[#f5f0eb]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#2c2c2c]/20" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#2c2c2c]/50">مسيرتنا</span>
            <div className="h-px w-16 bg-[#2c2c2c]/20" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[#2c2c2c] mb-6 leading-tight">
            رحلة النمو<br />
            <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">والتطور</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-lg md:text-xl text-[#2c2c2c]/60 max-w-2xl mx-auto mb-8 leading-relaxed">
            من ورشة صغيرة عام 2007 إلى علامة وطنية رائدة
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm text-[#2c2c2c]/50 hover:text-[#2c2c2c] transition-colors border border-[#2c2c2c]/20 rounded-full px-5 py-2.5 hover:bg-[#2c2c2c]/5">
              <ChevronLeft className="w-4 h-4" />
              عرض النسخة الكلاسيكية
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ DESKTOP: HORIZONTAL SCROLL ═══════════════ */}
      {mounted && !prefersReducedMotion && !isMobile && (
        <>
          {/*
            PIN WRAPPER — This is the element GSAP pins.
            It must be a direct block-level element in the page flow.
            Height = 100vh so it fills the viewport when pinned.
            overflow: hidden so the wide track doesn't cause page-level horizontal scroll.
          */}
          <div
            ref={pinRef}
            className="horizontal-pin-sticky relative h-screen overflow-hidden"
            style={{
              backgroundColor: getBgColor(),
              transition: "background-color 0.8s ease",
            }}
          >
            {/*
              TRACK — The wide horizontal strip that gets translateX'd.
              Width is set via inline style in vw units.
              Contains all scattered images and quotes.
            */}
            <div
              ref={trackRef}
              className="horizontal-track relative h-full will-change-transform"
              style={{ width: `${TRACK_WIDTH_VW}vw` }}
              role="list"
              aria-label="محطات مسيرة روايال إنك"
            >
              {/* Scattered images */}
              {images.map((img, i) => (
                <div
                  key={i}
                  className="absolute group"
                  role="listitem"
                  aria-label={`${img.label} ${img.year}`}
                  style={{
                    top: `${img.topPct}%`,
                    right: `${img.rightPct}%`, // RTL: position from right edge
                    width: img.w,
                    zIndex: img.z || 1,
                  }}
                >
                  {/* Label */}
                  <span
                    className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5 transition-colors duration-700"
                    style={{ color: `${getTextColor()}60` }}
                  >
                    {img.label}، {img.year}
                  </span>
                  {/* Photo */}
                  <div className="relative w-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500" style={{ height: img.h }}>
                    <Image
                      src={img.src}
                      alt={`${img.label} ${img.year}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes={`${img.w}px`}
                    />
                  </div>
                </div>
              ))}

              {/* Quotes */}
              {quotes.map((q, i) => (
                <div
                  key={`q-${i}`}
                  className="absolute max-w-[280px] z-10"
                  style={{ top: `${q.topPct}%`, right: `${q.rightPct}%` }} // RTL
                >
                  <p
                    className="text-lg md:text-xl font-light leading-relaxed whitespace-pre-line italic transition-colors duration-700"
                    style={{ color: `${getTextColor()}B3` }}
                  >
                    {q.text}
                  </p>
                  <span className="block mt-3 text-sm font-semibold text-primary/70">{q.author}</span>
                </div>
              ))}

              {/* Decorative wavy SVG lines */}
              <svg className="absolute bottom-[18%] opacity-[0.05] pointer-events-none" style={{ right: "8%", color: getTextColor() }} width="300" height="60" viewBox="0 0 300 60" fill="none">
                <path d="M0 30 C50 10, 100 50, 150 30 C200 10, 250 50, 300 30" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="absolute top-[72%] opacity-[0.04] pointer-events-none" style={{ right: "45%", color: getTextColor() }} width="250" height="80" viewBox="0 0 250 80" fill="none">
                <path d="M0 40 C35 10, 80 70, 125 40 C170 10, 215 70, 250 40" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <svg className="absolute bottom-[25%] opacity-[0.04] pointer-events-none" style={{ right: "75%", color: getTextColor() }} width="200" height="50" viewBox="0 0 200 50" fill="none">
                <path d="M0 25 C30 5, 70 45, 100 25 C130 5, 170 45, 200 25" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {/* ── Progress bar (inside pin, so it stays visible) ── */}
            <div
              className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none transition-opacity duration-500"
              style={{ opacity: progress > 0.005 && progress < 0.995 ? 1 : 0 }}
            >
              <div className="h-[3px] bg-black/10">
                <div className="h-full bg-primary transition-[width] duration-100 ease-out" style={{ width: `${progress * 100}%` }} />
              </div>
              {/* Year pills */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-black/40 backdrop-blur-md rounded-full px-6 py-2.5">
                {yearLabels.map((yr, i) => (
                  <span
                    key={yr}
                    className={`text-xs font-bold transition-all duration-300 ${
                      i === activeYearIdx ? "text-primary scale-110" : i < activeYearIdx ? "text-white/60" : "text-white/25"
                    }`}
                  >
                    {yr}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Scroll hint ── */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
                >
                  <span className="text-xs font-medium bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm text-[#2c2c2c]/60">
                    مرر للأسفل لاستكشاف المسيرة
                  </span>
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-6 h-10 rounded-full border-2 border-[#2c2c2c]/25 flex items-start justify-center pt-1.5">
                    <div className="w-1 h-2.5 rounded-full bg-primary" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ═══════════════ MOBILE CAROUSEL ═══════════════ */}
      {mounted && !prefersReducedMotion && isMobile && <MobileCarousel />}

      {/* ═══════════════ REDUCED MOTION FALLBACK ═══════════════ */}
      {mounted && prefersReducedMotion && <ReducedMotionFallback />}

      {/* ═══════════════ POST-TIMELINE CTA ═══════════════ */}
      <section className="py-24 relative overflow-hidden bg-[#f5f0eb]">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#2c2c2c]">
              رحلتنا <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">مستمرة</span>
            </h2>
            <p className="text-[#2c2c2c]/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              نواصل النمو والابتكار لنقدم أفضل مستلزمات الطباعة المتوافقة في الجزائر
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/contact" className="bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
                تواصل معنا
              </Link>
              <Link href="/about" className="border border-[#2c2c2c]/20 text-[#2c2c2c] px-8 py-3.5 rounded-full font-semibold hover:bg-[#2c2c2c]/5 transition-all hover:-translate-y-0.5">
                عرض النسخة الكلاسيكية
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════ MOBILE CAROUSEL ══════════════════════════ */

const mobileCards = [
  { year: "2007", title: "البداية الأولى", desc: "بدأ أحد مؤسسينا مسيرته في الطباعة من ورشة منزلية صغيرة.", image: "/images/timeline-workshop.jpg" },
  { year: "2011", title: "تأسيس ورشة متخصصة", desc: "تطور المشروع إلى افتتاح ورشة متخصصة بتقنيات متعددة.", image: "/images/hero-office.jpg" },
  { year: "2012", title: "استيراد المستلزمات", desc: "بدأت مرحلة استيراد مستلزمات الإعلام الآلي والطباعة.", image: "/images/ri.jpg" },
  { year: "2017", title: "وكالة اتصال وإشهار", desc: "تأسست وكالة اتصال وإشهار تقدم حلولاً إبداعية متكاملة.", image: "/images/ri1.jpg" },
  { year: "2022", title: "ميلاد تيتانو كلاس وروايال إنك", desc: "اجتمعت المسيرتان لتأسيس شركة تيتانو كلاس وعلامة روايال إنك.", image: "/images/ink-cartridges.jpg", highlight: true },
];

function MobileCarousel() {
  return (
    <section className="py-24 bg-[#0a0a0a] text-white overflow-hidden relative" aria-label="مسيرة روايال إنك">
      {/* Decorative noise/texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center justify-center mb-24 text-center">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-px bg-gradient-to-b from-transparent via-primary to-primary mb-8"
          />
          <h2 className="text-5xl font-black mb-4 tracking-tight">
            المسيرة
          </h2>
          <p className="text-sm font-bold tracking-[0.3em] uppercase text-primary/80">
            The Journey
          </p>
        </div>

        <div className="flex flex-col gap-32 relative pb-20">
          {mobileCards.map((c, i) => {
            const isEven = i % 2 === 0;
            
            return (
              <motion.div 
                key={c.year}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                {/* Massive Background Year (Outlined) */}
                <div className={`absolute top-0 ${isEven ? "right-0" : "left-0"} -translate-y-16 opacity-[0.07] pointer-events-none select-none z-0`}>
                  <span className="text-[140px] font-black leading-none text-transparent" style={{ WebkitTextStroke: "2px rgba(255,255,255,1)" }}>
                    {c.year}
                  </span>
                </div>

                <div className={`relative z-10 flex flex-col gap-6 ${isEven ? "items-start" : "items-end"}`}>
                  
                  {/* Image container with varied aspect ratios */}
                  <div 
                    className={`relative overflow-hidden shadow-2xl shadow-black/80 rounded-sm ${
                      i === 0 ? "w-[85%] aspect-[4/5]" : 
                      i === 1 ? "w-[75%] aspect-[3/4]" : 
                      i === 2 ? "w-full aspect-square" : 
                      i === 3 ? "w-[85%] aspect-[4/5]" : 
                      "w-[95%] aspect-[3/4] ring-1 ring-primary/30"
                    }`}
                  >
                    <Image src={c.image} alt={c.title} fill className="object-cover scale-105" sizes="90vw" />
                    <div className="absolute inset-0 bg-black/30" />
                    
                    {/* Floating mini-year inside image on opposite side */}
                    <div className={`absolute bottom-4 ${isEven ? "left-4" : "right-4"} bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-sm`}>
                      {c.year}
                    </div>
                  </div>

                  {/* Text Block */}
                  <div className={`max-w-[85%] bg-[#0a0a0a]/80 backdrop-blur-md p-6 rounded-2xl ${isEven ? "text-right -mt-20 mr-auto" : "text-right -mt-20 ml-auto"}`}>
                    <h3 className="text-2xl font-black mb-3 text-white">
                      {c.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm">
                      {c.desc}
                    </p>
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

/* ══════════════════════════ REDUCED MOTION FALLBACK ══════════════════════════ */

function ReducedMotionFallback() {
  return (
    <section className="py-24 bg-[#f5f0eb]" aria-label="مسيرة روايال إنك">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#2c2c2c]/15" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#2c2c2c]/50">مسيرتنا</span>
            <div className="h-px w-16 bg-[#2c2c2c]/15" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#2c2c2c]">رحلة النمو والتطور</h2>
        </div>
        <ol className="space-y-8">
          {mobileCards.map((c) => (
            <li key={c.year} className={`rounded-2xl overflow-hidden shadow-lg ${c.highlight ? "ring-2 ring-primary/30" : ""}`}>
              <div className="relative h-48">
                <Image src={c.image} alt={c.title} fill className="object-cover" sizes="768px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f5f0eb] via-black/10 to-transparent" />
              </div>
              <div className="p-8 bg-[#f5f0eb]">
                <span className="inline-block text-xs font-bold text-primary bg-primary/10 rounded-lg px-3 py-1.5 mb-3">{c.year}</span>
                <h3 className="text-xl font-bold mb-3 text-[#2c2c2c]">{c.title}</h3>
                <p className="text-[#2c2c2c]/60 leading-relaxed">{c.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
