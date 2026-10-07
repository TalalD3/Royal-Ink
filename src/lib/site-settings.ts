import { revalidateTag, unstable_cache } from "next/cache";
import { settingsCol } from "@/lib/db/collections";
import { hasDatabase } from "@/lib/mongodb";
import { uploadKeyFromUrl } from "@/lib/uploadthing-server";
import { completeSettings, DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

/* ══════════════════════════════════════════════════════════════════════
   SITE SETTINGS — server side (MongoDB "settings", document "site")
   Every page reads them through a cache; saving in the admin refreshes
   it at once (tag "settings"). Without a database the defaults are used.
   ══════════════════════════════════════════════════════════════════════ */

export const SETTINGS_TAG = "settings";
const DOC_ID = "site" as const;

async function readSettings(): Promise<SiteSettings> {
  if (!hasDatabase()) return DEFAULT_SITE_SETTINGS;
  try {
    const doc = await (await settingsCol()).findOne({ _id: DOC_ID });
    if (!doc) return DEFAULT_SITE_SETTINGS;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, updatedAt, ...saved } = doc;
    return completeSettings(saved);
  } catch (err) {
    console.error("[settings] database unavailable — using the defaults:", (err as Error).message);
    return DEFAULT_SITE_SETTINGS;
  }
}

/** For the public pages (cached) */
export const getSiteSettings = unstable_cache(readSettings, ["site-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: 300,
});

/** For the admin (always fresh) */
export const getSiteSettingsFresh = readSettings;

/** Saves the whole settings; returns the keys of uploaded photos that were
    replaced, so those files can be deleted */
export async function saveSiteSettings(input: SiteSettings): Promise<{ settings: SiteSettings; replacedImageKeys: string[] }> {
  const before = await readSettings();
  const withKeys: SiteSettings = {
    ...input,
    contactHeroImage: { url: input.contactHeroImage.url, key: uploadKeyFromUrl(input.contactHeroImage.url) },
    storeImage: { url: input.storeImage.url, key: uploadKeyFromUrl(input.storeImage.url) },
  };
  const settings = completeSettings(withKeys);
  await (await settingsCol()).updateOne(
    { _id: DOC_ID },
    { $set: { ...settings, updatedAt: new Date() } },
    { upsert: true }
  );
  revalidateTag(SETTINGS_TAG);

  const kept = new Set([settings.contactHeroImage.key, settings.storeImage.key]);
  const replacedImageKeys = [before.contactHeroImage.key, before.storeImage.key].filter(
    (k): k is string => !!k && !kept.has(k)
  );
  return { settings, replacedImageKeys };
}
