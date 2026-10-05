"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BlockReveal } from "@/components/ui/block-reveal";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   JOURNEY SCROLL — the company timeline, told sideways

   The section pins under the header and the visitor's scroll slides a
   long track across the screen (right to left, the way Arabic reads).
   Each era carries its year, its story and a loose collage of photos and
   quotes; photos drift at their own speed and are uncovered by the
   label wipe as they arrive. A red line along the bottom fills up to the
   middle of the screen, where a marker shows the year being read.

   Sizes inside the frame use --u (1% of the frame height, see
   .ri-journey in globals.css) so the composition holds on every screen.
   ══════════════════════════════════════════════════════════════════════ */

export interface JourneyPhoto {
  src: string;
  alt: string;
  caption: string;
  /** Size, in frame units */
  w: number;
  h: number;
  /** Position inside the era's collage, in % */
  top: number;
  right: number;
  /** Parallax: > 0 slides faster than the track, < 0 slower */
  depth?: number;
  /** Crop focus (CSS object-position), e.g. "50% 30%" */
  position?: string;
}

export interface JourneyQuote {
  text: string;
  author: string;
  top: number;
  right: number;
  /** Width, in frame units */
  w: number;
  depth?: number;
}

export interface JourneyEra {
  year: string;
  /** Which strand of the story this belongs to, e.g. "مسار الطباعة" */
  path?: string;
  title: string;
  text: string;
  points?: string[];
  /** Collage width, in frame units */
  width: number;
  photos: JourneyPhoto[];
  quote?: JourneyQuote;
  /** The closing era sits on the black block */
  dark?: boolean;
}

const u = (n: number) => `calc(var(--u) * ${n})`;

/* ── Shared scroll state for the items on the track ── */
interface JourneyCtx {
  x: MotionValue<number>;
  vw: MotionValue<number>;
  trackRef: React.RefObject<HTMLDivElement>;
  /** Bumped after every re-measure, so items re-read their position */
  version: number;
}
const Ctx = createContext<JourneyCtx | null>(null);
const useJourney = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("JourneyScroll context missing");
  return c;
};

/** Left edge of el inside the track, ignoring transforms */
function leftInTrack(el: HTMLElement, track: HTMLElement) {
  let left = 0;
  let node: HTMLElement | null = el;
  while (node && node !== track) {
    left += node.offsetLeft;
    node = node.offsetParent as HTMLElement | null;
  }
  return left;
}

/** Distance of el's centre from the track's right edge (where it starts) */
function anchorOf(el: HTMLElement, track: HTMLElement) {
  return track.offsetWidth - (leftInTrack(el, track) + el.offsetWidth / 2);
}

/** Horizontal drift relative to the track: zero when the element is in the
    middle of the screen, ± depth × distance from there */
function useDrift(ref: React.RefObject<HTMLElement>, depth: number) {
  const { x, vw, trackRef, version } = useJourney();
  const anchor = useMotionValue(0);
  useEffect(() => {
    if (ref.current && trackRef.current) {
      anchor.set(anchorOf(ref.current, trackRef.current));
    }
  }, [version, anchor, ref, trackRef]);
  return useTransform([x, vw, anchor], ([tx, w, a]: number[]) =>
    depth * (tx + w / 2 - a)
  );
}

