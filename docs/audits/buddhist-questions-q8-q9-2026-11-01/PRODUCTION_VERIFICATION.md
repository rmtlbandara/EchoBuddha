# Q8 and Q9 production verification

Status: **PASS — deployed and independently verified.**

## Release identity

- Implementation PR: [#76](https://github.com/rmtlbandara/EchoBuddha/pull/76), merged.
- Implementation commit: `1393a1e671ff1c67da736dec7a64f3e726afb7d3`.
- Deployed merged-main SHA: `1edcd52d77c6c01545d1439d85617842e08d594f`.
- PR validation: workflow `41290958225`, success.
- Exact merged-main validation: workflow `41291155872`, success.
- Production workflow: `41291362233`, success.
- Cloudflare deployment: `d777dc4b-6e97-4b7d-ba4d-4b8dfbb687a8`.
- Cloudflare version at 100%: `766a496e-d66d-4d7c-b7b9-4212e130dac7`.
- Production deployment time: `2026-11-01T09:03:59.165251Z`.

The downloaded immutable release manifest records 814 files, aggregate SHA-256 `9924c130126f108f7abb44652790e62c50b53599f0f792b77b09ee97e2410ca0`, and the exact deployed SHA. The hosted production smoke suite passed 15/15. `/release.json` independently returned the same SHA.

## Live Q8/Q9 verification

- Both approved canonical routes return HTTP 200 with the exact approved title, H1, self-canonical, and 2026-11-01 publication metadata.
- Each page emits one `Article` and one `BreadcrumbList`; neither emits `FAQPage`.
- Q8 navigation links Q7 and Q9; Q9 links Q8 only.
- The live hub contains exactly Questions 1–9.
- The live browser audit passed 30/30 hub/Q1–Q9 × mobile/tablet/desktop cases with zero critical or serious axe findings.
- Sitemap contains 167 URLs and internal search contains 332 records; Q8 and Q9 occur exactly once in each.
- Q10 and the tested unapproved alias return HTTP 404.
- Ad runtime remains absent from Q8 and Q9. Both monetization states remain `HOLD_MANUAL_REVIEW`; no AdSense review was submitted.

IndexNow accepted four changed canonical notifications with HTTP 200 at `2026-11-01T09:04:03.670Z`. This records notification acceptance only, not guaranteed indexing.

## Measurement receipt

The actual Pacific deployment day, 2026-11-01, is excluded. The new 28-day observation window is 2026-11-02 through 2026-11-29; the earliest finalized review is 2026-12-02, subject to stable substantive content and actually finalized data.

Rollback reference before release: serving SHA `1ed945581f6802046f8d3245e0480f5c58dabc2c`, Cloudflare deployment `2c067402-d43f-4aac-9ae3-6821e4da2be2`, version `911d7db1-fbed-4451-9761-bd4d6da17364`.

Later documentation-only receipt commits may advance `main`; they are not a new application deployment or measurement intervention.
