# Phase 7 Navigation Change Plan

## Current navigation

1. Start Here
2. Learn
3. Daily Reflections
4. Meditation
5. Quotes
6. Tools
7. Articles
8. Search action

## Problems

Seven equal content destinations mix user goals with formats and utilities. The order separates Learn from Meditation, puts recurring reflections before practice, and gives Quotes/Tools equal weight with foundational goals. There is no active/current state. The mobile expansion is longer than the primary journey model requires.

## Proposed navigation

1. Start Here — newcomer orientation
2. Learn — structured foundational and source-aware learning
3. Meditation — practice selection
4. Articles — editorial reading and applied reflection
5. Daily Reflection — direct recurring-user action
6. Search — separate button/dialog action

## Item-by-item justification

| Item | Decision | Reason |
| --- | --- | --- |
| Start Here | Keep first | The clearest first-time orientation action. |
| Learn | Keep second | Owns structured learning and broad teaching discovery. |
| Meditation | Move to third | Represents the primary practice goal. |
| Articles | Move to fourth | Represents editorial exploration, clearly after learning/practice. |
| Daily Reflections | Keep, shorten label | A high-value recurring-user path; shorter mobile label. |
| Quotes | Remove from top level | A reflection format, not a primary goal; preserve through homepage, Articles, Search, and footer. |
| Tools | Remove from top level | A utility layer; preserve through homepage practice panel, Search, Daily Reflections, and footer. |
| Search | Keep as separate action | Complements, rather than replaces, the goal-based hierarchy. |

## Alternative discovery paths

Quotes remain linked from homepage reflection content, Start Here, Learn, Articles/related content, Search, and the grouped footer. Tools remain linked from homepage returning-user content, Daily Reflections, Meditation timer links, Search, and footer.

## Mobile impact

The menu shrinks from seven links to five. It remains a simple responsive list—no dropdown or nested system. Opening moves focus to the current item or first link; Escape and outside click close it and return focus; breakpoint changes reset stale open state; current-page state is exposed visually and with `aria-current="page"`.

## Trust impact

Trust pages do not enter the main menu. The footer gains a clear Trust group covering About, Editorial Policy, Content Process, Sources, Corrections, and Contact without altering Phase 6 wording.

## Search impact

Search remains visible in the header at every viewport. It is not placed inside the mobile menu, so the five primary links do not hide the exact-intent journey.

## Rollback plan

Restore the prior `navItems`, remove pathname-to-section matching and mobile focus/outside-click handling, and restore the flat footer. No URL, canonical, index, redirect, sitemap, trust text, consent, or advertising rollback is required.

## Owner review requirement

The change is material but reversible and remains within the owner-authorized Phase 7 brief. Final deployment still requires separate authorization.
