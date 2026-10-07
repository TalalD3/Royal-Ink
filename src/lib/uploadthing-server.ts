import { UTApi } from "uploadthing/server";
import { productsCol, settingsCol, slidesCol } from "@/lib/db/collections";

/* ══════════════════════════════════════════════════════════════════════
   UPLOADTHING — server side
   Images (product photos, hero slides) are stored on UploadThing. The
   database keeps each image's address and its file key; the key is what
   lets us delete the file when the image is replaced or its item deleted.
   UPLOADTHING_TOKEN (in .env.local / the host's panel) is read here and by
   the upload route; it is never sent to the browser.
   ══════════════════════════════════════════════════════════════════════ */

let api: UTApi | null = null;
const utapi = () => (api ??= new UTApi());

/** The app id inside UPLOADTHING_TOKEN — public: it is part of every file address */
export function uploadthingAppId(): string | null {
  const token = process.env.UPLOADTHING_TOKEN?.trim().replace(/^['"]|['"]$/g, "");
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf8")).appId ?? null;
  } catch {
    return null;
  }
}

/** The file key of an address on this app's UploadThing storage, else undefined */
export function uploadKeyFromUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const appId = uploadthingAppId();
    const ours = (appId !== null && u.hostname === `${appId}.ufs.sh`) || u.hostname === "utfs.io";
    const m = u.pathname.match(/^\/f\/([^/]+)$/);
    return ours && m ? decodeURIComponent(m[1]) : undefined;
  } catch {
    return undefined;
  }
}

/** Removes files that are no longer used — a key still used by another
    product, slide or the site settings (the same address pasted twice) is kept. A failure is
    logged, never thrown, so a storage hiccup never blocks a save or a delete. */
export async function deleteUploadedFiles(keys: (string | undefined | null)[]): Promise<void> {
  let list = Array.from(new Set(keys.filter((k): k is string => !!k)));
  if (list.length === 0) return;
  try {
    const filter = { "image.key": { $in: list } };
    const [products, slides, settings] = await Promise.all([productsCol(), slidesCol(), settingsCol()]);
    const site = await settings.findOne({ _id: "site" }, { projection: { contactHeroImage: 1, storeImage: 1 } });
    const inUse = new Set([
      ...[
        ...(await products.find(filter, { projection: { image: 1 } }).toArray()),
        ...(await slides.find(filter, { projection: { image: 1 } }).toArray()),
      ].map((d) => d.image?.key),
      site?.contactHeroImage?.key,
      site?.storeImage?.key,
    ]);
    list = list.filter((k) => !inUse.has(k));
    if (list.length === 0) return;
    await utapi().deleteFiles(list);
  } catch (err) {
    console.error(`[uploadthing] could not delete ${list.length} old file(s):`, (err as Error).message);
  }
}
