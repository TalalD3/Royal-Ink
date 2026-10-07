import type {
  PrinterBrand,
  Product,
  ProductCategory,
  ProductSpecs,
  SpecKey,
} from "@/types/product";
import { SUPPORTED_BRANDS } from "@/types/product";
import { CATEGORY_SPECS } from "@/i18n/specs";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT HELPERS — safe on server and client
   ══════════════════════════════════════════════════════════════════════ */

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** For matching: lower case, Arabic digits → Latin, no spaces / - . / _ */
export function normalize(s: string): string {
  return (s || "")
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .toLowerCase()
    .replace(/[\s\-./_()]+/g, "");
}

/** URL-safe segment from Latin text */
export function slugify(s: string): string {
  return (s || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Arabic words in front of the model ("طابعة ليزر HP LaserJet…") removed */
export function stripArabicPrefix(name: string): string {
  const i = name.search(/[A-Za-z0-9]/);
  return i > 0 ? name.slice(i).trim() : name.trim();
}

/** The model a printer product describes */
export function printerModelOf(p: Product): string {
  return p.compatiblePrinters?.[0] || stripArabicPrefix(p.name);
}

/** Every name a printer product answers to: its model first, then the
    other names it lists (e.g. LBP6030 / LBP6030B) */
export function printerNamesOf(p: Pick<Product, "name" | "compatiblePrinters">): string[] {
  const model = p.compatiblePrinters?.[0] || stripArabicPrefix(p.name);
  return Array.from(new Set([model, ...(p.compatiblePrinters ?? []).slice(1)].map((m) => m.trim()).filter(Boolean)));
}

/** True when a consumable lists one of these printer names */
export function fitsPrinter(p: Pick<Product, "compatiblePrinters">, printerNames: string[]): boolean {
  const keys = new Set(printerNames.map(normalize));
  return (p.compatiblePrinters ?? []).some((m) => keys.has(normalize(m)));
}

/** Brand named at the start of a printer model, if any */
export function brandOfModel(model: string): PrinterBrand | undefined {
  const m = model.toLowerCase();
  return SUPPORTED_BRANDS.find((b) => m.startsWith(b.toLowerCase()));
}

export function printerSlug(model: string): string {
  return slugify(model);
}

/** Base slug for a product: its stored slug, or brand + code (or name) */
function baseSlug(p: Product): string {
  if (p.slug) return slugify(p.slug);
  const tail = p.sku || stripArabicPrefix(p.name);
  const s = slugify(`${p.brand}-${tail}`);
  // Purely Arabic names with no code: fall back to the id
  return s && s !== slugify(p.brand) ? s : slugify(`${p.brand}-${p.id}`);
}

/** Gives every product a unique slug (derived ones get -2, -3… on clashes) */
export function withSlugs(products: Product[]): Product[] {
  const used = new Map<string, number>();
  return products.map((p) => {
    const base = baseSlug(p);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return { ...p, slug: n === 0 ? base : `${base}-${n + 1}` };
  });
}

/* ── Specs read from the legacy Arabic note ("إنتاجية 1600 صفحة") when a
   product has no structured value yet. Only fills keys its category uses. ── */

function firstNumber(re: RegExp, text: string): string | undefined {
  const m = text.match(re);
  if (!m) return undefined;
  return m[1].replace(/[,،\s]/g, "");
}

export function inferSpecsFromNotes(category: ProductCategory, notes?: string): ProductSpecs {
  if (!notes) return {};
  const t = notes.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
  const found: ProductSpecs = {
    speedPpm: firstNumber(/(\d+)\s*صفحة\s*\/\s*دقيقة/, t),
    yieldPages: firstNumber(/(\d[\d,\s]*\d|\d)\s*صفح(?:ة|ات)(?!\s*\/)/, t),
    capacityMl: firstNumber(/(\d+)\s*مل\b/, t),
    coverage: firstNumber(/تغطية\s*(\d+)\s*%/, t),
  };
  if (category === "printer") delete found.yieldPages;
  const allowed = new Set<SpecKey>(CATEGORY_SPECS[category]);
  const out: ProductSpecs = {};
  (Object.keys(found) as SpecKey[]).forEach((k) => {
    if (found[k] && allowed.has(k)) out[k] = found[k];
  });
  return out;
}

/** Stored specs, completed by what the legacy note says */
export function effectiveSpecs(p: Product): ProductSpecs {
  const stored = p.specs ?? {};
  const inferred = inferSpecsFromNotes(p.category, p.notes);
  const out: ProductSpecs = { ...inferred };
  (Object.keys(stored) as SpecKey[]).forEach((k) => {
    if (stored[k]?.toString().trim()) out[k] = stored[k];
  });
  return out;
}

/* ── Printer index: every printer model that at least one product names ── */

export interface PrinterEntry {
  model: string;
  slug: string;
  brand?: PrinterBrand;
  /** The printer itself, when it is in the catalogue */
  printerProduct?: Product;
  /** Consumables and parts that fit it */
  supplies: Product[];
}

export function buildPrinterIndex(products: Product[]): Map<string, PrinterEntry> {
  const index = new Map<string, PrinterEntry>();
  const entry = (model: string, brand?: PrinterBrand) => {
    const key = normalize(model);
    let e = index.get(key);
    if (!e) {
      e = { model, slug: printerSlug(model), brand: brandOfModel(model) ?? brand, supplies: [] };
      index.set(key, e);
    }
    return e;
  };
  products.forEach((p) => {
    if (p.category === "printer") {
      const e = entry(printerModelOf(p), p.brand);
      e.printerProduct = e.printerProduct ?? p;
      // Other names the printer product lists (e.g. LBP6030 / LBP6030B)
      p.compatiblePrinters.slice(1).forEach((m) => {
        const alias = entry(m, p.brand);
        alias.printerProduct = alias.printerProduct ?? p;
      });
    } else {
      p.compatiblePrinters.forEach((m) => {
        const e = entry(m, p.brand);
        if (!e.supplies.includes(p)) e.supplies.push(p);
      });
    }
  });
  return index;
}

/** Products that fit a printer model (exact model, normalised) */
export function suppliesFor(model: string, products: Product[]): Product[] {
  const key = normalize(model);
  return products.filter(
    (p) => p.category !== "printer" && p.compatiblePrinters.some((m) => normalize(m) === key)
  );
}

/** Short form of a model for tight spaces: "HP LaserJet Pro P1102" → "P1102" */
export function shortModel(model: string): string {
  const parts = model.trim().split(/\s+/);
  return parts[parts.length - 1] || model;
}
