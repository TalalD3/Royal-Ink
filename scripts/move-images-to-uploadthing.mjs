/* ══════════════════════════════════════════════════════════════════════
   MOVE IMAGES TO UPLOADTHING

   Run:  npm run images:migrate            (moves the images)
         npm run images:migrate -- --dry-run   (only lists what would move)

   Finds every product photo and hero slide image that is not on
   UploadThing yet — e.g. old Supabase Storage addresses, or files saved in
   public/uploads — uploads it to UploadThing and saves the new address
   and file key in MongoDB. The site's own pictures (/images/...) stay.

   Safe to run again: images already on UploadThing are skipped, so after
   a failure just run it once more. Nothing is deleted at the old place —
   keep your own backup copy of the original images anyway.
   ══════════════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { UTApi } from "uploadthing/server";

const dryRun = process.argv.includes("--dry-run");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing — add it to .env.local first.");
  process.exit(1);
}
if (!process.env.UPLOADTHING_TOKEN) {
  console.error("UPLOADTHING_TOKEN is missing — add it to .env.local first.");
  process.exit(1);
}
const dbName =
  process.env.MONGODB_DB || decodeURIComponent(new URL(uri).pathname.replace(/^\//, "")) || "royal_ink";

let appId = null;
try {
  appId = JSON.parse(Buffer.from(process.env.UPLOADTHING_TOKEN.trim(), "base64").toString("utf8")).appId;
} catch {
  // keep null — every https image then counts as "not on UploadThing"
}

const onUploadThing = (url) => {
  try {
    const h = new URL(url).hostname;
    return h === `${appId}.ufs.sh` || h === "utfs.io";
  } catch {
    return false;
  }
};

/** Where an image has to come from, or null when it should stay as it is */
function sourceOf(url) {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return { kind: "file", file: path.join(process.cwd(), "public", url) };
  if (url.startsWith("/")) return null; // the site's own pictures
  if (/^https?:\/\//.test(url) && !onUploadThing(url)) return { kind: "url" };
  return null;
}

const nameFor = (url, fallback) => {
  const base = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
  return /\.(webp|jpe?g|png|gif|avif)$/i.test(base) ? base : `${fallback}.webp`;
};

const utapi = new UTApi();
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
const failed = [];
let moved = 0;
let skipped = 0;

async function upload(src, url, name) {
  if (src.kind === "url") return utapi.uploadFilesFromUrl({ url, name });
  const buffer = fs.readFileSync(src.file);
  const type = /\.png$/i.test(name) ? "image/png" : /\.jpe?g$/i.test(name) ? "image/jpeg" : "image/webp";
  return utapi.uploadFiles(new File([buffer], name, { type }));
}

async function moveCollection(db, collection, label) {
  const col = db.collection(collection);
  const docs = await col.find({ "image.url": { $exists: true } }, { projection: { image: 1, name: 1, title: 1 } }).toArray();
  for (const doc of docs) {
    const url = doc.image?.url;
    const src = sourceOf(url);
    const what = `${label} "${String(doc.name || doc.title || doc._id).replace(/\n/g, " ").slice(0, 60)}"`;
    if (!src) {
      skipped++;
      continue;
    }
    if (dryRun) {
      console.log(`• would move ${what}: ${url}`);
      moved++;
      continue;
    }
    try {
      const res = await upload(src, url, nameFor(url, `${collection}-${doc._id}`));
      if (res.error || !res.data) throw new Error(res.error?.message || "no response");
      const newUrl = res.data.ufsUrl;
      await col.updateOne({ _id: doc._id }, { $set: { image: { url: newUrl, key: res.data.key }, updatedAt: new Date() } });
      console.log(`✓ ${what} → ${newUrl}`);
      moved++;
    } catch (err) {
      console.log(`✗ ${what}: ${err.message}`);
      failed.push({ what, url, error: err.message });
    }
  }
}

try {
  await client.connect();
  const db = client.db(dbName);
  console.log(dryRun ? "Dry run — nothing will change.\n" : "Moving images to UploadThing…\n");
  await moveCollection(db, "products", "product");
  await moveCollection(db, "slides", "slide");
  console.log(
    `\n${dryRun ? "To move" : "Moved"}: ${moved} · already fine: ${skipped} · failed: ${failed.length}`
  );
  if (failed.length) {
    console.log("Run the command again to retry the failed ones:");
    failed.forEach((f) => console.log(`  - ${f.what} (${f.url}): ${f.error}`));
    process.exitCode = 1;
  }
  if (!dryRun && moved) console.log("The site shows the new addresses within a minute (cache).");
} catch (err) {
  console.error("\n✗ " + String(err.message).replace(/mongodb(\+srv)?:\/\/\S+/g, "[address hidden]"));
  process.exitCode = 1;
} finally {
  await client.close();
}
