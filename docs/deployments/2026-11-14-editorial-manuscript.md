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

The actual new source SHA, workflow, artifact digests, Cloudflare identities, live acceptance, IndexNow result and observation-window dates are recorded below and in the successful release receipt. Earlier candidate reports remain historical evidence of their preparation stage.

## Verified release acceptance

PR #106 was squash-merged to `036bd282f1b112f7af4f0f3ca82c62e67286ed6a` after final-head release and browser CI passed. Main CI also passed. [Deploy Production run 43568807863](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43568807863) successfully validated the exact source, verified all 862 immutable artifact files, deployed Cloudflare version `4c214678-450d-4d71-a84d-746aab5f378c` at 100% traffic and passed 15/15 production smoke checks. Actual activation was `2026-11-14T06:58:47.323747Z`.

Independent live acceptance verified all 860 public artifact resources: 859 byte-identical and one unchanged Cloudflare-managed robots transformation, whose live and source hashes match the previously verified November 11 record. All 373 HTML responses have the required security headers and no advertising runtime. All 23 protected library main bodies and metadata remain unchanged. The genuine missing-route response is a rendered noindex 404. The live inventory is 372 reader routes, 175 sitemap URLs and 352 local-search records.

All 98 live editorial route/viewport checks passed, including accented page/overlay/glossary search, UTC rollover in three time zones, keyboard operation, disabled-scripting fallback, static topic choices and print behavior. Live Chrome inspection confirmed the new application article and its original diagram. No optional Google request occurred before affirmative analytics consent in the acceptance run. Automated accessibility is not a screen-reader certification.

The separate [production monitor run 43569625793](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43569625793) independently resolved the successful deployment record and reported **VERIFIED_LIVE**, with all fifteen gates passing at `2026-11-14T07:08:11.721Z`.

The workflow submitted 129 changed/added URLs to IndexNow after successful smoke verification, receiving HTTP 200. This is notification acceptance, not guaranteed indexing. Advertising runtime, manual slots and Auto Ads remain disabled. No unrelated account settings were changed.

The actual Pacific deployment day is **2026-11-13**; exclude it. The next complete 28-day descriptive window is **2026-11-14–2026-12-11**, allowing the existing finalization buffer and finalized-data checks. The earlier draft reports remain historical preparation evidence; this release receipt records the actual owner-approved publication.

Durable receipt: [receipts/2026-11-14-editorial-manuscript.json](receipts/2026-11-14-editorial-manuscript.json). Compact public-file, live-browser and smoke evidence is under `evidence/2026-11-14-editorial-manuscript/`. This receipt changes documentation and measurement records only; it requires no second application deployment.
