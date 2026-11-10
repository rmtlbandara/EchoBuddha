# Cloudflare and crawler audit

**Preflight observed November 10, 2026, at approximately 19:21 Sri Lanka time.** The serving source was `dff012658c991e84db2320c1c0a9e4a424e4136f`. The Cloudflare deployment view confirmed version `69188a75-bd48-442c-9c37-bb8a7be84c54` ready and receiving 100% of traffic. The live release identity and November 5 deployment receipt identify the same source and GitHub run. [Live release identity](https://echobuddha.com/release.json) · [Deployment run](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42004694379) · [November 5 receipt](../right-speech-decision-guide-2026-11-05/RELEASE_VERIFICATION.json)

## Public delivery and redirects

The public probe matrix recorded 61 HTTP responses, including 47 HTTP 200, 11 HTTP 301 and three expected or known HTTP 404 responses. The latter were an intentionally missing path and the known slashless legacy terms path with and without a query string. No response carried a Cloudflare challenge header or challenge page signature. An additional five AdsBot-Google user-agent probes returned HTTP 200.

| Check | Current observed evidence |
|---|---|
| DNS and TLS | Apex A and AAAA records resolve. Apex and www resolve to the same Cloudflare IPv4 addresses. Both HTTPS names passed hostname and chain verification in curl. The apex certificate covers `echobuddha.com` and `*.echobuddha.com`. |
| Host normalization | HTTP apex, HTTP www and HTTPS www each gave one 301 to the HTTPS apex for the homepage, ads.txt and sitemap. The three robots alias responses are a specific edge exception. They return 200 with Cloudflare-managed text and a Location header naming apex robots.txt. The body includes a general allow directive. |
| Canonical resources | HTTPS apex home, robots.txt, ads.txt and sitemap all returned 200. Sitemap XML contained 171 unique HTTPS apex URLs. IndexNow manifest had 171 page entries. |
| robots.txt | The apex 200 response includes the source-controlled policy, the HTTPS apex sitemap, general allow and an explicit Mediapartners-Google allow. Cloudflare prepends its managed training-crawler rules. |
| ads.txt | HTTP 200, `text/plain`, exact seller authorization line plus terminal newline. |
| HTML and cache | Sampled HTML used `max-age=0, must-revalidate`. robots.txt, ads.txt, sitemap.xml and search-index.json used `max-age=3600, must-revalidate`. The sampled Handbook AVIF returned 200 with `max-age=86400, stale-while-revalidate=604800`. Both edge HIT and MISS responses were observed. |
| Security headers | Enforced Content-Security-Policy, HSTS, nosniff, frame denial, Permissions-Policy, Referrer-Policy and cross-domain policy were present in the smoke result. |
| Worker preview | The workers.dev homepage returned 200 with `X-Robots-Tag: noindex, nofollow` and the production apex canonical. |
| Missing route | The probe path returned an HTML 404 with `noindex, follow` and no canonical. |
| Legacy terms route | The slash form returned 301 directly to `/terms-of-use/` and retained the query when supplied. The slashless form returned 404 in both probes. The existing candidate's exact 301 addresses the confirmed live gap. |

Five resources were checked under each of six user-agent labels. All 30 combinations returned HTTP 200. The resources were the homepage, robots.txt, sitemap.xml, ads.txt and the Right Speech article. The labels were curl, Googlebot, Mediapartners-Google, Google-Display-Ads-Bot, bingbot and AdsBot-Google. For the first five labels, each resource's body hash was identical across labels. These requests test response behavior from the audit network. Verifying an actual Google request requires matching the requesting IP against Google's published ranges or completing a reverse and forward DNS check. [Google crawler verification](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests)

## Authenticated observations

- The Cloudflare Rules view showed zero custom and zero rate-limiting rules and no configured managed rules in that view. Security Settings separately showed Cloudflare's managed ruleset and HTTP DDoS protection active. Bot Fight Mode and AI Labyrinth were off. Browser Integrity Check was on. These are distinct dashboard surfaces.
- Search Console Crawl Stats showed 1,507 apex requests and 11 www requests, both hosts with **No problems**, and average response time of 111 ms. This is independent evidence of Google Search access and host health over the report window.
- An authenticated individual Mediapartners-Google or other AdSense review request and corresponding firewall action were unavailable for this assessment. The public probes and Google Search Crawl Stats support keeping the current edge rules. Investigate a specific verified request, rule and action before considering an exception. [Cloudflare verified bot methods](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/) · [Cloudflare verified bot rule guidance](https://developers.cloudflare.com/waf/custom-rules/use-cases/allow-traffic-from-verified-bots/)

## Disposition

The current evidence supports the candidate's slashless legacy redirect and continued use of the governed release process. The live source passed all 15 production smoke checks with the expected release SHA pinned. Retest live SHA, both legacy forms and query preservation, canonical host, ads.txt, sitemap, robots.txt, preview exclusion and headers after any authorized production release. The preflight probes describe the November 5 serving version.
