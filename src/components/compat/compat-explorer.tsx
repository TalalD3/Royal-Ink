"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, Printer, RotateCcw, X } from "lucide-react";
import type { PrinterBrand, Product, ProductCategory } from "@/types/product";
import { CATEGORY_ORDER } from "@/types/product";
import { CATEGORY_WORDS, arCount } from "@/i18n/specs";
import { BRAND_LOGOS } from "@/data/brand-logos";
import { normalize, suppliesFor } from "@/lib/product-utils";
import { buildSearchIndex, queryTokens, searchProducts, sortCatalogue } from "@/lib/compat-search";
import { CategoryIcon } from "@/components/ui/category-icons";
import { ContactSplitCard } from "@/components/ui/contact-split-card";
import { CompatSearch } from "@/components/compat/compat-search";
import { ProductCard } from "@/components/compat/product-card";
import { ProductQuickView } from "@/components/compat/product-quick-view";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   COMPATIBILITY EXPLORER — /compatibility

   1. Hero      — black block, the search in the middle, popular printers,
                  a test-print card; the print colour bar on its edge and
                  a red figures strip under it
   2. Filters   — brands (logos) and categories (the home tiles)
   3. Printer   — banner when the guide is filtered by a printer
   4. Results   — cards, 24 at a time; quick look on the eye button
   5. Help      — can't find your printer? send us the label
   All filters live in the address (?q= &brand= &category= &printer=).
   ══════════════════════════════════════════════════════════════════════ */

