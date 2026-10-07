import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { idSchema, slideInputSchema, validationMessage } from "@/lib/validation";
import {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  resetSlidesToDefault,
} from "@/lib/slides-store";
import { deleteUploadedFiles } from "@/lib/uploadthing-server";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const failed = (err: unknown, status = 500) =>
  NextResponse.json({ error: (err as Error)?.message || "Server error" }, { status });

// GET: every slide (the built-in ones are copied in on first use)
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const { slides, isUsingDatabase } = await getSlides(false);
    return NextResponse.json({ data: slides, isUsingDatabase });
  } catch (err) {
    return failed(err);
  }
}

// POST: create a slide, or { action: "reset" }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const raw = await req.json();
    if (raw?.action === "reset") {
      const { slides, imageKeys } = await resetSlidesToDefault();
      await deleteUploadedFiles(imageKeys);
      return NextResponse.json({ data: slides, message: "Reset to defaults" });
    }
    const parsed = slideInputSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    const body = parsed.data;
    const newSlide = await createSlide({
      sort_order: Number(body.sort_order) || 0,
      image_url: body.image_url ?? "",
      overlay_opacity: body.overlay_opacity ?? 50,
      title: body.title ?? "",
      subtitle: body.subtitle ?? "",
      text_align: body.text_align ?? "center",
      buttons: body.buttons ?? [],
      is_active: body.is_active ?? true,
    });
    return NextResponse.json({ data: newSlide });
  } catch (err) {
    return failed(err, 400);
  }
}

// PUT: update a slide
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const parsed = slideInputSchema.extend({ id: idSchema }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    const { id, ...updates } = parsed.data;
    const updated = await updateSlide(id, updates as Parameters<typeof updateSlide>[1]);
    if (!updated) return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    await deleteUploadedFiles([updated.replacedImageKey]); // the replaced image
    return NextResponse.json({ data: updated.slide });
  } catch (err) {
    return failed(err, 400);
  }
}

// DELETE: ?id=<id>
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const parsedId = idSchema.safeParse(new URL(req.url).searchParams.get("id"));
  if (!parsedId.success) return NextResponse.json({ error: "Missing slide ID" }, { status: 400 });
  const id = parsedId.data;
  try {
    const { deleted, imageKey } = await deleteSlide(id);
    if (!deleted) return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    await deleteUploadedFiles([imageKey]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return failed(err);
  }
}
