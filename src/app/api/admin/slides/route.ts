import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  resetSlidesToDefault,
} from "@/lib/slides-store";

export const dynamic = "force-dynamic";

/* ── Auth helper ── */
async function checkAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);

  if (
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    token === process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { id: "service-role", email: "admin@royal-ink.com" };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ─── GET: list all slides (admin authenticated) ─────────────────────
export async function GET(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slides, isUsingSupabase } = await getSlides(false);
    return NextResponse.json({
      data: slides,
      isUsingSupabase,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: create slide or reset ────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === "reset") {
      const defaults = await resetSlidesToDefault();
      return NextResponse.json({ data: defaults, message: "Reset to defaults" });
    }

    const newSlide = await createSlide({
      sort_order: Number(body.sort_order) || 0,
      image_url: body.image_url ?? "",
      overlay_opacity: Number(body.overlay_opacity) ?? 50,
      title: body.title ?? "",
      subtitle: body.subtitle ?? "",
      text_align: body.text_align ?? "center",
      buttons: body.buttons ?? [],
      is_active: body.is_active ?? true,
    });

    return NextResponse.json({ data: newSlide });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create slide" },
      { status: 500 }
    );
  }
}

// ─── PUT: update slide ──────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing slide ID" }, { status: 400 });
    }

    const updatedSlide = await updateSlide(id, updates);
    if (!updatedSlide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedSlide });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE: delete slide ───────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await checkAdminAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing slide ID" }, { status: 400 });
  }

  await deleteSlide(id);
  return NextResponse.json({ success: true });
}
