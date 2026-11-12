# Production release and acceptance — November 11, 2026

**PASS: bb44ff95fbba3e312a2a76b6f49a65a35cd2c551 is serving at https://echobuddha.com/.** Cloudflare version `672b2829-0760-4d5f-b715-0c6b163e867e` receives 100% of production traffic. Authenticated dashboard, exact public release identity, hosted activation/smoke, immutable artifact parity and independent monitoring agree.

## Governed changes and hosted results

- [PR103](https://github.com/rmtlbandara/EchoBuddha/pull/103): content/contact/consent/source/hero remediation, merged as `bb44ff95fbba3e312a2a76b6f49a65a35cd2c551`. Final integrated head `d53b7fc1b08a0da390663186794ebce44ce5187e`; [hosted validation 43037402718](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43037402718), release and browser jobs both SUCCESS. 106 tests and nine consent scenarios actually ran.
- [PR104](https://github.com/rmtlbandara/EchoBuddha/pull/104): isolated browser runner reliability correction, merged `56eb527f87f7d8779e9313e13abc75863125eb2c`. [Hosted 43036811888](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43036811888) both jobs SUCCESS. Ubuntu 24.04, isolated Chromium install without redundant apt, five-minute setup bound; mandatory browser assertions retained. Earlier 43034023992 attempts 1/2 hit observed Ubuntu 26.04 mirror DNS failures and were cancelled. They are not described as passing. [Incident record](../../deployments/2026-11-11-hosted-browser-runtime.md).
- [Production 43037973572](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43037973572): SUCCESS, both jobs. Exact current-main checks before build and deploy, immutable artifact verified, protected production environment retained, first activation verification matched, smoke 15/15.
- [Corrected monitor 43038320353](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43038320353): SUCCESS, 15/15, **VERIFIED_LIVE**. Expected SHA comes from deployment 7712624440/status 21953030283 and successful hosted deployment evidence. It does not select the newest green validation run.

The adopted owner brief authorized this governed release. Repository guidance permits solo owner/self-review after CI; separate agent source/editorial/technical passes are documented without claiming a second human approval. No branch or environment protection was bypassed. Historical planned interventions remain unchanged; a separate actual DEPLOYED receipt was appended. Documentation-only follow-up commits do not change the serving release and require no redeployment.

## Immutable deployment identity

| Field | Verified value |
|---|---|
| Production SHA | `bb44ff95fbba3e312a2a76b6f49a65a35cd2c551` |
| Ref/build time | refs/heads/main; 2026-11-11T14:23:39.776Z |
| Cloudflare deployment | 2be04185-5869-4457-97bf-9d69c7fb0a73 |
| Cloudflare version/traffic | `672b2829-0760-4d5f-b715-0c6b163e867e` / 100% |
| Activation | 2026-11-11T14:24:30.845944Z; 19:54: 30 Asia/Colombo |
| Artifact ID | 13864381461; production-dist-bb44ff95fbba3e312a2a76b6f49a65a35cd2c551-43037973572 |
| Downloaded ZIP SHA256 | c126b6d871ad7d5171c0ef7c4b72f947fb564ca35fb2e982118322b0ee8ab2f6 |
| Manifest aggregate | 21fe511c4875f0b60c51fc11761c671b0fb49ab1728a9a8e96db3868e313d390 |
| Manifest/public scope | 837 files; 835 public, two private deployment configs excluded |

## Independent live acceptance

All 835 public artifact files were fetched and verified. 834 are byte-identical; robots.txt contains Cloudflare's expected managed prefix followed by the byte-identical source-controlled base. The prefix is unchanged from baseline. The initial unqualified strict byte comparison exposed this expected transformation; the scoped check verifies both the unchanged prefix and exact base, without suppressing arbitrary mismatch. All 357 HTML files, including the genuine 404, match their artifact bytes and carry all seven checked security headers. This is not a claim that all 835 are byte-identical.

The linked inventory remains 356 routes: 171 indexable and 185 noindex, with a separate genuine 404. All 171 sitemap URLs return 200 with unique titles/descriptions and expected self-canonicals; no noindex sitemap leakage. All public decoded bytes expose only info@echobuddha.com; the retired address is absent. No AdSense runtime/slot is present in HTML. Googlebot, Mediapartners-Google and Bingbot remain allowed; GPTBot/ClaudeBot policies remain unchanged. Both legacy Terms slash forms preserve query parameters through 301→200. No URL/index/owner/canonical architecture change occurred.

Public-browser acceptance passed 33 direct routes, 142 responsive checks and 66 axe runs with zero violations at every severity. Home passed 14 widths from 320 to 1440, including 819/820/821. The live consent suite passed 9/9, and its 18 route accessibility suite found zero violations. The reacceptance fix restores analytics consent on the same page while loading/configuring once, retaining denied ad consent and query minimization. Browser command tests do not certify Google's ingestion pipeline.

IndexNow acknowledged 171 updated URLs with HTTP 200 at 2026-11-11T14:24:42.820Z. All 171 rendered HTML hashes changed because the shared consent runtime changed; this does not mean 171 substantive editorial rewrites. The notification is not an indexing guarantee. No duplicate notification was sent through Bing UI.

[Full file parity](evidence/production/full-artifact-live-parity.json) · [Live inventory](evidence/production/live-inventory.json) · [Browser](evidence/production/live-browser-results.json) · [Consent](evidence/production/live-consent-results.json) · [Monitor](evidence/production/monitor-results.json) · [IndexNow](evidence/production/indexnow-result.json) · [Immutable receipt](../../deployments/receipts/2026-11-11-final-readiness.json)

## Original red deployment and permanent monitor correction

Original [run 42847152198](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42847152198) remains failed: Cloudflare activated `4f9c691049ac3cad20c0cbc56d3df5d1110d6489`, but the initial identity fetch five seconds later still saw the preceding dff release during propagation. A valid activation and failed initial verification were distinct facts. PR101 merged at fca54358fa28d2f347926c79fa131ca3b6af8773 documents independent acceptance. PR102 merged `1440d56f6282f177cd8b853592a4416fdfc9a78d` adds strict full-SHA/ref/schema verification with six bounded requests, five-second request timeouts and 2/4/8/12/15 second backoff; malformed identity fails immediately. Monitoring resolves authoritative verified deployment evidence and explicitly reports real failure, transition or recovery.

Success status 21872063432 was appended to deployment 7686706882 using immutable receipt commit a4e8c48d4c53202e7dd1242e12ba31b6d14cb940. Failed status 21869586318 and the original failed run remain preserved. Historical corrected monitor 42853057407 passed 15/15 with VERIFIED_AFTER_INITIAL_FAILURE. This November 11 deployment has its own normal success status and needs no reconciliation. [Monitoring incident record](../../deployments/2026-11-10-production-monitoring-remediation.md).

## Rollback and infrastructure

Prior healthy immutable rollback remains SHA `4f9c691049ac3cad20c0cbc56d3df5d1110d6489`, version `61be5a18-59de-45f6-895c-825c0179ef3b`, deployment `d1a48ef3-f94e-46ac-bd1c-eb2253dd36c5`. No rollback was needed. Static assets-only Worker, no provider Git auto-deploy connection, existing WAF/DDoS/BIC, DNS, TLS and email routing were inspected and preserved. No redeployment was made for a green indicator. The single new production release contained justified content/privacy/rights work.

## Local validation and honest performance limits


The final application changes are in commits `6ed6bfab947a5aab6fe15157705266eca1c728d6` and `8e54bc6b7a61f5f3747d0f05b423bde6983fbc80`. The full release gate after the final source/test edit passed 106/106 tests, all current deterministic content/SEO/governance checks, typecheck, lint and the npm high/critical gate. [Final log](evidence/validate-release-final-checked.log)

The 18-route Chromium consent/accessibility gate passed all nine consent scenarios, with zero axe violations at all severities. Tools, search, timers, keyboard and reflow checks passed Chromium, Firefox and WebKit. The question collection passed 30 route/viewport combinations. Guide tables and layouts passed 72 combinations across the three engines, three widths and eight routes. The post-replacement homepage passed nine combinations at 390, 820 and 1440 px, with loaded visible art, no overflow and zero axe violations. The hero uses a content-version query to refresh the existing cached image URL. [Consent](evidence/consent-browser-results.json) · [Accessibility](evidence/accessibility-browser-results.json) · [Homepage](evidence/homepage-three-engine-results.json)

Before the one-asset replacement, Lighthouse covered ten routes on both mobile and desktop: performance and accessibility 100 in all 20 runs. Final homepage desktop remained 100/100. A final mobile sample during other local validation scored 76 performance / 100 accessibility, with 1, 042 ms blocking time. Two bounded sequential repeats scored 96 and 99 performance, both 100 accessibility, with blocking time 220 and 101 ms. The three-sample mobile range is 76–99, median 96; the final LCP range is 1.35–2.02 seconds. Mobile transfer differs from the earlier sample by seven bytes (the versioned image URL), while the hidden hero is not downloaded. The timing variation does not demonstrate a material payload regression. All observations, including the outlier, are retained; these are local laboratory results, not field performance.

Governance reporting on the first application commit flagged four review areas: content, SEO, trust/safety and privacy/advertising. Separate source/editorial/technical agent passes and root review covered those areas. These are agent review passes; they do not claim that a second human signed off. The solo-maintainer rule permits owner/self-review after hosted CI. Hosted checks subsequently passed on the final integrated head, as recorded above.

Npm audit reported no high/critical advisories, while vendor evidence identified affected Astro, transitive Prism and bundled Wrangler code. The applicability review found no demonstrated exploitable input path in this static-assets delivery and controlled deployment. These remain P2 security maintenance. See [dependency review](DEPENDENCY_REVIEW.md); the audit result does not certify vulnerability-free tooling.
