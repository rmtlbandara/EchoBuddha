# Phase 7 Owner GSC Export Checklist

Use this checklist after the Phase 5/6 repository state has been deployed to production and has had enough time to gather Search Console data.

## Timing

- Record the exact production deployment date and deployed commit SHA.
- Wait at least 14 days after deployment before drawing early directional conclusions.
- Prefer 28 days after deployment for the first stronger comparison.
- Do not compare against the Phase 0 baseline until the export covers post-deployment days.

## Search Console Property

- Use the same Echo Buddha property used for the Phase 0 baseline.
- Keep search type as `Web`.
- Use the same domain/canonical version: `https://echobuddha.com/`.

## Required Export Set

Export the Performance report as CSV/Google Sheets/Excel with these dimensions:

- Dates / Chart
- Pages
- Queries
- Countries
- Devices
- Search appearance
- Filters

Save the exported folder with a clear date, for example:

`echobuddha.com-Performance-on-Search-YYYY-MM-DD`

## Recommended Date Ranges

Export at least one of these:

- First review: 14 days after deployment through the latest available complete day.
- Better review: 28 days after deployment through the latest available complete day.
- Comparison export: the same number of days immediately before deployment, if available.

Avoid mixing pre-deployment and post-deployment days unless the report clearly labels that limitation.

## Priority URL Inspection

If practical, use URL Inspection for these pages and save screenshots or notes:

- `https://echobuddha.com/learn/buddhist-dictionary/dhamma/`
- `https://echobuddha.com/learn/buddhism-for-beginners/`
- `https://echobuddha.com/quotes/patience/`
- `https://echobuddha.com/quotes/letting-go/`
- `https://echobuddha.com/quotes/compassion/`
- `https://echobuddha.com/articles/dhammapada-reflection-what-we-think/`
- `https://echobuddha.com/articles/dhammapada-verse-1-meaning/`
- All Phase 4 support pages
- All Phase 5 support pages

Record:

- URL is on Google: yes/no
- Crawl allowed: yes/no
- Indexing allowed: yes/no
- User-declared canonical
- Google-selected canonical
- Last crawl date
- Page fetch result
- Any enhancement or structured-data warnings

## Sitemap And Account Checks

Save notes or screenshots for:

- Sitemap submission status
- Page Indexing report summary
- Manual Actions report
- Security Issues report
- Core Web Vitals report
- HTTPS report, if available

## Analytics Optional

If Google Analytics is available, export or note:

- Landing pages
- Sessions/users by page family
- Country/device split
- Engagement rate or equivalent engagement metric
- Consent behavior notes, if visible

Analytics should support interpretation only. It must not override source, safety, privacy, or Buddhist content governance.

## File Handoff

Place the fresh export folder in one of these locations:

- `/Users/tharindu/Downloads/`
- `docs/audits/phase-7-measurement-loop/latest-gsc-export/`

Do not replace the Phase 0 baseline archive. It is historical evidence.

## Decision Guardrails

- Do not delete, redirect, merge, or noindex pages from one short export.
- Do not create duplicate broad pages for Dhamma, Sangha, beginner Buddhism, meditation, quotes, Right Speech, Dhammapada, or letting go.
- Do not activate AdSense from traffic data alone.
- Do not make ranking, indexing, revenue, medical, safety, source, or expert-review claims.
- Treat early data as directional until at least two measurement cycles agree.
