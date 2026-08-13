import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const audit = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-10-search-console-measurement");
const out = path.resolve(root, process.env.PHASE10_AUDIT_OUT || path.join(audit, "phase-10-custom-validation.json"));
const checks = [];
function check(name, detail, fn) {
  try { fn(); checks.push({ name, detail, pass: true }); }
  catch (error) { checks.push({ name, detail: `${detail}: ${error.message}`, pass: false }); }
}
function requireFile(name) { const file = path.join(audit, name); if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`missing ${name}`); return fs.readFileSync(file, "utf8"); }
function lines(name) { return requireFile(name).trimEnd().split(/\r?\n/); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const mandatory = [
  "ECHO_BUDDHA_SEARCH_CONSOLE_REAL_WORLD_MEASUREMENT_REPORT.md", "phase-10-dataset-inventory.csv", "phase-10-data-quality-register.csv", "phase-10-data-freshness-register.csv", "phase-10-production-timeline.csv", "phase-10-deployment-attribution-analysis.csv", "phase-10-property-performance.csv", "phase-10-daily-performance.csv", "phase-10-period-comparison.csv", "phase-10-query-privacy-coverage.csv", "phase-10-device-performance.csv", "phase-10-country-performance.csv", "phase-10-page-performance-register.csv", "phase-10-page-family-performance.csv", "phase-10-homepage-vs-deep-content.csv", "phase-10-query-cluster-register.csv", "phase-10-query-to-owner-map.csv", "phase-10-primary-owner-scorecard.csv", "phase-10-support-page-scorecard.csv", "phase-10-gsc-cannibalization-review.csv", "phase-10-index-coverage-status.csv", "phase-10-indexed-performance-matrix.csv", "phase-10-gsc-vs-production-index-state.csv", "phase-10-gsc-sitemap-review.csv", "phase-10-url-inspection-register.csv", "phase-10-https-review.csv", "phase-10-enhancement-review.csv", "phase-10-internal-link-recognition-review.csv", "phase-10-external-link-review.csv", "phase-10-field-cwv-review.csv", "phase-10-manual-actions-security-review.csv", "phase-10-opportunity-register.csv", "phase-10-red-flag-register.csv", "phase-10-owner-gsc-action-items.csv", "phase-10-phase11-handoff.csv", "phase-10-validation-summary.csv", "MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv"
];

check("Deliverables", "All 37 mandatory CSVs and report exist", () => mandatory.forEach(requireFile));
check("Report", "Exactly 88 numbered sections and final qualified verdict", () => {
  const report = requireFile(mandatory[0]);
  assert((report.match(/^## \d+\./gm) || []).length === 88, "report section count is not 88");
  assert(report.includes("COMPLETE — OWNER GSC EVIDENCE PENDING"), "qualified Phase 10 status missing");
  assert(report.includes("READY FOR PHASE 11 WITH DOCUMENTED MEASUREMENT LIMITATIONS"), "qualified Phase 11 verdict missing");
});
check("Source snapshots", "44 CSVs are preserved under source-data", () => {
  const files = fs.readdirSync(path.join(audit, "source-data"), { recursive: true }).filter((f) => String(f).endsWith(".csv"));
  assert(files.length === 44, `expected 44 source CSVs, found ${files.length}`);
});
check("Dataset inventory", "Every source has a SHA-256 row", () => {
  const data = requireFile("phase-10-dataset-inventory.csv");
  assert(lines("phase-10-dataset-inventory.csv").length === 45, "expected header + 44 rows");
  assert((data.match(/[a-f0-9]{64}/g) || []).length === 44, "source hashes incomplete");
});
check("Property metrics", "Latest/previous property baselines are exact", () => {
  const data = requireFile("phase-10-property-performance.csv");
  for (const token of ['"15"', '"1375"', '"9"', '"230"', '"1.09%"', '"32.38"', '"42.93"']) assert(data.includes(token), `missing ${token}`);
});
check("Privacy", "Visible-query coverage and limitation are explicit", () => {
  const data = requireFile("phase-10-query-privacy-coverage.csv");
  assert(data.includes('"6.67%"') && data.includes('"46.04%"'), "privacy coverage mismatch");
  assert(data.includes("page clicks must not be contradicted by query zeros"), "page/query privacy warning missing");
});
check("Aggregate separation", "Page aggregates are never represented as property totals", () => {
  const report = requireFile(mandatory[0]);
  const families = requireFile("phase-10-page-family-performance.csv");
  assert(report.includes("Page-tab impressions were never used as property totals"), "report boundary missing");
  assert(families.includes("Page-tab aggregates are not property totals"), "family boundary missing");
});
check("Daily history", "50 actual daily rows and rolling metrics exist", () => {
  assert(lines("phase-10-daily-performance.csv").length === 51, "daily row count mismatch");
  assert(requireFile("phase-10-daily-performance.csv").includes("14-day impressions mean"), "rolling metrics missing");
});
check("Page register", "114 latest search-visible pages are classified", () => assert(lines("phase-10-page-performance-register.csv").length === 115, "page register mismatch"));
check("Query map", "263 visible queries are mapped without claiming observed page intersection", () => {
  const data = requireFile("phase-10-query-to-owner-map.csv");
  assert(lines("phase-10-query-to-owner-map.csv").length === 264, "query map mismatch");
  assert(data.includes("inference; query x page not supplied"), "inference boundary missing");
});
check("Owner scorecard", "All 40 authoritative owners are scorecarded", () => assert(lines("phase-10-primary-owner-scorecard.csv").length === 41, "owner count mismatch"));
check("Cannibalization", "No unsupported HIGH/CRITICAL case is asserted", () => {
  const data = requireFile("phase-10-gsc-cannibalization-review.csv");
  assert(data.includes("No HIGH/CRITICAL cannibalization evidence"), "conservative assessment missing");
  assert(!data.includes('"HIGH"') && !data.includes('"CRITICAL"'), "unsupported high-risk row present");
});
check("Index coverage", "322/26 aggregate and all six reasons are retained", () => {
  const report = requireFile(mandatory[0]);
  assert(report.includes("322 indexed and 26 not indexed"), "coverage totals missing");
  assert(lines("phase-10-index-coverage-status.csv").length === 7, "coverage reason count mismatch");
});
check("External evidence", "Sitemap, inspection, CWV, Manual Actions and Security remain owner-required", () => {
  for (const file of ["phase-10-gsc-sitemap-review.csv", "phase-10-url-inspection-register.csv", "phase-10-field-cwv-review.csv", "phase-10-manual-actions-security-review.csv"]) {
    assert(/OWNER [A-Z ]+ REQUIRED/.test(requireFile(file)), `${file} hides owner gap`);
  }
});
check("HTTPS and enhancement", "Supplied clean states are scoped correctly", () => {
  assert(requireFile("phase-10-https-review.csv").includes('"0"'), "HTTPS zero missing");
  assert(requireFile("phase-10-enhancement-review.csv").includes("Does not prove all structured data/site schema perfect"), "enhancement scope missing");
});
check("Links", "GSC lag and zero-external-row limitations are explicit", () => {
  assert(requireFile("phase-10-internal-link-recognition-review.csv").includes("Not proven by count alone"), "link-count boundary missing");
  assert(requireFile("phase-10-external-link-review.csv").includes("does not prove Echo Buddha has zero backlinks"), "external limitation missing");
});
check("Protection", "All 336 routes are frozen before Phase 11", () => {
  const data = requireFile("MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv");
  assert(lines("MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv").length === 337, "protection row count mismatch");
  assert(data.includes("Verification only; runtime/manual slots disabled"), "AdSense protection missing");
});
check("No production remediation", "Report forbids and records zero production changes", () => {
  const report = requireFile(mandatory[0]);
  assert(report.includes("ZERO production content, URL, indexability, navigation, consent or AdSense changes"), "zero-change statement missing");
  assert(report.includes("Production was not deployed"), "no-deploy statement missing");
});
check("No causal overclaim", "Deployment chronology and recrawl limits are explicit", () => {
  const report = requireFile(mandatory[0]);
  assert(report.includes("No phase is credited causally"), "causation boundary missing");
  assert(report.includes("zero supplied performance days after the final August 13 release"), "post-deploy gap missing");
});

const failures = checks.filter((c) => !c.pass);
const result = { generatedAt: new Date().toISOString(), totalChecks: checks.length, passed: checks.length - failures.length, failed: failures.length, pass: failures.length === 0, checks };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
if (failures.length) { failures.forEach((f) => console.error(`FAIL ${f.name}: ${f.detail}`)); process.exitCode = 1; }
else console.log(`Phase 10 validation passed: ${checks.length}/${checks.length} checks.`);
