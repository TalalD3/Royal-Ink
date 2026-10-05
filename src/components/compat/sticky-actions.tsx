"use client";

import { useEffect, useState } from "react";
import { ContactButton, ShopButton } from "@/components/compat/product-actions";
import { cn } from "@/lib/utils";

/* Phones: shop / contact kept at hand at the bottom of the screen, until
   the page's own action block (or the footer below it) comes into view */
export function StickyActions({ code, targetId = "actions" }: { code?: string; targetId?: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const update = () => setHidden(target.getBoundingClientRect().top < window.innerHeight - 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-brand-line bg-white p-2.5 transition-transform duration-300 lg:hidden",
        hidden && "pointer-events-none translate-y-full"
      )}
    >
      <ShopButton code={code} showNote={false} className="[&>span]:h-11 [&>span]:px-3 [&>span]:text-sm" />
      <ContactButton code={code} className="h-11 px-3 text-sm" />
    </div>
  );
}

export default StickyActions;
