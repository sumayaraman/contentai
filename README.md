# ContentAI

An AI-powered social media content planning SaaS built with Next.js, Supabase, and TypeScript. ContentAI helps small businesses, content creators, social media managers, and marketing agencies plan, generate, schedule, and analyse social media content — all in one workspace.

---

## Features

- **AI Content Studio** — Generate structured social posts (hook, caption, CTA, hashtags, image prompt) using OpenAI, Anthropic, Groq, or the built-in demo mode
- **AI Campaign Generator** — Create multi-day content campaigns with per-day regeneration and one-click calendar export
- **AI Image Generation** — Turn image prompts into media assets stored in your workspace (OpenAI or demo mock)
- **Content Calendar** — Monthly and weekly views with drag-and-drop rescheduling and status indicators
- **Posts Management** — Full CRUD with search, filters, categories, platform selection, and draft/schedule workflows
- **Media Library** — Upload, store, and attach images to posts; workspace-isolated with private Supabase Storage
- **Social Publishing** — Demo publishing plus optional OAuth connections for Instagram, Facebook, LinkedIn, and X
- **Analytics Dashboard** — Engagement metrics, platform performance, category performance, and best-performing content
- **Content Intelligence** — AI-powered 0–100 content scoring with recommendations; deterministic fallback when no AI key is configured
- **Workspace & Team** — Multi-workspace support with OWNER / ADMIN / MEMBER roles and server-enforced authorization
- **Demo Mode** — The entire application works without any AI or social API keys

---

## Screenshots

> Add screenshots here after your first deployment.

| Dashboard | AI Studio | Calendar |
|-----------|-----------|----------|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

| Posts | Analytics | Publishing |
|-------|-----------|------------|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI (text) | OpenAI / Anthropic / Groq / Mock |
| AI (image) | OpenAI gpt-image-1 / Mock SVG |
| Social | Mock publisher + optional Meta / LinkedIn / X APIs |
| Deployment | Vercel |

---

## Architecture

```
Browser
  │
  ├── Next.js Middleware (middleware.ts)
  │     JWT validation via getClaims()
  │     Redirect unauthenticated → /login
  │     Redirect authenticated away from auth pages
  │
  ├── App Router Pages (Server Components)
  │     Fetch data server-side
  │     Pass to Client Components as props
  │
  ├── Server Actions / API Routes
  │     Input validation (server-side)
  │     Authorization (getActiveWorkspace + requireWorkspaceRole)
  │     Supabase queries with workspace scoping
  │
  └── Service Layer
        AI providers (ai/)
        Publishing (lib/publishing/)
        Analytics (lib/analytics/)
        Intelligence / scoring (lib/intelligence/)
```

### AI Provider Abstraction

```
getAIProvider()
  ├── MockAIProvider      — always available, no key required
  ├── OpenAIProvider      — requires OPENAI_API_KEY
  ├── AnthropicProvider   — requires ANTHROPIC_API_KEY
  └── GroqProvider        — requires GROQ_API_KEY
```

### Image Provider Abstraction

```
getImageProvider()
  ├── MockImageProvider    — returns SVG data URI, always available
  └── OpenAIImageProvider  — requires OPENAI_API_KEY
```

### Social Publisher Abstraction

```
getSocialPublisher()
  └── MockSocialPublisher  — simulates publish/schedule/delete
```

---

## Database Schema

Eleven migrations (applied in order) build the full schema:

| Migration | Purpose |
|-----------|---------|
| `001_foundation` | users, workspaces, workspace_members, posts, analytics, categories, RLS |
| `002_content_management` | hashtags, media table, default categories, Storage bucket |
| `003_calendar_scheduling` | Scheduling indexes |
| `004_ai_campaigns` | campaigns, campaign_days, workspace guards |
| `005_ai_image_generation` | media AI columns, mime type constraints |
| `006_workspace_team` | ai_provider column, owner-protection trigger, team RLS |
| `007_demo_social_publishing` | publishing_events, analytics insert policy |
| `008_production_security` | Private storage bucket, post creator immutability trigger, refined post RLS |
| `009_fix_media_file_size` | Raises media file_size constraint from 5 MB to 10 MB |
| `010_real_social_integrations` | Social account OAuth credentials, per-account publication records, RLS |

