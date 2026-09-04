-- ContentAI Phase 2: Content Management
-- Extends the Phase 1 foundation without changing existing core entities.

alter table public.posts
  add column if not exists hashtags text;

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  file_name text not null check (char_length(trim(file_name)) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  file_size bigint not null check (file_size > 0 and file_size <= 5242880),
  storage_path text,
  url text not null,
  source text not null default 'UPLOAD' check (source in ('UPLOAD', 'DEMO_FALLBACK')),
  created_at timestamptz not null default now()
);

create index if not exists media_workspace_created_at_idx on public.media(workspace_id, created_at desc);
create index if not exists media_workspace_id_idx on public.media(workspace_id);
create index if not exists media_uploaded_by_idx on public.media(uploaded_by);

alter table public.media enable row level security;

drop policy if exists media_member_select on public.media;
create policy media_member_select on public.media
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists media_member_insert on public.media;
create policy media_member_insert on public.media
  for insert
  with check (public.is_workspace_member(workspace_id) and uploaded_by = auth.uid());

drop policy if exists media_member_delete on public.media;
create policy media_member_delete on public.media
  for delete
  using (public.is_workspace_member(workspace_id));

grant select, insert, delete on public.media to authenticated;
grant usage on schema public to authenticated;

-- Default categories for new workspaces, plus a safe backfill for workspaces
-- created before the Phase 2 migration.
insert into public.categories (workspace_id, name, color)
select w.id, defaults.name, defaults.color
from public.workspaces w
cross join (values
  ('Educational', '#2563eb'),
  ('Promotional', '#7c3aed'),
  ('Product', '#0891b2'),
  ('Behind the Scenes', '#ea580c'),
  ('Engagement', '#16a34a')
) as defaults(name, color)
where not exists (
  select 1 from public.categories c
  where c.workspace_id = w.id and c.name = defaults.name
);

-- Keep the registration trigger responsible for creating the default category set.
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
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.users.name);

  insert into public.workspaces (name, owner_id)
  values ('Demo Marketing Studio', new.id)
  returning id into workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (workspace_id, new.id, 'OWNER');

  insert into public.categories (workspace_id, name, color)
  values
    (workspace_id, 'Educational', '#2563eb'),
    (workspace_id, 'Promotional', '#7c3aed'),
    (workspace_id, 'Product', '#0891b2'),
    (workspace_id, 'Behind the Scenes', '#ea580c'),
    (workspace_id, 'Engagement', '#16a34a');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Create the media bucket when migrations are run against a Supabase project.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage objects are isolated by the first folder segment: {workspace_id}/...
drop policy if exists media_storage_select on storage.objects;
create policy media_storage_select on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists media_storage_insert on storage.objects;
create policy media_storage_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists media_storage_update on storage.objects;
create policy media_storage_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'media'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists media_storage_delete on storage.objects;
create policy media_storage_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

-- Ensure a post can only reference a category from the same workspace.
alter table public.categories
  add constraint categories_id_workspace_unique unique (id, workspace_id);

alter table public.posts
  add constraint posts_category_workspace_fk
  foreign key (category_id, workspace_id)
  references public.categories (id, workspace_id)
  on delete no action;
