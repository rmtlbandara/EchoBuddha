# Controlled Q7 Buddhist Question Implementation Report

Date: 2026-09-28

Release state: deployed and live-verified

Starting `origin/main`: `ed9fa4564c21de314039a87692d73d19d5f7fa91`

Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/47

Implementation head: `98781bfb9c6c31d73e5a3a4c2b8024a5550d4a80`

Merged and deployed SHA: `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`

## Authorized result

Exactly one source-aware Learn-detail page is added:

`/learn/questions-about-buddhism/when-did-buddha-statues-first-appear/`

Historical expansions remain Q1/Q2 +2, Q3/Q4 +2, Q5 +1, and Q6 +1. Current Expansion 5 adds Q7 +1. Cumulative scope is exactly Q1–Q7, with no Q8+ route or placeholder.

## Research and source hierarchy

The page gives two plainly labelled answers. The historical answer uses securely dated museum evidence: human-form Buddha images survive from the early centuries CE, including Gandhāra and Mathurā traditions, but the absolute first image is unknown and no lifetime statue is presently demonstrated. Early textual silence is not converted into a prohibition.

The traditional answer uses Xuanzang’s seventh-century record of the King Udayana sandalwood-image story. It is identified as evidence that a lifetime-image tradition circulated by Xuanzang’s era, not as eyewitness or archaeological proof of the event described.

The relevant Pāli commentarial passages were checked directly in the Chaṭṭha Saṅgāyana Tipiṭaka. The relic-bearing image passage is in the commentary to MN 142, and its setting is after Parinibbāna. The Bodhi-branch passage is in the commentary to MN 115 and establishes commentarial familiarity with images without dating their origin. The page deliberately corrects alternative attributions in the supplied research.

Academic chronology is used narrowly: the extant Majjhima commentary is associated with fifth-century Buddhaghosa and draws on older Sinhala materials, but the lost earlier sources do not permit every surviving sentence to be projected into the Buddha’s lifetime.

## Originality and people-first value

Q7 is organized as an evidence comparison rather than a rewrite of supplied material. It adds direct primary-text location verification, distinguishes the earliest securely attested evidence from an absolute first, explains preservation limits, and treats sacred tradition respectfully without making it perform the work of archaeology. This follows Google’s current people-first guidance on original analysis and additional value; monetization remains a manual hold under the site’s existing firewall.

## Integration boundary

- Fixed canonical route under the existing Questions About Buddhism hub.
- Exact approved H1, SEO title, description, intro, and 2026-09-28 publication metadata.
- Article and BreadcrumbList structured data; no FAQPage or QAPage.
- Hub discovery through the existing data-driven seventh card.
- Homepage remains exactly one representative Q2 gateway; Q7 is not added there.
- Data-driven sitemap and internal-search inclusion exactly once.
- Q6 → Q7 and Q7 → Q6 navigation, with no Q7 Next link.
- Q7 remains `LEARN_DETAIL / HOLD_MANUAL_REVIEW`; no ad runtime or slot is authorized.

## Expected current-state delta

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| HTML routes | 350 | 351 | +1 |
| Indexable routes | 164 | 165 | +1 |
| Non-indexable routes | 186 | 186 | 0 |
| Sitemap URLs | 164 | 165 | +1 |
| Internal-search records | 329 | 330 | +1 |
| NEVER_MONETIZE | 253 | 253 | 0 |
| ELIGIBLE_CANDIDATE | 7 | 7 | 0 |
| HOLD_MANUAL_REVIEW | 90 | 91 | +1 |

## Local validation

- `npm ci`: pass; 331 packages installed and 0 vulnerabilities reported.
- Build: pass; 351 HTML pages.
- Typecheck and governance lint: pass.
- Tests: pass; 47/47.
- SEO, content, quote, trust, historical-boundary, dependency, and active Phase 8–13 validation: pass.
- `npm run validate:release`: pass.
- General browser and consent audit: pass across the standard 18-route set.
- Buddhist-question browser audit: pass for the hub and Q1–Q7 at 390×844, 768×1024, and 1440×900 (24 combinations), with no overflow, heading skip, replacement character, missing visible keyboard focus, or critical/serious axe finding.

## Hosted validation and production

PR run `36390052168` passed both release validation and browser/consent validation. PR #47 was merged to exact SHA `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`.

Production run `36390355988` checked out that full SHA, rechecked that it was the current `origin/main`, ran the complete release suite, created an immutable 802-file artifact, verified every manifest digest, and deployed the artifact through the protected production environment.

- Cloudflare deployment: `5539d314-4e9a-41af-8e3a-8e7f45c32fd8`
- Cloudflare version: `326a474b-be1f-4c46-ad4f-f83243f99c53`
- Deployed at: `2026-09-28T07:13:29.596847Z`
- Release manifest: 802 files; aggregate SHA-256 `82e82db89678fcf510cce5d810c0a28f3a4957d782f298efb57286f532d72adc`

The workflow’s smoke gate ran less than one second after Cloudflare recorded the deployment. Twelve checks passed, while `sitemap.xml` and `search-index.json` briefly returned the previous cached counts of 164 and 329. The deployed Q7 artifact itself had already passed manifest verification. A post-convergence rerun returned 14/14: 165 sitemap URLs and 330 search records, with Q7 present exactly once in each. No second deployment was performed.

Live verification also confirmed:

- Q1–Q7 all return HTTP 200.
- Q7 has one exact H1, a self-canonical URL, indexable metadata, the 2026-09-28 publication date, and Article plus BreadcrumbList schemas with no FAQPage.
- Q6 links forward to Q7; Q7 links back to Q6 and has no future Next target.
- The hub has exactly seven cards; the homepage remains exactly one curated Q2 gateway and excludes Q7.
- No AdSense runtime or manual ad slot is present.
- The live hub plus Q1–Q7 browser matrix passes all 24 viewport combinations with zero critical or serious accessibility findings.
- No Q8+ route appears in the sitemap, search index, data model, or navigation.

The prior rollback target is Git SHA `29deac1469a1b20cfa270a41b40572cdd8cdc3f0`, Cloudflare deployment `78c0719a-631c-415b-b48a-243abb97bd44`, version `1d62ac59-b2b3-4073-92a3-9a15aaf8f62d`.
