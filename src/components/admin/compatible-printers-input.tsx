"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { PrinterBrand, Product } from "@/types/product";
import {
  searchPrinterSuggestions,
  getPrintersByBrand,
  type PrinterSuggestion,
} from "@/data/printers-directory";
import {
  Printer,
  Plus,
  X,
  Search,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface CompatiblePrintersInputProps {
  selectedPrinters: string[];
  onChange: (printers: string[]) => void;
  currentBrand: PrinterBrand;
  existingProducts?: Product[];
  isPrinterCategory?: boolean;
}

export function CompatiblePrintersInput({
  selectedPrinters,
  onChange,
  currentBrand,
  existingProducts = [],
  isPrinterCategory = false,
}: CompatiblePrintersInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute live suggestions
  const suggestions: PrinterSuggestion[] = useMemo(() => {
    return searchPrinterSuggestions(
      inputValue,
      currentBrand,
      existingProducts,
      selectedPrinters
    );
  }, [inputValue, currentBrand, existingProducts, selectedPrinters]);

  // Quick popular chips for current brand (not yet added)
  const popularBrandChips = useMemo(() => {
    const brandPrinters = getPrintersByBrand(currentBrand);
    const set = new Set(selectedPrinters.map((p) => p.toLowerCase().trim()));
    return brandPrinters
      .filter((p) => !set.has(p.toLowerCase().trim()))
      .slice(0, 6);
  }, [currentBrand, selectedPrinters]);

  // Add printer to list
  const addPrinter = (printerName: string) => {
    const trimmed = printerName.trim();
    if (!trimmed) return;

    if (!selectedPrinters.includes(trimmed)) {
      onChange([...selectedPrinters, trimmed]);
    }
    setInputValue("");
    setIsOpen(false);
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  // Remove printer
  const removePrinter = (printerName: string) => {
    onChange(selectedPrinters.filter((p) => p !== printerName));
  };

  // Clear all
  const clearAll = () => {
    if (confirm("هل تريد إزالة جميع الطابعات المتوافقة؟")) {
      onChange([]);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && suggestions.length > 0 && suggestions[activeIndex]) {
        addPrinter(suggestions[activeIndex].name);
      } else if (inputValue.trim()) {
        addPrinter(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* ─── LABEL & STATS ─── */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5 text-primary" />
          <span>
            {isPrinterCategory
              ? "طرازات وموديلات تابعة لهذه الطابعة (اختياري)"
              : "الطابعات المتوافقة مع هذا المنتج"}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {selectedPrinters.length} محددة
          </span>
        </label>

        {selectedPrinters.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-bold text-muted-foreground hover:text-rose-500 transition-colors"
          >
            إزالة الكل
          </button>
        )}
      </div>

      {/* ─── AUTO-SUGGEST INPUT WITH DROPDOWN ─── */}
      <div className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              isPrinterCategory
                ? `اكتب أو اختر طرازات مطابقة (مثال: ${currentBrand} P1102w)...`
                : `ابحث أو اختر من طابعات ${currentBrand} المسجلة في المتجر والدليل...`
            }
            className="w-full h-11 pr-10 pl-24 rounded-xl bg-background border border-border/80 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 pointer-events-none" />

          {/* Add custom button */}
          <div className="absolute left-1.5 flex items-center gap-1">
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setIsOpen(false);
                }}
                className="p-1 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => addPrinter(inputValue)}
              disabled={!inputValue.trim()}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition-all shadow-xs"
            >
              + إضافة
            </button>
          </div>
        </div>

        {/* ─── FLOATING DROPDOWN SUGGESTIONS ─── */}
        {isOpen && (
          <div className="absolute top-full mt-1.5 right-0 w-full max-h-64 overflow-y-auto bg-card border border-border/80 rounded-2xl shadow-2xl z-50 py-1.5 divide-y divide-border/40 animate-in fade-in zoom-in-95 duration-150">
            {/* Header / Brand info */}
            <div className="px-3.5 py-1.5 text-[11px] font-bold text-muted-foreground flex items-center justify-between bg-muted/20">
              <span>طابعات مسجلة في النظام:</span>
              <span className="text-primary font-black uppercase text-[10px]">
                {currentBrand} أولاً
              </span>
            </div>

            {/* Suggestions list */}
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => {
                const isSelected = activeIndex === index;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => addPrinter(item.name)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-right px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/15 text-primary font-bold"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Printer
                        className={`w-3.5 h-3.5 shrink-0 ${
                          item.isFromSelectedBrand
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate font-semibold">{item.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.isPrinterProduct ? (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              طابعة مسجلة كمنتج في المتجر
                              {item.inDatabaseCount > 0 && ` • (${item.inDatabaseCount} مستلزم)`}
                            </span>
                          ) : item.inDatabaseCount > 0 ? (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              في قاعدة البيانات ({item.inDatabaseCount} منتج متوافق)
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              طراز معتمد من دليل {item.brand}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 mr-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isFromSelectedBrand
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.brand}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-foreground/5 group-hover:bg-primary/20 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                لم نجد طابعة مسجلة بهذا الاسم بالضبط.
              </div>
            )}

            {/* Option to add custom new printer name if typed */}
            {inputValue.trim() &&
              !suggestions.some(
                (s) => s.name.toLowerCase() === inputValue.toLowerCase().trim()
              ) && (
                <button
                  type="button"
                  onClick={() => addPrinter(inputValue)}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 flex items-center justify-between border-t border-border/60"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    إضافة &quot;{inputValue.trim()}&quot; كطراز جديد في النظام
                  </span>
                  <span className="text-[10px] bg-primary/20 px-2 py-0.5 rounded-full font-bold">
                    + طراز جديد
                  </span>
                </button>
              )}
          </div>
        )}
      </div>

      {/* ─── QUICK 1-CLICK POPULAR CHIPS (FOR SELECTED BRAND) ─── */}
      {popularBrandChips.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>طابعات شائعة لـ {currentBrand} (اضغط للإضافة فوراً):</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {popularBrandChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addPrinter(chip)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-card border border-border/70 text-foreground/80 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3 h-3 text-primary shrink-0" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── SELECTED TAGS PREVIEW ─── */}
      <div className="min-h-14 p-3 bg-muted/20 rounded-2xl border border-border/60 max-h-40 overflow-y-auto space-y-1">
        {selectedPrinters.length === 0 ? (
          <div className="flex items-center justify-center py-2 text-center text-xs text-muted-foreground/70 gap-1.5">
            <Printer className="w-4 h-4 opacity-40" />
            <span>
              لم تختر طابعات بعد. اختر من القائمة المقترحة أو اكتب واضغط إضافة.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedPrinters.map((pr) => (
              <span
                key={pr}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-card text-foreground border border-primary/30 shadow-2xs group transition-all"
              >
                <Printer className="w-3 h-3 text-primary shrink-0" />
                <span className="font-bold text-xs">{pr}</span>
                <button
                  type="button"
                  onClick={() => removePrinter(pr)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-rose-500 transition-colors cursor-pointer text-[11px] mr-1"
                  title={`إزالة ${pr}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
