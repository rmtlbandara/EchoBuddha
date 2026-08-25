# Echo Buddha Technical Index Governance

1. Every HTML route must resolve through `src/data/search-index-policy.mjs`; unknown routes fail the build.
2. Indexable pages are 200, crawlable, self-canonical, and sitemap-listed.
3. User-useful exclusions are 200, crawlable, `noindex, follow`, self-canonical, sitemap-excluded, and never monetized.
4. Permanent moves use approved one-hop 301 redirects. Redirect sources are absent from the sitemap and controlled internal links.
5. Removed URLs return true 404/410 and are never canonical or sitemap targets.
6. Technical resources are classified separately and are not required to be indexed.
7. `robots.txt` controls crawling, not deindexing. Do not block pages that Google must crawl to observe `noindex`.
8. Sitemap `lastmod` is emitted only from maintained content/review dates; never use a build timestamp.
9. New substantive routes default to `HOLD_MANUAL_REVIEW` until index state, canonical, sitemap, internal-link and Phase 10 monetization policy are reviewed.
10. Redirect, canonical, robots, sitemap and schema changes require Phase 11 validation, independent set comparison, secret scan and a reversible release.
11. Search Console is production evidence. It never proves an unreleased branch state.
12. No indexing request, sitemap submission, deployment or AdSense action is authorized by this phase.
