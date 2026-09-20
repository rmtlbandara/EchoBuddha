# Echo Buddha Production Deployment Record — Q5 Buddhist Question

- Deployment timestamp (UTC): 2026-09-20T13:01:23.364839Z
- Deployment timestamp (Asia/Colombo): 2026-09-20T18:31:23.364839+05:30
- Git SHA (full 40 characters): `d3da65308348cb5379c76271614288d14f150450`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/26
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/35511950711 (`35511950711`)
- Production workflow run: NOT STARTED — GitHub Actions refused new jobs because account payments failed or the spending limit required an increase
- Deployment method: repository-documented owner-authorized emergency local deployment from a clean detached checkout of the exact current `origin/main` SHA
- Cloudflare deployment ID: `a07b1d86-9af9-4d99-97a5-5b0c02c6bdbc`
- Cloudflare version ID: `7bfce8b0-2df8-42db-b5fe-f5ee45790db5`
- Production URL: https://echobuddha.com
- Live Q5 URL: https://echobuddha.com/learn/questions-about-buddhism/why-bodhi-tree-planted-at-jetavana/
- Release categories: content / indexing / trust / technical / governance / dependency security
- Changed page families/components: Questions About Buddhism Q5 Learn detail; Q4-Q5 navigation; hub card collection; sitemap; internal search; indexable-page approval; conservative monetization registry; historical-boundary validation; targeted browser validation; narrow dependency security override
- Deterministic release validation: PASS on the exact merged SHA with Node 22.23.1 and npm 10.9.8
- Hosted deterministic release job: PASS
- General browser and consent validation: PASS locally on the exact merged SHA
- Targeted Q1-Q5/hub browser matrix: PASS — 18/18 route/viewport combinations; zero critical/serious axe findings
- Hosted replacement browser job: NOT STARTED due to the GitHub Actions billing/spending-limit block
- Lighthouse evidence: NOT RUN; browser/accessibility and production smoke gates passed
- Production smoke: PASS — 14/14 checks, including 154/154 sitemap URLs and 319/319 internal-search records
- Immutable release artifact: 404 files; aggregate SHA-256 `719823d2431014401e08c86c7ce84ef097f8d3bcd538e8e1a99d3e277c006950`
- Known issues: GitHub Actions remains unable to start new jobs until the repository account billing or spending-limit issue is corrected. One pre-existing non-blocking SEO warning remains for an indexable page with two or fewer detected inbound static links.
- Previous last-known-good Git SHA: `42b853b1b67e3c9b3145e55b1d42374f35e34719`
- Previous last-known-good Cloudflare deployment ID: `47303d8a-1941-42c2-a02c-db510473d05f`
- Previous last-known-good Cloudflare version ID: `9e196159-656a-490a-8e18-b0ecfab80a2e`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `9e196159-656a-490a-8e18-b0ecfab80a2e`; otherwise fix forward from the deployed SHA.
- Credential handling: The locally authenticated Wrangler OAuth session was used directly for the documented emergency path. No credential value was printed, copied into GitHub, or committed.
- Owner approval/reference: Project owner explicitly requested the controlled Q5 implementation and production/live release in the Codex task on 2026-09-20.

## Live verification

- Q1-Q5 detail routes: HTTP 200 without an unexpected redirect.
- Q5: exact approved H1; one H1; self-canonical; Article and BreadcrumbList schemas; no FAQPage; no AdSense runtime script; no manual ad slot; production CSP present.
- Questions About Buddhism hub: HTTP 200 and exactly five question cards, including Q5.
- Navigation: Q4 links forward to Q5; Q5 links back to Q4 and has no future Next-question target.
- `/sitemap.xml`: HTTP 200 with 154 URLs; Q5 occurs exactly once; no Q6 path.
- `/search-index.json`: HTTP 200 with 319 records; Q5 occurs exactly once; no Q6 path.
- Repository production smoke also passed homepage, consent, CSP/security headers, robots, `ads.txt`, 404, HTTPS redirect, and preview-noindex checks.

Local emergency evidence is retained in the release worktree under `.release/` and `.artifacts/`; it contains no credentials. There is no GitHub workflow artifact because Actions could not start the production workflow.
