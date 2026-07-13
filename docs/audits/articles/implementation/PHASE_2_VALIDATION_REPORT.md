# Phase 2 Validation Report

Generated: 2026-07-13

## Audit Results

- Articles audited: 36
- Matrix rows: 1296
- Exact duplicate sentence groups: 0
- Exact duplicate paragraph groups: 0
- Global near-duplicate pairs: 15
- Global high-overlap pairs: 0
- High-overlap clusters: 0

## Phase 2 Scoped Similarity

- Scoped articles reviewed and changed: 12
- Scoped unique pairs: 66
- Scoped high-overlap pairs before/after: 0 -> 0
- Scoped medium-overlap pairs before/after: 3 -> 2
- Scoped max similarity before/after: 0.294 -> 0.271

## Cluster Results

- Beginner Meditation and Mindfulness: Medium -> Medium; max 0.28 -> 0.268; medium pairs 2 -> 1.
- Attachment, Non-attachment, and Letting Go: Medium -> Medium; max 0.294 -> 0.271; medium pairs 1 -> 1.

## Preservation Results

- Phase 2 preservation status: passed
- Phase 2 preservation checks: 156
- Phase 2 preservation failures: 0
- Phase 1 preservation validator was rerun separately and passed during implementation.

## Commands Run

- node scripts/generate-second-article-audit.mjs
- node scripts/validate-second-article-audit.mjs
- node scripts/validate-phase-1-preservation.mjs
- node scripts/validate-phase-2-preservation.mjs
- npm run build

## Build Result

- Production build: passed.
- Pages built: 306.

## Phase 3 Remaining Work

- Global medium-risk pairs outside Phase 2 remain, including Eightfold Path, Four Noble Truths, Loving-kindness/Metta, and Impermanence pair families.
- Source support should be added with verified references, especially for doctrinal terms and mental-health-adjacent language.
- No push or deployment was performed in Phase 2.
