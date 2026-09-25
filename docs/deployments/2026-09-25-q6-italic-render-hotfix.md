# Echo Buddha Production Deployment Record — Q6 Italic Rendering Hotfix

- Deployment timestamp (UTC): 2026-09-25T02:54:21.927863Z
- Deployment timestamp (Asia/Colombo): 2026-09-25T08:24:21.927863+05:30
- Git SHA (full 40 characters): `575cbae92cdd158c6c7ca4459029847ae91d845c`
- Source branch/ref: `refs/heads/main`
- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/34
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36087718697 (`36087718697`) — release and browser/consent jobs passed
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36087917281 (`36087917281`) — exact-SHA validation and immutable artifact creation passed; deploy step failed before production change because `CLOUDFLARE_API_TOKEN` was empty
- Deployment method: repository-documented owner-authorized local deployment of the exact hosted immutable artifact from a clean detached checkout of current `origin/main`
- Hosted artifact ID: `10844412215`
- Immutable release artifact: 405 files; aggregate SHA-256 `eb4141ed5ac1d042e710b9203b3f49feb830b3f68c4170bed68b0ab797776eea`
- Cloudflare deployment ID: `b7f871c0-b8bd-41b8-a56e-96b0ae9b06da`
- Cloudflare version ID: `88915d8a-ae51-4ecb-9a54-099c7e7143c7`
- Production URL: https://echobuddha.com
- Live Q6 URL: https://echobuddha.com/learn/questions-about-buddhism/appatimo-and-buddha-images/
- Changed asset: `/learn/questions-about-buddhism/appatimo-and-buddha-images/index.html`
- Change summary: render controlled question short-answer copy as trusted inline HTML, matching the existing section renderer, so `<i>appaṭimo</i>` produces semantic italic markup instead of visible escaped tags
- Regression coverage: requires the built Q6 page to contain `<i>appaṭimo</i>` and reject `&lt;i&gt;appaṭimo&lt;/i&gt;`
- Deterministic release validation: PASS
- Targeted live Q1–Q6/hub browser matrix: PASS — 21/21 route/viewport combinations; zero critical/serious axe findings
- Production smoke: PASS — 14/14 checks, including 155/155 sitemap URLs and 320/320 internal-search records
- Explicit live rendering check: PASS — real italic markup present; escaped literal absent
- Previous last-known-good Git SHA: `714704fabcf008a4cff3a74230bd706576c22aed`
- Previous last-known-good Cloudflare deployment ID: `2d7c4593-5a68-4976-a707-b73798ea47af`
- Previous last-known-good Cloudflare version ID: `14ac6fca-3e35-481d-ad51-307b35d78206`
- Rollback decision: No rollback required. If a severe production regression is confirmed, use the governed rollback procedure with version `14ac6fca-3e35-481d-ad51-307b35d78206`; otherwise fix forward from the deployed SHA.
- Known issue: the GitHub production environment's `CLOUDFLARE_API_TOKEN` secret remains empty.
- Credential handling: the locally authenticated Wrangler OAuth session was used directly. No credential value was printed, copied into GitHub, or committed.
- Owner approval/reference: the project owner reported the production rendering defect and requested continuation of the production release work.

## Live verification

- Q6 returns HTTP 200 at its canonical production URL.
- The affected short-answer sentence contains semantic `<i>appaṭimo</i>` markup.
- The page does not contain the escaped `&lt;i&gt;appaṭimo&lt;/i&gt;` string.
- The canonical URL, Q1–Q6 navigation, sitemap, internal search, monetization hold, consent behavior, security headers, and ad-runtime restrictions remain intact.
- Cloudflare uploaded exactly one new or modified static asset; 402 existing assets were reused.

The exact artifact was built once by GitHub, downloaded by artifact ID, verified locally against the release SHA and every file digest, passed Wrangler strict dry-run, and was deployed unchanged. No Search Console indexing request, Ads/Analytics change, CMP change, or manual ad enablement was performed.
