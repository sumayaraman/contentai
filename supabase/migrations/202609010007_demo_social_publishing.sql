-- ContentAI Phase 9: Demo social publishing

create table if not exists public.publishing_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'X')),
  action text not null check (action in ('PUBLISH', 'SCHEDULE', 'DELETE')),
  status text not null check (status in ('SUCCESS', 'FAILED')),
  external_post_id text,
  message text,
  error_code text,
  attempted_at timestamptz not null default now()
);

create index if not exists publishing_events_workspace_attempted_idx
  on public.publishing_events(workspace_id, attempted_at desc);
create index if not exists publishing_events_post_attempted_idx
  on public.publishing_events(post_id, attempted_at desc);
create index if not exists publishing_events_workspace_platform_idx
  on public.publishing_events(workspace_id, platform, attempted_at desc);

alter table public.publishing_events enable row level security;

drop policy if exists "publishing_events_select_workspace" on public.publishing_events;
create policy "publishing_events_select_workspace"
on public.publishing_events for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "publishing_events_insert_workspace" on public.publishing_events;
create policy "publishing_events_insert_workspace"
on public.publishing_events for insert
with check (
  public.is_workspace_member(workspace_id)
  and user_id = auth.uid()
);

-- Publishing actions are application-controlled; members can only see their workspace history.
-- No direct client-side update/delete policy is provided.

drop policy if exists analytics_member_insert on public.analytics;
create policy analytics_member_insert
on public.analytics for insert
with check (
  exists (
    select 1 from public.posts p
    where p.id = post_id
      and public.is_workspace_member(p.workspace_id)
  )
);

grant select, insert on public.analytics to authenticated;
grant select, insert on public.publishing_events to authenticated;
