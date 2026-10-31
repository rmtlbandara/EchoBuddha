# Duplication, repeated structure and overlapping intent

Editorial observations began October 30, 2026; assembled October 31, 2026, Asia/Colombo. This report describes the reviewed local release candidate. Production identity and delivery are separate evidence in report 11.

## Coverage and method

All 351 generated HTML pages have a documented editorial disposition: 350 reader pages and one error page. Coverage combines full article and learning/practice body readings, full authored quote source-record readings, all individualized short quote applications, every daily-reflection body, and the unique editorial text and complete shared catalogues of hubs and utilities. The allocation and limitations are recorded in [the coverage manifest](editorial/COVERAGE_MANIFEST.json) and [the page-level quality register](03_CONTENT_QUALITY_AUDIT.csv).

The reviews are Codex model editorial judgments. They are not independent human, monastic, scholarly, clinical, legal or Google certification. Sources were checked for fit and labeling, with selected high-risk passages independently retrieved; this does not certify every claim against every cited edition or establish originality against every publication worldwide.

The investigation used three different signals:

1. Exact repeated paragraph and lexical-overlap diagnostics from generated content identify material to inspect. They do not determine quality, independent value or a consolidation decision.
2. Page-by-page reading asks whether the explanation, scenario, tool, source study or practice genuinely differs from nearby pages and satisfies its stated purpose.
3. Existing intent ownership and authenticated search evidence are kept separate. Editorial overlap alone is not proof that Google is alternating competing URLs for the same query.

The inventory remains 165 intended indexable pages and 186 noindex HTML pages, including the error page; the sitemap contains 165 URLs. No new noindex policy, mass deletion, consolidation, canonical change or redirect was used to make the audit appear clean. Existing redirect aliases are listed separately in [the redirect inventory](REDIRECT_INVENTORY.csv).

## Material quote-permalink finding and resolution

The original 110 minimal quote permalinks had a defensible save/share purpose, but their applications were selected by theme, list position and text length rather than the meaning of the individual line. The visible application repeated the same selected situation in two successive paragraphs. Five generic questions were reused across all 110 pages:

| Diagnostic | Observed baseline |
|---|---:|
| Minimal quote permalinks inspected | 110 |
| Distinct visible example paragraphs | 42 |
| Distinct visible practice paragraphs | 35 |
| Distinct reflection questions | 5 |
| Reuse counts for the five questions | 18, 23, 30, 23, 16 |

These counts describe the mechanism; brevity itself was not the defect. For example, the quote about knowing when not to speak received a generic routine-task instruction, and the walking quote received a generic stress-signal situation. Neither explained the distinction the line actually raised.

All 110 now have individually written interpretation, application and question records in `src/data/quoteApplications.ts`, keyed to the exact quote. The material is concise: it adds an actual distinction or choice rather than an invented backstory or a universal expansion template. The validation record confirms 110 expected keys, no missing or extra keys, no empty fields and no identical complete field strings among the 330 values. Those deterministic checks support implementation integrity; the separate full model readings establish the recorded editorial judgment, not a numerical approval score.

Examples of the resulting distinctions include deciding when silence protects accuracy versus conceals necessary truth; noticing a safe walking route rather than generic stress; separating available repair from an irreversible past; and recognizing that a natural breath is optional and cannot promise a peaceful mood. Sensitive interpretations retain boundaries around medical symptoms, grief, danger, coercion, intrusive memories and reconciliation.

The 43 longer authored stories were also read in full. Their recognizable story/application/practice structure was retained where the situation and application fit the quote. The template explicitly labels the vignette as imagined rather than a historical Buddhist account. Original-writing attribution and practice adaptations remain visible. See [the 43-story review](research/AUTHORED_QUOTE_REVIEW.csv) and [the separate 110-application review](research/QUOTE_APPLICATION_ADVERSARIAL_REVIEW.csv).

All 153 quote permalinks retain their intentional noindex policy. This does not exempt them from editorial review and does not imply that noindex fixes accessible low-value content. Their retained role is a concise original reading/share destination supporting the theme collection, rather than 153 competing claims to separate broad Search intent.

## Repeated article tracks

Several articles had accumulated a complete explanation followed by a second exercise/example/conclusion sequence covering substantially the same material. The full readings identified the repetition rather than equating a repeated heading or an FAQ with a defect.

The lead's original eight article revisions and the later page-specific trims are documented in [the lead review](editorial/root-eight-article-review.json), [the 40-article review](editorial/article-body-review.json) and [the exact trim decisions](editorial/RECOMMENDED_TRIMS.json). The latter decisions cover:

| Article | Repetition addressed | Useful material retained |
|---|---|---|
| Buddhist approach to anger | A second body/pause/causes/speech track and another example/exercise ending | Signal–story–urge–aim map, specific colleague scenario, boundaries, non-treatment scope and safety |
| Buddhist gratitude practice | Repeated simplification and relationship conclusions after the exercise | Source context, contentment without complacency, gratitude without debt, concrete three-line examples and difficult-day option |
| Compassion as a daily discipline | Several successive restatements of speech, limits, restraint and repair | Nearby conduct, disagreement, self-responsibility, misconceptions and one daily exercise |
| Compassion beginner guide | A late repeated daily-discipline section | Definition, pity/rescuing distinctions, speech, boundaries and optional difficult-person practice |
| Equanimity | Three closing paragraphs restating steadiness and non-numbness | AN 8.6 context, pleasant as well as unpleasant conditions, practical worldly-winds review |
| “What we think, we become” reflection | Another closing practice track | Attribution/provenance method, thought/intention discussion, no victim blaming and concrete exercises |
| Meditation for anxiety | A further example/exercise/continuation track repeating the same anchors | Ground-first method, optional breath, complete short practice, adaptation and qualified-support boundaries |
| Mindfulness for sleep | A second body scan and transition ritual, then a third practice track | One complete wind-down, thoughts and wakefulness guidance, no sleep guarantee and healthcare boundary |

