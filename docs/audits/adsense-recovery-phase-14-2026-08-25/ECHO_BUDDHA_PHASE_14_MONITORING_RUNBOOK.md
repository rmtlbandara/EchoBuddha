# EchoBuddha Phase 14 Monitoring Runbook

PHASE_14_STATUS = DEPLOYED_MONITORING_REQUIRED

Do not redeploy unchanged code and do not begin Phase 15. Preserve the initial Phase 14 deployment marker 2026-08-25T05:33:01.801137Z, the immutable 344-row baseline, and the immutable predeploy Search baseline. The current authorized successor release is 413aa0152a35d6faa2fa9b1c1d9e0e2489bb20c4.

## Immediate and short-term checks

1. Re-run the 346-URL current production crawl and fail on any new 5xx, P0/P1 non-200, approved-addition failure, redirect loop/chain, canonical mismatch, sitemap pollution, accidental noindex, ad runtime, or empty ad placeholder.
2. Preserve the confirmed successor-release 151-URL sitemap refetch. Do not submit a duplicate.
3. Re-run one URL Inspection API snapshot only at meaningful checkpoints. Do not exhaust quota or call it a live test.
4. Track every SEO-P0 and SEO-P1 URL for coverage, Google canonical, last crawl, and material click/impression change using finalized comparable windows.
5. Track the two letting-go redirect sources and the legal rename until Google recrawls them after deployment; also require one representative intended-noindex page to be recrawled and excluded after deployment.
6. Recheck Page Indexing, Manual Actions, and Security Issues in Search Console.

## Suggested observation opportunities

- Short-term: Google has recrawled the three requested priority pages, processed the representative noindex page, and refetched the 151-URL successor sitemap; the remaining material gate is the three redirect sources.
- Approximately one week: repeat protected-page and convergence matrices with finalized Search data.
- Approximately two weeks: repeat only if material convergence is still unproven.

These are observation opportunities, not Google guarantees. Google may need days to weeks. Do not churn valid redirects, canonicals, or content while the coherent release is processing.

## Escalation

- DEPLOY_P0_ROLLBACK: site-wide 5xx/noindex/robots block/wrong canonical host, widespread P0/P1 404, systemic redirect failure, unusable sitemap, accidental ads, or compromised main navigation.
- DEPLOY_P1_CRITICAL: isolated protected-owner loss or security/manual-action issue; freeze and choose tested rollback or fix-forward.
- GOOGLE_PROCESSING_EXPECTED: old crawl timestamp, old sitemap count, or pending noindex/removal convergence without a live technical defect.

Current-release rollback target remains the initial Phase 14 version c5f74323-7b3a-450c-96c3-f3a0e432ff42. No rollback was required in this pass.
