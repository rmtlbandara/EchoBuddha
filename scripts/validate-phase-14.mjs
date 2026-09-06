import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "docs/audits/adsense-recovery-phase-14-2026-08-25");
const required = [
  "ECHO_BUDDHA_PHASE_14_PREDEPLOY_PRODUCTION_BASELINE.csv",
  "ECHO_BUDDHA_PHASE_14_SEARCH_BASELINE.csv",
  "ECHO_BUDDHA_PHASE_14_MONITORING_SEARCH.csv",
  "ECHO_BUDDHA_PHASE_14_REDIRECT_GOOGLE_PROCESSING.csv",
  "ECHO_BUDDHA_PHASE_14_MONITORING_CHECKPOINT_2026-08-28.md",
  "ECHO_BUDDHA_PHASE_14_MONITORING_CHECKPOINT_2026-08-29.md",
  "ECHO_BUDDHA_PHASE_14_DEPLOYMENT_MANIFEST.md",
  "ECHO_BUDDHA_PHASE_14_PRODUCTION_CRAWL.csv",
  "ECHO_BUDDHA_PHASE_14_PRODUCTION_DIFF.csv",
  "ECHO_BUDDHA_PHASE_14_INDEX_CONTRACT_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_14_REDIRECT_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_14_CANONICAL_NOINDEX_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_14_SITEMAP_ROBOTS_VALIDATION.md",
  "ECHO_BUDDHA_PHASE_14_FIREWALL_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_14_UX_SMOKE_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_14_URL_INSPECTION.csv",
  "ECHO_BUDDHA_PHASE_14_RECRAWL_ACTIONS.csv",
  "ECHO_BUDDHA_PHASE_14_GOOGLE_CONVERGENCE.csv",
  "ECHO_BUDDHA_PHASE_14_MONITORING_RUNBOOK.md",
  "ECHO_BUDDHA_PHASE_14_INDEPENDENT_VALIDATION.json",
  "ECHO_BUDDHA_PHASE_14_METHOD_MANIFEST.json",
  "ECHO_BUDDHA_PHASE_14_PRODUCTION_VALIDATION_RECRAWL_REPORT.md",
  "ECHO_BUDDHA_PHASE_14_PHASE_15_HANDOFF.md",
  "ECHO_BUDDHA_PHASE_14_SECRET_SCAN.json",
];

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ""; }
    else if (char === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some(Boolean));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}
const csv = (name) => parseCsv(fs.readFileSync(path.join(dir, name), "utf8"));
const json = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
const text = (name) => fs.readFileSync(path.join(dir, name), "utf8");
const checks = [];
const check = (name, pass, evidence) => checks.push({ name, pass: Boolean(pass), evidence });

const missing = required.filter((name) => !fs.existsSync(path.join(dir, name)));
check("required artifacts", missing.length === 0, missing.length ? missing.join(" | ") : `${required.length}/${required.length}`);

const crawl = csv("ECHO_BUDDHA_PHASE_14_PRODUCTION_CRAWL.csv");
const contract = csv("ECHO_BUDDHA_PHASE_14_INDEX_CONTRACT_VALIDATION.csv");
const redirects = csv("ECHO_BUDDHA_PHASE_14_REDIRECT_VALIDATION.csv");
const canonicals = csv("ECHO_BUDDHA_PHASE_14_CANONICAL_NOINDEX_VALIDATION.csv");
const firewall = csv("ECHO_BUDDHA_PHASE_14_FIREWALL_VALIDATION.csv");
const ux = csv("ECHO_BUDDHA_PHASE_14_UX_SMOKE_VALIDATION.csv");
const inspections = csv("ECHO_BUDDHA_PHASE_14_URL_INSPECTION.csv");
const recrawl = csv("ECHO_BUDDHA_PHASE_14_RECRAWL_ACTIONS.csv");
const convergence = csv("ECHO_BUDDHA_PHASE_14_GOOGLE_CONVERGENCE.csv");
const monitoringSearch = csv("ECHO_BUDDHA_PHASE_14_MONITORING_SEARCH.csv");
const redirectGoogle = csv("ECHO_BUDDHA_PHASE_14_REDIRECT_GOOGLE_PROCESSING.csv");
const independent = json("ECHO_BUDDHA_PHASE_14_INDEPENDENT_VALIDATION.json");
const method = json("ECHO_BUDDHA_PHASE_14_METHOD_MANIFEST.json");
const secretScan = json("ECHO_BUDDHA_PHASE_14_SECRET_SCAN.json");
const report = text("ECHO_BUDDHA_PHASE_14_PRODUCTION_VALIDATION_RECRAWL_REPORT.md");
const manifest = text("ECHO_BUDDHA_PHASE_14_DEPLOYMENT_MANIFEST.md");
const handoff = text("ECHO_BUDDHA_PHASE_14_PHASE_15_HANDOFF.md");

