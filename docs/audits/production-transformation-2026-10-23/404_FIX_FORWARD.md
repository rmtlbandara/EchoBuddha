# Fix-forward: production error page

Expanded live verification of the main transformation release found a pre-existing production defect: `https://echobuddha.com/missing-audit-url/` returned HTTP 404 with **zero bytes and no Content-Type**, rather than the already-built HTML error page. Both the original baseline and first transformation deployment had this behavior. The old status-only smoke assertion passed, while the full live Chromium accessibility suite correctly failed with `ERR_HTTP_RESPONSE_CODE_FAILURE` on the blank error response.

The fix sets Cloudflare static assets `not_found_handling` to `404-page`, following [Cloudflare's SSG/custom 404 documentation](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/). This serves the existing root `404.html` with real HTTP 404 status; it does not introduce a single-page-app fallback, redirect unknown URLs, or change canonical routes.

The protected configuration change is explicitly approved in the release-change register and pinned in the measurement intervention's reviewed file scope. A new release contract and stronger production smoke assertion require an HTML content type, H1, noindex/follow, and no canonical on the error response. No failing test was deleted or bypassed.

Local Wrangler verification returns HTTP 404, HTML content type, the rendered H1, and noindex. The complete release gate must pass before review and another exact-main deployment. The final deployment record will contain the final SHA/version and production browser result. The initial release is retained honestly in the intervention history:

- Source: `d6a5544d62f054c3d99732440fdda0ed74faf3ce`.
- Deployment: `4cb8eb15-1f15-4554-8fa9-8e0c0e643dc9`.
- Version: `db0c5ba7-45ff-46a2-81f3-a32b074674a5`.
- Time: `2026-10-23T11:28:08.313982Z`.
- Main content, 165 sitemap URLs, 350 exact HTML matches, 61 live images, 349 slash redirects, publisher logo, headers, and IndexNow receipt passed independent checks before this follow-up.
