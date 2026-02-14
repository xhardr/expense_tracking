
-- Feature: Expense Categories
-- Add 'category' column to expense_items table with a default value

alter table public.expense_items
add column category text not null default 'Other';

-- Optional: Add a check constraint to enforce valid categories if desired
-- For now, we allow any text, but frontend will restrict to specific options.
