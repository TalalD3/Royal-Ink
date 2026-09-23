/* ══════════════════════════════════════════════════════════════════════
   PRODUCT & PRINTER COMPATIBILITY TYPES — Royal Ink
   ══════════════════════════════════════════════════════════════════════ */

export type ProductCategory = "printer" | "toner" | "ink" | "drum_unit" | "spare_parts";

export interface CategoryMeta {
  id: ProductCategory;
  labelAr: string;
  labelFr: string;
  badgeClass: string;
  icon: string;
}

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

export interface Product {
  id: string;
  name: string;
  brand: PrinterBrand;
  category: ProductCategory;
  sku?: string;
  color?: ProductColor;
  imageUrl?: string;
  compatiblePrinters: string[];
  notes?: string;
  isActive: boolean;
  createdAt?: string;
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
}
