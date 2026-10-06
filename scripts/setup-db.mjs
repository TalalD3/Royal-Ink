/* ══════════════════════════════════════════════════════════════════════
   DATABASE SETUP — creates the collections and their indexes.
   Safe to run any number of times (existing ones are left as they are).

   Run:  npm run db:setup
   (reads MONGODB_URI from .env.local; prints no secrets)
   ══════════════════════════════════════════════════════════════════════ */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing — add it to .env.local first.");
  process.exit(1);
}
const dbName =
  process.env.MONGODB_DB || decodeURIComponent(new URL(uri).pathname.replace(/^\//, "")) || "royal_ink";

const COLLECTIONS = {
  products: [
    { key: { slug: 1 }, name: "slug_unique", unique: true },
    { key: { category: 1 }, name: "category" },
    { key: { brand: 1 }, name: "brand" },
    { key: { isActive: 1, createdAt: -1 }, name: "active_newest" },
    { key: { compatiblePrinters: 1 }, name: "compatible_printers" },
    { key: { legacyId: 1 }, name: "legacy_id", unique: true, partialFilterExpression: { legacyId: { $type: "string" } } },
  ],
  distributors: [
    { key: { isActive: 1, createdAt: 1 }, name: "active_oldest" },
    { key: { wilayaCode: 1 }, name: "wilaya" },
    { key: { legacyId: 1 }, name: "legacy_id", unique: true, partialFilterExpression: { legacyId: { $type: "string" } } },
  ],
  slides: [{ key: { sortOrder: 1 }, name: "sort_order" }],
  admins: [{ key: { email: 1 }, name: "email_unique", unique: true }],
};

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
try {
  await client.connect();
  const db = client.db(dbName);
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  console.log(`Database: ${dbName}`);
  for (const [name, indexes] of Object.entries(COLLECTIONS)) {
    if (!existing.has(name)) await db.createCollection(name);
    await db.collection(name).createIndexes(indexes);
    const count = await db.collection(name).countDocuments();
    console.log(`  ${existing.has(name) ? "✓" : "+"} ${name.padEnd(13)} ${String(count).padStart(4)} documents, ${indexes.length} indexes`);
  }
  console.log("Done.");
} catch (err) {
  console.error("Setup failed:", err.name, "-", String(err.message).replace(/mongodb(\+srv)?:\/\/\S+/g, "[address hidden]"));
  process.exitCode = 1;
} finally {
  await client.close();
}
