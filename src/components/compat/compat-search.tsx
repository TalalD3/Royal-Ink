"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpLeft, MessageSquare, Printer, Search, X } from "lucide-react";
import type { Product } from "@/types/product";
import { CATEGORY_WORDS, arCount } from "@/i18n/specs";
import { BRAND_LOGOS } from "@/data/brand-logos";
import type { PrinterEntry } from "@/lib/product-utils";
import {
  highlightParts,
  searchPrinters,
  searchProducts,
  type SearchIndex,
} from "@/lib/compat-search";
import { ColorSwatches } from "@/components/compat/color-swatches";
import { ProductVisual } from "@/components/compat/product-visual";
import { PrintLoader } from "@/components/compat/print-loader";
import { productHref } from "@/components/compat/product-card";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   SMART SEARCH — as you type, a panel shows the matching printers in a
   column and the matching supplies as a picture grid (no prices: this
   guide informs). Supplies include everything that fits a matched
   printer. ↑ ↓ to move, Enter to open, Esc to close.
   Phones: the panel opens as a full-screen sheet.
   ══════════════════════════════════════════════════════════════════════ */

const MAX_PRINTERS = 8;
const MAX_PRODUCTS = 9;

type Item =
  | { kind: "printer"; entry: PrinterEntry }
  | { kind: "product"; product: Product }
  | { kind: "all" };

function Highlight({ text, q }: { text: string; q: string }) {
  return (
    <>
      {highlightParts(text, q).map((part, i) =>
        part.hit ? (
          <mark key={i} className="bg-transparent font-extrabold text-brand-red">
            {part.s}
          </mark>
        ) : (
          <span key={i}>{part.s}</span>
        )
      )}
    </>
  );
}

