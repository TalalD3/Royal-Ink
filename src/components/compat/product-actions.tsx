"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, MessageSquare, ShoppingBag } from "lucide-react";
import { useSiteSettings } from "@/components/site-settings-provider";
import { storeUrlFor } from "@/types/site-settings";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT ACTIONS — shop on the online store / contact us
   While the store is not open (no store address in the admin settings)
   the shop button is shown greyed out, marked «قريباً», with a short
   line under it.
   ══════════════════════════════════════════════════════════════════════ */

export function contactHref(code?: string) {
  return code ? `/contact?product=${encodeURIComponent(code)}` : "/contact";
}

export function ShopButton({
  code,
  className,
  tone = "light",
  showNote = true,
}: {
  code?: string;
  className?: string;
  /** "dark" when the button sits on a black block */
  tone?: "light" | "dark";
  /** The «المتجر الإلكتروني قريباً» line under the button */
  showNote?: boolean;
}) {
  const href = storeUrlFor(useSiteSettings().onlineStoreUrl, code);
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn("ri-btn ri-btn-red", className)}>
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        <span>تسوق من متجرنا</span>
        <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }
  return (
    <div className={cn("flex flex-col items-stretch gap-1.5", className)}>
      <span
        role="link"
        aria-disabled="true"
        title="المتجر الإلكتروني قريباً"
        className={cn(
          "relative inline-flex h-12 cursor-not-allowed select-none items-center justify-center gap-2.5 px-7 text-[15px] font-bold",
          tone === "dark"
            ? "bg-white/10 text-white/45 ring-1 ring-inset ring-white/15"
            : "bg-brand-mist text-brand-gray/70 ring-1 ring-inset ring-brand-line"
        )}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        <span>تسوق من متجرنا</span>
        {/* Corner tag */}
        <span className="absolute -top-2 end-3 bg-brand-red px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
          قريباً
        </span>
      </span>
      {showNote && (
        <span className={cn("text-center text-xs font-medium", tone === "dark" ? "text-white/50" : "text-brand-gray")}>
          المتجر الإلكتروني قيد الإعداد — قريباً
        </span>
      )}
    </div>
  );
}

export function ContactButton({
  code,
  className,
  variant = "black",
}: {
  code?: string;
  className?: string;
  variant?: "black" | "red" | "white";
}) {
  return (
    <Link href={contactHref(code)} className={cn("ri-btn", `ri-btn-${variant}`, className)}>
      <MessageSquare className="h-4 w-4" aria-hidden="true" />
      <span>تواصل معنا</span>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
