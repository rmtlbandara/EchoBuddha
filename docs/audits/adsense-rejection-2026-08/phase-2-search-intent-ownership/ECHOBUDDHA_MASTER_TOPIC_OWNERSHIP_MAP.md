# Echo Buddha Master Topic Ownership Map

**Phase:** 2 — Search Intent & Content Ownership Restructuring
**Mode:** Architecture and governance only; no destructive implementation
**Date:** 2026-08-11 (Asia/Colombo)
**Branch:** `codex/phase-2-search-intent-ownership`
**Starting HEAD:** `a1cd457345587670133bfc58af1cafd80d038e6e`
**Status:** **PHASE 2 COMPLETE — READY FOR OWNER REVIEW**

This report defines Echo Buddha's proposed content ownership architecture. It does not change content, titles, headings, URLs, canonicals, redirects, index directives, internal links, navigation, advertising, consent, or production.

## 1. Executive Summary

Phase 2 role-mapped all **283 current indexable pages** across **40 meaningful clusters** and selected **40 primary owners**. Every mapped URL has exactly one controlled primary role, one primary topic owner, an audience stage, an intent, concrete information gain, a “why this page exists” statement, and a “this page does not own” boundary.

The architecture confirms that Learn should generally own broad doctrine, dedicated articles may own applied or otherwise uncovered topics, source-study pages must stay source-specific, practice pages must stay method-specific, and recurring/quote content must not become broad teaching owners.

The conflict register contains **12 medium**, **11 high**, and **0 critical** ownership cases. Seven pages remain consolidation candidates from Phase 1; 90 pages remain noindex-review candidates for Phase 3; zero redirects are pre-approved. Thirteen clusters are under a temporary expansion hold.

## 2. Phase 1 Inputs

The completed Phase 1 package in `../phase-1-root-cause/` was the primary input. The master quality matrix, page-decision register, overlap review, family reviews, source review, trust review, and confidence matrix were reconciled rather than regenerated.

Phase 1 established 336 built pages, 283 indexable pages, 60 indexable mechanically generated quote stories, 30 indexable structurally identical daily reflections, seven consolidation candidates, and a likely site-level differentiation problem. Phase 2 converts those findings into durable roles without executing the recommendations.

Search Console evidence remains **STALE / INSUFFICIENT**: the newest repository export ends 2026-08-02 and contains too little post-remediation evidence for destructive decisions.

## 3. Current Site Architecture

Echo Buddha currently combines:

- broad Learn pillars and sequenced lessons;
- editorial articles and category archives;
- dictionary definitions;
- Dhammapada and sutta source-study routes;
- meditation hubs and practice details;
- quote hub, categories, and stories;
- a recurring daily-reflection system;
- trust/policy and utility routes.

The existing `src/data/editorialGovernance.ts` contains 62 topic-role records and 14 historical primary owners. It is useful but incomplete. This Phase 2 package reconciles and extends it as a proposed architecture; runtime metadata was deliberately not altered before owner approval.

Git baseline: local HEAD and `origin/main` both equaled `a1cd457` at Phase 2 start, with no divergence. The latest GitHub `Validate` run for that SHA passed on 2026-08-06. Uncommitted Phase 1 evidence and three validation-generated audit refreshes were present and preserved.

## 4. Ownership Methodology

Owner selection used audience, user need, intent, role, depth, source role, journey role, current quality, internal architecture, and Phase 1 evidence. Page age, URL brevity, word count, historical pillar labels, and minor search-position differences were not decisive.

The internal rule is **one meaningful user intent → one clear owner**. This is an Echo Buddha architecture framework, not a claim that Google publishes a one-keyword/one-URL policy.

Current official guidance checked for this phase supports people-first, original, substantial content; clear hierarchy and crawlable internal links; and avoidance of scaled low-value content. It does not prohibit useful templates or multiple pages with genuinely different purposes:

- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Make pages ready for AdSense](https://support.google.com/adsense/answer/7299563)
- [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/10502938)

## 5. Page Role Taxonomy

Controlled primary roles are: `PRIMARY_PILLAR`, `BEGINNER_FOUNDATION`, `SUPPORTING_EXPLANATION`, `PRACTICAL_APPLICATION`, `PRACTICE_GUIDE`, `SOURCE_STUDY`, `DICTIONARY_DEFINITION`, `COMPARISON_PAGE`, `SCENARIO_GUIDE`, `HUB`, `CATEGORY`, `RECURRING_USER_CONTENT`, `QUOTE_REFLECTION`, `UTILITY`, `TRUST_POLICY`, and exceptional `OTHER`.

The generated role distribution contains 21 primary pillars, 14 hubs, 15 categories, 15 practical applications, 13 practice guides, 15 source studies, 12 definitions, 11 beginner foundations, 10 supporting explanations, 9 scenario guides, 2 comparison pages, 103 quote reflections, 30 recurring reflections, 12 trust/policy pages, and 1 utility page. No page required `OTHER`.

## 6. Search Intent Taxonomy

Controlled intents are `FOUNDATIONAL_INFORMATIONAL`, `BEGINNER_INFORMATIONAL`, `DEFINITIONAL`, `COMPARATIVE`, `SOURCE_STUDY`, `PRACTICAL_HOW_TO`, `SCENARIO_APPLICATION`, `MEDITATION_PRACTICE`, `REFLECTIVE`, `RECURRING_USER`, `NAVIGATIONAL`, `TRUST`, and `UTILITY`.

Query themes in the registers are editorial themes, not invented volumes or exact-match targets.

## 7. Audience Stage Taxonomy

Controlled stages are `NEWCOMER`, `BEGINNER`, `PRACTITIONER`, `RETURNING_READER`, `SOURCE_CURIOUS`, `GENERAL_READER`, `SITUATION_SPECIFIC`, and `ADVANCED / NUANCED` where required.

Different audience stages justify separate pages only when execution visibly serves those stages.

## 8. Master Topic Ownership Principles

1. Broad doctrine belongs to one protected pillar.
2. Navigation hubs organize; they do not absorb detail-page intent.
3. Support pages need concrete source, practice, scenario, comparison, or audience-stage value.
4. Source study points toward the doctrinal owner.
5. Practice pages teach a method and link to relevant teaching and safety.
6. Dictionary definitions stay linguistic/doctrinal and point to broader learning.
7. Quote and daily content never become broad topic owners merely by mentioning a teaching.
8. Medium/high-conflict clusters cannot receive new indexable pages until resolved.
9. No destructive Phase 3 action is implied by an ownership label alone.

## 9. Beginner Buddhism Cluster

**Protected owner:** `/learn/buddhism-for-beginners/` — structured beginner foundation.
**Orientation:** `/start-here/` helps newcomers choose a route; it does not define Buddhism.
**Support:** the first-week and at-home pages own practical entry routines. `/learn/buddhism-101/what-is-buddhism/` owns a sequenced lesson. `/articles/what-is-buddhism-beginner-guide/` must specialize in misconception-clearing/orientation.
**High conflict:** `/articles/buddhism-for-beginners-simple-guide/` remains a consolidation candidate.

## 10. Four Noble Truths Cluster

**Protected owner:** `/learn/four-noble-truths/`.
**Source role:** the Dhammacakkappavattana Sutta page studies the canonical source.
**Course role:** the Buddhism 101 lesson survives only as an explicitly sequenced lesson.
**Article role:** `/articles/four-noble-truths-explained/` must own misconceptions and worked application, not another broad definition.
**High conflict:** the “explained simply” article remains a consolidation candidate.

## 11. Noble Eightfold Path Cluster

**Protected owner:** `/learn/eightfold-path/`.
**Source role:** the Magga-vibhanga page owns canonical-source context.
**Support roles:** the Buddhism 101 lesson is a course step; the Threefold Training page explains the three-part framework.
**High conflicts:** the daily-life article and practical-guide article remain consolidation candidates. The general explained article needs narrower framework/misconception ownership.

## 12. Karma Cluster

**Protected owner:** `/learn/buddhism-101/what-is-karma-in-buddhism/`.
The dictionary page owns concise definition and terminology. The article owns intention, habit, and consequence in daily choices. Quote/reflection references remain non-owning.

## 13. Five Precepts Cluster

**Protected owner:** `/learn/buddhism-101/five-precepts-buddhism/`.
`/articles/five-precepts-in-daily-life/` owns applied ethical scenarios. Right Speech and Right Livelihood pages link back as narrower factors/applications.

## 14. Three Poisons Cluster

**Protected owner:** `/articles/three-poisons-buddhism-explained/`.
Anger is a scenario/support cluster beneath aversion; it does not replace the complete greed-aversion-delusion framework.

## 15. Impermanence Cluster

**Protected owner:** `/learn/buddhism-101/what-is-impermanence/`.
`/learn/buddhist-dictionary/anicca/` owns term-level meaning. `/articles/buddhist-teachings-on-impermanence/` may survive as source/teaching context. Both `/articles/impermanence-in-buddhism/` and `/articles/impermanence-in-buddhism-letting-go/` remain consolidation candidates because their broad definition/application overlaps the owner and attachment cluster.

## 16. Attachment / Non-Attachment / Letting Go Cluster

**Protected owner:** `/articles/how-to-let-go-of-attachment-in-buddhism/`.
`how-to-practice-non-attachment` must own a repeatable practice; `letting-go-without-giving-up` owns the commitment-versus-release distinction; `non-attachment-in-relationships` owns a relationship scenario. Quote and daily pages remain reflective/recurring only.

## 17. Compassion Cluster

**Protected owner:** `/articles/compassion-in-buddhism-beginner-guide/`, replacing the Phase 1 provisional dictionary owner.
`compassion` and `karuna` dictionary pages must distinguish English concept from Pali term/tradition context. Daily discipline owns habit formation; boundaries owns the harm/limits scenario. The Four Brahmaviharas page owns the four-quality overview.

## 18. Loving-Kindness / Metta Cluster

**Protected meaning owner:** `/learn/buddhist-dictionary/metta/`, subject to substantial quality improvement and source review.
**Protected practice role:** `/meditation/loving-kindness-meditation/`.
The Metta Sutta page is source study; the script owns a reusable practice script. The two beginner/guide articles substantially overlap; `/articles/loving-kindness-meditation-beginners/` remains a consolidation candidate.

## 19. Equanimity Cluster

**Protected owner:** `/articles/equanimity-in-buddhism/`.
It owns balanced care without numbness. The Brahmaviharas lesson provides system context but does not replace the dedicated explanation.

## 20. Right Speech Cluster

**Protected owner:** `/articles/right-speech-buddhism/`.
Examples owns worked speech cases; mindful email/texting owns a digital scenario; mindful listening owns receptive communication; the sutta page remains source study. These may coexist if each avoids repeating the full broad explanation.

## 21. Patience Cluster

**Protected owner:** `/articles/three-ways-to-practice-patience/`.
The sutta page owns canonical/source context. Daily and quote pages remain recurring/reflection formats and do not own patience doctrine.

## 22. Anger Cluster

**Protected owner:** `/articles/buddhist-approach-to-anger/`.
It owns the situation-specific response. It supports the Three Poisons owner and connects to Right Speech, patience, compassion, and mindfulness without taking their broad roles.

## 23. Forgiveness Cluster

**Protected owner:** `/articles/buddhist-teachings-on-forgiveness/`.
Its defensible information gain is the distinction among release, approval, accountability, and boundaries. Related quote/daily content remains reflective.

## 24. Dhamma / Dharma Cluster

**Protected owner:** `/learn/buddhist-dictionary/dhamma/`.
`/articles/dhamma-vs-dharma/` exclusively owns the spelling, language, and tradition comparison. It must not become a second generic definition.

## 25. Sangha Cluster

**Protected owner:** `/articles/what-is-sangha-buddhist-community/`.
The dictionary page owns the term definition; the temple article owns visitor etiquette; the Three Jewels lesson explains Sangha in that three-refuge framework.

## 26. Meditation Cluster

**Navigation owner:** `/meditation/`.
`/meditation/meditation-for-beginners/` should own the section's first practice. Duration pages own timed practice, posture owns accessibility/positioning, difficulties owns troubleshooting, and safety remains a protected trust page. `/articles/how-to-meditate-for-beginners/` and `/meditation-guide/` require owner review because all three currently promise broad beginner instruction.

## 27. Mindfulness Cluster

**Protected owner:** `/learn/buddhism-101/what-is-mindfulness/`.
Dictionary `mindfulness` and `sati` require explicit English/Pali boundaries. The comparison article owns mindfulness-versus-meditation. Daily practice, morning routine, listening, communication, and mindfulness-in-daily-life pages own concrete applications.

## 28. Anxiety / Overthinking Cluster

**Scenario owner:** `/articles/how-to-meditate-for-anxiety/`.
The overthinking article owns repetitive thought-loop guidance rather than anxiety treatment. Both require wellbeing review, safety boundaries, and clear non-clinical positioning.

## 29. Sleep Cluster

**Scenario owner:** `/articles/mindfulness-for-better-sleep/`.
It remains a bounded mindfulness routine, not a sleep-treatment page or generic meditation owner. Human wellbeing review remains required.

## 30. Dhammapada Cluster

**Source-navigation owner:** `/learn/dhammapada-reflections/`.
Verse pages own individual source-study/reflection units. The three article routes must remain translation/paraphrase/attribution analyses rather than competing verse-study duplicates. Verse 1 and “mind leads all things” require human source/copyright review.

## 31. Sutta Study Cluster

**Source-navigation owner:** `/learn/sutta-for-daily-life/`.
Every detail studies a specific source and links to the relevant general owner. The hub does not own Four Noble Truths, Eightfold Path, metta, breath meditation, Right Speech, or patience as general topics.

## 32. Buddhist Dictionary Cluster

**Navigation owner:** `/learn/buddhist-dictionary/`.
Each entry is a `DICTIONARY_DEFINITION`; entries link to broader owners where those exist. Definitions must not grow into duplicate pillars. Pali Canon, sutta, Dhamma, metta, karuna/compassion, sati/mindfulness, anicca/impermanence, karma, and Sangha retain explicit cross-cluster boundaries.

## 33. Quote Ecosystem

**Discovery owner:** `/quotes/`. Categories are `CATEGORY`; stories are `QUOTE_REFLECTION`. Neither categories nor stories own broad Buddhist doctrine. The 43 individually authored stories remain improve candidates; the 60 generated indexable stories remain Phase 3 noindex-review candidates. All pages retain original Echo Buddha attribution and must not compete with scriptural quotation queries.

## 34. Daily Reflection Ecosystem

**Recurring-experience owner:** `/daily-reflections/`. All 30 detail pages are `RECURRING_USER_CONTENT`, even when they mention a doctrine. `/today/` remains a noindex utility outside the 283-row indexable set. The 30 details remain Phase 3 noindex-review candidates; user-facing access and internal journeys must be preserved.

## 35. Hub Ownership

`/learn/` owns structured learning navigation; `/articles/` article discovery; `/meditation/` practice selection; `/quotes/` quote discovery; `/daily-reflections/` the returning reflection experience; `/start-here/` newcomer orientation; `/mindful-living/` applied-life navigation; `/tools/` utility discovery. Categories organize subsets and do not own their topics broadly.

## 36. Start Here vs Beginner Learning

`/start-here/` answers “where should I begin on this site?” `/learn/buddhism-for-beginners/` answers “how can I begin understanding Buddhism?” `/learn/buddhism-101/what-is-buddhism/` is a sequenced lesson. Articles must serve misconception, scenario, or practical-entry roles rather than duplicate these questions.

## 37. Learn vs Articles Ownership

Learn owns broad evergreen doctrine where a dedicated pillar exists. Articles own applied, editorial, scenario, comparison, or uncovered pillar roles. The register explicitly prevents Learn and Articles from silently sharing broad ownership in beginner Buddhism, Four Noble Truths, Eightfold Path, karma, Five Precepts, impermanence, mindfulness, and Right Livelihood.

## 38. Dictionary vs Article Ownership

Dictionary pages define terms with linguistic/doctrinal context. Articles provide application, comparison, misconception correction, or a broader teaching not adequately represented by a dictionary entry. `Dhamma` owns meaning while `Dhamma vs Dharma` owns comparison; Sangha and compassion articles own full explanations while their dictionary entries stay definitional.

## 39. Source Study vs General Teaching Ownership

Sutta/Dhammapada pages own a named text, verse, translation question, or source context. They must link toward—but never replace—the relevant general pillar. Future metadata/copy differentiation belongs to later phases.

## 40. Primary Owner Decisions

Forty owner decisions are recorded in `primary-topic-owner-register.csv`. Thirty-seven use the same broad owner as prior architecture or fill a previously undocumented gap. Material changes include compassion moving from a provisional dictionary owner to the full beginner article and metta meaning moving from a practice page to the term page while the meditation page receives a protected practice role.

## 41. Supporting Page Decisions

All 243 non-owner pages have a support role and owner relationship. **135** currently have sufficiently distinct roles without a consolidation, noindex, or human-review action. The remainder are improvement or Phase 3/owner-review work, not automatically invalid pages.

## 42. Cannibalization Risks

The case register contains **12 medium**, **11 high**, and **0 critical** conflicts. High cases concentrate in broad beginner/doctrine variants, impermanence, beginner metta/meditation, and the quote/daily family-level search roles. No conflict is classified critical because the correct owner can be identified and no destructive malfunction is active.

## 43. Consolidation Candidates

Seven Phase 3 review candidates:

1. `/articles/buddhism-for-beginners-simple-guide/`
2. `/articles/four-noble-truths-explained-simply/`
3. `/articles/eightfold-path-explained-daily-life/`
4. `/articles/noble-eightfold-path-practical-guide/`
5. `/articles/impermanence-in-buddhism/`
6. `/articles/impermanence-in-buddhism-letting-go/`
7. `/articles/loving-kindness-meditation-beginners/`

Phase 3 must compare unique material, links, search evidence, and index consequences before any merge or redirect.

## 44. Noindex Candidates for Later Review

Ninety candidates are carried forward: 60 generated indexable quote stories and 30 daily-reflection details. `NOINDEX_REVIEW` is not an approved noindex action. Preserve user access, recurring journeys, and `follow` behavior if Phase 3 later recommends an index-state change.

## 45. Content Expansion Holds

Thirteen clusters are frozen for new indexable pages: Beginner Buddhism, Four Noble Truths, Noble Eightfold Path, Impermanence, Attachment/Non-Attachment/Letting Go, Compassion, Loving-Kindness/Metta, Meditation, Breath/Mindfulness of Breathing, Mindfulness, Dhammapada, Quotes, and Daily Reflections.

The hold ends only after applicable Phase 3 index review, later differentiation work, and the future-page approval gate.

## 46. Human / Owner Review Items

Twelve workstreams cover publisher identity, fresh Search Console and analytics evidence, Dhammapada/source/copyright review, sutta review, terminology boundaries, wellbeing review, seven consolidation candidates, beginner-meditation ownership, quote/daily index models, and adoption of the expansion holds/new-page gate.

Fourteen individual indexable pages retain `HUMAN_REVIEW` as their Phase 1-derived future action.

## 47. Internal Link Direction Model

- support → primary owner;
- primary owner → best support pages;
- source study → general doctrinal owner;
- practice → teaching owner plus applicable safety page;
- dictionary → broader learning owner;
- article → pillar when the article is an application/support page;
- recurring/quote content → relevant owner only when genuinely helpful.

No mass internal-link change was performed. Breadcrumb/URL mismatches—especially broad article routes acting like Learn content—are Phase 3/4 inputs, not Phase 2 URL-change authority.

## 48. Future Content Approval Gate

No new indexable page is approved unless the proposer supplies cluster, controlled role, broader owner, closest page, why that page cannot be improved, distinct reader need, distinct intent, concrete information gain, sources, journey role, intended index/monetization state, cannibalization review, and both boundary statements.

The reusable gate is `future-page-approval-template.csv`. Any incomplete submission is rejected as indexable by default.

## 49. Areas That Must Not Change

Protect static Astro crawlability, self-canonicals, sitemap consistency, source/translation labels, quote-origin protections, meditation safety language, trust/correction paths, current useful noindex governance, conservative AdSense gating, accessibility, and mobile readability. Trust pages must remain trust assets rather than SEO articles.

## 50. Phase 3 Handoff

`phase-3-handoff-register.csv` provides one row for all 283 indexable pages and uses only: `KEEP`, `IMPROVE`, `CONSOLIDATE_REVIEW`, `NOINDEX_REVIEW`, and `HUMAN_REVIEW`. There are no pre-approved redirects or removals.

Phase 3 must independently validate index consequences, current search/backlink evidence, preservation of unique material, link destinations, sitemap/canonical behavior, and user journeys before implementing anything.

## 51. Final Phase 2 Verdict

**PHASE 2 STATUS:** COMPLETE
**TOTAL CONTENT CLUSTERS REVIEWED:** 40
**TOTAL PAGES ROLE-MAPPED:** 283
**CONFIRMED PRIMARY OWNERS:** 40
**SUPPORTING PAGES WITH CLEAR DISTINCT ROLES:** 135
**MEDIUM OWNERSHIP CONFLICTS:** 12
**HIGH OWNERSHIP CONFLICTS:** 11
**CRITICAL OWNERSHIP CONFLICTS:** 0
**CONSOLIDATION CANDIDATES FOR PHASE 3:** 7
**NOINDEX REVIEW CANDIDATES FOR PHASE 3:** 90
**REDIRECT REVIEW CANDIDATES FOR PHASE 3:** 0
**CONTENT EXPANSION HOLDS:** 13
**HUMAN / OWNER REVIEW ITEMS:** 12 workstreams; 14 individual pages
**ARE BROAD TOPIC OWNERS NOW CLEAR?** Mostly — decisions are explicit; owner approval remains
**IS LEARN VS ARTICLE OWNERSHIP CLEAR?** Yes
**IS DICTIONARY VS ARTICLE OWNERSHIP CLEAR?** Yes
**IS SOURCE-STUDY OWNERSHIP CLEAR?** Yes, subject to expert source review
**ARE MEDITATION ROLES CLEAR?** Mostly — three beginner-guide routes require owner review
**ARE QUOTE ROLES CLEAR?** Yes
**ARE DAILY REFLECTION ROLES CLEAR?** Yes
**IS PHASE 3 READY TO BEGIN?** After owner review
**NEXT PHASE:** Phase 3 — Index Quality & Page-Footprint Remediation, only after this ownership map is reviewed and approved.

## Second-Pass Challenge Review

The owner selections were challenged against user usefulness rather than SEO neatness:

- Learn was not automatically selected. Articles remain owners for Three Poisons, attachment/letting go, compassion, equanimity, Right Speech, patience, anger, forgiveness, gratitude, Sangha, breath practice, anxiety, and sleep because the current site has no stronger dedicated Learn owner or the article's applied/scenario purpose is the real user need.
- Two pages were allowed to coexist when source, practice, comparison, scenario, or sequence supplied concrete information gain. Overlap alone did not produce consolidation.
- Historical owners were rejected where weak: compassion moved from the dictionary to the fuller article; metta now separates meaning ownership from protected practice ownership.
- Sparse/stale GSC data was not used to choose winners or authorize destructive changes.
- Quote and daily pages retain user value even though 90 pages need index review; the model preserves their browsing and recurring roles.
- The three beginner-meditation routes were not force-resolved because their final journey/brand boundary requires manual comparison.
- No conflict was exaggerated to `CRITICAL`; the architecture can identify an owner in every cluster.

The proposed hierarchy remains useful without Google or AdSense: a beginner can identify where to start, a practitioner can find a method, and a source-curious reader can distinguish a text study from a general teaching.

## Validation Record

See `phase-2-validation-summary.csv`. Because Phase 2 changed no application or rendered output, browser and Lighthouse reruns are not required by the brief. Full build, type, lint, test, SEO, content, validate, and release checks are recorded before final handoff.

## Evidence Package

The CSV registers and `phase-2-generated-summary.json` in this directory form the machine-readable source of truth. `generate-phase-2-registers.mjs` reproduces them from the completed Phase 1 matrix and the explicit Phase 2 ownership model.
