# Technical SEO and production architecture — November 11, 2026

## Released and verified

The November 11 changes are live at **`bb44ff95fbba3e312a2a76b6f49a65a35cd2c551`**, merged through [PR 103](https://github.com/rmtlbandara/EchoBuddha/pull/103). [Production workflow 43037973572](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43037973572) completed successfully. Cloudflare version `672b2829-0760-4d5f-b715-0c6b163e867e` was verified at 100% traffic. This report records completed production acceptance, with bounded observations rather than a prediction of future availability or AdSense approval. See [release verification](PRODUCTION_RELEASE_VERIFICATION.md).

The immutable release artifact contains 837 files: 835 public files and two configuration files excluded from public parity checks. The fresh production comparison verified all 835 public files, including 357 HTML documents with the deliberate 404 document. **834 public files matched artifact bytes exactly.** The remaining file, `robots.txt`, retains the unchanged Cloudflare-managed prefix followed by the byte-identical source policy; it is a documented edge transformation, not an unexplained content mismatch. All 357 HTML documents retained the required checked security headers and lacked the AdSense runtime. Public-byte scanning found only `info@echobuddha.com` and no retired address.

Raw acceptance evidence is under `.artifacts/adsense-final-readiness-2026-11/production/`: `full-artifact-live-parity.json`, `robots-policy-check.json`, `release-selection.json` and `artifact/release-manifest.json`. The parity observation was recorded at 14:32 UTC on November 11.

## Crawl and indexability

The fresh live crawl at 14:29 UTC discovered 356 linked HTML routes and 171 canonical sitemap URLs. **All 171 sitemap pages returned 200**, with 171 unique titles, 171 unique descriptions, correct self-canonicals, one H1 per page and zero noindex entries. No sitemap social preview used SVG. There remain 185 intentionally noindex linked routes. The 357-document build additionally includes the deliberate 404 document; it is not a new indexable page. Direct browser acceptance also confirmed a genuine 404 response and two expected redirects.

The morning baseline at 02:49 UTC had the same route and sitemap totals. Its diagnostic counts were 51 indexable pages below 500 main-body words and 30 undated learning articles; the final live diagnostic counts are 50 and 26 respectively. These are descriptive inventory checks, not a minimum-word rule or a reason to manufacture dates. Concise dictionary, reference and navigation pages can satisfy their stated intent. The 171 fresh indexable-body reviews and complete route register distinguish genuine improvements from preserved pages.

No URL was added, removed, redirected, newly noindexed or re-canonicalized by this release. Apex/HTTPS and Terms normalization, Search, archives, noindex quote/detail publishing and the date selector retain their existing roles. Robots policy checks allow Googlebot, Mediapartners-Google and bingbot while preserving the existing GPTBot and ClaudeBot restrictions. No protection was weakened to facilitate crawling. Raw live crawl evidence is `production/live-crawl/inventory.json` and its captured sitemap/HTML resources.

The production workflow received HTTP 200 acceptance for 171 IndexNow notifications after live verification. That response acknowledges submission; it does not guarantee indexing, ranking, crawl timing or Google acceptance.

## Scope of changes

The release materially improves 19 teaching pages, makes precision changes on five teaching/reflection/quote routes, improves two navigation routes and migrates six trust/contact routes. The separate homepage artwork-origin correction brings total directly changed routes to 33. Shared metadata, read-time and consent changes also alter other rendered files; those derived changes are not additional substantive editorial rewrites.

Original publication dates remain intact. Modified dates change only for substantial content/policy revisions. Two retained TopicGuide panels keep their own October 23 revision because their content did not change. The focused Three Marks title resolves the title-length warning. The Q 2 answer combines two sections repeating the shrine-not-required point. Beginner and loving-kindness meditation each retain one complete practice sequence, method tables, adaptation/stopping guidance, FAQs and source limits; the retained method appears before After the Session. Empty prose-source paragraphs no longer render where only a reference list exists, and the sutta lesson intro avoids escaped anchor markup.

The resources page provides 11 destination-specific learning descriptions. Daily Reflections accurately says selection follows the current UTC day. The contact model uses one public address. The homepage artwork has a reproducible local source. These changes preserve the existing publishing architecture and do not introduce a mass content expansion or external tracking service.

## Production behavior and accessibility

Live consent acceptance passed **9/9 scenarios**, including first visit, rejection, withdrawal, query privacy and explicit same-page reacceptance. Reacceptance restores analytics consent while loading the analytics script/configuration once. First visit and rejection initiate no optional Google request. Advertising storage, user data and personalization remain denied. Search query strings and fragments remain excluded from analytics configuration and search-use events. The live accessibility companion checked 18 routes with zero axe violations across recorded severities.

Separate direct browser acceptance covered **33 routes, 142 responsive checks and 66 axe checks**, all passing. The homepage was checked at 14 widths without overflow. These are automated browser/DOM/accessibility observations, not a real assistive-technology user evaluation or human accessibility certification. Raw production records are `production/consent-browser/consent-browser-results.json`, `production/consent-browser/accessibility-browser-results.json` and `production/browser/live-acceptance-browser.json`; earlier local evidence must not be relabeled as these live results.

Final local homepage Lighthouse mobile performance samples were 76, 96 and 99 (median 96); desktop performance was 100. The lower sample remains part of the recorded laboratory variation. These are local laboratory results, not field Core Web Vitals or a CrUX assessment, and were not replaced with a claim of universal production performance.

## Release controls, independent review and monitoring

The integrated deterministic release gate passed build, TypeScript, lint, 106/106 tests, current source/route/content governance, SEO, historical-boundary checks and the npm high/critical gate. Separate hosted validation and production execution then completed. The browser-runner correction did not waive a test: it selected a supported hosted image and removed redundant APT setup while retaining actual browser launches and mandatory gates. Earlier setup failures remain part of the history.

Controls retained include exact duplicate detection, source IDs and attribution rules, route/canonical/sitemap tests, meaningful-date assertions, approved indexable-page records, protected-file approvals, per-file intervention supersession, overlap/structural warnings, fail-closed ad runtime controls, consent browser checks, exact-current-main SHA checks, immutable artifact digest verification, bounded activation verification and post-smoke IndexNow ordering. Cloudflare managed rules and HTTP DDoS protections remained active, Browser Integrity Check remained on, and Bot Fight Mode and AI Labyrinth remained off. DNS, TLS and security controls were not changed for this release.

Independent agent review covered the revised teaching content against primary sources and separately checked contact/schema/consent/link behavior. An escaped intro anchor and a pre-existing consent reacceptance defect were corrected and rechecked. These passes do not imply a second human reviewer, professional scholarly/legal approval or certified originality. The [dependency review](DEPENDENCY_REVIEW.md) records a bounded risk assessment and separate P2 maintenance; an npm audit result is not a claim that no vulnerabilities exist.

The follow-up [monitor 43038320353](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43038320353) passed **15/15** checks and classified the release **VERIFIED_LIVE**, using deployment `7712624440` and successful status `21953030283`. Its serving identity matched the released SHA in one observation. Raw evidence is `production/monitor/production-smoke-results.json`. This completes the observed production gate without treating a successful deployment as AdSense resubmission, advertising activation or approval.
