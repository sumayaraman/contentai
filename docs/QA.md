# ContentAI QA Checklist

## Automated checks

Run after installing dependencies:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Critical user journey

- [ ] Register a new account
- [ ] Confirm/login
- [ ] Verify default workspace
- [ ] Create a draft post
- [ ] Edit and duplicate the post
- [ ] Generate AI content in Demo Mode
- [ ] Generate a Demo Mode image
- [ ] Save image to Media Library
- [ ] Attach image to a post
- [ ] Schedule a post
- [ ] View it on Calendar
- [ ] Simulate successful publishing
- [ ] Verify Published status and timestamp
- [ ] Verify demo analytics
- [ ] Open Analytics and Content Score

## Negative/security checks

- [ ] Unauthenticated users are redirected from protected routes
- [ ] Publishing is protected by authentication and workspace membership
- [ ] Workspace A cannot access Workspace B records
- [ ] MEMBER cannot perform OWNER team mutations
- [ ] ADMIN cannot change roles or remove members
- [ ] OWNER cannot be removed or demoted by ordinary membership actions
- [ ] Invalid post scheduling is rejected server-side
- [ ] Unsupported uploads are rejected server-side
- [ ] Oversized uploads are rejected server-side
- [ ] AI/image credentials are absent from client bundles
- [ ] Auth callback rejects external `next` redirects
- [ ] Private media cannot be fetched without authentication/workspace access

## Failure-mode checks

- [ ] AI provider unavailable → clear error/fallback where designed
- [ ] Image provider unavailable → clear error/fallback where designed
- [ ] Publishing simulation failure → FAILED status
- [ ] Publishing retry → PUBLISHED
- [ ] Empty workspace → useful empty states
- [ ] Database outage → error boundary/retry UI
