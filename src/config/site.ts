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

/** The company's contact details, as shown on the contact page */
export const CONTACT = {
  phones: ["+213 666 50 99 41", "+213 550 89 94 84"],
  email: "royalinkdz@gmail.com",
  city: "العلمة، ولاية سطيف",
  address: "دبي، العلمة 19001 — ولاية سطيف",
} as const;

/** Official accounts. A null address shows the name without a link —
    add the Facebook page address here once it is known. */
export const SOCIAL_LINKS: { id: "facebook" | "instagram"; name: string; handle: string; url: string | null }[] = [
  { id: "facebook", name: "فيسبوك", handle: "Royal Ink", url: null },
  { id: "instagram", name: "إنستغرام", handle: "@royalink.dz", url: "https://www.instagram.com/royalink.dz/" },
];
