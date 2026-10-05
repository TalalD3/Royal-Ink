"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   PAGE HERO — header for the inner pages

   The cartridge label laid on its side: a black block (breadcrumb, title,
   intro and a visual) over a red strip carrying the page's key figures.
   ══════════════════════════════════════════════════════════════════════ */

export interface HeroFigure {
  value: string;
  label: string;
}

export function PageHero({
  crumb,
  eyebrow,
  title,
  lead,
  visual,
  figures,
  hideLeadOnPhone = true,
}: {
  /** Current page name, shown after "الرئيسية" */
  crumb: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Shown beside the title on desktop, under it on phones */
  visual?: React.ReactNode;
  figures: HeroFigure[];
  /** Phones skip the paragraph when the visual tells the story */
  hideLeadOnPhone?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-black text-white">
      {/* Print raster, strongest at the end side and fading to the middle */}
      <div
        aria-hidden="true"
        className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,#000,transparent_60%)]"
      />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-4 pb-4 pt-10 sm:gap-6 sm:pb-8 md:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:pb-12 lg:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <nav
              aria-label="مسار الصفحة"
              className="mb-5 flex items-center gap-2 text-sm text-white/55 sm:mb-8"
            >
              <Link href="/" className="transition-colors hover:text-white">
                الرئيسية
              </Link>
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-bold text-white">{crumb}</span>
            </nav>

            <p className="ri-eyebrow ri-eyebrow-light mb-3 sm:mb-5">{eyebrow}</p>
            <h1 className="text-balance text-[1.875rem] font-extrabold leading-[1.25] sm:text-[2.25rem] md:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            {lead && (
              <p
                className={`mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg md:leading-9 ${
                  hideLeadOnPhone ? "hidden sm:block" : ""
                }`}
              >
                {lead}
              </p>
            )}
          </motion.div>

          {visual}
        </div>
      </div>

      {/* Red strip — the figures, each centred number-over-label */}
      <div className="bg-brand-red">
        <div className="container mx-auto px-4">
          <motion.dl
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="mx-auto grid max-w-4xl gap-4 py-6 md:py-8"
            style={{ gridTemplateColumns: `repeat(${figures.length}, minmax(0, 1fr))` }}
          >
            {figures.map((f) => (
              <div
                key={f.label}
                className="flex flex-col-reverse items-center gap-2 text-center"
              >
                <dt className="text-xs leading-5 text-white/90 sm:text-sm md:text-base md:leading-6">
                  {f.label}
                </dt>
                <dd
                  dir="ltr"
                  className="text-3xl font-extrabold leading-none tabular-nums sm:text-4xl lg:text-5xl"
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}

export default PageHero;
