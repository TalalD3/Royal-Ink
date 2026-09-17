"use client";

import { motion, useReducedMotion } from "framer-motion";
import HowItWorks, { type Step } from "@/components/ui/how-it-works";
import { Case } from "@/components/ui/cases-with-infinite-scroll";

const qualitySteps: Step[] = [
  {
    title: "فحص المواد الخام الخارجي",
    subtitle: "Raw Materials Exterior Inspection",
    description: "فحص دقيق لكافة المكونات الأساسية مثل أسطوانات OPC والتروس للتأكد من خلوها من أي عيوب أو شوائب قبل دخول خط الإنتاج.",
    colorTheme: "red",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    imageAlt: "فحص المواد الخام الخارجي",
  },
  {
    title: "فحص طباعة المواد الخام",
    subtitle: "Raw Materials Printing Inspection",
    description: "اختبار طباعة أولي لعينات بودرة الحبر السائبة لقياس درجة السواد، الكثافة الضوئية، ونقاء التدرج اللوني.",
    colorTheme: "orange",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=800",
    imageAlt: "فحص طباعة المواد الخام",
  },
  {
    title: "اختبار العمر الافتراضي للمواد",
    subtitle: "Raw Materials Lifetime Testing",
    description: "إجراء اختبارات دوران وإجهاد مستمرة على منصات ميكانيكية متخصصة لقياس متانة القطع ومقاومتها للاحتكاك الطويل.",
    colorTheme: "blue",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    imageAlt: "اختبار العمر الافتراضي للمواد",
  },
  {
    title: "تجميع وتركيب المنتج",
    subtitle: "Product Assembling",
    description: "تجميع أجزاء الخرطوشة في غرف نظيفة ومضبوطة حرارياً على خطوط تجميع متطورة تحت إشراف فنيين متمرسين.",
    colorTheme: "purple",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
    imageAlt: "تجميع وتركيب المنتج",
  },
  {
    title: "تخزين المنتجات نصف المصنعة",
    subtitle: "Semi-Finished Product Warehousing",
    description: "تخزين وحدات التجميع في مستودعات بيئية محكمة لحماية المكونات من الرطوبة والغبار قبل مرحلة التعبئة النهائية.",
    colorTheme: "emerald",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    imageAlt: "تخزين المنتجات نصف المصنعة",
  },
  {
    title: "فحص إحكام الإغلاق والتفريغ",
    subtitle: "Airtight Inspection",
    description: "اختبار الخراطيش في غرف ضغط وتفريغ هوائي (Vacuum chamber) للتحقق القاطع من عدم وجود أي تسريب حبر في أي ظرف.",
    colorTheme: "red",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=800",
    imageAlt: "فحص إحكام الإغلاق والتفريغ",
  },
  {
    title: "اختبار الاهتزاز والصدمات",
    subtitle: "Vibrating Inspection",
    description: "محاكاة الاهتزازات وظروف النقل والشحن البري والجوي لضمان بقاء المنتج وعبوته سليمين ومحميين 100%.",
    colorTheme: "orange",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&q=80&w=800",
    imageAlt: "اختبار الاهتزاز والصدمات",
  },
  {
    title: "فحص جودة الطباعة الأولي (PQ1)",
    subtitle: "PQ1 Printing Inspection",
    description: "تحليل دقيق لدرجات التباين، وضوح النصوص الصغيرة، ودقة الخطوط الرفيعة ونقاء المساحات الملونة.",
    colorTheme: "blue",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    imageAlt: "فحص جودة الطباعة الأولي",
  },
  {
    title: "اختبار دورة الحياة والجهد النهائي (PQ2)",
    subtitle: "PQ2 Lifetime Testing",
    description: "طباعة آلاف الصفحات المتواصلة للتأكد من المردود الكامل للخرطوشة وثبات مستوى الوضوح حتى آخر قطرة حبر.",
    colorTheme: "purple",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800",
    imageAlt: "اختبار دورة الحياة والجهد النهائي",
  },
];

export default function QualityPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-red bg-red/10 rounded-full px-4 py-2 mb-6"
          >
            الجودة
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: prefersReducedMotion ? 0 : 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          >
            كل عبوة تمر بهذه المراحل
            <br className="hidden md:block" /> قبل أن تصل إليك
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            من عينة التصنيع الأولى إلى الاختبار على طابعات حقيقية، هذه هي رحلة الجودة عند روايال إنك.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — PRODUCT ROAD (9 STEPS HORIZONTAL QUALITY SHOWCASE)
          ═══════════════════════════════════════════════════════════════ */}
      <HowItWorks
        features={qualitySteps}
        badge="مراحل مراقبة الجودة الصناعية (Quality Control)"
        title="مسار الـ 9 خطوات لصناعة منتج موثوق"
        subtitle="من الفحص المجهري للمواد الخام إلى محاكاة النقل وأقسى اختبارات الطباعة المستمرة — استكشف مسار الجودة المعتمد في مصانعنا."
      />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — CERTIFICATIONS CAROUSEL (5s AUTO-SCROLL + HOVER RED DEFINITIONS)
          ═══════════════════════════════════════════════════════════════ */}
      <Case
        badge="شهاداتنا واعتماداتنا الدولية"
        title="معايير الجودة العالمية المعتمدة"
        subtitle="تلتزم روايال إنك بتطبيق أعلى المعايير القياسية العالمية (ISO, REACH, RoHS, STMC, CE) لضمان الأداء الفائق والسلامة التامة — مرر المؤشر على أي شهادة لقراءة تعريفها الكامل."
      />
    </div>
  );
}
