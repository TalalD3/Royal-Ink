"use client";

import React from "react";
import Link from "next/link";
import type { ProductCategory } from "@/types/product";
import { CategoryIcon } from "@/components/ui/category-icons";

/* ── Category data (8 essential printer & consumables categories) ── */
interface Category {
  label: string;
  /** Two or three words, shown from xl up (where it fits on one line) */
  desc: string;
  category: ProductCategory;
}

const CATEGORIES: Category[] = [
  {
    label: "تونر",
    desc: "لطابعات الليزر",
    category: "toner",
  },
  {
    label: "خراطيش",
    desc: "لطابعات نفث الحبر",
    category: "cartridge",
  },
  {
    label: "حبر",
    desc: "عبوات إعادة التعبئة",
    category: "ink",
  },
  {
    label: "درام",
    desc: "وحدات الأسطوانة",
    category: "drum_unit",
  },
  {
    label: "فيوزر",
    desc: "التثبيت الحراري",
    category: "fuser",
  },
  {
    label: "أشرطة ريبون",
    desc: "للطابعات النقطية",
    category: "ribbon",
  },
  {
    label: "قطع غيار",
    desc: "مكونات الصيانة",
    category: "spare_parts",
  },
  {
    label: "طابعات",
    desc: "ليزر ونفث الحبر",
    category: "printer",
  },
];

/* One category: the icon on a square tile, the name, and (from lg) a short
   line under it (xl). On hover a black block rises through the cell and the
   tile turns red — the logo's two blocks. */
function CategoryCell({ cat }: { cat: Category }) {
  return (
    <Link
      href={`/compatibility?category=${cat.category}`}
      className="group relative isolate flex flex-col items-center gap-2.5 bg-white px-1.5 py-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-red sm:py-6 lg:gap-3 lg:px-3 lg:py-7"
    >
      {/* Black fill, rising from the bottom */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-brand-black transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
      />

      <span className="flex h-12 w-12 items-center justify-center bg-brand-mist text-brand-black transition-colors duration-300 group-hover:bg-brand-red group-hover:text-white lg:h-14 lg:w-14">
        <CategoryIcon category={cat.category} className="h-7 w-7 lg:h-8 lg:w-8" />
      </span>

      <span className="text-[13px] font-extrabold leading-5 text-brand-black transition-colors duration-300 group-hover:text-white sm:text-sm lg:text-base">
        {cat.label}
      </span>

      <span className="-mt-1.5 hidden whitespace-nowrap text-[13px] leading-5 text-brand-gray transition-colors duration-300 group-hover:text-white/65 xl:block">
        {cat.desc}
      </span>
    </Link>
  );
}

/* ── Component ──
   The categories, fixed in place directly under the hero: one line of
   eight from md up, two rows of four on phones. Hairlines between the
   cells come from the 1px grid gap. */
export function CategoriesRow() {
  return (
    <section aria-label="فئات المنتجات" className="bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-px bg-brand-line md:grid-cols-8">
          {CATEGORIES.map((cat) => (
            <CategoryCell key={cat.label} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesRow;
