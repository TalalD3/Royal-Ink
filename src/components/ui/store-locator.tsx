"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpLeft,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { algeriaWilayas, type WilayaData } from "@/data/algeria-wilayas";
import {
  badgeConfig,
  type BadgeTier,
  type Distributor,
} from "@/data/distributors";
import { useDistributors } from "@/hooks/use-distributors";
import { SvgPin } from "@/components/ui/algeria-map";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/site-settings-provider";
import { telHref } from "@/types/site-settings";

/* ══════════════════════════════════════════════════════════════════════
   STORE LOCATOR — /find-us

   The map on its own, centred, with the wilaya under the pointer named
   above it, a search box, and zoom controls. Contact cards appear only once
   a wilaya is chosen — by clicking it on the map or picking it in search.
   ══════════════════════════════════════════════════════════════════════ */

const HQ_CODE = 19;

/* Map frame: the northern view used on the home page, with room to pan
   across the whole country once zoomed in */
const BASE = { x: 250, y: 35, w: 600, h: 380 };
const WORLD = { minX: 175, maxX: 885, minY: 35, maxY: 895 };
const DEFAULT_CENTER = { x: BASE.x + BASE.w / 2, y: BASE.y + BASE.h / 2 };
/* Where the + button zooms from the opening view: the northern band,
   where the wilayas are small and the points of sale are */
const NORTH_FOCUS = { x: 560, y: 125 };
const ZOOM_STEP = 1.6;
const MAX_ZOOM = 4;

/* ── Arabic counting ── */
export function salesPointsLabel(n: number) {
  if (n === 1) return "نقطة بيع واحدة";
  if (n === 2) return "نقطتا بيع";
  if (n >= 3 && n <= 10) return `${n} نقاط بيع`;
  return `${n} نقطة بيع`;
}

function matchesWilaya(w: WilayaData, q: string) {
  return (
    w.nameAr.includes(q) ||
    w.nameFr.toLowerCase().includes(q) ||
    String(w.code) === q ||
    String(w.code).padStart(2, "0") === q
  );
}

type View = { zoom: number; cx: number; cy: number };

/** Keep the centre inside the country so the map never drifts away */
function clampView(v: View): View {
  const w = BASE.w / v.zoom;
  const h = BASE.h / v.zoom;
  const clamp = (n: number, lo: number, hi: number) =>
    lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, n));
  return {
    zoom: v.zoom,
    cx: clamp(v.cx, WORLD.minX + w / 2, WORLD.maxX - w / 2),
    cy: clamp(v.cy, WORLD.minY + h / 2, WORLD.maxY - h / 2),
  };
}

const HOME_VIEW: View = { zoom: 1, cx: DEFAULT_CENTER.x, cy: DEFAULT_CENTER.y };

/** Frame a wilaya: zoom so it fills about a third of the map, but never so
    close that the surrounding wilayas (the context) disappear */
const AUTO_ZOOM_CAP = 2.6;
function viewFor(w: WilayaData): View {
  const bw = w.bounds.maxX - w.bounds.minX;
  const bh = w.bounds.maxY - w.bounds.minY;
  const zoom = Math.max(
    1,
    Math.min(AUTO_ZOOM_CAP, BASE.w / (bw * 3), BASE.h / (bh * 3))
  );
  return clampView({
    zoom,
    cx: (w.bounds.minX + w.bounds.maxX) / 2,
    cy: (w.bounds.minY + w.bounds.maxY) / 2,
  });
}

const DOT: Record<BadgeTier, string> = {
  headquarters: "bg-brand-red",
  premium: "bg-brand-black",
  authorized: "bg-brand-gray",
  standard: "bg-brand-gray/50",
};

