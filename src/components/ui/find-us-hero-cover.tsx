"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { algeriaWilayas, type WilayaData } from "@/data/algeria-wilayas";
import { ALGERIA_NORTH_DOTS } from "@/data/algeria-dots";

/* ══════════════════════════════════════════════════════════════════════
   FIND US — HERO NETWORK

   Northern Algeria drawn as a dot matrix on the black block. Red routes run
   from the Sétif headquarters to every wilaya that has a point of sale
   (live data), with small deliveries travelling along them.
   ══════════════════════════════════════════════════════════════════════ */

const HQ_CODE = 19;
const VIEWBOX = "300 26 580 244";

/** A square centred on the origin, half-side h — markers are the logo's
    blocks, not dots */
const sq = (h: number) => ({ x: -h, y: -h, width: h * 2, height: h * 2 });

/** A gentle arc from the HQ to a target, always bowing northwards */
function routePath(from: WilayaData["pin"], to: WilayaData["pin"]) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bow = Math.min(60, len * 0.28);
  const cx = (from.x + to.x) / 2 + nx * bow;
  const cy = (from.y + to.y) / 2 + ny * bow;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function FindUsHeroCover({ activeCodes }: { activeCodes: Set<number> }) {
  const reduced = useReducedMotion();

  const byCode = useMemo(
    () => new Map(algeriaWilayas.map((w) => [w.code, w])),
    []
  );
  const hq = byCode.get(HQ_CODE);

  const targets = useMemo(
    () =>
      Array.from(activeCodes)
        .filter((c) => c !== HQ_CODE)
        .map((c) => byCode.get(c))
        .filter((w): w is WilayaData => !!w)
        .sort((a, b) => a.pin.x - b.pin.x),
    [activeCodes, byCode]
  );

  if (!hq) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      // Phones: edge to edge and a narrower frame (the svg "slices" off the
      // empty far west/east), so the network fills the screen. From sm up
      // the frame matches the drawing exactly.
      className="pointer-events-none relative -mx-4 aspect-[2.1/1] select-none sm:mx-0 sm:aspect-[580/244]"
      style={{
        // The dot grid stops mid-country: dissolve that edge into the black
        maskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={VIEWBOX}
        className="h-full w-full"
        // xMin: on phones the trim comes off the empty east side only, which
        // sits the network a little further right. (From sm up the frame
        // matches the drawing, so nothing is trimmed.)
        preserveAspectRatio="xMinYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── The country, as square print dots ── */}
        <g>
          {ALGERIA_NORTH_DOTS.map(([x, y, code]) => (
            <rect
              key={`${x}-${y}`}
              x={x - 1.7}
              y={y - 1.7}
              width={3.4}
              height={3.4}
              fill={
                code === HQ_CODE
                  ? "#E30B17"
                  : activeCodes.has(code)
                  ? "rgba(255,255,255,0.55)"
                  : "rgba(255,255,255,0.16)"
              }
            />
          ))}
        </g>

        {/* ── Routes from the headquarters ── */}
        <g>
          {targets.map((w, i) => {
            const d = routePath(hq.pin, w.pin);
            const dur = `${2.4 + (i % 3) * 0.4}s`;
            return (
              <g key={w.code}>
                {/* Route */}
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(227,11,23,0.35)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="#E30B17"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeDasharray="4 7"
                >
                  {!reduced && (
                    <animate
                      attributeName="stroke-dashoffset"
                      values="22;0"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>

                {/* A delivery travelling out */}
                {!reduced && (
                  <rect {...sq(2.2)} fill="#ffffff">
                    <animateMotion
                      dur={dur}
                      begin={`${i * 0.35}s`}
                      repeatCount="indefinite"
                      path={d}
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.1;0.85;1"
                      dur={dur}
                      begin={`${i * 0.35}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                {/* Destination */}
                <g transform={`translate(${w.pin.x}, ${w.pin.y})`}>
                  {!reduced && (
                    <rect {...sq(2.8)} fill="rgba(227,11,23,0.5)">
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1;3.6;1"
                        dur="2.6s"
                        begin={`${i * 0.3}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.7;0;0.7"
                        dur="2.6s"
                        begin={`${i * 0.3}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                  )}
                  <rect {...sq(3.1)} fill="#E30B17" stroke="#ffffff" strokeWidth={1.2} />
                  {/* Name above the dot, or below it for wilayas south of the
                      HQ so it clears the headquarters tag */}
                  <g className="ri-net-tag">
                    <text
                      y={w.pin.y > hq.pin.y + 12 ? 15 : -9}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.88)"
                      fontSize={9.5}
                      fontWeight={700}
                      fontFamily="inherit"
                      // Dark halo keeps the name crisp over the dots
                      stroke="#1D1D1B"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      paintOrder="stroke"
                    >
                      {w.nameAr}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* ── Headquarters ── */}
        <g transform={`translate(${hq.pin.x}, ${hq.pin.y})`}>
          {!reduced &&
            [0, 1.2].map((begin) => (
              <rect key={begin} {...sq(5.5)} fill="rgba(227,11,23,0.45)">
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1;4.4"
                  dur="2.4s"
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0"
                  dur="2.4s"
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          <rect {...sq(6)} fill="#ffffff" stroke="#E30B17" strokeWidth={2.5} />
          <rect {...sq(2.2)} fill="#E30B17" />
          <g transform="translate(0, 24)">
            <g className="ri-net-tag">
              <rect x={-50} y={-10} width={100} height={19} fill="#E30B17" />
              <text
                y={3.4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={9}
                fontWeight={700}
                fontFamily="inherit"
              >
                سطيف — المقر الرئيسي
              </text>
            </g>
          </g>
        </g>
      </svg>
    </motion.div>
  );
}

export default FindUsHeroCover;
