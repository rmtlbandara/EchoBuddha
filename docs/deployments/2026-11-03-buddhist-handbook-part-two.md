# Echo Buddha Production Deployment Record — Buddhist Handbook Part II

- Deployment timestamp (UTC): 2026-11-03T09:56:29.331748Z
- Deployment timestamp (Asia/Colombo): 2026-11-03T15:26:29.331748+05:30
- Git SHA: `d6c412da99f54786e4ec7a6bb9563e61cd90671f`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/82
- PR validation: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41614307388 — release validation and browser/consent validation passed
- Production workflow: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41614901044 — exact-main validation, immutable artifact verification, deployment, smoke, IndexNow, and evidence upload passed
- Immutable artifact: 834 files; aggregate SHA-256 `34845183705429dfd8443f54a97d1689d06d656da8699532a37981dd629de590`
- Cloudflare deployment ID: `8633fdde-cb1b-4cac-a9bb-59a8d3f6f65b`
- Cloudflare version ID: `100e9335-3076-4326-9432-1ebca47f1b37`
- Traffic allocation: 100%
- Production URL: https://echobuddha.com/learn/buddhist-handbook/
- Production smoke: PASS — 15/15
- IndexNow: HTTP 200 accepted 16 changed canonical notifications; this is not an indexing guarantee
- Rollback version: `5c42e7f9-2d0f-4cf9-a1d1-fe14a5b31071` remains the previous last-known-good Cloudflare version if a severe regression is confirmed
- Rollback decision: not required

## Live verification

- `/release.json` serves the exact merged-main SHA above.
- The handbook hub and twelve chapters return HTTP 200, use self-canonicals, remain `index, follow`, expose one H1, emit expected hub/Article and breadcrumb schema, and contain no ad runtime or slots.
- All 13 handbook URLs occur exactly once in the production sitemap and local search index; the full live totals are 171 sitemap URLs and 336 search records.
- All 16 new Part II AVIF/WebP variants return HTTP 200 with image MIME types.
- Home and Learn expose the completed two-part, twelve-chapter handbook.
- The Right Livelihood owner contains the AN 5.177 five-trades treatment; the respect owner contains the later Theravāda three-cetiya treatment.
- Live responsive browser QA confirmed readable breadcrumbs, intact chapter navigation, one H1, loaded imagery, no horizontal overflow, no broken images, and no ad slots.
- Hosted browser readiness, accessibility, Lighthouse, consent, dependency, content, SEO, source, governance, and historical-boundary gates passed before deployment.

The source DOCX remained authoritative and was fully audited: 119/119 non-empty paragraphs plus all 12 supplied photograph pages were accounted for. No Search Console indexing request, AdSense review submission, advertising activation, analytics-consent change, or unsupported account-state claim was made.
