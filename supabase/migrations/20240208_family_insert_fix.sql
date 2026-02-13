
-- Fix: Ensure the INSERT policy for families table exists and is correct
-- This fixes RLS violation error (42501) when creating a family

drop policy if exists "Users can create families" on public.families;

create policy "Users can create families"
  on public.families for insert
  with check (auth.uid() = created_by);
