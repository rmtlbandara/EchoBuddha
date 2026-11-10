# Release verification

**Production blocked pending owner review and separate release authorization.** Candidate and serving baseline evidence are recorded separately.

| Stage | Evidence |
|---|---|
| Main base at preparation | `8aaf3911f90e6bb037f96c15c3b914a0155460d9` |
| Initial candidate | `0ddb10c155bf93eb453cf34e79446a006a3e8475`, containing the initial November audit, responsive homepage, Daily Life Mindfulness and legacy Terms corrections. |
| Editorial and disclosure candidate | `ec0a4f42d96a8da142b07ac336f92046e22a5990`, containing editorial, source, safety, disclosure and test changes. The evidence-only commit follows. |
| Candidate branch and hosted check | `codex/adsense-review-2026-11-10`. [Draft PR #100](https://github.com/rmtlbandara/EchoBuddha/pull/100) links the current head and exact hosted jobs in [Checks](https://github.com/rmtlbandara/EchoBuddha/pull/100/checks). |
| Local checks | Node 22.23.4. Deterministic release validation 98/98. Consent/accessibility, tools in Chromium, Firefox and WebKit, Chromium guides, and Q&A checks passed. Lighthouse completed 20 local runs. See [technical validation](TECHNICAL_VALIDATION.md). |
| Serving SHA at preflight | `dff012658c991e84db2320c1c0a9e4a424e4136f`, as served by `/release.json`. |
| Serving Cloudflare version | `69188a75-bd48-442c-9c37-bb8a7be84c54`, ready at 100% traffic. Deployment ID `2f186d7c-82ee-459a-aecb-526cc51e62c5`. |
| Historical deployment | November 5 at 15:14 Sri Lanka time. [Production workflow 42004694379](https://github.com/rmtlbandara/EchoBuddha/actions/runs/42004694379) · [Deployment record](../../deployments/2026-11-05-right-speech-decision-guide.md) |
| Current production smoke | 15/15 passed with the expected serving SHA. Public redirects, headers, publisher identity, ads.txt, sitemap and inactive runtime were checked. |
| Candidate production acceptance | Pending. Neither candidate deployment nor subsequent crawl notification occurred during this preflight. |

Once the owner reviews the pull request and separately authorizes release, use the repository's exact-SHA workflow for current main. Record the merged commit, artifact digest, workflow run and Cloudflare version. Verify the public SHA before comparing revised HTML, source links, terms redirects, canonical and schema markup, consent behavior, homepage tablet geometry, mobile navigation, trust/contact journeys, noindex pages, headers, publisher tag and inactive ad runtime. Run production smoke and retain the post-deploy IndexNow response. If acceptance fails, use the governed decision process for fix-forward or rollback to the recorded known-good Worker. [Release governance](../../../ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE.md) · [Rollback runbook](../../deployments/ROLLBACK_RUNBOOK.md)
