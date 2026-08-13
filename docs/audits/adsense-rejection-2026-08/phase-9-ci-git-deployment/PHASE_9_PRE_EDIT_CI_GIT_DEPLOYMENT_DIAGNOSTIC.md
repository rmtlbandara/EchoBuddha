# Echo Buddha - Phase 9 Pre-Edit CI, Git and Deployment Diagnostic

Diagnostic date: 2026-08-13 (Asia/Colombo)

Phase 9 branch: `codex/phase-9-ci-git-deployment`

Starting HEAD: `e01071b114cd3615840dfa630f5ee03c1348a570`

## 1. Repository Baseline

The repository is a private, single-owner GitHub repository at `rmtlbandara/EchoBuddha`. It is an Astro 7 static site deployed as Cloudflare Workers Static Assets. The repository has one npm lockfile, no Git LFS configuration, no database, and one pre-Phase-9 workflow. The Git object database is approximately 144 MiB, mostly loose historical audit objects; no cleanup is performed in Phase 9.

## 2. Git Branch State

The clean starting branch was `codex/phase-8-technical-adsense-privacy` at `e01071b114cd3615840dfa630f5ee03c1348a570`. `origin/main` was `a1cd457345587670133bfc58af1cafd80d038e6e`; the Phase 8 state was 11 commits ahead and zero behind. Phase 9 moved to the dedicated local branch `codex/phase-9-ci-git-deployment`. No tag exists, no force-push or history rewrite is planned, and production is not changed by this task.

## 3. Current Main Protection State

GitHub API inspection returned no branch protection or ruleset. GitHub reported that this private repository must be made public or upgraded to GitHub Pro to use those controls. All three merge strategies are enabled, branch auto-deletion is disabled, and administrator bypass policy is therefore not governed by a ruleset.

## 4. Current Workflow Inventory

Only `.github/workflows/validate.yml` exists. It contains one `validate` job using mutable `actions/checkout@v4` and `actions/setup-node@v4` references. No deployment, rollback, production smoke, extended browser or Lighthouse workflow exists.

## 5. Current CI Triggers

The validation workflow runs for every pull request and for pushes to `main`. It has no concurrency cancellation, timeout, manual full-validation trigger or scheduled production check.

## 6. Current Required Checks

The workflow's single job runs `npm ci` and `npm run validate:release`. GitHub required-status-check enforcement is unavailable under the current private-repository plan and is not configured.

## 7. Current Release Validation

`validate:release` runs build, typecheck, governance lint, seven tests, SEO audit, content audit and dependency audit. Phase 8's dedicated 17-check validator and stable browser consent/accessibility checks are not part of the required CI command. The governance lint contains stale explanatory assumptions from before Phase 8 even though current tests catch the final behavior.

## 8. Current Deployment Workflow

There is no repository-controlled deployment workflow. Production deployments have been performed locally after explicit owner approval with `npx wrangler deploy`.

## 9. Current Cloudflare Deployment Path

`wrangler.jsonc` names the `echobuddha` Worker and points Static Assets at `./dist`. The current live Phase 8 deployment is `891ac394-206e-4c9a-ba55-811b397fb6a4`, version `fa751ad8-ebeb-45b3-983a-96703733631b`, produced from implementation commit `8de969c74139a68b88849f2404e3dc7c353e6a12`. Phase 7 version `23d6d780-5174-43c2-86d1-09fd2e574cce` is the recorded last-known-good rollback target.

## 10. Current Secret/Permission Model

Repository Actions default `GITHUB_TOKEN` permission is read-only and Actions cannot approve pull requests. The validation workflow does not declare explicit permissions. Actions are allowed from all publishers and immutable SHA pinning is not required. No repository Actions secrets, variables or GitHub environments are configured. Local Wrangler authentication exists outside the repository; its values are not inspected or recorded.

## 11. Current Dependency Governance

`npm ci` and `package-lock.json` provide deterministic installation. `.node-version` specifies Node 22.16.0, but `package.json` has no `engines` or `packageManager` declaration. There is no Dependabot configuration. GitHub's automated security fixes endpoint is enabled, while vulnerability-alert and private-vulnerability-reporting states were not verifiable from the available API response.

## 12. Current Action Supply-Chain Risk

Both current official Actions use mutable major tags. They are legitimate official Actions, but the repository neither pins them to immutable commits nor restricts allowed action publishers. There are no third-party workflow actions and no `pull_request_target` workflow.

