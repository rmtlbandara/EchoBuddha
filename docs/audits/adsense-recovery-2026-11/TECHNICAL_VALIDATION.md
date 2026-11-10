# Technical, accessibility and reader journey validation

November 10, 2026. Public results describe the November 5 production Worker. Candidate results describe the locally built Wrangler Worker.

## Public inventory

The sitemap and internal-link crawl found 171 sitemap URLs and 356 linked HTML routes. All 171 sitemap URLs returned 200, had unique titles and descriptions, one H1, self-canonicals and indexable robots metadata. No sitemap URL used an SVG as its social preview. The 185 additional linked routes include 153 quote detail URLs, 31 reflection details or utilities, and Search, all intentionally excluded from indexing. Eight crawled pages contain tables. Thirty-five learning pages lacked visible or stored date evidence in the inventory diagnostic. Dates were added or changed only where the repository records support them. The [editorial register](EDITORIAL_QUALITY_REGISTER.csv) carries these observations per page.

The earlier same-SHA browser assessment covered 14 live reader journeys. Current probes checked the apex, host/protocol redirects, an unknown route, publisher and trust metadata, security headers, preview noindex and crawler response delivery. The known tablet overflow and slashless legacy Terms 404 are still properties of this serving release. The prior dated report keeps separate evidence for its mobile and desktop Lighthouse sample and the 820 px overflow. [Earlier November report](../adsense-review-2026-11-10/FINAL_REPORT.md) · [Cloudflare probes](CLOUDFLARE_CRAWLER_AUDIT.md)

## Candidate checks

| Test | Observed result |
|---|---|
| Deterministic release validation | Passed, including 98/98 tests. Covered build, types, metadata, internal URLs, structured data, source metadata, consent defaults, ad runtime off, security and release-governance contracts. |
| Main accessibility and consent browser suite | Passed against the local Worker. The route set includes reading pages, quote, reflection, search, tools, trust, privacy and the genuine error route. |
| Tools browser suite | Chromium and Firefox passed timers, glossary search, focus, reflow and axe checks. The first WebKit candidate run returned a transient or environment-specific card-style discrepancy to investigate. |
| Buddhist questions browser suite | Passed 30 route/viewport checks with zero critical or serious automated accessibility violations. |
| Topic guide browser suite | Passed all 24 Chromium checks across eight guides and mobile, tablet and desktop. |
| Changed routes and entry points | 17 HTTP/canonical/H1 checks and 78 Chromium reflow checks. axe returned zero automated violations in 34 main-content runs at 320 and 1440 px. |
| Homepage tablet fix | Passed at 320, 390, 640, 768, 819, 820, 821, 834, 853, 912, 980, 1024, 1280 and 1440 px. |
| Sitemap and dates | The candidate sitemap URL set matches the live 171 exactly. The publishing and browser contracts cover the relevant update dates and the distinction between modification and publication dates. |
| Terms and 404 | Both legacy variants return one 301 with the original query to the 200 Terms page. A random unknown URL returns HTTP 404. |
| Performance | The final candidate lab run is tracked with the pull request. Field Core Web Vitals remain unavailable in Search Console. |

Automated accessibility evidence covers the stated routes, browsers and checks. Typography, help text, contrast, focus and reading journeys remain part of owner review and public acceptance. Keep production validation distinct from lab timing and validate actual consent behavior on the serving site after release. [Release verification](RELEASE_VERIFICATION.md)
