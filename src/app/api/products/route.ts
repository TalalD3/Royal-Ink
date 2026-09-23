import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { initialProducts } from "@/data/initial-products";
import type { Product } from "@/types/product";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error) {
      const formatted: Product[] = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        brand: d.brand,
        category: d.category,
        sku: d.sku || undefined,
        color: d.color || "black",
        imageUrl: d.image_url || undefined,
        compatiblePrinters: Array.isArray(d.compatible_printers)
          ? d.compatible_printers
          : typeof d.compatible_printers === "string"
          ? JSON.parse(d.compatible_printers || "[]")
          : [],
        notes: d.notes || undefined,
        isActive: d.is_active ?? true,
        createdAt: d.created_at,
      }));
      return NextResponse.json({ data: formatted });
    }

    return NextResponse.json({ data: initialProducts });
  } catch {
    return NextResponse.json({ data: initialProducts });
  }
}
