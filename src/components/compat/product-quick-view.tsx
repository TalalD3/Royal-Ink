"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import type { Product } from "@/types/product";
import { CATEGORY_WORDS, arCount } from "@/i18n/specs";
import { buildSummarySentences } from "@/lib/product-summary";
import { printerSlug } from "@/lib/product-utils";
import { specRows } from "@/components/compat/spec-table";
import { ProductVisual } from "@/components/compat/product-visual";
import { ColorSwatches } from "@/components/compat/color-swatches";
import { ContactButton, ShopButton } from "@/components/compat/product-actions";
import { productHref } from "@/components/compat/product-card";

/* ══════════════════════════════════════════════════════════════════════
   QUICK LOOK — a square window with the essentials and a way to the full
   product page. Esc, the backdrop or ✕ close it; focus stays inside.
   ══════════════════════════════════════════════════════════════════════ */

const MAX_SPECS = 4;
const MAX_PRINTERS = 6;

export function ProductQuickView({
  product,
  onClose,
  onPickPrinter,
}: {
  product: Product | null;
  onClose: () => void;
  /** Filter the guide by a printer (the chip clicks) */
  onPickPrinter?: (slug: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!product) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => closeRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep Tab inside the window
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-black/70 sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            className="ri-strip relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden bg-white pt-[3px]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="absolute end-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-brand-black text-white transition-colors hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              {/* Visual */}
              <div className="bg-brand-mist">
                <ProductVisual
                  product={product}
                  code={product.sku}
                  className="aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-[320px]"
                  iconClassName="h-[30%] w-[30%] sm:h-[34%] sm:w-[34%]"
                />
                <div aria-hidden="true" className="ri-colorbar h-1.5" />
              </div>

              {/* Essentials */}
              <div className="p-5 sm:p-7">
                <p className="ri-eyebrow mb-3">{CATEGORY_WORDS[product.category].plural.ar}</p>
                <h2 className="pe-10 text-xl font-extrabold leading-8 text-brand-black sm:text-2xl sm:leading-9">
                  {product.name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {product.sku && (
                    <span dir="ltr" className="bg-brand-black px-2.5 py-1 text-xs font-bold tracking-wider text-white">
                      {product.sku}
                    </span>
                  )}
                  <ColorSwatches color={product.category === "printer" ? undefined : product.color} size="md" />
                  <span dir="ltr" className="text-xs font-bold text-brand-gray">
                    {product.brand}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-brand-gray">
                  {buildSummarySentences(product, "ar")[0]}
                </p>

                <dl className="mt-5 border-t border-brand-line">
                  {specRows(product, "ar")
                    .slice(2, 2 + MAX_SPECS)
                    .map((r) => (
                      <div key={r.label} className="flex items-center justify-between gap-4 border-b border-brand-line py-2.5">
                        <dt className="text-xs text-brand-gray">{r.label}</dt>
                        <dd dir={r.ltr ? "ltr" : undefined} className="text-sm font-extrabold text-brand-black">
                          {r.value}
                        </dd>
                      </div>
                    ))}
                </dl>

                {product.category !== "printer" && product.compatiblePrinters.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-extrabold text-brand-black">
                      متوافق مع <span dir="ltr">{product.compatiblePrinters.length}</span>{" "}
                      {arCount(product.compatiblePrinters.length, "طراز", "طرازين", "طرازات", "طرازاً")}
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {product.compatiblePrinters.slice(0, MAX_PRINTERS).map((m) => (
                        <li key={m}>
                          <button
                            type="button"
                            onClick={() => {
                              onPickPrinter?.(printerSlug(m));
                              onClose();
                            }}
                            dir="ltr"
                            className="bg-brand-mist px-2.5 py-1.5 text-xs font-bold text-brand-black transition-colors hover:bg-brand-black hover:text-white"
                          >
                            {m}
                          </button>
                        </li>
                      ))}
                      {product.compatiblePrinters.length > MAX_PRINTERS && (
                        <li className="px-1 py-1.5 text-xs font-bold text-brand-gray">
                          +{product.compatiblePrinters.length - MAX_PRINTERS}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-2 border-t border-brand-line bg-white p-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:p-4">
              <Link href={productHref(product)} className="ri-btn ri-btn-red h-12 px-4 text-sm">
                <span>صفحة المنتج الكاملة</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <ShopButton code={product.sku} showNote={false} className="[&>span]:h-12 [&>span]:px-3 [&>span]:text-sm" />
              <ContactButton code={product.sku} className="h-12 px-3 text-sm" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductQuickView;
