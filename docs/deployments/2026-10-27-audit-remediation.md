# October 27 audit remediation — verified production deployment

Finalized October 28, 2026 (Asia/Colombo). The final production rollout completed October 27, 2026 at 15:04:53 UTC / 20:34:53 Asia/Colombo.

- Source: `fb9a8111faa90b87e9dd09bd3312bb6ab13d1adf` (PR #66; underlying application remediation PR #64).
- Exact-main CI: [40526028874](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40526028874), both required jobs passed.
- Deployment: [40527136325](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40527136325), all jobs and notification step passed.
- Worker / hostname: `echobuddha` / `https://echobuddha.com`.
- Cloudflare deployment: `e5eef37a-4110-48d3-824e-59cae022ea4f`.
- Cloudflare version: `ef010bf6-22aa-419b-b1d7-026bef8afdef` at 100%.
- Artifact: 812 verified file digests; aggregate SHA-256 `cd1797ecab289589d351c483272bb85779a8f8db3450b91d5a6a90693a1a805a`.
- Independent production smoke: 15/15. Final live HTML: 350/350 exact artifact matches. Referenced resources: 340/340 after one documented timeout retry; their final artifact hashes are unchanged.
- Production Tools/search: Chromium, Firefox, WebKit all passed. IndexNow: `NO_CHANGES`, zero submitted for this tooling-only rollout.

The first material rollout (PR #64) deployed source `c561f61d7b0793a4cf26a481648bad68e19704e0`, deployment `7d2ff574-9f5c-4760-af26-e280fc488292`, version `b3163338-fcd1-41a4-908c-ac4dbb2eedc7`, at 14:37:19 UTC. An exact saved-plan notification retry after fresh smoke returned HTTP 200 for seven changed canonical URLs. Its initial notification-step failure is preserved in the evidence; the site did not roll back. The final rollout adds bounded manifest verification reads and has identical public files except release.json.

For an incident affecting the latest tooling rollout, the first material version is the immediately preceding verified version. For an incident caused by the material application changes, consider the [October 23 version](2026-10-23-production-transformation.md), `1da4620c-a00b-4a5a-b5a5-97f52933dbda`, associated with source `67f486a8d990f0058374301d9ebf6fd74ed85994`. Confirm current version availability and choose a target appropriate to the incident before using the guarded rollback workflow. No test rollback was performed.

Full report and machine-readable receipts:

- [Final report](../audits/october-remediation-2026-10-27/FINAL_REPORT.md)
- [Final release verification](../audits/october-remediation-2026-10-27/RELEASE_VERIFICATION.json)
- [Initial release and notification recovery](../audits/october-remediation-2026-10-27/FIRST_RELEASE_VERIFICATION.json)
- [Read-only search measurement run](../audits/october-remediation-2026-10-27/MEASUREMENT_RUN.json)

Later documentation-only evidence merges do not represent another deployed application. The exact serving SHA above remains the production identity until another explicitly verified release.
