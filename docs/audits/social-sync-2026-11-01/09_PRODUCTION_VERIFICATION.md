# Production verification

**Website status: PASS_DEPLOYED_VERIFIED. Overall social batch remains PARTIAL_SOCIAL_PUBLISHING.**

- ImplementationPR: https://github.com/rmtlbandara/EchoBuddha/pull/74.
- HostedPR CI: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41268856997 — both required jobs passed.
- Exact merged-mainCI: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41269105656 — both required jobs passed.
- Production workflow: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41269372569 — validation, immutableartifact verification, deploy, metadata capture,smoke andIndexNow passed.
- Serving applicationSHA: `1ed945581f6802046f8d3245e0480f5c58dabc2c`.
- Actual deployment: `2026-11-01T03:30:48.169578Z` /November 1,2026,09:00:48 Asia/Colombo.
- DeploymentID: `2c067402-d43f-4aac-9ae3-6821e4da2be2`.
- VersionID: `911d7db1-fbed-4451-9761-bd4d6da17364`,100% serving.
- Artifact: 812 files; aggregateSHA256 `a25abbab474d4098c38b3462458f3240d8e3a69adc3ad562c9ab18e2d25aedb1`.

Fresh public `/release.json` reports the exact applicationSHA above. All351 HTML responses (including actual404) and two emitted homepage CSS/JS assets match every checked manifest digest. Independently verified production footer order Pinterest → YouTube → Facebook → Instagram → Medium across18 browser/viewport cases. ExactInstagram andMedium URLs and unique consistentpublisher sameAs verified. Existing same-tab`rel=me` behavior preserved; no unnecessaryblank-target security change. ExistingLinkedIn schema identity retained without a footericon.

Previousproduction351metadata heads and allfive route/security/index-policy files compared equal after excluding the intendedsocialsameAs values. Canonicals,robots,sitemap,index states and content did not drift.15/15 production smoke passed. HTTPS routing and404 checked; www returned HTTP301 with Location https://echobuddha.com/, recorded in final evidence. IndexNow accepted165 canonical URL notifications withHTTP200; this is not indexing or ranking evidence.

Current main branch protection was read live: both stable checks required, strict mode, administratorenforcementOn,zero required extra human approvals. Production environment restricts deployment to protectedbranches. No protection bypass or configuration change. Existingprebuild guard blocks legacyCloudflare production builds; current externalCloudflare Git-trigger dashboard was not independently re-opened, so no fresh external-setting certification is claimed.

Optional separate full dist artifact download stalled and was terminated; compact deployment evidence and immutablemanifest were downloaded. Workflow verifies allfiles beforedeploy; independentlive parity proves servedHTML/assets. No claim of a successful separatefull dist download.

Prior verifiedfallback: `c3133c88696639a6e8366365e0944f90fe15619a`,Cloudflareversion`8d61972c-8bb1-480a-8518-1558bf04724b`. No rollback performed. Future documentation-only evidence merges do not change the servingapplication identity above or reset the content-observation window.
