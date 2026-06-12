/**
 * Run all SQL migrations in supabase/migrations/ (sorted by filename).
 *
 * Usage:
 *   Add DATABASE_URL to .env.local (Supabase → Project Settings → Database → URI)
 *   npm run db:migrate
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const envPath = resolve(__dirname, "../.env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(`
Missing DATABASE_URL.

Add it to .env.local from Supabase Dashboard:
  Project Settings → Database → Connection string → URI

Example:
  DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
`);
  process.exit(1);
}

const migrationsDir = resolve(__dirname, "../supabase/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No migration files found.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`Connected. Running ${files.length} migration(s)…`);

  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), "utf8");
    console.log(`→ ${file}`);
    await client.query(sql);
  }

  console.log("All migrations completed successfully.");
} catch (err) {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
