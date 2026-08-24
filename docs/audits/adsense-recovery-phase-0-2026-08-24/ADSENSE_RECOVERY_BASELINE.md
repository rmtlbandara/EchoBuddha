# EchoBuddha AdSense Recovery Baseline

## 1. Executive Summary

Phase status: **PASS**

Baseline captured: `2026-08-24T07:45:55+05:30`

Evidence collection window: 2026-08-24, approximately 07:35–07:48 Asia/Colombo.

Production: `https://echobuddha.com/`

Confirmed recovery context: Google AdSense rejected EchoBuddha for **Low value content**. This is recorded from the owner's supplied Google evidence and recovery context. No different account-specific violation is inferred.

Purpose: freeze risk-increasing publishing and preserve a reproducible, privacy-safe, pre-remediation snapshot. This phase did not evaluate final KEEP/MERGE/NOINDEX/REMOVE dispositions and did not attempt to make the site AdSense-ready.

`ADSENSE_RESUBMISSION_STATUS: BLOCKED`

Reason: `Recovery program incomplete — Low Value Content remediation pending.`

The baseline is established strongly enough to begin Phase 1 inventory and comparison work. Repository HEAD, live production, all built routes, the full sitemap population, current page-family counts, the quote ecosystem, Search Console evidence, AdSense implementation, privacy behavior, automation paths, build gates, and representative visual states are preserved.

No repository secret was copied into this report. Publisher and analytics identifiers are intentionally not reproduced.

## 2. Confirmed Google AdSense State

### CONFIRMED GOOGLE FACT

- Owner-supplied rejection reason: `Low value content`.
- AdSense site review evaluates the entire site for policy compliance.
- Publisher policy prohibits Google-served ads on screens without publisher content or with low-value content, and on replicated content without sufficient added value.
- Publisher inventory must comply with Google Search spam policies.

### OWNER-SUPPLIED CURRENT STATE

- The latest recovery instruction supersedes the repository's older August 14 `Review requested / Getting ready` snapshot: another review has resulted in a Low value content rejection.
- A new August 24 account screenshot was not supplied or opened during this phase. The account UI wording beyond the confirmed reason is therefore **NOT VERIFIED**.

### LOCK

- No review request or resubmission was made.
- No site remove/re-add, second account, timing workaround, Auto Ads change, or ad activation was attempted.

## 3. Evidence Hierarchy

Conflicts are resolved in this order:

1. current official Google documentation;
2. actual owner-supplied EchoBuddha AdSense rejection evidence;
3. current first-party Search Console evidence;
4. current production behavior;
5. current repository implementation;
6. existing EchoBuddha audit documents;
7. previous plans and prompts;
8. assumptions.

Finding labels in this report are:

- `CONFIRMED GOOGLE FACT`;
- `OBSERVED PRODUCTION FACT`;
- `OBSERVED REPOSITORY FACT`;
- `SEARCH CONSOLE EVIDENCE`;
- `HYPOTHESIS / LATER-AUDIT RISK`;
- `NOT VERIFIED`.

## 4. Repository Baseline

### Identity

| Item | Baseline |
|---|---|
| Repository treatment | Private/confidential regardless of host visibility |
| Repository root | Recorded privately in the local workspace; not repeated in public-facing output |
| Branch | `main` |
| HEAD | `83a685bcf942349e632ae043a1327b3ed53549df` |
| HEAD timestamp | `2026-08-21T12:56:34+05:30` |
| HEAD summary | `fix(deploy): make production smoke approval-aware (#16)` |
| Initial working tree | Clean; no staged, unstaged, or untracked files |
| Tags at HEAD | None observed |
| Remote | Private handling required; host configuration recorded locally and not reproduced here |
| Lockfile | `package-lock.json` |
| Lockfile SHA-256 | `b2060758a95c6b9e0b5dd0b96a6ba624679c5236ec93421483a9e5aa8d7d0616` |

The untracked files now present under this Phase 0 directory were created by this execution. They were not part of the initial working tree.

