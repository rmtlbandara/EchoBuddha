# Handbook SEO, Accessibility, and Release Validation

Validation date: 2026-09-26

## Pre-production result

Status: **PASS**

## Route and discovery checks

- Static build: 350 pages, including exactly one handbook hub and eight handbook chapter routes.
- All nine established handbook URLs and their self-canonicals were preserved; no redirects, replacement URLs, `noindex`, or orphan routes were introduced.
- Sitemap contains all nine handbook URLs exactly once; hub and chapter `lastmod` values reflect the material 2026-09-26 revision.
- Local search contains one hub record and one record per chapter with required legitimate aliases.
- Home and Learn link to the hub. The hub links to all chapters. Every chapter links to the hub, sequence neighbor(s), and three contextual existing resources.
- Rendered pages contain meaningful initial HTML and ordinary crawlable links.

## Metadata and structured data

- Hub: unique title/description/H1, self-canonical, Open Graph/Twitter image and alt, `CollectionPage`, eight-item `ItemList`, and `BreadcrumbList`.
- Chapters: unique title/description/H1, self-canonical, preserved published date, material modified date, byline, Open Graph/Twitter image and alt, `Article`, and `BreadcrumbList`.
- Handbook Open Graph images and `Article.image` objects report the actual 1600×900 dimensions.
- JSON-LD parses successfully in the repository SEO audit; no unsupported FAQ, Course, rating, review, or invented reviewer data was added.

## Accessibility and responsive rendering

- `npm run audit:browser`: PASS.
- Mobile (390×844) and desktop (1440×900): all nine handbook pages plus Home and Learn checked; zero horizontal overflow, one H1 each, no broken eager images, and complete chapter navigation/reference structures.
- Tablet (768×1024): Home, Learn, hub, and final chapter checked; zero horizontal overflow and no broken eager images.
- Full-page visual inspection completed for the desktop hub and a mobile advanced chapter; image crops, heading hierarchy, Pāli diacritics, cards, references, previous/next links, and footer remain readable.
- Lighthouse accessibility score: 1.00 for the measured hub and representative chapter on mobile and desktop.

## Measured local performance

Lighthouse 13.4.1 against the production build on localhost:

| Surface | Form factor | Performance | Accessibility | LCP | CLS | TBT | Transfer |
|---|---:|---:|---:|---:|---:|---:|---:|
| Handbook hub | Mobile | 0.99 | 1.00 | 2031 ms | 0.0017 | 0 ms | 196 KB |
| Handbook hub | Desktop | 1.00 | 1.00 | 445 ms | 0 | 0 ms | 196 KB |
| Representative chapter | Mobile | 0.99 | 1.00 | 1954 ms | 0 | 0 ms | 192 KB |
| Representative chapter | Desktop | 1.00 | 1.00 | 446 ms | 0 | 0 ms | 192 KB |

These are controlled local lab measurements, not field Core Web Vitals. They meet the project targets for LCP and CLS; INP is not claimed from Lighthouse.

## Release and policy gates

- `npm run validate:release`: PASS.
- Automated tests: 41/41 PASS, including handbook route, content-depth, image, schema, search, sitemap, and monetization assertions.
- `npm run audit:browser`: PASS.
- `npm run audit:lighthouse`: PASS; all ten standard surfaces scored 1.00 for performance and accessibility in both mobile and desktop runs.
- Dependency audit: 0 critical and 0 high vulnerabilities.
- AdSense remains fail-closed: hub `NEVER_MONETIZE`; chapters `HOLD_MANUAL_REVIEW`; no runtime, Auto Ads, slots, or empty placeholders.

## Search Console evidence

The connected `sc-domain:echobuddha.com` property was inspected before release. The handbook hub’s exact-page Performance report showed 0 clicks and 0 impressions for the available three-month window (last update shown as three hours earlier). Because the collection was first published on 2026-09-25, this is insufficient data—not evidence of poor performance or indexing failure. Established URLs and query ownership were therefore preserved. The property overview showed 234 indexed pages, 122 not indexed pages, and 19 valid/0 invalid breadcrumb items at inspection time; these are property-wide counts, not handbook-specific indexing claims.
