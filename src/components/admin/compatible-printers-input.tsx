"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { PrinterBrand, Product } from "@/types/product";
import {
  searchPrinterSuggestions,
  getPrintersByBrand,
  type PrinterSuggestion,
} from "@/data/printers-directory";
import { Printer, Plus, X, Search } from "lucide-react";
import { inputCls } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4" ref={containerRef}>
      {/* ─── Search + add ─── */}
      <div className="relative">
        <div className="flex">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
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
              aria-label={isPrinterCategory ? "طرازات تابعة لهذه الطابعة" : "الطابعات المتوافقة"}
              placeholder={
                isPrinterCategory
                  ? `مثال: ${currentBrand} P1102w`
                  : `ابحث في طابعات ${currentBrand} والدليل…`
              }
              className={cn(inputCls, "ps-10 pe-9")}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setIsOpen(false);
                }}
                aria-label="مسح"
                className="absolute end-1 top-1/2 flex h-9 w-8 -translate-y-1/2 items-center justify-center text-brand-gray hover:text-brand-black"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => addPrinter(inputValue)}
            disabled={!inputValue.trim()}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 bg-brand-black px-4 text-sm font-bold text-white transition-colors hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            إضافة
          </button>
        </div>

        {/* ─── Suggestions ─── */}
        {isOpen && (
          <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-y-auto border border-brand-black bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-brand-line bg-brand-mist px-4 py-2 text-[11px] font-bold text-brand-gray">
              <span>طابعات مسجلة في الدليل</span>
              <span dir="ltr" className="font-extrabold text-brand-red">
                {currentBrand}
              </span>
            </div>

            {suggestions.length > 0 ? (
              suggestions.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => addPrinter(item.name)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-brand-line px-4 py-2.5 text-start transition-colors last:border-b-0",
                      isActive ? "bg-brand-black text-white" : "bg-white text-brand-black"
                    )}
                  >
                    <Printer
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-white" : item.isFromSelectedBrand ? "text-brand-red" : "text-brand-gray"
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span dir="ltr" className="block truncate text-start text-sm font-bold">
                        {item.name}
                      </span>
                      <span className={cn("mt-0.5 block text-[11px]", isActive ? "text-white/65" : "text-brand-gray")}>
                        {item.isPrinterProduct
                          ? `طابعة مسجلة كمنتج${item.inDatabaseCount > 0 ? ` · ${item.inDatabaseCount} مستلزم` : ""}`
                          : item.inDatabaseCount > 0
                          ? `${item.inDatabaseCount} منتج متوافق في الكتالوج`
                          : `طراز من دليل ${item.brand}`}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 px-2 py-1 text-[10px] font-extrabold",
                        isActive
                          ? "bg-brand-red text-white"
                          : item.isFromSelectedBrand
                          ? "bg-brand-black text-white"
                          : "bg-brand-mist text-brand-gray"
                      )}
                    >
                      {item.brand}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-4 text-center text-xs text-brand-gray">لم نجد طابعة مسجلة بهذا الاسم بالضبط.</p>
            )}

            {inputValue.trim() &&
              !suggestions.some(
                (s) => s.name.toLowerCase() === inputValue.toLowerCase().trim()
              ) && (
                <button
                  type="button"
                  onClick={() => addPrinter(inputValue)}
                  className="flex w-full items-center gap-2 border-t border-brand-line px-4 py-3 text-start text-sm font-bold text-brand-red hover:bg-brand-mist"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">
                    إضافة «<span dir="ltr">{inputValue.trim()}</span>» كطراز جديد
                  </span>
                </button>
              )}
          </div>
        )}
      </div>

      {/* ─── Popular models of the brand, one click to add (not once a
          printer has its model — another model is not one of its names) ─── */}
      {popularBrandChips.length > 0 && !(isPrinterCategory && selectedPrinters.length > 0) && (
        <div>
          <p className="mb-2 text-xs font-bold text-brand-gray">
            طابعات شائعة من <span dir="ltr">{currentBrand}</span> — اضغط للإضافة:
          </p>
          <div className="flex flex-wrap gap-2">
            {popularBrandChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addPrinter(chip)}
                className="inline-flex items-center gap-1.5 border border-brand-line bg-white px-2.5 py-1.5 text-xs font-bold text-brand-black transition-colors hover:border-brand-red hover:text-brand-red"
              >
                <Plus className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span dir="ltr">{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Selected ─── */}
      <div className="border border-brand-line">
        <div className="flex items-center justify-between gap-3 border-b border-brand-line bg-brand-mist px-4 py-2.5">
          <span className="text-[13px] font-extrabold text-brand-black">
            المحددة <span className="ms-1 bg-brand-black px-1.5 py-0.5 text-[11px] text-white tabular-nums">{selectedPrinters.length}</span>
          </span>
          {selectedPrinters.length > 0 && (
            <button type="button" onClick={clearAll} className="text-xs font-bold text-brand-red hover:underline">
              إزالة الكل
            </button>
          )}
        </div>
        <div className="max-h-44 overflow-y-auto p-3">
          {selectedPrinters.length === 0 ? (
            <p className="py-2 text-center text-xs leading-5 text-brand-gray">
              لم تختر طابعات بعد. اختر من الاقتراحات أو اكتب الطراز واضغط «إضافة».
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedPrinters.map((pr) => (
                <span
                  key={pr}
                  className="inline-flex items-center gap-2 bg-brand-black py-1 pe-1 ps-2.5 text-xs font-bold text-white"
                >
                  <span dir="ltr">{pr}</span>
                  <button
                    type="button"
                    onClick={() => removePrinter(pr)}
                    aria-label={`إزالة ${pr}`}
                    title={`إزالة ${pr}`}
                    className="flex h-5 w-5 items-center justify-center text-white/70 transition-colors hover:bg-brand-red hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
