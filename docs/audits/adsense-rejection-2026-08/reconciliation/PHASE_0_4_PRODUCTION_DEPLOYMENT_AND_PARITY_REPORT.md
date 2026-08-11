# Echo Buddha — Phase 0–4 Production Deployment and Parity Report

**Deployment date:** 2026-08-11 (Asia/Colombo)
**Production:** https://echobuddha.com
**Branch:** `codex/reconciliation-phase-0-4-stabilization`
**Release commit:** `89656e506f1fbfa6de000921f7c356ffc24778c3`
**Cloudflare Worker:** `echobuddha`
**Cloudflare version:** `2ecb3c51-ed75-4195-84bf-232c6563cfde`
**Cloudflare deployment record:** `2026-08-11T05:25:09.446Z`

## Release decision

The reconciled Phase 0–4 state was approved for production after a fresh dependency install, full release validation, independent reconciliation validation, browser readiness validation, and Cloudflare dry run. The release commit was pushed before deployment. No pull request, merge to `main`, AdSense review request, account change, manual ad unit expansion, or consent change was performed.

## Pre-deploy verification

- Fresh `npm ci`: 344 packages audited, zero vulnerabilities.
- `npm run validate:release`: PASS.
- Build: 336 pages.
- Typecheck, governance lint, SEO audit, and content audit: PASS.
- Tests: 7/7 PASS.
- Dependency gate: zero high or critical vulnerabilities.
- Independent reconciliation validator: 29/29 PASS.
- Browser readiness: PASS.
- Cloudflare dry run: 737 assets read, configuration valid.
- Staged diff: 227 intended files, no unstaged residue, no unexpected paths, and no whitespace errors.

## Deployment

`npx wrangler deploy` uploaded 128 new or modified assets and retained 269 existing assets. Cloudflare reported successful asset upload, Worker upload, and trigger deployment. The resulting version is `2ecb3c51-ed75-4195-84bf-232c6563cfde`.

## Full production parity

The post-deploy validator fetched every generated HTML route from the custom production domain and compared rendered text, title, H1, robots directive, and canonical against `dist/` built from the release commit.

- Expected/live routes: 336/336 returned 200.
- Full production/repository parity: 336/336.
- Production indexable pages: 193.
- Production noindex pages: 143.
- Production sitemap URLs: 193.
- Sitemap exact-set match: PASS.
- HTTP apex canonicalization: PASS (`http` and `www` return 301 to `https://echobuddha.com/`).
- `robots.txt`: 200.
- Security headers on the homepage include HSTS, CSP report-only, Permissions-Policy, Referrer-Policy, `nosniff`, and `DENY` framing.
- Deliberately nonexistent route: 404 with empty body, retained as a known Phase 8 edge issue.
- `/ads.txt`: 404, retained as a known Phase 8/owner decision rather than silently invented.

## Production browser QA

Nine representative routes were checked at exact 1440×900 and 390×844 viewports: 18/18 visits passed. Each route had one H1, meaningful rendered content, no horizontal overflow, the expected canonical, and the expected robots state. The deliberately empty 404 was validated by HTTP because the in-app browser blocks an empty response.

## Production Lighthouse

The full live matrix completed 20 audits across ten routes and two form factors. Accessibility was 1.00 on every audit. Desktop performance ranged from 0.98 to 1.00. Mobile performance ranged from 0.59 to 0.85.

The two lowest live mobile routes were repeated three additional times each. Homepage median performance was 0.60 with median LCP 7.250s. The cornerstone article median performance was 0.61 with median LCP 7.242s. This is a material performance follow-up, not discarded as variance.

Rollback is not indicated by this finding: the homepage, cornerstone article, shared layout, and AdSense configuration were unchanged between forensic commit `a1cd457` and release commit `89656e5`; the AdSense configuration hash is identical. Production parity, semantics, accessibility, desktop performance, and content/indexing assertions all pass. Phase 8/9 must investigate live mobile transfer/render and third-party loading, then use field data before any AdSense reapplication decision.

## Final deployment verdict

**PRODUCTION DEPLOYMENT: PASS WITH MATERIAL EXISTING MOBILE PERFORMANCE FOLLOW-UP**

**PRODUCTION / REPOSITORY PARITY: PASS (336/336)**

**PHASE 0–4 RELEASE ROLLBACK REQUIRED: NO**

**ADSENSE REVIEW REQUESTED: NO**

**PHASE 5 REPOSITORY WORK BLOCKED BY THIS DEPLOYMENT: NO**

Evidence is retained in `phase-0-4-production-deployment-record.json`, `phase-0-4-post-deploy-production-summary.json`, `phase-0-4-post-deploy-production-parity.csv`, `phase-0-4-post-deploy-browser-qa.json`, and `phase-0-4-post-deploy-lighthouse.json`.
