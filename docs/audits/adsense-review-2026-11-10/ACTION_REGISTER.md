# November 10 AdSense action register

Severity reflects the investigation and remediation priorities. The official review did not rank individual issues.

| ID | Area | Finding | Severity | Status | Owner and action | Evidence |
|---|---|---|---|---|---|---|
| A01 | AdSense | Site declined for Low value content | P0 | VERIFIED | Publisher to hold the new request while site remediation is in progress | Signed email, Sites, November 10 05:47 |
| A02 | Inventory | ads.txt authorized and exact | P0 | VERIFIED | Maintain the authorized public record | Sites, HTTP GET and production smoke |
| A03 | Account | Ownership check complete, payment profile complete, ad settings confirmed, no enforcement | P0 | VERIFIED | Publisher to use the site-specific decision for review readiness | Sites, Home, Policy Center |
| E01 | Editorial | Daily Life Mindfulness repeated an abstract cue and weakly connected it to its source | P1 | FIXED LOCALLY | Editor to review the DN 22 exercise and release it through the governed process | Practice diff, DN 22 passage, browser and schema checks |
| U01 | Layout | Hero overflows at the tablet breakpoint | P1 | FIXED LOCALLY | Maintainer to release the column sizing fix with the candidate | Live 820 px viewport reached 878 px; candidate passed 14 widths |
| G01 | Release | Current candidate is local | P1 | PENDING | Owner to review and separately authorize the production release. Verify the exact SHA and smoke results after deployment. | Candidate branch, main and production receipts |
| S01 | Search | 29 of 47 priority URLs crawled without indexing, only one stored crawl dated Oct 31 or later | P2 | MONITORING | Search owner to compare future inspections and differentiate recurring overlap from stale inspection data | [47-URL register](PRIORITY_URLS.csv) |
| S02 | Search | Reported slash URL redirects correctly; slashless legacy alias returns 404 live | P2 | FIXED LOCALLY | Maintainer to release the exact slashless redirect. Search owner to monitor the reported slash URL. | Pages report, live HTTP, redirect contract |
| S03 | Search | Google and Bing processed the sitemap | P2 | VERIFIED | Continue normal monitoring. Bing confirmed the practice sample indexed. Other URL and IndexNow processing states remain unverified. | Google and Bing sitemaps |
| C01 | Privacy | Analytics consent tests pass; EU message published; live ad CMP behavior unverified | P1 | BLOCKED FOR AD ROLLOUT | Publisher to validate regional consent delivery before enabling advertising after approval | Browser tests, Privacy & messaging |
| C02 | Advertising | Site row absent in Ads → By site; no live ad runtime | P2 | UNVERIFIED SETTINGS | Publisher to verify Auto ads, page exclusions and ad units before any rollout | Ads dashboard and production smoke |
| M01 | Measurement | Search and GA4 activity observed; field CWV unavailable | P2 | MONITORING | Search and analytics owners to review finalized aggregate readership and field data when available | Search Analytics API, Bing and CWV dashboard |
| E02 | Editorial | Some brief educational pages remain generic; precise Google examples unavailable | P1 | MONITORING | Editorial owner to compare representative pages with their nearest existing owners | Crawl, live sample and October quality inventory |
