# Q7 Buddhist Question Production Deployment — 2026-09-28

## Release identity

- Pull request: https://github.com/rmtlbandara/EchoBuddha/pull/47
- Implementation commit: `98781bfb9c6c31d73e5a3a4c2b8024a5550d4a80`
- Merged and deployed SHA: `dcd9ce2fd1fdbea7b62ef337d94026ba632d0b4a`
- PR validation run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36390052168
- Production workflow run: https://github.com/rmtlbandara/EchoBuddha/actions/runs/36390355988
- Production URL: https://echobuddha.com/learn/questions-about-buddhism/when-did-buddha-statues-first-appear/

## Immutable artifact and deployment

The manual production workflow required the full current `origin/main` SHA, reran release validation, created the release artifact once, and verified its manifest before deployment.

- Artifact ID: `10955524178`
- Manifest file count: 802
- Aggregate SHA-256: `82e82db89678fcf510cce5d810c0a28f3a4957d782f298efb57286f532d72adc`
- Cloudflare deployment ID: `5539d314-4e9a-41af-8e3a-8e7f45c32fd8`
- Cloudflare version ID: `326a474b-be1f-4c46-ad4f-f83243f99c53`
- Deployment timestamp: `2026-09-28T07:13:29.596847Z`
- Deployment evidence artifact ID: `10955762345`

## Production verification

Cloudflare deployment completed successfully. The workflow’s immediate smoke probe ran less than one second after the recorded deployment time and received the previous cached `sitemap.xml` and `search-index.json` counts. It therefore reported 12/14 despite the successful artifact deployment.

After edge-cache convergence, the same production smoke command passed 14/14 without another deployment:

- Sitemap: 165/165 URLs, Q7 exactly once.
- Internal search: 330/330 records, Q7 exactly once.
- Q1–Q7: HTTP 200 for every route.
- Q7: one exact H1, self-canonical, indexable, correct publication date, Article plus BreadcrumbList schemas, and no FAQPage.
- Navigation: Q6 → Q7; Q7 → Q6; no future Q7 Next link.
- Discovery: seven hub cards; homepage remains one Q2-only question feature.
- Advertising: zero AdSense runtime scripts and zero manual ad slots.
- Live browser matrix: 24/24 route/viewport combinations passed with zero critical or serious findings.
- Unauthorized Q8+ routes: zero.

## Rollback

The previous last-known-good deployment remains available as the exact rollback target:

- Git SHA: `29deac1469a1b20cfa270a41b40572cdd8cdc3f0`
- Cloudflare deployment ID: `78c0719a-631c-415b-b48a-243abb97bd44`
- Cloudflare version ID: `1d62ac59-b2b3-4073-92a3-9a15aaf8f62d`

No rollback was required.
