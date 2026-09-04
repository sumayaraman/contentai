-- ContentAI Phase 8 — Workspace & Team Management

alter table public.workspaces
  add column if not exists ai_provider text not null default 'auto';

alter table public.workspaces
  drop constraint if exists workspaces_ai_provider_check;

alter table public.workspaces
  add constraint workspaces_ai_provider_check
  check (ai_provider in ('auto', 'mock', 'openai', 'anthropic', 'groq'));

create index if not exists workspaces_owner_updated_at_idx
  on public.workspaces(owner_id, updated_at desc);

-- Keep the workspace owner membership invariant enforced in the database.
create or replace function public.prevent_invalid_workspace_membership_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'OWNER' then
      raise exception 'The workspace owner cannot be removed.' using errcode = '42501';
    end if;
    return old;
  end if;

  if old.role = 'OWNER' and new.role <> 'OWNER' then
    raise exception 'The workspace owner role cannot be changed.' using errcode = '42501';
  end if;

  if new.role = 'OWNER' and old.role <> 'OWNER' then
    raise exception 'Ownership transfer is not enabled in this version.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists workspace_members_protect_owner on public.workspace_members;
create trigger workspace_members_protect_owner
before update or delete on public.workspace_members
for each row execute function public.prevent_invalid_workspace_membership_change();

create or replace function public.is_workspace_owner(target_workspace uuid)
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
      and wm.role = 'OWNER'
  );
$$;

-- Phase 8 requires server-side role enforcement. Members can view their team,
-- but only the OWNER may mutate membership records in this release.
drop policy if exists workspace_members_manage_admin on public.workspace_members;
drop policy if exists workspace_members_insert_owner on public.workspace_members;
drop policy if exists workspace_members_update_owner on public.workspace_members;
drop policy if exists workspace_members_delete_owner on public.workspace_members;

create policy workspace_members_insert_owner
on public.workspace_members
for insert
with check (public.is_workspace_owner(workspace_id));

create policy workspace_members_update_owner
on public.workspace_members
for update
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy workspace_members_delete_owner
on public.workspace_members
for delete
using (public.is_workspace_owner(workspace_id));

-- Admins may continue to edit workspace settings through the existing policy;
-- members remain read-only. RLS is the second authorization boundary behind the
-- explicit server-side role checks in application actions.

-- Team settings needs member identity data. Members may read profiles for users
-- who share a workspace with them; users can still update only their own profile.
drop policy if exists users_select_workspace_members on public.users;
create policy users_select_workspace_members
on public.users
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.workspace_members viewer_membership
    join public.workspace_members target_membership
      on target_membership.workspace_id = viewer_membership.workspace_id
    where viewer_membership.user_id = auth.uid()
      and target_membership.user_id = public.users.id
  )
);
