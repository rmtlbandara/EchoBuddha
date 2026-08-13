# Echo Buddha Retroactive Phase 0 Baseline and Protection

**Operation:** AdSense rejection remediation — retroactive Phase 0
**Captured/reconciled:** 2026-08-11 (Asia/Colombo)
**Production:** https://echobuddha.com
**Repository:** `rmtlbandara/EchoBuddha`
**Reconciliation branch:** `codex/reconciliation-phase-0-4-stabilization`

## 1. Executive Summary

The missing post-rejection Phase 0 has been reconstructed without pretending it was captured before Phase 1. The committed repository baseline is reproducible with high confidence at `a1cd457345587670133bfc58af1cafd80d038e6e`. The exact reconciliation-start working tree and current production were separately captured.

The forensic build and current production each contain 336 pages, 283 indexable pages, 53 noindex/error pages, and 283 sitemap URLs. The current repository contains the same 336 routes but 193 indexable, 143 noindex, and 193 sitemap URLs after Phase 3. All 336 live pages fully match the forensic build; 125 do not fully match the current working tree because Phases 1–4 have not been deployed.

Historical production deployment records exist, but they do not contain Git SHAs. Therefore: **HISTORICAL PRODUCTION STATE: NOT FULLY RECOVERABLE.** Current live content equivalence to the forensic build is proven; the precise historical deployment SHA is not.

## 2. Why Phase 0 Is Retroactive

The AdSense-remediation programme began with Phase 1 before a freeze/baseline/protection package was created. Earlier `docs/audits/phase-0-baseline-and-protection/` material belongs to a different improvement programme and is supporting history only. This report reconstructs the missing post-rejection Phase 0 after Phases 1–4, while keeping historical reports historical.

## 3. Evidence Integrity Rules

Evidence is classified as primary repository/Git/build evidence, primary live HTTP observation, durable deployment evidence, secondary transcription, generic Google guidance, or unverified. Commit state is not treated as deployment proof. Generic Help Center content is not treated as personalized rejection wording. Uncommitted historical state, account data, credentials, and absent screenshots are not invented.

## 4. Current Repository Baseline

The exact pre-correction snapshot was captured at `2026-08-11T04:26:01.414Z`. It recorded 27 modified tracked files and 125 untracked files, including the uncommitted Phase 1–4 programme. Node was `v22.23.1`, npm `10.9.8`, Astro declared `^7.1.3`, TypeScript `^5.8.3`, and Wrangler `4.118.0`. The initial lockfile SHA-256 was `145b46c8d15326f2c6e2d35f039aff7cc7728550985849b2e76e59f3f78d235f`.

The snapshot is in `phase-0-baseline-manifest.json`, `phase-0-current-repository-baseline.csv`, and `phase-0-current-working-tree.csv`. A leading-space parsing defect in the first Git-status path was corrected without rerunning or altering the snapshot facts.

## 5. Current Git Baseline

At capture, `HEAD` and `origin/main` were both `a1cd457345587670133bfc58af1cafd80d038e6e`, with 0 commits ahead and 0 behind. Phase 1–4 branches all point to this commit; their changes exist only in the working tree. The dedicated reconciliation branch was created before corrections. No reset, history rewrite, force-push, merge, or main-branch work occurred.

## 6. Current CI Baseline

