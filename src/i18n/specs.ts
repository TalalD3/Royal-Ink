import type {
  Locale,
  ProductCategory,
  ProductColor,
  SpecKey,
} from "@/types/product";

/* ══════════════════════════════════════════════════════════════════════
   SPEC DICTIONARY — every label, unit and enum value in AR / FR / EN

   Model codes, brand names and printer names are never translated: they
   are printed exactly as stored. Free-text spec values (OEM reference,
   connectivity, size…) are also shown as written.
   ══════════════════════════════════════════════════════════════════════ */

type T = Record<Locale, string>;

/* ── How each spec is entered and formatted ── */

export type UnitKey = "pages" | "months" | "ml" | "ppm" | "percent";

export type SpecKind =
  | { type: "text" }
  | { type: "number"; unit?: UnitKey }
  | { type: "enum"; options: readonly string[] };

export interface SpecField {
  kind: SpecKind;
  label: T;
  /** Example shown in the admin input */
  placeholder?: string;
}

export const SPEC_FIELDS: Record<SpecKey, SpecField> = {
  oemRef: {
    kind: { type: "text" },
    label: { ar: "المرجع الأصلي (OEM)", fr: "Référence OEM", en: "OEM reference" },
    placeholder: "CE285A",
  },
  yieldPages: {
    kind: { type: "number", unit: "pages" },
    label: { ar: "المردود", fr: "Rendement", en: "Page yield" },
    placeholder: "1600",
  },
  coverage: {
    kind: { type: "number", unit: "percent" },
    label: { ar: "نسبة التغطية", fr: "Taux de couverture", en: "Coverage" },
    placeholder: "5",
  },
  capacityMl: {
    kind: { type: "number", unit: "ml" },
    label: { ar: "السعة", fr: "Contenance", en: "Capacity" },
    placeholder: "70",
  },
  technology: {
    kind: { type: "enum", options: ["laser", "inkjet", "dot_matrix", "thermal"] },
    label: { ar: "تقنية الطباعة", fr: "Technologie d'impression", en: "Print technology" },
  },
  inkType: {
    kind: { type: "enum", options: ["dye", "pigment"] },
    label: { ar: "نوع الحبر", fr: "Type d'encre", en: "Ink type" },
  },
  voltage: {
    kind: { type: "text" },
    label: { ar: "الجهد الكهربائي", fr: "Tension", en: "Voltage" },
    placeholder: "220V",
  },
  packContents: {
    kind: { type: "text" },
    label: { ar: "محتوى العبوة", fr: "Contenu du pack", en: "Pack contents" },
    placeholder: "1 BK + 1 CMY",
  },
  dimensions: {
    kind: { type: "text" },
    label: { ar: "المقاس", fr: "Dimensions", en: "Size" },
    placeholder: "12.7 mm × 1.6 m",
  },
  partType: {
    kind: { type: "text" },
    label: { ar: "نوع القطعة", fr: "Type de pièce", en: "Part type" },
    placeholder: "Pickup roller",
  },
  printMode: {
    kind: { type: "enum", options: ["mono", "color"] },
    label: { ar: "نوع الطباعة", fr: "Impression", en: "Print mode" },
  },
  speedPpm: {
    kind: { type: "number", unit: "ppm" },
    label: { ar: "سرعة الطباعة", fr: "Vitesse d'impression", en: "Print speed" },
    placeholder: "18",
  },
  resolution: {
    kind: { type: "text" },
    label: { ar: "الدقة", fr: "Résolution", en: "Resolution" },
    placeholder: "600 × 600 dpi",
  },
  paperSize: {
    kind: { type: "text" },
    label: { ar: "مقاس الورق", fr: "Format papier", en: "Paper size" },
    placeholder: "A4",
  },
  duplex: {
    kind: { type: "enum", options: ["yes", "no"] },
    label: { ar: "الطباعة على الوجهين", fr: "Recto-verso", en: "Two-sided printing" },
  },
  connectivity: {
    kind: { type: "text" },
    label: { ar: "الاتصال", fr: "Connectivité", en: "Connectivity" },
    placeholder: "USB, Wi-Fi",
  },
  compatibleSupply: {
    kind: { type: "text" },
    label: { ar: "المستلزم المتوافق", fr: "Consommable compatible", en: "Compatible supply" },
    placeholder: "HP 85A (CE285A)",
  },
  warrantyMonths: {
    kind: { type: "number", unit: "months" },
    label: { ar: "الضمان", fr: "Garantie", en: "Warranty" },
    placeholder: "12",
  },
};