### Runtime and framework

| Item | Baseline |
|---|---|
| Application | Astro static site |
| Package version | `1.0.0` |
| Declared Node | `22.x`; `.node-version` records `22.16.0` |
| Validation Node | `v22.23.1` |
| Declared/validation npm | `10.x` / `10.9.8` |
| Astro | declared `^7.1.3` |
| TypeScript | declared `^5.8.3` |
| Deployment tooling | Wrangler `4.118.0` |
| Output | Static HTML/assets |

### Architecture

Primary content stores:

- `src/data/site.ts`: site identity, quotes, articles, categories, metadata and related content;
- `src/data/learn.ts`: learning sections/pages, dictionary, Sutta/Dhammapada material, and meditation pages;
- `src/data/dailyReflections.ts`: recurring reflection records and related links;
- `src/data/editorialGovernance.ts`: publisher, authorship, source and editorial governance data;
- `src/data/ads.ts`: redacted AdSense configuration, page eligibility rules and runtime flags.

Primary route implementation:

- static and dynamic Astro routes under `src/pages/`;
- metadata and canonical logic in `src/components/SEO.astro` and `src/layouts/Layout.astro`;
- sitemap generation in `src/pages/sitemap.xml.ts`;
- base robots policy in `public/robots.txt`;
- AdSense verification/runtime in `src/components/AdSenseScript.astro`;
- manual slot rendering in `src/components/AdSlot.astro`;
- analytics/privacy behavior in `src/components/ConsentManager.astro`;
- redirects and hostname normalization are primarily edge/deployment behavior rather than an application redirect map.

### Security hygiene

- A focused secret-pattern scan found no private-key, common cloud access-key, OpenAI-style secret-key, or GitHub-token pattern in tracked project content.
- Public service identifiers exist where expected, but are redacted from this report.
- Workflow files reference secret names, not secret values.

## 5. Production Baseline

### Deployment identity

| Item | Baseline |
|---|---|
| Origin | `https://echobuddha.com/` |
| Platform/CDN | Cloudflare Workers Static Assets / Cloudflare edge |
| Deployment activation evidence | 2026-08-21 |
| Recorded deployed Git SHA | `83a685bcf942349e632ae043a1327b3ed53549df` |
| Traffic allocation | Recorded as 100% to the exact-SHA version |
| Build artifact aggregate SHA-256 | `ebd67d4d7cecbea130b88f04ac59df8e3f91e7650b799ed62ac57b45b0864479` |

`PRODUCTION ↔ REPOSITORY PARITY: VERIFIED`

Basis:

- the private deployment record maps production to the exact current HEAD;
- all 194 live sitemap pages were HTTP 200, exact self-canonical, single-H1 and free of accidental `noindex`;
- all 194 live sitemap responses were byte-identical to the fresh exact-HEAD build;
- 335 of 337 total built HTML routes were byte-identical;
- `/daily-reflections/today/` is an expected time-varying build output;
- `/404.html` has edge-specific behavior documented below.

No evidence of unpublished local changes in production was found.

### Host and protocol behavior

- `http://echobuddha.com/` → 301 to canonical HTTPS origin.
- `http://www.echobuddha.com/` → 301 to canonical HTTPS origin.
- `https://www.echobuddha.com/` → 301 to canonical HTTPS origin.
- Unknown test path returned a true HTTP 404.

### Response headers

The homepage exposed Cloudflare serving plus HSTS, enforced Content-Security-Policy, Permissions-Policy, Referrer-Policy, `nosniff`, and clickjacking protection. Edge request identifiers are intentionally omitted.

### Environments

- Production is explicitly configured.
- Cloudflare preview behavior is covered by production smoke and uses `noindex, nofollow`.
- No separately configured staging hostname was found in application configuration.

## 6. Search Console Baseline

Source: private first-party snapshot exported 2026-08-21 and preserved at `source-evidence/gsc-snapshot-2026-08-21.json`.

Source SHA-256: `f33c863cc1065936498d8d52760aa8f597d5204a3ae7eb6307dfad08b4c69328`.

