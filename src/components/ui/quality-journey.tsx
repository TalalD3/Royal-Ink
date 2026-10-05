"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { BadgeCheck, Check } from "lucide-react";
import { BlockReveal } from "@/components/ui/block-reveal";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   QUALITY JOURNEY — the inspection line

   The steps run down one line, grouped into stations. As the visitor
   scrolls, a red line fills, each step lights up in turn, and (on desktop)
   a sticky panel shows which station they are reading.
   ══════════════════════════════════════════════════════════════════════ */

export interface QualityStep {
  title: string;
  subtitle: string;
  description: string;
  /** Photo that shows the step */
  image: string;
  imageAlt: string;
}

export interface QualityPhase {
  title: string;
  english: string;
  description: string;
  steps: QualityStep[];
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "مرحلة واحدة" / "مرحلتان" / "3 مراحل" … */
function stepsLabel(n: number) {
  if (n === 1) return "مرحلة واحدة";
  if (n === 2) return "مرحلتان";
  if (n <= 10) return `${n} مراحل`;
  return `${n} مرحلة`;
}

export function QualityJourney({
  phases,
  intro,
  finish,
}: {
  phases: QualityPhase[];
  /** Section heading, shown in the sticky column */
  intro: React.ReactNode;
  /** Text for the final node after the last step */
  finish: { title: string; text: string };
}) {
  // Global step numbering across stations
  const flat = useMemo(
    () =>
      phases.flatMap((p, pi) =>
        p.steps.map((s) => ({ ...s, phase: pi }))
      ),
    [phases]
  );
  const firstIndexOf = useMemo(() => {
    let n = 0;
    return phases.map((p) => {
      const first = n;
      n += p.steps.length;
      return first;
    });
  }, [phases]);

  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The step crossing the middle of the screen is the active one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [flat.length]);

  // The red line follows the reading position
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 55%", "end 55%"],
  });
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const activePhase = flat[active]?.phase ?? 0;

  const goToPhase = (pi: number) => {
    stepRefs.current[firstIndexOf[pi]]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      {/* ─── Sticky column: heading + station tracker ─── */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        {intro}

        <ol className="mt-10 hidden space-y-2 lg:block">
          {phases.map((p, pi) => {
            const isActive = pi === activePhase;
            return (
              <li key={p.title}>
                <button
                  type="button"
                  onClick={() => goToPhase(pi)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex w-full items-start gap-4 px-5 py-4 text-start transition-colors duration-300",
                    isActive ? "bg-brand-black text-white" : "hover:bg-brand-mist"
                  )}
                >
                  <span
                    dir="ltr"
                    className={cn(
                      "pt-0.5 text-sm font-extrabold tabular-nums",
                      isActive ? "text-brand-red" : "text-brand-black/30"
                    )}
                  >
                    {pad2(pi + 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-lg font-extrabold",
                        isActive ? "text-white" : "text-brand-black/45"
                      )}
                    >
                      {p.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-sm leading-6",
                        isActive ? "text-white/70" : "text-brand-gray/60"
                      )}
                    >
                      {p.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "pt-1 text-xs font-bold",
                      isActive ? "text-white/60" : "text-brand-black/30"
                    )}
                  >
                    {stepsLabel(p.steps.length)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Overall progress */}
        <div className="mt-8 hidden lg:block">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-brand-gray">
            <span>
              المرحلة <span dir="ltr">{active + 1}</span> من{" "}
              <span dir="ltr">{flat.length}</span>
            </span>
            <span dir="ltr" className="tabular-nums">
              {Math.round(((active + 1) / flat.length) * 100)}%
            </span>
          </div>
          <div className="h-1 overflow-hidden bg-brand-line">
            <div
              className="h-full origin-right bg-brand-red transition-transform duration-500 ease-out"
              style={{ transform: `scaleX(${(active + 1) / flat.length})` }}
            />
          </div>
        </div>
      </div>

      {/* ─── The line ─── */}
      <div ref={listRef} className="relative">
        {/* Track + fill, through the centre of the step nodes */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 right-[21px] top-2 w-0.5 bg-brand-line"
        />
        <motion.div
          aria-hidden="true"
          style={{ scaleY: lineScale }}
          className="absolute bottom-6 right-[21px] top-2 w-0.5 origin-top bg-brand-red"
        />

        {phases.map((p, pi) => (
          <div key={p.title} className="relative">
            {/* Station label */}
            <div className="relative mb-5 flex items-center gap-3 ps-16">
              <span
                aria-hidden="true"
                className="absolute right-[15px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 bg-brand-black"
              />
              <span className="text-xs font-extrabold text-brand-red">
                المحطة <span dir="ltr">{pad2(pi + 1)}</span>
              </span>
              <span className="text-sm font-extrabold text-brand-black">
                {p.title}
              </span>
              <span
                dir="ltr"
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gray/70"
              >
                {p.english}
              </span>
            </div>

            {p.steps.map((s, si) => {
              const i = firstIndexOf[pi] + si;
              const isActive = i === active;
              const isDone = i < active;
              return (
                <div
                  key={s.title}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  data-index={i}
                  className="relative pb-6 ps-16 last:pb-10"
                >
                  {/* Node — a square, like the logo's blocks */}
                  <span
                    className={cn(
                      "absolute right-0 top-5 flex h-11 w-11 items-center justify-center text-sm font-extrabold tabular-nums transition-colors duration-300",
                      isActive
                        ? "bg-brand-red text-white"
                        : isDone
                        ? "bg-brand-black text-white"
                        : "bg-white text-brand-gray ring-1 ring-inset ring-brand-line"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <span dir="ltr">{pad2(i + 1)}</span>
                    )}
                  </span>

                  {/* Step: copy + photo (photo first on phones) */}
                  <div
                    className={cn(
                      "grid grid-cols-1 gap-5 p-5 transition-colors duration-300 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center sm:p-6 md:grid-cols-[minmax(0,1fr)_240px]",
                      isActive && "bg-brand-mist"
                    )}
                  >
                    <div className="min-w-0">
                      <p
                        dir="ltr"
                        className="text-right text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gray"
                      >
                        {s.subtitle}
                      </p>
                      <h3 className="mt-1.5 text-lg font-extrabold leading-8 text-brand-black sm:text-xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-7 text-brand-gray">
                        {s.description}
                      </p>
                    </div>

                    <div className="ri-crop order-first sm:order-none">
                      <BlockReveal className="aspect-[16/10] bg-brand-black">
                        <Image
                          src={s.image}
                          alt={s.imageAlt}
                          fill
                          sizes="(min-width: 768px) 240px, (min-width: 640px) 200px, 100vw"
                          className={cn(
                            "object-cover transition-[filter,transform] duration-700 ease-out",
                            isActive ? "scale-100 grayscale-0" : "scale-[1.04] grayscale"
                          )}
                        />
                      </BlockReveal>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Finish */}
        <div className="relative flex items-center gap-4 ps-16">
          <span className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-brand-red text-white">
            <BadgeCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="px-5 sm:px-6">
            <p className="text-lg font-extrabold text-brand-black">{finish.title}</p>
            <p className="text-sm text-brand-gray">{finish.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QualityJourney;
