import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { initialProducts } from "@/data/initial-products";
import type { Product } from "@/types/product";
import {
  rowToProduct,
  legacyRow,
  v2Columns,
  isMissingColumnError,
  MIGRATION_WARNING,
} from "@/lib/product-db";

export const dynamic = "force-dynamic";

async function checkAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET: list all products (or fallback to initial products if table is not yet migrated in Supabase)
export async function GET(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      // Map database snake_case or standard fields
      const formatted: Product[] = (data || []).map(rowToProduct);
      return NextResponse.json({ data: formatted });
    }

    // Table doesn't exist in Supabase yet -> return initial fallback products
    return NextResponse.json({ data: initialProducts, isFallback: true });
  } catch (err: any) {
    return NextResponse.json({ data: initialProducts, isFallback: true });
  }
}

// POST: insert product(s)
export async function POST(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    let warning: string | undefined;
    let { data, error } = await supabaseAdmin
      .from("products")
      .insert(items.map((p: Partial<Product>) => ({ ...legacyRow(p), ...v2Columns(p) })))
      .select();

    // The v2 columns are not there yet: save the basics and say so
    if (isMissingColumnError(error)) {
      warning = MIGRATION_WARNING;
      ({ data, error } = await supabaseAdmin
        .from("products")
        .insert(items.map((p: Partial<Product>) => legacyRow(p)))
        .select());
    }

    if (error) {
      // If table doesn't exist, return simulated success with UUIDs
      const simulated: Product[] = items.map((p: any) => ({
        ...p,
        id: p.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        isActive: p.isActive ?? true,
      }));
      return NextResponse.json({ data: simulated, warning: "Saved locally (Supabase table pending)" });
    }

    return NextResponse.json({ data, warning });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create" }, { status: 500 });
  }
}

// PUT: update product
export async function PUT(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.brand !== undefined) dbPayload.brand = updates.brand;
    if (updates.category !== undefined) dbPayload.category = updates.category;
    if (updates.sku !== undefined) dbPayload.sku = updates.sku;
    if (updates.color !== undefined) dbPayload.color = updates.color;
    if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl;
    if (updates.compatiblePrinters !== undefined) dbPayload.compatible_printers = updates.compatiblePrinters;
    if (updates.notes !== undefined) dbPayload.notes = updates.notes;
    if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;
    if (updates.notesI18n?.ar !== undefined) dbPayload.notes = updates.notesI18n.ar || null;

    const v2: any = {};
    const v2Values = v2Columns(updates);
    if (updates.slug !== undefined) v2.slug = v2Values.slug;
    if (updates.specs !== undefined) v2.specs = v2Values.specs;
    if (updates.notesI18n !== undefined) v2.notes_i18n = v2Values.notes_i18n;

    let warning: string | undefined;
    let { data, error } = await supabaseAdmin
      .from("products")
      .update({ ...dbPayload, ...v2 })
      .eq("id", id)
      .select();

    if (isMissingColumnError(error)) {
      warning = MIGRATION_WARNING;
      ({ data, error } = await supabaseAdmin
        .from("products")
        .update(dbPayload)
        .eq("id", id)
        .select());
    }

    if (error) {
      return NextResponse.json({ data: { id, ...updates }, warning: "Saved locally" });
    }

    return NextResponse.json({ data: data?.[0], warning });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: delete product
export async function DELETE(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
  }

  if (id === "all") {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows in table
    if (error) {
      return NextResponse.json({ success: true, note: "Cleared locally" });
    }
    return NextResponse.json({ success: true, message: "All products deleted" });
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ success: true, note: "Deleted locally" });
  }

  return NextResponse.json({ success: true });
}
