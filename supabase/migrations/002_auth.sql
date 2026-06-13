-- Phase 3: Authentication — link auth.users to profiles + member-scoped RLS

-- Link public profiles to Supabase Auth users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

-- Resolve the signed-in user's profile id (public.users.id)
CREATE OR REPLACE FUNCTION public.current_user_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- True when the signed-in user belongs to the given group
CREATE OR REPLACE FUNCTION public.is_member_of_group(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = gid
      AND gm.user_id = public.current_user_profile_id()
  );
$$;

-- Auto-create a profile row when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop permissive dev policies
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow all for groups" ON public.groups;
DROP POLICY IF EXISTS "Allow all for group_members" ON public.group_members;
DROP POLICY IF EXISTS "Allow all for expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow all for expense_participants" ON public.expense_participants;

-- Drop member-scoped policies (idempotent re-run)
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_placeholder" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "groups_select" ON public.groups;
DROP POLICY IF EXISTS "groups_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_update" ON public.groups;
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;
DROP POLICY IF EXISTS "expense_participants_select" ON public.expense_participants;
DROP POLICY IF EXISTS "expense_participants_insert" ON public.expense_participants;
DROP POLICY IF EXISTS "expense_participants_update" ON public.expense_participants;
DROP POLICY IF EXISTS "expense_participants_delete" ON public.expense_participants;

-- users: own profile + placeholder profiles + co-members in shared groups
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

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Name-only members added by authenticated users (no linked auth account yet)
CREATE POLICY "users_insert_placeholder" ON public.users
  FOR INSERT WITH CHECK (auth_id IS NULL AND auth.uid() IS NOT NULL);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth_id = auth.uid());

-- groups: visible to members and to the creator (needed for INSERT ... RETURNING)
CREATE POLICY "groups_select" ON public.groups
  FOR SELECT USING (
    public.is_member_of_group(id)
    OR created_by = public.current_user_profile_id()
  );

CREATE POLICY "groups_insert" ON public.groups
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = public.current_user_profile_id()
  );

CREATE POLICY "groups_update" ON public.groups
  FOR UPDATE USING (public.is_member_of_group(id));

-- group_members
CREATE POLICY "group_members_select" ON public.group_members
  FOR SELECT USING (public.is_member_of_group(group_id));

-- Allow adding yourself (e.g. when creating a group) or adding others when already a member
CREATE POLICY "group_members_insert" ON public.group_members
  FOR INSERT WITH CHECK (
    user_id = public.current_user_profile_id()
    OR public.is_member_of_group(group_id)
  );

CREATE POLICY "group_members_delete" ON public.group_members
  FOR DELETE USING (public.is_member_of_group(group_id));

-- expenses
CREATE POLICY "expenses_select" ON public.expenses
  FOR SELECT USING (public.is_member_of_group(group_id));

CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT WITH CHECK (public.is_member_of_group(group_id));

CREATE POLICY "expenses_update" ON public.expenses
  FOR UPDATE USING (public.is_member_of_group(group_id));

CREATE POLICY "expenses_delete" ON public.expenses
  FOR DELETE USING (public.is_member_of_group(group_id));

-- expense_participants (via parent expense group)
CREATE POLICY "expense_participants_select" ON public.expense_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_participants.expense_id
        AND public.is_member_of_group(e.group_id)
    )
  );

CREATE POLICY "expense_participants_insert" ON public.expense_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_participants.expense_id
        AND public.is_member_of_group(e.group_id)
    )
  );

CREATE POLICY "expense_participants_update" ON public.expense_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_participants.expense_id
        AND public.is_member_of_group(e.group_id)
    )
  );

CREATE POLICY "expense_participants_delete" ON public.expense_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_participants.expense_id
        AND public.is_member_of_group(e.group_id)
    )
  );
