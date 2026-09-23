"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Product, ProductCategory, PrinterBrand, ProductColor } from "@/types/product";
import { CATEGORIES_CONFIG, SUPPORTED_BRANDS } from "@/types/product";
import { initialProducts } from "@/data/initial-products";
import { ImageCropperModal } from "@/components/ui/image-cropper-modal";
import {
  exportProductsToExcel,
  downloadProductsTemplate,
  parseProductsExcel,
} from "@/lib/excel/products-excel";
import { CompatiblePrintersInput } from "./compatible-printers-input";
import {
  Plus,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Printer,
  Loader2,
  Check,
  FileDown,
  ChevronDown,
  Eye,
  EyeOff,
  MoreHorizontal,
  AlertTriangle,
  Layers,
} from "lucide-react";

/* ─── CATEGORY ICON IMAGES ─── */
const CATEGORY_ICONS: Record<ProductCategory, string> = {
  printer: "", // uses Lucide <Printer />
  toner: "/images/icon-toner.png",
  ink: "/images/icon-ink.png",
  drum_unit: "/images/icon-drum.jpg",
  spare_parts: "", // uses Lucide
};

/* ─── CATEGORY SHORT LABELS ─── */
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  printer: "طابعة",
  toner: "تونر",
  ink: "حبر سائل",
  drum_unit: "درام",
  spare_parts: "قطع غيار",
};

