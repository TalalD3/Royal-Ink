"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  Phone,
  ExternalLink,
  Search,
  Maximize2,
  Minimize2,
  Info,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  algeriaWilayas,
  ALGERIA_VIEWBOX_FULL,
  ALGERIA_VIEWBOX_HOME,
  type WilayaData,
} from "@/data/algeria-wilayas";
import {
  type Distributor,
  badgeConfig,
  getDistributorsByWilaya,
  distributors,
} from "@/data/distributors";

/* ══════════════════════════════════════════════════════════════════════
   MAP CONSTANTS & HELPERS
   ══════════════════════════════════════════════════════════════════════ */

/** Codes of wilayas that currently have distributors */
const ACTIVE_WILAYA_CODES = new Set(distributors.map((d) => d.wilayaCode));

/* ──────────────────────────────────────────────────────────────────────
   TOP INFO HEADER BAR (PLACED CLEANLY ABOVE THE MAP — ZERO OVERLAP)
   Shows live information of whichever wilaya is hovered or selected.
   ────────────────────────────────────────────────────────────────────── */

function WilayaInfoHeader({
  activeWilaya,
  distributorCount,
}: {
  activeWilaya: WilayaData | null;
  distributorCount: number;
}) {
  const isHQ = activeWilaya?.code === 19;
  const hasDistributors = distributorCount > 0;

  return (
    <div className="flex flex-col items-start sm:items-end justify-center text-right min-h-[58px]">
      <AnimatePresence mode="wait">
        {activeWilaya ? (
          <motion.div
            key={activeWilaya.code}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-start sm:items-end"
          >
            {/* Country micro-label */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                ALGERIA
              </span>
            </div>

            {/* Wilaya Name and Code */}
            <div className="flex items-baseline gap-2.5">
              <h3
                className={`text-lg md:text-2xl font-black tracking-tight ${
                  isHQ
                    ? "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                    : hasDistributors
                    ? "text-primary drop-shadow-[0_0_10px_rgba(225,29,72,0.25)]"
                    : "text-foreground"
                }`}
              >
                {activeWilaya.nameAr}
              </h3>
              <span className="text-xs md:text-sm font-semibold text-muted-foreground/80">
                {activeWilaya.nameFr}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/80">
                W.{String(activeWilaya.code).padStart(2, "0")}
              </span>
            </div>

            {/* Status pill */}
            <div className="mt-1">
              {isHQ ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                  <Building2 className="w-3 h-3" />
                  المقر الرئيسي لـ Royal Ink
                </span>
              ) : hasDistributors ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                  <MapPin className="w-3 h-3" />
                  {distributorCount} نقاط بيع معتمدة
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 px-2 py-0.5 rounded-full bg-muted/50">
                  التوصيل متوفر لجميع البلديات
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          /* Default state when nothing hovered */
          <motion.div
            key="idle-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-start sm:items-end"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                ALGERIA
              </span>
            </div>
            <h3 className="text-base md:text-xl font-bold text-foreground">
              شبكة التوزيع الوطنية
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              مرر الفأرة أو انقر على أي ولاية لاكتشاف تفاصيلها
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   VIEW TOGGLE BUTTONS (FULL COUNTRY vs NORTHERN ZOOM)
   ────────────────────────────────────────────────────────────────────── */

function ViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: "full" | "north";
  setViewMode: (v: "full" | "north") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-muted/40 p-1 rounded-full shrink-0">
      <button
        onClick={() => setViewMode("north")}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
          viewMode === "north"
            ? "bg-primary text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="تركيز على ولايات الشمال (شبكة التوزيع)"
      >
        <Minimize2 className="w-3 h-3" />
        <span>شمال الجزائر</span>
      </button>

      <button
        onClick={() => setViewMode("full")}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
          viewMode === "full"
            ? "bg-primary text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="عرض خريطة الجزائر كاملة"
      >
        <Maximize2 className="w-3 h-3" />
        <span>كامل القطر</span>
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   ANIMATED SVG PINS (Rendered directly in SVG coordinate space)
   - Zero text when idle: map is clean
   - Text appears ONLY when hovered
   - Stable hit area to prevent any jitter
   ────────────────────────────────────────────────────────────────────── */

function SvgPin({
  wilaya,
  isSelected,
  isHovered = false,
  distributorCount,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  wilaya: WilayaData;
  isSelected: boolean;
  isHovered?: boolean;
  distributorCount: number;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const isHQ = wilaya.code === 19;
  const { x, y } = wilaya.pin;
  const active = isSelected || isHovered;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`${wilaya.nameAr} - ${
        isHQ ? "المقر الرئيسي" : `${distributorCount} نقطة بيع`
      }`}
    >
      {/* Stable fixed-radius hit target — ensures 100% rock-solid mouse tracking with zero jitter */}
      <circle r={18} fill="transparent" />

      {/* Pulse wave ring with smooth SVG native animation and pointer-events-none */}
      <circle
        r={isHQ ? 7 : 5}
        fill={isHQ ? "rgba(245, 158, 11, 0.45)" : "rgba(225, 29, 72, 0.4)"}
        style={{ pointerEvents: "none" }}
      >
        <animate
          attributeName="r"
          values={isHQ ? "7; 26; 7" : "5; 18; 5"}
          dur={isHQ ? "2.2s" : "3s"}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.85; 0; 0.85"
          dur={isHQ ? "2.2s" : "3s"}
          repeatCount="indefinite"
        />
      </circle>

      {/* Static halo */}
      <circle
        r={isHQ ? (active ? 15 : 12) : (active ? 10 : 8)}
        fill={isHQ ? "rgba(245, 158, 11, 0.35)" : "rgba(225, 29, 72, 0.28)"}
        style={{ pointerEvents: "none", transition: "r 0.25s ease" }}
      />

      {/* Pin core circle */}
      <circle
        r={isHQ ? (active ? 9 : 7.5) : (active ? 7 : 5.5)}
        fill={isHQ ? "#f59e0b" : "#e11d48"}
        stroke="#ffffff"
        strokeWidth={isHQ ? 2 : 1.5}
        filter={isHQ ? "url(#glowHQ)" : "url(#glowPin)"}
        style={{ pointerEvents: "none", transition: "r 0.2s ease" }}
      />

      {/* HQ Inner Dot */}
      <circle
        r={isHQ ? 2.5 : 1.5}
        fill="#ffffff"
        style={{ pointerEvents: "none" }}
      />

      {/* Floating Badge Label — ONLY APPEARS ON HOVER (Map is 100% clean by default) */}
      {isHovered && (
        <g transform="translate(0, -15)" style={{ pointerEvents: "none" }}>
          <rect
            x={isHQ ? -34 : -26}
            y={-15}
            width={isHQ ? 68 : 52}
            height={17}
            rx={8.5}
            fill={isHQ ? "#d97706" : "#e11d48"}
            filter="drop-shadow(0 2px 5px rgba(0,0,0,0.35))"
          />
          <text
            x={0}
            y={-3.5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={9}
            fontWeight="bold"
            fontFamily="inherit"
          >
            {isHQ ? "سطيف HQ" : wilaya.nameAr}
          </text>
        </g>
      )}
    </g>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   DISTRIBUTOR CARD (Shown on the /find-us page when a city is selected)
   ────────────────────────────────────────────────────────────────────── */

function DistributorCard({
  distributor,
  index,
}: {
  distributor: Distributor;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const badge = badgeConfig[distributor.badge];
  const isHQ = distributor.badge === "headquarters";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`rounded-2xl transition-all duration-200 overflow-hidden w-full ${
        isHQ
          ? "bg-amber-500/[0.08] hover:bg-amber-500/[0.12]"
          : "bg-muted/40 hover:bg-muted/60"
      }`}
    >
      {/* ─── CARD HEADER (COLLAPSED VIEW) ─── */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-3.5 sm:px-4 sm:py-3 cursor-pointer select-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2.5">
          {/* Badge & Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  isHQ
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <span>{badge.icon}</span>
                <span>{badge.labelAr}</span>
              </span>
            </div>

            <h4 className="text-xs md:text-sm font-bold text-foreground leading-snug line-clamp-2">
              {distributor.name}
            </h4>
          </div>

          {/* Button without background (bottom-left on mobile, inline on desktop) */}
          <div className="flex justify-end shrink-0 pt-0.5 sm:pt-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
            >
              <span>{isExpanded ? "عرض أقل" : "عرض المزيد"}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── EXPANDABLE DETAILS (CONTACTS, ADDRESS, MAP LINK) ─── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-foreground/[0.06] space-y-2.5">
              {/* Phone numbers */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                {distributor.phones.map((phone, i) => (
                  <a
                    key={i}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-foreground hover:text-primary transition-colors py-0.5"
                    dir="ltr"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <span>{phone}</span>
                  </a>
                ))}
              </div>

              {/* Address / Location note */}
              {distributor.note && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{distributor.note}</span>
                </div>
              )}

              {/* Google Maps Link */}
              {distributor.locationUrl && (
                <div className="pt-1">
                  <a
                    href={distributor.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>الموقع الجغرافي على الخريطة (Google Maps)</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ALGERIA MAP PREVIEW (Home Page Section)
   
   - Focus on North of Algeria by default (on mount and refresh)
   - Zero text overlaying the map: information bar is cleanly above the map
   - Map is free-floating with no enclosing card borders
   - Pins show labels only on hover
   ══════════════════════════════════════════════════════════════════════ */

export function AlgeriaMapPreview() {
  const [hoveredWilaya, setHoveredWilaya] = useState<WilayaData | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<WilayaData | null>(null);

  const activeWilayasWithDistributors = useMemo(
    () => algeriaWilayas.filter((w) => ACTIVE_WILAYA_CODES.has(w.code)),
    []
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none">
      {/* Ethereal background ambient glow (no rectangular borders) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[85%] h-[75%] rounded-full bg-gradient-to-tr from-primary/10 via-amber-500/5 to-rose-500/10 blur-3xl opacity-60 dark:opacity-40" />
      </div>

      {/* ─── FLOATING SVG MAP (TRIMMED & FADING SMOOTHLY AT BOTTOM) ─── */}
      <div
        className="relative w-full mx-auto aspect-[1.55/1] max-h-[550px] md:max-h-[620px]"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)",
        }}
      >
        <svg
          viewBox={ALGERIA_VIEWBOX_HOME}
          className="w-full h-full filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* HQ Golden Glow Filter */}
            <filter id="glowHQ" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor="#f59e0b"
                floodOpacity="0.8"
              />
            </filter>

            {/* Pin Glow Filter */}
            <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#e11d48"
                floodOpacity="0.7"
              />
            </filter>

            {/* Wilaya Highlight Glow */}
            <filter
              id="wilayaHoverGlow"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#f59e0b"
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          {/* 58 Wilaya Polygons */}
          <g id="wilayas-group">
            {algeriaWilayas.map((wilaya) => {
              const isHQ = wilaya.code === 19;
              const hasDistributors = ACTIVE_WILAYA_CODES.has(wilaya.code);
              const isHovered = hoveredWilaya?.code === wilaya.code;
              const isSelected = selectedWilaya?.code === wilaya.code;

              let fill = "#1e2430"; // Sleek dark slate base
              let stroke = "rgba(255, 255, 255, 0.15)";
              let strokeWidth = 0.6;
              let filter = "none";

              if (isHQ) {
                fill = isHovered || isSelected ? "#f59e0b" : "#854d0e";
                stroke = "#fbbf24";
                strokeWidth = 1.2;
                if (isHovered || isSelected) {
                  filter = "url(#wilayaHoverGlow)";
                }
              } else if (hasDistributors) {
                fill =
                  isHovered || isSelected
                    ? "#e11d48"
                    : "rgba(225, 29, 72, 0.28)";
                stroke = isHovered ? "#ffffff" : "rgba(225, 29, 72, 0.5)";
                strokeWidth = isHovered ? 1.2 : 0.8;
                if (isHovered) {
                  filter = "url(#wilayaHoverGlow)";
                }
              } else if (isHovered || isSelected) {
                fill = "#f59e0b";
                stroke = "#ffffff";
                strokeWidth = 1.2;
                filter = "url(#wilayaHoverGlow)";
              }

              return (
                <path
                  key={wilaya.id}
                  id={wilaya.id}
                  d={wilaya.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  filter={filter}
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredWilaya(wilaya)}
                  onMouseLeave={() => setHoveredWilaya(null)}
                  onClick={() =>
                    setSelectedWilaya((prev) =>
                      prev?.code === wilaya.code ? null : wilaya
                    )
                  }
                />
              );
            })}
          </g>

          {/* Active Distributor Pins (Sétif HQ, Algiers, Oran, Constantine, etc.) */}
          <g id="pins-group">
            {activeWilayasWithDistributors.map((wilaya) => {
              const count = getDistributorsByWilaya(wilaya.code).length;
              const isSelected = selectedWilaya?.code === wilaya.code;
              const isHovered = hoveredWilaya?.code === wilaya.code;
              return (
                <SvgPin
                  key={`pin-${wilaya.code}`}
                  wilaya={wilaya}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  distributorCount={count}
                  onMouseEnter={() => setHoveredWilaya(wilaya)}
                  onMouseLeave={() => setHoveredWilaya(null)}
                  onClick={() =>
                    setSelectedWilaya((prev) =>
                      prev?.code === wilaya.code ? null : wilaya
                    )
                  }
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ALGERIA MAP INTERACTIVE (Find Us Page — /find-us)
   
   - Focus on North of Algeria by default (on mount and refresh)
   - Filter pills removed: Search bar is clean and sufficient
   - Live information header sits cleanly above the map
   - Map is 100% clean of text by default (labels only on hover)
   - Soft, gentle scroll when selecting a wilaya
   ══════════════════════════════════════════════════════════════════════ */

export function AlgeriaMapInteractive() {
  // Clean initial state: no wilaya pre-selected, no text clutter on map
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number | null>(null);
  const [hoveredWilaya, setHoveredWilaya] = useState<WilayaData | null>(null);
  // Default to Northern Algeria zoom on mount and refresh
  const [viewMode, setViewMode] = useState<"full" | "north">("north");
  const [searchQuery, setSearchQuery] = useState("");
  const infoPanelRef = useRef<HTMLDivElement>(null);

  const activeWilayasWithDistributors = useMemo(
    () => algeriaWilayas.filter((w) => ACTIVE_WILAYA_CODES.has(w.code)),
    []
  );

  const selectedWilaya = useMemo(
    () =>
      selectedWilayaCode
        ? algeriaWilayas.find((w) => w.code === selectedWilayaCode) || null
        : null,
    [selectedWilayaCode]
  );

  const currentDistributors = useMemo(
    () => (selectedWilayaCode ? getDistributorsByWilaya(selectedWilayaCode) : []),
    [selectedWilayaCode]
  );

  const currentHoverOrSelected = hoveredWilaya || selectedWilaya || null;

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return algeriaWilayas
      .filter(
        (w) =>
          w.nameAr.includes(q) ||
          w.nameFr.toLowerCase().includes(q) ||
          String(w.code) === q
      )
      .slice(0, 6);
  }, [searchQuery]);

  const handleSelectWilaya = (code: number) => {
    setSelectedWilayaCode((prev) => (prev === code ? null : code));
    setSearchQuery("");

    // Gentle, soft scroll that reveals the cards without pushing the map out of view
    setTimeout(() => {
      if (infoPanelRef.current) {
        const rect = infoPanelRef.current.getBoundingClientRect();
        // If panel is off-screen below, scroll gently just enough to peek it comfortably
        if (rect.top > window.innerHeight - 150) {
          window.scrollBy({
            top: rect.top - (window.innerHeight - 280),
            behavior: "smooth",
          });
        }
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* ─── TOP CONTROL & INFO BAR (PLACED CLEANLY ABOVE THE MAP) ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-1">
        {/* Left: View Toggle & Search Bar (City filter pills removed as requested) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ولاية أو رقم..."
              className="w-full bg-muted/50 hover:bg-muted/70 focus:bg-background rounded-full pr-10 pl-4 py-2 text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/60 border-0"
            />

            {/* Search dropdown results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 right-0 w-full bg-background/95 backdrop-blur-md rounded-2xl border border-border/40 shadow-xl z-50 overflow-hidden py-1">
                {searchResults.map((w) => {
                  const hasDist = ACTIVE_WILAYA_CODES.has(w.code);
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleSelectWilaya(w.code)}
                      className="w-full text-right px-4 py-2.5 text-xs md:text-sm flex items-center justify-between hover:bg-primary/10 transition-colors"
                    >
                      <span className="font-bold text-foreground">
                        {w.nameAr} ({w.nameFr})
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          w.code === 19
                            ? "bg-amber-500/20 text-amber-500"
                            : hasDist
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {w.code === 19
                          ? "المقر الرئيسي"
                          : hasDist
                          ? "موزع متوفر"
                          : `ولاية ${w.code}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Wilaya Info (Clean, above the map with zero overlap) */}
        <WilayaInfoHeader
          activeWilaya={currentHoverOrSelected}
          distributorCount={
            currentHoverOrSelected
              ? getDistributorsByWilaya(currentHoverOrSelected.code).length
              : 0
          }
        />
      </div>

      {/* ─── FLOATING INTERACTIVE MAP (CLEAN, NO TEXT COLLAPSING OVER WILAYAS) ─── */}
      <div className="relative w-full max-w-5xl mx-auto select-none">
        {/* Soft background ambient glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div className="w-[85%] h-[75%] rounded-full bg-gradient-to-tr from-primary/10 via-amber-500/5 to-rose-500/10 blur-3xl opacity-70 dark:opacity-40" />
        </div>

        {/* Map SVG */}
        <div
          className={`relative w-full mx-auto transition-all duration-500 ${
            viewMode === "north"
              ? "aspect-[1.55/1] max-h-[550px] md:max-h-[640px]"
              : "aspect-[1.15/1] max-h-[700px]"
          }`}
          style={
            viewMode === "north"
              ? {
                  maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)",
                }
              : undefined
          }
        >
          <svg
            viewBox={
              viewMode === "full" ? ALGERIA_VIEWBOX_FULL : ALGERIA_VIEWBOX_HOME
            }
            className="w-full h-full filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="glowHQ" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor="#f59e0b"
                  floodOpacity="0.8"
                />
              </filter>
              <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="3"
                  floodColor="#e11d48"
                  floodOpacity="0.7"
                />
              </filter>
              <filter
                id="wilayaHoverGlow"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="3"
                  floodColor="#f59e0b"
                  floodOpacity="0.5"
                />
              </filter>
            </defs>

            {/* 58 Wilaya Polygons */}
            <g id="wilayas-group-interactive">
              {algeriaWilayas.map((wilaya) => {
                const isHQ = wilaya.code === 19;
                const hasDistributors = ACTIVE_WILAYA_CODES.has(wilaya.code);
                const isHovered = hoveredWilaya?.code === wilaya.code;
                const isSelected = selectedWilayaCode === wilaya.code;

                let fill = "#1e2430";
                let stroke = "rgba(255, 255, 255, 0.15)";
                let strokeWidth = 0.6;
                let filter = "none";

                if (isHQ) {
                  fill = isHovered || isSelected ? "#f59e0b" : "#854d0e";
                  stroke = "#fbbf24";
                  strokeWidth = isSelected || isHovered ? 1.5 : 1.1;
                  if (isHovered || isSelected) {
                    filter = "url(#wilayaHoverGlow)";
                  }
                } else if (hasDistributors) {
                  fill =
                    isHovered || isSelected
                      ? "#e11d48"
                      : "rgba(225, 29, 72, 0.28)";
                  stroke =
                    isHovered || isSelected
                      ? "#ffffff"
                      : "rgba(225, 29, 72, 0.5)";
                  strokeWidth = isHovered || isSelected ? 1.3 : 0.8;
                  if (isHovered || isSelected) {
                    filter = "url(#wilayaHoverGlow)";
                  }
                } else if (isHovered || isSelected) {
                  fill = "#f59e0b";
                  stroke = "#ffffff";
                  strokeWidth = 1.3;
                  filter = "url(#wilayaHoverGlow)";
                }

                return (
                  <path
                    key={wilaya.id}
                    id={`interactive-${wilaya.id}`}
                    d={wilaya.d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    filter={filter}
                    className="transition-colors duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredWilaya(wilaya)}
                    onMouseLeave={() => setHoveredWilaya(null)}
                    onClick={() => handleSelectWilaya(wilaya.code)}
                  />
                );
              })}
            </g>

            {/* Pins Group */}
            <g id="pins-group-interactive">
              {activeWilayasWithDistributors.map((wilaya) => {
                const count = getDistributorsByWilaya(wilaya.code).length;
                const isSelected = selectedWilayaCode === wilaya.code;
                const isHovered = hoveredWilaya?.code === wilaya.code;
                return (
                  <SvgPin
                    key={`interactive-pin-${wilaya.code}`}
                    wilaya={wilaya}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    distributorCount={count}
                    onMouseEnter={() => setHoveredWilaya(wilaya)}
                    onMouseLeave={() => setHoveredWilaya(null)}
                    onClick={() => handleSelectWilaya(wilaya.code)}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* ─── DISTRIBUTOR CARDS DRAWER / PANEL ─── */}
      <div ref={infoPanelRef} className="pt-2">
        <AnimatePresence mode="wait">
          {selectedWilaya && currentDistributors.length > 0 ? (
            <motion.div
              key={selectedWilaya.code}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-border/50 max-w-2xl mx-auto">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedWilaya.code === 19
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {selectedWilaya.code === 19 ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-foreground">
                      نقاط البيع في ولاية {selectedWilaya.nameAr}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedWilaya.nameFr} — {currentDistributors.length} نقطة معتمدة
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedWilayaCode(null)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  إلغاء التحديد ✕
                </button>
              </div>

              {/* Thin Clients List */}
              <div className="flex flex-col gap-2.5 max-w-2xl mx-auto w-full">
                {currentDistributors.map((dist, i) => (
                  <DistributorCard
                    key={dist.id}
                    distributor={dist}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>
          ) : selectedWilaya ? (
            /* Selected a wilaya with no physical distributor yet */
            <motion.div
              key={`empty-${selectedWilaya.code}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-xl border border-dashed border-border/70 p-5 text-center max-w-sm mx-auto bg-muted/20"
            >
              <Info className="w-6 h-6 text-muted-foreground/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground mb-1">
                ولاية {selectedWilaya.nameAr} ({selectedWilaya.nameFr})
              </h4>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                خدمة التوصيل السريع متوفرة لجميع بلديات الولاية عبر شبكتنا أو مباشرة من المقر الرئيسي.
              </p>
              <a
                href="tel:+213666509941"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                <Phone className="w-3 h-3" />
                اطلب الآن هاتفياً أو استفسر
              </a>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
