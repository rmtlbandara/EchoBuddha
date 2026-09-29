# Technical SEO Validation

Status: **PASS**  
Checked: 2026-09-29

- Build output: 165 indexable routes with rendered HTML.
- Canonicals: all sitemap routes self-canonical.
- Robots/indexability: no sitemap/noindex conflicts.
- Sitemap: 165 unique URLs; exact registry coverage.
- Search index: 330 records; 146/165 sitemap routes are intentionally searchable and the remaining 19 navigation/policy routes match the explicit exclusion set.
- Schema: Article/BreadcrumbList retained on 13 changed articles; obsolete FAQPage and HowTo objects removed while visible content remains.
- Redirects: none introduced.
- Broken links: 0; broken fragments: 0.
- Metadata: 0 duplicate title groups; 0 duplicate description groups.

## Automated checks

- PASS: Sitemap URLs are unique — 165 entries; 165 unique
- PASS: Registry covers the complete sitemap — 165 registry records; 165 sitemap URLs
- PASS: On-site search exclusions match the intentional route policy — 330 search records; 19 intentionally excluded navigation/policy routes
- PASS: Six protected clusters are registered — 6 clusters; 44 priority URLs
- PASS: Each protected cluster has one broad owner — Buddhism for Beginners: 1; Impermanence / Anicca: 1; Noble Eightfold Path: 1; Four Noble Truths: 1; Beginner Meditation: 1; Loving-kindness / Mettā: 1
- PASS: Every sitemap route has rendered HTML — 165/165
- PASS: Indexable routes remain self-canonical — 165 self-canonicals
- PASS: Sitemap contains no noindex routes — 0 noindex conflicts
- PASS: Every indexable page has one visible H1 — 165 pages with H1
- PASS: Indexable titles are unique — 0 duplicate title groups
- PASS: Indexable descriptions are unique — 0 duplicate description groups
- PASS: Priority support pages link to their declared owner — 44 priority relationships verified
- PASS: Rendered internal links resolve — 0 broken internal hrefs
- PASS: Rendered internal fragments resolve — 0 broken internal fragments
- PASS: Obsolete FAQPage schema is absent — Visible FAQs remain; 0 FAQPage objects in indexable output
- PASS: Obsolete HowTo schema is absent — Visible meditation steps remain; 0 HowTo objects in indexable output
- PASS: Changed articles retain Article and breadcrumb schema — 13 article schema pairs verified
- PASS: Changed articles retain visible reader FAQs — 13 visible FAQ sections verified
- PASS: Explicitly numbered headings avoid duplicate TOC markers — Numbered Eightfold Path review headings use the already-numbered class
- PASS: Changed articles do not duplicate long substantive paragraphs — 0 duplicated substantive paragraphs of 300+ characters
- PASS: Changed pages retain named source context — 13 source-review rows
- PASS: Growth protections remain non-destructive — 0 redirects; 0 noindex changes; 0 cross-page canonical changes
