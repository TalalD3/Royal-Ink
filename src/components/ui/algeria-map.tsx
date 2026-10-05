"use client";

import React, { useState, useMemo } from "react";
import {
  algeriaWilayas,
  ALGERIA_VIEWBOX_HOME,
  type WilayaData,
} from "@/data/algeria-wilayas";
import { type Distributor } from "@/data/distributors";
import { useDistributors } from "@/hooks/use-distributors";

/* ──────────────────────────────────────────────────────────────────────
   ANIMATED SVG PINS (Rendered directly in SVG coordinate space)
   - Zero text when idle: map is clean
   - Text appears ONLY when hovered
   - Stable hit area to prevent any jitter
   ────────────────────────────────────────────────────────────────────── */

/** A square centred on the pin's origin, half-side h */
const sq = (h: number) => ({ x: -h, y: -h, width: h * 2, height: h * 2 });

export function SvgPin({
  wilaya,
  isSelected,
  isHovered = false,
  distributorCount,
  onClick,
  onMouseEnter,
  onMouseLeave,
  brand = false,
  showLabel = true,
  scale = 1,
}: {
  wilaya: WilayaData;
  isSelected: boolean;
  isHovered?: boolean;
  distributorCount: number;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Logo palette (black / red / white) — used by the home page preview */
  brand?: boolean;
  /** Show the floating name tag on hover (off when the page shows it elsewhere) */
  showLabel?: boolean;
  /** Extra size factor, e.g. to keep pins from ballooning on a zoomed map */
  scale?: number;
}) {
  const isHQ = wilaya.code === 19;
  const { x, y } = wilaya.pin;
  const active = isSelected || isHovered;

  // Pin colours: HQ vs. regular point of sale
  const tone = brand
    ? isHQ
      ? { core: "#ffffff", dot: "#E30B17", halo: "rgba(255, 255, 255, 0.4)", pulse: "rgba(255, 255, 255, 0.55)", label: "#1D1D1B" }
      : { core: "#E30B17", dot: "#ffffff", halo: "rgba(227, 11, 23, 0.3)", pulse: "rgba(227, 11, 23, 0.45)", label: "#E30B17" }
    : isHQ
    ? { core: "#f59e0b", dot: "#ffffff", halo: "rgba(245, 158, 11, 0.35)", pulse: "rgba(245, 158, 11, 0.45)", label: "#d97706" }
    : { core: "#e11d48", dot: "#ffffff", halo: "rgba(225, 29, 72, 0.28)", pulse: "rgba(225, 29, 72, 0.4)", label: "#e11d48" };

  return (
    <g
      transform={`translate(${x}, ${y})${scale !== 1 ? ` scale(${scale})` : ""}`}
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
      {/* Brand pins are enlarged on phones via CSS (.ri-map-pin), scaled
          around the pin centre, which is this group's origin */}
      <g className={brand ? "ri-map-pin" : undefined}>
      {/* Stable hit target — keeps mouse tracking rock-solid */}
      <rect {...sq(18)} fill="transparent" />

      {/* Pulse — a square wave: the logo's blocks rather than dots */}
      <rect {...sq(isHQ ? 6 : 4.5)} fill={tone.pulse} style={{ pointerEvents: "none" }}>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1; 3.6; 1"
          dur={isHQ ? "2.2s" : "3s"}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.85; 0; 0.85"
          dur={isHQ ? "2.2s" : "3s"}
          repeatCount="indefinite"
        />
      </rect>

      {/* Halo, core and centre — squares, grown a little when active */}
      <g
        style={{
          pointerEvents: "none",
          transform: active ? "scale(1.25)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}
      >
        <rect {...sq(isHQ ? 11 : 7.5)} fill={tone.halo} />
        <rect
          {...sq(isHQ ? 6.5 : 4.75)}
          fill={tone.core}
          stroke={brand && isHQ ? "#E30B17" : "#ffffff"}
          strokeWidth={isHQ ? 2 : 1.5}
          filter={brand ? undefined : isHQ ? "url(#glowHQ)" : "url(#glowPin)"}
        />
        <rect {...sq(isHQ ? 2.2 : 1.3)} fill={tone.dot} />
      </g>

      {/* Floating Badge Label — ONLY APPEARS ON HOVER (Map is 100% clean by default) */}
      {showLabel && isHovered && (
        <g transform="translate(0, -15)" style={{ pointerEvents: "none" }}>
          <rect
            x={isHQ ? -34 : -26}
            y={-15}
            width={isHQ ? 68 : 52}
            height={17}
            fill={tone.label}
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
    </g>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   ALGERIA MAP PREVIEW (Home Page Section)
   
   - Focus on North of Algeria by default (on mount and refresh)
   - Zero text overlaying the map: information bar is cleanly above the map
   - Map is free-floating with no enclosing card borders
   - Pins show labels only on hover
   ══════════════════════════════════════════════════════════════════════ */

export function AlgeriaMapPreview({
  distributors: propDistributors,
}: {
  distributors?: Distributor[];
} = {}) {
  const [hoveredWilaya, setHoveredWilaya] = useState<WilayaData | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<WilayaData | null>(null);

  const { activeWilayaCodes, getDistributorsByWilaya } =
    useDistributors(propDistributors);

  const activeWilayasWithDistributors = useMemo(
    () => algeriaWilayas.filter((w) => activeWilayaCodes.has(w.code)),
    [activeWilayaCodes]
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none">
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
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 58 Wilaya Polygons — logo palette: black country, grey where
              we have points of sale, red for the Sétif headquarters */}
          <g id="wilayas-group">
            {algeriaWilayas.map((wilaya) => {
              const isHQ = wilaya.code === 19;
              const hasDistributors = activeWilayaCodes.has(wilaya.code);
              const isHovered = hoveredWilaya?.code === wilaya.code;
              const isSelected = selectedWilaya?.code === wilaya.code;
              const isActive = isHovered || isSelected;

              // Greys read from CSS variables so the section can retune
              // them when the map sits on a dark card (phones)
              let fill = "var(--map-base, #1D1D1B)";
              let stroke = "rgba(255, 255, 255, 0.16)";
              let strokeWidth = 0.6;

              if (isHQ) {
                fill = isActive ? "#BA0913" : "#E30B17";
                stroke = "rgba(255, 255, 255, 0.55)";
                strokeWidth = 1;
              } else if (hasDistributors) {
                fill = isActive
                  ? "var(--map-dist-hover, #6B6B66)"
                  : "var(--map-dist, #4A4A46)";
                stroke = "rgba(255, 255, 255, 0.28)";
                strokeWidth = 0.8;
              } else if (isActive) {
                fill = "var(--map-hover, #34342F)";
              }

              return (
                <path
                  key={wilaya.id}
                  id={wilaya.id}
                  d={wilaya.d}
                  style={{ fill }}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
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
                  brand
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
