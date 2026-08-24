import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, "../../..");
const baselineSha = "83a685bcf942349e632ae043a1327b3ed53549df";
const read = (name) => fs.readFileSync(path.join(dir, name), "utf8");
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const required = [
  "ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv",
  "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv",
  "ECHO_BUDDHA_PROTECTED_URLS.csv",
  "ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv",
  "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv",
  "ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv",
  "ECHO_BUDDHA_SEARCH_MOMENTUM.csv",
  "ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv",
  "ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv",
  "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv",
  "ECHO_BUDDHA_LEGACY_URL_EQUITY.csv",
  "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv",
  "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv",
  "ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv",
  "ECHO_BUDDHA_SEO_PRESERVATION_CONTRACTS.md",
  "ECHO_BUDDHA_CHANGE_RISK_MATRIX.csv",
  "ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv",
  "ECHO_BUDDHA_POST_REMEDIATION_SEARCH_MONITORING.md",
  "ECHO_BUDDHA_FAMILY_SEARCH_PROTECTION.md",
  "ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv",
  "ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv",
  "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md"
];

function parseCsv(text, name) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error(`${name}: unterminated quoted field`);
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  while (rows.length && rows.at(-1).every((value) => value === "")) rows.pop();
  if (rows.length < 2) throw new Error(`${name}: missing data rows`);
  const width = rows[0].length;
  rows.forEach((values, index) => {
    if (values.length !== width) throw new Error(`${name}:${index + 1}: expected ${width} columns, found ${values.length}`);
  });
  const headers = rows[0];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]])));
}

const checks = [];
function check(name, condition, details = "") {
  checks.push({ name, pass: Boolean(condition), details });
}
function uniqueCount(rows, key) {
  return new Set(rows.map((row) => row[key])).size;
}
function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    counts[row[key]] = (counts[row[key]] || 0) + 1;
    return counts;
  }, {});
}

for (const name of required) {
  const fullPath = path.join(dir, name);
  check(`required_nonempty:${name}`, fs.existsSync(fullPath) && fs.statSync(fullPath).size > 0);
}

const csvNames = fs.readdirSync(dir).filter((name) => name.endsWith(".csv")).sort();
const csv = Object.fromEntries(csvNames.map((name) => [name, parseCsv(read(name), name)]));
check("all_csv_files_have_rectangular_nonempty_data", csvNames.length === 18, `${csvNames.length} CSV files`);

const search = csv["ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv"];
const registry = csv["ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv"];
const protectedRows = csv["ECHO_BUDDHA_PROTECTED_URLS.csv"];
const quality = csv["ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv"];
const queries = csv["ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv"];
const momentum = csv["ECHO_BUDDHA_SEARCH_MOMENTUM.csv"];
const backlinks = csv["ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv"];
const internal = csv["ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv"];
const canonical = csv["ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv"];
const survivors = csv["ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv"];
const mappings = csv["ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv"];
const valueElements = csv["ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv"];
const monitoring = csv["ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv"];
const quotes = csv["ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv"];
const readiness = csv["ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv"];

for (const [name, rows, urlKey] of [
  ["search", search, "url"], ["registry", registry, "URL"], ["protected", protectedRows, "URL"],
  ["momentum", momentum, "URL"], ["backlinks", backlinks, "URL"], ["internal", internal, "URL"]
]) {
  check(`${name}_covers_340_unique_urls`, rows.length === 340 && uniqueCount(rows, urlKey) === 340, `${rows.length} rows / ${uniqueCount(rows, urlKey)} unique`);
}