/* ── Contact card for one point of sale ── */
function ContactCard({ d }: { d: Distributor }) {
  return (
    <article className="ri-strip flex flex-col bg-brand-mist p-6">
      <p className="flex items-center gap-2 text-xs font-bold text-brand-gray">
        <span className={cn("h-2 w-2", DOT[d.badge])} />
        {badgeConfig[d.badge]?.labelAr ?? badgeConfig.standard.labelAr}
      </p>
      <h4 className="mt-3 text-lg font-extrabold leading-7 text-brand-black">
        {d.name}
      </h4>
      {d.note && (
        <p className="mt-1 text-sm leading-6 text-brand-gray">{d.note}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-5">
        {d.phones.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex h-10 items-center gap-2 bg-brand-black px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span dir="ltr">{phone}</span>
          </a>
        ))}
        {d.locationUrl && (
          <a
            href={d.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-black transition-colors duration-200 hover:text-brand-red"
          >
            الموقع على الخريطة
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

/* ── Square floating map button ── */
function MapButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center bg-white sm:h-10 sm:w-10 text-brand-black shadow-[0_6px_18px_-6px_rgba(0,0,0,0.3)] transition-colors duration-200 hover:bg-brand-black hover:text-white disabled:pointer-events-none disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
    >
      {children}
    </button>
  );
}

/* ── Main component ── */
export function StoreLocator({
  distributors: propDistributors,
}: {
  distributors?: Distributor[];
} = {}) {
  const { activeWilayaCodes, getDistributorsByWilaya } =
    useDistributors(propDistributors);
  // Head-office number for "no point of sale here yet" (admin settings)
  const hqPhone = useSiteSettings().phones[0];

  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [hovered, setHovered] = useState<WilayaData | null>(null);
  const [view, setView] = useState<View>(HOME_VIEW);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(
    null
  );
  const suppressClick = useRef(false);

  const wilayaByCode = useMemo(
    () => new Map(algeriaWilayas.map((w) => [w.code, w])),
    []
  );
  const selected =
    selectedCode !== null ? wilayaByCode.get(selectedCode) ?? null : null;
  const selectedPoints = selected ? getDistributorsByWilaya(selected.code) : [];

  // Search results: every wilaya, those with points of sale first
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return algeriaWilayas
      .filter((w) => matchesWilaya(w, q))
      .sort(
        (a, b) =>
          Number(activeWilayaCodes.has(b.code)) -
            Number(activeWilayaCodes.has(a.code)) || a.code - b.code
      )
      .slice(0, 6);
  }, [q, activeWilayaCodes]);

  /* ── Choosing a wilaya ── */
  const choose = (w: WilayaData) => {
    if (selectedCode === w.code) return clear();
    setSelectedCode(w.code);
    setView(viewFor(w));
    setQuery("");
    setSearchOpen(false);
  };

  const clear = () => {
    setSelectedCode(null);
    setView(HOME_VIEW);
  };

  // Bring the contact cards into view once they appear
  useEffect(() => {
    if (selectedCode === null) return;
    const t = setTimeout(() => {
      const top = resultsRef.current?.getBoundingClientRect().top;
      if (top !== undefined && top > window.innerHeight - 140) {
        window.scrollBy({ top: top - window.innerHeight * 0.35, behavior: "smooth" });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [selectedCode]);

  /* ── Zoom ── */
  const zoomBy = (factor: number) =>
    setView((v) => {
      const zoom = Math.min(MAX_ZOOM, Math.max(1, v.zoom * factor));
      if (zoom === 1 && !selected) return HOME_VIEW;
      const fromHome =
        v.zoom === 1 && v.cx === HOME_VIEW.cx && v.cy === HOME_VIEW.cy;
      return clampView(
        fromHome
          ? { zoom, cx: NORTH_FOCUS.x, cy: NORTH_FOCUS.y }
          : { ...v, zoom }
      );
    });

  const isHomeView =
    view.zoom === 1 &&
    view.cx === HOME_VIEW.cx &&
    view.cy === HOME_VIEW.cy;

  /* ── Drag to pan (only once zoomed in) ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (view.zoom <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, view, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const box = mapRef.current?.getBoundingClientRect();
    if (!d || !box) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      mapRef.current?.setPointerCapture(e.pointerId);
    }
    const unitsPerPx = BASE.w / d.view.zoom / box.width;
    setView(
      clampView({
        zoom: d.view.zoom,
        cx: d.view.cx - dx * unitsPerPx,
        cy: d.view.cy - dy * unitsPerPx,
      })
    );
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.moved) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      mapRef.current?.releasePointerCapture?.(e.pointerId);
    }
    drag.current = null;
    setDragging(false);
  };

  const vbW = BASE.w / view.zoom;
  const vbH = BASE.h / view.zoom;
  const viewBox = `${view.cx - vbW / 2} ${view.cy - vbH / 2} ${vbW} ${vbH}`;
  const pinScale = 1 / Math.pow(view.zoom, 0.7);

  const info = hovered ?? selected;
  const infoCount = info ? getDistributorsByWilaya(info.code).length : 0;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* ─── Above the map: wilaya under the pointer (right) + search (left) ─── */}
      <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-h-[60px]" aria-live="polite">
          {info ? (
            <>
              <p className="text-2xl font-extrabold leading-9 text-brand-black md:text-[1.75rem]">
                {info.nameAr}
              </p>
              <p className="text-sm text-brand-gray">
                <span dir="ltr">{info.nameFr}</span>
                <span className="mx-2 text-brand-line">•</span>
                {info.code === HQ_CODE ? (
                  <span className="font-bold text-brand-red">المقر الرئيسي</span>
                ) : infoCount > 0 ? (
                  <span className="font-bold text-brand-black">
                    {salesPointsLabel(infoCount)}
                  </span>
                ) : (
                  "التوصيل متوفر"
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-extrabold leading-9 text-brand-black md:text-[1.75rem]">
                الجزائر
              </p>
              <p className="text-sm text-brand-gray">
                مرّر على الخريطة لاكتشاف الولايات
              </p>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <label htmlFor="locator-search" className="sr-only">
            ابحث عن ولايتك
          </label>
          <Search
            className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-gray"
            aria-hidden="true"
          />
          <input
            id="locator-search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) choose(results[0]);
              if (e.key === "Escape") setSearchOpen(false);
            }}
            placeholder="ابحث عن ولايتك..."
            role="combobox"
            aria-expanded={searchOpen && results.length > 0}
            aria-controls="locator-results"
            className="h-12 w-full bg-brand-mist pe-4 ps-11 text-[15px] text-brand-black outline-none transition-shadow placeholder:text-brand-gray/70 focus:bg-white focus:shadow-[inset_0_-2px_0_rgb(var(--brand-red)),0_0_0_1px_rgb(var(--brand-black)/0.12)]"
          />

          <AnimatePresence>
            {searchOpen && results.length > 0 && (
              <motion.ul
                id="locator-results"
                role="listbox"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden bg-white py-2 shadow-[0_20px_44px_-14px_rgba(0,0,0,0.28)]"
              >
                {results.map((w) => {
                  const n = getDistributorsByWilaya(w.code).length;
                  return (
                    <li key={w.code} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose(w)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start transition-colors hover:bg-brand-mist"
                      >
                        <span className="font-bold text-brand-black">
                          {w.nameAr}
                          <span className="ms-2 text-xs font-normal text-brand-gray">
                            {w.nameFr}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-xs",
                            n > 0 ? "font-bold text-brand-red" : "text-brand-gray"
                          )}
                        >
                          {n > 0 ? salesPointsLabel(n) : "التوصيل متوفر"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── The map, on its own ─── */}
      <div className="relative mt-6">
      <div
        ref={mapRef}
        className={cn(
          "ri-locator-map aspect-[1.58/1] w-full select-none",
          view.zoom > 1 && (dragging ? "cursor-grabbing" : "cursor-grab")
        )}
        style={{ touchAction: view.zoom > 1 ? "none" : "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <motion.svg
          viewBox={`${BASE.x} ${BASE.y} ${BASE.w} ${BASE.h}`}
          animate={{ viewBox }}
          transition={
            dragging ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="خريطة الجزائر — انقر على ولاية لعرض نقاط البيع فيها"
        >
          <g>
            {algeriaWilayas.map((w) => {
              const isHQ = w.code === HQ_CODE;
              const hasPoints = activeWilayaCodes.has(w.code);
              const isHovered = hovered?.code === w.code;
              const isSelected = selectedCode === w.code;

              // Same palette as the home page map; the chosen wilaya is red
              let fill = "#1D1D1B";
              if (isSelected) fill = isHQ ? "#BA0913" : "#E30B17";
              else if (isHQ) fill = isHovered ? "#BA0913" : "#E30B17";
              else if (hasPoints) fill = isHovered ? "#6B6B66" : "#4A4A46";
              else if (isHovered) fill = "#3A3A36";

              return (
                <path
                  key={w.id}
                  d={w.d}
                  fill={fill}
                  stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.16)"}
                  strokeWidth={(isSelected ? 1.4 : 0.6) / Math.sqrt(view.zoom)}
                  strokeLinejoin="round"
                  className="cursor-pointer transition-colors duration-200"
                  onMouseEnter={() => setHovered(w)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => choose(w)}
                />
              );
            })}
          </g>
          <g>
            {algeriaWilayas
              .filter((w) => activeWilayaCodes.has(w.code))
              .map((w) => (
                <SvgPin
                  key={`pin-${w.code}`}
                  brand
                  showLabel={false}
                  scale={pinScale}
                  wilaya={w}
                  isSelected={selectedCode === w.code}
                  isHovered={hovered?.code === w.code}
                  distributorCount={getDistributorsByWilaya(w.code).length}
                  onMouseEnter={() => setHovered(w)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => choose(w)}
                />
              ))}
          </g>
        </motion.svg>
      </div>

        {/* Zoom controls — outside the faded map edge so they stay crisp */}
        <div className="absolute bottom-3 left-0 flex flex-col gap-2">
          <MapButton
            label="تكبير"
            onClick={() => zoomBy(ZOOM_STEP)}
            disabled={view.zoom >= MAX_ZOOM}
          >
            <Plus className="h-4 w-4" />
          </MapButton>
          <MapButton
            label="تصغير"
            onClick={() => zoomBy(1 / ZOOM_STEP)}
            disabled={view.zoom <= 1}
          >
            <Minus className="h-4 w-4" />
          </MapButton>
          {!isHomeView && (
            <MapButton label="إعادة الخريطة" onClick={() => setView(HOME_VIEW)}>
              <RotateCcw className="h-4 w-4" />
            </MapButton>
          )}
        </div>
      </div>

      {/* ─── Contact cards — only once a wilaya is chosen ─── */}
      <div ref={resultsRef}>
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.code}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-brand-gray">نقاط البيع في</p>
                  <h3 className="text-2xl font-extrabold text-brand-black">
                    ولاية {selected.nameAr}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-gray transition-colors hover:text-brand-black"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  إغلاق
                </button>
              </div>

              {selectedPoints.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedPoints.map((d) => (
                    <ContactCard key={d.id} d={d} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 bg-brand-mist px-6 py-10 text-center">
                  <p className="text-lg font-extrabold text-brand-black">
                    لا توجد نقطة بيع في ولاية {selected.nameAr} حالياً
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-brand-gray">
                    خدمة التوصيل السريع متوفرة لجميع بلديات الولاية عبر شبكتنا أو
                    مباشرة من المقر الرئيسي.
                  </p>
                  <a href={telHref(hqPhone)} className="ri-btn ri-btn-red mt-6">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>اطلب الآن هاتفياً أو استفسر</span>
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StoreLocator;
