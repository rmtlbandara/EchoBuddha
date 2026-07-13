# Phase 1 Source Scaffold Map

## Files Inspected

- `docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json`
- `docs/audits/articles/ECHOBUDDHA_ARTICLE_EDITORIAL_SPECIFICATIONS.md`
- `docs/audits/articles/ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.csv`
- `docs/audits/articles/ECHOBUDDHA_EXACT_DUPLICATION_REPORT.md`
- `docs/audits/articles/ECHOBUDDHA_HUMAN_WRITING_DIAGNOSTIC.md`
- `docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json`
- `docs/audits/articles/ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv`
- `docs/audits/articles/ECHOBUDDHA_WELLBEING_CONTENT_REVIEW.md`
- `src/data/site.ts`

## Source Of The Repeated Scaffold

The eight exact duplicated sentence groups came from `createWeek2DeepeningSections()` in `src/data/site.ts`, not from the shared Astro article renderer. The helper appended three generated article-owned sections from `week2DeepeningNotes`:

- `Practical Examples in Daily Life`
- `A Mindfulness Exercise`
- `Continue the Path`

Before Phase 1, every in-scope article received the same six-paragraph rhetorical frame with only topic, situation, practice, links, and reflection interpolated. The original source matches were observed around `src/data/site.ts:5770` through `src/data/site.ts:5785` before this edit.

## Exact Sentences Mapped

1. It is a way to pause, notice conditions, and choose a response that creates less harm than habit would create on its own.
2. The size of the action matters less than the sincerity of the attention.
3. Buddhist-inspired practice often grows through modest repetitions that slowly change the tone of speech, thought, and behavior.
4. When it appears, pause long enough to feel the body and name what is happening in plain language.
5. If that pattern appears, do not turn it into another reason for self-criticism.
6. Notice it, soften the body, and begin again with the next available choice.
7. These related pages give the teaching more context and help connect reflection with meditation, speech, daily conduct, and simple Buddhist-inspired practice.
8. Let it point toward one practical step rather than becoming another idea to collect.

## Cause

The source pattern came from the Week 2/Week 3 content expansion process. Identical helper paragraphs were generated across the 16 Phase 1 articles. The surrounding repeated pattern was article-owned prose, not shared navigation, related-card, sidebar, schema, or layout text.

## Phase 1 Source Fix

- Added `phase1ArticleSpecificDeepeningSections` with article-specific prose for the 16 in-scope slugs.
- Updated `createWeek2DeepeningSections(slug, note)` to use those sections when present.
- Rewrote the fallback helper text so the old duplicated sentences are not left as a future source pattern.
- Preserved the same three headings and existing href destinations.

## Future Risk Control

New articles should not rely on the fallback helper as a finished editorial pattern. If more articles use deepening sections, they should receive article-specific examples, exercises, and endings before publication.
