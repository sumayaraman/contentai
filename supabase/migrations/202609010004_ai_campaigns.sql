create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  platform public.social_platform not null,
  duration_days integer not null check (duration_days between 1 and 30),
  target_audience text not null check (char_length(target_audience) between 1 and 300),
  tone text not null check (char_length(tone) between 1 and 50),
  goal text not null check (char_length(goal) between 1 and 50),
  prompt text not null check (char_length(prompt) between 1 and 300),
  provider text not null default 'mock',
  status text not null default 'DRAFT' check (status in ('DRAFT','ADDED_TO_CALENDAR','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_days (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  day_number integer not null check (day_number between 1 and 30),
  content_idea text not null,
  hook text not null,
  caption text not null,
  cta text not null,
  hashtags text[] not null default '{}',
  image_prompt text not null,
  suggested_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, day_number),
  unique(post_id)
);

alter table public.posts add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;
alter table public.posts add column if not exists campaign_day_id uuid references public.campaign_days(id) on delete set null;
create index if not exists campaigns_workspace_created_idx on public.campaigns(workspace_id, created_at desc);
create index if not exists campaign_days_campaign_day_idx on public.campaign_days(campaign_id, day_number);
create index if not exists posts_workspace_campaign_idx on public.posts(workspace_id, campaign_id);

create or replace function public.set_campaign_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists campaigns_updated_at on public.campaigns;
create trigger campaigns_updated_at before update on public.campaigns for each row execute function public.set_campaign_updated_at();
drop trigger if exists campaign_days_updated_at on public.campaign_days;
create trigger campaign_days_updated_at before update on public.campaign_days for each row execute function public.set_campaign_updated_at();

create or replace function public.enforce_campaign_workspace() returns trigger language plpgsql as $$
declare campaign_workspace uuid;
begin
  select workspace_id into campaign_workspace from public.campaigns where id = new.campaign_id;
  if campaign_workspace is null or campaign_workspace <> new.workspace_id then raise exception 'Campaign workspace mismatch'; end if;
  if new.post_id is not null and not exists (select 1 from public.posts p where p.id = new.post_id and p.workspace_id = new.workspace_id) then raise exception 'Campaign post workspace mismatch'; end if;
  return new;
end $$;
drop trigger if exists campaign_days_workspace_guard on public.campaign_days;
create trigger campaign_days_workspace_guard before insert or update on public.campaign_days for each row execute function public.enforce_campaign_workspace();

alter table public.campaigns enable row level security;
alter table public.campaign_days enable row level security;
create policy campaigns_select on public.campaigns for select using (public.is_workspace_member(workspace_id));
create policy campaigns_insert on public.campaigns for insert with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());
create policy campaigns_update on public.campaigns for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy campaigns_delete on public.campaigns for delete using (public.is_workspace_member(workspace_id));
create policy campaign_days_select on public.campaign_days for select using (public.is_workspace_member(workspace_id));
create policy campaign_days_insert on public.campaign_days for insert with check (public.is_workspace_member(workspace_id));
create policy campaign_days_update on public.campaign_days for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy campaign_days_delete on public.campaign_days for delete using (public.is_workspace_member(workspace_id));
