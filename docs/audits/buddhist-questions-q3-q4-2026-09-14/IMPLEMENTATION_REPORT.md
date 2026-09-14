# Controlled Q3/Q4 Buddhist Questions Implementation Report

Date: 2026-09-14  
Release state: local release validation passed; pending merge and exact-SHA production deployment  
Starting `origin/main`: `00b0b3e86215799d8f8fb7e71d8aa5ce53914537`
Validated implementation commit: `1a0b931640f05c2a0c5fcd08be05cd9ce9a646b8`

## Authorized result

Exactly two source-aware Learn-detail pages were added:

1. `/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/`
2. `/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/`

The data model remains deliberately bounded to Q1–Q4. No Q5 route, content record, approval, sitemap entry, search record, or navigation target was created.

## Research and wording decisions

Q3 was checked against the Puḷinuppādakatthera Apadāna (Tha Ap 489), the Puḷinathūpiya Therāpadāna (Tha Ap 500), and the later Theravāda Kāliṅgabodhi Jātaka prose (Ja 479). The page treats the first two as canonical Theravāda hagiography and uses their sand-stupa stories only to illustrate a wider commemorative logic. It does not claim that either passage formally defines every sand stupa as Uddesika Cetiya.

Q4 was checked against Ja 479 and Metropolitan Museum of Art sources for limited image chronology. It records the narrative's Bodhi-tree proposal and approval without inventing either a statue rejection or a statement that a hypothetical statue would have been approved. Art history is context, not evidence for an early doctrinal ban or Ānanda's motive.

The supplied photographs were treated as research context. Their prose and Pāli were not transcribed or lightly rewritten, their paragraph order was not imitated, and the unseen continuation of Q4 was not reconstructed.

## Integration

- Reused the existing `/learn/questions-about-buddhism/` hub and shared detail template.
- Added per-question `publishedDate` and `modifiedDate` fields and removed the template's global 2026-09-02 date.
- Preserved Q1/Q2 publication dates and semantic bodies.
- Extended navigation exactly as Q1→Q2→Q3→Q4.
- Added explicit approval records for Q3/Q4.
- Kept both routes at `LEARN_DETAIL / HOLD_MANUAL_REVIEW`.
- Left AdSense delivery, Auto Ads, consent, slots, and candidate allowlists unchanged and disabled.
- Generated Article and BreadcrumbList schemas only; detail pages have no FAQPage or QAPage schema.

## Current-state delta

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| HTML routes | 337 | 339 | +2 |
| Indexable routes | 151 | 153 | +2 |
| Non-indexable routes | 186 | 186 | 0 |
| Sitemap URLs | 151 | 153 | +2 |
| Internal-search records | 316 | 318 | +2 |
| NEVER_MONETIZE | 252 | 252 | 0 |
| ELIGIBLE_CANDIDATE | 7 | 7 | 0 |
| HOLD_MANUAL_REVIEW | 78 | 80 | +2 |

## Validation results

The implementation commit was validated from a clean `npm ci` installation under Node 22.23.1 and npm 10.9.8.

- `npm ci`: pass; 337 packages installed; 0 vulnerabilities.
- `npm run build`: pass; 339 pages.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: pass; 34/34.
- `npm run audit:seo`: pass with one non-blocking low-inbound-link warning.
- `npm run audit:content`: pass.
- `npm run audit:quotes`: pass; 7/7.
- `npm run audit:trust`: pass; 58/58, including secret scan.
- Current Phase 8/9/10 gates: pass; 17/17, 26/26, and 19/19.
- `npm run audit:phase11`: pass; 17/17 plus index hygiene 40/40.
- `npm run audit:phase12`: pass; 57/57.
- `npm run audit:phase13`: pass; 11/11.
- `npm run audit:dependencies`: pass; 0 critical and 0 high.
- `npm run validate:release`: pass.
- `npm run audit:browser`: pass for the standard 18-route accessibility and consent set.
- `npm run audit:q3q4:browser`: pass for five required routes at three required viewports (15 combinations), with no overflow, malformed diacritics, heading skip, or critical/serious axe finding.

The prompt-requested aggregate commands `audit:cornerstones`, `audit:phase8`, `audit:phase9`, and `audit:phase10` include frozen point-in-time validators. Their active components passed, while their frozen components produced the expected count/new-route failures after the separately approved Q1/Q2 and Q3/Q4 expansions. The historical evidence and frozen expectations were not rewritten. `scripts/validate-historical-snapshot-boundaries.mjs` passes and proves the two expansions independently.

The first dependency audit correctly failed on a newly published advisory set (1 critical, 6 high). A minimal release-toolchain update moved Astro to 7.3.2, Wrangler to 4.131.1, and affected transitive/overridden packages to patched versions. A subsequent `npm ci`, dependency audit, build, tests, browser checks, and full release gate passed with zero vulnerabilities.

Production workflow details, live smoke checks, and the rollback point are recorded in a separate deployment record after the exact merged SHA is deployed.
