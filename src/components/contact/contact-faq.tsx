"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/site-settings-provider";

/* ══════════════════════════════════════════════════════════════════════
   FAQ — editable in the admin (starts with the seven questions picked in
   the client's content document).
   One answer open at a time; numbered, ruled, square.
   ══════════════════════════════════════════════════════════════════════ */

/** Answer text → paragraph; [words](/page) or [words](https://…) becomes a link */
function AnswerText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    const cls = "font-bold text-brand-red underline-offset-4 hover:underline";
    parts.push(
      href.startsWith("/") ? (
        <Link key={m.index} href={href} className={cls}>
          {label}
        </Link>
      ) : (
        <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
        </a>
      )
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function ContactFaq() {
  const { faq } = useSiteSettings();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-brand-black">
      {faq.map((item, i) => {
        const on = open === i;
        const id = `faq-${i}`;
        return (
          <div key={item.q} className="border-b border-brand-line">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={id}
                onClick={() => setOpen(on ? null : i)}
                className="group flex w-full items-center gap-4 py-5 text-start sm:gap-6 sm:py-6"
              >
                <span
                  className={cn(
                    "w-8 shrink-0 text-sm font-extrabold tabular-nums transition-colors",
                    on ? "text-brand-red" : "text-brand-gray"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-base font-extrabold leading-7 text-brand-black sm:text-lg">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center transition-colors",
                    on ? "bg-brand-red text-white" : "bg-brand-mist text-brand-black group-hover:bg-brand-black group-hover:text-white"
                  )}
                >
                  <Plus className={cn("h-4 w-4 transition-transform duration-300", on && "rotate-45")} />
                </span>
              </button>
            </h3>
            <div
              id={id}
              role="region"
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              {/* Closed answers are invisible too, so their links leave the tab order */}
              <div className={cn("overflow-hidden transition-[visibility] duration-300", on ? "visible" : "invisible")}>
                <p className="pb-6 ps-12 pe-2 text-[15px] leading-8 text-brand-gray sm:ps-14 sm:pe-16">
                  <AnswerText text={item.a} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ContactFaq;
