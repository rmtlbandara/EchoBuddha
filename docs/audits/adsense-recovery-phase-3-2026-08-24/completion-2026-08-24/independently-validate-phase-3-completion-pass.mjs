import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const dir = path.dirname(fileURLToPath(import.meta.url));
const phase = path.dirname(dir);
const repo = path.resolve(phase, "../../..");
const api = path.join(phase, "source-evidence/completion-2026-08-24/api");
const baseline = "83a685bcf942349e632ae043a1327b3ed53549df";
const read = (file) => fs.readFileSync(file, "utf8");
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function csv(file) {
  const text = read(file), matrix = []; let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) { const char = text[i]; if (quoted) { if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; } else if (char === '"') quoted = false; else field += char; } else if (char === '"') quoted = true; else if (char === ",") { row.push(field); field = ""; } else if (char === "\n") { row.push(field.replace(/\r$/, "")); matrix.push(row); row = []; field = ""; } else field += char; }
  if (field || row.length) { row.push(field); matrix.push(row); }
  while (matrix.length && matrix.at(-1).every((value) => !value)) matrix.pop();
  const width = matrix[0].length; if (matrix.some((values) => values.length !== width)) throw new Error(`${file}: non-rectangular`);
  const headers = matrix[0]; return matrix.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
const checks = []; const check = (name, pass, details = "") => checks.push({ name, pass: Boolean(pass), details });
const analytics = JSON.parse(read(path.join(api, "search-analytics-evidence.json")));
const rawInspection = JSON.parse(read(path.join(api, "url-inspection-evidence.json")));
const registry = csv(path.join(phase, "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv"));
const ownership = csv(path.join(phase, "ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv"));
const momentum = csv(path.join(phase, "ECHO_BUDDHA_SEARCH_MOMENTUM.csv"));
const survivors = csv(path.join(phase, "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv"));
const mappings = csv(path.join(phase, "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv"));
const readiness = csv(path.join(phase, "ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv"));
const queryPage = csv(path.join(dir, "ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv"));
const inspections = csv(path.join(dir, "ECHO_BUDDHA_GSC_URL_INSPECTION.csv"));
const tierDiff = csv(path.join(dir, "ECHO_BUDDHA_PHASE_3_PROTECTION_TIER_DIFF.csv"));
const completionValidation = JSON.parse(read(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_VALIDATION.json")));
const original = JSON.parse(read(path.join(dir, "ECHO_BUDDHA_PHASE_3_ORIGINAL_54_CHECKPOINT_RERUN.json")));
const manifest = JSON.parse(read(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_METHOD_MANIFEST.json")));
const unique = (rows, key) => new Set(rows.map((row) => row[key])).size;
const counts = (rows, key) => rows.reduce((result, row) => { result[row[key]] = (result[row[key]] || 0) + 1; return result; }, {});

check("raw_evidence_files_nonempty", fs.statSync(path.join(api, "search-analytics-evidence.json")).size > 1000 && fs.statSync(path.join(api, "url-inspection-evidence.json")).size > 1000);
check("exact_readonly_scope", analytics.scope === "https://www.googleapis.com/auth/webmasters.readonly" && rawInspection.scope === analytics.scope);
check("final_windows_nonoverlap", analytics.windows.previous28.endDate < analytics.windows.latest28.startDate && analytics.windows.latest28.endDate === analytics.finalized_end_date);
check("sitewide_query_page_counts", analytics.sitewide.recovery.query_pages.rows.length === 361 && analytics.sitewide.latest28.query_pages.rows.length === 187 && analytics.sitewide.previous28.query_pages.rows.length === 230);
check("flattened_query_page_at_least_raw", queryPage.filter((row) => row.window_name === "recovery").length >= 361 && queryPage.filter((row) => row.window_name === "latest28").length >= 187 && queryPage.filter((row) => row.window_name === "previous28").length >= 230);
check("targeted_queries_cover_174", analytics.page_filtered_queries.targets.length === 174 && new Set(analytics.page_filtered_queries.targets.map((row) => row.page)).size === 174);
check("inspection_raw_and_csv_join", rawInspection.results.length === 340 && inspections.length === 340 && unique(rawInspection.results, "URL") === 340 && unique(inspections, "URL") === 340 && rawInspection.results.every((row) => row.http_status === 200) && rawInspection.results.every((row) => inspections.some((item) => item.URL === row.URL)));
check("inventory_join_340", registry.length === 340 && unique(registry, "URL") === 340 && registry.every((row) => inspections.some((item) => item.URL === row.URL)));
check("canonical_and_crawl_counts", inspections.filter((row) => row.google_canonical).length === 331 && inspections.filter((row) => row.last_crawl_time).length === 331);
const tierCounts = counts(registry, "protection_tier");
check("tier_total_and_unknown", Object.values(tierCounts).reduce((sum, value) => sum + value, 0) === 340 && tierCounts.SEO_UNKNOWN === 4, JSON.stringify(tierCounts));
check("prior_strong_preserved", tierDiff.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.old_protection_tier)).every((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.new_protection_tier)));
check("ownership_safe_claims", ownership.length === 341 && ownership.some((row) => row.unique_query_asset === "VERIFIED_VISIBLE_QUERY_OWNER") && ownership.every((row) => row.unique_query_asset !== "ABSOLUTELY_UNIQUE_QUERY_OWNER"));
check("momentum_exact_windows", momentum.length === 340 && momentum.every((row) => row.evidence.includes("2026-07-25..2026-08-21") && row.evidence.includes("2026-06-27..2026-07-24")));
check("survivor_clusters_complete_safe", survivors.length === 34 && unique(survivors, "cluster_id") === 34 && survivors.every((row) => /Phase 4|DO_NOT_AUTOMERGE/.test(row.phase_4_constraint)));
check("mappings_complete_safe", mappings.length === 73 && mappings.every((row) => row.source_url !== row.target_url && row.mapping_status === "PROVISIONAL_EVALUATION_ONLY" && row.redirect_suitability.startsWith("NOT_READY_FOR_IMPLEMENTATION")));
check("readiness_no_redirect_implementation", readiness.length === 144 && readiness.every((row) => row.phase_4_readiness !== "READY_FOR_REDIRECT_IMPLEMENTATION"));
check("original_and_completion_validations", original.checks_passed === 54 && original.checks_total === 54 && completionValidation.status === "PASS" && completionValidation.checks_passed === completionValidation.checks_total);
const manifestMismatches = Object.entries(manifest.artifact_sha256).filter(([relative, expected]) => sha(path.resolve(dir, relative)) !== expected).map(([relative]) => relative);
check("manifest_hashes_independent", manifestMismatches.length === 0, manifestMismatches.join(", "));
const productionPaths = ["src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"];
check("production_frozen", spawnSync("git", ["diff", "--quiet", `${baseline}..HEAD`, "--", ...productionPaths], { cwd: repo }).status === 0 && spawnSync("git", ["diff", "--quiet", "--", ...productionPaths], { cwd: repo }).status === 0);
const report = read(path.join(phase, "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md"));
check("pass_boundary_attested", report.includes("Phase status: **PASS**") && report.includes("ADSENSE_RESUBMISSION_STATUS: BLOCKED") && report.includes("No content URL was deleted"));

const failures = checks.filter((item) => !item.pass);
const output = { validated_at: new Date().toISOString(), status: failures.length ? "FAIL" : "PASS", checks_total: checks.length, checks_passed: checks.length - failures.length, failures, observed: { tier_counts: tierCounts, ownership_types: counts(ownership, "ownership_type"), inspection_verdicts: counts(inspections, "verdict"), survivor_confidence: counts(survivors, "survivor_confidence") } };
fs.writeFileSync(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_INDEPENDENT_VALIDATION.json"), `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
