# ContentAI Phase 11 — Real Social Media Integration

Phase 11 extends the existing demo publisher without removing Demo Mode.

## Providers

- `MockSocialPublisher` remains the demo path.
- `MetaSocialPublisher` handles Facebook Pages and eligible Instagram professional accounts.
- `LinkedInPublisher` handles member posts through the LinkedIn Posts API.
- `XPublisher` handles X posts through OAuth 2.0 user context.

## OAuth

OAuth state is stored in short-lived, HTTP-only cookies. X uses PKCE. Provider client secrets are server-only.

## Token storage

Access and refresh credentials are encrypted with AES-256-GCM using `SOCIAL_TOKEN_ENCRYPTION_KEY`. The raw tokens are never returned to client components.

## Database

Migration `202609010010_real_social_integrations.sql` adds:

- `social_accounts`
- `post_publications`
- workspace-scoped RLS
- indexes and a unique post/account publication constraint

## Publishing

Real publishing is available from the Publishing page for connected accounts. The server validates:

- current user
- workspace membership
- workspace role
- post workspace
- social account workspace
- platform match

Per-account publication records preserve partial success/failure across platforms.

## Scheduling

`/api/cron/publish` processes due scheduled posts. It requires `SUPABASE_SERVICE_ROLE_KEY` and optionally `CRON_SECRET`, and is configured in `vercel.json`.

## Demo mode

When provider credentials are absent, the existing mock publishing simulator continues to work. Real credentials are not required to run the application.

## Required optional environment variables

See `.env.example`.

For production, generate a strong random `SOCIAL_TOKEN_ENCRYPTION_KEY` and keep it only in Vercel/Supabase server-side configuration.

## Verification status

Provider-independent TypeScript syntax was checked successfully. Full `npm run typecheck`, lint, and build could not be completed in the execution environment because dependency installation timed out/incomplete. Real social API flows require valid developer credentials and were not claimed as verified.