### Performance

| Window | Clicks | Impressions | CTR | Impression-weighted position |
|---|---:|---:|---:|---:|
| 2026-07-22 to 2026-08-18 (latest 28 available days) | 14 | 1,757 | 0.80% | 21.01 |
| 2026-06-23 to 2026-08-18 (57 available days) | 26 | 2,339 | 1.11% | 29.18 |
| 2026-08-12 to 2026-08-18 (latest 7 days) | 2 | 734 | 0.27% | 18.87 |

These are immature, privacy-filtered Search Console aggregates. They do not authorize URL removal, owner changes, or mass metadata work.

### Indexing

Latest available coverage row, 2026-08-17:

- indexed: 294;
- not indexed: 56.

Reported exclusion reasons:

| Reason | Count | Phase 0 interpretation |
|---|---:|---|
| Excluded by `noindex` | 39 | Aggregate evidence; likely intentional population, URL-level reconciliation belongs later |
| Page with redirect | 8 | Requires example-level confirmation; not automatically a defect |
| Not found (404) | 1 | Requires example classification |
| Alternate with proper canonical | 1 | May be normal; requires target evidence |
| Crawled, currently not indexed | 2 | High-priority Phase 1 evidence review, not a site-wide conclusion |
| Discovered, currently not indexed | 5 | Observe and reconcile; no mass action |

The current live sitemap contains 194 URLs after the August 21 addition. The latest preserved GSC sitemap screenshot predates that release and reported 193 pages, so current GSC sitemap processing of the 194th URL is **NOT VERIFIED**.

### Account reports

- Manual Actions: `No issues detected` in owner screenshot dated 2026-08-14.
- Security Issues: `No issues detected` in owner screenshot dated 2026-08-14.
- HTTPS: previously reported clean.
- Field Core Web Vitals: previously reported insufficient usage data, not a failure.

These account report states are dated evidence. They were not re-opened on August 24 and are not represented as a live current check.

## 7. Crawl / Indexation Baseline

### Built and live inventory

| Measure | Count |
|---|---:|
| Built HTML routes | 337 |
| Live 200 routes among built inventory | 336 |
| Edge redirect among built inventory | 1 |
| Intended indexable routes | 194 |
| Intentional noindex/error routes | 143 |
| Sitemap URLs | 194 |
| Unique sitemap URLs | 194 |
| Sitemap URLs returning 200 | 194 |
| Exact live self-canonicals | 194 |
| Sitemap URLs with one H1 | 194 |
| Sitemap URLs with unexpected `noindex` | 0 |
| Duplicate live title groups | 0 |
| Indexable URL byte mismatches against exact HEAD | 0 |

### Sitemap

- URL: `https://echobuddha.com/sitemap.xml`
- Status: 200
- Type: XML URL set
- SHA-256: `35645afd0ee76702af954c6bab2674736f1dd1e4ffa77786ddb3ed7a7fa891b9`
- All URLs use the canonical HTTPS hostname.
- All 194 entries map to built, indexable, self-canonical routes.
- No redirected/noindex sitemap URL was observed.

### Robots

`ROBOTS BASELINE STATUS: understood`

- Production status: 200.
- Production SHA-256: `691c776441f7fcec265a7e28acffe92f3470dcc2ee1a726176bd553ab22290db`.
- Base repository SHA-256: `5b008327987cf7fe7dca610b4f3e76e48bdbc11c765a1c322b99929d9ba22172`.
- Production is edge-augmented with Cloudflare-managed AI/content-signal rules.
- General Google Search crawling remains allowed.
- `Mediapartners-Google` is explicitly allowed.
- Sitemap declaration is correct.

The exact production file is preserved at `source-evidence/production-robots.txt`.

### Canonical and metadata pattern

- Indexable pages use canonical HTTPS URLs matching their route.
- `SEO.astro` emits `noindex, follow` when templates opt out.
- Structured data is template/data-driven; the fresh audit found no invalid JSON-LD or canonical mismatch.
- The exact-HEAD audit recorded 337 unique titles and no duplicate description failure.

