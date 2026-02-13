
-- Create tables
create table public.daily_records (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null default current_date,
  total_money numeric(10, 2) not null default 0,
  total_spent numeric(10, 2) not null default 0,
  remaining_money numeric(10, 2) generated always as (total_money - total_spent) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_date unique (user_id, date)
);

create table public.expense_items (
  id uuid not null default gen_random_uuid() primary key,
  daily_record_id uuid not null references public.daily_records(id) on delete cascade,
  item_name text not null,
  amount numeric(10, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.daily_records enable row level security;
alter table public.expense_items enable row level security;

-- Create Policies
create policy "Users can view own daily_records"
  on public.daily_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily_records"
  on public.daily_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily_records"
  on public.daily_records for update
  using (auth.uid() = user_id);

create policy "Users can view own expense_items"
  on public.expense_items for select
  using (
    exists (
      select 1 from public.daily_records
      where id = expense_items.daily_record_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert own expense_items"
  on public.expense_items for insert
  with check (
    exists (
      select 1 from public.daily_records
      where id = daily_record_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete own expense_items"
  on public.expense_items for delete
  using (
    exists (
      select 1 from public.daily_records
      where id = expense_items.daily_record_id
      and user_id = auth.uid()
    )
  );

-- Function to update totals
create or replace function update_daily_record_totals()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.daily_records
    set total_spent = total_spent + NEW.amount
    where id = NEW.daily_record_id;
  elsif (TG_OP = 'DELETE') then
    update public.daily_records
    set total_spent = total_spent - OLD.amount
    where id = OLD.daily_record_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger to update totals automatically
create trigger on_expense_change
  after insert or delete on public.expense_items
  for each row execute function update_daily_record_totals();
