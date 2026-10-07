import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { siteSettingsSchema } from "@/lib/validation";
import { getSiteSettingsFresh, saveSiteSettings } from "@/lib/site-settings";
import { deleteUploadedFiles } from "@/lib/uploadthing-server";
import type { SiteSettings } from "@/types/site-settings";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// GET: the current settings (defaults filled in)
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ data: await getSiteSettingsFresh() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}

// PUT: save the whole settings
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const parsed = siteSettingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
    }
    const { settings, replacedImageKeys } = await saveSiteSettings(parsed.data as SiteSettings);
    await deleteUploadedFiles(replacedImageKeys); // photos that were replaced
    return NextResponse.json({ data: settings });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}
