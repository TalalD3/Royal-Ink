import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_SLIDES } from "@/types/slide";
import type { HeroSlide } from "@/types/slide";

const DATA_FILE = path.join(process.cwd(), "src", "data", "hero-slides.json");

/* ── Local File Storage ── */
function readLocalSlides(): HeroSlide[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading local slides file:", e);
  }

  // Initialize with DEFAULT_SLIDES
  saveLocalSlides(DEFAULT_SLIDES);
  return DEFAULT_SLIDES;
}

function saveLocalSlides(slides: HeroSlide[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(slides, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local slides file:", e);
  }
}

/* ── DB Row to HeroSlide ── */
function mapRow(d: any): HeroSlide {
  return {
    id: d.id,
    sort_order: d.sort_order ?? 0,
    image_url: d.image_url ?? "",
    overlay_opacity: d.overlay_opacity ?? 50,
    title: d.title ?? "",
    subtitle: d.subtitle ?? "",
    text_align: d.text_align ?? "center",
    buttons: Array.isArray(d.buttons)
      ? d.buttons
      : typeof d.buttons === "string"
      ? JSON.parse(d.buttons || "[]")
      : [],
    is_active: d.is_active ?? true,
    created_at: d.created_at,
  };
}

/* ── Public & Admin Queries ── */
export async function getSlides(activeOnly = false): Promise<{ slides: HeroSlide[]; isUsingSupabase: boolean }> {
  try {
    let query = supabaseAdmin.from("hero_slides").select("*");
    if (activeOnly) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query.order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return { slides: data.map(mapRow), isUsingSupabase: true };
    }
  } catch {
    // Supabase query failed
  }

  const local = readLocalSlides();
  const sorted = [...local].sort((a, b) => a.sort_order - b.sort_order);
  const result = activeOnly ? sorted.filter((s) => s.is_active) : sorted;
  return { slides: result, isUsingSupabase: false };
}

/* ── Create ── */
export async function createSlide(slideData: Omit<HeroSlide, "id">): Promise<HeroSlide> {
  const newId = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let newSlide: HeroSlide = {
    ...slideData,
    id: newId,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .insert({
        sort_order: newSlide.sort_order,
        image_url: newSlide.image_url,
        overlay_opacity: newSlide.overlay_opacity,
        title: newSlide.title,
        subtitle: newSlide.subtitle,
        text_align: newSlide.text_align,
        buttons: newSlide.buttons,
        is_active: newSlide.is_active,
      })
      .select();

    if (!error && data && data[0]) {
      newSlide = mapRow(data[0]);
    }
  } catch {
    // Keep local slide
  }

  const slides = readLocalSlides();
  slides.push(newSlide);
  slides.sort((a, b) => a.sort_order - b.sort_order);
  saveLocalSlides(slides);

  return newSlide;
}

/* ── Update ── */
export async function updateSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide | null> {
  try {
    const dbPayload: any = {};
    if (updates.sort_order !== undefined) dbPayload.sort_order = updates.sort_order;
    if (updates.image_url !== undefined) dbPayload.image_url = updates.image_url;
    if (updates.overlay_opacity !== undefined) dbPayload.overlay_opacity = updates.overlay_opacity;
    if (updates.title !== undefined) dbPayload.title = updates.title;
    if (updates.subtitle !== undefined) dbPayload.subtitle = updates.subtitle;
    if (updates.text_align !== undefined) dbPayload.text_align = updates.text_align;
    if (updates.buttons !== undefined) dbPayload.buttons = updates.buttons;
    if (updates.is_active !== undefined) dbPayload.is_active = updates.is_active;

    await supabaseAdmin.from("hero_slides").update(dbPayload).eq("id", id);
  } catch {
    // Supabase update failed or table missing
  }

  const slides = readLocalSlides();
  const index = slides.findIndex((s) => s.id === id);
  if (index === -1) {
    return null;
  }

  slides[index] = { ...slides[index], ...updates };
  slides.sort((a, b) => a.sort_order - b.sort_order);
  saveLocalSlides(slides);

  return slides[index];
}

/* ── Delete ── */
export async function deleteSlide(id: string): Promise<boolean> {
  try {
    await supabaseAdmin.from("hero_slides").delete().eq("id", id);
  } catch {
    // Supabase delete failed or table missing
  }

  const slides = readLocalSlides();
  const filtered = slides.filter((s) => s.id !== id);
  saveLocalSlides(filtered);
  return true;
}

/* ── Reset to Defaults ── */
export async function resetSlidesToDefault(): Promise<HeroSlide[]> {
  try {
    await supabaseAdmin.from("hero_slides").delete().neq("id", "none");
  } catch {
    // Ignore
  }

  saveLocalSlides(DEFAULT_SLIDES);
  return DEFAULT_SLIDES;
}
