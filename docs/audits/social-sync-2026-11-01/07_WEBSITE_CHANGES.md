# Website change

Owner-authorized November 1, 2026. Canonical root: `/Users/tharindu/Documents/EB 2`. Astro static site; existing Cloudflare Workers exact-main deployment workflow.

Footer order: Pinterest → YouTube → Facebook → Instagram → Medium. Added an inline Instagram SVG using the existing 22px filled-icon convention, inherited color, spacing, 44px target and keyboard focus rules. Corrected Medium to `https://medium.com/@echobuddha`. Canonical brand configuration now supplies both footer and publisher sameAs with Instagram and YouTube; the existing LinkedIn identity remains in schema without an extra footer icon. No new dependency or external script.

Repository search found stale live official-profile references only in brand configuration and associated test expectations. Historical release records retain the original observed URLs. Regression tests check exact ordering, accessible names, exact destinations, and every rendered publisher's complete unique sameAs list. Existing indexing, routes, page content, privacy and advertising behavior are preserved.

Added an append-only authorized measurement intervention with pinned baseline and historical intervention digests. Unrelated untracked `tools/` is preserved. Generated audit rewrites from validation were restored to their pre-task tracked state.

Deployment is separately tracked in 09_PRODUCTION_VERIFICATION.md; a local build is not production evidence.
