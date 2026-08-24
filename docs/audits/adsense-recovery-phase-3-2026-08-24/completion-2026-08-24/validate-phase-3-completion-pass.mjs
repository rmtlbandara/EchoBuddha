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
const checkpoint = "9fac77455a74bef99a28508018ce2a7c57e43e1c";
const read = (file) => fs.readFileSync(file, "utf8");
const sha = (text) => crypto.createHash("sha256").update(text).digest("hex");

function parseCsv(text, name) {
  const rows = []; let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false; else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (quoted) throw new Error(`${name}: unterminated quote`);
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  while (rows.length && rows.at(-1).every((value) => value === "")) rows.pop();
  if (!rows.length) throw new Error(`${name}: empty`);
  const width = rows[0].length;
  rows.forEach((values, index) => { if (values.length !== width) throw new Error(`${name}:${index + 1}: non-rectangular`); });
  const headers = rows[0];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
const csv = (base, name) => parseCsv(read(path.join(base, name)), name);
const unique = (rows, key) => new Set(rows.map((row) => row[key])).size;
const countBy = (rows, key) => rows.reduce((counts, row) => { counts[row[key]] = (counts[row[key]] || 0) + 1; return counts; }, {});
const checks = [];
const check = (name, condition, details = "") => checks.push({ name, pass: Boolean(condition), details });

const analytics = JSON.parse(read(path.join(api, "search-analytics-evidence.json")));
const rawInspections = JSON.parse(read(path.join(api, "url-inspection-evidence.json")));
const links = JSON.parse(read(path.join(phase, "source-evidence/completion-2026-08-24/ECHO_BUDDHA_PHASE_3_CURRENT_LINKS_REPORT_SNAPSHOT.json")));
const original = JSON.parse(read(path.join(dir, "ECHO_BUDDHA_PHASE_3_ORIGINAL_54_CHECKPOINT_RERUN.json")));
const search = csv(phase, "ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv");
const registry = csv(phase, "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv");
const protectedRows = csv(phase, "ECHO_BUDDHA_PROTECTED_URLS.csv");
const quality = csv(phase, "ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv");
const conflicts = csv(phase, "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv");
const ownership = csv(phase, "ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv");
const momentum = csv(phase, "ECHO_BUDDHA_SEARCH_MOMENTUM.csv");
const backlinks = csv(phase, "ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv");
const internal = csv(phase, "ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv");
const canonical = csv(phase, "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv");
const survivors = csv(phase, "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv");
const mappings = csv(phase, "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv");
const values = csv(phase, "ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv");
const monitoring = csv(phase, "ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv");
const quotes = csv(phase, "ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv");
const readiness = csv(phase, "ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv");
const queryPage = csv(dir, "ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv");
const inspections = csv(dir, "ECHO_BUDDHA_GSC_URL_INSPECTION.csv");
const pagePerformance = csv(dir, "ECHO_BUDDHA_PHASE_3_NEW_STANDARD_PAGE_PERFORMANCE.csv");
const tierDiff = csv(dir, "ECHO_BUDDHA_PHASE_3_PROTECTION_TIER_DIFF.csv");
const doNotDiff = csv(dir, "ECHO_BUDDHA_DO_NOT_CHANGE_YET_DIFF.csv");
const ga = csv(dir, "ECHO_BUDDHA_GENERATIVE_AI_SEARCH_VISIBILITY.csv");
const newEvidence = csv(dir, "ECHO_BUDDHA_PHASE_3_NEW_GSC_EVIDENCE.csv");
const coverage = csv(dir, "ECHO_BUDDHA_PHASE_3_COVERAGE_EXCEPTION_RECONCILIATION.csv");
const internalRecon = csv(dir, "ECHO_BUDDHA_PHASE_3_GSC_INTERNAL_LINK_RECONCILIATION.csv");

check("checkpoint_verified", spawnSync("git", ["cat-file", "-e", `${checkpoint}^{commit}`], { cwd: repo }).status === 0);
check("original_54_rerun_passes", original.checks_total === 54 && original.checks_passed === 54 && original.failures.length === 0, `${original.checks_passed}/${original.checks_total}`);
check("exact_readonly_scope", analytics.scope === "https://www.googleapis.com/auth/webmasters.readonly" && rawInspections.scope === analytics.scope);
check("finalized_date_and_windows", analytics.data_state === "final" && analytics.finalized_end_date === "2026-08-21" && analytics.windows.recovery.startDate === "2026-06-23" && analytics.windows.latest28.startDate === "2026-07-25" && analytics.windows.latest28.endDate === "2026-08-21" && analytics.windows.previous28.startDate === "2026-06-27" && analytics.windows.previous28.endDate === "2026-07-24");
check("query_page_api_periods", analytics.sitewide.recovery.query_pages.row_count === 361 && analytics.sitewide.latest28.query_pages.row_count === 187 && analytics.sitewide.previous28.query_pages.row_count === 230);
check("query_page_csv_reconciles", queryPage.filter((row) => row.window_name === "recovery").length >= 361 && queryPage.filter((row) => row.window_name === "latest28").length >= 187 && queryPage.filter((row) => row.window_name === "previous28").length >= 230 && queryPage.every((row) => row.query && row.page && row.data_state === "final" && !row.error), `${queryPage.length} rows`);
check("page_filtered_174_complete", analytics.page_filtered_queries.targets.length === 174 && unique(analytics.page_filtered_queries.targets, "page") === 174 && analytics.page_filtered_queries.targets.every((target) => ["recovery", "latest28", "previous28"].every((window) => target.windows[window])));
check("page_comparison_api_and_csv", analytics.sitewide.latest28.pages.row_count === 139 && analytics.sitewide.previous28.pages.row_count === 115 && pagePerformance.filter((row) => row.window_name === "recovery").length === 183 && pagePerformance.filter((row) => row.window_name === "latest28").length === 139 && pagePerformance.filter((row) => row.window_name === "previous28").length === 115);
check("property_totals_and_privacy_gap", ["recovery", "latest28", "previous28"].every((window) => analytics.sitewide[window].property.row_count === 1) && analytics.sitewide.recovery.property.rows[0].impressions === 2629 && analytics.sitewide.recovery.queries.rows.reduce((sum, row) => sum + row.impressions, 0) === 1018);
check("query_ownership_rebuilt", ownership.length === 341 && ownership.every((row) => ["STRONG_SINGLE_OWNER", "PRIMARY_WITH_SUPPORT", "SHARED_INTENT", "OWNERSHIP_CONFLICT", "UNSTABLE_OWNER", "NO_VISIBLE_QUERY_DATA"].includes(row.ownership_type)));
check("safe_visible_owner_language", ownership.filter((row) => row.unique_query_asset === "VERIFIED_VISIBLE_QUERY_OWNER").length > 0 && ownership.every((row) => row.unique_query_asset !== "ABSOLUTELY_UNIQUE_QUERY_OWNER" && row.old_ownership_type));
check("raw_url_inspection_340_success", rawInspections.inventory_count === 340 && rawInspections.results.length === 340 && unique(rawInspections.results, "URL") === 340 && rawInspections.results.every((row) => row.http_status === 200));
check("inspection_csv_complete", inspections.length === 340 && unique(inspections, "URL") === 340 && inspections.every((row) => row.verdict && row.coverage_state && row.robots_state && row.indexing_state && row.page_fetch_state && !row.error));
check("canonical_crawl_where_available", inspections.filter((row) => row.google_canonical).length === 331 && inspections.filter((row) => row.last_crawl_time).length === 331);
check("external_links_actually_checked", links.classification === "GSC_LINKS_REPORT_RETURNED_NO_USABLE_ROWS" && links.exports.length === 2 && links.exports.every((item) => item.data_rows === 0));
check("backlinks_reassessed_not_fake_zero", backlinks.length === 340 && backlinks.every((row) => row.external_link_equity_present !== "NOT_VERIFIED" && row.external_links !== "0" && row.evidence.includes("not proof of zero backlinks")));
check("core_inventory_340_unique", search.length === 340 && unique(search, "url") === 340 && [registry, protectedRows, momentum, backlinks, internal].every((rows) => rows.length === 340 && unique(rows, "URL") === 340));
check("registry_protected_identical", JSON.stringify(registry) === JSON.stringify(protectedRows));
const tiers = countBy(registry, "protection_tier");
check("tiers_recomputed_340", Object.values(tiers).reduce((sum, value) => sum + value, 0) === 340 && ["SEO_P0_CRITICAL", "SEO_P1_HIGH", "SEO_P2_EMERGING", "SEO_P3_LIMITED", "SEO_UNKNOWN"].every((tier) => Object.hasOwn(tiers, tier)), JSON.stringify(tiers));
check("tier_diff_auditable", tierDiff.length === 340 && unique(tierDiff, "URL") === 340 && tierDiff.every((row) => row.old_protection_tier && row.new_protection_tier && row.old_momentum && row.new_momentum && row.old_query_ownership && row.new_query_ownership));
const priorStrong = tierDiff.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.old_protection_tier));
check("no_prior_p0_p1_downgrade", priorStrong.length === 29 && priorStrong.every((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.new_protection_tier)));
check("documented_p0s_preserved", ["https://echobuddha.com/articles/right-speech-buddhism/", "https://echobuddha.com/quotes/letting-go/", "https://echobuddha.com/"].every((url) => registry.find((row) => row.URL === url)?.protection_tier === "SEO_P0_CRITICAL"));
check("seo_unknown_genuinely_unresolved", tiers.SEO_UNKNOWN === 4 && tierDiff.filter((row) => row.new_protection_tier === "SEO_UNKNOWN").every((row) => row.google_coverage_state === "URL is unknown to Google"));
check("momentum_recomputed_with_diff", momentum.length === 340 && momentum.every((row) => row.evidence.includes("2026-07-25..2026-08-21") && row.evidence.includes("2026-06-27..2026-07-24") && row.old_classification && row.classification_change));
check("emerging_thresholds", momentum.filter((row) => row.emerging_winner === "true").every((row) => Number(row.click_delta) >= 1 || Number(row.impression_delta) >= 25));
check("quality_and_surgical_conflicts", quality.length === 182 && unique(quality, "URL") === 182 && conflicts.length >= 13 && conflicts.every((row) => row.required_strategy.startsWith("SURGICAL_REMEDIATION_REQUIRED")));
check("survivors_34_recomputed", survivors.length === 34 && unique(survivors, "cluster_id") === 34 && survivors.every((row) => ["HIGH_CONFIDENCE", "MEDIUM_CONFIDENCE", "LOW_CONFIDENCE"].includes(row.survivor_confidence) && row.evidence_date === "2026-08-21" && /Phase 4|DO_NOT_AUTOMERGE/.test(row.phase_4_constraint)));
check("mappings_73_recomputed", mappings.length === 73 && new Set(mappings.map((row) => `${row.source_url}\u0000${row.target_url}`)).size === 73 && mappings.every((row) => row.source_url !== row.target_url && row.target_url !== "https://echobuddha.com/" && row.mapping_confidence && row.query_overlap_jaccard && row.google_source_canonical && row.google_target_canonical));
check("mappings_provisional_no_redirect_ready", mappings.every((row) => row.mapping_status === "PROVISIONAL_EVALUATION_ONLY" && row.redirect_suitability.startsWith("NOT_READY_FOR_IMPLEMENTATION") && row.phase_4_readiness !== "READY_FOR_REDIRECT_IMPLEMENTATION"));
check("old_do_not_change_14_reviewed", doNotDiff.length === 14 && unique(doNotDiff, "URL") === 14 && doNotDiff.every((row) => row.reason.includes("Query status")));
check("phase4_readiness_evidence_only", readiness.length === 144 && unique(readiness, "URL") === 144 && readiness.every((row) => row.query_owner_status && row.backlink_status === "GSC_LINKS_CHECKED_NO_USABLE_ROWS" && row.canonical_state && row.constraint.includes("No redirect") && row.phase_4_readiness !== "READY_FOR_REDIRECT_IMPLEMENTATION"));
check("monitoring_and_value_contracts", monitoring.length === tiers.SEO_P0_CRITICAL + tiers.SEO_P1_HIGH + tiers.SEO_P2_EMERGING && monitoring.every((row) => row.performance_window.includes("2026-08-21")) && values.length === tiers.SEO_P0_CRITICAL + tiers.SEO_P1_HIGH);
check("canonical_map_updated", canonical.length === 189 && canonical.every((row) => row.google_selected_canonical_if_known !== "NOT_AVAILABLE" && !row.canonical_flags.includes("CANONICAL_UNKNOWN_GOOGLE_SELECTED")));
check("quotes_and_internal_refreshed", quotes.length === 164 && quotes.every((row) => row.external_links === "GSC_LINKS_CHECKED_NO_USABLE_ROWS") && internal.every((row) => Object.hasOwn(row, "gsc_internal_links_reported_2026_08_24") && Object.hasOwn(row, "url_inspection_internal_referrers")) && internalRecon.length > 0);
check("generative_ai_separate", ga.length === 34 && ga.every((row) => row.evidence_class === "SUPPLEMENTAL_SEARCH_APPEARANCE_EVIDENCE"));
check("workbooks_and_coverage_reconciled", newEvidence.length === 18 && newEvidence.some((row) => row.report_type === "STANDARD_WEB_PERFORMANCE") && newEvidence.some((row) => row.report_type === "GENERATIVE_AI_SEARCH_APPEARANCE") && newEvidence.some((row) => row.duplicate_or_scope_relation.startsWith("CONTENT_DUPLICATE_OF:")) && coverage.length === 65 && coverage.every((row) => row.reconciliation_state));
const report = read(path.join(phase, "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md"));
check("primary_report_35_pass_boundaries", [...report.matchAll(/^## (\d+)\./gm)].length === 35 && report.includes("Phase status: **PASS**") && report.includes("ADSENSE_RESUBMISSION_STATUS: BLOCKED") && report.includes("No content URL was deleted, merged, redirected, renamed, canonicalized away, noindexed, or materially rewritten."));
const completionReport = read(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_REPORT.md"));
const gap = read(path.join(dir, "ECHO_BUDDHA_PHASE_3_EVIDENCE_GAP_CLOSURE.md"));
check("completion_report_and_gaps", completionReport.includes("PHASE_3_STATUS = PASS") && completionReport.includes("does not begin Phase 4") && gap.includes("No unresolved material Phase 3 first-party evidence blocker remains") && !gap.includes("| BLOCKED |"));
const productionPaths = ["src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"];
check("production_committed_and_working_unchanged", spawnSync("git", ["diff", "--quiet", `${baseline}..HEAD`, "--", ...productionPaths], { cwd: repo }).status === 0 && spawnSync("git", ["diff", "--quiet", "--", ...productionPaths], { cwd: repo }).status === 0 && !spawnSync("git", ["ls-files", "--others", "--exclude-standard", "--", ...productionPaths], { cwd: repo, encoding: "utf8" }).stdout.trim());
const manifest = JSON.parse(read(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_METHOD_MANIFEST.json")));
const mismatches = Object.entries(manifest.artifact_sha256).filter(([relative, expected]) => sha(read(path.resolve(dir, relative))) !== expected).map(([relative]) => relative);
check("manifest_artifact_hashes", mismatches.length === 0, mismatches.join(", "));
check("manifest_evidence_hashes", manifest.inputs.search_analytics_api.sha256 === sha(read(path.join(api, "search-analytics-evidence.json"))) && manifest.inputs.url_inspection_api.sha256 === sha(read(path.join(api, "url-inspection-evidence.json"))));

const failures = checks.filter((item) => !item.pass);
const result = { validated_at: new Date().toISOString(), status: failures.length ? "FAIL" : "PASS", phase_status: failures.length ? "NOT_ELIGIBLE_FOR_PASS" : "PASS", checks_total: checks.length, checks_passed: checks.length - failures.length, failures, observed: { tiers, ownership_types: countBy(ownership, "ownership_type"), inspection_verdicts: countBy(inspections, "verdict"), survivor_confidence: countBy(survivors, "survivor_confidence"), readiness: countBy(readiness, "phase_4_readiness") } };
fs.writeFileSync(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
