
-- COMPREHENSIVE FIX for Family Creation
-- 1. Updates SELECT policy to allow creators to view their own families (critical for insert().select())
-- 2. Resets INSERT policy to ensure permissions are correct

-- A. Fix SELECT Policy
drop policy if exists "Family members can view their family" on public.families;

create policy "Family members can view their family"
  on public.families for select
  using (
    created_by = auth.uid() -- Allow creator to see it (Fixes 42501 on RETURNING)
    or
    exists (
      select 1 from public.family_members
      where family_id = families.id
      and user_id = auth.uid()
    )
  );

-- B. Fix INSERT Policy
drop policy if exists "Users can create families" on public.families;

create policy "Users can create families"
  on public.families for insert
  with check (auth.uid() = created_by);
