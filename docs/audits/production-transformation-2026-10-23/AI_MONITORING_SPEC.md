# AI discovery and referral monitoring

Implementation date: October 23, 2026. This is an observation method, not a promise of citations or traffic.

## Available first-party evidence

Bing AI Performance was accessed through the authenticated Echo Buddha property before release. Its selected three-month view showed a rounded 2.8K citations, an average of 19 cited pages, and 56 page rows in the results set. Actual cited page URLs were visible, including supporting articles and source-learning pages. The service labels its citation sources “Microsoft Copilots and Partners” and describes the records as sampled and subject to refinement. These are historical service observations, not improvements caused by this release and not independent observations of answers on every AI platform.

Bing's separate search overview showed 46 clicks and a rounded 2.7K impressions in its three-month view. Its sitemap reported 165 discovered URLs, successful processing, and zero errors/warnings. The completed September site scan had 250 pages, zero errors, and 362 warnings. Warning counts are not unique defects or mandatory rewrite targets.

GA4 property 542992383 / stream 15143247803 was verified for `https://echobuddha.com`, with the production measurement ID. Its home view showed 21 active users and 325 events in the selected last-seven-day period at inspection. These metrics are consent-limited and are not a release outcome.

## Repeatable observation

1. Keep query text, raw account exports, and screenshots in private evidence, outside Git. Public reporting should contain aggregates and limitations.
2. For Bing AI Performance, record the exact selected range, service source label, rounded versus exact totals, cited page URL, count, and extraction time. Export the page table where supported. Never infer zero citations from unavailable data.
3. For GA4, inspect session source/medium and landing page for recognizable referral hosts: `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, and `claude.ai`. Classify by observed referral host, not a guessed user identity. Do not merge these figures with Bing citation counts.
4. For legitimate external answer observations, record platform, query, timestamp, exact linked Echo Buddha URL, screenshot/API evidence, and limitations. A generated mention without an actual supporting link is not a citation. Do not use unsupported scraping or fabricate simulated observations.
5. Use a small stable query panel covering the six topic owners plus mindfulness/sati, compassion/karuṇā, karma, right speech, breathing, patience, and precepts. Review monthly and after a meaningful release, rather than repeatedly submitting unchanged URLs or seeking synthetic mentions.

## Automation boundaries

The weekly Search Measurement workflow automates finalized Search Console collection and current canonical inspections using existing read-only credentials. It does not claim to provide a separate Google AI-overview dimension: the available GSC evidence lacks that breakdown. Bing collection uses four supported JSON read endpoints with the already configured API key; authentication/verification codes and unrelated sites are discarded, and only the aggregate summary is uploaded. The hosted run is recorded separately. GA4 dashboard observations remain separate; its unattended Data API collector is not claimed configured.

Referrer stripping, consent rejection, direct navigation, platform behavior, low samples, reporting latency, and changing AI results limit completeness. No invasive tracking is added to compensate.
