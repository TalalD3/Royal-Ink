import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type {
  LocalizedText,
  PrinterBrand,
  Product,
  ProductCategory,
  ProductColor,
  ProductSpecs,
} from "@/types/product";
import type { DbDistributor } from "@/types/distributor";
import type { HeroSlide, SlideButton, SlideTextAlign } from "@/types/slide";

/* ══════════════════════════════════════════════════════════════════════
   COLLECTIONS — database name: royal_ink

   products      the catalogue (one document per product)
   distributors  points of sale shown on the map
   slides        home page hero slides
   admins        admin logins (passwords stored as bcrypt hashes)

   Documents use camelCase. Each has a MongoDB _id; the site receives it
   as the string `id`. `legacyId` keeps an old Supabase id when a record
   was imported (unused for a fresh start, but kept for future imports).
   Index definitions live in scripts/setup-db.mjs.
   ══════════════════════════════════════════════════════════════════════ */

/** An image stored on UploadThing: its public address and file key */
export interface StoredImage {
  url: string;
  /** UploadThing file key — needed to delete the file later */
  key?: string;
}

export interface ProductDoc {
  _id?: ObjectId;
  legacyId?: string;
  slug: string;
  name: string;
  brand: PrinterBrand;
  category: ProductCategory;
  sku?: string;
  color: ProductColor;
  image?: StoredImage | null;
  compatiblePrinters: string[];
  /** Structured specs — labels live in src/i18n/specs.ts */
  specs: ProductSpecs;
  /** Optional hand-written note per language (ar / fr / en) */
  notes: LocalizedText;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributorDoc {
  _id?: ObjectId;
  legacyId?: string;
  name: string;
  wilayaCode: number;
  badge: DbDistributor["badge"];
  phone?: string | null;
  address?: string | null;
  locationUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlideDoc {
  _id?: ObjectId;
  sortOrder: number;
  image: StoredImage;
  overlayOpacity: number;
  title: string;
  subtitle: string;
  textAlign: SlideTextAlign;
  buttons: SlideButton[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminDoc {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

/* ── Collection handles ── */

export async function productsCol(): Promise<Collection<ProductDoc>> {
  return (await getDb()).collection<ProductDoc>("products");
}
export async function distributorsCol(): Promise<Collection<DistributorDoc>> {
  return (await getDb()).collection<DistributorDoc>("distributors");
}
export async function slidesCol(): Promise<Collection<SlideDoc>> {
  return (await getDb()).collection<SlideDoc>("slides");
}
export async function adminsCol(): Promise<Collection<AdminDoc>> {
  return (await getDb()).collection<AdminDoc>("admins");
}

/** A string id from the site → ObjectId, or null if it isn't one */
export function toObjectId(id: string | null | undefined): ObjectId | null {
  return id && ObjectId.isValid(id) && String(new ObjectId(id)) === id ? new ObjectId(id) : null;
}

/* ── Documents → the shapes the site already uses ── */

export function productFromDoc(d: WithId<ProductDoc>): Product {
  return {
    id: d._id.toHexString(),
    slug: d.slug,
    name: d.name,
    brand: d.brand,
    category: d.category,
    sku: d.sku || undefined,
    color: d.color || "black",
    imageUrl: d.image?.url || undefined,
    imageKey: d.image?.key || undefined,
    compatiblePrinters: d.compatiblePrinters ?? [],
    specs: d.specs ?? {},
    notesI18n: d.notes ?? {},
    // The Arabic note doubles as the legacy single note
    notes: d.notes?.ar || undefined,
    isActive: d.isActive ?? true,
    createdAt: d.createdAt?.toISOString(),
  };
}

export function distributorFromDoc(d: WithId<DistributorDoc>): DbDistributor {
  return {
    id: d._id.toHexString(),
    created_at: d.createdAt?.toISOString(),
    name: d.name,
    wilaya_code: d.wilayaCode,
    badge: d.badge,
    phone: d.phone ?? null,
    address: d.address ?? null,
    location_url: d.locationUrl ?? null,
    is_active: d.isActive ?? true,
  };
}

export function slideFromDoc(d: WithId<SlideDoc>): HeroSlide {
  return {
    id: d._id.toHexString(),
    sort_order: d.sortOrder ?? 0,
    image_url: d.image?.url ?? "",
    image_key: d.image?.key,
    overlay_opacity: d.overlayOpacity ?? 50,
    title: d.title ?? "",
    subtitle: d.subtitle ?? "",
    text_align: d.textAlign ?? "center",
    buttons: Array.isArray(d.buttons) ? d.buttons : [],
    is_active: d.isActive ?? true,
    created_at: d.createdAt?.toISOString(),
  };
}
