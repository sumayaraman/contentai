-- ContentAI Phase 3: Calendar & Scheduling
-- Adds database-level protection for future scheduling without redesigning Phase 1/2 tables.

create or replace function public.validate_post_schedule()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status = 'SCHEDULED' and new.scheduled_at <= now() then
    raise exception 'Scheduled posts must be set for a future date and time.'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists posts_validate_schedule on public.posts;
create trigger posts_validate_schedule
before insert or update of status, scheduled_at on public.posts
for each row execute function public.validate_post_schedule();

create index if not exists posts_workspace_status_scheduled_at_idx
  on public.posts(workspace_id, status, scheduled_at);
