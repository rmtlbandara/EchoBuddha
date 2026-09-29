# Deployment Record and Future Handoff

Phase 1 was merged through PR #49 and deployed from exact SHA `db1da81b19bc5291829cdafd475645d79c6025f5` on 2026-09-29.

## Recorded checkpoints

- Repository baseline: `08076a39632748e824a6e82381bf98d8b90c4f25`
- Deployed Phase 1 content: `db1da81b19bc5291829cdafd475645d79c6025f5`
- Rollback content checkpoint: `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`

## Deployment identity

- GitHub workflow: `36512611080`
- Cloudflare deployment: `2e0ab350-8d36-46cd-b036-55fc0bbda40a`
- Cloudflare version: `48f232f0-5871-4dd0-b067-d85beb937559`
- Immutable artifact: 802 files; aggregate SHA-256 `28030bbbcad11d9eba2b53955879c9bd5a6b2c070b67078bb302870c6695bc75`
- Production smoke: PASS
- Live changed/template routes: 15/15 exact artifact matches
- Live browser matrix: 18/18 PASS

## Future release procedure

1. Review the feature diff and the evidence in this directory.
2. Commit the approved branch, open a pull request, and require the repository validation workflow to pass.
3. Merge the reviewed pull request to `main` and record the exact full lowercase merge SHA.
4. Run `.github/workflows/deploy-production.yml` manually with that exact SHA; do not deploy a moving branch reference.
5. Require the protected `production` environment approval and preserve the serialized `echobuddha-production` concurrency gate.
6. Confirm the workflow's production smoke gate, then manually inspect one route from each of the six clusters at desktop and mobile widths.
7. Record the deployment/version ID and confirm the live sitemap, robots, canonical, search index, consent state, analytics boundary, and AdSense firewall.
8. If verification fails, use `.github/workflows/rollback-production.yml` with the recorded rollback version and explicit confirmation.

Use the rollback checkpoint above if a material post-release defect is discovered.
