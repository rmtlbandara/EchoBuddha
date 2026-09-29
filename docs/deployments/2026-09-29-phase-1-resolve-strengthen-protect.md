# Phase 1 Resolve, Strengthen and Protect — Production Deployment — 2026-09-29

## Release identity

- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/49
- Implementation commit: `7f9d509da56ff24d93f6fa69de122931c1d533d6`
- Merged and deployed SHA: `db1da81b19bc5291829cdafd475645d79c6025f5`
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36512414877
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36512611080
- Production URL: https://echobuddha.com

## Immutable artifact and deployment

The manual workflow required the full current `origin/main` SHA, reran release validation, built the artifact once, verified every file digest, and deployed that exact artifact.

- Release artifact ID: `11009286736`
- Deployment evidence artifact ID: `11010306092`
- Manifest file count: 802
- Aggregate SHA-256: `28030bbbcad11d9eba2b53955879c9bd5a6b2c070b67078bb302870c6695bc75`
- Cloudflare deployment ID: `2e0ab350-8d36-46cd-b036-55fc0bbda40a`
- Cloudflare version ID: `48f232f0-5871-4dd0-b067-d85beb937559`
- Rollout: 100 percent
- Cloudflare deployment timestamp: `2026-09-29T02:28:06.494709Z`

## Production verification

- Workflow validation and deployment jobs: PASS.
- Workflow production smoke gate: PASS.
- Independent production smoke: PASS for homepage, consent, AdSense firewall, security headers, robots, sitemap, owner/noindex routes, search index, ads.txt, 404, HTTPS redirect, and preview noindex.
- Sitemap: 165 URLs.
- On-site search: 330 records.
- Fifteen changed/template routes: HTTP 200, correct H1, self-canonical, no FAQPage/HowTo objects, and byte-for-byte equal to the immutable local build.
- Live browser matrix: 18/18 mobile and desktop combinations passed with zero serious/critical axe violations, horizontal overflow, broken images, missing alt attributes, or canonical mismatches.
- AdSense runtime and manual ad slots remain disabled.

## Rollback

The previous last-known-good production content remains available as the rollback target:

- Git SHA: `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`
- Cloudflare deployment ID: `5539d314-4e9a-41af-8e3a-8e7f45c32fd8`
- Cloudflare version ID: `326a474b-be1f-4c46-ad4f-f83243f99c53`

No rollback was required.
