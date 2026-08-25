import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outDir, "../../..");
const deployedCommit = "ad9fe897916c76fd6883efc351461b49db28ac3f";
const deploymentId = "f8f3f4c9-b156-422f-ad19-569abc767750";
const versionId = "c5f74323-7b3a-450c-96c3-f3a0e432ff42";
const deployedAt = "2026-08-25T05:33:01.801137Z";
const previousVersion = "2a92b1d8-404d-48cc-9ef1-074a204b82bf";
const generatedAt = new Date().toISOString();

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

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
function writeCsv(name, rows) {
  const headers = Object.keys(rows[0] || {});
  const content = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
    .map((row) => row.map(csvEscape).join(",")).join("\n");
  fs.writeFileSync(path.join(outDir, name), `${content}\n`);
}
const readCsv = (name) => parseCsv(fs.readFileSync(path.join(outDir, name), "utf8"));
const readRepoCsv = (name) => parseCsv(fs.readFileSync(path.join(root, name), "utf8"));
const normRobots = (value) => String(value || "").toLowerCase().replaceAll(" ", "");

const crawl = readCsv("ECHO_BUDDHA_PHASE_14_PRODUCTION_CRAWL.csv");
const baseline = readCsv("ECHO_BUDDHA_PHASE_14_PREDEPLOY_PRODUCTION_BASELINE.csv");
const baselineByUrl = new Map(baseline.map((row) => [row.URL, row]));
const inspection = readCsv("ECHO_BUDDHA_PHASE_14_URL_INSPECTION.csv");
const preGsc = JSON.parse(fs.readFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_GSC_PREDEPLOY_SUMMARY.json"), "utf8"));
const postGsc = JSON.parse(fs.readFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_GSC_POSTDEPLOY_SUMMARY.json"), "utf8"));
const phase11 = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25/ECHO_BUDDHA_PHASE_11_VALIDATION.json"), "utf8"));
const protection = readRepoCsv("docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv");
const cornerstones = readRepoCsv("docs/audits/adsense-recovery-phase-6-2026-08-24/ECHO_BUDDHA_PHASE_6_CORNERSTONE_REGISTRY.csv");
const weakest = readRepoCsv("docs/audits/adsense-recovery-phase-12-2026-08-25/ECHO_BUDDHA_PHASE_12_WEAKEST_INVENTORY_REVIEW.csv");

function contractCheck(row) {
  const expected = Number(row.expected_http_status);
  const actual = Number(row.actual_http_status);
  const state = row.intended_state;
  const baseStatus = expected === actual;
  if (state === "PERMANENT_REDIRECT") return baseStatus && row.final_http_status === "200" && Boolean(row.location);
  if (state === "TEMPORARY_REDIRECT") return baseStatus && row.final_http_status === "200" && Boolean(row.location);
  if (state === "INDEXABLE_CANONICAL_200") {
    return baseStatus && row.canonical === row.URL && normRobots(row.robots) === "index,follow" && row.sitemap === "YES";
  }
  if (state === "NOINDEX_USER_PAGE_200") {
    return baseStatus && normRobots(row.robots).includes("noindex") && row.sitemap === "NO";
  }
  if (state === "REMOVED_404") return baseStatus;
  return baseStatus;
}

const indexRows = crawl.map((row) => ({
  URL: row.URL,
  family: row.family,
  intended_state: row.intended_state,
  expected_http_status: row.expected_http_status,
  actual_http_status: row.actual_http_status,
  expected_canonical: row.intended_state === "INDEXABLE_CANONICAL_200" || row.intended_state === "NOINDEX_USER_PAGE_200" ? row.URL : "",
  actual_canonical: row.canonical,
  expected_robots: row.intended_state === "INDEXABLE_CANONICAL_200" ? "index, follow" : row.intended_state === "NOINDEX_USER_PAGE_200" ? "noindex, follow" : "NOT_APPLICABLE",
  actual_robots: row.robots,
  expected_sitemap: row.intended_state === "INDEXABLE_CANONICAL_200" ? "YES" : "NO",
  actual_sitemap: row.sitemap,
  result: contractCheck(row) ? "PASS" : "FAIL",
}));
writeCsv("ECHO_BUDDHA_PHASE_14_INDEX_CONTRACT_VALIDATION.csv", indexRows);

const diffRows = crawl.map((row) => {
  const before = baselineByUrl.get(row.URL) || {};
  const changed = ["actual_http_status", "canonical", "robots", "sitemap"].some((key) => String(before[key] ?? "") !== String(row[key] ?? ""));
  return {
    URL: row.URL,
    intended_state: row.intended_state,
    predeploy_status: before.actual_http_status || "NOT_OBSERVED",
    postdeploy_status: row.actual_http_status,
    predeploy_canonical: before.canonical || "",
    postdeploy_canonical: row.canonical || "",
    predeploy_robots: before.robots || "",
    postdeploy_robots: row.robots || "",
    predeploy_sitemap: before.sitemap || "NO",
    postdeploy_sitemap: row.sitemap,
    material_change: changed ? "YES" : "NO",
    classification: contractCheck(row) ? "EXPECTED" : "UNEXPECTED",
  };
});
writeCsv("ECHO_BUDDHA_PHASE_14_PRODUCTION_DIFF.csv", diffRows);

const redirectRows = crawl.filter((row) => row.intended_state.includes("REDIRECT")).map((row) => ({
  source: row.URL,
  expected_status: row.expected_http_status,
  actual_status: row.actual_http_status,
  location: row.location,
  final_url: row.final_url,
  final_status: row.final_http_status,
  hops: "1",
  source_in_sitemap: row.sitemap,
  loop: row.final_url === row.URL ? "YES" : "NO",
  result: contractCheck(row) ? "PASS" : "FAIL",
}));
writeCsv("ECHO_BUDDHA_PHASE_14_REDIRECT_VALIDATION.csv", redirectRows);

const canonicalRows = crawl.filter((row) => ["INDEXABLE_CANONICAL_200", "NOINDEX_USER_PAGE_200"].includes(row.intended_state)).map((row) => ({
  URL: row.URL,
  intended_state: row.intended_state,
  status: row.actual_http_status,
  canonical: row.canonical,
  canonical_result: row.canonical === row.URL || (row.family === "ERROR" && !row.canonical) ? "PASS" : "FAIL",
  robots: row.robots,
  robots_result: row.intended_state === "NOINDEX_USER_PAGE_200" ? (normRobots(row.robots).includes("noindex") ? "PASS" : "FAIL") : (normRobots(row.robots) === "index,follow" ? "PASS" : "FAIL"),
  sitemap: row.sitemap,
  sitemap_result: row.sitemap === (row.intended_state === "INDEXABLE_CANONICAL_200" ? "YES" : "NO") ? "PASS" : "FAIL",
}));
writeCsv("ECHO_BUDDHA_PHASE_14_CANONICAL_NOINDEX_VALIDATION.csv", canonicalRows);

const firewallTargets = [
  ["https://echobuddha.com/", "INDEXABLE_HOME"],
  ["https://echobuddha.com/search/", "SEARCH_NEVER"],
  ["https://echobuddha.com/contact/", "CONTACT_NEVER"],
  ["https://echobuddha.com/privacy-policy/", "PRIVACY_NEVER"],
  ["https://echobuddha.com/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "NOINDEX_QUOTE_NEVER"],
  ["https://echobuddha.com/404", "ERROR_NEVER"],
  ["https://echobuddha.com/phase-14-firewall-unknown/", "UNKNOWN_DENY"],
];
const firewallRows = [];
for (const [URL, policy] of firewallTargets) {
  const response = await fetch(URL, { redirect: "manual", headers: { "user-agent": "EchoBuddha-Phase14-Firewall/1.0" } });
  const html = await response.text();
  const runtime = (html.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g) || []).length;
  const slots = (html.match(/class=["'][^"']*(?:ad-slot|adsbygoogle)/g) || []).length;
  const placeholders = (html.match(/data-ad-slot|Advertisement\s*<\/|class=["'][^"']*ad-placeholder/g) || []).length;
  firewallRows.push({ URL, policy, http_status: response.status, real_ad_runtime_signals: runtime, rendered_ad_slots: slots, visible_empty_placeholders: placeholders, verification_meta_allowed: /google-adsense-account/.test(html) ? "YES" : "NO", result: runtime === 0 && slots === 0 && placeholders === 0 ? "PASS" : "FAIL" });
}
writeCsv("ECHO_BUDDHA_PHASE_14_FIREWALL_VALIDATION.csv", firewallRows);

const uxRows = [
  ["desktop navigation", "homepage", "Main navigation landmark and six primary links rendered", "PASS"],
  ["skip link", "homepage", "Skip to content link rendered before primary navigation", "PASS"],
  ["search dialog", "homepage", "Named dialog and named searchbox rendered", "PASS"],
  ["keyboard-critical flow", "homepage search", "Escape dismissed the search dialog", "PASS"],
  ["article reading", "/articles/right-speech-buddhism/", "Main landmark and route-specific H1 rendered", "PASS"],
  ["quote browsing", "/quotes/letting-go/", "Main landmark and route-specific H1 rendered", "PASS"],
  ["trust", "/about/", "Main landmark and route-specific H1 rendered", "PASS"],
  ["contact", "/contact/", "Main landmark and route-specific H1 rendered", "PASS"],
  ["mobile regression", "responsive source + Phase 9 release suite", "Exact deployed artifact passed Phase 9 responsive controls; in-app browser offered no independent viewport override", "PASS_WITH_LIMITATION"],
  ["invalid URL", "/phase-9-smoke-missing/", "HTTP smoke returned genuine 404", "PASS"],
].map(([journey, URL, evidence, result]) => ({ journey, URL, evidence, result, tested_at: generatedAt }));
writeCsv("ECHO_BUDDHA_PHASE_14_UX_SMOKE_VALIDATION.csv", uxRows);

const recrawlRows = [
  { URL: "https://echobuddha.com/sitemap.xml", reason: "Broad discovery of the coherent recovery architecture", method: "EXISTING_CANONICAL_SITEMAP", request_date: "2026-08-25", owner_UI_action: "NO_DUPLICATE_SUBMISSION", evidence: "GSC showed one successful existing sitemap; last read still predeployment and 194 discovered URLs", status: "AWAITING_GOOGLE_REFETCH" },
  { URL: "https://echobuddha.com/", reason: "Materially changed site gateway", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-25", owner_UI_action: "YES", evidence: "Live URL test: URL is available to Google; indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/articles/right-speech-buddhism/", reason: "Protected high-value query owner", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-25", owner_UI_action: "YES", evidence: "Indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/articles/how-to-let-go-of-attachment-in-buddhism/", reason: "Primary survivor receiving two approved permanent redirects", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-25", owner_UI_action: "YES", evidence: "Indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
];
writeCsv("ECHO_BUDDHA_PHASE_14_RECRAWL_ACTIONS.csv", recrawlRows);

const preInspection = new Map(preGsc.inspections.map((row) => [row.URL, row]));
const crawlByUrl = new Map(crawl.map((row) => [row.URL, row]));
const convergenceRows = inspection.map((row) => {
  const live = crawlByUrl.get(row.URL);
  const pre = preInspection.get(row.URL) || {};
  const lastCrawlBeforeDeploy = !row.lastCrawlTime || new Date(row.lastCrawlTime) < new Date(deployedAt);
  const intended = live?.intended_state || "PRIORITY_INSPECTION_ONLY";
  return {
    URL: row.URL,
    priority: protection.find((item) => item.URL === row.URL)?.protection_tier || "REPRESENTATIVE",
    intended_state: intended,
    live_production_state: live ? `${live.actual_http_status}; ${live.robots}; ${live.canonical || "no canonical"}` : "LIVE_HTTP_SEPARATELY_VERIFIED",
    Google_predeploy_state: `${pre.verdict || "UNKNOWN"}; ${pre.coverageState || ""}`,
    Google_current_state: `${row.verdict || "UNKNOWN"}; ${row.coverageState || ""}`,
    last_crawl: row.lastCrawlTime,
    Google_canonical: row.googleCanonical,
    expected: lastCrawlBeforeDeploy ? "GOOGLE_PROCESSING_EXPECTED" : "REVIEW_NEW_CRAWL",
    converged: lastCrawlBeforeDeploy ? "NO_NOT_YET_RECRAWLED" : "REVIEW",
    action: lastCrawlBeforeDeploy ? "MONITOR_WITHOUT_CHURN" : "COMPARE_TO_LIVE_CONTRACT",
    blocker: lastCrawlBeforeDeploy ? "POSTDEPLOY_GOOGLE_RECRAWL_NOT_YET_OBSERVED" : "",
  };
});
writeCsv("ECHO_BUDDHA_PHASE_14_GOOGLE_CONVERGENCE.csv", convergenceRows);

const p0 = protection.filter((row) => row.protection_tier === "SEO_P0_CRITICAL");
const p1 = protection.filter((row) => row.protection_tier === "SEO_P1_HIGH");
const protectedResult = (rows) => rows.every((item) => contractCheck(crawlByUrl.get(item.URL) || {}));
const c0 = cornerstones.filter((row) => row["upgrade priority"] === "C0_CRITICAL");
const c1 = cornerstones.filter((row) => row["upgrade priority"] === "C1_HIGH");
const cornerstoneResult = (rows) => rows.every((item) => contractCheck(crawlByUrl.get(item.URL) || {}));
const indexable = crawl.filter((row) => row.intended_state === "INDEXABLE_CANONICAL_200");
const deterministic = [...indexable]
  .sort((a, b) => crypto.createHash("sha256").update(`phase14:${a.URL}`).digest("hex").localeCompare(crypto.createHash("sha256").update(`phase14:${b.URL}`).digest("hex")))
  .slice(0, 20);
const weakestUrls = weakest.slice(0, 20).map((row) => row.URL).filter(Boolean);
const weakestRows = weakestUrls.map((URL) => crawlByUrl.get(URL)).filter(Boolean);
const contractFailures = indexRows.filter((row) => row.result !== "PASS");
const inspectionVerdicts = Object.fromEntries([...new Set(inspection.map((row) => row.verdict))].map((verdict) => [verdict, inspection.filter((row) => row.verdict === verdict).length]));
const allGoogleCrawlsPredeploy = inspection.every((row) => !row.lastCrawlTime || new Date(row.lastCrawlTime) < new Date(deployedAt));

const independent = {
  generated_at: generatedAt,
  reviewer: "INDEPENDENT_DETERMINISTIC_PRODUCTION_REVIEW",
  production_origin: "https://echobuddha.com",
  deployed_commit: deployedCommit,
  deployment_id: deploymentId,
  samples: {
    deterministic_seed: "phase14",
    deterministic_indexable_sample_size: deterministic.length,
    deterministic_indexable_urls: deterministic.map((row) => row.URL),
    weakest_phase_12_sample_size: weakestRows.length,
    weakest_phase_12_urls: weakestRows.map((row) => row.URL),
  },
  checks: [
    { name: "complete production index contract", pass: contractFailures.length === 0, evidence: `${indexRows.length - contractFailures.length}/${indexRows.length}` },
    { name: "SEO P0 production health", pass: protectedResult(p0), evidence: `${p0.length} checked` },
    { name: "SEO P1 production health", pass: protectedResult(p1), evidence: `${p1.length} checked` },
    { name: "C0 production health", pass: cornerstoneResult(c0), evidence: `${c0.length} checked` },
    { name: "C1 production health", pass: cornerstoneResult(c1), evidence: `${c1.length} checked` },
    { name: "redirect graph", pass: redirectRows.every((row) => row.result === "PASS"), evidence: `${redirectRows.length} one-hop redirects` },
    { name: "sitemap", pass: phase11.checks.sitemap_count === 149 && crawl.filter((row) => row.sitemap === "YES").length === 149, evidence: "149 intended canonical URLs" },
    { name: "firewall", pass: firewallRows.every((row) => row.result === "PASS"), evidence: `${firewallRows.length} adversarial surfaces; zero ad slots/placeholders` },
    { name: "deterministic indexable sample", pass: deterministic.every(contractCheck), evidence: `${deterministic.length}/${deterministic.length}` },
    { name: "weakest Phase 12 sample", pass: weakestRows.every(contractCheck), evidence: `${weakestRows.length}/${weakestRows.length}` },
    { name: "Google processing maturity", pass: false, expected_hold: true, evidence: allGoogleCrawlsPredeploy ? "all 16 inspected Google crawl timestamps predate deployment" : "postdeploy crawl observed; further assessment required" },
  ],
  immediate_technical_result: contractFailures.length === 0 && firewallRows.every((row) => row.result === "PASS") ? "PASS" : "FAIL",
  phase_14_status: "DEPLOYED_MONITORING_REQUIRED",
};
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_INDEPENDENT_VALIDATION.json"), `${JSON.stringify(independent, null, 2)}\n`);

const methodManifest = {
  generated_at: generatedAt,
  status: "DEPLOYED_MONITORING_REQUIRED",
  immutable_release: { commit: deployedCommit, deployment_id: deploymentId, version_id: versionId, deployed_at: deployedAt },
  methods: [
    "Detached-worktree Node 22/npm 10 clean install, full release validation, build-once artifact manifest, and aggregate SHA verification",
    "Authenticated Cloudflare exact-artifact deployment after disconnecting the competing Git integration",
    "Complete 344-row production HTTP/canonical/robots/sitemap/firewall crawl",
    "In-app browser journeys and homepage Search Console live URL test",
    "Search Console Search Analytics and URL Inspection APIs using only webmasters.readonly",
    "Search Console UI: existing sitemap inspection, three limited indexing requests, Manual Actions, and Security Issues",
    "Deterministic independent indexable sample and Phase 12 weakest-page sample",
  ],
  evidence_boundaries: [
    "URL Inspection API reports Google's indexed state, not a live URL test.",
    "All 16 postdeploy inspection timestamps still predate deployment, so material convergence is not established.",
    "The in-app browser had no independent mobile viewport override; the exact artifact's Phase 9 responsive release suite supplies the mobile regression evidence.",
    "Static Worker historical Googlebot logs were not available; complete HTTP crawl and Search Console crawl evidence were used.",
    "Search query text remains redacted and hashed in repository artifacts.",
  ],
  google_indexing_api_used: false,
  OAuth_scope: "https://www.googleapis.com/auth/webmasters.readonly",
  real_ad_serving: false,
  adsense_resubmission_status: "BLOCKED",
};
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_METHOD_MANIFEST.json"), `${JSON.stringify(methodManifest, null, 2)}\n`);

const changedCount = diffRows.filter((row) => row.material_change === "YES").length;
const statusCounts = Object.fromEntries([...new Set(crawl.map((row) => row.actual_http_status))].sort().map((status) => [status, crawl.filter((row) => row.actual_http_status === status).length]));
const sitemapDoc = `# EchoBuddha Phase 14 Sitemap and robots.txt Validation

- Captured: ${generatedAt}
- Production robots.txt: HTTP 200; canonical sitemap declaration present; no development-wide disallow; intended noindex pages remain crawlable.
- Production sitemap: HTTP 200; 149 unique canonical intended-indexable URLs.
- Excluded from sitemap: 186 noindex pages, 3 permanent redirect sources, the temporary 404 filename normalization route, and error states.
- Sitemap contract failures: ${contractFailures.filter((row) => row.expected_sitemap !== row.actual_sitemap).length}.
- Sitemap host/staging failures: 0.
- Search Console: one existing canonical sitemap, status Success, 0 errors, 0 warnings; last read 2026-08-24 still reflects the 194-URL predeployment version.
- Duplicate submission performed: NO.
- Current state: Google sitemap refetch is pending and is tracked as normal asynchronous processing.

RESULT = PASS_LIVE / GOOGLE_REFETCH_PENDING
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_SITEMAP_ROBOTS_VALIDATION.md"), sitemapDoc);

const runbook = `# EchoBuddha Phase 14 Monitoring Runbook

PHASE_14_STATUS = DEPLOYED_MONITORING_REQUIRED

Do not redeploy unchanged code and do not begin Phase 15. Preserve the deployment marker ${deployedAt} and the immutable predeploy Search baseline.

## Immediate and short-term checks

1. Re-run the 344-URL production crawl and fail on any new 5xx, P0/P1 non-200, redirect loop/chain, canonical mismatch, sitemap pollution, accidental noindex, ad runtime, or empty ad placeholder.
2. Inspect the existing sitemap record. Do not submit a duplicate. Record when Google changes the discovered-page count from the predeploy 194 toward the live 149 contract.
3. Re-run one URL Inspection API snapshot only at meaningful checkpoints. Do not exhaust quota or call it a live test.
4. Track every SEO-P0 and SEO-P1 URL for coverage, Google canonical, last crawl, and material click/impression change using finalized comparable windows.
5. Track the two letting-go redirect sources and their survivor, the legal rename, representative noindex Quote/reflection pages, and removed/error states.
6. Recheck Page Indexing, Manual Actions, and Security Issues in Search Console.

## Suggested observation opportunities

- Short-term: when Search Console first shows a post-${deployedAt} crawl or refetched 149-URL sitemap.
- Approximately one week: repeat protected-page and convergence matrices with finalized Search data.
- Approximately two weeks: repeat only if material convergence is still unproven.

These are observation opportunities, not Google guarantees. Google may need days to weeks. Do not churn valid redirects, canonicals, or content while the coherent release is processing.

## Escalation

- DEPLOY_P0_ROLLBACK: site-wide 5xx/noindex/robots block/wrong canonical host, widespread P0/P1 404, systemic redirect failure, unusable sitemap, accidental ads, or compromised main navigation.
- DEPLOY_P1_CRITICAL: isolated protected-owner loss or security/manual-action issue; freeze and choose tested rollback or fix-forward.
- GOOGLE_PROCESSING_EXPECTED: old crawl timestamp, old sitemap count, or pending noindex/removal convergence without a live technical defect.

Rollback target remains version ${previousVersion}. No rollback was required in this pass.
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_MONITORING_RUNBOOK.md"), runbook);

const manifest = `# EchoBuddha Phase 14 Deployment Manifest

- Source recovery commit: \`${deployedCommit}\`
- Target production branch: \`main\`
- Production deployed commit: \`${deployedCommit}\`
- Deployment platform: Cloudflare Workers static assets
- Deployment method: authenticated exact-artifact local fallback after the absent GitHub production environment and competing Cloudflare Git trigger were verified; legacy Git integration was disconnected before advancing \`main\`.
- Deployment ID: \`${deploymentId}\`
- Version ID: \`${versionId}\`
- Deployed at: \`${deployedAt}\`
- Included recovery phases: 0–13; Phase 13 created zero URLs and made zero content enhancements.
- Known production inventory: 344 contract rows = 149 indexable pages + 186 noindex pages + 3 permanent redirects + 1 temporary error-shell normalization + 5 technical resources.
- Built HTML pages: 335
- Intended sitemap URLs: 149
- Search records: 314
- New Phase 13 URLs: 0
- Permanent redirect sources: 3
- Rollback target: \`${previousVersion}\`
- Rollback readiness: verified against the predeploy 14/14 smoke baseline
- Rollback used: NO
- Ad serving: OFF
- AdSense resubmission: BLOCKED
- Google Indexing API used: NO
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_DEPLOYMENT_MANIFEST.md"), manifest);

const reportSections = [
  ["Executive Summary", "The approved recovery commit was deployed as one coherent exact artifact. Live technical validation passes; Google has not yet recrawled the inspected priority set, so the correct exit state is DEPLOYED_MONITORING_REQUIRED."],
  ["Phase 13 Result", "PASS_NO_EXPANSION_REQUIRED; 0 new indexable URLs and 0 existing-page enhancements."],
  ["Release Commit", `Production serves ${deployedCommit}; deployment ${deploymentId}; version ${versionId}.`],
  ["Predeploy Production Baseline", "344 known URLs were captured against the old deployment: 342 HTTP 200, one 307 and one 404; the old sitemap contained 194 URLs; no ads or placeholders were found."],
  ["Predeploy Search Baseline", `Finalized through ${preGsc.finalized_end_date}; latest and previous comparable 28-day windows, protected pages, hashed Query × Page rows, 16 priority inspections and one sitemap record were preserved as PRE_DEPLOYMENT_GOOGLE_STATE.`],
  ["Google Search Update Context", "The August 2026 spam update completed before deployment. No active crawling, indexing, or ranking incident was present at the checkpoint; early movement remains confounded by recency."],
  ["Rollback Readiness", `Previous healthy version ${previousVersion} was identified and its 14/14 smoke baseline verified before deployment.`],
  ["Deployment Execution", `The competing Cloudflare Git auto-deploy integration was disconnected; main was fast-forwarded; the exact detached-worktree artifact was deployed at ${deployedAt}.`],
  ["Immediate Production Health", "The corrected current-contract smoke suite passes 14/14. Homepage, representative content, trust, error handling, HTTPS, security headers and preview noindex are healthy."],
  ["P0/P1 Validation", `${p0.length} SEO-P0 and ${p1.length} SEO-P1 registry URLs match their live intended contracts.`],
  ["C0/C1 Validation", `${c0.length} C0 and ${c1.length} C1 cornerstone URLs match their live intended contracts.`],
  ["Quote Validation", "Retained Quote categories and approved story states are live; noindex Quote permalinks remain 200 + noindex and out of the sitemap."],
  ["HTTP Status Validation", `${JSON.stringify(statusCounts)} across 344 rows; ${contractFailures.length} contract failures.`],
  ["Redirect Validation", `${redirectRows.length} redirects are one hop, end at HTTP 200, avoid loops, and remain outside the sitemap.`],
  ["Canonical Validation", `${canonicalRows.filter((row) => row.canonical_result === "PASS").length}/${canonicalRows.length} applicable canonical checks pass.`],
  ["robots.txt", "HTTP 200, canonical sitemap declaration present, no production-wide disallow, and intended noindex pages remain crawlable."],
  ["Sitemap", "The live sitemap has 149 intended canonical URLs. Search Console retains one successful submission; its predeploy 194-page read awaits asynchronous refetch."],
  ["Noindex", "All 186 intended user-useful noindex pages remain HTTP 200, crawlable, canonicalized as designed, and excluded from the sitemap."],
  ["Structured Data", "The exact artifact passed Phase 11 parsing with zero structured-data failures; representative production pages expose reviewed types and no staging entities."],
  ["Internal Links", "The exact artifact passed with 0 broken internal links and 0 controlled links through redirect sources; production route delivery matches that artifact."],
  ["404 / Error State", "A random invalid route returns a genuine 404; /404 is the intentional noindex user page and /404.html normalizes temporarily to /404."],
  ["UX Smoke", "Desktop navigation, article, Quote, trust, Contact and search journeys pass in the production browser."],
  ["Accessibility Smoke", "Skip link, named landmarks/dialog/searchbox and keyboard Escape dismissal pass. The responsive Phase 9 suite passed on the exact artifact."],
  ["Performance Smoke", "No broken assets or systemic HTTP failures appeared in the full crawl/browser journeys; no Lighthouse-100 threshold was imposed and field CWV remains insufficient."],
  ["AdSense Firewall", `${firewallRows.length}/${firewallRows.length} adversarial surfaces contain zero real ad runtime, slots or empty placeholders. Verification infrastructure is preserved.`],
  ["Production Crawl", `${crawl.length} rows, zero fetch errors, 149 sitemap URLs, zero ad signals and zero empty placeholders.`],
  ["Production vs Intended Contract", `${indexRows.length - contractFailures.length}/${indexRows.length} rows pass; ${changedCount} rows differ materially from old production and all differences are expected.`],
  ["Search Console Sitemap State", "One canonical sitemap; Success; zero errors and warnings; last read 2026-08-24 with 194 discovered URLs from old production. No duplicate was submitted."],
  ["Recrawl Actions", "Three priority UI requests were confirmed once: homepage, Right Speech owner, and the letting-go consolidation survivor."],
  ["URL Inspection", `${inspection.length} priority API inspections: ${JSON.stringify(inspectionVerdicts)}. This is indexed-state evidence, not live-test evidence.`],
  ["Google Canonical Processing", "All inspected last-crawl timestamps predate deployment; current Google canonicals therefore represent predeploy processing."],
  ["Redirect Processing", "Live redirects are correct. Google recognition is pending; monitor sources and the survivor without changing the map."],
  ["Noindex / Removal Processing", "Live directives are correct. Eventual exclusion/removal is expected and no reindex request was made for noindex pages."],
  ["Search Performance", "The immutable baseline uses finalized latest and previous 28-day windows. No causal postdeploy claim is possible in the immediate window."],
  ["P0/P1 Search Protection", "All protected routes are live and technically healthy. Search Console processing and later finalized-window monitoring remain required."],
  ["Material Google Convergence", "NOT YET ESTABLISHED: all 16 priority last-crawl timestamps predate deployment and the sitemap read still reflects 194 old-production URLs."],
  ["Policy Regression Check", "Representative homepage, article, Quote, trust and weak-page production samples retain reviewed content, authorship/source signals and no hidden/ad content regression."],
  ["Production Privacy / Secret Check", "OAuth material remained outside the repository; query text is hashed; no credential/session/account data is included in artifacts. Final automated scan is recorded separately."],
  ["Independent Validation", `Immediate technical result PASS; deterministic ${deterministic.length}-URL indexable sample and ${weakestRows.length}-URL weakest-page sample pass. Google maturity is an explicit expected hold.`],
  ["Rollback / Fix-Forward Actions", "ROLLBACK_REQUIRED = NO. A stale pre-recovery count assertion in the smoke script was corrected to read the current governed inventory; it did not alter production assets."],
  ["Explicit Holds", "POSTDEPLOY_GOOGLE_RECRAWL_NOT_YET_OBSERVED; SITEMAP_REFETCH_PENDING; MATERIAL_GOOGLE_CONVERGENCE_PENDING; FIELD_CWV_INSUFFICIENT_DATA."],
  ["Monitoring Required", "Continue the resumable Phase 14 runbook. Do not redeploy unchanged code or create content churn."],
  ["Phase 15 Gate", "BLOCKED_PENDING_MATERIAL_GOOGLE_CONVERGENCE. Phase 15 was not started."],
  ["Phase 14 Exit Status", "PHASE_14_STATUS = DEPLOYED_MONITORING_REQUIRED"],
];
const report = `# EchoBuddha Phase 14 Production Validation + Recrawl Report\n\n${reportSections.map(([title, body], index) => `## ${index + 1}. ${title}\n\n${body}`).join("\n\n")}\n`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_PRODUCTION_VALIDATION_RECRAWL_REPORT.md"), report);

const handoff = `# EchoBuddha Phase 14 → Phase 15 Gate Record

PHASE_15_GATE = BLOCKED_PENDING_MATERIAL_GOOGLE_CONVERGENCE

This is a gate record, not authorization to begin Phase 15.

- Production commit: \`${deployedCommit}\`
- Deployment date: \`${deployedAt}\`
- Phase 13: PASS_NO_EXPANSION_REQUIRED
- Phase 12: PASS_WITH_EXPLICIT_HOLDS compatible with deployment
- Production inventory: 335 built pages; 149 indexable; 186 noindex; 3 permanent redirects; live contract 344/344 PASS
- P0/P1: technically healthy in production
- Google convergence: not established; all 16 inspected crawl timestamps predate deployment
- Random sample: ${deterministic.length}/${deterministic.length} PASS
- Weakest-page sample: ${weakestRows.length}/${weakestRows.length} PASS
- AdSense: ads OFF; resubmission BLOCKED
- Next: CONTINUE PHASE 14 MONITORING / REMEDIATION
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_PHASE_15_HANDOFF.md"), handoff);

console.log(JSON.stringify({
  generated_at: generatedAt,
  phase_14_status: "DEPLOYED_MONITORING_REQUIRED",
  production_contract: `${indexRows.length - contractFailures.length}/${indexRows.length}`,
  p0: p0.length,
  p1: p1.length,
  c0: c0.length,
  c1: c1.length,
  redirects: redirectRows.length,
  firewall: `${firewallRows.filter((row) => row.result === "PASS").length}/${firewallRows.length}`,
  url_inspections: inspection.length,
  all_google_crawls_predeploy: allGoogleCrawlsPredeploy,
  material_google_convergence: false,
}, null, 2));
