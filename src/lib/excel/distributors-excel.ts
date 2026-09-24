import * as XLSX from "xlsx";
import type { DbDistributor } from "@/lib/supabase/client";
import { algeriaWilayas } from "@/data/algeria-wilayas";
import { type BadgeTier, badgeConfig } from "@/data/distributors";

export interface ExcelDistributorRow {
  "اسم نقطة البيع / العميل": string;
  "رقم الولاية": number;
  "اسم الولاية": string;
  "الرتبة": string;
  "رقم الهاتف": string;
  "العنوان": string;
  "رابط الخريطة (اختياري)": string;
  "الحالة": string;
}

/** Normalize Wilaya Code from user input (number or text) */
export function normalizeWilayaCode(val: any): number {
  if (typeof val === "number" && val >= 1 && val <= 58) {
    return Math.floor(val);
  }

  const str = String(val || "").trim();
  if (!str) return 19; // Default to Sétif

  // Check if string starts with digits (e.g. "19", "19 - سطيف", "19-Setif")
  const leadingDigits = str.match(/^(\d{1,2})/);
  if (leadingDigits) {
    const code = parseInt(leadingDigits[1], 10);
    if (code >= 1 && code <= 58) return code;
  }

  // Lookup by Arabic name, French name, or rawName
  const lower = str.toLowerCase();
  const match = algeriaWilayas.find((w) => {
    return (
      w.nameAr.toLowerCase().includes(lower) ||
      lower.includes(w.nameAr.toLowerCase()) ||
      w.nameFr.toLowerCase().includes(lower) ||
      lower.includes(w.nameFr.toLowerCase()) ||
      (w.rawName && w.rawName.toLowerCase().includes(lower))
    );
  });

  if (match) return match.code;

  return 19; // Fallback
}

/** Normalize Badge tier from text (Arabic, French, or English) */
export function normalizeBadge(val: any): BadgeTier {
  const v = String(val || "").toLowerCase().trim();

  if (
    v.includes("مقر") ||
    v.includes("headquarter") ||
    v.includes("hq") ||
    v.includes("siège") ||
    v.includes("siege")
  ) {
    return "headquarters";
  }
  if (
    v.includes("شريك") ||
    v.includes("رئيسي") ||
    v.includes("مميز") ||
    v.includes("premium") ||
    v.includes("partenaire")
  ) {
    return "premium";
  }
  if (
    v.includes("معتمد") ||
    v.includes("authorized") ||
    v.includes("agrée") ||
    v.includes("agree") ||
    v.includes("distributeur")
  ) {
    return "authorized";
  }
  if (
    v.includes("نقطة") ||
    v.includes("بيع") ||
    v.includes("standard") ||
    v.includes("point") ||
    v.includes("vente")
  ) {
    return "standard";
  }

  return "authorized"; // Default tier
}

/** Get localized badge label */
export function getBadgeLabel(badge: BadgeTier): string {
  return badgeConfig[badge]?.labelAr || "موزع معتمد";
}

/** Normalize and clean Algerian phone numbers */
export function normalizePhone(val: any): string {
  if (!val) return "";
  const raw = String(val).trim().replace(/[\s\-().]/g, "");

  // Algerian local: 05/06/07/02/03/04... (10 digits)
  const localMatch = raw.match(/^0(\d{9})$/);
  if (localMatch) {
    return `+213 ${localMatch[1].substring(0, 3)} ${localMatch[1].substring(3, 5)} ${localMatch[1].substring(5, 7)} ${localMatch[1].substring(7, 9)}`;
  }

  // International format starting with 213 or +213
  const intlMatch = raw.match(/^\+?213(\d{9})$/);
  if (intlMatch) {
    return `+213 ${intlMatch[1].substring(0, 3)} ${intlMatch[1].substring(3, 5)} ${intlMatch[1].substring(5, 7)} ${intlMatch[1].substring(7, 9)}`;
  }

  return String(val).trim();
}

