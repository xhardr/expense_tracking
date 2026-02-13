
-- ============================================
-- Family Sharing Migration
-- Run this in Supabase SQL Editor AFTER the initial migration
-- ============================================

-- 1. Profiles table (display names)
create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Families table
create table public.families (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.families enable row level security;

-- 3. Family members table
create table public.family_members (
  id uuid not null default gen_random_uuid() primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  constraint unique_family_user unique (family_id, user_id)
);

alter table public.family_members enable row level security;

-- Helper function: check if two users are in the same family
create or replace function public.is_family_member(target_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.family_members fm1
    join public.family_members fm2 on fm1.family_id = fm2.family_id
    where fm1.user_id = auth.uid()
    and fm2.user_id = target_user_id
  );
end;
$$ language plpgsql security definer;

-- Family policies
create policy "Family members can view their family"
  on public.families for select
  using (
    exists (
      select 1 from public.family_members
      where family_id = families.id
      and user_id = auth.uid()
    )
  );

create policy "Users can create families"
  on public.families for insert
  with check (auth.uid() = created_by);

create policy "Family members can view members"
  on public.family_members for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.family_id = family_members.family_id
      and fm.user_id = auth.uid()
    )
  );

create policy "Users can join families"
  on public.family_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave families"
  on public.family_members for delete
  using (auth.uid() = user_id);

-- 4. Update daily_records SELECT policy to include family members
drop policy if exists "Users can view own daily_records" on public.daily_records;
create policy "Users can view own and family daily_records"
  on public.daily_records for select
  using (
    auth.uid() = user_id
    or public.is_family_member(user_id)
  );

-- 5. Update expense_items SELECT policy to include family members
drop policy if exists "Users can view own expense_items" on public.expense_items;
create policy "Users can view own and family expense_items"
  on public.expense_items for select
  using (
    exists (
      select 1 from public.daily_records dr
      where dr.id = expense_items.daily_record_id
      and (
        dr.user_id = auth.uid()
        or public.is_family_member(dr.user_id)
      )
    )
  );

-- 6. Backfill: create profiles for existing users
insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1)
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
