# Contributing to Echo Buddha

Echo Buddha uses proportionate governance: objective regressions block, while subjective editorial risks remain visible for human review.

## Setup

Use Node 22 and npm 10. Install exactly from the lockfile:

```bash
npm ci
```

Create work on a scoped branch such as `content/...`, `fix/...`, `ux/...`, `trust/...`, `hardening/...`, `governance/...`, or `release/...`. Codex-created branches use the `codex/` prefix. Do not work directly on `main` for meaningful changes.

## Required validation

Run the deterministic release gate before review:

```bash
npm run validate:release
```

Run browser validation for consent, Analytics, navigation, Search, accessibility or user-journey changes:

```bash
npm run audit:browser
```

Run Lighthouse for layout, runtime, dependency, asset or performance-sensitive work:

```bash
npm run audit:lighthouse
```

Lighthouse is regression evidence, not a brittle perfect-score requirement. Automated accessibility is not a claim of complete accessibility.

## Content changes

For an existing-page refresh, preserve its role, URL, owner, index state, canonical, sources and safety unless an explicit reviewed decision says otherwise.

Before adding an indexable page, answer the approval questions in `governance/indexable-page-approvals.json`: user need, reader, nearest existing page, why that page should not be improved instead, unique value, ownership, sources, safety, index intent, monetization review, next step, and independent value without Search or ads.

Potential overlap, structural similarity, thinness or source-density concerns are human-review warnings. They are not automatically treated as proof of low quality. Exact duplication, invalid source references and objective index/route failures block.

## High-sensitivity changes

Changes involving ads, consent, Analytics, privacy, security headers, publisher/author identity, source registries, safety components, URLs, canonicals, redirects or index state require an explicit PR explanation and the applicable regression tests.

AdSense runtime and manual slots remain disabled. Do not enable them, Auto ads, or submit an AdSense review as part of ordinary repository work.

## Review and merge

Use the pull-request template. A solo maintainer may self-review after CI passes; do not pretend a second reviewer exists. Branch protection and required checks depend on GitHub plan/settings and must not be claimed unless verified.

Prefer a scoped squash merge for feature/content branches when it preserves a clear review trail. Emergency work uses the smallest safe branch, runs the deterministic gate, documents the exception, deploys only with explicit authorization, and completes smoke/full validation immediately afterward.

## Deployment boundary

Production deployment is never implied by a code change or merge. The manual production workflow accepts only the full SHA that exactly equals current `origin/main`, validates and builds it once, deploys that artifact under production concurrency, and runs smoke checks. Deployment requires separately configured environment secrets and owner authorization.

Never commit `.env`, `.dev.vars`, tokens, cookies, auth headers or owner account exports. Public GA and AdSense client identifiers are not deployment secrets.
