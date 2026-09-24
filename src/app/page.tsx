"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Target,
  Leaf,
  HeadphonesIcon,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
} from "lucide-react";

import { HeroSlider } from "@/components/ui/hero-slider";
import { CategoriesRow } from "@/components/ui/categories-row";
import { BrandsSlider } from "@/components/ui/brands-slider";
import { CompatibilityTeaserSection } from "@/components/ui/compatibility-teaser-section";
import { StoreLocatorSection } from "@/components/ui/store-locator-section";
import { CertificatesSlider } from "@/components/ui/certificates-slider";
import { ClientSegments } from "@/components/ui/client-segments";

/* ══════════════════════════════════════════════════════════════════════
   FAQ ITEM — custom accordion with animation
   ══════════════════════════════════════════════════════════════════════ */
function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden transition-all hover:border-primary/20">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 md:p-6 text-right bg-background hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base font-semibold text-foreground pr-4">
          {question}
        </span>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════════════ */

const commitments = [
  {
    num: "01",
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "جودة ثابتة",
    desc: "تبدأ العناية بجودة منتجاتنا أثناء التصنيع، حيث يسحب المصنع عينات عشوائية لاختبار وضوح المطبوعات ودقة الألوان.",
    accent: "bg-primary",
  },
  {
    num: "02",
    icon: <Target className="w-5 h-5" />,
    title: "خبرة تقنية وتوافق مدروس",
    desc: "تستند إلى خبرة تتجاوز 16 عاماً في مجال الطباعة لفهم احتياجات المستخدمين واختيار المستلزمات المناسبة.",
    accent: "bg-blue-500",
  },
  {
    num: "03",
    icon: <Leaf className="w-5 h-5" />,
    title: "مسؤولية بيئية",
    desc: "نهتم بالجوانب البيئية. عبواتنا تتضمن العلامات المطبوعة ISO 14001 و REACH و RoHS.",
    accent: "bg-emerald-500",
  },
  {
    num: "04",
    icon: <HeadphonesIcon className="w-5 h-5" />,
    title: "دعم خبير",
    desc: "نساعد عملاءنا على تحديد المستلزم المناسب لطابعاتهم، ونقدم توجيهاً عملياً بشأن التوافق والاستخدام.",
    accent: "bg-violet-500",
  },
  {
    num: "05",
    icon: <Truck className="w-5 h-5" />,
    title: "شبكة توزيع وطنية",
    desc: "تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة من الموزعين والوسطاء ونقاط البيع.",
    accent: "bg-amber-500",
  },
  {
    num: "06",
    icon: <RotateCcw className="w-5 h-5" />,
    title: "ثقة ومتابعة",
    desc: "نلتزم باستبدال المنتج ذي العيب الصناعي في اليوم نفسه ومتابعة ملاحظات عملائنا.",
    accent: "bg-rose-500",
  },
];

const faqs = [
  {
    q: "ما الذي يميز منتجات روايال إنك؟",
    a: "منتجات روايال إنك هي مستلزمات طباعة متوافقة تمتاز بجودة ثابتة، حيث يتم اختبار كل دفعة إنتاج لضمان وضوح المطبوعات ودقة الألوان. كما أنها حاصلة على شهادات الجودة العالمية ISO 9001 و ISO 14001.",
  },
  {
    q: "كيف أختار المستلزم المناسب لطابعتي؟",
    a: "فريقنا متخصص في تقديم التوجيه الفني المناسب. يكفي أن تتواصل معنا عبر الهاتف أو البريد الإلكتروني مع ذكر موديل طابعتك، وسنساعدك في اختيار المستلزم الأنسب.",
  },
  {
    q: "هل توفرون دعم ما بعد البيع؟",
    a: "نعم، نلتزم بمتابعة ملاحظات عملائنا واستبدال أي منتج ذي عيب صناعي في اليوم نفسه. فريق الدعم متوفر عبر الهاتف والبريد الإلكتروني لأي استفسار تقني.",
  },
  {
    q: "هل يمكن التعامل مع روايال إنك في الصفقات العمومية؟",
    a: "بالتأكيد. تيتانو كلاس، الشركة الأم لعلامة روايال إنك، معتمدة رسمياً وتتعامل مع أصحاب الصفقات العمومية وتجار الجملة والموزعين عبر كامل التراب الوطني.",
  },
  {
    q: "كيف يمكنني أن أصبح موزعاً لمنتجات روايال إنك؟",
    a: "نرحب بالشراكات الجديدة! تواصل معنا عبر صفحة الاتصال أو اتصل بنا مباشرة لمناقشة شروط الشراكة والتوزيع. شبكتنا تغطي 58 ولاية ونبحث دائماً عن شركاء موثوقين.",
  },
];

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="flex flex-col bg-background">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1.A — HERO SLIDER
          ═══════════════════════════════════════════════════════════════ */}
      <HeroSlider />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1.B — CATEGORIES ROW
          ═══════════════════════════════════════════════════════════════ */}
      <CategoriesRow />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1.C — BRANDS INFINITE SLIDER (no text)
          ═══════════════════════════════════════════════════════════════ */}
      <BrandsSlider />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — COMPATIBILITY SEARCH TEASER (Red Background)
          ═══════════════════════════════════════════════════════════════ */}
      <CompatibilityTeaserSection />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — MAP: CLIENTS & POINTS OF SALE
          ═══════════════════════════════════════════════════════════════ */}
      <StoreLocatorSection />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — CERTIFICATES INFINITE SLIDER
          ═══════════════════════════════════════════════════════════════ */}
      <CertificatesSlider />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — TARGET CLIENTS
          ═══════════════════════════════════════════════════════════════ */}
      <ClientSegments />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — OUR COMMITMENT / VALUES
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 max-w-7xl mx-auto items-start">
            {/* Left: commitment text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-28"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-primary bg-primary/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                التزامنا
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                التزام روايال إنك
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                نؤمن بأن الجودة ليست خياراً بل التزام. منذ تأسيسنا، بنينا
                سمعتنا على أسس متينة من الخبرة والثقة والابتكار المستمر لخدمة
                عملائنا في كل ولايات الوطن.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                اقرأ المزيد عن قيمنا
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Right: values grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {commitments.map((c, i) => (
                <motion.div
                  key={c.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="relative rounded-2xl border border-border/50 p-6 bg-background group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={`absolute top-0 right-0 left-0 h-1 ${c.accent} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right`}
                  />
                  <div className="flex items-start gap-4">
                    <span className="text-xs font-bold text-muted-foreground/40 mt-1">
                      {c.num}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {c.icon}
                        </div>
                        <h3 className="text-sm font-bold text-foreground">
                          {c.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — FAQ
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 max-w-6xl mx-auto items-start">
            {/* Left: heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-primary bg-primary/10 rounded-full px-4 py-2 mb-6">
                FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                كل ما تحتاج
                <br />
                معرفته
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                إجابات على الأسئلة الأكثر شيوعاً حول منتجات وخدمات روايال
                إنك.
              </p>
            </motion.div>

            {/* Right: accordion */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-3"
            >
              {faqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFAQ === i}
                  onClick={() =>
                    setOpenFAQ(openFAQ === i ? null : i)
                  }
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
