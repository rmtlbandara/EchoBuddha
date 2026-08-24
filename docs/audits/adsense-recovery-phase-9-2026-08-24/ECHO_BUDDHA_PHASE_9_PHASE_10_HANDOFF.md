# Phase 10 Handoff — AdSense Inventory Firewall

Phase 10 has **not** started. Production and AdSense remain unchanged.

## Never-ad / exclusion areas

- Header, primary/mobile navigation, search dialog, breadcrumbs, footer, consent UI, cookie/privacy controls.
- 404, Search, Tools, Contact, Corrections, legal/policy, author, editorial-process, source, safety, and other system/trust surfaces.
- User-only/noindex quote-story permalinks and any noindex/error route.
- Article table of contents, forms/controls, share/copy controls, source lists, safety notes, and related-navigation cards.
- Mobile first screen, before the page H1/lede/key context, and inside multi-step practice instructions.

## Layout and stability constraints

- Do not reserve empty ad boxes while runtime/manual slots remain disabled.
- Any future slot needs explicit dimensions/aspect-ratio and must not move main content or controls (CLS protection).
- Keep the current first-screen content visibility and 320px reflow baseline.
- Do not place ads where they can be confused with navigation, quotes, recommendations, source citations, or publisher trust information.
- Preserve Phase 5 quote indexation, Phase 3 P0/P1 equity, and the current no-runtime/no-manual-slot state until Phase 10 is separately authorized.