### Edge caveat

`/404.html` returns a 307 to `/404`, and `/404` returns 200, while a genuinely unknown URL returns a true 404 with an empty response body. This is an **OBSERVED PRODUCTION FACT** to examine in the later UX/technical audit. It was not changed in Phase 0.

## 8. Content-Family Baseline

| Family | Total built URLs | Indexable | Noindex/error | Primary implementation |
|---|---:|---:|---:|---|
| Homepage | 1 | 1 | 0 | authored Astro route |
| Articles hub | 1 | 1 | 0 | authored/data-driven |
| Article categories | 5 | 5 | 0 | category route from article data |
| Articles | 50 | 50 | 0 | shared dynamic template + structured data |
| Quotes hub | 1 | 1 | 0 | authored/data-driven |
| Quote categories | 10 | 10 | 0 | shared category template |
| Quote story URLs | 153 | 43 | 110 | shared dynamic template from quote records |
| Daily Reflections hub | 1 | 1 | 0 | authored/data-driven |
| Daily Reflection entries | 30 | 0 | 30 | shared dynamic template |
| Today's Reflection | 1 | 0 | 1 | rotating utility route |
| Learn hub | 1 | 1 | 0 | authored/data-driven |
| Buddhism 101 hub + entries | 20 | 20 | 0 | shared section/detail architecture |
| Dictionary hub + entries | 15 | 15 | 0 | shared section/detail architecture |
| Dhammapada hub + entries | 6 | 6 | 0 | shared section/detail architecture |
| Sutta hub + entries | 9 | 9 | 0 | shared section/detail architecture |
| Other core Learn pages | 5 | 5 | 0 | authored routes |
| Meditation hub + entries | 10 | 10 | 0 | shared practice architecture |
| Trust/editorial | 8 | 8 | 0 | authored routes + editorial data |
| Legal | 3 | 3 | 0 | authored routes |

Contact, search, tools, error, Start Here, Mindful Living and Meditation Guide are included in the overall 337/194/143 totals and are recorded in the existing exact URL inventory.

Full machine-readable URL baseline: `docs/audits/echo-buddha-governance-implementation/url-inventory.json`, SHA-256 `062e4919acf6771d8813ba533007cb7aadc3d79728c0e0cab1742173ddb79f06`.

No Phase 0 disposition has been assigned.

## 9. Quote Ecosystem Baseline

### OBSERVED REPOSITORY FACT

- Quote records: 153.
- Quote categories: 10.
- Category URLs: 10.
- Standalone quote URLs built: 153.
- Records with expanded story data: 43.
- Indexable standalone quote/story URLs: 43.
- Noindex standalone quote URLs: 110.
- All 153 quote records use the default `original-echo-buddha-quote` origin classification.
- No record is currently classified as an attributed external quotation.

Architecture:

- quote data and origin labels live in `src/data/site.ts`;
- category and story routes are shared dynamic Astro templates;
- all records receive a URL, but only the curated 43 expanded story records are indexable and included in the sitemap;
- reusable page sections include origin disclosure, quote card, story/reflection content where available, related links and editorial notes;
- manual/runtime ads do not render on quote routes under current configuration.

Search Console already shows clicks/impressions for quote category pages including Letting Go, Patience and Mindfulness. This is preliminary equity evidence, not proof that every quote URL should remain indexable.

`HYPOTHESIS / LATER-AUDIT RISK`: the 43 indexable story pages and their repeated template need page-by-page differentiation and added-value review. Google did not state that quote pages caused the rejection.

## 10. Support / Cluster Architecture Baseline

The repository already encodes primary-owner and support relationships through:

- `master-page-role-register.csv` under the August 2026 intent-ownership audit;
- topic/owner and protection registers in Phase 10/11 evidence;
- related-link arrays in content data;
- editorial governance maps and page-role audit artifacts;
- `governance/indexable-page-approvals.json` for controlled additions.

