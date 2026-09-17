"use client";

import { Case } from "@/components/ui/cases-with-infinite-scroll";

export default function CaseDemo() {
  return (
    <div className="block w-full bg-background">
      <Case />
    </div>
  );
}

export { CaseDemo };
