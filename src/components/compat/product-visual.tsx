import type { Product } from "@/types/product";
import { CategoryIcon } from "@/components/ui/category-icons";
import { cn } from "@/lib/utils";

/* The product's photo on a square tile — or, while no photo has been
   uploaded, its category drawn large in the same square. */
export function ProductVisual({
  product,
  className,
  iconClassName,
  eager = false,
  code,
}: {
  product: Pick<Product, "imageUrl" | "category" | "name">;
  /** Printed under the drawing while there is no photo (large tiles) */
  code?: string;
  className?: string;
  iconClassName?: string;
  eager?: boolean;
}) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-brand-mist", className)}>
      {product.imageUrl ? (
        // Admin uploads live on Supabase Storage: plain <img>, no domain list needed
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          loading={eager ? "eager" : "lazy"}
          className="h-full w-full object-contain p-[8%] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-[6%]">
          <CategoryIcon
            category={product.category}
            className={cn(
              "h-[38%] w-[38%] text-brand-black/70 transition-transform duration-500 ease-out group-hover:scale-[1.06]",
              iconClassName
            )}
          />
          {code && (
            <span dir="ltr" className="text-lg font-extrabold tracking-[0.2em] text-brand-black/35 sm:text-xl">
              {code}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductVisual;
