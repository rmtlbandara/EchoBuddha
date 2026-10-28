# Echo Buddha Production Rollback Runbook

Rollback is a production-changing emergency operation. Do not use it as a test.

## Choose rollback or fix-forward

Rollback when production is unusable, security/privacy is critically weakened, key routing/headers are broken, or the release creates a severe technical failure. Prefer fix-forward for a typo, routine content correction or other non-critical issue.

## Identify the target

Use the most recent deployment record whose production smoke passed. Confirm its exact Cloudflare version ID and associated Git SHA. Do not assume `main~1` is good.

Current release and incident-specific fallback choices are recorded in
[the October 27 verified deployment](2026-10-27-audit-remediation.md).
For a regression introduced by the latest tooling release, the preceding verified
material version is `b3163338-fcd1-41a4-908c-ac4dbb2eedc7`
(source `c561f61d7b0793a4cf26a481648bad68e19704e0`). A regression in the
material application changes may instead require the older October 23 version.
Confirm the target and current availability before acting.

The latest verified target recorded before October 27 remediation is in
[the October 23 release record](2026-10-23-production-transformation.md):

- Git SHA: `67f486a8d990f0058374301d9ebf6fd74ed85994`
- Cloudflare deployment: `20292ccb-9cd7-42f5-9201-b55f3fa7356c`
- Cloudflare version: `1da4620c-a00b-4a5a-b5a5-97f52933dbda`

Confirm the version remains available in Cloudflare before selecting it. Newer
verified release records take precedence; these IDs are evidence, not a default
rollback command.

Historical Phase 8 target recorded on 2026-08-13:

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
