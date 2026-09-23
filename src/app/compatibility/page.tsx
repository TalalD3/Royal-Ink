"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Printer,
  Sparkles,
  Phone,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  Filter,
  Package,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  MessageCircle,
  Check,
} from "lucide-react";
import type { Product, ProductCategory, PrinterBrand } from "@/types/product";
import { CATEGORIES_CONFIG, SUPPORTED_BRANDS } from "@/types/product";
import { initialProducts } from "@/data/initial-products";

export default function CompatibilityPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isBrandFilterOpen, setIsBrandFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const toggleCardExpand = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickViewProduct(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setProducts(json.data);
        }
      } catch (err) {
        console.warn("Using fallback initial products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Unique printers available in current catalog
  const availablePrinters = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      (p.compatiblePrinters || []).forEach((pr) => {
        if (pr.trim()) set.add(pr.trim());
      });
    });
    return Array.from(set).sort();
  }, [products]);

  // Live search suggestions dropdown items (Bidirectional: Printers ⇄ Inks/Toners)
  const searchDropdownItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) {
      // 4 popular printers
      const topPrinters = availablePrinters.slice(0, 4).map((printer) => {
        const count = products.filter((p) =>
          (p.compatiblePrinters || []).includes(printer)
        ).length;
        return {
          title: printer,
          subtitle: `${count} خراطيش وأحبار متوافقة مع هذا الموديل`,
          type: "printer" as const,
        };
      });

      // 4 popular ink / toner cartridges
      const topProducts = products
        .filter((p) => p.category !== "printer")
        .slice(0, 4)
        .map((p) => ({
          title: p.name,
          subtitle: p.sku
            ? `رمز: ${p.sku} — يعمل مع ${(p.compatiblePrinters || []).length} طابعات`
            : `متوافق مع ${(p.compatiblePrinters || []).length} طابعات`,
          type: "product" as const,
        }));

      return [...topPrinters, ...topProducts];
    }

    const matchedPrinters = availablePrinters
      .filter((pr) => pr.toLowerCase().includes(q))
      .slice(0, 5)
      .map((printer) => {
        const count = products.filter((p) =>
          (p.compatiblePrinters || []).includes(printer)
        ).length;
        return {
          title: printer,
          subtitle: `${count} حبر وخرطوشة متوافقة — انقر لمعرفتها`,
          type: "printer" as const,
        };
      });

    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((p) => ({
        title: p.name,
        subtitle:
          p.category === "printer"
            ? "طابعة أصلية معتمدة — انقر لمعرفة أحبارها"
            : `رمز: ${p.sku || p.brand} — يدعم ${(p.compatiblePrinters || []).length} طابعات (انقر لمعرفة أين يُستخدم)`,
        type: p.category === "printer" ? ("printer" as const) : ("product" as const),
      }));

    return [...matchedPrinters, ...matchedProducts];
  }, [searchQuery, availablePrinters, products]);

  // Detect whether search query is targeting a printer, a cartridge/product, or both
  const searchIntent = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const isPrinterQuery = availablePrinters.some((pr) =>
      pr.toLowerCase().includes(q)
    );
    const isProductQuery = products.some(
      (p) =>
        p.category !== "printer" &&
        (p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)))
    );

    if (isPrinterQuery && !isProductQuery) return "printer";
    if (isProductQuery && !isPrinterQuery) return "product";
    return "both";
  }, [searchQuery, availablePrinters, products]);

  // Filtered Products (True Bidirectional Compatibility Matching)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;

      // Brand Filter (multi-select: if any brands selected, must match one)
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

      // Category Filter (multi-select: if any categories selected, must match one)
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;

      // Bidirectional Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = (p.sku || "").toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesNotes = (p.notes || "").toLowerCase().includes(q);

        // 1. Matches compatible printers of this cartridge
        const matchesPrinter = (p.compatiblePrinters || []).some((pr) =>
          pr.toLowerCase().includes(q)
        );

        // 2. If this product is a printer, is it supported by any matching toner/ink?
        const isPrinterSupportedByMatchingToner =
          p.category === "printer" &&
          products.some((other) => {
            if (other.category === "printer" || !other.isActive) return false;
            const otherMatches =
              other.name.toLowerCase().includes(q) ||
              (other.sku || "").toLowerCase().includes(q);
            return (
              otherMatches &&
              (other.compatiblePrinters || []).some(
                (pr) =>
                  pr.toLowerCase().includes(p.name.toLowerCase()) ||
                  p.name.toLowerCase().includes(pr.toLowerCase())
              )
            );
          });

        return (
          matchesName ||
          matchesSku ||
          matchesBrand ||
          matchesNotes ||
          matchesPrinter ||
          isPrinterSupportedByMatchingToner
        );
      }

      return true;
    });
  }, [products, selectedBrands, selectedCategories, searchQuery]);

  return (
    <div className="flex flex-col bg-background min-h-screen w-full overflow-x-clip" dir="rtl">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — SMART PRINTER COMPATIBILITY SEARCH
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 border-b border-border/50 z-40">
        {/* ── Top Hero Hardware Image Layer with Smooth Fade Down ── */}
        <div className="absolute inset-x-0 top-0 h-[560px] md:h-[660px] lg:h-[720px] pointer-events-none select-none z-0 overflow-hidden">
          {/* Hardware Showcase Image (Printers, Toners, Inks) */}
          <img
            src="/images/hero-printers-supplies.jpg"
            alt="طابعات، خراطيش تونر، وعبوات حبر روايال إنك"
            className="w-full h-full object-cover object-[center_65%] opacity-95 dark:opacity-85"
            loading="eager"
          />

          {/* Ambient red gradient overlay — preserves the signature red atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-primary/10 to-transparent pointer-events-none mix-blend-multiply dark:mix-blend-overlay" />

          {/* Ambient background glow orbs — securely contained inside overflow-hidden to prevent mobile scroll */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Smooth Fade Down — Keeps printer visible at the top while dissolving down for texts */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 20%, hsl(var(--background) / 0.2) 36%, hsl(var(--background) / 0.65) 54%, hsl(var(--background) / 0.92) 74%, hsl(var(--background)) 90%, hsl(var(--background)) 100%)",
            }}
          />

          {/* Top subtle header shadow fade */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/30 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mb-6 bg-background/80 dark:bg-card/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-border/60 shadow-xs"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span className="text-foreground font-semibold">
              دليل توافق الطابعات والمنتجات
            </span>
          </motion.div>

          {/* Section Tag Badge */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-primary bg-background/90 dark:bg-card/90 border border-primary/30 rounded-full px-4 py-1.5 mb-5 backdrop-blur-md shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              محرك البحث الذكي عن التوافق
            </motion.div>
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5"
          >
            ابحث عن{" "}
            <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">
              طابعتك أو حبرك
            </span>{" "}
            واكتشف التوافق الكامل بينهما
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-black dark:text-white font-semibold max-w-2xl mx-auto leading-relaxed mb-6"
          >
            محرك توافق شامل في الاتجاهين: أدخل موديل أي طابعة لعرض خراطيش الحبر والتونر المتوافقة معها، أو اكتب رمز الحبر والخرطوشة (مثل: 85A, 05A, 59A, 103...) لمعرفة الطابعات المتوافقة معها وأين يمكنك استخدامها.
          </motion.p>

          {/* ─── SEARCH INPUT BOX WITH AUTO-SUGGEST DROPDOWN ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            ref={searchContainerRef}
            className="relative max-w-2xl mx-auto mb-5 z-50"
          >
            <div className="relative flex items-center bg-card border-2 border-primary/30 hover:border-primary/60 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 rounded-2xl shadow-xl shadow-black/5 transition-all p-1.5 z-20">
              <Search className="w-5 h-5 text-primary mr-3 ml-2 pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="ابحث بموديل طابعة (مثل: HP M404, LBP6030) أو برمز حبر/خرطوشة (مثل: 85A, 05A, 59A, 103)..."
                className="w-full h-12 bg-transparent text-sm md:text-base text-foreground focus:outline-none placeholder:text-muted-foreground/60 px-2"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="px-3 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  مسح
                </button>
              )}
            </div>


            {/* ─── FLOATING AUTO-SUGGEST DROPDOWN ─── */}
            {isSearchOpen && (
              <div className="absolute top-full mt-2 right-0 w-full bg-card border border-border/80 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 divide-y divide-border/40 animate-in fade-in zoom-in-95 duration-150 text-right">
                <div className="px-4 py-1.5 text-[11px] font-bold text-muted-foreground bg-muted/20 flex items-center justify-between">
                  <span>
                    {searchQuery
                      ? "اقتراحات مطابقة من الكتالوج (طابعات وأحبار):"
                      : "أكثر الطابعات وخراطيش الحبر بحثاً في الكتالوج:"}
                  </span>
                  <span className="text-[10px] text-primary font-bold">
                    {searchDropdownItems.length} اقتراح
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
                  {searchDropdownItems.length > 0 ? (
                    searchDropdownItems.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.title);
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 hover:bg-primary/10 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {item.type === "printer" ? (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Printer className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {item.title}
                              </h5>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                                  item.type === "printer"
                                    ? "bg-primary/15 text-primary"
                                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {item.type === "printer" ? "طابعة" : "حبر / خرطوشة"}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity mr-2 shrink-0">
                          اختر ↵
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      لا يوجد طراز مطابق تماماً لما كتبت، لكن تتوفر أحبار لجميع الطابعات عبر الاتصال بنا.
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FILTERS SECTION (DESKTOP: PILLS ROWS | MOBILE: BUTTON CARDS)
          NON-STICKY (NORMAL DOCUMENT FLOW)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-4 border-b border-border/40 bg-muted/10 relative z-20">
        <div className="container mx-auto px-4 space-y-3.5">
          {/* ── DESKTOP FILTER PILLS (Visible on md and larger) ── */}
          <div className="hidden md:flex flex-col gap-3">
            {/* Row 1: Brands Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground ml-2 shrink-0">
                العلامة التجارية:
              </span>
              <button
                type="button"
                onClick={() => setSelectedBrands([])}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedBrands.length === 0
                    ? "bg-primary text-white shadow-xs"
                    : "bg-card border border-border/70 text-foreground hover:bg-muted"
                }`}
              >
                جميع العلامات ({products.length})
              </button>
              {SUPPORTED_BRANDS.map((brand) => {
                const count = products.filter((p) => p.brand === brand).length;
                if (count === 0) return null;
                const isSelected = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() =>
                      setSelectedBrands((prev) =>
                        prev.includes(brand)
                          ? prev.filter((b) => b !== brand)
                          : [...prev, brand]
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "bg-card border border-border/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{brand}</span>
                    <span className="mr-1 text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Categories / Product Types Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
              <span className="text-xs font-bold text-muted-foreground ml-2 shrink-0">
                التصنيف والنوع:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategories.length === 0
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-card border border-border/70 text-foreground hover:bg-muted"
                }`}
              >
                الكل ({products.length})
              </button>
              {(Object.keys(CATEGORIES_CONFIG) as ProductCategory[]).map((catKey) => {
                const cat = CATEGORIES_CONFIG[catKey];
                const count = products.filter((p) => p.category === catKey).length;
                if (count === 0) return null;
                const isSelected = selectedCategories.includes(catKey);
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(catKey)
                          ? prev.filter((c) => c !== catKey)
                          : [...prev, catKey]
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-card border border-border/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.labelAr}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── MOBILE FILTER BUTTONS (Visible on mobile screens < md) ── */}
          <div className="flex md:hidden flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Brands Filter Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setIsBrandFilterOpen(true);
                  setIsCategoryFilterOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedBrands.length > 0
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-card border-border hover:bg-muted text-foreground"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {selectedBrands.length === 0
                    ? "العلامة (الكل)"
                    : `العلامات: (${selectedBrands.length})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Type / Category Filter Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCategoryFilterOpen(true);
                  setIsBrandFilterOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategories.length > 0
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-card border-border hover:bg-muted text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {selectedCategories.length === 0
                    ? "النوع (الكل)"
                    : `الأنواع: (${selectedCategories.length})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Quick Reset button if any filter is active */}
              {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedCategories([]);
                  }}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors px-2 py-1 cursor-pointer"
                >
                  إعادة ضبط ✕
                </button>
              )}
            </div>

            {/* Mobile Results Count */}
            <div className="text-xs font-bold text-muted-foreground">
              <span>{filteredProducts.length} من {products.length}</span>
            </div>
          </div>

          {/* Active selection chips (dismissible) */}
          {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/40 mt-3">
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                الفلاتر المحددة:
              </span>
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold border border-primary/20"
                >
                  <span>{brand}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBrands((prev) => prev.filter((b) => b !== brand))}
                    className="hover:text-red-700 cursor-pointer font-extrabold text-xs"
                    title={`إلغاء تصفية ${brand}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedCategories.map((catKey) => (
                <span
                  key={catKey}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-foreground/10 text-foreground text-[11px] font-bold border border-border"
                >
                  <span>{CATEGORIES_CONFIG[catKey as ProductCategory]?.labelAr || catKey}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== catKey))}
                    className="hover:text-red-600 cursor-pointer font-extrabold text-xs"
                    title="إلغاء التصفية"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Brand Filter Selection Card Modal (Multi-select) ── */}
      <AnimatePresence>
        {isBrandFilterOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={() => setIsBrandFilterOpen(false)}
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">تصفية حسب العلامة التجارية</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBrandFilterOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selection helper actions */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {selectedBrands.length === 0
                    ? "جميع العلامات معروضة حالياً"
                    : `${selectedBrands.length} علامات محددة`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBrands([])}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    عرض الكل
                  </button>
                  {selectedBrands.length > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBrands([])}
                        className="text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                      >
                        مسح التحديد
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Brands Selection Grid */}
              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-60 p-1">
                {SUPPORTED_BRANDS.map((brand) => {
                  const count = products.filter((p) => p.brand === brand).length;
                  const isChecked = selectedBrands.includes(brand);

                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setSelectedBrands((prev) =>
                          prev.includes(brand)
                            ? prev.filter((b) => b !== brand)
                            : [...prev, brand]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        isChecked
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-muted/30 border-border/60 hover:bg-muted/60 text-foreground font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? "bg-primary border-primary text-white"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs uppercase">{brand}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedBrands([])}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                >
                  إعادة ضبط
                </button>
                <button
                  type="button"
                  onClick={() => setIsBrandFilterOpen(false)}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  تم ({selectedBrands.length === 0 ? "الكل" : selectedBrands.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Type / Category Filter Selection Card Modal (Multi-select) ── */}
      <AnimatePresence>
        {isCategoryFilterOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={() => setIsCategoryFilterOpen(false)}
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">تصفية حسب نوع المنتج</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryFilterOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selection helper actions */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {selectedCategories.length === 0
                    ? "جميع الأنواع معروضة حالياً"
                    : `${selectedCategories.length} أنواع محددة`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    عرض الكل
                  </button>
                  {selectedCategories.length > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className="text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                      >
                        مسح التحديد
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Categories Selection List */}
              <div className="space-y-2 overflow-y-auto max-h-64 p-1">
                {(Object.keys(CATEGORIES_CONFIG) as ProductCategory[]).map((catKey) => {
                  const cat = CATEGORIES_CONFIG[catKey];
                  const count = products.filter((p) => p.category === catKey).length;
                  const isChecked = selectedCategories.includes(catKey);

                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(catKey)
                            ? prev.filter((c) => c !== catKey)
                            : [...prev, catKey]
                        );
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        isChecked
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-muted/30 border-border/60 hover:bg-muted/60 text-foreground font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? "bg-primary border-primary text-white"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-xs font-semibold">{cat.labelAr}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border/50 tabular-nums">
                        {count} منتج
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                >
                  إعادة ضبط
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryFilterOpen(false)}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  تم ({selectedCategories.length === 0 ? "الكل" : selectedCategories.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          SEARCH RESULTS & PRODUCTS GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          {/* Results Counter & Reset */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                نتائج التوافق:
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {filteredProducts.length} منتج متوافق
              </span>
            </div>

            {(searchQuery || selectedBrands.length > 0 || selectedCategories.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBrands([]);
                  setSelectedCategories([]);
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                إعادة ضبط عوامل البحث ✕
              </button>
            )}
          </div>

          {/* Smart Bidirectional Search Intent Banner */}
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right shadow-xs ${
                searchIntent === "printer"
                  ? "bg-primary/5 border-primary/25"
                  : searchIntent === "product"
                  ? "bg-blue-500/5 border-blue-500/25"
                  : "bg-muted/50 border-border"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {searchIntent === "printer" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                      <Printer className="w-3.5 h-3.5" />
                      <span>بحث عن طابعة: {searchQuery}</span>
                    </span>
                  ) : searchIntent === "product" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                      <Package className="w-3.5 h-3.5" />
                      <span>بحث عن حبر / خرطوشة: {searchQuery}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-foreground bg-muted px-2.5 py-0.5 rounded-md">
                      <Search className="w-3.5 h-3.5" />
                      <span>بحث شامل عن: {searchQuery}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-sm md:text-base font-extrabold text-foreground">
                  {searchIntent === "printer"
                    ? `الأحبار، خراطيش التونر، ومستلزمات الطباعة المتوافقة تماماً مع طابعة "${searchQuery}":`
                    : searchIntent === "product"
                    ? `المنتج "${searchQuery}" — قائمة الطابعات والأجهزة المتوافقة ومواصفات الخرطوشة:`
                    : `نتائج التوافق المتبادل لـ "${searchQuery}" (طابعات وأحبار):`}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {searchIntent === "printer"
                    ? "تظهر لك أدناه جميع الخراطيش والقطع التي تركب على هذا الموديل وتعمل معه بنجاح."
                    : searchIntent === "product"
                    ? "تظهر لك أدناه الطابعات والأجهزة التي تستخدم هذا الحبر وأين يمكنك استخدامه."
                    : "تصفح الخيارات المطابقة وتأكد من توافق طابعتك ومستلزماتها."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="self-start sm:self-center px-4 py-1.5 rounded-xl bg-background text-foreground hover:bg-muted border border-border text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                عرض كل الكتالوج ✕
              </button>
            </motion.div>
          )}

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-card border border-dashed border-border/80 rounded-3xl p-8 max-w-xl mx-auto">
              <Printer className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">
                لم نعثر على نتيجة مطابقة لـ &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                تتوفر لدينا خراطيش وأحبار لجميع الطابعات حتى وإن لم تكن مسجلة في القائمة حالياً.
                تواصل مع خبرائنا في Royal Ink وسنوفر لك الحبر المناسب فوراً.
              </p>
              <a
                href="tel:+213666509941"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Phone className="w-4 h-4" />
                <span>اتصل بنا هاتفياً للاستفسار فوراً</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {filteredProducts.map((product) => {
                const catMeta =
                  CATEGORIES_CONFIG[product.category] || CATEGORIES_CONFIG.toner;
                const isExpanded = expandedCardIds.has(product.id);

                return (
                  <div
                    key={product.id}
                    className="group bg-card border border-border/70 hover:border-primary/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Top Image: Responsive Container (Compact on phone, square on tablet/desktop) */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      className="relative h-48 sm:h-56 md:aspect-square w-full bg-neutral-100 dark:bg-neutral-900 p-4 flex items-center justify-center overflow-hidden border-b border-border/40 cursor-pointer"
                      title="انقر للتكبير وعرض التفاصيل السريعة"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2 select-none">
                          <span className="text-3xl">{catMeta.icon}</span>
                          <span className="text-xs font-bold text-foreground/40">
                            {product.brand}
                          </span>
                        </div>
                      )}

                      {/* Brand & Category Badges */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-md bg-neutral-900/85 text-white shadow-xs uppercase backdrop-blur-xs">
                          {product.brand}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-xs ${catMeta.badgeClass}`}
                        >
                          {catMeta.labelAr}
                        </span>
                      </div>

                      {/* Quick view hover indicator */}
                      <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-neutral-900/80 text-white backdrop-blur-xs shadow-xs">
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body: Name + Show More Button */}
                    <div className="p-4 flex flex-col justify-between gap-3">
                      <h3
                        onClick={() => toggleCardExpand(product.id)}
                        className="text-sm md:text-base font-bold text-foreground leading-snug line-clamp-2 min-h-[2.5rem] flex items-center group-hover:text-primary transition-colors cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Bidirectional Usage Snippet: Where Can I Use It? / Compatible Printers */}
                      {product.category === "printer" ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-right">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="flex items-center gap-1">
                              <Printer className="w-3.5 h-3.5 text-emerald-600" />
                              <span>طابعة أصلية معتمدة</span>
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                              متوفرة للطلب
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                            {product.notes || "انقر لمعرفة خراطيش الحبر المتوافقة مع هذا الموديل"}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-muted/40 border border-border/60 rounded-xl p-2.5 text-right space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1 text-primary">
                              <Printer className="w-3.5 h-3.5" />
                              <span>أين يُستخدم؟ (الطابعات المتوافقة):</span>
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              ({(product.compatiblePrinters || []).length})
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {(product.compatiblePrinters || []).slice(0, 2).map((pr, idx) => {
                              const isMatch =
                                searchQuery.trim() &&
                                pr.toLowerCase().includes(searchQuery.toLowerCase().trim());
                              return (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                                    isMatch
                                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold border border-amber-500/40"
                                      : "bg-background text-foreground/85 border border-border/50"
                                  }`}
                                >
                                  {pr}
                                </span>
                              );
                            })}
                            {(product.compatiblePrinters || []).length > 2 && (
                              <span className="text-[10px] text-muted-foreground font-semibold self-center">
                                +{(product.compatiblePrinters || []).length - 2} موديلات...
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show More / Details Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleCardExpand(product.id)}
                        className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isExpanded
                            ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 hover:border-primary"
                        }`}
                      >
                        <span>{isExpanded ? "إخفاء التفاصيل" : "المزيد من التفاصيل"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Expandable Details Section */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-border/40 bg-muted/20"
                        >
                          <div className="p-4 space-y-3 text-right">
                            {/* SKU / Code if present */}
                            {product.sku && (
                              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/40">
                                <span className="text-muted-foreground font-medium">رمز الخرطوشة:</span>
                                <span className="font-mono font-bold px-2 py-0.5 rounded bg-background border border-border/60 text-foreground">
                                  {product.sku}
                                </span>
                              </div>
                            )}

                            {/* Compatible Printers Section */}
                            {product.category === "printer" ? (
                              <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                  <span className="flex items-center gap-1.5">
                                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>طابعة أصلية معتمدة</span>
                                  </span>
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                    متوفرة للطلب
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(product.name);
                                    setSelectedCategories([]);
                                  }}
                                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🔍 عرض خراطيش الحبر المتوافقة معها</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <Printer className="w-3.5 h-3.5 text-primary" />
                                    <span>الطابعات المتوافقة:</span>
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    ({(product.compatiblePrinters || []).length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                                  {(product.compatiblePrinters || []).map((printer, i) => {
                                    const isMatch =
                                      searchQuery.trim() &&
                                      printer.toLowerCase().includes(searchQuery.toLowerCase().trim());

                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSearchQuery(printer)}
                                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer text-right ${
                                          isMatch
                                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 ring-2 ring-amber-500/20"
                                            : "bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/60"
                                        }`}
                                      >
                                        {printer}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Notes / Page yield */}
                            {product.notes && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                                {product.notes}
                              </p>
                            )}

                            {/* Actions: Call / Inquire & Quick View */}
                            <div className="pt-2 flex flex-col gap-2">
                              <a
                                href="tel:+213666509941"
                                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>طلب المنتج أو الاستفسار</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => setQuickViewProduct(product)}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-semibold border border-border transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>عرض في نافذة مكبرة</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DIRECT ASSISTANCE BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="p-8 md:p-12 rounded-3xl bg-card border border-border/70 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              هل تبحث عن حبر أو قطعة لطابعة خاصة؟
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              نوفر جميع المستلزمات لخراطيش الحبر، عبوات الحبر السائل، وقطع الغيار
              لمختلف الطابعات الكبيرة والمكتبية. اتصل بفريق الدعم أو تفضل بزيارة نقاط البيع المعتمدة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="tel:+213666509941"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs md:text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Phone className="w-4 h-4" />
                <span>+213 666 50 99 41</span>
              </a>
              <Link
                href="/find-us"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs md:text-sm font-bold transition-all border border-border/70"
              >
                <span>خريطة نقاط البيع المعتمدة</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCT DETAILS MODAL (QUICK VIEW)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {quickViewProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-hidden"
            onClick={() => setQuickViewProduct(null)}
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card border border-border rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Floating & Tap-friendly */}
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 rounded-full bg-background/90 text-muted-foreground hover:text-foreground hover:bg-background border border-border/80 backdrop-blur-md shadow-sm flex items-center justify-center transition-all cursor-pointer z-20"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
                  {/* Product Image - Responsive height for phones */}
                  <div className="relative h-44 sm:h-56 md:h-auto md:aspect-square w-full bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4 sm:p-6 flex items-center justify-center border border-border/60 overflow-hidden shrink-0">
                    {quickViewProduct.imageUrl ? (
                      <img
                        src={quickViewProduct.imageUrl}
                        alt={quickViewProduct.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2 select-none">
                        <span className="text-4xl sm:text-5xl">
                          {(CATEGORIES_CONFIG[quickViewProduct.category] || CATEGORIES_CONFIG.toner).icon}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground/40">
                          {quickViewProduct.brand}
                        </span>
                      </div>
                    )}

                    {/* SKU Badge */}
                    {quickViewProduct.sku && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-background/95 text-foreground border border-border/60 shadow-xs">
                          {quickViewProduct.sku}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info & Details */}
                  <div className="space-y-3.5 flex flex-col justify-between">
                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-md bg-neutral-900 text-white uppercase">
                        {quickViewProduct.brand}
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                          (CATEGORIES_CONFIG[quickViewProduct.category] || CATEGORIES_CONFIG.toner).badgeClass
                        }`}
                      >
                        {(CATEGORIES_CONFIG[quickViewProduct.category] || CATEGORIES_CONFIG.toner).labelAr}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
                      {quickViewProduct.name}
                    </h3>

                    {/* Compatible Printers */}
                    {quickViewProduct.category === "printer" ? (
                      <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <Printer className="w-4 h-4 text-emerald-600" />
                            <span>طابعة أصلية معتمدة</span>
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            متوفرة للطلب
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery(quickViewProduct.name);
                            setSelectedCategories([]);
                            setQuickViewProduct(null);
                          }}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>🔍 البحث عن الأحبار المتوافقة مع هذه الطابعة</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5 text-primary" />
                            <span>الطابعات المتوافقة:</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            ({(quickViewProduct.compatiblePrinters || []).length} موديل)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 sm:max-h-40 overflow-y-auto p-1.5 bg-muted/30 rounded-xl border border-border/50">
                          {(quickViewProduct.compatiblePrinters || []).map((printer, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSearchQuery(printer);
                                setQuickViewProduct(null);
                              }}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-background text-foreground hover:bg-primary hover:text-white border border-border/60 transition-colors cursor-pointer"
                              title="انقر لتصفية المنتجات المتوافقة"
                            >
                              {printer}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {quickViewProduct.notes && (
                      <div className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/40">
                        {quickViewProduct.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer - Sticky Call & WhatsApp Actions */}
              <div className="p-3 sm:p-4 border-t border-border bg-card/95 backdrop-blur-xs flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <a
                  href="tel:+213666509941"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال مباشر: 0666509941</span>
                </a>
                <a
                  href={`https://wa.me/213666509941?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن المنتج: ${quickViewProduct.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>طلب عبر واتساب</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
