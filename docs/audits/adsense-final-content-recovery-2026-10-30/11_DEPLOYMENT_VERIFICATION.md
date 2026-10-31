# Deployment verification

**PASS_DEPLOYED_REVIEW_HOLD.** The existing content remediation is deployed and independently verified. AdSense review remains held for the account evidence concern in 09.

PR [#71](https://github.com/rmtlbandara/EchoBuddha/pull/71) final head `ed01c5fa8cdc0b69c28b41d071979d162d8d3ab7` passed both required checks in [run 41155562843](https://github.com/rmtlbandara/EchoBuddha/actions/runs/41155562843); it merged at 2026-10-31T01:32:10Z as `c3133c88696639a6e8366365e0944f90fe15619a`. Both checks then passed on that exact main SHA in [run 41155816574](https://github.com/rmtlbandara/EchoBuddha/actions/runs/41155816574). No administrator bypass or protection change was used.

[Deploy Production run 41156084468](https://github.com/rmtlbandara/EchoBuddha/actions/runs/41156084468) built once, checked exact current main before build and immediately before deployment, verified every file digest, and deployed the same immutable artifact. File count: 812; aggregate SHA-256:`c10050546b5855b18e240d03ae53a3e8fb6db9f1986d2eed8af02e471b9bdecc`.

Cloudflare deployment:`cb85ab5d-792f-4f5a-9c9b-baf501c8d204`; version:`8d61972c-8bb1-480a-8518-1558bf04724b` at 100%; created 2026-10-31T01:37:00.732566Z. Live `/release.json` reports `c3133c88696639a6e8366365e0944f90fe15619a`.

Hosted and independent smoke each passed 15/15, including enforced security headers, affirmative consent, disabled ads, correct publisher/ads.txt, sitemap, owner/noindex behavior, real 404, HTTPS and preview noindex. Independent parity passed 362/362 selected resources, including all 351 HTML documents, emitted Astro assets and key public manifests. The error document was checked on a genuinely unknown 404 route. All 352 explicit redirects matched their expected status and target. Independent discovery crawl reached 350 reader routes; all 165 sitemap URLs returned 200 with unique titles/descriptions, self-canonicals, one H1 and no unintended noindex.

Live browser validation passed 18 routes with zero axe violations, all 8 consent scenarios, and Tools/search/timer/keyboard/reflow checks in Chromium, Firefox and WebKit. The 236-route-per-engine expanded matrix and 20 Lighthouse cases remain explicitly local evidence, not invented live reruns.

IndexNow after successful hosted smoke returned HTTP 200 for 82 changed canonical notifications (SUBMITTED). This proves acceptance only, not indexing. No review request, ad activation, November batch, route removal, canonical change, owner change or index-state change occurred.

The actual material release day is 2026-10-30 Pacific Time. Exclude that day; planned 28-day stable observation: 2026-10-31–2026-11-27, earliest conservative finalized review 2026-11-30. Future finalized data are still required. Subsequent material publishing intervenes again; historical measurements are preserved and no causal improvement is claimed.

Previous verified fallback: source `1a5e000bcccdef67ce539c82707105d50bee74dd`, deployment `fc131bd2-ba45-4588-9547-93beae500472`, version `1060f158-17a9-4871-9521-b0bd94df783e`. Confirm availability and use the governed [rollback runbook](../../deployments/ROLLBACK_RUNBOOK.md) for a serious incident. No rollback was required.

Baseline main was `27bca410eaec9541878a8923acdde472e283c7bd`; baseline serving source was `1a5e000bcccdef67ce539c82707105d50bee74dd`. Unrelated tools/pinterest-mcp and other worktrees remain preserved. This release receipt is a later documentation/governance-only PR; it does not require a new application deployment or silently redefine the serving SHA. See RELEASE_VERIFICATION.json for machine-readable receipts.
