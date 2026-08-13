# Echo Buddha SEO, Content, UX, Indexing, and AdSense Governance

## 1. Document Control

| Field | Value |
|---|---|
| Project name | Echo Buddha |
| File purpose | Permanent project-wide governance standard for SEO, content quality, UX, accessibility, crawling, indexing, analytics, privacy, performance, AdSense readiness, and repository change control. |
| Status | Active governance baseline for future audits and changes |
| Version | 2.0.0 |
| Created date | 2026-07-21 |
| Last reviewed date | 2026-08-13 |
| Governance owner | TBD project owner / Echo Buddha editorial and technical owner |
| Review frequency | At least quarterly, and before any major audit, domain/routing change, advertising launch, analytics/privacy change, or policy-sensitive content expansion. |
| Scope | The Echo Buddha Astro codebase, generated static website, production domain where verified, editorial content model, SEO implementation, future audit process, and future AdSense-readiness decisions. |
| Intended users | Developers, writers, editors, designers, auditors, SEO reviewers, accessibility reviewers, performance reviewers, and AI coding agents working on Echo Buddha. |

Requirement language:

- **MUST** means mandatory.
- **MUST NOT** means prohibited.
- **SHOULD** means expected unless a documented reason exists.
- **SHOULD NOT** means discouraged unless justified.
- **MAY** means optional.

Document navigation:

