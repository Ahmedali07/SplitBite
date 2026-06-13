-- Fix: allow SELECT on name-only placeholder users so createUser().select() works
-- before the group_members row links them to the creator's groups.

DROP POLICY IF EXISTS "users_select" ON public.users;

CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    auth_id = auth.uid()
    OR (
      auth_id IS NULL
      AND auth.uid() IS NOT NULL
    )
    OR EXISTS (
      SELECT 1
      FROM public.group_members gm_self
      JOIN public.group_members gm_other ON gm_self.group_id = gm_other.group_id
      WHERE gm_self.user_id = public.current_user_profile_id()
        AND gm_other.user_id = users.id
    )
  );
