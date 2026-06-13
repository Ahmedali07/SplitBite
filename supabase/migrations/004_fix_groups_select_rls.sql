-- Fix: allow creators to SELECT their group immediately after INSERT ... RETURNING
-- (before group_members row exists). Without this, createGroup().select() fails RLS.

DROP POLICY IF EXISTS "groups_select" ON public.groups;

CREATE POLICY "groups_select" ON public.groups
  FOR SELECT USING (
    public.is_member_of_group(id)
    OR created_by = public.current_user_profile_id()
  );
