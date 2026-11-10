# Google Search Console audit

The verified Domain property was checked on November 10, 2026. The evening URL Inspection batch returned 47 successful responses at 19:24 Sri Lanka time. The same 47 pages were inspected in October and that morning. The complete results, crawl timestamps, canonicals and separate live probes are in the [priority URL comparison](GOOGLE_PRIORITY_URLS.csv).

| Reported URL Inspection status | October 30 | November 10 morning | November 10 evening |
|---|---:|---:|---:|
| Submitted and indexed | 3 | 4 | 5 |
| Crawled, currently not indexed | 30 | 29 | 28 |
| Discovered, currently not indexed | 11 | 13 | 9 |
| URL is unknown to Google | 3 | 1 | 5 |
| Total | 47 | 47 | 47 |

The five indexed URLs were Forgiveness, Eightfold Path in Daily Life, the Buddhism 101 hub, Five Aggregates and Three Marks. Google reported an allowed robots state, successful page fetch and allowed indexing for 33 records. The other 14 had unspecified inspection values. Where present, Google-selected canonicals agreed with the inspected URLs. The separate live crawl found all 47 at HTTP 200, self-canonical, in the sitemap and linked by 2–56 other crawled pages. These observations narrow the diagnosis to the state of Google's discovery, crawl and selection. Individual reasons for exclusion and the impact of the candidate are unknown. The candidate was local during both November snapshots.

## Property evidence

| Report | Observation |
|---|---|
| Page Indexing, updated November 6 | 134 indexed and 237 excluded. Exclusions comprise 126 marked noindex, 83 crawled and 16 discovered but unindexed, 10 redirects, one redirect error and one alternate canonical. The property report and priority inspection are different populations and have different processing dates. |
| Sitemaps | Successful, last read November 7, 171 discovered URLs. Live sitemap also contained 171. |
| Legacy Terms | Google last observed the slash form October 24. Current slash form redirects once, and the slashless form returns 404. The candidate covers both variants. |
| HTTPS and enhancements | HTTPS report November 10 showed 32 HTTPS and zero non-HTTPS URLs. Breadcrumbs November 9 showed 22 valid and zero invalid. These reports cover their own samples. |
| Crawl Stats | 1,507 apex requests and 11 www requests shown, with “No problems” for both hosts. Average response time 111 ms. |
| Field Core Web Vitals | Insufficient property data for mobile and desktop. |
| Manual actions and security | Both displayed “No issues detected.” |

## Search performance and audience

| Finalized date window | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| September 13–October 10 | 62 | 4,310 | 1.44% | 8.77 |
| October 11–November 7 | 78 | 4,495 | 1.74% | 8.80 |
| August 10–November 7 | 171 | 12,686 | 1.35% | 10.40 |

The 90-day Search Console page dimension returned 189 rows, including older URLs. For the current site, Daily Reflections had 55 clicks and 467 impressions, Right Speech 15 and 3,366, Dhamma vs Dharma 14 and 2,319, and the homepage 12 and 69. Query-level rows were reviewed separately and are subject to Search Console privacy and aggregation. They support ordinary reading tasks around Buddhist concepts, speech, reflections and practice. The country dimension reported 88 clicks from the US, 15 from the UK, nine from Australia, seven from Canada and six from India. Device totals were 99 mobile, 60 desktop and 12 tablet clicks. The editorial register includes page-level clicks and impressions when returned.

GA4 for November 3–9 showed 21 active users and 112 sessions, including 53 Organic Search, 53 Direct, five Organic Social and one Unassigned. The leading viewed routes included Today’s Reflection (88), the homepage (85), Daily Reflections (42), Start Here (40) and Learn (36). GA4 captures consented measurement and differs in date window and attribution from Search Console. Internal visits, automated traffic and the origin of individual sessions could not be established from these aggregates.

After an authorized release, compare the same inspected URLs against the serving SHA and record which Google crawl timestamps postdate it. Keep the current sitemap and use individual inspection for a few materially changed URLs only after live acceptance. Track 28- and 90-day windows and reader paths without using index counts or search traffic as publisher approval criteria. [Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) · [Helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
