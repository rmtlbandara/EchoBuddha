# EchoBuddha Phase 3 New GSC Evidence Reconciliation

Generated: 2026-08-24T04:52:02.774Z

## Workbook ingestion

- 18 current first-party XLSX exports were hashed and parsed across 53 sheets.
- Standard Web performance: 2026-06-23–2026-08-21; 341 query rows; 183 page rows; property chart 27 clicks / 2629 impressions.
- Page-table aggregation: 27 clicks / 2923 impressions. Query-table aggregation: 1 / 1018. These totals were not forced to match because query privacy and page/canonical aggregation differ.
- Generative AI Search appearance: 34 page rows; chart total 142 impressions. This evidence remains separate from standard Web totals.

## Deterministic duplicate handling

- Binary hashes were retained for every file.
- 1 content-level duplicate was found: the second Discovered-currently-not-indexed export duplicates the first despite different workbook hashes.
- The one-row Crawled-currently-not-indexed export is a narrower overlap of the three-row export; the three-row export is authoritative for All known pages.

## Coverage reconciliation

- Excluded by ‘noindex’ tag: 46 deduplicated example rows.
- Not found (404): 1 deduplicated example rows.
- Alternate page with proper canonical tag: 1 deduplicated example rows.
- Crawled - currently not indexed: 3 deduplicated example rows.
- Page with redirect: 9 deduplicated example rows.
- Discovered - currently not indexed: 5 deduplicated example rows.

The 65 deduplicated rows align with the current Search Console overview total of 65 not-indexed pages. Raw Last crawled serials are preserved. Serial 25569 renders as 1970-01-01 and is classified LAST_CRAWLED_VALUE_UNRELIABLE rather than accepted as a real Google crawl date.

## Supporting reports

- Indexed/valid exports: 287 All known pages, 187 All submitted pages, and 100 rows for sitemap scope 160; scoped tables were not mistaken for total indexed counts.
- Breadcrumbs: latest 17 valid / 0 invalid, with no active critical or non-critical issue rows.
- HTTPS: latest 24 HTTPS / 0 non-HTTPS, with no active issue rows.
- Internal links: 37 Google-reported target rows; global navigation/footer totals remain distinct from contextual crawl-derived authority.
- External links: authenticated report checked at 2026-08-24T04:35:07Z; total 0 and both current exports contained headers only. Classification: GSC_LINKS_REPORT_RETURNED_NO_USABLE_ROWS; never interpreted as proof of zero backlinks.

## What this evidence does not provide

The workbooks do not contain a query×page join, a page-level latest-vs-previous 28-day comparison, or current URL Inspection API fields. Those remain material PASS blockers.