The historical role register contains 283 URL rows and documents 40 protected primary owners. It predates the newest Sutta-reading guide, which is separately governed as an approved addition. Phase 1 must reconcile this historical register with the exact current 337-route inventory before using it as a current disposition authority.

No owner/support relationship was changed in Phase 0.

## 11. Content Automation Baseline

### Public content generation

- Astro `getStaticPaths` and data registries create public routes from local TypeScript records.
- Articles, quotes, learning pages, meditation pages and reflections are data-driven.
- The sitemap and internal search index are generated from these registries.
- Human review rules exist in governance/audit artifacts, but the static build itself does not prove individual human editorial review.

### Scripts

The repository contains many scripts named `generate-*`, but inspection shows they generate audit reports, validation evidence, registers, DOCX artifacts or release manifests. They are not scheduled public-content publishers.

No active OpenAI/Anthropic content API, CMS publishing API, automatic quote generator, scheduled article publisher, or cron-driven indexable-content expansion path was found.

### Scheduled automation

- monthly extended validation;
- weekly production smoke monitoring;
- weekly dependency maintenance.

Production deployment is manual and exact-SHA gated. No scheduled public-content job required an operational disablement; the documentation freeze is the applicable Phase 0 control.

## 12. AdSense / Ad-Placeholder Baseline

### OBSERVED REPOSITORY FACT

- AdSense ownership configuration is centralized in `src/data/ads.ts`.
- Ownership verification metadata is emitted on the approved verification surface.
- `runtimeScriptEnabled` is false.
- `manualSlotsEnabled` is false.
- Auto Ads are not activated by repository code.
- A manual `AdSlot` component exists with the word `Advertisement`, but its render gate is false.
- Page-family ad eligibility rules already exclude utilities, noindex pages, quote pages, daily reflections, meditation pages, dictionary/source-study pages, trust/legal pages and sensitive articles.
- `ads.txt` is present and live; seller identifiers are intentionally redacted here.

### OBSERVED PRODUCTION FACT

- The fresh release test found no AdSense runtime script and no manual slot on built pages.
- The live screenshots show no visible ad placeholder.
- `ads.txt` returns 200.

No verification code was removed, no ad unit was added, no runtime was enabled, and no review was requested.

## 13. Editorial / Authorship Baseline

Current trust structure includes:

- About;
- Echo Buddha Editorial author page;
- Editorial Policy;
- How Echo Buddha Creates Content;
- Buddhist Sources and Citations;
- Quote Attribution Policy;
- Corrections;
- Contact;
- Meditation Safety.

Content uses the organizational byline `Echo Buddha Editorial` and publisher schema from `editorialGovernance.ts`. Source registers and page-level sources exist across key teaching content.

No invented scholar, monastic, medical reviewer or individual credential was added. Whether the publication should disclose additional real individual contributors is `OWNER INPUT REQUIRED` for a later trust audit.

## 14. Privacy / Consent Baseline

### OBSERVED REPOSITORY AND PRODUCTION FACT

- Google Analytics is optional and consent-gated.
- Missing consent does not imply acceptance.
- Analytics storage remains denied until affirmative acceptance.
- Ad storage, ad user data and ad personalization remain denied.
- Users can accept, reject, decide later, reopen settings and withdraw.
- The privacy policy is linked from the consent UI.
- Mobile consent and navigation states were captured.

No repository mechanism was found that explicitly collects religious beliefs, infers that a visitor is Buddhist, creates religious audience segments, or transmits such a segment to advertising systems.

The account-side Google CMP evidence is dated August 14 and was not re-opened during this phase. It must be rechecked before any controlled future ad activation.

## 15. SEO Equity Evidence

`ADSENSE_RECOVERY_PRELIMINARY_SEO_EQUITY.csv` preserves current page-level click evidence. Click-bearing candidates include:

- homepage;
- Right Speech article;
- Letting Go quote category;
- Dhamma vs Dharma article;
- Patience quote category;
- Three Poisons article;
- Mindfulness quote category;
- Noble Eightfold Path practical guide;
- Metta Sutta daily-life page;
- Daily Reflections hub;
- Sati dictionary entry.

