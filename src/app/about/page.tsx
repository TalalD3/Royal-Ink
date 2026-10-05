"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  Building2,
  Check,
  Crosshair,
  Headphones,
  History,
  Laptop,
  Leaf,
  Lightbulb,
  Monitor,
  Package,
  Printer,
  RotateCcw,
  ScanLine,
  Shield,
  ShieldCheck,
  Store,
  Target,
  Truck,
  Wrench,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { BlockReveal } from "@/components/ui/block-reveal";
import { JourneyScroll, type JourneyEra } from "@/components/ui/journey-scroll";
import { ContactSplitCard } from "@/components/ui/contact-split-card";

/* ══════════════════════════════════════════════════════════════════════
   ABOUT PAGE — /about   (copy: "مقترح محتوى الموقع الإلكتروني")

   1. Header      — black block (title + three moments of the story) over
                    a red figures strip
   2. Journey     — the timeline, scrolled sideways (the page's centrepiece):
                    two strands — printing and importing — meeting in 2022
   3. Story       — who Titano Class / Royal Ink are, with the company card
   4. Activities  — ROYALiNK supplies, global-brand devices, our clients
   5. Vision & mission — the logo's two blocks, side by side
   6. Values      — six commitments on a ruled sheet
   7. Contact     — closing block
   ══════════════════════════════════════════════════════════════════════ */