`.github/workflows/validate.yml` runs `npm ci` and `npm run validate:release` on pull requests and pushes to main. The latest remote Validate run for `a1cd457` succeeded on 2026-08-06 ([run 31121616995](https://github.com/rmtlbandara/EchoBuddha/actions/runs/31121616995)). At reconciliation start, the locally current dependency database caused `validate:release` to fail on two high transitive advisories; all other gates passed. A narrow lockfile-only stabilization now resolves `js-yaml` 4.3.1 and `nanoid` 3.3.18, and the high/critical dependency count is zero.

## 7. Current Production Baseline

All 336 known HTML routes returned 200 when captured. HTTP redirects to HTTPS, and `www` redirects to the apex host. `robots.txt` and `sitemap.xml` return 200. A nonexistent URL returns a correct 404 status but an empty body. `/ads.txt` returns 404. Production has 283 indexable and 53 noindex pages and 56 AdSense-script routes using the public publisher ID `ca-pub-3911157640549350`.

## 8. Reconstructed Pre-Phase-1 Repository Baseline

`a1cd457` is the last trustworthy committed state before post-rejection Phase 1. Reflog timestamps show Phase 1 branch creation on 2026-08-11 from this commit, followed by Phase 2–4 branch checkouts without commits. Phase 1 artifact timestamps and all branch refs agree. An isolated worktree successfully installed, built, typechecked, linted, tested, and passed SEO/content checks: 336 HTML pages, 283 indexable, 53 noindex/error, and 283 sitemap URLs.

Confidence is high for the committed state. Any uncommitted working tree immediately before Phase 1 is not fully recoverable.

## 9. Historical Production Evidence

Wrangler lists ten Cloudflare deployments from 2026-08-05 through `2026-08-06T16:58:18.853Z`; the latest version ID is `36a554c8-d7c0-41cc-ae37-72db597e4de1`. The records contain no commit SHA, tag, or message. GitHub’s deployments API returns no deployment records. The latest Cloudflare timestamp closely follows the successful CI run, but timing is not used as proof of SHA.

Current production fully matches the forensic build on all 336 pages. This is high-confidence content equivalence, not a durable historical SHA mapping. **HISTORICAL PRODUCTION STATE: NOT FULLY RECOVERABLE / PARTIALLY RECONSTRUCTED.**

## 10. AdSense Rejection Evidence

The Phase 1 report retains owner-supplied wording as a secondary transcription. No screenshot, account export, Sites-page issue, Policy Center status, or review timestamp was found. Official current Google guidance supports evaluating unique/relevant content, clear navigation, real publisher value, and low/replicated content ([site readiness](https://support.google.com/adsense/answer/7299563?hl=en), [publisher policies](https://support.google.com/publisherpolicies/answer/10502938?hl=en), [low/no-content screens](https://support.google.com/publisherpolicies/answer/11112688?hl=en-GB), [replicated content](https://support.google.com/publisherpolicies/answer/11190248?hl=en)). It does not prove a personalized failure.

## 11. Historical vs Current Route Inventory

Both forensic and current builds contain the same 336 HTML routes. Added routes: 0. Removed routes: 0. Redirected/retired application routes: 0. Route continuity is complete.

## 12. Historical vs Current Indexability

Forensic/current-production state is 283 indexable and 53 noindex. Current repository state is 193 indexable and 143 noindex. The 90 changes are exactly 60 mechanically generated quote stories and 30 daily-reflection details. They remain built, usable, self-canonical, followable, and reversible. Sitemap membership falls by the same 90 URLs.

## 13. Historical vs Current Content Inventory

Rendered text changed on 35 routes between the forensic and current build; 16 are Phase 4 material remediations and the remainder reflect programme source/data changes captured by the normalized build comparison. Titles/H1s/URLs/canonicals remain stable for Phase 4. The master current register is authoritative for per-page state.

## 14. Historical vs Current AdSense State

Forensic build, current repository build, and current production each contain the same route-gated AdSense script on 56 routes with the same publisher ID. No manual ad units, expanded coverage, monetization behavior, or consent behavior was added in Phases 1–4 or reconciliation.

## 15. Historical vs Current Sitemap/Robots State

Historical/current-production sitemap: 283 URLs. Current repository sitemap: 193 URLs. Current repository noindex-in-sitemap: 0. Canonical errors: 0. Production `robots.txt` includes Cloudflare-managed content-signal/AI rules while allowing ordinary Google and `Mediapartners-Google`; blocking `Google-Extended` does not block Google Search or AdSense crawling. Google documents that AdSense uses its own crawler and robots handling ([AdSense crawler](https://support.google.com/adsense/answer/99376?hl=en)).

## 16. Historical vs Current Trust/Safety State

Trust routes and publisher-process controls are preserved. Phase 4 strengthens page-specific source, translation/paraphrase, meditation safety, wellbeing, and relationship boundaries on selected pages. No trust route, safety note, source-study role, or attribution control was removed.

## 17. Protected Project Purpose

Echo Buddha remains a Buddhist-rooted, beginner-friendly, calm, practical, educational, reflective, source-aware publication. It must not be transformed into generic wellness, keyword-variant, mass-produced, or artificial-credential content for AdSense.

## 18. Protected URLs / Topic Owners

All 336 current routes are protected against arbitrary removal or renaming. All 40 Phase 2 primary owners are unique, built, indexable, self-canonical, and in the current sitemap. Seven deferred merge candidates remain protected until explicit line-by-line owner editorial review.

## 19. Protected SEO Infrastructure

Protect Astro static rendering, self-canonicals, sitemap generation, noindex-follow architecture, title/H1 uniqueness controls, structured-data validation, internal-link checks, search-index checks, and canonical host/scheme behavior. Do not disable validation to accommodate later changes.

## 20. Protected Safety Controls

Protect adapt/stop/support language, non-clinical scope, no cure/treatment replacement/guarantee wording, crisis/professional-care compatibility, care-with-boundaries language, and safeguards against coercive forgiveness or unsafe relationship advice.

## 21. Protected Attribution Controls

Protect original Echo Buddha quote labels, verified-quote and popular-saying distinctions, Dhammapada translation/paraphrase caution, source-study boundaries, linked authoritative texts, and the rule against invented Buddha quotations or credentials.

## 22. Protected AdSense/Consent Controls

Protect conservative route-gated script loading and denied consent defaults. Do not enable manual ads, expand script coverage, claim account approval, install ad units, or redesign CMP/privacy behavior in Phase 5. Account verification can use code, ads.txt, or meta methods depending on the AdSense flow ([connect a site](https://support.google.com/adsense/answer/7584263?hl=en)); the account-specific method remains owner-only evidence.

## 23. Current Known Risks

Known risks include production/repository drift pending an authorized deployment, an empty live 404 body, absent `ads.txt`, missing primary account evidence, unknown account/CMP/legal state, unclear named editorial accountability, stale measurement evidence, deployment records without Git traceability, repeated editorial templates requiring Phase 5, and seven owner-review consolidation holds.

## 24. Unrecoverable Historical Evidence

The exact pre-Phase-1 uncommitted working tree, historical production Git SHA, primary AdSense account artifact, account/Policy Center state, duplicate-account status, traffic sources, fresh Search Console data, and certified CMP/legal readiness are not recoverable from this repository. They are explicitly marked unverified rather than inferred.

## 25. Rollback / Recovery Points

The immutable committed recovery point is `a1cd457`. Phase 3 changes have family-level rollback controls; no content was deleted or merged. Phase 4 changes are file-local and URL/index neutral. Reconciliation documentation corrections are removable without altering historical evidence. The lockfile patch can be reverted mechanically, but doing so would restore known high advisories and must not be done without accepted risk and revalidation.

## 26. Phase 1–4 Reconciliation Inputs

Inputs include the isolated forensic build, all Phase 1–4 reports/CSV/JSON/source generators, full current build inventories, the 336-route production capture, CI/deployment history, current official Google guidance, all-16 Phase 4 content review, source API/endpoint checks, browser QA, Lighthouse, and the master page/protection registers.

## 27. Final Phase 0 Verdict

**RETROACTIVE PHASE 0 STATUS: COMPLETE.**
**FORENSIC PRE-PHASE-1 BASELINE: RECONSTRUCTED for committed repository state; uncommitted state not fully recoverable.**
**CURRENT REPOSITORY BASELINE: CAPTURED.**
**CURRENT PRODUCTION BASELINE: CAPTURED.**
**HISTORICAL PRODUCTION STATE: NOT FULLY RECOVERABLE / PARTIALLY RECONSTRUCTED.**

The protected state and evidence boundaries are now explicit enough to govern Phase 5 without falsifying history.