const stateCount = (state) => crawl.filter((row) => row.intended_state === state).length;
check("complete production crawl", crawl.length === 346 && crawl.every((row) => !row.fetch_error), `${crawl.length} rows; ${crawl.filter((row) => row.fetch_error).length} fetch errors`);
check("production inventory states", stateCount("INDEXABLE_CANONICAL_200") === 151 && stateCount("NOINDEX_USER_PAGE_200") === 186 && stateCount("PERMANENT_REDIRECT") === 3 && stateCount("TEMPORARY_REDIRECT") === 1, `151 indexable; 186 noindex; 3 permanent redirects; 1 temporary normalization`);
check("full intended contract", contract.length === 346 && contract.every((row) => row.result === "PASS"), `${contract.filter((row) => row.result === "PASS").length}/${contract.length}`);
check("redirect graph", redirects.length === 4 && redirects.every((row) => row.result === "PASS" && row.hops === "1" && row.loop === "NO"), `${redirects.length} one-hop redirects`);
check("canonical/noindex", canonicals.length === 337 && canonicals.every((row) => row.canonical_result === "PASS" && row.robots_result === "PASS" && row.sitemap_result === "PASS"), `${canonicals.length} applicable rows`);
check("AdSense firewall", firewall.length === 7 && firewall.every((row) => row.result === "PASS" && row.real_ad_runtime_signals === "0" && row.rendered_ad_slots === "0" && row.visible_empty_placeholders === "0"), `${firewall.length} adversarial surfaces`);
check("UX/accessibility smoke", ux.length >= 10 && ux.every((row) => !row.result.startsWith("FAIL")), `${ux.length} journeys; ${ux.filter((row) => row.result === "PASS_WITH_LIMITATION").length} explicit limitation`);
check("URL Inspection priority set", inspections.length === 16, `${inspections.length} readonly API inspections`);
check("Google processing boundary", convergence.length === 16 && convergence.every((row) => ["YES", "NO_NOT_YET_RECRAWLED", "REVIEW"].includes(row.converged)), `${convergence.filter((row) => row.converged === "YES").length}/${convergence.length} priority URLs converged after deployment`);
check("monitoring Search comparison", monitoringSearch.length === 72 && monitoringSearch.filter((row) => row.row_type === "SITE_TOTAL").length === 2, `${monitoringSearch.length} finalized comparison rows`);
check("redirect-source monitoring", redirectGoogle.length === 3 && redirectGoogle.every((row) => ["YES", "NO"].includes(row.postdeploy_crawl)), `${redirectGoogle.filter((row) => row.postdeploy_crawl === "YES").length}/${redirectGoogle.length} recrawled after deployment`);
check("limited recrawl", recrawl.filter((row) => row.status === "REQUESTED_ONCE").length === 6 && recrawl.filter((row) => row.status === "REQUEST_REJECTED_INTENDED_NOINDEX").length === 1 && recrawl.filter((row) => row.method === "EXISTING_CANONICAL_SITEMAP").length === 1, "6 accepted one-time requests; 1 intended-noindex rejection; existing sitemap retained without duplicate");
check("independent validation", independent.immediate_technical_result === "PASS" && ["PASS", "DEPLOYED_MONITORING_REQUIRED"].includes(independent.phase_14_status) && independent.checks.filter((item) => !item.pass && !item.expected_hold).length === 0, `technical PASS; status ${independent.phase_14_status}`);
check("method boundaries", method.google_indexing_api_used === false && method.OAuth_scope === "https://www.googleapis.com/auth/webmasters.readonly" && method.real_ad_serving === false && method.adsense_resubmission_status === "BLOCKED", "readonly GSC; no Indexing API; ads off; submission blocked");
check("deployment identity", manifest.includes("ad9fe897916c76fd6883efc351461b49db28ac3f") && manifest.includes("f8f3f4c9-b156-422f-ad19-569abc767750") && manifest.includes("413aa0152a35d6faa2fa9b1c1d9e0e2489bb20c4") && manifest.includes("dc5c106a-e6dc-4a5b-9120-04ad5b5c6fa4") && manifest.includes("Rollback used: NO"), "immutable initial and current authorized releases recorded");
check("44-section report", (report.match(/^## \d+\./gm) || []).length === 44 && report.includes(`PHASE_14_STATUS = ${independent.phase_14_status}`), `${(report.match(/^## \d+\./gm) || []).length}/44 sections`);
const phase15GateCorrect = independent.phase_14_status === "PASS"
  ? handoff.includes("PHASE_15_GATE = OPEN") && handoff.includes("PHASE 15 — INDEPENDENT FINAL ADSENSE READINESS AUDIT")
  : handoff.includes("PHASE_15_GATE = BLOCKED_PENDING_MATERIAL_GOOGLE_CONVERGENCE") && handoff.includes("CONTINUE PHASE 14");
check("Phase 15 hard gate", phase15GateCorrect, independent.phase_14_status === "PASS" ? "Phase 15 gate open" : "Phase 15 not started");
check("secret scan", secretScan.status === "PASS" && secretScan.findings === 0, `${secretScan.findings} findings`);

const failures = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}: ${item.evidence}`);
console.log(`PHASE_14_STATUS = ${failures.length ? "FAIL" : independent.phase_14_status}`);
if (failures.length) process.exitCode = 1;
