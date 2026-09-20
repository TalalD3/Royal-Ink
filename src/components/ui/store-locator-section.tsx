"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { AlgeriaMapPreview } from "@/components/ui/algeria-map";

/* ══════════════════════════════════════════════════════════════════════
   STORE LOCATOR SECTION — Home Page
   
   Shows a large preview map of Algeria with pins + CTA button
   ══════════════════════════════════════════════════════════════════════ */

export function StoreLocatorSection() {
  return (
    <section className="py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
              شبكتنا الوطنية
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight"
          >
            اعثر على{" "}
            <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">
              منتجاتنا
            </span>{" "}
            في مدينتك
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
          >
            شبكة توزيع واسعة تغطي أهم ولايات الوطن — ابحث عن أقرب نقطة بيع إليك
          </motion.p>
        </div>

        {/* Map preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <AlgeriaMapPreview />
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 md:mt-8 relative z-10"
        >
          <Link
            href="/find-us"
            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 text-sm"
          >
            <MapPin className="w-4 h-4" />
            اكتشف نقاط بيع منتجاتنا
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
