# Production acceptance — November 11 recovery candidate

**Candidate validation in progress. No November 11 deployment is claimed by this initial record.** Append actual hosted validation, commit, release, Cloudflare and live evidence after each succeeds.

## Preserved baseline

- Main: `1440d56f6282f177cd8b853592a4416fdfc9a78d`.
- Serving production: `4f9c691049ac3cad20c0cbc56d3df5d1110d6489`.
- Cloudflare deployment: `d1a48ef3-f94e-46ac-bd1c-eb2253dd36c5`.
- Cloudflare version: `61be5a18-59de-45f6-895c-825c0179ef3b`, 100% traffic, independently rechecked in authenticated dashboard November 11.
- Baseline smoke: 15/15; 171 sitemap URLs and 356 linked HTML routes returned 200.
- Rollback reference: that verified version/SHA; use governed rollback if a future release fails acceptance.

PR101 is merged at `fca54358fa28d2f347926c79fa131ca3b6af8773`, recording the November 10 acceptance. PR102 is merged at main `1440d56...`, adding bounded exact identity retries and monitoring resolution from verified deployment evidence. Original run 42847152198 remains failed. Its initial request saw the preceding release five seconds after activation. Recovery status 21872063432 was appended with immutable receipt evidence; original failed status 21869586318 is retained. Corrected monitor run 42853057407 passed 15/15 with VERIFIED_AFTER_INITIAL_FAILURE. These are historical verified results, not a claim that the failed run passed.

## Candidate controls and checks

Dedicated branch `codex/adsense-final-readiness-2026-11`. Local full release gate passed with 106/106 tests, SEO/governance, type checks, lint and zero high/critical npm advisories. New consent browser scenario passes. Independent source/editorial/technical agent passes found and rechecked two material candidate/reproduction issues. The exact final commit and hosted validation must still be recorded.

The adopted owner brief authorizes this governed content/contact recovery and production release. It does not authorize a protection bypass. Repository guidance allows solo-maintainer review after CI. Exact current-main SHA checks, immutable build digest verification, protected production environment, shared concurrency, bounded activation verification, post-smoke IndexNow and weekly deployment-evidence-based monitoring remain in force. No production workflow changes are needed in this content candidate.

## Infrastructure observations

Authenticated Worker Settings showed static-assets-only delivery and no connected Git repository. Build provider connection options remained available; an uncontrolled automatic Git deployment was not configured by this task. Cloudflare managed rules and HTTP DDoS protections were always active; Browser Integrity Check on; Bot Fight Mode and AI Labyrinth off. Existing email obfuscation was on. No security, DNS, caching or TLS setting was modified to accommodate a suspected crawler. The fresh public baseline showed successful HTTPS and crawl resources; Google host status had no problems.

## Required release receipt

Record PR/head/merge SHA, hosted run/check results, authorization scope, exact main before dispatch and deploy, production workflow URL, artifact ID/digest, Cloudflare deployment/version and traffic, activation retry log, smoke15/15, live HTML/artifact comparison, email/runtime/headers/redirect checks, browser and performance results, changed IndexNow plan/acknowledgment and follow-up monitor result. Preserve original failure history and this immutable pre-release baseline. An attempted action is not production acceptance.

## Final local candidate checks

The final application changes are in commits `6ed6bfab947a5aab6fe15157705266eca1c728d6` and `8e54bc6b7a61f5f3747d0f05b423bde6983fbc80`. The full release gate after the final source/test edit passed 106/106 tests, all current deterministic content/SEO/governance checks, typecheck, lint and the npm high/critical gate. [Final log](evidence/validate-release-final-checked.log)

The 18-route Chromium consent/accessibility gate passed all nine consent scenarios, with zero axe violations at all severities. Tools, search, timers, keyboard and reflow checks passed Chromium, Firefox and WebKit. The question collection passed 30 route/viewport combinations. Guide tables and layouts passed 72 combinations across the three engines, three widths and eight routes. The post-replacement homepage passed nine combinations at 390, 820 and 1440 px, with loaded visible art, no overflow and zero axe violations. The hero uses a content-version query to refresh the existing cached image URL. [Consent](evidence/consent-browser-results.json) · [Accessibility](evidence/accessibility-browser-results.json) · [Homepage](evidence/homepage-three-engine-results.json)

