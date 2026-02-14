-- Migration to fix deletion policies

-- Allow users to delete their own daily records
create policy "Users can delete own daily_records"
  on public.daily_records for delete
  using (auth.uid() = user_id);

-- Ensure expense_items deletion policy is comprehensive
drop policy if exists "Users can delete own expense_items" on public.expense_items;
create policy "Users can delete own expense_items"
  on public.expense_items for delete
  using (
    exists (
      select 1 from public.daily_records
      where id = expense_items.daily_record_id
      and user_id = auth.uid()
    )
  );
