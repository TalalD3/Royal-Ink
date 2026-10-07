import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { currentAdmin } from "@/lib/session";

/* ══════════════════════════════════════════════════════════════════════
   UPLOAD ROUTES (UploadThing file router)
   One route: an image, one file at a time, at most 4 MB, and only for a
   logged-in admin — the check runs on the server before UploadThing
   accepts the file. The cropper already shrinks images well below that.
   ══════════════════════════════════════════════════════════════════════ */

const f = createUploadthing();

export const uploadRouter = {
  /** Product photos and hero slide images */
  adminImage: f(
    { image: { maxFileSize: "4MB", maxFileCount: 1 } },
    // The browser gets the address as soon as the file is stored, without
    // waiting for UploadThing's call back to this server
    { awaitServerData: false }
  )
    .middleware(async () => {
      const admin = await currentAdmin().catch(() => null);
      if (!admin) throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" });
      return { adminId: admin.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl, key: file.key })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
