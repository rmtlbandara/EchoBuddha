# Phase 1 Validation Report

Build command: `npm run build`

Build result: passed

Post-audit command: `NON_ARTICLE_AUDIT_OUT_DIR=docs/audits/non-articles/implementation/phase-1/post node scripts/audit-non-articles.mjs`

Preservation command: `node scripts/validate-phase-1-non-article-preservation.mjs`

Preservation result: passed

Routes before: 264

Routes after: 264

Failures: 0

Warnings: 0

Intentional search-membership additions: 12

Post-audit source-review-needed count: 0

Post-audit missing-from-search count: 12

Post-audit missing-from-sitemap count: 51

DOCX QA:

- `unzip -t` passed with no compressed-data errors.
- Required Word parts exist and parse as XML: `[Content_Types].xml`, `word/document.xml`, `word/styles.xml`, `word/numbering.xml`, and `word/settings.xml`.
- Structural count from the latest DOCX check: 11 package parts, 9822 Word paragraphs, 18 Word tables.
- Visual render QA could not be completed in this environment because LibreOffice/`soffice`, Poppler, and the Python `pdf2image` dependency are unavailable.
