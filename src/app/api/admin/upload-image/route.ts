import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);

    let isAuthorized = false;
    if (
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      token === process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      isAuthorized = true;
    } else {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);
      if (!authError && user) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "hero-slides";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean unique filename
    const ext = file.name.split(".").pop() || "webp";
    const filename = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 1. Try Supabase Storage first
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: file.type || "image/webp",
          upsert: true,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);
        return NextResponse.json({ url: publicUrl, storage: "supabase" });
      }
    } catch {
      // Fallback to local disk
    }

    // 2. Fallback: Save to local public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${bucket}/${filename}`;
    return NextResponse.json({ url: localUrl, storage: "local" });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
