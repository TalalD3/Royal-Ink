/* ══════════════════════════════════════════════════════════════════════
   CREATE OR RESET AN ADMIN LOGIN

   Run:  npm run admin:create
   You type the email and the password (hidden). The password is stored
   only as a bcrypt hash. Running it again with the same email changes
   that admin's password. Nothing secret is printed.
   ══════════════════════════════════════════════════════════════════════ */
import readline from "node:readline";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MIN_LENGTH = 10;
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing — add it to .env.local first.");
  process.exit(1);
}
const dbName =
  process.env.MONGODB_DB || decodeURIComponent(new URL(uri).pathname.replace(/^\//, "")) || "royal_ink";

/* ── Input: visible question, hidden question (TTY), or piped lines ── */
const piped = !process.stdin.isTTY;
let pipedLines = null;
async function nextPipedLine() {
  if (!pipedLines) {
    let data = "";
    for await (const chunk of process.stdin) data += chunk;
    pipedLines = data.split(/\r?\n/);
  }
  return (pipedLines.shift() ?? "").trim();
}

function ask(question) {
  if (piped) return process.stdout.write(question + "\n"), nextPipedLine();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => (rl.close(), resolve(a.trim()))));
}

function askHidden(question) {
  if (piped) return process.stdout.write(question + "\n"), nextPipedLine();
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.stdout.write("\nCancelled.\n");
        process.exit(1);
      } else if (ch === "\u007f" || ch === "\b") {
        if (value.length) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        value += ch;
        process.stdout.write("*".repeat(ch.length));
      }
    };
    stdin.on("data", onData);
  });
}

/* ── Main ── */
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
try {
  console.log("Royal Ink — create or reset an admin login\n");
  const email = (await ask("Admin email: ")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That does not look like an email address.");

  await client.connect();
  const admins = client.db(dbName).collection("admins");
  await admins.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
  const existing = await admins.findOne({ email });
  if (existing) {
    const answer = (await ask(`An admin with this email already exists. Change its password? (y/N): `)).toLowerCase();
    if (answer !== "y" && answer !== "yes") {
      console.log("Nothing changed.");
      process.exit(0);
    }
  }

  const password = await askHidden(`New password (at least ${MIN_LENGTH} characters, hidden): `);
  if (password.length < MIN_LENGTH) throw new Error(`The password must have at least ${MIN_LENGTH} characters.`);
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error("Use both letters and numbers in the password.");
  const again = await askHidden("Type the password again: ");
  if (again !== password) throw new Error("The two passwords do not match.");

  const passwordHash = await bcrypt.hash(password, 12);
  await admins.updateOne(
    { email },
    { $set: { passwordHash }, $setOnInsert: { email, createdAt: new Date() } },
    { upsert: true }
  );
  console.log(existing ? `\n✓ Password changed for ${email}.` : `\n✓ Admin created: ${email}. You can now log in at /admin/login.`);
} catch (err) {
  console.error("\n✗ " + String(err.message).replace(/mongodb(\+srv)?:\/\/\S+/g, "[address hidden]"));
  process.exitCode = 1;
} finally {
  await client.close();
}