## 13. Current PR Process

Prior phases used dedicated branches and draft pull requests, but there is no pull-request template, content/new-page review gate, technical checklist or documented solo-maintainer emergency path.

## 14. Current Content Governance Enforcement

The existing content audit and tests enforce many objective current-state rules. No change-aware new-indexable-page approval register exists, and subjective overlap/template signals are not formally distinguished from blockers.

## 15. Current SEO Governance Enforcement

The build and SEO audit protect broken links, sitemap/indexability, canonicals, structured data and route integrity. No durable release baseline surfaces removals or index/canonical changes as an explicit reviewed changeset.

## 16. Current Trust/Safety Enforcement

Phase 6 data, source, attribution and safety controls remain in source and historical validators. The required trust routes and centralized organizational identity are not yet encoded in the current release gate as Phase 9-specific invariants.

## 17. Current UX/Accessibility Enforcement

Phase 7 navigation and journey protections exist in source and historical evidence. Automated accessibility and critical mobile/consent browser checks are available locally but do not execute in the existing GitHub workflow.

## 18. Current AdSense/Privacy Enforcement

Phase 8 tests block runtime AdSense and manual slots in the current build, verify the exact publisher identity, and require affirmative Analytics opt-in. The Phase 8 custom validator and browser network scenarios are not part of the existing hosted gate.

## 19. Current Release Traceability

Historical production reports identify release SHAs, but there is no reusable release manifest or workflow-enforced rule requiring production to use the exact current `main` SHA.

## 20. Current Deployment Traceability

Cloudflare records deployment/version IDs, but repository CI does not capture SHA, workflow run, artifact digest, deployment result or smoke evidence together.

## 21. Current Rollback Capability

Phase reports record prior deployment/version IDs. No durable general runbook or guarded rollback workflow exists. Cloudflare's current `wrangler rollback <version-id>` behavior is available but must not be exercised during repository-only Phase 9 work.

## 22. Current Production Smoke Testing

Phase 8 includes a comprehensive one-off production parity script and evidence. There is no reusable concise smoke command or post-deploy workflow gate.

## 23. Current Audit Artifact Handling

Historical reports and compact CSV/JSON evidence are committed. Large screenshots are partly ignored, but there is no general policy for `.artifacts`, CI browser output, Lighthouse output or deployment manifests.

## 24. Current Documentation Consistency

README deployment instructions are manual and its Privacy/Analytics and AdSense sections describe the pre-Phase-8 default-acceptance/runtime state. The permanent SEO governance document is valuable but still contains historical baseline facts. A current delivery-governance source of truth is absent.

## 25. Current Owner/External Settings Dependencies

Branch/ruleset protection, required checks, production environment protection, Actions action-policy restrictions, secret provisioning, Cloudflare token scope, security alerts and account-level preview/AdSense controls require owner or platform settings. Repository files cannot truthfully mark them configured.

## 26. P0/P1/P2/P3 Risks

- P0: none observed. Production is currently healthy and traceable through the Phase 8 report.
- P1: deployment can be performed from an arbitrary local working tree; no repository deployment gate, concurrency guard or automatic smoke failure exists.
- P1: Phase 8 consent/AdSense browser and custom protections are not hosted CI gates.
- P1: no change-aware release baseline guards silent URL/index/canonical ownership drift.
- P2: mutable Action tags, no explicit workflow permissions, no timeouts and no CI artifact policy.
- P2: no PR template, Dependabot policy, deployment record template or rollback runbook.
- P3: runtime declarations and repository hygiene documentation are incomplete.

## 27. Phase 9 Implementation Queue

Implement immutable-action, least-privilege validation; deterministic release and browser gates; change-aware objective governance with human-review warnings; a manual exact-main-SHA build-once deployment workflow; guarded production concurrency; post-deploy smoke evidence; a manual exact-version rollback workflow; dependency automation; PR/contributor/release documentation; external-setting owner actions; and complete Phase 9/Phase 10 registers.

## 28. Protected State

All 336 HTML routes, the 193-URL sitemap, 315-item Search index, Phase 2 owners, Phase 3 index states, Phase 4 content, Phase 5 differentiation, Phase 6 identity/source/safety, Phase 7 navigation/journeys, and Phase 8 opt-in/no-ad-runtime/security/cache behavior are frozen. Phase 9 may add governance only; it must not change content, URLs, index state, consent policy, AdSense delivery or production.
