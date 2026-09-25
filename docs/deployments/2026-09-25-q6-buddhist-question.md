# Echo Buddha Production Deployment Record — Q6 Buddhist Question

- Deployment timestamp (UTC): 2026-09-25T02:29:04.519064Z
- Deployment timestamp (Asia/Colombo): 2026-09-25T07:59:04.519064+05:30
- Git SHA (full 40 characters): `714704fabcf008a4cff3a74230bd706576c22aed`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/32
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/35959707466 (`35959707466`) — release and browser jobs passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36086158120 (`36086158120`) — exact-SHA validation and immutable artifact creation passed; deploy step failed before production change because `CLOUDFLARE_API_TOKEN` was empty
- Deployment method: repository-documented owner-authorized local deployment of the exact hosted immutable artifact from a clean detached checkout of current `origin/main`
- Hosted artifact ID: `10844500294`
- Cloudflare deployment ID: `2d7c4593-5a68-4976-a707-b73798ea47af`
- Cloudflare version ID: `14ac6fca-3e35-481d-ad51-307b35d78206`
- Production URL: https://echobuddha.com
- Live Q6 URL: https://echobuddha.com/learn/questions-about-buddhism/appatimo-and-buddha-images/
- Release categories: content / indexing / trust / technical / governance
- Changed page families/components: Questions About Buddhism Q6 Learn detail; Q5-Q6 navigation; hub card collection; sitemap; internal search; indexable-page approval; conservative monetization registry; historical-boundary validation; targeted browser validation
- Deterministic release validation: PASS on the exact merged SHA with Node 22.23.1 and npm 10.9.8
- Hosted deterministic release and browser jobs: PASS
- Targeted Q1-Q6/hub browser matrix before release: PASS — 21/21 route/viewport combinations; zero critical/serious axe findings
- Targeted live Q1-Q6/hub browser matrix: PASS — 21/21 route/viewport combinations; zero critical/serious axe findings
- Lighthouse evidence: NOT RUN; browser/accessibility and production smoke gates passed
- Production smoke: PASS — 14/14 checks, including 155/155 sitemap URLs and 320/320 internal-search records
- Immutable release artifact: 405 files; aggregate SHA-256 `91f628d8b1510f224b1b799ab703a0adaea14f76f6d449c082c4da91d0daa096`
- Known issues: the GitHub production environment’s Cloudflare API token secret is empty. One pre-existing non-blocking SEO warning remains for an indexable page with two or fewer detected inbound static links.
- Previous last-known-good Git SHA: `67d1b8e4282fd92e678ee18eae908efad8c5ff51`
- Previous last-known-good Cloudflare deployment ID: `9080964e-40c5-4758-86d0-1592a884e843`
- Previous last-known-good Cloudflare version ID: `0953eed2-d020-41e8-a2c9-9717d9173cc3`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `0953eed2-d020-41e8-a2c9-9717d9173cc3`; otherwise fix forward from the deployed SHA.
- Credential handling: the locally authenticated Wrangler OAuth session was used directly. No credential value was printed, copied into GitHub, or committed.
- Owner approval/reference: the project owner explicitly requested Q6 implementation and continuation through production/live release.

## Live verification

- Questions About Buddhism hub and Q1–Q6 detail routes: HTTP 200 without an unexpected redirect.
- Q6: exact approved H1; one H1; self-canonical; indexable; correct 2026-09-24 publication date; Article and BreadcrumbList schemas; no FAQPage; visible early-discourse, commentary, and museum source layers; no AdSense runtime script; no manual ad slot.
- Questions About Buddhism hub: HTTP 200 and exactly six question cards, including Q6.
- Navigation: Q5 links forward to Q6; Q6 links back to Q5 and has no future Next-question target.
- Homepage deeper-question curation remains exactly Q1–Q3; Q4, Q5, and Q6 are excluded.
- `/sitemap.xml`: HTTP 200 with 155 URLs; Q6 occurs exactly once; no Q7+ route.
- `/search-index.json`: HTTP 200 with 320 records; Q6 occurs exactly once; no Q7+ route.
- Repository production smoke also passed homepage, consent, CSP/security headers, robots, `ads.txt`, 404, HTTPS redirect, and preview-noindex checks.

The exact artifact was built once by GitHub, downloaded by artifact ID, verified locally against the release SHA and all file digests, passed Wrangler strict dry-run, and was then deployed unchanged. No Search Console indexing request, Ads/Analytics change, CMP change, or manual ad enablement was performed.