- [1. Document Control](#1-document-control)
- [2. Echo Buddha Project Baseline](#2-echo-buddha-project-baseline)
- [3. Website Purpose and Concept Governance](#3-website-purpose-and-concept-governance)
- [4. User and Search Intent Standards](#4-user-and-search-intent-standards)
- [5. People-First Content Standard](#5-people-first-content-standard)
- [6. Originality and Added-Value Framework](#6-originality-and-added-value-framework)
- [7. Buddhist and Educational Content Integrity](#7-buddhist-and-educational-content-integrity)
- [8. Source, Citation, and Fact-Checking Standard](#8-source-citation-and-fact-checking-standard)
- [9. Authorship, Expertise, and Editorial Transparency](#9-authorship-expertise-and-editorial-transparency)
- [10. Content Lifecycle Governance](#10-content-lifecycle-governance)
- [11. Information Architecture](#11-information-architecture)
- [12. Internal Linking Standard](#12-internal-linking-standard)
- [13. URL Governance](#13-url-governance)
- [14. Crawlability, Rendering, and Indexability](#14-crawlability-rendering-and-indexability)
- [15. Robots Governance](#15-robots-governance)
- [16. XML Sitemap Standard](#16-xml-sitemap-standard)
- [17. Canonicalization and Duplicate Content](#17-canonicalization-and-duplicate-content)
- [18. Metadata and Search Appearance](#18-metadata-and-search-appearance)
- [19. Structured Data Governance](#19-structured-data-governance)
- [20. Image and Media SEO](#20-image-and-media-seo)
- [21. Page Experience and Core Web Vitals](#21-page-experience-and-core-web-vitals)
- [22. Mobile-First Standards](#22-mobile-first-standards)
- [23. Accessibility Standards](#23-accessibility-standards)
- [24. UX and User-Friendliness Standard](#24-ux-and-user-friendliness-standard)
- [25. Recurring-User Value](#25-recurring-user-value)
- [26. Search Console and Indexing Operations](#26-search-console-and-indexing-operations)
- [27. Google AdSense Readiness](#27-google-adsense-readiness)
- [28. Privacy, Analytics, and Consent](#28-privacy-analytics-and-consent)
- [29. Generative AI and Automation Policy](#29-generative-ai-and-automation-policy)
- [30. Security and Trust](#30-security-and-trust)
- [31. Repository and CI Governance](#31-repository-and-ci-governance)
- [32. Page-Type Quality Matrix](#32-page-type-quality-matrix)
- [33. Definition of a Publishable Page](#33-definition-of-a-publishable-page)
- [34. Audit Framework for the Next Phase](#34-audit-framework-for-the-next-phase)
- [35. Change-Approval Checklist](#35-change-approval-checklist)
- [36. Exceptions Process](#36-exceptions-process)
- [37. Governance Maintenance](#37-governance-maintenance)
- [38. Content Audit Remediation Governance](#38-content-audit-remediation-governance)

Authoritative external source categories reviewed for this version:

- Google Search Central documentation for Search Essentials, spam policies, SEO Starter Guide, crawling, indexing, robots controls, canonicalization, redirects, sitemaps, JavaScript SEO, mobile-first indexing, structured data, title links and snippets, images, page experience, Core Web Vitals, Search Console, AI-generated content, and AI features in Search.
- Google AdSense Help and policy documentation for site readiness, valuable content, navigation, privacy, ad placement, invalid traffic, and policy compliance.
- Google Search Console Help for operational reports and diagnostics.
- Cloudflare Static Assets documentation for source-controlled `_headers`.
- npm audit, Astro upgrade, Lighthouse, Web Vitals, WCAG, and axe-core documentation for release, performance, and accessibility gates.

Official guidance changes over time. Before any major audit, AdSense application, analytics/consent change, structured-data change, indexing change, or policy-sensitive content expansion, the current official Google documentation MUST be rechecked and this document updated if needed.

Primary official references used:

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- How Google Search works: https://developers.google.com/search/docs/fundamentals/how-search-works
- Crawling and indexing overview: https://developers.google.com/search/docs/crawling-indexing/overview
- Robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Robots meta tags and X-Robots-Tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Redirects: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Mobile-first indexing: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
- Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- AI-generated content guidance: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content
- AI features and website controls: https://developers.google.com/search/docs/appearance/ai-features
- Title links: https://developers.google.com/search/docs/appearance/title-link
- Snippets: https://developers.google.com/search/docs/appearance/snippet
- Image SEO: https://developers.google.com/search/docs/appearance/google-images
- Structured data general guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Page experience: https://developers.google.com/search/docs/appearance/page-experience
- Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Search Console introduction: https://developers.google.com/search/docs/monitor-debug/search-console-start
- AdSense site readiness: https://support.google.com/adsense/answer/7299563
- AdSense eligibility and policy starting points: https://support.google.com/adsense/answer/9724
- AdSense Program policies: https://support.google.com/adsense/answer/48182
- Ad placement policies: https://support.google.com/adsense/answer/1346295
- Invalid traffic guidance: https://support.google.com/adsense/answer/1112983
- Google EU user consent policy: https://www.google.com/about/company/user-consent-policy/
- Cloudflare Static Assets headers: https://developers.cloudflare.com/workers/static-assets/headers/
- npm audit: https://docs.npmjs.com/cli/v11/commands/npm-audit
- Astro upgrade guide: https://docs.astro.build/en/upgrade-astro/
- Lighthouse overview: https://developer.chrome.com/docs/lighthouse/overview
- Web Vitals: https://web.dev/vitals/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- axe-core documentation: https://www.deque.com/axe/core-documentation/

## 2. Echo Buddha Project Baseline

This section records verified facts from the repository and limited production checks completed on 2026-07-21. It is not a full audit.

### Verified Repository Facts

| Area | Verified baseline |
|---|---|
| Technology stack | Astro static site, TypeScript, HTML, CSS. `package.json` lists Astro `^7.1.3`, TypeScript `^5.8.3`, Wrangler `^4.113.0`, browser audit tooling, and dependency overrides for `sharp` and `svgo`. |
| Rendering approach | Static output. `astro.config.mjs` sets `output: "static"` and `site: "https://echobuddha.com"`. |
| Routing model | File-based Astro routing under `src/pages`, including static pages, dynamic routes, API-style static endpoints for `sitemap.xml` and `search-index.json`, and a `404.astro` page. |
| Content storage | TypeScript data modules, not Markdown/MDX content collections. Main modules are `src/data/site.ts`, `src/data/learn.ts`, and `src/data/dailyReflections.ts`. |
| Content types | Original quotes and quote stories, articles, learning pages, Buddhist dictionary pages, Dhammapada reflections, sutta-for-daily-life pages, meditation pages, daily reflections, tools, search, and trust/policy pages. |
| Content counts | Regex-based repository scan found about 110 quote entries, 42 article objects with article thumbnails, 4 learning sections, about 47 learning/meditation page records using the shared learning shape, and about 30 daily-reflection detail records. These counts require exact validation in the next audit. |
| Page types | Homepage, Start Here, Learn hub, learning section hubs, learning detail pages, meditation hub, meditation detail pages, legacy `meditation-guide`, article index, article category, article detail, quotes index, quote category, quote story, daily-reflections hub, daily-reflection detail, today's reflection, tools, search, about, author profile, editorial policy, contact, privacy policy, terms, disclaimer, 404, sitemap, robots, and JSON search index. |
| Metadata implementation | `src/layouts/Layout.astro` calls `src/components/SEO.astro`. `SEO.astro` generates title, meta description, optional `noindex, follow`, absolute canonical URL, Open Graph, Twitter card, and JSON-LD. |
| Canonical handling | `SEO.astro` builds canonicals from `SITE.url` and either `canonicalPath` or `Astro.url.pathname`. `canonicalPath={false}` suppresses the canonical, verified on `404.astro`. |
| Robots implementation | Repository contains `public/robots.txt` with `User-agent: *`, `Allow: /`, and sitemap URL. `SEO.astro` supports page-level `noindex, follow`. No source-level `X-Robots-Tag` implementation was found. README mentions `src/pages/robots.txt.ts`, but the verified source file is `public/robots.txt`. |
| Sitemap implementation | `src/pages/sitemap.xml.ts` creates XML from static paths plus data-driven learning, meditation, article, category, quote, quote-story, and daily-reflection URLs. It excludes search and 404. It filters quote stories through `isQuoteStoryIndexable`. |
| Structured data | Global `WebSite` with `SearchAction` and `Organization` are emitted by `SEO.astro`. Page templates add schema such as `Blog`, `CollectionPage`, `ItemList`, `BreadcrumbList`, `Article`, `BlogPosting`, `FAQPage`, `DefinedTerm`, `DefinedTermSet`, `AboutPage`, `ContactPage`, `PrivacyPolicy`, and `ProfilePage`. Full validation is pending. |
| Image handling | Local images live in `public/images`, including AVIF, WebP, SVG, PNG, favicon files, and `public/og-default.svg`. Article records reference thumbnails. Full alt-text, dimensions, compression, and layout-shift audit is pending. |
| Search | `src/pages/search.astro` is a visible search page with `noindex`; `public/search.js` powers client-side search against `src/pages/search-index.json.ts`. Header includes a search overlay. |
| Analytics | Google Analytics configuration is centralized in `src/data/site.ts`. `src/components/ConsentManager.astro` loads Google Analytics only after explicit analytics consent and does not grant advertising consent. |
| Consent handling | A global privacy-first consent interface lets users accept analytics, reject optional cookies, reopen settings, and withdraw analytics consent. Legal adequacy remains subject to qualified jurisdiction-specific review. |
| Advertising / AdSense | The publisher ID is centralized in `src/data/ads.ts` and exposed through verification metadata and `public/ads.txt`; runtime script loading and manual ad slots remain disabled. |
| Deployment model | `wrangler.jsonc` configures Cloudflare Workers Static Assets. Governed production deployment builds once from an exact `main` SHA, verifies the artifact, deploys through the GitHub `production` environment, captures evidence, and runs smoke checks. |
| Testing and CI | Pull requests and `main` pushes run release and browser gates. Separate workflows cover extended validation, scheduled/manual production smoke tests, exact-SHA production deployment, and confirmed version-based rollback. Actions are immutable-SHA pinned with least-privilege workflow permissions. |
| Existing policy/trust pages | About, Contact, Editorial Policy, Privacy Policy, Terms of Use, Disclaimer, and an editorial author profile exist in `src/pages`. |
| Existing author/editorial info | Content uses organization-style authorship, primarily `Echo Buddha Editorial`, with `/authors/echo-buddha-editorial/`. No named human author credentials were verified. |
| Existing documentation | README, Search Console checklist, content cluster map, and historical audit artifacts exist under `docs/`. No prior root governance document matching this file was found. |

### Verified Production Facts

Production URL was determined from repository evidence: `astro.config.mjs`, `SITE.url`, `public/robots.txt`, generated sitemap URLs, and documentation all point to `https://echobuddha.com`.

Limited production checks with `curl -L` confirmed:

- `https://echobuddha.com/robots.txt` is accessible and includes Cloudflare-managed content-signal and AI-crawler rules in addition to the repository's general allow rule and sitemap reference.
- `https://echobuddha.com/sitemap.xml` is accessible and contains the expected `https://echobuddha.com/` URL set, including key static pages, learning pages, article URLs, quote URLs, and daily-reflection URLs.
- `https://echobuddha.com/search/` is accessible and includes `meta name="robots" content="noindex, follow"`, canonical `https://echobuddha.com/search/`, global JSON-LD, GA script, search overlay, and current source navigation.
- A nonexistent URL returned HTTP `404`.

Limitations:

- Search Console data, analytics data, Core Web Vitals field data, indexing status, rankings, AdSense account status, and manual actions were not available.
- Representative production page inspection was limited. The next audit MUST inspect homepage, hubs, detail pages, policy pages, search, sitemap, robots, mobile navigation, and 404 in a browser and compare source, built output, and production.

### Confirmed Strengths

- Static Astro output is simple for crawling and hosting.
- Shared SEO component centralizes core metadata and structured data.
- Absolute canonicals are generated from a single site URL.
- Search page is intentionally `noindex, follow`.
- Sitemap is data-driven and excludes some non-indexable quote stories.
- Trust pages, editorial policy, disclaimer, author profile, contact email, and privacy policy already exist.
- Ads are disabled by default and no AdSense publisher code is present.
- Content model includes source notes, quote-origin status, reviewed dates for articles, internal link clusters, and safety notes for some wellbeing topics.

### Known Gaps And Unresolved Areas

- Full content quality, originality, duplication, citation, and Buddhist integrity audit is pending.
- Analytics is consent-gated in source. Future analytics, advertising, embeds, newsletters, or personalization changes MUST preserve accurate disclosures and consent review.
- No CI workflow was found.
- README references `src/pages/robots.txt.ts`, but the repository has `public/robots.txt`.
- Structured data has not been validated against Google's current rich-result policies.
- Sitemap completeness, `lastmod` accuracy, noindex/sitemap consistency, and production parity require audit.
- Accessibility, mobile UX, Core Web Vitals, image optimization, and JavaScript behavior require testing.
- Production robots includes Cloudflare-managed AI crawler rules not represented in source; ownership and intended policy need review.

## 3. Website Purpose and Concept Governance

Echo Buddha's verified purpose is to provide original, beginner-friendly Buddhist-inspired wisdom, meditation guidance, daily reflections, quote meanings, and mindful living education for ordinary life. This is supported by `SITE.description`, README, About, Editorial Policy, navigation, content modules, and the cluster map.

Intended audience:

- Beginners exploring Buddhist ideas in plain language.
- Readers seeking gentle daily reflection, mindfulness, compassion, patience, ethical speech, and meditation practice.
- Users who want accessible definitions, learning paths, and practical applications rather than formal religious instruction.

Core topical scope:

- Beginner Buddhism, Buddhist wisdom, ethics, meditation, mindfulness, compassion, impermanence, non-attachment, karma, Dhammapada-inspired reflections, selected sutta themes, Buddhist terms, and practical daily reflection.

Primary content pillars:

- Start Here and beginner orientation.
- Learn / Buddhism 101.
- Buddhist Dictionary.
- Meditation.
- Articles.
- Quotes and quote reflection stories.
- Daily Reflections.
- Mindful Living and Tools.
- Trust and policy pages.

In-scope topics:

- Buddhist concepts explained for general readers.
- Practical meditation and mindfulness education.
- Responsible wellbeing-adjacent reflection with limitations.
- Source-aware introductions to Buddhist texts and terms.
- Original reflection prompts, practice suggestions, and learning paths.

Out-of-scope topics unless explicitly approved and tightly connected:

- General self-help content with no Buddhist or mindfulness context.
- Celebrity, news, finance, politics, lifestyle, or product content created mainly for search traffic.
- Medical, mental-health, legal, financial, or supernatural advice.
- Sectarian claims presented as universal Buddhist truth.
- Pages created mainly to host ads or capture unrelated keywords.

Distinct value MUST come from clear synthesis, gentle practice framing, source-aware explanation, original examples, careful limitations, and navigation that helps beginners learn in sequence. Future ideas MUST be evaluated against the existing cluster map before publication. Echo Buddha MUST avoid uncontrolled topic expansion that weakens its identity.

## 4. User and Search Intent Standards

Every new or updated page MUST define its primary user intent before drafting or implementation.

| Intent type | Echo Buddha standard |
|---|---|
| Informational | Answer the user's main question directly, then add enough context to prevent misunderstanding. |
| Educational | Teach a concept in sequence with definitions, examples, source context, and related next steps. |
| Definition | Explain the term, tradition/text context where relevant, common misunderstandings, and practical relevance. Thin one-paragraph glossary pages MUST NOT be published as indexable pages. |
| Comparative | Explain meaningful differences without forcing false opposition, such as mindfulness vs meditation or attachment vs care. |
| Practical / instructional | Provide realistic steps, safety limitations, and what to do when practice is difficult. |
| Navigational | Help users find the right section quickly; do not overload orientation pages with article-like keyword targeting. |
| Exploratory learning | Offer pathways, related terms, hub links, and progressive learning order without trapping users in circular links. |

Keyword targeting MUST NOT override real user need. Pages MUST satisfy the main intent visible in title, H1, intro, and internal links.

## 5. People-First Content Standard

All indexable content MUST:

- Have a clear purpose and identifiable audience.
- Answer the primary question accurately.
- Provide substantial original value beyond a search-result summary.
- Be complete enough for the intended beginner reader.
- Use natural, readable language.
- Avoid filler, manufactured word counts, and repetitive scaffolding.
- Avoid repeating the same introduction, structure, or conclusion across many pages.
- Include examples, practice guidance, source context, or clarifications where helpful.
- Be reviewed for accuracy, source integrity, search intent, accessibility, and duplicate overlap.
- Use publication and modification dates only when accurate.

The following are prohibited:

- Copied, scraped, spun, or superficially paraphrased content.
- Search-result summaries without added value.
- Mass-generated pages.
- Thin glossary or quote pages.
- Doorway pages.
- Misleading freshness.
- Fabricated experience, credentials, quotes, sources, reviews, ratings, or statistics.
- Keyword stuffing or hidden text.
- Repetitive boilerplate that overwhelms unique content.
- Pages created mainly to display advertisements.

## 6. Originality and Added-Value Framework

Before publication, every new or materially updated page MUST document its unique contribution in the working issue, PR, audit note, or page plan.

A publishable page SHOULD contribute at least one of:

- Original explanation or synthesis.
- First-hand expertise where genuine and disclosed.
- Original research or carefully verified source comparison.
- Unique examples, practice prompts, diagrams, tables, or interactive tools.
- Better organization of a complex topic.
- Meaningful historical, cultural, textual, or tradition-specific context.
- Carefully attributed primary-source material.
- A stronger, clearer, safer, or more useful answer than existing competing pages.

If a page cannot state its unique contribution, it SHOULD be consolidated, redirected, noindexed, or postponed.

## 7. Buddhist and Educational Content Integrity

Echo Buddha MUST distinguish:

- Historical evidence.
- Traditional belief.
- Doctrinal interpretation.
- Translation choice.
- Editorial commentary.
- Modern wellbeing or mindfulness opinion.

Content MUST identify Buddhist tradition, textual context, or scope where differences matter. It MUST avoid flattening Theravada, Mahayana, Vajrayana, secular mindfulness, and modern self-help into one undifferentiated voice.

Echo Buddha MUST:

- Attribute quotations accurately.
- Avoid invented or misattributed Buddha quotes.
- Avoid presenting modern paraphrase as ancient canonical quotation.
- Use reputable primary and secondary sources.
- Explain translated terminology carefully.
- Avoid sensational spiritual claims.
- Avoid unsupported promises of physical, psychological, financial, or supernatural outcomes.
- Avoid presenting meditation or religious practice as a replacement for professional medical or mental-health care.
- Correct factual errors transparently.
- Respect sacred material while preserving accuracy and clarity.

Wellbeing-adjacent pages, including anxiety, sleep, anger, grief, distress, or overthinking, MUST include appropriate limitations and careful sourcing.

## 8. Source, Citation, and Fact-Checking Standard

Preferred source hierarchy:

1. Primary Buddhist texts or public-domain / permission-safe translations where relevant.
2. Reputable Buddhist institutions, monastic/teacher publications, and recognized study resources.
3. Scholarly books, journals, university materials, or museum/library resources.
4. Reputable secondary explainers used only as context, not as sole authority for contested claims.
5. Echo Buddha's own prior pages only for internal linking, never as circular proof.

Citations or source notes are required for claims that are specific, historical, statistical, scientific, medical, contested, easily misunderstood, directly quoted, or attributed to a named person/text.

Rules:

- Direct quotes MUST be verified against the cited source.
- Public-domain status or quote permission MUST be understood before quoting at length.
- Statistics MUST include source, date, and context.
- External links SHOULD point to stable, reputable sources and open safely with `rel="noopener noreferrer"` when using a new tab.
- Broken links MUST be checked during audit and before major publication batches.
- When sources disagree, content MUST describe the disagreement or choose a narrower claim.
- Circular sourcing is not acceptable.

## 9. Authorship, Expertise, and Editorial Transparency

Current implementation uses organization-style authorship: `Echo Buddha Editorial`. Future content MUST NOT fabricate human credentials, monastic status, academic authority, clinical expertise, or personal experience.

Required transparency:

- Each article-like page SHOULD identify author or editorial entity.
- Author/profile pages SHOULD explain relevant scope and limits.
- About, Contact, Editorial Policy, Disclaimer, Privacy Policy, and Terms MUST remain discoverable.
- Correction process and contact method MUST remain clear.
- AI assistance, affiliate relationships, sponsored content, or commercial relationships MUST be disclosed if introduced.
- Reviewer information MAY be added only when real and relevant.

## 10. Content Lifecycle Governance

Required lifecycle:

1. Idea validation.
2. Search-intent validation.
3. Duplicate/cannibalization check against `docs/seo-content-cluster-map.md` and current sitemap.
4. Source collection.
5. Outline.
6. Drafting.
7. Fact-checking.
8. Editorial review.
9. SEO review.
10. Accessibility review.
11. Publication.
12. Internal linking.
13. Sitemap inclusion or intentional exclusion.
14. Search Console monitoring after deployment.
15. Periodic review.
16. Update, consolidation, redirect, noindex, or retirement.

Publication dates MUST reflect first publication. Modification dates MUST reflect substantial content updates, not trivial formatting. Stale pages SHOULD be updated only when a user or factual need exists. Retired URLs SHOULD preserve useful history with redirects unless the page is intentionally gone and a 404/410 is better.

## 11. Information Architecture

Current architecture is hub-and-detail oriented:

- Homepage introduces core sections.
- `/start-here/` orients beginners.
- `/learn/` contains learning sections and detail pages.
- `/meditation/` contains meditation guides.
- `/articles/` contains article index, categories, and articles.
- `/quotes/` contains quote categories and quote stories.
- `/daily-reflections/` contains daily reflection hub, detail pages, and today's reflection.
- `/tools/` provides interactive practice resources.
- Trust and policy pages live at stable top-level routes.

Target principles:

- Important pages SHOULD be reachable within a few clicks from crawlable HTML links.
- Parent-child relationships MUST be clear.
- Labels MUST be descriptive.
- No orphan indexable pages.
- No empty archive pages.
- No uncontrolled tag generation.
- No near-duplicate category pages.
- No confusing parallel taxonomies.
- URL patterns MUST remain consistent unless a planned migration and redirects exist.

## 12. Internal Linking Standard

Internal links MUST be crawlable HTML anchors when they matter for discovery. JavaScript-enhanced search and filters MAY improve UX but MUST NOT be the only path to important content.

Rules:

- Use descriptive anchor text.
- Link hubs to important child pages and child pages back to the appropriate hub.
- Related content MUST be relevant by intent, not just category.
- Breadcrumbs SHOULD be visible on detail pages and consistent with JSON-LD.
- Every indexable page MUST receive meaningful internal links.
- Broken links, redirect chains, redirect loops, and orphan pages MUST be checked in the audit.
- Avoid excessive repeated links and generic anchors where descriptive text is available.

## 13. URL Governance

Verified canonical hostname: `https://echobuddha.com` from repository configuration. Production uses HTTPS.

Rules:

- Canonicals MUST use absolute URLs.
- Internal links SHOULD align with canonical paths.
- Slugs MUST be lowercase, descriptive, hyphenated, and stable.
- Current code uses trailing slashes for page routes; future routes SHOULD preserve this pattern unless a full URL governance migration is approved.
- Query parameters on search and filters SHOULD NOT create indexable duplicate pages.
- Search result pages SHOULD remain `noindex, follow`.
- URL changes MUST include redirect planning, sitemap updates, internal link updates, canonical updates, and post-deployment validation.
- Do not prescribe or change `www`/non-`www` behavior beyond the verified non-`www` canonical without production and host-level review.

## 14. Crawlability, Rendering, and Indexability

Definitions:

- Crawlable means Googlebot can fetch the URL and resources are not blocked.
- Renderable means Google can process the content after HTML, CSS, and JavaScript.
- Indexable means robots controls, status codes, canonical signals, and content quality do not intentionally exclude the page.
- Canonical means Google has a preferred URL signal; Google may still select a different canonical.
- Eligible for ranking means technically indexable and useful enough to compete. Ranking is never guaranteed.

Requirements:

- Important pages MUST return successful HTTP responses.
- Soft 404s MUST be avoided.
- Critical content SHOULD be present in static HTML for this Astro site.
- Navigation MUST remain crawlable without relying only on client-side search.
- Draft, staging, search, low-value filters, and thin generated pages MUST be protected with appropriate controls.
- Blocked crawling is not the same as `noindex`.
- Sitemap, internal links, canonicals, redirects, and robots controls MUST align.

Indexing cannot be guaranteed by this repository or by sitemap submission.

## 15. Robots Governance

Current source robots file allows all user agents and lists the sitemap. Current production robots also includes Cloudflare-managed AI crawler/content-signal directives.

Rules:

- `robots.txt` SHOULD be used for crawl management, not as a privacy or noindex mechanism.
- Page-level `noindex` SHOULD be used when a crawlable page should not appear in Search.
- `nofollow` SHOULD be rare and justified.
- `X-Robots-Tag` MAY be used for non-HTML assets only if host/runtime support is confirmed.
- Staging and preview environments MUST not be indexable.
- Draft content MUST not be published into the crawlable production build.
- Search/filter pages SHOULD be `noindex, follow`.
- Asset crawling SHOULD remain open when assets are needed to render pages.
- Robots changes MUST be tested before deployment and verified after deployment.
- Cloudflare-managed robots changes MUST be reviewed at the platform level because they may not appear in repository diff.

## 16. XML Sitemap Standard

Sitemaps MUST include only canonical URLs intended for indexing.

Rules:

- Include successful, canonical, indexable pages.
- Exclude redirects, errors, duplicates, search results, blocked URLs, and `noindex` pages.
- `lastmod` MUST be accurate when present; omit it when no reliable update date exists.
- Sitemap URLs MUST match canonical protocol, hostname, and trailing-slash policy.
- Sitemap size/splitting MUST follow current Google limits if the site grows.
- The next audit MUST compare generated sitemap, production sitemap, route inventory, robots controls, and noindex state.

## 17. Canonicalization and Duplicate Content

Rules:

- Indexable pages SHOULD have self-referencing absolute canonicals.
- Canonicals, redirects, internal links, sitemap URLs, and Open Graph URLs SHOULD agree.
- Duplicate or near-duplicate pages SHOULD be consolidated by improving differentiation, redirecting, noindexing, or canonicalizing only when content is truly duplicate.
- Do not use canonicals as a substitute for fixing search-intent cannibalization.
- Query parameters, print views, archives, tags, and quote/story variants MUST be reviewed for duplicate risk.
- Similar articles MUST have distinct intent, title, H1, intro, examples, internal links, and unique value.

## 18. Metadata and Search Appearance

Metadata MUST be page-specific, accurate, and consistent with visible content.

Rules:

- Titles MUST be unique, human-readable, non-clickbait, and free from keyword stuffing.
- Meta descriptions MUST summarize the actual page and avoid repetition across templates.
- H1 MUST match the page's primary purpose.
- Heading hierarchy SHOULD support reading and scanning.
- Open Graph and Twitter metadata SHOULD use relevant images and descriptions.
- Article dates MUST be accurate.
- Author metadata MUST not imply fabricated expertise.
- Favicons and site name signals SHOULD remain consistent.
- Google may generate different title links or snippets.

## 19. Structured Data Governance

Current implementation emits global and page-level JSON-LD. Future audit MUST validate every schema type and property.

Appropriate schema types MAY include:

- `WebSite`, `Organization`, `SearchAction`.
- `Article` / `BlogPosting` for substantial article-like pages.
- `BreadcrumbList` where breadcrumbs exist.
- `CollectionPage` / `ItemList` for hubs and archives.
- `DefinedTerm` / `DefinedTermSet` for dictionary pages.
- `AboutPage`, `ContactPage`, `ProfilePage`, `PrivacyPolicy`, and basic `WebPage` where appropriate.
- `FAQPage` only when visible FAQ content genuinely exists and current Google eligibility rules support it.

Prohibited:

- Marking up invisible content.
- Fabricated ratings, reviews, credentials, or author information.
- Misleading FAQ markup.
- Schema types that do not match the page.
- Treating structured data as a ranking guarantee.

Structured data changes MUST be checked with Rich Results Test or Schema Markup Validator where applicable and monitored in Search Console after deployment.

## 20. Image and Media SEO

Rules:

- Images MUST be relevant and legally usable.
- Original visuals SHOULD be used where practical.
- Filenames SHOULD be descriptive.
- Alt text MUST describe purpose and context, not keyword lists.
- Decorative images SHOULD use empty alt text and appropriate hiding.
- Images SHOULD have stable dimensions or layout constraints to avoid shifts.
- Responsive formats, compression, and modern formats SHOULD be used.
- Lazy loading SHOULD not delay critical hero/LCP imagery.
- Captions and attribution SHOULD be used where they help users or comply with license requirements.
- Open Graph images MUST be inspectable, correctly sized, and accurate.

## 21. Page Experience and Core Web Vitals

Future testing MUST use current Google definitions and thresholds at the time of audit rather than assuming this document's date remains current.

Standards:

- Pages SHOULD load quickly, respond promptly, and remain visually stable.
- Main content MUST be easy to locate.
- Mobile and desktop reading experience MUST be strong.
- HTTPS MUST remain enabled.
- Intrusive interstitials MUST NOT block access to main content.
- Font loading, image loading, JavaScript, third-party scripts, ads, and embeds MUST be managed for performance.
- Lab data and field data SHOULD both be used when available.
- A perfect Lighthouse score is not proof of SEO success.
- Final AdSense pre-application review MUST include `npm run audit:lighthouse` or equivalent current Lighthouse/PageSpeed evidence, plus Search Console/Core Web Vitals field evidence when owner access is available.

## 22. Mobile-First Standards

Mobile pages MUST preserve content, metadata, structured data, internal links, images, and primary functionality available on desktop.

Requirements:

- Responsive navigation MUST be keyboard and touch usable.
- Text MUST be readable without zooming.
- Touch targets SHOULD be comfortably sized.
- Tables and media MUST not cause horizontal overflow.
- Ads, if introduced, MUST not dominate mobile viewports or obscure content.
- Mobile performance MUST be tested before major releases.

## 23. Accessibility Standards

Accessibility is a core quality requirement, not an optional SEO enhancement.

Echo Buddha MUST follow WCAG-aligned principles:

- Semantic HTML and landmarks.
- Keyboard access for navigation, search, overlays, forms, and tools.
- Visible focus states.
- Logical heading hierarchy.
- Clear form labels and error messaging.
- Useful alternative text.
- Sufficient color contrast.
- Reduced-motion support where motion is introduced.
- Screen-reader-friendly dialogs and navigation.
- Accurate `lang` attribute.
- Skip link preservation.
- Link purpose understandable from text or context.

Final pre-release and AdSense-readiness reviews MUST run `npm run audit:browser` or an equivalent browser-level accessibility pass. Manual keyboard and screen-reader spot checks are still recommended because automated tools cannot prove full accessibility.

## 24. UX and User-Friendliness Standard

Rules:

- Page purpose MUST be visible quickly.
- Navigation MUST be clear and predictable.
- Long pages SHOULD use table of contents or strong headings when useful.
- Search, filtering, related links, breadcrumbs, empty states, loading states, and 404 states SHOULD help users recover and continue.
- Calls to action MUST be honest and relevant.
- External links SHOULD behave clearly.
- No deceptive interactions, forced engagement, unnecessary pop-ups, dark patterns, or ad-like editorial deception.
- Main content MUST remain easy to locate and consume.

## 25. Recurring-User Value

Echo Buddha should earn repeat visits through genuine usefulness, not manipulation.

Appropriate mechanisms MAY include:

- Structured learning paths.
- Topic collections.
- Reading series.
- Daily or periodic reflections.
- Saved progress or bookmarks, if privacy and maintenance are solved.
- Glossaries, timelines, source libraries, or carefully designed tools.
- New-content discovery.
- Newsletter subscriptions or notifications only when user-controlled and privacy-reviewed.

Every recurring feature MUST demonstrate user need, concept alignment, privacy implications, maintenance feasibility, accessibility, SEO implications, and ownership. Addictive, misleading, intrusive, or unrelated engagement tactics are prohibited.

## 26. Search Console and Indexing Operations

Future operations SHOULD include:

- Property verification.
- Sitemap submission.
- URL Inspection for representative templates and important URLs.
- Page indexing report review.
- Crawl statistics review.
- Core Web Vitals and HTTPS report review.
- Structured-data enhancement monitoring.
- Manual actions and security issues review.
- Performance report review by query and page.
- Change annotations after deployments.

Sitemap submission is not an indexing guarantee. URL Inspection requests MUST NOT substitute for strong discovery, architecture, and content quality. Indexing problems MUST be diagnosed at page, template, and site levels.

## 27. Google AdSense Readiness

This document defines readiness standards only. It does not claim AdSense approval or eligibility.

Before applying, Echo Buddha MUST pass a separate AdSense-specific audit covering:

- Substantial original content.
- Clear website purpose.
- Easy navigation.
- Functional pages with no unfinished sections.
- Clear ownership, About page, Contact method, Privacy Policy, Terms, Editorial Policy, and Disclaimer.
- Appropriate consent implementation.
- Policy-compliant content.
- Copyright compliance.
- Sufficient main content above and around ads.
- Responsible ad placement and ad density.
- Strong mobile UX and acceptable performance.
- No deceptive ad presentation.
- No ads obscuring main content.
- No pages created mainly for ads.
- No invalid traffic generation.
- No encouragement of ad clicks.

AdSense compliance and readiness do not guarantee approval.

## 28. Privacy, Analytics, and Consent

Current implementation uses a first-party consent preference. Analytics is denied until the visitor explicitly opts in; a missing preference opens the privacy choice interface and never implies acceptance. Users can reject analytics, accept analytics from privacy settings, reopen settings, and withdraw analytics. The property ID is centralized in `src/data/site.ts`. Advertising storage, ad user data, and ad personalization remain denied. AdSense verification metadata and `public/ads.txt` are present, while runtime AdSense script loading and manual ad units remain disabled.

Rules:

- Data collection SHOULD be minimized.
- Privacy disclosures MUST remain accurate to actual scripts and services.
- Cookie consent and regional requirements MUST be reviewed before adding or changing analytics, AdSense, embeds, newsletters, or personalization.
- Consent mode MAY be needed depending on region and Google services; qualified legal/privacy review is required.
- Third-party scripts MUST be reviewed for privacy, security, performance, and user trust.
- Sensitive personal data MUST NOT be collected unless a future product decision, legal review, and security plan approve it.
- Consent interfaces MUST be clear and non-misleading.
- Final pre-release review MUST include browser network verification for first visit, returning rejected user, accept, withdrawal, mobile navigation, and keyboard/Escape behavior.

This document is not legal advice.

## 29. Generative AI and Automation Policy

AI may assist with research planning, outlining, editing, grammar review, code generation, test generation, metadata drafting, content-gap identification, internal-link suggestions, and audit support.

AI output MUST NOT be published or merged without human validation appropriate to the risk.

Required checks:

- Factual accuracy.
- Source accuracy.
- Quote accuracy.
- Originality and duplication.
- Hallucinations.
- Bias and insensitive framing.
- Template repetition.
- Search-engine-first content.
- Buddhist terminology and tradition context.
- Invented textual references.
- Unsupported scientific, wellbeing, or health claims.
- Copyright risk.
- Unsafe code.
- Accessibility regressions.
- SEO/indexing regressions.

Mass publication of minimally reviewed AI-generated pages is prohibited. Quality and value matter more than whether a tool was used.

## 30. Security and Trust

Baseline trust requirements:

- HTTPS MUST remain enabled.
- Dependencies SHOULD be maintained.
- Releases MUST NOT ship with unresolved high or critical `npm audit` advisories unless a documented security exception is approved.
- `public/_headers` MUST remain source-controlled for Cloudflare Static Assets hardening.
- Production response headers MUST be verified after deployment before claiming security headers are live.
- Current source-controlled header baseline includes `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security`, and `Content-Security-Policy-Report-Only`.
- External links SHOULD avoid unsafe destinations.
- Future forms MUST include spam prevention, privacy disclosure, and safe error handling.
- Third-party scripts MUST be reviewed.
- Mixed content, malicious redirects, deceptive downloads, and hidden scripts are prohibited.
- Contact-form or email-related privacy must be clear if forms are introduced.
- Unpublished content MUST not leak into production builds, sitemaps, search index JSON, or internal links.

This is not a full security standard; it covers search-quality and user-trust implications.

## 31. Repository and CI Governance

Current validation commands are:

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run audit:seo`
- `npm run audit:content`
- `npm run audit:phase8`
- `npm run audit:phase9`
- `npm run audit:governance:changes`
- `npm run audit:dependencies`
- `npm run audit:browser`
- `npm run audit:lighthouse`
- `npm run validate`
- `npm run validate:release`

The pull-request CI workflow runs `npm run validate:release` without deployment. Phase 9 makes route/indexability, topic-owner, source/trust, template, consent, security-header, AdSense-disabled-state, dependency, workflow-safety, and governance-document checks part of the release gate. Extended browser/Lighthouse checks and read-only production smoke checks run in separate workflows. Production deployment and rollback remain manual, separately authorized, environment-gated operations governed by `ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE.md`.

Future contributors and coding agents MUST:

1. Read this document before relevant work.
2. Identify applicable sections.
3. Inspect existing patterns before adding new ones.
4. Avoid parallel/conflicting implementations.
5. Add or update tests when behavior changes.
6. Run existing validation commands that apply; release handoff SHOULD use `npm run validate:release`.
7. Report SEO, accessibility, performance, content, privacy, and indexing implications.
8. Update this document when architecture or policy materially changes.
9. Avoid weakening mandatory rules without documenting the reason.
10. Preserve URLs or implement correct redirects when URLs change.

Future automated checks SHOULD cover duplicate/missing titles and descriptions, heading issues, broken links, orphan pages, canonicals, redirects, sitemap inconsistencies, `noindex` sitemap conflicts, robots conflicts, missing alt text, structured-data validity, missing dates, date inconsistencies, thin/near-duplicate pages, route/sitemap mismatch, accessibility violations, and performance regressions.

The current `audit:seo` command covers generated metadata, sitemap/indexability alignment, static links, image references, JSON-LD syntax, date relationships, hidden public output, low-inbound pages, and manifest presence. `audit:dependencies` enforces high/critical dependency security posture. `audit:browser` covers consent and automated accessibility evidence in system Chrome. `audit:lighthouse` covers representative mobile and desktop lab performance/accessibility. Future improvements SHOULD extend these checks as the site grows.

## 32. Page-Type Quality Matrix

| Page type | Current examples | Purpose | Primary intent | Indexing default | Canonical behavior | Required metadata/content | Structured-data eligibility | Link requirements | Quality risks | Update expectations | AdSense suitability |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Homepage | `/` | Introduce Echo Buddha and guide users to core sections. | Navigational / exploratory | Index | Self canonical | Clear site purpose, links to pillars, accurate title/description. | `WebSite`, `Organization`, possible `ItemList`. | Link to major hubs and trust pages. | Becoming a marketing page without learning value. | Update when IA changes. | Possible only after ads are approved and unobtrusive. |
| Start Here | `/start-here/` | Beginner orientation. | Navigational / educational | Index | Self canonical | Learning sequence and user-path choices. | `WebPage`, breadcrumbs if visible. | Link to beginner pillars. | Competing with beginner articles. | Update with IA changes. | Low ad priority. |
| Learn hub | `/learn/` | Central learning library. | Exploratory learning | Index | Self canonical | Section descriptions and crawlable links. | `CollectionPage`, `ItemList`, breadcrumbs. | Link to all learning sections. | Empty/unclear sections. | Update with learning model. | Possible with caution. |
| Learning section hub | `/learn/buddhism-101/` etc. | Group related lessons. | Educational / exploratory | Index | Self canonical | Intro, item list, source guidance where relevant. | `CollectionPage`, `DefinedTermSet` for dictionary. | Link to child pages and related pillars. | Duplicate hub/category intent. | Update with child pages. | Possible with caution. |
| Learning detail | `/learn/[section]/[slug]/` | Explain a focused teaching/term/theme. | Informational / definition / educational | Index if substantial | Self canonical | Clear H1, intro, takeaways, source notes, related links. | `Article`, `DefinedTerm` for dictionary. | Link to section hub and related terms/pages. | Thin definitions, source-light doctrinal claims. | Review when sources or content change. | Possible after quality review. |
| Meditation hub | `/meditation/` | Guide users to meditation practices. | Practical / exploratory | Index | Self canonical | Safety framing and practice links. | `CollectionPage`. | Link to meditation detail pages and related learning. | Health-adjacent overclaiming. | Review with practice changes. | Possible with low density. |
| Meditation detail | `/meditation/[slug]/` | Teach a practice. | Practical / instructional | Index if safe/substantial | Self canonical | Steps, limitations, related terms, safety note where needed. | `Article`, breadcrumbs. | Link to hub, terms, related practices. | Medical/mental-health claims. | Periodic safety/source review. | Possible only if ads do not interrupt practice. |
| Article index | `/articles/` | Browse article library. | Navigational / exploratory | Index | Self canonical | Category links, filter UX, article cards. | `Blog`, `ItemList`, breadcrumbs. | Link to categories and articles. | Too much filter-only discovery. | Update with article library. | Possible with caution. |
| Article category | `/articles/category/[category]/` | Browse article cluster. | Exploratory / category | Index if category has value | Self canonical | Unique category intro and article list. | `CollectionPage`, breadcrumbs. | Link to articles, quote categories, hub. | Thin/duplicate categories. | Update with article changes. | Possible with caution. |
| Article detail | `/articles/[slug]/` | Substantial educational article. | Informational / practical | Index | Self canonical | Author, dates, content, sources/notes, related links, title/description. | `BlogPosting`, `Article`, breadcrumbs, FAQ only if visible and valid. | Link to hub/category/cluster/related pages. | Duplicate clusters, source gaps, template repetition. | Review based on topic risk. | Suitable only after content and ad-layout audit. |
| Quotes index | `/quotes/` | Browse quote themes. | Exploratory | Index | Self canonical | Explain original quote nature and categories. | `CollectionPage`, `ItemList`. | Link to categories and trust/source notes. | Thin quote collection. | Update with quote themes. | Possible with caution. |
| Quote category | `/quotes/[category]/` | Present original quotes by theme. | Exploratory / inspirational | Index if substantial | Self canonical | Category meaning, quote cards, related teachings. | `CollectionPage`, breadcrumbs. | Link to quote stories and related teachings. | Thin list pages or unclear quote origin. | Review when quotes change. | Caution; ads can cheapen trust. |
| Quote story | `/quotes/[category]/[story]/` | Explain one quote. | Informational / reflective | Conditional; code supports noindex | Self canonical even when noindex | Quote status, meaning, source note, practice, related links. | `Article`, breadcrumbs. | Link to category, teaching, related quotes/articles. | Mass-generated thin stories. | Enrich or noindex. | Generally unsuitable until unique value proven. |
| Daily reflections hub | `/daily-reflections/` | Browse recurring reflections. | Recurring / exploratory | Index | Self canonical | Explain use, link to today and entries. | `CollectionPage`, `ItemList`. | Link to reflection details and practice areas. | Thin recurring content. | Update with reflection model. | Possible with caution. |
| Daily reflection detail | `/daily-reflections/[slug]/` | One reflection, practice, journal prompt. | Recurring / practical | Index if unique | Self canonical | Reflection, meaning, practice, links, limitations when needed. | `Article`, breadcrumbs. | Link to hub, today, tools, related teachings. | Repetitive daily pages. | Periodic uniqueness review. | Low suitability; avoid intrusive ads. |
| Today's reflection | `/daily-reflections/today/` | Dynamic current reflection entry point. | Recurring / navigational | Noindex, excluded from sitemap | Self canonical | Explain current reflection behavior. | `WebPage` and breadcrumbs as implemented. | Link to hub and selected detail. | Date/currentness ambiguity; duplicate with detail pages. | Keep as recurring-user utility and verify noindex/sitemap behavior. | Avoid ads. |
| Tools | `/tools/` | Practice timers/prompts/resources. | Practical / interactive | Index if useful | Self canonical | Functional controls and links. | `WebPage`, breadcrumbs. | Link to relevant guides. | Broken JS, inaccessible controls. | Test after JS changes. | Ads must not interfere. |
| Search | `/search/` | Site search. | Navigational | Noindex, follow | Self canonical | Search form, results states, helpful alternatives. | Global only unless expanded. | Link to hubs in no-result states. | Accidental indexation of query pages. | Test search index after content changes. | Not suitable for ads. |
| Trust/policy | `/about/`, `/contact/`, `/editorial-policy/`, `/privacy-policy/`, `/terms-of-use/`, `/disclaimer/`, `/authors/echo-buddha-editorial/` | Transparency and user trust. | Navigational / trust | Index unless legal review says otherwise | Self canonical | Accurate ownership, limits, contact, policy details. | Page-specific `AboutPage`, `ContactPage`, `ProfilePage`, etc. | Footer and relevant content links. | Outdated claims, legal inaccuracy, fabricated credentials. | Review after policy/service changes. | Usually no ads. |
| 404 | `/404.html` / missing URLs | Recovery from missing pages. | Error recovery | Noindex | No canonical in source | Helpful links and true 404 status. | Minimal/global only. | Link to main sections. | Soft 404 or indexable error page. | Test after hosting changes. | Not suitable. |

Planned or optional page types such as author pages for named people, tag pages, newsletters, user accounts, bookmarks, or community features are not currently verified as implemented and MUST be governed before introduction.

## 33. Definition of a Publishable Page

A page is not complete until applicable checks pass:

- User purpose is clear.
- Original value is documented.
- Accuracy and sources are reviewed.
- Authorship is accurate.
- Search intent is satisfied.
- Title, description, H1, and headings are unique and aligned.
- URL is stable and follows slug rules.
- Canonical is correct.
- Robots setting is intentional.
- Sitemap inclusion/exclusion is correct.
- Internal links exist in both directions where appropriate.
- Structured data matches visible content.
- Images are relevant, optimized, and accessible.
- Accessibility and keyboard behavior are checked.
- Mobile layout is checked.
- Performance risk is checked.
- Related content is relevant.
- Publication and modification dates are accurate.
- Policy, privacy, and AdSense implications are considered.
- Final human review is complete.

## 34. Audit Framework for the Next Phase

The next audit MUST use these categories:

1. Concept and topical-focus audit.
2. Content inventory.
3. Content quality and originality.
4. Content duplication and cannibalization.
5. Source and factual-integrity review.
6. Information architecture.
7. Internal linking.
8. URL structure.
9. Crawlability.
10. Indexability.
11. Canonicalization.
12. Sitemap.
13. Robots controls.
14. Redirects and status codes.
15. Metadata.
16. Structured data.
17. Image and media SEO.
18. JavaScript and rendering.
19. Mobile usability.
20. Core Web Vitals and performance.
21. Accessibility.
22. UX.
23. Trust and transparency.
24. Analytics and consent.
25. Security-related trust issues.
26. Recurring-user value.
27. AdSense readiness.
28. Testing and CI governance.

Severity scale:

- **Critical**: blocks access, crawling, indexing, security, legal safety, or primary functionality.
- **High**: significantly harms search performance, content quality, usability, trust, or monetization readiness.
- **Medium**: meaningful weakness that should be scheduled.
- **Low**: optimization or polish.
- **Observation**: informational finding requiring monitoring or a product decision.

Each finding MUST include finding, evidence, affected files or URLs, user impact, search impact, business impact, relevant governance rule, severity, recommended action, effort estimate, dependencies, validation method, and status.

Do not implement audit recommendations until the audit report is complete and approved.

## 35. Change-Approval Checklist

Future Codex tasks and pull requests MUST answer:

- What user problem does this change solve?
- Which governance sections apply?
- Does it create a new URL?
- Does it change an existing URL?
- Does it affect crawling or indexing?
- Does it change metadata?
- Does it change structured data?
- Does it change the sitemap or robots controls?
- Does it introduce duplicate content?
- Does it affect accessibility?
- Does it affect mobile usability?
- Does it affect performance?
- Does it introduce third-party scripts?
- Does it affect consent or privacy?
- Does it affect AdSense readiness?
- What tests and validations were completed?
- What documentation must be updated?

## 36. Exceptions Process

Exceptions MUST be documented before merge or publication.

An exception record MUST include:

- Rule being excepted.
- Business or technical reason.
- User impact.
- SEO impact.
- Accessibility impact.
- Privacy impact.
- Temporary or permanent status.
- Responsible owner.
- Review date.
- Mitigation.
- Reversal plan.

Undocumented exceptions are not permitted.

## 37. Governance Maintenance

Review cadence:

- Quarterly by default.
- Immediately after major changes or warnings.

Immediate review triggers:

- Major framework changes.
- Routing or domain changes.
- Content-model changes.
- New languages or internationalization.
- User-generated content.
- New analytics, advertising, consent, embeds, newsletters, or personalization.
- AdSense application preparation.
- Major Google documentation changes.
- Search Console warnings.
- Significant traffic or indexing changes.
- Security incidents.
- Major accessibility changes.
- Production robots or host-level policy changes.

Maintenance rules:

- Version history MUST be recorded below.
- Official guidance changes MUST be incorporated with links and review dates.
- Repository architecture changes MUST update the baseline.
- Audit findings SHOULD update rules where recurring problems appear.
- Deprecated rules MUST be recorded rather than silently removed.

### Version History

| Version | Date | Summary |
|---|---|---|
| 1.0.0 | 2026-07-21 | Initial governance source of truth created from repository inspection, limited production verification, and official Google Search / AdSense guidance. |
| 1.1.0 | 2026-07-21 | Stage B implementation update: consent-gated analytics, validation scripts, CI, SEO audit automation, structured-data simplification, robots operating model, and AdSense-readiness workflow. |
| 1.2.0 | 2026-07-21 | Content audit remediation update: quote-origin register, source register, meditation safety checklist, page-role map, content re-audit command, URL decision map, and AdSense page-type suitability matrix. |
| 1.3.0 | 2026-07-22 | Final readiness remediation update: dependency audit gate, Astro/Wrangler security upgrade path, source-controlled Cloudflare headers, browser consent/accessibility checks, Lighthouse evidence, and release validation gate. |
| 2.0.0 | 2026-08-13 | Phase 9 governance update: immutable action pins, least-privilege CI, exact-SHA build-once deployment, environment/concurrency controls, version-based rollback, production smoke checks, governance baselines, and mandatory release evidence. |

## 38. Content Audit Remediation Governance

The content audit remediation program is governed by `ECHO_BUDDHA_COMPLETE_CONTENT_AUDIT.md`, `ECHO_BUDDHA_CONTENT_AUDIT_IMPLEMENTATION_REPORT.md`, `src/data/editorialGovernance.ts`, and generated evidence under `docs/audits/content-audit/`.

Current required content-audit validation command:

- `npm run audit:content`

`npm run validate` MUST continue to include the content remediation audit after major content, sitemap, noindex, source, quote, trust-page, or AdSense-readiness changes.

### Quote-Origin Governance

Every quote-story page MUST have a quote-origin register row before being treated as ready for monetization or high-confidence indexing review.

Current allowed quote-origin classifications:

- Original Echo Buddha writing.
- Verified canonical quotation.
- Verified historical quotation.
- Verified modern quotation.
- Clearly labelled paraphrase.
- Traditional saying with uncertain origin.
- Attribution requires verification.
- Misattributed.
- Unsupported.

The current repository-safe default for existing quote stories is:

> Original Echo Buddha writing; not presented as a quotation from the Buddha or a Buddhist scripture.

No quote may be labelled as a Buddha quote, scripture quotation, historical saying, or named-person quote without reliable verification and copyright/translation review.

### Source Register and Translation Handling

The source register MUST identify source type, supported claim or topic, source title, author or translator where applicable, institution or publication, URL, copyright/license note, access date, verification status, and reviewer note.

Access to Insight, SuttaCentral, Dhammatalks, institutional Buddhist sources, universities, government health institutions, and scholarly references MAY be used when they support the specific claim. They MUST NOT be treated as interchangeable proof for all claims.

Long modern translations, copyrighted passages, and uncertain attribution require owner/legal review before reproduction.

### Meditation and Wellbeing Safety

Meditation, mindfulness, anxiety, sleep, anger, forgiveness, grief, distress, trauma-adjacent, or wellbeing-adjacent pages MUST be checked against the safety review queue and checklist.

These pages MUST NOT diagnose, treat, cure, guarantee calm, guarantee sleep, guarantee healing, or present Buddhist practice as a substitute for medical or mental-health support.

These pages SHOULD tell readers they may adapt, shorten, ground, open the eyes, choose a different anchor, maintain boundaries, or stop a practice when needed.

### Page-Role Mapping and Duplicate Review

Priority topic clusters MUST have one primary route for the main search intent. Supporting pages MUST have distinct roles such as cornerstone guide, beginner introduction, learning reference, dictionary definition, practical application, meditation instruction, source-study page, daily reflection, quote interpretation, topic hub, or supporting article.

Changing only the title or metadata is not enough to resolve cannibalization. Role differences SHOULD be visible through introduction, structure, examples, source notes, related links, and navigation context.

### Internal-Link Governance

Content-audit link opportunities SHOULD be reviewed after each build. Links should be implemented only where they help readers move from reflection to durable learning, from quote stories to source/trust context, from articles to primary hubs, and from meditation pages to safety/disclaimer context.

### URL Decisions

Every merge, redirect, noindex, or removal decision MUST be documented in `docs/audits/content-audit/url-decision-map.csv` before implementation.

The current page-specific URL decision is:

- `/daily-reflections/today/`: keep URL, add `noindex`, remove from sitemap, retain self-canonical, and keep internal links for recurring users.

### AdSense Page-Type Suitability

Ads remain disabled. Before any AdSense activation, `docs/audits/content-audit/adsense-page-type-suitability.csv` MUST be reviewed with the owner.

Current default restrictions:

- Search, 404, policy, privacy, terms, and disclaimer pages are not suitable for ads.
- Meditation pages must avoid ads inside practice instructions and near safety notes.
- Daily reflections must avoid ads near safety notes and should remain low-density.
- Quote stories require owner review until standalone value and origin review are complete.
- Articles, learning pages, hubs, and indexes require final content/source/safety review before ads.

### Re-Audit Cadence

Run a full content re-audit:

- Before final AdSense pre-application review.
- After material content-model changes.
- After quote-story or daily-reflection family changes.
- After any merge, redirect, noindex, or removal batch.
- Quarterly during active publication periods.