/** Which specs each category carries, in display order */
export const CATEGORY_SPECS: Record<ProductCategory, SpecKey[]> = {
  toner: ["oemRef", "yieldPages", "coverage", "technology", "warrantyMonths"],
  cartridge: ["oemRef", "yieldPages", "capacityMl", "packContents", "technology", "warrantyMonths"],
  ink: ["capacityMl", "yieldPages", "inkType", "oemRef", "warrantyMonths"],
  drum_unit: ["oemRef", "yieldPages", "warrantyMonths"],
  fuser: ["oemRef", "voltage", "yieldPages", "warrantyMonths"],
  ribbon: ["oemRef", "dimensions", "technology", "warrantyMonths"],
  spare_parts: ["oemRef", "partType", "warrantyMonths"],
  printer: [
    "printMode",
    "technology",
    "speedPpm",
    "resolution",
    "paperSize",
    "duplex",
    "connectivity",
    "compatibleSupply",
    "warrantyMonths",
  ],
};

/** Value pre-selected in the admin form for a new product of that category */
export const CATEGORY_DEFAULT_SPECS: Partial<Record<ProductCategory, Partial<Record<SpecKey, string>>>> = {
  toner: { technology: "laser", coverage: "5" },
  cartridge: { technology: "inkjet" },
  ribbon: { technology: "dot_matrix" },
};

/* ── Enum values ── */

export const ENUM_VALUES: Record<string, T> = {
  laser: { ar: "ليزر", fr: "Laser", en: "Laser" },
  inkjet: { ar: "نفث الحبر", fr: "Jet d'encre", en: "Inkjet" },
  dot_matrix: { ar: "نقطية (إبرية)", fr: "Matricielle", en: "Dot matrix" },
  thermal: { ar: "حرارية", fr: "Thermique", en: "Thermal" },
  dye: { ar: "صبغي (Dye)", fr: "Colorant (Dye)", en: "Dye" },
  pigment: { ar: "صبغات معلّقة (Pigment)", fr: "Pigmentée", en: "Pigment" },
  mono: { ar: "أحادية اللون", fr: "Monochrome", en: "Monochrome" },
  color: { ar: "ملوّنة", fr: "Couleur", en: "Colour" },
  yes: { ar: "نعم", fr: "Oui", en: "Yes" },
  no: { ar: "لا", fr: "Non", en: "No" },
};

/* ── Fixed rows (from the product's own columns) ── */

export const FIXED_LABELS: Record<"brand" | "printerBrand" | "category" | "code" | "color", T> = {
  brand: { ar: "العلامة", fr: "Marque", en: "Brand" },
  printerBrand: { ar: "علامة الطابعة", fr: "Marque d'imprimante", en: "Printer brand" },
  category: { ar: "نوع المنتج", fr: "Type de produit", en: "Product type" },
  code: { ar: "الرمز", fr: "Référence", en: "Reference" },
  color: { ar: "اللون", fr: "Couleur", en: "Colour" },
};

export const COLOR_NAMES: Record<ProductColor, T> = {
  black: { ar: "أسود", fr: "Noir", en: "Black" },
  cyan: { ar: "سماوي (Cyan)", fr: "Cyan", en: "Cyan" },
  magenta: { ar: "أرجواني (Magenta)", fr: "Magenta", en: "Magenta" },
  yellow: { ar: "أصفر", fr: "Jaune", en: "Yellow" },
  multi: { ar: "متعدد الألوان", fr: "Multicolore", en: "Multicolour" },
  none: { ar: "—", fr: "—", en: "—" },
};

/* ── Categories ── */

export interface CategoryWords {
  /** Plural, for lists and filters */
  plural: T;
  /** Singular noun phrase, used to open the auto summary */
  singular: T;
  /** Grammatical gender of the Arabic singular (agreement in the summary) */
  arGender: "f" | "m";
}

