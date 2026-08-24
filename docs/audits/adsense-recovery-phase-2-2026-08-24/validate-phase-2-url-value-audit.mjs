import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, "../../..");
const baseline = "83a685bcf942349e632ae043a1327b3ed53549df";
const read = (name) => fs.readFileSync(path.join(dir, name), "utf8");
const bool = (value) => String(value).toLowerCase() === "true";

const parseCsv = (text) => {
  const rows = [];
  let row = [], value = "", quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (char === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quote = false;
      else value += char;
    } else if (char === '"') quote = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() ?? [];
  const objects = rows.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((header, i) => [header, r[i] ?? ""])));
  return { headers, rows: objects, widthsValid: rows.filter((r) => r.some(Boolean)).every((r) => r.length === headers.length) };
};

const required = [
  "ECHO_BUDDHA_URL_VALUE_SCORES.csv",
  "ECHO_BUDDHA_SCORING_METHODOLOGY.md",
  "ECHO_BUDDHA_SCORING_CALIBRATION.md",
  "ECHO_BUDDHA_EXTERNAL_VALUE_BENCHMARK.csv",
  "ECHO_BUDDHA_POLICY_RISK_MATRIX.csv",
  "ECHO_BUDDHA_SCORE_DISTRIBUTION.md",
  "ECHO_BUDDHA_CONTENT_FAMILY_VALUE_REPORT.md",
  "ECHO_BUDDHA_INTENT_CLUSTER_SCORECARD.md",
  "ECHO_BUDDHA_QUOTE_VALUE_SCORECARD.md",
  "ECHO_BUDDHA_SEO_EQUITY_QUALITY_CONFLICTS.csv",
  "ECHO_BUDDHA_LOW_VALUE_RISK_MAP.md",
  "ECHO_BUDDHA_BORDERLINE_URL_REVIEW.md",
  "ECHO_BUDDHA_NON_CONTENT_SURFACE_ASSESSMENT.md",
  "ECHO_BUDDHA_PHASE_2_URL_VALUE_AUDIT.md"
];
const weights = { independent_purpose: 15, originality: 15, external_value: 15, internal_differentiation: 15, completeness: 10, editorial_contribution: 10, trust: 5, ux: 5, search_equity: 5, return_value: 5 };
const dimensions = Object.keys(weights);
const scoresCsv = parseCsv(read("ECHO_BUDDHA_URL_VALUE_SCORES.csv"));
const benchmarksCsv = parseCsv(read("ECHO_BUDDHA_EXTERNAL_VALUE_BENCHMARK.csv"));
const policyCsv = parseCsv(read("ECHO_BUDDHA_POLICY_RISK_MATRIX.csv"));
const reviewsCsv = parseCsv(read("ECHO_BUDDHA_SECOND_PASS_REVIEW.csv"));
const conflictsCsv = parseCsv(read("ECHO_BUDDHA_SEO_EQUITY_QUALITY_CONFLICTS.csv"));
const queuesCsv = parseCsv(read("ECHO_BUDDHA_PROVISIONAL_REVIEW_QUEUES.csv"));
const validation = JSON.parse(read("ECHO_BUDDHA_PHASE_2_VALIDATION.json"));
const snapshot = JSON.parse(read("ECHO_BUDDHA_PHASE_2_EXTERNAL_SOURCE_SNAPSHOT.json"));
const integrity = JSON.parse(read("ECHO_BUDDHA_PHASE_2_INPUT_INTEGRITY.json"));

const expectedBand = (score) => score >= 85 ? ["85–100", "STRONG_KEEP_CANDIDATE"] : score >= 70 ? ["70–84", "KEEP_ENHANCE_CANDIDATE"] : score >= 50 ? ["50–69", "MAJOR_REVIEW_CANDIDATE"] : score >= 30 ? ["30–49", "CONSOLIDATION_INDEXATION_REVIEW_CANDIDATE"] : ["0–29", "RETIREMENT_REVIEW_CANDIDATE"];
const scoreArithmeticValid = scoresCsv.rows.every((row) => {
  const rawValid = dimensions.every((key) => Number.isInteger(Number(row[`${key}_raw`])) && Number(row[`${key}_raw`]) >= 0 && Number(row[`${key}_raw`]) <= 5);
  const weightedValid = dimensions.every((key) => Math.abs(Number(row[`${key}_weighted`]) - Number(row[`${key}_raw`]) / 5 * weights[key]) < 0.001);
  const total = Math.round(dimensions.reduce((sum, key) => sum + Number(row[`${key}_raw`]) / 5 * weights[key], 0));
  const [band, klass] = expectedBand(total);
  return rawValid && weightedValid && total === Number(row.publisher_value_score) && band === row.score_band && klass === row.provisional_review_class;
});
const benchmarkCounts = new Map();
for (const row of benchmarksCsv.rows) benchmarkCounts.set(row["EchoBuddha URL"], (benchmarkCounts.get(row["EchoBuddha URL"]) ?? 0) + 1);
const reviewedUrls = new Set(reviewsCsv.rows.map((row) => row.URL));
const expectedReviewUrls = scoresCsv.rows.filter((row) => bool(row.second_review_required)).map((row) => row.URL);
const borderlineUrls = scoresCsv.rows.filter((row) => [[47, 52], [67, 72], [82, 87]].some(([min, max]) => Number(row.publisher_value_score) >= min && Number(row.publisher_value_score) <= max)).map((row) => row.URL);
const sourceDiff = spawnSync("git", ["diff", "--quiet", `${baseline}..HEAD`, "--", "src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"], { cwd: repo });
const report = read("ECHO_BUDDHA_PHASE_2_URL_VALUE_AUDIT.md");

