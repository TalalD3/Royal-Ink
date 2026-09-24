"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { HeroSlide } from "@/types/slide";
import { DEFAULT_SLIDES } from "@/types/slide";

/* ── Constants ── */
const INTERVAL_MS = 4000; // 4 seconds per slide

/* ── Slide Content ── */
function SlideContent({ slide }: { slide: HeroSlide }) {
  const isRight = slide.text_align === "right";
  const isLeft = slide.text_align === "left";

  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="absolute inset-0 z-0"
    >
      {/* Background Image */}
      <Image
        src={slide.image_url}
        alt={slide.title}
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0,0,0,${(slide.overlay_opacity ?? 50) / 100})`,
        }}
      />

      {/* Text Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pt-4 pb-14 sm:pb-12 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div
            className={`flex w-full ${
              isRight
                ? "justify-start"
                : isLeft
                ? "justify-end"
                : "justify-center"
            }`}
          >
            <div
              className={`flex flex-col gap-3 sm:gap-4 md:gap-5 max-w-3xl w-full ${
                isRight
                  ? "items-start text-right"
                  : isLeft
                  ? "items-end text-left"
                  : "items-center text-center"
              }`}
            >
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.25] md:leading-[1.2] drop-shadow-md whitespace-pre-line w-full"
              >
                {slide.title}
              </motion.h1>

              {/* Subtitle */}
              {slide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl md:max-w-2xl drop-shadow-sm w-full"
                >
                  {slide.subtitle}
                </motion.p>
              )}

              {/* Buttons */}
              {slide.buttons && slide.buttons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className={`flex flex-wrap gap-2.5 sm:gap-3 mt-1.5 sm:mt-2 w-full ${
                    isRight
                      ? "justify-start"
                      : isLeft
                      ? "justify-end"
                      : "justify-center"
                  }`}
                >
                  {slide.buttons.slice(0, 2).map((btn, idx) =>
                    btn.variant === "primary" ? (
                      <Link
                        key={idx}
                        href={btn.href}
                        className="bg-[var(--red)] hover:bg-[var(--red-dark)] text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full font-bold transition-all shadow-lg shadow-red-900/30 hover:-translate-y-0.5 text-xs sm:text-sm md:text-base cursor-pointer"
                      >
                        {btn.text}
                      </Link>
                    ) : (
                      <Link
                        key={idx}
                        href={btn.href}
                        className="border-2 border-white/50 text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full font-semibold hover:bg-white/10 hover:border-white/70 transition-all hover:-translate-y-0.5 text-xs sm:text-sm md:text-base backdrop-blur-sm cursor-pointer"
                      >
                        {btn.text}
                      </Link>
                    )
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Hero Slider Component ── */
export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(
    DEFAULT_SLIDES.filter((s) => s.is_active)
  );
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slides from public API
  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch("/api/slides");
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setSlides(json.data);
          setCurrent((prev) => (prev >= json.data.length ? 0 : prev));
        }
      } catch {
        // Keep defaults
      }
    }
    fetchSlides();
  }, []);

  // Auto-advance with fade: advance by exactly 1 slide every interval
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const goTo = (index: number) => {
    setCurrent(index);
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, INTERVAL_MS);
  };

  if (slides.length === 0) return null;
  const currentSlide = slides[current] || slides[0];

  return (
    <section className="relative w-full h-[calc(100vh-5rem)] h-[calc(100svh-5rem)] h-[calc(100dvh-5rem)] min-h-[520px] md:min-h-0 md:h-[58vh] lg:h-[62vh] overflow-hidden bg-black">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <SlideContent key={currentSlide.id} slide={currentSlide} />
      </AnimatePresence>

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-5 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 select-none"
          dir="ltr"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`الشريحة ${i + 1}`}
              className={`rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                i === current
                  ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-white shadow-md shadow-white/30"
                  : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar across the bottom */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
          <motion.div
            key={current}
            className="h-full bg-white/60"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: INTERVAL_MS / 1000,
              ease: "linear",
            }}
          />
        </div>
      )}
    </section>
  );
}

export default HeroSlider;