/* ── A photo on the track: caption, crop marks, label wipe ── */
function Photo({ p, dark, priority }: { p: JourneyPhoto; dark?: boolean; priority?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const drift = useDrift(ref, p.depth ?? 0);
  return (
    <motion.figure
      ref={ref}
      style={{ top: `${p.top}%`, right: `${p.right}%`, width: u(p.w), x: drift }}
      className="group absolute z-10"
    >
      <figcaption
        className={cn(
          "mb-6 flex items-center gap-2 text-[11px] font-bold sm:text-xs",
          dark ? "text-white/55" : "text-brand-gray"
        )}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-brand-red" />
        {p.caption}
      </figcaption>
      <div className={cn("ri-crop", dark && "ri-crop-light")}>
        <BlockReveal
          margin="0px -12% 0px -12%"
          className={dark ? "bg-white/10" : "bg-brand-mist"}
          style={{ height: u(p.h) }}
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            sizes="(min-width: 768px) 40vw, 75vw"
            loading={priority ? undefined : "eager"}
            priority={priority}
            style={p.position ? { objectPosition: p.position } : undefined}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </BlockReveal>
      </div>
    </motion.figure>
  );
}

/* ── A quote on the track ── */
function Quote({ q, dark }: { q: JourneyQuote; dark?: boolean }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const drift = useDrift(ref, q.depth ?? 0.1);
  return (
    <motion.blockquote
      ref={ref}
      style={{ top: `${q.top}%`, right: `${q.right}%`, width: u(q.w), x: drift }}
      className="absolute z-10"
    >
      {/* The logo's two blocks as the quote mark */}
      <span aria-hidden="true" className="mb-4 flex">
        <span className="h-2.5 w-6 bg-brand-red" />
        <span className={cn("h-2.5 w-3", dark ? "bg-white" : "bg-brand-black")} />
      </span>
      <p
        className={cn(
          "whitespace-pre-line text-lg font-extrabold leading-[1.7] sm:text-xl md:text-2xl md:leading-[1.65]",
          dark ? "text-white" : "text-brand-black"
        )}
      >
        {q.text}
      </p>
      <footer className="mt-3 text-sm font-bold text-brand-red">{q.author}</footer>
    </motion.blockquote>
  );
}

/* ── The giant year behind each era, drifting a little slower than the
   track (kept small so it never slides back under the previous era) ── */
function GiantYear({ year, dark }: { year: string; dark?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const drift = useDrift(ref, -0.08);
  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      dir="ltr"
      style={{
        x: drift,
        fontSize: u(30),
        WebkitTextStroke: dark
          ? "1.5px rgb(255 255 255 / 0.2)"
          : "1.5px rgb(var(--brand-black) / 0.16)",
      }}
      className="pointer-events-none absolute right-0 top-[4%] select-none font-extrabold leading-none tracking-tight text-transparent"
    >
      {year}
    </motion.span>
  );
}

/* ── One era: text, then its collage; a node on the line marks its start ── */
function Era({
  era,
  index,
  passed,
  nodeRef,
  onJump,
}: {
  era: JourneyEra;
  index: number;
  passed: boolean;
  nodeRef: (el: HTMLButtonElement | null) => void;
  onJump: () => void;
}) {
  const { dark } = era;
  return (
    <article
      aria-label={`${era.year} — ${era.title}`}
      className={cn(
        "relative flex h-full shrink-0",
        dark && "bg-brand-black text-white"
      )}
      style={{
        paddingInlineStart: dark ? u(10) : 0,
        paddingInlineEnd: dark ? u(12) : u(14),
      }}
    >
      {dark && (
        <div
          aria-hidden="true"
          className="ri-raster pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,#000,transparent_70%)]"
        />
      )}
      <GiantYear year={era.year} dark={dark} />

      {/* Story */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "0px -8% 0px -8%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-[min(22rem,84vw)] shrink-0 flex-col justify-center pb-24 sm:w-[min(31rem,80vw)]"
      >
        <p className="flex items-center gap-3 text-sm font-extrabold">
          <span dir="ltr" className="text-brand-red">
            {era.year}
          </span>
          <span className={cn("h-px w-8", dark ? "bg-white/30" : "bg-brand-black/20")} />
          <span className={dark ? "text-white/60" : "text-brand-gray"}>
            {era.path ?? String(index + 1).padStart(2, "0")}
          </span>
        </p>
        <h3 className="mt-3 text-[1.375rem] font-extrabold leading-snug sm:text-[1.75rem] lg:text-[2rem]">
          {era.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-sm leading-7 sm:text-[15px] sm:leading-8",
            dark ? "text-white/80" : "text-brand-gray"
          )}
        >
          {era.text}
        </p>
        {era.points && (
          <ul
            className={cn(
              "mt-4 space-y-2 border-t pt-4 text-[13px] font-medium sm:text-sm [@media(max-height:700px)]:hidden",
              dark ? "border-white/15 text-white/85" : "border-brand-line text-brand-black"
            )}
          >
            {era.points.map((pt) => (
              <li key={pt} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-brand-red" />
                {pt}
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Collage */}
      <div className="relative h-full shrink-0" style={{ width: u(era.width) }}>
        {era.photos.map((p, pi) => (
          <Photo
            key={p.src + p.caption}
            p={p}
            dark={dark}
            priority={index === 0 && pi === 0}
          />
        ))}
        {era.quote && <Quote q={era.quote} dark={dark} />}
      </div>

      {/* Node on the line, at the start of the era — the square sits on
          the line, the year under it */}
      <button
        ref={nodeRef}
        type="button"
        onClick={onJump}
        aria-label={`انتقل إلى ${era.year}`}
        className={cn(
          "group/node absolute bottom-[calc(3.5rem-7px)] z-30 h-3.5 w-3.5 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red",
          passed
            ? "bg-brand-red"
            : dark
            ? "bg-brand-black ring-2 ring-inset ring-white/40"
            : "bg-white ring-2 ring-inset ring-brand-black/25 hover:ring-brand-red"
        )}
        style={{ right: dark ? u(10) : 0 }}
      >
        <span
          dir="ltr"
          className={cn(
            "absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-xs font-extrabold transition-colors duration-300",
            passed ? "text-brand-red" : dark ? "text-white/50" : "text-brand-gray"
          )}
        >
          {era.year}
        </span>
      </button>
    </article>
  );
}

/* ══════════════════════════ THE PINNED TRACK ══════════════════════════ */

function JourneyTrack({
  intro,
  eras,
  outro,
}: {
  intro: React.ReactNode;
  eras: JourneyEra[];
  outro: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<(HTMLButtonElement | null)[]>([]);
  const nodeAnchors = useRef<number[]>([]);

  const [distance, setDistance] = useState(0);
  const [lineStart, setLineStart] = useState(0);
  /** Gap kept between the end of the line and the red outro block */
  const [lineLeft, setLineLeft] = useState(0);
  const [version, setVersion] = useState(0);
  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);

  const dist = useMotionValue(0);
  const vw = useMotionValue(0);
  const trackW = useMotionValue(1);
  /** Where the line starts (the first era's node) and where it stops (just
      before the red outro block), measured from the track's right edge */
  const start = useMotionValue(0);
  const end = useMotionValue(Infinity);

  // Measure the track: how far it must travel, and where each era starts
  const measure = useCallback(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track) return;
    const w = frame.clientWidth;
    const tw = track.offsetWidth;
    const d = Math.max(0, tw - w);
    vw.set(w);
    dist.set(d);
    trackW.set(tw);
    nodeAnchors.current = nodeEls.current.map((el) => (el ? anchorOf(el, track) : Infinity));
    const s = isFinite(nodeAnchors.current[0]) ? nodeAnchors.current[0] : 0;
    // The outro is the track's last (left-most) block; stop 3rem before it
    const left = (outroRef.current?.offsetWidth ?? 0) + 48;
    start.set(s);
    end.set(Math.max(s, tw - left));
    setLineStart(s);
    setLineLeft(left);
    setDistance(d);
    setVersion((v) => v + 1);
  }, [dist, vw, trackW, start, end]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Vertical scroll through the pinned stretch → horizontal travel
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80px", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.35,
    restDelta: 0.0005,
  });
  const x = useTransform([smooth, dist], ([p, d]: number[]) => p * d);

  // The marker (head of the red line), in track coordinates: it sits on
  // the 2007 node until that node reaches the middle of the screen, stays
  // in the middle while the line fills behind it, and stops at the end of
  // the 2022 block — it never runs onto the red outro
  const head = useTransform([x, vw, start, end], ([tx, w, s, e]: number[]) =>
    Math.min(e, Math.max(s, tx + w / 2))
  );
  const headX = useTransform(head, (h) => -h);
  // Phones: the first year starts off-screen — show the marker only once
  // it is fully on screen
  const headOpacity = useTransform([head, x, vw], ([h, tx, w]: number[]) =>
    h - tx > w - 28 ? 0 : 1
  );
  const fill = useTransform([head, start, end], ([h, s, e]: number[]) =>
    Math.min(1, Math.max(0, (h - s) / Math.max(1, e - s)))
  );
  const hintOpacity = useTransform(scrollYProgress, [0, 0.025], [1, 0]);

  // Which era the marker has reached
  const updateActive = useCallback((tx: number) => {
    const h = Math.min(end.get(), Math.max(start.get(), tx + vw.get() / 2));
    let idx = -1;
    nodeAnchors.current.forEach((a, i) => {
      if (a <= h) idx = i;
    });
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
  }, [vw, start, end]);
  useMotionValueEvent(x, "change", updateActive);
  useEffect(() => updateActive(x.get()), [version, updateActive, x]);

  // Clicking a year on the line scrolls to it
  const jumpTo = (i: number) => {
    const section = sectionRef.current;
    const a = nodeAnchors.current[i];
    if (!section || !isFinite(a)) return;
    const pinStart = section.getBoundingClientRect().top + window.scrollY - 80;
    const travel = Math.min(Math.max(a - vw.get() / 2 + 40, 0), dist.get());
    window.scrollTo({ top: pinStart + travel, behavior: "smooth" });
  };

  return (
    <Ctx.Provider value={{ x, vw, trackRef, version }}>
      <section
        ref={sectionRef}
        aria-label="مسيرة روايال إنك"
        className="ri-journey relative bg-white"
        style={{ height: `calc(var(--u) * 100 + ${distance}px)` }}
      >
        <div
          ref={frameRef}
          className="sticky top-20 overflow-hidden text-brand-black"
          style={{ height: "calc(var(--u) * 100)" }}
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="relative flex h-full w-max will-change-transform"
          >
            {/* Intro — starts on the page's own right edge (the header's
                container), wide enough for full lines, and at least half
                the screen so the first year starts at or past the middle */}
            <div className="relative flex h-full w-screen shrink-0 flex-col justify-center pb-24 pe-10 ps-[var(--pad)] max-md:z-[5] max-md:bg-white md:w-[max(55vw,calc(var(--pad)+46rem))] md:pe-28">
              <div className="max-w-[40rem]">
                {intro}
                <motion.p
                  style={{ opacity: hintOpacity }}
                  className="mt-10 inline-flex items-center gap-3 text-sm font-bold text-brand-gray"
                >
                  <span className="flex h-10 w-10 items-center justify-center border border-brand-black/20 text-brand-black">
                    <ArrowLeft className="ri-nudge h-4 w-4" aria-hidden="true" />
                  </span>
                  مرّر للأسفل لاستكشاف المسيرة
                </motion.p>
              </div>
            </div>

            {eras.map((era, i) => (
              <Era
                key={era.year}
                era={era}
                index={i}
                passed={i <= active}
                nodeRef={(el) => {
                  nodeEls.current[i] = el;
                }}
                onJump={() => jumpTo(i)}
              />
            ))}

            {/* Outro — the red block, its text ending on the page's left
                edge */}
            <div
              ref={outroRef}
              className="relative flex h-full w-screen shrink-0 flex-col justify-center bg-brand-red pb-24 pe-[var(--pad)] ps-8 text-white md:w-[max(50vw,calc(var(--pad)+46rem))] md:ps-20"
            >
              <div className="max-w-[40rem]">{outro}</div>
            </div>

            {/* The line: from the first year to the end of the 2022 block;
                red up to the marker */}
            <span
              aria-hidden="true"
              style={{ right: lineStart, left: lineLeft }}
              className="pointer-events-none absolute bottom-14 z-20 h-px bg-brand-black/15"
            />
            <motion.span
              aria-hidden="true"
              style={{ right: lineStart, left: lineLeft, scaleX: fill }}
              className="pointer-events-none absolute bottom-14 z-20 h-0.5 origin-right translate-y-px bg-brand-red"
            />

            {/* The marker, carrying the current year */}
            <motion.div
              aria-hidden="true"
              style={{ x: headX, opacity: headOpacity }}
              className="pointer-events-none absolute bottom-14 right-0 z-40 h-0 w-0 transition-opacity duration-300"
            >
              <span className="absolute left-0 top-0 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 bg-brand-red ring-2 ring-white" />
              <span
                dir="ltr"
                className={cn(
                  "absolute bottom-4 left-0 -translate-x-1/2 whitespace-nowrap bg-brand-black px-2.5 py-1 text-xs font-extrabold text-white ring-1 ring-white/25 transition-opacity duration-300",
                  active < 0 && "opacity-0"
                )}
              >
                {active >= 0 ? eras[active].year : ""}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Ctx.Provider>
  );
}

/* ══════════════════ REDUCED MOTION — the same story, stacked ══════════════════ */

function JourneyList({
  intro,
  eras,
  outro,
}: {
  intro: React.ReactNode;
  eras: JourneyEra[];
  outro: React.ReactNode;
}) {
  return (
    <section aria-label="مسيرة روايال إنك" className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">{intro}</div>
        <ol className="mt-12 space-y-12">
          {eras.map((era) => (
            <li
              key={era.year}
              className="grid gap-6 border-t border-brand-line pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div>
                <p dir="ltr" className="text-right text-sm font-extrabold text-brand-red">
                  {era.year}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold">{era.title}</h3>
                <p className="mt-3 leading-7 text-brand-gray">{era.text}</p>
                {era.points && (
                  <ul className="mt-4 space-y-2 text-sm">
                    {era.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-brand-red" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {era.photos[0] && (
                <div className="relative aspect-[16/10] bg-brand-mist">
                  <Image
                    src={era.photos[0].src}
                    alt={era.photos[0].alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="bg-brand-red py-16 text-white">
        <div className="container mx-auto px-4">{outro}</div>
      </div>
    </section>
  );
}

export function JourneyScroll(props: {
  intro: React.ReactNode;
  eras: JourneyEra[];
  outro: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return reduced ? <JourneyList {...props} /> : <JourneyTrack {...props} />;
}

export default JourneyScroll;