export function AdminProductsManager() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Floating Card / Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Product Form Fields
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState<PrinterBrand>("HP");
  const [formCategory, setFormCategory] = useState<ProductCategory>("toner");
  const [formSku, setFormSku] = useState("");
  const [formColor, setFormColor] = useState<ProductColor>("black");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCompatiblePrinters, setFormCompatiblePrinters] = useState<string[]>([]);
  const [printerInput, setPrinterInput] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Image Cropper States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Excel Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    products: Omit<Product, "id">[];
    total: number;
    errors: string[];
  } | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Clear catalog confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal for Create
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("HP");
    setFormCategory("toner");
    setFormSku("");
    setFormColor("black");
    setFormImageUrl("");
    setFormCompatiblePrinters([]);
    setPrinterInput("");
    setFormNotes("");
    setFormIsActive(true);
    setModalError("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormSku(p.sku || "");
    setFormColor(p.color || "black");
    setFormImageUrl(p.imageUrl || "");
    setFormCompatiblePrinters([...(p.compatiblePrinters || [])]);
    setPrinterInput("");
    setFormNotes(p.notes || "");
    setFormIsActive(p.isActive);
    setModalError("");
    setIsModalOpen(true);
  };

  // Add a printer model tag
  const handleAddPrinterTag = () => {
    const trimmed = printerInput.trim();
    if (!trimmed) return;
    const parts = trimmed
      .split(/[,،;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setFormCompatiblePrinters((prev) => {
      const set = new Set([...prev, ...parts]);
      return Array.from(set);
    });
    setPrinterInput("");
  };

  const handleRemovePrinterTag = (printerName: string) => {
    setFormCompatiblePrinters((prev) => prev.filter((p) => p !== printerName));
  };

  // Handle image file selection
  const handleSelectImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropperOpen(true);
      // Reset input value so same file can be reselected
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Handle cropped image complete
  const handleCropComplete = async (blob: Blob, previewUrl: string) => {
    // Show preview immediately
    setFormImageUrl(previewUrl);
    setUploadingImage(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("جلسة العمل منتهية");

      const formData = new FormData();
      formData.append("file", blob, "cropped-product.webp");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (json.url) {
        setFormImageUrl(json.url);
      }
    } catch (err) {
      console.warn("Could not upload to Supabase storage, keeping local preview URL:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Product (Insert or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("يرجى إدخال اسم المنتج.");
      return;
    }

    setSubmitting(true);
    setModalError("");

    const payload = {
      name: formName.trim(),
      brand: formBrand,
      category: formCategory,
      sku: formSku.trim() || undefined,
      color: formColor,
      imageUrl: formImageUrl.trim() || undefined,
      compatiblePrinters: formCompatiblePrinters,
      notes: formNotes.trim() || undefined,
      isActive: formIsActive,
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("جلسة العمل منتهية");

      if (editingProduct) {
        // Update
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        if (!res.ok) throw new Error("فشل حفظ التعديلات");
      } else {
        // Create
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("فشل إنشاء المنتج");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء الحفظ.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  // Delete all products
  const handleDeleteAllProducts = async () => {
    if (products.length === 0) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/products?id=all", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setProducts([]);
        setShowClearConfirm(false);
      }
    } catch {
      alert("حدث خطأ أثناء حذف المنتجات.");
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
      );

      await fetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
    } catch {
      fetchProducts();
    }
  };

  // Handle Excel file selection for Import
  const handleSelectExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const result = await parseProductsExcel(file);
      setImportPreview(result);
    } catch (err) {
      alert("تعذر قراءة ملف الـ Excel. يرجى التأكد من التنسيق.");
    } finally {
      setImporting(false);
      if (importFileInputRef.current) importFileInputRef.current.value = "";
    }
  };

  // Confirm Excel Import
  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.products.length === 0) return;

    setImporting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(importPreview.products),
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        setImportPreview(null);
        fetchProducts();
        alert(`تم بنجاح استيراد ${importPreview.products.length} منتج!`);
      } else {
        alert("حدث خطأ أثناء استيراد المنتجات.");
      }
    } catch {
      alert("حدث خطأ أثناء الاستيراد.");
    } finally {
      setImporting(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) return false;

      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;

      // Search query (matches name, SKU, brand, or any compatible printer)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = (p.sku || "").toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesPrinter = (p.compatiblePrinters || []).some((pr) =>
          pr.toLowerCase().includes(q)
        );
        return matchesName || matchesSku || matchesBrand || matchesPrinter;
      }

      return true;
    });
  }, [products, selectedBrand, selectedCategory, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = products.length;
    const printerCount = products.filter((p) => p.category === "printer").length;
    const tonerCount = products.filter((p) => p.category === "toner").length;
    const inkCount = products.filter((p) => p.category === "ink").length;
    const drumPartsCount = products.filter(
      (p) => p.category === "drum_unit" || p.category === "spare_parts"
    ).length;
    return { total, printerCount, tonerCount, inkCount, drumPartsCount };
  }, [products]);

  /* ─── Render a category icon (inline image or Lucide fallback) ─── */
  const renderCategoryIcon = (cat: ProductCategory, size: number = 16) => {
    const src = CATEGORY_ICONS[cat];
    if (src) {
      return (
        <img
          src={src}
          alt={CATEGORY_LABELS[cat]}
          className="object-contain"
          style={{ width: size, height: size }}
        />
      );
    }
    if (cat === "printer") return <Printer style={{ width: size, height: size }} />;
    // spare_parts fallback
    return <span style={{ fontSize: size * 0.75 }}>🔧</span>;
  };

  return (
    <div className="space-y-4">
      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Total */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">إجمالي المنتجات</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.total}</span>
          </div>
        </div>

        {/* Printers */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">طابعات</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.printerCount}</span>
          </div>
        </div>

        {/* Toner */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0">
            {renderCategoryIcon("toner", 18)}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">خراطيش تونر</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.tonerCount}</span>
          </div>
        </div>

        {/* Ink */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
            {renderCategoryIcon("ink", 18)}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">أحبار سائلة</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.inkCount}</span>
          </div>
        </div>

        {/* Drum & Parts */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
            {renderCategoryIcon("drum_unit", 18)}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">درام وقطع غيار</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.drumPartsCount}</span>
          </div>
        </div>
      </div>

      {/* ─── TOOLBAR: ACTIONS + SEARCH + FILTERS ─── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة منتج</span>
            </button>

            <button
              onClick={downloadProductsTemplate}
              title="تحميل ملف Excel تجريبي"
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-muted-foreground" />
              <span>نموذج Excel</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportProductsToExcel(products)}
              title="تصدير الكل"
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>تصدير</span>
            </button>

            <button
              onClick={() => {
                setImportPreview(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <span>استيراد</span>
            </button>

            {/* Clear catalog — visually de-emphasized, needs double-click */}
            {products.length > 0 && (
              <div className="relative">
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    title="إفراغ الكتالوج"
                    className="inline-flex items-center gap-1 px-2 py-[7px] rounded-md text-[11px] font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">إفراغ</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-2 py-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-[11px] text-red-700 dark:text-red-400 font-medium">
                      حذف {products.length} منتج؟
                    </span>
                    <button
                      onClick={handleDeleteAllProducts}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Search + Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الموديل أو الكود..."
              className="w-full h-9 pr-9 pl-8 rounded-md bg-white dark:bg-card border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-9 pr-2.5 pl-10 rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[130px]"
          >
            <option value="all">كل الماركات</option>
            {SUPPORTED_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 pr-2.5 pl-10 rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[130px]"
          >
            <option value="all">كل التصنيفات</option>
            <option value="printer">طابعات</option>
            <option value="toner">تونر</option>
            <option value="ink">حبر سائل</option>
            <option value="drum_unit">درام</option>
            <option value="spare_parts">قطع غيار</option>
          </select>
        </div>
      </div>

      {/* ─── PRODUCTS DATA TABLE ─── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[12px]">جاري التحميل...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-card border border-dashed border-border rounded-lg p-6">
          <Printer className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <h4 className="text-[13px] font-semibold text-foreground mb-1">
            لا توجد منتجات مطابقة
          </h4>
          <p className="text-[11px] text-muted-foreground mb-3">
            جرب تعديل البحث أو أضف منتجاً جديداً.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة منتج</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border rounded-lg overflow-hidden">
          {/* Table container */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-muted/40 dark:bg-muted/20 border-b border-border text-right">
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-12">#</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground">المنتج</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden md:table-cell w-24">الماركة</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden sm:table-cell w-24">التصنيف</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden lg:table-cell w-24">الكود</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden xl:table-cell">الطابعات المتوافقة</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-16 text-center">الحالة</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-20 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((product, idx) => {
                  const catMeta = CATEGORIES_CONFIG[product.category] || CATEGORIES_CONFIG.toner;

                  return (
                    <tr
                      key={product.id}
                      className={`group hover:bg-muted/30 transition-colors ${
                        !product.isActive ? "opacity-50" : ""
                      }`}
                    >
                      {/* Row number */}
                      <td className="py-2 px-3 text-muted-foreground tabular-nums text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Product: thumbnail + name */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-9 h-9 rounded-md bg-muted/50 border border-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-muted-foreground/50">
                                {renderCategoryIcon(product.category, 14)}
                              </span>
                            )}
                          </div>

                          {/* Name + SKU inline on mobile */}
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-foreground leading-tight truncate max-w-[260px]">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {/* Show brand/category on mobile since columns hidden */}
                              <span className="text-[10px] text-muted-foreground md:hidden">
                                {product.brand}
                              </span>
                              <span className="text-[10px] text-muted-foreground sm:hidden">
                                · {CATEGORY_LABELS[product.category]}
                              </span>
                              {product.sku && (
                                <span className="text-[10px] font-mono text-muted-foreground lg:hidden">
                                  · {product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-2 px-3 hidden md:table-cell">
                        <span className="text-[11px] font-medium text-foreground">{product.brand}</span>
                      </td>

                      {/* Category */}
                      <td className="py-2 px-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          {renderCategoryIcon(product.category, 12)}
                          <span>{CATEGORY_LABELS[product.category]}</span>
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-2 px-3 hidden lg:table-cell">
                        {product.sku ? (
                          <span className="text-[11px] font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            {product.sku}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Compatible Printers */}
                      <td className="py-2 px-3 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[300px]">
                          {(product.compatiblePrinters || []).slice(0, 3).map((pr, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground truncate max-w-[100px]"
                              title={pr}
                            >
                              {pr}
                            </span>
                          ))}
                          {(product.compatiblePrinters || []).length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                              +{product.compatiblePrinters.length - 3}
                            </span>
                          )}
                          {(!product.compatiblePrinters || product.compatiblePrinters.length === 0) && (
                            <span className="text-[11px] text-muted-foreground/50">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status toggle */}
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(product.id, product.isActive)}
                          className="cursor-pointer"
                          title={product.isActive ? "إخفاء" : "تفعيل"}
                        >
                          {product.isActive ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-muted-foreground/50" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => openEditModal(product)}
                            title="تعديل"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            title="حذف"
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer: count */}
          <div className="px-3 py-2 bg-muted/20 dark:bg-muted/10 border-t border-border text-[11px] text-muted-foreground">
            عرض {filteredProducts.length} من {products.length} منتج
          </div>
        </div>
      )}

      {/* ─── FLOATING EDIT / CREATE MODAL ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="relative w-full max-w-xl bg-white dark:bg-card border border-border rounded-lg shadow-2xl overflow-hidden my-4">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20 dark:bg-muted/10">
              <h3 className="text-[13px] font-semibold text-foreground">
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-[12px] font-medium rounded-md text-center">
                  {modalError}
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                  صورة المنتج <span className="text-muted-foreground font-normal">(اختيارية — 1:1)</span>
                </label>
                <div className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-md border border-border">
                  <div className="relative w-16 h-16 rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-start gap-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSelectImageFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>{formImageUrl ? "تغيير" : "رفع صورة"}</span>
                      </button>
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormImageUrl("")}
                          className="px-2 py-1 rounded-md bg-muted text-[11px] font-medium text-muted-foreground hover:text-red-600 cursor-pointer"
                        >
                          إزالة
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      يتم قص الصورة تلقائياً بنسبة 1:1
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1">
                  اسم المنتج <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: خرطوشة حبر ليزر Royal Ink HP 85A"
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1">الماركة</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as PrinterBrand)}
                    className="w-full h-9 px-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {SUPPORTED_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1">التصنيف</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full h-9 px-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="printer">طابعة</option>
                    <option value="toner">تونر</option>
                    <option value="ink">حبر سائل</option>
                    <option value="drum_unit">درام</option>
                    <option value="spare_parts">قطع غيار</option>
                  </select>
                </div>
              </div>

              {/* Printer product info banner */}
              {formCategory === "printer" && (
                <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Printer className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">إضافة طابعة كمنتج في الكتالوج</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      ستظهر في تصنيف الطابعات وتُقترح تلقائياً عند إضافة خراطيش متوافقة.
                    </p>
                  </div>
                </div>
              )}

              {/* SKU & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1">SKU / كود</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="مثل: CE285A, 85A"
                    className="w-full h-9 px-3 rounded-md bg-white dark:bg-background border border-border text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1">اللون</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value as ProductColor)}
                    className="w-full h-9 px-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="black">أسود</option>
                    <option value="cyan">سماوي</option>
                    <option value="magenta">أرجواني</option>
                    <option value="yellow">أصفر</option>
                    <option value="multi">طقم ألوان</option>
                    <option value="none">غير مخصص</option>
                  </select>
                </div>
              </div>

              {/* Compatible Printers */}
              <CompatiblePrintersInput
                selectedPrinters={formCompatiblePrinters}
                onChange={setFormCompatiblePrinters}
                currentBrand={formBrand}
                existingProducts={products}
                isPrinterCategory={formCategory === "printer"}
              />

              {/* Notes */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1">ملاحظات (اختياري)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="مثال: يطبع ~1600 صفحة بتغطية 5%"
                  className="w-full p-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/20 border border-border">
                <span className="text-[12px] font-medium text-foreground">ظاهر ومتاح</span>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingProduct ? "حفظ" : "إضافة"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── IMAGE CROPPER MODAL ─── */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={selectedImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={1} // 1:1 square
      />

      {/* ─── EXCEL IMPORT MODAL ─── */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-card border border-border rounded-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-[13px] font-semibold text-foreground">استيراد من Excel</h3>
                  <p className="text-[11px] text-muted-foreground">يدعم .xlsx و .xls</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={importFileInputRef}
              onChange={handleSelectExcelFile}
              accept=".xlsx, .xls"
              className="hidden"
            />

            <div
              onClick={() => importFileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/40 rounded-md p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-primary/5"
            >
              <Upload className="w-6 h-6 text-muted-foreground/50 mx-auto mb-1.5" />
              <p className="text-[12px] font-medium text-foreground mb-0.5">
                اضغط لاختيار ملف Excel
              </p>
              <span className="text-[10px] text-muted-foreground">
                استخدم النموذج للتأكد من ترتيب الأعمدة
              </span>
            </div>

            {importing && (
              <div className="py-3 flex items-center justify-center gap-2 text-[12px] text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري المعالجة...</span>
              </div>
            )}

            {importPreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[12px] font-medium">
                  <span>تم قراءة {importPreview.total} منتج</span>
                  <span className="text-[11px]">جاهزة</span>
                </div>

                {importPreview.errors.length > 0 && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-md text-[11px] space-y-0.5">
                    {importPreview.errors.slice(0, 3).map((err, i) => (
                      <p key={i}>⚠ {err}</p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={importing || importPreview.total === 0}
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 rounded-md bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    استيراد ({importPreview.total})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
