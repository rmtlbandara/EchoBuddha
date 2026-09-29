# Deployment Handoff

This implementation is on `codex/phase-1-resolve-strengthen-protect` and is not deployed.

## Recorded checkpoints

- Repository baseline: `08076a39632748e824a6e82381bf98d8b90c4f25`
- Recorded production content: `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`
- Rollback content checkpoint: `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`

## Reviewed release procedure

1. Review the feature diff and the evidence in this directory.
2. Commit the approved branch, open a pull request, and require the repository validation workflow to pass.
3. Merge the reviewed pull request to `main` and record the exact full lowercase merge SHA.
4. Run `.github/workflows/deploy-production.yml` manually with that exact SHA; do not deploy a moving branch reference.
5. Require the protected `production` environment approval and preserve the serialized `echobuddha-production` concurrency gate.
6. Confirm the workflow's production smoke gate, then manually inspect one route from each of the six clusters at desktop and mobile widths.
7. Record the deployment/version ID and confirm the live sitemap, robots, canonical, search index, consent state, analytics boundary, and AdSense firewall.
8. If verification fails, use `.github/workflows/rollback-production.yml` with the recorded rollback version and explicit confirmation.

Do not claim the Phase 1 changes are live until the exact merged SHA and live checks are recorded.
