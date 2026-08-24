# EchoBuddha Quote Publishing Governance

## Quote creation

A quote may exist in the dataset, hub, categories, tools, cards, and sharing experiences without becoming standalone Search inventory. Every quote must have one stable identity, one canonical permalink, and an explicit origin classification.

## Default index state

New quote permalinks default to `noindex, follow`. Source code fails closed through `DEFAULT_QUOTE_SEARCH_INDEX_STATUS = "noindex"`. A quote becomes indexable only with `searchIndexStatus: "index"` and a complete `indexApproval`.

## Standalone story approval

Approval must state the reviewed-by responsibility, review date, independent purpose, original editorial value, differentiation, and why the curated category is insufficient. Missing evidence makes the build fail rather than silently indexing the page.

## Human review

A human editorial review is required before standalone Search publication. It must cover originality, clarity, Buddhist accuracy where relevant, usefulness, attribution, duplication, and tone. Do not invent named reviewers.

## Attribution

Classify each quote as ECHOBUDDHA_ORIGINAL, HISTORICAL_OR_CANONICAL_QUOTATION, ATTRIBUTED_EXTERNAL_QUOTE, PARAPHRASE, EDITORIAL_SUMMARY, or UNKNOWN_ORIGIN. Current records are ECHOBUDDHA_ORIGINAL and must not be presented as Buddha speech, scripture, or a historical saying. Non-original material needs a visible reference and translation/adaptation status.

## Duplication and intent checks

Before adding a quote, check exact normalized text, punctuation variants, near variants, slug collision, existing category membership, and Search-intent overlap. A quote may appear in multiple collections but must not receive multiple duplicate detail URLs.

## Template use

Reusable UI, attribution controls, sharing, and navigation are acceptable. Do not bulk-generate formulaic stories, fictional scenarios, FAQs, or keyword sections to manufacture indexable value.

## Bulk publishing

Bulk automatic indexable quote-story publishing is prohibited. Local build validation must confirm unique identities, the fail-closed index gate, sitemap exclusion for noindex permalinks, and complete approval for any future indexable story.

## Retirement and migration

Keep quote data separate from URL state. Redirect only when a relevant destination replaces the exact user need and useful content has been migrated. Otherwise retain a useful noindex permalink or return a genuine 404/410 when no purpose remains.

## Rollback

Rollback must restore the exact reviewed source commit, rebuild, and rerun quote governance, sitemap, canonical, and release validations. Do not re-index story permalinks as a blanket rollback; any future standalone index state still requires page-specific human approval.
