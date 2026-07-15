# Echo Buddha Non-Article Content Audit

Audit date: 2026-07-15

Scope: all generated public non-article content. Protected article routes under `/articles/` were used only for overlap context and were not scored as editable content.

## Repository Architecture

- Framework: Astro 6 static build.
- Generated pages in the current build: 312 total.
- Generated non-article pages audited: 264.
- Protected article pages/categories excluded from scoring: 48.
- Source data counts: 37 learning pages, 6 meditation method pages, 153 quotes/story routes, 30 daily reflections, 42 protected articles.
- Shared systems: `src/data/learn.ts`, `src/data/site.ts`, `src/data/dailyReflections.ts`, `src/pages/sitemap.xml.ts`, and `src/pages/search-index.json.ts`.

## Public Non-Article Inventory

- Buddhist dictionary: 13
- Daily reflections: 32
- Homepage and high-level entry: 3
- Learning content: 22
- Meditation content: 8
- Practice tools and interactive content: 1
- Quotes content: 164
- Supporting and technical public pages: 2
- Sutta and Dhammapada content: 12
- Trust and institutional content: 7

Reconciliation findings:

- Missing from sitemap: `/quotes/awareness/clear-seeing-begins-with-the-courage-to-stop-looking/`, `/quotes/awareness/feelings-are-honest-about-their-presence-not-always-about/`, `/quotes/awareness/notice-the-habit-before-trying-to-become-someone-without/`, `/quotes/awareness/what-you-can-observe-clearly-no-longer-controls-you/`, `/quotes/awareness/when-the-mind-tightens-let-the-body-be-your/`, `/quotes/compassion/let-your-boundaries-be-clear-and-your-heart-remain/`, `/quotes/compassion/offer-others-the-patience-you-hope-to-receive-on/`, `/quotes/compassion/small-kindnesses-often-reach-places-that-advice-cannot/`, `/quotes/compassion/the-heart-becomes-spacious-each-time-it-chooses-care/`, `/quotes/compassion/to-understand-someone-is-not-to-excuse-harm-it/`, `/quotes/compassion/when-you-cannot-remove-anothers-burden-do-not-add/`, `/quotes/impermanence/acceptance-begins-where-the-argument-with-change-ends/`, `/quotes/impermanence/hold-each-day-carefully-knowing-it-cannot-be-held/`, `/quotes/impermanence/no-season-is-asked-to-remain-in-order-to/`, `/quotes/impermanence/what-changes-is-not-always-lost-sometimes-it-is/`, `/quotes/letting-go/freedom-often-sounds-like-the-quiet-end-of-an/`, `/quotes/letting-go/let-the-feeling-pass-through-without-building-it-a/`, `/quotes/letting-go/release-the-outcome-but-keep-the-care-you-bring/`, `/quotes/letting-go/what-leaves-your-life-may-still-leave-wisdom-behind/`, `/quotes/letting-go/you-do-not-betray-a-memory-by-allowing-yourself/`, `/quotes/meditation/do-not-search-meditation-for-a-special-self-notice/`, `/quotes/meditation/every-return-from-distraction-strengthens-the-path-home/`, `/quotes/meditation/sit-with-the-day-as-it-is-before-asking/`, `/quotes/meditation/the-bell-fades-but-careful-listening-can-continue/`, `/quotes/meditation/when-stillness-feels-impossible-begin-by-noticing-the-restlessness/`, `/quotes/mindfulness/a-wandering-mind-is-not-a-failed-mind-it/`, `/quotes/mindfulness/awareness-begins-when-hurry-loosens-its-hold/`, `/quotes/mindfulness/give-one-ordinary-task-the-dignity-of-your-full/`, `/quotes/mindfulness/listen-to-the-moment-before-filling-it-with-your/`, `/quotes/mindfulness/the-more-clearly-you-notice-life-the-less-carelessly/`, `/quotes/patience/a-difficult-moment-becomes-heavier-when-we-demand-that/`, `/quotes/patience/patience-makes-room-for-truth-to-arrive-without-force/`, `/quotes/patience/some-answers-become-clear-only-after-the-mind-stops/`, `/quotes/patience/stay-gentle-with-beginnings-they-are-carrying-more-than/`, `/quotes/patience/the-path-unfolds-at-the-pace-of-sincere-practice/`, `/quotes/practice/a-peaceful-life-is-built-from-peaceful-moments-practiced/`, `/quotes/practice/begin-with-what-is-possible-then-return-tomorrow/`, `/quotes/practice/bring-the-teaching-into-the-place-where-you-are/`, `/quotes/practice/daily-practice-turns-understanding-from-an-idea-into-a/`, `/quotes/practice/the-path-is-shaped-by-what-you-repeat-when/`, `/quotes/renewal/a-mistake-becomes-a-teacher-when-honesty-enters-the/`, `/quotes/renewal/do-not-confuse-an-old-pattern-with-an-unchangeable/`, `/quotes/renewal/each-conscious-breath-is-a-small-vote-for-beginning/`, `/quotes/renewal/hope-can-be-quiet-and-still-keep-walking/`, `/quotes/renewal/repair-what-you-can-forgive-what-you-cannot-redo/`, `/quotes/wisdom/a-useful-truth-is-carried-with-humility-not-used/`, `/quotes/wisdom/learn-from-discomfort-without-turning-suffering-into-an-identity/`, `/quotes/wisdom/see-the-conditions-behind-an-action-and-blame-may/`, `/quotes/wisdom/the-wise-heart-changes-course-when-clearer-seeing-arrives/`, `/quotes/wisdom/wisdom-is-less-interested-in-winning-than-in-ending/`, `/search/`.
- Sitemap-only non-article routes: none found.
- Missing from search index, excluding legal/404 defaults: `/quotes/`, `/quotes/awareness/`, `/quotes/compassion/`, `/quotes/impermanence/`, `/quotes/letting-go/`, `/quotes/meditation/`, `/quotes/mindfulness/`, `/quotes/patience/`, `/quotes/practice/`, `/quotes/renewal/`, `/quotes/wisdom/`, `/search/`.
- Search-index-only non-article routes: none found.
- Potential orphan routes: none found.

