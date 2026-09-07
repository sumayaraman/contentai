# Brand Content Workspace

The new `/workspace` feature turns ContentAI into a reusable brand-to-calendar workflow.

## Flow
1. Save business name, description, brand voice, colors and logo.
2. Choose platform, audience, goal, tone, plan length and posts per day.
3. Generate unique daily content bundles (hooks, captions, CTAs, hashtags and image prompts).
4. Generate images sequentially through the configured image provider.
5. The exact uploaded logo is composited onto each generated image in the browser before it is stored.
6. Add the finished batch to the calendar. Multiple posts per day are spaced across the day.

## Database
Migration `202609070001_brand_workspace.sql` adds reusable brand identity fields to `workspaces`.
