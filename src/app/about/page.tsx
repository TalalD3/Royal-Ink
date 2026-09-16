"use client";

import {
  Target,
  Lightbulb,
  ShieldCheck,
  Leaf,
  HeadphonesIcon,
  Truck,
  RotateCcw,
  Users,
  Briefcase,
  Trophy,
  Globe,
  ArrowDown,
  Printer,
  Building2,
  Megaphone,
  Rocket,
  ChevronDown,
  CheckCircle2,
  Eye,
  Crosshair,
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { RippleBackground } from "@/components/ui/interactive-ripple-background";

/* ══════════════════════════ MAIN PAGE ══════════════════════════ */
export default function AboutPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const heroImages = [
    "/images/ri1.jpg",
    "/images/ri.jpg",
    "/images/hero-office.jpg"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col bg-background">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image src={heroImages[currentImageIndex]} alt="Royal Ink Headquarters" fill className="object-cover" priority />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-white/70 mb-6 border border-white/20 rounded-full px-5 py-2 backdrop-blur-sm">
            من نحن
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            نبتكر اليوم<br />
            <span className="bg-gradient-to-l from-red-500 to-rose-400 bg-clip-text text-transparent">نلهم الغد</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            خبرة بدأت من ممارسة الطباعة، وتطورت إلى معرفة بالمنتج والسوق، لتؤسس رؤيتنا للأعمال.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="flex justify-center mt-8">
            <div className="flex gap-2 mb-6">
              {heroImages.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-white/30"}`} />
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="flex justify-center">
            <div className="animate-bounce p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white cursor-pointer hover:bg-white/20 transition-colors">
              <ArrowDown size={22} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="relative z-20 -mt-20 container mx-auto px-4 mb-12">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="relative rounded-[2.5rem] border border-white/10 p-1 md:p-2 bg-[#1a1a1a] max-w-5xl mx-auto">
          <GlowingEffect blur={0} spread={40} proximity={64} inactiveZone={0.01} borderWidth={2.5} glow={true} disabled={false} />
          
          <div className="relative bg-[#1a1a1a] text-white rounded-[2rem] shadow-2xl p-6 md:p-8 overflow-hidden z-10 h-full">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-primary/10 blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 relative z-10 lg:divide-x lg:divide-x-reverse lg:divide-white/10">
            <StatCard icon={<Users className="w-6 h-6" />} number="15+" label="سنة من الخبرة" />
            <StatCard icon={<Briefcase className="w-6 h-6" />} number="1000+" label="عميل وموزع" />
            <StatCard icon={<Trophy className="w-6 h-6" />} number="4" label="شهادات جودة" />
            <StatCard icon={<Globe className="w-6 h-6" />} number="58" label="ولاية مغطاة" />
          </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ COMPANY STORY ═══════════════ */}
      <section className="pt-12 pb-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          {/* Section label with decorative line */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">قصتنا</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {/* Story card */}
          <div className="relative rounded-[2.5rem] border border-border/40 p-1 md:p-2">
            <GlowingEffect blur={0} spread={40} proximity={64} inactiveZone={0.01} borderWidth={2.5} glow={true} disabled={false} />
            <div className="relative bg-card/60 backdrop-blur-sm rounded-[2rem] p-10 md:p-16 text-center overflow-hidden z-10">
              {/* Decorative quote mark */}
              <div className="absolute top-6 right-10 text-[120px] leading-none font-serif text-primary/[0.06] select-none pointer-events-none">"</div>

            <p className="text-lg md:text-xl text-muted-foreground leading-[2.1] max-w-3xl mx-auto relative z-10">
              <span className="font-bold text-foreground text-xl md:text-2xl">تيتانو كلاس</span> شركة جزائرية
              متخصصة في استيراد الطابعات ومستلزماتها، وصاحبة العلامة المسجلة{" "}
              <span className="font-bold text-primary text-xl md:text-2xl">روايال إنك</span>.
            </p>
            
            {/* Decorative separator */}
            <div className="flex items-center justify-center gap-2 my-8">
              <div className="h-px w-8 bg-primary/30" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="h-px w-8 bg-primary/30" />
            </div>

            <p className="text-base md:text-lg text-muted-foreground leading-[2] max-w-3xl mx-auto relative z-10">
              وبفضل خبرة مؤسسيها في الطباعة والاستيراد، طوّرت الشركة قاعدة عملاء راسخة تضم تجار الجملة والموزعين وأصحاب الصفقات العمومية، وعزّزت حضور منتجاتها في معظم ولايات الوطن عبر شبكة تجارية واسعة.
            </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ TIMELINE ═══════════════ */}
      <section className="py-24 relative overflow-hidden" ref={timelineRef}>
        <RippleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">مسيرتنا</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-extrabold mb-4">رحلة النمو والتطور</motion.h3>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-muted-foreground text-base md:text-lg">من ورشة صغيرة عام 2007 إلى علامة وطنية رائدة</motion.p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            <div className="timeline-track absolute top-0 bottom-0 w-[3px] bg-border/50 rounded-full left-1/2 -translate-x-1/2 z-0" />
            <motion.div
              className="timeline-fill absolute top-0 w-[3px] rounded-full left-1/2 -translate-x-1/2 origin-top z-0"
              style={{ height: lineHeight, background: "linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary) / 0.3))" }}
            />

            <div className="flex flex-col gap-16 md:gap-20">
              <TimelineMilestone
                year="2007"
                title="البداية الأولى"
                description="بدأ أحد مؤسسينا مسيرته في الطباعة من ورشة منزلية صغيرة. كان الشغف بالطباعة هو الدافع الأول للتعلم والإتقان."
                expandedDetails={[
                  "بداية العمل من ورشة منزلية بإمكانيات محدودة",
                  "التعلم الذاتي لتقنيات الطباعة المختلفة",
                  "بناء أولى العلاقات مع العملاء المحليين",
                  "اكتساب معرفة عميقة بأنواع الأحبار والمستلزمات",
                ]}
                icon={<Printer className="w-5 h-5" />}
                image="/images/timeline-workshop.jpg"
                side="right"
              />
              <TimelineMilestone
                year="2011"
                title="تأسيس ورشة متخصصة"
                description="تطور المشروع إلى افتتاح ورشة متخصصة، واتسعت مجالات العمل لتشمل تقنيات متعددة في الطباعة الاحترافية."
                expandedDetails={[
                  "افتتاح ورشة طباعة احترافية مجهزة بالكامل",
                  "إتقان تقنيات الطباعة الرقمية والحرارية",
                  "توسيع قاعدة العملاء لتشمل المؤسسات والشركات",
                  "فهم معمّق للآلات والمنتجات وسلوك السوق",
                ]}
                icon={<Building2 className="w-5 h-5" />}
                side="left"
              />
              <TimelineMilestone
                year="2017"
                title="وكالة اتصال وإشهار"
                description="بفضل الخبرة المتراكمة وثقة العملاء، تطور عملنا وصولاً إلى تأسيس وكالة اتصال وإشهار تقدم حلولاً إبداعية وطباعية متكاملة."
                expandedDetails={[
                  "تأسيس وكالة متكاملة للاتصال والإشهار",
                  "تقديم خدمات التصميم والطباعة في حزمة واحدة",
                  "اكتساب خبرة تجارية في التعامل مع المشاريع الكبرى",
                  "بناء شبكة علاقات واسعة في قطاع الإعلام والاتصال",
                ]}
                icon={<Megaphone className="w-5 h-5" />}
                side="right"
              />
              <TimelineMilestone
                year="2022"
                title="ميلاد تيتانو كلاس وروايال إنك"
                description="اجتمعت المسيرتان لتأسيس شركة 'تيتانو كلاس'، على قاعدة تجمع الخبرة الفنية في الطباعة والخبرة التجارية في الاستيراد."
                expandedDetails={[
                  "تأسيس شركة تيتانو كلاس بمدينة العلمة، ولاية سطيف",
                  "إطلاق العلامة المسجلة 'روايال إنك' للمستلزمات المتوافقة",
                  "بناء شبكة توزيع تغطي أغلب ولايات الوطن",
                  "شراكات مع مصانع عالمية لضمان الجودة والتوافق",
                  "تصنيف كمرجع في مستلزمات الطباعة المتوافقة",
                ]}
                icon={<Rocket className="w-5 h-5" />}
                image="/images/ink-cartridges.jpg"
                side="left"
                highlight
              />
            </div>
          </div>

          {/* Toggle to interactive timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mt-16"
          >
            <Link
              href="/about/timeline"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary/30 rounded-full px-6 py-3 hover:bg-primary/10 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-primary/10"
            >
              شاهد مسيرتنا التفاعلية
              <ArrowDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ VISION & MISSION ═══════════════ */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">رؤيتنا ومهمتنا</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-extrabold mb-4">ما نسعى لتحقيقه</motion.h3>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-muted-foreground text-base md:text-lg">الأسس التي نبني عليها مستقبل روايال إنك</motion.p>
          </div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto mb-10"
          >
            <div className="relative rounded-[2.5rem] p-1 md:p-2 group glass-card-vision">
              <GlowingEffect blur={0} spread={40} proximity={64} inactiveZone={0.01} borderWidth={2.5} glow={true} disabled={false} />

              <div className="relative bg-card/80 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden z-10 h-full">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image side */}
                  <div className="relative h-64 lg:h-auto lg:min-h-[420px] overflow-hidden">
                    <Image src="/images/hero-office.jpg" alt="رؤيتنا" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent lg:bg-gradient-to-r" />
                  </div>

                  {/* Text side */}
                  <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                      <Lightbulb className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-5 text-foreground">
                      رؤيتنا
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-[1.9] mb-8">
                      أن تكون <strong className="text-primary">روايال إنك</strong> الخيار الأول لمستلزمات الطباعة المتوافقة في الجزائر؛ علامة يطلبها المستخدم بالاسم ثقةً في جودتها، ويعتمد عليها المهني لاستقرار أدائها.
                    </p>
                    <div className="flex flex-col gap-3">
                      {["الخيار الأول في السوق الجزائري", "جودة يثق بها المستخدم", "أداء مستقر يعتمد عليه المهني"].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-6xl mx-auto"
          >
            <div className="relative rounded-[2.5rem] p-1 md:p-2 group">
              <GlowingEffect blur={0} spread={40} proximity={64} inactiveZone={0.01} borderWidth={2.5} glow={true} disabled={false} />

              <div className="relative bg-card/80 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden z-10 h-full">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Text side (reversed order on desktop) */}
                  <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center order-2 lg:order-1">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                      <Crosshair className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-5 text-foreground">
                      مهمتنا
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-[1.9] mb-8">
                      أن نمنح عملاءنا الثقة في اختيار ما يناسب أعمالهم من الطابعات ومستلزماتها، بتوظيف خبرتنا الميدانية في توفير منتجات تجمع بين جودة الطباعة وكفاءة الاستخدام.
                    </p>
                    <div className="flex flex-col gap-3">
                      {["توجيه العملاء نحو الخيار الأنسب", "منتجات تجمع الجودة وكفاءة الاستخدام", "ترسيخ ثقة المستخدمين بمنتجاتنا"].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image side */}
                  <div className="relative h-64 lg:h-auto lg:min-h-[420px] overflow-hidden order-1 lg:order-2">
                    <Image src="/images/ink-cartridges.jpg" alt="مهمتنا" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent lg:bg-gradient-to-l" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ VALUES ═══════════════ */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">ما يميزنا</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-extrabold mb-4">قيمنا ومزايانا التنافسية</motion.h3>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-muted-foreground text-base md:text-lg">التزامات نعمل بها يومياً لخدمة عملائنا وشركائنا</motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {valuesData.map((v, i) => (
              <ValueCard key={v.title} index={i} {...v} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════ values data ══════════════════════ */
const valuesData = [
  { icon: <ShieldCheck className="w-6 h-6" />, title: "جودة ثابتة", desc: "تبدأ العناية بجودة منتجاتنا أثناء التصنيع، حيث يسحب المصنع عينات عشوائية لاختبار وضوح المطبوعات ودقة الألوان.", accent: "bg-primary" },
  { icon: <Target className="w-6 h-6" />, title: "خبرة تقنية وتوافق مدروس", desc: "تستند إلى خبرة تتجاوز 16 عاماً في مجال الطباعة لفهم احتياجات المستخدمين واختيار المستلزمات المناسبة لها.", accent: "bg-blue-500" },
  { icon: <Leaf className="w-6 h-6" />, title: "مسؤولية بيئية", desc: "نهتم بالجوانب البيئية المرتبطة بمستلزمات الطباعة. عبواتنا تتضمن العلامات المطبوعة ISO 14001 و REACH و RoHS.", accent: "bg-emerald-500" },
  { icon: <HeadphonesIcon className="w-6 h-6" />, title: "دعم خبير", desc: "نساعد عملاءنا وشركاءنا على تحديد المستلزم المناسب لطابعاتهم، ونقدم توجيهاً عملياً بشأن التوافق والاستخدام.", accent: "bg-violet-500" },
  { icon: <Truck className="w-6 h-6" />, title: "شبكة توزيع وطنية", desc: "تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة من الموزعين والوسطاء ونقاط البيع.", accent: "bg-amber-500" },
  { icon: <RotateCcw className="w-6 h-6" />, title: "ثقة ومتابعة", desc: "نحرص على وضوح التعامل ومتابعة ملاحظات عملائنا، ونلتزم باستبدال المنتج ذي العيب الصناعي في اليوم نفسه.", accent: "bg-rose-500" },
];

/* ══════════════════════ COMPONENTS ══════════════════════ */

function StatCard({ icon, number, label }: { icon: React.ReactNode; number: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center group cursor-default">
      <div className="text-primary mb-5 opacity-80 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
        {icon}
      </div>
      <span className="text-2xl md:text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300">{number}</span>
      <span className="text-sm text-gray-400 font-medium tracking-wide">{label}</span>
    </div>
  );
}

/* ─── Timeline Milestone (with expandable details) ─── */
function TimelineMilestone({
  year, title, description, expandedDetails, icon, image, side, highlight,
}: {
  year: string; title: string; description: string; expandedDetails: string[]; icon: React.ReactNode; image?: string; side: "left" | "right"; highlight?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardOnRight = side === "right";

  const cardContent = (
    <MilestoneCard
      year={year} title={title} description={description} expandedDetails={expandedDetails}
      image={image} highlight={highlight} isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}
    />
  );

  return (
    <div className="relative flex flex-col md:grid md:grid-cols-[1fr_48px_1fr] items-center md:items-start gap-6 md:gap-0 w-full z-10">
      {/* Desktop left column */}
      <div className="hidden md:flex justify-end">
        {cardOnRight ? (
          <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }} className="w-full max-w-md">
            {cardContent}
          </motion.div>
        ) : <div />}
      </div>

      {/* Center dot */}
      <div className="flex flex-col items-center pt-0 md:pt-2 z-20">
        <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 ring-[5px] ring-background relative z-20">
          {icon}
        </motion.div>
      </div>

      {/* Desktop right column */}
      <div className="hidden md:flex justify-start">
        {!cardOnRight ? (
          <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }} className="w-full max-w-md">
            {cardContent}
          </motion.div>
        ) : <div />}
      </div>

      {/* Mobile card */}
      <div className="md:hidden w-full px-2 relative z-10">
        <motion.div initial={{ opacity: 0, y: -40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }}>
          {cardContent}
        </motion.div>
      </div>
    </div>
  );
}

