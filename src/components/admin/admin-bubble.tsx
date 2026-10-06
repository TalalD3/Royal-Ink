"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { EyeOff, LayoutDashboard, LogOut, X } from "lucide-react";
import { clearAdminHint, hasAdminHint } from "@/lib/admin-hint";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN BUBBLE — a floating shortcut to the dashboard, shown only to a
   logged-in admin (checked on the server through /api/me; visitors never
   even ask). Drag it anywhere, like a Messenger chat head: on release it
   snaps to the nearest side and remembers where it was. Drop it on the ✕
   target to hide it until the next visit. Tap it for the menu.
   ══════════════════════════════════════════════════════════════════════ */

const SIZE = 56;
const MARGIN = 12;
const TOP_LIMIT = 80 + MARGIN; // below the site header
const STORE_KEY = "ri-admin-bubble";
const HIDDEN_KEY = "ri-admin-bubble-hidden";
const INTRO_KEY = "ri-admin-bubble-intro";

type Side = "left" | "right";
type Saved = { side: Side; top: number };

function readSaved(): Saved {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (v && (v.side === "left" || v.side === "right") && typeof v.top === "number") return v;
  } catch {
    // ignore
  }
  return { side: "right", top: 0.62 };
}

function bounds() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    left: MARGIN,
    right: w - SIZE - MARGIN,
    top: TOP_LIMIT,
    bottom: Math.max(TOP_LIMIT, h - SIZE - MARGIN - 8),
  };
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function AdminBubble() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [overDismiss, setOverDismiss] = useState(false);
  const [side, setSide] = useState<Side>("right");
  const [intro, setIntro] = useState(false);
  const [limits, setLimits] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragged = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const onAdminPage = pathname?.startsWith("/admin");

  /* ── Show only to a logged-in admin ── */
  useEffect(() => {
    let cancelled = false;
    if (onAdminPage || !hasAdminHint()) return;
    try {
      if (sessionStorage.getItem(HIDDEN_KEY)) return;
    } catch {
      // ignore
    }
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((me) => {
        if (cancelled) return;
        if (me?.admin) {
          setEmail(me.email ?? null);
          setVisible(true);
        } else {
          clearAdminHint(); // the session has ended
        }
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [onAdminPage]);

  /* ── Place it (saved side + height) and keep it on screen on resize ── */
  const place = useCallback(
    (s: Side, topRatio?: number) => {
      const b = bounds();
      setLimits(b);
      const h = window.innerHeight;
      x.set(s === "right" ? b.right : b.left);
      y.set(clamp(topRatio !== undefined ? topRatio * h : y.get(), b.top, b.bottom));
      setSide(s);
    },
    [x, y]
  );

  useEffect(() => {
    if (!visible) return;
    const saved = readSaved();
    place(saved.side, saved.top);
    try {
      if (!localStorage.getItem(INTRO_KEY)) {
        setIntro(true);
        localStorage.setItem(INTRO_KEY, "1");
        setTimeout(() => setIntro(false), 4500);
      }
    } catch {
      // ignore
    }
    const onResize = () => place(readSaved().side, readSaved().top);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [visible, place]);

  /* ── Menu: close on outside tap or Esc ── */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !bubbleRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ── The ✕ target at the bottom while dragging ── */
  const dismissCenter = () => ({ x: window.innerWidth / 2, y: window.innerHeight - 56 });
  const isOverDismiss = () => {
    const c = dismissCenter();
    const dx = x.get() + SIZE / 2 - c.x;
    const dy = y.get() + SIZE / 2 - c.y;
    return Math.hypot(dx, dy) < 70;
  };

  const hide = () => {
    try {
      sessionStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
    setVisible(false);
  };

  const onDragEnd = () => {
    setDragging(false);
    if (isOverDismiss()) {
      setOverDismiss(false);
      hide();
      return;
    }
    const b = bounds();
    const nextSide: Side = x.get() + SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
    const nextY = clamp(y.get(), b.top, b.bottom);
    animate(x, nextSide === "right" ? b.right : b.left, { type: "spring", stiffness: 520, damping: 36 });
    animate(y, nextY, { type: "spring", stiffness: 520, damping: 36 });
    setSide(nextSide);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ side: nextSide, top: nextY / window.innerHeight }));
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    clearAdminHint();
    setOpen(false);
    setVisible(false);
    router.refresh();
  };

  if (!visible || onAdminPage) return null;

  // The menu opens towards the middle of the screen, next to the bubble
  const panelStyle: React.CSSProperties =
    side === "right"
      ? { right: MARGIN + SIZE + 10, top: clamp(y.get(), MARGIN + 80, window.innerHeight - 220) }
      : { left: MARGIN + SIZE + 10, top: clamp(y.get(), MARGIN + 80, window.innerHeight - 220) };

  return (
    <>
      {/* Hide target, shown while dragging */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, scale: overDismiss ? 1.15 : 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
            aria-hidden="true"
            className="pointer-events-none fixed bottom-6 left-1/2 z-[57] -translate-x-1/2"
          >
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)] transition-colors",
                overDismiss ? "bg-brand-red" : "bg-brand-black/85"
              )}
            >
              <X className="h-7 w-7" />
            </div>
            <p className="mt-1.5 text-center text-[11px] font-bold text-brand-black">إخفاء</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The bubble */}
      <motion.button
        ref={bubbleRef}
        type="button"
        aria-label="لوحة تحكم المسؤول"
        aria-expanded={open}
        aria-haspopup="menu"
        drag
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={limits}
        style={{ x, y, width: SIZE, height: SIZE, touchAction: "none" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileDrag={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        onPointerDown={() => {
          dragged.current = false;
        }}
        onDragStart={() => {
          dragged.current = true;
          setDragging(true);
          setOpen(false);
          setIntro(false);
        }}
        onDrag={() => setOverDismiss(isOverDismiss())}
        onDragEnd={onDragEnd}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          setIntro(false);
          setOpen((o) => !o);
        }}
        className="group fixed left-0 top-0 z-[58] cursor-grab select-none overflow-hidden bg-brand-black text-white shadow-[0_16px_34px_-12px_rgba(0,0,0,0.6)] outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:cursor-grabbing"
      >
        {/* The logo's red block, growing on hover / when open */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 right-0 bg-brand-red transition-[width] duration-300 ease-out",
            open ? "w-full" : "w-[36%] group-hover:w-full"
          )}
        />
        <LayoutDashboard className="relative mx-auto h-6 w-6" aria-hidden="true" />
        {/* A small square pulse when it first appears */}
        <span aria-hidden="true" className="ri-bubble-pulse pointer-events-none absolute inset-0 ring-2 ring-brand-red" />
      </motion.button>

      {/* First-time hint */}
      <AnimatePresence>
        {intro && !open && (
          <motion.div
            initial={{ opacity: 0, x: side === "right" ? 8 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            dir="rtl"
            style={side === "right" ? { right: MARGIN + SIZE + 10, top: y.get() + 6 } : { left: MARGIN + SIZE + 10, top: y.get() + 6 }}
            className="pointer-events-none fixed z-[58] bg-brand-black px-3 py-2 text-xs font-bold text-white shadow-lg"
          >
            لوحة التحكم — اسحب الزر لتحريكه
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="menu"
            dir="rtl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={panelStyle}
            className="ri-strip fixed z-[59] w-60 bg-white pt-[3px] text-brand-black shadow-[0_24px_50px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="border-b border-brand-line px-4 py-3">
              <p className="text-[11px] font-extrabold text-brand-red">وضع المسؤول</p>
              {email && (
                <p dir="ltr" className="mt-0.5 truncate text-right text-xs text-brand-gray">
                  {email}
                </p>
              )}
            </div>
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 bg-brand-black px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-red"
            >
              لوحة التحكم
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={hide}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-brand-mist"
            >
              إخفاء الزر لهذه الزيارة
              <EyeOff className="h-4 w-4 text-brand-gray" aria-hidden="true" />
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center justify-between gap-3 border-t border-brand-line px-4 py-3 text-sm font-bold text-brand-red transition-colors hover:bg-brand-mist"
            >
              تسجيل الخروج
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminBubble;
