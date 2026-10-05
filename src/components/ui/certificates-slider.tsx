"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LogoShape } from "@/components/ui/certificates-explorer";

/* ── Certificate items (referencing existing SVGs) ── */
interface CertItem {
  id: string;
  name: string;
  logo: string;
  sizeClass: string;
}

const LOGO = "h-10 w-16 sm:h-14 sm:w-[110px] md:h-16";

const CERTS: CertItem[] = [
  { id: "iso-9001", name: "ISO 9001", logo: "/images/certificate/Artboard 3.svg", sizeClass: LOGO },
  { id: "iso-14001", name: "ISO 14001", logo: "/images/certificate/Artboard 7.svg", sizeClass: LOGO },
  { id: "reach", name: "REACH", logo: "/images/certificate/Artboard 1.svg", sizeClass: LOGO },
  { id: "rohs", name: "RoHS", logo: "/images/certificate/Artboard 6.svg", sizeClass: LOGO },
  { id: "ce", name: "CE", logo: "/images/certificate/ce.svg", sizeClass: "h-7 w-14 sm:h-10 sm:w-20 md:h-11" },
  { id: "stmc", name: "STMC", logo: "/images/certificate/Artboard 8.svg", sizeClass: "h-9 w-16 sm:h-12 sm:w-[110px] md:h-14" },
  { id: "sgs", name: "SGS", logo: "/images/certificate/Artboard 5.svg", sizeClass: LOGO },
  { id: "gmc", name: "GMC", logo: "/images/certificate/Artboard 4.svg", sizeClass: LOGO },
];

export function CertificatesSlider() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="ri-eyebrow mb-4">معتمدون دولياً</p>
            <h2 className="ri-h2">شهادات الجودة والمطابقة العالمية</h2>
            {/* Phones skip the paragraph — the logos say it */}
            <p className="ri-lead mt-5 hidden sm:block">
              تخضع جميع منتجات روايال إنك لأدق معايير الفحص والسلامة البيئية،
              وحاصلة على كبرى اعتمادات الجودة العالمية لضمان أعلى درجات الأداء
              والموثوقية.
            </p>
            <Link href="/quality" className="ri-link mt-7 hidden lg:inline-flex">
              <span>اكتشف شهاداتنا الكاملة</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          >
            {/* Certificates — a ruled sheet, four across at every size; on
                phones it shows the logos only (each name is on its logo).
                Hovering a logo turns it red, as on the quality page. */}
            <ul className="grid grid-cols-4 border-s border-t border-brand-line">
              {CERTS.map((cert) => (
                <li
                  key={cert.id}
                  className="group flex flex-col items-center justify-center gap-4 border-b border-e border-brand-line px-2 py-5 text-brand-black sm:px-4 sm:py-8"
                >
                  <span className="flex h-10 items-center justify-center sm:h-16">
                    <LogoShape
                      src={cert.logo}
                      className={`${cert.sizeClass} group-hover:text-brand-red`}
                    />
                  </span>
                  <span
                    dir="ltr"
                    className="sr-only text-xs font-bold tracking-wide text-brand-gray transition-colors duration-200 group-hover:text-brand-red sm:not-sr-only"
                  >
                    {cert.name}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/quality" className="ri-link mt-7 lg:hidden">
              <span>اكتشف شهاداتنا الكاملة</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CertificatesSlider;
