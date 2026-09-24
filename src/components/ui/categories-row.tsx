"use client";

import React from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

/* ── Category data (8 essential printer & consumables categories) ── */
interface Category {
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: Category[] = [
  {
    label: "تونر",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="7" cy="9" r="0.75" fill="currentColor" />
        <line x1="11" y1="9" x2="17" y2="9" />
      </svg>
    ),
  },
  {
    label: "خراطيش",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12v5l2 2v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10l2-2V3z" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <rect x="8" y="12" width="8" height="5" rx="1" />
        <path d="M10 20v1.5m4-1.5v1.5" />
      </svg>
    ),
  },
  {
    label: "حبر",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 3h6v3H9z" />
        <path d="M10 6v3l-4 3v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8l-4-3V6" />
        <path d="M6 15c2-1 4-1 6 0s4 1 6 0" />
      </svg>
    ),
  },
  {
    label: "درام",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="8" width="20" height="8" rx="4" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <line x1="8" y1="12" x2="16" y2="12" strokeDasharray="2 2" />
        <path d="M4 6h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "فيوزر",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="6" rx="3" />
        <rect x="3" y="13" width="18" height="6" rx="3" />
        <path d="M8 8h8" strokeDasharray="1.5 1.5" />
        <circle cx="19" cy="8" r="0.75" fill="currentColor" />
        <circle cx="19" cy="16" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "أشرطة ريبون",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="8" cy="12" r="2.5" />
        <circle cx="16" cy="12" r="2.5" />
        <circle cx="8" cy="12" r="0.75" fill="currentColor" />
        <circle cx="16" cy="12" r="0.75" fill="currentColor" />
        <path d="M8 14.5h8" />
      </svg>
    ),
  },
  {
    label: "قطع غيار",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    label: "طابعات",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="10" width="18" height="10" rx="2" />
        <path d="M7 10V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6" />
        <rect x="7" y="15" width="10" height="6" rx="1" />
        <circle cx="18" cy="13" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
];

/* ── Component ── */
export function CategoriesRow() {
  return (
    <section className="w-full bg-background border-b border-border/40 py-3 sm:py-4 md:py-5 overflow-hidden relative">
      {/* Strict Container: exactly matches BrandsSlider container boundaries */}
      <div className="container mx-auto px-4">
        <div className="relative w-full overflow-hidden">
          {/* Edge gradient masks for seamless fade out within container boundaries */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 md:w-28 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 md:w-28 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

          {/* LTR wrapper with reverse=true moves categories in the OPPOSITE direction of brands */}
          <div dir="ltr" className="w-full">
            <InfiniteSlider
              gap={32}
              speed={28}
              speedOnHover={14}
              reverse={true}
              className="w-full py-1.5"
            >
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.label}
                  className="group flex flex-col items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 select-none shrink-0 cursor-default transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Icon Container — completely borderless, smooth modern rounded shape */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-muted/40 flex items-center justify-center text-foreground/75 transition-all duration-300 ease-out group-hover:bg-primary/10 group-hover:text-primary group-hover:shadow-sm">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-colors duration-300">
                      {cat.icon}
                    </div>
                  </div>

                  {/* Label — no border, clean typography */}
                  <span className="text-xs sm:text-sm font-bold text-foreground/80 transition-colors duration-300 group-hover:text-primary whitespace-nowrap text-center">
                    {cat.label}
                  </span>
                </div>
              ))}
            </InfiniteSlider>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoriesRow;
