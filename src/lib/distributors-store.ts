import { revalidateTag, unstable_cache } from "next/cache";
import type { DbDistributor } from "@/types/distributor";
import {
  distributorsCol,
  distributorFromDoc,
  toObjectId,
  type DistributorDoc,
} from "@/lib/db/collections";

/* ══════════════════════════════════════════════════════════════════════
   POINTS OF SALE — server-side reads and admin writes (MongoDB)
   The public map reads the active ones through a 60-second cache that
   any admin change refreshes immediately (tag "distributors").
   ══════════════════════════════════════════════════════════════════════ */

export const DISTRIBUTORS_TAG = "distributors";

const BADGES: DbDistributor["badge"][] = ["headquarters", "premium", "authorized", "standard"];
const text = (v: unknown, max = 300) =>
  typeof v === "string" ? v.trim().slice(0, max) : typeof v === "number" ? String(v) : "";

/** Admin input (the API's snake_case shape) → database fields */
function inputToFields(input: Partial<DbDistributor>): Partial<DistributorDoc> {
  const out: Partial<DistributorDoc> = {};
  if (input.name !== undefined) out.name = text(input.name);
  if (input.wilaya_code !== undefined) {
    const n = Math.round(Number(input.wilaya_code));
    if (n >= 1 && n <= 58) out.wilayaCode = n;
  }
  if (input.badge !== undefined) out.badge = BADGES.includes(input.badge) ? input.badge : "standard";
  if (input.phone !== undefined) out.phone = text(input.phone, 60) || null;
  if (input.address !== undefined) out.address = text(input.address, 400) || null;
  if (input.location_url !== undefined) {
    const url = text(input.location_url, 1000);
    out.locationUrl = /^https?:\/\//i.test(url) ? url : null;
  }
  if (input.is_active !== undefined) out.isActive = !!input.is_active;
  return out;
}

async function loadActive(): Promise<DbDistributor[]> {
  try {
    const col = await distributorsCol();
    return (await col.find({ isActive: true }).sort({ createdAt: 1 }).toArray()).map(distributorFromDoc);
  } catch (err) {
    console.error("[distributors] database unavailable:", (err as Error).message);
    return [];
  }
}

/** Active points of sale (empty → the map shows its built-in examples) */
export const getActiveDistributors = unstable_cache(loadActive, ["distributors:active"], {
  revalidate: 60,
  tags: [DISTRIBUTORS_TAG],
});

export async function listAllDistributors(): Promise<DbDistributor[]> {
  const col = await distributorsCol();
  return (await col.find({}).sort({ createdAt: -1 }).toArray()).map(distributorFromDoc);
}

export async function createDistributors(inputs: Partial<DbDistributor>[]): Promise<DbDistributor[]> {
  const col = await distributorsCol();
  const now = new Date();
  const docs: DistributorDoc[] = inputs.map((input) => {
    const f = inputToFields(input);
    if (!f.name) throw new Error("Point of sale name is required");
    if (!f.wilayaCode) throw new Error("A valid wilaya code (1–58) is required");
    return {
      name: f.name,
      wilayaCode: f.wilayaCode,
      badge: f.badge ?? "standard",
      phone: f.phone ?? null,
      address: f.address ?? null,
      locationUrl: f.locationUrl ?? null,
      isActive: f.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
  });
  if (!docs.length) return [];
  const { insertedIds } = await col.insertMany(docs);
  revalidateTag(DISTRIBUTORS_TAG);
  return docs.map((d, i) => distributorFromDoc({ ...d, _id: insertedIds[i] }));
}

export async function updateDistributor(id: string, input: Partial<DbDistributor>): Promise<DbDistributor | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const col = await distributorsCol();
  const updated = await col.findOneAndUpdate(
    { _id },
    { $set: { ...inputToFields(input), updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  revalidateTag(DISTRIBUTORS_TAG);
  return updated ? distributorFromDoc(updated) : null;
}

export async function deleteDistributor(id: string): Promise<boolean> {
  const _id = toObjectId(id);
  if (!_id) return false;
  const col = await distributorsCol();
  const { deletedCount } = await col.deleteOne({ _id });
  revalidateTag(DISTRIBUTORS_TAG);
  return deletedCount > 0;
}

export async function deleteAllDistributors(): Promise<number> {
  const col = await distributorsCol();
  const { deletedCount } = await col.deleteMany({});
  revalidateTag(DISTRIBUTORS_TAG);
  return deletedCount;
}