function MilestoneCard({
  year, title, description, expandedDetails, image, highlight, isExpanded, onToggle,
}: {
  year: string; title: string; description: string; expandedDetails: string[];
  image?: string; highlight?: boolean; isExpanded: boolean; onToggle: () => void;
}) {
  return (
    <div
      className={`bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer ${
        highlight ? "border-primary/30 ring-1 ring-primary/10" : "border-border/60"
      }`}
      onClick={onToggle}
    >
      {image && (
        <div className="relative h-44 w-full overflow-hidden">
          <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 right-4 text-white text-sm font-bold bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-1">{year}</span>
        </div>
      )}

      <div className="p-6">
        {!image && (
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 rounded-lg px-3 py-1.5 mb-3">{year}</span>
        )}
        <h4 className="text-lg font-bold mb-2 text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {/* Expand/collapse toggle */}
        <button
          className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <span>{isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        {/* Expandable details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/50 space-y-2.5">
                {expandedDetails.map((detail, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{detail}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, desc, index, accent }: { icon: React.ReactNode; title: string; desc: string; index: number; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative bg-card rounded-2xl border border-border/50 p-8 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
    >
      <div className={`absolute top-0 right-0 left-0 h-1 ${accent} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right`} />
      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">{icon}</div>
      <h3 className="text-lg font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}
