"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Iso9001 } from "@/components/ui/logo-cloud-certs-utils/iso-9001";
import { Iso14001 } from "@/components/ui/logo-cloud-certs-utils/iso-14001";
import { Reach } from "@/components/ui/logo-cloud-certs-utils/reach";
import { Rohs } from "@/components/ui/logo-cloud-certs-utils/rohs";

export function LogoCloudCerts() {
  return (
    <section className="bg-background w-full mt-10 pt-8 border-t border-border/40">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-red bg-red/10 rounded-full px-4 py-2">
          معتمدون دولياً
        </div>
      </div>

      {/* Completely clean unbordered container as it was originally */}
      <Link
        href="/quality"
        className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red rounded-xl py-6"
      >
        {/* Desktop Hover Overlay: appears only on hover */}
        <div className="absolute inset-0 z-10 hidden md:flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100 bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="flex items-center text-sm font-semibold text-foreground duration-150 group-hover:text-red">
            <ChevronLeft className="mr-1 size-5" />
            <span>اكتشف شهاداتنا الكاملة</span>
          </div>
        </div>

        {/* Mobile Repeating Overlay: smoothly reveals "Tap to reveal" over the logos area every 3 seconds with NO borders */}
        <motion.div
          animate={{
            opacity: [0, 0, 1, 1, 0, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            times: [0, 0.1, 0.4, 0.65, 0.9, 1],
            ease: "easeInOut",
          }}
          className="absolute inset-0 z-10 flex md:hidden items-center justify-center bg-background/80 backdrop-blur-[2px] pointer-events-none rounded-xl"
        >
          <div className="flex items-center gap-1.5 text-sm font-bold text-red drop-shadow-xs">
            <span>المس للاكتشاف • Tap to reveal</span>
            <ChevronLeft className="size-4" />
          </div>
        </motion.div>

        {/* Pure original clean logos sitting directly on the background */}
        <div className="group-hover:blur-sm **:fill-foreground mx-auto grid grid-cols-2 gap-x-8 gap-y-8 transition-all duration-500 group-hover:opacity-30 md:grid-cols-4 items-center">
          <div className="flex items-center justify-center">
            <Iso9001 className="h-12 w-full max-w-[100px] text-foreground" />
          </div>
          <div className="flex items-center justify-center">
            <Iso14001 className="h-12 w-full max-w-[100px] text-foreground" />
          </div>
          <div className="flex items-center justify-center">
            <Reach className="h-12 w-full max-w-[100px] text-foreground" />
          </div>
          <div className="flex items-center justify-center">
            <Rohs className="h-12 w-full max-w-[100px] text-foreground" />
          </div>
        </div>
      </Link>
    </section>
  );
}
