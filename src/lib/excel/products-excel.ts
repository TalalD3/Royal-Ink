import * as XLSX from "xlsx";
import type {
  Product,
  ExcelProductRow,
  ProductCategory,
  PrinterBrand,
  ProductColor,
} from "@/types/product";
import type { ProductSpecs, SpecKey, LocalizedText } from "@/types/product";
import { CATEGORIES_CONFIG, SUPPORTED_BRANDS } from "@/types/product";
import { CATEGORY_SPECS, ENUM_VALUES, SPEC_FIELDS } from "@/i18n/specs";

/* ── Spec, note and page-address columns ──
   One column per spec key; the key in brackets makes re-imports exact. */
const SPEC_KEYS = Object.keys(SPEC_FIELDS) as SpecKey[];
const specHeader = (k: SpecKey) => `${SPEC_FIELDS[k].label.ar} (${k})`;
const NOTE_HEADERS = { ar: "ملاحظة (AR)", fr: "Note (FR)", en: "Note (EN)" } as const;
const SLUG_HEADER = "رابط الصفحة (slug)";

function specColumns(p: Partial<Product>): Record<string, string> {
  const out: Record<string, string> = {};
  SPEC_KEYS.forEach((k) => {
    out[specHeader(k)] = p.specs?.[k] ?? "";
  });
  return out;
}

function noteColumns(p: Partial<Product>): Record<string, string> {
  return {
    [NOTE_HEADERS.ar]: p.notesI18n?.ar ?? p.notes ?? "",
    [NOTE_HEADERS.fr]: p.notesI18n?.fr ?? "",
    [NOTE_HEADERS.en]: p.notesI18n?.en ?? "",
    [SLUG_HEADER]: p.slug ?? "",
  };
}

/** Enum cells may hold the key ("laser") or any of its labels ("ليزر", "Laser") */
function normalizeSpecValue(k: SpecKey, raw: string): string {
  const v = raw.trim();
  const kind = SPEC_FIELDS[k].kind;
  if (kind.type !== "enum") return v;
  const low = v.toLowerCase();
  const hit = kind.options.find(
    (o) => o === low || Object.values(ENUM_VALUES[o] ?? {}).some((t) => t.toLowerCase() === low)
  );
  return hit ?? v;
}

/** Read the spec columns of one row (header "… (key)" or the French label) */
function readSpecs(row: Record<string, any>, category: ProductCategory): ProductSpecs {
  const allowed = new Set(CATEGORY_SPECS[category]);
  const out: ProductSpecs = {};
  Object.keys(row).forEach((header) => {
    const m = header.match(/\((\w+)\)\s*$/);
    const key = (m && SPEC_KEYS.includes(m[1] as SpecKey) ? m[1] : SPEC_KEYS.find((k) => SPEC_FIELDS[k].label.fr === header.trim())) as SpecKey | undefined;
    if (!key || !allowed.has(key)) return;
    const val = (row[header] ?? "").toString().trim();
    if (val) out[key] = normalizeSpecValue(key, val);
  });
  return out;
}

/** Normalize Category from text */
export function normalizeCategory(val: string): ProductCategory {
  const v = (val || "").toLowerCase().trim();
  if (v.includes("درام") || v.includes("drum") || v.includes("tambour") || v.includes("اسطوانة")) {
    return "drum_unit";
  }
  if (v.includes("فيوزر") || v.includes("fuser") || v.includes("fusion") || v.includes("تثبيت")) {
    return "fuser";
  }
  if (v.includes("ريبون") || v.includes("ribbon") || v.includes("ruban") || v.includes("شريط")) {
    return "ribbon";
  }
  if (
    v.includes("نفث") ||
    v.includes("inkjet") ||
    v.includes("jet d'encre") ||
    v.includes("cartridge") ||
    v.includes("خراطيش") ||
    v === "cartridge"
  ) {
    return "cartridge";
  }
  if (v.includes("قطع") || v.includes("غيار") || v.includes("piece") || v.includes("part")) {
    return "spare_parts";
  }
  if (v.includes("تونر") || v.includes("toner") || v.includes("خرطوشة") || v.includes("cartouche")) {
    return "toner";
  }
  if (v.includes("سائل") || v.includes("عبوة حبر") || v.includes("encre liquide") || v.includes("ink bottle")) {
    return "ink";
  }
  if (
    v.includes("طابع") ||
    v.includes("printer") ||
    v.includes("imprimante") ||
    v.includes("الة تصوير") ||
    v.includes("آلة تصوير") ||
    v.includes("photocopieur") ||
    v.includes("copier")
  ) {
    return "printer";
  }
  if (v.includes("ليزر") || v.includes("laser")) {
    return "toner";
  }
  if (v.includes("حبر") || v.includes("ink") || v.includes("encre")) {
    return "ink";
  }
  return "toner";
}

/** Normalize Brand from text */
export function normalizeBrand(val: string): PrinterBrand {
  const v = (val || "").toLowerCase().trim();
  const match = SUPPORTED_BRANDS.find((b) => b.toLowerCase() === v);
  if (match) return match;

  // Fuzzy search in supported brands
  for (const b of SUPPORTED_BRANDS) {
    if (v.includes(b.toLowerCase())) return b;
  }
  return "HP"; // Default
}

