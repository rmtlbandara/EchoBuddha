# Q10–Q12 implementation report

Date: 2026-11-18  
Status: deployed and verified live

This controlled expansion adds exactly Questions 10, 11, and 12 to Learn → Questions About Buddhism. It does not create Q13 or future placeholders.

## Implemented scope

- Q10 separates Buddhist relic-miracle narratives from historical authentication.
- Q11 explains why physical non-use does not make post-Parinibbāna devotion meaningless while preserving the conditional character of kamma and merit.
- Q12 distinguishes `cetanā`, mental kamma, and completed generosity while labeling the bodily-intimation account as later Theravāda scholastic analysis.
- Q9 now links forward to Q10; Q10 and Q11 have bidirectional sequence navigation; Q12 is the terminal page.
- The hub grows from nine to twelve deeper-question cards. The compact ten-item FAQ and homepage Q2 feature remain unchanged.
- All three routes are `LEARN_DETAIL`, `HOLD_MANUAL_REVIEW`, indexable, self-canonical candidates. Advertising stays off.

## Inventory result

The exact baseline-to-candidate delta is 373→376 HTML pages, 175→178 sitemap URLs, 198→198 noindex pages, 352→355 search records, and 100→103 `HOLD_MANUAL_REVIEW` routes. No public route was removed and no canonical owner or index state was changed.

## Evidence model

Claims are registered in `SOURCE_CLAIM_REGISTER.csv`. Early discourses, canonical devotional verse, later chronicle, later scholastic analysis, and modern historical method are kept visibly distinct. No supplied source-book wording or image is published.

## Release process

Local release validation passed under Node 22.23.4 with 142/142 tests and all Phase 8–13 controls. The candidate question browser matrix passed 52/52 route/viewport combinations with no critical or serious accessibility violations. The global browser check passed, and all 20 mobile/desktop Lighthouse runs scored 1.00 for both performance and accessibility. Hosted PR and merged-main CI both passed; exact-main production workflow `44435296691` deployed SHA `59766461e71a1c3a59917c95194efb40aad50be5`. Production smoke passed 15/15, and the independent live question browser matrix passed 52/52.
