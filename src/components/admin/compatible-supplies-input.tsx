"use client";

import React, { useMemo, useState } from "react";
import type { PrinterBrand, Product } from "@/types/product";
import { CATEGORIES_CONFIG } from "@/types/product";
import { normalize } from "@/lib/product-utils";
import { CategoryIcon } from "@/components/ui/category-icons";
import { ColorSwatches } from "@/components/compat/color-swatches";
import { inputCls } from "@/components/admin/admin-ui";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   COMPATIBLE CONSUMABLES (printer form)
   Lists the catalogue's inks, toners, drums and parts so the admin ticks
   the ones that fit this printer. Saving stores the printer's model on
   each ticked product (see setPrinterSupplies), so the printer page, the
   product pages and the search all show the same links.
   ══════════════════════════════════════════════════════════════════════ */

const searchText = (p: Product) =>
  normalize([p.name, p.sku, p.brand, p.specs?.oemRef].filter(Boolean).join(" "));

export function CompatibleSuppliesInput({
  products,
  selectedIds,
  onChange,
  brand,
  modelName,
}: {
  /** The whole catalogue (printers are left out here) */
  products: Product[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** The printer's brand — its consumables are listed first */
  brand: PrinterBrand;
  /** The model the links are saved under */
  modelName: string;
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const supplies = useMemo(() => products.filter((p) => p.category !== "printer"), [products]);

  const list = useMemo(() => {
    const words = query.trim().split(/\s+/).map(normalize).filter(Boolean);
    const rank = (p: Product) => (selected.has(p.id) ? 0 : p.brand === brand ? 1 : 2);
    return supplies
      .filter((p) => words.every((w) => searchText(p).includes(w)))
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "ar"));
  }, [supplies, query, selected, brand]);

  const toggle = (id: string) =>
    onChange(selected.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const chosen = supplies.filter((p) => selected.has(p.id));

  if (supplies.length === 0) {
    return (
      <p className="border border-dashed border-brand-line bg-brand-mist px-4 py-5 text-center text-sm leading-6 text-brand-gray">
        لا توجد مستلزمات في الكتالوج بعد. أضف الأحبار والتونر أولاً، ثم اربطها بهذه الطابعة من هنا.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Which name the links are saved under */}
      <p className="text-xs leading-5 text-brand-gray">
        {modelName ? (
          <>
            تُربط المستلزمات المختارة بالطراز{" "}
            <span dir="ltr" className="font-extrabold text-brand-black">
              {modelName}
            </span>
            ، وتظهر في صفحة الطابعة وصفحة كل منتج.
          </>
        ) : (
          "اكتب اسم الطابعة أولاً (أو طرازها في القسم السابق) لتُربط به المستلزمات."
        )}
      </p>

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو الكود (مثال: 85A)…"
          aria-label="بحث في المستلزمات"
          className={cn(inputCls, "ps-10 pe-9")}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="مسح"
            className="absolute end-1 top-1/2 flex h-9 w-8 -translate-y-1/2 items-center justify-center text-brand-gray hover:text-brand-black"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* The catalogue's consumables — tick the ones that fit */}
      <div className="max-h-72 overflow-y-auto border border-brand-line" role="group" aria-label="المستلزمات">
        {list.length === 0 ? (
          <p className="px-4 py-5 text-center text-sm text-brand-gray">لا يوجد منتج بهذا الاسم أو الكود.</p>
        ) : (
          list.map((p) => {
            const on = selected.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-brand-line px-3 py-2.5 text-start transition-colors last:border-b-0",
                  on ? "bg-brand-mist" : "bg-white hover:bg-brand-mist/60"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                    on ? "border-brand-red bg-brand-red text-white" : "border-brand-gray/50 bg-white"
                  )}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-brand-line bg-white">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <CategoryIcon category={p.category} className="h-6 w-6 text-brand-black/30" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-brand-black">{p.name}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-brand-gray">
                    <span className="truncate">{CATEGORIES_CONFIG[p.category]?.labelAr}</span>
                    {p.sku && (
                      <span dir="ltr" className="shrink-0 font-bold">
                        {p.sku}
                      </span>
                    )}
                    <ColorSwatches color={p.color} />
                  </span>
                </span>
                {p.brand !== brand && (
                  <span dir="ltr" className="shrink-0 bg-brand-mist px-1.5 py-1 text-[10px] font-extrabold text-brand-gray">
                    {p.brand}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Chosen */}
      <div className="border border-brand-line">
        <div className="flex items-center justify-between gap-3 border-b border-brand-line bg-brand-mist px-4 py-2.5">
          <span className="text-[13px] font-extrabold text-brand-black">
            المختارة{" "}
            <span className="ms-1 bg-brand-black px-1.5 py-0.5 text-[11px] tabular-nums text-white">{chosen.length}</span>
          </span>
          {chosen.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="text-xs font-bold text-brand-red hover:underline">
              إزالة الكل
            </button>
          )}
        </div>
        <div className="p-3">
          {chosen.length === 0 ? (
            <p className="py-1 text-center text-xs leading-5 text-brand-gray">لم تختر مستلزمات بعد.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chosen.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex max-w-full items-center gap-2 bg-brand-black py-1 pe-1 ps-2.5 text-xs font-bold text-white"
                >
                  <span className="truncate">{p.sku || p.name}</span>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-label={`إزالة ${p.name}`}
                    title={`إزالة ${p.name}`}
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-white/70 transition-colors hover:bg-brand-red hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
