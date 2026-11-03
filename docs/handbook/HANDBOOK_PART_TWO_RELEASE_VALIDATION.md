# Handbook Part II Release Validation

Date: 2026-11-03
Release scope: *Part II · The Lay Buddhist Path* plus the source-led strengthening of the existing cetiya, Saṅgha-accountability, and right-livelihood owners.

## Release-candidate result

- Exact governed runtime: Node `22.23.4` from `/Users/tharindu/.nvm/versions/node/v22.23.4/bin`.
- `npm run validate:release`: PASS.
- Static build: 357 pages.
- Public sitemap: 171 canonical, indexable URLs.
- Local search: 336 records.
- Automated tests: 98/98 PASS.
- Dependency gate: 0 critical and 0 high vulnerabilities.
- Browser readiness/accessibility audit: PASS.
- Lighthouse readiness audit: PASS; its configured mobile and desktop pages scored 1.00 for performance and accessibility.
- Manual browser QA: handbook hub, *Qualities of a Lay Buddhist*, and *Households, Saṅgha, and Accountability* checked for heading structure, canonical and robots metadata, Article schema, image loading, horizontal overflow, navigation, source links, and absence of ad slots.

The browser review caught an awkward desktop wrap in the final chapter title. The chapter-hero desktop type scale was reduced, rebuilt, and visually rechecked before the final validation run. The concluding chapter also received a third direct inbound content link from the existing lay–Saṅgha chapter; the final SEO audit then passed without a low-inbound warning.

## Content and discovery checks

- Twelve chapters appear once each under two clearly labelled parts.
- The hub emits `CollectionPage`, `ItemList`, and breadcrumb structured data.
- Every chapter emits self-canonical Article and breadcrumb data and remains `index, follow`.
- The four Part II chapters occur once each in the sitemap and search index.
- Home and Learn expose the two-part, twelve-chapter handbook.
- Right Livelihood owns the AN 5.177 five-trades treatment.
- Respecting the Triple Gem owns the later Theravāda three-cetiya treatment.
- The Part I and Part II accountability chapters remain distinct and cross-linked.

## Monetization and account boundaries

- The handbook hub remains `NEVER_MONETIZE`.
- All handbook detail routes remain `HOLD_MANUAL_REVIEW`.
- No AdSense runtime, ad request, Auto Ads activation, or ad placeholder is present.
- No AdSense review was submitted and no unsupported Google Search Console, Bing, or AdSense account-state claim was made.

Production workflow and live release identity are recorded separately after deployment.
