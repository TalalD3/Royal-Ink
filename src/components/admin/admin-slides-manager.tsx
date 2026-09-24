"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { HeroSlide, SlideTextAlign, SlideButton } from "@/types/slide";
import { DEFAULT_SLIDES } from "@/types/slide";
import { ImageCropperModal, AspectRatioOption } from "@/components/ui/image-cropper-modal";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Loader2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
  CheckCircle2,
  Database,
  HardDrive,
  AlignRight,
  AlignCenter,
  AlignLeft,
  UploadCloud,
  Crop as CropIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";

/* ─── Helpers ─── */
async function getAuthToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || "";
}

async function apiCall(
  method: string,
  body?: any,
  query?: string
): Promise<any> {
  const token = await getAuthToken();
  const url = `/api/admin/slides${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/* ─── Text Align Options ─── */
const ALIGN_OPTIONS: { value: SlideTextAlign; label: string; icon: React.ReactNode }[] = [
  { value: "right", label: "يمين", icon: <AlignRight className="w-3.5 h-3.5" /> },
  { value: "center", label: "وسط", icon: <AlignCenter className="w-3.5 h-3.5" /> },
  { value: "left", label: "يسار", icon: <AlignLeft className="w-3.5 h-3.5" /> },
];

/* ─── Aspect Ratio Options for Hero Slides ─── */
const SLIDE_ASPECT_RATIOS: AspectRatioOption[] = [
  {
    label: "16:9 (1920 × 1080)",
    ratio: 16 / 9,
    description: "الأبعاد القياسية الموصى بها للشاشات العريضة",
  },
  {
    label: "2:1 (1920 × 960)",
    ratio: 2 / 1,
    description: "بانورامي عريض مخصص للبانرات الأفقية",
  },
];

/* ─── Main Component ─── */
export function AdminSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [modalError, setModalError] = useState("");

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formOverlay, setFormOverlay] = useState(50);
  const [formTextAlign, setFormTextAlign] = useState<SlideTextAlign>("center");
  const [formButtons, setFormButtons] = useState<SlideButton[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);

  // Image preview & Cropper
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  // ─── Fetch slides ─────────────────────────────────────────────
  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setLoading(true);
    try {
      const json = await apiCall("GET");
      if (json.data && Array.isArray(json.data)) {
        const sorted = [...json.data].sort(
          (a: HeroSlide, b: HeroSlide) => a.sort_order - b.sort_order
        );
        setSlides(sorted);
        setIsUsingSupabase(!!json.isUsingSupabase);
      }
    } catch (err: any) {
      console.error("Failed to load slides:", err);
      setSlides(DEFAULT_SLIDES);
    }
    setLoading(false);
  }

  // ─── Open Modal Handlers ──────────────────────────────────────
  function openCreateModal() {
    setEditingSlide(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormImageUrl("");
    setFormOverlay(50);
    setFormTextAlign("center");
    setFormButtons([]);
    setFormIsActive(true);
    setFormSortOrder(slides.length + 1);
    setModalError("");
    setImagePreviewError(false);
    setIsModalOpen(true);
  }

  function openEditModal(slide: HeroSlide) {
    setEditingSlide(slide);
    setFormTitle(slide.title);
    setFormSubtitle(slide.subtitle || "");
    setFormImageUrl(slide.image_url);
    setFormOverlay(slide.overlay_opacity ?? 50);
    setFormTextAlign(slide.text_align || "center");
    setFormButtons(slide.buttons ? [...slide.buttons] : []);
    setFormIsActive(slide.is_active);
    setFormSortOrder(slide.sort_order);
    setModalError("");
    setImagePreviewError(false);
    setIsModalOpen(true);
  }

  // ─── Image File Picker & Crop Handlers ────────────────────────
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file fires onChange
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileForCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  }

  function openCropperWithCurrent() {
    if (!formImageUrl) return;
    setSelectedFileForCrop(formImageUrl);
    setIsCropperOpen(true);
  }

  async function handleCropCompleted(croppedBlob: Blob) {
    setUploadingImage(true);
    showToast("جاري معالجة ورفع الصورة المحسّنة...");

    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append("file", croppedBlob, `slide-${Date.now()}.webp`);
      formData.append("bucket", "hero-slides");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || "فشل رفع الصورة");
      }

      const json = await res.json();
      if (json.url) {
        setFormImageUrl(json.url);
        setImagePreviewError(false);
        showToast("تم قص ورفع الصورة بنجاح!");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast(err.message || "فشل رفع الصورة إلى الخادم", "error");
    } finally {
      setUploadingImage(false);
    }
  }

  // ─── Save / Update ────────────────────────────────────────────
  async function handleSave() {
    if (!formTitle.trim()) {
      setModalError("العنوان الرئيسي مطلوب");
      return;
    }
    if (!formImageUrl.trim()) {
      setModalError("رابط أو ملف صورة الخلفية مطلوب");
      return;
    }

    setSaving(true);
    setModalError("");

    const payload = {
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      image_url: formImageUrl.trim(),
      overlay_opacity: formOverlay,
      text_align: formTextAlign,
      buttons: formButtons.filter((b) => b.text.trim() && b.href.trim()),
      is_active: formIsActive,
      sort_order: formSortOrder,
    };

    try {
      if (editingSlide) {
        await apiCall("PUT", { id: editingSlide.id, ...payload });
        showToast("تم حفظ تعديلات الشريحة بنجاح");
      } else {
        await apiCall("POST", payload);
        showToast("تم إنشاء الشريحة الجديدة بنجاح");
      }
      await fetchSlides();
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء حفظ الشريحة");
    }
    setSaving(false);
  }

  // ─── Delete ───────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الشريحة نهائياً؟")) return;
    try {
      await apiCall("DELETE", undefined, `id=${id}`);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      showToast("تم حذف الشريحة بنجاح");
    } catch (err: any) {
      showToast(err.message || "فشل حذف الشريحة", "error");
    }
  }

  // ─── Toggle Active (The Eye Button) ───────────────────────────
  async function toggleActive(slide: HeroSlide) {
    const newValue = !slide.is_active;

    // Instant optimistic update
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, is_active: newValue } : s))
    );

    try {
      await apiCall("PUT", { id: slide.id, is_active: newValue });
      showToast(
        newValue
          ? "تم تفعيل الشريحة — تظهر الآن في الواجهة الرئيسية"
          : "تم إخفاء الشريحة — لن تظهر في الواجهة الرئيسية"
      );
    } catch (err: any) {
      // Revert if error
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, is_active: slide.is_active } : s))
      );
      showToast("فشل تحديث حالة الظهور", "error");
    }
  }

  // ─── Move Order ───────────────────────────────────────────────
  async function moveSlide(slide: HeroSlide, direction: "up" | "down") {
    const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === slide.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const currentOrder = sorted[idx].sort_order;
    const targetOrder = sorted[swapIdx].sort_order;

    // Instant optimistic update
    const nextSlides = [...sorted];
    nextSlides[idx] = { ...nextSlides[idx], sort_order: targetOrder };
    nextSlides[swapIdx] = { ...nextSlides[swapIdx], sort_order: currentOrder };
    setSlides(nextSlides.sort((a, b) => a.sort_order - b.sort_order));

    try {
      await apiCall("PUT", { id: sorted[idx].id, sort_order: targetOrder });
      await apiCall("PUT", { id: sorted[swapIdx].id, sort_order: currentOrder });
      showToast("تم تحديث ترتيب العرض");
    } catch (err: any) {
      await fetchSlides();
      showToast("فشل تحديث الترتيب", "error");
    }
  }

  // ─── Reset to Defaults ────────────────────────────────────────
  async function handleReset() {
    if (
      !confirm(
        "هل تريد استعادة الشرائح الافتراضية؟ سيتم استرجاع المحتوى والصور الأصلية."
      )
    )
      return;

    try {
      setLoading(true);
      await apiCall("POST", { action: "reset" });
      await fetchSlides();
      showToast("تمت استعادة الشرائح للقيم الافتراضية بنجاح");
    } catch (err: any) {
      showToast("فشل استرجاع القيم الافتراضية", "error");
      setLoading(false);
    }
  }

  // ─── Button form helpers ──────────────────────────────────────
  function addButton() {
    if (formButtons.length >= 2) return;
    setFormButtons([
      ...formButtons,
      {
        text: "",
        href: "/",
        variant: formButtons.length === 0 ? "primary" : "outline",
      },
    ]);
  }

  function updateButton(index: number, field: keyof SlideButton, value: string) {
    const updated = [...formButtons];
    (updated[index] as any)[field] = value;
    setFormButtons(updated);
  }

  function removeButton(index: number) {
    setFormButtons(formButtons.filter((_, i) => i !== index));
  }

  // ─── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium">
          جاري تحميل شرائح الواجهة الرئيسية...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all border ${
            toast.type === "success"
              ? "bg-green-600 text-white border-green-500 shadow-green-900/20"
              : "bg-red-600 text-white border-red-500 shadow-red-900/20"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Storage Status Indicator ── */}
      <div className="flex items-center justify-between bg-muted/40 border border-border/70 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isUsingSupabase ? (
            <Database className="w-4 h-4 text-emerald-600" />
          ) : (
            <HardDrive className="w-4 h-4 text-blue-600" />
          )}
          <span className="text-xs font-semibold text-foreground">
            {isUsingSupabase
              ? "متصل بقاعدة بيانات Supabase (مزامنة سحابية مباشرة)"
              : "تخزين دائم نشط (حفظ فوري في ملفات النظام، وسيعمل مع Supabase فور تشغيل السكربت)"}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isUsingSupabase
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
          }`}
        >
          {isUsingSupabase ? "Supabase Live" : "Persistent Local"}
        </span>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            شرائح الواجهة الرئيسية (Hero Slides)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            تحكم في صور ونصوص وأزرار وترتيب ظهور الشرائح المعروضة في أعلى الصفحة
            الرئيسية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة شريحة جديدة
          </button>
        </div>
      </div>

      {/* ── Slides List ── */}
      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`flex items-center gap-3 sm:gap-4 p-3.5 rounded-2xl border transition-all ${
              slide.is_active
                ? "bg-white dark:bg-card border-border hover:border-primary/30 shadow-sm"
                : "bg-muted/20 border-border/50 opacity-60"
            }`}
          >
            {/* Reorder controls */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveSlide(slide, "up")}
                disabled={idx === 0}
                title="تحريك لأعلى"
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveSlide(slide, "down")}
                disabled={idx === slides.length - 1}
                title="تحريك لأسفل"
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-28 sm:w-36 h-16 sm:h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 relative shadow-inner">
              {slide.image_url ? (
                <img
                  src={slide.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              {/* Overlay preview */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: `rgba(0,0,0,${
                    (slide.overlay_opacity ?? 50) / 100
                  })`,
                }}
              />
              <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                #{slide.sort_order}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground truncate">
                  {slide.title.replace(/\n/g, " - ")}
                </p>
                {slide.is_active ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    معروضة
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                    مخفية
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground truncate">
                {slide.subtitle || "بدون نص وصفي"}
              </p>

              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                  {slide.text_align === "right" ? (
                    <>
                      <AlignRight className="w-3 h-3" />
                      محاذاة يمين
                    </>
                  ) : slide.text_align === "left" ? (
                    <>
                      <AlignLeft className="w-3 h-3" />
                      محاذاة يسار
                    </>
                  ) : (
                    <>
                      <AlignCenter className="w-3 h-3" />
                      محاذاة وسط
                    </>
                  )}
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  شفافية الظل: {slide.overlay_opacity ?? 50}%
                </span>

                {slide.buttons && slide.buttons.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    {slide.buttons.length} أزرار تفاعلية
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* EYE BUTTON — Visible / Hidden Toggle */}
              <button
                type="button"
                onClick={() => toggleActive(slide)}
                title={
                  slide.is_active
                    ? "إخفاء الشريحة من الصفحة الرئيسية"
                    : "إظهار وتفعيل الشريحة في الصفحة الرئيسية"
                }
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  slide.is_active
                    ? "bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/30 dark:hover:bg-green-900/40"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {slide.is_active ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* EDIT BUTTON */}
              <button
                type="button"
                onClick={() => openEditModal(slide)}
                title="تعديل الشريحة"
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* DELETE BUTTON */}
              <button
                type="button"
                onClick={() => handleDelete(slide.id)}
                title="حذف الشريحة"
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-card border border-border rounded-2xl text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold text-foreground">لا توجد شرائح حالياً</p>
          <p className="text-xs mt-1 text-muted-foreground">
            اضغط على &quot;إضافة شريحة جديدة&quot; للبدء أو استعد الشرائح الافتراضية.
          </p>
        </div>
      )}

      {/* ── Footer / Reset ── */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          استعادة الشرائح للقيم الافتراضية
        </button>
        <span className="text-xs text-muted-foreground">
          إجمالي الشرائح: {slides.length} (المعروضة:{" "}
          {slides.filter((s) => s.is_active).length})
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL — Create / Edit Slide
          ═══════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {editingSlide ? "تعديل بيانات الشريحة" : "إضافة شريحة جديدة"}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  قم بضبط الصورة والنصوص والموقع بدقة مع المعاينة الفورية وأداة القص.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {modalError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 font-semibold">
                  {modalError}
                </div>
              )}

              {/* ── PHOTOSHOP GUIDANCE & RECOMMENDED SIZE CARD ── */}
              <div className="bg-gradient-to-l from-red-50/70 to-amber-50/70 dark:from-red-950/20 dark:to-amber-950/20 border border-primary/20 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>دليل المصمم ومقاسات الصور الموصى بها (Photoshop Guide)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                  <div className="bg-white/80 dark:bg-card/80 p-2.5 rounded-xl border border-border/60">
                    <span className="text-[10px] text-muted-foreground block font-semibold">
                      الأبعاد الموصى بها:
                    </span>
                    <span className="text-xs font-bold font-mono text-primary">
                      1920 × 960 px
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      (أو 1920 × 1080 px)
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-card/80 p-2.5 rounded-xl border border-border/60">
                    <span className="text-[10px] text-muted-foreground block font-semibold">
                      نسبة العرض للارتفاع:
                    </span>
                    <span className="text-xs font-bold font-mono text-foreground">
                      16:9 أو 2:1
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      متناسقة على كافة الأجهزة
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-card/80 p-2.5 rounded-xl border border-border/60">
                    <span className="text-[10px] text-muted-foreground block font-semibold">
                      الدقة والصيغة:
                    </span>
                    <span className="text-xs font-bold font-mono text-foreground">
                      72 - 150 DPI
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      صيغة WebP أو JPG
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  💡 تضمن أداة القص المدمجة أن تظهر كل صور السلايدر بنفس النسبة والأبعاد تماماً بدون أي تشوه أو قفزات بصرية.
                </p>
              </div>

              {/* ── IMAGE UPLOAD & CROPPER SECTION ── */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  صورة خلفية الشريحة *
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Upload file button with drag-drop support */}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer text-primary font-bold text-xs select-none">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري المعالجة والرفع...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>رفع صورة من الحاسوب وقصها</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={handleFileSelected}
                    />
                  </label>

                  {/* Recrop button if image already exists */}
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={openCropperWithCurrent}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      <CropIcon className="w-4 h-4 text-primary" />
                      <span>إعادة قص الصورة</span>
                    </button>
                  )}
                </div>

                {/* Direct image URL input (Optional manual fallback) */}
                <div className="pt-0.5">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      setImagePreviewError(false);
                    }}
                    placeholder="/images/ink-cartridges.jpg أو رابط مباشر للصورة..."
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* ── LIVE PREVIEW BANNER ── */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  معاينة الشريحة المباشرة
                </label>
                <div className="relative rounded-2xl overflow-hidden h-44 bg-black border border-border shadow-inner">
                  {formImageUrl && !imagePreviewError ? (
                    <img
                      src={formImageUrl}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 gap-2">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs">
                        {formImageUrl ? "تعذر تحميل رابط الصورة" : "ارفع صورة أو ضع رابطها لمشاهدة المعاينة"}
                      </span>
                    </div>
                  )}

                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: `rgba(0,0,0,${formOverlay / 100})`,
                    }}
                  />

                  {/* Text alignment & content preview */}
                  <div
                    className={`absolute inset-0 flex items-center p-5 ${
                      formTextAlign === "right"
                        ? "justify-start"
                        : formTextAlign === "left"
                        ? "justify-end"
                        : "justify-center"
                    }`}
                  >
                    <div
                      className={`flex flex-col gap-1.5 max-w-sm w-full ${
                        formTextAlign === "right"
                          ? "items-start text-right"
                          : formTextAlign === "left"
                          ? "items-end text-left"
                          : "items-center text-center"
                      }`}
                    >
                      <p className="text-white text-sm font-extrabold drop-shadow-md whitespace-pre-line line-clamp-2 w-full">
                        {formTitle || "العنوان الرئيسي للشريحة"}
                      </p>
                      {formSubtitle && (
                        <p className="text-white/85 text-[11px] drop-shadow-sm line-clamp-2 w-full">
                          {formSubtitle}
                        </p>
                      )}
                      {formButtons.length > 0 && (
                        <div
                          className={`flex flex-wrap gap-1.5 mt-1 w-full ${
                            formTextAlign === "right"
                              ? "justify-start"
                              : formTextAlign === "left"
                              ? "justify-end"
                              : "justify-center"
                          }`}
                        >
                          {formButtons.map((btn, i) => (
                            <span
                              key={i}
                              className={`text-[9px] px-2.5 py-1 rounded-full font-bold shadow-sm ${
                                btn.variant === "primary"
                                  ? "bg-[var(--red)] text-white"
                                  : "border border-white/60 text-white bg-black/25 backdrop-blur-sm"
                              }`}
                            >
                              {btn.text || `زر ${i + 1}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Active Status Toggle (Eye switch) ── */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      formIsActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {formIsActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      حالة الظهور: {formIsActive ? "نشطة (تظهر في الموقع)" : "مخفية (معطلة مؤقتاً)"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formIsActive
                        ? "هذه الشريحة ستكون ظاهرة لجميع زوار الصفحة الرئيسية"
                        : "لن تظهر هذه الشريحة في السلايدر الرئيسي حتى تعيد تفعيلها"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    formIsActive ? "bg-green-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      formIsActive ? "right-1" : "right-7"
                    }`}
                  />
                </button>
              </div>

              {/* ── Text Alignment ── */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  موضع ومحاذاة النص على الشريحة *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ALIGN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormTextAlign(opt.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formTextAlign === opt.value
                          ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  اختر &quot;يمين&quot; لمحاذاة النص والزر إلى يمين الشاشة، أو &quot;وسط&quot; للوسط، أو &quot;يسار&quot; لليسار.
                </p>
              </div>

              {/* ── Overlay Opacity ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-foreground">
                    شفافية الظل الداكن (Overlay)
                  </label>
                  <span className="text-xs font-bold text-primary font-mono">
                    {formOverlay}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={formOverlay}
                  onChange={(e) => setFormOverlay(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  الظل الداكن يساعد في وضوح قراءة النصوص فوق خلفية الصورة (الموصى به 45% - 60%).
                </p>
              </div>

              {/* ── Title ── */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  العنوان الرئيسي للشريحة *
                </label>
                <textarea
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  rows={2}
                  placeholder="مستلزمات طباعة احترافية&#10;بأعلى جودة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-medium leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  يمكنك استخدام زر Enter لتقسيم العنوان على سطرين.
                </p>
              </div>

              {/* ── Subtitle ── */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  النص الوصفي (اختياري)
                </label>
                <textarea
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  rows={2}
                  placeholder="روايال إنك شريكك في توفير مستلزمات طباعة عالية الجودة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* ── Sort Order ── */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  رقم الترتيب في العرض
                </label>
                <input
                  type="number"
                  min={1}
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-28 px-3.5 py-2 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold"
                />
              </div>

              {/* ── Buttons CTA ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-foreground">
                    أزرار الدعوة للإجراء (CTA Buttons)
                  </label>
                  {formButtons.length < 2 && (
                    <button
                      type="button"
                      onClick={addButton}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة زر
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {formButtons.map((btn, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-xl p-3.5 space-y-2.5 bg-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground">
                          الزر {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeButton(i)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                          title="حذف الزر"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-0.5">
                            نص الزر
                          </label>
                          <input
                            type="text"
                            placeholder="تواصل معنا"
                            value={btn.text}
                            onChange={(e) => updateButton(i, "text", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-0.5">
                            رابط الزر (Href)
                          </label>
                          <input
                            type="text"
                            placeholder="/contact أو رابط خارجي"
                            value={btn.href}
                            onChange={(e) => updateButton(i, "href", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => updateButton(i, "variant", "primary")}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            btn.variant === "primary"
                              ? "bg-[var(--red)] text-white shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          ملوّن باللون الأحمر (Primary)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateButton(i, "variant", "outline")}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            btn.variant === "outline"
                              ? "bg-foreground text-background shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          مفرّغ أبيض شفاف (Outline)
                        </button>
                      </div>
                    </div>
                  ))}

                  {formButtons.length === 0 && (
                    <p className="text-[11px] text-muted-foreground py-2 text-center bg-muted/10 rounded-xl border border-dashed border-border">
                      لم يتم إضافة أزرار لهذه الشريحة بعد.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-border bg-muted/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingSlide ? "حفظ التعديلات" : "إنشاء الشريحة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          IMAGE CROPPER MODAL (Unified Aspect Ratio for all slides)
          ═══════════════════════════════════════════════════════════ */}
      {isCropperOpen && selectedFileForCrop && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={selectedFileForCrop}
          onClose={() => {
            setIsCropperOpen(false);
            setSelectedFileForCrop(null);
          }}
          onCropComplete={handleCropCompleted}
          aspectRatio={16 / 9}
          aspectRatioOptions={SLIDE_ASPECT_RATIOS}
          title="قص وتوحيد أبعاد شريحة الواجهة"
          subtitle="اضبط موضع الصورة داخل الإطار لضمان تساوي وتناسق جميع صور السلايدر"
          recommendedSizeText="1920 × 960 بكسل (أو 1920 × 1080 بكسل) بنسبة أبعاد 16:9 أو 2:1 ودقة 72 إلى 150 DPI لتتناسب تماماً مع شاشات الحواسيب والهواتف."
        />
      )}
    </div>
  );
}