/** Free Unsplash photos (Unsplash License) for the eras without our own */
const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=75`;

const PRINTING = "مسار الطباعة";
const IMPORTING = "مسار الاستيراد";

const ERAS: JourneyEra[] = [
  {
    year: "2007",
    path: PRINTING,
    title: "البداية من ورشة منزلية",
    text: "تعود جذور مؤسستنا إلى عام 2007، حين بدأ أحد مؤسسينا مسيرته في الطباعة من ورشة منزلية صغيرة. ومن التعامل اليومي مع الأجهزة والأحبار والخامات تشكّل إدراك عملي لما يحتاجه المهني، وما ينتظره من المنتج، وما يواجهه من تحديات أثناء الاستخدام.",
    points: [
      "ممارسة يومية للطباعة بمختلف مراحلها",
      "فهم أثر المستلزمات في جودة العمل وكلفته",
      "إدراك عملي لاحتياجات المهنيين",
    ],
    width: 84,
    photos: [
      {
        src: "/images/timeline-workshop.jpg",
        alt: "ورشة طباعة صغيرة فيها طابعة وخراطيش وأوراق اختبار",
        caption: "الورشة المنزلية، 2007",
        w: 46, h: 30, top: 9, right: 3, depth: 0.05,
      },
      {
        src: "/images/ink-cartridges.jpg",
        alt: "خراطيش حبر بالألوان الأربعة",
        caption: "الأحبار والخامات",
        w: 26, h: 19, top: 55, right: 60, depth: 0.12,
      },
    ],
    quote: {
      text: "بدأنا من شغف حقيقي بالطباعة...\nمن ورشة صغيرة إلى حلم كبير.",
      author: "— المؤسس",
      top: 56, right: 5, w: 40, depth: 0.1,
    },
  },
  {
    year: "2011",
    path: PRINTING,
    title: "ورشة طباعة متخصصة",
    text: "تطور المشروع إلى افتتاح ورشة متخصصة عام 2011، واتسعت مجالات العمل لتشمل تقنيات متعددة في الطباعة. ومع كل تقنية جديدة تكاملت الممارسة التقنية مع فهم متطلبات الإنتاج واحتياجات العملاء، وتعمّقت المعرفة بأثر المستلزمات في جودة العمل واستمراريته.",
    points: [
      "تقنيات متعددة في الطباعة الاحترافية",
      "فهم متطلبات الإنتاج واحتياجات العملاء",
      "معرفة بأثر المستلزمات في استمرارية العمل",
    ],
    width: 80,
    photos: [
      {
        src: U("photo-1693031630369-bd429a57f115"),
        alt: "طابعة كبيرة الحجم تطبع لافتة",
        caption: "الطباعة الرقمية، 2011",
        w: 40, h: 28, top: 8, right: 2, depth: 0.06,
      },
      {
        src: U("photo-1773525912476-213bff96b8a4"),
        alt: "آلة طباعة بالشاشة الحريرية بحبر أصفر",
        caption: "تقنيات طباعة متعددة",
        w: 28, h: 21, top: 54, right: 30, depth: 0.14,
      },
      {
        src: U("photo-1503694978374-8a2fa686963a"),
        alt: "آلة طباعة أثناء العمل",
        caption: "متطلبات الإنتاج",
        w: 20, h: 26, top: 12, right: 62, depth: 0.06,
      },
    ],
  },
  {
    year: "2012",
    path: IMPORTING,
    title: "خبرة في الاستيراد",
    text: "بالتوازي مع مسار الطباعة، بدأ شريكنا المؤسس عام 2012 مساره في استيراد مستلزمات الإعلام الآلي. ومن هذه التجربة تراكمت معرفة بمتطلبات التوريد، وبناء العلاقات التجارية، وتطوير شبكات التوزيع — المعرفة التي تقوم عليها شبكتنا اليوم.",
    points: [
      "معرفة بمتطلبات التوريد",
      "بناء العلاقات التجارية",
      "تطوير شبكات التوزيع",
    ],
    width: 86,
    photos: [
      {
        src: U("photo-1605732562742-3023a888e56e"),
        alt: "حاويات شحن برتقالية مكدسة",
        caption: "الاستيراد، 2012",
        w: 30, h: 38, top: 6, right: 3, depth: 0.05,
      },
      {
        src: "/images/hero-printers-supplies.jpg",
        alt: "طابعة وعلب تونر وعبوات حبر",
        caption: "مستلزمات الإعلام الآلي",
        w: 36, h: 20, top: 9, right: 44, depth: 0.08,
      },
      {
        src: U("photo-1590496793907-4d66e2994b4d"),
        alt: "ميناء حاويات ورافعات عند الغروب",
        caption: "التوريد",
        w: 40, h: 24, top: 54, right: 44, depth: 0.1,
      },
    ],
    quote: {
      text: "خبرةٌ بدأت من ممارسة الطباعة،\nوتطورت إلى معرفة بالمنتج والسوق.",
      author: "— تيتانو كلاس",
      top: 60, right: 2, w: 36, depth: 0.12,
    },
  },
  {
    year: "2017",
    path: "المساران",
    title: "وكالة إشهار وشركة استيراد",
    text: "في عام 2017 بلغ المساران مرحلة جديدة: تأسست وكالة اتصال وإشهار جمعت الممارسة التقنية بفهم احتياجات العملاء في الطباعة والإشهار، وأسّس شريكنا شركة متخصصة في استيراد مستلزمات الطباعة، أسهمت في تطوير علامة رسّخت حضورها في السوق الجزائري.",
    points: [
      "وكالة اتصال وإشهار — مسار الطباعة",
      "شركة لاستيراد مستلزمات الطباعة — مسار الاستيراد",
      "علامة رسّخت حضورها في السوق الجزائري",
    ],
    width: 78,
    photos: [
      {
        src: U("photo-1561070791-2526d30994b5"),
        alt: "دليل ألوان وعينات تصميم",
        caption: "الاتصال والإشهار، 2017",
        w: 42, h: 28, top: 8, right: 2, depth: 0.06,
      },
      {
        src: U("photo-1572044162444-ad60f128bdea"),
        alt: "مصمم يعمل على لوح رسم رقمي",
        caption: "احتياجات العملاء",
        w: 26, h: 20, top: 55, right: 8, depth: 0.12,
      },
      {
        src: U("photo-1758183961426-88d64eb5f787"),
        alt: "آلة طباعة صناعية بأسطوانات حبر",
        caption: "مستلزمات الطباعة",
        w: 24, h: 28, top: 50, right: 62, depth: 0.1,
      },
    ],
  },
  {
    year: "2022",
    path: "المساران معاً",
    title: "ميلاد تيتانو كلاس وروايال إنك",
    text: "في عام 2022 اجتمعت المسيرتان لتأسيس تيتانو كلاس بمدينة العلمة، ولاية سطيف، على قاعدة تجمع الخبرة الفنية في الطباعة والخبرة التجارية في استيراد مستلزماتها. ومن هذا المسار وُلدت روايال إنك، علامتنا الجزائرية المسجلة في مستلزمات الطباعة المتوافقة.",
    points: [
      "جودة الطباعة واستقرار الأداء",
      "المردود الفعلي والتوافق مع الأجهزة",
      "شبكة توزيع تصل إلى أغلب ولايات الوطن",
    ],
    width: 96,
    dark: true,
    photos: [
      {
        src: "/images/store-el-eulma.jpg",
        alt: "واجهة متجر روايال إنك في العلمة",
        caption: "متجرنا في العلمة، سطيف",
        w: 44, h: 30, top: 8, right: 2, depth: 0.06,
        position: "50% 35%",
      },
      {
        src: "/images/ri.jpg",
        alt: "خرطوشة روايال إنك بلون الماجنتا",
        caption: "العلامة المسجلة",
        w: 24, h: 24, top: 10, right: 56, depth: 0.08,
      },
      {
        src: "/images/algeria-distribution-cover.jpg",
        alt: "خريطة شبكة التوزيع من سطيف إلى ولايات الوطن",
        caption: "شبكة التوزيع الوطنية",
        w: 36, h: 20, top: 54, right: 50, depth: 0.1,
      },
    ],
    quote: {
      text: "اجتمعت المسيرتان\nلتأسيس علامة يطلبها\nالمستخدم بالاسم.",
      author: "— روايال إنك",
      top: 54, right: 4, w: 36, depth: 0.1,
    },
  },
];

/* Header visual: three moments of the story, uncovered one after the
   other — a preview of the timeline below */
const MOMENTS = [
  { src: "/images/timeline-workshop.jpg", year: "2007", label: "الورشة" },
  { src: "/images/hero-printers-supplies.jpg", year: "2012", label: "الاستيراد" },
  { src: "/images/ri.jpg", year: "2022", label: "روايال إنك" },
];

function AboutHeroVisual() {
  return (
    <div className="ri-crop ri-crop-light grid grid-cols-3 gap-2 sm:gap-3">
      {MOMENTS.map((m, i) => (
        <figure key={m.year}>
          <BlockReveal
            immediate
            delay={0.2 + i * 0.15}
            className="aspect-[3/4] bg-white/10"
          >
            <Image
              src={m.src}
              alt={m.label}
              fill
              priority
              sizes="(min-width: 1024px) 18vw, 32vw"
              className="object-cover"
            />
          </BlockReveal>
          <figcaption className="mt-3 flex items-center gap-2 text-xs font-bold text-white/60 sm:text-sm">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-brand-red" />
            <span dir="ltr" className="text-white">{m.year}</span>
            {m.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* Company card — the facts, printed like a product label */
const FACTS = [
  { k: "الشركة", v: "تيتانو كلاس" },
  { k: "العلامة المسجلة", v: "روايال إنك" },
  { k: "المقر", v: "العلمة، ولاية سطيف" },
  { k: "التأسيس", v: "2022" },
  { k: "النشاط", v: "استيراد الطابعات ومستلزماتها" },
  { k: "الخبرة", v: "في الطباعة منذ 2007" },
];

/* What ROYALiNK supplies cover */
const SUPPLIES = [
  "عبوات الأحبار",
  "خراطيش الحبر والتونر",
  "مساحيق التونر",
  "أشرطة التحبير",
  "وحدات الدرام والفيوزر",
  "قطع الغيار",
];

const DEVICES = [
  { icon: Printer, label: "طابعات" },
  { icon: ScanLine, label: "ماسحات ضوئية" },
  { icon: Monitor, label: "حواسيب مكتبية" },
  { icon: Laptop, label: "حواسيب محمولة" },
];

const CLIENTS = [
  { icon: Building2, label: "المؤسسات الإدارية والاقتصادية" },
  { icon: Shield, label: "الهيئات الأمنية ووحدات الجيش الوطني الشعبي" },
  { icon: Package, label: "موزعو الجملة" },
  { icon: Printer, label: "قاعات الطباعة المحترفة" },
  { icon: Wrench, label: "حرفيو الصيانة" },
  { icon: Store, label: "أصحاب المحلات، ولا سيما المكتبات ومحلات أجهزة الإعلام الآلي" },
];

const VALUES: {
  icon: React.ElementType;
  title: string;
  desc: string;
  link?: { href: string; label: string };
}[] = [
  {
    icon: ShieldCheck,
    title: "جودة ثابتة",
    desc: "تبدأ العناية بجودة منتجات روايال إنك أثناء التصنيع، حيث يسحب المصنع عينات عشوائية لاختبار وضوح المطبوعات ودقة الألوان ولمعانها، وتقييم الأداء تحت ظروف الحرارة والبرودة، وقياس المردود الطباعي في ظروف الاختبار. وتحمل عبواتنا إشارة إلى معيار ISO 9001 لإدارة الجودة، إلى جانب هذه الاختبارات العملية لمتابعة جودة الإنتاج.",
    link: { href: "/quality", label: "مراحل مراقبة الجودة" },
  },
  {
    icon: Target,
    title: "خبرة تقنية وتوافق مدروس",
    desc: "تستند إلى خبرة تتجاوز 16 عاماً في مجال الطباعة لفهم احتياجات المستخدمين والمهنيين واختيار المستلزمات المناسبة لها. وتخضع منتجاتنا لاختبارات فعلية على طابعات قبل اعتمادها وتصديرها، مع توضيح المراجع المتوافقة على العبوات لتسهيل الاختيار وتجنب استخدام مستلزم غير مناسب.",
    link: { href: "/compatibility", label: "دليل التوافق" },
  },
  {
    icon: Leaf,
    title: "مسؤولية بيئية",
    desc: "نهتم بالجوانب البيئية المرتبطة بمستلزمات الطباعة واستخدامها. وتتضمن العلامات المطبوعة على عبواتنا ISO 14001 للإدارة البيئية و REACH و RoHS المرتبطين بمتطلبات المواد الكيميائية وتقييد مواد معينة. ونشجع الاستخدام السليم وترشيد الاستهلاك للحد من الهدر.",
  },
  {
    icon: Headphones,
    title: "دعم خبير",
    desc: "نساعد عملاءنا وشركاءنا على تحديد المستلزم المناسب لطابعاتهم، ونقدم توجيهاً عملياً بشأن التوافق والاستخدام. ويوفر موقعنا جهات اتصال مخصصة للاستفسارات، إلى جانب قسم للأسئلة الشائعة يقدم إجابات واضحة عن اختيار المنتجات واستخدامها.",
    link: { href: "/contact", label: "تواصل معنا" },
  },
  {
    icon: Truck,
    title: "شبكة توزيع وطنية",
    desc: "تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة من الموزعين والوسطاء ونقاط البيع. ولتسهيل الوصول إليها، تعرض خريطة نقاط البيع على موقعنا مواقعها وبيانات الاتصال بها، لتساعدكم على العثور على أقرب بائع.",
    link: { href: "/find-us", label: "خريطة نقاط البيع" },
  },
  {
    icon: RotateCcw,
    title: "ثقة ومتابعة",
    desc: "نحرص على وضوح التعامل ومتابعة ملاحظات عملائنا بعد الشراء، ونلتزم باستبدال المنتج ذي العيب الصناعي في اليوم نفسه الذي نستلمه فيه. فرغم اختبارات مراقبة الجودة، قد تظهر عيوب صناعية بنحو 1% من المنتجات المصنعة، ويأتي التزامنا بالاستبدال لضمان معالجة هذه الحالات بسرعة والحفاظ على ثقتكم.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

/* Section heading: eyebrow + title on one side, a short line on the other */
function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <motion.div
      {...fadeUp}
      className="mb-10 flex flex-col gap-4 md:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
    >
      <div className="max-w-2xl">
        <p className="ri-eyebrow mb-4">{eyebrow}</p>
        <h2 className="ri-h2">{title}</h2>
      </div>
      <p className="ri-lead max-w-md">{lead}</p>
    </motion.div>
  );
}

/* One block of the vision / mission pair */
function Aim({
  icon: Icon,
  title,
  text,
  points,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  points: string[];
  tone: "red" | "black";
}) {
  const onRed = tone === "red";
  return (
    <div
      className={`relative isolate p-7 sm:p-10 lg:p-12 ${
        onRed ? "bg-brand-red" : "bg-brand-black"
      }`}
    >
      {!onRed && (
        <div
          aria-hidden="true"
          className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,#000,transparent_70%)]"
        />
      )}
      <span
        className={`flex h-12 w-12 items-center justify-center ${
          onRed ? "bg-white text-brand-red" : "bg-brand-red text-white"
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="mt-6 text-2xl font-extrabold sm:text-[1.75rem]">{title}</h3>
      <p
        className={`mt-4 text-[15px] leading-8 sm:text-base sm:leading-8 ${
          onRed ? "text-white" : "text-white/80"
        }`}
      >
        {text}
      </p>
      <ul className={`mt-6 space-y-3 border-t pt-6 ${onRed ? "border-white/30" : "border-white/15"}`}>
        {points.map((p) => (
          <li key={p} className="flex items-center gap-3 text-sm font-bold">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                onRed ? "bg-white text-brand-red" : "bg-brand-red text-white"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* A cell on a ruled sheet: black fill rising on hover, the icon tile
   turning red (same behaviour as the home categories) */
function RuledCell({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      className={`group relative isolate bg-white ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-brand-black transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
      />
      {children}
    </motion.div>
  );
}

const tile =
  "flex h-12 w-12 shrink-0 items-center justify-center bg-brand-mist text-brand-black transition-colors duration-300 group-hover:bg-brand-red group-hover:text-white";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. HEADER */}
      <PageHero
        crumb="من نحن"
        eyebrow="من نحن"
        title="نبتكر اليوم، نلهم الغد"
        lead="خبرةٌ بدأت من ممارسة الطباعة، وتطورت إلى معرفة بالمنتج والسوق، لتؤسس رؤيتنا للأعمال."
        visual={<AboutHeroVisual />}
        figures={[
          { value: "16+", label: "سنة من الخبرة" },
          { value: "1000+", label: "عميل وموزع" },
          { value: "58", label: "ولاية يصلها التوصيل" },
        ]}
      />

      {/* 2. JOURNEY */}
      <JourneyScroll
        eras={ERAS}
        intro={
          <>
            <p className="ri-eyebrow mb-5">مسيرتنا</p>
            <h2 className="text-[2rem] font-extrabold leading-[1.25] text-brand-black sm:text-[2.5rem] lg:text-[3.25rem]">
              رحلة النمو والتطور
            </h2>
            <p className="ri-lead mt-5">
              خبرةٌ بدأت من ممارسة الطباعة، وتطورت إلى معرفة بالمنتج والسوق.
              هذه قصة مسارين: مسار في الطباعة بدأ من ورشة منزلية صغيرة، ومسار
              في استيراد مستلزماتها — التقيا عام <span dir="ltr">2022</span>{" "}
              لتأسيس تيتانو كلاس وعلامتها روايال إنك.
            </p>
            {/* The two strands, as a legend for the labels on each year */}
            <dl className="mt-7 grid max-w-md grid-cols-2 border-t border-brand-line pt-5 text-sm">
              <div>
                <dt className="font-extrabold text-brand-black">{PRINTING}</dt>
                <dd className="mt-1 text-brand-gray">
                  منذ <span dir="ltr">2007</span>
                </dd>
              </div>
              <div className="border-s border-brand-line ps-5">
                <dt className="font-extrabold text-brand-black">{IMPORTING}</dt>
                <dd className="mt-1 text-brand-gray">
                  منذ <span dir="ltr">2012</span>
                </dd>
              </div>
            </dl>
          </>
        }
        outro={
          <>
            <p className="ri-eyebrow ri-eyebrow-onred mb-5">اليوم</p>
            <h2 className="text-[2rem] font-extrabold leading-[1.25] sm:text-[2.5rem] lg:text-[3rem]">
              رحلتنا مستمرة
            </h2>
            <p className="mt-5 text-base font-medium leading-8 sm:text-lg sm:leading-9">
              نستند اليوم إلى شبكة تجارية قوية تضم تجار الجملة والموزعين ونقاط
              البيع، تصل من خلالها منتجاتنا إلى أغلب ولايات الوطن. ونواصل توسيع
              هذا الحضور عبر شراكات طويلة الأمد تقوم على الثقة المتبادلة — فخبرتنا
              التي بدأت من الميدان تظل مرجعنا.
            </p>
            <p className="mt-10 inline-flex items-center gap-3 text-sm font-bold text-white/85">
              <span className="flex h-10 w-10 items-center justify-center border border-white/40">
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </span>
              تابع لاكتشاف قصتنا
            </p>
          </>
        }
      />

      {/* 3. STORY */}
      <section className="bg-brand-mist py-16 md:py-24">
        <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <motion.div {...fadeUp}>
            <p className="ri-eyebrow mb-6">قصتنا</p>
            <p className="text-[1.5rem] font-extrabold leading-[1.6] text-brand-black md:text-[2rem] lg:text-[2.25rem]">
              تيتانو كلاس شركة جزائرية متخصصة في استيراد الطابعات ومستلزماتها،
              وصاحبة العلامة المسجلة{" "}
              <span className="text-brand-red">روايال إنك</span>.
            </p>
            <div className="ri-lead mt-6 max-w-2xl space-y-4">
              <p>
                وبفضل خبرة مؤسسيها في الطباعة والاستيراد، طوّرت الشركة قاعدة
                عملاء راسخة تضم تجار الجملة والموزعين وأصحاب الصفقات العمومية،
                وعزّزت حضور منتجاتها في معظم ولايات الوطن عبر شبكة تجارية واسعة.
              </p>
              <p>
                وتُعدّ روايال إنك إحدى أبرز ثمار هذا المسار؛ نجسّد من خلالها
                اهتمامنا بجودة الطباعة واستقرار الأداء والمردود الفعلي والتوافق
                مع الأجهزة — وهي معايير نعرف أهميتها من واقع الاستخدام، ونضعها في
                صميم اختياراتنا.
              </p>
            </div>
          </motion.div>

          {/* Company card */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="ri-crop">
            <dl className="ri-strip bg-white">
              <div className="flex items-center justify-between px-6 pb-4 pt-6">
                <span className="text-sm font-extrabold text-brand-black">بطاقة الشركة</span>
                <span
                  dir="ltr"
                  className="bg-brand-black px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white"
                >
                  RI
                </span>
              </div>
              {FACTS.map((f) => (
                <div
                  key={f.k}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-t border-brand-line px-6 py-4"
                >
                  <dt className="text-sm text-brand-gray">{f.k}</dt>
                  <dd className="text-sm font-extrabold text-brand-black">{f.v}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/find-us#visit"
              className="group flex items-center justify-between gap-4 bg-brand-black px-6 py-4 text-sm font-extrabold text-white transition-colors hover:bg-brand-red"
            >
              زوروا متجرنا في العلمة
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. ACTIVITIES & PRODUCTS */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHead
            eyebrow="مجالات عملنا ومنتجاتنا"
            title="مستلزمات بعلامتنا، وأجهزة من علامات عالمية"
            lead="تشكيلة تغطي متطلبات الطباعة اليومية والمهنية والصيانة، إلى جانب أجهزة العمل المكتبي."
          />

          <motion.div
            {...fadeUp}
            className="ri-crop grid grid-cols-1 text-white lg:grid-cols-[minmax(0,64fr)_minmax(0,36fr)]"
          >
            {/* ROYALiNK supplies, on black */}
            <div className="relative isolate bg-brand-black p-7 sm:p-10 lg:p-12">
              <div
                aria-hidden="true"
                className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,#000,transparent_70%)]"
              />
              <p dir="ltr" className="text-right text-sm font-extrabold tracking-[0.18em]">
                ROYAL<span className="text-brand-red">iNK</span>
              </p>
              <h3 className="mt-3 text-2xl font-extrabold sm:text-[1.75rem]">
                مستلزمات الطباعة بعلامة <span dir="ltr">ROYALiNK</span>
              </h3>
              <p className="mt-4 max-w-2xl text-[15px] leading-8 text-white/80 sm:text-base">
                تتخصص <span dir="ltr">ROYALiNK</span> في توفير مستلزمات الطباعة
                تحت علامتها، بتشكيلة تغطي متطلبات الطباعة اليومية والمهنية
                والصيانة.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {SUPPLIES.map((s) => (
                  <li
                    key={s}
                    className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 text-sm font-bold"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 bg-brand-red" />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-7 flex items-start gap-3 border-t border-white/15 pt-6 text-sm leading-7 text-white/80">
                <History className="mt-1 h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                ونواصل توفير مستلزمات الأجهزة القديمة لمساعدة مستخدميها على
                إبقائها قيد التشغيل.
              </p>
            </div>

            {/* Global-brand devices, on red */}
            <div className="bg-brand-red p-7 sm:p-10 lg:p-12">
              <h3 className="text-2xl font-extrabold sm:text-[1.75rem]">
                أجهزة ومعدات من علامات عالمية
              </h3>
              <p className="mt-4 text-[15px] leading-8 sm:text-base">
                إلى جانب منتجات <span dir="ltr">ROYALiNK</span>، نوفر أجهزة من
                علامات عالمية لتلبية متطلبات العمل المكتبي، من إعداد الوثائق إلى
                رقمنتها وطباعتها.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-2">
                {DEVICES.map((d) => (
                  <li key={d.label} className="flex items-center gap-3 bg-white/15 px-3.5 py-3 text-sm font-bold">
                    <d.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    {d.label}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Our clients */}
          <motion.div {...fadeUp} className="mt-14 md:mt-20">
            <h3 className="text-xl font-extrabold text-brand-black sm:text-2xl">قاعدة عملائنا</h3>
            <p className="ri-lead mt-2">نتوجه بمنتجاتنا إلى:</p>
          </motion.div>
          <div className="mt-6 grid grid-cols-1 gap-px border border-brand-line bg-brand-line sm:grid-cols-2 lg:grid-cols-3">
            {CLIENTS.map((c, i) => (
              <RuledCell key={c.label} delay={(i % 3) * 0.06} className="flex items-center gap-4 p-5 sm:p-6">
                <span className={tile}>
                  <c.icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="text-[15px] font-extrabold leading-7 text-brand-black transition-colors duration-300 group-hover:text-white">
                  {c.label}
                </span>
              </RuledCell>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VISION & MISSION */}
      <section className="bg-brand-mist py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHead
            eyebrow="رؤيتنا ومهمتنا"
            title="ما نسعى لتحقيقه"
            lead="الأسس التي نبني عليها مستقبل روايال إنك."
          />

          <motion.div {...fadeUp} className="ri-crop grid grid-cols-1 text-white lg:grid-cols-2">
            <Aim
              tone="red"
              icon={Lightbulb}
              title="رؤيتنا"
              text="أن تكون روايال إنك الخيار الأول لمستلزمات الطباعة المتوافقة في الجزائر؛ علامة يطلبها المستخدم بالاسم ثقةً في جودتها، ويعتمد عليها المهني لاستقرار أدائها، ويختارها الموزع لتنمية نشاطه. كما نطمح إلى أن يقترن اسمها بتجربة طباعة تجمع الجودة والموثوقية، وتمنح مستخدميها مردوداً يلبي احتياجاتهم ويعزّز ثقتهم باختيارها."
              points={[
                "علامة يطلبها المستخدم بالاسم",
                "يعتمد عليها المهني لاستقرار أدائها",
                "يختارها الموزع لتنمية نشاطه",
              ]}
            />
            <Aim
              tone="black"
              icon={Crosshair}
              title="مهمتنا"
              text="أن نمنح عملاءنا الثقة في اختيار ما يناسب أعمالهم من الطابعات ومستلزماتها، بتوظيف خبرتنا الميدانية في توفير منتجات تجمع بين جودة الطباعة وكفاءة الاستخدام، مع الحرص على توافق المستلزمات مع الأجهزة والمحافظة على أدائها. ونعمل على ترسيخ ثقة المستخدمين بمنتجات روايال إنك وتنمية الطلب عليها، بما يدعم أعمال موزعينا ونقاط البيع المتعاملة معنا، ويجعل رضا المستخدم أساساً لنمو مشترك وشراكات طويلة الأمد."
              points={[
                "توافق المستلزمات مع الأجهزة",
                "دعم موزعينا ونقاط البيع المتعاملة معنا",
                "رضا المستخدم أساس لشراكات طويلة الأمد",
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* 6. VALUES */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHead
            eyebrow="ما يميزنا"
            title="قيمنا ومزايانا التنافسية"
            lead="التزامات نعمل بها يومياً لخدمة عملائنا وشركائنا."
          />

          <div className="grid grid-cols-1 gap-px border border-brand-line bg-brand-line sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <RuledCell key={v.title} delay={(i % 3) * 0.08} className="flex flex-col p-7 sm:p-9">
                <div className="flex items-start justify-between">
                  <span className={tile}>
                    <v.icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <span
                    dir="ltr"
                    className="text-sm font-extrabold tabular-nums text-brand-black/25 transition-colors duration-300 group-hover:text-white/40"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-brand-black transition-colors duration-300 group-hover:text-white">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-gray transition-colors duration-300 group-hover:text-white/75">
                  {v.desc}
                </p>
                {v.link && (
                  <Link
                    href={v.link.href}
                    className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-brand-red transition-colors hover:text-brand-red-dark group-hover:hover:text-white"
                  >
                    {v.link.label}
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </RuledCell>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONTACT */}
      <section className="bg-brand-mist py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ContactSplitCard
            eyebrow="تواصل معنا"
            title="لنتحدث عن احتياجات شركتك من الطباعة"
            text="فريقنا جاهز للإجابة عن استفساراتكم وتقديم الدعم المناسب، أينما كنتم في الجزائر."
            cta={{ href: "/contact", label: "تواصل معنا" }}
          />
        </div>
      </section>
    </div>
  );
}
