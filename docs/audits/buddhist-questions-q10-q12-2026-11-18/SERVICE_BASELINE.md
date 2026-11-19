# External-service baseline

Captured for this release on 2026-11-18. No account mutation was made.

## Google Search Console

Latest authenticated read-only aggregate: Search Measurement workflow 43576863316, generated 2026-11-14T08:47:20.286Z.

- Canonical sitemap cohort: 175/175 inspected
- Submitted and indexed: 124
- Crawled — currently not indexed: 44
- Discovered — currently not indexed: 6
- URL unknown to Google: 1
- Indexed canonical mismatches: 0

These are pre-release observations, not Q10–Q12 demand or a causal outcome. No raw query export is committed and no manual indexing request is made.

## Bing

Latest authenticated read-only aggregate: the same workflow, generated 2026-11-14T08:41:08.318Z. The canonical sitemap reported Success with 175 URLs. Bing `IsPage` and IndexNow acceptance are not classified as confirmed indexing.

## AdSense

No authenticated AdSense connector was available during this task. The latest durable project record says a review was requested on November 11. This release does not resubmit, cancel, activate Auto Ads, add manual slots, or alter publisher/account configuration. Runtime remains off.

## Production monitor

Scheduled workflow 44312201788 verified the live site 15/15 at SHA `27dd09aa0abd7be3df46b8444f626c06952c194a`. Its workflow conclusion was failure only because GitHub artifact storage was full. Twenty-nine obsolete pre–November 10 browser-validation artifacts (437,031,627 bytes) were removed; deployment artifacts and durable audit records were preserved.
