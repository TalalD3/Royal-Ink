import type { Locale } from "@/types/product";

/* The language a page is rendered in. The site is Arabic only for now;
   when the header's language switch is built, read the visitor's choice
   here (cookie or route segment) and every product page will follow —
   the French and English summaries and labels are already in place. */
export function getPageLocale(): Locale {
  return "ar";
}

export const LOCALE_DIR: Record<Locale, "rtl" | "ltr"> = { ar: "rtl", fr: "ltr", en: "ltr" };
