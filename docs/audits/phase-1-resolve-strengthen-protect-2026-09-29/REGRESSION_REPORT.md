# Regression Report

Status: **PASS**  
Checked: 2026-09-29

## Protected architecture

- Sitemap/indexable count remains 165.
- On-site search count remains 330, including intentionally searchable noindex quote stories; its 19 excluded sitemap routes remain the deliberate navigation/policy set.
- Article identities remain 48; 384 generated article assets pass the image audit.
- All 165 indexable pages are self-canonical, have an H1, and remain free of sitemap/noindex conflicts.
- No URL, redirect, slug, canonical target, noindex state, quote-story governance, consent behavior, or ad-serving state was changed.

## Healthy clusters

Mindfulness, attachment/non-attachment, Right Speech, the Buddhist Handbook, Buddhist Questions, quote governance, daily reflections, trust pages, and policy content were not broadly rewritten. Their existing tests and release gates passed. Global structured-data cleanup removed only obsolete FAQPage/HowTo objects; visible content, Article/BlogPosting, BreadcrumbList, Organization, WebSite, DefinedTerm, and collection behavior remained governed by current templates.

## Validation evidence

- `npm run validate`: PASS — build, Phase 1 intent audit, image audit, typecheck, lint, 47 tests, SEO, content, quotes, trust, and historical boundaries.
- `npm run validate:release`: PASS — all preceding checks plus Phase 8 (17/17), Phase 9 (26/26), Phase 10 (19/19), Phase 11 (17/17 and 40/40), Phase 12 (57/57), Phase 13 (11/11), and dependency audit with zero high/critical vulnerabilities.
- `npm run audit:phase1:intent`: PASS — 22/22 technical and governance checks.
- `npm run audit:phase1:browser`: PASS — 18/18 mobile/desktop route combinations, zero serious/critical axe violations, overflow, broken/missing-alt images, CLS/FCP/LCP threshold failures, or obsolete schema objects.
- `npm run audit:production-smoke`: PASS against the currently deployed baseline: homepage, consent, AdSense firewall, security headers, robots, 165-URL sitemap, 330-record search index, owner/noindex routes, ads.txt, 404, HTTPS redirect, and preview noindex.

## Scope boundary

Production still serves the previously recorded content SHA. The successful live smoke test establishes that the pre-deployment baseline remains healthy; it is not a claim that this Phase 1 branch has been deployed.
