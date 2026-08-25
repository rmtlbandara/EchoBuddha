import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const audit = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25");
const required = [
  "ECHO_BUDDHA_PHASE_11_URL_TECHNICAL_INVENTORY.csv", "ECHO_BUDDHA_PHASE_11_INDEX_STATE_CONTRACT.csv", "ECHO_BUDDHA_PHASE_11_EXPECTED_GOOGLE_STATE.csv", "ECHO_BUDDHA_PHASE_11_CANONICAL_AUDIT.csv", "ECHO_BUDDHA_PHASE_11_ROBOTS_DIRECTIVES.csv", "ECHO_BUDDHA_PHASE_11_SITEMAP_DIFF.csv", "ECHO_BUDDHA_PHASE_11_HTTP_STATUS_AUDIT.csv", "ECHO_BUDDHA_PHASE_11_SOFT_404_AUDIT.csv", "ECHO_BUDDHA_PHASE_11_REDIRECT_GRAPH.csv", "ECHO_BUDDHA_PHASE_11_INTERNAL_LINK_HYGIENE.csv", "ECHO_BUDDHA_PHASE_11_STRUCTURED_DATA_AUDIT.csv", "ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv", "ECHO_BUDDHA_PHASE_11_PRODUCTION_BRANCH_DIFF.csv", "ECHO_BUDDHA_PHASE_11_GSC_INDEX_RECONCILIATION.csv", "ECHO_BUDDHA_PHASE_11_TECHNICAL_EXCEPTIONS.csv", "ECHO_BUDDHA_PHASE_11_PHASE_14_VALIDATION_MAP.csv", "ECHO_BUDDHA_TECHNICAL_INDEX_GOVERNANCE.md", "ECHO_BUDDHA_PHASE_11_PHASE_12_HANDOFF.md", "ECHO_BUDDHA_PHASE_11_PHASE_14_HANDOFF.md", "ECHO_BUDDHA_PHASE_11_TECHNICAL_ROLLBACK_PLAN.md", "ECHO_BUDDHA_PHASE_11_VALIDATION.json", "ECHO_BUDDHA_PHASE_11_INDEPENDENT_VALIDATION.json", "ECHO_BUDDHA_PHASE_11_METHOD_MANIFEST.json", "ECHO_BUDDHA_PHASE_11_TECHNICAL_SEO_INDEX_HYGIENE_REPORT.md", "ECHO_BUDDHA_PHASE_11_LOCAL_HTTP_VALIDATION.json", "ECHO_BUDDHA_PHASE_11_RED_TEAM_VALIDATION.json", "ECHO_BUDDHA_PHASE_11_SECRET_SCAN.json"
];
const checks = [];
const check = (name, condition, evidence = "") => checks.push({ name, pass: Boolean(condition), evidence });
const read = (name) => fs.readFileSync(path.join(audit, name), "utf8");
for (const file of required) check(`artifact ${file}`, fs.existsSync(path.join(audit, file)) && fs.statSync(path.join(audit, file)).size > 0);
const validation = JSON.parse(read("ECHO_BUDDHA_PHASE_11_VALIDATION.json"));
const independent = JSON.parse(read("ECHO_BUDDHA_PHASE_11_INDEPENDENT_VALIDATION.json"));
const redTeam = JSON.parse(read("ECHO_BUDDHA_PHASE_11_RED_TEAM_VALIDATION.json"));
const http = JSON.parse(read("ECHO_BUDDHA_PHASE_11_LOCAL_HTTP_VALIDATION.json"));
const secret = JSON.parse(read("ECHO_BUDDHA_PHASE_11_SECRET_SCAN.json"));
const report = read("ECHO_BUDDHA_PHASE_11_TECHNICAL_SEO_INDEX_HYGIENE_REPORT.md");
check("final Phase 11 status", validation.status === "PASS_WITH_EXPLICIT_HOLDS", validation.status);
check("complete rebuilt inventory", validation.inventory.total === 344 && validation.inventory.html === 335 && validation.inventory.indexable === 149 && validation.inventory.noindex === 186 && validation.inventory.redirects === 3 && validation.inventory.temporary_redirects === 1 && validation.inventory.technical === 5 && validation.inventory.unknown_hold === 0, JSON.stringify(validation.inventory));
check("canonical/sitemap/link/schema invariants", validation.checks.canonical_matches === 335 && validation.checks.sitemap_count === 149 && validation.checks.broken_internal_links === 0 && validation.checks.internal_links_to_redirects === 0 && validation.checks.redirect_loops === 0 && validation.checks.sitemap_noindex_urls === 0 && validation.checks.structured_data_failures === 0);
check("full local HTTP crawl", http.status === "PASS" && http.inventory_rows === 344 && http.probes === 7 && http.failed === 0, JSON.stringify(http));
check("rendered desktop/mobile evidence", read("ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv").split(/\r?\n/).filter(Boolean).length === 16 && !read("ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv").includes("PENDING") && !read("ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv").includes(",FAIL"));
check("independent validation", independent.status === "PASS" && independent.checks.every((item) => item.pass));
check("red-team validation", redTeam.status === "PASS" && redTeam.attacks === 36 && redTeam.bypasses === 0);
check("secret scan", secret.status === "PASS" && secret.findings.length === 0);
check("47-section primary report", (report.match(/^## \d+\./gm) ?? []).length === 47 && report.includes("PHASE_11_STATUS = PASS_WITH_EXPLICIT_HOLDS"));
check("production/Google/AdSense boundaries", validation.boundaries.production_deployed === false && validation.boundaries.indexing_requested === false && validation.boundaries.indexing_api_used === false && validation.boundaries.sitemap_submitted === false && validation.boundaries.adsense_submitted === false && validation.boundaries.phase_12_started === false);
check("GSC production provenance", read("ECHO_BUDDHA_PHASE_11_GSC_INDEX_RECONCILIATION.csv").includes("GOOGLE_OBSERVED_PRODUCTION") && read("ECHO_BUDDHA_PHASE_11_GSC_INDEX_RECONCILIATION.csv").includes("EXPECTED_POST_DEPLOYMENT"));
check("Phase 10 firewall preserved", execFileSync("node", ["scripts/validate-phase-10.mjs"], { cwd: root, encoding: "utf8" }).includes("19/19"));
execFileSync("git", ["merge-base", "--is-ancestor", "2fb776a989aca32da70b8bbdf972a24da8b30fd0", "HEAD"], { cwd: root });
execFileSync("git", ["merge-base", "--is-ancestor", "c703bdd1e4bc96c6c636377f6658069992837c31", "HEAD"], { cwd: root });
check("protected checkpoints remain ancestors", true);
const failed = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}${item.evidence ? `: ${item.evidence}` : ""}`);
if (failed.length) process.exitCode = 1;
else console.log(`Phase 11 index-hygiene validation passed: ${checks.length}/${checks.length} checks.`);
