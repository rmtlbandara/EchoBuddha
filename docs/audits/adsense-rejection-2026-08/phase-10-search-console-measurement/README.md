# Phase 10 Reproduction Guide

Phase 10 is a measurement-only snapshot. The source CSV files under `source-data/` are preserved unchanged and hashed in `phase-10-dataset-inventory.csv`.

Reproduce the analysis from the repository root:

```bash
npm run build
node scripts/measurement/generate-phase-10-analysis.mjs
npm run audit:phase10
```

For the final validation state without rewriting the committed custom-validation JSON during CI:

```bash
PHASE10_FINAL_VALIDATION=passed node scripts/measurement/generate-phase-10-analysis.mjs
PHASE10_AUDIT_OUT=.artifacts/release-validation/phase-10-custom-validation.json npm run audit:phase10
```

Method rules:

- Property totals come from Chart, Device, or Country exports—not Page-tab sums.
- Query and Page rows remain separate aggregates; no query × page, country × device, or other intersection is fabricated.
- Weighted average position uses impressions as weights.
- Empty Search Appearance and external-link files are treated as missing/insufficient evidence.
- The supplied duplicate top-target filename was absent from the source directory; only the one available file is included.
- Production performance data ends 2026-08-11, so it cannot validate the final 2026-08-13 Phase 8/9 release.
- Running the generator changes only audit artifacts. It does not alter application routes, content, indexability, analytics, consent, AdSense, or deployment state.
