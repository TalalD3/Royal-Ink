"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types/slide";
import { DEFAULT_SLIDES } from "@/types/slide";
import { BlockReveal } from "@/components/ui/block-reveal";

/* ── Constants ── */
const INTERVAL_MS = 6500; // time on each slide

const pad = (n: number) => String(n).padStart(2, "0");

/* ── Main Hero Slider Component ──
   Built like the logo: a black block and a red block side by side. The copy
   always sits on the solid black block, so it stays readable whatever photo
   is uploaded; the photo is framed across the seam between the two blocks. */
export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(
    DEFAULT_SLIDES.filter((s) => s.is_active)
  );
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-advance; restarts whenever the slide changes so a manual jump
  // always gets a full interval
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isPaused, slides.length, current]);

  const step = useCallback(
    (dir: 1 | -1) =>
      setCurrent((prev) => (prev + dir + slides.length) % slides.length),
    [slides.length]
  );

  if (slides.length === 0) return null;
  const many = slides.length > 1;

  return (
    <section
      className="relative isolate overflow-hidden bg-brand-black text-white"
      aria-roledescription="carousel"
      aria-label="أبرز ما تقدمه روايال إنك"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* The red block — a band across the top on phones, the end-side
          column on desktop (36%, the logo's own proportion) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-44 bg-brand-red sm:h-56 md:h-64 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[36%]"
      />
      {/* Print raster on the black block, fading towards the seam */}
      <div
        aria-hidden="true"
        className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_top,#000,transparent_45%)] lg:[mask-image:linear-gradient(to_right,#000,transparent_55%)]"
      />

      <div className="container mx-auto px-4">
        {/* Desktop reads like the logo: black block on the left (copy),
            red block on the right, with the photo across the seam */}
        <div className="grid items-center gap-8 pb-10 pt-6 lg:min-h-[600px] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14 lg:py-16">
          {/* ── Photo, framed across the seam by crop marks ── */}
          <div className="ri-crop ri-crop-light">
            <BlockReveal
              immediate
              delay={0.15}
              className="h-56 bg-brand-black shadow-[0_28px_60px_-24px_rgba(0,0,0,0.6)] sm:h-72 md:h-80 lg:h-[440px]"
            >
              {slides.map((slide, i) => (
                <Image
                  key={slide.id}
                  src={slide.image_url}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className={`object-cover object-center transition-opacity duration-700 ease-out ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </BlockReveal>
          </div>

          {/* ── Copy, on the black block ── */}
          <div>
            <p className="ri-eyebrow ri-eyebrow-light mb-5">
              <span
                dir="ltr"
                lang="en"
                className="text-xs font-bold uppercase tracking-[0.22em]"
              >
                Exceed your vision
              </span>
            </p>

            {/* All slides share one grid cell, so the block is always as tall
                as the longest slide and nothing below jumps on change */}
            <div className="grid">
              {slides.map((slide, i) => {
                const active = i === current;
                const Title = i === 0 ? "h1" : "h2";
                return (
                  <div
                    key={slide.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} / ${slides.length}`}
                    aria-hidden={!active}
                    className={`col-start-1 row-start-1 transition-[opacity,transform,visibility] duration-500 ease-out ${
                      active
                        ? "visible translate-y-0 opacity-100 delay-150"
                        : "invisible translate-y-3 opacity-0"
                    }`}
                  >
                    <Title className="whitespace-pre-line text-[2rem] font-extrabold leading-[1.3] text-white sm:text-[2.5rem] lg:text-[clamp(2.25rem,3.4vw,3.25rem)] lg:leading-[1.25]">
                      {slide.title}
                    </Title>

                    {slide.subtitle && (
                      <p className="mt-5 max-w-xl text-base leading-8 text-white/80 lg:text-lg lg:leading-9">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.buttons && slide.buttons.length > 0 && (
                      <div className="mt-8 flex flex-wrap gap-3">
                        {slide.buttons.slice(0, 2).map((btn, idx) => (
                          <Link
                            key={idx}
                            href={btn.href}
                            className={`ri-btn ${
                              btn.variant === "primary"
                                ? "ri-btn-red"
                                : "ri-btn-outline-light"
                            }`}
                          >
                            {btn.text}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Controls ── */}
            {many && (
              <div className="mt-10 flex items-center justify-between gap-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-4">
                  <span
                    className="text-sm font-bold tabular-nums text-white"
                    dir="ltr"
                  >
                    {pad(current + 1)}
                    <span className="mx-1.5 text-white/35">/</span>
                    <span className="text-white/50">{pad(slides.length)}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {slides.map((slide, i) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrent(i)}
                        aria-label={`الشريحة ${i + 1}`}
                        aria-current={i === current}
                        className="group flex h-6 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <span
                          className={`relative block h-[3px] overflow-hidden bg-white/20 transition-[width] duration-300 group-hover:bg-white/40 ${
                            i === current ? "w-10" : "w-5"
                          }`}
                        >
                          {i === current && (
                            <span
                              key={`${current}-${isPaused}`}
                              className="hero-progress absolute inset-0 origin-right bg-brand-red"
                              style={{
                                animationDuration: `${INTERVAL_MS}ms`,
                                animationPlayState: isPaused
                                  ? "paused"
                                  : "running",
                              }}
                            />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="الشريحة السابقة"
                    className="flex h-11 w-11 items-center justify-center border border-white/25 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-brand-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="الشريحة التالية"
                    className="flex h-11 w-11 items-center justify-center border border-white/25 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-brand-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
