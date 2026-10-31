# Search and reader measurement — October 30, 2026

Fresh authenticated evidence establishes some genuine search visibility and consented use, alongside substantial indexing uncertainty and small reader samples. It does **not** establish that the entire site is indexed, that an editorial release caused traffic changes, or that Google will approve AdSense. No service-setting changes, indexing requests, review requests or artificial traffic were made.

Full methods, exact coverage and limitations are in [services/SERVICE_ANALYSIS.md](services/SERVICE_ANALYSIS.md). Current compact observations are in [ACCOUNT_OBSERVATIONS.json](services/ACCOUNT_OBSERVATIONS.json). Raw queries and private exports remain outside Git.

## Search Console

The authorized property is `sc-domain:echobuddha.com`, with verified owner permission; the API returned no additional Echo Buddha URL-prefix property. Finalized data runs through **October 28** in Pacific reporting time.

| Period | Clicks | Impressions | Interpretation |
| --- | ---: | ---: | --- |
| August 31–September 27 | 43 | 4,445 | Historical pre-period |
| September 29–October 26 | 66 | 4,077 | Materially intervened; descriptive only |
| July 31–October 28 | 143 | 11,572 | Current 90-day context |
| October 28 only | 4 | 180 | First finalized day of current revised period; incomplete |

The 90-day property CTR is 1.236%, average position 10.79. The returned page export contains **194 exact URLs**, including historical variants/excluded content; it is not an inventory of current indexable pages. Leading page clicks include Daily Reflections (40), Right Speech (15), and Dhamma/Dharma (11). Mobile/desktop/tablet clicks are 86/49/8. No raw query text is republished. [Exact property evidence](services/GSC_FINALIZED_SUMMARY.json), [URL evidence coverage](services/GSC_PAGE_EVIDENCE.csv); the full per-page metric export remains in ignored private artifacts.

Every one of the **47 original priority URLs** received a fresh stored inspection, without API errors:

| Stored Google state | October 27 | October 30 |
| --- | ---: | ---: |
| Submitted and indexed | 3 | 4 |
| Crawled — currently not indexed | 30 | 29 |
| Discovered — currently not indexed | 11 | 11 |
| Unknown to Google | 3 | 3 |

Five Aggregates is newly indexed within this cohort. Membership of unknown/discovered groups also changes; see the complete [47-URL evidence](services/GSC_PRIORITY_47.csv). Thirty-three fetched records report successful fetch, crawl allowed and indexing allowed. Fourteen contain unspecified fetch/directive fields, which cannot be reported as successful live tests. No returned Google canonical differs from the requested URL. A Google selection decision alone does not identify a technical defect or prove weak content.

The all-known Pages dashboard is **last updated October 23**, before the October 27 remediation. Its 135 indexed/232 not indexed records include historical aliases and intentional exclusions. Reasons are noindex 115, redirect 10, crawled/unindexed 91, redirect error 1, alternate canonical 1, discovered/unindexed 14, and 404 zero. These populations must not be confused with the 165 intended sitemap canonicals or the 47 priority URLs.

The one historical redirect-error example is `/terms-and-conditions/`, last crawled August 29. An October 30 live check follows a single 301 to `/terms-of-use/`, then 200, matching the existing redirect configuration. The earlier report is not evidence of a reproduced current failure. No validation request was sent just to clear a badge.

