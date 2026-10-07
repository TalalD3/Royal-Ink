"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type {
  Product,
  ProductCategory,
  PrinterBrand,
  ProductColor,
  ProductSpecs,
  LocalizedText,
} from "@/types/product";
import { CATEGORY_ORDER, SUPPORTED_BRANDS } from "@/types/product";
import { CATEGORY_DEFAULT_SPECS, CATEGORY_SPECS } from "@/i18n/specs";
import { ProductNotesEditor, ProductSpecsEditor } from "./product-details-editor";
import { ImageCropperModal } from "@/components/ui/image-cropper-modal";
import { uploadAdminImage } from "@/lib/uploadthing-client";
import { CategoryIcon } from "@/components/ui/category-icons";
import { ColorSwatches } from "@/components/compat/color-swatches";
import {
  exportProductsToExcel,
  downloadProductsTemplate,
  parseProductsExcel,
} from "@/lib/excel/products-excel";
import { CompatiblePrintersInput } from "./compatible-printers-input";
import { CompatibleSuppliesInput } from "./compatible-supplies-input";
import { fitsPrinter, printerNamesOf } from "@/lib/product-utils";
import {
  Badge,
  Btn,
  EmptyState,
  Field,
  FormSection,
  IconBtn,
  LoadingBlock,
  Modal,
  Notice,
  Panel,
  SectionHead,
  Select,
  StatStrip,
  Toggle,
  inputCls,
} from "@/components/admin/admin-ui";
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
  Loader2,
  Check,
  FileDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Layers,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── CATEGORY SHORT LABELS ─── */
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  printer: "طابعة",
  toner: "تونر",
  cartridge: "خراطيش نفث الحبر",
  ink: "حبر سائل",
  drum_unit: "درام",
  fuser: "فيوزر",
  ribbon: "شريط ريبون",
  spare_parts: "قطع غيار",
};

const COLOR_OPTIONS: { value: ProductColor; label: string }[] = [
  { value: "black", label: "أسود" },
  { value: "cyan", label: "سماوي" },
  { value: "magenta", label: "أرجواني" },
  { value: "yellow", label: "أصفر" },
  { value: "multi", label: "طقم ألوان" },
  { value: "none", label: "غير مخصص" },
];

/** Only the specs that belong to the category, empty ones dropped */
function specsForCategory(specs: ProductSpecs, category: ProductCategory): ProductSpecs {
  const out: ProductSpecs = {};
  CATEGORY_SPECS[category].forEach((k) => {
    const v = specs[k]?.toString().trim();
    if (v) out[k] = v;
  });
  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The product photo on a mist tile, or its category icon */
function ProductThumb({ product, className }: { product: Product; className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-brand-mist", className)}>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="h-full w-full object-contain p-[8%]" />
      ) : (
        <CategoryIcon category={product.category} className="h-1/2 w-1/2 text-brand-black/25" />
      )}
    </div>
  );
}

