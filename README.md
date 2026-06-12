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
2. Paste the contents of `supabase/migrations/001_schema.sql`
3. Click **Run**

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

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Groups** — create, list, and view group details
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
│   ├── auth/             # Auth placeholder (ready for Supabase Auth)
│   ├── realtime/         # Realtime subscription helpers
│   └── sharing/          # Share link helpers (future)
└── types/                # TypeScript types
```

## Future extensions

- **Authentication** — replace `lib/auth/session.ts` with Supabase Auth + `@supabase/ssr`
- **Real-time** — enable Supabase Realtime on tables; hooks already in `lib/realtime/`
- **Sharing links** — add `/join/[token]` route using `lib/sharing/links.ts`
