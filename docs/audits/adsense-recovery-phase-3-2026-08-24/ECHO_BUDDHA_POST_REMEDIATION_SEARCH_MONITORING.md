# EchoBuddha Post-Remediation Search Monitoring Plan

Generated: 2026-08-24T04:01:12.853Z

No future monitoring was scheduled or executed in Phase 3.

## Baseline and cadence

- Compare complete periods against `ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv`.
- For a future approved merge, monitor both survivor totals and whether the survivor retains the source's important queries.
- Inspect protected URL status, Google-selected canonical, sitemap state, redirects, internal links, clicks, impressions, query ownership, and unexpected 404/soft-404 behavior.
- Expect temporary fluctuations after major URL processing; diagnose technical failures separately from normal recrawl/reprocessing.

## Diagnostic triggers

| Trigger | Investigation |
|---|---|
| PROTECTED_URL_NOT_INDEXED | Inspect indexing allowed, URL Inspection, sitemap, canonical, and recent deployment. |
| UNEXPECTED_GOOGLE_CANONICAL | Compare declared canonical, redirects, internal links, sitemap, and duplicate content. |
| REDIRECT_FAILURE / REDIRECT_LOOP | Validate source → final survivor status and eliminate chains. |
| SOFT_404_RISK | Confirm target substantially satisfies the source intent and contains absorbed value. |
| TOP_QUERY_OWNER_CHANGED | Use an actual query×page comparison before concluding loss or cannibalization. |
| SUSTAINED_IMPRESSION_DROP / SUSTAINED_CLICK_DROP | Compare complete periods and affected query groups; do not react to a single noisy day. |
| INTERNAL_LINK_BREAKAGE | Update relevant internal links directly to the final canonical survivor. |

For future redirects, retain relevant permanent redirects for at least one year and longer where practical.
