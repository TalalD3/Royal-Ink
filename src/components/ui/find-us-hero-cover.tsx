"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { algeriaWilayas } from "@/data/algeria-wilayas";

/* ══════════════════════════════════════════════════════════════════════
   FIND US HERO COVER
   
   High-precision vector map of North Algeria showing Sétif as the
   golden headquarters hub, with distribution arrows/rays radiating
   out to other wilayas across Algeria.
   
   Fading effect:
   - On mobile: positioned on top, fading at the bottom near the text.
   - On desktop: positioned on the left, fading to the right near the text.
   ══════════════════════════════════════════════════════════════════════ */

// Trajectories shooting out from Sétif HQ (x: 663, y: 95.9)
const distributionRays = [
  {
    id: "ray-algiers",
    name: "الجزائر العاصمة",
    code: 16,
    x: 562.5,
    y: 65.3,
    cx: 610,
    cy: 62,
    dur: "2.3s",
  },
  {
    id: "ray-oran",
    name: "وهران",
    code: 31,
    x: 401.4,
    y: 122.8,
    cx: 520,
    cy: 75,
    dur: "2.8s",
  },
  {
    id: "ray-constantine",
    name: "قسنطينة",
    code: 25,
    x: 721.1,
    y: 86.3,
    cx: 695,
    cy: 82,
    dur: "1.9s",
  },
  {
    id: "ray-annaba",
    name: "عنابة",
    code: 23,
    x: 760.1,
    y: 56.5,
    cx: 715,
    cy: 58,
    dur: "2.4s",
  },
  {
    id: "ray-bejaia",
    name: "بجاية",
    code: 6,
    x: 643.6,
    y: 73.1,
    cx: 652,
    cy: 78,
    dur: "1.7s",
  },
  {
    id: "ray-batna",
    name: "باتنة",
    code: 5,
    x: 687.4,
    y: 141.2,
    cx: 680,
    cy: 118,
    dur: "2.0s",
  },
  {
    id: "ray-biskra",
    name: "بسكرة",
    code: 7,
    x: 688.6,
    y: 166.5,
    cx: 680,
    cy: 130,
    dur: "2.5s",
  },
  {
    id: "ray-chlef",
    name: "الشلف",
    code: 2,
    x: 483.5,
    y: 91.9,
    cx: 570,
    cy: 82,
    dur: "2.6s",
  },
  {
    id: "ray-tlemcen",
    name: "تلمسان",
    code: 13,
    x: 359.0,
    y: 168.6,
    cx: 490,
    cy: 115,
    dur: "3.1s",
  },
];

const TARGET_WILAYA_CODES = new Set(distributionRays.map((r) => r.code));

export function FindUsHeroCover() {
  // Filter only North Algeria wilayas for the regional view
  const northWilayas = useMemo(
    () =>
      algeriaWilayas.filter(
        (w) =>
          w.bounds.minY <= 300 &&
          w.bounds.minX >= 310 &&
          w.bounds.maxX <= 840
      ),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none pointer-events-none"
    >
      {/* Soft background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[85%] h-[80%] rounded-full bg-gradient-to-tr from-amber-500/20 via-primary/15 to-rose-500/10 blur-3xl opacity-80 dark:opacity-60" />
      </div>

      {/* SVG Container with responsive fade mask (bottom on phone, right towards text on desktop) */}
      <div className="relative w-full aspect-[1.8/1] max-h-[380px] find-us-hero-fade">
        <svg
          viewBox="320 35 520 280"
          className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sétif Gold Gradient */}
            <linearGradient id="setifHeroGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Sétif Glow Filter */}
            <filter id="setifHeroGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="6"
                floodColor="#f59e0b"
                floodOpacity="0.85"
              />
            </filter>

            {/* Arrowhead Marker */}
            <marker
              id="heroArrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>

            {/* Ray Flow Gradient */}
            <linearGradient id="rayFlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* ─── NORTH WILAYAS BASE ─── */}
          <g id="hero-wilayas">
            {northWilayas.map((wilaya) => {
              const isSetif = wilaya.code === 19;
              const isTarget = TARGET_WILAYA_CODES.has(wilaya.code);

              let fill = "#181e29"; // sleek dark slate
              let stroke = "rgba(255, 255, 255, 0.12)";
              let strokeWidth = 0.6;
              let filter = "none";

              if (isSetif) {
                fill = "url(#setifHeroGold)";
                stroke = "#fde047";
                strokeWidth = 1.6;
                filter = "url(#setifHeroGlow)";
              } else if (isTarget) {
                fill = "rgba(225, 29, 72, 0.22)";
                stroke = "rgba(225, 29, 72, 0.45)";
                strokeWidth = 0.8;
              }

              return (
                <path
                  key={wilaya.id}
                  id={`hero-${wilaya.id}`}
                  d={wilaya.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  filter={filter}
                />
              );
            })}
          </g>

          {/* ─── DISTRIBUTION RAYS RADIATING FROM SETIF (x: 663, y: 95.9) ─── */}
          <g id="hero-distribution-rays">
            {distributionRays.map((ray) => {
              const pathData = `M 663 95.9 Q ${ray.cx} ${ray.cy} ${ray.x} ${ray.y}`;
              return (
                <g key={ray.id}>
                  {/* Subtle ambient ray glow line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.18)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Flowing animated dash ray with arrow */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="url(#rayFlowGradient)"
                    strokeWidth="1.6"
                    strokeDasharray="5 7"
                    strokeLinecap="round"
                    markerEnd="url(#heroArrowhead)"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="36; 0"
                      dur={ray.dur}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Destination Beacon Node */}
                  <g transform={`translate(${ray.x}, ${ray.y})`}>
                    {/* Ripple Aura */}
                    <circle r="4" fill="rgba(225, 29, 72, 0.35)">
                      <animate
                        attributeName="r"
                        values="3; 10; 3"
                        dur="2.2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8; 0; 0.8"
                        dur="2.2s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Core Point */}
                    <circle
                      r="2.8"
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />

                    {/* City Micro-label */}
                    <text
                      x="0"
                      y="-7"
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.75)"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="inherit"
                    >
                      {ray.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* ─── SETIF HQ CENTER BEACON & LABEL ─── */}
          <g transform="translate(663, 95.9)" id="hero-setif-hq">
            {/* Outer expanding radar ring 1 */}
            <circle r="8" fill="rgba(245, 158, 11, 0.45)">
              <animate
                attributeName="r"
                values="8; 32; 8"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.9; 0; 0.9"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Outer expanding radar ring 2 */}
            <circle r="14" fill="rgba(245, 158, 11, 0.25)">
              <animate
                attributeName="r"
                values="14; 44; 14"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7; 0; 0.7"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Solid Golden Core */}
            <circle
              r="6.5"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#setifHeroGlow)"
            />

            {/* Glowing HQ Badge Floating Above Sétif */}
            <g transform="translate(0, -22)">
              <rect
                x="-46"
                y="-11"
                width="92"
                height="20"
                rx="10"
                fill="#d97706"
                filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
              />
              <text
                x="0"
                y="2.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="bold"
                fontFamily="inherit"
              >
                🏢 سطيف — المقر الرئيسي
              </text>
            </g>
          </g>
        </svg>
      </div>
    </motion.div>
  );
}
