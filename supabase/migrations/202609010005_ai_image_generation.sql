-- ContentAI Phase 6: AI image generation and media metadata.

alter table public.media
  drop constraint if exists media_mime_type_check;

alter table public.media
  add constraint media_mime_type_check
  check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'));

alter table public.media
  drop constraint if exists media_source_check;

alter table public.media
  add constraint media_source_check
  check (source in ('UPLOAD', 'DEMO_FALLBACK', 'AI_GENERATED'));

alter table public.media
  add column if not exists generation_prompt text,
  add column if not exists generation_provider text,
  add column if not exists generation_model text;

create index if not exists media_workspace_source_created_at_idx
  on public.media(workspace_id, source, created_at desc);

create index if not exists media_generation_provider_idx
  on public.media(generation_provider)
  where generation_provider is not null;

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
where id = 'media';