/** Normalize Color */
export function normalizeColor(val: string): ProductColor {
  const v = (val || "").toLowerCase().trim();
  if (v.includes("أسود") || v.includes("noir") || v.includes("black")) return "black";
  if (v.includes("أزرق") || v.includes("سماوي") || v.includes("cyan") || v.includes("bleu")) return "cyan";
  if (v.includes("أحمر") || v.includes("وردي") || v.includes("magenta") || v.includes("rouge")) return "magenta";
  if (v.includes("أصفر") || v.includes("yellow") || v.includes("jaune")) return "yellow";
  if (v.includes("متعدد") || v.includes("multi") || v.includes("طقم") || v.includes("pack")) return "multi";
  return "none";
}

/** Export all products to Excel file */
export function exportProductsToExcel(products: Product[], filename = "royal_ink_products.xlsx") {
  const rows: ExcelProductRow[] = products.map((p) => ({
    "اسم المنتج": p.name,
    "العلامة التجارية": p.brand,
    "التصنيف": CATEGORIES_CONFIG[p.category]?.labelAr || p.category,
    "رمز الموديل (SKU)": p.sku || "",
    "اللون": p.color || "black",
    "الطابعات المتوافقة (مفصولة بفاصلة)": (p.compatiblePrinters || []).join(", "),
    "رابط الصورة (اختياري)": p.imageUrl || "",
    "ملاحظات / إنتاجية الصفحات": p.notes || "",
    ...noteColumns(p),
    ...specColumns(p),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set nice column widths
  worksheet["!cols"] = [
    { wch: 38 }, // اسم المنتج
    { wch: 15 }, // العلامة التجارية
    { wch: 20 }, // التصنيف
    { wch: 18 }, // رمز الموديل
    { wch: 12 }, // اللون
    { wch: 55 }, // الطابعات المتوافقة
    { wch: 25 }, // رابط الصورة
    { wch: 35 }, // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "منتجات روايال إنك");
  XLSX.writeFile(workbook, filename);
}

/** Spec values for the template rows, in the same order as sampleData */
const SAMPLE_SPECS: ProductSpecs[] = [
  { printMode: "mono", technology: "laser", speedPpm: "38", paperSize: "A4", duplex: "yes", connectivity: "USB 2.0, Ethernet", compatibleSupply: "HP 59A (CF259A)" },
  { oemRef: "CE285A", yieldPages: "1600", coverage: "5", technology: "laser" },
  { oemRef: "CRG-725", yieldPages: "1600", coverage: "5", technology: "laser" },
  { capacityMl: "65", yieldPages: "4500", inkType: "dye" },
  { capacityMl: "65", yieldPages: "7500", inkType: "dye" },
  { oemRef: "TN-2305", yieldPages: "2600", coverage: "5", technology: "laser" },
  { oemRef: "DR-2305", yieldPages: "12000" },
];

/** Generate and download standard example template */
export function downloadProductsTemplate() {
  const sampleData: ExcelProductRow[] = [
    {
      "اسم المنتج": "طابعة ليزر HP LaserJet Pro M404dn",
      "العلامة التجارية": "HP",
      "التصنيف": "طابعات وآلات تصوير",
      "رمز الموديل (SKU)": "W1A53A",
      "اللون": "أسود",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "طابعة ليزرية سريعة مع طباعة على الوجهين وشبكة إيثرنت — متوافقة مع تونر HP 59A و 59X",
    },
    {
      "اسم المنتج": "خرطوشة حبر ليزر Royal Ink HP 85A",
      "العلامة التجارية": "HP",
      "التصنيف": "حبر ليزر (تونر)",
      "رمز الموديل (SKU)": "CE285A",
      "اللون": "أسود",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "HP LaserJet Pro P1102, HP LaserJet Pro P1102w, HP LaserJet Pro M1132, HP LaserJet Pro M1212nf, HP LaserJet Pro M1217nfw",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "إنتاجية حوالي 1600 صفحة بتغطية 5% القياسية",
    },
    {
      "اسم المنتج": "خرطوشة حبر ليزر Royal Ink Canon 725",
      "العلامة التجارية": "Canon",
      "التصنيف": "حبر ليزر (تونر)",
      "رمز الموديل (SKU)": "CRG-725",
      "اللون": "أسود",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "Canon i-SENSYS LBP6000, Canon i-SENSYS LBP6020, Canon i-SENSYS LBP6030, Canon i-SENSYS LBP6030B, Canon i-SENSYS MF3010",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "إنتاجية حوالي 1600 صفحة عالية الجودة",
    },
    {
      "اسم المنتج": "عبوة حبر سائل Royal Ink Epson 103 Black",
      "العلامة التجارية": "Epson",
      "التصنيف": "حبر سائل (عبوات حبر)",
      "رمز الموديل (SKU)": "103-BK",
      "اللون": "أسود",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "Epson EcoTank L3110, Epson EcoTank L3150, Epson EcoTank L3151, Epson EcoTank L3156, Epson EcoTank L3160, Epson EcoTank L5190",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "عبوة 65 مل — طباعة حتى 4500 صفحة بنقاء فائق",
    },
    {
      "اسم المنتج": "عبوة حبر سائل Royal Ink Epson 103 Cyan",
      "العلامة التجارية": "Epson",
      "التصنيف": "حبر سائل (عبوات حبر)",
      "رمز الموديل (SKU)": "103-C",
      "اللون": "أزرق",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "Epson EcoTank L3110, Epson EcoTank L3150, Epson EcoTank L3156, Epson EcoTank L5190",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "عبوة 65 مل حبر أزرق عالي النقاوة وثابت",
    },
    {
      "اسم المنتج": "خرطوشة حبر ليزر Royal Ink Brother TN-2305",
      "العلامة التجارية": "Brother",
      "التصنيف": "حبر ليزر (تونر)",
      "رمز الموديل (SKU)": "TN-2305",
      "اللون": "أسود",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "Brother HL-L2320D, Brother HL-L2365DW, Brother DCP-L2540DW, Brother MFC-L2700DW",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "إنتاجية 2600 صفحة",
    },
    {
      "اسم المنتج": "وحدة أسطوانة تصوير Brother DR-2305 (Drum)",
      "العلامة التجارية": "Brother",
      "التصنيف": "أسطوانة تصوير (درام)",
      "رمز الموديل (SKU)": "DR-2305",
      "اللون": "أسود",
      "الطابعات المتوافقة (مفصولة بفاصلة)": "Brother HL-L2320D, Brother HL-L2365DW, Brother DCP-L2540DW, Brother MFC-L2700DW",
      "رابط الصورة (اختياري)": "",
      "ملاحظات / إنتاجية الصفحات": "وحدة درام أصلية متوافقة بعمر 12000 صفحة",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(
    sampleData.map((row, i) => ({ ...row, ...noteColumns({}), ...specColumns({ specs: SAMPLE_SPECS[i] }) }))
  );
  worksheet["!cols"] = [
    { wch: 38 },
    { wch: 15 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 65 },
    { wch: 25 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج استيراد المنتجات");
  XLSX.writeFile(workbook, "royal_ink_products_template.xlsx");
}

/** Parse uploaded Excel file */
export async function parseProductsExcel(file: File): Promise<{
  products: Omit<Product, "id">[];
  total: number;
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

        const products: Omit<Product, "id">[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, idx) => {
          // Normalize column lookups (Arabic, English, French)
          const name =
            row["اسم المنتج"] || row["Name"] || row["Product Name"] || row["Nom"] || "";
          const brandRaw =
            row["العلامة التجارية"] || row["الماركة"] || row["Brand"] || row["Marque"] || "HP";
          const categoryRaw =
            row["التصنيف"] || row["Category"] || row["Catégorie"] || "toner";
          const sku =
            row["رمز الموديل (SKU)"] || row["رمز المنتج"] || row["SKU"] || row["Code"] || "";
          const colorRaw =
            row["اللون"] || row["Color"] || row["Couleur"] || "black";
          const compatibleRaw =
            row["الطابعات المتوافقة (مفصولة بفاصلة)"] ||
            row["الطابعات المتوافقة"] ||
            row["Compatible Printers"] ||
            row["Imprimantes Compatibles"] ||
            "";
          const imageUrl =
            row["رابط الصورة (اختياري)"] || row["الصورة"] || row["Image"] || row["Image URL"] || "";
          const notes =
            row["ملاحظات / إنتاجية الصفحات"] || row["ملاحظات"] || row["Notes"] || "";

          if (!name.toString().trim()) {
            errors.push(`السطر ${idx + 2}: اسم المنتج فارغ.`);
            return;
          }

          // Split compatible printers
          const compatiblePrinters = compatibleRaw
            .toString()
            .split(/[,،;\n]+/)
            .map((s: string) => s.trim())
            .filter(Boolean);

          const category = normalizeCategory(categoryRaw.toString());
          const notesI18n: LocalizedText = {};
          (["ar", "fr", "en"] as const).forEach((l) => {
            const v = (row[NOTE_HEADERS[l]] ?? "").toString().trim();
            if (v) notesI18n[l] = v;
          });
          const slug = (row[SLUG_HEADER] ?? "").toString().trim().toLowerCase() || undefined;

          products.push({
            name: name.toString().trim(),
            brand: normalizeBrand(brandRaw.toString()),
            category,
            sku: sku.toString().trim() || undefined,
            color: normalizeColor(colorRaw.toString()),
            compatiblePrinters,
            imageUrl: imageUrl.toString().trim() || undefined,
            notes: notesI18n.ar || notes.toString().trim() || undefined,
            notesI18n: notesI18n.ar || !notes ? notesI18n : { ...notesI18n, ar: notes.toString().trim() },
            specs: readSpecs(row, category),
            slug,
            isActive: true,
          });
        });

        resolve({ products, total: products.length, errors });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}
