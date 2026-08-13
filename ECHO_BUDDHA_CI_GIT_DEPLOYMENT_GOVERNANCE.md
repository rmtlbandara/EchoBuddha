# Echo Buddha CI, Git and Deployment Governance

Version: 1.0.0

Effective date: 2026-08-13

Owner: Echo Buddha repository owner

## Governing principle

The safe path should be easy and the unsafe path difficult. Repository automation blocks objective, reproducible regressions. Editors and the owner retain judgment over semantic overlap, voice, information gain and other contextual quality decisions.

This document complements `ECHO_BUDDHA_SEO_CONTENT_UX_GOVERNANCE.md` and the Phase 0-8 protection registers. When historical evidence conflicts with the current Phase 9 baseline, the current baseline and latest phase report govern future delivery.

## Gate model

Blocking deterministic controls include clean build/typecheck/lint/tests, broken links, invalid JSON-LD, noindex or unknown URLs in sitemap, unapproved protected URL/index/canonical changes, missing or conflicting primary owners, invalid trust identities, missing safety/trust routes, AdSense runtime or manual-slot activation, consent-default regression, weakened repository headers, high/critical dependency advisories, unsafe workflow permissions/triggers, mutable Action references, non-traceable deployment and failed production smoke checks.

Warning controls include likely topic overlap, repetitive structure, unusual thinness, source-density concern and broad changes to content, trust, safety, indexing, AdSense/privacy or delivery files. Warnings require review but do not fail solely on an arbitrary score.

Informational evidence includes Lighthouse details, external source availability, GitHub/Cloudflare dashboard settings and Phase 10 field measurements.

## Change model

Meaningful work follows branch -> local validation -> pull request -> hosted CI -> owner review -> merge -> separately authorized production deployment. Trivial typo fixes still build and validate but do not require irrelevant editorial paperwork.

New indexable URLs require a complete record in `governance/indexable-page-approvals.json`. Removed URLs, index-state changes, canonical changes, redirects, primary-owner changes and protected-file policy changes require `governance/release-change-approvals.json`. These files make intent reviewable; they do not replace human review.

## CI

`.github/workflows/validate.yml` provides stable `Release validation` and `Browser and consent validation` jobs for pull requests and `main`. It has read-only repository permission, immutable Action SHAs, deterministic `npm ci`, timeouts and superseded-PR cancellation.

`.github/workflows/extended-validation.yml` runs browser and Lighthouse evidence manually and monthly. Performance scores are recorded without turning one noisy run into an arbitrary perfect-score blocker.

`.github/workflows/production-smoke.yml` checks the exact public host weekly and on demand. It is monitoring, not proof that a particular repository commit is deployed.

## GitHub Actions security

Validation never uses `pull_request_target`, production secrets or repository write permission. Workflow actions are pinned to verified full commit SHAs and annotated with their represented version. Dependabot may propose updates, but updates still require CI and review.

Do not interpolate pull-request titles, branch names, issue bodies or other untrusted event payloads directly into shell commands. Pass controlled values through environment variables and validate them before use. Do not use `eval` or print complete environments.

## Production deployment

The selected model is manual production deployment after merge. The deploy workflow accepts a lowercase 40-character SHA only when it equals the current `origin/main` SHA. The SHA is checked before validation and again immediately before deploy, preventing a queued older release from overwriting a newer `main`.

Transition warning: the Phase 9 merge proved that a pre-existing Cloudflare Git integration still builds and deploys every `main` merge independently of the governed workflow. Until the owner disables that automatic production trigger and completes the GitHub `production` environment, a `main` merge can reach production before all post-merge checks finish. Treat the manual workflow as the target model, not the exclusive live path, until the external cutover is verified.

The validation job builds once, creates per-file SHA-256 evidence, and uploads an artifact named with SHA and workflow run ID. The deployment job verifies every digest and deploys that exact `dist`, not a rebuild. Production jobs share `echobuddha-production` concurrency with `cancel-in-progress: false`.

Only the deploy step receives `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. They must be stored as production-environment secrets and scoped to the single required Cloudflare account/Worker. Current repository settings do not yet contain these secrets or a production environment.

## Production verification and failure

Every deployment runs `npm run audit:production-smoke` against `https://echobuddha.com`. A failure leaves the workflow red and requires the owner to decide between rollback and fix-forward. Automatic rollback is intentionally not used because a bad test or misunderstood external state should not trigger another production mutation.

Use rollback for an unusable site, security/privacy critical regression or severe delivery failure. Prefer a normal correction/fix-forward for typos and non-critical editorial issues. See `docs/deployments/ROLLBACK_RUNBOOK.md`.

## Last known good and records

Last known good means a recorded Cloudflare version tied to a Git SHA whose post-deploy smoke passed. It is not assumed to be `main~1`. Deployment evidence is retained as a 90-day workflow artifact; durable repository records use `docs/deployments/DEPLOYMENT_RECORD_TEMPLATE.md` through an explicit reviewed follow-up, never an automated recursive commit.

## Environments

- Development: local host; no production Analytics or AdSense runtime; not indexable externally.
- Preview: optional versioned workers.dev URL; `X-Robots-Tag: noindex, nofollow`; no AdSense runtime; avoid production Analytics pollution.
- Production: `https://echobuddha.com`; exact canonical; consent-gated Analytics; AdSense runtime/manual slots off; source-controlled headers plus external Cloudflare settings.

Preview uploads are external deployments and require authorization. Phase 9 does not create one.

## Dependencies and artifacts

Node 22, npm 10 and lockfile v3 are authoritative. CI uses `npm ci`. Weekly bounded Dependabot updates cover npm and GitHub Actions. Major updates never auto-merge or auto-deploy.

Compact current governance JSON/CSV may be committed. Transient browser, Lighthouse, deployment and logs belong in `.artifacts/` or workflow artifacts. Do not commit `node_modules`, `dist`, cookies, auth headers, secret values or account screenshots.

## External settings

Repository code cannot enforce GitHub plan features, branch rules, required checks, environment review rules, action policies, security alerts, Cloudflare token scope or Cloudflare Git build triggers. `phase-9-external-github-cloudflare-settings.csv` and `phase-9-owner-action-items.csv` are the truthful owner queue. No setting is considered active until verified.

## Emergency path

1. Create an `emergency/...` or `fix/...` branch.
2. Make the smallest safe correction.
3. Run `npm run validate:release` and applicable targeted checks.
4. Record why the emergency path is justified.
5. Merge/deploy only with owner authorization.
6. Run production smoke immediately.
7. Complete any deferred extended validation and durable incident/deployment record.

Emergency is not a routine bypass and never authorizes secrets, AdSense activation or unreviewed arbitrary-SHA deployment.
