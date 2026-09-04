-- ContentAI Phase 11: real social integrations.
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  connected_by uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('INSTAGRAM','FACEBOOK','LINKEDIN','X')),
  account_id text not null,
  account_name text not null,
  username text,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, platform, account_id)
);

create index if not exists social_accounts_workspace_idx on public.social_accounts(workspace_id);
create index if not exists social_accounts_workspace_platform_idx on public.social_accounts(workspace_id, platform);

create or replace function public.set_social_accounts_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists social_accounts_updated_at on public.social_accounts;
create trigger social_accounts_updated_at before update on public.social_accounts
for each row execute function public.set_social_accounts_updated_at();

alter table public.social_accounts enable row level security;

drop policy if exists social_accounts_select_workspace on public.social_accounts;
create policy social_accounts_select_workspace on public.social_accounts for select to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists social_accounts_insert_admin on public.social_accounts;
create policy social_accounts_insert_admin on public.social_accounts for insert to authenticated
with check (public.is_workspace_admin(workspace_id) and connected_by = auth.uid());

drop policy if exists social_accounts_update_admin on public.social_accounts;
create policy social_accounts_update_admin on public.social_accounts for update to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists social_accounts_delete_admin on public.social_accounts;
create policy social_accounts_delete_admin on public.social_accounts for delete to authenticated
using (public.is_workspace_admin(workspace_id));

create table if not exists public.post_publications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform text not null check (platform in ('INSTAGRAM','FACEBOOK','LINKEDIN','X')),
  status text not null check (status in ('PENDING','PUBLISHING','PUBLISHED','FAILED')),
  external_post_id text,
  published_at timestamptz,
  error_message text,
  attempt_count integer not null default 0 check (attempt_count >= 0 and attempt_count <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_publications_workspace_idx on public.post_publications(workspace_id, created_at desc);
create index if not exists post_publications_post_idx on public.post_publications(post_id, created_at desc);
create index if not exists post_publications_account_idx on public.post_publications(social_account_id, status);

drop trigger if exists post_publications_updated_at on public.post_publications;
create trigger post_publications_updated_at before update on public.post_publications
for each row execute function public.set_social_accounts_updated_at();

alter table public.post_publications enable row level security;

drop policy if exists post_publications_select_workspace on public.post_publications;
create policy post_publications_select_workspace on public.post_publications for select to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists post_publications_insert_workspace on public.post_publications;
create policy post_publications_insert_workspace on public.post_publications for insert to authenticated
with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.posts p where p.id = post_id and p.workspace_id = workspace_id)
  and exists (select 1 from public.social_accounts s where s.id = social_account_id and s.workspace_id = workspace_id)
);

drop policy if exists post_publications_update_admin on public.post_publications;
create policy post_publications_update_admin on public.post_publications for update to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

grant select, insert, update on public.social_accounts to authenticated;
grant select, insert, update on public.post_publications to authenticated;

create unique index if not exists post_publications_post_account_unique on public.post_publications(post_id, social_account_id);
