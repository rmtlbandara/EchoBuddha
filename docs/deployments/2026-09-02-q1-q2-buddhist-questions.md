# Echo Buddha Production Deployment Record — Q1 + Q2 Buddhist Questions

- Deployment timestamp (UTC): 2026-09-02T16:27:35.26782Z
- Git SHA (full 40 characters): `413aa0152a35d6faa2fa9b1c1d9e0e2489bb20c4`
- Source branch/ref: `refs/heads/main`
- GitHub workflow run URL/ID: https://github.com/rmtlbandara/EchoBuddha/actions/runs/33654892573 (`33654892573`)
- Cloudflare deployment ID: `dc5c106a-e6dc-4a5b-9120-04ad5b5c6fa4`
- Cloudflare version ID: `b5b294f9-6b65-4dad-943f-5400b78cbba5`
- Production URL: https://echobuddha.com
- Release categories: content / indexing / trust / technical / governance
- Changed page families/components: Questions About Buddhism parent hub; Q1 and Q2 Learn detail pages; sitemap; internal search; indexable-page approvals; conservative monetization registry; historical-boundary and production-smoke validation
- Deterministic release validation: PASS
- Browser validation: PASS
- Lighthouse evidence: NOT RUN
- Production smoke: PASS — 14/14 checks, including 151/151 sitemap URLs and 316/316 internal-search records
- Known issues: None affecting the deployed release. An earlier deployment of the same Q1/Q2 site output (`528ffa39d6ebb97e2eac56216d968831dd1e31c1`, run `33653857766`) exposed a false-negative count formula in the production smoke validator; the final SHA corrected the validator and completed green.
- Previous last-known-good Git SHA: `ad9fe897916c76fd6883efc351461b49db28ac3f`
- Previous last-known-good Cloudflare version ID: `c5f74323-7b3a-450c-96c3-f3a0e432ff42`
- Rollback or fix-forward decision: Fix-forward completed. Roll back to the previous last-known-good version only if a production regression is subsequently confirmed.
- Owner approval/reference: Project owner explicitly requested production deployment in the Codex task on 2026-09-02.

## Live verification

- `/learn/questions-about-buddhism/`: HTTP 200 and self-canonical.
- `/learn/questions-about-buddhism/did-buddha-order-buddha-images/`: HTTP 200, self-canonical, Article and BreadcrumbList structured data, exactly one sitemap entry, and exactly one internal-search entry.
- `/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/`: HTTP 200, self-canonical, Article and BreadcrumbList structured data, exactly one sitemap entry, and exactly one internal-search entry.
- AdSense runtime and manual ad slots remain disabled.

The workflow-retained evidence artifact is `production-deployment-413aa0152a35d6faa2fa9b1c1d9e0e2489bb20c4-33654892573`.
