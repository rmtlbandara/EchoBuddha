# Test and validation results

**PASS_LOCAL_VALIDATION.** Node 22.23.4/npm 10.9.9; deterministic npm ci; final validate:release passed 98/98 tests plus build, typecheck, governance lint, ownership, source/trust/history, SEO/content/quote/index/privacy contracts and dependency checks. Zero high/critical advisories. Staged trust/secret scan and git whitespace checks passed. No deployment is claimed here.

## Browser evidence

Chromium 149.0.7827.55, Firefox 151.0 and WebKit 26.5 passed the functional Tools/search/timer/keyboard/text-resize suite and changed-page checks. The complete matrix covered 235 routes in each engine at 320,390,640,768,1024,1280,1440px, with axe at 320 and 1440. A subsequent Tools-only CSS correction changed exactly tools/index.html out of 351 HTML files; that additional route passed all three engines and required widths, plus a412px touch-target check. The verified union is236 changed routes per engine. Byte hashes establish that the other350 HTML files were unchanged by the Tools follow-up. No route was excluded to hide a failure.

General browser validation passed 18 routes, zero axe violations of any reported severity, and all 8 consent scenarios. Optional Google collection remains off before affirmative acceptance and after rejection/withdrawal; advertising gates remain off. Four changed-page visual samples were captured and inspected. Automated checks are not full WCAG or real screen-reader certification.

## Lighthouse laboratory evidence

Twenty cases across 10 routes/mobile and desktop measured performance100–100 and accessibility100–100 after correction. Maximum measured LCP 1358.046ms; maximum CLS 0.001734273664773513. These are local laboratory measurements, not production field data. GSC field Core Web Vitals has no data; no field INP claim is made.

The initial Tools mobile case measured accessibility96 and exposed a real target-size defect at 412px: dynamically inserted output descendants missed Astro's scoped selectors. Contained global descendant selectors restore intended styles, flex spacing and 44px link targets. Tools mobile/desktop were then measured again; the18 other measured cases retained identical HTML. All summary values are actual measurements in LIGHTHOUSE_SUMMARY.json, not assumed scores.

## Failures and corrections

- Ignored OS metadata caused initial lint failure; those metadata files were removed without weakening the lint.
- A quote-helper integration error was corrected before a successful build.
- A brittle exact time-tag assertion was corrected to allow real Astro attributes while preserving the exact date contract; the legitimate newer Five Precepts update replaced its obsolete fixed-date expectation.
- Real native-figure role, category heading-order and duplicate reflection-navigation-name defects were fixed.
- WebKit desktop-to320px resizing exposed377px card overflow. Explicit min-width:0 restores288px cards/320px document width without clipping content.
- A browser run overlapped a rebuild and timed out; final runs used stable output. Firefox/WebKit 304 cache revalidation on a revisited route was handled by disabling browser HTTP cache, retaining the fresh-response HTTP 200 assertion rather than allowing an exception.
- New CSV files were normalized to repository LF endings; content and evidence values were preserved.

Retained logs and recorded findings distinguish corrections from final passing runs. Complete machine-readable local evidence is in LOCAL_VALIDATION.json. Transient logs/screenshots/raw Lighthouse output remain ignored. Hosted CI and actual production smoke/crawl/parity are separate evidence in11.
