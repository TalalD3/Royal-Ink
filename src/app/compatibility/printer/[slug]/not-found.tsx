import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrinterNotFound() {
  return (
    <section className="flex min-h-[60vh] items-center bg-white py-20">
      <div className="container mx-auto px-4 text-center">
        <div dir="ltr" aria-hidden="true" className="mx-auto mb-8 flex w-fit gap-1.5">
          <span className="h-5 w-5 bg-cmyk-c" />
          <span className="h-5 w-5 bg-cmyk-m" />
          <span className="h-5 w-5 bg-brand-mist" />
          <span className="h-5 w-5 bg-brand-black" />
        </div>
        <h1 className="ri-h2">لم نجد هذه الطابعة</h1>
        <p className="ri-lead mx-auto mt-4 max-w-md">
          ابحث عنها في دليل التوافق باسم الطراز أو رقمه (مثال: 2620)، أو أرسل لنا صورة ملصقها.
        </p>
        <Link href="/compatibility" className="ri-btn ri-btn-red mt-8">
          <span>دليل التوافق</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
