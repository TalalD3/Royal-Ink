import type { Product } from "@/types/product";
import { CATEGORY_ORDER } from "@/types/product";
import {
  buildPrinterIndex,
  effectiveSpecs,
  normalize,
  shortModel,
  type PrinterEntry,
} from "@/lib/product-utils";

/* ══════════════════════════════════════════════════════════════════════
   COMPATIBILITY SEARCH — runs in the browser over the whole catalogue
   Every word typed must match. Codes are compared without spaces or
   dashes ("tn2305" finds TN-2305), and a printer's model number finds
   every supply that fits it.
   ══════════════════════════════════════════════════════════════════════ */

export interface SearchIndex {
  products: Product[];
  printers: PrinterEntry[];
  /** Normalised fields per product id */
  fields: Map<string, { codes: string[]; name: string; brand: string; printers: string[] }>;
}

export function buildSearchIndex(products: Product[]): SearchIndex {
  const fields = new Map<string, { codes: string[]; name: string; brand: string; printers: string[] }>();
  products.forEach((p) => {
    const specs = effectiveSpecs(p);
    fields.set(p.id, {
      codes: [p.sku, specs.oemRef, specs.compatibleSupply].filter(Boolean).map((c) => normalize(c!)),
      name: normalize(p.name),
      brand: normalize(p.brand),
      printers: p.compatiblePrinters.map(normalize),
    });
  });
  const printers = Array.from(buildPrinterIndex(products).values()).sort(
    (a, b) => b.supplies.length - a.supplies.length || a.model.localeCompare(b.model)
  );
  return { products, printers, fields };
}

export function queryTokens(q: string): string[] {
  return q
    .trim()
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean);
}

/** Lower score = better match; null = no match */
function productScore(index: SearchIndex, p: Product, tokens: string[]): number | null {
  const f = index.fields.get(p.id);
  if (!f) return null;
  let score = 0;
  for (const t of tokens) {
    if (f.codes.some((c) => c === t)) continue; // exact code: best
    if (f.codes.some((c) => c.startsWith(t))) {
      score = Math.max(score, 1);
      continue;
    }
    if (f.codes.some((c) => c.includes(t)) || f.name.includes(t)) {
      score = Math.max(score, 2);
      continue;
    }
    if (f.brand.includes(t)) {
      score = Math.max(score, 3);
      continue;
    }
    if (f.printers.some((m) => m.includes(t))) {
      score = Math.max(score, 3);
      continue;
    }
    return null;
  }
  return score;
}

export function searchProducts(index: SearchIndex, q: string): Product[] {
  const tokens = queryTokens(q);
  if (!tokens.length) return index.products;
  return index.products
    .map((p) => ({ p, s: productScore(index, p, tokens) }))
    .filter((x): x is { p: Product; s: number } => x.s !== null)
    .sort((a, b) => a.s - b.s || categoryRank(a.p) - categoryRank(b.p))
    .map((x) => x.p);
}

export function searchPrinters(index: SearchIndex, q: string): PrinterEntry[] {
  const tokens = queryTokens(q);
  if (!tokens.length) return [];
  return index.printers
    .map((e) => {
      const m = normalize(e.model);
      if (!tokens.every((t) => m.includes(t))) return null;
      const short = normalize(shortModel(e.model));
      const score = tokens.some((t) => short === t) ? 0 : tokens.some((t) => short.startsWith(t)) ? 1 : 2;
      return { e, score };
    })
    .filter((x): x is { e: PrinterEntry; score: number } => !!x)
    .sort((a, b) => a.score - b.score || b.e.supplies.length - a.e.supplies.length)
    .map((x) => x.e);
}

export function categoryRank(p: Product) {
  return CATEGORY_ORDER.indexOf(p.category);
}

/** Default catalogue order: by category (as on the home tiles), then brand, then name */
export function sortCatalogue(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) =>
      categoryRank(a) - categoryRank(b) ||
      a.brand.localeCompare(b.brand) ||
      (a.sku || a.name).localeCompare(b.sku || b.name)
  );
}

/** Parts of `text` that match the query, for highlighting */
export function highlightParts(text: string, q: string): { s: string; hit: boolean }[] {
  const words = q.trim().split(/\s+/).filter((w) => w.length > 0);
  if (!words.length) return [{ s: text, hit: false }];
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  return text
    .split(re)
    .filter((s) => s !== "")
    .map((s) => ({ s, hit: words.some((w) => w.toLowerCase() === s.toLowerCase()) }));
}
