# Echo Buddha Production Deployment Record — Buddhist Handbook Refinement

- Deployment timestamp (UTC): 2026-09-26T15:28:52.935624Z
- Deployment timestamp (Asia/Colombo): 2026-09-26T20:58:52.935624+05:30
- Git SHA (full 40 characters): `13adfcadc0cf0c8e18d6c8bda70bd3ec51af588f`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/38
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36237700547 (`36237700547`) — release validation and browser/consent validation passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36252000112 (`36252000112`) — exact-SHA validation, immutable artifact deployment, metadata capture, and production smoke passed
- Deployment method: governed GitHub production workflow using the exact hosted immutable artifact from current `origin/main`
- Immutable release artifact: 801 files; aggregate SHA-256 `e297c1c01afd179c601499824022875be487d5ca176320d7c9834457050f5950`
- Cloudflare deployment ID: `8ff18ef6-c7e1-4556-b7cd-88d84c71f67b`
- Cloudflare version ID: `dccb37ee-bbc9-4fa8-a86e-50948486c201`
- Cloudflare traffic allocation: 100%
- Production URL: https://echobuddha.com
- Handbook hub: https://echobuddha.com/learn/buddhist-handbook/
- Release categories: content / indexing / UX / trust / technical / governance
- Changed page families/components: Buddhist handbook hub and eight chapters; Home and Learn discovery; sitemap and search records; source-layer explanations; page-specific responsive handbook artwork; image and structured-data metadata
- Deterministic release validation: PASS
- Browser validation: PASS — hosted browser/consent validation passed; live desktop and 390×844 mobile visual checks found no horizontal overflow, broken hero media, console errors, or navigation/reference defects
- Lighthouse evidence: PASS — pre-release handbook hub scored Performance 99 mobile and 100 desktop, Accessibility 100 on both; a representative chapter scored Performance 99 mobile and 100 desktop, Accessibility 100 on both
- Source coverage: PASS — 119/119 primary-source paragraphs accounted for; source DOCX SHA-256 `364d267f69523a837064036b4b73e569ec42c6ebaaed56be95ff13917631c995`
- Production smoke: PASS — 14/14 governed checks; 164/164 sitemap URLs and 329/329 search records
- Handbook-specific live verification: PASS — 9/9 routes return HTTP 200 with self-canonicals, one H1, correct robots directives, expected JSON-LD, and no ad runtime; all routes occur exactly once in sitemap and search; 36/36 referenced AVIF/WebP variants return HTTP 200 with the correct content type
- Previous last-known-good Git SHA: `22c7b210bed0a11afaba906bef027c8f90d32a67`
- Previous last-known-good Cloudflare deployment ID: `1e4aa0d0-d9a6-480f-b46b-998d3cef6c3e`
- Previous last-known-good Cloudflare version ID: `e961211f-34b4-41a9-b1f7-647bdade99d2`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `e961211f-34b4-41a9-b1f7-647bdade99d2`; otherwise fix forward from the deployed SHA.
- Known issues: None identified in the release or live handbook checks. Search Console had insufficient post-publication data to support an indexing or performance conclusion.
- Owner approval/reference: the project owner explicitly requested the refinement prompt be implemented and deployed to production/live using the correct steps.

## Live verification

- The handbook hub and all eight chapters return HTTP 200 at their canonical production URLs.
- Each page has exactly one H1, a self-referencing canonical, `index, follow, max-image-preview:large`, breadcrumb structured data, and the expected CollectionPage or Article schema.
- Open Graph images declare their actual 1600×900 dimensions; responsive sources expose 800-pixel and 1600-pixel AVIF and WebP variants.
- All 36 image variants referenced by the nine pages return HTTP 200 with `image/avif` or `image/webp` as appropriate.
- All nine handbook URLs occur exactly once in the production sitemap and internal search index.
- The homepage and Learn hub both link to the handbook.
- The handbook remains outside the advertising runtime; no AdSense delivery script or slot was found on any handbook route.
- Live desktop and mobile visual checks confirmed a coherent hierarchy, readable references, complete breadcrumbs and navigation, loaded media, no horizontal overflow, and no browser console warnings or errors.
- The governed smoke suite passed consent, publisher verification, CSP and baseline security headers, robots, sitemap, canonical ownership, noindex, search, `ads.txt`, 404, HTTPS redirect, and preview-noindex checks.

The artifact was built once in GitHub Actions, verified against the release SHA and every file digest, deployed unchanged to Cloudflare, and verified after publication. No Search Console indexing request, Ads/Analytics change, CMP change, or manual ad enablement was performed.
