# Bing Webmaster investigation — November 11, 2026

The authenticated property was https://echobuddha.com/. Account observations and downloaded CSVs were collected on November 11. PR #103 merged and production deployed commit `bb44ff95fbba3e312a2a76b6f49a65a35cd2c551` at **14:24:30 UTC on November 11**. The full production artifact and crawl preserve all 171 canonical sitemap URLs, each returning 200. Search-engine stored data, fresh engine Live Tests, and direct current HTML checks are distinguished below.

## Recommendations

The full Recommendations view contained four issue types, 20 issue instances and 19 distinct affected URLs. [BING_TOP_RECOMMENDATIONS.csv](BING_TOP_RECOMMENDATIONS.csv) records each type and all 17 affected alt-warning URLs. The dashboard's shorter Home Top Recommendations panel showed inbound links and NOINDEX; the full table also supplied title and alt diagnostics.

| Diagnostic | Severity / affected pages | Evidence and disposition |
|---|---|---|
| Title too long | High / 1 | Three Marks of Existence had a long title. The production HTML now verifies “Three Marks of Existence in Buddhism”, 50 characters including the site suffix. Its fresh Bing Live URL test at 20:08 Asia/Colombo reported no title issue. The older stored recommendation still awaits Bing refresh |
| Inbound links from high-quality domains | Moderate / 0 named pages, 1 site issue | An audience-development diagnostic. No broken link or compulsory numerical threshold was demonstrated. No links, traffic or engagement were bought or manufactured |
| Meta robots review / NOINDEX | Moderate / 1 | `/daily-reflections/today/` intentionally selects existing entries, with a library path. Preserve legitimate noindex and sitemap exclusion |
| Missing ALT attribute | Low / 17 | All 17 affected pages have zero actually missing alt attributes in the current HTML. Two decorative brand images per page use empty alt and aria-hidden=true; content images have descriptions. Three Marks’ fresh Bing Live URL test still reports two missing-alt notices. The engine warning reproduces; an absent-alt DOM defect does not |

Valid decorative-image semantics were retained. The fresh Three Marks Live URL test completed at **20:08 Asia/Colombo on November 11** and reported that the URL can be indexed by Bing. Its only SEO/GEO issue was an **Alt attribute missing Notice with two instances**; it reported no title issue. The notice count is consistent with the two decorative empty-alt brand images seen in direct HTML, but that count alone does not identify Bing’s exact tested elements. This is not a claim that Bing cleared the alt warning or that the URL is now indexed. No sitewide noindex removal, invented title-length eligibility rule, or arbitrary backlink campaign was performed.

## Search, discovery and delivery

Home Search Performance displayed 87 clicks and rounded 6K impressions for August 11–November 10. Site Explorer's selected overview displayed 162 indexed, zero error, 81 warning and one excluded URL, from a 244-URL tracked inventory. These account inventories differ from the current 171 canonical sitemap URLs and 356 reachable HTML routes. They cannot be summed as independent current pages. The Site Explorer export available through the current filtered view contained 15 rows; it is not a complete 162-page index export.

Sitemaps displayed two known sitemaps, zero errors/warnings and 342 discovered entries: 171 each for canonical apex and historical discovered www sitemap. Apex was last crawled November 5; www November 4. The canonical apex had been submitted September 29; www discovered July 10. Current www requests normalize to apex. No duplicate current canonical sitemap was created and no historical item was deleted to hide the record.

The old Site Scan, “Echo Buddha Full SEO Scan Sep 2026”, was **43 days old** at the final check, with a 250-page cap, zero errors and 362 warnings: 249 alt and 113 long-title instances. It is historical scan evidence and does not describe the current production release. The fresh Site Scan interface showed **zero available pages**, and its scan controls were disabled. A new scan could not be started; no scan setting or quota was changed, and no new scan result is claimed.

IndexNow's submitted-URL table freshly showed the November 10 changes as “Yesterday at 21:16”, source Self. The durable release receipt confirms 24 accepted URLs after the independently passing smoke suite. Its aggregate chart was delayed and had no November 10 point, so that chart was not treated as contradiction or a reason to resubmit. For the November 11 production release, the saved changed-URL plan contained **171 updated URLs**. The shared consent-runtime change altered all 171 indexable HTML hashes; this does **not** represent 171 editorial rewrites. The release has 33 direct changed routes. After production identity and smoke acceptance, IndexNow accepted the 171 updated URLs with HTTP200 in run `43037973572`. Notification acceptance does not prove crawling, indexing, removal of stored recommendations, or AdSense approval.

Robots.txt, sitemap and representative flagged-page current fetches succeeded without a public challenge in the baseline. Google/Bing user-agent headers from a workstation are simulations, not authenticated crawler identity. The account's crawler results provide the stronger external crawl evidence. The verified production HTML remains subject to search-engine recrawl and stored-report refresh. The new Live URL result establishes Bing’s observed present access/indexability for the tested page, not a full 171-URL live-test result.

[Official recommendations guidance](https://www.bing.com/webmasters/help/recommendations-55a30304) · [Site Scan](https://www.bing.com/webmasters/help/site-scan-623520c9) · [IndexNow protocol](https://www.indexnow.org/documentation)
