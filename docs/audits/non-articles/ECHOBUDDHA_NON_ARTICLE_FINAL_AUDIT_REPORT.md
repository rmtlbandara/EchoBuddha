# Echo Buddha Non-Article Content Audit

Audit date: 2026-08-11

Scope: all generated public non-article content. Protected article routes under `/articles/` were used only for overlap context and were not scored as editable content.

## Repository Architecture

- Framework: Astro 6 static build.
- Generated pages in the current build: 312 total.
- Generated non-article pages audited: 280.
- Protected article pages/categories excluded from scoring: 56.
- Source data counts: 45 learning pages, 9 meditation method pages, 153 quotes/story routes, 30 daily reflections, 50 protected articles.
- Shared systems: `src/data/learn.ts`, `src/data/site.ts`, `src/data/dailyReflections.ts`, `src/pages/sitemap.xml.ts`, and `src/pages/search-index.json.ts`.

## Public Non-Article Inventory

- Buddhist dictionary: 15
- Daily reflections: 32
- Homepage and high-level entry: 3
- Learning content: 26
- Meditation content: 11
- Practice tools and interactive content: 1
- Quotes content: 164
- Supporting and technical public pages: 7
- Sutta and Dhammapada content: 14
- Trust and institutional content: 7

Reconciliation findings:

