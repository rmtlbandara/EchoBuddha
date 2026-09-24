# Controlled Q6 Buddhist Question Implementation Report

Date: 2026-09-24  
Release state: pre-release validation passed; production deployment pending  
Starting `origin/main`: `67d1b8e4282fd92e678ee18eae908efad8c5ff51`

## Authorized result

Exactly one source-aware Learn-detail page is added:

`/learn/questions-about-buddhism/appatimo-and-buddha-images/`

Historical Expansion 1: Q1/Q2, +2 on 2026-09-02.  
Historical Expansion 2: Q3/Q4, +2 on 2026-09-14.  
Historical Expansion 3: Q5, +1 on 2026-09-20.  
Current Expansion 4: Q6, +1 on 2026-09-24.  
Cumulative questions after this release: Q1–Q6.  
Unauthorized Q7+: 0.

The data model is deliberately bounded to `1 | 2 | 3 | 4 | 5 | 6`. No Q7 route, record, approval, sitemap entry, search record, placeholder, or navigation target is created.

## Research and source hierarchy

AN 1.174 supplies the early textual context. It places *appaṭimo* within a sequence of terms praising the Tathāgata as unique, without peer or rival, incomparable, matchless, unequalled, and foremost. It is not presented as a discourse about statues or an image prohibition.

The later *Ekapuggalavaggavaṇṇanā* commentary explains that no bodily counterpart is truly like the Tathāgata and explicitly acknowledges human-made gold, silver, and other images while denying that any can reproduce his bodily form exactly. The page identifies this source as `Theravāda commentary` and does not convert imperfect likeness into a prohibition.

The Metropolitan Museum of Art supports only the art-historical layer: regional stylistic development and conventional visual marks by which Buddha images may be recognized. Museum evidence is not used as Buddhist doctrinal authority or as proof of one exact historical portrait.

Lexicographical sources were consulted for the semantic relation between *appaṭimo* and *paṭimā*, but they are not needed in the visible reference list. The later story of a brahmin trying to measure the Buddha appears in late Theravāda traditional literature, including the Dhammapada commentary tradition and later chronicles. It is omitted from the public argument because it is not part of AN 1.174, is not needed to explain *appaṭimo*, and should not be mistaken for historical measurement evidence.

## Core-idea preservation and originality

The page preserves the useful question raised by the supplied Q6—how an incomparable Buddha can be represented—without transcribing, synonym-rewriting, or following the photographed source’s paragraph order. The answer is independently organized around contextual reading, source chronology, exactness versus representation, cross-cultural iconography, recollection, and intent-sensitive respect.

## Q1/Q3/Q6 differentiation

Q1 owns whether construction and veneration of Buddha images were commanded and the early history of image traditions. Q3 owns the scope of Uddesika Cetiya. Q6 owns the distinct linguistic and representational issue: what *appaṭimo* means in AN 1.174, what the later commentary adds about exact bodily likeness, and why representation does not require duplication.

## Q1–Q5 preservation

Q1–Q5 semantic SHA-256 hashes match the pre-Q6 baseline when publication dates and navigation metadata are excluded. Titles, descriptions, body content, sources, and publication dates are unchanged. The only earlier-record change is Q5’s required `next` navigation to Q6.

## Integration and SEO

- Fixed route under the existing Questions About Buddhism hub.
- Exact approved H1, SEO title, meta description, intro, and 2026-09-24 publication metadata.
- Article and BreadcrumbList structured data; no FAQPage or QAPage.
- Hub discovery through the existing data-driven sixth card; homepage remains exactly Q1–Q3.
- Data-driven sitemap and internal-search inclusion exactly once.
- Q5 → Q6 and Q6 → Q5 navigation, with no future Next link.
- Q6 remains `LEARN_DETAIL / HOLD_MANUAL_REVIEW`; ads enabled: NO.

## Current-state delta

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| HTML routes | 340 | 341 | +1 |
| Indexable routes | 154 | 155 | +1 |
| Non-indexable routes | 186 | 186 | 0 |
| Sitemap URLs | 154 | 155 | +1 |
| Internal-search records | 319 | 320 | +1 |
| NEVER_MONETIZE | 252 | 252 | 0 |
| ELIGIBLE_CANDIDATE | 7 | 7 | 0 |
| HOLD_MANUAL_REVIEW | 81 | 82 | +1 |

## Validation and production

Validation used Node 22.23.1 and npm 10.9.8 from a clean `npm ci` installation.

- `npm ci`: pass; 337 packages installed and 0 vulnerabilities reported.
- Build: pass; 341 HTML pages.
- Typecheck and governance lint: pass.
- Tests: pass; 35/35.
- SEO: pass with one existing non-blocking low-inbound-link warning.
- Content, quote, trust, historical-boundary, and dependency audits: pass.
- Active Phase 8/9/10 gates: pass; 17/17, 26/26, and 19/19.
- Phase 11, 12, and 13 validators: pass; 17/17 plus 40/40 index hygiene, 57/57, and 11/11.
- `npm run validate:release`: pass.
- General browser and consent audit: pass across its standard 18-route set.
- Current Buddhist-question browser audit: pass for the hub and Q1–Q6 at 390×844, 768×1024, and 1440×900 (21 combinations), with no overflow, heading skip, malformed diacritic, missing visible keyboard focus, or critical/serious axe finding.
- AN 1.174, commentary, and Met educator reference endpoints returned HTTP 200 during source verification. The Met essay endpoint rate-limited command-line verification with HTTP 429 but remains the established existing museum reference and was verified through web research.

Validators regenerate some current-state evidence files while running. Those generated changes were restored after verification so Phase 6–13 and earlier content-audit snapshots remain historically unchanged. The new Q6 audit retains its own browser evidence.

Exact-SHA merge, production deployment, rollback metadata, and live verification will be appended after release.
