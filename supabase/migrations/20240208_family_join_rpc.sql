
-- Secure RPC function to join family by invite code
-- Bypasses RLS to search for the code, then adds the user as a member

create or replace function public.join_family_by_invite_code(code_input text)
returns json as $$
declare
  target_family_id uuid;
  found_family record;
begin
  -- 1. Find family by code (bypass RLS because security definer)
  select * into found_family
  from public.families
  where upper(invite_code) = upper(code_input);

  if found_family is null then
    return json_build_object('success', false, 'message', 'Invalid invite code');
  end if;

  target_family_id := found_family.id;

  -- 2. Check if already member
  if exists (select 1 from public.family_members where family_id = target_family_id and user_id = auth.uid()) then
     return json_build_object('success', false, 'message', 'You are already in this family');
  end if;

  -- 3. Insert member
  insert into public.family_members (family_id, user_id, role)
  values (target_family_id, auth.uid(), 'member');

  return json_build_object('success', true, 'family_id', target_family_id);
end;
$$ language plpgsql security definer;
