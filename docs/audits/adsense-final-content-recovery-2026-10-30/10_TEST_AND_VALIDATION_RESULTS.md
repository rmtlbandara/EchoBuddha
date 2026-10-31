# Test and validation results

**PASS_LOCAL_VALIDATION.** Node 22.23.4/npm 10.9.9; deterministic npm ci; final validate: release passed 98/98 tests plus build, typecheck, governance lint, ownership, source/trust/history, SEO/content/quote/index/privacy contracts and dependency checks. Zero high/critical advisories. Staged trust/secret scan and git whitespace checks passed. Production evidence is separate from these local measurements and is verified in 11 and RELEASE_VERIFICATION.json.

## Browser evidence

Chromium 149.0.7827.55, Firefox 151.0 and WebKit 26.5 passed the functional Tools/search/timer/keyboard/text-resize suite and changed-page checks. The complete matrix covered 235 routes in each engine at 320,390,640,768, 1024, 1280, 1440 px, with axe at 320 and 1440. A subsequent Tools-only CSS correction changed exactly tools/index.html out of 351 HTML files; that additional route passed all three engines and required widths, plus a 412 px touch-target check. The verified union is 236 changed routes per engine. Byte hashes establish that the other 350 HTML files were unchanged by the Tools follow-up. No route was excluded to hide a failure.

General browser validation passed 18 routes, zero axe violations of any reported severity, and all 8 consent scenarios. Optional Google collection remains off before affirmative acceptance and after rejection/withdrawal; advertising gates remain off. Four changed-page visual samples were captured and inspected. Automated checks are not full WCAG or real screen-reader certification.

## Lighthouse laboratory evidence

Twenty cases across 10 routes/mobile and desktop measured performance 100–100 and accessibility 100–100 after correction. Maximum measured LCP 1358.046 ms; maximum CLS 0.001734273664773513. These are local laboratory measurements, not production field data. GSC field Core Web Vitals has no data; no field INP claim is made.

The initial Tools mobile case measured accessibility 96 and exposed a real target-size defect at 412 px: dynamically inserted output descendants missed Astro's scoped selectors. Contained global descendant selectors restore intended styles, flex spacing and 44 px link targets. Tools mobile/desktop were then measured again; the 18 other measured cases retained identical HTML. All summary values are actual measurements in LIGHTHOUSE_SUMMARY.json, not assumed scores.

## Failures and corrections

- Ignored OS metadata caused initial lint failure; those metadata files were removed without weakening the lint.
- A quote-helper integration error was corrected before a successful build.
- A brittle exact time-tag assertion was corrected to allow real Astro attributes while preserving the exact date contract; the legitimate newer Five Precepts update replaced its obsolete fixed-date expectation.
- Real native-figure role, category heading-order and duplicate reflection-navigation-name defects were fixed.
- WebKit desktop-to 320 px resizing exposed 377 px card overflow. Explicit min-width: 0 restores 288 px cards/320 px document width without clipping content.
- A browser run overlapped a rebuild and timed out; final runs used stable output. Firefox/WebKit 304 cache revalidation on a revisited route was handled by disabling browser HTTP cache, retaining the fresh-response HTTP 200 assertion rather than allowing an exception.
- New CSV files were normalized to repository LF endings; content and evidence values were preserved.

Retained logs and recorded findings distinguish corrections from final passing runs. Complete machine-readable local evidence is in LOCAL_VALIDATION.json. Transient logs/screenshots/raw Lighthouse output remain ignored. Hosted CI and actual production smoke/crawl/parity are separate evidence in 11.

The topic-guide browser suite also passed 24 Chromium cases (eight guides at desktop/tablet/mobile). It retains the October 23 reference-table date assertion and additionally checks that the Five Precepts overall October 30 source-correction date is visible. No older source date was changed merely to satisfy a test.

## Actual production verification

Final PR CI 41155562843, exact merged-main CI 41155816574 and deployment workflow 41156084468 all passed. Immutable artifact verification covered 812 files. All 351 live HTML digests and 352 redirects matched; independent smoke 15/15; live crawl 350 reader routes with 165/165 canonical sitemap checks. Live Chromium accessibility 18 routes/zero violations and 8 consent scenarios passed; functional Tools checks passed all three engines. IndexNow accepted 82 notifications with HTTP 200 after hosted smoke, without an indexing guarantee. Full receipts are in RELEASE_VERIFICATION.json.

The documentation/governance receipt also passed a fresh local full release gate after actual deployment evidence was added. The live parity setup rejected an unexpanded source redirect file because its digest differed from the emitted file; the generated redirect file matched the hosted manifest and all 352 live redirects passed. No production correction or assertion weakening was required.
