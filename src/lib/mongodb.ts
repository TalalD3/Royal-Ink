import { MongoClient, type Db } from "mongodb";

/* ══════════════════════════════════════════════════════════════════════
   MONGODB CONNECTION — server only

   One client per server process, reused by every request. In development
   it is kept on globalThis so hot reloads don't open a new connection each
   time. MONGODB_URI is a server variable (no NEXT_PUBLIC_ prefix), so it
   is never sent to the browser.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_DB = "royal_ink";

type Cache = { client: MongoClient | null; promise: Promise<MongoClient> | null };
const g = globalThis as unknown as { __mongo?: Cache };
const cache: Cache = g.__mongo ?? (g.__mongo = { client: null, promise: null });

function uri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) throw new Error("MONGODB_URI is not set (add it to .env.local / the hosting panel)");
  return value;
}

/** Database name: MONGODB_DB, else the name in the address, else royal_ink */
function dbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  try {
    const path = new URL(uri()).pathname.replace(/^\//, "");
    if (path) return decodeURIComponent(path);
  } catch {
    // fall through
  }
  return DEFAULT_DB;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;
  if (!cache.promise) {
    cache.promise = new MongoClient(uri(), {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    })
      .connect()
      .then((client) => {
        cache.client = client;
        return client;
      })
      .catch((err) => {
        // Let the next request try again instead of caching the failure
        cache.promise = null;
        throw err;
      });
  }
  return cache.promise;
}

export async function getDb(): Promise<Db> {
  return (await getMongoClient()).db(dbName());
}

/** True when the app is configured to use MongoDB */
export function hasDatabase(): boolean {
  return !!process.env.MONGODB_URI;
}
