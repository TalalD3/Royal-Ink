"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { BlockReveal } from "@/components/ui/block-reveal";
import { QualityJourney, type QualityPhase } from "@/components/ui/quality-journey";
import { CertificatesExplorer } from "@/components/ui/certificates-explorer";
import { ContactSplitCard } from "@/components/ui/contact-split-card";
import { COMPANY_CERTIFICATES } from "@/data/certificates";

/* ══════════════════════════════════════════════════════════════════════
   QUALITY PAGE — /quality

   1. Header        — black block (title + real product photo with the
                      inspection report) over a red figures strip
   2. Quality line  — the 9 inspection steps, grouped into 3 stations
   3. Certificates  — pick one, read its definition on the black panel
   4. Commitment    — same-day replacement promise + direct contacts
   ══════════════════════════════════════════════════════════════════════ */

/** Step photos — free Unsplash images (Unsplash License) */
const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

const PHASES: QualityPhase[] = [
  {
    title: "المواد الخام",
    english: "Raw materials",
    description: "لا يدخل أي مكوّن خط الإنتاج قبل فحصه واختباره.",
    steps: [
      {
        title: "فحص المواد الخام الخارجي",
        subtitle: "Raw Materials Exterior Inspection",
        description:
          "فحص دقيق لكافة المكونات الأساسية مثل أسطوانات OPC والتروس للتأكد من خلوها من أي عيوب أو شوائب قبل دخول خط الإنتاج.",
        image: U("photo-1639772823907-a716be4bdecc"),
        imageAlt: "فحص المكونات تحت المجهر",
      },
      {
        title: "فحص طباعة المواد الخام",
        subtitle: "Raw Materials Printing Inspection",
        description:
          "اختبار طباعة أولي لعينات بودرة الحبر السائبة لقياس درجة السواد، الكثافة الضوئية، ونقاء التدرج اللوني.",
        image: U("photo-1672356203083-a0206308c7ea"),
        imageAlt: "طابعة تُخرج شريط اختبار ألوان",
      },
      {
        title: "اختبار العمر الافتراضي للمواد",
        subtitle: "Raw Materials Lifetime Testing",
        description:
          "إجراء اختبارات دوران وإجهاد مستمرة على منصات ميكانيكية متخصصة لقياس متانة القطع ومقاومتها للاحتكاك الطويل.",
        image: U("photo-1524514587686-e2909d726e9b"),
        imageAlt: "تروس معدنية لآلة اختبار",
      },
    ],
  },
  {
    title: "الإنتاج",
    english: "Production",
    description: "تجميع في غرف نظيفة وتخزين في بيئة محكمة.",
    steps: [
      {
        title: "تجميع وتركيب المنتج",
        subtitle: "Product Assembling",
        description:
          "تجميع أجزاء الخرطوشة في غرف نظيفة ومضبوطة حرارياً على خطوط تجميع متطورة تحت إشراف فنيين متمرسين.",
        image: U("photo-1700727448686-b314cb5f9948"),
        imageAlt: "فنيون يجمّعون القطع على خط الإنتاج",
      },
      {
        title: "تخزين المنتجات نصف المصنعة",
        subtitle: "Semi-Finished Product Warehousing",
        description:
          "تخزين وحدات التجميع في مستودعات بيئية محكمة لحماية المكونات من الرطوبة والغبار قبل مرحلة التعبئة النهائية.",
        image: U("photo-1644079446600-219068676743"),
        imageAlt: "ممر مستودع منظم برفوف معدنية",
      },
    ],
  },
  {
    title: "الاختبار النهائي",
    english: "Final testing",
    description: "اختبارات المنتج والطباعة قبل التعبئة.",
    steps: [
      {
        title: "فحص إحكام الإغلاق والتفريغ",
        subtitle: "Airtight Inspection",
        description:
          "اختبار الخراطيش في غرف ضغط وتفريغ هوائي (Vacuum chamber) للتحقق القاطع من عدم وجود أي تسريب حبر في أي ظرف.",
        image: U("photo-1513827574967-e763dd0bc329"),
        imageAlt: "مقياس ضغط لاختبار الإحكام",
      },
      {
        title: "اختبار الاهتزاز والصدمات",
        subtitle: "Vibrating Inspection",
        description:
          "محاكاة الاهتزازات وظروف النقل والشحن البري والجوي لضمان بقاء المنتج وعبوته سليمين ومحميين 100%.",
        image: U("photo-1695222833131-54ee679ae8e5"),
        imageAlt: "شاحنة نقل على الطريق",
      },
      {
        title: "فحص جودة الطباعة الأولي (PQ1)",
        subtitle: "PQ1 Printing Inspection",
        description:
          "تحليل دقيق لدرجات التباين، وضوح النصوص الصغيرة، ودقة الخطوط الرفيعة ونقاء المساحات الملونة.",
        image: U("photo-1697301439916-169bd6844842"),
        imageAlt: "عدسة مكبرة فوق نص مطبوع",
      },
      {
        title: "اختبار دورة الحياة والجهد النهائي (PQ2)",
        subtitle: "PQ2 Lifetime Testing",
        description:
          "طباعة آلاف الصفحات المتواصلة للتأكد من المردود الكامل للخرطوشة وثبات مستوى الوضوح حتى آخر قطرة حبر.",
        image: U("photo-1562240020-ce31ccb0fa7d"),
        imageAlt: "رزمة من الأوراق المطبوعة",
      },
    ],
  },
];

