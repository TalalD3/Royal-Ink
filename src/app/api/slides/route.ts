import { NextResponse } from "next/server";
import { getSlides } from "@/lib/slides-store";

export const dynamic = "force-dynamic";

// ─── Public GET: active slides only, ordered ─────────────────────────
export async function GET() {
  try {
    const { slides } = await getSlides(true);
    return NextResponse.json({ data: slides });
  } catch (error: any) {
    console.error("Failed to get public slides:", error);
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}
