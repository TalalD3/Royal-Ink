"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft, Check, Search } from "lucide-react";

/* ── Printer → cartridge pairs, all taken from the Royal Ink catalogue ── */
interface Match {
  printer: string;
  code: string;
  kind: string;
}

const MATCHES: Match[] = [
  { printer: "HP LaserJet Pro M404dn", code: "59A", kind: "تونر متوافق" },
  { printer: "Canon i-SENSYS LBP6030", code: "CRG-725", kind: "تونر متوافق" },
  { printer: "Epson EcoTank L3150", code: "103", kind: "حبر متوافق" },
  { printer: "Brother HL-L2340DW", code: "TN-2305", kind: "تونر متوافق" },
  { printer: "Kyocera ECOSYS M2040dn", code: "TK-1170", kind: "تونر متوافق" },
  { printer: "Pantum P2500W", code: "PC-211EV", kind: "تونر متوافق" },
];

const TYPE_MS = 60; // per character
const HOLD_MS = 2600; // how long a match stays on screen

type Phase = "typing" | "matched" | "clearing";

/* ── The live matcher ──
   A search bar types a printer model, the compatible cartridge snaps in as
   a two-block label (white + red, the logo's own construction), then it
   clears and moves to the next one. The whole thing opens the guide. */
function CompatibilityMatcher() {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  const match = MATCHES[index];

  useEffect(() => {
    // Reduced motion: show one finished match, no loop
    if (reduced) {
      setCount(match.printer.length);
      setPhase("matched");
      return;
    }
    if (!inView) return;

    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      timer =
        count < match.printer.length
          ? setTimeout(() => setCount((c) => c + 1), TYPE_MS)
          : setTimeout(() => setPhase("matched"), 320);
    } else if (phase === "matched") {
      timer = setTimeout(() => setPhase("clearing"), HOLD_MS);
    } else {
      timer =
        count > 0
          ? setTimeout(() => setCount((c) => Math.max(0, c - 2)), 22)
          : setTimeout(() => {
              setIndex((i) => (i + 1) % MATCHES.length);
              setPhase("typing");
            }, 380);
    }
    return () => clearTimeout(timer);
  }, [phase, count, match.printer.length, inView, reduced]);

  return (
    <Link
      ref={ref}
      href="/compatibility"
      aria-label="افتح دليل التوافق وابحث عن طابعتك"
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <div aria-hidden="true" className="select-none">
        {/* Search bar */}
        <div className="flex h-14 items-center gap-3 bg-white pe-2 ps-5 text-brand-black shadow-[0_20px_44px_-20px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:-translate-y-0.5 lg:h-16 lg:ps-6">
          <Search className="h-5 w-5 shrink-0 text-brand-gray" />
          <span
            dir="ltr"
            className="min-w-0 flex-1 truncate text-right text-[15px] font-bold lg:text-base"
          >
            {match.printer.slice(0, count)}
            <span className="matcher-caret" />
          </span>
          {/* Black disc (red on hover): on desktop this end of the bar faces
              the red half, so it must not be red itself */}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-black text-white transition-colors duration-200 group-hover:bg-brand-red lg:h-12 lg:w-12">
            <ArrowLeft className="h-[18px] w-[18px]" />
          </span>
        </div>

        {/* Match — fixed height so nothing below moves */}
        <div className="mt-4 h-14 lg:mt-5 lg:h-16">
          <AnimatePresence mode="wait">
            {phase === "matched" && (
              <motion.div
                key={match.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex h-full overflow-hidden"
              >
                {/* Red block first (right-hand end), so on desktop the red
                    sits away from the section's red half — wipes in from
                    where it meets the white block */}
                <span className="relative flex flex-[36] items-center justify-center overflow-hidden">
                  <motion.span
                    initial={{ scaleX: reduced ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                    className="absolute inset-0 origin-left bg-brand-red"
                  />
                  <motion.span
                    dir="ltr"
                    initial={{ opacity: reduced ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.3 }}
                    className="relative whitespace-nowrap px-2 text-lg font-extrabold text-white lg:text-xl"
                  >
                    {match.code}
                  </motion.span>
                </span>

                {/* White block */}
                <span className="flex min-w-0 flex-[64] items-center gap-2.5 bg-white px-4 text-brand-black lg:px-5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-brand-black text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                  <span className="truncate text-[15px] font-extrabold lg:text-base">
                    {match.kind}
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Link>
  );
}

/* The logo at page scale, mirrored from the hero: a red block on the left
   and a black block on the right, edge to edge. Copy on the red; the live
   matcher on the black (on phones it sits across the seam between the two,
   the way the hero photo does). */
export function CompatibilityTeaserSection() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-red text-white">
      {/* Black block — right-hand 40% on desktop */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 hidden w-[40%] bg-brand-black lg:block"
      >
        <div className="ri-raster absolute inset-0 [mask-image:linear-gradient(to_left,#000,transparent_75%)]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid items-center lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Copy, on the red block (left column on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="pb-9 pt-14 md:pt-20 lg:order-2 lg:py-28 lg:ps-16"
          >
            <p className="ri-eyebrow ri-eyebrow-onred mb-5">دليل التوافق</p>

            <h2 className="text-[1.75rem] font-extrabold leading-[1.3] text-white md:text-[2.375rem] lg:text-[2.75rem]">
              ابحث عن الحبر المتوافق
              <br />
              تماماً مع طابعتك
            </h2>

            <p className="mt-5 hidden max-w-xl text-base font-medium leading-8 text-white sm:block md:text-[17px]">
              أدخل موديل طابعتك أو رمز الخرطوشة، واحصل فوراً على المنتج المتوافق
              المضمون من روايال إنك — بلا حيرة، وبلا خطأ في الاختيار.
            </p>

            <Link
              href="/compatibility"
              className="ri-btn ri-btn-white mt-9 hidden lg:inline-flex"
            >
              <span>افتح دليل التوافق الكامل</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Live matcher (right column, on the black block, on desktop) */}
          <div className="relative -mx-4 px-4 pb-12 md:pb-16 lg:order-1 lg:mx-0 lg:px-0 lg:pb-0 lg:pe-16 xl:pe-24">
            {/* Phones: the black block starts at the middle of the search bar */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 top-7 -z-10 bg-brand-black lg:hidden"
            />

            <div className="mx-auto w-full max-w-md lg:mx-0">
              <CompatibilityMatcher />

              <Link
                href="/compatibility"
                className="ri-btn ri-btn-red mt-6 w-full lg:hidden"
              >
                <span>افتح دليل التوافق الكامل</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
