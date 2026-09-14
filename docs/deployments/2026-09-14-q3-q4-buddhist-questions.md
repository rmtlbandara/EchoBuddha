# Echo Buddha Production Deployment Record — Q3 + Q4 Buddhist Questions

- Deployment timestamp (UTC): 2026-09-14T03:44:54.812871Z
- Deployment timestamp (Asia/Colombo): 2026-09-14T09:14:54.812871+05:30
- Git SHA (full 40 characters): `42b853b1b67e3c9b3145e55b1d42374f35e34719`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/24
- Post-merge validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/34803356074
- Production workflow run URL/ID: https://github.com/rmtlbandara/EchoBuddha/actions/runs/34803556826 (`34803556826`)
- Cloudflare deployment ID: `47303d8a-1941-42c2-a02c-db510473d05f`
- Cloudflare version ID: `9e196159-656a-490a-8e18-b0ecfab80a2e`
- Production URL: https://echobuddha.com
- Release categories: content / indexing / trust / technical / governance / dependency security
- Changed page families/components: Questions About Buddhism Q3/Q4 Learn details; Q1–Q4 navigation; per-question publication dates; sitemap; internal search; indexable-page approvals; conservative monetization registry; historical-boundary validation; targeted browser validation; patched build/deployment dependencies
- Deterministic release validation: PASS
- General browser and consent validation: PASS
- Targeted Q1–Q4/hub browser matrix: PASS — 15/15 route/viewport combinations; zero critical/serious axe findings
- Lighthouse evidence: NOT RUN; browser/accessibility and production smoke gates passed
- Production smoke: PASS — 14/14 checks, including 153/153 sitemap URLs and 318/318 internal-search records
- Immutable release artifact: 403 files; aggregate SHA-256 `b9fb729d3e9aaf3228983d48637e9543c69469ee6896e4766ed43ecd3b29c5de`
- Known issues: One non-blocking SEO-audit warning remains for an indexable page with two or fewer detected inbound static links. Frozen historical Phase validators continue to report their expected original-count mismatches when invoked directly; current release validators and the dedicated historical-boundary validator pass.
- Previous last-known-good Git SHA: `413aa0152a35d6faa2fa9b1c1d9e0e2489bb20c4`
- Previous last-known-good Cloudflare deployment ID: `dc5c106a-e6dc-4a5b-9120-04ad5b5c6fa4`
- Previous last-known-good Cloudflare version ID: `b5b294f9-6b65-4dad-943f-5400b78cbba5`
- Rollback decision: No rollback required. If a production regression is confirmed, use the governed rollback workflow with version `b5b294f9-6b65-4dad-943f-5400b78cbba5`; otherwise fix forward from the deployed SHA.
- Credential handling: The locally authenticated Wrangler OAuth token was added temporarily as the production environment secret for this one workflow run and deleted immediately after successful deployment.
- Owner approval/reference: Project owner explicitly requested production deployment and the controlled Q3/Q4 implementation in the Codex task on 2026-09-14.

## Live verification

- `/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/`: HTTP 200 without redirect; self-canonical; one H1; Article and BreadcrumbList schemas; correct Q2/Q4 navigation; no FAQPage; no replacement characters; no AdSense runtime.
- `/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/`: HTTP 200 without redirect; self-canonical; one H1; Article and BreadcrumbList schemas; correct Q3-only navigation; no FAQPage; no replacement characters; no AdSense runtime.
- `/learn/questions-about-buddhism/`: HTTP 200, self-canonical, and four source-aware question cards; its existing compact FAQPage remains unchanged.
- Q1 and Q2: HTTP 200, self-canonical, Article and BreadcrumbList schemas, and the correct bounded navigation chain.
- `/sitemap.xml`: HTTP 200 with 153 URLs; Q3 and Q4 occur exactly once each.
- `/search-index.json`: HTTP 200 with 318 records; Q3 and Q4 occur exactly once each.
- Workflow smoke also passed homepage, consent, CSP/security headers, robots, `ads.txt`, 404, HTTPS redirect, and preview-noindex checks.

The workflow-retained evidence artifact is `production-deployment-42b853b1b67e3c9b3145e55b1d42374f35e34719-34803556826` (90-day retention).