Before the one-asset replacement, Lighthouse covered ten routes on both mobile and desktop: performance and accessibility 100 in all 20 runs. Final homepage desktop remained 100/100. A final mobile sample during other local validation scored 76 performance / 100 accessibility, with 1,042 ms blocking time. Two bounded sequential repeats scored 96 and 99 performance, both 100 accessibility, with blocking time 220 and 101 ms. The three-sample mobile range is 76–99, median 96; the final LCP range is 1.35–2.02 seconds. Mobile transfer differs from the earlier sample by seven bytes (the versioned image URL), while the hidden hero is not downloaded. The timing variation does not demonstrate a material payload regression. All observations, including the outlier, are retained; these are local laboratory results, not field performance.

Governance reporting on the first application commit flagged four review areas: content, SEO, trust/safety and privacy/advertising. Separate source/editorial/technical agent passes and root review covered those areas. These are agent review passes; they do not claim that a second human signed off. The solo-maintainer rule permits owner/self-review after hosted CI. Hosted evidence is still required before merge.

Npm audit reported no high/critical advisories, while vendor evidence identified affected Astro, transitive Prism and bundled Wrangler code. The applicability review found no demonstrated exploitable input path in this static-assets delivery and controlled deployment. These remain P2 security maintenance. See [dependency review](DEPENDENCY_REVIEW.md); the audit result does not certify vulnerability-free tooling.
## Final local candidate checks

The final application changes are in commits `6ed6bfab947a5aab6fe15157705266eca1c728d6` and `8e54bc6b7a61f5f3747d0f05b423bde6983fbc80`. The full release gate after the final source/test edit passed 106/106 tests, all current deterministic content/SEO/governance checks, typecheck, lint and the npm high/critical gate. [Final log](evidence/validate-release-final-checked.log)

The 18-route Chromium consent/accessibility gate passed all nine consent scenarios, with zero axe violations at all severities. Tools, search, timers, keyboard and reflow checks passed Chromium, Firefox and WebKit. The question collection passed 30 route/viewport combinations. Guide tables and layouts passed 72 combinations across the three engines, three widths and eight routes. The post-replacement homepage passed nine combinations at 390, 820 and 1440 px, with loaded visible art, no overflow and zero axe violations. The hero uses a content-version query to refresh the existing cached image URL. [Consent](evidence/consent-browser-results.json) · [Accessibility](evidence/accessibility-browser-results.json) · [Homepage](evidence/homepage-three-engine-results.json)

Before the one-asset replacement, Lighthouse covered ten routes on both mobile and desktop: performance and accessibility 100 in all 20 runs. Final homepage desktop remained 100/100. A final mobile sample during other local validation scored 76 performance / 100 accessibility, with 1,042 ms blocking time. Two bounded sequential repeats scored 96 and 99 performance, both 100 accessibility, with blocking time 220 and 101 ms. The three-sample mobile range is 76–99, median 96; the final LCP range is 1.35–2.02 seconds. Mobile transfer differs from the earlier sample by seven bytes (the versioned image URL), while the hidden hero is not downloaded. The timing variation does not demonstrate a material payload regression. All observations, including the outlier, are retained; these are local laboratory results, not field performance.

Governance reporting on the first application commit flagged four review areas: content, SEO, trust/safety and privacy/advertising. Separate source/editorial/technical agent passes and root review covered those areas. These are agent review passes; they do not claim that a second human signed off. The solo-maintainer rule permits owner/self-review after hosted CI. Hosted evidence is still required before merge.

Npm audit reported no high/critical advisories, while vendor evidence identified affected Astro, transitive Prism and bundled Wrangler code. The applicability review found no demonstrated exploitable input path in this static-assets delivery and controlled deployment. These remain P2 security maintenance. See [dependency review](DEPENDENCY_REVIEW.md); the audit result does not certify vulnerability-free tooling.
