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
npm install
npm run dev
```

The local dev server usually runs at `http://localhost:4321`.

## Validation

Run the full release gate before handing off changes:

```bash
npm run validate
```

The validation sequence runs:

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run audit:seo`
- `npm run audit:content`

The SEO audit writes current generated-site evidence to `docs/audits/echo-buddha-governance-implementation/`.
The content audit writes remediation evidence, registers, queues, and page-role maps to `docs/audits/content-audit/`.

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
- page-level `noindex, follow` metadata
- canonical URLs from `SITE.url`
- structured data by page template

Robots operating model: the repository contains the base Google Search crawl policy. Production may be edge-augmented by Cloudflare Managed content-signal and AI crawler rules. Verify production `robots.txt` after deployment.

## Privacy and Analytics

Google Analytics uses the property in `src/data/site.ts`, but it is consent-gated by `src/components/ConsentManager.astro`.

Default behavior:

- Google Analytics is not loaded before consent.
- Analytics storage defaults to denied.
- Advertising consent types remain denied.
- Users can accept, reject, reopen settings, or withdraw consent.
- Ads remain disabled.

The privacy policy must stay aligned with actual scripts and services.

## AdSense Status

AdSense is not live. `FEATURES.adsEnabled` is `false`, and no publisher ID should be introduced without a separate AdSense pre-application review.

Future ad work must review content quality, policy pages, consent, placement, mobile UX, accessibility, performance, and invalid-traffic risk.

## Deployment

Build and deploy manually only after validation and owner approval:

```bash
npm run build
npx wrangler deploy
```

This repository uses Cloudflare Workers Static Assets with `dist/` as the upload directory. Do not deploy from audit or implementation tasks unless explicitly requested.

## Contributor Workflow

1. Read `ECHO_BUDDHA_SEO_CONTENT_UX_GOVERNANCE.md`.
2. Review `ECHO_BUDDHA_COMPLETE_GOVERNANCE_AUDIT.md` for active findings.
3. Make scoped changes.
4. Run `npm run validate`.
5. Review generated route, sitemap, indexing, structured-data, accessibility, privacy, and content implications.
6. Update documentation when architecture, policy, consent, or indexing behavior materially changes.
