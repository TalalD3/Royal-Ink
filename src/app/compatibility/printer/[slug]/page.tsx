import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, Filter } from "lucide-react";
import type { ProductCategory } from "@/types/product";
import { CATEGORY_ORDER } from "@/types/product";
import { getPrinterBySlug, getPrinterIndex, getProducts } from "@/lib/products";
import { suppliesFor } from "@/lib/product-utils";
import { CATEGORY_WORDS, arCount } from "@/i18n/specs";
import { BRAND_LOGOS } from "@/data/brand-logos";
import { CategoryIcon } from "@/components/ui/category-icons";
import { ContactSplitCard } from "@/components/ui/contact-split-card";
import { ProductCard } from "@/components/compat/product-card";

/* ══════════════════════════════════════════════════════════════════════
   PRINTER PAGE — /compatibility/printer/[slug]
   «مستلزمات طابعة HP LaserJet Pro P1102»: every ROYALiNK supply that fits
   the printer, grouped by type, and other printers of the same brand.
   ══════════════════════════════════════════════════════════════════════ */

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const printer = await getPrinterBySlug(params.slug);
  if (!printer) return { title: "طابعة غير موجودة | روايال إنك" };
  return {
    title: `مستلزمات طابعة ${printer.model} | دليل التوافق — روايال إنك`,
    description: `تونر، حبر، درام وقطع غيار روايال إنك المتوافقة مع طابعة ${printer.model}.`,
  };
}

