"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  ZoomIn,
  ZoomOut,
  Check,
  X,
  RotateCw,
  Crop as CropIcon,
  Sparkles,
  Info,
  Maximize2,
} from "lucide-react";

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

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

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
    pixelCrop.width,
    pixelCrop.height
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photoshop Recommendation Box */}
        {recommendedSizeText && (
          <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/15 px-5 sm:px-6 py-2.5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-foreground/90 space-y-0.5">
              <p className="font-bold text-primary">
                المقاس الموصى به لتصميم Photoshop:
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {recommendedSizeText}
              </p>
            </div>
          </div>
        )}

        {/* Cropper Viewport */}
        <div className="relative w-full h-72 sm:h-96 bg-neutral-950 overflow-hidden select-none">
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

        {/* Aspect Ratio Selector if options provided */}
        {aspectRatioOptions && aspectRatioOptions.length > 1 && (
          <div className="px-5 sm:px-6 pt-3 pb-1 flex items-center gap-2 border-t border-border/40 bg-muted/10">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0">
              نسبة الأبعاد:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {aspectRatioOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setCurrentAspect(opt.ratio)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    Math.abs(currentAspect - opt.ratio) < 0.01
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-card">
          {/* Zoom & Rotation bar */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono font-bold text-muted-foreground w-12 text-left">
              {Math.round(zoom * 100)}%
            </span>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              title="تدوير الصورة 90 درجة"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground text-center">
            اسحب الصورة بالفأرة لضبط موضعها داخل الإطار، واستخدم شريط التكبير للاقتراب أو الابتعاد.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={handleConfirmCrop}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{processing ? "جاري القص والمعالجة..." : "اعتماد وقص الصورة"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropperModal;
