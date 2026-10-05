import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
export const dynamic = "force-dynamic";

/** Public catalogue (active products, each with its page slug) */
export async function GET() {
  return NextResponse.json({ data: await getProducts() });
}
