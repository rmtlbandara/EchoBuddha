# IndexNow recovery and propagation safeguard

The exact-main release `c561f61d7b0793a4cf26a481648bad68e19704e0`
reached Cloudflare at `2026-10-27T14:37:19.120275Z`. Artifact digest verification,
deployment, capture and all 15 production smoke checks passed in workflow
[40522625427](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40522625427).
The final notification step then stopped before POST because the public manifest
still differed from the saved target on the changed pages. The site did not roll
back. The workflow's red conclusion is retained as failure evidence.

A later direct fetch matched the saved manifest exactly, with the same deployed
source still serving. This temporary mismatch is consistent with asset propagation;
it does not establish a detailed Cloudflare cache-internals root cause. A fresh
15-check smoke run passed. Retrying the **original saved plan** then received HTTP
200 for its seven changed canonical URLs at `2026-10-27T14:41:33.013Z`.
See `INDEXNOW_FIRST_RELEASE_RETRY.json`. No new plan was generated against the
already deployed identical artifact, and no unchanged-URL campaign was submitted.
Receipt success is not indexing proof.

The follow-up makes exact-manifest verification tolerant of a briefly preceding
valid manifest: up to seven reads with five seconds between mismatches, or 30
seconds of scheduled waiting. Exact equality is still mandatory before a POST.
Invalid manifests, bad ownership, wrong canonicals/noindex, invalid removals and
endpoint failures continue to fail. Notifications are not blindly retried.
A persistently different release exhausts the bound with zero POSTs.

Two regression tests use an injected clock to prove transient recovery with one
submission and permanent mismatch with none. All prior IndexNow negative tests
remain. The complete release gate now includes 87 passing tests. This follow-up
changes deployment tooling and evidence; the public application files retain the
approved hashes and all published URLs/index policy remain unchanged.
