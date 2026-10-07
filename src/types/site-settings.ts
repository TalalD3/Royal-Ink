/* ══════════════════════════════════════════════════════════════════════
   SITE SETTINGS — company details the admin can change without a
   developer: phones, email, address, opening hours, map link, social
   accounts, the contact page's photos, facts and FAQ, and the online
   store address. Stored as one document in MongoDB ("settings"); these
   defaults are used until the admin saves, and fill any missing field.
   ══════════════════════════════════════════════════════════════════════ */

export type SocialId = "facebook" | "instagram" | "tiktok" | "whatsapp" | "youtube" | "linkedin" | "x";

/** Every platform the site can show, in display order */
export const SOCIAL_PLATFORMS: {
  id: SocialId;
  name: string;
  urlExample: string;
  handleExample: string;
}[] = [
  { id: "facebook", name: "فيسبوك", urlExample: "https://www.facebook.com/royalink.dz", handleExample: "Royal Ink" },
  { id: "instagram", name: "إنستغرام", urlExample: "https://www.instagram.com/royalink.dz/", handleExample: "@royalink.dz" },
  { id: "tiktok", name: "تيك توك", urlExample: "https://www.tiktok.com/@royalink.dz", handleExample: "@royalink.dz" },
  { id: "whatsapp", name: "واتساب", urlExample: "https://wa.me/213666509941", handleExample: "+213 666 50 99 41" },
  { id: "youtube", name: "يوتيوب", urlExample: "https://www.youtube.com/@royalink", handleExample: "Royal Ink" },
  { id: "linkedin", name: "لينكدإن", urlExample: "https://www.linkedin.com/company/royalink", handleExample: "Royal Ink" },
  { id: "x", name: "إكس (تويتر)", urlExample: "https://x.com/royalink", handleExample: "@royalink" },
];

export interface SocialAccount {
  id: SocialId;
  /** Shown under the platform name, e.g. "@royalink.dz" */
  handle: string;
  /** The account's address; an account without one is never shown */
  url: string;
  /** Shown on the site (when it also has an address) */
  enabled: boolean;
}

export interface SiteImage {
  url: string;
  /** UploadThing file key (empty for the site's own pictures) */
  key?: string;
}

export interface FaqItem {
  q: string;
  /** Plain text; [words](/page) becomes a link */
  a: string;
}

