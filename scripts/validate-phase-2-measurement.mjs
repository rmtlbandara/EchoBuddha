import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  AUDIT_DIR,
  CLUSTERS,
  DECISION_CLASSES,
  PHASE_1,
  PRIVATE_EVIDENCE_DIR,
  WATCHLIST,
  parseCsv
} from "./phase-2-measurement-lib.mjs";

const failures = [];
const passes = [];
const localReleaseCandidate = process.argv.includes("--local-release-candidate");
const check = (condition, name, details) => {
  (condition ? passes : failures).push({ name, details });
};
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, name), "utf8"));
const readCsv = (name) => parseCsv(fs.readFileSync(path.join(AUDIT_DIR, name), "utf8"));

const requiredFiles = [
  "README.md",
  "EXECUTIVE_REPORT.md",
  "MEASUREMENT_METHODOLOGY.md",
  "GSC_PERFORMANCE_SUMMARY.md",
  "QUERY_PAGE_OWNERSHIP_REPORT.md",
  "QUERY_PAGE_OWNERSHIP_REPORT.csv",
  "CLUSTER_PERFORMANCE_REPORT.md",
  "CLUSTER_TOTAL_PERFORMANCE.csv",
  "WATCHLIST_DECISION_REGISTER.md",
  "WATCHLIST_DECISION_REGISTER.csv",
  "CANONICAL_INDEX_INSPECTION_REGISTER.csv",
  "GROWTH_OPPORTUNITY_MATRIX.csv",
  "OWNER_MISMATCH_REGISTER.csv",
  "NEW_CONTENT_CANDIDATE_REGISTER.csv",
  "PROTECTED_GROWTH_URLS.csv",
  "QUERY_FAMILY_RULES.csv",
  "CONSOLIDATION_REGISTER.csv",
  "REDIRECT_MAP.csv",
  "CONTENT_SALVAGE_REGISTER.csv",
  "INTERNAL_LINK_CHANGE_REGISTER.csv",
  "AI_SEARCH_REPORT.md",
  "MULTIMODAL_SEARCH_REPORT.md",
  "COUNTRY_DEVICE_REPORT.md",
  "TECHNICAL_VALIDATION_REPORT.md",
  "PHASE_3_ONGOING_BACKLOG.md",
  "IMPORT_GUIDE.md",
  "RAW_DATA_MANIFEST.json",
  "PHASE_2_STATUS.json",
  "PRODUCTION_BASELINE_VERIFICATION.json"
];
check(requiredFiles.every((name) => fs.existsSync(path.join(AUDIT_DIR, name))), "Required Phase 2 outputs exist", `${requiredFiles.length}/${requiredFiles.length} required outputs`);

const status = readJson("PHASE_2_STATUS.json");
const manifest = readJson("RAW_DATA_MANIFEST.json");
const baseline = readJson("PRODUCTION_BASELINE_VERIFICATION.json");
const watchlist = readCsv("WATCHLIST_DECISION_REGISTER.csv");
const clusters = readCsv("CLUSTER_TOTAL_PERFORMANCE.csv");
const ownership = readCsv("QUERY_PAGE_OWNERSHIP_REPORT.csv");
const inspections = readCsv("CANONICAL_INDEX_INSPECTION_REGISTER.csv");
const protectedUrls = readCsv("PROTECTED_GROWTH_URLS.csv");
const consolidations = readCsv("CONSOLIDATION_REGISTER.csv");
const redirects = readCsv("REDIRECT_MAP.csv");
const salvage = readCsv("CONTENT_SALVAGE_REGISTER.csv");
const linkChanges = readCsv("INTERNAL_LINK_CHANGE_REGISTER.csv");

check(status.phase1MainSha === PHASE_1.mainSha, "Phase 1 main baseline is pinned", status.phase1MainSha);
check(status.phase1ProductionContentSha === PHASE_1.contentSha, "Production content baseline is pinned", status.phase1ProductionContentSha);
check(baseline.productionContentSha === PHASE_1.contentSha && baseline.repositoryMain === PHASE_1.mainSha, "Independent production baseline record matches Phase 1", `${baseline.repositoryMain} / ${baseline.productionContentSha}`);
check(baseline.productionSmoke === "PASS" && baseline.monitoredArtifactParity?.passed === 19 && baseline.monitoredArtifactParity?.byteForByte === true, "Live baseline smoke and monitored artifact parity passed", `${baseline.monitoredArtifactParity?.passed}/${baseline.monitoredArtifactParity?.total}`);
check(baseline.materialContentReleasesAfterPhase1 === 0, "No later material content release contaminated the observation window", String(baseline.materialContentReleasesAfterPhase1));
check(baseline.dependencyAudit?.total === 0, "Release dependency audit has zero known vulnerabilities", JSON.stringify(baseline.dependencyAudit));
check(status.preWindow.start === PHASE_1.preStart && status.preWindow.end === PHASE_1.preEnd && status.preWindow.expectedDays === 28, "Pre window is exact", `${status.preWindow.start}..${status.preWindow.end}`);
check(status.transitionDay.date === PHASE_1.transitionDayPt && status.transitionDay.excluded === true, "Transition day is excluded", status.transitionDay.date);
check(status.postWindow.start === PHASE_1.postStart && status.postWindow.end === PHASE_1.postEnd && status.postWindow.expectedDays === 28, "Post window is exact", `${status.postWindow.start}..${status.postWindow.end}`);
check(status.earliestDecisionReview === PHASE_1.earliestDecisionReview, "Finalization buffer is preserved", status.earliestDecisionReview);

