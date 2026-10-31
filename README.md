# Echo Buddha

Echo Buddha is a fast static Astro website for Buddhist-inspired wisdom, meditation guidance, original quotes, daily reflections, learning pages, and mindful living education.

## Tech Stack

- Astro static output
- TypeScript, HTML, and CSS
- Source-controlled sitemap and base `robots.txt`
- Cloudflare Workers Static Assets deployment through `wrangler.jsonc`
- No UI framework dependency

## Setup

```bash
npm ci
npm run dev
```

Use Node.js 22.23.4 and npm 10.9.9, as declared by `.node-version` and `package.json`. With nvm, run `nvm install 22.23.4` and `nvm use 22.23.4` first. The release validator checks that local execution matches CI. The local dev server usually runs at `http://localhost:4321`.

## Validation

Run the full release gate before handing off changes:

```bash
npm run validate:release
```

The validation sequence runs:

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run audit:seo`
- `npm run audit:content`
- `npm run audit:phase8`
- `npm run audit:phase9`
- `npm run audit:dependencies`

The SEO audit writes current generated-site evidence to `docs/audits/echo-buddha-governance-implementation/`.
The content audit writes remediation evidence, registers, queues, and page-role maps to `docs/audits/content-audit/`.
For a fresh audit, set `CONTENT_AUDIT_OUT_DIR` and `SEO_AUDIT_OUT_DIR` to an ignored `.artifacts/` directory to preserve historical reports. Content checks inventory every built page, including noindex pages. They report source-review, similarity and repeated-paragraph signals; a successful command is not editorial certification or an AdSense readiness verdict. Word counts describe main content and never set a publication minimum.
The dependency audit fails the release gate on high or critical vulnerability advisories.
The release gate uses `npm run validate:rc` and the Phase 2 local-release-candidate mode. It retains the measurement hold and checks explicitly approved application hashes. A later authorized intervention may supersede an earlier file hash only through a per-file replacement tied to an unchanged historical record and hashed baseline. Route, canonical, index and owner changes remain separately guarded. See [measurement intervention operations](docs/measurement-interventions.md). The stricter `npm run validate` and `npm run audit:phase2:measurement` commands validate the original measurement-infrastructure-only release scope.

Browser-readiness checks are available for final pre-release reviews:

```bash
npm run audit:browser
npm run audit:tools:browser
npm run audit:lighthouse
```

The general browser and Lighthouse scripts use system Chrome; the Tools script uses installed Playwright Chromium, Firefox and WebKit by default (`BROWSER_ENGINES=chromium` selects CI's installed engine). Set `AUDIT_OUT_DIR` to an ignored `.artifacts/` directory to preserve historical output. CI uploads generated evidence. See [publishing guidance](docs/publishing.md) for the source-led content workflow.

## Content Model

Shared content lives mainly in:

- `src/data/site.ts`
- `src/data/learn.ts`
- `src/data/dailyReflections.ts`

Current counts should be generated with `npm run audit:seo` and `npm run audit:content` rather than hardcoded into docs. The site includes article pages, quote categories and quote stories, daily reflections, learning hubs and detail pages, meditation guides, tools, search, and trust/policy pages.

## SEO and Indexing

Core metadata is generated through `src/components/SEO.astro` and `src/layouts/Layout.astro`.

The repository controls:

- `src/pages/sitemap.xml.ts`
- `public/robots.txt`
- `public/_headers`
- page-level `noindex, follow` metadata
- canonical URLs from `SITE.url`
- structured data by page template

Robots operating model: the repository contains the base Google Search crawl policy. Production may be edge-augmented by Cloudflare Managed content-signal and AI crawler rules. Verify production `robots.txt` after deployment.
Header operating model: `public/_headers` defines Cloudflare Static Assets security headers. Verify production response headers after deployment before claiming they are live.

### IndexNow

Every `npm run build` includes a public IndexNow ownership file and a manifest
of sitemap page hashes. The production workflow compares the previous live
manifest with the exact release artifact before deployment, then submits only
added, changed, or removed sitemap pages after production smoke passes. The
first release bootstraps all current sitemap URLs. Builds and pull-request CI
do not submit URLs.

Cloudflare Crawler Hints was already enabled on 2026-10-20, while Bing's
IndexNow view still displayed onboarding. Direct release submissions provide
an independently recorded result. See [IndexNow operations](docs/indexnow.md)
for activation, evidence, retry, and rollback boundaries.

## Privacy and Analytics

Google Analytics uses the property in `src/data/site.ts`, but it is consent-gated by `src/components/ConsentManager.astro`.

Current behavior:

- Analytics is denied until the visitor explicitly opts in.
- Advertising consent types remain denied.
- Users can accept, reject, reopen settings, or withdraw consent.
- Missing preferences open the privacy choice interface; they never imply acceptance.

The privacy policy must stay aligned with actual scripts and services.

## AdSense Status

The [October 30–31 site-wide recovery report](docs/audits/adsense-final-content-recovery-2026-10-30/13_FINAL_REPORT.md) keeps the page inventory, editorial/source review, authenticated service evidence, release verification and remaining limitations together. Consult its actual verdict before planning another AdSense review.

The AdSense publisher ID is centralized in `src/data/ads.ts` and exposed only through verification metadata and `public/ads.txt`. Runtime AdSense script loading, Auto Ads, and manual ad slots remain disabled through independent approval, serving, runtime, Auto Ads, and manual-slot gates. `src/data/monetization.mjs` is the default-deny route and placement firewall; unknown routes and incomplete metadata cannot render ads.

Future ad work must review consent/CMP requirements, content quality, policy pages, exact placement, mobile UX, accessibility, performance, and invalid-traffic risk.

## Deployment

Production deployment is intended to be a separately authorized operation. The manual `deploy-production.yml` workflow accepts an exact 40-character commit SHA from `main`, validates it, builds once, verifies the immutable artifact, deploys it through the protected `production` environment, and runs smoke checks. Rollback uses the separately confirmed `rollback-production.yml` workflow and a recorded Cloudflare version ID.

The GitHub `production` environment and the two named Cloudflare secrets exist, as verified on October 27. Environment and branch enforcement must be read from current GitHub settings; an environment name alone does not establish approval rules. The repository's `prebuild` guard rejects legacy Cloudflare Workers CI production builds. Check the external trigger and current account protections before each release; see the [October 27 verified deployment record](docs/deployments/2026-10-27-audit-remediation.md) for dated evidence.

For an owner-authorized emergency local deployment only:

```bash
npm run validate:release
npm run build -- --outDir .release/dist
npx wrangler deploy --assets .release/dist
```

After the external cutover, normal releases MUST use the governed workflow. See `ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE.md`, `docs/deployments/PRODUCTION_DEPLOYMENT_CHECKLIST.md`, and `docs/deployments/ROLLBACK_RUNBOOK.md`. Do not deploy from audit or implementation tasks unless explicitly requested.

## Contributor Workflow

1. Read `CONTRIBUTING.md`, `ECHO_BUDDHA_SEO_CONTENT_UX_GOVERNANCE.md`, and `ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE.md`.
2. Review `ECHO_BUDDHA_COMPLETE_GOVERNANCE_AUDIT.md` and the Phase 9 protection registers for active findings.
3. Make scoped changes on a dedicated branch and complete the pull-request template.
4. Run `npm run validate:release` and `npm run audit:governance:changes`.
5. Review generated route, sitemap, indexing, structured-data, accessibility, privacy, content, release, and rollback implications.
6. Update documentation and approval registers when architecture, policy, consent, indexing, workflow, or release behavior materially changes.
