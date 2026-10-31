# Connected-service investigation — October 30, 2026

Read-only investigation used existing project-specific `webmasters.readonly` OAuth, the established hosted Search Measurement aggregate artifact, and authenticated Chrome account pages. No credentials, raw search queries, private account screenshots, or user-level records are included here. No account setting, review request, indexing request, advertising activation, or email send occurred.

## Search Console

`sites.list` identifies **sc-domain:echobuddha.com**, with `siteOwner` permission. No legitimate URL-prefix variant was returned by that authorized account. Sitemaps API evidence reports 165 submitted web URLs, zero warnings, zero errors, and last download **October 28, 2026, 17:40:19 UTC**. Its `contents[].indexed: 0` is **not** a zero-indexed-site finding: the [official API resource](https://developers.google.com/webmaster-tools/v1/sitemaps) marks this field “Deprecated; do not use.”

Fresh finalized analytics run through **October 28** in Pacific reporting time. The 90-day context, **July 31–October 28**, contains 143 property clicks and 11,572 impressions, CTR 1.236%, average position 10.79. Historical pre-period August 31–September 27 contains 43 clicks/4,445 impressions; September 29–October 26 contains 66/4,077. The latter window contains material interventions and cannot establish a causal release effect or authorize consolidation. The collector-derived revised period October 28–November 24 has only its first finalized day, with 4 clicks/180 impressions. A new material release will require a new period from its actual deployment under existing governance.

The page-dimension export contains **194 exact URLs with returned performance rows**, including historical and intentionally excluded paths. It is not a count of current indexable canonicals. Query text remains private. Leading returned page clicks include `/daily-reflections/` (40), `/articles/right-speech-buddhism/` (15), and `/articles/dhamma-vs-dharma/` (11). Query-row, page-row and property totals differ in reporting grain and must not be summed interchangeably. The mobile/desktop/tablet split is 86/49/8 clicks; the leading country by clicks is the United States, 67. These are descriptive search observations, not AdSense eligibility thresholds.

All **47 original priority URLs** received one fresh stored URL Inspection each, without API errors or indexing requests:

| Stored state | October 27 | October 30 |
| --- | ---: | ---: |
| Submitted and indexed | 3 | 4 |
| Crawled — currently not indexed | 30 | 29 |
| Discovered — currently not indexed | 11 | 11 |
| Unknown to Google | 3 | 3 |

The newly indexed member is `/learn/buddhism-101/five-aggregates-buddhism/`. Unknown/discovered membership also changes: Buddha as Refuge, Taking Refuge in the Triple Gem, and Did Buddha Order Buddha Images are now unknown; Sangha as Refuge, When Did Buddha Statues First Appear, and Why Was a Bodhi Tree Planted at Jetavana are now discovered. These are engine observations, not proven content defects or causal outcomes. Thirty-three fetched records report crawl allowed, indexing allowed and successful fetch; 14 have unspecified fetch/directive fields. No returned Google canonical differs from its requested URL. Unspecified data must not be converted into a positive live test.

The authenticated **all-known Pages report is dated October 23**, before the October 27 release. It shows 135 indexed and 232 not indexed: 115 noindex, 10 redirects, 91 crawled/unindexed, 1 redirect error, 1 alternate with proper canonical, 14 discovered/unindexed, and 0 not found. This historical population differs from the 165 intended sitemap canonicals and the priority cohort. Existing validation badges such as “Failed” do not establish that intentional noindex or redirects should be removed.

The reported redirect error is `/terms-and-conditions/`, last crawled August 29. A fresh October 30 HTTP check follows one **301 to `/terms-of-use/`, then 200**, matching the existing redirect configuration. No current redirect failure was reproduced. No validation submission was made merely to clear the historical badge.

Manual actions and Security issues both display **No issues detected**. Overview shows **no Core Web Vitals data** for mobile or desktop; no field pass or INP claim is justified. Breadcrumbs reports 21 valid/0 invalid; HTTPS reports 31 HTTPS/0 non-HTTPS, each limited to detected report coverage. Settings says robots files are valid. Crawl stats updated October 28 show 1.52K requests in 90 days, 121 ms average response time, and both apex/www hosts without problems. Displayed response shares are 97% 200, 2% 301 and 1% 404; the historical 404 targets were not exhaustively inspected. These aggregates do not prove every current route succeeds or that AdSense crawlers succeeded.

## Bing

The established hosted run [40866742677](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40866742677), generated October 29, successfully authenticated all four expected Bing API endpoints. It verifies the site and reports the 165-URL sitemap as Success. Its 62 clicks/3,683 impressions are sums over **57 returned dates in disjoint intervals**, not an invented continuous 90-day comparison. Preserve its dated intervals.

The October 30 authenticated UI selects July 30–October 29, three months, All verticals, and displays 67 clicks, rounded 4K impressions and 1.69% CTR. This differs in interval and report grain from the hosted API; it is not an inconsistency to erase. Site Explorer shows 157 indexed, 82 warnings, 2 excluded and 0 errors, totalling 241 known records. These are not 241 intended sitemap canonicals.

Fresh inspection of canonical `https://echobuddha.com/daily-reflections/` says **Indexed successfully**, crawl allowed, fetch successful, indexing allowed, with last crawl displayed “Yesterday at 14:21.” Its single alt-attribute notice requires current image-purpose review; an intentionally decorative empty-alt logo should not receive invented descriptive alt text merely to clear a scanner. The older slashless Explorer exclusion does not override the fresh canonical inspection. No repeated indexing request was sent.

The existing September Site Scan, completed 31 days before observation, covers 250 pages with 0 errors and 362 warnings: 249 alt-attribute and 113 title-length occurrences. It is historical and was not rerun or represented as a current complete crawl. Root validation supplies current route/DOM evidence; scan warnings alone do not justify bulk title or image changes.

AI Performance beta legitimately displays **3.9K citations and 18 average cited pages**, July 30–October 29, for Microsoft Copilots and Partners. The UI labels its detailed rows a sample subject to processing and its intent/topic labels AI-generated. These citations are not visits, referrals, Google AI Overview counts, or verified reader learning. Raw grounding queries are not republished.

IndexNow shows 338 submitted URLs, with chart buckets 165/165/7/1 on October 20/23/27/28. Its chart accessibility date label incorrectly says January 2022 while its actual table dates are October 2026; this UI limitation is preserved. Submission acceptance does not prove indexing. This investigation made no submissions; release handling remains with the established exact-artifact workflow.

## GA4

The authenticated property is **EchoBuddha**, matched to the established project-specific property. October 2–29 reports show 277 sessions, 153 engaged sessions, 55.23% engagement, 71 active users, 63 new users, average engagement of 1m 14s per session, 1,632 events and 2 key events. No claim is made that a configured key event proves learning or AdSense suitability.

| Channel | Sessions | Engaged sessions |
| --- | ---: | ---: |
| Organic Search | 127 | 87 |
| Direct | 122 | 48 |
| Organic Social | 13 | 9 |
| AI Assistant | 9 | 6 |
| Unassigned | 5 | 1 |
| Organic Video | 2 | 2 |

The displayed channel sessions sum to **278**, while the report total is **277**. Preserve both; the current evidence does not establish the cause. The analogous historical one-session discrepancy remains unchanged in the October 27 evidence. No channel was silently removed, no total replaced, and no invalid-traffic claim inferred.

All **33 displayed landing rows**, including `(not set)`, were read. The leading paths are Today’s Reflection (89 sessions), homepage (54), Daily Reflections hub (54), `(not set)` (23), Right Speech (8), Dhamma/Dharma (6), attachment guide (5), and Five Precepts (4). Other observed learning/article/tool landings have very small samples. These support limited reader-interest evidence; they do not prove every visit is independent of owner/audit activity. The 89 sessions for Today’s Reflection involve 9 active users and 7 seconds average engagement, which warrants caution before describing high independent readership. `(not set)` is a measurement limitation, not a content route to publish or repair blindly.

Active users by device are 35 desktop, 34 mobile, 2 tablet. The separate October 23–29 home card shows leading countries United States 8, United Kingdom 5 and Sri Lanka 5; this seven-day grain is not substituted into 28-day totals. The retention overview/cohort interface was inspected, but no defensible numeric return rate was extracted. Subtracting new users from active users would not establish a returning-user count.

The UI says 100% of available data, which does not mean all visitors are measured. Consent choices, low samples, owner/test visits, attribution and processing limit inference. No new tracking, test traffic, filters or privacy settings were introduced. GSC clicks, Bing clicks, GA4 sessions, AI citations and Cloudflare edge requests remain separate populations.

## AdSense, delivery and contact

Authenticated October 30 AdSense site state remains **Needs attention / Low value content**, ads.txt **Not found**, with the displayed decision timestamp **August 21, 2026, 8:05 PM GMT+5:30**. It is not a new rejection of the current candidate. The detail page asks for authentic value, continued curation and sustained genuine user interest, without identifying individual URLs or a numeric traffic/word-count cutoff. Policy Center separately reports **No current issues**; this does not supersede the site activation rejection. The ownership panel shows the existing publisher snippet; no verification/account association was changed. An activation banner also requests payment information/site connection; payment setup was not altered.

The public ads.txt/account discrepancy remains a specific evidence concern, not a reason to activate scripts or weaken WAF. A fresh ordinary HTTPS GET independently returned HTTP 200; bytes exactly match the repository file and its existing configured publisher identity. [ADS_TXT_LIVE_CHECK.json](ADS_TXT_LIVE_CHECK.json) records the timestamp and SHA-256. No authenticated request-specific Mediapartners-Google/WAF trace was available, so the cause of account recognition failure remains unknown. No review checkbox was selected or request submitted.

Cloudflare authenticated Worker Settings still shows **Git repository: Connect**, with no connected Git build, and a static-assets-only worker. Domain overview shows Under Attack Mode off, Development Mode off and Bot Preference Sync on; settings were not changed. Root owns deployment identity verification.

Public contact configuration consistently uses `info@echobuddha.com` and `support@echobuddha.com`. Current public MX records point to **Zoho**, priorities 10/20/50. Cloudflare Email Routing shows its onboarding screen, not configured mailboxes. No authenticated Zoho tab appeared in the scoped browser inventory. Mailbox existence and delivery remain unverified; consistent links and correct MX do not prove delivery, and this absence of evidence is not a demonstrated broken contact. No mail was sent, no private inbox read and no mailbox provisioned.

## Durable evidence and coverage limits

- [ACCOUNT_OBSERVATIONS.json](ACCOUNT_OBSERVATIONS.json): sanitized authenticated observations and report boundaries.
- [GSC_FINALIZED_SUMMARY.json](GSC_FINALIZED_SUMMARY.json): exact property periods, finalization and totals.
- [GSC_PROPERTY_SITEMAPS.json](GSC_PROPERTY_SITEMAPS.json): property permission and processing evidence; deprecated indexed field explicitly excluded from interpretation.
- [GSC_PRIORITY_47.csv](GSC_PRIORITY_47.csv), [JSON](GSC_PRIORITY_47.json): every original priority URL, timestamp, state, fetch/canonical evidence and interpretation.
- [GSC_PAGE_EVIDENCE.csv](GSC_PAGE_EVIDENCE.csv): 194 URL-level evidence-presence records without private per-page metrics. The full API page-metric export stays ignored.
- [BING_HOSTED_SUMMARY.json](BING_HOSTED_SUMMARY.json): established workflow’s approved safe aggregate output.

The raw authorized API analytics and supporting transient outputs remain under ignored `.artifacts/adsense-final-content-recovery-2026-10-30/services/`. Historical evidence was not rewritten. UI observations were recorded from actual accessibility trees, not claimed screenshots or invented exports. These service checks do not replace current production route testing, full editorial review or Google’s decision. Lack of a finalized new observation window, field CWV, exact mailbox-delivery proof or a crawler-specific AdSense trace must remain visible at final readiness assessment.