check(watchlist.length === WATCHLIST.length, "All watchlist URLs have decisions", `${watchlist.length}/${WATCHLIST.length}`);
check(new Set(watchlist.map((row) => row.url)).size === WATCHLIST.length, "Watchlist URLs are unique", `${new Set(watchlist.map((row) => row.url)).size} unique`);
check(WATCHLIST.every((item) => watchlist.some((row) => row.url === item.url && row.owner === item.owner && row.cluster === item.cluster)), "Watchlist roles and owners match Phase 1", "13 owner relationships checked");
check(watchlist.every((row) => DECISION_CLASSES.includes(row.decision)), "Decision classes are valid", [...new Set(watchlist.map((row) => row.decision))].join(", "));

if (!status.decisionGateOpen) {
  check(status.status === "PHASE_2_MEASUREMENT_ACTIVE — CONSOLIDATION HOLD", "Incomplete evidence forces measurement mode", status.status);
  check(watchlist.every((row) => row.decision === "HOLD_MORE_DATA"), "Incomplete evidence forces all watchlist decisions to HOLD_MORE_DATA", `${watchlist.filter((row) => row.decision === "HOLD_MORE_DATA").length}/${watchlist.length}`);
  check(consolidations.length === 0 && redirects.length === 0 && salvage.length === 0 && linkChanges.length === 0, "No implementation artifacts are populated before the gate", `consolidations=${consolidations.length}; redirects=${redirects.length}; salvage=${salvage.length}; links=${linkChanges.length}`);
} else {
  check(status.preWindow.complete && status.postWindow.complete, "Open decision gate has two complete windows", `pre=${status.preWindow.complete}; post=${status.postWindow.complete}`);
  check(manifest.dataState === "final", "Open decision gate uses finalized evidence", manifest.dataState);
  const mergeCandidates = watchlist.filter((row) => row.decision === "MERGE_301_CANDIDATE");
  check(mergeCandidates.every((row) => row.google_canonical !== "PENDING_FRESH_URL_INSPECTION" && row.content_overlap !== "HUMAN_REVIEW_REQUIRED_AFTER_DATA_LOCK" && row.external_link_evidence !== "DATA_REQUIRED"), "Merge candidates satisfy non-performance evidence fields", `${mergeCandidates.length} candidates`);
}

check(clusters.length === CLUSTERS.length && CLUSTERS.every((cluster) => clusters.some((row) => row.cluster === cluster.name && row.owner === cluster.owner)), "All six governed clusters are present", `${clusters.length}/${CLUSTERS.length}`);
check(ownership.length === WATCHLIST.length, "Query × page report covers every watchlist URL", `${ownership.length}/${WATCHLIST.length}`);
check(inspections.length === new Set([...WATCHLIST.map((item) => item.url), ...CLUSTERS.map((cluster) => cluster.owner)]).size, "Inspection register covers watchlist and owners", `${inspections.length} monitored URLs`);
check(protectedUrls.length === CLUSTERS.length, "All six Phase 1 owners are protected during observation", `${protectedUrls.length}/${CLUSTERS.length}`);

check(manifest.rawEvidenceCommitted === false, "Raw authenticated evidence is explicitly non-committed", String(manifest.rawEvidenceCommitted));
check(String(manifest.privateDerivedDirectory).startsWith(".artifacts/"), "Detailed derived evidence remains in the ignored artifact area", manifest.privateDerivedDirectory);
check(Array.isArray(manifest.privateDerivedFiles) && manifest.privateDerivedFiles.length >= 10, "Private derived dataset manifest is complete", `${manifest.privateDerivedFiles?.length ?? 0} derived files`);
check(Array.isArray(manifest.limitations) && manifest.limitations.length >= 5, "Search Console limitations are recorded", `${manifest.limitations.length} limitations`);
check(manifest.limitations.some((value) => value.includes("privacy")) && manifest.limitations.some((value) => value.includes("canonical")), "Privacy and canonical aggregation limits are explicit", "required limitations found");

