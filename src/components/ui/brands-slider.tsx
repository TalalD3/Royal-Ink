"use client";

import Image from "next/image";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";
import { BRAND_LOGOS, BRAND_SLIDER_ORDER } from "@/data/brand-logos";

const BRANDS = BRAND_SLIDER_ORDER.map((id) => ({ id, ...BRAND_LOGOS[id] }));

export function BrandsSlider() {
  return (
    <section className="border-y border-brand-line bg-white py-8 md:py-9">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
          <p className="shrink-0 text-center text-sm font-bold leading-6 text-brand-black lg:w-52 lg:border-e lg:border-brand-line lg:pe-10 lg:text-start">
            متوافقة مع أبرز علامات الطابعات العالمية
          </p>

          <div className="relative min-w-0 flex-1 overflow-hidden">
            {/* Edge gradient masks for seamless fade out inside the container boundaries */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20" />

            {/* LTR wrapper ensures mathematical animation coordinates are standard and jitter-free */}
            <div dir="ltr" className="w-full">
              <InfiniteSlider gap={28} speed={24} speedOnHover={10} className="w-full">
                {BRANDS.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex h-14 w-32 shrink-0 select-none items-center justify-center md:w-36"
                  >
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      loading="lazy"
                      className={cn(
                        "w-auto object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0",
                        brand.sizeClass
                      )}
                    />
                  </div>
                ))}
              </InfiniteSlider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandsSlider;
