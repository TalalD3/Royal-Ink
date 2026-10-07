"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, ChevronDown, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN UI — the dashboard's building blocks, in the site's theme:
   black and red from the logo, square corners, hairlines, the two-block
   strip on top of panels. Used by every admin screen so they all match.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Form controls ── */

export const inputCls =
  "h-11 w-full border border-brand-line bg-white px-3.5 text-sm text-brand-black outline-none transition-[border-color,box-shadow] placeholder:text-brand-gray/60 focus:border-brand-black focus:shadow-[inset_0_-2px_0_rgb(var(--brand-red))] disabled:cursor-not-allowed disabled:bg-brand-mist";

export const textareaCls =
  "w-full resize-y border border-brand-line bg-white px-3.5 py-2.5 text-sm leading-7 text-brand-black outline-none transition-[border-color,box-shadow] placeholder:text-brand-gray/60 focus:border-brand-black focus:shadow-[inset_0_-2px_0_rgb(var(--brand-red))]";

export function Field({
  label,
  hint,
  required,
  htmlFor,
  className,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-extrabold text-brand-black">
        {label}
        {required && <span className="ms-1 text-brand-red">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-brand-gray">{hint}</p>}
    </div>
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputCls, "cursor-pointer appearance-none pe-10", className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" aria-hidden="true" />
    </div>
  );
}

/** A square on/off switch with its label */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 border border-brand-line bg-white p-4 text-start transition-colors hover:border-brand-black"
    >
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-brand-black">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-brand-gray">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn("relative h-6 w-11 shrink-0 transition-colors", checked ? "bg-brand-red" : "bg-brand-line")}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 bg-white transition-[inset-inline-start]",
            checked ? "start-6" : "start-1"
          )}
        />
      </span>
    </button>
  );
}

/* ── Buttons ── */

type BtnVariant = "red" | "black" | "outline" | "ghost" | "danger";

const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red";

const btnVariants: Record<BtnVariant, string> = {
  red: "bg-brand-red text-white hover:bg-brand-black",
  black: "bg-brand-black text-white hover:bg-brand-red",
  outline: "border border-brand-line bg-white text-brand-black hover:border-brand-black",
  ghost: "text-brand-gray hover:bg-brand-mist hover:text-brand-black",
  danger: "border border-brand-red/30 bg-white text-brand-red hover:bg-brand-red hover:text-white",
};