## Highest-Priority Findings

1. Source-awareness is the main long-term risk outside articles. 0 non-article pages fall into Tier 1 or Tier 2 source needs without external source links in generated content. This is most important for dictionary, Dhammapada, sutta, Four Noble Truths, Eightfold Path, karma, anicca/dukkha/anatta, metta/karuna, and meditation-method pages.

2. Quote stories are the largest non-article content family. Every quote generates a story route, while indexability is controlled per record. The template clearly labels these as original Echo Buddha reflections, which is good, but the scale and shared scaffolding create the strongest mass-generated/template risk.

3. Daily reflections have a genuine return-use model, but `/daily-reflections/today/` changes content under one stable URL using UTC day-of-year rotation. That is useful for humans and potentially confusing for indexing unless intentionally treated as a recurring utility route rather than a canonical archive item.

4. Learning, dictionary, sutta, Dhammapada, and meditation pages share one `LearningPage` shape. This is maintainable, but it also repeats blocks such as Key Takeaway, Why This Matters, Practice Today, Reflection Question, and source/safety notes. Future expansion should add page-specific source scaffolding before adding more pages.

5. The strongest cannibalization clusters are beginner Buddhism, meditation for beginners, breathing/mindfulness of breathing, loving-kindness/metta/compassion, Four Noble Truths, Eightfold Path, and quotes versus daily reflections. The current architecture can support distinct roles, but only if hubs stay navigational, dictionary pages stay concise, meditation pages stay procedural, reflections stay daily-practice prompts, and protected articles remain long-form depth.

## AdSense And Indexing Readiness

- Positive: static crawlable HTML, canonical tags, global WebSite/Organization schema, page-level Article/Breadcrumb/Collection/DefinedTerm schema, sitemap generation, and search-index generation all exist.
- Caution: quote-story volume and repeated scaffolding may look mass-produced if many pages remain indexable without enough unique story/reflection value.
- Caution: source-light doctrinal pages are risky for trust, Buddhist integrity, and future AdSense review.
- Caution: Ad slots are present in templates while ads are disabled. Before enabling ads, test meditation/tool pages so controls and safety notes are not interrupted.

## Recommendation Matrix

- Keep unchanged: static trust pages, policy pages, search route, and clear hub pages after metadata/link preservation.
- Strengthen role: homepage, Start Here, Learn hub, Meditation hub, Quotes hub, Daily Reflections hub.
- Source review: Tier 1 doctrine, dictionary, Dhammapada, sutta, and Tier 2 meditation method pages.
- Human rewrite / template reduction: quote stories and daily reflections with high repeated sentence/paragraph patterns.
- Recommendation-only merge/noindex candidates: low-uniqueness quote story routes currently protected by noindex logic unless individually reviewed.
- Do not change in this audit: article URLs/content, canonical ownership, redirects, noindex settings, slugs, headings, hrefs, route generation, navigation, or public content.

## Generated Audit Artifacts

- `ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json`
- `ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json`
- `ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.csv`
- `ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json`
- `ECHOBUDDHA_NON_ARTICLE_ROUTE_EVALUATION.json`
- `ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json`
- `ECHOBUDDHA_NON_ARTICLE_OVERLAP_CLUSTERS.json`
- `ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json`
