# Echo Buddha — AdSense review final assessment

**REJECTED_REMEDIATION_IN_PROGRESS** · November 10, 2026, 08:44 Sri Lanka time (UTC+05:30)

Google declined `echobuddha.com` for **Low value content**. AdSense shows **Needs attention**, last updated November 10, 2026 at **05:47 Sri Lanka time**, matching a Google-signed email sent at the same time. The site is currently ineligible to serve AdSense ads. Ownership shows complete, ads.txt is **Authorized**, and Policy Center shows **No current issues**. [Authenticated site decision](https://adsense.google.com/adsense/u/0/pub-3911157640549350/sites/detail/url=echobuddha.com)

Production passed the crawl and smoke checks. The local candidate fixes a reproduced homepage overflow, improves one weak meditation guide and restores a slashless legacy redirect. The candidate has passed the release suite. Hold a new AdSense request until the candidate has been reviewed, released through the governed workflow, verified live, and the editorial readiness review supports another submission. Google supplied no page-level findings, quantitative threshold, or narrower explanation. See the [action register](ACTION_REGISTER.md).

## 1. AdSense decision evidence

| Field | Current observation |
|---|---|
| Publisher and domain | `pub-3911157640549350`, `echobuddha.com`, authenticated in the named AdSense account |
| Site approval | **Needs attention** |
| Official reason | **Low value content** |
| Decision timestamp | Sites list **Last updated** November 10, 2026, 05:47 GMT+5:30; matching notification timestamp |
| What Google asks for | Substantial original value, maintained editorial and site structure, and genuine sustained user interest. Google's notice asks the publisher to correct issues before resubmitting. It names no example URLs. |
| Ownership | **Verify site ownership** step shows the completed check icon. Production serves the publisher verification meta tag. The historical method used to complete the step was not established. |
| ads.txt | **Authorized** in Sites |
| Available site action | **I confirm I have fixed the issues** and **Request review** are visible. The confirmation remained unchecked. |
| Monetization | Site approval pending remediation; no ad activation or review submission in this investigation |

[Site status definitions](https://support.google.com/adsense/answer/12170222), [site readiness guidance](https://support.google.com/adsense/answer/12176698), [content and user experience guidance](https://support.google.com/adsense/answer/10015918).

## 2. Email and dashboard reconciliation

Gmail showed **You need to fix some issues before your site is ready for AdSense**, from `adsense-noreply@google.com`, November 10 at 05:47. Gmail reported `scoutcamp.bounces.google.com` as the mailing domain and `google.com` as the signing domain. The body names the same publisher and site and says the team reviewed the site and it is currently unable to show ads. The dashboard supplies the specific reason. The August 21 decision and October 31 readiness recommendation are historical. The November event is a new decision carrying the same reason as August. Evidence is transcribed from the authenticated views with recipient and account details omitted. No private account screenshots are included.

## 3. Account and policy findings

- Policy Center reported **No current issues**. That dashboard tracks enforcement affecting ad serving. The **Needs attention** result is a site review decision. [Policy Center guidance](https://support.google.com/adsense/answer/9485926)
- AdSense Home showed **Your profile is complete** under Payments and **Ads settings confirmed** under Ads. A generic activation banner remained present. No separate missing payment profile was established. Verification Check displayed earnings-threshold guidance without an actionable verification item.
- **Ads → By site** displayed no Echo Buddha row. The per-site Auto ads value and ad-unit inventory were not independently confirmed. Production smoke and intercepted browser checks observed zero ad runtime or slot activity. The separate publisher verification meta tag is present.
- Google's content guidance asks for useful original material and usable navigation. Search index coverage and site traffic are context for the editorial audit. They do not determine the outcome of AdSense site review. [Publisher content guidance](https://support.google.com/adsense/answer/10015918) · [Publisher search-spam policy](https://support.google.com/publisherpolicies/answer/11035931)

## 4. Website crawlability and ads.txt

- The live crawl returned HTTP 200 for 356 linked HTML routes. All 171 sitemap routes returned 200, were self-canonical and indexable, and had one H1, unique titles and descriptions, and raster share previews. All observed JSON-LD blocks parsed. That check covers syntax, while sampled pages were also checked for correspondence between the visible content and schema.
- HTTP apex, HTTP www, and HTTPS www redirected in one hop to the HTTPS apex for both the homepage and ads.txt. TLS verification passed and the apex resolved over IPv4 and IPv6. An unknown route returned the intended HTML 404 with noindex. The workers.dev preview was noindex/nofollow.
- [Live ads.txt](https://echobuddha.com/ads.txt) served HTTP 200 `text/plain`, one exact record matching the repository and dashboard publisher. The checked entry was `google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0`.
- [Live robots.txt](https://echobuddha.com/robots.txt) allows Mediapartners-Google and general search crawling and declares the apex sitemap. Training restrictions are separate. Synthetic requests using Googlebot, Mediapartners-Google, Google-Display-Ads-Bot and bingbot user agents each returned 200 for home, robots.txt, ads.txt, and sitemap.xml. These are availability probes. No authenticated request trace for the AdSense reviewer was available.
- Cloudflare showed no custom, rate-limiting, or managed rules configured in the inspected rules view. Bot Fight Mode and AI Labyrinth were off. Browser Integrity Check was on. Search Console reported no host problems on either host. The checks produced no evidence of an active crawler obstruction. Security settings were left in place.

## 5. Google Search Console

The authenticated domain property confirmed verified ownership. The Pages report last updated November 6 showed 134 indexed and 237 not indexed. Exclusions were 126 noindex, 83 crawled currently not indexed, 16 discovered currently not indexed, 10 redirects, one redirect error and one alternate canonical. The 404 row showed zero. The redirect-error example was the old `/terms-and-conditions/` URL, last crawled October 24. It now returns a 301 directly to the live 200 terms page. The separate slashless variant returned 404 and has an exact redirect in the candidate. Current apex/www redirects and all submitted canonical URLs passed. Manual Actions and Security Issues each showed **No issues detected**. The crawl report showed about 1.44K requests and a 114 ms average response time. The sitemap was read November 7 with 171 discovered pages and **Success**. [Search Console property](https://search.google.com/search-console?resource_id=sc-domain%3Aechobuddha.com)

Fresh read-only URL Inspection calls succeeded for the entire October 30 priority set. All 47 are live 200, self-canonical, present in the sitemap and linked from another crawled page. Counts changed from 3 to 4 indexed, 30 to 29 crawled without indexing, 11 to 13 discovered without indexing, and 3 to 1 unknown. Only one of the 47 inspections returned a last crawl dated October 31 or later. For example, Google last crawled Daily Life Mindfulness on September 10 and still lists it as crawled without indexing. The live HTTP and Google inspection evidence are separate columns. [Priority URL comparison](PRIORITY_URLS.csv)

Finalized web search totals from the Search Analytics API use the reporting dates below in Pacific time.

| Period | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| Sep 13–Oct 10, 28 days | 62 | 4,310 | 1.44% | 8.77 |
| Oct 11–Nov 7, 28 days | 78 | 4,495 | 1.74% | 8.80 |
| Aug 10–Nov 7, 90 days | 171 | 12,686 | 1.35% | 10.40 |

Clicks increased by 16 and impressions by 185 between the two 28-day windows. The periods include earlier releases and contain little of the November 5 production version. This is descriptive evidence. The November 5 release record defines a separate stable window starting November 6 Pacific time, subject to later material releases and finalized data.

## 6. Bing Webmaster Tools

The signed-in Echo Buddha property showed 86 clicks and 5.9K impressions for Aug 9–Nov 8. The apex sitemap succeeded with 171 discovered URLs and a November 5 crawl. Bing also lists a discovered www sitemap that succeeded with 171 URLs; live www redirects to the apex. The IndexNow manifest is reachable, and the earlier release records document successful submissions. Submission acceptance does not establish indexing. Bing URL Inspection reported the Daily Life Mindfulness guide indexed successfully, while Google lists it as crawled without indexing. This demonstrates that the engines made different index decisions for that URL. Other individual Bing index decisions and current IndexNow processing were not independently inspected. [Bing Webmaster Tools](https://www.bing.com/webmasters/) · [Right Speech release evidence](../right-speech-decision-guide-2026-11-05/RELEASE_VERIFICATION.json)

## 7. Content quality

The current crawl was cross-checked against the October 30 inventory, page-body review, source audit and overlap decisions. This investigation sampled reader-facing pages and reviewed collection patterns. It did not independently reread all 356 pages end to end. [October content recovery report](../adsense-final-content-recovery-2026-10-30/13_FINAL_REPORT.md)

| Surface | Findings and disposition |
|---|---|
| Home, Start Here, Learn | Clear routes for study, practice and everyday application. The homepage links to its foundations, Handbook, daily reflection, questions and trust pages. The hero overflow was independently reproduced and fixed locally. |
| Foundations, reference and articles | Four Noble Truths and Eightfold Path have worked examples and source notes. Anatta functions as a concise reference entry. The early-text Anicca guide offers a five-question reading method; the karma article applies intention to choices. Some generic practice entries have less independent value. Judge each against the closest existing owner before adding content. |
| Meditation | Loving-Kindness has recipient selection, boundaries, a source and safety guidance. When Meditation Feels Hard distinguishes ordinary distraction from distress and offers exits. Daily Life Mindfulness repeated a generic cue without a worked response or a precise explanation of how the cited text supports the practice. The local change addresses that specific gap. |
| Handbook, questions and tools | The sampled Part II chapter grounds its teaching in AN 8.25 and explains how to encourage practice without coercion. The Jetavana answer separates its narrative tradition from historical claims. Timers, challenge, glossary and search provide independent utility. |
| Reflections and quote stories | All 153 quote detail routes and all 31 reflection detail or utility routes carry intentional noindex. The sampled quote identifies its modern origin and an application. The sampled reflection offers a short exercise. Shared presentation remains visible and warrants editorial sampling. Noindex governs discovery and is not itself a quality assessment. |
| Trust and legal pages | About, Editorial Policy, Sources and Citations, Content Process, Corrections, Contact, Privacy and Meditation Safety were reachable. Email delivery and site-wide image rights were not independently tested. |

The crawl found 56 indexable pages with fewer than 500 main-text words, including utility pages, category pages and dictionary entries. The count helped select samples. No word-count rule or recommendation for bulk expansion follows from it. Readership and editorial differentiation should be evaluated per reader task. [Google people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

## 8. Editorial credibility

The sampled teachings identify sources and distinguish interpretation from practical application. Examples include SN 56.11 in the Four Noble Truths, SN 45.8 and MN 58 in Right Speech, AN 6.63 in the karma article, SN 22.59 in the non-self entry, and Sn 1.8 in Loving-Kindness. The Five Precepts article gives the traditional list and discusses how its applications relate to daily decisions. The new practice text cites the passage on full alertness during ordinary activity in DN 22 and labels its everyday scenarios as modern applications. The site identifies Echo Buddha Editorial as the responsible publisher voice and provides a correction pathway. This was an editorial review with limited source sampling. [DN 22, section on alertness](https://accesstoinsight.org/tipitaka/dn/dn.22.0.than.html#body3) · [Sources and Citations](https://echobuddha.com/buddhist-sources-and-citations/)

## 9. Privacy and advertising compliance

Live browser tests verified an explicit analytics preference, no analytics request attempt on a fresh or rejecting visit, the expected request attempt after acceptance, withdrawal behavior, and suppression of search terms and fragments from aggregate search measurement. The test intercepts Google traffic, so the findings concern browser behavior. Separately, the authenticated Echo Buddha GA4 Home card showed 21 active users and 112 sessions for its Last 7 days view. The channel card displayed 53 Organic Search and 53 Direct sessions. The cards were read as displayed. The figures are consent-dependent, and this snapshot did not isolate owner traffic or validate each source. Privacy wording describes optional analytics, preference storage, and the currently inactive advertising setup. The AdSense European regulations message for Echo Buddha is **Published**. Runtime CMP delivery, the consent string, and accept/reject/withdraw behavior for actual ad requests were not verifiable while ad runtime is off. US state regulations showed the **Create** entry point. Perform region-specific consent and limited-ad checks before any advertising rollout. Qualified review is needed for legal determinations. [Google consent management requirements](https://support.google.com/adsense/answer/13554116) · [Live Privacy Policy](https://echobuddha.com/privacy-policy/)

## 10. Accessibility and performance

Live and candidate axe audits each covered 18 pages with zero detected violations, plus eight browser consent checks. The candidate practice page also passed a separate axe scan. Seven live journeys passed at 390 and 1280 px, covering the foundation sequence, Handbook, meditation, article navigation, daily reflection, trust pages and keyboard search. The automated checks cover the sampled cases. Search Console lacks sufficient field Core Web Vitals data for mobile and desktop. INP was not measured.

| Lighthouse sample | Performance | Accessibility | LCP | CLS |
|---|---:|---:|---:|---:|
| Live homepage, mobile / desktop | 91 / 98 | 100 / 100 | 2.09 s / 0.64 s | 0 / 0.0004 |
| Live Four Noble Truths article, mobile / desktop | 95 / 100 | 100 / 100 | 2.02 s / 0.46 s | 0 / 0.0004 |
| Candidate homepage, mobile / desktop | 91 / 100 | 100 / 100 | 1.92 s / 0.53 s | 0 / 0.0004 |
| Live / candidate Daily Life Mindfulness, mobile recheck | 98 / 100 | 100 / 100 | 1.72 s / 1.36 s | 0 / 0.0017 |

An initial candidate mobile practice run during concurrent browser jobs scored 54 with 2.33 s total blocking time. A sequential live/candidate rerun found 72 ms and 0 ms blocking time respectively. The initial anomaly did not reproduce. Production versus localhost results reflect different delivery conditions and do not establish a speed gain.

## 11. Issues fixed in the candidate

1. **Homepage hero sizing.** The fixed preferred image width exceeded its grid track. At 820 px, live document width reached 878 px. Constraining the image to the column resolves the overflow while retaining the maximum size. The candidate stayed within the viewport at 14 tested widths from 320 to 1440 px.
2. **Daily Life Mindfulness reader value.** The revised guide supplies a repeatable cue, a worked scenario and a three-day reflection prompt. It connects the scenario to the existing Right Speech decision guide, explains the source boundary, and preserves the original route, canonical, title, description and index state. The modification date reflects the substantive rewrite.

3. **Legacy terms alias.** The slashless alias returned 404 because the existing explicit rule only covered the slash form. The candidate adds one exact 301 to the existing terms page and extends the redirect contract. Google reported the slash form, which already works live.

Google did not identify these as examples of low value content. The changes were prepared in the local candidate.

## 12. Files changed

- `src/pages/index.astro` and `src/data/learn.ts` contain the layout and content changes.
- `public/_redirects`, `governance/release-change-approvals.json` and `scripts/validate-phase-8.mjs` implement, record and validate the exact legacy alias.
- `governance/measurement-interventions.json` appends the candidate's scope and hashes. Prior intervention records are preserved.
- `README.md` points to the new assessment.
- This audit directory holds the report, action register, priority comparison and pre-release baseline. Raw authenticated exports and runtime evidence remain in ignored local artifacts.

## 13. Tests

- Lockfile install with Node 22.23.4 and npm 10.9.9. The full `npm run validate:release` passed, including build, typecheck, lint, 98/98 tests, SEO, content, governance and zero high or critical dependency advisories.
- Production smoke 15/15. Production crawl verified all 171 sitemap entries. Browser readiness passed on live and local candidate. Candidate tools, search, timers, keyboard and reflow passed in Chromium, Firefox and WebKit.
- Candidate responsive exercise passed at 14 homepage widths and four practice widths. It checked the visible source section, DN 22 citation, updated Article schema, self-canonical and existing decision-guide fragment. The local Cloudflare runtime returned one 301 for each legacy terms form, preserved a query string, served the terms page with 200, and returned 404 for an unknown URL. `git diff --check` passed.

## 14. GitHub and production

- The isolated candidate branch is `codex/adsense-review-2026-11-10`, based on GitHub main `8aaf3911f90e6bb037f96c15c3b914a0155460d9`. Latest main validation succeeded. The app, assets and build workflow match the production commit; subsequent merges are documentation and the release ledger. PRs #92–#94 and #96–#99 are merged. Six dependency PRs were open (#9, #14, #55, #56, #79, #95); both required-by-policy hosted jobs were green on the two newest. GitHub's legacy branch-protection endpoint returned 403 for this repository, so its active enforcement settings could not be established from that endpoint. [Main validation](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42654887619)
- Live `/release.json` and Cloudflare agree on `dff012658c991e84db2320c1c0a9e4a424e4136f`. Cloudflare version `69188a75-bd48-442c-9c37-bb8a7be84c54` was active at 100%. The governed November 5 deployment succeeded at 15:14:52 Sri Lanka time. An older November 4 scheduled smoke failure is superseded for current availability by a successful November 5 run, the successful release and today's independent 15/15 smoke. [Deployment run](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42004694379) · [Live release identity](https://echobuddha.com/release.json)
- No remote PR or deployment was created for this investigation. The repository requires owner review and separate production authorization for a release. A future release should use the exact-current-main workflow and verify the live SHA, the changed pages and legacy alias, sitemap, consent behavior and smoke checks.

## 15. Remaining risks

Google's decision does not identify affected URLs or reveal which criteria carried the most weight. The available recrawl evidence for the 47 priority pages is stale for judging the October 31 improvements. Some short educational entries still warrant review for an independent reader purpose. GA4 totals and the single Bing inspection offer limited coverage. Traffic-source quality, additional Bing URLs, mailbox delivery, region-specific CMP operation and field performance remain unverified. Current data support technical reachability, with a known live responsive defect and an unresolved AdSense editorial decision.

## 16. Next actions

1. **Maintainer.** Review the layout, content and redirect changes. Once separately authorized, use the governed PR and exact-main release process. Record the actual deployment and run the listed production checks.
2. **Editorial owner.** Compare the current site and candidate against the nearest existing pages for each high-priority reader task. Focus on what a visitor can learn or do after reading. Improve the weakest distinct pages and keep the existing schedule and URL ownership unless the evidence warrants a separate decision.
3. **Search owner.** Monitor the priority URLs for new stored crawl dates and canonical/index changes. Use finalized performance data and normal readership evidence. Search measurements can inform the readiness decision, alongside a qualitative review.
4. **Publisher.** Hold the review request while remediation is in progress. Reconsider after reviewing the released site against Google's stated criteria and confirming the site account still offers the request. Leave advertising off pending approval and consent validation.