export default async function PrinterPage({ params }: Props) {
  const printer = await getPrinterBySlug(params.slug);
  if (!printer) notFound();

  const products = await getProducts();
  const supplies = suppliesFor(printer.model, products);
  const groups = CATEGORY_ORDER.filter((c) => c !== "printer")
    .map((c) => ({ c, items: supplies.filter((p) => p.category === c) }))
    .filter((g) => g.items.length > 0) as { c: ProductCategory; items: typeof supplies }[];

  const index = await getPrinterIndex();
  const siblings = Array.from(index.values())
    .filter((e) => e.slug !== printer.slug && e.brand === printer.brand && e.supplies.length > 0)
    .sort((a, b) => b.supplies.length - a.supplies.length)
    .slice(0, 12);

  const logo = printer.brand ? BRAND_LOGOS[printer.brand] : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── HEADER ─── */}
      <section className="relative isolate overflow-hidden bg-brand-black text-white">
        <div
          aria-hidden="true"
          className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,#000,transparent_65%)]"
        />
        <div className="container mx-auto px-4 pb-10 pt-10 md:pb-14 md:pt-14">
          <nav aria-label="مسار الصفحة" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <Link href="/" className="transition-colors hover:text-white">
              الرئيسية
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href="/compatibility" className="transition-colors hover:text-white">
              دليل التوافق
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span dir="ltr" className="font-bold text-white">
              {printer.model}
            </span>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="ri-eyebrow ri-eyebrow-light mb-4">مستلزمات الطابعة</p>
              <h1 className="text-[1.75rem] font-extrabold leading-[1.35] sm:text-[2.25rem] lg:text-[2.75rem]">
                مستلزمات طابعة{" "}
                <span dir="ltr" className="inline-block">
                  {printer.model}
                </span>
              </h1>
              <p className="mt-4 text-base leading-8 text-white/70 md:text-lg">
                {supplies.length > 0 ? (
                  <>
                    <span dir="ltr" className="font-extrabold text-white">
                      {supplies.length}
                    </span>{" "}
                    {arCount(supplies.length, "مستلزم", "مستلزمان", "مستلزمات", "مستلزماً")} من روايال إنك{" "}
                    {arCount(supplies.length, "متوافق", "متوافقان", "متوافقة", "متوافقاً")} مع هذه الطابعة، مصنّفة حسب
                    النوع.
                  </>
                ) : (
                  "لم تُسجَّل بعد مستلزمات متوافقة مع هذه الطابعة في الدليل — تواصل معنا وسنساعدك."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {logo && (
                <span className="flex h-14 items-center bg-white px-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.logo} alt={logo.name} className={`w-auto object-contain ${logo.sizeClass}`} />
                </span>
              )}
              {printer.printerProduct && (
                <Link href={`/compatibility/${printer.printerProduct.slug}`} className="ri-btn ri-btn-outline-light h-14">
                  <span>صفحة الطابعة كمنتج</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="ri-colorbar h-2" />
      </section>

      {/* ─── SUPPLIES, BY TYPE ─── */}
      <section className="bg-brand-mist py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <a
                  key={g.c}
                  href={`#${g.c}`}
                  className="inline-flex items-center gap-2 bg-white px-3 py-2 text-sm font-bold text-brand-black transition-colors hover:bg-brand-black hover:text-white"
                >
                  <CategoryIcon category={g.c} className="h-4 w-4" />
                  {CATEGORY_WORDS[g.c].plural.ar}
                  <span dir="ltr" className="text-xs text-brand-gray">
                    {g.items.length}
                  </span>
                </a>
              ))}
            </div>
            <Link href={`/compatibility?printer=${printer.slug}`} className="ri-link">
              <span>عرضها في دليل التوافق</span>
              <Filter className="h-4 w-4" />
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white px-6 py-12 text-center">
              <p className="text-lg font-extrabold text-brand-black">لا توجد مستلزمات مسجّلة لهذه الطابعة بعد</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-brand-gray">
                أرسل لنا صورة ملصق الطابعة ومرجع المستهلك المستخدم، وسنحدد لك المستلزم المناسب.
              </p>
              <Link href="/contact" className="ri-btn ri-btn-red mt-6 h-11 px-5 text-sm">
                <span>تواصل معنا</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {groups.map((g) => (
                <div key={g.c} id={g.c} className="scroll-mt-24">
                  <h2 className="mb-5 flex items-center gap-3 text-xl font-extrabold text-brand-black md:text-2xl">
                    <span className="flex h-10 w-10 items-center justify-center bg-brand-black text-white">
                      <CategoryIcon category={g.c} className="h-5 w-5" />
                    </span>
                    {CATEGORY_WORDS[g.c].plural.ar}
                    <span dir="ltr" className="text-base font-bold text-brand-gray">
                      ({g.items.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 border-s border-t border-brand-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {g.items.map((p) => (
                      <ProductCard key={p.id} product={p} className="border-b border-e border-brand-line ring-0" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── OTHER PRINTERS OF THE BRAND ─── */}
      {siblings.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="ri-h2 mb-6 text-[1.5rem] md:text-[1.875rem]">
              طابعات أخرى من <span dir="ltr">{printer.brand}</span>
            </h2>
            <ul className="grid grid-cols-1 border-s border-t border-brand-line sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((e) => (
                <li key={e.slug} className="border-b border-e border-brand-line">
                  <Link
                    href={`/compatibility/printer/${e.slug}`}
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-brand-black hover:text-white"
                  >
                    <span dir="ltr" className="truncate text-sm font-extrabold">
                      {e.model}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand-gray group-hover:text-white/70">
                      <span dir="ltr">{e.supplies.length}</span>
                      {arCount(e.supplies.length, "مستلزم", "مستلزمان", "مستلزمات", "مستلزماً")}
                      <ArrowLeft className="h-4 w-4 text-brand-red group-hover:text-white" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── HELP ─── */}
      <section className="bg-brand-mist py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ContactSplitCard
            eyebrow="تحقق قبل الشراء"
            title="غير متأكد من المستلزم المناسب؟"
            text="ابدأ بالاسم الكامل لطراز الطابعة ومرجع المستهلك المستخدم. إن بقي الشك قائماً، أرسل لنا صورة لملصق الطابعة ومرجع المستهلك قبل الشراء."
            cta={{ href: "/contact", label: "تواصل معنا" }}
          />
        </div>
      </section>
    </div>
  );
}
