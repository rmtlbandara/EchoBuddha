# Dependency review — November 11, 2026

Checked at 09:16 UTC (14:46 Asia/Colombo). Read-only application/dependency assessment; only this report was written. Source HEAD at inspection: `6ed6bfab947a5aab6fe15157705266eca1c728d6`.

**Decision: no verified material dependency blocker for this static-assets release was found. P2 security maintenance remains justified.** This is a reachability assessment of the inspected configuration, not a claim that the installed versions have no known vulnerabilities. Do not merge dependencies merely on the strength of this report; reconcile their current base, review the resulting lockfile and rerun the release gates on the resulting exact SHA.

## Effective versions and evidence

`package-lock.json` and installed package metadata agree on Astro 7.4.2, Wrangler 4.153.0, Vite 8.3.5, esbuild 0.28.2, Sharp 0.35.5, Lighthouse 13.5.0 and Playwright Core 1.61.1. YAML is 2.9.0 at root and 2.9.1 under Astro's internal helpers. Astro's markdown-satteri 0.4.5 brings `@astrojs/prism` 4.1.1.

A fresh `npm audit --json` returned exit 0 and **zero advisories at every severity**. That database result misses relevant vendor-disclosed conditions below. In particular, bundled code is not represented as separate dependency nodes in this lockfile.

Local bundle-header inspection confirmed Wrangler's 15MB `node_modules/wrangler/wrangler-dist/cli.js` contains:

| Bundled package | Effective bundled versions | Vendor maintenance target |
|---|---|---|
| brace-expansion |2.0.1 and5.0.5 |2.1.7 and5.0.12 |
| minimatch |5.1.6 and10.2.5 |Vendor specifically updates5.1.6 to5.1.9; no blanket claim about every embedded branch |
| fast-xml-parser |4.4.1 |4.5.5 |
| shell-quote |1.10.0 |1.11.0 |
| yaml |2.8.1 and 2.9.0 |Affected2.8.1 branch replaced with2.9.0 |

These values came from `.pnpm/<name>@<version>` source-header comments in the installed bundle, not an assumption that root overrides rewrite bundled bytes. Miniflare's installed bundle also identifies brace-expansion 2.0.1 and minimatch 5.1.6. [Cloudflare's 4.158.0 release](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%404.158.0) explicitly documents those bundled fixes and their uses: pathological glob patterns, Pipelines/local R2 XML, custom-build/Pages-development shell commands, and container output. Root YAML 2.9.0 does not repair Wrangler's embedded 2.8.1.

## Advisory applicability

