-- ContentAI: brand-aware marketing workspace.
-- Stores the reusable business identity used by the 30-day content planner.

alter table public.workspaces
  add column if not exists brand_name text,
  add column if not exists brand_description text,
  add column if not exists brand_logo_url text,
  add column if not exists brand_primary_color text default '#111827',
  add column if not exists brand_secondary_color text default '#f59e0b',
  add column if not exists brand_voice text default 'Friendly and professional';

alter table public.workspaces
  drop constraint if exists workspaces_brand_primary_color_check;
alter table public.workspaces
  add constraint workspaces_brand_primary_color_check
  check (brand_primary_color is null or brand_primary_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.workspaces
  drop constraint if exists workspaces_brand_secondary_color_check;
alter table public.workspaces
  add constraint workspaces_brand_secondary_color_check
  check (brand_secondary_color is null or brand_secondary_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.workspaces
  drop constraint if exists workspaces_brand_name_check;
alter table public.workspaces
  add constraint workspaces_brand_name_check
  check (brand_name is null or char_length(trim(brand_name)) between 0 and 120);

alter table public.workspaces
  drop constraint if exists workspaces_brand_description_check;
alter table public.workspaces
  add constraint workspaces_brand_description_check
  check (brand_description is null or char_length(brand_description) <= 1000);

alter table public.workspaces
  drop constraint if exists workspaces_brand_voice_check;
alter table public.workspaces
  add constraint workspaces_brand_voice_check
  check (brand_voice is null or char_length(brand_voice) <= 500);
