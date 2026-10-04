# Phase 2 Measurement Methodology

## Time basis and clean windows

- Reporting timezone: Pacific Time, matching standard Search Console reporting.
- Clean pre window: 2026-08-31 through 2026-09-27 (28 days).
- Transition day excluded: 2026-09-28 PT.
- Clean post window: 2026-09-29 through 2026-10-26 (28 days).
- Earliest conservative decision review: 2026-10-29, allowing for Search Console finalization lag.
- Only rows marked `final` may unlock a destructive decision review.

## Evidence acquisition

`npm run collect:phase2:gsc` uses a read-only Search Console OAuth token and writes raw authenticated evidence only to the ignored `.artifacts/phase2-gsc/raw/` directory. Credentials and raw account evidence are never committed. Where direct API access is unavailable, owner exports may be copied into the ignored `docs/audits/phase-2-measurement-2026-09-29/private-evidence/` directory using the committed CSV templates.

Run `npm run generate:phase2:measurement` to create safe aggregate reports, then `npm run audit:phase2:measurement` to enforce the time gate and output integrity.

## Measurement rules

- Compare absolute values and percentage changes; label low samples rather than sensationalizing percentages.
- Keep raw queries beside deterministic, reviewable query-family mappings.
- Compute owner share, support share, shared-query rate, independent-query rate, and weekly alternation only from query×page evidence.
- Judge clusters as well as individual URLs.
- Treat AI and multimodal surfaces as `NO_OBSERVABLE_DATA` when evidence is unavailable.
- A generated recommendation never authorizes a merge; human user-job, unique-value, canonical, external-link, and content-salvage review remains mandatory.

## Search Console limitations

- Privacy filtering can omit query rows, so a missing query is not zero demand.
- The API and exports do not guarantee an exhaustive list of queries.
- Performance is generally attributed to Google's selected canonical.
- Property, page, and query totals can differ. Any gap remains `UNATTRIBUTED / PRIVACY-OMITTED`.
