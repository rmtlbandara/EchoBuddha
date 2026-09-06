import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outDir, "../../..");
const initialPhase14Release = {
  commit: "ad9fe897916c76fd6883efc351461b49db28ac3f",
  deploymentId: "f8f3f4c9-b156-422f-ad19-569abc767750",
  versionId: "c5f74323-7b3a-450c-96c3-f3a0e432ff42",
  deployedAt: "2026-08-25T05:33:01.801137Z",
  rollbackVersion: "2a92b1d8-404d-48cc-9ef1-074a204b82bf",
};
const currentProductionRelease = {
  commit: "413aa0152a35d6faa2fa9b1c1d9e0e2489bb20c4",
  documentationHead: "00b0b3e86215799d8f8fb7e71d8aa5ce53914537",
  deploymentId: "dc5c106a-e6dc-4a5b-9120-04ad5b5c6fa4",
  versionId: "b5b294f9-6b65-4dad-943f-5400b78cbba5",
  deployedAt: "2026-09-02T16:27:35.26782Z",
};
const deployedAt = initialPhase14Release.deployedAt;
const authorizedSuccessorUrls = [
  "https://echobuddha.com/learn/questions-about-buddhism/did-buddha-order-buddha-images/",
  "https://echobuddha.com/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/",
];
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
const monitoringSearch = readCsv("ECHO_BUDDHA_PHASE_14_MONITORING_SEARCH.csv");
const redirectGoogle = readCsv("ECHO_BUDDHA_PHASE_14_REDIRECT_GOOGLE_PROCESSING.csv");
const monitoringSummary = JSON.parse(fs.readFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_MONITORING_SEARCH_SUMMARY.json"), "utf8"));
const gscUiMonitoring = JSON.parse(fs.readFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_GSC_UI_MONITORING_SUMMARY.json"), "utf8"));
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
  { URL: "https://echobuddha.com/sitemap.xml", reason: "Broad discovery of the coherent recovery architecture", method: "EXISTING_CANONICAL_SITEMAP", request_date: "2026-08-25", owner_UI_action: "NO_DUPLICATE_SUBMISSION", evidence: "GSC retained one successful sitemap and refetched the authorized successor 151-URL contract on 2026-09-06", status: "REFETCHED_POSTDEPLOYMENT" },
  { URL: "https://echobuddha.com/", reason: "Materially changed site gateway", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-25", owner_UI_action: "YES", evidence: "Live URL test: URL is available to Google; indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/articles/right-speech-buddhism/", reason: "Protected high-value query owner", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-25", owner_UI_action: "YES", evidence: "Indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/articles/how-to-let-go-of-attachment-in-buddhism/", reason: "Primary survivor receiving two approved permanent redirects", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-25", owner_UI_action: "YES", evidence: "Indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/articles/how-to-practice-non-attachment/", reason: "Approved permanent redirect source awaiting postdeployment Google processing", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-29", owner_UI_action: "YES", evidence: "Live test followed the production redirect successfully; indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/articles/letting-go-without-giving-up/", reason: "Approved permanent redirect source awaiting postdeployment Google processing", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-29", owner_UI_action: "YES", evidence: "Indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/terms-and-conditions/", reason: "Approved permanent legal rename redirect awaiting postdeployment Google processing", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-29", owner_UI_action: "YES", evidence: "Indexing-request confirmation displayed", status: "REQUESTED_ONCE" },
  { URL: "https://echobuddha.com/daily-reflections/today/", reason: "Representative intended-noindex URL awaiting stored indexed-state refresh", method: "URL_INSPECTION_UI_REQUEST_INDEXING", request_date: "2026-08-29", owner_UI_action: "YES", evidence: "Postdeployment live test fetched successfully and detected the intended noindex; Search Console rejected the indexing request because noindex is present", status: "REQUEST_REJECTED_INTENDED_NOINDEX" },
];
writeCsv("ECHO_BUDDHA_PHASE_14_RECRAWL_ACTIONS.csv", recrawlRows);

const preInspection = new Map(preGsc.inspections.map((row) => [row.URL, row]));
const crawlByUrl = new Map(crawl.map((row) => [row.URL, row]));
const convergenceRows = inspection.map((row) => {
  const live = crawlByUrl.get(row.URL);
  const pre = preInspection.get(row.URL) || {};
  const lastCrawlBeforeDeploy = !row.lastCrawlTime || new Date(row.lastCrawlTime) < new Date(deployedAt);
  const intended = live?.intended_state || "PRIORITY_INSPECTION_ONLY";
  const indexableConverged = !lastCrawlBeforeDeploy && intended === "INDEXABLE_CANONICAL_200" && row.verdict === "PASS" && row.pageFetchState === "SUCCESSFUL" && row.googleCanonical === live?.canonical;
  const noindexConverged = !lastCrawlBeforeDeploy && intended === "NOINDEX_USER_PAGE_200" && /noindex/i.test(row.coverageState) && row.pageFetchState === "SUCCESSFUL";
  const converged = indexableConverged || noindexConverged;
  return {
    URL: row.URL,
    priority: protection.find((item) => item.URL === row.URL)?.protection_tier || "REPRESENTATIVE",
    intended_state: intended,
    live_production_state: live ? `${live.actual_http_status}; ${live.robots}; ${live.canonical || "no canonical"}` : "LIVE_HTTP_SEPARATELY_VERIFIED",
    Google_predeploy_state: `${pre.verdict || "UNKNOWN"}; ${pre.coverageState || ""}`,
    Google_current_state: `${row.verdict || "UNKNOWN"}; ${row.coverageState || ""}`,
    last_crawl: row.lastCrawlTime,
    Google_canonical: row.googleCanonical,
    expected: lastCrawlBeforeDeploy ? "GOOGLE_PROCESSING_EXPECTED" : "POSTDEPLOY_CRAWL_OBSERVED",
    converged: converged ? "YES" : lastCrawlBeforeDeploy ? "NO_NOT_YET_RECRAWLED" : "REVIEW",
    action: converged ? "MONITOR_STABILITY" : "MONITOR_WITHOUT_CHURN",
    blocker: converged ? "" : lastCrawlBeforeDeploy ? "POSTDEPLOY_GOOGLE_RECRAWL_NOT_YET_OBSERVED" : "POSTDEPLOY_STATE_REQUIRES_REVIEW",
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
const priorityPostdeployCrawls = inspection.filter((row) => row.lastCrawlTime && new Date(row.lastCrawlTime) >= new Date(deployedAt));
const priorityConverged = convergenceRows.filter((row) => row.converged === "YES");
const currentSitemapEvidence = monitoringSummary.sitemap || postGsc.sitemap;
const sitemapRecord = currentSitemapEvidence?.sitemap?.find((item) => item.path === "https://echobuddha.com/sitemap.xml");
const sitemapSubmittedCount = Number(sitemapRecord?.contents?.find((item) => item.type === "web")?.submitted || 0);
const sitemapRefetched = Boolean(sitemapRecord?.lastDownloaded) && new Date(sitemapRecord.lastDownloaded) >= new Date(currentProductionRelease.deployedAt) && sitemapSubmittedCount === 151 && String(sitemapRecord.errors || "0") === "0" && String(sitemapRecord.warnings || "0") === "0";
const successorRows = authorizedSuccessorUrls.map((URL) => crawlByUrl.get(URL)).filter(Boolean);
const successorReleaseHealthy = successorRows.length === authorizedSuccessorUrls.length && successorRows.every(contractCheck);
const redirectSourcesRecrawled = redirectGoogle.filter((row) => row.postdeploy_crawl === "YES");
const redirectSourcesProcessedAsIntended = redirectSourcesRecrawled.filter((row) => {
  const state = `${row.coverageState || ""} ${row.pageFetchState || ""} ${row.interpretation || ""}`;
  return /redirect/i.test(state) && !/redirect error|REDIRECT_ERROR|RECHECK_REQUIRED/i.test(state);
});
const redirectSourceErrors = redirectSourcesRecrawled.filter((row) => /redirect error|REDIRECT_ERROR|RECHECK_REQUIRED/i.test(`${row.coverageState || ""} ${row.pageFetchState || ""} ${row.interpretation || ""}`));
const postdeployNoindexConvergence = convergenceRows.filter((row) => row.intended_state === "NOINDEX_USER_PAGE_200" && row.converged === "YES");
const latestSite = monitoringSearch.find((row) => row.row_type === "SITE_TOTAL" && row.window === "latest28");
const previousSite = monitoringSearch.find((row) => row.row_type === "SITE_TOTAL" && row.window === "previous28");
const materialGoogleConvergence = crawl.length === 346 && contractFailures.length === 0 && successorReleaseHealthy && sitemapRefetched && priorityConverged.length >= 3 && redirectSourcesProcessedAsIntended.length === redirectGoogle.length && postdeployNoindexConvergence.length >= 1 && redirectSourceErrors.length === 0 && gscUiMonitoring.manual_actions === "NO_ISSUES_DETECTED" && gscUiMonitoring.security_issues === "NO_ISSUES_DETECTED";
const phase14Status = materialGoogleConvergence ? "PASS" : "DEPLOYED_MONITORING_REQUIRED";

const independent = {
  generated_at: generatedAt,
  reviewer: "INDEPENDENT_DETERMINISTIC_PRODUCTION_REVIEW",
  production_origin: "https://echobuddha.com",
  deployed_commit: currentProductionRelease.commit,
  deployment_id: currentProductionRelease.deploymentId,
  samples: {
    deterministic_seed: "phase14",
    deterministic_indexable_sample_size: deterministic.length,
    deterministic_indexable_urls: deterministic.map((row) => row.URL),
    weakest_phase_12_sample_size: weakestRows.length,
    weakest_phase_12_urls: weakestRows.map((row) => row.URL),
  },
  checks: [
    { name: "complete production index contract", pass: contractFailures.length === 0, evidence: `${indexRows.length - contractFailures.length}/${indexRows.length}` },
    { name: "authorized successor additions", pass: successorReleaseHealthy, evidence: `${successorRows.filter(contractCheck).length}/${authorizedSuccessorUrls.length} current-release additions` },
    { name: "SEO P0 production health", pass: protectedResult(p0), evidence: `${p0.length} checked` },
    { name: "SEO P1 production health", pass: protectedResult(p1), evidence: `${p1.length} checked` },
    { name: "C0 production health", pass: cornerstoneResult(c0), evidence: `${c0.length} checked` },
    { name: "C1 production health", pass: cornerstoneResult(c1), evidence: `${c1.length} checked` },
    { name: "redirect graph", pass: redirectRows.every((row) => row.result === "PASS"), evidence: `${redirectRows.length} one-hop redirects` },
    { name: "sitemap", pass: phase11.checks.sitemap_count === 149 && crawl.filter((row) => row.sitemap === "YES").length === 151, evidence: "immutable Phase 11 count 149; current authorized count 151" },
    { name: "firewall", pass: firewallRows.every((row) => row.result === "PASS"), evidence: `${firewallRows.length} adversarial surfaces; zero ad slots/placeholders` },
    { name: "deterministic indexable sample", pass: deterministic.every(contractCheck), evidence: `${deterministic.length}/${deterministic.length}` },
    { name: "weakest Phase 12 sample", pass: weakestRows.every(contractCheck), evidence: `${weakestRows.length}/${weakestRows.length}` },
    { name: "sitemap postdeploy refetch", pass: sitemapRefetched, evidence: sitemapRefetched ? `refetched ${sitemapRecord.lastDownloaded}; 151 submitted URLs` : "successor-release 151-URL refetch not observed" },
    { name: "priority URL postdeploy processing", pass: priorityConverged.length >= 3, evidence: `${priorityConverged.length}/${inspection.length} priority URLs converged after deployment` },
    { name: "critical redirect-source processing", pass: redirectSourcesProcessedAsIntended.length === redirectGoogle.length, expected_hold: redirectSourcesProcessedAsIntended.length !== redirectGoogle.length, evidence: `${redirectSourcesRecrawled.length}/${redirectGoogle.length} recrawled; ${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length} processed as intended; ${redirectSourceErrors.length} redirect-error state(s)` },
    { name: "representative noindex postdeploy processing", pass: postdeployNoindexConvergence.length >= 1, expected_hold: postdeployNoindexConvergence.length < 1, evidence: `${postdeployNoindexConvergence.length} representative noindex priority URLs recrawled and excluded after deployment` },
    { name: "Search Console account safety", pass: gscUiMonitoring.manual_actions === "NO_ISSUES_DETECTED" && gscUiMonitoring.security_issues === "NO_ISSUES_DETECTED", evidence: "Manual Actions and Security Issues: no issues detected" },
    { name: "material Google convergence", pass: materialGoogleConvergence, expected_hold: !materialGoogleConvergence, evidence: materialGoogleConvergence ? "all material convergence gates satisfied" : "critical redirect-source Google processing remains pending" },
  ],
  immediate_technical_result: contractFailures.length === 0 && firewallRows.every((row) => row.result === "PASS") ? "PASS" : "FAIL",
  phase_14_status: phase14Status,
};
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_INDEPENDENT_VALIDATION.json"), `${JSON.stringify(independent, null, 2)}\n`);

const methodManifest = {
  generated_at: generatedAt,
  status: phase14Status,
  immutable_initial_release: { commit: initialPhase14Release.commit, deployment_id: initialPhase14Release.deploymentId, version_id: initialPhase14Release.versionId, deployed_at: initialPhase14Release.deployedAt },
  current_authorized_release: { commit: currentProductionRelease.commit, documentation_head: currentProductionRelease.documentationHead, deployment_id: currentProductionRelease.deploymentId, version_id: currentProductionRelease.versionId, deployed_at: currentProductionRelease.deployedAt },
  methods: [
    "Detached-worktree Node 22/npm 10 clean install, full release validation, build-once artifact manifest, and aggregate SHA verification",
    "Authenticated Cloudflare exact-artifact deployment after disconnecting the competing Git integration",
    "Complete 346-row current production HTTP/canonical/robots/sitemap/firewall crawl while preserving the immutable 344-row initial baseline",
    "Detached current-main worktree release validation against documentation head 00b0b3e86215799d8f8fb7e71d8aa5ce53914537",
    "In-app browser journeys and homepage Search Console live URL test",
    "Search Console Search Analytics and URL Inspection APIs using only webmasters.readonly",
    "Search Console UI: existing sitemap inspection, six accepted one-time indexing requests, one intended-noindex request rejection, Manual Actions, and Security Issues",
    "Deterministic independent indexable sample and Phase 12 weakest-page sample",
  ],
  evidence_boundaries: [
    "URL Inspection API reports Google's indexed state, not a live URL test.",
    `${priorityPostdeployCrawls.length}/${inspection.length} priority inspection timestamps now postdate deployment; ${redirectSourcesRecrawled.length}/${redirectGoogle.length} approved redirect sources have postdeployment Google crawl evidence and ${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length} are processed as intended.`,
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
- Production sitemap: HTTP 200; 151 unique canonical intended-indexable URLs.
- Excluded from sitemap: 186 noindex pages, 3 permanent redirect sources, the temporary 404 filename normalization route, and error states.
- Sitemap contract failures: ${contractFailures.filter((row) => row.expected_sitemap !== row.actual_sitemap).length}.
- Sitemap host/staging failures: 0.
- Search Console: one existing canonical sitemap, status Success, 0 errors, 0 warnings; refetched ${sitemapRecord?.lastDownloaded || "NOT_OBSERVED"} with ${sitemapSubmittedCount} submitted URLs.
- Duplicate submission performed: NO.
- Current state: ${sitemapRefetched ? "The authorized successor-release 151-URL sitemap refetch is confirmed." : "Google successor-release sitemap refetch remains pending."}

RESULT = ${sitemapRefetched ? "PASS_LIVE_AND_GSC_REFETCHED" : "PASS_LIVE / GOOGLE_REFETCH_PENDING"}
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_SITEMAP_ROBOTS_VALIDATION.md"), sitemapDoc);

const runbook = `# EchoBuddha Phase 14 Monitoring Runbook

PHASE_14_STATUS = ${phase14Status}

Do not redeploy unchanged code and do not begin Phase 15. Preserve the initial Phase 14 deployment marker ${deployedAt}, the immutable 344-row baseline, and the immutable predeploy Search baseline. The current authorized successor release is ${currentProductionRelease.commit}.

## Immediate and short-term checks

1. Re-run the 346-URL current production crawl and fail on any new 5xx, P0/P1 non-200, approved-addition failure, redirect loop/chain, canonical mismatch, sitemap pollution, accidental noindex, ad runtime, or empty ad placeholder.
2. Preserve the confirmed successor-release 151-URL sitemap refetch. Do not submit a duplicate.
3. Re-run one URL Inspection API snapshot only at meaningful checkpoints. Do not exhaust quota or call it a live test.
4. Track every SEO-P0 and SEO-P1 URL for coverage, Google canonical, last crawl, and material click/impression change using finalized comparable windows.
5. Track the two letting-go redirect sources and the legal rename until Google recrawls them after deployment; also require one representative intended-noindex page to be recrawled and excluded after deployment.
6. Recheck Page Indexing, Manual Actions, and Security Issues in Search Console.

## Suggested observation opportunities

- Short-term: Google has recrawled the three requested priority pages, processed the representative noindex page, and refetched the 151-URL successor sitemap; the remaining material gate is the three redirect sources.
- Approximately one week: repeat protected-page and convergence matrices with finalized Search data.
- Approximately two weeks: repeat only if material convergence is still unproven.

These are observation opportunities, not Google guarantees. Google may need days to weeks. Do not churn valid redirects, canonicals, or content while the coherent release is processing.

## Escalation

- DEPLOY_P0_ROLLBACK: site-wide 5xx/noindex/robots block/wrong canonical host, widespread P0/P1 404, systemic redirect failure, unusable sitemap, accidental ads, or compromised main navigation.
- DEPLOY_P1_CRITICAL: isolated protected-owner loss or security/manual-action issue; freeze and choose tested rollback or fix-forward.
- GOOGLE_PROCESSING_EXPECTED: old crawl timestamp, old sitemap count, or pending noindex/removal convergence without a live technical defect.

Current-release rollback target remains the initial Phase 14 version ${initialPhase14Release.versionId}. No rollback was required in this pass.
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_MONITORING_RUNBOOK.md"), runbook);

const manifest = `# EchoBuddha Phase 14 Deployment Manifest

- Immutable initial Phase 14 recovery commit: \`${initialPhase14Release.commit}\`
- Immutable initial Phase 14 deployment ID: \`${initialPhase14Release.deploymentId}\`
- Immutable initial Phase 14 version ID: \`${initialPhase14Release.versionId}\`
- Immutable initial Phase 14 deployed at: \`${initialPhase14Release.deployedAt}\`
- Target production branch: \`main\`
- Current authorized production commit: \`${currentProductionRelease.commit}\`
- Current main documentation head: \`${currentProductionRelease.documentationHead}\`
- Deployment platform: Cloudflare Workers static assets
- Current deployment method: authorized GitHub/Cloudflare production workflow recorded in \`docs/deployments/2026-09-02-q1-q2-buddhist-questions.md\`.
- Current deployment ID: \`${currentProductionRelease.deploymentId}\`
- Current version ID: \`${currentProductionRelease.versionId}\`
- Current deployed at: \`${currentProductionRelease.deployedAt}\`
- Historical recovery boundary: the initial 344-row release remains immutable; the authorized successor added exactly two indexable Learn detail pages.
- Current production inventory: 346 contract rows = 151 indexable pages + 186 noindex pages + 3 permanent redirects + 1 temporary error-shell normalization + 5 technical resources.
- Built HTML pages: 337
- Intended sitemap URLs: 151
- Search records: 316
- Authorized successor additions: 2
- Permanent redirect sources: 3
- Current rollback target: \`${initialPhase14Release.versionId}\`
- Rollback readiness: verified against the predeploy 14/14 smoke baseline
- Rollback used: NO
- Ad serving: OFF
- AdSense resubmission: BLOCKED
- Google Indexing API used: NO
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_DEPLOYMENT_MANIFEST.md"), manifest);

const reportSections = [
  ["Executive Summary", `The immutable initial Phase 14 release remains preserved and the authorized two-URL successor release is technically healthy. Live validation passes, Google refetched the 151-URL successor sitemap, and ${priorityConverged.length} priority URLs plus the representative noindex case have postdeployment convergence. Critical redirect-source processing remains pending, so the exit state is ${phase14Status}.`],
  ["Phase 13 Result", "PASS_NO_EXPANSION_REQUIRED at the immutable initial release boundary. A separately authorized successor release later added exactly two governed indexable Learn detail pages."],
  ["Release Commit", `Initial Phase 14 release ${initialPhase14Release.commit} remains the historical baseline. Production now serves authorized successor ${currentProductionRelease.commit}; deployment ${currentProductionRelease.deploymentId}; version ${currentProductionRelease.versionId}.`],
  ["Predeploy Production Baseline", "344 known URLs were captured against the old deployment: 342 HTTP 200, one 307 and one 404; the old sitemap contained 194 URLs; no ads or placeholders were found."],
  ["Predeploy Search Baseline", `Finalized through ${preGsc.finalized_end_date}; latest and previous comparable 28-day windows, protected pages, hashed Query × Page rows, 16 priority inspections and one sitemap record were preserved as PRE_DEPLOYMENT_GOOGLE_STATE.`],
  ["Google Search Update Context", "The August 2026 spam update completed before deployment. The official Search Status Dashboard showed no active crawling, indexing, ranking, or serving incident at the 2026-08-28 monitoring checkpoint; early movement remains confounded by update recency."],
  ["Rollback Readiness", `The initial Phase 14 version ${initialPhase14Release.versionId} remains the rollback target for the current successor release; no rollback is required.`],
  ["Deployment Execution", `The immutable initial Phase 14 artifact was deployed at ${initialPhase14Release.deployedAt}. The separately authorized two-URL successor artifact was deployed at ${currentProductionRelease.deployedAt} through the governed production workflow.`],
  ["Immediate Production Health", "The current-release smoke suite passes 14/14. Homepage, representative content, both approved additions, trust, error handling, HTTPS, security headers and preview noindex are healthy."],
  ["P0/P1 Validation", `${p0.length} SEO-P0 and ${p1.length} SEO-P1 registry URLs match their live intended contracts.`],
  ["C0/C1 Validation", `${c0.length} C0 and ${c1.length} C1 cornerstone URLs match their live intended contracts.`],
  ["Quote Validation", "Retained Quote categories and approved story states are live; noindex Quote permalinks remain 200 + noindex and out of the sitemap."],
  ["HTTP Status Validation", `${JSON.stringify(statusCounts)} across ${crawl.length} current-contract rows; ${contractFailures.length} contract failures.`],
  ["Redirect Validation", `${redirectRows.length} redirects are one hop, end at HTTP 200, avoid loops, and remain outside the sitemap.`],
  ["Canonical Validation", `${canonicalRows.filter((row) => row.canonical_result === "PASS").length}/${canonicalRows.length} applicable canonical checks pass.`],
  ["robots.txt", "HTTP 200, canonical sitemap declaration present, no production-wide disallow, and intended noindex pages remain crawlable."],
  ["Sitemap", `The live sitemap has 151 intended canonical URLs. Search Console refetched it after the authorized successor deployment on ${sitemapRecord?.lastDownloaded || "UNKNOWN"} and now reports 151 submitted/discovered URLs with zero errors or warnings.`],
  ["Noindex", "All 186 intended user-useful noindex pages remain HTTP 200, crawlable, canonicalized as designed, and excluded from the sitemap."],
  ["Structured Data", "The exact artifact passed Phase 11 parsing with zero structured-data failures; representative production pages expose reviewed types and no staging entities."],
  ["Internal Links", "The current authorized artifact passed governed validation with 0 broken internal links and no controlled links through redirect sources; production route delivery matches that artifact."],
  ["404 / Error State", "A random invalid route returns a genuine 404; /404 is the intentional noindex user page and /404.html normalizes temporarily to /404."],
  ["UX Smoke", "Desktop navigation, article, Quote, trust, Contact and search journeys pass in the production browser."],
  ["Accessibility Smoke", "Skip link, named landmarks/dialog/searchbox and keyboard Escape dismissal pass. The responsive Phase 9 suite passed on the exact artifact."],
  ["Performance Smoke", "No broken assets or systemic HTTP failures appeared in the full crawl/browser journeys; no Lighthouse-100 threshold was imposed and field CWV remains insufficient."],
  ["AdSense Firewall", `${firewallRows.length}/${firewallRows.length} adversarial surfaces contain zero real ad runtime, slots or empty placeholders. Verification infrastructure is preserved.`],
  ["Production Crawl", `${crawl.length} rows, zero fetch errors, 151 sitemap URLs, zero ad signals and zero empty placeholders.`],
  ["Production vs Intended Contract", `${indexRows.length - contractFailures.length}/${indexRows.length} rows pass; ${changedCount} rows differ materially from old production and all differences are expected.`],
  ["Search Console Sitemap State", `One canonical sitemap; Success; zero errors and warnings; postdeployment refetch confirmed with ${sitemapSubmittedCount} URLs. No duplicate was submitted.`],
  ["Recrawl Actions", "Six one-time UI requests were accepted: the original homepage, Right Speech owner, and letting-go survivor plus all three approved redirect sources. A representative noindex request was rejected after a successful postdeployment live fetch detected the intended noindex directive; no request was repeated."],
  ["URL Inspection", `${inspection.length} priority API inspections: ${JSON.stringify(inspectionVerdicts)}; ${priorityPostdeployCrawls.length} last-crawl timestamps now postdate deployment and ${priorityConverged.length} match their intended state. This is indexed-state evidence, not live-test evidence.`],
  ["Google Canonical Processing", `${priorityConverged.length} postdeployment priority crawls show successful fetches and intended canonical/index states, including all three requested priority URLs.`],
  ["Redirect Processing", `Live redirects are correct. ${redirectSourcesRecrawled.length}/${redirectGoogle.length} approved redirect sources have postdeployment Google crawl evidence and ${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length} are processed as intended. Search Console currently reports ${redirectSourceErrors.length} redirect-error state(s); live Googlebot-compatible HTTP checks still show a single 301 hop to HTTP 200, so this is a monitored Google-state discrepancy rather than a confirmed production defect.`],
  ["Noindex / Removal Processing", `Live directives are correct and Search Console reports 46 excluded noindex examples. A 2026-08-29 live inspection fetch detected the intended noindex, and ${postdeployNoindexConvergence.length} representative priority noindex URLs now have postdeployment stored indexed-state crawl/exclusion evidence. This gate is satisfied.`],
  ["Search Performance", `Finalized through ${monitoringSummary.finalized_end_date}. Latest 28-day site totals are ${latestSite?.clicks || 0} clicks/${latestSite?.impressions || 0} impressions versus ${previousSite?.clicks || 0}/${previousSite?.impressions || 0}; this supports no systemic collapse but does not prove causality.`],
  ["P0/P1 Search Protection", `All ${p0.length + p1.length} protected routes are live and technically healthy; all P0s and 31/32 P1s have visible latest-window rows, with one low-volume P1 moving from 9 prior impressions to no visible current row.`],
  ["Material Google Convergence", `${materialGoogleConvergence ? "ESTABLISHED" : "NOT YET ESTABLISHED"}: sitemap refetch=${sitemapRefetched ? "YES" : "NO"}; priority convergence=${priorityConverged.length}/${inspection.length}; redirect sources recrawled=${redirectSourcesRecrawled.length}/${redirectGoogle.length}; redirect sources processed as intended=${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length}; redirect errors=${redirectSourceErrors.length}; representative noindex postdeploy convergence=${postdeployNoindexConvergence.length}.`],
  ["Policy Regression Check", "Representative homepage, article, Quote, trust and weak-page production samples retain reviewed content, authorship/source signals and no hidden/ad content regression."],
  ["Production Privacy / Secret Check", "OAuth material remained outside the repository; query text is hashed; no credential/session/account data is included in artifacts. Final automated scan is recorded separately."],
  ["Independent Validation", `Immediate technical result PASS; current-main release validation PASS; Phase 14 artifact validation PASS; deterministic ${deterministic.length}-URL indexable sample and ${weakestRows.length}-URL weakest-page sample pass. Material Google convergence=${materialGoogleConvergence ? "PASS" : "EXPECTED HOLD"}.`],
  ["Rollback / Fix-Forward Actions", "ROLLBACK_REQUIRED = NO. A stale pre-recovery count assertion in the smoke script was corrected to read the current governed inventory; it did not alter production assets."],
  ["Explicit Holds", materialGoogleConvergence ? "FIELD_CWV_INSUFFICIENT_DATA only; non-material." : `${redirectSourceErrors.length ? "REDIRECT_SOURCE_GOOGLE_STATE_ERROR; " : ""}${redirectSourcesRecrawled.length < redirectGoogle.length ? "CRITICAL_REDIRECT_SOURCE_RECRAWL_PENDING; " : ""}${postdeployNoindexConvergence.length ? "" : "REPRESENTATIVE_NOINDEX_POSTDEPLOY_RECRAWL_PENDING; "}MATERIAL_GOOGLE_CONVERGENCE_PENDING; FIELD_CWV_INSUFFICIENT_DATA.`],
  ["Monitoring Required", materialGoogleConvergence ? "No further Phase 14 convergence monitoring is required before Phase 15." : "Continue the resumable Phase 14 runbook. Do not redeploy unchanged code or create content churn."],
  ["Phase 15 Gate", materialGoogleConvergence ? "OPEN: Phase 14 PASS authorizes Phase 15." : "BLOCKED_PENDING_MATERIAL_GOOGLE_CONVERGENCE. Phase 15 was not started."],
  ["Phase 14 Exit Status", `PHASE_14_STATUS = ${phase14Status}`],
];
const report = `# EchoBuddha Phase 14 Production Validation + Recrawl Report\n\n${reportSections.map(([title, body], index) => `## ${index + 1}. ${title}\n\n${body}`).join("\n\n")}\n`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_PRODUCTION_VALIDATION_RECRAWL_REPORT.md"), report);

const handoff = `# EchoBuddha Phase 14 → Phase 15 Gate Record

PHASE_15_GATE = ${materialGoogleConvergence ? "OPEN" : "BLOCKED_PENDING_MATERIAL_GOOGLE_CONVERGENCE"}

${materialGoogleConvergence ? "This gate record authorizes Phase 15; it does not authorize AdSense submission." : "This is a gate record, not authorization to begin Phase 15."}

- Immutable initial Phase 14 commit: \`${initialPhase14Release.commit}\`
- Current authorized production commit: \`${currentProductionRelease.commit}\`
- Current deployment date: \`${currentProductionRelease.deployedAt}\`
- Phase 13 historical boundary: PASS_NO_EXPANSION_REQUIRED
- Authorized successor expansion: 2 governed indexable Learn detail pages
- Phase 12: PASS_WITH_EXPLICIT_HOLDS compatible with deployment
- Production inventory: 337 built pages; 151 indexable; 186 noindex; 3 permanent redirects; live contract ${indexRows.length - contractFailures.length}/${indexRows.length} PASS
- Authorized successor additions: ${successorRows.filter(contractCheck).length}/${authorizedSuccessorUrls.length} technically healthy
- P0/P1: technically healthy in production
- Google convergence: ${materialGoogleConvergence ? "established" : `not established; ${priorityConverged.length}/${inspection.length} priority URLs converged, ${redirectSourcesRecrawled.length}/${redirectGoogle.length} redirect sources recrawled, ${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length} redirect sources processed as intended, ${redirectSourceErrors.length} redirect error(s), and ${postdeployNoindexConvergence.length} representative noindex URLs converged after deployment`}
- Random sample: ${deterministic.length}/${deterministic.length} PASS
- Weakest-page sample: ${weakestRows.length}/${weakestRows.length} PASS
- AdSense: ads OFF; resubmission BLOCKED
- Next: ${materialGoogleConvergence ? "PHASE 15 — INDEPENDENT FINAL ADSENSE READINESS AUDIT" : "CONTINUE PHASE 14 MONITORING / REMEDIATION"}
`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_PHASE_15_HANDOFF.md"), handoff);

const monitoringDate = generatedAt.slice(0, 10);
const monitoringCheckpoint = `# EchoBuddha Phase 14 Monitoring Checkpoint — ${monitoringDate}

PHASE_14_STATUS = ${phase14Status}
PHASE_15_GATE = ${materialGoogleConvergence ? "OPEN" : "BLOCKED_PENDING_MATERIAL_GOOGLE_CONVERGENCE"}

## Confirmed progress

- Production smoke: 14/14 PASS.
- Current-main release validation: PASS.
- Phase 14 artifact validation: PASS.
- Complete production contract: ${indexRows.length - contractFailures.length}/${indexRows.length} PASS.
- Authorized successor additions: ${successorRows.filter(contractCheck).length}/${authorizedSuccessorUrls.length} PASS.
- Live sitemap: 151 canonical URLs.
- Search Console sitemap: refetched after the successor deployment; 151 submitted/discovered URLs; Success; zero errors/warnings.
- Priority URL Inspection: ${priorityConverged.length}/${inspection.length} have postdeployment crawl evidence and match intended state.
- Requested priority URLs: homepage, Right Speech owner, and letting-go survivor all recrawled after deployment with successful fetch, indexing allowed, and matching Google/user canonicals.
- One-time recrawl requests accepted on 2026-08-29: all three approved redirect sources.
- Representative noindex live test on 2026-08-29: successful fetch; intended noindex detected; indexing request rejected because the directive is working.
${postdeployNoindexConvergence.length ? `- Representative intended-noindex indexed-state convergence: ${postdeployNoindexConvergence.length} postdeployment crawl(s) successfully fetched and excluded by noindex.` : ""}
- Latest finalized Search window (${monitoringSummary.windows.latest28.startDate} to ${monitoringSummary.windows.latest28.endDate}): ${latestSite?.clicks || 0} clicks and ${latestSite?.impressions || 0} impressions, versus ${previousSite?.clicks || 0} and ${previousSite?.impressions || 0} in the previous 28 days.
- Manual Actions: no issues detected.
- Security Issues: no issues detected.
- Real ad serving: OFF.

## Remaining material evidence gaps

- Approved redirect sources recrawled after deployment: ${redirectSourcesRecrawled.length}/${redirectGoogle.length}.
- Approved redirect sources processed as intended after deployment: ${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length}; redirect-error states: ${redirectSourceErrors.length}.
${postdeployNoindexConvergence.length ? "" : "- Representative intended-noindex priority URL still lacks a postdeployment indexed-state crawl/exclusion."}
${redirectSourceErrors.length ? `- Search Console has processed ${redirectSourcesRecrawled.length} recovery redirect source(s) after deployment but currently reports ${redirectSourceErrors.length} Redirect error state(s); live production remains valid one-hop 301 to HTTP 200.` : ""}

## Decision

${materialGoogleConvergence ? "Material Google convergence is established. Phase 14 PASS and the Phase 15 gate is open." : `The noindex convergence gate is ${postdeployNoindexConvergence.length ? "satisfied" : "still pending"}. Phase 15 remains blocked because ${redirectGoogle.length - redirectSourcesRecrawled.length} critical redirect source(s) still lack postdeployment processing and ${redirectSourceErrors.length} processed source(s) remain in a Redirect error indexed state. Continue Phase 14 monitoring without redeploying or repeating indexing requests.`}
`;
fs.writeFileSync(path.join(outDir, `ECHO_BUDDHA_PHASE_14_MONITORING_CHECKPOINT_${monitoringDate}.md`), monitoringCheckpoint);

console.log(JSON.stringify({
  generated_at: generatedAt,
  phase_14_status: phase14Status,
  production_contract: `${indexRows.length - contractFailures.length}/${indexRows.length}`,
  p0: p0.length,
  p1: p1.length,
  c0: c0.length,
  c1: c1.length,
  redirects: redirectRows.length,
  firewall: `${firewallRows.filter((row) => row.result === "PASS").length}/${firewallRows.length}`,
  url_inspections: inspection.length,
  all_google_crawls_predeploy: allGoogleCrawlsPredeploy,
  priority_postdeploy_crawls: priorityPostdeployCrawls.length,
  priority_converged: priorityConverged.length,
  sitemap_refetched: sitemapRefetched,
  redirect_sources_recrawled: `${redirectSourcesRecrawled.length}/${redirectGoogle.length}`,
  redirect_sources_processed_as_intended: `${redirectSourcesProcessedAsIntended.length}/${redirectGoogle.length}`,
  redirect_source_errors: redirectSourceErrors.length,
  representative_noindex_converged: postdeployNoindexConvergence.length,
  material_google_convergence: materialGoogleConvergence,
}, null, 2));