const ignoredCheck = execFileSync("git", ["check-ignore", "-q", `${PRIVATE_EVIDENCE_DIR}/probe.csv`], { stdio: "ignore" });
check(ignoredCheck == null, "Private CSV evidence directory is ignored", PRIVATE_EVIDENCE_DIR);
const derivedIgnoredCheck = execFileSync("git", ["check-ignore", "-q", `${manifest.privateDerivedDirectory}/probe.csv`], { stdio: "ignore" });
check(derivedIgnoredCheck == null, "Private derived evidence directory is ignored", manifest.privateDerivedDirectory);
const forbiddenCommittedDetail = ["CLEANED_GSC_DATASET.csv", "QUERY_PERFORMANCE_TABLE.csv", "QUERY_PAGE_PERFORMANCE_TABLE.csv"]
  .filter((name) => fs.existsSync(path.join(AUDIT_DIR, name)));
check(forbiddenCommittedDetail.length === 0, "Raw/detailed query datasets are not emitted into the committed audit directory", forbiddenCommittedDetail.join(", ") || "none");
const trackedSensitive = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter((name) => /(^|\/)(client_secret|credentials|oauth|token)([^/]*)\.(json|ya?ml)$/i.test(name));
check(trackedSensitive.length === 0, "No obvious credential/token file is tracked", trackedSensitive.join(", ") || "none");

const applicationDiff = execFileSync("git", ["diff", "--name-only", "origin/main", "--", "src", "public", "astro.config.*", "wrangler.*"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
if (localReleaseCandidate) {
  const presentationBaseline = "f650d51755ae536ded81390719ed0c56923b3412";
  const approvedPresentationFiles = new Set([
    "src/components/ArticleCard.astro",
    "src/components/Footer.astro",
    "src/components/Header.astro",
    "src/components/LearningCard.astro",
    "src/components/SearchOverlay.astro",
    "src/layouts/Layout.astro",
    "src/pages/index.astro",
    "src/styles/global.css"
  ]);
  const releaseCandidateApplicationDiff = execFileSync("git", [
    "diff", "--name-only", presentationBaseline, "--", "src", "public", "astro.config.*", "wrangler.*"
  ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const untrackedApplicationFiles = execFileSync("git", [
    "ls-files", "--others", "--exclude-standard", "--", "src", "public", "astro.config.*", "wrangler.*"
  ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const completeApplicationDiff = [...new Set([...releaseCandidateApplicationDiff, ...untrackedApplicationFiles])];
  const unapprovedApplicationChanges = completeApplicationDiff
    .filter((file) => !approvedPresentationFiles.has(file));
  check(
    unapprovedApplicationChanges.length === 0,
    "Local release candidate is isolated to the approved presentation file set",
    unapprovedApplicationChanges.join(", ") || `${completeApplicationDiff.length} approved presentation files; no content, indexation, redirect, analytics, consent, advertising, or deployment configuration changes`
  );
} else {
  check(applicationDiff.length === 0, "Release A does not change public content or runtime behavior", applicationDiff.join(", ") || "no application diff");
}

const packageDocument = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const command of [
  "collect:phase2:gsc",
  "generate:phase2:measurement",
  "audit:phase2:measurement",
  "generate:phase2:decisions",
  "audit:phase2:decisions"
]) check(Boolean(packageDocument.scripts?.[command]), `Package command exists: ${command}`, packageDocument.scripts?.[command] ?? "missing");

const templateFiles = [
  "daily_performance.csv", "page_performance.csv", "query_performance.csv", "query_page_performance.csv",
  "country_performance.csv", "device_performance.csv", "search_appearance.csv", "ai_search_performance.csv",
  "multimodal_performance.csv", "url_inspection.csv"
];
check(templateFiles.every((name) => fs.existsSync(path.join(AUDIT_DIR, "import-templates", name))), "All private-import templates exist", `${templateFiles.length}/${templateFiles.length}`);

const report = {
  schemaVersion: 1,
  status: failures.length ? "FAIL" : "PASS",
  phase2Status: status.status,
  decisionGateOpen: status.decisionGateOpen,
  passed: passes.length,
  failed: failures.length,
  checks: [...passes.map((item) => ({ ...item, result: "PASS" })), ...failures.map((item) => ({ ...item, result: "FAIL" }))]
};
fs.writeFileSync(path.join(AUDIT_DIR, "PHASE_2_VALIDATION.json"), `${JSON.stringify(report, null, 2)}\n`);

for (const item of report.checks) console.log(`${item.result} ${item.name}: ${item.details}`);
if (failures.length) process.exitCode = 1;
