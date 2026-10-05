"use client";

import { motion } from "framer-motion";
import { StoreLocator } from "@/components/ui/store-locator";
import { FindUsHeroCover } from "@/components/ui/find-us-hero-cover";
import { PageHero } from "@/components/ui/page-hero";
import { ContactSplitCard } from "@/components/ui/contact-split-card";
import { StoreVisit } from "@/components/ui/store-visit";
import { useDistributors } from "@/hooks/use-distributors";

/* ══════════════════════════════════════════════════════════════════════
   FIND US PAGE — /find-us

   1. Header   — black block (title + live network) over a red figures strip
   2. Locator  — the map on its own, with search, zoom and contact cards
   3. Visit    — the El Eulma shop front, address and directions
   4. Partners — red block (invitation) beside a black block (contacts)
   ══════════════════════════════════════════════════════════════════════ */

/** Label to sit under a number, following Arabic counting rules */
function countLabel(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  return n >= 3 && n <= 10 ? few : many;
}

export default function FindUsPage() {
  const { distributors: liveDistributors, activeWilayaCodes } =
    useDistributors();
  const totalDistributors = liveDistributors.length;
  const totalWilayas = activeWilayaCodes.size;

  const figures = [
    {
      value: String(totalDistributors),
      label: countLabel(
        totalDistributors,
        "نقطة بيع معتمدة",
        "نقاط بيع معتمدة",
        "نقطة بيع معتمدة"
      ),
    },
    {
      value: String(totalWilayas),
      label: countLabel(
        totalWilayas,
        "ولاية بها نقاط بيع",
        "ولايات بها نقاط بيع",
        "ولاية بها نقاط بيع"
      ),
    },
    { value: "58", label: "ولاية يصلها التوصيل" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. HEADER */}
      <PageHero
        crumb="نقاط البيع"
        eyebrow="أين تجدنا"
        title="نقاط بيع منتجاتنا"
        lead="منتجات روايال إنك متوفرة عبر شبكة من الموزعين ونقاط البيع المعتمدة في مختلف ولايات الوطن، انطلاقاً من مركزنا الرئيسي بولاية سطيف."
        visual={<FindUsHeroCover activeCodes={activeWilayaCodes} />}
        figures={figures}
      />

      {/* 2. LOCATOR */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="mx-auto mb-10 max-w-2xl text-center md:mb-12"
          >
            <p className="ri-eyebrow mb-4 justify-center">شبكة التوزيع</p>
            <h2 className="ri-h2">ابحث عن أقرب نقطة بيع إليك</h2>
            <p className="ri-lead mt-3">
              انقر على ولايتك في الخريطة أو ابحث باسمها لعرض نقاط البيع وأرقام
              التواصل.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
          >
            <StoreLocator distributors={liveDistributors} />
          </motion.div>
        </div>
      </section>

      {/* 3. VISIT — the El Eulma store (linked as /find-us#visit) */}
      <section id="visit" className="scroll-mt-20 bg-brand-mist py-14 md:py-20">
        <div className="container mx-auto px-4">
          <StoreVisit />
        </div>
      </section>

      {/* 4. PARTNERS */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ContactSplitCard
            eyebrow="شراكة"
            title="هل ترغب في بيع منتجات روايال إنك؟"
            text="انضم إلى شبكة موزعينا المعتمدين واستفد من منتجات عالية الجودة وأسعار تنافسية ودعم متواصل."
            cta={{ href: "/contact", label: "تواصل معنا للشراكة" }}
          />
        </div>
      </section>
    </div>
  );
}