export function CompatSearch({
  index,
  value,
  onApply,
  onPickPrinter,
  autoFocus = false,
}: {
  index: SearchIndex;
  /** The query currently applied to the results */
  value: string;
  /** Show all results for a query in the main grid */
  onApply: (q: string) => void;
  /** Filter the guide by a printer */
  onPickPrinter: (slug: string) => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [typing, setTyping] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const [isPhone, setIsPhone] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // A short "printing" beat while typing — the CMYK squares
  useEffect(() => {
    if (!q.trim()) return;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 160);
    return () => clearTimeout(t);
  }, [q]);

  // Click outside closes the desktop panel
  useEffect(() => {
    if (!open || isPhone) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, isPhone]);

  // Phone sheet: lock the page and focus its own field
  useEffect(() => {
    if (!(open && isPhone)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => sheetInputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, isPhone]);

  const printers = useMemo(() => searchPrinters(index, q).slice(0, MAX_PRINTERS), [index, q]);
  const allProducts = useMemo(() => {
    if (!q.trim()) return [];
    const direct = searchProducts(index, q).filter((p) => p.category !== "printer");
    // Plus everything that fits the matched printers
    const seen = new Set(direct.map((p) => p.id));
    const viaPrinters: Product[] = [];
    searchPrinters(index, q).forEach((e) =>
      e.supplies.forEach((p) => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          viaPrinters.push(p);
        }
      })
    );
    const printerProducts = searchProducts(index, q).filter((p) => p.category === "printer");
    return [...direct, ...viaPrinters, ...printerProducts];
  }, [index, q]);
  const products = allProducts.slice(0, MAX_PRODUCTS);

  const items: Item[] = useMemo(
    () => [
      ...printers.map((entry) => ({ kind: "printer" as const, entry })),
      ...products.map((product) => ({ kind: "product" as const, product })),
      ...(allProducts.length ? [{ kind: "all" as const }] : []),
    ],
    [printers, products, allProducts.length]
  );

  useEffect(() => setActive(-1), [q]);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const run = (item: Item | undefined) => {
    if (!item) {
      onApply(q.trim());
      close();
      return;
    }
    if (item.kind === "printer") {
      onPickPrinter(item.entry.slug);
      close();
    } else if (item.kind === "product") {
      close();
      router.push(productHref(item.product));
    } else {
      onApply(q.trim());
      close();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(active >= 0 ? items[active] : undefined);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      close();
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;
  const hasQuery = q.trim().length > 0;
  const showPanel = open && hasQuery;

  /* ── The results (shared by the desktop panel and the phone sheet) ── */
  const results = (
    <div className="flex min-h-0 flex-col">
      {typing && (
        <div className="absolute end-4 top-4 z-10">
          <PrintLoader compact label="جارٍ البحث" />
        </div>
      )}

      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div dir="ltr" aria-hidden="true" className="mx-auto mb-5 flex w-fit gap-1">
            <span className="h-3.5 w-3.5 bg-cmyk-c" />
            <span className="h-3.5 w-3.5 bg-cmyk-m" />
            <span className="h-3.5 w-3.5 bg-brand-mist" />
            <span className="h-3.5 w-3.5 bg-brand-black" />
          </div>
          <p className="text-base font-extrabold text-brand-black">
            لم نجد نتيجة لـ «<span dir="auto">{q}</span>»
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-brand-gray">
            تأكد من الاسم الكامل لطراز الطابعة أو رمز الخرطوشة. إن بقي الشك، أرسل لنا صورة ملصق الطابعة وسنحدد لك المستلزم المناسب.
          </p>
          <Link href="/contact" className="ri-btn ri-btn-black mt-5 h-11 px-5 text-sm" onClick={close}>
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>أرسل لنا صورة الملصق</span>
          </Link>
        </div>
      ) : (
        <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          {/* Printers column */}
          <div className="border-b border-brand-line bg-brand-mist md:border-b-0 md:border-e">
            <p className="flex items-center justify-between px-4 pb-2 pt-4 text-xs font-extrabold text-brand-black">
              <span className="flex items-center gap-2">
                <Printer className="h-3.5 w-3.5 text-brand-red" aria-hidden="true" />
                الطابعات
              </span>
              {printers.length > 0 && <span dir="ltr" className="text-brand-gray">{printers.length}</span>}
            </p>
            {printers.length === 0 ? (
              <p className="px-4 pb-4 text-xs leading-6 text-brand-gray">لا توجد طابعة بهذا الاسم.</p>
            ) : (
              <ul className="flex gap-1.5 overflow-x-auto px-4 pb-4 md:block md:space-y-0.5 md:overflow-visible md:px-2 md:pb-3">
                {printers.map((e, i) => {
                  const logo = e.brand ? BRAND_LOGOS[e.brand] : undefined;
                  const isActive = active === i;
                  return (
                    <li key={e.slug} className="shrink-0 md:shrink">
                      <div
                        id={optionId(i)}
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex items-stretch transition-colors",
                          isActive ? "bg-brand-black text-white" : "bg-white md:bg-transparent hover:bg-white"
                        )}
                      >
                        <button
                          type="button"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => run({ kind: "printer", entry: e })}
                          className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-start"
                        >
                          {logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logo.logo}
                              alt=""
                              className={cn("hidden h-4 w-8 shrink-0 object-contain md:block", isActive && "brightness-0 invert")}
                            />
                          )}
                          <span className="min-w-0">
                            <span dir="ltr" className="block truncate text-[13px] font-bold">
                              <Highlight text={e.model} q={q} />
                            </span>
                            <span className={cn("hidden text-[11px] md:block", isActive ? "text-white/60" : "text-brand-gray")}>
                              <span dir="ltr">{e.supplies.length}</span>{" "}
                              {arCount(e.supplies.length, "مستلزم", "مستلزمان", "مستلزمات", "مستلزماً")}
                            </span>
                          </span>
                        </button>
                        <Link
                          href={`/compatibility/printer/${e.slug}`}
                          onClick={close}
                          aria-label={`صفحة الطابعة ${e.model}`}
                          title="صفحة الطابعة"
                          className={cn(
                            "hidden w-9 shrink-0 items-center justify-center transition-colors md:flex",
                            isActive ? "text-white hover:bg-brand-red" : "text-brand-gray hover:bg-brand-red hover:text-white"
                          )}
                        >
                          <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Supplies grid */}
          <div className="min-w-0 p-3 sm:p-4">
            <p className="mb-3 flex items-center justify-between px-1 text-xs font-extrabold text-brand-black">
              <span>المستلزمات</span>
              <span dir="ltr" className="text-brand-gray">{allProducts.length}</span>
            </p>
            {products.length === 0 ? (
              <p className="px-1 text-sm text-brand-gray">لا توجد مستلزمات مطابقة.</p>
            ) : (
              <ul
                className={cn(
                  "grid grid-cols-1 border-s border-t border-brand-line",
                  products.length > 1 && "sm:grid-cols-2",
                  products.length > 2 && "xl:grid-cols-3"
                )}
              >
                {products.map((p, j) => {
                  const i = printers.length + j;
                  const isActive = active === i;
                  return (
                    <li key={p.id} className="border-b border-e border-brand-line bg-white">
                      <Link
                        id={optionId(i)}
                        role="option"
                        aria-selected={isActive}
                        href={productHref(p)}
                        onClick={close}
                        className={cn(
                          "group flex items-center gap-3 p-2.5 transition-colors",
                          isActive ? "bg-brand-black text-white" : "hover:bg-brand-mist"
                        )}
                      >
                        <ProductVisual product={p} className="h-14 w-14 shrink-0" iconClassName="h-[48%] w-[48%]" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            {p.sku && (
                              <span dir="ltr" className={cn("truncate text-[11px] font-extrabold", isActive ? "text-white" : "text-brand-red")}>
                                <Highlight text={p.sku} q={q} />
                              </span>
                            )}
                            <ColorSwatches color={p.category === "printer" ? undefined : p.color} />
                          </span>
                          <span className="mt-0.5 line-clamp-1 text-[13px] font-bold">{p.name}</span>
                          <span className={cn("text-[11px]", isActive ? "text-white/60" : "text-brand-gray")}>
                            {CATEGORY_WORDS[p.category].plural.ar}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {allProducts.length > 0 && (
              <button
                id={optionId(items.length - 1)}
                role="option"
                aria-selected={active === items.length - 1}
                type="button"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => run({ kind: "all" })}
                className={cn(
                  "mt-3 flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-extrabold transition-colors",
                  active === items.length - 1 ? "bg-brand-red text-white" : "bg-brand-black text-white hover:bg-brand-red"
                )}
              >
                <span>
                  عرض كل النتائج (<span dir="ltr">{allProducts.length}</span>)
                </span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ── The field ── */
  const field = (ref: React.RefObject<HTMLInputElement>, inSheet: boolean) => (
    <div className={cn("relative flex items-center bg-white text-brand-black", inSheet ? "h-14" : "h-16 md:h-[4.5rem]")}>
      <Search className="pointer-events-none absolute start-5 h-5 w-5 text-brand-gray" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? optionId(active) : undefined}
        aria-label="ابحث بموديل الطابعة أو رمز الخرطوشة"
        autoComplete="off"
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="موديل الطابعة أو رمز الخرطوشة… مثال: 2620 ، 85A ، L3150"
        className="h-full w-full bg-transparent pe-28 ps-14 text-[15px] font-bold outline-none placeholder:font-medium placeholder:text-brand-gray/70 md:text-lg [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setQ("");
            onApply("");
            ref.current?.focus();
          }}
          aria-label="مسح البحث"
          className="absolute end-[4.75rem] flex h-9 w-9 items-center justify-center text-brand-gray hover:text-brand-red md:end-24"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => run(active >= 0 ? items[active] : undefined)}
        aria-label="بحث"
        className="absolute end-2 flex h-12 w-16 items-center justify-center bg-brand-red text-white transition-colors hover:bg-brand-black md:h-14 md:w-20"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div ref={wrapRef} className="relative">
      {field(inputRef, false)}

      {/* Desktop / tablet panel */}
      <AnimatePresence>
        {showPanel && !isPhone && (
          <motion.div
            id={listId}
            role="listbox"
            aria-label="نتائج البحث"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(70vh,640px)] overflow-y-auto bg-white text-brand-black shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)]"
          >
            <div aria-hidden="true" className="ri-colorbar h-1" />
            {results}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone sheet — rendered on <body> so no header or section covers it */}
      {mounted &&
        createPortal(
      <AnimatePresence>
        {open && isPhone && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            dir="rtl"
            className="fixed inset-0 z-[70] flex flex-col bg-white text-brand-black"
          >
            <div className="flex items-center gap-2 bg-brand-black p-3">
              <div className="min-w-0 flex-1">{field(sheetInputRef, true)}</div>
              <button
                type="button"
                onClick={close}
                aria-label="إغلاق البحث"
                className="flex h-14 w-12 shrink-0 items-center justify-center text-white"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div aria-hidden="true" className="ri-colorbar h-1" />
            <div id={listId} role="listbox" aria-label="نتائج البحث" className="relative min-h-0 flex-1 overflow-y-auto">
              {hasQuery ? (
                results
              ) : (
                <p className="px-6 py-10 text-center text-sm leading-7 text-brand-gray">
                  اكتب موديل طابعتك (مثل <span dir="ltr">2620</span> أو <span dir="ltr">L3150</span>) أو رمز الخرطوشة
                  (مثل <span dir="ltr">85A</span>).
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

export default CompatSearch;
