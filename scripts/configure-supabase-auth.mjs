/**
 * Configure Supabase Auth: redirect URLs + optional Google OAuth.
 *
 * Requires a personal access token from:
 *   https://supabase.com/dashboard/account/tokens
 *
 * Usage (add to .env.local):
 *   SUPABASE_ACCESS_TOKEN=sbp_...
 *   SUPABASE_PROJECT_REF=xsmutlsdlhzvngfdvqmz
 *   SITE_URL=https://your-app.vercel.app
 *   AUTH_REDIRECT_URLS=https://your-app.vercel.app/auth/callback,http://localhost:3002/auth/callback
 *
 * Optional — enable Google:
 *   GOOGLE_CLIENT_ID=...
 *   GOOGLE_CLIENT_SECRET=...
 *
 *   npm run supabase:configure
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef =
  process.env.SUPABASE_PROJECT_REF ?? "xsmutlsdlhzvngfdvqmz";
const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3002";
const redirectUrls =
  process.env.AUTH_REDIRECT_URLS ??
  `${siteUrl}/auth/callback,http://localhost:3000/auth/callback,http://localhost:3002/auth/callback`;

if (!token) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Create a token at https://supabase.com/dashboard/account/tokens
2. Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_...
3. Optionally set SITE_URL to your Vercel production URL
4. Run: npm run supabase:configure
`);
  process.exit(1);
}

const body = {
  site_url: siteUrl,
  uri_allow_list: redirectUrls,
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  body.external_google_enabled = true;
  body.external_google_client_id = process.env.GOOGLE_CLIENT_ID;
  body.external_google_secret = process.env.GOOGLE_CLIENT_SECRET;
  console.log("Enabling Google OAuth provider…");
} else {
  console.log(
    "Skipping Google OAuth (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET to enable)."
  );
}

console.log("Site URL:", siteUrl);
console.log("Redirect URLs:", redirectUrls);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }
);

const text = await res.text();
if (!res.ok) {
  console.error("Supabase API error:", res.status, text);
  process.exit(1);
}

console.log("Supabase auth config updated successfully.");
if (!process.env.GOOGLE_CLIENT_ID) {
  console.log(`
To enable Google sign-in:
  1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
  2. Authorized redirect URI: https://${projectRef}.supabase.co/auth/v1/callback
  3. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
  4. Re-run: npm run supabase:configure
`);
}
