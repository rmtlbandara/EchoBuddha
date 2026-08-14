import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const audit = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-11-final-adsense-readiness");
const checks = [];
const check = (name, fn) => { try { fn(); checks.push({ name, pass: true }); } catch (error) { checks.push({ name, pass: false, error: error.message }); } };
const assert = (value, message) => { if (!value) throw new Error(message); };
const read = (name) => { const file = path.join(audit, name); assert(fs.existsSync(file) && fs.statSync(file).size > 0, `missing/empty ${name}`); return fs.readFileSync(file, "utf8"); };
const lineCount = (name) => read(name).trimEnd().split(/\r?\n/).length;

const mandatory = [
  "ECHO_BUDDHA_FINAL_ADSENSE_READINESS_AUDIT.md", "phase-11-phase0-10-reconciliation-matrix.csv", "phase-11-google-adsense-policy-evidence-register.csv", "phase-11-route-readiness-register.csv", "phase-11-page-family-content-readiness.csv", "phase-11-content-readiness-register.csv", "phase-11-topic-owner-readiness.csv", "phase-11-cannibalization-final-review.csv", "phase-11-emerging-winner-protection-review.csv", "phase-11-trust-authorship-source-readiness.csv", "phase-11-ux-navigation-accessibility-readiness.csv", "phase-11-technical-indexability-readiness.csv", "phase-11-privacy-consent-adsense-readiness.csv", "phase-11-gsc-adsense-account-evidence.csv", "phase-11-gsc-indexing-exception-reconciliation.csv", "phase-11-url-inspection-review.csv", "phase-11-gsc-search-performance-refresh-review.csv", "phase-11-production-parity-review.csv", "phase-11-blocker-register.csv", "phase-11-evidence-gap-register.csv", "phase-11-owner-action-queue.csv", "phase-11-final-readiness-matrix.csv", "phase-11-adsense-reapplication-decision-checklist.csv", "phase-11-validation-summary.csv", "phase-11-rollback-map.csv", "MASTER_PRE_ADSENSE_REAPPLICATION_PROTECTION_REGISTER.csv", "phase-11-generated-summary.json",
];