/** Export distributors list to Excel */
export function exportDistributorsToExcel(
  items: DbDistributor[],
  filename = "royal_ink_selling_points.xlsx"
) {
  const rows: ExcelDistributorRow[] = items.map((d) => {
    const wilaya = algeriaWilayas.find((w) => w.code === d.wilaya_code);
    return {
      "اسم نقطة البيع / العميل": d.name,
      "رقم الولاية": d.wilaya_code,
      "اسم الولاية": wilaya ? `${wilaya.nameAr} (${wilaya.nameFr})` : `ولاية ${d.wilaya_code}`,
      "الرتبة": getBadgeLabel(d.badge),
      "رقم الهاتف": d.phone || "",
      "العنوان": d.address || "",
      "رابط الخريطة (اختياري)": d.location_url || "",
      "الحالة": d.is_active ? "نشط" : "معطل",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set friendly column widths
  worksheet["!cols"] = [
    { wch: 34 }, // اسم نقطة البيع
    { wch: 14 }, // رقم الولاية
    { wch: 22 }, // اسم الولاية
    { wch: 18 }, // الرتبة
    { wch: 22 }, // رقم الهاتف
    { wch: 38 }, // العنوان
    { wch: 30 }, // رابط الخريطة
    { wch: 12 }, // الحالة
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "نقاط البيع والموزعين");
  XLSX.writeFile(workbook, filename);
}

/** Generate and download standard example template */
export function downloadDistributorsTemplate() {
  const sampleData: ExcelDistributorRow[] = [
    {
      "اسم نقطة البيع / العميل": "Royal Ink — المقر الرئيسي",
      "رقم الولاية": 19,
      "اسم الولاية": "سطيف (Sétif)",
      "الرتبة": "المقر الرئيسي",
      "رقم الهاتف": "+213 666 50 99 41",
      "العنوان": "دبي، مدينة العلمة 19001 — سطيف",
      "رابط الخريطة (اختياري)": "https://maps.google.com",
      "الحالة": "نشط",
    },
    {
      "اسم نقطة البيع / العميل": "شركة النور لحلول الطباعة",
      "رقم الولاية": 16,
      "اسم الولاية": "الجزائر (Alger)",
      "الرتبة": "شريك رئيسي",
      "رقم الهاتف": "0550000001",
      "العنوان": "شارع ديدوش مراد، الجزائر الوسطى",
      "رابط الخريطة (اختياري)": "https://maps.google.com",
      "الحالة": "نشط",
    },
    {
      "اسم نقطة البيع / العميل": "إلكترو وهران للمكتبيات",
      "رقم الولاية": 31,
      "اسم الولاية": "وهران (Oran)",
      "الرتبة": "موزع معتمد",
      "رقم الهاتف": "0550000002",
      "العنوان": "حي العقيد لطفي، وهران",
      "رابط الخريطة (اختياري)": "https://maps.google.com",
      "الحالة": "نشط",
    },
    {
      "اسم نقطة البيع / العميل": "قسنطينة تك للطباعة والتجهيز",
      "رقم الولاية": 25,
      "اسم الولاية": "قسنطينة (Constantine)",
      "الرتبة": "موزع معتمد",
      "رقم الهاتف": "0550000003",
      "العنوان": "سيدي مبروك، قسنطينة",
      "رابط الخريطة (اختياري)": "https://maps.google.com",
      "الحالة": "نشط",
    },
    {
      "اسم نقطة البيع / العميل": "مكتبة السلام",
      "رقم الولاية": 23,
      "اسم الولاية": "عنابة (Annaba)",
      "الرتبة": "نقطة بيع",
      "رقم الهاتف": "0550000004",
      "العنوان": "شارع الثورة، وسط مدينة عنابة",
      "رابط الخريطة (اختياري)": "https://maps.google.com",
      "الحالة": "نشط",
    },
    {
      "اسم نقطة البيع / العميل": "الأوراس لتجهيز المكاتب",
      "رقم الولاية": 5,
      "اسم الولاية": "باتنة (Batna)",
      "الرتبة": "نقطة بيع",
      "رقم الهاتف": "0550000005",
      "العنوان": "ممر النصر، باتنة",
      "رابط الخريطة (اختياري)": "https://maps.google.com",
      "الحالة": "نشط",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet["!cols"] = [
    { wch: 34 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 38 },
    { wch: 30 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج نقاط البيع");
  XLSX.writeFile(workbook, "royal_ink_selling_points_template.xlsx");
}

export type NewDistributorPayload = {
  name: string;
  wilaya_code: number;
  badge: BadgeTier;
  phone: string;
  address?: string | null;
  location_url?: string | null;
  is_active: boolean;
};

/** Parse uploaded Excel file for distributors */
export async function parseDistributorsExcel(file: File): Promise<{
  distributors: NewDistributorPayload[];
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

        const distributors: NewDistributorPayload[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, idx) => {
          const rowNum = idx + 2;

          // Lookup name (Arabic, English, French)
          const name =
            row["اسم نقطة البيع / العميل"] ||
            row["اسم نقطة البيع"] ||
            row["اسم العميل"] ||
            row["الاسم"] ||
            row["اسم الموزع"] ||
            row["Name"] ||
            row["Nom"] ||
            row["Point de vente"] ||
            "";

          // Lookup Wilaya (code or name)
          const wilayaRaw =
            row["رقم الولاية"] !== undefined
              ? row["رقم الولاية"]
              : row["الولاية"] ||
                row["كود الولاية"] ||
                row["Wilaya"] ||
                row["Code Wilaya"] ||
                row["Wilaya Code"] ||
                19;

          // Lookup Badge
          const badgeRaw =
            row["الرتبة"] ||
            row["النوع"] ||
            row["التصنيف"] ||
            row["Badge"] ||
            row["Type"] ||
            row["Tier"] ||
            row["Statut"] ||
            "authorized";

          // Lookup Phone
          const phoneRaw =
            row["رقم الهاتف"] ||
            row["الهاتف"] ||
            row["Phone"] ||
            row["Téléphone"] ||
            row["Tel"] ||
            row["Mobile"] ||
            "";

          // Lookup Address
          const address =
            row["العنوان"] ||
            row["العنوان الكامل"] ||
            row["Address"] ||
            row["Adresse"] ||
            "";

          // Lookup Location Maps URL
          const locationUrl =
            row["رابط الخريطة (اختياري)"] ||
            row["رابط الخريطة"] ||
            row["رابط خرائط جوجل"] ||
            row["الخريطة"] ||
            row["Maps"] ||
            row["Location URL"] ||
            row["Google Maps"] ||
            row["Lien Maps"] ||
            "";

          // Lookup Status
          const activeRaw =
            row["الحالة"] ||
            row["نشط"] ||
            row["Status"] ||
            row["Active"] ||
            row["Actif"] ||
            "";

          if (!name.toString().trim()) {
            errors.push(`السطر ${rowNum}: اسم نقطة البيع فارغ.`);
            return;
          }

          const wilayaCode = normalizeWilayaCode(wilayaRaw);
          const badge = normalizeBadge(badgeRaw);
          const phone = normalizePhone(phoneRaw);

          const isActive =
            activeRaw === "" ||
            activeRaw === true ||
            String(activeRaw).toLowerCase() === "true" ||
            String(activeRaw).includes("نشط") ||
            String(activeRaw).toLowerCase() === "active" ||
            String(activeRaw).toLowerCase() === "oui";

          distributors.push({
            name: name.toString().trim(),
            wilaya_code: wilayaCode,
            badge,
            phone: phone || "+213 000 00 00 00",
            address: address.toString().trim() || null,
            location_url: locationUrl.toString().trim() || null,
            is_active: isActive,
          });
        });

        resolve({ distributors, total: distributors.length, errors });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}