- Missing from sitemap: `/daily-reflections/anger-as-a-signal/`, `/daily-reflections/begin-again-without-shame/`, `/daily-reflections/compassion-begins-nearby/`, `/daily-reflections/enough-for-this-moment/`, `/daily-reflections/evening-release/`, `/daily-reflections/family-patience/`, `/daily-reflections/forgiveness-without-approval/`, `/daily-reflections/gratitude-for-change/`, `/daily-reflections/gratitude-notices-enough/`, `/daily-reflections/impermanence-softens-clinging/`, `/daily-reflections/kindness-with-boundaries/`, `/daily-reflections/let-the-feeling-pass/`, `/daily-reflections/letting-go-keeps-care/`, `/daily-reflections/listen-before-answering/`, `/daily-reflections/metta-for-a-difficult-person/`, `/daily-reflections/mindful-work/`, `/daily-reflections/morning-intention/`, `/daily-reflections/notice-before-fixing/`, `/daily-reflections/one-honest-breath/`, `/daily-reflections/one-step-on-the-path/`, `/daily-reflections/patience-before-anger-speaks/`, `/daily-reflections/rest-without-escape/`, `/daily-reflections/see-the-conditions/`, `/daily-reflections/simple-goodwill/`, `/daily-reflections/small-actions-shape-the-mind/`, `/daily-reflections/soften-the-inner-argument/`, `/daily-reflections/speech-can-reduce-suffering/`, `/daily-reflections/the-first-truth-is-kind/`, `/daily-reflections/thoughts-are-visitors/`, `/daily-reflections/today/`, `/daily-reflections/walking-as-practice/`, `/quotes/awareness/anger-asks-for-speed-awareness-asks-for-one-more/`, `/quotes/awareness/awareness-does-not-remove-the-storm-it-keeps-you/`, `/quotes/awareness/clear-seeing-begins-with-the-courage-to-stop-looking/`, `/quotes/awareness/feelings-are-honest-about-their-presence-not-always-about/`, `/quotes/awareness/look-beneath-the-reaction-and-you-may-find-a/`, `/quotes/awareness/name-the-feeling-gently-and-it-may-stop-speaking/`, `/quotes/awareness/notice-the-habit-before-trying-to-become-someone-without/`, `/quotes/awareness/small-acts-of-attention-can-turn-an-ordinary-day/`, `/quotes/awareness/the-body-often-knows-you-are-overwhelmed-before-the/`, `/quotes/awareness/what-you-can-observe-clearly-no-longer-controls-you/`, `/quotes/awareness/when-the-mind-tightens-let-the-body-be-your/`, `/quotes/compassion/a-gentle-response-can-end-suffering-that-anger-would/`, `/quotes/compassion/before-judging-another-life-remember-how-much-of-your/`, `/quotes/compassion/compassion-asks-what-hurts-before-it-asks-who-is/`, `/quotes/compassion/compassion-grows-where-judgment-loosens-its-grip/`, `/quotes/compassion/kindness-does-not-need-an-audience-to-become-meaningful/`, `/quotes/compassion/let-kindness-be-the-echo-you-leave-in-every/`, `/quotes/compassion/let-your-boundaries-be-clear-and-your-heart-remain/`, `/quotes/compassion/offer-others-the-patience-you-hope-to-receive-on/`, `/quotes/compassion/small-kindnesses-often-reach-places-that-advice-cannot/`, `/quotes/compassion/the-heart-becomes-spacious-each-time-it-chooses-care/`, `/quotes/compassion/to-understand-someone-is-not-to-excuse-harm-it/`, `/quotes/compassion/when-you-cannot-remove-anothers-burden-do-not-add/`, `/quotes/impermanence/acceptance-begins-where-the-argument-with-change-ends/`, `/quotes/impermanence/because-this-moment-will-pass-meet-it-while-it/`, `/quotes/impermanence/change-takes-nothing-personally-it-simply-continues/`, `/quotes/impermanence/everything-changes-including-the-part-of-you-that-fears/`, `/quotes/impermanence/hold-each-day-carefully-knowing-it-cannot-be-held/`, `/quotes/impermanence/no-season-is-asked-to-remain-in-order-to/`, `/quotes/impermanence/the-fading-flower-does-not-make-its-blooming-less/`, `/quotes/impermanence/the-passing-of-joy-teaches-gratitude-the-passing-of/`, `/quotes/impermanence/todays-certainty-may-become-tomorrows-lesson-in-humility/`, `/quotes/impermanence/what-changes-is-not-always-lost-sometimes-it-is/`, `/quotes/letting-go/an-open-hand-can-care-for-what-a-clenched/`, `/quotes/letting-go/freedom-often-sounds-like-the-quiet-end-of-an/`, `/quotes/letting-go/let-the-feeling-pass-through-without-building-it-a/`, `/quotes/letting-go/letting-go-begins-by-admitting-how-tightly-you-are/`, `/quotes/letting-go/peace-enters-when-control-is-no-longer-the-price/`, `/quotes/letting-go/release-the-need-to-replay-what-can-no-longer/`, `/quotes/letting-go/release-the-outcome-but-keep-the-care-you-bring/`, `/quotes/letting-go/what-leaves-your-life-may-still-leave-wisdom-behind/`, `/quotes/letting-go/you-can-honor-the-past-without-asking-it-to/`, `/quotes/letting-go/you-do-not-betray-a-memory-by-allowing-yourself/`, `/quotes/letting-go/you-do-not-need-to-carry-every-thought-that/`, `/quotes/meditation/a-short-sincere-practice-can-steady-a-long-and/`, `/quotes/meditation/do-not-search-meditation-for-a-special-self-notice/`, `/quotes/meditation/every-return-from-distraction-strengthens-the-path-home/`, `/quotes/meditation/follow-the-breath-lightly-as-you-would-listen-to/`, `/quotes/meditation/meditation-is-not-leaving-life-it-is-learning-how/`, `/quotes/meditation/silence-is-not-empty-when-the-heart-is-listening/`, `/quotes/meditation/sit-with-the-day-as-it-is-before-asking/`, `/quotes/meditation/sit-without-demanding-silence-and-the-mind-will-teach/`, `/quotes/meditation/the-bell-fades-but-careful-listening-can-continue/`, `/quotes/meditation/the-cushion-is-a-place-to-practice-returning-not/`, `/quotes/meditation/when-stillness-feels-impossible-begin-by-noticing-the-restlessness/`, `/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/`, `/quotes/mindfulness/a-wandering-mind-is-not-a-failed-mind-it/`, `/quotes/mindfulness/awareness-begins-when-hurry-loosens-its-hold/`, `/quotes/mindfulness/give-one-ordinary-task-the-dignity-of-your-full/`, `/quotes/mindfulness/listen-to-the-moment-before-filling-it-with-your/`, `/quotes/mindfulness/notice-what-is-here-before-deciding-what-it-means/`, `/quotes/mindfulness/one-mindful-pause-can-change-the-direction-of-an/`, `/quotes/mindfulness/peace-grows-when-attention-stops-running-ahead-of-the/`, `/quotes/mindfulness/return-to-the-breath-before-you-return-to-the/`, `/quotes/mindfulness/the-more-clearly-you-notice-life-the-less-carelessly/`, `/quotes/mindfulness/the-present-moment-asks-for-your-attention-not-your/`, `/quotes/patience/a-difficult-moment-becomes-heavier-when-we-demand-that/`, `/quotes/patience/be-patient-with-the-part-of-you-that-is/`, `/quotes/patience/growth-is-quiet-work-often-invisible-until-the-season/`, `/quotes/patience/not-every-delay-is-an-obstacle-some-are-invitations/`, `/quotes/patience/patience-is-the-strength-to-remain-present-while-life/`, `/quotes/patience/patience-makes-room-for-truth-to-arrive-without-force/`, `/quotes/patience/some-answers-become-clear-only-after-the-mind-stops/`, `/quotes/patience/stay-gentle-with-beginnings-they-are-carrying-more-than/`, `/quotes/patience/the-path-unfolds-at-the-pace-of-sincere-practice/`, `/quotes/patience/wait-long-enough-for-the-first-reaction-to-become/`, `/quotes/patience/when-anger-rises-pause-long-enough-to-see-the/`, `/quotes/practice/a-peaceful-life-is-built-from-peaceful-moments-practiced/`, `/quotes/practice/begin-with-what-is-possible-then-return-tomorrow/`, `/quotes/practice/bring-the-teaching-into-the-place-where-you-are/`, `/quotes/practice/daily-practice-turns-understanding-from-an-idea-into-a/`, `/quotes/practice/do-not-wait-to-feel-ready-before-choosing-what/`, `/quotes/practice/practice-becomes-real-when-it-enters-your-speech-and/`, `/quotes/practice/the-path-is-not-far-away-it-is-the/`, `/quotes/practice/the-path-is-shaped-by-what-you-repeat-when/`, `/quotes/practice/the-smallest-wholesome-action-is-larger-than-the-finest/`, `/quotes/practice/walk-slowly-enough-to-notice-where-your-life-is/`, `/quotes/practice/your-next-response-is-always-part-of-the-path/`, `/quotes/renewal/a-mistake-becomes-a-teacher-when-honesty-enters-the/`, `/quotes/renewal/a-new-direction-can-start-with-one-different-choice/`, `/quotes/renewal/begin-again-gently-the-breath-is-always-willing/`, `/quotes/renewal/begin-again-without-turning-yesterday-into-a-sentence/`, `/quotes/renewal/do-not-confuse-an-old-pattern-with-an-unchangeable/`, `/quotes/renewal/each-conscious-breath-is-a-small-vote-for-beginning/`, `/quotes/renewal/hope-can-be-quiet-and-still-keep-walking/`, `/quotes/renewal/morning-is-not-the-only-time-a-life-can/`, `/quotes/renewal/repair-what-you-can-forgive-what-you-cannot-redo/`, `/quotes/renewal/the-path-welcomes-your-return-more-often-than-pride/`, `/quotes/renewal/you-are-allowed-to-learn-slowly-and-still-be/`, `/quotes/wisdom/a-clear-mind-can-hold-two-truths-without-rushing/`, `/quotes/wisdom/a-useful-truth-is-carried-with-humility-not-used/`, `/quotes/wisdom/knowing-when-not-to-speak-is-also-a-form/`, `/quotes/wisdom/learn-from-discomfort-without-turning-suffering-into-an-identity/`, `/quotes/wisdom/see-the-conditions-behind-an-action-and-blame-may/`, `/quotes/wisdom/the-lesson-repeats-until-attention-replaces-habit/`, `/quotes/wisdom/the-wise-heart-changes-course-when-clearer-seeing-arrives/`, `/quotes/wisdom/what-feels-urgent-is-not-always-what-matters-most/`, `/quotes/wisdom/wisdom-is-less-interested-in-winning-than-in-ending/`, `/quotes/wisdom/wisdom-is-the-art-of-meeting-life-without-adding/`, `/quotes/wisdom/wisdom-sees-the-whole-fire-not-only-the-spark/`, `/search/`.
- Sitemap-only non-article routes: none found.
- Missing from search index, excluding legal/404 defaults: `/quotes/awareness/`, `/quotes/compassion/`, `/quotes/impermanence/`, `/quotes/letting-go/`, `/quotes/meditation/`, `/quotes/mindfulness/`, `/quotes/patience/`, `/quotes/practice/`, `/quotes/renewal/`, `/quotes/wisdom/`, `/search/`.
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
