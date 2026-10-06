import { revalidateTag, unstable_cache } from "next/cache";
import { DEFAULT_SLIDES } from "@/types/slide";
import type { HeroSlide, SlideButton, SlideTextAlign } from "@/types/slide";
import seedFile from "@/data/hero-slides.json";
import { slidesCol, slideFromDoc, toObjectId, type SlideDoc } from "@/lib/db/collections";

/* ══════════════════════════════════════════════════════════════════════
   HERO SLIDES — MongoDB "slides" collection

   While the collection is empty, visitors see the built-in slides
   (src/data/hero-slides.json, else DEFAULT_SLIDES). The first time the
   admin opens the slide manager they are copied into the database so
   they can be edited. Public reads are cached; admin changes refresh
   them immediately (tag "slides").
   ══════════════════════════════════════════════════════════════════════ */

export const SLIDES_TAG = "slides";

const ALIGN: SlideTextAlign[] = ["right", "center", "left"];
const text = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function builtInSlides(): HeroSlide[] {
  const fromFile = Array.isArray(seedFile) ? (seedFile as HeroSlide[]) : [];
  return (fromFile.length ? fromFile : DEFAULT_SLIDES).slice().sort((a, b) => a.sort_order - b.sort_order);
}

function cleanButtons(v: unknown): SlideButton[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 2).map((b) => ({
    text: text(b?.text, 60),
    href: /^(\/|https?:\/\/)/.test(text(b?.href, 300)) ? text(b?.href, 300) : "/",
    variant: b?.variant === "outline" ? "outline" : "primary",
  })) as SlideButton[];
}

/** Admin input (HeroSlide shape) → database fields */
function inputToFields(input: Partial<HeroSlide>): Partial<SlideDoc> {
  const out: Partial<SlideDoc> = {};
  if (input.sort_order !== undefined) out.sortOrder = Math.round(Number(input.sort_order)) || 0;
  if (input.image_url !== undefined) {
    const url = text(input.image_url, 1000);
    if (/^(https:\/\/|\/)/.test(url)) out.image = { url, key: text(input.image_key, 200) || undefined };
  }
  if (input.overlay_opacity !== undefined) {
    out.overlayOpacity = Math.min(100, Math.max(0, Math.round(Number(input.overlay_opacity)) || 0));
  }
  if (input.title !== undefined) out.title = text(input.title, 200);
  if (input.subtitle !== undefined) out.subtitle = text(input.subtitle, 600);
  if (input.text_align !== undefined) out.textAlign = ALIGN.includes(input.text_align) ? input.text_align : "center";
  if (input.buttons !== undefined) out.buttons = cleanButtons(input.buttons);
  if (input.is_active !== undefined) out.isActive = !!input.is_active;
  return out;
}

function toDoc(s: Partial<HeroSlide>, now = new Date()): SlideDoc {
  const f = inputToFields(s);
  return {
    sortOrder: f.sortOrder ?? 0,
    image: f.image ?? { url: "/images/ink-cartridges.jpg" },
    overlayOpacity: f.overlayOpacity ?? 50,
    title: f.title ?? "",
    subtitle: f.subtitle ?? "",
    textAlign: f.textAlign ?? "center",
    buttons: f.buttons ?? [],
    isActive: f.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

/** Copies the built-in slides into an empty collection */
async function seedIfEmpty(): Promise<void> {
  const col = await slidesCol();
  if ((await col.estimatedDocumentCount()) > 0) return;
  await col.insertMany(builtInSlides().map((s) => toDoc(s)));
}

async function loadActiveSlides(): Promise<HeroSlide[]> {
  try {
    const col = await slidesCol();
    const all = await col.find({}).sort({ sortOrder: 1 }).toArray();
    if (all.length > 0) return all.filter((d) => d.isActive).map(slideFromDoc);
  } catch (err) {
    console.error("[slides] database unavailable — showing the built-in slides:", (err as Error).message);
  }
  return builtInSlides().filter((s) => s.is_active);
}

const getActiveSlidesCached = unstable_cache(loadActiveSlides, ["slides:active"], {
  revalidate: 60,
  tags: [SLIDES_TAG],
});

/* ── Public & admin queries ── */

export async function getSlides(
  activeOnly = false
): Promise<{ slides: HeroSlide[]; isUsingDatabase: boolean }> {
  if (activeOnly) return { slides: await getActiveSlidesCached(), isUsingDatabase: true };
  await seedIfEmpty();
  const col = await slidesCol();
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return { slides: docs.map(slideFromDoc), isUsingDatabase: true };
}

export async function createSlide(slideData: Omit<HeroSlide, "id">): Promise<HeroSlide> {
  const col = await slidesCol();
  const doc = toDoc(slideData);
  const { insertedId } = await col.insertOne(doc);
  revalidateTag(SLIDES_TAG);
  return slideFromDoc({ ...doc, _id: insertedId });
}

export async function updateSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const col = await slidesCol();
  const updated = await col.findOneAndUpdate(
    { _id },
    { $set: { ...inputToFields(updates), updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  revalidateTag(SLIDES_TAG);
  return updated ? slideFromDoc(updated) : null;
}

/** Deletes a slide; returns its image key so the file can be removed too */
export async function deleteSlide(id: string): Promise<{ deleted: boolean; imageKey?: string }> {
  const _id = toObjectId(id);
  if (!_id) return { deleted: false };
  const col = await slidesCol();
  const doc = await col.findOneAndDelete({ _id });
  revalidateTag(SLIDES_TAG);
  return { deleted: !!doc, imageKey: doc?.image?.key };
}

/** Back to the built-in slides; returns the uploaded image keys that were dropped */
export async function resetSlidesToDefault(): Promise<{ slides: HeroSlide[]; imageKeys: string[] }> {
  const col = await slidesCol();
  const imageKeys = (await col.find({}, { projection: { image: 1 } }).toArray())
    .map((d) => d.image?.key)
    .filter((k): k is string => !!k);
  await col.deleteMany({});
  await seedIfEmpty();
  revalidateTag(SLIDES_TAG);
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return { slides: docs.map(slideFromDoc), imageKeys };
}
