# Echo Buddha Production Deployment Record — Article Quality Refinement

- Deployment timestamp (UTC): 2026-09-27T10:06:24.116764Z
- Deployment timestamp (Asia/Colombo): 2026-09-27T15:36:24.116764+05:30
- Git SHA (full 40 characters): `fbb56662c9d39741fe0ecd56c3d97f4e04766bdb`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/40
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36298885168 (`36298885168`) — release validation and browser/consent validation passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36311390699 (`36311390699`) — exact-SHA validation, immutable artifact deployment, metadata capture, and production smoke passed
- Deployment method: governed GitHub production workflow using the exact hosted immutable artifact from current `origin/main`
- Immutable release artifact: 801 files; aggregate SHA-256 `f1c37437dbc424f1c84495c68c7c1013135c6b1d3e11601d00710a1c17d5d1b6`
- Cloudflare deployment ID: `0cc5d1ec-10e2-4470-b7f8-94f28fb11aa2`
- Cloudflare version ID: `8b64aa14-8a39-4084-96ff-b8ff615bdefe`
- Cloudflare traffic allocation: 100%
- Production URL: https://echobuddha.com
- Release categories: content / indexing / UX / trust / technical / governance
- Changed page families/components: eight August 5 articles; article source references; Learn link prose; responsive article artwork; article-audit tooling and evidence; patched Astro, Wrangler, and transitive dependencies
- Deterministic release validation: PASS — 350 static pages, 48 article image identities, 384 image assets, 41/41 tests, and all Phase 8–13 release gates passed
- Browser validation: PASS — hosted browser/consent validation and 38 desktop/mobile article-support viewport runs passed
- Lighthouse evidence: PASS — local pre-release Lighthouse readiness completed successfully
- Production smoke: PASS — 14/14 governed checks; 164/164 sitemap URLs and 329/329 search records
- Article-specific live verification: PASS — 8/8 priority routes return HTTP 200 with one H1, self-canonical Article metadata, `index, follow, max-image-preview:large`, original `datePublished` 2026-08-05, updated `dateModified` 2026-09-27, sitemap/search inclusion, responsive pictures, and no AdSense runtime
- Mindful Email image verification: PASS — all eight AVIF/WebP responsive and structured-data variants return HTTP 200; the production primary image SHA-256 matches the released file
- Previous last-known-good Git SHA: `13adfcadc0cf0c8e18d6c8bda70bd3ec51af588f`
- Previous last-known-good Cloudflare deployment ID: `8ff18ef6-c7e1-4556-b7cd-88d84c71f67b`
- Previous last-known-good Cloudflare version ID: `dccb37ee-bbc9-4fa8-a86e-50948486c201`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `dccb37ee-bbc9-4fa8-a86e-50948486c201`; otherwise fix forward from the deployed SHA.
- Known issues: None identified in the release workflow, production smoke, or focused live article checks. No post-release Search Console indexing or ranking conclusion is claimed.
- Owner approval/reference: the project owner explicitly requested the completed article-quality refinement be deployed to production/live using the correct governed steps.

## Live verification

- All eight priority article URLs return HTTP 200 with exactly one H1, a self-referencing canonical, indexable robots directives, and Article structured data.
- Visible and structured publication dates remain 2026-08-05; structured modification dates are 2026-09-27.
- All eight routes occur in the production sitemap and internal search index.
- Responsive `<picture>` output is present on every priority page, and all eight new Mindful Email image variants return HTTP 200.
- The production Mindful Email primary WebP is 66,288 bytes and has SHA-256 `8e9a34911c1d937a40635471fa8f3b37570eba181487bff4900ffae9bd53f662`, matching the release workspace.
- No AdSense delivery script was found on any of the eight priority pages.
- The governed smoke suite passed consent, publisher verification, CSP and baseline security headers, robots, sitemap, canonical ownership, noindex handling, search, `ads.txt`, 404 behavior, HTTPS redirect, and preview noindex checks.

The artifact was built once in GitHub Actions, verified against the release SHA and every file digest, deployed unchanged to Cloudflare, and independently checked after publication. No URL consolidation, Search Console indexing request, Analytics/CMP change, or manual ad enablement was performed.
