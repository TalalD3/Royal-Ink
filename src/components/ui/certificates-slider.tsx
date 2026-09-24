"use client";

import Link from "next/link";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ChevronLeft, Award } from "lucide-react";

/* ── Certificate items (referencing existing SVGs) ── */
interface CertItem {
  id: string;
  name: string;
  logo: string;
  sizeClass: string;
}

const CERTS: CertItem[] = [
  {
    id: "iso-9001",
    name: "ISO 9001",
    logo: "/images/certificate/Artboard 3.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
  {
    id: "iso-14001",
    name: "ISO 14001",
    logo: "/images/certificate/Artboard 7.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
  {
    id: "reach",
    name: "REACH",
    logo: "/images/certificate/Artboard 1.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
  {
    id: "rohs",
    name: "RoHS",
    logo: "/images/certificate/Artboard 6.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
  {
    id: "ce",
    name: "CE",
    logo: "/images/certificate/ce.svg",
    sizeClass: "h-8 md:h-10 max-w-[60px]",
  },
  {
    id: "stmc",
    name: "STMC",
    logo: "/images/certificate/Artboard 4.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
  {
    id: "sgs",
    name: "SGS",
    logo: "/images/certificate/Artboard 5.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
  {
    id: "tuv",
    name: "TÜV",
    logo: "/images/certificate/Artboard 8.svg",
    sizeClass: "h-10 md:h-12 max-w-[100px]",
  },
];

export function CertificatesSlider() {
  return (
    <section className="py-10 md:py-14 overflow-hidden relative bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-3.5 shadow-sm">
            <Award className="w-3.5 h-3.5 text-primary" />
            معتمدون دولياً
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-snug">
            شهادات الجودة والمطابقة العالمية
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-2.5 max-w-2xl mx-auto">
            تخضع جميع منتجات روايال إنك لأدق معايير الفحص والسلامة البيئية، وحاصلة على كبرى اعتمادات الجودة العالمية لضمان أعلى درجات الأداء والموثوقية.
          </p>
        </div>

        {/* Slider + Interactive hover overlay */}
        <Link
          href="/quality"
          className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
        >
          {/* Hover overlay — white blur + CTA text */}
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 bg-background/75 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <ChevronLeft className="w-5 h-5" />
              <span>اكتشف شهاداتنا الكاملة</span>
            </div>
          </div>

          {/* Slider area */}
          <div className="relative w-full overflow-hidden transition-all duration-500 group-hover:opacity-30 group-hover:blur-sm">
            {/* Edge gradient masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 md:w-28 bg-gradient-to-r from-muted/60 via-muted/40 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 md:w-28 bg-gradient-to-l from-muted/60 via-muted/40 to-transparent z-10" />

            {/* LTR wrapper for stable animation */}
            <div dir="ltr" className="w-full">
              <InfiniteSlider
                gap={48}
                speed={28}
                speedOnHover={14}
                className="w-full py-4"
              >
                {CERTS.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex h-14 md:h-16 w-28 md:w-36 shrink-0 items-center justify-center select-none"
                  >
                    <img
                      src={cert.logo}
                      alt={`${cert.name} certification`}
                      loading="lazy"
                      className={`w-auto object-contain opacity-75 ${cert.sizeClass}`}
                    />
                  </div>
                ))}
              </InfiniteSlider>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default CertificatesSlider;
