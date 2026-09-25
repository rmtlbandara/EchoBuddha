# Handbook SEO, Accessibility, and Release Validation

Validation date: 2026-09-25

## Result

Local implementation status: **PASS**  
Production deployment/indexing status: **NOT PERFORMED** — separate exact-SHA production authorization is required by repository governance.

## Route and discovery checks

- Static build: 350 HTML pages, including exactly one handbook hub and eight handbook chapter routes.
- Indexable sitemap: 164 canonical URLs; all nine handbook URLs appear once with the expected `lastmod`.
- Local search: 329 records; one hub record and eight chapter records, with required aliases including `Saṅgha`/`Sangha`.
- Home and Learn both link to the handbook hub.
- Hub links to all eight chapters; each chapter links to the hub, sequence neighbor(s), and three related existing pages.
- No broken internal links, sitemap/index-policy contradictions, unknown-route holds, or duplicate handbook canonicals.

## Metadata and structured data

- Hub: unique title/description, self-canonical, Open Graph/Twitter image, `CollectionPage`, nested `ItemList`, and `BreadcrumbList`.
- Chapters: unique title/description, self-canonical, publication/modified dates, author, Open Graph/Twitter image, `Article`, and `BreadcrumbList`.
- All emitted JSON-LD parsed successfully in the repository SEO/release audit.
- Existing “Deeper Questions” pages retain topic ownership and are linked rather than duplicated.

## Accessibility and rendering

- Repository browser-readiness audit: PASS.
- Axe WCAG 2 A/AA and 2.1 AA spot checks: zero violations on the hub and final chapter at both 1440 px desktop and 390 px mobile viewports.
- Visual review: full-page desktop hub and mobile detail screenshots inspected; hierarchy, cards, long-form flow, navigation, image cropping, and footer were coherent.
- Hero image: explicit 1600×900 dimensions, responsive AVIF/WebP sources, descriptive alt text, and no layout-dependent text baked into the image.

## Performance evidence

The existing Lighthouse readiness suite was rerun after the new homepage discovery module and image were added.

| Surface | Form factor | Performance | Accessibility | LCP | CLS |
|---|---:|---:|---:|---:|---:|
| Homepage | Mobile | 1.00 | 1.00 | 910 ms | 0.0017 |
| Homepage | Desktop | 1.00 | 1.00 | 425 ms | 0.00036 |
| Representative learning page | Mobile | 1.00 | 1.00 | — | — |
| Representative learning page | Desktop | 1.00 | 1.00 | — | — |

## Release and policy gates

- `npm run validate:release`: PASS.
- Automated tests: 41/41 PASS, including 5 handbook-specific suites.
- Phase 8/9/10 current governance: 17/17, 26/26, and 19/19 PASS.
- Historical Phase 11/12/13 evidence boundaries: PASS.
- Dependency audit: 0 critical and 0 high vulnerabilities.
- AdSense: runtime, Auto Ads, and manual slots remain disabled. Hub is `NEVER_MONETIZE`; all eight chapters are `HOLD_MANUAL_REVIEW`.
