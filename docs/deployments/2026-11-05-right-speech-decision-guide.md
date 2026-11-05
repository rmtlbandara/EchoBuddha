# Right Speech decision guide deployment

- Deployed: November 5, 2026, 15:14:52 Asia/Colombo (09:44:52 UTC).
- Production SHA: `dff012658c991e84db2320c1c0a9e4a424e4136f`.
- Implementation: https://github.com/rmtlbandara/EchoBuddha/pull/89. Records: https://github.com/rmtlbandara/EchoBuddha/pull/90.
- Merged-main validation: https://github.com/rmtlbandara/EchoBuddha/actions/runs/42004119783 passed.
- Production workflow: https://github.com/rmtlbandara/EchoBuddha/actions/runs/42004694379. Exact-SHA validation, deployment and smoke passed.
- Artifact: 836 files; aggregate SHA-256 `26e15ba41ea9578b526b57f2b48f19789b72acd1618768682e974df898463fbc`.
- Cloudflare deployment: `2f186d7c-82ee-459a-aecb-526cc51e62c5`.
- Cloudflare version: `69188a75-bd48-442c-9c37-bb8a7be84c54`, 100% traffic. Both taken from the workflow's deployment record; the Cloudflare dashboard was not opened.
- Live page: https://echobuddha.com/articles/right-speech-buddhism/#right-speech-decision-guide
- Production smoke: 15/15 passed in the workflow.
- Rollback if needed: previous production SHA `edfe72dd8fbb313f6267d1da9580be3b3e5eb671`, version `49895182-617f-4056-b44c-70bbc84af533`.

Independent live checks, run separately from the workflow: `/release.json` serves the SHA above. At 320, 390, 768 and 1280 px the page returned 200 with no horizontal overflow and six guide cards. Canonical and robots are unchanged, and the sitemap still has 171 URLs. SN 45.8, MN 58 and AN 5.198 are linked, the citation line is present, and the page shows "Updated November 5, 2026". All 40 distinct internal and SuttaCentral links on the page returned 200. The link from Mindful Email and Texting lands on the guide. axe reported no violations for the page at 390 px, with one item for manual review inside the guide (`aria-prohibited-attr`). Automated accessibility is not a claim of complete accessibility. Lighthouse was not run.

IndexNow returned HTTP 200 for 20 changed URLs, because read times on related cards changed; acceptance is not indexing. No rollback was required.
