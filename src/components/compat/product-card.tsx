"use client";

import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import type { Product } from "@/types/product";
import { CATEGORY_WORDS, arCount } from "@/i18n/specs";
import { normalize, shortModel } from "@/lib/product-utils";
import { ColorSwatches } from "@/components/compat/color-swatches";
import { ProductVisual } from "@/components/compat/product-visual";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT CARD
   The whole card opens the product page. The eye button (when a handler
   is given) opens the quick look instead. Printers matching the current
   search are listed first and marked red.
   ══════════════════════════════════════════════════════════════════════ */

export function productHref(p: Product) {
  return `/compatibility/${p.slug}`;
}

export function ProductCard({
  product,
  onQuickView,
  highlight,
  supplyCount,
  className,
}: {
  product: Product;
  onQuickView?: (p: Product) => void;
  /** Normalised search text — matching printers are shown first, in red */
  highlight?: string;
  /** For printers: how many supplies fit it */
  supplyCount?: number;
  className?: string;
}) {
  const isPrinter = product.category === "printer";
  const printers = product.compatiblePrinters.filter(Boolean);
  const matches = (m: string) => !!highlight && normalize(m).includes(highlight);
  const ordered = highlight ? [...printers].sort((a, b) => Number(matches(b)) - Number(matches(a))) : printers;
  const shown = ordered.slice(0, 2);
  const rest = printers.length - shown.length;

  return (
    <article
      className={cn(
        // Phones: a row (small tile beside the details); from sm: a column
        "group relative grid grid-cols-[6.5rem_minmax(0,1fr)] bg-white ring-1 ring-brand-line transition-shadow duration-300 hover:z-[1] hover:ring-brand-black sm:flex sm:flex-col",
        className
      )}
    >
      {/* Red top bar on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[2] h-1 origin-right scale-x-0 bg-brand-red transition-transform duration-300 ease-out group-hover:scale-x-100"
      />

      <div className="relative">
        <ProductVisual
          product={product}
          className={cn(
            "h-full min-h-[7.5rem] sm:h-auto sm:min-h-0",
            product.imageUrl ? "sm:aspect-[4/3]" : "sm:aspect-[16/9]"
          )}
          iconClassName="h-[42%] w-[42%] sm:h-[40%] sm:w-[40%]"
        />
        <span className="absolute start-3 top-3 hidden bg-white px-2 py-1 text-[11px] font-extrabold text-brand-black sm:block">
          {CATEGORY_WORDS[product.category].plural.ar}
        </span>
        <ColorSwatches color={isPrinter ? undefined : product.color} className="absolute end-2 top-2.5 sm:end-3 sm:top-3.5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
        <span className="mb-1 text-[11px] font-bold text-brand-gray sm:hidden">
          {CATEGORY_WORDS[product.category].plural.ar}
        </span>
        <div className="flex items-center justify-between gap-3">
          {product.sku && (
            <span dir="ltr" className="truncate text-xs font-extrabold tracking-wide text-brand-red">
              {product.sku}
            </span>
          )}
          <span dir="ltr" className="shrink-0 text-[11px] font-bold text-brand-gray">
            {product.brand}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-[14px] font-extrabold leading-6 text-brand-black sm:mt-2 sm:text-[15px] sm:leading-7">
          {/* Stretched link: the whole card opens the product page */}
          <Link
            href={productHref(product)}
            className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-brand-red"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs leading-6 text-brand-gray sm:mt-2">
          {isPrinter ? (
            supplyCount ? (
              <>
                <span className="font-extrabold text-brand-black">{supplyCount}</span>{" "}
                {arCount(supplyCount, "مستلزم متوافق معها", "مستلزمان متوافقان معها", "مستلزمات متوافقة معها", "مستلزماً متوافقاً معها")}
              </>
            ) : (
              "طابعة من علامة عالمية"
            )
          ) : printers.length > 0 ? (
            <>
              متوافق مع{" "}
              {shown.map((m, i) => (
                <span key={m}>
                  {i > 0 && "، "}
                  <span dir="ltr" className={matches(m) ? "font-extrabold text-brand-red" : "font-bold text-brand-black"}>
                    {shortModel(m)}
                  </span>
                </span>
              ))}
              {rest > 0 && <span className="text-brand-gray"> +{rest}</span>}
            </>
          ) : null}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-brand-line pt-2.5 sm:pt-3.5">
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-black transition-colors group-hover:text-brand-red">
            صفحة المنتج
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
          </span>
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`معاينة سريعة: ${product.name}`}
              title="معاينة سريعة"
              className="relative z-[2] flex h-8 w-8 items-center justify-center bg-brand-mist sm:h-9 sm:w-9 text-brand-black transition-colors hover:bg-brand-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
