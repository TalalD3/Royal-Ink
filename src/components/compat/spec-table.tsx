import type { Locale, Product } from "@/types/product";
import {
  CATEGORY_SPECS,
  CATEGORY_WORDS,
  COLOR_NAMES,
  FIXED_LABELS,
  SPEC_FIELDS,
  formatSpec,
} from "@/i18n/specs";
import { effectiveSpecs } from "@/lib/product-utils";
import { ColorSwatches } from "@/components/compat/color-swatches";

/* ══════════════════════════════════════════════════════════════════════
   SPEC TABLE — "Caractéristiques détaillées"
   Fixed rows from the product's own columns, then the category's specs.
   Labels come from the dictionary; values are printed as stored.
   ══════════════════════════════════════════════════════════════════════ */

export interface SpecRow {
  label: string;
  value: React.ReactNode;
  /** Codes and model names read left to right */
  ltr?: boolean;
}

export function specRows(p: Product, locale: Locale): SpecRow[] {
  const rows: SpecRow[] = [
    { label: FIXED_LABELS.category[locale], value: CATEGORY_WORDS[p.category].singular[locale] },
    {
      label: (p.category === "printer" ? FIXED_LABELS.brand : FIXED_LABELS.printerBrand)[locale],
      value: p.brand,
      ltr: true,
    },
  ];
  if (p.sku) rows.push({ label: FIXED_LABELS.code[locale], value: p.sku, ltr: true });
  if (p.color && p.color !== "none" && p.category !== "printer") {
    rows.push({
      label: FIXED_LABELS.color[locale],
      value: (
        <span className="inline-flex items-center gap-2">
          <ColorSwatches color={p.color} locale={locale} />
          {COLOR_NAMES[p.color][locale]}
        </span>
      ),
    });
  }
  const specs = effectiveSpecs(p);
  CATEGORY_SPECS[p.category].forEach((k) => {
    const v = formatSpec(k, specs[k], locale);
    if (!v) return;
    const kind = SPEC_FIELDS[k].kind.type;
    rows.push({ label: SPEC_FIELDS[k].label[locale], value: v, ltr: kind === "text" && /^[\x00-\x7F]+$/.test(v) });
  });
  return rows;
}

export function SpecTable({ product, locale }: { product: Product; locale: Locale }) {
  const rows = specRows(product, locale);
  return (
    <dl className="border-t border-brand-line">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-brand-line px-4 py-3.5 sm:px-5 ${
            i % 2 === 0 ? "bg-brand-mist" : "bg-white"
          }`}
        >
          <dt className="text-sm text-brand-gray">{r.label}</dt>
          <dd
            dir={r.ltr ? "ltr" : undefined}
            className={`text-sm font-extrabold text-brand-black ${r.ltr ? "text-right" : ""}`}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default SpecTable;