export function AdminProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
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
  const [formSlug, setFormSlug] = useState("");
  const [formSpecs, setFormSpecs] = useState<ProductSpecs>({});
  const [formNotesI18n, setFormNotesI18n] = useState<LocalizedText>({});
  // Printers only: the consumables that fit it
  const [formSupplyIds, setFormSupplyIds] = useState<string[]>([]);

  // Warning returned by the API after a save (e.g. SQL v2 not run yet)
  const [saveWarning, setSaveWarning] = useState("");

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

      const res = await fetch("/api/admin/products", {
      });
      const json = await res.json();
      // The real catalogue from the database — even when it is empty
      if (Array.isArray(json.data)) {
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
    setFormSlug("");
    setFormSpecs({ ...(CATEGORY_DEFAULT_SPECS.toner ?? {}) });
    setFormNotesI18n({});
    setFormSupplyIds([]);
    setModalError("");
    setIsModalOpen(true);
  };

  // Changing category keeps typed values and adds that category's defaults
  const handleCategoryChange = (cat: ProductCategory) => {
    setFormCategory(cat);
    setFormSpecs((prev) => ({ ...(CATEGORY_DEFAULT_SPECS[cat] ?? {}), ...prev }));
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
    setFormSlug(p.slug || "");
    setFormSpecs({ ...(p.specs ?? {}) });
    setFormNotesI18n({ ...(p.notesI18n ?? {}), ar: p.notesI18n?.ar ?? p.notes ?? "" });
    setFormSupplyIds(
      p.category === "printer"
        ? products.filter((c) => c.category !== "printer" && fitsPrinter(c, printerNamesOf(p))).map((c) => c.id)
        : []
    );
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
    // Show the preview at once, upload to UploadThing, then use the real address
    const previous = formImageUrl;
    setFormImageUrl(previewUrl);
    setUploadingImage(true);
    setModalError("");

    try {
      const { url } = await uploadAdminImage(blob, `product-${Date.now()}.webp`);
      setFormImageUrl(url);
    } catch (err) {
      setFormImageUrl(previous);
      setModalError((err as Error).message);
    } finally {
      URL.revokeObjectURL(previewUrl);
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
      notes: formNotesI18n.ar?.trim() || undefined,
      isActive: formIsActive,
      slug: formSlug.trim() || undefined,
      specs: specsForCategory(formSpecs, formCategory),
      notesI18n: formNotesI18n,
      ...(formCategory === "printer" ? { supplyIds: formSupplyIds } : {}),
    };

    try {

      if (editingProduct) {
        // Update
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        if (!res.ok) throw new Error("فشل حفظ التعديلات");
        const json = await res.json().catch(() => ({}));
        setSaveWarning(json.warning || "");
      } else {
        // Create
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("فشل إنشاء المنتج");
        const json = await res.json().catch(() => ({}));
        setSaveWarning(json.warning || "");
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

      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
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

      const res = await fetch("/api/admin/products?id=all", {
        method: "DELETE",
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

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
      );

      await fetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    const inkCount = products.filter((p) => p.category === "ink" || p.category === "cartridge").length;
    const drumPartsCount = products.filter(
      (p) =>
        p.category === "drum_unit" ||
        p.category === "fuser" ||
        p.category === "ribbon" ||
        p.category === "spare_parts"
    ).length;
    return { total, printerCount, tonerCount, inkCount, drumPartsCount };
  }, [products]);

  const hasFilters = searchQuery.trim() !== "" || selectedBrand !== "all" || selectedCategory !== "all";
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("all");
    setSelectedCategory("all");
  };
  const openImport = () => {
    setImportPreview(null);
    setIsImportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {saveWarning && (
        <Notice tone="warning" onClose={() => setSaveWarning("")}>
          {saveWarning}
        </Notice>
      )}

      <SectionHead
        eyebrow="دليل التوافق"
        title="كتالوج المنتجات"
        description="المنتجات التي تظهر في دليل التوافق، مع مواصفاتها والطابعات المتوافقة معها."
        actions={
          <Btn variant="red" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateModal}>
            إضافة منتج
          </Btn>
        }
      />

      {/* ─── Figures ─── */}
      <StatStrip
        items={[
          { label: "إجمالي المنتجات", value: stats.total, icon: <Layers className="h-5 w-5" aria-hidden="true" /> },
          { label: "طابعات", value: stats.printerCount, icon: <CategoryIcon category="printer" className="h-5 w-5" /> },
          { label: "حبر ليزر (تونر)", value: stats.tonerCount, icon: <CategoryIcon category="toner" className="h-5 w-5" /> },
          { label: "خراطيش وأحبار", value: stats.inkCount, icon: <CategoryIcon category="ink" className="h-5 w-5" /> },
          { label: "درام وقطع غيار", value: stats.drumPartsCount, icon: <CategoryIcon category="drum_unit" className="h-5 w-5" /> },
        ]}
      />

      {/* ─── Search, filters and Excel ─── */}
      <Panel>
        <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_200px_220px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الكود أو الطابعة…"
              aria-label="بحث في المنتجات"
              className={cn(inputCls, "ps-10 pe-10")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="مسح البحث"
                className="absolute end-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-brand-gray hover:text-brand-black"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:contents">
            <Select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} aria-label="الماركة">
              <option value="all">كل الماركات</option>
              {SUPPORTED_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="التصنيف">
              <option value="all">كل التصنيفات</option>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-brand-line bg-brand-mist px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Btn
              size="sm"
              variant="outline"
              title="تحميل ملف Excel فارغ بالأعمدة الصحيحة"
              icon={<FileDown className="h-4 w-4" aria-hidden="true" />}
              onClick={downloadProductsTemplate}
            >
              النموذج
            </Btn>
            <Btn
              size="sm"
              variant="outline"
              title="تصدير كل المنتجات إلى Excel"
              icon={<Download className="h-4 w-4" aria-hidden="true" />}
              onClick={() => exportProductsToExcel(products)}
            >
              تصدير
            </Btn>
            <Btn size="sm" variant="outline" icon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={openImport}>
              استيراد
            </Btn>
          </div>

          {/* Clear catalogue — asks once more, inline */}
          {products.length > 0 &&
            (!showClearConfirm ? (
              <Btn
                size="sm"
                variant="ghost"
                className="text-brand-red hover:bg-white hover:text-brand-red"
                icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setShowClearConfirm(true)}
              >
                إفراغ الكتالوج
              </Btn>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-brand-red/30 bg-white px-3 py-2">
                <span className="flex items-center gap-2 text-[13px] font-bold text-brand-black">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                  حذف كل المنتجات ({products.length})؟
                </span>
                <span className="flex gap-2 ms-auto">
                  <Btn size="sm" variant="red" onClick={handleDeleteAllProducts}>
                    تأكيد الحذف
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)}>
                    إلغاء
                  </Btn>
                </span>
              </div>
            ))}
        </div>
      </Panel>

      {/* ─── Count ─── */}
      {!loading && products.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-gray">
          <p>
            عرض <span className="font-extrabold text-brand-black">{filteredProducts.length}</span> من{" "}
            <span className="font-extrabold text-brand-black">{products.length}</span> منتج
          </p>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="text-sm font-bold text-brand-red underline-offset-4 hover:underline">
              مسح الفلاتر
            </button>
          )}
        </div>
      )}

      {/* ─── Products ─── */}
      {loading ? (
        <LoadingBlock label="جارٍ تحميل المنتجات…" />
      ) : filteredProducts.length === 0 ? (
        products.length === 0 ? (
          <EmptyState
            icon={<CategoryIcon category="toner" className="h-7 w-7" />}
            title="الكتالوج فارغ"
            text="أضف أول منتج، أو استورد القائمة كاملة من ملف Excel."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Btn variant="red" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateModal}>
                  إضافة منتج
                </Btn>
                <Btn variant="outline" icon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={openImport}>
                  استيراد من Excel
                </Btn>
              </div>
            }
          />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" aria-hidden="true" />}
            title="لا توجد منتجات مطابقة"
            text="جرّب كلمة بحث أخرى، أو امسح الفلاتر لعرض كل المنتجات."
            action={
              <Btn variant="outline" onClick={resetFilters}>
                مسح الفلاتر
              </Btn>
            }
          />
        )
      ) : (
        <>
          {/* Desktop: a ruled table */}
          <div className="hidden overflow-x-auto border border-brand-line bg-white lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-black text-white">
                  <th className="w-14 px-4 py-3 text-start text-xs font-extrabold">#</th>
                  <th className="px-4 py-3 text-start text-xs font-extrabold">المنتج</th>
                  <th className="w-28 px-4 py-3 text-start text-xs font-extrabold">الماركة</th>
                  <th className="w-48 px-4 py-3 text-start text-xs font-extrabold">التصنيف</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-extrabold xl:table-cell">الطابعات المتوافقة</th>
                  <th className="w-28 px-4 py-3 text-center text-xs font-extrabold">الحالة</th>
                  <th className="w-40 px-4 py-3 text-start text-xs font-extrabold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => {
                  const printers = product.compatiblePrinters || [];
                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        "border-t border-brand-line align-middle transition-colors hover:bg-brand-mist/60",
                        !product.isActive && "bg-brand-mist/40"
                      )}
                    >
                      <td className="px-4 py-3 text-xs font-bold tabular-nums text-brand-gray">{pad(idx + 1)}</td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <ProductThumb
                            product={product}
                            className={cn("h-14 w-14 shrink-0", !product.isActive && "opacity-50")}
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-extrabold leading-6 text-brand-black">{product.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              {product.sku && (
                                <span dir="ltr" className="text-xs font-bold text-brand-gray">
                                  {product.sku}
                                </span>
                              )}
                              <ColorSwatches color={product.color} />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span dir="ltr" className="font-bold text-brand-black">
                          {product.brand}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-brand-black">
                          <CategoryIcon category={product.category} className="h-5 w-5 shrink-0 text-brand-red" />
                          {CATEGORY_LABELS[product.category]}
                        </span>
                      </td>

                      <td className="hidden px-4 py-3 xl:table-cell">
                        {product.category === "printer" ? (
                          (() => {
                            const n = products.filter(
                              (c) => c.category !== "printer" && fitsPrinter(c, printerNamesOf(product))
                            ).length;
                            return (
                              <span className={cn("px-2 py-1 text-[11px] font-bold", n ? "bg-brand-black text-white" : "bg-brand-mist text-brand-gray")}>
                                {n ? `${n} مستلزمات متوافقة` : "لا مستلزمات مرتبطة"}
                              </span>
                            );
                          })()
                        ) : printers.length === 0 ? (
                          <span className="text-brand-gray/60">—</span>
                        ) : (
                          <div className="flex max-w-[320px] flex-wrap gap-1.5">
                            {printers.slice(0, 3).map((pr) => (
                              <span
                                key={pr}
                                dir="ltr"
                                title={pr}
                                className="max-w-[140px] truncate bg-brand-mist px-2 py-1 text-[11px] font-bold text-brand-black"
                              >
                                {pr}
                              </span>
                            ))}
                            {printers.length > 3 && (
                              <span dir="ltr" className="bg-brand-black px-2 py-1 text-[11px] font-bold text-white">
                                +{printers.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product.id, product.isActive)}
                          title={product.isActive ? "إخفاء من الموقع" : "إظهار في الموقع"}
                          className="inline-flex"
                        >
                          <Badge tone={product.isActive ? "success" : "outline"}>
                            {product.isActive ? "ظاهر" : "مخفي"}
                          </Badge>
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <IconBtn label="تعديل" onClick={() => openEditModal(product)}>
                            <Edit2 className="h-4 w-4" />
                          </IconBtn>
                          <IconBtn label="حذف" tone="danger" onClick={() => handleDeleteProduct(product.id, product.name)}>
                            <Trash2 className="h-4 w-4" />
                          </IconBtn>
                          {product.slug && product.isActive && (
                            <a
                              href={`/compatibility/${product.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="فتح صفحة المنتج"
                              title="فتح صفحة المنتج"
                              className="flex h-10 w-10 shrink-0 items-center justify-center border border-brand-line bg-white text-brand-black transition-colors hover:border-brand-black"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phones and tablets: cards, the photo on top and the details under it */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:hidden">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className={cn(
                  "flex flex-col border bg-white",
                  product.isActive ? "border-brand-line" : "border-dashed border-brand-gray/40"
                )}
              >
                <div className="relative">
                  <ProductThumb
                    product={product}
                    className={cn("aspect-square w-full", !product.isActive && "opacity-50")}
                  />
                  <span
                    className={cn(
                      "absolute start-0 top-0 inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-extrabold leading-none",
                      product.isActive ? "bg-brand-black text-white" : "bg-white text-brand-gray"
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5", product.isActive ? "bg-brand-red" : "bg-brand-gray/50")}
                      aria-hidden="true"
                    />
                    {product.isActive ? "ظاهر" : "مخفي"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-brand-red">
                    <CategoryIcon category={product.category} className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{CATEGORY_LABELS[product.category]}</span>
                  </p>
                  <h3 className="mt-1.5 line-clamp-2 text-sm font-extrabold leading-6 text-brand-black">{product.name}</h3>
                  <div className="min-h-2 flex-1" aria-hidden="true" />
                  <div className="flex items-center justify-between gap-2 border-t border-brand-line pt-2">
                    <span dir="ltr" className="min-w-0 truncate text-xs font-bold text-brand-gray">
                      {product.brand}
                      {product.sku ? ` · ${product.sku}` : ""}
                    </span>
                    <ColorSwatches color={product.color} />
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-brand-line">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product.id, product.isActive)}
                    aria-label={product.isActive ? "إخفاء من الموقع" : "إظهار في الموقع"}
                    className="flex h-11 items-center justify-center text-brand-black transition-colors hover:bg-brand-mist"
                  >
                    {product.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-brand-gray" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    aria-label="تعديل"
                    className="flex h-11 items-center justify-center bg-brand-black text-white transition-colors hover:bg-brand-red"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    aria-label="حذف"
                    className="flex h-11 items-center justify-center text-brand-red transition-colors hover:bg-brand-red hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* ─── CREATE / EDIT ─── */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        eyebrow={editingProduct ? "تعديل منتج" : "منتج جديد"}
        title={editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
        description="الحقول المعلّمة بـ * مطلوبة، وكل ما سواها اختياري."
        footer={
          <>
            <Btn variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Btn>
            <Btn
              type="submit"
              form="admin-product-form"
              variant="red"
              loading={submitting}
              disabled={uploadingImage}
              icon={<Check className="h-4 w-4" aria-hidden="true" />}
            >
              {submitting ? "جارٍ الحفظ…" : editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
            </Btn>
          </>
        }
      >
        <form id="admin-product-form" onSubmit={handleSaveProduct} className="space-y-6">
          {modalError && <Notice tone="danger">{modalError}</Notice>}

          <FormSection title="التعريف">
            {/* Image */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-brand-line bg-brand-mist">
                {formImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formImageUrl} alt="" className="h-full w-full object-contain p-2" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-brand-black/25" aria-hidden="true" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-black/60">
                    <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold text-brand-black">صورة المنتج</p>
                <p className="mt-0.5 text-xs leading-5 text-brand-gray">اختيارية — تُقص مربعة (1:1) لتتساوى كل البطاقات.</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Btn
                    size="sm"
                    variant="black"
                    icon={<ImageIcon className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formImageUrl ? "تغيير الصورة" : "رفع صورة"}
                  </Btn>
                  {formImageUrl && (
                    <Btn size="sm" variant="ghost" onClick={() => setFormImageUrl("")}>
                      إزالة
                    </Btn>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSelectImageFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <Field label="اسم المنتج" required htmlFor="product-name">
              <input
                id="product-name"
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: خرطوشة حبر ليزر Royal Ink HP 85A"
                className={inputCls}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الماركة" htmlFor="product-brand">
                <Select
                  id="product-brand"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value as PrinterBrand)}
                >
                  {SUPPORTED_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="التصنيف" htmlFor="product-category">
                <Select
                  id="product-category"
                  value={formCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                >
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {formCategory === "printer" && (
              <Notice tone="info">
                طابعة كمنتج في الكتالوج: تظهر في تصنيف الطابعات، وتُقترح تلقائياً عند إضافة مستلزمات متوافقة معها.
              </Notice>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الكود (SKU)" htmlFor="product-sku">
                <input
                  id="product-sku"
                  type="text"
                  dir="ltr"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="CE285A, 85A"
                  className={cn(inputCls, "text-right font-bold")}
                />
              </Field>
              <Field label="اللون" htmlFor="product-color">
                <Select
                  id="product-color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value as ProductColor)}
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection
            title={formCategory === "printer" ? "طراز الطابعة" : "الطابعات المتوافقة"}
            description={
              formCategory === "printer"
                ? "الاسم الأول هو طراز هذه الطابعة، وأضف أسماءه الأخرى إن وُجدت (مثل LBP6030 و LBP6030B). إن تركته فارغاً يُؤخذ الطراز من اسم المنتج."
                : "ابحث واختر الطرازات، أو اكتب طرازاً جديداً واضغط «إضافة»."
            }
          >
            <CompatiblePrintersInput
              selectedPrinters={formCompatiblePrinters}
              onChange={setFormCompatiblePrinters}
              currentBrand={formBrand}
              existingProducts={products}
              isPrinterCategory={formCategory === "printer"}
            />
          </FormSection>

          {formCategory === "printer" && (
            <FormSection
              title="المستلزمات المتوافقة"
              description="اختر الأحبار والتونر والقطع التي تعمل مع هذه الطابعة."
            >
              <CompatibleSuppliesInput
                products={products}
                selectedIds={formSupplyIds}
                onChange={setFormSupplyIds}
                brand={formBrand}
                modelName={printerNamesOf({ name: formName, compatiblePrinters: formCompatiblePrinters })[0] ?? ""}
              />
            </FormSection>
          )}

          <FormSection
            title={`المواصفات — ${CATEGORY_LABELS[formCategory]}`}
            description="تظهر في جدول «المواصفات التفصيلية» بصفحة المنتج. الرموز والقيم تُكتب كما هي ولا تُترجم، والحقول الفارغة لا تظهر."
          >
            <ProductSpecsEditor
              category={formCategory}
              specs={formSpecs}
              legacyNotes={formNotes}
              onChange={setFormSpecs}
            />
          </FormSection>

          <FormSection
            title="الوصف"
            description="ملخص يُكتب تلقائياً من المواصفات باللغات الثلاث، وتحته ملاحظة اختيارية لكل لغة."
          >
            <ProductNotesEditor
              notes={formNotesI18n}
              onChange={setFormNotesI18n}
              draft={{
                id: editingProduct?.id ?? "draft",
                name: formName,
                brand: formBrand,
                category: formCategory,
                sku: formSku,
                color: formColor,
                compatiblePrinters: formCompatiblePrinters,
                isActive: formIsActive,
                specs: specsForCategory(formSpecs, formCategory),
              }}
            />
          </FormSection>

          <FormSection title="النشر">
            <Field
              label="رابط صفحة المنتج"
              hint="اختياري — يُنشأ تلقائياً من الماركة والكود."
              htmlFor="product-slug"
            >
              <div
                dir="ltr"
                className="flex border border-brand-line bg-white transition-colors focus-within:border-brand-black"
              >
                <span className="flex shrink-0 items-center border-e border-brand-line bg-brand-mist px-3 text-xs font-bold text-brand-gray">
                  /compatibility/
                </span>
                <input
                  id="product-slug"
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                  placeholder={`${formBrand}-${formSku || "code"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-brand-black outline-none placeholder:font-normal placeholder:text-brand-gray/60"
                />
              </div>
            </Field>
            <Toggle
              checked={formIsActive}
              onChange={setFormIsActive}
              label={formIsActive ? "ظاهر في الموقع" : "مخفي من الموقع"}
              description="المنتج المخفي لا يظهر في دليل التوافق ولا في نتائج البحث."
            />
          </FormSection>
        </form>
      </Modal>

      {/* ─── IMAGE CROPPER ─── */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={selectedImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={1} // 1:1 square
      />

      {/* ─── EXCEL IMPORT ─── */}
      <Modal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        size="sm"
        eyebrow="Excel"
        title="استيراد المنتجات"
        description="ملف ‎.xlsx أو ‎.xls بنفس أعمدة النموذج."
        footer={
          importPreview ? (
            <>
              <Btn variant="outline" onClick={() => setImportPreview(null)}>
                إلغاء
              </Btn>
              <Btn
                variant="red"
                loading={importing}
                disabled={importPreview.total === 0}
                icon={<Upload className="h-4 w-4" aria-hidden="true" />}
                onClick={handleConfirmImport}
              >
                استيراد ({importPreview.total})
              </Btn>
            </>
          ) : (
            <Btn variant="outline" icon={<FileDown className="h-4 w-4" aria-hidden="true" />} onClick={downloadProductsTemplate}>
              تحميل النموذج
            </Btn>
          )
        }
      >
        <div className="space-y-4">
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleSelectExcelFile}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => importFileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 border border-dashed border-brand-black/30 bg-brand-mist px-6 py-8 text-center transition-colors hover:border-brand-red"
          >
            <span className="flex h-12 w-12 items-center justify-center bg-brand-black text-white">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-extrabold text-brand-black">اختر ملف Excel</span>
            <span className="text-xs leading-5 text-brand-gray">استخدم النموذج لتتأكد من ترتيب الأعمدة.</span>
          </button>

          {importing && !importPreview && (
            <p className="flex items-center justify-center gap-2 text-sm font-bold text-brand-gray">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              جارٍ قراءة الملف…
            </p>
          )}

          {importPreview && (
            <>
              <Notice tone="success">
                تمت قراءة {importPreview.total} منتج، وهي جاهزة للاستيراد.
              </Notice>
              {importPreview.errors.length > 0 && (
                <Notice tone="danger">
                  <ul className="space-y-1">
                    {importPreview.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  {importPreview.errors.length > 3 && (
                    <p className="mt-1 text-xs">و{importPreview.errors.length - 3} ملاحظات أخرى.</p>
                  )}
                </Notice>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
