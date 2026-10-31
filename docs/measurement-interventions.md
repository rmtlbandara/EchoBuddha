# Measurement interventions

`governance/measurement-interventions.json` records owner-authorized changes.
Never update a historical intervention to make a new file pass. Add a new record
with authorization, baseline SHA, a hashed baseline evidence file, scope, affected
routes and the exact approved application digests.

When an approved file already has a different hash, list it in `supersedesFiles`
with its previous intervention ID and digest. The new baseline must retain the
SHA-256 of the complete original intervention object (`JSON.stringify` in stored
property order). The resolver validates that historical record and every baseline,
requires a replacement for each superseded file, then checks the current file
against the latest explicitly approved hash. Unchanged protected files remain
checked against their earlier approval. Forward references, missing authorization,
unapproved replacements and changed baseline evidence fail.

This does not authorize route removal, index, canonical or topic-owner changes.
Those still fail the non-destructive intervention contract and the independent
release protection gates. Tests exercise both valid supersession and rejection of
historical edits, unexpected source edits, deletion and policy changes.

Record the actual deployed SHA and timestamp in an appended release receipt.
Do not guess them before deployment. The October 24–November 20 observation window
becomes intervened when the new material candidate reaches production. Preserve
it for descriptive comparison; collect a new 28-day stable period beginning on the
next Pacific day after the actual deployment. Exclude the deployment day, allow
the existing finalization buffer, and verify that data are actually finalized.
Never infer causal gains or unlock consolidation from incomplete evidence.

The read-only Search Measurement workflow remains weekly. Its collector selects
the latest actual `productionDeployedAt` record when deriving the revised window.
Keep account credentials and raw queries outside Git; publish only useful
aggregates. Owner/audit traffic, consent choices, low samples and different report
grains limit interpretation of reader outcomes.

The stable observation window governs search-outcome measurement and consolidation decisions; it is not an AdSense review-submission prerequisite. Assess submission readiness from current official policy, actual account prerequisites and the verified site. See the [October 31 account reconciliation](audits/adsense-account-reconciliation-2026-10-31/FINAL_REPORT.md).