export const CATEGORY_WORDS: Record<ProductCategory, CategoryWords> = {
  toner: {
    plural: { ar: "تونر", fr: "Toners laser", en: "Laser toners" },
    singular: { ar: "خرطوشة تونر ليزر", fr: "Cartouche de toner laser", en: "laser toner cartridge" },
    arGender: "f",
  },
  cartridge: {
    plural: { ar: "خراطيش", fr: "Cartouches d'encre", en: "Ink cartridges" },
    singular: { ar: "خرطوشة حبر لطابعات نفث الحبر", fr: "Cartouche d'encre jet d'encre", en: "inkjet ink cartridge" },
    arGender: "f",
  },
  ink: {
    plural: { ar: "حبر", fr: "Encres", en: "Ink bottles" },
    singular: { ar: "عبوة حبر سائل", fr: "Bouteille d'encre", en: "ink bottle" },
    arGender: "f",
  },
  drum_unit: {
    plural: { ar: "درام", fr: "Tambours", en: "Drum units" },
    singular: { ar: "وحدة أسطوانة تصوير (درام)", fr: "Unité tambour", en: "drum unit" },
    arGender: "f",
  },
  fuser: {
    plural: { ar: "فيوزر", fr: "Unités de fusion", en: "Fuser units" },
    singular: { ar: "وحدة تثبيت حراري (فيوزر)", fr: "Unité de fusion", en: "fuser unit" },
    arGender: "f",
  },
  ribbon: {
    plural: { ar: "أشرطة ريبون", fr: "Rubans encreurs", en: "Ink ribbons" },
    singular: { ar: "شريط تحبير", fr: "Ruban encreur", en: "ink ribbon" },
    arGender: "m",
  },
  spare_parts: {
    plural: { ar: "قطع غيار", fr: "Pièces détachées", en: "Spare parts" },
    singular: { ar: "قطعة غيار", fr: "Pièce détachée", en: "spare part" },
    arGender: "f",
  },
  printer: {
    plural: { ar: "طابعات", fr: "Imprimantes", en: "Printers" },
    singular: { ar: "طابعة", fr: "Imprimante", en: "printer" },
    arGender: "f",
  },
};

/* ── Section titles and short UI words used on the product page ── */

export const UI_TEXT = {
  specsTitle: { ar: "المواصفات التفصيلية", fr: "Caractéristiques détaillées", en: "Detailed specifications" },
  printersTitle: { ar: "الطابعات المتوافقة", fr: "Imprimantes compatibles", en: "Compatible printers" },
  descriptionTitle: { ar: "الوصف", fr: "Description", en: "Description" },
  relatedTitle: { ar: "مستلزمات أخرى لنفس الطابعات", fr: "Autres consommables pour ces imprimantes", en: "Other supplies for these printers" },
} satisfies Record<string, T>;

/* ── Numbers & units ── */

/** Arabic counted noun: 1 / 2 / 3–10 / 11+ */
export function arCount(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return few;
  return many;
}

export function formatNumber(n: number, locale: Locale) {
  // Latin digits everywhere (the site uses them); grouped in French and
  // English, plain in Arabic ("1600 صفحة")
  if (locale === "ar") return new Intl.NumberFormat("en-US", { useGrouping: false }).format(n);
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(n);
}

export function withUnit(n: number, unit: UnitKey, locale: Locale): string {
  const num = formatNumber(n, locale);
  switch (unit) {
    case "pages":
      if (locale === "ar") return `${num} ${arCount(n, "صفحة", "صفحتان", "صفحات", "صفحة")}`;
      return locale === "fr" ? `${num} pages` : `${num} pages`;
    case "months":
      if (locale === "ar") return `${num} ${arCount(n, "شهر", "شهران", "أشهر", "شهراً")}`;
      if (locale === "fr") return `${num} mois`;
      return `${num} ${n === 1 ? "month" : "months"}`;
    case "ml":
      return locale === "ar" ? `${num} مل` : `${num} ml`;
    case "ppm":
      if (locale === "ar") return `${num} صفحة/دقيقة`;
      return `${num} ppm`;
    case "percent":
      return locale === "fr" ? `${num} %` : `${num}%`;
  }
}

/** A spec value as it should be printed, or null when empty */
export function formatSpec(key: SpecKey, raw: string | undefined, locale: Locale): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const { kind } = SPEC_FIELDS[key];
  if (kind.type === "enum") return ENUM_VALUES[v]?.[locale] ?? v;
  if (kind.type === "number") {
    const n = Number(v.replace(/[\s,]/g, ""));
    if (!Number.isFinite(n)) return v; // keep whatever was typed
    return kind.unit ? withUnit(n, kind.unit, locale) : formatNumber(n, locale);
  }
  return v;
}

/** Numeric value of a spec, or null */
export function specNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
