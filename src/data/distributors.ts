/* ══════════════════════════════════════════════════════════════════════
   DISTRIBUTOR DATA — Royal Ink Algeria Network
   ══════════════════════════════════════════════════════════════════════ */

import { algeriaWilayas, type WilayaData } from "./algeria-wilayas";

export type BadgeTier = "headquarters" | "premium" | "authorized" | "standard";

export interface City {
  id: string;
  wilayaCode: number;
  nameAr: string;
  nameFr: string;
  /** Percentage position (kept for backward compatibility) */
  x: number;
  y: number;
  isHQ?: boolean;
}

export interface Distributor {
  id: string;
  cityId: string;
  wilayaCode: number;
  name: string;
  badge: BadgeTier;
  phones: string[];
  locationUrl?: string;
  /** Optional address / note */
  note?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   BADGE CONFIGURATION
   ────────────────────────────────────────────────────────────────────── */

export const badgeConfig: Record<
  BadgeTier,
  {
    labelAr: string;
    labelFr: string;
    icon: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    glowClass: string;
  }
> = {
  headquarters: {
    labelAr: "المقر الرئيسي",
    labelFr: "Siège Social",
    icon: "🏢",
    colorClass: "text-amber-500",
    bgClass: "bg-gradient-to-br from-amber-500/10 to-yellow-500/5",
    borderClass: "border-amber-500/30",
    glowClass: "shadow-amber-500/20",
  },
  premium: {
    labelAr: "شريك رئيسي",
    labelFr: "Partenaire Premium",
    icon: "⭐",
    colorClass: "text-primary",
    bgClass: "bg-gradient-to-br from-primary/10 to-rose-500/5",
    borderClass: "border-primary/30",
    glowClass: "shadow-primary/20",
  },
  authorized: {
    labelAr: "موزع معتمد",
    labelFr: "Distributeur Agréé",
    icon: "✅",
    colorClass: "text-emerald-500",
    bgClass: "bg-gradient-to-br from-emerald-500/10 to-green-500/5",
    borderClass: "border-emerald-500/20",
    glowClass: "shadow-emerald-500/10",
  },
  standard: {
    labelAr: "نقطة بيع",
    labelFr: "Point de Vente",
    icon: "📦",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted/30",
    borderClass: "border-border/50",
    glowClass: "",
  },
};

/* ──────────────────────────────────────────────────────────────────────
   CITIES WITH WILAYA CODES
   ────────────────────────────────────────────────────────────────────── */

export const cities: City[] = [
  // ═══ HEADQUARTERS ═══
  { id: "setif",        wilayaCode: 19, nameAr: "سطيف",              nameFr: "Sétif",              x: 67, y: 27, isHQ: true },

  // ═══ MAJOR COASTAL CITIES ═══
  { id: "algiers",      wilayaCode: 16, nameAr: "الجزائر العاصمة",    nameFr: "Alger",              x: 48, y: 10 },
  { id: "oran",         wilayaCode: 31, nameAr: "وهران",              nameFr: "Oran",               x: 12, y: 40 },
  { id: "annaba",       wilayaCode: 23, nameAr: "عنابة",              nameFr: "Annaba",             x: 89, y: 8  },
  { id: "bejaia",       wilayaCode: 6,  nameAr: "بجاية",              nameFr: "Béjaïa",             x: 64, y: 10 },
  { id: "skikda",       wilayaCode: 21, nameAr: "سكيكدة",             nameFr: "Skikda",             x: 81, y: 8  },
  { id: "jijel",        wilayaCode: 18, nameAr: "جيجل",               nameFr: "Jijel",              x: 71, y: 8  },
  { id: "mostaganem",   wilayaCode: 27, nameAr: "مستغانم",            nameFr: "Mostaganem",         x: 19, y: 36 },

  // ═══ MAJOR INLAND CITIES ═══
  { id: "constantine",  wilayaCode: 25, nameAr: "قسنطينة",            nameFr: "Constantine",        x: 80, y: 22 },
  { id: "batna",        wilayaCode: 5,  nameAr: "باتنة",              nameFr: "Batna",              x: 74, y: 46 },
  { id: "blida",        wilayaCode: 9,  nameAr: "البليدة",            nameFr: "Blida",              x: 45, y: 20 },
  { id: "tizi-ouzou",   wilayaCode: 15, nameAr: "تيزي وزو",          nameFr: "Tizi Ouzou",         x: 55, y: 12 },
  { id: "tlemcen",      wilayaCode: 13, nameAr: "تلمسان",             nameFr: "Tlemcen",            x: 6,  y: 68 },
  { id: "chlef",        wilayaCode: 2,  nameAr: "الشلف",              nameFr: "Chlef",              x: 30, y: 28 },
  { id: "medea",        wilayaCode: 26, nameAr: "المدية",             nameFr: "Médéa",              x: 43, y: 28 },
  { id: "msila",        wilayaCode: 28, nameAr: "المسيلة",            nameFr: "M'sila",             x: 59, y: 43 },
  { id: "djelfa",       wilayaCode: 17, nameAr: "الجلفة",             nameFr: "Djelfa",             x: 48, y: 62 },
  { id: "bba",          wilayaCode: 34, nameAr: "برج بوعريريج",       nameFr: "Bordj Bou Arréridj", x: 62, y: 31 },
  { id: "sba",          wilayaCode: 22, nameAr: "سيدي بلعباس",        nameFr: "Sidi Bel Abbès",     x: 12, y: 58 },
  { id: "biskra",       wilayaCode: 7,  nameAr: "بسكرة",              nameFr: "Biskra",             x: 70, y: 68 },
  { id: "tiaret",       wilayaCode: 14, nameAr: "تيارت",              nameFr: "Tiaret",             x: 25, y: 50 },
  { id: "bouira",       wilayaCode: 10, nameAr: "البويرة",            nameFr: "Bouira",             x: 53, y: 22 },
  { id: "guelma",       wilayaCode: 24, nameAr: "قالمة",              nameFr: "Guelma",             x: 85, y: 18 },
  { id: "souk-ahras",   wilayaCode: 41, nameAr: "سوق أهراس",         nameFr: "Souk Ahras",         x: 91, y: 18 },
  { id: "oum-el-bouaghi", wilayaCode: 4, nameAr: "أم البواقي",       nameFr: "Oum El Bouaghi",     x: 82, y: 32 },
  { id: "tebessa",      wilayaCode: 12, nameAr: "تبسة",               nameFr: "Tébessa",            x: 92, y: 42 },
  { id: "khenchela",    wilayaCode: 40, nameAr: "خنشلة",              nameFr: "Khenchela",          x: 82, y: 46 },
  { id: "el-eulma",     wilayaCode: 19, nameAr: "العلمة",             nameFr: "El Eulma",           x: 70, y: 30 },
];

/* ──────────────────────────────────────────────────────────────────────
   DISTRIBUTORS
   ────────────────────────────────────────────────────────────────────── */

export const distributors: Distributor[] = [
  // ═══ HEADQUARTERS — SETIF ═══
  {
    id: "hq-setif",
    cityId: "setif",
    wilayaCode: 19,
    name: "Royal Ink — المقر الرئيسي",
    badge: "headquarters",
    phones: ["+213 666 50 99 41", "+213 550 89 94 84"],
    locationUrl: "https://maps.google.com",
    note: "دبي، مدينة العلمة 19001 — سطيف",
  },

  // ═══ SAMPLE DISTRIBUTORS — Easily edited / customized ═══
  {
    id: "algiers-1",
    cityId: "algiers",
    wilayaCode: 16,
    name: "نقطة بيع الجزائر العاصمة",
    badge: "premium",
    phones: ["+213 550 00 00 01"],
    locationUrl: "https://maps.google.com",
    note: "الجزائر العاصمة — متوفر جميع منتجات روايال إنك",
  },
  {
    id: "oran-1",
    cityId: "oran",
    wilayaCode: 31,
    name: "نقطة بيع وهران",
    badge: "authorized",
    phones: ["+213 550 00 00 02"],
    locationUrl: "https://maps.google.com",
    note: "وهران — موزع معتمد",
  },
  {
    id: "constantine-1",
    cityId: "constantine",
    wilayaCode: 25,
    name: "نقطة بيع قسنطينة",
    badge: "authorized",
    phones: ["+213 550 00 00 03"],
    locationUrl: "https://maps.google.com",
    note: "قسنطينة — موزع معتمد",
  },
];

/* ──────────────────────────────────────────────────────────────────────
   HELPER FUNCTIONS
   ────────────────────────────────────────────────────────────────────── */

/** Get all distributors for a given city ID */
export function getDistributorsByCity(cityId: string): Distributor[] {
  return distributors
    .filter((d) => d.cityId === cityId)
    .sort((a, b) => badgeTierOrder[a.badge] - badgeTierOrder[b.badge]);
}

/** Get all distributors for a given wilaya code */
export function getDistributorsByWilaya(wilayaCode: number): Distributor[] {
  return distributors
    .filter((d) => d.wilayaCode === wilayaCode)
    .sort((a, b) => badgeTierOrder[a.badge] - badgeTierOrder[b.badge]);
}

/** Get cities that have at least one distributor */
export function getActiveCities(): (City & { distributorCount: number })[] {
  return cities
    .filter((city) => distributors.some((d) => d.cityId === city.id))
    .map((city) => ({
      ...city,
      distributorCount: distributors.filter((d) => d.cityId === city.id).length,
    }));
}

/** Get all active wilaya codes */
export function getActiveWilayaCodes(): Set<number> {
  return new Set(distributors.map((d) => d.wilayaCode));
}

/** Badge tier sort order (lower = more important) */
export const badgeTierOrder: Record<BadgeTier, number> = {
  headquarters: 0,
  premium: 1,
  authorized: 2,
  standard: 3,
};
