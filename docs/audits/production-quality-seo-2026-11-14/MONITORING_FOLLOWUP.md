# Full canonical monitoring follow-up

The website correction is already live at `27dd09aa0abd7be3df46b8444f626c06952c194a`, with 15 smoke gates, 860 public resource comparisons and 214 live browser checks passing. This follow-up changes the read-only measurement collector only; it does not require another application deployment.

Actual execution 43573844279 exposed two collector issues. Normalizing the combined absolute sitemap URLs and relative owner/watchlist routes *after* deduplication retained 19 duplicate addresses, requesting 194 entries instead of 175. Sequential URL Inspection responses took approximately six seconds each; the job reached 135/194 before its 15-minute limit cancelled collection at `2026-11-14T08:17:10Z`. No complete Google inspection result is claimed for that run. The always-upload step retained Bing's sanitized summary despite cancellation.

The follow-up normalizes before deduplication, limits inspection to three concurrent read-only calls, and saves explicit pending/completed/blocked states after each result. Permanent authentication, quota or exhausted transport failures stop queued calls and retain unknown statuses. The existing weekly job receives a 30-minute outer budget for the expanded cohort; request retries and concurrency remain bounded. No schedule, account configuration, credentials or permissions change. No indexing submission API is used.

Three added tests verify mixed-format deduplication, the exact concurrency bound and progress preservation, and stopping queued calls on authentication/quota failure. Together with the earlier transport/cohort/privacy checks and Bing reporting tests, the ten targeted checks pass. All 130 repository tests pass on the unchanged built website. Normal hosted release/browser validation remains required before merge; final reporting will identify the actual successful collection run or its remaining blocker.

The [official Search Console API quota documentation](https://developers.google.com/webmaster-tools/limits) distinguishes read-only URL Inspection limits from indexing-request limits. A single deduplicated 175-URL weekly cohort is below the documented 2,000 daily and 600 per-minute site inspection limits; the collector also stops on quota failure. This does not authorize repeated manual indexing requests.

The complete main-content external-link sweep checked 149 unique URLs: 141 returned success, none returned 404 or 410, and eight returned external access/rate/server/transport limitations. `EXTERNAL_LINKS.json` preserves exact observations and affected routes; no speculative source replacement or protected-library edit is justified.

The following successful release receipt and final account report will record all actual production identities, Google/Bing acknowledgments, canonical register and the observation-window handoff. Earlier candidate records remain stage-specific history.
