# Echo Buddha AdSense recovery deployment

**Production acceptance — `PASS_DEPLOYED_VERIFIED`.** Cloudflare activated the authorized release, and independent checks verified the serving SHA, deployed content and critical public behavior. The original GitHub run remains failed because its immediate smoke request received the previous release identity. The exact-SHA smoke suite subsequently passed all 15 checks, and the saved IndexNow plan completed after that pass.

| Item | Evidence |
|---|---|
| Activated | November 10, 2026, 15:44:19.632 UTC / 21:14:19.632 Asia/Colombo |
| Authorized and serving Git SHA | `4f9c691049ac3cad20c0cbc56d3df5d1110d6489`, `refs/heads/main`. [Public release identity](https://echobuddha.com/release.json) |
| Review and authorization | PR #100 merged November 10 at 15:33:30 UTC. Current main matched the separately authorized SHA before dispatch. [Merged PR](https://github.com/rmtlbandara/EchoBuddha/pull/100) · [Owner authorization](https://github.com/rmtlbandara/EchoBuddha/pull/100#issuecomment-6771596652) |
| Post-merge validation | Run 42845586302 passed Release validation and Browser and consent validation on the authorized SHA. [Validation run](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42845586302) |
| Production workflow | Run 42847152198. Exact-main checks, build, artifact checks, deployment and metadata capture passed. Immediate smoke 14/15, IndexNow step skipped, evidence upload passed. [Run and artifacts](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42847152198) |
| Validated artifact | 836 files. Aggregate SHA-256 `1e20a929ccd173fb2ac1647bc1fe117238ec86c0975cc01d4a4656e2059775b1`. The deploy job verified each file against the immutable artifact manifest. Independent public digest checks also matched release.json, the sitemap, ads.txt, both search manifests, the hero image and the publisher logo. |
| Active Cloudflare deployment | Deployment `d1a48ef3-f94e-46ac-bd1c-eb2253dd36c5`. Worker version `61be5a18-59de-45f6-895c-825c0179ef3b` at 100% traffic. Confirmed independently by the authenticated deployment list. |
| Previous healthy release | SHA `dff012658c991e84db2320c1c0a9e4a424e4136f`, deployment `2f186d7c-82ee-459a-aecb-526cc51e62c5`, version `69188a75-bd48-442c-9c37-bb8a7be84c54`. Confirmed active at 100% and passed fresh smoke 15/15 before dispatch. [Previous deployment](2026-11-05-right-speech-decision-guide.md) |

## Immediate smoke failure and recovery

Cloudflare created the new deployment at 15:44:19 UTC. The hosted smoke receipt at 15:44:24 UTC recorded a 200 from `/release.json` with the November 5 SHA. Its other 14 checks passed. The workflow correctly skipped IndexNow. A later independent request returned the authorized SHA. The observations are consistent with a brief transition at the edge. The hosted receipt lacks response cache details, so the specific edge mechanism was not established.

After the target SHA was public, the unchanged production smoke suite passed **15/15** at 15:44:57 UTC with `RELEASE_SHA` pinned to the authorized commit. The active deployment was confirmed by authenticated readback and by comparing public HTML with the build manifest. No additional deployment or rollback was required. The previous verified Worker version above is the incident rollback reference.

The scheduled smoke workflow currently selects the latest successful production workflow run. That lookup will select the November 5 SHA while this recovered deployment is the latest active release. Use a live smoke invocation pinned to the SHA in this record when verifying the current deployment. Record a separate reviewed workflow correction for the transition wait and monitoring selection. [Scheduled smoke workflow](../../.github/workflows/production-smoke.yml) · [Rollback runbook](ROLLBACK_RUNBOOK.md)

## Public content and routing

The crawl found **356 linked HTML routes**, each HTTP 200 and matching the exact SHA-256 for its HTML file in the deployed build manifest. The checks covered the full bodies, source notes, links, headings and metadata of the 12 changed teaching pages, plus the homepage and Privacy Policy. The 14 changed routes link to 87 distinct internal destinations. The crawl verified 85 HTML targets, and smoke separately verified ads.txt and the sitemap. The 21 linked source, health and privacy references checked returned HTTP 200. The audit distinguishes live byte parity from the source and editorial assessment recorded before release. [Editorial review](../audits/adsense-recovery-2026-11/SOURCE_AND_EDITORIAL_REVIEW.md)

| Live route | Accepted change |
|---|---|
| [Daily Life Mindfulness](https://echobuddha.com/meditation/mindfulness-in-daily-life/) | DN 22 context, a handwashing cue and a three-day practice. |
| [Karma in Daily Life](https://echobuddha.com/articles/what-is-karma-in-buddhism/) | MN 61 example for judging an action before, during and after, with a concrete repair. |
| [Buddhism 101 Eightfold Path](https://echobuddha.com/learn/buddhism-101/the-noble-eightfold-path-explained/) | SN 45.8 factor map, MN 44 training groups and AN 8.25 lay context. |
| [Home Practice](https://echobuddha.com/learn/buddhism-101/how-to-practice-buddhism-at-home/) | Worked household example with scheduling and shared-space options. |
| [Karuṇā](https://echobuddha.com/learn/buddhist-dictionary/karuna/) | AN 4.125 cultivation exercise and clear relationship to the English Compassion entry. |
| [Eightfold Path hub](https://echobuddha.com/learn/eightfold-path/), [relationship among factors](https://echobuddha.com/articles/eightfold-path-explained/), [daily choices](https://echobuddha.com/articles/eightfold-path-explained-daily-life/) | Canonical concentration distinguished from everyday steadiness. Right Speech examples show the role of preparation. |
| [Dukkha](https://echobuddha.com/learn/buddhist-dictionary/dukkha/) and [posture](https://echobuddha.com/meditation/meditation-posture-for-beginners/) | Direct pain distinguished from added struggle. The posture guide separates dizziness from ordinary discomfort and links health guidance. |
| [Lay Buddhists and the Saṅgha](https://echobuddha.com/learn/buddhist-handbook/lay-sangha-relationship/) and [lay qualities](https://echobuddha.com/learn/buddhist-handbook/qualities-of-a-lay-buddhist/) | AN 8.88 scope and the textual status of the Milindapañha clarified. These small corrections retain the November 3 dates. |
| [Privacy Policy](https://echobuddha.com/privacy-policy/) | Describes Analytics after affirmative consent, sanitized page/referrer paths and aggregate search-use measurement. Shows November 10. |

The production sitemap parses as XML, matches the build digest, and contains the same **171 canonical URLs** as preflight. Twenty-four `lastmod` values changed as approved. All 171 returned 200, each with one main H1, a self-canonical and indexable metadata. The other 185 linked HTML routes retain noindex. Checked structured-data modification dates agree with their corresponding visible dates, and article publication dates are preserved by artifact parity. The main inventory has zero invalid JSON-LD objects.

Both `/terms-and-conditions` and `/terms-and-conditions/` return a single 301 to `/terms-of-use/` and preserve the test query string. Terms returns 200. Both existing attachment-article redirects retained their 301 destinations. Unknown paths return genuine 404s with noindex. HTTP and www checks redirect to the HTTPS apex. The canonical ads.txt response is plain text with the single approved publisher entry.

## Browser, consent and security

The live homepage fit all 14 tested widths from 320 to 1440 px. At 820 px, the hero loaded and its right edge was at 804 px. The approved logo loaded from the existing path. Fresh screenshots confirmed the tablet image and the 320 and 1440 px layouts. Chromium, Firefox and WebKit passed six homepage widths and a keyboard test for opening the mobile menu, moving focus into it and restoring focus on Escape. Across the homepage, changed content and key entry points, Chromium passed 78 reflow checks and 34 axe scans on 17 pages. The standard Chromium audit also passed 18 routes and eight Analytics consent scenarios. The consent tests intercepted Google requests to verify gating and avoid recording test visits. They covered first visit, rejection, persistence, acceptance, withdrawal, search minimization and mobile keyboard behavior.

The Tools suite passed in Chromium, Firefox and WebKit. A Firefox run initially flagged `target-size` on Tools at enlarged text. A standalone rerun passed and the live Tools HTML matches the preflight HTML exactly. The result is recorded as an intermittent audit finding. The Buddhist Questions audit passed 30 route and viewport combinations. The topic guides passed 72 checks across the three browser engines and three viewport sizes. Automated scans and tested keyboard paths give coverage of the sampled routes and controls.

All 356 public HTML responses included the expected seven security headers and no Cloudflare challenge header. Apex TLS verification passed. The public robots file includes the sitemap and the Mediapartners-Google allow directive. The workers.dev preview returned the expected `X-Robots-Tag` noindex protection. The publisher ownership meta tag is present, ads.txt passed the exact-entry smoke check, and the advertising runtime and manual slots were absent from the tested pages. The site changes did not modify security or advertising configuration.

## Performance and search notification

Lighthouse ran ten public routes on mobile and desktop. Mobile performance scores were **98–100**, compared with **99–100** locally on the candidate. Desktop performance and all 20 automated accessibility scores were **100**. Public mobile LCP ranged from 1.29 to 1.84 seconds, with the homepage at 1.70 seconds versus 1.48 locally. Desktop homepage LCP was 0.64 seconds versus 0.50 locally. The largest CLS was below 0.002, and mobile total blocking time was 0–116 ms. The samples showed no material performance regression. These are lab runs with different network paths and do not establish field Core Web Vitals.

The workflow saved a plan for 24 updated canonical URLs with no additions or removals. After the independent smoke pass, the saved target matched the public release manifest and its changes matched a recomputation against the preflight manifest. The repository's guarded submit command checked ownership proof, exact manifest, sitemap, HTTP status, canonicals and robots. It sent the plan once. **IndexNow returned HTTP 200 for 24 URLs** at 15:46:32 UTC. That confirms receipt. [IndexNow protocol](https://www.indexnow.org/documentation)

Post-release monitoring starts with this release SHA, the 171-URL inventory, the smoke results and the saved IndexNow receipt. Retain the pre-release 47-URL Search Console comparison for subsequent inspection after fresh crawls. AdSense remains `NOT_READY_FOR_REVIEW` pending the separate review. [Post-deployment readiness](../audits/adsense-recovery-2026-11/POST_DEPLOYMENT_ADSENSE_READINESS.md)
