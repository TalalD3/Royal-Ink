import type { Locale, ProductColor } from "@/types/product";
import { COLOR_NAMES } from "@/i18n/specs";
import { cn } from "@/lib/utils";

/* The product's ink colour(s) as small square chips — the process inks
   (CMYK), K being the brand black. A colour set shows all four. */

const CHIPS: Record<Exclude<ProductColor, "none">, string[]> = {
  black: ["bg-brand-black"],
  cyan: ["bg-cmyk-c"],
  magenta: ["bg-cmyk-m"],
  yellow: ["bg-cmyk-y"],
  multi: ["bg-cmyk-c", "bg-cmyk-m", "bg-cmyk-y", "bg-brand-black"],
};

export function ColorSwatches({
  color,
  locale = "ar",
  className,
  size = "sm",
}: {
  color?: ProductColor;
  locale?: Locale;
  className?: string;
  size?: "sm" | "md";
}) {
  if (!color || color === "none") return null;
  const name = COLOR_NAMES[color][locale];
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} title={name}>
      <span className="sr-only">{name}</span>
      {CHIPS[color].map((c) => (
        <span
          key={c}
          aria-hidden="true"
          className={cn(c, size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5", "ring-1 ring-inset ring-black/10")}
        />
      ))}
    </span>
  );
}

export default ColorSwatches;