The list is labelled `PRELIMINARY SEO EQUITY EVIDENCE`. It is not a KEEP decision.

Phase 1/3 must also preserve high-impression pages without clicks, backlinks/internal prominence, and improving visibility before any URL change.

## 16. Existing Build / Test Baseline

Validation ran in a clean detached worktree at the exact baseline HEAD so generated timestamps could not alter the real working tree.

| Check | Result |
|---|---|
| Deterministic `npm ci` under Node 22/npm 10 | PASS; 344 packages; 0 vulnerabilities |
| Production build | PASS; 337 pages |
| TypeScript | PASS |
| Governance lint | PASS |
| Tests | PASS; 17/17 |
| SEO audit | PASS with one warning |
| Content audit | PASS |
| Phase 8 validation | PASS; 17/17 |
| Phase 9 validation | PASS; 26/26 |
| Phase 10 validation | PASS; 19/19 |
| Phase 11 validation | PASS; 17/17 |
| Dependency gate | PASS; 0 critical, 0 high |
| Full `validate:release` | PASS |

Non-blocking SEO warning: one indexable page has two detected inbound static links: `/learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/`.

The audit's word-count review flags only Terms of Use and Contact as concise trust/utility pages. Word count alone is not used as a quality disposition.

## 17. High-Priority Risks for Phase 1

These are investigation targets, not confirmed causes or remediation decisions:

1. Reconcile all 337 current routes against the 283-row historical owner/support register and the newer approved addition.
2. Audit the 43 indexable quote story pages for independent purpose, unique value and template differentiation; preserve category pages with observed search signals.
3. Compare overlapping Learn/article clusters such as Beginner Buddhism, Four Noble Truths, Eightfold Path, mindfulness, impermanence, metta, compassion, non-attachment, Right Speech and meditation.
4. Reconcile the 56 latest GSC not-indexed aggregate URLs using example exports/URL Inspection before altering indexation.
5. Protect the 11 click-bearing URLs and high-impression pages before any merge, redirect, title or canonical change.
6. Review the one low-inbound new Sutta guide after Google has had time to recrawl; do not add arbitrary links in Phase 0.
7. Examine the `/404.html` → `/404` → 200 edge behavior and the empty unknown-path 404 experience in the technical/UX phase.
8. Verify current post-rejection AdSense account wording and current GSC Manual Actions/Security/Sitemap states with dated owner evidence.
9. Assess whether organizational authorship is sufficient for each content family without inventing credentials.
10. Inspect indexable legal/trust/navigation surfaces for monetization eligibility later; current runtime is disabled.

## 18. Explicitly Deferred Work

Phase 0 intentionally did not:

- score content quality;
- assign KEEP/MERGE/NOINDEX/REMOVE/REDIRECT decisions;
- rewrite articles, Learn pages, quotes, stories, reflections or trust pages;
- add or remove URLs;
- change slugs, canonicals, robots, sitemap, redirects or structured data;
- alter internal linking or navigation;
- fix the 404 edge caveat;
- add more content, FAQs, author blocks, citations or reviewers;
- enable ads or change AdSense verification;
- submit an AdSense review;
- perform a full competitive gap audit;
- declare the site AdSense-ready.

## 19. Phase 0 Exit Gate

- [x] Current official Google source-of-truth policies reviewed.
- [x] Low Value Content rejection recorded without inventing another diagnosis.
- [x] AdSense resubmission explicitly blocked.
- [x] Content-growth freeze established.
- [x] Private-repository rule documented and followed.
- [x] Exact Git baseline and initially clean working tree recorded.
- [x] Production baseline and exact-HEAD parity verified.
- [x] Sitemap, robots, canonical and index patterns captured.
- [x] Current page-family and quote counts captured.
- [x] Support/cluster architecture baselined.
- [x] Content-generation and scheduled automation paths identified.
- [x] AdSense/runtime/placeholders baselined with identifiers redacted.
- [x] Freshest available Search Console data preserved and summarized.
- [x] Dated Manual Actions and Security Issues evidence recorded accurately.
- [x] Preliminary SEO equity evidence preserved.
- [x] Existing build/test gate rerun successfully.
- [x] Representative desktop/mobile visual evidence preserved.
- [x] No SEO-destructive or content-quality remediation performed.
- [x] No AdSense resubmission performed.
- [x] Phase 1 inputs are ready.