check("mandatory deliverables", () => mandatory.forEach(read));
check("108-section primary report", () => {
  const report = read(mandatory[0]);
  assert((report.match(/^## \d+\./gm) || []).length === 108, "primary report must contain exactly 108 numbered sections");
  assert(report.includes("# PHASE 11 STATUS:\nCOMPLETE"), "complete status missing");
  assert(report.includes("ADSENSE REVIEW SUBMITTED — GOOGLE REVIEW IN PROGRESS"), "review-in-progress verdict missing");
  assert(report.includes("SITE CODE REMEDIATION REQUIRED: NO"), "site-code remediation decision missing");
  assert(report.includes("PRODUCTION DEPLOYMENT REQUIRED: NO"), "no-deployment decision missing");
  assert(report.includes("ADS.TXT ACCOUNT RECOGNITION REQUIRED FOR THE SUBMITTED REVIEW: NO — MONITOR"), "ads.txt monitoring decision missing");
  assert(report.includes("ACCOUNT AUTOMATION REMEDIATION REQUIRED: NO — CLOSED"), "account-automation closure missing");
});
check("route and protection coverage", () => {
  assert(lineCount("phase-11-route-readiness-register.csv") === 337, "route register must have 336 data rows");
  assert(lineCount("MASTER_PRE_ADSENSE_REAPPLICATION_PROTECTION_REGISTER.csv") === 340, "master register must have 336 routes plus 3 site-wide controls");
});
check("indexable content coverage", () => assert(lineCount("phase-11-content-readiness-register.csv") === 194, "content register must have 193 indexable rows"));
check("Phase 0-10 reconciliation", () => assert(lineCount("phase-11-phase0-10-reconciliation-matrix.csv") === 12, "reconciliation must cover phases 0 through 10"));
check("current official policy evidence", () => {
  const data = read("phase-11-google-adsense-policy-evidence-register.csv");
  assert(lineCount("phase-11-google-adsense-policy-evidence-register.csv") >= 18, "official source coverage too small");
  assert(data.includes("support.google.com/adsense") && data.includes("support.google.com/publisherpolicies") && data.includes("developers.google.com/search"), "official source domains incomplete");
});
check("evidence gaps are not defects", () => {
  const gaps = read("phase-11-evidence-gap-register.csv");
  assert(gaps.includes("Manual Actions exact current state/date") && gaps.includes("CLOSED — owner screenshot shows no issues"), "closed Manual Actions evidence missing");
  assert(gaps.includes("Security Issues exact current state/date") && (gaps.match(/CLOSED — owner screenshot shows no issues/g) || []).length === 2, "closed Security Issues evidence missing");
  assert(gaps.includes('"No"'), "gap/defect distinction missing");
  assert(gaps.includes("Not found") && gaps.includes("crawler-propagation monitoring only") && gaps.includes("CLOSED FOR REVIEW READINESS"), "ads.txt propagation monitoring boundary missing");
  assert(gaps.includes("Required account/payment setup completion and review submission") && gaps.includes("NONE — resolved owner prerequisite") && gaps.includes("CLOSED — onboarding complete and review request accepted"), "account-setup/submission closure missing");
  assert(gaps.includes("All 26 supplied and reconciled") && gaps.includes("CLOSED — 26/26 rows"), "indexing exception evidence gate not closed");
});
check("26 indexing exceptions reconciled", () => {
  const rows = read("phase-11-gsc-indexing-exception-reconciliation.csv");
  assert(lineCount("phase-11-gsc-indexing-exception-reconciliation.csv") === 27, "indexing reconciliation must contain exactly 26 data rows");
  assert((rows.match(/"Excluded by ‘noindex’ tag"/g) || []).length === 8, "noindex exception count mismatch");
  assert((rows.match(/"Page with redirect"/g) || []).length === 7, "redirect exception count mismatch");
  assert((rows.match(/"Discovered - currently not indexed"/g) || []).length === 8, "discovered exception count mismatch");
  assert(rows.includes('"https://echobuddha.com/sitemap.xml"') && rows.includes("XML sitemap need not be indexed"), "sitemap exception not reconciled");
  assert(rows.includes('"https://echobuddha.com/terms-and-conditions/"') && rows.includes("P2 — renamed route lacks a legacy redirect"), "legacy terms P2 issue missing");
  assert(!rows.includes("P0") && !rows.includes("P1"), "unsupported P0/P1 indexing defect recorded");
});
check("15 URL inspections and both live-test follow-ups reconciled", () => {
  const rows = read("phase-11-url-inspection-review.csv");
  assert(lineCount("phase-11-url-inspection-review.csv") === 16, "URL inspection review must contain exactly 15 data rows");
  assert((rows.match(/"PASS"/g) || []).length >= 11, "expected control/indexed passes missing");
  assert(rows.includes('"https://echobuddha.com/start-here/"') && rows.includes("Live Test: URL is available to Google / Page can be indexed; indexing requested") && rows.includes("879a30071e8ac33ef3d027990b7adba2d52cc63fd69ddc458594fe1bc48f9cee"), "start-here live-test/indexing-request closure missing");
  assert(rows.includes('"https://echobuddha.com/daily-reflections/today/"') && rows.includes("Live Test: URL is not available to Google / Excluded by noindex") && rows.includes("439a37bbca8428fd743bb25d468858281b074b86148df10ac9e52dcc8def98b8"), "daily reflection live noindex closure missing");
});
check("fresh GSC performance export reconciled without false freshness", () => {
  const rows = read("phase-11-gsc-search-performance-refresh-review.csv");
  assert(lineCount("phase-11-gsc-search-performance-refresh-review.csv") === 8, "GSC refresh review must contain exactly seven source rows");
  assert((rows.match(/Yes — byte-identical SHA-256/g) || []).length === 7, "all seven GSC files must match the Phase 10 baseline");
  assert((rows.match(/REFRESH VERIFIED \/ NON-BLOCKING MEASUREMENT FOLLOW-UP/g) || []).length === 7, "fresh download measurement boundary is incorrect");
  assert(rows.includes('"Chart.csv"') && rows.includes('"15 clicks; 1,375 impressions; 1.09% CTR; position 32.38"'), "headline GSC totals missing");
  assert(rows.includes('"Search appearance.csv"') && rows.includes('"Header only; no search-appearance rows"'), "empty search-appearance boundary missing");
});
check("account review-in-progress evidence", () => {
  const account = read("phase-11-gsc-adsense-account-evidence.csv");
  assert(account.includes('"Manual Actions","No issues detected","OWNER_SCREENSHOT_FACT"') && account.includes('"PASS"'), "owner-supplied Manual Actions pass missing");
  assert(account.includes('"Security Issues","No issues detected","OWNER_SCREENSHOT_FACT"'), "owner-supplied Security Issues pass missing");
  assert(account.includes('"Sites status","Getting ready; Review requested","OWNER_SCREENSHOT_FACT"') && account.includes("PASS — REVIEW IN PROGRESS / NOT YET APPROVED"), "exact review-in-progress Sites state missing");
  assert(account.includes('"Policy Center","No current issues","OWNER_SCREENSHOT_FACT"'), "Policy Center pass missing");
  assert(account.includes("Latest review status") && account.includes("CLOSED — REJECTION HISTORY CAPTURED / EXACT POLICY SUBTYPE UNSTATED"), "latest review evidence boundary missing");
  assert(account.includes('"ads.txt account status","Not found"') && account.includes("PASS IMPLEMENTATION / NON-BLOCKING ACCOUNT-PROPAGATION MONITORING"), "ads.txt implementation/monitoring boundary not preserved exactly");
  assert(account.includes('"Site ownership and onboarding","Verified; account-provided ads.txt line exactly matches pub-3911157640549350; All steps complete; payments Your profile is complete; ads Ads settings confirmed; site Thanks for connecting the site; Review requested"') && account.includes("PASS — OWNERSHIP, ONBOARDING, AND REVIEW SUBMISSION CLOSED"), "site ownership/onboarding/submission evidence missing");
  assert(account.includes('"Auto Ads / Auto optimize","Auto ads OFF; Auto optimize OFF; auto-apply winner OFF (unchecked); experiment traffic 50% configured but inactive; page exclusions 0"') && account.includes("PASS DISABLED — ACCOUNT REMEDIATION CLOSED"), "disabled Auto Ads configuration not preserved exactly");
  assert(account.includes('"Sitemaps","https://echobuddha.com/sitemap.xml; submitted 2026-08-11; last read 2026-08-11; Success; 193 pages; 0 videos"'), "GSC sitemap pass missing");
  assert(account.includes('"CMP/Privacy & messaging","European regulations 2 published; echobuddha.com message Published and enabled; current editor exposes Consent / Do not consent / Manage options; Echo Buddha site name, HTTPS privacy-policy URL, and logo configured; Google-managed European regulations message; exact UI version label not exposed in supplied account view"') && account.includes("PASS — CURRENT MESSAGE AND SITE CONFIGURATION VERIFIED"), "completed CMP evidence boundary missing");
  assert(account.includes('"Field CWV","Not enough usage data in the last 90 days for mobile and desktop"') && account.includes("PASS — ACCEPTABLE NO-DATA STATE"), "Field CWV no-data evidence missing");
});
check("eight winners protected", () => assert(lineCount("phase-11-emerging-winner-protection-review.csv") === 9, "emerging-winner register must have eight rows"));
check("readiness gates and domains", () => {
  const matrix = read("phase-11-final-readiness-matrix.csv");
  assert(lineCount("phase-11-final-readiness-matrix.csv") === 23, "readiness matrix must contain all 22 required domains");
  for (const gate of "ABCDEFGHIJKLMN") assert(matrix.includes(`\"${gate}\"`), `gate ${gate} missing`);
});
check("reapplication checklist", () => assert(lineCount("phase-11-adsense-reapplication-decision-checklist.csv") >= 33, "reapplication checklist is incomplete"));
check("no proven P0/P1 blocker and automation closure", () => {
  const blockers = read("phase-11-blocker-register.csv");
  assert(blockers.includes('"NONE"') && blockers.includes("NO PROVEN P0/P1 BLOCKER"), "zero-blocker conclusion missing");
  assert(!blockers.includes('"BLK-01"') && !blockers.includes('"P1"') && !blockers.includes('"P0"'), "unsupported blocker remains in register");
  assert(!blockers.includes("Auto ads ON") && !blockers.includes("Auto optimize ON"), "closed automation finding remains in blocker register");
});
check("production unchanged and submitted review recorded", () => {
  const report = read(mandatory[0]);
  assert(report.includes("PRODUCTION DEPLOYED DURING PHASE 11:\nNo"), "no-deploy result missing");
  assert(report.includes("ADSENSE REVIEW REQUESTED:\nYes"), "submitted-review result missing");
  assert(report.includes("ADSENSE APPROVED:\nNot yet / not claimed"), "approval boundary missing");
  assert(report.includes("OWNER EVIDENCE REQUIRED BEFORE/DURING SUBMISSION: NONE"), "zero required owner evidence result missing");
  assert(report.includes("Phase 12 remains separately governed"), "Phase 12 separation missing");
});
check("protected dist identity", () => {
  const summary = JSON.parse(read("phase-11-generated-summary.json"));
  assert(summary.routeCount === 336 && summary.indexableCount === 193, "protected counts changed");
  assert(summary.liveStatusPass === 336 && summary.stableRouteCount === 335 && summary.liveByteMatches === 335, "stable-route exact parity incomplete");
  assert(summary.expectedVolatileRouteCount === 1 && summary.expectedVolatileParityPasses === 1 && summary.liveParityPasses === 336, "declared UTC-rotating utility parity incomplete");
  assert(summary.canonicalMismatches === 0 && summary.adRuntimeRoutes === 0, "canonical or AdSense runtime issue");
  assert(summary.provenP1 === 0 && summary.adsTxtAccountStatus === "Not found" && summary.adsTxtImplementationPass === true && summary.adsTxtBlocksReview === false, "ads.txt implementation/monitoring result missing from summary");
  assert(summary.manualActionsStatus === "No issues detected" && summary.securityIssuesStatus === "No issues detected", "GSC safety evidence not reflected in summary");
  assert(summary.adsenseSitesStatus === "Getting ready" && summary.adsenseReviewRequestedStatus === "Review requested" && summary.policyCenterStatus === "No current issues", "AdSense review-in-progress state not reflected in summary");
  assert(summary.autoAdsStatus === "OFF" && summary.autoOptimizeStatus === "OFF" && summary.autoApplyWinnerStatus === "OFF (unchecked)", "disabled AdSense automation state not reflected in summary");
  assert(summary.siteOwnershipVerified === true && summary.siteOwnershipStatus === "Verified" && summary.reviewActionAvailable === false && summary.accountSetupComplete === true && summary.adsenseReviewRequested === true && summary.adsenseReviewInProgress === true && summary.adsenseApproved === false, "ownership/onboarding/review state not reflected in summary");
  assert(summary.gscSitemapStatus === "Success" && summary.gscSitemapDiscoveredPages === 193, "GSC sitemap evidence not reflected in summary");
  assert(summary.europeanPrivacyMessagesStatus === "2 published" && summary.cmpCurrentMessageChoicesVerified === true && summary.cmpTcfVersionVerified === false && summary.cmpGateClosed === true, "completed Privacy & messaging evidence boundary not reflected in summary");
  assert(summary.fieldCwvStatus === "Not enough usage data in the last 90 days for mobile and desktop", "Field CWV closure not reflected in summary");
  assert(summary.indexingExceptionsReconciled === 26 && summary.blockingEvidenceGaps === 0 && summary.openOwnerActions === 0, "closed owner prerequisite counts not reflected in summary");
  assert(summary.urlInspectionsSupplied === 15 && summary.urlInspectionIndexedIntended === 8 && summary.urlInspectionFollowUps === 0 && summary.urlInspectionHeadlineSetComplete === true && summary.urlInspectionGateClosed === true, "URL inspection state not reflected in summary");
  assert(summary.gscPerformanceRefreshFilesReconciled === 7 && summary.gscPerformanceRefreshMatchesPhase10Baseline === true, "GSC refresh reconciliation missing from summary");
  assert(summary.gscPerformanceRefreshStart === "2026-07-15" && summary.gscPerformanceRefreshCutoff === "2026-08-11" && summary.gscPerformanceRefreshPostReleaseDays === 0, "GSC refresh measurement boundary incorrect");
  assert(summary.gscPerformanceEarliestEligibleCutoff === "2026-09-10" && summary.gscPerformancePostReleaseGateClosed === false && summary.gscPerformanceBlocksReview === false, "GSC non-blocking measurement boundary incorrect");
  assert(summary.p2Issues === 2 && summary.siteCodeCleanupRecommended === true, "non-blocking legacy redirect/404 cleanup not reflected in summary");
  assert(summary.verdict === "ADSENSE REVIEW SUBMITTED — GOOGLE REVIEW IN PROGRESS" && summary.siteCodeRemediationRequired === false && summary.productionDeploymentRequiredBeforeReview === false && summary.accountRecognitionRemediationRequired === false && summary.accountSetupConfirmationRequired === false && summary.reviewRecommendedAfterAccountSetup === false && summary.accountAutomationRemediationRequired === false && summary.accountAutomationRemediated === true, "final decision boundary incorrect");
  assert(summary.productionDeployed === false && summary.adsenseReviewRequested === true && summary.adsenseReviewInProgress === true && summary.adsenseApproved === false, "review/deployment state incorrect");
});

const failed = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}${item.error ? `: ${item.error}` : ""}`);
if (failed.length) process.exitCode = 1;
else console.log(`Phase 11 validation passed: ${checks.length}/${checks.length} checks.`);
