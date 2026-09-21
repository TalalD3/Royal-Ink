"use client";

import Image from "next/image";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

interface BrandItem {
  id: string;
  name: string;
  logo: string;
  sizeClass: string;
}

const BRANDS: BrandItem[] = [
  {
    id: "canon",
    name: "Canon",
    logo: "/images/Brands/canon.png",
    sizeClass: "h-6 md:h-7 max-w-[95px]",
  },
  {
    id: "epson",
    name: "Epson",
    logo: "/images/Brands/epson.png",
    sizeClass: "h-6 md:h-7 max-w-[100px]",
  },
  {
    id: "brother",
    name: "Brother",
    logo: "/images/Brands/brother.webp",
    sizeClass: "h-6 md:h-7 max-w-[105px]",
  },
  {
    id: "hp",
    name: "HP",
    logo: "/images/Brands/HP.svg",
    sizeClass: "h-9 md:h-10 max-w-[42px]",
  },
  {
    id: "kyocera",
    name: "Kyocera",
    logo: "/images/Brands/kyocera.svg",
    sizeClass: "h-6 md:h-7 max-w-[95px]",
  },
  {
    id: "dell",
    name: "Dell",
    logo: "/images/Brands/Dell_(1989).svg",
    sizeClass: "h-6 md:h-7 max-w-[95px]",
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "/images/Brands/Samsung.png",
    sizeClass: "h-6 md:h-7 max-w-[100px]",
  },
  {
    id: "ricoh",
    name: "Ricoh",
    logo: "/images/Brands/ricoh.png",
    sizeClass: "h-5 md:h-6 max-w-[110px]",
  },
  {
    id: "xerox",
    name: "Xerox",
    logo: "/images/Brands/xerox.png",
    sizeClass: "h-6 md:h-7 max-w-[100px]",
  },
  {
    id: "oki",
    name: "OKI",
    logo: "/images/Brands/Oki_logo.svg",
    sizeClass: "h-6 md:h-7 max-w-[95px]",
  },
  {
    id: "lexmark",
    name: "Lexmark",
    logo: "/images/Brands/Lexmark-primary-logo.svg",
    sizeClass: "h-5 md:h-6 max-w-[115px]",
  },
  {
    id: "sharp",
    name: "Sharp",
    logo: "/images/Brands/sharp.svg",
    sizeClass: "h-4 md:h-5 max-w-[115px]",
  },
  {
    id: "panasonic",
    name: "Panasonic",
    logo: "/images/Brands/panasonic.png",
    sizeClass: "h-5.5 md:h-6.5 max-w-[105px]",
  },
  {
    id: "pantum",
    name: "Pantum",
    logo: "/images/Brands/pantum.png",
    sizeClass: "h-4 md:h-4.5 max-w-[125px]",
  },
  {
    id: "deli",
    name: "Deli",
    logo: "/images/Brands/deli-seeklogo.svg",
    sizeClass: "h-6 md:h-7 max-w-[85px]",
  },
  {
    id: "lenovo",
    name: "Lenovo",
    logo: "/images/Brands/lenovo.svg",
    sizeClass: "h-6 md:h-7 max-w-[90px]",
  },
  {
    id: "konica-minolta",
    name: "Konica Minolta",
    logo: "/images/Brands/konica%20minolta.svg",
    sizeClass: "h-5.5 md:h-6.5 max-w-[110px]",
  },
  {
    id: "dascom",
    name: "Tally Dascom",
    logo: "/images/Brands/dascom.webp",
    sizeClass: "h-4 md:h-4.5 max-w-[120px]",
  },
  {
    id: "diebold-nixdorf",
    name: "Diebold Nixdorf",
    logo: "/images/Brands/Diebold_Nixdorf.svg",
    sizeClass: "h-9 md:h-10 max-w-[55px]",
  },
  {
    id: "printronix",
    name: "Printronix",
    logo: "/images/Brands/printronix.svg",
    sizeClass: "h-4.5 md:h-5 max-w-[115px]",
  },
];

export function BrandsSlider() {
  return (
    <section className="py-10 md:py-14 overflow-hidden relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            توافق مع أبرز العلامات العالمية
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
            مستلزمات طباعة متطابقة ومصممة بأعلى معايير الدقة لتعمل بسلاسة مع أشهر الطابعات في العالم
          </p>
        </div>

        {/* Free Floating Slider: clean without borders, strictly inside website container */}
        <div className="relative w-full overflow-hidden">
          {/* Edge gradient masks for seamless fade out inside the container boundaries */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 md:w-28 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 md:w-28 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

          {/* LTR wrapper ensures mathematical animation coordinates are standard and jitter-free */}
          <div dir="ltr" className="w-full">
            <InfiniteSlider
              gap={36}
              duration={55}
              durationOnHover={90}
              className="w-full py-4"
            >
              {BRANDS.map((brand) => (
                <div
                  key={brand.id}
                  className="flex h-14 md:h-16 w-32 md:w-40 shrink-0 items-center justify-center select-none"
                >
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    loading="lazy"
                    className={cn(
                      "w-auto object-contain transition-all duration-300 opacity-75 hover:opacity-100 hover:scale-110",
                      brand.sizeClass
                    )}
                  />
                </div>
              ))}
            </InfiniteSlider>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandsSlider;
