# AdSense Script Activation Report

Date: 2026-08-06

## Scope

Owner provided the Google AdSense publisher script and requested production deployment.

Publisher ID: `ca-pub-3911157640549350`

This change activates the AdSense publisher script conservatively. It does not add manual ad unit slot IDs, does not add manual ad placements, does not enable ads on protected page families, and does not claim AdSense approval, earnings, indexing, ranking, or policy/legal compliance guarantees.

## Implementation

Files changed:

- `src/data/ads.ts`: central AdSense config and route gate.
- `src/components/AdSenseScript.astro`: loads consent defaults and the publisher script on eligible pages.
- `src/layouts/Layout.astro`: includes the AdSense script component in the document head.
- `src/components/AdSlot.astro`: keeps manual ad units disabled unless exact slot IDs and placements are approved later.
- `src/data/site.ts`: marks owner-approved ad script activation through `FEATURES.adsEnabled`.
- `public/_headers`: updates CSP report-only policy for Google ad script/resource domains.
- `src/pages/privacy-policy.astro`, `README.md`, and governance/tests/scripts: align documentation and validation with the new controlled AdSense state.

## Route Gate

AdSense script is allowed only on:

- Low-sensitivity article detail pages, excluding sensitive wellbeing, meditation, boundary, forgiveness, and Dhammapada/source-attribution pages.
- Buddhism 101 learning detail pages, excluding Five Hindrances because of meditation-obstacle sensitivity.
- Core Learn pages: `/learn/buddhism-for-beginners/`, `/learn/eightfold-path/`, and `/learn/four-noble-truths/`.

AdSense script remains blocked on:

- Homepage.
- Search.
- 404.
- Tools.
- Trust and policy pages.
- Quote hub, quote categories, and quote stories.
- Daily reflections and today's reflection.
- Meditation hub and meditation detail pages.
- Buddhist dictionary pages.
- Sutta/source-study pages.
- Dhammapada reflection/source-attribution pages.
- Sensitive wellbeing articles.

Local build evidence:

- Built HTML pages: 336.
- Pages with the AdSense publisher script: 55.
- Protected sample pages checked without script: privacy policy, search, today's reflection, quote category, quote story, meditation page, anxiety meditation article, Dhammapada Verse 1 article, and Five Hindrances learning page.

## Consent And Placement

The head script sets Google consent defaults to denied for:

- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `analytics_storage`

The existing analytics consent manager remains in place. Manual ad units remain disabled through `ADSENSE.manualSlotsEnabled: false`.

Any future manual ad unit rollout still needs exact slot IDs, owner placement approval, CMP/legal review where applicable, and QA rules that avoid clicking live ads.

## Validation Summary

| Command | Status |
|---|---|
| `npm run build` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS |
| `npm run audit:seo` | PASS |
| `npm run audit:content` | PASS |
| `npm run audit:dependencies` | PASS |
| `npm run validate:release` | PASS |
| `npm run audit:browser` | PASS |
| `npm run audit:lighthouse` | PASS |

Lighthouse summary after AdSense script activation:

- Mobile minimum performance: 0.99.
- Desktop minimum performance: 1.00.
- Mobile minimum accessibility: 1.00.
- Desktop minimum accessibility: 1.00.
- Maximum measured mobile LCP: 1066.3511 ms.
- Maximum measured desktop LCP: 446.6451 ms.

## Production Deployment Gate

Ready to commit, push, deploy with `npx wrangler deploy`, and verify production samples.

Post-deployment checks should confirm:

- An eligible article or learning page includes the publisher script.
- Protected pages do not include the publisher script.
- Security headers remain live.
- Homepage, robots, sitemap, and trust pages still load.
