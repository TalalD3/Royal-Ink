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
  /** Printers only: the consumables that fit it (stored on those products) */
  supplyIds: z.array(z.string().trim().min(1).max(64)).max(500).optional(),
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

/* ── Site settings (admin «الإعدادات») — messages in Arabic, shown as is ── */

const SOCIAL_IDS = ["facebook", "instagram", "tiktok", "whatsapp", "youtube", "linkedin", "x"] as const;
const httpsOrEmpty = (what: string) =>
  z
    .string()
    .trim()
    .max(500, `${what}: الرابط طويل جداً`)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), `${what}: يجب أن يبدأ الرابط بـ https://`);
const imageSchema = (what: string) =>
  z.object({
    url: z
      .string()
      .trim()
      .max(1000)
      .refine((v) => /^(https:\/\/|\/)\S+$/.test(v), `${what}: رابط الصورة غير صالح`),
  });

export const siteSettingsSchema = z.object({
  phones: z
    .array(z.string().trim().regex(/^[+0-9 ()-]{6,30}$/, "رقم هاتف غير صالح — أرقام ومسافات فقط، مثل +213 666 50 99 41"))
    .min(1, "أضف رقم هاتف واحداً على الأقل")
    .max(4, "أربعة أرقام هاتف كحد أقصى"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح").max(200),
  address: z.string().trim().min(1, "العنوان مطلوب").max(300, "العنوان طويل جداً"),
  hours: z.string().trim().max(200, "أوقات العمل: النص طويل جداً"),
  mapsUrl: httpsOrEmpty("رابط الخريطة"),
  socials: z
    .array(
      z.object({
        id: z.enum(SOCIAL_IDS),
        handle: z.string().trim().max(80, "اسم الحساب طويل جداً"),
        url: httpsOrEmpty("رابط الحساب"),
        enabled: z.boolean(),
      })
    )
    .max(SOCIAL_IDS.length),
  contactHeroImage: imageSchema("صورة واجهة صفحة التواصل"),
  storeImage: imageSchema("صورة المتجر"),
  contactFacts: z.array(z.string().trim().min(1, "نقطة فارغة — اكتبها أو احذفها").max(80, "النقطة طويلة جداً")).max(4),
  faq: z
    .array(
      z.object({
        q: z.string().trim().min(1, "سؤال فارغ — اكتبه أو احذفه").max(200, "السؤال طويل جداً"),
        a: z.string().trim().min(1, "جواب فارغ — اكتبه أو احذف السؤال").max(1500, "الجواب طويل جداً"),
      })
    )
    .max(20, "عشرون سؤالاً كحد أقصى"),
  onlineStoreUrl: httpsOrEmpty("رابط المتجر الإلكتروني"),
  formRecipient: z.string().trim().email("بريد استلام الرسائل غير صالح").max(200),
});

/* ── Contact form (public) — messages in Arabic, shown to the visitor ── */

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "اكتبوا الاسم الكامل أو اسم الشركة").max(120, "الاسم طويل جداً"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 9 && digits <= 15;
    }, "رقم الهاتف غير صحيح. اكتبوه كاملاً، مثل 0550 00 00 00."),
  rc: z.string().trim().min(3, "رقم السجل التجاري مطلوب").max(60, "رقم السجل التجاري طويل جداً"),
  subject: z.string().trim().max(150, "الموضوع طويل جداً").optional().default(""),
  message: z.string().trim().min(10, "الرسالة قصيرة جداً — اكتبوا طلبكم بتفصيل أكثر").max(4000, "الرسالة طويلة جداً"),
  /** Product code when the visitor came from a product page */
  product: z.string().trim().max(80).optional().default(""),
  /** Hidden field: people leave it empty, spam robots fill it */
  website: z.string().max(200).optional().default(""),
});
export type ContactMessage = z.infer<typeof contactMessageSchema>;
