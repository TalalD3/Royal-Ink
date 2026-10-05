import { PrintLoader } from "@/components/compat/print-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <PrintLoader label="جارٍ تحميل مستلزمات الطابعة…" />
    </div>
  );
}
