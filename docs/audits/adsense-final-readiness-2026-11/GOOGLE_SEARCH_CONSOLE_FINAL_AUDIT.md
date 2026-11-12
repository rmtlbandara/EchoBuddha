# Google Search Console — November 11, 2026

The authenticated domain property is echobuddha.com. PR #103 merged and production deployed commit `bb44ff95fbba3e312a2a76b6f49a65a35cd2c551` at **14:24:30 UTC on November 11**. The full production artifact and crawl preserve all 171 canonical sitemap URLs, each returning 200. Fresh read-only API collection at 02:56:48 UTC returned all 47 historical priority inspections successfully. [GOOGLE_PRIORITY_URLS.csv](GOOGLE_PRIORITY_URLS.csv) compares November 10 evening with November 11, preserving last crawl, canonical, current HTTP, robots and sitemap evidence. API credentials and raw queries remain private.

## Priority inspections and current availability

| State | Nov 10 evening | Nov 11 |
|---|---:|---:|
| Submitted and indexed | 5 | 5 |
| Crawled, currently not indexed | 28 | 28 |
| Discovered, currently not indexed | 9 | 10 |
| Unknown to Google | 5 | 4 |

All 47 priority URLs returned 200, self-canonical indexable HTML, were included in the 171-URL sitemap and reachable through internal links in the baseline; the post-release full production crawl confirms all 171 sitemap URLs still return 200. Those public fetches are independent HTTP checks, **not 47 Google Live Tests**. Stored Google crawl times mostly predate the November 10 content deployment. A stale result is not a rejection of subsequently changed content. Six additional November 10 revised teaching URLs outside the 47 were inspected: home practice, dukkha, Eightfold Path hub and posture were indexed; Eightfold beginner article was crawled/not indexed, and Handbook qualities was discovered/not indexed. Those stored crawls likewise predate the new work.

A fresh Google Live Test for `/learn/buddhism-101/three-marks-of-existence/` completed at **20:01 Asia/Colombo on November 11**, after the verified production deployment. It reported **URL available to Google**, **can be indexed**, and **one valid Breadcrumb item**. The shortened title is also verified in the live HTML. This is one current access/indexability test, not confirmation that the page has entered the stored index. The 47 stored priority results remain **five indexed, 28 crawled/not indexed, ten discovered/not indexed and four unknown**; they must not be represented as 47 indexed URLs.

## Account-level categories

Page indexing, updated November 6: 134 indexed and 237 excluded. Exclusions displayed 126 noindex, 83 crawled/not indexed, 16 discovered/not indexed, 10 redirects, one redirect error and one alternate canonical. Genuine 404 was zero; no new server-error or soft-404 category was displayed. This historical domain inventory includes legacy URLs and differs from the current sitemap and public crawl. Noindex is intentional for the quote/reflection support model and search/date utilities; current sitemap has zero noindex entries.

The sole redirect-error example was `/terms-and-conditions/`, last crawled October 24. Both current legacy slash forms correctly make one 301 to `/terms-of-use/`, preserve a query, then return 200. Google's Validate fix action was initiated November 11; the account confirmed “Validation Started”, started 11/11/26. Validation completion is pending. No current new redirect change was required.

The full **ten-example Page with redirect list** was read at **14:11 UTC on November 11**. Each example was checked and made one intentional 301 redirect to a 200 destination. These normalizations were preserved; no redirect was removed merely to reduce Search Console’s exclusion count. This check is distinct from the single historical redirect-error example and its pending validation.

The sole alternate-canonical example was the HTTP form of `/learn/buddhism-101/what-is-mindfulness/`, last crawled July 4. Its current HTTPS normalization and canonical treatment are expected. That intentional alternate was not falsely certified as a defect.

Sitemaps: the sole submitted canonical sitemap showed Success, 171 discovered pages, last read November 7 and original submission August 21. HTTPS showed zero non-HTTPS and 32 HTTPS URLs with no critical issue. Mobile and desktop Core Web Vitals had insufficient 90-day field data; this is not a passing field-performance verdict. Breadcrumbs updated November 10 showed 21 valid, zero invalid. Manual Actions and Security Issues both freshly showed no issues detected.

Crawl Stats updated November 9: 1,515 requests, 38,082,418 downloaded bytes, average 111 ms. Apex accounted for 1,504 requests and www 11; both host statuses showed no problems. Responses were 96% 200, 3% 301 and under 1% 404. AdsBot was under 1% of crawler mix. This supports successful observed crawler access, not a guarantee every future request passes.

## Search performance

Finalized API windows end November 8 to avoid the latest partial reporting days.

| Window | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| October 12–November 8, 28 days | 78 | 4,534 | 1.72% | 8.99 |
| September 14–October 11, 28 days | 63 | 4,129 | 1.53% | 8.71 |
| August 11–November 8, 90 days | 171 | 12,713 | 1.35% | 10.33 |

The recent window has more clicks/impressions and a slightly lower average ranking position than the previous window. It ends before the November 10 release and cannot measure its effect. Dimension exports cover 188 landing-page rows, 161 country rows, three devices and 323 query rows. Query privacy filtering means a query table need not add up to site totals.

In 90 days Daily Reflections contributed 56 clicks/487 impressions; Right Speech 15/3,366; homepage 13/71. Mobile supplied 101 clicks/4,378 impressions, desktop 59/8,156 and tablet 11/179. United States supplied 88 clicks/5,493 impressions, United Kingdom 15/891, Australia 9/521 and Canada 8/430. These patterns support clear mobile reading and distinct speech explanations. They do not justify localized mass pages or keyword stuffing. Query themes included daily reflections, Four Noble Truths and Dhamma/Dharma meanings; no private raw query export is committed.

After the verified deployment, the Three Marks Live Test supplies a current check for one materially revised page; ordinary recrawling and stored-report updates remain pending. The release has 33 direct changed routes. A shared consent-runtime change updated all 171 indexable HTML hashes, which is not 171 editorial rewrites. IndexNow accepted those 171 updated URLs with HTTP200 in run `43037973572`; that notification does not establish Google indexing. Search Console cannot be made to index every sitemap URL, and a request is not indexing confirmation. No wholesale Search Console indexing requests for unchanged pages were made. [Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
