# Publishing source-led Buddhist education

The existing Astro data and shared templates support new articles without a
structural rebuild. Use a scoped branch and read the contributor and SEO/content
governance documents first. This guide prepares the November 1 initiative; it does
not prescribe a publishing quota or promise indexing or advertising approval.

1. State the intended reader, question, topic cluster, owner/support role and
   unique contribution. Review the nearest existing pages before proposing a new
   URL. Prefer improving a page when it already answers the same need.
2. Collect direct text references and reputable scholarship. Check each claim
   against its source, translator and edition. Distinguish early discourses,
   later commentary, traditions, historical evidence and modern application.
   Preserve Pāli/Sanskrit spellings. A related keyword is not source support.
3. Write an original explanation, example or source comparison. Label original
   fiction, paraphrases and practical adaptations honestly. Do not invent Buddha
   quotations, expertise, named reviewers, personal experience or endorsements.
4. Add the article to `src/data/site.ts` using an existing source-led article such
   as `right-speech-buddhism` as a structural reference. Match the current article
   type, valid category, tags, related links, source references and editorial
   record. Keep the organizational byline and appropriate safety boundaries.
5. Use the true first-publication date only when publication is established;
   never infer it from a Git import. Record real substantial changes separately.
   Learning pages support `modifiedDate` with matching visible and schema dates;
   leave unknown original dates absent. Check dates again at actual publication.
6. Use an appropriate existing image or an authorized new asset. Retain source or
   generation records and applicable rights evidence. Give meaningful images
   accurate alt text and dimensions; keep decorative alternatives empty. Use the
   article variant tooling and share-image conventions already in the repository.
7. Complete `governance/indexable-page-approvals.json` for a new intended search
   page. Include every required reader, owner, source, safety, monetization and
   independent-value field. Review protected changes through
   `governance/release-change-approvals.json` and record a measurement intervention
   when required. A new URL is never approved merely by building it.
8. Link the page from its relevant hub/category and useful contextual pages.
   Check self-canonical, title, description, H1, article metadata, source links,
   social image and accurate JSON-LD in the built HTML. Confirm sitemap membership
   and index policy. Keep quote stories, reflection details and search excluded.
9. Run `npm ci`, `npm run validate:release` and
   `npm run audit:governance:changes`; run relevant browser and Lighthouse checks.
   Review keyboard use, 320px reflow, enlarged text, source readability and safety.
   Inspect the final diff and resolve all failed mandatory checks.
10. Open the PR and verify actual hosted jobs on its final head. Merge only after
    validation, then verify the resulting exact-main CI. Use the authorized
    Deploy Production workflow with that full SHA. Verify artifact digests,
    Cloudflare identity, live `/release.json`, smoke and the actual new page.
    IndexNow compares the prior manifest and notifies only after smoke passes.

The publishing contract test uses an existing real source-led article to check
the built canonical, attribution, verified original date, sources, sitemap,
search record and IndexNow artifact. No fictitious article is published for QA.
Search crawl/index selection, real reader engagement and AdSense decisions need
their own dated observations. Keep advertising runtime disabled until a separate
activation decision satisfies its own policy and consent requirements.
