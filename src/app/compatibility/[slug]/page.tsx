import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ChevronLeft, Filter, Printer } from "lucide-react";
import type { Product, SpecKey } from "@/types/product";
import { getProductBySlug, getProducts } from "@/lib/products";
import { getPageLocale, LOCALE_DIR } from "@/lib/locale";
import { buildSummary, buildSummarySentences, noteFor } from "@/lib/product-summary";
import {
  effectiveSpecs,
  normalize,
  printerSlug,
  suppliesFor,
} from "@/lib/product-utils";
import {
  CATEGORY_SPECS,
  CATEGORY_WORDS,
  COLOR_NAMES,
  SPEC_FIELDS,
  UI_TEXT,
  arCount,
  formatSpec,
} from "@/i18n/specs";
import { BRAND_LOGOS } from "@/data/brand-logos";
import { BlockReveal } from "@/components/ui/block-reveal";
import { ColorSwatches } from "@/components/compat/color-swatches";
import { ProductVisual } from "@/components/compat/product-visual";
import { SpecTable } from "@/components/compat/spec-table";
import { ProductCard } from "@/components/compat/product-card";
import { ContactButton, ShopButton } from "@/components/compat/product-actions";
import { StickyActions } from "@/components/compat/sticky-actions";

/* ══════════════════════════════════════════════════════════════════════
   PRODUCT PAGE — /compatibility/[slug]

   1. Header   — the product on its tile (print colour bar under it) and
                 its key facts
   2. Details  — the spec table beside the compatible printers
   3. Description — auto summary in the page language + optional note
   4. Related  — other supplies for the same printers
   5. Actions  — shop (online store, coming soon) / contact us
   ══════════════════════════════════════════════════════════════════════ */

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "منتج غير موجود | روايال إنك" };
  const description = buildSummary(product, getPageLocale())
    .replace(/[⁦-⁩]/g, "")
    .slice(0, 180);
  return {
    title: `${product.name}${product.sku ? ` (${product.sku})` : ""} | دليل التوافق — روايال إنك`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : ["/images/ri1.jpg"],
    },
  };
}

/** The three facts worth showing big, by category */
const KEY_SPECS: Record<"printer" | "other", SpecKey[]> = {
  printer: ["speedPpm", "printMode", "duplex", "technology"],
  other: ["yieldPages", "capacityMl", "voltage", "coverage", "oemRef"],
};

