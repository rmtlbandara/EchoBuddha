# Fresh article and meditation editorial assessment — 11 November 2026

## Scope and evidence

Read every full rendered main-body text in `articles-review.json`: **58 routes**, comprising the article directory, 48 articles and 9 meditation practice routes. The CSV contains exactly those 58 routes, one row each, with the requested ten fields. Full-body reads include the source notes, FAQs, repeated appended blocks and related-content furniture, not only headings or word counts. SHA-256 body identifiers and the actual fresh-crawl file path are recorded per row. These are independent editorial judgments on the supplied live baseline; no prior audit approval is carried forward. The reviewer is an editorial agent, not a credentialed Buddhist scholar or clinician. Source checks below are targeted; the register does not claim that every external source was exhaustively authenticated.

The baseline decisions are **48 keep and 10 change**, with one P1 correction and nine P2 improvements. Keep means there is an identifiable reader job and no material defect found in this read; it is not an AdSense approval prediction or a claim of publication readiness for every other site route. Short practical instructions are judged by usefulness and scope, not an invented minimum word count. Repeated page furniture does not itself make articles duplicates.

## Findings requiring action

### E-01 — P1: preserve the scope shift in Dhammapada 277–279 and supply the promised reading links

Route: `/articles/buddhist-teachings-on-impermanence/`.

Source: `src/data/site.ts:7941` in the source-reading override; source list at `src/data/editorialGovernance.ts:937`.

The page summarizes all three verses as conditioned phenomena bearing three marks. The cited [Buddharakkhita translation of Dhammapada XX](https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html) uses conditioned things in 277–278 and the broader all-things formulation in 279. Preserve that distinction rather than smoothing three subjects into one. Suggested replacement: “Verses 277–278 concern the impermanence and unsatisfactoriness of conditioned things; verse 279 uses the broader formulation that all things are not-self.” This is a source-precision repair, not a new argument about every school's account of nibbāna.

