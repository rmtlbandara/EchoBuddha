# Echo Buddha Phase 7 Pre-Edit UX and Navigation Diagnostic

Date: 2026-08-11
Branch: `codex/phase-7-ux-navigation`
Starting HEAD: `071deba4e6106f6597b4524d2a6deb99e344e26b`
Origin main at baseline: `a1cd457345587670133bfc58af1cafd80d038e6e`
Ahead/behind versus origin/main: 7 ahead, 0 behind
Working tree before Phase 7 artifacts: clean
Production baseline: Phase 6 deployment `7aa46f83-4fd2-4f66-a6c3-072769f12efc`, version `829cd28e-950c-4cca-a7d9-e1ec5a6a280d`

## Dependency Gate

PASS. Phase 6 is COMPLETE, release validation and CI passed, production parity is recorded, `MASTER_PRE_PHASE7_PROTECTION_REGISTER.csv` exists, unresolved critical/high trust issues are zero, and Phase 6 permits Phase 7 after owner review. The owner instruction to proceed with Phase 7 provides that review. Owner-only identity and credential questions remain safely withheld and do not block UX work.

## 1. Current Site Purpose Clarity

The homepage identifies Echo Buddha as Buddhist, beginner-friendly, practical, and calm. The first screen nevertheless offers four actions plus a values list, while later sections repeatedly re-offer Learn, Meditation, Daily Reflections, Quotes, Tools, and Start Here. The purpose is understandable; the immediate decision is busier than necessary.

## 2. Current Primary Navigation

The seven items are Start Here, Learn, Daily Reflections, Meditation, Quotes, Tools, and Articles, followed by a separate Search action. Every content system is presented at nearly equal weight. Start Here and Learn are clear goals; Meditation is a clear practice goal; Articles, Quotes, Tools, and Daily Reflections are content/utility systems. There is no visible current-section state.

## 3. Mobile Navigation

The menu becomes a two-column grid below 860px and passes the existing automated visibility/Escape check. The trigger uses native button semantics and `aria-expanded`. Gaps: no explicit focus transfer into the opened menu, no outside-click close, no close on breakpoint transition, and no current-page state. Seven links make the expanded header taller than necessary.

## 4. Homepage Journey

The page contains a clear hero but repeats pathways in a five-item need grid, six guide cards, a resource row, another Start Here callout, a five-step beginner path, quote sections twice, an article grid, meditation, tools, trust, and FAQ. The page behaves partly as a complete catalogue rather than a calm front door. Returning-user access to today's reflection is strong.

## 5. Start Here Journey

The role is correctly differentiated from the Buddhism for Beginners learning owner. Friction comes from six need cards, three pathway groups, a seven-step list, source-study links, daily reflection promotion, and FAQ on the same orientation page. The first learning action is clear but competes with too many later choices.

## 6. Learn Journey

Learn contains meaningful ownership-aligned groupings, but six pathway cards, general hub cards, search, an eight-link text-study panel, a beginner block, popular paths, and a final cross-site block create duplicate decisions. Beginner progression exists but is not the first dominant choice.

## 7. Meditation/Practice Journey

The practice hub distinguishes time, method, difficulty, and safety, then repeats nine choices and general hub cards. Safety is accessible and accurate. The two chooser systems should become one progressive model: start, choose a method, get help/adapt.

## 8. Articles/Reflection Journey

Articles are presented as topical editorial reading but use the broad title “Articles and Blog.” Their distinction from structured Learn content can be stated more directly. Daily Reflections support recurring use well, while Quotes are discoverable but overrepresented on the homepage and top navigation.

## 9. Quotes Journey

Origin labels and attribution boundaries are strong. Quotes do not need equal top-navigation prominence because the hub remains reachable from homepage reflection pathways, Articles, Search, and footer navigation.

## 10. Daily Reflection Journey

The direct Today action is strong and appropriate for returning users. The hub adds multiple paths and a full evergreen library, but the recurring loop remains understandable. Daily Reflection should remain in primary navigation with a shorter singular label.

## 11. Search Journey

Search is globally available as an action, uses a static index, distinguishes result types, supports exact and partial terms, excludes retired routes by construction, traps focus in its dialog, returns focus, closes on Escape/backdrop, and has a full no-result state. Improvements: announce result changes more completely, give an explicit query-adjustment action in no-results state, and use plainer result metadata separators.

## 12. Trust Journey

