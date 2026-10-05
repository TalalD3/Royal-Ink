"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   BLOCK REVEAL — the label wipe

   When it scrolls into view, the content is uncovered by the logo's two
   blocks: a black block slides away first, then a red one behind it.
   ══════════════════════════════════════════════════════════════════════ */

const EASE = [0.77, 0, 0.18, 1] as const;

export function BlockReveal({
  children,
  className,
  style,
  delay = 0,
  /** Reveal on mount instead of when scrolled into view */
  immediate = false,
  /** In-view margin, e.g. a negative side margin for content that slides in sideways */
  margin = "-12% 0px",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  immediate?: boolean;
  margin?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style}>{children}</div>;

  const trigger = immediate
    ? { animate: { scaleX: 0 } }
    : { whileInView: { scaleX: 0 }, viewport: { once: true, margin } };

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      {children}
      {/* Red block (behind), then black block (in front) — both slide off
          towards the end side */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 1 }}
        {...trigger}
        transition={{ duration: 0.75, ease: EASE, delay: delay + 0.18 }}
        className="pointer-events-none absolute inset-0 z-10 origin-left bg-brand-red"
      />
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 1 }}
        {...trigger}
        transition={{ duration: 0.75, ease: EASE, delay }}
        className="pointer-events-none absolute inset-0 z-20 origin-left bg-brand-black"
      />
    </div>
  );
}

export default BlockReveal;
