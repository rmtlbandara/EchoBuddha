# External-service and production baseline

Captured 2026-11-01 before the Q8/Q9 deployment.

## Production

- Serving SHA: `1ed945581f6802046f8d3245e0480f5c58dabc2c`.
- Current main baseline: `5e45ad3791710b4982e0ff2123a97a97676d4b9b`.
- The difference from serving production is documentation-only social-release evidence; no later application change is being bundled silently.
- Cloudflare deployment: `2c067402-d43f-4aac-9ae3-6821e4da2be2`; version `911d7db1-fbed-4451-9761-bd4d6da17364` at 100%.
- Existing production smoke: 15/15.
- Existing inventory: 351 HTML, 165 sitemap URLs, 330 internal-search records.

## Google Search Console

No fresh authenticated GSC connector was available in this implementation task, so no new performance or inspection values are fabricated.

The retained finalized 90-day context through 2026-10-28 is 143 clicks, 11,572 impressions, 1.236% CTR, and average position 10.79. The stored 47-URL inspection cohort contains 4 indexed, 29 crawled-not-indexed, 11 discovered-not-indexed, and 3 unknown results. Those are dated evidence, not live Q8/Q9 outcomes.

No manual indexing request is part of this release.

## Bing and IndexNow

The retained Bing historical population is 157 indexed, 82 warnings, 2 excluded, and 0 errors. The retained three-month context is 67 clicks and rounded 4K impressions. AI citation figures remain a distinct product metric and are not visits.

The production workflow plans IndexNow against the current live manifest and submits only after smoke succeeds. HTTP 200 is acceptance of notifications, not indexing.

## AdSense

The latest authenticated account record on 2026-10-31 shows Needs attention / Low value content and a displayed decision from 2026-08-21. The dashboard showed ads.txt Not found despite correct public delivery; ownership was verified and the review control was available. No review was submitted.

This release leaves runtime, Auto Ads, serving, and manual slots disabled. Q8 and Q9 are both `LEARN_DETAIL / HOLD_MANUAL_REVIEW`.

## Measurement boundary

Q8/Q9 are a material publishing intervention. The earlier observation window becomes descriptive/intervened when the release reaches production. The new Pacific window will exclude the deployment day and begin on the following Pacific date, with its exact dates recorded after deployment.
