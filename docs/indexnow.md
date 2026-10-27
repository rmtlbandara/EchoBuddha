# IndexNow operations

The owner requested an IndexNow fix on 2026-10-20. Cloudflare Crawler Hints was
already enabled, but Bing displayed IndexNow onboarding without submission
activity. The implementation adds direct notifications at the release boundary.
It does not change page content, indexability, sitemap membership, consent,
Analytics, advertisements, or search-provider accounts.

## Release behavior

`npm run build` builds Astro and adds two technical assets to the same output
directory (including when `--outDir` is supplied):

- A root text file containing the IndexNow ownership key from
  `scripts/indexnow.mjs`. This publicly served proof is not a Cloudflare,
  Microsoft, Google, or GitHub account credential.
- `/indexnow-manifest.json`, containing only canonical sitemap URLs and their
  built HTML SHA-256 digests. It has no account data or build timestamp.

The exact-SHA deployment workflow verifies its immutable artifact, compares
the new manifest with the previous production manifest, and stores the
notification plan before deployment. A 404 for the previous manifest means a
first-time bootstrap; other errors stop planning. Identical pages are skipped.
Previously sitemap-listed pages that disappear are included as removals so
search engines can discover redirects, noindex changes, or deletion.

After deployment and a successful production smoke gate, the submitter checks
the live key, exact manifest, sitemap membership, and the actual changed routes.
New and updated pages must be canonical, indexable HTTP 200 pages. Removed
pages must return 404/410, a permanent redirect, or an explicit noindex.
Only then does it POST the batch to `https://api.indexnow.org/indexnow`.

After a successful deploy, metadata can briefly propagate at different speeds.
The notifier checks exact manifest equality up to seven times, waiting five
seconds between mismatches (at most 30 seconds of scheduled waiting). These are
read requests, not repeated submissions. A permanently different manifest still
blocks every POST. Invalid manifests, failed route checks and endpoint failures
remain failures; use the saved matching plan for a justified retry.

- HTTP 200: URLs submitted; this does not guarantee crawling or indexing.
- HTTP 202: URLs received; ownership verification is pending.
- Other responses or network errors: workflow fails with saved failure evidence.
  The website has already deployed; an IndexNow failure does not roll it back.

There is no submission during a local build or pull-request validation.
Cloudflare Crawler Hints remains enabled as an independent service.

## Activation and retry

IndexNow is active. The October 27 audit verified the live 165-URL manifest
and Bing's recorded submission events. Each later release compares the actual
old and new manifests; it does not repeat the initial bootstrap. Submission
receipts and engine indexing observations remain separate evidence.

The workflow artifact includes `.artifacts/indexnow/plan.json` and
`.artifacts/indexnow/result.json`. Keep the plan if submission fails or returns
202. Once the issue is resolved, retry that exact saved plan from the matching
release checkout:

```sh
node scripts/indexnow.mjs submit .artifacts/indexnow/plan.json .artifacts/indexnow/retry-result.json
```

The submitter refuses a saved plan when a different production manifest is
live. Do not generate a fresh plan against an already deployed identical
manifest to retry a failed batch: that comparison correctly yields no changes.
Do not submit repeatedly to make dashboard reporting appear sooner.

For a separately authorized local release, prepare the plan **before** deploy:

```sh
node scripts/indexnow.mjs plan .release/dist .artifacts/indexnow/plan.json
```

After deploying that exact artifact and passing `npm run audit:production-smoke`,
run the submit command above. Repeated builds alone never send notifications.

Rollback retains the existing guarded production rollback procedure. Rolling
back to a release before this integration removes its proof and manifest.
IndexNow notifications cannot be recalled; search engines observe the currently
served state. The rollback workflow does not automatically send notifications.
The next normal deployment compares against the then-live manifest or
bootstraps if it is absent.

## Verification

Tests cover sitemap URL boundaries, non-indexable pages, change detection,
first-time bootstrap, production identity, live-route checks, failure
responses, HTTP 202, and workflow ordering. The normal release gate includes
these tests. Bing reporting may lag the endpoint response; retain both the
submission result and subsequent dashboard evidence separately.

References:

- [IndexNow protocol](https://www.indexnow.org/documentation)
- [Cloudflare Crawler Hints](https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/)
