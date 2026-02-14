
-- Feature: Monthly Budget
-- Add 'monthly_budget' column to profiles table with default 5,000,000

alter table public.profiles
add column monthly_budget numeric not null default 5000000;
