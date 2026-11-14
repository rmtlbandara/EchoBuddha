# November editorial manuscript production release

## Owner authorization

On November 14, 2026, the owner instructed: “Deploy everything to production/live correctly. I grant my approval.” This supersedes the earlier candidate-only deployment boundary for the completed Echo Buddha editorial release. It authorizes the normal reviewed merge, exact-current-main workflow deployment, live verification and durable release receipt. It does not activate advertising or authorize unrelated account changes.

The previously reviewed candidate is PR #106, source `9b0bf0338aef7b4ff54df0eb94d777c1f6b1a375`; its release and browser CI both succeeded. The owner approval is recorded as responsible publisher approval. No independent qualified Buddhist reviewer or second human reviewer is invented.

## Necessary release preparation

Preflight found that `scripts/production-smoke-check.mjs` still computed the search count without the twelve approved noindex quote/reflection additions. The candidate correctly produces 352 local-search records and 175 sitemap URLs. The smoke calculation is corrected before deployment, and now also requires every approved user permalink in search and none in the sitemap. The fifteen smoke gates remain. Three executable fixtures verify a healthy release, an equal-count missing permalink, and an equal-count sitemap leak.

This preparation changes deployment verification, its tests and its approval record; it does not change the approved website content or protected library bodies. The final source must still pass exact-head PR CI, merge through the normal process, pass resulting main CI and equal current origin/main before the guarded production workflow is dispatched.

## Previous verified production

- Git SHA: `bb44ff95fbba3e312a2a76b6f49a65a35cd2c551`.
- Cloudflare deployment: `2be04185-5869-4457-97bf-9d69c7fb0a73`.
- Cloudflare version: `672b2829-0760-4d5f-b715-0c6b163e867e`.
- Existing immutable artifact and smoke evidence: `receipts/2026-11-11-final-readiness.json`.

The actual new source SHA, workflow, artifact digests, Cloudflare identities, live acceptance, IndexNow result and observation-window dates will be appended in the release receipt after successful verification. These values are not guessed before deployment. Earlier candidate reports remain historical evidence of their preparation stage.
