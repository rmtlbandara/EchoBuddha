# Phase 8 production smoke-test plan

Run only after explicit deployment authorization.

1. Record deployed git SHA, Cloudflare deployment ID/version and timestamp.
2. Verify HTTP→HTTPS and www→canonical single-hop redirects with representative paths.
3. Verify 200/404 behavior, canonical, robots meta and structured data on home, Start Here, article, Learn, meditation, quote, daily reflection, Search, trust, privacy and missing routes.
4. Fetch `robots.txt`, `sitemap.xml`, `ads.txt` and `search-index.json`; validate body, content type, cache headers and sitemap counts.
5. Confirm every indexable sample has the correct AdSense account meta; confirm zero AdSense runtime requests and zero manual slots.
6. In a fresh browser context confirm the consent panel is visible, localStorage has no inferred choice, all content works, and no Google request/cookie occurs.
7. Test Reject, reload persistence, reopen settings, Accept, then withdrawal on desktop and mobile with keyboard.
8. Confirm enforced CSP and all security headers on HTML; inspect console for CSP violations.
9. Confirm `/_astro/*` uses one-year immutable caching; machine files use one-hour revalidation; HTML remains fresh.
10. Confirm the exact workers.dev hostname sends `X-Robots-Tag: noindex, nofollow`.
11. Re-run accessibility, Phase 8 custom validation and representative Lighthouse. Compare against local Phase 8 evidence.
12. Re-run full production/repository route/indexability parity and record any dashboard-only rule conflict.

If consent, crawl, canonical, indexability, security or navigation fails, stop and use the area-specific rollback map. Do not re-enable the legacy inferred-consent behavior or AdSense runtime as a generic rollback.