Key design decisions:
- All tables have RLS enabled with workspace-scoped policies
- `is_workspace_member()` and `is_workspace_admin()` are security-definer helper functions
- Owner demotion and removal are blocked by a `BEFORE UPDATE OR DELETE` trigger
- Post creator is immutable after insertion (trigger + RLS)
- Cross-workspace campaign day insertion is blocked by a workspace guard trigger

---

## Authentication

Supabase Auth handles registration and login. On registration, a database trigger (`handle_new_user`) automatically:
1. Creates a `users` record
2. Creates a default workspace named "Demo Marketing Studio"
3. Creates a default set of content categories
4. Assigns the new user as `OWNER` of the workspace

Session management uses `@supabase/ssr` with cookie-based sessions and `getClaims()` in middleware for fast JWT validation without a network round-trip.

---

## Authorization Model

Every server action and API route goes through layered authorization:

```
1. Middleware — JWT must be valid
2. getActiveWorkspace() — user must belong to a workspace
3. requireWorkspaceRole() — role must match allowed list (for team ops)
4. .eq("workspace_id", workspaceId) — all queries are workspace-scoped
5. RLS policies — second enforcement layer in the database
6. DB triggers — third layer (owner protection, creator immutability)
```

Role capabilities:

| Action | OWNER | ADMIN | MEMBER |
|--------|-------|-------|--------|
| View content | ✓ | ✓ | ✓ |
| Create / edit posts | ✓ | ✓ | ✓ |
| Delete posts | ✓ | ✓ | ✓ |
| Manage categories | ✓ | ✓ | ✓ |
| Edit workspace settings | ✓ | ✓ | — |
| Change AI provider | ✓ | ✓ | — |
| Manage team members | ✓ | — | — |
| Remove members | ✓ | — | — |
| Change member roles | ✓ | — | — |

---

## Demo Mode

ContentAI is fully functional without any paid API keys. In demo mode:

- AI content generation returns realistic placeholder content
- AI image generation returns an SVG placeholder
- Social publishing simulates success/failure flows
- Analytics shows deterministic mock metrics

Demo mode is indicated by a badge in the relevant UI sections.

---

## Installation

### Prerequisites

- Node.js ≥ 20.9
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url> contentai
cd contentai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here

# Optional — ContentAI uses Demo Mode without these
AI_PROVIDER=auto
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
IMAGE_PROVIDER=auto
```

### 3. Apply database migrations

In your Supabase project dashboard, go to **SQL Editor** and run each migration file in `supabase/migrations/` in numeric order:

```
202609010001_foundation.sql
202609010002_content_management.sql
202609010003_calendar_scheduling.sql
202609010004_ai_campaigns.sql
202609010005_ai_image_generation.sql
202609010006_workspace_team.sql
202609010007_demo_social_publishing.sql
202609010008_production_security.sql
202609010009_fix_media_file_size.sql
```

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db push
```

### 4. Configure Supabase Auth

