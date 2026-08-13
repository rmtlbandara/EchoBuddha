## Purpose

<!-- What is changing, why is it needed, and what user value does it add? -->

## Scope

<!-- List affected pages, components, data, workflows, or configuration. Keep unrelated work separate. -->

## Relevant review

Complete only the lines that apply.

- [ ] Content: closest existing page reviewed; role/owner and unique information gain are clear.
- [ ] New indexable URL: `governance/indexable-page-approvals.json` contains the complete approved record.
- [ ] URL/index/canonical/redirect: intent is recorded in `governance/release-change-approvals.json`.
- [ ] Sources/attribution: identifiers and claims resolve; no unsupported Buddha/person attribution was added.
- [ ] Safety: applicable wellbeing/relationship/meditation boundaries remain visible.
- [ ] Trust: no person, credential, reviewer, or endorsement claim was introduced without verified evidence.
- [ ] UX/accessibility: keyboard, mobile, Search, navigation, 404 and relevant journeys were reviewed.
- [ ] AdSense: runtime remains off and manual slots remain disabled, or a separately authorized future policy change is explicit.
- [ ] Privacy/consent: no optional Google request occurs before affirmative acceptance.
- [ ] Security/performance: headers, dependencies, payload and production behavior were considered.

## Evidence

<!-- Commands run, screenshots when useful, and important warnings reviewed. -->

- [ ] `npm ci`
- [ ] `npm run validate:release`
- [ ] `npm run audit:browser` when UX, consent, analytics, navigation or accessibility changes
- [ ] `npm run audit:lighthouse` when runtime, layout, assets or performance changes

## Deployment and rollback

<!-- State whether production behavior changes, the exact release SHA expectation, and the rollback/fix-forward path. Do not include secrets. -->
