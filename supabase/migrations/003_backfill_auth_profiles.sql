-- Backfill profiles for auth users created before the signup trigger existed

INSERT INTO public.users (auth_id, name, avatar_url)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1),
    'User'
  ),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.auth_id = au.id
)
ON CONFLICT (auth_id) DO NOTHING;