/** Other products that fit the same printers, most shared first */
function relatedTo(product: Product, all: Product[]): Product[] {
  const mine = new Set(product.compatiblePrinters.map(normalize));
  return all
    .filter((p) => p.id !== product.id && p.category !== "printer")
    .map((p) => ({ p, shared: p.compatiblePrinters.filter((m) => mine.has(normalize(m))).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 4)
    .map((x) => x.p);
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const all = await getProducts();
  const locale = getPageLocale();
  const isPrinter = product.category === "printer";
  const words = CATEGORY_WORDS[product.category];
  const specs = effectiveSpecs(product);
  const [lead, ...moreSentences] = buildSummarySentences(product, locale);
  const note = noteFor(product, locale);
  const logo = BRAND_LOGOS[product.brand];

  const keyFacts = KEY_SPECS[isPrinter ? "printer" : "other"]
    .filter((k) => CATEGORY_SPECS[product.category].includes(k))
    .map((k) => ({ k, value: formatSpec(k, specs[k], locale) }))
    .filter((x): x is { k: SpecKey; value: string } => !!x.value)
    .slice(0, 3);

  // Printers: the supplies that fit it. Others: the printers they fit.
  const supplies = isPrinter
    ? all.filter(
        (p) =>
          p.category !== "printer" &&
          product.compatiblePrinters.some((m) => suppliesFor(m, [p]).length > 0)
      )
    : [];
  const related = isPrinter ? supplies.slice(0, 4) : relatedTo(product, all);
  const printers = product.compatiblePrinters.filter(Boolean);
  const mainModel = printers[0];

  return (
    <div dir={LOCALE_DIR[locale]} className="flex min-h-screen flex-col bg-white">
      {/* ─── 1. HEADER ─── */}
      <section className="relative isolate overflow-hidden bg-white">
        <div className="container mx-auto px-4 pb-12 pt-8 md:pb-16 md:pt-10">
          <nav aria-label="مسار الصفحة" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-gray">
            <Link href="/" className="transition-colors hover:text-brand-red">
              الرئيسية
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href="/compatibility" className="transition-colors hover:text-brand-red">
              دليل التوافق
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <Link
              href={`/compatibility?category=${product.category}`}
              className="transition-colors hover:text-brand-red"
            >
              {words.plural[locale]}
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="line-clamp-1 font-bold text-brand-black">{product.sku || product.name}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            {/* The product on its tile, the print colour bar under it */}
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <div className="ri-crop">
                <BlockReveal
                  immediate
                  delay={0.1}
                  className={`bg-brand-mist ${product.imageUrl ? "aspect-square" : "aspect-[4/3] lg:aspect-square"}`}
                >
                  <ProductVisual
                    product={product}
                    code={product.sku}
                    eager
                    className="h-full w-full"
                    iconClassName="h-[30%] w-[30%]"
                  />
                </BlockReveal>
              </div>
              <div aria-hidden="true" className="ri-colorbar mt-3 h-2" />
              {!product.imageUrl && (
                <p className="mt-2 text-xs text-brand-gray">صورة المنتج قريباً — الرسم يوضح الفئة.</p>
              )}
            </div>

            {/* Key facts */}
            <div>
              <div className="flex items-center justify-between gap-6">
                <p className="ri-eyebrow">{words.plural[locale]}</p>
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.logo} alt={product.brand} className={`w-auto object-contain ${logo.sizeClass}`} />
                )}
              </div>

              <h1 className="mt-5 text-[1.75rem] font-extrabold leading-[1.35] text-brand-black sm:text-[2.25rem] lg:text-[2.5rem]">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                {product.sku && (
                  <span className="inline-flex items-stretch text-sm font-bold">
                    <span className="bg-brand-mist px-3 py-1.5 text-brand-gray">الرمز</span>
                    <span dir="ltr" className="bg-brand-black px-3 py-1.5 tracking-wider text-white">
                      {product.sku}
                    </span>
                  </span>
                )}
                {!isPrinter && product.color && product.color !== "none" && (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-black">
                    <ColorSwatches color={product.color} locale={locale} size="md" />
                    {COLOR_NAMES[product.color][locale]}
                  </span>
                )}
              </div>

              <p className="mt-6 max-w-2xl text-base leading-8 text-brand-gray md:text-lg md:leading-9">{lead}</p>

              {keyFacts.length > 0 && (
                <dl
                  className="mt-8 grid border-y border-brand-line"
                  style={{ gridTemplateColumns: `repeat(${keyFacts.length}, minmax(0, 1fr))` }}
                >
                  {keyFacts.map(({ k, value }, i) => (
                    <div
                      key={k}
                      className={`flex flex-col-reverse gap-1.5 py-5 ${i > 0 ? "border-s border-brand-line ps-5" : ""}`}
                    >
                      <dt className="text-xs text-brand-gray sm:text-sm">{SPEC_FIELDS[k].label[locale]}</dt>
                      <dd
                        dir={/^[\x00-\x7F]+$/.test(value) ? "ltr" : undefined}
                        className="text-right text-lg font-extrabold leading-snug text-brand-black sm:text-2xl"
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#details" className="ri-link">
                  <span>{UI_TEXT.specsTitle[locale]}</span>
                  <ArrowDown className="h-4 w-4" />
                </a>
                {isPrinter && mainModel && (
                  <Link
                    href={`/compatibility/printer/${printerSlug(mainModel)}`}
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-black transition-colors hover:text-brand-red"
                  >
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    صفحة الطابعة ومستلزماتها
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. DETAILS ─── */}
      <section id="details" className="scroll-mt-20 bg-brand-mist py-14 md:py-20">
        <div className="container mx-auto grid grid-cols-1 items-start gap-10 px-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          {/* Spec table */}
          <div>
            <h2 className="ri-h2 mb-6 text-[1.5rem] md:text-[1.875rem]">{UI_TEXT.specsTitle[locale]}</h2>
            <div className="ri-crop">
              <div className="ri-strip bg-white pt-[3px]">
                <SpecTable product={product} locale={locale} />
              </div>
            </div>
          </div>

          {/* Compatible printers (or, for a printer, its supplies) */}
          <div id="printers" className="scroll-mt-20">
            {isPrinter ? (
              <>
                <h2 className="ri-h2 mb-6 text-[1.5rem] md:text-[1.875rem]">المستلزمات المتوافقة</h2>
                {supplies.length > 0 ? (
                  <ul className="border-t border-brand-line bg-white">
                    {supplies.map((s) => (
                      <li key={s.id} className="border-b border-brand-line">
                        <Link
                          href={`/compatibility/${s.slug}`}
                          className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-brand-black hover:text-white"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-extrabold">{s.name}</span>
                            <span className="text-xs text-brand-gray group-hover:text-white/60">
                              {CATEGORY_WORDS[s.category].plural[locale]}
                            </span>
                          </span>
                          <span dir="ltr" className="shrink-0 text-xs font-extrabold text-brand-red group-hover:text-white">
                            {s.sku}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="bg-white p-5 text-sm leading-7 text-brand-gray">
                    لم تُسجَّل مستلزمات متوافقة مع هذه الطابعة في الدليل بعد — تواصل معنا وسنساعدك.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="ri-h2 text-[1.5rem] md:text-[1.875rem]">{UI_TEXT.printersTitle[locale]}</h2>
                  <span className="pb-1 text-sm font-bold text-brand-gray">
                    <span dir="ltr">{printers.length}</span>{" "}
                    {arCount(printers.length, "طراز", "طرازان", "طرازات", "طرازاً")}
                  </span>
                </div>
                {printers.length > 0 ? (
                  <ul className="grid grid-cols-1 border-t border-brand-line bg-white sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {printers.map((m) => (
                      <li key={m} className="flex items-stretch border-b border-brand-line sm:odd:border-e lg:odd:border-e-0 xl:odd:border-e">
                        {/* The model filters the guide; the icon opens the printer's own page */}
                        <Link
                          href={`/compatibility?printer=${printerSlug(m)}`}
                          title="عرض كل المستلزمات المتوافقة مع هذه الطابعة"
                          className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-3 text-sm font-bold text-brand-black transition-colors hover:bg-brand-black hover:text-white"
                        >
                          <Filter className="h-3.5 w-3.5 shrink-0 text-brand-red" aria-hidden="true" />
                          <span dir="ltr" className="truncate">
                            {m}
                          </span>
                        </Link>
                        <Link
                          href={`/compatibility/printer/${printerSlug(m)}`}
                          aria-label={`صفحة الطابعة ${m}`}
                          title="صفحة الطابعة"
                          className="flex w-11 shrink-0 items-center justify-center border-s border-brand-line text-brand-gray transition-colors hover:bg-brand-red hover:text-white"
                        >
                          <Printer className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="bg-white p-5 text-sm text-brand-gray">لم تُحدَّد الطابعات المتوافقة بعد.</p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3. DESCRIPTION ─── */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="ri-eyebrow mb-4">{UI_TEXT.descriptionTitle[locale]}</p>
            <p className="text-lg font-bold leading-9 text-brand-black md:text-xl md:leading-10">
              {lead} {moreSentences.join(" ")}
            </p>
            {note && (
              <div className="mt-8 border-s-4 border-brand-red bg-brand-mist px-5 py-4">
                <p className="text-xs font-extrabold text-brand-red">ملاحظة</p>
                <p className="mt-1.5 whitespace-pre-line text-[15px] leading-8 text-brand-black">{note}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 4. RELATED ─── */}
      {related.length > 0 && (
        <section className="bg-brand-mist py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="ri-h2 text-[1.5rem] md:text-[1.875rem]">
                {isPrinter ? "المستلزمات المتوافقة مع هذه الطابعة" : UI_TEXT.relatedTitle[locale]}
              </h2>
              {!isPrinter && mainModel && (
                <Link href={`/compatibility?printer=${printerSlug(mainModel)}`} className="ri-link">
                  <span>كل مستلزمات {mainModel}</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 border-s border-t border-brand-line sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} className="border-b border-e border-brand-line ring-0" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. ACTIONS ─── */}
      <section id="actions" className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="ri-crop grid grid-cols-1 text-white lg:grid-cols-2">
            {/* Shop — on black */}
            <div className="relative isolate bg-brand-black p-7 sm:p-10">
              <div
                aria-hidden="true"
                className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,#000,transparent_70%)]"
              />
              <p className="ri-eyebrow ri-eyebrow-light mb-4">متجرنا الإلكتروني</p>
              <h2 className="text-[1.375rem] font-extrabold leading-snug sm:text-[1.75rem]">
                اطلب هذا المنتج من متجرنا
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/70 sm:text-[15px]">
                نعمل على إطلاق متجر روايال إنك الإلكتروني لتطلب منتجاتنا مباشرة. إلى ذلك الحين، تواصل معنا أو
                زر أقرب نقطة بيع.
              </p>
              <ShopButton code={product.sku} tone="dark" className="mt-6 sm:max-w-xs" />
            </div>

            {/* Contact — on red */}
            <div className="bg-brand-red p-7 sm:p-10">
              <p className="ri-eyebrow ri-eyebrow-onred mb-4">تواصل معنا</p>
              <h2 className="text-[1.375rem] font-extrabold leading-snug sm:text-[1.75rem]">
                لديك سؤال عن هذا المنتج؟
              </h2>
              <p className="mt-3 max-w-md text-sm font-medium leading-7 sm:text-[15px]">
                فريقنا يساعدك على التأكد من التوافق مع طابعتك قبل الشراء، ويرشدك إلى أقرب نقطة بيع.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <ContactButton code={product.sku} variant="white" />
                <Link href="/find-us" className="text-sm font-bold underline-offset-4 hover:underline">
                  نقاط البيع
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center">
            <Link href="/compatibility" className="ri-link">
              <span>العودة إلى دليل التوافق</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* Phones: the two actions stay at hand until the block above shows */}
      <StickyActions code={product.sku} />
    </div>
  );
}
