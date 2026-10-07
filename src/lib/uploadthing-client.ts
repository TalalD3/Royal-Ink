import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";

/* UploadThing — browser side. The admin forms crop an image, then send it
   straight to UploadThing through /api/uploadthing (admin only). */

const { uploadFiles } = generateReactHelpers<UploadRouter>();

/** Uploads one cropped image; returns its address and file key */
export async function uploadAdminImage(blob: Blob, name: string): Promise<{ url: string; key: string }> {
  const file = new File([blob], name, { type: blob.type || "image/webp" });
  try {
    const [res] = await uploadFiles("adminImage", { files: [file] });
    if (!res?.ufsUrl) throw new Error("empty response");
    return { url: res.ufsUrl, key: res.key };
  } catch (err) {
    const msg = String((err as Error)?.message || "");
    if (/unauthori[sz]ed/i.test(msg)) throw new Error("انتهت جلسة الدخول. سجّل الدخول من جديد ثم أعد رفع الصورة.");
    if (/size|too large|FileSizeMismatch/i.test(msg)) throw new Error("الصورة أكبر من 4 ميغابايت. اختر صورة أصغر.");
    if (/type|InvalidFileType/i.test(msg)) throw new Error("يُقبل ملف صورة فقط (JPG أو PNG أو WebP).");
    throw new Error("تعذّر رفع الصورة. تحقق من الاتصال وحاول مجدداً.");
  }
}
