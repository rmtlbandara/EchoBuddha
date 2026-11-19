# Production verification

Status: DEPLOYED AND VERIFIED LIVE

The Q10–Q12 release was merged through PR [#120](https://github.com/rmtlbandara/EchoBuddha/pull/120) and deployed from the exact current-main SHA `59766461e71a1c3a59917c95194efb40aad50be5`. PR CI run `44434103491` and merged-main CI run `44434709409` passed both deterministic release and isolated browser jobs.

Production workflow `44435296691` rebuilt and validated the exact SHA, created and verified an 865-file immutable manifest (`920fd75e0591d64c3c994bb0a084bf1a0534497a4535a624e2035fc9ff1f60aa`), and deployed it at `2026-11-19T01:15:16.743607Z` (`2026-11-18` Pacific; `2026-11-19` Colombo). Cloudflare deployment `24f6708e-3680-4d89-9cd5-16199ad8ff04` serves version `551184b8-3d03-4f8f-ba99-18a48aa5f840` at 100% traffic.

The production smoke gate passed 15/15 checks on the first release-identity attempt. Live `release.json` reports the exact main SHA and build time `2026-11-19T01:14:14.838Z`. Live inventory is 376 HTML pages, 178 sitemap URLs, 198 noindex pages, and 355 search records. Q10, Q11, and Q12 each return 200, are self-canonical/indexable, appear in the hub, sitemap, and local search, and render inline emphasis without escaped HTML. Homepage Q2 curation and the absent Q10 homepage promotion remain preserved; the AdSense runtime remains absent.

The live question browser matrix passed all 52 route/viewport combinations at 320, 390, 768, and 1440 pixels with zero critical or serious accessibility violations. IndexNow accepted five changed URLs with HTTP 200: three additions (Q10–Q12) and two updates (the question hub and Q9). This records submission acceptance only and is not an indexing guarantee.

Rollback target: prior verified production SHA `27dd09aa0abd7be3df46b8444f626c06952c194a`, Cloudflare deployment `591fafff-cd21-4bec-b5e2-effb29fe1852`, version `6b111083-65c1-4099-bcc7-219d5957c2db`.

The complete machine-readable receipt is `docs/deployments/receipts/2026-11-18-buddhist-questions-q10-q12.json`.