Phase 6 trust pages are reachable, but the flat footer does not explain the relationship among About, Editorial Policy, Sources, Content Process, Quote Attribution, Corrections, and Contact. Organizational author discovery varies by page family. A grouped footer is the safest improvement; trust pages should not enter primary navigation.

## 13. Breadcrumbs

Breadcrumb schema is widespread, while visible breadcrumbs are concentrated in article and dynamic learning templates. Visible hierarchy should be added to representative detail/hub templates only where it improves orientation, and must match useful user paths rather than merely copying folders.

## 14. Internal Links

The site has no broken internal links under the Phase 6 release gate. Link volume is high on several hubs. Context is generally descriptive, but repeated generic section headings (“Continue Learning,” “Related Reading”) sometimes hide the specific reason to proceed.

## 15. Related Content

Recommendations are mostly topic-aware through explicit data, which is stronger than arbitrary recency. Some detail pages display terms, owner links, multiple article cards, and quote cards together. Phase 7 should refine shared templates cautiously and avoid suppressing Phase 5 differentiation.

## 16. Footer

Fourteen flat links plus Privacy Settings form an undifferentiated list. Primary exploration, trust, and legal/utility tasks should be grouped, with Quotes and Tools preserved as secondary discovery paths.

## 17. 404 / Empty States

The 404 explains the problem and links Home, Articles, Quotes, and a legacy-style Meditation Guide route. It lacks Search and Start Here—the most useful recovery actions. Search no-results is functional but should clearly offer clearing/revising the query.

## 18. Accessibility

Fresh local automated audit: PASS on 17 routes. Fresh production automated audit: PASS on 16 routes. All existing consent scenarios pass. Skip link, landmarks, focus-visible styles, native controls, and search focus containment exist. Manual risk remains around mobile-menu focus and current-page orientation.

## 19. Responsive UX

The responsive system is lightweight and uses the same content/URLs. The header is compact, but the expanded mobile menu is long. Cards create tall scanning surfaces on hub and homepage layouts. Long words use wrapping and reduced-motion support exists.

## 20. Content Density / Readability

Long-form width, type size, line height, and contrast are generally strong. The main density issue is decision density on hubs—not paragraph readability. Phase 7 should remove repeated choices rather than truncate substantive teaching.

## 21. Primary UX Risks

- P1: first-time users face repeated, equally weighted choices on the homepage.
- P1: primary navigation exposes content systems more than the four core goals.
- P1: mobile navigation lacks complete focus/current-state behavior.
- P2: Learn and Meditation repeat their own chooser systems.
- P2: trust links are discoverable but not coherently grouped.
- P2: schema/visible breadcrumb coverage is inconsistent.
- P2: 404 recovery omits Search and Start Here.
- P3: search result announcements and no-result reset affordance can improve.

## 22. Protected State

URLs, canonicals, redirects, index/noindex, sitemap membership, Phase 2 owners, Phase 4 substance, Phase 5 editorial differentiation, Phase 6 publisher/authorship/source/attribution/correction/safety meaning, structured-data truthfulness, AdSense route restrictions, and consent behavior are frozen. Phase 7 may alter labels, grouping, presentation, and relevant internal links only.

## 23. Phase 7 Priority Queue

1. Simplify primary navigation around Start Here, Learn, Meditation, Articles, and Daily Reflection; retain Search as a separate action.
2. Complete mobile-menu focus, Escape, outside-click, and current-page behavior.
3. Reduce homepage repeated choices and clarify first-time versus returning actions.
4. Make Start Here, Learn, and Meditation progressive rather than catalogue-like.
5. Differentiate Articles, Daily Reflections, and Quotes through labels and supporting copy.
6. Improve Search announcements and no-result recovery.
7. Add useful visible breadcrumbs to shared detail templates where schema already represents hierarchy.
8. Group footer discovery into Explore, Trust, and Legal/Settings.
9. Improve 404 recovery.
10. Validate every protected register and cross-journey path before Phase 8 handoff.

## Current Primary Guidance Reviewed

- Google Search Central, page experience: https://developers.google.com/search/docs/appearance/page-experience
- Google Search Central, link best practices: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google Search Central, breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google Search Central, mobile-first indexing: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
- Google AdSense, site readiness and clear navigation: https://support.google.com/adsense/answer/7299563
- Google AdSense, ad placement and user goals: https://support.google.com/adsense/answer/1282097
- Google Publisher Policies: https://support.google.com/publisherpolicies/answer/10502938

These sources are treated as general user-experience and policy guidance, not invented ranking factors.
