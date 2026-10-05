"use client";

import React, { useState } from "react";
import type {
  Locale,
  LocalizedText,
  Product,
  ProductCategory,
  ProductSpecs,
  SpecKey,
} from "@/types/product";
import { CATEGORY_SPECS, CATEGORY_WORDS, ENUM_VALUES, SPEC_FIELDS } from "@/i18n/specs";
import { buildSummary } from "@/lib/product-summary";
import { inferSpecsFromNotes } from "@/lib/product-utils";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT DETAILS EDITOR (admin)
   - the spec fields of the chosen category (structured, not free text)
   - an optional note per language
   - a live preview of the auto summary in Arabic, French and English
   ══════════════════════════════════════════════════════════════════════ */

const LANG_LABEL: Record<Locale, string> = { ar: "العربية", fr: "Français", en: "English" };

const inputCls =
  "w-full h-9 px-3 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

export function ProductSpecsEditor({
  category,
  specs,
  legacyNotes,
  onChange,
}: {
  category: ProductCategory;
  specs: ProductSpecs;
  /** The old free note — values found in it are suggested as placeholders */
  legacyNotes?: string;
  onChange: (next: ProductSpecs) => void;
}) {
  const keys = CATEGORY_SPECS[category];
  const inferred = inferSpecsFromNotes(category, legacyNotes);
  const set = (k: SpecKey, v: string) => onChange({ ...specs, [k]: v });

  return (
    <div>
      <label className="block text-[12px] font-semibold text-foreground mb-1">
        المواصفات <span className="text-muted-foreground font-normal">— {CATEGORY_WORDS[category].plural.ar}</span>
      </label>
      <p className="text-[10px] text-muted-foreground mb-2">
        تظهر في جدول «المواصفات التفصيلية» بصفحة المنتج. الرموز والقيم تُكتب كما هي ولا تُترجم؛ الحقول الفارغة لا تظهر.
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 p-2.5 bg-muted/20 rounded-md border border-border">
        {keys.map((k) => {
          const field = SPEC_FIELDS[k];
          const value = specs[k] ?? "";
          const hint = inferred[k];
          return (
            <div key={k}>
              <span className="block text-[11px] font-semibold text-foreground mb-1">
                {field.label.ar}{" "}
                <span dir="ltr" className="ms-1.5 text-[10px] font-normal text-muted-foreground">
                  {field.label.fr}
                </span>
              </span>
              {field.kind.type === "enum" ? (
                <select
                  value={value}
                  onChange={(e) => set(k, e.target.value)}
                  className={`${inputCls} px-2.5 cursor-pointer`}
                >
                  <option value="">—</option>
                  {field.kind.options.map((o) => (
                    <option key={o} value={o}>
                      {ENUM_VALUES[o]?.ar ?? o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  inputMode={field.kind.type === "number" ? "numeric" : undefined}
                  dir={field.kind.type === "number" ? "ltr" : "auto"}
                  value={value}
                  onChange={(e) => set(k, e.target.value)}
                  placeholder={hint ? `${hint} (من الملاحظة)` : field.placeholder}
                  className={`${inputCls} ${field.kind.type === "number" ? "text-right" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProductNotesEditor({
  notes,
  onChange,
  draft,
}: {
  notes: LocalizedText;
  onChange: (next: LocalizedText) => void;
  /** The product as currently filled in, for the summary preview */
  draft: Product;
}) {
  const [lang, setLang] = useState<Locale>("ar");
  const summary = buildSummary(draft, lang);

  return (
    <div>
      <label className="block text-[12px] font-semibold text-foreground mb-1">
        الوصف <span className="text-muted-foreground font-normal">(ملخص تلقائي + ملاحظة اختيارية لكل لغة)</span>
      </label>

      <div className="flex gap-1 mb-2" role="tablist">
        {(["ar", "fr", "en"] as Locale[]).map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={lang === l}
            onClick={() => setLang(l)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              lang === l ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {LANG_LABEL[l]}
            {notes[l]?.trim() ? " ●" : ""}
          </button>
        ))}
      </div>

      {/* Auto summary preview — written from the fields above */}
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="p-2.5 mb-2 rounded-md bg-muted/30 border border-dashed border-border text-[11px] leading-5 text-foreground"
      >
        <span className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
          {lang === "ar" ? "الملخص التلقائي (يُكتب من المواصفات)" : lang === "fr" ? "Résumé automatique (généré à partir des caractéristiques)" : "Auto summary (written from the specs)"}
        </span>
        {summary}
      </div>

      <textarea
        rows={2}
        dir={lang === "ar" ? "rtl" : "ltr"}
        value={notes[lang] ?? ""}
        onChange={(e) => onChange({ ...notes, [lang]: e.target.value })}
        placeholder={
          lang === "ar"
            ? "ملاحظة اختيارية بالعربية تظهر تحت الملخص…"
            : lang === "fr"
            ? "Note facultative en français, affichée sous le résumé…"
            : "Optional note in English, shown under the summary…"
        }
        className="w-full p-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
      />
    </div>
  );
}
