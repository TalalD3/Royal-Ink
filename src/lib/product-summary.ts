import type { Locale, Product, ProductColor } from "@/types/product";
import { CATEGORY_WORDS, ENUM_VALUES, formatNumber, specNumber, withUnit } from "@/i18n/specs";
import { effectiveSpecs } from "@/lib/product-utils";

/* ══════════════════════════════════════════════════════════════════════
   AUTO SUMMARY — a short description written from the product's specs

   One template per language (ar / fr / en), written once. Every clause
   appears only when its value exists, so the text is never broken or
   empty. Codes, brands and printer names are inserted untranslated.
   No translation service is involved.
   ══════════════════════════════════════════════════════════════════════ */

const BRAND = "ROYALiNK";
const COLORED = new Set(["toner", "cartridge", "ink", "ribbon"]);
const MAX_PRINTERS = 3;

/* Latin names and codes inside Arabic text are wrapped in bidi isolates
   (FSI … PDI), so a list like "P1102، P1102w، M1132" keeps its order
   when the line wraps */
const iso = (s: string) => `⁨${s}⁩`;

/* Colour phrase built on the word "colour", so no adjective agreement
   with the product noun is needed */
const COLOR_PHRASE: Record<Exclude<ProductColor, "none">, Record<Locale, string>> = {
  black: { ar: "باللون الأسود", fr: "de couleur noire", en: "in black" },
  cyan: { ar: "باللون السماوي (Cyan)", fr: "de couleur cyan", en: "in cyan" },
  magenta: { ar: "باللون الأرجواني (Magenta)", fr: "de couleur magenta", en: "in magenta" },
  yellow: { ar: "باللون الأصفر", fr: "de couleur jaune", en: "in yellow" },
  multi: { ar: "متعدد الألوان", fr: "multicolore", en: "in multiple colours" },
};

