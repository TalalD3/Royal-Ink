"use client";

import React, { useState, useEffect } from "react";
import type { HeroSlide, SlideTextAlign, SlideButton } from "@/types/slide";
import { DEFAULT_SLIDES } from "@/types/slide";
import { ImageCropperModal, AspectRatioOption } from "@/components/ui/image-cropper-modal";
import { uploadAdminImage } from "@/lib/uploadthing-client";
import {
  Btn,
  EmptyState,
  Field,
  FormSection,
  IconBtn,
  LoadingBlock,
  Modal,
  Notice,
  SectionHead,
  StatStrip,
  Toast,
  Toggle,
  inputCls,
  textareaCls,
} from "@/components/admin/admin-ui";
import {
  ChevronDown,
  ChevronUp,
  Crop as CropIcon,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Helpers ─── */
async function apiCall(
  method: string,
  body?: any,
  query?: string
): Promise<any> {
  const url = `/api/admin/slides${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
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

const pad = (n: number) => String(n).padStart(2, "0");

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

/** What the designer needs to know before exporting a slide image */
const IMAGE_GUIDE = [
  { label: "المقاس الموصى به", value: "1920 × 960 px", note: "أو 1920 × 1080 px" },
  { label: "نسبة الأبعاد", value: "16:9 أو 2:1", note: "متناسقة على كل الشاشات" },
  { label: "الدقة والصيغة", value: "72–150 DPI", note: "WebP أو JPG" },
];

/* ─── The hero, in small: black block, red block, photo across the seam ─── */
function HeroPreview({
  imageUrl,
  imageError,
  onImageError,
  title,
  subtitle,
  buttons,
}: {
  imageUrl: string;
  imageError: boolean;
  onImageError: () => void;
  title: string;
  subtitle: string;
  buttons: SlideButton[];
}) {
  return (
    <div className="relative isolate overflow-hidden bg-brand-black text-white">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-24 bg-brand-red sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[36%]"
      />
      <div
        aria-hidden="true"
        className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_top,#000,transparent_45%)] sm:[mask-image:linear-gradient(to_right,#000,transparent_55%)]"
      />
      <div className="grid items-center gap-5 p-5 sm:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] sm:gap-7 sm:p-7">
        <div className="ri-crop ri-crop-light">
          <div className="relative aspect-video overflow-hidden bg-brand-black shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)]">
            {imageUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" onError={onImageError} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-white/45">
                <ImageIcon className="h-7 w-7" aria-hidden="true" />
                <span className="text-xs font-bold">
                  {imageUrl ? "تعذر تحميل الصورة من هذا الرابط" : "ارفع صورة لتظهر هنا"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className="ri-eyebrow ri-eyebrow-light mb-2.5">
            <span dir="ltr" lang="en" className="text-[10px] font-bold uppercase tracking-[0.22em]">
              Exceed your vision
            </span>
          </p>
          <p className="whitespace-pre-line text-xl font-extrabold leading-snug sm:text-[1.35rem]">
            {title.trim() || "العنوان الرئيسي للشريحة"}
          </p>
          {subtitle.trim() && <p className="mt-2.5 line-clamp-3 text-[13px] leading-6 text-white/75">{subtitle}</p>}
          {buttons.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {buttons.map((btn, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex h-8 items-center px-3 text-[11px] font-bold",
                    btn.variant === "primary" ? "bg-brand-red text-white" : "border border-white/60 text-white"
                  )}
                >
                  {btn.text.trim() || `الزر ${i + 1}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function AdminSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUsingDatabase, setIsUsingDatabase] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [modalError, setModalError] = useState("");

  // Form fields (alignment and overlay are no longer shown in the hero,
  // but their saved values are kept as they are)
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
        setIsUsingDatabase(!!json.isUsingDatabase);
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
    setFormButtons(slide.buttons ? slide.buttons.map((b) => ({ ...b })) : []);
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
      const { url } = await uploadAdminImage(croppedBlob, `slide-${Date.now()}.webp`);
      setFormImageUrl(url);
      setImagePreviewError(false);
      showToast("تم قص ورفع الصورة بنجاح!");
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
    setFormButtons((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  function removeButton(index: number) {
    setFormButtons(formButtons.filter((_, i) => i !== index));
  }

  // ─── Render ───────────────────────────────────────────────────
  if (loading) {
    return <LoadingBlock label="جارٍ تحميل شرائح الواجهة الرئيسية…" />;
  }

  const activeCount = slides.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} tone={toast.type} />}

      <SectionHead
        eyebrow="الواجهة الرئيسية"
        title="شرائح الواجهة"
        description="الصور والنصوص والأزرار التي تظهر في أعلى الصفحة الرئيسية، بالترتيب الذي تختاره."
        actions={
          <Btn variant="red" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateModal}>
            إضافة شريحة
          </Btn>
        }
      />

      <StatStrip
        items={[
          { label: "إجمالي الشرائح", value: slides.length, icon: <Layers className="h-5 w-5" aria-hidden="true" /> },
          { label: "معروضة في الموقع", value: activeCount, icon: <Eye className="h-5 w-5" aria-hidden="true" /> },
          { label: "مخفية مؤقتاً", value: slides.length - activeCount, icon: <EyeOff className="h-5 w-5" aria-hidden="true" /> },
        ]}
      />

      {!isUsingDatabase && (
        <Notice tone="warning">
          قاعدة البيانات غير متاحة حالياً، لذلك تُعرض الشرائح الافتراضية ولن تُحفظ أي تغييرات.
        </Notice>
      )}

      {/* ── Slides ── */}
      {slides.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-6 w-6" aria-hidden="true" />}
          title="لا توجد شرائح حالياً"
          text="أضف أول شريحة للواجهة الرئيسية، أو استعد الشرائح الافتراضية."
          action={
            <Btn variant="red" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateModal}>
              إضافة شريحة
            </Btn>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide, idx) => (
            <article
              key={slide.id}
              className={cn(
                "group flex flex-col border bg-white transition-colors",
                slide.is_active ? "border-brand-line hover:border-brand-black" : "border-dashed border-brand-gray/40"
              )}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-brand-black">
                {slide.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.image_url}
                    alt=""
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                      !slide.is_active && "opacity-40 grayscale"
                    )}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/40">
                    <ImageIcon className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
                <span className="absolute start-0 top-0 flex h-10 min-w-10 items-center justify-center bg-brand-black px-2 text-sm font-extrabold tabular-nums text-white">
                  {pad(idx + 1)}
                </span>
                <span
                  className={cn(
                    "absolute end-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-extrabold leading-none",
                    slide.is_active ? "bg-white text-brand-black" : "bg-brand-black/80 text-white"
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5", slide.is_active ? "bg-brand-red" : "bg-white/50")}
                    aria-hidden="true"
                  />
                  {slide.is_active ? "معروضة" : "مخفية"}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="line-clamp-2 text-base font-extrabold leading-7 text-brand-black">
                  {slide.title.replace(/\n/g, " ")}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-brand-gray">
                  {slide.subtitle || "بدون نص وصفي"}
                </p>

                {slide.buttons && slide.buttons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {slide.buttons.map((btn, i) => (
                      <span
                        key={i}
                        className={cn(
                          "inline-flex max-w-full items-center gap-1.5 truncate px-2.5 py-1.5 text-[11px] font-bold leading-none",
                          btn.variant === "primary" ? "bg-brand-red text-white" : "border border-brand-line text-brand-black"
                        )}
                      >
                        {btn.text}
                        <span dir="ltr" className="opacity-60">
                          {btn.href}
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="min-h-4 flex-1" aria-hidden="true" />
                <div className="flex items-center justify-between gap-2 border-t border-brand-line pt-4">
                  <div className="flex items-center gap-1.5">
                    <IconBtn label="تقديم الشريحة" onClick={() => moveSlide(slide, "up")} disabled={idx === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="تأخير الشريحة"
                      onClick={() => moveSlide(slide, "down")}
                      disabled={idx === slides.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </IconBtn>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconBtn
                      label={slide.is_active ? "إخفاء من الصفحة الرئيسية" : "إظهار في الصفحة الرئيسية"}
                      tone={slide.is_active ? "active" : "default"}
                      onClick={() => toggleActive(slide)}
                    >
                      {slide.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </IconBtn>
                    <Btn
                      size="sm"
                      variant="black"
                      className="h-10"
                      icon={<Edit2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => openEditModal(slide)}
                    >
                      تعديل
                    </Btn>
                    <IconBtn label="حذف الشريحة" tone="danger" onClick={() => handleDelete(slide.id)}>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Footer / Reset ── */}
      <div className="flex flex-col gap-3 border-t border-brand-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-gray">
          تظهر في الموقع <span className="font-extrabold text-brand-black">{activeCount}</span> من أصل{" "}
          <span className="font-extrabold text-brand-black">{slides.length}</span> شرائح.
        </p>
        <Btn variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />} onClick={handleReset}>
          استعادة الشرائح الافتراضية
        </Btn>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL — Create / Edit Slide
          ═══════════════════════════════════════════════════════════ */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        eyebrow={editingSlide ? "تعديل شريحة" : "شريحة جديدة"}
        title={editingSlide ? "تعديل بيانات الشريحة" : "إضافة شريحة جديدة"}
        description="المعاينة في الأعلى تتحدث مباشرة وتعرض الشريحة كما ستظهر في الموقع."
        footer={
          <>
            <Btn variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Btn>
            <Btn
              variant="red"
              loading={saving}
              disabled={uploadingImage}
              icon={<Save className="h-4 w-4" aria-hidden="true" />}
              onClick={handleSave}
            >
              {editingSlide ? "حفظ التعديلات" : "إنشاء الشريحة"}
            </Btn>
          </>
        }
      >
        <div className="space-y-6">
          {modalError && <Notice tone="danger">{modalError}</Notice>}

          {/* Live preview */}
          <div>
            <p className="mb-2 text-[13px] font-extrabold text-brand-black">المعاينة المباشرة</p>
            <HeroPreview
              imageUrl={formImageUrl}
              imageError={imagePreviewError}
              onImageError={() => setImagePreviewError(true)}
              title={formTitle}
              subtitle={formSubtitle}
              buttons={formButtons}
            />
          </div>

          <FormSection title="صورة الشريحة" description="ارفع الصورة ثم اضبط إطارها، فتظهر كل الشرائح بنفس النسبة دون تشوّه.">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-4 border border-dashed border-brand-black/30 bg-brand-mist p-4 transition-colors hover:border-brand-red",
                  uploadingImage && "pointer-events-none opacity-60"
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand-black text-white">
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold text-brand-black">
                    {uploadingImage ? "جارٍ المعالجة والرفع…" : "رفع صورة من الجهاز وقصّها"}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-brand-gray">JPG أو PNG أو WebP</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingImage}
                  onChange={handleFileSelected}
                />
              </label>
              {formImageUrl && (
                <Btn
                  variant="outline"
                  className="h-auto min-h-11 py-3"
                  icon={<CropIcon className="h-4 w-4 text-brand-red" aria-hidden="true" />}
                  onClick={openCropperWithCurrent}
                >
                  إعادة قص الصورة
                </Btn>
              )}
            </div>

            <Field label="أو رابط الصورة مباشرة" htmlFor="slide-image-url">
              <input
                id="slide-image-url"
                type="text"
                value={formImageUrl}
                onChange={(e) => {
                  setFormImageUrl(e.target.value);
                  setImagePreviewError(false);
                }}
                placeholder="/images/ink-cartridges.jpg"
                className={cn(inputCls, "text-left")}
                dir="ltr"
              />
            </Field>

            {/* Designer guide */}
            <div className="grid gap-px border border-brand-line bg-brand-line sm:grid-cols-3">
              {IMAGE_GUIDE.map((g) => (
                <div key={g.label} className="flex items-center justify-between gap-3 bg-white p-3.5 sm:block">
                  <span className="text-xs font-bold text-brand-gray">{g.label}</span>
                  <span className="text-end sm:mt-1 sm:block sm:text-start">
                    <span dir="ltr" className="block text-sm font-extrabold text-brand-black">
                      {g.value}
                    </span>
                    <span className="block text-[11px] text-brand-gray">{g.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="النصوص">
            <Field label="العنوان الرئيسي" required htmlFor="slide-title" hint="اضغط Enter لتقسيم العنوان على سطرين.">
              <textarea
                id="slide-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                rows={2}
                placeholder={"مستلزمات طباعة احترافية\nبأعلى جودة"}
                className={textareaCls}
              />
            </Field>
            <Field label="النص الوصفي" hint="اختياري — سطر أو سطران يظهران تحت العنوان." htmlFor="slide-subtitle">
              <textarea
                id="slide-subtitle"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                rows={3}
                placeholder="روايال إنك شريكك في توفير مستلزمات طباعة عالية الجودة…"
                className={textareaCls}
              />
            </Field>
          </FormSection>

          <FormSection title="الأزرار" description="حتى زرين تحت النص: الأول أحمر ممتلئ عادةً، والثاني بإطار أبيض.">
            {formButtons.map((btn, i) => (
              <div key={i} className="border border-brand-line">
                <div className="flex items-center justify-between gap-3 border-b border-brand-line bg-brand-mist px-4 py-2.5">
                  <span className="text-[13px] font-extrabold text-brand-black">الزر {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeButton(i)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    حذف
                  </button>
                </div>
                <div className="space-y-4 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="نص الزر" htmlFor={`slide-btn-text-${i}`}>
                      <input
                        id={`slide-btn-text-${i}`}
                        type="text"
                        placeholder="تواصل معنا"
                        value={btn.text}
                        onChange={(e) => updateButton(i, "text", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="الرابط" htmlFor={`slide-btn-href-${i}`}>
                      <input
                        id={`slide-btn-href-${i}`}
                        type="text"
                        placeholder="/contact"
                        value={btn.href}
                        onChange={(e) => updateButton(i, "href", e.target.value)}
                        className={cn(inputCls, "text-left")}
                        dir="ltr"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 border border-brand-line" role="radiogroup" aria-label="شكل الزر">
                    {(
                      [
                        { v: "primary", label: "أحمر ممتلئ" },
                        { v: "outline", label: "إطار أبيض" },
                      ] as const
                    ).map((opt) => {
                      const on = btn.variant === opt.v;
                      return (
                        <button
                          key={opt.v}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => updateButton(i, "variant", opt.v)}
                          className={cn(
                            "flex h-10 items-center justify-center gap-2 text-[13px] font-bold transition-colors",
                            on ? "bg-brand-black text-white" : "bg-white text-brand-gray hover:text-brand-black"
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-3 w-5",
                              opt.v === "primary" ? "bg-brand-red" : "border border-current"
                            )}
                          />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {formButtons.length < 2 && (
              <button
                type="button"
                onClick={addButton}
                className="flex h-12 w-full items-center justify-center gap-2 border border-dashed border-brand-line text-sm font-bold text-brand-black transition-colors hover:border-brand-red hover:text-brand-red"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {formButtons.length === 0 ? "إضافة زر" : "إضافة زر ثانٍ"}
              </button>
            )}
          </FormSection>

          <FormSection title="الظهور والترتيب">
            <Toggle
              checked={formIsActive}
              onChange={setFormIsActive}
              label={formIsActive ? "الشريحة معروضة في الموقع" : "الشريحة مخفية مؤقتاً"}
              description={
                formIsActive
                  ? "تظهر لكل زوار الصفحة الرئيسية."
                  : "لن تظهر في الصفحة الرئيسية حتى تعيد تفعيلها."
              }
            />
            <Field label="رقم الترتيب" hint="الشرائح تُعرض من الأصغر إلى الأكبر." htmlFor="slide-order">
              <input
                id="slide-order"
                type="number"
                min={1}
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                className={cn(inputCls, "w-32 font-bold")}
              />
            </Field>
          </FormSection>
        </div>
      </Modal>

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
