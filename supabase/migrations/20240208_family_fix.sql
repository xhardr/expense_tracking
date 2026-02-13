
-- Fix: Add direct relationship between family_members and profiles
-- to allow joined queries like family_members(..., profiles(*))

alter table public.family_members
add constraint family_members_user_id_profiles_fkey
foreign key (user_id)
references public.profiles(id);
