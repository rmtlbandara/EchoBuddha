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

## Fixed monthly prompt panel

Record each query separately for each actually available platform. Use a fresh ordinary search-enabled answer when supported; record unavailable access as unavailable. Never substitute the model's own expected answer. Keep screenshots/response exports private and publish only substantiated aggregates.

| ID | Query |
|---|---|
| 01 | What are the Four Noble Truths explained simply? |
| 02 | What is the Noble Eightfold Path? |
| 03 | How do I start meditating as a beginner? |
| 04 | How do you practice loving-kindness meditation? |
| 05 | What does anicca mean in Buddhism? |
| 06 | What is karma in Buddhism? |
| 07 | What is the difference between Dhamma and Dharma? |
| 08 | What are the Five Precepts? |
| 09 | What is Right Speech in Buddhism? |
| 10 | When did Buddha statues first appear? |
| 11 | Did the Buddha allow images of himself? |
| 12 | What are the four Brahmaviharas? |
| 13 | What is mindfulness of breathing? |
| 14 | How do I practice Buddhism at home? |
| 15 | What is the Middle Way? |
| 16 | What does the Dhammapada say about the mind? |
| 17 | What is the Metta Sutta about? |
| 18 | What are the three poisons in Buddhism? |
| 19 | How do I meditate when anxious? |
| 20 | What is the Kalama Sutta? |

An observation row contains UTC timestamp, panel ID, exact query, platform/product, search setting, observed source links, Echo Buddha cited URL if present, source position, competitors, evidence-file hash, and limitation/status. Status is one of LINKED_CITATION_OBSERVED, NO_LINKED_CITATION_IN_OBSERVED_RESPONSE, UNAVAILABLE, or NOT_RUN. NOT_RUN and UNAVAILABLE never count as a measured zero. The panel has been defined; no completed cross-platform panel run is claimed.

## Automation boundaries

The weekly Search Measurement workflow automates finalized Search Console collection and current canonical inspections using existing read-only credentials. It does not claim to provide a separate Google AI-overview dimension: the available GSC evidence lacks that breakdown. Bing collection uses four supported JSON read endpoints with the already configured API key; authentication/verification codes and unrelated sites are discarded, and only the aggregate summary is uploaded. The hosted run is recorded separately. GA4 dashboard observations remain separate; its unattended Data API collector is not claimed configured.

Referrer stripping, consent rejection, direct navigation, platform behavior, low samples, reporting latency, and changing AI results limit completeness. No invasive tracking is added to compensate.
