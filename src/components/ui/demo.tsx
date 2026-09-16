"use client";

import { SqueezeCarousel, type SqueezeSlide } from "@/components/ui/carousel-squeeze";

export const settings = {
    height: 400,
    gap: 16,
    slatGap: 8,
    slatWidth: 8,
    radius: 6,
    duration: 1000,
    hoverGrow: true,
    autoplay: false,
    interval: 6000,
    controls: true,
};

type DemoProps = Partial<typeof settings>;

const mark = (text: string) => (
    <span className="text-sm font-medium tracking-tight text-white px-2 py-1 bg-black/40 rounded">{text}</span>
);

const slides: SqueezeSlide[] = [
    {
        id: "ink",
        title: "مستلزمات الطباعة بعلامة ROYALiNK",
        description:
            "تشكيلة واسعة تشمل عبوات الأحبار، خراطيش الحبر والتونر، مساحيق التونر، وأشرطة التحبير.",
        action: "اكتشف المستلزمات",
        overlay: mark("أحبار وتونر"),
        image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Colorful ink cartridges and printing supplies",
    },
    {
        id: "printers",
        title: "أجهزة ومعدات من علامات عالمية",
        description:
            "نوفر طابعات، ماسحات ضوئية، وحواسيب مكتبية ومحمولة لتلبية متطلبات العمل المكتبي وإعداد الوثائق.",
        action: "تصفح الأجهزة",
        overlay: mark("طابعات ومعدات"),
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Modern office printer machine",
    },
    {
        id: "support",
        title: "دعم خبير وتوافق مدروس",
        description:
            "نساعد عملاءنا على تحديد المستلزم المناسب لطابعاتهم، ونقدم توجيهاً عملياً بشأن التوافق والاستخدام.",
        action: "اتصل بالدعم",
        overlay: mark("دعم فني"),
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop",
        imageAlt: "Technical support team helping customers",
    },
    {
        id: "distribution",
        title: "شبكة توزيع وطنية",
        description:
            "تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة من الموزعين والوسطاء ونقاط البيع.",
        action: "ابحث عن موزع",
        overlay: mark("التوزيع"),
        image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c66a41?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Boxes prepared for shipping and distribution",
    },
    {
        id: "eco",
        title: "مسؤولية بيئية",
        description:
            "نهتم بالجوانب البيئية المرتبطة بمستلزمات الطباعة. عبواتنا تتضمن العلامات المطبوعة ISO 14001 و RoHS.",
        action: "اقرأ المزيد",
        overlay: mark("البيئة"),
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop",
        imageAlt: "Eco-friendly green leaves growing",
    },
];

export default function SqueezeCarouselDemo(props: DemoProps) {
    const options = { ...settings, ...props };

    return (
        <div className="w-full py-10" dir="rtl">
            <SqueezeCarousel slides={slides} label="أبرز منتجاتنا" {...options} />
        </div>
    );
}
