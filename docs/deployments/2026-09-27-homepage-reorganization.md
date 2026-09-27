# Echo Buddha Production Deployment Record — Homepage Reorganization

- Deployment timestamp (UTC): 2026-09-27T13:17:38.918467Z
- Deployment timestamp (Asia/Colombo): 2026-09-27T18:47:38.918467+05:30
- Git SHA (full 40 characters): `b149ee312eae981fcff58b6fc74b1c09a36bbae3`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/43
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36321659580 — release validation and browser/consent validation passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36321815734 — exact-SHA validation, immutable artifact deployment, metadata capture, and production smoke passed
- Deployment method: governed GitHub production workflow using the exact hosted immutable artifact from current `origin/main`
- Immutable release artifact: 801 files; aggregate SHA-256 `46ecefa934f529eee22e4b3a558ab346b064f500cdcb00e6d831bb74098718b7`
- Cloudflare deployment ID: `83bef289-7eb3-4a7d-85ef-5ec16eeb950c`
- Cloudflare version ID: `1550bf4f-0c63-465d-ba0c-ba0fe021b3bd`
- Cloudflare traffic allocation: 100%
- Production URL: https://echobuddha.com
- Release categories: homepage / UX / SEO / performance / trust / governance
- Changed page families/components: homepage; homepage use of article cards; homepage and bounded-question regression tests
- Deterministic release validation: PASS — 350 static pages, 48 article image identities, 384 image assets, 46/46 tests, and all Phase 8–13 release gates passed
- Browser validation: PASS — hosted browser/consent validation passed after the deterministic release gate
- Local Lighthouse evidence: PASS — mobile and desktop category scores were 100/100/100/100 before release
- Workflow production smoke: PASS — 14/14 governed checks
- Independent post-deployment smoke: PASS — 14/14 governed checks
- Homepage live verification: PASS — HTTP 200, title `Buddhist Wisdom, Learning & Meditation | Echo Buddha`, one H1 `Buddhist Wisdom for Everyday Life`, no `FAQPage` schema, and no AdSense runtime
- Previous last-known-good Git SHA: `fbb56662c9d39741fe0ecd56c3d97f4e04766bdb`
- Previous last-known-good Cloudflare deployment ID: `0cc5d1ec-10e2-4470-b7f8-94f28fb11aa2`
- Previous last-known-good Cloudflare version ID: `8b64aa14-8a39-4084-96ff-b8ff615bdefe`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `8b64aa14-8a39-4084-96ff-b8ff615bdefe`; otherwise fix forward from the deployed SHA.
- Known issues: The pre-existing Cloudflare Web Analytics beacon/CSP browser-console warning remains outside this homepage release. No post-release Search Console indexing, ranking, or AdSense approval conclusion is claimed.
- Owner approval/reference: the project owner explicitly requested that the completed homepage reorganization be deployed to production/live using the correct governed steps.

## Live verification

- The homepage returns HTTP 200 with exactly one descriptive H1 and the intended SEO title.
- The homepage remains self-canonical and indexable, while sitemap, robots, redirect, and URL ownership behavior remain unchanged.
- Global `WebSite` and `Organization` entities remain; the removed homepage `FAQPage` does not appear in live HTML.
- Consent UI remains affirmative-choice based.
- AdSense publisher verification remains present while runtime scripts and manual ad slots remain disabled.
- Production security headers, `robots.txt`, sitemap, primary owner route, representative noindex route, internal search, `ads.txt`, 404 behavior, HTTPS redirect, and preview noindex behavior all passed.
- The production sitemap contains 164/164 expected URLs and internal search contains 329/329 expected items.

The artifact was built once in GitHub Actions, verified against the release SHA and every file digest, deployed unchanged to Cloudflare, and checked independently after publication. No URL consolidation, Search Console indexing request, Analytics/CMP change, or ad enablement was performed.
