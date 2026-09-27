# Echo Buddha Production Deployment Record — Domain Email Migration

- Deployment timestamp (UTC): 2026-09-27T17:38:45.018336Z
- Deployment timestamp (Asia/Colombo): 2026-09-27T23:08:45.018336+05:30
- Git SHA (full 40 characters): `29deac1469a1b20cfa270a41b40572cdd8cdc3f0`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/45
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36337394986 — release validation and browser/consent validation passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36337621587 — exact-SHA validation, immutable artifact deployment, metadata capture, and production smoke passed
- Deployment method: governed GitHub production workflow using the exact hosted immutable artifact from current `origin/main`
- Immutable release artifact: 801 files; aggregate SHA-256 `01186152d9eb4fc9feb6e5f3499f4201fa3d59d674a571d4b14721bf406eaa3d`
- Deployment evidence artifact: `production-deployment-29deac1469a1b20cfa270a41b40572cdd8cdc3f0-36337621587`; artifact SHA-256 `7ecbc749a699e82f08bc6cbad4c2986a741fba1e6ea384caeaad180c376c1e87`
- Cloudflare deployment ID: `78c0719a-631c-415b-b48a-243abb97bd44`
- Cloudflare version ID: `1d62ac59-b2b3-4073-92a3-9a15aaf8f62d`
- Cloudflare traffic allocation: 100%
- Production URL: https://echobuddha.com
- Release categories: contact / editorial trust / legal / privacy / SEO / governance
- Changed page families/components: Contact, About, Editorial Policy, Corrections, Privacy Policy, Terms of Use, publisher contact schema, trust-content audits, and regression tests
- Deterministic release validation: PASS — 350 static pages, 48 article image identities, 384 image assets, 47/47 tests, and all Phase 8–13 release gates passed
- Browser validation: PASS — hosted browser/consent validation passed after the deterministic release gate
- Local Lighthouse readiness: PASS
- Workflow production smoke: PASS — 14/14 governed checks
- Independent post-deployment verification: PASS — 6/6 affected routes return HTTP 200 with self-canonical URLs, expected domain email links, no legacy Gmail address, and no AdSense runtime
- Previous last-known-good Git SHA: `b149ee312eae981fcff58b6fc74b1c09a36bbae3`
- Previous last-known-good Cloudflare deployment ID: `83bef289-7eb3-4a7d-85ef-5ec16eeb950c`
- Previous last-known-good Cloudflare version ID: `1550bf4f-0c63-465d-ba0c-ba0fe021b3bd`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `1550bf4f-0c63-465d-ba0c-ba0fe021b3bd`; otherwise fix forward from the deployed SHA.
- Known issues: None identified in the release workflow, production smoke, or focused live email checks. Email delivery and inbox routing are external to this website deployment and were not changed by this release.
- Owner approval/reference: the project owner explicitly requested the domain email update and deployment to production/live using the correct governed steps.

## Live verification

- `/contact/` and `/about/` expose both `mailto:info@echobuddha.com` and `mailto:support@echobuddha.com`.
- `/editorial-policy/` exposes `mailto:info@echobuddha.com` for editorial contact.
- `/corrections/` and `/terms-of-use/` expose both domain email addresses for their documented purposes.
- `/privacy-policy/` exposes `mailto:support@echobuddha.com` for privacy requests.
- All six affected routes return HTTP 200, are self-canonical, contain no `info.echobuddha@gmail.com` reference, and contain no AdSense delivery script.
- ContactPoint structured data remains scoped to the Contact and About pages, avoiding site-wide duplication across articles.
- Production security headers, consent behavior, publisher verification, `robots.txt`, sitemap, canonical ownership, noindex handling, internal search, `ads.txt`, 404 behavior, HTTPS redirect, and preview noindex behavior all passed.
- The production sitemap contains 164/164 expected URLs and internal search contains 329/329 expected items.

The artifact was built once in GitHub Actions, verified against the release SHA and every file digest, deployed unchanged to Cloudflare, and checked independently after publication. No email-provider routing, URL consolidation, Search Console indexing request, Analytics/CMP change, or ad enablement was performed.
