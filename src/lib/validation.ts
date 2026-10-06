import { z } from "zod";
import { CATEGORY_ORDER, SUPPORTED_BRANDS } from "@/types/product";

/* ══════════════════════════════════════════════════════════════════════
   INPUT VALIDATION (zod) — everything the admin screens send is checked
   here on the server before it reaches the database. Unknown fields are
   dropped; wrong types or oversized values are refused with a 400.
   ══════════════════════════════════════════════════════════════════════ */

const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) => str(max).nullish();

const COLORS = ["black", "cyan", "magenta", "yellow", "multi", "none"] as const;
const BADGES = ["headquarters", "premium", "authorized", "standard"] as const;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

/** A product as sent by the admin (create, update or Excel import) */
export const productInputSchema = z.object({
  name: str(300).optional(),
  brand: z.enum(SUPPORTED_BRANDS).optional(),
  category: z.enum(CATEGORY_ORDER as [string, ...string[]]).optional(),
  sku: optStr(80),
  color: z.enum(COLORS).optional(),
  imageUrl: optStr(1000),
  imageKey: optStr(200),
  compatiblePrinters: z.array(str(120)).max(500).optional(),
  notes: optStr(4000),
  notesI18n: z
    .object({ ar: optStr(4000), fr: optStr(4000), en: optStr(4000) })
    .partial()
    .optional(),
  specs: z.record(z.string().max(40), z.union([str(300), z.number()])).optional(),
  slug: optStr(160),
  isActive: z.boolean().optional(),
});

export const productCreateSchema = productInputSchema.extend({ name: str(300).min(1, "Product name is required") });

export const distributorInputSchema = z.object({
  name: str(300).optional(),
  wilaya_code: z.coerce.number().int().min(1).max(58).optional(),
  badge: z.enum(BADGES).optional(),
  phone: optStr(60),
  address: optStr(400),
  location_url: optStr(1000),
  is_active: z.boolean().optional(),
});

export const distributorCreateSchema = distributorInputSchema.extend({
  name: str(300).min(1, "Point of sale name is required"),
  wilaya_code: z.coerce.number().int().min(1).max(58),
});

export const slideInputSchema = z.object({
  sort_order: z.coerce.number().int().min(-1000).max(1000).optional(),
  image_url: optStr(1000),
  image_key: optStr(200),
  overlay_opacity: z.coerce.number().min(0).max(100).optional(),
  title: optStr(200),
  subtitle: optStr(600),
  text_align: z.enum(["right", "center", "left"]).optional(),
  buttons: z
    .array(
      z.object({
        text: str(60),
        href: str(300),
        variant: z.enum(["primary", "outline"]).default("primary"),
      })
    )
    .max(2)
    .optional(),
  is_active: z.boolean().optional(),
});

export const idSchema = z.string().trim().min(1).max(64);

/** One body, or an array of them (Excel import) — checked separately so
    the error names the exact field (and row) that is wrong */
export function parseOneOrMany<T extends z.ZodTypeAny>(schema: T, body: unknown) {
  return Array.isArray(body) ? z.array(schema).max(2000).safeParse(body) : schema.safeParse(body);
}

/** A readable message from a zod error */
export function validationMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Invalid input";
  const path = issue.path.map((p) => (typeof p === "number" ? `row ${p + 1}` : String(p))).join(" → ");
  return `${path || "input"}: ${issue.message}`;
}
