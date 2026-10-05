"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import type { CertificateItem } from "@/data/certificates";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   CERTIFICATES EXPLORER

   The logos stand free (no tiles). Every 3 seconds the focus moves to the
   next one — it sits on a black square — and the black panel reads out its
   definition. Clicking a logo holds the focus there; clicking anywhere
   else on the page lets the loop carry on. Hovering a logo turns it red.
   ══════════════════════════════════════════════════════════════════════ */

const pad2 = (n: number) => String(n).padStart(2, "0");
const CYCLE_MS = 3000;

/** The logo as a solid shape in the current text colour (via CSS mask),
    so it can turn black, white or red */
export function LogoShape({ src, className }: { src: string; className?: string }) {
  const url = `url("${encodeURI(src)}")`;
  return (
    <span
      aria-hidden="true"
      className={cn("block bg-current transition-colors duration-200", className)}
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function CertificatesExplorer({
  certificates,
}: {
  certificates: CertificateItem[];
}) {
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const reduced = useReducedMotion();
  const tilesRef = useRef<HTMLDivElement>(null);
  const n = certificates.length;

  // The loop: one step every 3 seconds, unless a logo was picked
  useEffect(() => {
    if (locked || reduced || n < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % n), CYCLE_MS);
    return () => clearTimeout(t);
  }, [index, locked, reduced, n]);

  // A click anywhere outside the logos releases the hold
  useEffect(() => {
    if (!locked) return;
    const onDown = (e: PointerEvent) => {
      if (!tilesRef.current?.contains(e.target as Node)) setLocked(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [locked]);

  const c = certificates[index];
  if (!c) return null;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
      {/* ─── The definition, on black ─── */}
      <div className="ri-crop">
        <div
          aria-live="polite"
          className="relative flex min-h-[300px] flex-col overflow-hidden bg-brand-black p-7 text-white sm:p-9"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-1 flex-col"
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  dir="ltr"
                  className="text-sm font-extrabold tracking-wider text-brand-red"
                >
                  {c.code}
                </span>
                <span dir="ltr" className="text-xs font-bold tabular-nums text-white/40">
                  {pad2(index + 1)} / {pad2(n)}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold leading-snug md:text-[1.75rem]">
                {c.title}
              </h3>
              {c.englishTitle && (
                <p
                  dir="ltr"
                  className="mt-1.5 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-white/45"
                >
                  {c.englishTitle}
                </p>
              )}
              <p className="mt-5 text-[15px] leading-8 text-white/75">{c.description}</p>
              {c.badge && (
                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 text-xs font-bold">
                    <BadgeCheck className="h-4 w-4 text-brand-red" aria-hidden="true" />
                    {c.badge}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Loop timer — hidden while a logo is held */}
          {!locked && !reduced && (
            <span
              aria-hidden="true"
              key={index}
              className="hero-progress absolute inset-x-0 bottom-0 h-1 origin-right bg-brand-red"
              style={{ animationDuration: `${CYCLE_MS}ms` }}
            />
          )}
        </div>
      </div>

      {/* ─── The logos, free-standing (above the panel on phones) ─── */}
      <div
        ref={tilesRef}
        role="tablist"
        aria-label="الشهادات والاعتمادات"
        className="order-first grid grid-cols-5 gap-x-1 gap-y-2 sm:gap-3 lg:order-none"
      >
        {certificates.map((cert, i) => {
          const isActive = i === index;
          return (
            <button
              key={cert.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={cert.code}
              onClick={() => {
                setIndex(i);
                setLocked(true);
              }}
              className={cn(
                "group flex aspect-square flex-col items-center justify-center gap-2 p-1.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red sm:p-3",
                isActive
                  ? "bg-brand-black text-white"
                  : "text-brand-black hover:text-brand-red"
              )}
            >
              <LogoShape src={cert.logo} className="h-[78%] w-[86%] sm:h-[62%] sm:w-[72%]" />
              <span
                dir="ltr"
                className={cn(
                  "hidden max-w-full truncate text-[10px] font-bold sm:block",
                  isActive ? "text-white" : "text-brand-gray group-hover:text-brand-red"
                )}
              >
                {cert.code}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CertificatesExplorer;