The article also says it links named translations but neither the SN22.59 nor SN12.15 section provides one; the selected references show only Dhammapada XX. Add named direct links in the relevant sections and registry. [SN22.59, Ṭhānissaro Bhikkhu](https://www.dhammatalks.org/suttas/SN/SN22_59.html) supports the five-aggregate argument; [SN12.15, Ṭhānissaro Bhikkhu](https://www.dhammatalks.org/suttas/SN/SN12_15.html) rejects the existence/non-existence extremes through arising and cessation. The current modern-study questions can stay.

### E-02 — P2: give the compassion articles genuinely different jobs

Routes: `/articles/compassion-in-buddhism-beginner-guide/` and `/articles/compassion-as-a-daily-discipline/`.

Sources: `src/data/site.ts:3226` (beginner base), `:4174` (discipline base), `:6482` (discipline appended sections); later takeaway/FAQ overrides near `:9615` and `:9951` also affect the final output.

Both fresh bodies currently rehearse self-compassion, hard conversations, boundaries, accountability and one compassionate wish, in similar order. Renaming them definition versus conduct does not by itself remove that overlap. Keep both only with a sharper split: the beginner page should explain karuṇā beside mettā and upekkhā and work through one actual encounter with suffering; the discipline page should own repeated follow-through in one recurring caregiving/helping responsibility, including consent, available capacity, correction and review. Link out rather than repeating the whole boundary argument.

The beginner page's only selected traditional reference is the Mettā Sutta. Add direct compassion context. [AN4.125, Ṭhānissaro Bhikkhu](https://www.dhammatalks.org/suttas/AN/AN4_125.html) explicitly distinguishes directional cultivation of goodwill and compassion. Its wider context includes rebirth and the practitioner's relationship to cultivated states; it does not prescribe a modern workplace help script. Label the new case and modern distinction table as editorial explanation. Avoid claiming AN4.125 itself defines all the practical boundary checks.

### E-03 — P2: separate habit mechanics from another first-session plan

Route: `/articles/beginning-a-daily-mindfulness-practice/`.

Source: `src/data/site.ts:4098` region, appended sections near `:6426`, later takeaway/FAQ override before `:9615`.

Compared freshly with `/articles/how-to-meditate-for-beginners/`, the daily page repeats seated minutes, cue, fallback, missed days and return-not-failure. The seven-day article already provides an if–then plan and review for formal sessions; `/meditation/mindfulness-in-daily-life/` already supplies a useful tap-washing method and message case. Let this article answer why an ordinary cue succeeds or disappears. Add a simple cue/response/obstacle/restart record, distinguish noticing from remembering, and show one revised cue after a missed opportunity. These should remain optional modern habit suggestions, not a canonical system or measured behavioral-science claim.

### E-04 — P2: clarify what the breath article derives from MN118

Route: `/articles/mindfulness-of-breathing-guide/`.

Source: `src/data/site.ts:3369` region, including “Use Counting if Helpful” near `:3403`; source registry near `src/data/editorialGovernance.ts:975`.

This longer article and `/meditation/breathing-meditation/` both cover a single chosen breath location, counting one to ten, return, and adaptation. Preserve the short practice page as the compact method. Add a precise source boundary to the longer article: chosen location, optional counting, ten-breath windows and contemporary session packaging are beginner teaching choices, not the whole method quoted from [MN118, Ṭhānissaro Bhikkhu](https://www.dhammatalks.org/suttas/MN/MN118.html). The discourse's sixteen instructions extend through body, feeling, mind and mental qualities, and connect with mindfulness establishments and awakening factors. A short orientation to that wider scope adds value without claiming a novice has completed it. Do not turn a brief calm or noticing change into an attainment claim.

### E-05 — P2: preserve the explicit lay livelihood standard

Route: `/articles/right-livelihood-modern-life/`.

Source: `src/data/site.ts:5562`, “Right Livelihood in the Eightfold Path.”

The sustained disclosure case and role/influence analysis are useful. However, repeated gradual harm-reduction language omits the explicit lay business warning in [AN5.177, Ṭhānissaro Bhikkhu](https://www.dhammatalks.org/suttas/AN/AN5_177.html): weapons, living beings, meat, intoxicants and poison. Add the named standard, then say that tracing modern employment, indirect roles and constrained transitions requires contextual judgment. Do not suggest gradual improvement rewrites that canonical list or that a pure intention makes any business acceptable. Preserve the article's humane acknowledgment of workers' real constraints.

### E-06 — P2: remove ambiguity about truth in the Right Speech filters

Route: `/articles/right-speech-buddhism/`.

Source: `src/data/site.ts`, “The Four Filters of Right Speech,” exact sentence beginning “Not every sentence will pass every filter perfectly.”

The rest of the article carefully distinguishes [SN45.8](https://www.dhammatalks.org/suttas/SN/SN45_8.html), MN58, and a modern six-outcome guide. The quoted filter sentence nevertheless can imply truth is one negotiable filter among several. Replace it with a direction to pause or check when truth/benefit is unclear, while retaining the later distinction that kind does not mean pleasant. This is a local clarity fix, not rejection of the useful decision guide.

### E-07 — P2: consolidate duplicate beginner practice blocks

Routes: `/meditation/meditation-for-beginners/` and `/meditation/loving-kindness-meditation/`.

Sources: base sections in `src/data/learn.ts`; appended guides in `src/data/topicGuides.ts:94` and `:120`; `src/pages/meditation/[slug].astro:103` renders base sections and then the TopicGuide near `:124`.

The fresh beginner body runs “How to Practice,” “Try One Session,” then “Your First Session, Step by Step” with substantially the same method. The mettā page similarly runs an initial recipient sequence and a later “Try Three to Five Minutes” sequence. Prefer one primary sequence plus anchor/quality table, clear source boundary and focused FAQ. Keep the useful content, remove the duplicated path through it. Do not pad these short pages to compensate. This work is outside the original site.ts implementation allowance and must be coordinated with the owning reviewer.

### E-08 — P2: differentiate long and short walking methods

Route: `/articles/walking-meditation-step-by-step/` relative to `/meditation/walking-meditation/`.

The full bodies have nearly the same path length, gaze, lifting/placing, stop/turn/pause, wandering, natural-pace and safety instructions. The longer article has a clear method but limited extra depth. Let the compact page own the ready-to-use practice; make the article the troubleshooting/turning/balance explanation with a concrete worked interruption. Its existing MN10 scope note correctly labels path length and labels as contemporary. This improvement is desirable but less urgent than source precision and the compassion duplication; it need not become an excuse for length expansion.

## Named cluster decisions

- **Eightfold Path: keep three article routes.** `/articles/eightfold-path-explained/` explains cooperation, `/articles/eightfold-path-explained-daily-life/` works three decisions, and `/articles/noble-eightfold-path-practical-guide/` offers a bounded weekly review. Fresh text separates ordinary steady listening from the four-jhāna definition in SN45.8. No merge is justified by the titles or shared introductory vocabulary alone.
- **Karma: keep the MN61 repair article.** The shared-file case sustains a consequential mistake through prior risk, discovery, correction, actual impact and prevention. It distinguishes accident from deliberate concealment and harmful bodily/verbal disclosure from mental action. [MN61](https://www.dhammatalks.org/suttas/MN/MN61.html) and [SN36.21](https://www.dhammatalks.org/suttas/SN/SN36_21.html) were freshly opened for targeted checks. The concise definition/foundation is a neighboring route owned by the learning reviewer, not counted as freshly read in this corpus.
- **Four Noble Truths: keep tasks and worked conversation.** The task structure and one conflict application answer different questions, both linking to the foundation. Temporary non-feeding is explicitly distinguished from full cessation.
- **Impermanence: keep source reading, misconceptions and plan-loss case**, subject to E-01. Those are distinct jobs; shared anicca vocabulary does not justify merging them.
- **Mettā articles: keep phrase design, troubleshooting and script.** Each has a usable job. Consolidate duplicate sequences inside the primary meditation route instead of collapsing the whole cluster.
- **Right Speech: keep owner, examples and digital application.** The digital page contributes persistent messages, screenshots, privacy, forwarding and channel choice. The examples page provides alternative actual sentences. The owner has the source distinctions and six-outcome guide; E-06 removes one contradictory cue.
- **Mindfulness: preserve comparison, daily-life method and morning timing.** The weakest boundary is habit mechanics versus formal first-week plan, addressed by E-03. Do not equate every repeated reminder about wandering with low-value duplication, but reduce repeated reassurance when it obscures the next action.

## Safety and source limits

[NCCIH's meditation overview](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety) describes limited adverse-effect evidence and variable benefits. Current anxiety, difficulty and short-practice bodies do not promise cures and include adaptation, stopping and qualified support. The posture page's dizziness instruction agrees with [NHS dizziness guidance](https://www.nhs.uk/symptoms/dizziness/): rest in a stable position, rise slowly, seek care for persistent/recurrent dizziness. No new safety blocker was identified in these full bodies. This targeted check is not a clinical review or proof that every possible reader situation is covered.

## Validation and implementation status

The CSV is a baseline record, intentionally not rewritten to “keep” when a later edit is proposed or implemented. The parent will review changes independently. Implementation, dates and verification must be logged separately below after changes are made; a proposed edit is not live evidence. No source application file had been edited by this reviewer when the baseline CSV and findings were first written.

## Implementation log — separate from baseline

The parent subsequently authorized source implementation in `src/data/site.ts` only. The review baseline above and CSV were not altered to conceal the original weaknesses. The following changes are now written locally, subject to the parent's independent diff and integrated build review:

| Route | Local implementation | Date treatment |
| --- | --- | --- |
| `/articles/buddhist-teachings-on-impermanence/` | Preserved the Dhp277–278/279 subject distinction and added named direct SN22.59/SN12.15 links. Current source near `src/data/site.ts:8117`. | 2026-11-11, substantive source repair |
| `/articles/compassion-in-buddhism-beginner-guide/` | Replaced generic speech/self-compassion/boundary sequence with karuṇā–mettā–upekkhā distinctions and one bereavement/support case. Direct AN4.125 link; example explicitly modern. Current override begins near `:7442`. | 2026-11-11, substantial rewrite |
| `/articles/compassion-as-a-daily-discipline/` | Replaced overlapping introductory advice with recurring grocery-help agreement, consent/capacity, missed-commitment repair, effects review and honest ending. Direct AN4.125 context; logistics explicitly modern. Current override begins near `:7495`. | 2026-11-11, substantial rewrite |
| `/articles/beginning-a-daily-mindfulness-practice/` | Now owns cue recognition versus practice, a four-item cue record, one revised cue and restart mechanics. Explicit links separate ordinary-activity instruction and formal first-week sessions. Current override near `:7382`. | 2026-11-11, substantial rewrite |
| `/articles/mindfulness-of-breathing-guide/` | Replaced generic related-terms block with beginner teaching choices versus MN118's wider sixteen-instruction training, direct named translation link and compact-method handoff. Current source near `:3431`. | 2026-11-11, substantial source/method clarification |
| `/articles/right-livelihood-modern-life/` | Added AN5.177's five-business standard and explicit distinction between that standard and contextual/gradual modern employment judgment. Current source near `:5566`. | 2026-11-11, substantive source boundary |
| `/articles/right-speech-buddhism/` | Removed implication that failure of truth/benefit can be offset by passing other filters. Current source near `:5037`. | Existing date retained for small local correction |

The three rewritten pages use the existing intent-remediation path; their old redundant removal entries were removed so old appended sections do not reappear and checked removal assertions do not fail. Their final takeaways and FAQs were updated alongside the bodies. Only these six substantive article dates receive the current date; other article dates retain their prior semantics. Root's existing contact-email migration in the same file was preserved.

At the separately assigned navigation reviewer's request, two supplemental quote-story passages in `site.ts` were inspected and corrected outside the assigned 58-route baseline: `eightfold-path-daily-choices` now distinguishes modest daily applications from SN45.8's four-jhāna right-concentration account; `right-speech-with-kindness` labels its four filters as a modern reminder and names the traditional abstentions. They are not counted as two extra freshly reviewed full routes in this corpus, and no new date claim was attached to those short passages.

Source-registry additions were requested from the parent, who confirmed writing them independently; this reviewer did not edit `editorialGovernance.ts`, `learn.ts`, `topicGuides.ts`, historical audit files or any application file other than `site.ts`. E-07's duplicated short practice sequences remain for the relevant owner. E-08's walking-article differentiation remains a lower-priority improvement, not falsely marked implemented.

Validation completed by this reviewer: `npm run typecheck` passed (`astro sync && tsc --noEmit`), recorded in `articles-typecheck.log`; the CSV passed exact corpus set equality, unique-route count 58, expected ten headers and nonempty fields. Root will perform the integrated build/render checks after all workstreams finish. These local source edits are not evidence of deployment, live recrawl, Google reprocessing, or AdSense approval.

### Final article follow-up

The parent authorized completing E-08 as well. `/articles/walking-meditation-step-by-step/` now uses a worked hallway interruption, turn transition, unstable slow-pace troubleshooting, narrow/restless attention, and one-condition review. It links the compact practice instead of repeating that full sequence, preserves the MN10 editorial-application boundary, and explicitly stops for dizziness, pain, breathlessness or instability. Its substantive revision is dated 2026-11-11. This brings this reviewer's implementation to **eight article routes plus two supplemental quote-story passages**. The three initially inserted override/SEO blocks were indented consistently; the walking block follows the same format. `getArticleSeoDetails` now gives explicit intent metadata priority and keeps the historical October30 fallback for remaining recovery entries, rather than maintaining a separate hard-coded six-route date conditional. A final `npm run typecheck` passed after these changes.

### Independent cross-review requested by parent

Read-only cross-review inspected the other reviewer's `learn.ts`/`handbook.ts` diff, root's Q2 duplicate removal and the shared template changes, then checked built HTML for the beginner and mettā practice pages, SN45.8 source lesson, Three Marks, lay-follower qualities and Q2. The duplicate practice sequences are removed while the actual detailed method, anchor/quality table, source boundary, optional recipients and stop/support guidance remain. The “After the Session” prompt now follows the detailed method. Q2 retains its earlier answer about practice without physical objects, so deleting the second version removes repetition without losing that task.

One material rendering defect was reported to root: the new SN45.8 source-lesson `intro` includes an anchor, but the shared template escapes intro text. Built HTML visibly shows the literal anchor markup. The narrow fix is a plain-text intro, leaving the link in body/related learning. This reviewer made no application changes during cross-review.

An initial AN5.175 grouping question was resolved by independently retrieving the primary SuttaCentral Bilara [Sujato translation](https://raw.githubusercontent.com/suttacentral/bilara-data/published/translation/en/sujato/sutta/an/an5/an5.175_translation-en-sujato.json) and [Pāli segmentation](https://raw.githubusercontent.com/suttacentral/bilara-data/published/root/pli/ms/sutta/an/an5/an5.175_root-pli-ms.json): segments1.5,1.6,1.7 support the new handbook grouping. Ṭhānissaro punctuates the list differently, but the handbook's actual reference is Sujato, so no source correction is required. [MN44](https://www.dhammatalks.org/suttas/MN/MN44.html) also supports the added threefold-grouping reference. No additional material source, date or safety regression was found in this bounded cross-review. This is not a second full-corpus audit.
