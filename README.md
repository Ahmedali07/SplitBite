# SplitBite

Flexible expense splitting web app (Splitwise-style) built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.local` (already configured) or create it:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database schema

**Option A — Supabase SQL Editor (recommended)**

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/xsmutlsdlhzvngfdvqmz/sql/new) for your project
2. Paste and run `supabase/migrations/001_schema.sql` (initial tables)
3. Paste and run `supabase/migrations/002_auth.sql` (auth profiles + RLS)

**Option B — CLI script**

1. In Supabase Dashboard → **Project Settings → Database**, copy the **URI** connection string
2. Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres.[ref]:[password]@...
   ```
3. Run:
   ```bash
   npm run db:migrate
   ```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` until signed in.

### 5. Auth setup (Supabase Dashboard)

1. **Authentication → Providers** — enable Email (default) and optionally **Google**
2. For Google OAuth, add redirect URL: `http://localhost:3000/auth/callback` (and your production URL later)
3. Run `002_auth.sql` if you haven't already (see step 3)

## Deploy to Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com/new) (enables auto-deploy on every push to `main`).
2. **Project Settings → Environment Variables** — add these (Production, Preview, Development):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → **service_role** (server-only, never expose to client) |

3. **Run migrations** (once) — add `DATABASE_URL` to `.env.local`, then:
   ```bash
   npm run db:migrate
   ```
   Or paste all files in `supabase/migrations/` into the Supabase SQL Editor.

4. **Auth redirect URLs + Google OAuth** — either manually in Supabase Dashboard, or:
   ```bash
   # .env.local: SUPABASE_ACCESS_TOKEN, SITE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
   npm run supabase:configure
   ```
   Google Cloud redirect URI must include: `https://xsmutlsdlhzvngfdvqmz.supabase.co/auth/v1/callback`

5. Redeploy after saving env vars (**Deployments → … → Redeploy**).

## Features

- **Authentication** — email/password sign-up and sign-in, Google OAuth
- **Groups** — create, list, and view group details (member-scoped via RLS)
- **Members** — add members by name to a group
- **Expenses** — add, edit, delete with flexible splits (equal or custom per participant)
- **Balances** — total spent, owed, and net balance per member

## Project structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # UI components (layout, groups, expenses, etc.)
├── lib/
│   ├── supabaseClient.ts # Browser Supabase client
│   ├── services/         # Data access layer
│   ├── calculations/     # Balance & split logic
│   ├── auth/             # AuthProvider, session helpers
│   ├── supabase/         # Browser + server Supabase clients (SSR)
│   ├── realtime/         # Realtime subscription helpers
│   └── sharing/          # Share link helpers (future)
└── types/                # TypeScript types
```

## Future extensions

- **Real-time** — enable Supabase Realtime on tables; hooks already in `lib/realtime/`
- **Sharing links** — add `/join/[token]` route using `lib/sharing/links.ts`
