# SplitBite Roadmap

## Phase 2 — Polish (current)

- [x] Toast notifications for actions
- [x] Custom delete confirmation modal
- [x] Settlement view (simplified "who pays whom")
- [x] Loading skeletons + sync indicator
- [x] Member avatars (initials)
- [ ] Enable Supabase Realtime on tables (Dashboard → Database → Replication)
- [x] Mobile-responsive sidebar (collapsible drawer)

## Phase 3 — Authentication

- Supabase Auth (email / Google)
- Link `auth.users` → `users` profile table
- Replace permissive RLS with member-scoped policies
- "You" indicator on current user in member list

## Phase 4 — Collaboration

- Invite links (`/join/[token]`)
- Group roles (admin can add/remove members, close group)
- Archive closed groups (`is_closed` flag in UI)
- Duplicate member detection by email instead of always creating new users

## Phase 5 — Advanced splits

- Percentage-based splits
- Itemized receipts (line items → participants)
- Recurring expenses
- Multi-currency support

## Phase 6 — Production

- Deploy to Vercel
- Error boundary + Sentry
- E2E tests (Playwright)
- PWA / offline read cache

## UX ideas (backlog)

- Expense categories & filters
- Export CSV / PDF summary
- "Mark as settled" per payment
- Activity feed (who added what, when)
- Dark mode
