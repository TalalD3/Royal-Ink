import { NextResponse } from "next/server";
import { getActiveDistributors } from "@/lib/distributors-store";

export const dynamic = "force-dynamic";

/** Public: active points of sale for the map (name, wilaya, phone, address
    and map link — the details already shown to visitors) */
export async function GET() {
  return NextResponse.json({ data: await getActiveDistributors() });
}
