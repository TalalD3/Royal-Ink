/* ══════════════════════════════════════════════════════════════════════
   PRODUCT & PRINTER COMPATIBILITY TYPES — Royal Ink
   ══════════════════════════════════════════════════════════════════════ */

export type ProductCategory =
  | "printer"
  | "toner"
  | "cartridge"
  | "ink"
  | "drum_unit"
  | "fuser"
  | "ribbon"
  | "spare_parts";

/** Display order (matches the home page category tiles) */
export const CATEGORY_ORDER: ProductCategory[] = [
  "toner",
  "cartridge",
  "ink",
  "drum_unit",
  "fuser",
  "ribbon",
  "spare_parts",
  "printer",
];

export interface CategoryMeta {
  id: ProductCategory;
  labelAr: string;
  labelFr: string;
  badgeClass: string;
  icon: string;
}

/** Admin-panel metadata (the public pages use the dictionary in src/i18n/specs.ts) */
export const CATEGORIES_CONFIG: Record<ProductCategory, CategoryMeta> = {
  printer: {
    id: "printer",
    labelAr: "طابعات وآلات تصوير",
    labelFr: "Imprimantes & Copieurs",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icon: "🖨️",
  },
  toner: {
    id: "toner",
    labelAr: "حبر ليزر (تونر)",
    labelFr: "Toner Laser",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    icon: "📦",
  },
  cartridge: {
    id: "cartridge",
    labelAr: "خراطيش نفث الحبر",
    labelFr: "Cartouches jet d'encre",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    icon: "🖋️",
  },
  ink: {
    id: "ink",
    labelAr: "حبر سائل (عبوات حبر)",
    labelFr: "Encre Liquide",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: "💧",
  },
  drum_unit: {
    id: "drum_unit",
    labelAr: "أسطوانة تصوير (درام)",
    labelFr: "Unité Tambour (Drum)",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: "⚙️",
  },
  fuser: {
    id: "fuser",
    labelAr: "وحدة تثبيت حراري (فيوزر)",
    labelFr: "Unité de fusion",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    icon: "🔥",
  },
  ribbon: {
    id: "ribbon",
    labelAr: "أشرطة تحبير (ريبون)",
    labelFr: "Rubans encreurs",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    icon: "🎞️",
  },
  spare_parts: {
    id: "spare_parts",
    labelAr: "قطع غيار ومستلزمات",
    labelFr: "Pièces Détachées",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: "🔧",
  },
};

export const SUPPORTED_BRANDS = [
  "HP",
  "Canon",
  "Epson",
  "Brother",
  "Ricoh",
  "Xerox",
  "Kyocera",
  "Samsung",
  "Konica Minolta",
  "Lexmark",
  "Sharp",
  "Pantum",
  "Deli",
  "Lenovo",
  "Panasonic",
  "Oki",
  "Tally Dascom",
  "Diebold Nixdorf",
  "Printronix",
  "Dell",
] as const;

export type PrinterBrand = (typeof SUPPORTED_BRANDS)[number];

export type ProductColor = "black" | "cyan" | "magenta" | "yellow" | "multi" | "none";

/* ── Languages & structured specs ── */

export type Locale = "ar" | "fr" | "en";
export const LOCALES: Locale[] = ["ar", "fr", "en"];

/** Every spec a product can carry. Labels live in src/i18n/specs.ts;
    which keys apply to which category is CATEGORY_SPECS there. */
export type SpecKey =
  | "oemRef"
  | "yieldPages"
  | "coverage"
  | "capacityMl"
  | "technology"
  | "inkType"
  | "voltage"
  | "packContents"
  | "dimensions"
  | "partType"
  | "printMode"
  | "speedPpm"
  | "resolution"
  | "paperSize"
  | "duplex"
  | "connectivity"
  | "compatibleSupply"
  | "warrantyMonths";

/** Stored as strings (numbers as "1600", enums as their key, e.g. "laser") */
export type ProductSpecs = Partial<Record<SpecKey, string>>;

export type LocalizedText = Partial<Record<Locale, string>>;

export interface Product {
  id: string;
  name: string;
  brand: PrinterBrand;
  category: ProductCategory;
  sku?: string;
  color?: ProductColor;
  imageUrl?: string;
  compatiblePrinters: string[];
  /** Legacy single note (Arabic) — read as the Arabic note when notesI18n.ar is empty */
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  /** URL segment of the product page; derived from brand + code when empty */
  slug?: string;
  specs?: ProductSpecs;
  /** Optional hand-written note per language, shown under the auto summary */
  notesI18n?: LocalizedText;
}

export interface ExcelProductRow {
  "اسم المنتج": string;
  "العلامة التجارية": string;
  "التصنيف": string;
  "رمز الموديل (SKU)": string;
  "اللون": string;
  "الطابعات المتوافقة (مفصولة بفاصلة)": string;
  "رابط الصورة (اختياري)": string;
  "ملاحظات / إنتاجية الصفحات": string;
  [column: string]: string;
}
