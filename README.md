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

Use Node.js 22 and npm 10, as declared by `.node-version` and `package.json`. The local dev server usually runs at `http://localhost:4321`.

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
The dependency audit fails the release gate on high or critical vulnerability advisories.

Browser-readiness checks are available for final pre-release reviews:

```bash
npm run audit:browser
npm run audit:lighthouse
```

These commands use system Chrome through `playwright-core` and Lighthouse. CI uploads their generated `.artifacts/` evidence; historical audit evidence remains under `docs/audits/final-readiness-remediation/`.

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

## Privacy and Analytics

Google Analytics uses the property in `src/data/site.ts`, but it is consent-gated by `src/components/ConsentManager.astro`.

Current behavior:

- Analytics is denied until the visitor explicitly opts in.
- Advertising consent types remain denied.
- Users can accept, reject, reopen settings, or withdraw consent.
- Missing preferences open the privacy choice interface; they never imply acceptance.

The privacy policy must stay aligned with actual scripts and services.

## AdSense Status

The AdSense publisher ID is centralized in `src/data/ads.ts` and exposed only through verification metadata and `public/ads.txt`. Runtime AdSense script loading, Auto Ads, and manual ad slots remain disabled through independent approval, serving, runtime, Auto Ads, and manual-slot gates. `src/data/monetization.mjs` is the default-deny route and placement firewall; unknown routes and incomplete metadata cannot render ads.

Future ad work must review consent/CMP requirements, content quality, policy pages, exact placement, mobile UX, accessibility, performance, and invalid-traffic risk.

## Deployment

Production deployment is intended to be a separately authorized operation. The manual `deploy-production.yml` workflow accepts an exact 40-character commit SHA from `main`, validates it, builds once, verifies the immutable artifact, deploys it through the protected `production` environment, and runs smoke checks. Rollback uses the separately confirmed `rollback-production.yml` workflow and a recorded Cloudflare version ID.

The legacy Cloudflare Git integration was observed auto-deploying `main` during the Phase 9 release. The owner must disable that automatic production trigger after configuring the GitHub `production` environment; until that external cutover is verified, merging to `main` can still deploy automatically.

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
