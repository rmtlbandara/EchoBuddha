# Validation results

All existing mandatory release checks passed locally and in hostedPR CI, exact merged-mainCI, and deployment revalidation: build, typecheck, governance lint,98/98 unit/contract tests, SEO/content/source/index/privacy/route protections, dependency audit (zero high/critical advisories). Exact toolchain Node 22.23.4/npm 10.9.9 used. No separate ESLint/formatter/component-runner command exists; generated-homepage contract tests cover footer/component output. `git diff --check` passed; governance report had zero human-review warnings.

General browser readiness passed locally and against production:18 accessibility routes and existing consent scenarios. Tools/search/timers/keyboard/reflow/axe tests passed in Chromium,Firefox,WebKit after refreshing the stale project preview. HostedBrowser and consent validation also passed. No test disabled, removed or weakened.

Targeted footer checks passed18/18 locally and18/18 in production: three browsers ×320,390,720,768,1024,1440px. Exact five-link sequence/destinations, accessible names, rendered22pxSVG paths,44×44px targets, keyboard focus and order, equal row alignment, no overlap/horizontal overflow, unique publisher sameAs and zero footer axe violations. Screenshots retained in ignored local/production subfolders. WebKit on macOS uses nativeOption-Tab for links, consistent with existing project tests.

Measured production Lighthouse on10 routes ×mobile/desktop: mobile performance99–100, desktop performance100–100; accessibility100 on all20 checks. Homepage mobile performance100, desktop100. Max measuredCLS0.001734273664773513. These are lab measurements, not fieldCore Web Vitals or universal accessibility certification.

Independent release parity:351/351 liveHTML SHA256 digests and both emitted homepage assets match the downloaded immutable manifest. Previous production351 SEO heads remain equal except approvedsameAs; sitemap,redirects,robots,security-header source andads.txt bytes unchanged. Smoke15/15 passed. Details and exact identifiers in RELEASE_VERIFICATION.json.
