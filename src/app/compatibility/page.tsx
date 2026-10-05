import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { CompatExplorer } from "@/components/compat/compat-explorer";
import { PrintLoader } from "@/components/compat/print-loader";

/* ══════════════════════════════════════════════════════════════════════
   COMPATIBILITY GUIDE — /compatibility
   The catalogue is loaded on the server (refreshed every minute) and
   handed to the explorer, which searches and filters in the browser.
   ══════════════════════════════════════════════════════════════════════ */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "دليل التوافق — ابحث عن الحبر المتوافق مع طابعتك | روايال إنك",
  description:
    "اكتب موديل طابعتك أو رمز الخرطوشة واعرف مستلزمات روايال إنك المتوافقة معها: تونر، خراطيش، حبر، درام، فيوزر وقطع غيار.",
};

export default async function CompatibilityPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<PrintLoader label="جارٍ تحميل دليل التوافق…" className="min-h-[60vh] bg-white" />}>
      <CompatExplorer products={products} />
    </Suspense>
  );
}
