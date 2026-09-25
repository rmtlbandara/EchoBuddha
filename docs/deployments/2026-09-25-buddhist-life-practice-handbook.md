# Echo Buddha Production Deployment Record — Buddhist Life & Practice Handbook

- Deployment timestamp (UTC): 2026-09-25T12:33:06.600901Z
- Deployment timestamp (Asia/Colombo): 2026-09-25T18:03:06.600901+05:30
- Git SHA (full 40 characters): `720a3a45cc975d48bc3445f84c674045fb155b47`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/36
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36130662778 (`36130662778`) — release validation and browser/consent validation passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36135436890 (`36135436890`) — exact-SHA validation, immutable artifact deployment, metadata capture, and production smoke passed
- Superseded failed workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36130916562 (`36130916562`) — immutable artifact validation passed; deployment stopped before any production change because `CLOUDFLARE_API_TOKEN` was absent
- Deployment method: governed GitHub production workflow using the exact hosted immutable artifact from current `origin/main`
- Immutable release artifact: 416 files; aggregate SHA-256 `120ec7158082aa6cbeb8bc13f08081c7b4e3a27d203dde18aac26dfa3ad80d5d`
- Cloudflare deployment ID: `be69fdc7-e6f6-4eea-bd0b-de13aff3afe3`
- Cloudflare version ID: `c68f658a-5243-444e-978c-5d31d4ce9c7e`
- Cloudflare traffic allocation: 100%
- Production URL: https://echobuddha.com
- Handbook hub: https://echobuddha.com/learn/buddhist-handbook/
- Release categories: content / indexing / UX / trust / technical / governance
- Changed page families/components: Buddhist handbook hub and eight chapters; Home and Learn discovery; internal search; sitemap; canonical metadata; structured data; source-coverage records; responsive handbook artwork
- Deterministic release validation: PASS
- Browser validation: PASS — hosted browser/consent validation passed; pre-release axe audit found zero violations on the handbook hub and final chapter at mobile and desktop sizes
- Lighthouse evidence: PASS — homepage mobile and desktop Performance 100 and Accessibility 100 in pre-release validation
- Source coverage: PASS — 119/119 primary-source paragraphs accounted for; both supplied DOCX inputs verified identical
- Production smoke: PASS — 14/14 governed checks; 164/164 sitemap URLs and 329/329 search records
- Handbook-specific live verification: PASS — 9/9 routes return HTTP 200 with self-canonicals, H1s, JSON-LD, and no ad runtime; all routes are present in sitemap and search; AVIF and WebP artwork return the correct image content types
- Previous last-known-good Git SHA: `575cbae92cdd158c6c7ca4459029847ae91d845c`
- Previous last-known-good Cloudflare deployment ID: `b7f871c0-b8bd-41b8-a56e-96b0ae9b06da`
- Previous last-known-good Cloudflare version ID: `88915d8a-ae51-4ecb-9a54-099c7e7143c7`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `88915d8a-ae51-4ecb-9a54-099c7e7143c7`; otherwise fix forward from the deployed SHA.
- Known issue: the scoped Cloudflare account token expires on 2027-09-26 and must be rotated in the GitHub `production` environment before that date.
- Credential handling: a one-year account-owned token limited to Workers Scripts Write and Account Settings Read was stored as the protected GitHub environment secret `CLOUDFLARE_API_TOKEN`. No secret value was committed or retained in the local clipboard.
- Owner approval/reference: the project owner explicitly requested production/live deployment with the correct governed steps.

## Live verification

- The handbook hub and all eight chapters return HTTP 200 at their canonical production URLs.
- Every handbook page has a self-referencing canonical, an H1, and JSON-LD structured data.
- The handbook family remains outside the advertising runtime; no AdSense script or slot was found on any handbook route.
- All nine handbook URLs are present in the production sitemap and internal search index.
- The handbook AVIF and WebP hero assets return HTTP 200 with `image/avif` and `image/webp` content types.
- The governed smoke suite passed consent, publisher verification, CSP and baseline security headers, robots, sitemap, canonical ownership, noindex, search, `ads.txt`, 404, HTTPS redirect, and preview-noindex checks.

The artifact was built once in GitHub Actions, verified against the release SHA and every file digest, deployed unchanged to Cloudflare, and verified after publication. No Search Console indexing request, Ads/Analytics change, CMP change, or manual ad enablement was performed.
