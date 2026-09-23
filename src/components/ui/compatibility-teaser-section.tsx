"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Package,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function CompatibilityTeaserSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/compatibility?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/compatibility");
    }
  };

  const handleQuickTagClick = (tag: string) => {
    router.push(`/compatibility?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background border-y border-border/50">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-rose-500/5 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10" dir="rtl">
        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-card/90 dark:bg-card/70 border border-primary/25 shadow-2xl shadow-primary/10 backdrop-blur-md p-6 sm:p-10 md:p-14 overflow-hidden"
        >
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-primary" />

          {/* Grid Layout: Header & Search on Right/Top, Features & Action on Left */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Right Side: Headline, Pitch, Interactive Search Input */}
            <div className="lg:col-span-7 space-y-6 text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>محرك فحص التوافق الذكي — Royal Ink</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-[1.25] tracking-tight">
                هل تبحث عن الحبر{" "}
                <span className="bg-gradient-to-l from-red-600 to-rose-500 bg-clip-text text-transparent">
                  المتوافق تماماً
                </span>{" "}
                مع طابعتك؟
              </h2>

              {/* Description */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                لا داعي للقلق بشأن اختيار خرطوشة غير مطابقة! اكتب موديل طابعتك أو رمز الحبر لمعرفة المستلزمات المتوافقة بنسبة 100% والمضمونة بجودة أصلية في جميع ولايات الجزائر.
              </p>

              {/* Interactive Mini Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="relative flex items-center bg-background border-2 border-primary/40 hover:border-primary/80 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 rounded-2xl p-1.5 shadow-lg shadow-black/5 transition-all">
                  <Search className="w-5 h-5 text-primary mr-3 ml-2 shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="اكتب موديل طابعتك (مثال: HP M404, Canon 6030, Epson L3150)..."
                    className="w-full h-11 bg-transparent text-sm md:text-base text-foreground focus:outline-none placeholder:text-muted-foreground/60 px-2"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>فحص التوافق</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Popular Quick Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px]">
                  الأكثر بحثاً:
                </span>
                {[
                  { label: "HP LaserJet Pro P1102 (85A)", q: "P1102" },
                  { label: "Canon LBP6030 (725)", q: "LBP6030" },
                  { label: "HP LaserJet M404 (59A)", q: "M404" },
                  { label: "Epson EcoTank L3150 (103)", q: "L3150" },
                  { label: "Brother DCP-L2540DW", q: "L2540" },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickTagClick(item.q)}
                    className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/15 hover:text-primary text-foreground text-[11px] font-medium transition-colors border border-border/60 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Left Side: Visual Feature Cards & Primary Gateway */}
            <div className="lg:col-span-5 space-y-4">
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 flex items-start gap-3.5 hover:border-primary/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground mb-0.5">
                      بحث ذكي في الاتجاهين
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                      ابحث بموديل الطابعة لمعرفة حبرها، أو ابحث برمز الحبر لمعرفة الطابعات التي تدعمه.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 flex items-start gap-3.5 hover:border-primary/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground mb-0.5">
                      توافق مضمون وحماية للطابعة
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                      خراطيش تونر وأحبار سائلة مصنعة بمقاييس دقيقة لحماية رؤوس وأجزاء الطابعة.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 flex items-start gap-3.5 hover:border-primary/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground mb-0.5">
                      طلب مباشر عبر واتساب والهاتف
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                      تأكيد فوري للطلب مع خدمة التوصيل السريع إلى جميع الولايات.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gateway CTA Button */}
              <Link
                href="/compatibility"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-primary text-white text-xs sm:text-sm font-bold hover:shadow-xl hover:shadow-primary/25 hover:opacity-95 transition-all text-center cursor-pointer"
              >
                <span>دخول دليل التوافق الشامل وتصفح الكتالوج</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