The retained text is neither mechanically expanded nor judged by a target word count. Purposeful summaries, accessible diagrams, a practice that operationalizes an explanation, and concise FAQs can remain useful even when they revisit a concept.

## Intent clusters and URL decisions

| Cluster | Distinct retained jobs | Disposition |
|---|---|---|
| Beginner Buddhism | Main learning hub; category-mistake article; route selector; seven-day broader practice plan | Keep existing URLs and owner. The route selector chooses a path; the misconception article does not repeat a complete course. |
| Four Noble Truths | Broad teaching hub; task-structure article; one difficult-conversation application | Keep. Overview, explanation of the four tasks, and worked case are independently useful when their scope is explicit. |
| Eightfold Path | Broad factor definitions; factor-cooperation explanation; three modern decisions; weekly non-scoring review | Keep. Definitions, relationships, scenarios and reusable review perform different jobs. |
| Impermanence | Foundational lesson and Anicca lookup; source-reading article; misconceptions; one plan-ending scenario | Keep. A source comparison is different from correcting nihilism or working through a changed plan. |
| Mettā | Main meditation method; phrase selection; troubleshooting; paced script | Keep. A reader following a script needs a different experience from a reader resolving false-feeling phrases or an unsafe recipient. |
| Dhamma/Dharma | Broad dictionary meaning; language/spelling/context article | Keep. The spelling article explicitly defers the full definition to the dictionary and avoids a rigid tradition split. |
| Right Speech | Main ethical explanation; everyday examples; digital communication; source-study lesson | Keep. Source criteria, worked situations, channel/privacy issues and a bounded text study have distinct purposes. |
| Compassion and karuṇā | Broad care/application pages; term lookup; conduct under pressure; modern boundaries | Keep with source and application limits. Relevant source fit and terminology were strengthened rather than claiming modern boundary scripts are canonical. |
| Meditation and daily habit | First-session method; comprehensive reference; seven-day meditation habit; broader Buddhist first week | Keep. The first session, troubleshooting/reference, repeatable sitting habit and study/ethics/generosity plan are different reader tasks. |
| Quote and daily-reflection themes | Shareable original line with reading note; recurring reflection with practice, situation and journal question | Keep as intentional short-form utilities. Shared themes are acknowledged; no new independent Search eligibility is asserted. |

This is an editorial decision to retain useful distinctions, not a claim that a role-map label alone proves distinctness. Every group above was checked against the actual explanatory or practice content. Future pages must not repeat one of these jobs merely with a different title.

## Daily reflections and collection reuse

All 30 reflection bodies and their original lines were read. Each has a bounded practice/journaling purpose; the particular setting, question, action and relevant learning route were checked. Some within-page reinforcement between a next step and a practice remains concise and purposeful. Familiar themes such as returning, kindness, anger and change are not evidence of independent doctrinal discoveries or new Search topics.

The date selector and archive necessarily reuse these records. The stable today utility explains its UTC-day selection and links to permanent pages; it is not presented as a newly written article every day. The 30 detail pages and today utility retain noindex. Shared catalogue cards, original-writing declarations, source-method links and safety instructions have a reader/trust purpose and are not disguised as unique prose.

The current extraction reports 123 exact paragraph groups appearing on multiple routes, using a minimum of 15 words. Leading examples are the quote-origin/corrections explanation and shared practice-safety guidance. This figure is a diagnostic, not 123 confirmed duplicate-content defects. It must not be directly compared to older totals that used whole-page chrome, another word threshold, a changed extraction scope or a truncated pair list. Full raw public snapshots and repeated-paragraph output remain in ignored `.artifacts` storage; the dated compact decisions are public.

## Related-reading correction

The previous broad-category/latest-article selector gave the impermanence quote category compassion, spelling and temple-visit articles as its next reading. Compassion categories also received unrelated language and temple cards. The release candidate uses explicit existing article priorities for all ten quote themes. This fixes a demonstrated reader journey problem without adding pages, excessive links or new indexable inventory.

## What the evidence cannot establish

No fresh complete query-by-page dataset is used here to prove or disprove ranking cannibalization across all routes. Report 07 describes the authenticated evidence, its dates and coverage. A non-indexed URL, low traffic, a repeated template or a high lexical similarity score is not automatically a defect. Conversely, source links, an internal rubric score or a noindex tag cannot certify independent reader value.

No consolidation, redirect, mass removal or further exclusion is justified merely by these similarity signals. If future query evidence shows two retained pages repeatedly competing for the same unmet intent, reassess the actual reader task, links, source depth and measured behavior under the existing governance before changing URLs. The present disposition is to preserve the distinct useful material, remove demonstrated repetitive tracks, maintain the original short-form boundaries, and observe search outcomes without claiming causation or AdSense approval.
