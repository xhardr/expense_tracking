
-- Fix: Recursive RLS policy on family_members causing errors
-- Drop the potential recursive policy and replace with non-recursive check

drop policy if exists "Family members can view members" on public.family_members;

create policy "Family members can view members"
  on public.family_members for select
  using (
    auth.uid() = user_id -- Can always view own row
    or
    public.is_family_member(user_id) -- Can view other members in same family (uses security definer to avoid recursion)
  );
