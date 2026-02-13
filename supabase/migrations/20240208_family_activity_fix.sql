
-- Fix: Add foreign key from daily_records to profiles
-- This allows joining profiles in the family activity query: daily_records(..., profiles:user_id(...))

alter table public.daily_records
add constraint daily_records_user_id_profiles_fkey
foreign key (user_id)
references public.profiles(id);
