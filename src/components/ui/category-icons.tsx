import React from "react";
import type { ProductCategory } from "@/types/product";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   CATEGORY ICONS — one family: 24px grid, 1.5 stroke, square caps and
   mitred joins (the logo's square corners). Used by the home category
   row and the compatibility guide.
   ══════════════════════════════════════════════════════════════════════ */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className="h-full w-full"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<ProductCategory, React.ReactNode> = {
  toner: (
    <Icon>
      {/* Laser cartridge: long body, carry handle, label window */}
      <path d="M2.5 9.5h19v7.5h-19z" />
      <path d="M7 9.5V6.5h10v3" />
      <path d="M5.5 13.25h8" />
      <path d="M16.5 12h2.5v2.5h-2.5z" />
    </Icon>
  ),
  cartridge: (
    <Icon>
      {/* Inkjet cartridge with an ink drop */}
      <path d="M5.5 4.5h13v14h-13z" />
      <path d="M10 18.5v2.5h4v-2.5" />
      <path d="M12 8c1.4 1.7 2.1 2.8 2.1 3.9a2.1 2.1 0 0 1-4.2 0c0-1.1.7-2.2 2.1-3.9z" />
    </Icon>
  ),
  ink: (
    <Icon>
      {/* Refill bottle */}
      <path d="M10 2.5h4v3h-4z" />
      <path d="M10 5.5 7.5 9v12h9V9L14 5.5" />
      <path d="M7.5 13h9M7.5 17.5h9" />
    </Icon>
  ),
  drum_unit: (
    <Icon>
      {/* Drum: a cylinder on its axle */}
      <ellipse cx="6.5" cy="12" rx="2" ry="5" />
      <path d="M6.5 7h11M6.5 17h11" />
      <path d="M17.5 7c1.1 0 2 2.2 2 5s-.9 5-2 5" />
      <path d="M2 12h2.5M19.5 12h2.5" />
    </Icon>
  ),
  fuser: (
    <Icon>
      {/* Fuser: two rollers under heat */}
      <path d="M3 10.5h18v9H3z" />
      <circle cx="9" cy="15" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path d="M8 7.5c0-1.2 1-1.3 1-2.5M12 7.5c0-1.2 1-1.3 1-2.5M16 7.5c0-1.2 1-1.3 1-2.5" />
    </Icon>
  ),
  ribbon: (
    <Icon>
      {/* Ribbon cassette: two spools and the tape */}
      <path d="M2.5 6.5h19v11h-19z" />
      <circle cx="8" cy="12" r="2.25" />
      <circle cx="16" cy="12" r="2.25" />
      <path d="M8 14.25h8" />
    </Icon>
  ),
  spare_parts: (
    <Icon>
      {/* Gear with square teeth */}
      <path d="M10.37 5.19L10.39 2.89L13.61 2.89L13.63 5.19L15.66 6.04L17.31 4.42L19.58 6.69L17.96 8.34L18.81 10.37L21.11 10.39L21.11 13.61L18.81 13.63L17.96 15.66L19.58 17.31L17.31 19.58L15.66 17.96L13.63 18.81L13.61 21.11L10.39 21.11L10.37 18.81L8.34 17.96L6.69 19.58L4.42 17.31L6.04 15.66L5.19 13.63L2.89 13.61L2.89 10.39L5.19 10.37L6.04 8.34L4.42 6.69L6.69 4.42L8.34 6.04z" />
      <circle cx="12" cy="12" r="2.75" />
    </Icon>
  ),
  printer: (
    <Icon>
      {/* Printer with a sheet coming out */}
      <path d="M6.5 8.5V3h11v5.5" />
      <path d="M2.5 8.5h19v8h-19z" />
      <path d="M6.5 13.5h11V21h-11z" />
      <path d="M17.5 11h1" />
    </Icon>
  ),
};

export function CategoryIcon({
  category,
  className,
}: {
  category: ProductCategory;
  className?: string;
}) {
  return <span className={cn("block", className)}>{ICONS[category]}</span>;
}

export default CategoryIcon;
