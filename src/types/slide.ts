/* ──────────────────────────────────────────────────────────────────────
   HERO SLIDE TYPES
   ────────────────────────────────────────────────────────────────────── */

export type SlideTextAlign = "right" | "center" | "left";

export interface SlideButton {
  text: string;
  href: string;
  /** "primary" = filled brand-red, "outline" = bordered white */
  variant: "primary" | "outline";
}

export interface HeroSlide {
  id: string;
  /** Display order (lower = first) */
  sort_order: number;
  /** Background image URL (absolute or relative to /public) */
  image_url: string;
  /** Dark overlay opacity 0–100 applied over the image */
  overlay_opacity: number;
  /** Headline text */
  title: string;
  /** Optional subtitle / description */
  subtitle: string;
  /** Text alignment on slide */
  text_align: SlideTextAlign;
  /** Up to 2 CTA buttons */
  buttons: SlideButton[];
  /** Whether this slide is shown on the public site */
  is_active: boolean;
  created_at?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   DEFAULT SLIDES (used as fallback when Supabase table doesn't exist)
   ────────────────────────────────────────────────────────────────────── */

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    sort_order: 1,
    image_url: "/images/ink-cartridges.jpg",
    overlay_opacity: 45,
    title: "مستلزمات طباعة احترافية\nبأعلى جودة",
    subtitle:
      "روايال إنك شريكك في توفير مستلزمات طباعة عالية الجودة ومتوافقة مع أبرز الطابعات العالمية.",
    text_align: "right",
    buttons: [
      { text: "تواصل معنا", href: "/contact", variant: "primary" },
      { text: "تعرف علينا", href: "/about", variant: "outline" },
    ],
    is_active: true,
  },
  {
    id: "default-2",
    sort_order: 2,
    image_url: "/images/hero-printers-supplies.jpg",
    overlay_opacity: 50,
    title: "ابحث عن الحبر المتوافق\nمع طابعتك",
    subtitle:
      "أدخل موديل طابعتك واحصل فوراً على المنتج المتوافق المضمون — بلا حيرة، وبلا خطأ في الاختيار.",
    text_align: "center",
    buttons: [
      { text: "افتح دليل التوافق", href: "/compatibility", variant: "primary" },
    ],
    is_active: true,
  },
  {
    id: "default-3",
    sort_order: 3,
    image_url: "/images/algeria-distribution-cover.jpg",
    overlay_opacity: 55,
    title: "شبكة توزيع وطنية\nتغطي 58 ولاية",
    subtitle:
      "تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة واسعة من الموزعين ونقاط البيع.",
    text_align: "right",
    buttons: [
      { text: "اكتشف نقاط البيع", href: "/find-us", variant: "primary" },
    ],
    is_active: true,
  },
  {
    id: "default-4",
    sort_order: 4,
    image_url: "/images/timeline-workshop.jpg",
    overlay_opacity: 60,
    title: "من ورشة صغيرة\nإلى علامة وطنية",
    subtitle:
      "أكثر من 15 سنة من الخبرة في مجال الطباعة والتوزيع — اكتشف مسيرتنا الكاملة.",
    text_align: "center",
    buttons: [
      { text: "اكتشف قصتنا", href: "/about", variant: "primary" },
    ],
    is_active: true,
  },
  {
    id: "default-5",
    sort_order: 5,
    image_url: "/images/hero-office.jpg",
    overlay_opacity: 50,
    title: "زوروا متجرنا\nفي مدينة العلمة",
    subtitle:
      "تعرف على تشكيلتنا الكاملة من الطابعات ومستلزمات الطباعة في معرضنا.",
    text_align: "center",
    buttons: [
      { text: "موقعنا على الخريطة", href: "/find-us", variant: "primary" },
      { text: "اتصل بنا", href: "/contact", variant: "outline" },
    ],
    is_active: true,
  },
];
