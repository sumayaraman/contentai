-- ContentAI: Fix media file_size constraint to match storage bucket limit (10 MB).
-- Migration 002 created the constraint at 5 MB, but migrations 005 and 008
-- updated the storage bucket to 10 MB. AI-generated images can legitimately
-- reach that limit, so the DB constraint is updated to match.

alter table public.media
  drop constraint if exists media_file_size_check;

alter table public.media
  add constraint media_file_size_check
  check (file_size > 0 and file_size <= 10485760);