function listPrinters(models: string[], locale: Locale): string {
  const shown = models.slice(0, MAX_PRINTERS);
  const rest = models.length - shown.length;
  if (locale === "ar") {
    shown.forEach((m, i) => (shown[i] = iso(m)));
    if (rest <= 0) {
      return shown.length > 1 ? `${shown.slice(0, -1).join("، ")} و${shown[shown.length - 1]}` : shown[0];
    }
    const head = shown.join("، ");
    const more =
      rest === 1 ? "طراز آخر" : rest === 2 ? "طرازان آخران" : rest <= 10 ? `${rest} طرازات أخرى` : `${rest} طرازاً آخر`;
    return `${head}، و${more}`;
  }
  if (locale === "fr") {
    if (rest <= 0) return shown.length > 1 ? `${shown.slice(0, -1).join(", ")} et ${shown[shown.length - 1]}` : shown[0];
    return rest === 1 ? `${shown.join(", ")} et un autre modèle` : `${shown.join(", ")} et ${rest} autres modèles`;
  }
  if (rest <= 0) return shown.length > 1 ? `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}` : shown[0];
  return rest === 1 ? `${shown.join(", ")} and one other model` : `${shown.join(", ")} and ${rest} other models`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Consumables & parts (sold as ROYALiNK, made for {brand} printers) ── */

function consumableSummary(p: Product, locale: Locale): string[] {
  const s = effectiveSpecs(p);
  const words = CATEGORY_WORDS[p.category];
  const fem = words.arGender === "f";
  // Colour is only worth saying for what actually prints a colour
  const color =
    COLORED.has(p.category) && p.color && p.color !== "none" ? COLOR_PHRASE[p.color][locale] : "";
  const printers = p.compatiblePrinters.filter(Boolean);
  const yieldN = specNumber(s.yieldPages);
  const coverage = specNumber(s.coverage);
  const capacity = specNumber(s.capacityMl);
  const warranty = specNumber(s.warrantyMonths);
  const oem = s.oemRef?.trim();
  const out: string[] = [];

  if (locale === "ar") {
    let first = `${words.singular.ar} من ${iso(BRAND)}${color ? ` ${color}` : ""}، ${fem ? "متوافقة" : "متوافق"} مع طابعات ${iso(p.brand)}`;
    if (printers.length) first += ` ومنها ${listPrinters(printers, "ar")}`;
    out.push(`${first}.`);
    if (yieldN) {
      out.push(
        `${fem ? "يصل مردودها" : "يصل مردوده"} إلى ${withUnit(yieldN, "pages", "ar")}${coverage ? ` بنسبة تغطية ${iso(`${formatNumber(coverage, "ar")}%`)}` : ""}.`
      );
    }
    if (capacity) out.push(`${fem ? "سعتها" : "سعته"} ${withUnit(capacity, "ml", "ar")}.`);
    if (oem) out.push(`${fem ? "تحل" : "يحل"} محل المرجع الأصلي ${iso(oem)}.`);
    if (warranty) out.push(`${fem ? "مضمونة" : "مضمون"} لمدة ${withUnit(warranty, "months", "ar")}.`);
    return out;
  }

  if (locale === "fr") {
    let first = `${words.singular.fr} ${BRAND}${color ? ` ${color}` : ""}, compatible avec les imprimantes ${p.brand}`;
    if (printers.length) first += `, notamment ${listPrinters(printers, "fr")}`;
    out.push(`${first}.`);
    if (yieldN) {
      out.push(
        `Rendement jusqu'à ${withUnit(yieldN, "pages", "fr")}${coverage ? ` (taux de couverture ${formatNumber(coverage, "fr")} %)` : ""}.`
      );
    }
    if (capacity) out.push(`Contenance : ${withUnit(capacity, "ml", "fr")}.`);
    if (oem) out.push(`Remplace la référence d'origine ${oem}.`);
    if (warranty) out.push(`Garantie ${withUnit(warranty, "months", "fr")}.`);
    return out;
  }

  let first = `${BRAND} ${words.singular.en}${color ? ` ${color}` : ""}, compatible with ${p.brand} printers`;
  if (printers.length) first += ` including ${listPrinters(printers, "en")}`;
  out.push(`${first}.`);
  if (yieldN) {
    out.push(
      `Yields up to ${withUnit(yieldN, "pages", "en")}${coverage ? ` at ${formatNumber(coverage, "en")}% coverage` : ""}.`
    );
  }
  if (capacity) out.push(`Capacity: ${withUnit(capacity, "ml", "en")}.`);
  if (oem) out.push(`Replaces the original reference ${oem}.`);
  if (warranty) out.push(`${formatNumber(warranty, "en")}-month warranty.`);
  return out;
}

/* ── Printers (sold under their maker's brand — no ROYALiNK wording) ── */

function printerSummary(p: Product, locale: Locale): string[] {
  const s = effectiveSpecs(p);
  const mode = s.printMode === "mono" || s.printMode === "color" ? s.printMode : undefined;
  const tech = s.technology && ENUM_VALUES[s.technology] ? s.technology : undefined;
  const speed = specNumber(s.speedPpm);
  const duplex = s.duplex === "yes";
  const conn = s.connectivity?.trim();
  const supply = s.compatibleSupply?.trim();
  const warranty = specNumber(s.warrantyMonths);
  const out: string[] = [];

  if (locale === "ar") {
    const techAr: Record<string, string> = {
      laser: "الليزر",
      inkjet: "نفث الحبر",
      dot_matrix: "الطباعة النقطية",
      thermal: "الطباعة الحرارية",
    };
    out.push(
      `طابعة ${iso(p.brand)}${mode ? ` ${ENUM_VALUES[mode].ar}` : ""}${tech ? ` بتقنية ${techAr[tech]}` : ""}.`
    );
    const parts: string[] = [];
    if (speed) parts.push(`تطبع بسرعة تصل إلى ${withUnit(speed, "pages", "ar")} في الدقيقة`);
    if (duplex) parts.push("مع الطباعة على الوجهين");
    if (conn) parts.push(`وتدعم الاتصال عبر ${iso(conn)}`);
    if (parts.length) out.push(`${parts.join("، ")}.`);
    if (supply) out.push(`المستلزم المتوافق معها: ${iso(supply)}.`);
    if (warranty) out.push(`مضمونة لمدة ${withUnit(warranty, "months", "ar")}.`);
    return out;
  }

  if (locale === "fr") {
    const techFr: Record<string, string> = {
      laser: "laser",
      inkjet: "jet d'encre",
      dot_matrix: "matricielle",
      thermal: "thermique",
    };
    out.push(
      `Imprimante ${p.brand}${mode ? ` ${mode === "mono" ? "monochrome" : "couleur"}` : ""}${tech ? ` à technologie ${techFr[tech]}` : ""}.`
    );
    const parts: string[] = [];
    if (speed) parts.push(`Vitesse d'impression jusqu'à ${formatNumber(speed, "fr")} pages par minute`);
    if (duplex) parts.push(parts.length ? "impression recto-verso" : "Impression recto-verso");
    if (parts.length) out.push(`${parts.join(", ")}.`);
    if (conn) out.push(`Connectivité : ${conn}.`);
    if (supply) out.push(`Consommable compatible : ${supply}.`);
    if (warranty) out.push(`Garantie ${withUnit(warranty, "months", "fr")}.`);
    return out;
  }

  const techEn: Record<string, string> = {
    laser: "laser",
    inkjet: "inkjet",
    dot_matrix: "dot-matrix",
    thermal: "thermal",
  };
  out.push(
    `${p.brand}${mode ? ` ${mode === "mono" ? "monochrome" : "colour"}` : ""}${tech ? ` ${techEn[tech]}` : ""} printer.`
  );
  const parts: string[] = [];
  if (speed) parts.push(`Prints up to ${formatNumber(speed, "en")} pages per minute`);
  if (duplex) parts.push(parts.length ? "with two-sided printing" : "Two-sided printing");
  if (parts.length) out.push(`${capitalize(parts.join(", "))}.`);
  if (conn) out.push(`Connectivity: ${conn}.`);
  if (supply) out.push(`Compatible supply: ${supply}.`);
  if (warranty) out.push(`${formatNumber(warranty, "en")}-month warranty.`);
  return out;
}

/** The summary as sentences (first sentence is always present) */
export function buildSummarySentences(p: Product, locale: Locale): string[] {
  const sentences = p.category === "printer" ? printerSummary(p, locale) : consumableSummary(p, locale);
  return sentences.map((x) => (locale === "ar" ? x : capitalize(x)));
}

export function buildSummary(p: Product, locale: Locale): string {
  return buildSummarySentences(p, locale).join(" ");
}

/** The hand-written note for that language (legacy `notes` counts as Arabic) */
export function noteFor(p: Product, locale: Locale): string | undefined {
  const n = p.notesI18n?.[locale]?.trim();
  if (n) return n;
  if (locale === "ar" && p.notes?.trim()) return p.notes.trim();
  return undefined;
}
