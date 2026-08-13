# Echo Buddha Phase 8 Pre-Edit Technical, AdSense & Privacy Diagnostic

Diagnostic date: 2026-08-13

Starting branch: `codex/phase-8-technical-adsense-privacy`

Starting commit: `a87a790a8ec6279ae9565315fba3052d8bc0aa13`

Production deployment at capture: `c784aaa1-bfed-4fa1-a7a6-c91bc6284d58`

Production version at capture: `23d6d780-5174-43c2-86d1-09fd2e574cce` (100%)

## Dependency gate

Phase 7 explicitly marked Phase 8 ready after a separate owner instruction. The owner supplied that instruction on 2026-08-13. `MASTER_PRE_PHASE8_PROTECTION_REGISTER.csv` exists and is authoritative. The working tree was clean before this diagnostic and the Phase 8 branch was created from the deployed Phase 7 evidence commit.

## Protected state

Phase 8 must preserve the five-link primary navigation, homepage and Start Here journeys, Learn and meditation pathways, article/quote/tool/search roles, trust and safety disclosures, authored-versus-generated indexability decisions, canonicals, sitemap membership, static Astro architecture, and the disabled manual-ad state. It must not rewrite content, reassign topic ownership, enable Auto ads, create ad placements, reapply to AdSense, or perform Phase 9/10 work.

## Pre-edit validation

- `npm run validate`: PASS; 336 pages built; governance, tests, SEO and content audits passed.
- `npm audit --json`: PASS; 0 critical, high, moderate, low or informational vulnerabilities reported.
- Canonical production HTTPS: HTTP/2 200.
- `www` HTTPS to canonical: 301.
- canonical HTTP to HTTPS: 301.
- production `robots.txt`: 200.
- production `sitemap.xml`: 200.
- production `ads.txt`: 404.
- production `search-index.json`: 200; 878,452 bytes at capture.
- production HTML and machine-readable assets used `public, max-age=0, must-revalidate`.
- production advertised HTTP/3 through `alt-svc`.

## Primary findings

### P1 — first-visit Analytics consent is not affirmative

`ConsentManager.astro` writes an accepted preference when no stored choice exists, keeps the panel closed, and loads Google Analytics in production. The privacy policy says Analytics loads only after the visitor chooses to accept. Code and disclosure therefore conflict. Remediation must use a genuine opt-in default, prevent Analytics network requests before acceptance, preserve rejection/withdrawal, and keep all content usable.

### P1 — AdSense verification causes an unnecessary third-party runtime call

The AdSense runtime script is enabled on the homepage and a route-gated group of articles/learning pages even though manual slots are disabled. There is no repository evidence of a Google-certified CMP or account-level regional privacy message. A custom Analytics banner is not a substitute for the CMP Google requires when ads are served in the EEA, UK and Switzerland. Verification should use a no-network method supported by Google (`google-adsense-account` meta plus root `ads.txt`) while runtime ad delivery remains disabled pending owner/account/CMP decisions.

### P1 — ads.txt is absent

Production returns 404 for `/ads.txt`. The public publisher ID already present in source can produce the standard Google seller authorization line without exposing a secret.

### P2 — CSP is report-only and over-broad for the intended current state

Production sends a report-only policy that permits AdSense domains. No reporting endpoint is configured, so it neither enforces nor produces a useful report stream. Phase 8 should enforce the smallest policy compatible with the current no-ad-runtime state, retain the Analytics endpoints needed after consent, and validate representative pages for violations.

### P2 — cache behavior is safe but inefficient

HTML revalidation is appropriate, but fingerprinted `/_astro/` assets are not assigned a long immutable lifetime and `robots.txt`, `sitemap.xml`, `ads.txt`, and the search index have no explicit differentiated policy. Source-controlled Cloudflare header rules should make these behaviors intentional.

### P2 — preview indexing is not source-controlled

The public `workers.dev` hostname responded 200 without a source-controlled `X-Robots-Tag: noindex` rule. Add an explicit preview-host protection without changing canonical production indexability.

### P3 — validation encodes the flawed legacy default

The governance and browser tests currently require first-visit Analytics acceptance and AdSense runtime calls on eligible routes. They must be inverted into privacy and no-runtime regression gates.

## Account, legal and external boundaries

The repository cannot determine AdSense review status, Auto ads configuration, personalized/non-personalized ad selection, Google-certified CMP/account message state, Analytics account retention/settings, Search Console Manual Actions/Security Issues, or Cloudflare dashboard-only rules. These are recorded as owner/account/legal/external checks and do not block independent repository hardening.

## Planned controlled batches

1. Make Analytics basic-consent-mode behavior affirmative opt-in and accessible.
2. Replace AdSense runtime verification with metadata and `ads.txt`; keep manual ad units and runtime delivery disabled.
3. Align the privacy policy with actual behavior.
4. Enforce compatible headers, route-specific caching, preview noindex, and canonical redirects.
5. Add Phase 8 static/browser/network/security regression validation.
6. Rebuild, run full validation, execute lab/browser QA, and generate the required evidence registers.

Production deployment and final production parity remain pending separate owner approval.
