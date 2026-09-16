"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
  Printer,
  PackageCheck,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Building2,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import SqueezeCarouselDemo from "@/components/ui/demo";

/* ══════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER — counts up when in view
   ══════════════════════════════════════════════════════════════════════ */
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const step = target / (duration * 60);
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

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

const stats = [
  { value: 15, suffix: "+", label: "سنة من الخبرة" },
  { value: 1000, suffix: "+", label: "عميل وموزع" },
  { value: 58, suffix: "", label: "ولاية مغطاة" },
  { value: 4, suffix: "", label: "شهادات جودة" },
];

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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="flex flex-col bg-background">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HERO (split layout like the mockup)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-bl from-muted/40 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <motion.div style={{ opacity: heroOpacity }} className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-primary bg-primary/10 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                طابعات ومستلزمات طباعة احترافية
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-6"
              >
                طابعات ومستلزمات
                <br />
                <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">
                  بأعلى جودة
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
              >
                سواء كنت تدير مكتباً صغيراً أو مؤسسة كبيرة، روايال إنك شريكك
                في توفير مستلزمات طباعة عالية الجودة ومتوافقة مع أبرز الطابعات
                العالمية.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex items-center gap-4 flex-wrap"
              >
                <Link
                  href="/contact"
                  className="bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 text-sm"
                >
                  تواصل معنا
                </Link>
                <Link
                  href="/about"
                  className="border border-border/60 text-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-muted/50 transition-all hover:-translate-y-0.5 text-sm"
                >
                  تعرف علينا
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 mt-10 pt-8 border-t border-border/40"
              >
                {[
                  { label: "ISO 9001", sub: "إدارة الجودة" },
                  { label: "ISO 14001", sub: "إدارة البيئة" },
                  { label: "RoHS", sub: "سلامة المواد" },
                ].map((badge) => (
                  <div key={badge.label} className="text-center">
                    <span className="block text-xs font-bold text-foreground/70 tracking-wider">
                      {badge.label}
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      {badge.sub}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border border-border/30">
                <Image
                  src="/images/ink-cartridges.jpg"
                  alt="مستلزمات طباعة روايال إنك"
                  width={700}
                  height={500}
                  className="object-cover w-full h-[350px] md:h-[450px]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {/* Floating logo badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                  <img
                    src="/images/logo.svg"
                    alt="Royal Ink"
                    className="h-7 object-contain"
                  />
                </div>
              </div>
              {/* Decorative floating element */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl bg-primary/10 -z-10" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-rose-500/5 -z-10" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — FEATURE HIGHLIGHT (split, reversed)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl border border-border/30">
                <Image
                  src="/images/ri1.jpg"
                  alt="طابعات متينة وعالية الجودة"
                  width={600}
                  height={450}
                  className="object-cover w-full h-[300px] md:h-[400px]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                  <img
                    src="/images/logo.svg"
                    alt="Royal Ink"
                    className="h-6 object-contain"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-full px-4 py-2 mb-6">
                <PackageCheck className="w-3.5 h-3.5" />
                المتانة والجودة
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                صُنعت من أجل
                <br />
                <span className="text-primary">المتانة والأداء</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-base md:text-lg">
                منتجاتنا مصمّمة ومختبرة بعناية لتوفير وضوح طباعة مماثل
                للمنتجات الأصلية، مع عمر افتراضي أطول وكفاءة أعلى في
                الاستخدام. نختار شركاءنا من المصانع العالمية التي تلتزم بأعلى
                معايير الجودة.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "دقة ألوان عالية ووضوح مطبوعات",
                  "توافق مدروس مع الطابعات الرائدة",
                  "اختبار جودة لكل دفعة إنتاج",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — STATS BAR
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 overflow-hidden gradient-bg text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="block text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-2">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                  />
                </span>
                <span className="text-sm text-white/70 font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — COMMITMENT / VALUES (split: text + grid)
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
          SECTION 5 — PRODUCTS CAROUSEL
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                منتجاتنا
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold mb-4"
            >
              مجالات عملنا ومنتجاتنا
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              تلبية متطلبات العمل المكتبي من إعداد الوثائق إلى طباعتها
              بأفضل جودة
            </motion.p>
          </div>
          <SqueezeCarouselDemo />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — BRIEF STORY TIMELINE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                مسيرتنا
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold mb-4"
            >
              من الورشة إلى العلامة الوطنية
            </motion.h2>
          </div>

          {/* Horizontal mini-timeline */}
          <div className="max-w-5xl mx-auto relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-[38px] right-0 left-0 h-[2px] bg-border/60 z-0" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {[
                { year: "2007", title: "البداية الأولى", icon: <Printer className="w-4 h-4" />, desc: "ورشة طباعة منزلية صغيرة" },
                { year: "2011", title: "ورشة متخصصة", icon: <Building2 className="w-4 h-4" />, desc: "تقنيات طباعة احترافية متعددة" },
                { year: "2017", title: "وكالة إشهار", icon: <Sparkles className="w-4 h-4" />, desc: "حلول إبداعية وطباعية متكاملة" },
                { year: "2022", title: "روايال إنك", icon: <PackageCheck className="w-4 h-4" />, desc: "تأسيس العلامة والشركة" },
              ].map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative text-center group"
                >
                  {/* Dot on timeline */}
                  <div className="hidden md:flex w-10 h-10 mx-auto mb-4 rounded-full bg-background border-2 border-primary/40 items-center justify-center z-10 relative group-hover:bg-primary group-hover:border-primary group-hover:text-white text-primary transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="inline-block text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1 mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-sm font-bold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Link to full timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              اكتشف قصتنا الكاملة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </motion.div>
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

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8 — CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-bg text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-md leading-tight">
              حلول الطباعة للمهنيين
              <br />
              والمؤسسات
            </h2>
            <p className="text-lg md:text-xl mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed">
              روايال إنك توفر طابعات ومستلزمات طباعة عالية الجودة وبأسعار
              تنافسية في الجزائر. فريقنا جاهز لمساعدتكم.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/contact"
                className="bg-white text-primary px-10 py-4 rounded-full font-bold hover:bg-white/90 transition-all shadow-lg text-sm hover:-translate-y-0.5"
              >
                اطلب عرض سعر
              </Link>
              <a
                href="tel:+213666509941"
                className="border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all text-sm hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span dir="ltr">+213 666 50 99 41</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
