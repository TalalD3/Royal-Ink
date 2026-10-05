import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types/product";
import { initialProducts } from "@/data/initial-products";
import { rowToProduct } from "@/lib/product-db";
import { buildPrinterIndex, normalize, withSlugs, type PrinterEntry } from "@/lib/product-utils";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCTS — server-side loading for the API and the product / printer
   pages. Reads the live Supabase catalogue (refreshed every minute) and
   falls back to the seed products when it is unavailable or empty.
   ══════════════════════════════════════════════════════════════════════ */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nopvgdaiozxjdzpuwoxk.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcHZnZGFpb3p4amR6cHV3b3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjU5NjgsImV4cCI6MjEwNTY0MTk2OH0.oWdngn9xzQPuitK6KOrqZpuaAAOhRUnZXQL5qWgWGb4";

/** Public, read-only client whose requests are cached for 60 s */
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } }),
  },
});

export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const { data, error } = await db
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return withSlugs(data.map(rowToProduct));
  } catch {
    // fall through to the seed catalogue
  }
  return withSlugs(initialProducts.filter((p) => p.isActive));
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const s = decodeURIComponent(slug).toLowerCase();
  return (await getProducts()).find((p) => p.slug === s);
}

export async function getPrinterIndex(): Promise<Map<string, PrinterEntry>> {
  return buildPrinterIndex(await getProducts());
}

export async function getPrinterBySlug(slug: string): Promise<PrinterEntry | undefined> {
  const s = decodeURIComponent(slug).toLowerCase();
  const index = await getPrinterIndex();
  return Array.from(index.values()).find((e) => e.slug === s);
}

export { normalize };
