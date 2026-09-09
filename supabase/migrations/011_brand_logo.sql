-- Migration 011: Brand logo support for workspaces
-- Run this in Supabase SQL Editor

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS brand_logo_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS brand_logo_position TEXT NOT NULL DEFAULT 'bottom-right'
    CHECK (brand_logo_position IN ('top-left','top-right','bottom-left','bottom-right','center'));

COMMENT ON COLUMN workspaces.brand_logo_media_id IS
  'Media record used as watermark logo on all generated images';
COMMENT ON COLUMN workspaces.brand_logo_position IS
  'Corner position of the watermark logo on generated images';