const TOTAL_STEPS = PHASES.reduce((n, p) => n + p.steps.length, 0);

/* Header visual: a real Royal Ink product photo with the inspection
   report — the three stations — printed as a strip under it, so nothing
   sits on the photo */
function QualityHeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
      className="ri-crop ri-crop-light"
    >
      {/* The photo, uncovered by the label wipe */}
      <BlockReveal immediate delay={0.2} className="aspect-[16/10] bg-white lg:aspect-[16/9]">
        <Image
          src="/images/ri1.jpg"
          alt="خراطيش حبر روايال إنك"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[50%_42%]"
        />
      </BlockReveal>

      {/* Inspection report — the stations, one cell each */}
      <div className="ri-strip bg-white text-brand-black">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5">
          <span className="text-sm font-extrabold">تقرير الفحص</span>
          <span
            dir="ltr"
            className="bg-brand-black px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white"
          >
            QC
          </span>
        </div>
        <ul className="grid grid-cols-3 border-t border-brand-line">
          {PHASES.map((p, i) => (
            <li
              key={p.title}
              className="flex flex-col items-start gap-2 px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:gap-2.5 sm:px-5 [&:not(:first-child)]:border-s [&:not(:first-child)]:border-brand-line"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-brand-red text-white">
                  <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold text-brand-gray sm:hidden" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="font-bold leading-5">{p.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function QualityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. HEADER */}
      <PageHero
        crumb="الجودة"
        eyebrow="مراقبة الجودة"
        title="كل عبوة تمر بهذه المراحل قبل أن تصل إليك"
        lead="من عينة التصنيع الأولى إلى الاختبار على طابعات حقيقية، هذه هي رحلة الجودة عند روايال إنك."
        hideLeadOnPhone={false}
        visual={<QualityHeroVisual />}
        figures={[
          { value: String(TOTAL_STEPS), label: "مراحل فحص قبل التعبئة" },
          { value: String(PHASES.length), label: "محطات رئيسية للمراقبة" },
          { value: String(COMPANY_CERTIFICATES.length), label: "شهادات واعتمادات دولية" },
        ]}
      />

      {/* 2. QUALITY LINE */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <QualityJourney
            phases={PHASES}
            intro={
              <div>
                <p className="ri-eyebrow mb-4">مراحل مراقبة الجودة</p>
                <h2 className="ri-h2">
                  <span dir="ltr">{TOTAL_STEPS}</span> مراحل فحص، من المادة الخام
                  إلى العبوة
                </h2>
                <p className="ri-lead mt-4">
                  من الفحص الدقيق للمواد الخام إلى محاكاة النقل وأقسى اختبارات
                  الطباعة المستمرة — هذا هو مسار الجودة المعتمد في مصانعنا.
                </p>
              </div>
            }
            finish={{
              title: "جاهز للتعبئة",
              text: "بعد اجتياز جميع مراحل الفحص",
            }}
          />
        </div>
      </section>

      {/* 3. CERTIFICATES */}
      <section className="bg-brand-mist py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-2xl">
              <p className="ri-eyebrow mb-4">شهاداتنا واعتماداتنا الدولية</p>
              <h2 className="ri-h2">معايير الجودة العالمية المعتمدة</h2>
            </div>
            <p className="ri-lead max-w-md">
              تلتزم روايال إنك بأعلى المعايير القياسية العالمية لضمان الأداء
              الفائق والسلامة التامة — اختر أي شهادة لقراءة تعريفها.
            </p>
          </div>

          <CertificatesExplorer certificates={COMPANY_CERTIFICATES} />
        </div>
      </section>

      {/* 4. COMMITMENT */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ContactSplitCard
            eyebrow="التزامنا بعد البيع"
            title="نستبدل أي منتج ذي عيب صناعي في اليوم نفسه"
            text="ونتابع ملاحظات عملائنا باستمرار. فريق الدعم متوفر عبر الهاتف والبريد الإلكتروني لأي استفسار تقني."
            cta={{ href: "/contact", label: "تواصل معنا" }}
          />
        </div>
      </section>
    </div>
  );
}