In your Supabase project dashboard:
1. Go to **Authentication → URL Configuration**
2. Add Site URL: `http://localhost:3000`
3. Add Redirect URL: `http://localhost:3000/auth/callback`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Your Supabase publishable (anon) key |
| `AI_PROVIDER` | No | `auto` (default), `mock`, `openai`, `anthropic`, `groq` |
| `OPENAI_API_KEY` | No | Enables OpenAI text and image generation |
| `OPENAI_MODEL` | No | Default: `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | No | Enables Anthropic Claude text generation |
| `ANTHROPIC_MODEL` | No | Default: `claude-3-5-haiku-latest` |
| `GROQ_API_KEY` | No | Enables Groq text generation |
| `GROQ_MODEL` | No | Default: `llama-3.3-70b-versatile` |
| `IMAGE_PROVIDER` | No | `auto` (default) or `mock` |
| `OPENAI_IMAGE_MODEL` | No | Default: `gpt-image-1` |

> **Security:** Never commit `.env.local`. It is in `.gitignore`. The `SUPABASE_SERVICE_ROLE_KEY` is never used — all server actions use the user's auth session.

---

## Supabase Setup Details

### Storage bucket

Migration 007 creates the `media` storage bucket. Migration 008 sets it to **private** with a 10 MB file limit and restricts MIME types to `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`.

Images are served through the application's `/api/media/[id]` route, which issues short-lived signed URLs after verifying authentication.

### Storage policies

The `media` bucket uses RLS through the `public.media` table. The application never issues permanent public URLs for workspace media.

---

## AI Provider Setup

### OpenAI

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Set `OPENAI_API_KEY` in `.env.local`
3. Optionally set `OPENAI_MODEL` (default `gpt-4o-mini`)
4. For image generation, ensure your key has access to `gpt-image-1`

### Anthropic

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Set `ANTHROPIC_API_KEY` in `.env.local`
3. Optionally set `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`)

### Groq

1. Get an API key from [console.groq.com](https://console.groq.com)
2. Set `GROQ_API_KEY` in `.env.local`
3. Optionally set `GROQ_MODEL` (default `llama-3.3-70b-versatile`)

### Selecting a provider

Set `AI_PROVIDER` to `auto` (tries OpenAI → Anthropic → Groq → Mock in order of key availability), or explicitly name one provider.

---

## Vercel Deployment

1. Push your repository to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in the Vercel project settings
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `.next` (default)
6. Deploy

After deployment:
1. Copy your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
2. In Supabase → **Authentication → URL Configuration**:
   - Add Site URL: `https://your-app.vercel.app`
   - Add Redirect URL: `https://your-app.vercel.app/auth/callback`

---

## Security

- **Service role key is server-only** — Phase 11 uses the Supabase service role key only for the protected scheduled-publishing cron job; it is never exposed to browser code. Normal user-facing database access still uses the authenticated user session.
- **Server-side secrets** — AI provider API keys are only ever read in server actions. They are never sent to the browser.
- **RLS on every table** — All tables have Row Level Security enabled. Cross-workspace data access is prevented at the database level.
- **Workspace isolation** — Every query is scoped with `.eq("workspace_id", workspaceId)`. RLS enforces the same boundary independently.
- **Owner protection** — A database trigger prevents the workspace owner from being removed or demoted, even if application code attempts it.
- **Post creator immutability** — A database trigger prevents the `created_by` field from being changed after insertion.
- **Open redirect protection** — The `next=` redirect parameter is validated against a strict allow-list before use.
- **Private media storage** — The `media` bucket is private. Images are served through a signed URL endpoint that requires authentication.
- **CSRF** — Next.js Server Actions include built-in CSRF protection.
- **Security headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, and `Permissions-Policy` are set for all routes.

---

## Known Limitations

- **Real social APIs are optional** — Phase 11 adds OAuth and server-side publishing adapters, but each platform still requires its own developer application, permissions, account eligibility, and valid production credentials. Real provider status is not verified in this environment.
- **No team invitations** — Team members must be added directly to the database. An invitation flow (email-based) is not yet implemented.
- **Single image provider** — Only OpenAI's `gpt-image-1` is implemented as a real image provider. Other providers (Replicate, Stability AI) are not yet supported.
- **Demo analytics** — Analytics are deterministic mock data derived from post IDs. Real social API analytics integration does not exist.
- **No billing** — There is no subscription, billing, or usage limit system.

---

## Future Improvements

- Email-based team invitations
- Real social API integrations (starting with OAuth flows)
- Real-time analytics from social platforms
- Workspace billing and plan limits
- Post scheduling queue and actual delivery (cron / webhook)
- Additional AI image providers (Replicate, Stability AI)
- Playwright E2E test suite
- Storybook component library
- 
