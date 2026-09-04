-- ContentAI Phase 1 Foundation
-- Run this migration in the Supabase SQL Editor or via Supabase CLI.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.workspace_role as enum ('OWNER', 'ADMIN', 'MEMBER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.post_status as enum ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.social_platform as enum ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'X');
exception when duplicate_object then null; end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  owner_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.workspace_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  constraint workspace_members_unique_member unique (workspace_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  color text not null default '#2563eb' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  constraint categories_workspace_name_unique unique (workspace_id, name)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 200),
  caption text,
  platform public.social_platform not null,
  status public.post_status not null default 'DRAFT',
  category_id uuid references public.categories(id) on delete set null,
  cta text,
  image_url text,
  image_prompt text,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_schedule_status_check check (status <> 'SCHEDULED' or scheduled_at is not null),
  constraint posts_published_status_check check (status <> 'PUBLISHED' or published_at is not null)
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  generation_type text not null check (char_length(trim(generation_type)) between 1 and 80),
  input text,
  output text,
  provider text not null default 'demo',
  created_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  platform public.social_platform not null,
  likes bigint not null default 0 check (likes >= 0),
  comments bigint not null default 0 check (comments >= 0),
  shares bigint not null default 0 check (shares >= 0),
  reach bigint not null default 0 check (reach >= 0),
  impressions bigint not null default 0 check (impressions >= 0),
  engagement_rate numeric(7,4) not null default 0 check (engagement_rate >= 0),
  recorded_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index if not exists categories_workspace_id_idx on public.categories(workspace_id);
create index if not exists posts_workspace_id_idx on public.posts(workspace_id);
create index if not exists posts_workspace_status_idx on public.posts(workspace_id, status);
create index if not exists posts_workspace_created_at_idx on public.posts(workspace_id, created_at desc);
create index if not exists posts_workspace_scheduled_at_idx on public.posts(workspace_id, scheduled_at);
create index if not exists posts_category_id_idx on public.posts(category_id);
create index if not exists ai_generations_workspace_created_at_idx on public.ai_generations(workspace_id, created_at desc);
create index if not exists ai_generations_user_id_idx on public.ai_generations(user_id);
create index if not exists analytics_post_recorded_at_idx on public.analytics(post_id, recorded_at desc);
create index if not exists analytics_platform_recorded_at_idx on public.analytics(platform, recorded_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_id uuid;
  display_name text;
begin
  display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '');
  insert into public.users (id, email, name)
  values (new.id, coalesce(new.email, ''), display_name)
  on conflict (id) do update set email = excluded.email, name = coalesce(excluded.name, public.users.name);

  insert into public.workspaces (name, owner_id)
  values ('Demo Marketing Studio', new.id)
  returning id into workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (workspace_id, new.id, 'OWNER');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(target_workspace uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.role in ('OWNER', 'ADMIN')
  );
$$;

alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.ai_generations enable row level security;
alter table public.analytics enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users for select using (id = auth.uid());
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists workspaces_select_member on public.workspaces;
create policy workspaces_select_member on public.workspaces for select using (public.is_workspace_member(id));
drop policy if exists workspaces_update_admin on public.workspaces;
create policy workspaces_update_admin on public.workspaces for update using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));

drop policy if exists workspace_members_select_member on public.workspace_members;
create policy workspace_members_select_member on public.workspace_members for select using (public.is_workspace_member(workspace_id));
drop policy if exists workspace_members_manage_admin on public.workspace_members;
create policy workspace_members_manage_admin on public.workspace_members for all using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

-- The Phase 1 client only reads workspace membership. Future workspace creation/invites
-- should use server-side actions and explicit admin policies.
drop policy if exists categories_member_all on public.categories;
create policy categories_member_all on public.categories for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

drop policy if exists posts_member_all on public.posts;
create policy posts_member_all on public.posts for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

drop policy if exists ai_generations_member_select on public.ai_generations;
create policy ai_generations_member_select on public.ai_generations for select using (public.is_workspace_member(workspace_id));
drop policy if exists ai_generations_member_insert on public.ai_generations;
create policy ai_generations_member_insert on public.ai_generations for insert with check (public.is_workspace_member(workspace_id) and user_id = auth.uid());

drop policy if exists analytics_member_select on public.analytics;
create policy analytics_member_select on public.analytics for select using (exists (select 1 from public.posts p where p.id = post_id and public.is_workspace_member(p.workspace_id)));

grant usage on schema public to anon, authenticated;
grant select, update on public.users to authenticated;
grant select, update on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert on public.ai_generations to authenticated;
grant select on public.analytics to authenticated;