export function Btn({
  variant = "outline",
  size = "md",
  loading,
  icon,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md";
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cn(btnBase, btnVariants[variant], size === "sm" ? "h-9 px-3 text-[13px]" : "h-11 px-5 text-sm", className)}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

/** A square icon-only button (its label is read by screen readers and shown on hover) */
export function IconBtn({
  label,
  tone = "default",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "default" | "danger" | "active";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red",
        tone === "danger" && "border-brand-red/25 bg-white text-brand-red hover:bg-brand-red hover:text-white",
        tone === "active" && "border-brand-black bg-brand-black text-white hover:bg-brand-red hover:border-brand-red",
        tone === "default" && "border-brand-line bg-white text-brand-black hover:border-brand-black",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Layout ── */

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border border-brand-line bg-white", className)}>{children}</div>;
}

/** The title row of a screen: eyebrow, title, a line of text, actions */
export function SectionHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="ri-eyebrow mb-2">{eyebrow}</p>
        <h2 className="text-xl font-extrabold text-brand-black sm:text-2xl">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-brand-gray">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const LG_COLS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

/** Figures in a ruled strip (the first one on black) */
export function StatStrip({
  items,
}: {
  items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[];
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-px border border-brand-line bg-brand-line", LG_COLS[items.length])}>
      {items.map((it, i) => (
        <div
          key={it.label}
          className={cn(
            "flex items-center gap-3 p-4",
            i === 0 ? "bg-brand-black text-white" : "bg-white text-brand-black",
            items.length % 2 === 1 && i === items.length - 1 && "col-span-2 lg:col-span-1"
          )}
        >
          {it.icon && (
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center",
                i === 0 ? "bg-brand-red text-white" : "bg-brand-mist text-brand-black"
              )}
            >
              {it.icon}
            </span>
          )}
          <span className="min-w-0">
            <span dir="ltr" className="block text-right text-2xl font-extrabold leading-none tabular-nums">
              {it.value}
            </span>
            <span className={cn("mt-1 block text-xs", i === 0 ? "text-white/65" : "text-brand-gray")}>{it.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Small pieces ── */

export function Badge({
  tone = "mist",
  className,
  children,
}: {
  tone?: "black" | "red" | "mist" | "outline" | "success";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-[11px] font-extrabold leading-none",
        tone === "black" && "bg-brand-black text-white",
        tone === "red" && "bg-brand-red text-white",
        tone === "mist" && "bg-brand-mist text-brand-black",
        tone === "outline" && "border border-brand-line text-brand-gray",
        tone === "success" && "bg-brand-black text-white",
        className
      )}
    >
      {tone === "success" && <span className="h-1.5 w-1.5 bg-brand-red" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Notice({
  tone = "info",
  children,
  onClose,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertTriangle;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 border-s-4 px-4 py-3 text-sm leading-6",
        tone === "danger" && "border-brand-red bg-brand-red/5 text-brand-red",
        tone === "warning" && "border-brand-red bg-brand-mist text-brand-black",
        tone === "info" && "border-brand-black bg-brand-mist text-brand-black",
        tone === "success" && "border-brand-black bg-brand-mist text-brand-black"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 font-semibold">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="إغلاق" className="shrink-0 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-brand-line bg-white px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center bg-brand-mist text-brand-black">{icon}</span>
      <p className="mt-4 text-base font-extrabold text-brand-black">{title}</p>
      {text && <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-brand-gray">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = "جارٍ التحميل…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div dir="ltr" className="flex gap-1.5" aria-hidden="true">
        {["bg-cmyk-c", "bg-cmyk-m", "bg-cmyk-y", "bg-brand-black"].map((c, i) => (
          <span key={c} className="relative block h-4 w-4 bg-brand-mist">
            <span className={cn("ri-print-ink absolute inset-0", c)} style={{ animationDelay: `${i * 0.15}s` }} />
          </span>
        ))}
      </div>
      <span className="text-sm font-bold text-brand-gray">{label}</span>
    </div>
  );
}

/** A short message at the bottom of the screen */
export function Toast({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) {
  return (
    <div
      role="status"
      className={cn(
        "fixed inset-x-4 bottom-4 z-[80] mx-auto flex max-w-md items-center gap-3 px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:start-6",
        tone === "success" ? "bg-brand-black" : "bg-brand-red"
      )}
    >
      {tone === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  );
}

/* ── Modal: full screen on phones, a square panel from sm up ── */

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  footer,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-stretch justify-center bg-brand-black/70 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "ri-strip flex w-full flex-col bg-white pt-[3px] sm:max-h-[92vh]",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-2xl",
          size === "lg" && "sm:max-w-4xl"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <p className="mb-1 text-[11px] font-extrabold text-brand-red">{eyebrow}</p>}
            <h3 className="text-lg font-extrabold text-brand-black">{title}</h3>
            {description && <p className="mt-0.5 text-xs leading-5 text-brand-gray">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-black text-white transition-colors hover:bg-brand-red"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-row-reverse gap-2 border-t border-brand-line bg-brand-mist px-4 py-3 [&>*]:flex-1 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4 sm:[&>*]:flex-none">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** A titled group inside a form */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-brand-line pt-5 first:border-t-0 first:pt-0">
      <h4 className="flex items-center gap-2 text-sm font-extrabold text-brand-black">
        <span className="h-2 w-2 bg-brand-red" aria-hidden="true" />
        {title}
      </h4>
      {description && <p className="mt-1 text-xs leading-5 text-brand-gray">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
