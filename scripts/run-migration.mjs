/**
 * Run database migration against Supabase Postgres.
 *
 * Usage:
 *   Set DATABASE_URL in .env.local (from Supabase → Project Settings → Database → Connection string)
 *   npm run db:migrate
 */
import { readFileSync } from "fs";
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
    // .env.local optional if DATABASE_URL is already exported
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

const sql = readFileSync(
  resolve(__dirname, "../supabase/migrations/001_schema.sql"),
  "utf8"
);

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Connected. Running migration…");
  await client.query(sql);
  console.log("Migration completed successfully.");
} catch (err) {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
