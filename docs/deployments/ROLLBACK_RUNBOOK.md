# Echo Buddha Production Rollback Runbook

Rollback is a production-changing emergency operation. Do not use it as a test.

## Choose rollback or fix-forward

Rollback when production is unusable, security/privacy is critically weakened, key routing/headers are broken, or the release creates a severe technical failure. Prefer fix-forward for a typo, routine content correction or other non-critical issue.

## Identify the target

Use the most recent deployment record whose production smoke passed. Confirm its exact Cloudflare version ID and associated Git SHA. Do not assume `main~1` is good.

The Phase 8 last-known-good target recorded on 2026-08-13 is:

- Git implementation SHA: `8de969c74139a68b88849f2404e3dc7c353e6a12`
- Cloudflare deployment: `891ac394-206e-4c9a-ba55-811b397fb6a4`
- Cloudflare version: `fa751ad8-ebeb-45b3-983a-96703733631b`

The earlier Phase 7 fallback is version `23d6d780-5174-43c2-86d1-09fd2e574cce`.

## Execute

Preferred guarded path:

1. Open the `Rollback Production` workflow.
2. Enter the exact verified version UUID.
3. Enter a concise incident reason.
4. Type `ROLLBACK` as confirmation.
5. Approve the `production` environment if protection is configured.
6. Observe the rollback and smoke jobs.

Current Wrangler equivalent, for an explicitly authorized owner operating outside GitHub Actions:

```bash
npx wrangler rollback <VERSION_ID> --name echobuddha --message "<INCIDENT_REASON>" --yes
```

Cloudflare creates a new deployment that routes 100% traffic to the selected prior version. Core Echo Buddha is static and has no database migration rollback. External bindings/resources are not reverted by Worker rollback.

## Verify

Run:

```bash
npm run audit:production-smoke
```

Confirm homepage, robots, sitemap, primary owner, noindex route, Search, 404, HTTPS redirect, consent UI, AdSense verification/no-runtime state, security headers and workers.dev noindex.

If smoke still fails, stop repeated mutations, preserve logs, reassess the target and choose another verified version or a fix-forward release.

## Record

Capture the rollback timestamp, initiating workflow/run, reason, old deployment/version, target version, new deployment ID, smoke result, known residual issues and corrective follow-up. Never record secret values.