export interface SiteSettings {
  phones: string[];
  email: string;
  address: string;
  /** Opening hours, e.g. "السبت – الخميس: 8:00 – 17:00" — hidden when empty */
  hours: string;
  /** Google Maps link to the store (directions button) */
  mapsUrl: string;
  socials: SocialAccount[];
  contactHeroImage: SiteImage;
  storeImage: SiteImage;
  /** The short facts under the contact page title */
  contactFacts: string[];
  faq: FaqItem[];
  /** The online store; empty = the shop buttons show "coming soon" */
  onlineStoreUrl: string;
  /** Where contact-form messages are emailed (not shown on the site) */
  formRecipient: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phones: ["+213 666 50 99 41", "+213 550 89 94 84"],
  email: "royalinkdz@gmail.com",
  address: "دبي، مدينة العلمة 19001 — ولاية سطيف",
  hours: "",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Royal Ink, Dubai, El Eulma, Sétif, Algeria"),
  socials: [
    { id: "facebook", handle: "Royal Ink", url: "", enabled: true },
    { id: "instagram", handle: "@royalink.dz", url: "https://www.instagram.com/royalink.dz/", enabled: true },
    { id: "tiktok", handle: "", url: "", enabled: false },
    { id: "whatsapp", handle: "", url: "", enabled: false },
    { id: "youtube", handle: "", url: "", enabled: false },
    { id: "linkedin", handle: "", url: "", enabled: false },
    { id: "x", handle: "", url: "", enabled: false },
  ],
  contactHeroImage: { url: "/images/ri1.jpg" },
  storeImage: { url: "/images/store-el-eulma.jpg" },
  contactFacts: ["توصيل إلى 58 ولاية", "متجر في العلمة، ولاية سطيف", "مساعدة في اختيار المستلزم المناسب"],
  faq: [
    {
      q: "كيف أختار المستلزم المناسب لطابعتي؟",
      a: "ابحثوا عن طراز الطابعة على واجهتها أو على ملصقها الخلفي، أو عن الكود المطبوع على الخرطوشة الحالية، ثم اكتبوه في [دليل التوافق](/compatibility) لتظهر لكم المستلزمات المتوافقة. وإن لم تجدوها، أرسلوا لنا الطراز أو صورة الملصق ونرشدكم إلى المستلزم الصحيح.",
    },
    {
      q: "هل منتجات ROYALiNK من صنع الشركة المصنّعة للطابعة؟",
      a: "لا. ROYALiNK علامتنا الخاصة لمستلزمات طباعة متوافقة، تُصنع لتعمل مع طابعات العلامات العالمية مثل HP وCanon وEpson وBrother. تُذكر أسماء هذه العلامات للدلالة على التوافق فقط، وتمر منتجاتنا بمراحل [مراقبة الجودة](/quality) قبل وصولها إليكم.",
    },
    {
      q: "وصلني منتج تالف أو يسرّب الحبر، ماذا أفعل؟",
      a: "لا تركّبوا المنتج في الطابعة. صوّروا المنتج وعلبته، ثم تواصلوا معنا أو مع نقطة البيع التي اشتريتم منها مع ذكر رقم الفاتورة، وسيدرس فريقنا الحالة ويقترح عليكم الحل المناسب.",
    },
    {
      q: "هل يمكن استبدال منتج لا يعمل بشكل صحيح؟",
      a: "نعم، تواصلوا معنا مع الفاتورة وطراز الطابعة ووصف المشكلة (صورة أو صفحة اختبار تساعدنا كثيراً). بعد التحقق من الحالة، نعمل على استبدال المنتج عند ثبوت عيب فيه.",
    },
    {
      q: "أين يمكنني شراء منتجات روايال إنك؟",
      a: "من متجرنا الرئيسي في العلمة، ولاية سطيف، أو من [نقاط البيع المعتمدة](/find-us) في مختلف الولايات. وللمؤسسات والمهنيين، يمكن الطلب مباشرة عبر نموذج التواصل في هذه الصفحة.",
    },
    {
      q: "هل توفرون مستلزمات للطابعات القديمة؟",
      a: "كثير من الطرازات القديمة ما زالت تستعمل مستلزمات متوفرة لدينا. ابحثوا بطراز طابعتكم في [دليل التوافق](/compatibility)، وإن لم يظهر، أرسلوا لنا الطراز وكود الخرطوشة القديمة لنتحقق من التوفر.",
    },
    {
      q: "كيف أتأكد أن منتج ROYALiNK أصلي؟",
      a: "اشتروا من متجرنا أو من [نقاط البيع المعتمدة](/find-us)، وتأكدوا أن العلبة تحمل شعار ROYALiNK وكود المنتج. وإن ساوركم شك، أرسلوا لنا صورة العلبة واسم البائع لنتحقق.",
    },
  ],
  onlineStoreUrl: "",
  formRecipient: "royalink.support@gmail.com",
};

/** Missing or partial saved settings, completed from the defaults. Socials
    always come back for every platform, in display order. */
export function completeSettings(saved: Partial<SiteSettings> | null | undefined): SiteSettings {
  const s = saved ?? {};
  const d = DEFAULT_SITE_SETTINGS;
  const pick = <T,>(v: T | undefined, fallback: T) => (v === undefined || v === null ? fallback : v);
  return {
    phones: s.phones?.length ? s.phones : d.phones,
    email: pick(s.email, d.email),
    address: pick(s.address, d.address),
    hours: pick(s.hours, d.hours),
    mapsUrl: pick(s.mapsUrl, d.mapsUrl),
    socials: SOCIAL_PLATFORMS.map(
      (p) =>
        s.socials?.find((a) => a.id === p.id) ??
        d.socials.find((a) => a.id === p.id) ?? { id: p.id, handle: "", url: "", enabled: false }
    ),
    contactHeroImage: s.contactHeroImage?.url ? s.contactHeroImage : d.contactHeroImage,
    storeImage: s.storeImage?.url ? s.storeImage : d.storeImage,
    contactFacts: pick(s.contactFacts, d.contactFacts),
    faq: pick(s.faq, d.faq),
    onlineStoreUrl: pick(s.onlineStoreUrl, d.onlineStoreUrl),
    formRecipient: s.formRecipient || d.formRecipient,
  };
}

/** The accounts to show: switched on and with an address */
export function visibleSocials(s: SiteSettings): SocialAccount[] {
  return s.socials.filter((a) => a.enabled && a.url);
}

export const platformName = (id: SocialId) => SOCIAL_PLATFORMS.find((p) => p.id === id)?.name ?? id;

/** tel: link for a phone written with spaces */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Link to a product in the online store — by default a search for its code */
export function storeUrlFor(storeUrl: string, code: string | undefined): string | null {
  if (!storeUrl) return null;
  if (!code) return storeUrl;
  const sep = storeUrl.includes("?") ? "&" : "?";
  return `${storeUrl}${sep}q=${encodeURIComponent(code)}`;
}
