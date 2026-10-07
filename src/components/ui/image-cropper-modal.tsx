"use client";

import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { ZoomIn, ZoomOut, Check, X, RotateCw, Crop as CropIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AspectRatioOption {
  label: string;
  ratio: number;
  description?: string;
}

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
  aspectRatio?: number;
  title?: string;
  subtitle?: string;
  recommendedSizeText?: string;
  aspectRatioOptions?: AspectRatioOption[];
}

const MAX_OUTPUT_SIDE = 2400;

/** Utility to generate cropped Blob from Canvas */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<{ blob: Blob; url: string }> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context for crop canvas");

  // Handle rotation if present
  const rotRad = (rotation * Math.PI) / 180;
  const isRotated = rotation % 180 !== 0;

  // Large photos are scaled down (longest side 2400 px) — sharp on every
  // screen and well under the 4 MB upload limit
  const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(pixelCrop.width, pixelCrop.height));
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);

  // Use high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      },
      "image/webp",
      0.92
    );
  });
}

/* ══════════════════════════════════════════════════════════════════════
   IMAGE CROPPER — a square panel in the admin theme (full screen on
   phones), drawn above the form modal that opened it.
   ══════════════════════════════════════════════════════════════════════ */

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio: initialRatio = 16 / 9,
  title = "أداة قص وتوحيد أبعاد الصورة",
  subtitle = "قص الصورة بنسبة أبعاد متناسقة لتظهر باحترافية على جميع الشاشات",
  recommendedSizeText,
  aspectRatioOptions,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentAspect, setCurrentAspect] = useState<number>(initialRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setProcessing(true);
    try {
      const { blob, url } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(blob, url);
      onClose();
    } catch (err) {
      console.error("Failed to crop image:", err);
      alert("حدث خطأ أثناء معالجة وقص الصورة. حاول مجدداً.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-[75] flex items-stretch justify-center bg-brand-black/80 sm:items-center sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ri-strip flex w-full flex-col bg-white pt-[3px] sm:max-h-[95vh] sm:max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-line px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-black text-white">
              <CropIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold leading-6 text-brand-black">{title}</h3>
              <p className="mt-0.5 text-xs leading-5 text-brand-gray">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-black text-white transition-colors hover:bg-brand-red"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Recommended size */}
          {recommendedSizeText && (
            <div className="flex items-start gap-3 border-b border-brand-line bg-brand-mist px-5 py-3 sm:px-6">
              <span className="mt-1.5 h-2 w-2 shrink-0 bg-brand-red" aria-hidden="true" />
              <p className="text-xs leading-6 text-brand-black">
                <span className="font-extrabold">المقاس الموصى به: </span>
                {recommendedSizeText}
              </p>
            </div>
          )}

          {/* Cropper viewport */}
          <div className="relative h-72 w-full select-none overflow-hidden bg-brand-black sm:h-96">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={currentAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              cropShape="rect"
              showGrid={true}
            />
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            {/* Aspect ratio */}
            {aspectRatioOptions && aspectRatioOptions.length > 1 && (
              <div>
                <p className="mb-2 text-[13px] font-extrabold text-brand-black">نسبة الأبعاد</p>
                <div className="grid grid-cols-1 border border-brand-line sm:grid-cols-2" role="radiogroup" aria-label="نسبة الأبعاد">
                  {aspectRatioOptions.map((opt, i) => {
                    const on = Math.abs(currentAspect - opt.ratio) < 0.01;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setCurrentAspect(opt.ratio)}
                        className={cn(
                          "px-4 py-3 text-start transition-colors",
                          i > 0 && "border-t border-brand-line sm:border-s sm:border-t-0",
                          on ? "bg-brand-black text-white" : "bg-white text-brand-black hover:bg-brand-mist"
                        )}
                      >
                        <span dir="ltr" className="block text-sm font-extrabold">
                          {opt.label}
                        </span>
                        {opt.description && (
                          <span className={cn("mt-0.5 block text-xs leading-5", on ? "text-white/65" : "text-brand-gray")}>
                            {opt.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zoom & rotation */}
            <div>
              <p className="mb-2 text-[13px] font-extrabold text-brand-black">التكبير والتدوير</p>
              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 shrink-0 text-brand-gray" aria-hidden="true" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  aria-label="التكبير"
                  className="h-1.5 w-full cursor-pointer accent-[rgb(var(--brand-red))]"
                />
                <ZoomIn className="h-4 w-4 shrink-0 text-brand-gray" aria-hidden="true" />
                <span dir="ltr" className="w-12 shrink-0 text-center text-xs font-extrabold tabular-nums text-brand-black">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleRotate}
                  aria-label="تدوير الصورة 90 درجة"
                  title="تدوير الصورة 90 درجة"
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-brand-line text-brand-black transition-colors hover:border-brand-black"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-brand-gray">
                اسحب الصورة لضبط موضعها داخل الإطار، واستخدم شريط التكبير للاقتراب أو الابتعاد.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row-reverse gap-2 border-t border-brand-line bg-brand-mist px-4 py-3 [&>*]:flex-1 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4 sm:[&>*]:flex-none">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center border border-brand-line bg-white px-5 text-sm font-bold text-brand-black transition-colors hover:border-brand-black"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={processing}
            onClick={handleConfirmCrop}
            className="inline-flex h-11 items-center justify-center gap-2 bg-brand-red px-5 text-sm font-bold text-white transition-colors hover:bg-brand-black disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{processing ? "جارٍ القص…" : "اعتماد القص"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ImageCropperModal;
