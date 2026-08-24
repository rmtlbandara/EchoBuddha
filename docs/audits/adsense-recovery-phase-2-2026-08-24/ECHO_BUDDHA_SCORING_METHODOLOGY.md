# EchoBuddha Phase 2 Scoring Methodology

Generated: 2026-08-24T03:26:15.950Z

## Governance boundary

The Publisher Value Score is an internal EchoBuddha governance framework. It is not a Google, AdSense, Search, Quality Rater, or official E-E-A-T score and does not guarantee approval. A score is a structured evidence summary, not a final disposition.

## Evaluated state

- Frozen production source SHA: `83a685bcf942349e632ae043a1327b3ed53549df`.
- Current repository SHA: `55872f8d03271fb97cc047d7e6edefc375aabc87`; its source tree is unchanged from the frozen SHA.
- Live sitemap and robots hashes still match Phase 0.
- Phase 0: PASS; Phase 1: PASS; baseline drift: not detected.
- Repository treated as private; no private content was submitted to external benchmark hosts.

## Dimensions and weights

| Dimension | Weight | Evidence used |
|---|---:|---|
| independent purpose | 15 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| originality | 15 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| external value | 15 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| internal differentiation | 15 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| completeness | 10 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| editorial contribution | 10 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| trust | 5 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| ux | 5 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| search equity | 5 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |
| return value | 5 | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |

Raw scores use 0 absent, 1 very weak, 2 weak, 3 adequate, 4 strong, 5 exceptional. Weighted score is `raw / 5 × weight`. All 10 dimensions retain raw score, weighted contribution, evidence note, and confidence in the master CSV.

## Judgment controls

- Word count is diagnostic only and never directly awards points.
- AI/automation is not penalized by itself; observed templating, weak purpose, low differentiation, or inadequate review are.
- Technical SEO does not increase publisher value, except that usable production behavior informs the 5-point UX dimension.
- Search evidence is limited to 5 points and is treated as a later preservation constraint, not proof of quality.
- Query ownership is `NO_DATA` because the preserved GSC export has separate query and page dimensions rather than a query×page join.
- External comparison uses three accessible current authoritative resources per intent cluster. Source authority and coverage are compared qualitatively; raw competitor word counts are not used.
- Full scores apply to 182 indexable publisher-content pages. Twelve indexable trust/legal/contact pages are assessed separately rather than forced through article criteria.

## Second pass

The independent challenge pass covers every score below 50, every SEO-high page below 70, every score within ±3 of 30/50/70/85, every indexable quote story, every scored owner/support participant, and a SHA-256 deterministic sample of at least 10% of remaining pages. A 10+ point variance triggers explicit dispute reconciliation. The complete record is in `ECHO_BUDDHA_SECOND_PASS_REVIEW.csv`.

## Limits

Cluster benchmarks cannot substitute for a subject-matter expert's claim-level review. Historical drafting/reviewer activity is not fully verified. External originality is not mass-checked. Search query ownership and backlink exports are unavailable. Low-confidence scores must not drive destructive action.
