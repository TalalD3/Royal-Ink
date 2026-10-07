import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import type { AnyBulkWriteOperation, Collection } from "mongodb";
import type { Product } from "@/types/product";
import { initialProducts } from "@/data/initial-products";
import { productsCol, productFromDoc, toObjectId, type ProductDoc } from "@/lib/db/collections";
import { productInputToFields } from "@/lib/product-db";
import {
  buildPrinterIndex,
  normalize,
  printerNamesOf,
  slugify,
  stripArabicPrefix,
  withSlugs,
  type PrinterEntry,
} from "@/lib/product-utils";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCTS — server-side reads and admin writes (MongoDB)

   Public pages read the active catalogue through a cache refreshed every
   60 seconds; any admin change refreshes it immediately (tag "products").
   While the database is empty or unreachable, the built-in example
   products are shown, as before.
   ══════════════════════════════════════════════════════════════════════ */

export const PRODUCTS_TAG = "products";

async function loadActiveProducts(): Promise<Product[]> {
  try {
    const col = await productsCol();
    const docs = await col.find({ isActive: true }).sort({ createdAt: -1 }).toArray();
    if (docs.length > 0) return withSlugs(docs.map(productFromDoc));
  } catch (err) {
    console.error("[products] database unavailable — showing the built-in examples:", (err as Error).message);
  }
  return withSlugs(initialProducts.filter((p) => p.isActive));
}

export const getProducts = cache(
  unstable_cache(loadActiveProducts, ["products:active"], { revalidate: 60, tags: [PRODUCTS_TAG] })
);

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

/* ── Admin ── */

function refresh() {
  revalidateTag(PRODUCTS_TAG);
}

/** A free page address: base, base-2, base-3… (ignoring the product itself) */
async function uniqueSlug(col: Collection<ProductDoc>, base: string, exceptId?: string): Promise<string> {
  const root = base || "product";
  const taken = new Set(
    (
      await col
        .find(
          { slug: { $regex: `^${root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-\\d+)?$` } },
          { projection: { slug: 1 } }
        )
        .toArray()
    )
      .filter((d) => d._id.toHexString() !== exceptId)
      .map((d) => d.slug)
  );
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) if (!taken.has(`${root}-${n}`)) return `${root}-${n}`;
}

function baseSlug(input: Partial<Product>): string {
  if (input.slug?.trim()) return slugify(input.slug);
  const tail = input.sku || stripArabicPrefix(input.name ?? "");
  return slugify(`${input.brand ?? ""}-${tail}`);
}

/** Every product, active or not, newest first (admin list) */
export async function listAllProducts(): Promise<Product[]> {
  const col = await productsCol();
  return (await col.find({}).sort({ createdAt: -1 }).toArray()).map(productFromDoc);
}

export async function createProducts(inputs: Partial<Product>[]): Promise<Product[]> {
  const col = await productsCol();
  const created: Product[] = [];
  for (const input of inputs) {
    const fields = productInputToFields(input);
    if (!fields.name) throw new Error("Product name is required");
    const now = new Date();
    const doc: ProductDoc = {
      name: fields.name,
      brand: fields.brand ?? "HP",
      category: fields.category ?? "toner",
      sku: fields.sku,
      color: fields.color ?? "black",
      image: fields.image ?? null,
      compatiblePrinters: fields.compatiblePrinters ?? [],
      specs: fields.specs ?? {},
      notes: fields.notes ?? {},
      isActive: fields.isActive ?? true,
      slug: await uniqueSlug(col, baseSlug(input)),
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await col.insertOne(doc);
    created.push(productFromDoc({ ...doc, _id: insertedId }));
  }
  refresh();
  return created;
}

/** Updates a product; when its image was replaced or removed, also returns
    the old image's key so that file can be deleted */
export async function updateProduct(
  id: string,
  input: Partial<Product>
): Promise<{ product: Product; replacedImageKey?: string } | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const col = await productsCol();
  const current = await col.findOne({ _id });
  if (!current) return null;

  const fields: Partial<ProductDoc> = { ...productInputToFields(input, current), updatedAt: new Date() };
  if (input.slug !== undefined) {
    const wanted = input.slug?.trim() ? slugify(input.slug) : baseSlug({ ...productFromDoc(current), ...input, slug: "" });
    fields.slug = await uniqueSlug(col, wanted, id);
  }
  const updated = await col.findOneAndUpdate({ _id }, { $set: fields }, { returnDocument: "after" });
  refresh();
  if (!updated) return null;
  const oldKey = current.image?.key || undefined;
  return {
    product: productFromDoc(updated),
    replacedImageKey: oldKey && oldKey !== updated.image?.key ? oldKey : undefined,
  };
}

/** Links a printer to exactly the chosen consumables. The link is stored on
    the consumables (their printer list) — the one place the printer page,
    the product pages and the search all read — so the printer's model is
    added to each chosen product, and its names removed from products that
    are no longer chosen. Returns how many products changed. */
export async function setPrinterSupplies(printer: Product, supplyIds: string[]): Promise<number> {
  const names = printerNamesOf(printer);
  if (names.length === 0) return 0;
  const keys = new Set(names.map(normalize));
  const chosen = new Set(supplyIds);
  const col = await productsCol();
  const docs = await col
    .find({ category: { $ne: "printer" } }, { projection: { compatiblePrinters: 1 } })
    .toArray();
  const now = new Date();
  const ops: AnyBulkWriteOperation<ProductDoc>[] = [];
  for (const d of docs) {
    const list = d.compatiblePrinters ?? [];
    const fits = list.some((m) => keys.has(normalize(m)));
    const wanted = chosen.has(d._id.toHexString());
    if (wanted && !fits) {
      ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: { compatiblePrinters: [...list, names[0]], updatedAt: now } } } });
    } else if (!wanted && fits) {
      ops.push({
        updateOne: {
          filter: { _id: d._id },
          update: { $set: { compatiblePrinters: list.filter((m) => !keys.has(normalize(m))), updatedAt: now } },
        },
      });
    }
  }
  if (ops.length) {
    await col.bulkWrite(ops);
    refresh();
  }
  return ops.length;
}

/** Deletes a product; returns its image key so the file can be removed too */
export async function deleteProduct(id: string): Promise<{ deleted: boolean; imageKey?: string }> {
  const _id = toObjectId(id);
  if (!_id) return { deleted: false };
  const col = await productsCol();
  const doc = await col.findOneAndDelete({ _id });
  refresh();
  return { deleted: !!doc, imageKey: doc?.image?.key };
}

/** Deletes the whole catalogue; returns the image keys of what was removed */
export async function deleteAllProducts(): Promise<{ count: number; imageKeys: string[] }> {
  const col = await productsCol();
  const keys = (await col.find({ "image.key": { $exists: true } }, { projection: { image: 1 } }).toArray())
    .map((d) => d.image?.key)
    .filter((k): k is string => !!k);
  const { deletedCount } = await col.deleteMany({});
  refresh();
  return { count: deletedCount, imageKeys: keys };
}