const tierCounts = countBy(registry, "protection_tier");
const expectedTierCounts = { SEO_P0_CRITICAL: 3, SEO_P1_HIGH: 26, SEO_P2_EMERGING: 138, SEO_P3_LIMITED: 63, SEO_UNKNOWN: 110 };
check("tier_distribution_exact", Object.entries(expectedTierCounts).every(([tier, count]) => tierCounts[tier] === count) && Object.keys(tierCounts).length === Object.keys(expectedTierCounts).length, JSON.stringify(tierCounts));
check("quality_matrix_matches_phase_2_scope", quality.length === 182 && uniqueCount(quality, "URL") === 182, `${quality.length} rows`);
check("query_rows_preserve_property_level_uncertainty", queries.length === 334 && queries.every((row) => row.ownership_type === "NO_SEARCH_DATA" && row.unique_query_asset === "NOT_VERIFIED"), `${queries.length} rows`);
check("backlinks_are_unknown_not_fake_zero", backlinks.every((row) => row.external_link_equity_present === "NOT_VERIFIED" && row.linking_domains === "NOT_AVAILABLE" && row.external_links === "NOT_AVAILABLE"));
check("quote_ecosystem_complete", quotes.length === 164 && uniqueCount(quotes, "URL") === 164, `${quotes.length} rows`);
check("canonical_overlap_map_nonempty", canonical.length === 189, `${canonical.length} rows`);
check("survivors_are_provisional", survivors.length === 34 && survivors.every((row) => row.phase_4_constraint.includes("no implementation authorization") || row.phase_4_constraint.includes("DO_NOT_AUTOMERGE")), `${survivors.length} rows`);
check("mappings_are_evaluation_only", mappings.length === 73 && mappings.every((row) => row.mapping_status === "PROVISIONAL_EVALUATION_ONLY" && row.redirect_suitability.startsWith("NOT_READY")), `${mappings.length} rows`);
check("mapping_sources_and_targets_are_specific_and_distinct", mappings.every((row) => row.source_url !== row.target_url && row.target_url !== "https://echobuddha.com/"));
check("p0_p1_value_contract_rows", valueElements.length === 29 && valueElements.every((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.protection_tier)), `${valueElements.length} rows`);
check("monitoring_covers_p0_p1_p2", monitoring.length === 167 && monitoring.every((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH", "SEO_P2_EMERGING"].includes(row.protection_tier)), `${monitoring.length} rows`);
check("phase_4_rows_unique", readiness.length === 144 && uniqueCount(readiness, "URL") === 144, `${readiness.length} rows`);
const readinessCounts = countBy(readiness, "phase_4_readiness");
check("phase_4_readiness_distribution", readinessCounts.DO_NOT_CHANGE_YET === 14 && readinessCounts.HIGH_RISK_REVIEW_REQUIRED === 70 && readinessCounts.MORE_DATA_REQUIRED === 60, JSON.stringify(readinessCounts));

const report = read("ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md");
const numberedSections = [...report.matchAll(/^## (\d+)\./gm)].map((match) => Number(match[1]));
check("report_has_sections_1_through_35", numberedSections.length === 35 && numberedSections.every((number, index) => number === index + 1), numberedSections.join(","));
check("report_status_is_partial", report.includes("Phase status: **PARTIAL**") && report.includes("**PARTIAL.**"));
check("report_has_no_change_attestation", report.includes("No content URL was deleted, merged, redirected, renamed, canonicalized away, noindexed, or materially rewritten."));
check("report_blocks_adsense_resubmission", report.includes("`ADSENSE_RESUBMISSION_STATUS: BLOCKED`") && report.includes("No AdSense review or resubmission was requested."));
check("report_private_treatment_attestation", report.includes("treated as a private repository"));

const validation = JSON.parse(read("ECHO_BUDDHA_PHASE_3_VALIDATION.json"));
check("declared_validation_is_partial", validation.status === "PARTIAL");
check("all_declared_completed_checks_true", Object.values(validation.completed_checks).every(Boolean));
check("all_material_pass_gaps_are_explicit", Object.keys(validation.material_gaps_preventing_pass).length === 6 && Object.values(validation.material_gaps_preventing_pass).every(Boolean));

const sourceDiff = spawnSync("git", ["diff", "--quiet", `${baselineSha}..HEAD`, "--", "src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"], { cwd: repo });
check("committed_production_source_matches_frozen_baseline", sourceDiff.status === 0, `git status ${sourceDiff.status}`);
const workingSourceDiff = spawnSync("git", ["diff", "--quiet", "--", "src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"], { cwd: repo });
check("working_tree_has_no_production_source_edits", workingSourceDiff.status === 0, `git status ${workingSourceDiff.status}`);

const manifest = JSON.parse(read("ECHO_BUDDHA_PHASE_3_METHOD_MANIFEST.json"));
const hashMismatches = Object.entries(manifest.artifact_sha256).filter(([name, expected]) => hash(read(name)) !== expected).map(([name]) => name);
check("method_manifest_hashes_match", hashMismatches.length === 0, hashMismatches.join(", "));
check("validator_is_recorded_in_manifest", Object.hasOwn(manifest.artifact_sha256, "validate-phase-3-growth-protection.mjs"));

const failures = checks.filter((item) => !item.pass);
const result = {
  validated_at: new Date().toISOString(),
  status: failures.length ? "FAIL" : "PASS_WITH_PHASE_STATUS_PARTIAL",
  phase_status: validation.status,
  checks_total: checks.length,
  checks_passed: checks.length - failures.length,
  failures,
  observed: { csv_files: csvNames.length, tier_counts: tierCounts, readiness_counts: readinessCounts, required_artifacts: required.length }
};
fs.writeFileSync(path.join(dir, "ECHO_BUDDHA_PHASE_3_INDEPENDENT_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
