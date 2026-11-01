# Q8 and Q9 implementation report

Status: pre-release implementation and local validation complete; hosted CI, deployment, and live verification pending.

## Scope

The bounded Questions About Buddhism series now contains exactly Q1–Q9 in source. This change adds only:

- Q8: `/learn/questions-about-buddhism/did-buddhists-agree-on-image-veneration/`
- Q9: `/learn/questions-about-buddhism/which-cetiya-gives-more-merit/`

Q7 gains a next link to Q8; Q8 links between Q7 and Q9; Q9 has no next link. Q1–Q7 article bodies, metadata, and sources remain unchanged. The homepage still features Q2 as its sole question gateway. The parent hub grows from seven to nine cards. No compact FAQ entry, Q10, alias, placeholder, or “100 questions” page was added.

## Editorial decisions

Q8 preserves the useful observation that the Kathāvatthu records many disagreements without identifying Buddha-image veneration as a controverted point. It corrects the unsupported leap to universal agreement. Direct research found shrine-related passages but no disputed proposition specifically about image veneration; the page states that narrower finding and uses chronology to limit, not reverse, the argument from silence.

Q9 preserves both traditional cetiya precedence and the importance of intention. It distinguishes ceremonial order, physical connection, and individual karmic fruit. Kariyawasam supports the Sri Lankan ritual order; AN 6.63 and AN 6.37 support principles relevant to intentional action and giving, while the page states that neither discourse ranks cetiyas.

## Source and writing process

All listed sources were opened and checked on 2026-11-01. Claims and boundaries are recorded in `SOURCE_CLAIM_REGISTER.csv`. The pages are original Echo Buddha prose. They were reviewed for natural spoken rhythm; QuillBot and other automated paraphrase services were not used. No human, monastic, or academic endorsement is claimed.

## SEO, schema, and inventory

Both pages use their approved title, SEO title, description, self-canonical, publication date, and modified date of 2026-11-01. They emit `Article` plus `BreadcrumbList`, with no `FAQPage` or `QAPage` schema.

Expected production inventory after release: 353 HTML documents, 167 sitemap URLs, 186 noindex HTML documents, and 332 internal-search records. Both new routes are `LEARN_DETAIL / HOLD_MANUAL_REVIEW`; advertising remains entirely disabled.

Local release validation passed all 98 tests, current phase gates, historical boundaries, dependency checks, and the 353-page build. General browser readiness passed. The dedicated question audit passed 30/30 hub/Q1–Q9 route-and-viewport combinations with zero critical or serious axe findings. The correct release-candidate Lighthouse matrix passed 10 mobile and 10 desktop cases with performance and accessibility scores of 100 throughout. Source-link QA passed eight direct HTTP 200 checks plus one independently verified current Met page that rate-limited the audit client.

## Release path

The implementation will use a pull request, required hosted checks, merge to main, exact merged-main validation, and the manual exact-SHA production workflow. The workflow’s smoke gate must pass before its manifest-diff IndexNow submission. No direct local deployment, protection bypass, manual GSC indexing request, or AdSense review submission is authorized.
