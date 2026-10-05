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
  Plus,
} from "lucide-react";

import { HeroSlider } from "@/components/ui/hero-slider";
import { CategoriesRow } from "@/components/ui/categories-row";
import { BrandsSlider } from "@/components/ui/brands-slider";
import { CompatibilityTeaserSection } from "@/components/ui/compatibility-teaser-section";
import { StoreLocatorSection } from "@/components/ui/store-locator-section";
import { CertificatesSlider } from "@/components/ui/certificates-slider";
import { ClientSegments } from "@/components/ui/client-segments";

/* ══════════════════════════════════════════════════════════════════════
   FAQ ITEM — ruled accordion row
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
    <div className="border-b border-brand-black/15">
      <button
        onClick={onClick}
        className="group flex w-full items-center justify-between gap-6 py-6 text-right focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        aria-expanded={isOpen}
      >
        <span
          className={`text-base font-bold leading-7 transition-colors duration-200 md:text-lg ${
            isOpen
              ? "text-brand-red"
              : "text-brand-black group-hover:text-brand-red"
          }`}
        >
          {question}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center transition-all duration-300 ${
            isOpen
              ? "rotate-45 bg-brand-red text-white"
              : "bg-brand-black text-white"
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="ri-lead max-w-2xl pb-7">{answer}</p>
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
    icon: <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />,
    title: "جودة ثابتة",
    desc: "تبدأ العناية بجودة منتجاتنا أثناء التصنيع، حيث يسحب المصنع عينات عشوائية لاختبار وضوح المطبوعات ودقة الألوان.",
  },
  {
    num: "02",
    icon: <Target className="h-6 w-6" strokeWidth={1.5} />,
    title: "خبرة تقنية وتوافق مدروس",
    desc: "تستند إلى خبرة تتجاوز 16 عاماً في مجال الطباعة لفهم احتياجات المستخدمين واختيار المستلزمات المناسبة.",
  },
  {
    num: "03",
    icon: <Leaf className="h-6 w-6" strokeWidth={1.5} />,
    title: "مسؤولية بيئية",
    desc: "نهتم بالجوانب البيئية. عبواتنا تتضمن العلامات المطبوعة ISO 14001 و REACH و RoHS.",
  },
  {
    num: "04",
    icon: <HeadphonesIcon className="h-6 w-6" strokeWidth={1.5} />,
    title: "دعم خبير",
    desc: "نساعد عملاءنا على تحديد المستلزم المناسب لطابعاتهم، ونقدم توجيهاً عملياً بشأن التوافق والاستخدام.",
  },
  {
    num: "05",
    icon: <Truck className="h-6 w-6" strokeWidth={1.5} />,
    title: "شبكة توزيع وطنية",
    desc: "تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة من الموزعين والوسطاء ونقاط البيع.",
  },
  {
    num: "06",
    icon: <RotateCcw className="h-6 w-6" strokeWidth={1.5} />,
    title: "ثقة ومتابعة",
    desc: "نلتزم باستبدال المنتج ذي العيب الصناعي في اليوم نفسه ومتابعة ملاحظات عملائنا.",
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
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="flex flex-col bg-white">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1.A — HERO SLIDER (black block + red block)
          ═══════════════════════════════════════════════════════════════ */}
      <HeroSlider />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1.B — PRODUCT CATEGORIES (white)
          ═══════════════════════════════════════════════════════════════ */}
      <CategoriesRow />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1.C — BRANDS INFINITE SLIDER (white, ruled)
          ═══════════════════════════════════════════════════════════════ */}
      <BrandsSlider />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — COMPATIBILITY SEARCH TEASER (red block + black block)
          ═══════════════════════════════════════════════════════════════ */}
      <CompatibilityTeaserSection />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — MAP: CLIENTS & POINTS OF SALE (mist)
          ═══════════════════════════════════════════════════════════════ */}
      <StoreLocatorSection />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — CERTIFICATES (white)
          ═══════════════════════════════════════════════════════════════ */}
      <CertificatesSlider />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — TARGET CLIENTS (black)
          ═══════════════════════════════════════════════════════════════ */}
      <ClientSegments />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — OUR COMMITMENT / VALUES (white)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
            {/* Start: commitment text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:sticky lg:top-28"
            >
              <p className="ri-eyebrow mb-4">التزامنا</p>
              <h2 className="ri-h2">التزام روايال إنك</h2>
              <p className="ri-lead mt-5">
                نؤمن بأن الجودة ليست خياراً بل التزام. منذ تأسيسنا، بنينا
                سمعتنا على أسس متينة من الخبرة والثقة والابتكار المستمر لخدمة
                عملائنا في كل ولايات الوطن.
              </p>
              <Link href="/about" className="ri-btn ri-btn-black mt-8">
                <span>اقرأ المزيد عن قيمنا</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* End: values, as a ruled list */}
            <div className="grid border-t border-brand-black sm:grid-cols-2 sm:gap-x-10">
              {commitments.map((c, i) => (
                <motion.div
                  key={c.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (i % 2) * 0.08, duration: 0.5 }}
                  className="border-b border-brand-line py-8"
                >
                  {/* Icon and title share one row; the text below lines up
                      under the title */}
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-brand-red">{c.icon}</span>
                    <h3 className="min-w-0 flex-1 text-lg font-extrabold leading-7 text-brand-black">
                      {c.title}
                    </h3>
                    <span
                      dir="ltr"
                      className="shrink-0 text-sm font-bold tabular-nums text-brand-black/30"
                    >
                      {c.num}
                    </span>
                  </div>
                  <p className="mt-3 ps-9 text-[15px] leading-7 text-brand-gray">
                    {c.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — FAQ (mist)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-mist py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
            {/* Start: heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:sticky lg:top-28"
            >
              <p className="ri-eyebrow mb-4">الأسئلة الشائعة</p>
              <h2 className="ri-h2">
                كل ما تحتاج
                <br />
                معرفته
              </h2>
              <p className="ri-lead mt-5">
                إجابات على الأسئلة الأكثر شيوعاً حول منتجات وخدمات روايال
                إنك.
              </p>
              <Link href="/contact" className="ri-link mt-7">
                <span>لم تجد إجابتك؟ تواصل معنا</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* End: accordion */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="border-t border-brand-black"
            >
              {faqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFAQ === i}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
