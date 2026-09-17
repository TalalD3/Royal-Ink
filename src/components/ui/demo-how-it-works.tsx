"use client";

import HowItWorks from "@/components/ui/how-it-works";

export default function HowItWorksDemo() {
  return (
    <div className="w-full bg-background text-foreground">
      <HowItWorks
        badge="مراحل مراقبة الجودة"
        title="دورة تصنيع واختبار منتجات روايال إنك"
        subtitle="رحلة الـ 9 مراحل الصناعية الدقيقة التي تمر بها كل خرطوشة حبر وتونر من المادة الخام إلى الاختبار النهائي."
      />
    </div>
  );
}
