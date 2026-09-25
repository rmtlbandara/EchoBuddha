# Buddhist Life & Practice Handbook — Implementation Report

Date: 2026-09-25  
Branch: `codex/buddhist-handbook`  
Base `origin/main`: `2bd1996`

## Delivered

- New canonical hub at `/learn/buddhist-handbook/`.
- Eight substantive, original chapters stored in one typed data model and rendered through one reusable Astro route.
- Explicit source/tradition notes, selected references, related terms, publication metadata, Article/CollectionPage/ItemList/BreadcrumbList schema, previous/next navigation, and related learning on every relevant page.
- Home and Learn discovery modules using one original, optimized 1600×900 WebP/AVIF illustration.
- Search index entries and aliases for hub and all chapters.
- Sitemap entries with `lastmod` for hub and chapters.
- Conservative monetization policy: hub `NEVER_MONETIZE`; chapters `HOLD_MANUAL_REVIEW`; AdSense runtime remains disabled.
- Nine complete indexable-page approvals.
- Source coverage audit, source ledger, search-intent map, image manifest, SEO validation record, and automated handbook tests.

## Ownership and duplication decisions

- The existing Three Jewels lesson remains the concise beginner owner.
- Existing dictionary pages remain definition owners for Dhamma and Saṅgha.
- The six Deeper Questions pages retain detailed ownership of Buddha-image, cetiya, Jetavana, Bodhi-tree, and `appaṭimo` issues. The handbook links to them rather than duplicating their evidence.
- The existing temple article retains checklist-style visiting intent; the handbook owns integrated respect for all three refuges.

## Editorial corrections and holds

- Corrected the source document’s conflation of Noble Saṅgha and ordained Saṅgha.
- Did not publish the 91,800,537,000-precept figure as canonical fact.
- Treated canon totals and 84,000 Dhamma items as traditional/edition-dependent.
- Labelled the Abhidhamma-in-Tāvatiṃsa account and long bodhisatta chronology as Theravāda tradition.
- Did not retell unverified peta/yakkha/punishment stories as history.
- Used AN 8.88 for bounded lay disapproval while adding modern safety and reporting boundaries.

## Deployment boundary

The repository’s governed deployment procedure requires separate production authorization after merge from an exact `main` SHA. This implementation does not deploy, request indexing, or claim live production status.
