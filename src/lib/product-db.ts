import type {
  LocalizedText,
  Product,
  ProductCategory,
  ProductColor,
  ProductSpecs,
  SpecKey,
} from "@/types/product";
import { CATEGORY_ORDER, LOCALES, SUPPORTED_BRANDS } from "@/types/product";
import { CATEGORY_SPECS } from "@/i18n/specs";
import type { ProductDoc } from "@/lib/db/collections";
import { uploadKeyFromUrl } from "@/lib/uploadthing-server";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT INPUT → DATABASE FIELDS
   Only known fields are kept, with their values cleaned, so the admin
   API never writes arbitrary data into the database.
   ══════════════════════════════════════════════════════════════════════ */

const COLORS: ProductColor[] = ["black", "cyan", "magenta", "yellow", "multi", "none"];
const MAX_TEXT = 300;
const MAX_NOTE = 4000;
const MAX_PRINTERS = 500;

const text = (v: unknown, max = MAX_TEXT) =>
  typeof v === "string" ? v.trim().slice(0, max) : typeof v === "number" ? String(v) : "";

export function isCategory(v: unknown): v is ProductCategory {
  return typeof v === "string" && (CATEGORY_ORDER as string[]).includes(v);
}

/** Specs: only the keys the category uses, as trimmed strings */
export function cleanSpecs(specs: unknown, category: ProductCategory): ProductSpecs {
  const out: ProductSpecs = {};
  if (!specs || typeof specs !== "object") return out;
  const allowed = new Set<SpecKey>(CATEGORY_SPECS[category]);
  Object.entries(specs as Record<string, unknown>).forEach(([k, v]) => {
    const t = text(v);
    if (t && allowed.has(k as SpecKey)) out[k as SpecKey] = t;
  });
  return out;
}

/** Notes: ar / fr / en only */
export function cleanNotes(notes: unknown): LocalizedText {
  const out: LocalizedText = {};
  if (!notes || typeof notes !== "object") return out;
  LOCALES.forEach((l) => {
    const t = text((notes as Record<string, unknown>)[l], MAX_NOTE);
    if (t) out[l] = t;
  });
  return out;
}

/** Fields of a product sent by the admin → database fields (no id, no dates) */
export function productInputToFields(
  input: Partial<Product>,
  current?: Pick<ProductDoc, "category">
): Partial<Omit<ProductDoc, "_id" | "createdAt" | "updatedAt" | "slug">> {
  const out: Partial<Omit<ProductDoc, "_id" | "createdAt" | "updatedAt" | "slug">> = {};
  const category = isCategory(input.category) ? input.category : current?.category ?? "toner";

  if (input.name !== undefined) out.name = text(input.name);
  if (input.brand !== undefined) {
    out.brand = (SUPPORTED_BRANDS as readonly string[]).includes(input.brand) ? input.brand : "HP";
  }
  if (input.category !== undefined) out.category = category;
  if (input.sku !== undefined) out.sku = text(input.sku, 80) || undefined;
  if (input.color !== undefined) out.color = COLORS.includes(input.color as ProductColor) ? input.color : "black";
  if (input.imageUrl !== undefined) {
    const url = text(input.imageUrl, 1000);
    // Only real addresses (never a temporary blob: preview). The UploadThing
    // key is read from the address itself, so it always matches the file.
    out.image = url && /^(https:\/\/|\/)/.test(url) ? { url, key: uploadKeyFromUrl(url) } : null;
  }
  if (input.compatiblePrinters !== undefined) {
    out.compatiblePrinters = Array.isArray(input.compatiblePrinters)
      ? Array.from(new Set(input.compatiblePrinters.map((m) => text(m, 120)).filter(Boolean))).slice(0, MAX_PRINTERS)
      : [];
  }
  if (input.specs !== undefined) out.specs = cleanSpecs(input.specs, category);
  // The admin sends notesI18n; a lone legacy `notes` string counts as Arabic
  if (input.notesI18n !== undefined) out.notes = cleanNotes(input.notesI18n);
  else if (input.notes !== undefined) out.notes = cleanNotes({ ar: input.notes });
  if (input.isActive !== undefined) out.isActive = !!input.isActive;
  return out;
}
