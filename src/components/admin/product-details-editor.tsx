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
import { CATEGORY_SPECS, ENUM_VALUES, SPEC_FIELDS } from "@/i18n/specs";
import { buildSummary } from "@/lib/product-summary";
import { inferSpecsFromNotes } from "@/lib/product-utils";
import { Select, inputCls, textareaCls } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT DETAILS EDITOR (admin)
   - the spec fields of the chosen category (structured, not free text)
   - an optional note per language
   - a live preview of the auto summary in Arabic, French and English
   The section titles come from the form that uses them.
   ══════════════════════════════════════════════════════════════════════ */

const LANG_LABEL: Record<Locale, string> = { ar: "العربية", fr: "Français", en: "English" };

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
    <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
      {keys.map((k) => {
        const field = SPEC_FIELDS[k];
        const value = specs[k] ?? "";
        const hint = inferred[k];
        const id = `spec-${k}`;
        return (
          <div key={k}>
            <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-extrabold text-brand-black">{field.label.ar}</span>
              <span dir="ltr" className="truncate text-[11px] font-semibold text-brand-gray">
                {field.label.fr}
              </span>
            </label>
            {field.kind.type === "enum" ? (
              <Select id={id} value={value} onChange={(e) => set(k, e.target.value)}>
                <option value="">—</option>
                {field.kind.options.map((o) => (
                  <option key={o} value={o}>
                    {ENUM_VALUES[o]?.ar ?? o}
                  </option>
                ))}
              </Select>
            ) : (
              <input
                id={id}
                type="text"
                inputMode={field.kind.type === "number" ? "numeric" : undefined}
                dir={field.kind.type === "number" ? "ltr" : "auto"}
                value={value}
                onChange={(e) => set(k, e.target.value)}
                placeholder={hint ? `${hint} (من الملاحظة)` : field.placeholder}
                className={cn(inputCls, field.kind.type === "number" && "text-right")}
              />
            )}
          </div>
        );
      })}
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
    <div className="space-y-3">
      {/* Language tabs — a dot marks a language that has a note */}
      <div className="grid grid-cols-3 border border-brand-line" role="tablist" aria-label="لغة الوصف">
        {(["ar", "fr", "en"] as Locale[]).map((l, i) => {
          const on = lang === l;
          return (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setLang(l)}
              className={cn(
                "flex h-10 items-center justify-center gap-2 text-[13px] font-bold transition-colors",
                i > 0 && "border-s border-brand-line",
                on ? "bg-brand-black text-white" : "bg-white text-brand-gray hover:text-brand-black"
              )}
            >
              {LANG_LABEL[l]}
              {notes[l]?.trim() && <span className="h-1.5 w-1.5 bg-brand-red" aria-label="فيها ملاحظة" />}
            </button>
          );
        })}
      </div>

      {/* Auto summary preview — written from the fields above */}
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="border-s-4 border-brand-black bg-brand-mist px-4 py-3">
        <span className="mb-1 block text-[11px] font-extrabold text-brand-red">
          {lang === "ar"
            ? "الملخص التلقائي (يُكتب من المواصفات)"
            : lang === "fr"
            ? "Résumé automatique (généré à partir des caractéristiques)"
            : "Auto summary (written from the specs)"}
        </span>
        <p className="text-sm leading-7 text-brand-black">{summary}</p>
      </div>

      <textarea
        rows={3}
        dir={lang === "ar" ? "rtl" : "ltr"}
        value={notes[lang] ?? ""}
        onChange={(e) => onChange({ ...notes, [lang]: e.target.value })}
        aria-label={`ملاحظة اختيارية — ${LANG_LABEL[lang]}`}
        placeholder={
          lang === "ar"
            ? "ملاحظة اختيارية بالعربية تظهر تحت الملخص…"
            : lang === "fr"
            ? "Note facultative en français, affichée sous le résumé…"
            : "Optional note in English, shown under the summary…"
        }
        className={textareaCls}
      />
    </div>
  );
}