const checks = {
  required_artifacts_nonempty: required.every((name) => fs.existsSync(path.join(dir, name)) && fs.statSync(path.join(dir, name)).size > 0),
  all_csv_widths_valid: [scoresCsv, benchmarksCsv, policyCsv, reviewsCsv, conflictsCsv, queuesCsv].every((csv) => csv.widthsValid),
  master_score_rows_182: scoresCsv.rows.length === 182,
  master_score_urls_unique: new Set(scoresCsv.rows.map((row) => row.URL)).size === 182,
  ten_dimensions_have_score_evidence_confidence: scoresCsv.rows.every((row) => dimensions.every((key) => row[`${key}_raw`] !== "" && row[`${key}_weighted`] !== "" && row[`${key}_evidence`] && ["HIGH", "MEDIUM", "LOW"].includes(row[`${key}_confidence`]))),
  score_arithmetic_band_and_class_valid: scoreArithmeticValid,
  benchmark_rows_exactly_three_per_url: benchmarksCsv.rows.length === 546 && scoresCsv.rows.every((row) => benchmarkCounts.get(row.URL) === 3),
  every_benchmark_retrieved: benchmarksCsv.rows.every((row) => bool(row["benchmark retrieved"])),
  current_google_policy_sources_five_of_five: snapshot.google_policy_accessible_count === 5,
  policy_matrix_rows_340_unique: policyCsv.rows.length === 340 && new Set(policyCsv.rows.map((row) => row.URL)).size === 340,
  conflicts_cover_all_scored_urls: conflictsCsv.rows.length === 182 && new Set(conflictsCsv.rows.map((row) => row.URL)).size === 182,
  second_review_records_complete: expectedReviewUrls.length === reviewsCsv.rows.length && expectedReviewUrls.every((url) => reviewedUrls.has(url)),
  borderline_urls_second_reviewed: borderlineUrls.every((url) => reviewedUrls.has(url)),
  query_ownership_not_fabricated: scoresCsv.rows.every((row) => row.query_ownership === "NO_DATA"),
  no_blocked_score: scoresCsv.rows.every((row) => row.scoring_status === "SCORED"),
  no_final_disposition_column: !scoresCsv.headers.some((header) => /final.*(disposition|action)|delete|redirect|noindex/i.test(header)),
  phase_validation_pass: validation.status === "PASS" && Object.values(validation.checks).every(Boolean),
  input_integrity_pass: !integrity.baseline_drift_detected && integrity.live_sitemap_url_count === 194 && integrity.live_sitemap_unique_url_count === 194,
  no_production_source_changes: sourceDiff.status === 0,
  report_contains_35_sections: Array.from({ length: 35 }, (_, i) => `## ${i + 1}.`).every((heading) => report.includes(heading)),
  report_keeps_adsense_blocked: report.includes("ADSENSE_RESUBMISSION_STATUS: BLOCKED") && report.includes("No AdSense review or resubmission was requested."),
  report_confirms_no_remediation: report.includes("No content URL was deleted, merged, redirected, noindexed, rewritten, renamed or otherwise remediated."),
  private_repository_confirmation_present: report.includes("treated as a private repository throughout")
};

const result = { status: Object.values(checks).every(Boolean) ? "PASS" : "FAIL", checks, counts: { score_rows: scoresCsv.rows.length, benchmark_rows: benchmarksCsv.rows.length, policy_rows: policyCsv.rows.length, second_review_rows: reviewsCsv.rows.length, queue_rows: queuesCsv.rows.length, required_artifacts: required.length } };
console.log(JSON.stringify(result, null, 2));
if (result.status !== "PASS") process.exitCode = 1;
