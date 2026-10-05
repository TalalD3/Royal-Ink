import { cn } from "@/lib/utils";

/* Four ink squares — cyan, magenta, yellow, black — laid down one after
   the other, like a printer running its colour test. */
const INKS = ["bg-cmyk-c", "bg-cmyk-m", "bg-cmyk-y", "bg-brand-black"];

export function PrintLoader({
  label = "جارٍ التحميل…",
  className,
  compact = false,
}: {
  label?: string;
  className?: string;
  /** Just the squares, no label */
  compact?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-4", className)}
    >
      <div dir="ltr" className="flex gap-1.5" aria-hidden="true">
        {INKS.map((ink, i) => (
          <span key={ink} className={cn("relative block bg-brand-mist", compact ? "h-3 w-3" : "h-5 w-5")}>
            <span
              className={cn("ri-print-ink absolute inset-0", ink)}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          </span>
        ))}
      </div>
      {compact ? <span className="sr-only">{label}</span> : (
        <span className="text-sm font-bold text-brand-gray">{label}</span>
      )}
    </div>
  );
}

export default PrintLoader;
