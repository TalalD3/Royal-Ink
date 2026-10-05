import type { LocalizedText, Product, ProductSpecs } from "@/types/product";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT ⇄ DATABASE ROW
   Columns slug / specs / notes_i18n come from supabase_products_v2.sql;
   until that script is run they are simply absent and ignored.
   ══════════════════════════════════════════════════════════════════════ */

function parseJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return v as T;
}

export function rowToProduct(d: any): Product {
  return {
    id: d.id,
    name: d.name,
    brand: d.brand,
    category: d.category,
    sku: d.sku || undefined,
    color: d.color || "black",
    imageUrl: d.image_url || undefined,
    compatiblePrinters: Array.isArray(d.compatible_printers)
      ? d.compatible_printers
      : parseJson<string[]>(d.compatible_printers, []),
    notes: d.notes || undefined,
    isActive: d.is_active ?? true,
    createdAt: d.created_at,
    slug: d.slug || undefined,
    specs: parseJson<ProductSpecs>(d.specs, {}),
    notesI18n: parseJson<LocalizedText>(d.notes_i18n, {}),
  };
}

/** Columns that existed before the v2 script */
export function legacyRow(p: Partial<Product>) {
  return {
    name: p.name,
    brand: p.brand || "HP",
    category: p.category || "toner",
    sku: p.sku || null,
    color: p.color || "black",
    image_url: p.imageUrl || null,
    compatible_printers: p.compatiblePrinters || [],
    // The Arabic note also fills the legacy column, so older code keeps working
    notes: p.notesI18n?.ar?.trim() || p.notes || null,
    is_active: p.isActive ?? true,
  };
}

/** Columns added by supabase_products_v2.sql */
export function v2Columns(p: Partial<Product>) {
  return {
    slug: p.slug?.trim() || null,
    specs: cleanSpecs(p.specs),
    notes_i18n: cleanText(p.notesI18n),
  };
}

function cleanSpecs(specs?: ProductSpecs): ProductSpecs {
  const out: ProductSpecs = {};
  Object.entries(specs ?? {}).forEach(([k, v]) => {
    const t = (v ?? "").toString().trim();
    if (t) out[k as keyof ProductSpecs] = t;
  });
  return out;
}

function cleanText(t?: LocalizedText): LocalizedText {
  const out: LocalizedText = {};
  Object.entries(t ?? {}).forEach(([k, v]) => {
    const s = (v ?? "").toString().trim();
    if (s) out[k as keyof LocalizedText] = s;
  });
  return out;
}

/** PostgREST error caused by a column that does not exist yet */
export function isMissingColumnError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    /column .* (does not exist|of 'products')|could not find the '.*' column/i.test(error.message || "")
  );
}

export const MIGRATION_WARNING =
  "تم حفظ البيانات الأساسية، لكن المواصفات والملاحظات بثلاث لغات لم تُحفظ: شغّل ملف supabase_products_v2.sql في Supabase لتفعيلها.";
