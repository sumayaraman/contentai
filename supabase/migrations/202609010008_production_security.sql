-- ContentAI Phase 10: production security hardening.

-- Keep media objects private. Application routes issue short-lived signed URLs only
-- after Supabase authentication and workspace-scoped media lookup.
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
where id = 'media';

-- Existing storage-backed media previously stored public URLs. Replace those URLs
-- with the authenticated application media endpoint and update posts that referenced them.
update public.posts p
set image_url = '/api/media/' || m.id
from public.media m
where m.storage_path is not null
  and p.image_url = m.url;

update public.media m
set url = '/api/media/' || m.id
where m.storage_path is not null;

-- Allow workspace admins to edit content created by another workspace member while
-- preventing them from changing the original creator. Insert remains creator-bound.
drop policy if exists posts_member_all on public.posts;
drop policy if exists posts_member_select on public.posts;
drop policy if exists posts_member_insert on public.posts;
drop policy if exists posts_member_update on public.posts;
drop policy if exists posts_member_delete on public.posts;

create policy posts_member_select on public.posts
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy posts_member_insert on public.posts
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy posts_member_update on public.posts
  for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy posts_member_delete on public.posts
  for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- Creator ownership is immutable after insertion.
create or replace function public.prevent_post_creator_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'Post creator cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_post_creator_change on public.posts;
create trigger prevent_post_creator_change
before update on public.posts
for each row execute function public.prevent_post_creator_change();