`PHASE 0 STATUS: PASS`

Limitations carried forward:

- latest Google account report screenshots are dated August 14;
- current August 24 AdSense UI wording beyond `Low value content` was not supplied;
- Search Console performance ends August 18 and coverage ends August 17;
- backlink evidence is not independently refreshed;
- production robots includes mutable Cloudflare-managed rules and must be recaptured if edge configuration changes.

## 20. Evidence Appendix

### Phase 0 artifacts

- `ADSENSE_RECOVERY_BASELINE.md` — primary report;
- `ADSENSE_RECOVERY_FREEZE.md` — active governance lock;
- `ADSENSE_RECOVERY_BASELINE_COUNTS.json` — machine-readable counts and fingerprints;
- `ADSENSE_RECOVERY_PRELIMINARY_SEO_EQUITY.csv` — click-bearing preliminary evidence;
- `EVIDENCE_MANIFEST.json` — hashes and evidence locations;
- `source-evidence/gsc-snapshot-2026-08-21.json` — private first-party GSC snapshot;
- `source-evidence/production-robots.txt` — exact production robots capture;
- `screenshots/` — 13 private production screenshots.

### Current official Google sources reviewed

- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)
- [Spam policies for Google web search — Publisher Policies](https://support.google.com/publisherpolicies/answer/11035931?hl=en)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Search Console Manual Actions report](https://support.google.com/webmasters/answer/9044175?hl=en)
- [Make sure your site's pages are ready for AdSense](https://support.google.com/adsense/answer/7299563?hl=en)
- [Connect your site to AdSense](https://support.google.com/adsense/answer/7584263?hl=en)
- [About the AdSense ads crawler](https://support.google.com/adsense/answer/99376?hl=en)

Meaningful documentation discrepancy: the phase brief's AdSense URLs ending in `10015918` and `12176698` returned HTTP 404 on 2026-08-24. The current live official pages above were used instead. The current connection documentation states that Google reviews the entire site, and current crawler documentation identifies `Mediapartners-Google` plus the site-verification crawler behavior.

### Reproducibility methods

Read-only or isolated checks included:

- Git identity/status/log/tag/remotes inspection with sanitized reporting;
- file and route discovery using `rg`/`find`;
- exact-HEAD detached worktree;
- Node 22/npm 10 deterministic install and `npm run validate:release`;
- source-data import for quote/article/category counts;
- exact sitemap parsing and five-worker, rate-limited production fetch;
- SHA-256 comparison of every sitemap response against exact-HEAD build output;
- full 337-route production status/index/canonical/title parity crawl;
- protocol/hostname/404/headers checks;
- current official Google documentation verification;
- private desktop and mobile screenshot capture.

### Evidence taxonomy examples

- `Low value content` — CONFIRMED GOOGLE FACT from owner-supplied rejection context.
- 153 quote records / 43 indexable story URLs — OBSERVED REPOSITORY FACT.
- 194 live self-canonical sitemap pages — OBSERVED PRODUCTION FACT.
- 14 clicks / 1,757 impressions in the latest 28 available days — SEARCH CONSOLE EVIDENCE.
- quote-story similarity may affect perceived inventory value — HYPOTHESIS / LATER-AUDIT RISK.
- current August 24 Manual Actions/Security UI — NOT VERIFIED; latest dated evidence is August 14.

## Final Confirmation

No content pages were deleted, merged, redirected, rewritten, noindexed, or otherwise remediated during Phase 0.

No AdSense review or resubmission was requested.