| Verified vendor disclosure | Current-version result and configuration relevance | Decision |
|---|---|---|
| [Astro dynamic-tag attribute injection, GHSA-mh32-jxcr-mh9f](https://github.com/withastro/astro/security/advisories/GHSA-mh32-jxcr-mh9f), low; fixed 7.4.5 |Astro 7.4.2 is within the affected range. Exploitation requires untrusted input to choose an element name. No such path was found in source; content and templates are repository controlled and production is prerendered. |P2 update; no demonstrated current exploit path |
| [Node image endpoint case-variant sibling read, GHSA-r3h5-4585-7x3w](https://github.com/withastro/astro/security/advisories/GHSA-r3h5-4585-7x3w), low; fixed Astro 7.4.7 |Astro 7.4.2 is within the package range, but the advisory requires on-demand rendering with `@astrojs/node`, a case-sensitive host and unusual sibling layout. No Node adapter is installed; this release supplies static assets. |Trigger absent in inspected production model |
| [Unsupported-language Prism code XSS, GHSA-ff38-p3qj-4pmf](https://github.com/withastro/astro/security/advisories/GHSA-ff38-p3qj-4pmf), moderate; fixed Prism 4.1.2 |Installed transitive Prism 4.1.1 is affected. Source contains no Prism/Code imports, Markdoc/MDX/Markdown pages or Prism configuration. Default highlighting is Shiki. No lower-trust code/language rendering input was identified. |P2 maintenance; verify upgraded lock actually resolves Prism before claiming remediation |
| [AVIF optimization RCE, GHSA-26w7-cxv4-gfx2](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2), critical; fixed Astro 7.2.8/Sharp 0.35.4 |Astro 7.4.2 and Sharp 0.35.5 exceed the disclosed fixed versions. |Not a current affected-version finding |
| [Wrangler Pages command injection, GHSA-36p8-mvp6-cv38](https://github.com/cloudflare/workers-sdk/security/advisories/GHSA-36p8-mvp6-cv38), high; fixed 4.59.1 |Wrangler 4.153.0 exceeds the fixed version. Deployment uses `wrangler deploy --assets`, not `pages deploy --commit-hash`. |Not a current affected-version finding |
| [YAML nested-collection stack overflow, GHSA-48c2-rrv3-qjmp](https://github.com/eemeli/yaml/security/advisories/GHSA-48c2-rrv3-qjmp), moderate; affected2.x before 2.8.3 |Root 2.9.0 is outside the range; Wrangler's embedded 2.8.1 is inside it. Vendor associates that embedded use with container details. Repository YAML parsing reads checked-in workflows/Dependabot configuration, not a public upload or request. |P2 bundled maintenance; no demonstrated public parsing endpoint |

YAML 2.9.1 also limits recursive merge aliases and changes quoted-string unfolding. Those are useful maintenance improvements, but this review did not turn them into an unverified new exploit claim. [Maintainer release notes](https://github.com/eemeli/yaml/releases/tag/v2.9.1).

## Why the release decision is bounded

`astro.config.mjs` sets `output: "static"`. `wrangler.jsonc` contains an assets directory and 404 handling, with no Worker `main`, adapter, R2/Pipelines/container binding or custom build command. The inspected `dist` has no server directory or Worker entry. Website visitors therefore do not run Astro, Wrangler, their XML parser or their shell-command parser on this production model.

The production workflow uses `npm ci`, restricts deployment to an exact current-main SHA, verifies the built artifact manifest/digests and runs a fixed `wrangler deploy --assets ./.release/dist --strict` command. Pattern/configuration/content inputs are checked-in project material. No attacker-controlled shell command, XML document, glob or YAML upload was identified on that path. This is an inference from the current repository and vendor-described use sites; it is not an exhaustive call-graph proof of every bundled code path.

Wrangler still runs in a privileged deployment job. A trusted toolchain is security relevant even for a static site, so the bundled disclosures warrant a planned patch release rather than indefinite dismissal. If future work adds on-demand rendering, lower-trust CMS/Markdown authors, custom commands, public development servers, R2/Pipelines/container usage or externally supplied patterns, reassess before enabling that path.

## Open update PRs and next action

[PR 95](https://github.com/rmtlbandara/EchoBuddha/pull/95) proposes Astro 7.4.2→7.4.7. [PR 79](https://github.com/rmtlbandara/EchoBuddha/pull/79) proposes Lighthouse 13.5.0→13.6.0, Playwright Core 1.61.1→1.65.0, Wrangler 4.153.0→4.158.0 and YAML 2.9.0→2.9.1. Both are sensible P2 maintenance candidates; their versions are not installed by this review.

The parent workstream previously observed green hosted checks and `mergeable:false`. A fresh GitHub connector snapshot during this review returned both open/unmerged and `mergeable:true`, with base SHA `a7c7c44b2c81cb047e2d26833eb79632fa264c13`, PR 79 head `434a59cdc03bedf64fe43bb84a7403424d323344` and PR 95 head `3a3e1cff1a33897ccae35cee8af593e7fbccbbfd`. Mergeability is a changing metadata snapshot, not merge authorization or proof these heads include the current readiness edits. This workstream did not independently rerun their hosted checks or resolve their base.

Complete the dependency maintenance separately with current-base reconciliation, exact lockfile inspection and the normal type/build/test/browser/deploy-tool checks. Do not claim every bundled advisory is fixed solely from an npm audit result or the PR title. No dependency edit, install/update, merge, push, deployment or credential inspection occurred here.

Reproducibility hashes: `package.json` SHA256 `80dbb4e2681e8146665513a3fe14818a90f1ee6307fc7273978f23b6b1b1f74d`; lockfile SHA256 `8cbb05c6e3312c73decca99da3f89b640e72086037cb1dd0390d6940a024c4a3`. The review is limited to public advisories and local package/configuration evidence available at the timestamp above; it does not rule out undisclosed vulnerabilities or compromise.