const PAGE = 24;

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function CompatExplorer({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildSearchIndex(products), [products]);

  /* ── State from the address ── */
  const q = params.get("q") ?? "";
  const brands = list(params.get("brand")) as PrinterBrand[];
  const categories = list(params.get("category")) as ProductCategory[];
  const printerSlug = params.get("printer") ?? "";
  const printer = useMemo(
    () => (printerSlug ? index.printers.find((e) => e.slug === printerSlug) : undefined),
    [index, printerSlug]
  );

  const setParams = useCallback(
    (patch: Record<string, string | string[] | null>, scroll = false) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([k, v]) => {
        const val = Array.isArray(v) ? v.join(",") : v;
        if (val) next.set(k, val);
        else next.delete(k);
      });
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      if (scroll) {
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
    },
    [params, pathname, router]
  );

  const toggle = (key: "brand" | "category", current: string[], value: string) =>
    setParams({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });

  /* ── Results ── */
  const base = useMemo(() => {
    let set = q.trim() ? searchProducts(index, q) : sortCatalogue(products);
    if (printer) {
      const fits = new Set(suppliesFor(printer.model, products).map((p) => p.id));
      if (printer.printerProduct) fits.add(printer.printerProduct.id);
      set = set.filter((p) => fits.has(p.id));
    }
    return set;
  }, [index, products, q, printer]);

  const results = useMemo(
    () =>
      base.filter(
        (p) =>
          (!brands.length || brands.includes(p.brand)) &&
          (!categories.length || categories.includes(p.category))
      ),
    [base, brands, categories]
  );

  // Facet counts: each facet ignores its own selection
  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    base
      .filter((p) => !categories.length || categories.includes(p.category))
      .forEach((p) => m.set(p.brand, (m.get(p.brand) ?? 0) + 1));
    return m;
  }, [base, categories]);
  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    base
      .filter((p) => !brands.length || brands.includes(p.brand))
      .forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, [base, brands]);

  const allBrands = useMemo(() => {
    const present = new Set(products.map((p) => p.brand));
    return (Object.keys(BRAND_LOGOS) as PrinterBrand[]).filter((b) => present.has(b));
  }, [products]);
  // All eight categories always show (as on the home page); empty ones are dimmed
  const allCategories = CATEGORY_ORDER;

  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [q, printerSlug, brands.join(), categories.join()]);

  const [quick, setQuick] = useState<Product | null>(null);
  const closeQuick = useCallback(() => setQuick(null), []);

  const highlight = useMemo(() => {
    if (printer) return normalize(printer.model);
    const t = queryTokens(q);
    return t[0];
  }, [q, printer]);

  const supplyCount = useCallback(
    (p: Product) => (p.category === "printer" ? suppliesFor(p.compatiblePrinters[0] ?? "", products).length : undefined),
    [products]
  );

  const filtersOn = !!(q || brands.length || categories.length || printer);
  const popular = index.printers.filter((e) => e.supplies.length > 0).slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── 1. HERO ─── */}
      <section className="relative isolate z-10 bg-brand-black text-white">
        <div
          aria-hidden="true"
          className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,#000,transparent_65%)]"
        />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-10 pb-12 pt-10 md:pb-16 md:pt-14 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-14">
            <div className="min-w-0">
              <nav aria-label="مسار الصفحة" className="mb-6 flex items-center gap-2 text-sm text-white/55 sm:mb-8">
                <Link href="/" className="transition-colors hover:text-white">
                  الرئيسية
                </Link>
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-bold text-white">دليل التوافق</span>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="ri-eyebrow ri-eyebrow-light mb-4">دليل التوافق</p>
                <h1 className="text-balance text-[1.875rem] font-extrabold leading-[1.3] sm:text-[2.5rem] lg:text-[3rem]">
                  ابحث عن المستلزم المتوافق مع طابعتك
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                  اكتب موديل طابعتك أو رمز الخرطوشة، واعرف فوراً مستلزمات روايال إنك المتوافقة معها — بلا حيرة،
                  وبلا خطأ في الاختيار.
                </p>
              </motion.div>

              <div className="relative z-20 mt-8">
                <CompatSearch
                  index={index}
                  value={q}
                  onApply={(v) => setParams({ q: v || null }, !!v)}
                  onPickPrinter={(slug) => setParams({ printer: slug, q: null }, true)}
                />
              </div>

              {popular.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="me-1 text-xs font-bold text-white/55">الأكثر بحثاً:</span>
                  {popular.map((e) => (
                    <button
                      key={e.slug}
                      type="button"
                      onClick={() => setParams({ printer: e.slug, q: null }, true)}
                      dir="ltr"
                      className={cn(
                        "px-2.5 py-1.5 text-xs font-bold transition-colors",
                        printerSlug === e.slug ? "bg-brand-red text-white" : "bg-white/10 text-white hover:bg-white hover:text-brand-black"
                      )}
                    >
                      {e.model}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test print — the printer's colour check, in our label colours */}
            <TestPrintCard />
          </div>
        </div>

        {/* Print colour bar along the edge, then the figures in red */}
        <div aria-hidden="true" className="ri-colorbar h-2" />
        <div className="bg-brand-red">
          <div className="container mx-auto px-4">
            <dl className="mx-auto grid max-w-4xl grid-cols-3 gap-4 py-6 md:py-7">
              {[
                {
                  v: products.filter((p) => p.category !== "printer").length,
                  l: (n: number) => arCount(n, "مستلزم في الدليل", "مستلزمان في الدليل", "مستلزمات في الدليل", "مستلزماً في الدليل"),
                },
                {
                  v: index.printers.length,
                  l: (n: number) => arCount(n, "طراز طابعة متوافق", "طرازا طابعات", "طرازات طابعات متوافقة", "طرازاً متوافقاً"),
                },
                {
                  v: allBrands.length,
                  l: (n: number) => arCount(n, "علامة طابعات", "علامتا طابعات", "علامات طابعات", "علامة طابعات"),
                },
              ].map((f) => (
                <div key={f.v + f.l(f.v)} className="flex flex-col-reverse items-center gap-1.5 text-center">
                  <dt className="text-xs leading-5 text-white/90 sm:text-sm">{f.l(f.v)}</dt>
                  <dd dir="ltr" className="text-3xl font-extrabold leading-none tabular-nums sm:text-4xl">
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ─── 2. FILTERS ─── */}
      <section aria-label="تصفية النتائج" className="border-b border-brand-line bg-white">
        <div className="container mx-auto px-4">
          {/* Categories — the home tiles */}
          <div className="grid grid-cols-4 gap-px bg-brand-line md:grid-cols-8">
            {allCategories.map((c) => {
              const on = categories.includes(c);
              const count = categoryCounts.get(c) ?? 0;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle("category", categories, c)}
                  aria-pressed={on}
                  disabled={!on && count === 0}
                  className={cn(
                    "group relative isolate flex flex-col items-center gap-2 px-1.5 py-4 text-center transition-colors disabled:cursor-not-allowed sm:py-5 [&:disabled>*]:opacity-35",
                    on ? "bg-brand-black text-white" : "bg-white text-brand-black"
                  )}
                >
                  {!on && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-brand-mist transition-transform duration-300 [@media(hover:hover)]:group-enabled:group-hover:scale-y-100"
                    />
                  )}
                  <span className={cn("flex h-11 w-11 items-center justify-center transition-colors", on ? "bg-brand-red text-white" : "bg-brand-mist [@media(hover:hover)]:group-enabled:group-hover:bg-white")}>
                    <CategoryIcon category={c} className="h-6 w-6" />
                  </span>
                  <span className="text-[13px] font-extrabold leading-5">{CATEGORY_WORDS[c].plural.ar}</span>
                  <span dir="ltr" className={cn("text-[11px] font-bold", on ? "text-white/60" : "text-brand-gray")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Brands — the logos. A wrapping grid: three per row on phones,
              one row on wide screens; tiles stretch to fill their row */}
          <div className="flex flex-wrap gap-px border-t border-brand-line bg-brand-line">
            {allBrands.map((b) => {
              const on = brands.includes(b);
              const count = brandCounts.get(b) ?? 0;
              const logo = BRAND_LOGOS[b];
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggle("brand", brands, b)}
                  aria-pressed={on}
                  aria-label={`${logo.name} (${count})`}
                  disabled={!on && count === 0}
                  className={cn(
                    "group relative flex h-14 min-w-0 grow basis-[30%] items-center justify-center px-3 transition-colors disabled:cursor-not-allowed sm:h-16 sm:basis-[8.5rem] [&:disabled>*]:opacity-35",
                    on ? "bg-brand-black" : "bg-white [@media(hover:hover)]:hover:bg-brand-mist"
                  )}
                >
                  {/* The logo, kept inside the tile */}
                  <span className="flex h-full max-w-[78%] items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.logo}
                      alt=""
                      className={cn(
                        "w-auto max-w-full object-contain transition duration-300",
                        logo.sizeClass,
                        on
                          ? "brightness-0 invert"
                          : "opacity-60 grayscale [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:grayscale-0"
                      )}
                    />
                  </span>
                  {/* Count in the corner */}
                  <span
                    dir="ltr"
                    className={cn(
                      "absolute end-1.5 top-1 text-[10px] font-extrabold tabular-nums sm:end-2 sm:top-1.5",
                      on ? "text-white/70" : "text-brand-gray"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3 + 4. RESULTS ─── */}
      <section ref={resultsRef} className="scroll-mt-20 bg-brand-mist py-10 md:py-14">
        <div className="container mx-auto px-4">
          {/* Printer banner */}
          {printer && (
            <div className="ri-strip mb-8 grid grid-cols-1 bg-brand-black pt-[3px] text-white md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex items-center gap-4 p-5 sm:p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand-red">
                  <Printer className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/60">مستلزمات الطابعة</p>
                  <p dir="ltr" className="truncate text-right text-lg font-extrabold sm:text-2xl">
                    {printer.model}
                  </p>
                  <p className="mt-0.5 text-sm text-white/70">
                    <span dir="ltr">{printer.supplies.length}</span>{" "}
                    {arCount(printer.supplies.length, "مستلزم متوافق", "مستلزمان متوافقان", "مستلزمات متوافقة", "مستلزماً متوافقاً")}
                  </p>
                </div>
              </div>
              <div className="flex items-stretch border-t border-white/10 md:border-s md:border-t-0">
                <Link
                  href={`/compatibility/printer/${printer.slug}`}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-extrabold transition-colors hover:bg-brand-red"
                >
                  صفحة الطابعة
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => setParams({ printer: null })}
                  className="flex items-center justify-center gap-2 border-s border-white/10 px-6 py-4 text-sm font-bold text-white/70 transition-colors hover:bg-white hover:text-brand-black"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-brand-gray">
              <span dir="ltr" className="text-lg font-extrabold text-brand-black">
                {results.length}
              </span>{" "}
              {arCount(results.length, "نتيجة", "نتيجتان", "نتائج", "نتيجة")}
              {q && (
                <>
                  {" "}لـ «<span dir="auto" className="font-bold text-brand-black">{q}</span>»
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {q && <Chip label={`بحث: ${q}`} onRemove={() => setParams({ q: null })} />}
              {categories.map((c) => (
                <Chip key={c} label={CATEGORY_WORDS[c].plural.ar} onRemove={() => toggle("category", categories, c)} />
              ))}
              {brands.map((b) => (
                <Chip key={b} label={b} ltr onRemove={() => toggle("brand", brands, b)} />
              ))}
              {filtersOn && (
                <button
                  type="button"
                  onClick={() => setParams({ q: null, brand: null, category: null, printer: null })}
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-extrabold text-brand-red hover:text-brand-black"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  إعادة ضبط
                </button>
              )}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="bg-white px-6 py-14 text-center">
              <div dir="ltr" aria-hidden="true" className="mx-auto mb-6 flex w-fit gap-1.5">
                <span className="h-4 w-4 bg-cmyk-c" />
                <span className="h-4 w-4 bg-cmyk-m" />
                <span className="h-4 w-4 bg-brand-mist" />
                <span className="h-4 w-4 bg-brand-black" />
              </div>
              <p className="text-xl font-extrabold text-brand-black">لا توجد نتائج مطابقة</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-brand-gray">
                جرّب كلمة أقصر أو ألغِ أحد عوامل التصفية. وإن لم تجد طابعتك، أرسل لنا صورة ملصقها وسنحدد لك المستلزم
                المناسب.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setParams({ q: null, brand: null, category: null, printer: null })}
                  className="ri-btn ri-btn-black h-11 px-5 text-sm"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>عرض كل الدليل</span>
                </button>
                <Link href="/contact" className="ri-btn ri-btn-red h-11 px-5 text-sm">
                  <span>تواصل معنا</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 border-s border-t border-brand-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.slice(0, shown).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onQuickView={setQuick}
                    highlight={highlight}
                    supplyCount={supplyCount(p)}
                    className="border-b border-e border-brand-line ring-0"
                  />
                ))}
              </div>
              {results.length > shown && (
                <div className="mt-8 text-center">
                  <button type="button" onClick={() => setShown((n) => n + PAGE)} className="ri-btn ri-btn-black">
                    <span>عرض المزيد</span>
                    <span dir="ltr" className="text-white/60">
                      ({results.length - shown})
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ─── 5. HELP ─── */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ContactSplitCard
            eyebrow="لم تجد طابعتك؟"
            title="أرسل لنا صورة ملصق الطابعة"
            text="لا يكفي اسم الشركة المصنعة أو التشابه الخارجي وحده. أرسل لنا صورة لملصق الطابعة ومرجع المستهلك، وسنحدد لك المستلزم المتوافق قبل الشراء."
            cta={{ href: "/contact", label: "تواصل معنا" }}
          />
        </div>
      </section>

      <ProductQuickView
        product={quick}
        onClose={closeQuick}
        onPickPrinter={(slug) => setParams({ printer: slug, q: null }, true)}
      />
    </div>
  );
}

function Chip({ label, onRemove, ltr }: { label: string; onRemove: () => void; ltr?: boolean }) {
  return (
    <span className="inline-flex items-center bg-white text-xs font-bold text-brand-black ring-1 ring-inset ring-brand-line">
      <span dir={ltr ? "ltr" : "auto"} className="px-2.5 py-1.5">
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`إزالة ${label}`}
        className="flex h-full items-center border-s border-brand-line px-2 py-1.5 text-brand-gray transition-colors hover:bg-brand-black hover:text-white"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

/* A printer's colour test sheet in the hero: registration mark, the four
   process inks in solid and tints, and a line of sample text */
function TestPrintCard() {
  const inks = [
    { c: "bg-cmyk-c", l: "C" },
    { c: "bg-cmyk-m", l: "M" },
    { c: "bg-cmyk-y", l: "Y" },
    { c: "bg-brand-black", l: "K" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      aria-hidden="true"
      className="ri-crop ri-crop-light hidden lg:block"
    >
      <div className="relative bg-white p-6 text-brand-black">
        <div className="flex items-center justify-between">
          <span dir="ltr" className="text-[11px] font-extrabold tracking-[0.2em]">
            ROYAL<span className="text-brand-red">iNK</span> · TEST
          </span>
          {/* Registration mark */}
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v20M2 12h20" />
          </svg>
        </div>
        <div dir="ltr" className="mt-5 grid grid-cols-4 gap-1.5">
          {inks.map((ink, i) => (
            <div key={ink.l} className="space-y-1.5">
              {[1, 0.6, 0.3].map((o) => (
                <div key={o} className="relative h-9 bg-brand-mist">
                  <span
                    className={cn("ri-print-once absolute inset-0", ink.c)}
                    style={{ opacity: o, animationDelay: `${0.3 + i * 0.12 + (1 - o) * 0.5}s` }}
                  />
                </div>
              ))}
              <span className="block text-center text-[10px] font-extrabold text-brand-gray">{ink.l}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5" dir="ltr">
          <div className="h-1.5 w-full bg-brand-black/80" />
          <div className="h-1.5 w-4/5 bg-brand-black/50" />
          <div className="h-1.5 w-3/5 bg-brand-black/25" />
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-brand-line pt-3">
          <span className="text-xs font-bold text-brand-gray">جودة الطباعة</span>
          <span dir="ltr" className="flex gap-0.5">
            <span className="h-3 w-6 bg-brand-black" />
            <span className="h-3 w-3 bg-brand-red" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default CompatExplorer;
