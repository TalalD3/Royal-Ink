/* ══════════════════════════════════════════════════════════════════════
   SITE SETTINGS
   ══════════════════════════════════════════════════════════════════════ */

/** The online store. While null, every «تسوق من متجرنا» button shows as
    "coming soon"; set the address here and they all become live links. */
export const ONLINE_STORE_URL: string | null = null;

/** Link to a product in the store — by default a search for its code */
export function storeUrlFor(code: string | undefined): string | null {
  if (!ONLINE_STORE_URL) return null;
  if (!code) return ONLINE_STORE_URL;
  const sep = ONLINE_STORE_URL.includes("?") ? "&" : "?";
  return `${ONLINE_STORE_URL}${sep}q=${encodeURIComponent(code)}`;
}

export const CONTACT_PHONE = "+213666509941";