The sitemap was downloaded October 28, with **165 submitted URLs, zero warnings and zero errors**. The legacy API `contents[].indexed` field is [explicitly deprecated](https://developers.google.com/webmaster-tools/v1/sitemaps); its zero must not be interpreted as zero indexed pages. [Property/sitemap evidence](services/GSC_PROPERTY_SITEMAPS.json).

Manual actions and Security issues both say **No issues detected**. Mobile and desktop Core Web Vitals show **No data**, which establishes neither pass nor defect. Breadcrumbs shows 21 valid/0 invalid within detected enhancement coverage. Crawl stats updated October 28 show 1.52K requests/90 days, 121 ms average response, and no apex/www host problems. Historical response shares are 97% 200, 2% 301 and 1% 404; this does not replace a fresh route crawl.

## Bing

The [established hosted collection](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40866742677) succeeded October 29, verified the property and recorded its **165-URL sitemap as Success**. Its 62 clicks/3,683 impressions cover API-returned dates in disjoint intervals, not a continuous invented comparison period. [Approved safe aggregate](services/BING_HOSTED_SUMMARY.json).

The fresh authenticated UI, July 30–October 29 with All verticals selected, shows **67 clicks, rounded 4K impressions, 1.69% CTR**. Site Explorer shows 157 indexed, 82 warnings, 2 excluded and zero errors, totalling 241 known records. Different periods, variants and report grains explain why these figures cannot be substituted for sitemap counts or the API totals.

Fresh inspection of canonical `/daily-reflections/` reports **Indexed successfully**, crawl allowed, fetch successful and indexing allowed, with last crawl displayed October 29 relative to observation. The historical slashless exclusion does not establish loss of the canonical hub. One alt-attribute notice requires current decorative-image assessment rather than a blind alt-text change.

The existing September Site Scan covers 250 pages, zero errors and 362 warnings: 249 image-alt and 113 title-length occurrences. It is historical, not a new complete crawl. Current source/DOM evidence must determine whether each scanner warning describes a real issue. No fresh scan was started.

Bing AI Performance beta legitimately displays **3.9K citations and 18 average cited pages**, July 30–October 29, for Microsoft Copilots and Partners. Detailed rows are sampled and may change with processing. Citations are not visits, GA4 AI referrals, Google AI Overview counts, or verified reader outcomes. IndexNow displays submitted URLs; acceptance is not indexing. This investigation submitted no URLs.

## GA4

The authenticated **EchoBuddha property**, matched to the established project-specific account, reports the following for **October 2–29**:

| Measure | Observed value |
| --- | ---: |
| Active users | 71 |
| New users | 63 |
| Sessions | 277 |
| Engaged sessions | 153 |
| Engagement rate | 55.23% |
| Average engagement per session | 1m 14s |
| Event count | 1,632 |

Organic Search contributes 127 sessions/87 engaged; Direct 122/48; Organic Social 13/9; AI Assistant 9/6; Unassigned 5/1; Organic Video 2/2. **Displayed channel sessions sum to 278 while the report total is 277.** The cause is unverified; preserve both rather than silently adjusting either. The historical October 27 report has its own one-session discrepancy, retained unchanged.

All **33 displayed landing rows**, including `(not set)`, were read. Leading sessions are Today’s Reflection 89, homepage 54, Daily Reflections hub 54, `(not set)` 23, Right Speech 8, Dhamma/Dharma 6, attachment guide 5 and Five Precepts 4. Today’s Reflection’s 89 sessions involve nine active users and seven seconds average engagement, so repeated owner/audit/tool use cannot be ruled out. Other small page samples neither prove strong interest nor justify declaring pages low value.

Device active users are desktop 35, mobile 34, tablet 2. A separate seven-day home card shows United States/United Kingdom/Sri Lanka among leading countries; it is a different reporting period. The retention/cohort interface was inspected without extracting a defensible numeric returning-user rate. New users must not simply be subtracted from active users to manufacture one.

GA4 measures available consented traffic. Its “100% of available data” label does not mean every visitor is tracked. Low samples, `(not set)`, attribution, owner/audit traffic and privacy choices limit conclusions. Configured key events were not certified as learning outcomes. No extra tracking or internal traffic filter was introduced. GSC clicks, Bing clicks, GA4 sessions, citations and edge requests remain separate populations.

## AdSense and external evidence limits

Current authenticated AdSense still says **Needs attention / Low value content**, ads.txt **Not found**. Its displayed decision remains **August 21, 2026, 8:05 PM GMT+5:30**, not a new assessment of this candidate. Policy Center separately says **No current issues**, which does not cancel the site rejection. No review or advertising action was taken.

A fresh ordinary HTTPS GET of public `/ads.txt` returns **HTTP 200**, matches `public/ads.txt` byte for byte and matches the configured publisher identity ([exact delivery evidence](services/ADS_TXT_LIVE_CHECK.json)). The account still reports Not found; a crawler-specific account/log explanation was unavailable. It does not justify activating scripts or weakening Cloudflare security. Cloudflare still shows an unconnected Git build and static-assets-only delivery. Public contact links consistently use info/support domain addresses; MX points to Zoho. No authenticated Zoho mailbox evidence was available, so delivery remains unverified without being labelled broken.

The new material release must append its actual deployment timestamp and affected URLs to existing measurement governance. Preserve prior data, exclude its actual Pacific deployment day and derive the next 28-day stable window from the following day. Do not finalize future data or attribute search movement causally. These metrics support qualitative editorial assessment and continued observation; they provide no universal traffic cutoff or guaranteed AdSense outcome.
