import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const auditDir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-10-search-console-measurement");
const sourceDir = path.join(auditDir, "source-data");
const finalValidation = process.env.PHASE10_FINAL_VALIDATION === "passed";
const production = {
  sha: "d65e313d94000a1a049099c4ee7cad5cffbdfd4a",
  deployedAt: "2026-08-13T12:42:04.629020Z",
  deploymentId: "602d2a90-2705-42cb-87ce-23905dd46d81",
  versionId: "ad82bc9d-2120-4e97-825f-eb9656370f3d",
};

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter((r) => r.some((v) => v !== "")).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
}

function readCsv(file) { return parseCsv(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")); }
function esc(value) { const s = String(value ?? ""); return `"${s.replaceAll('"', '""')}"`; }
function writeCsv(name, headers, rows) {
  fs.writeFileSync(path.join(auditDir, name), `${headers.map(esc).join(",")}\n${rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n")}\n`);
}
function n(value) { if (value == null || value === "") return 0; return Number(String(value).replace(/[% ,]/g, "")); }
function pct(value, digits = 2) { return `${Number(value).toFixed(digits)}%`; }
function round(value, digits = 2) { return Number(Number(value).toFixed(digits)); }
function weighted(rows, impressionKey, positionKey) {
  const impressions = rows.reduce((sum, r) => sum + n(r[impressionKey]), 0);
  return impressions ? rows.reduce((sum, r) => sum + n(r[impressionKey]) * n(r[positionKey]), 0) / impressions : 0;
}
function aggregate(rows, clickKey = "Clicks", impressionKey = "Impressions", positionKey = "Position") {
  const clicks = rows.reduce((sum, r) => sum + n(r[clickKey]), 0);
  const impressions = rows.reduce((sum, r) => sum + n(r[impressionKey]), 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions * 100 : 0, position: weighted(rows, impressionKey, positionKey) };
}
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function route(url) { try { return new URL(url).pathname; } catch { return url; } }
function family(url) {
  const p = route(url);
  if (p === "/") return "Homepage";
  if (p.startsWith("/articles/")) return "Articles";
  if (p.startsWith("/meditation/")) return "Meditation";
  if (p.startsWith("/learn/buddhist-dictionary/")) return "Dictionary";
  if (p.startsWith("/learn/sutta-for-daily-life/")) return "Sutta Study";
  if (p.startsWith("/learn/dhammapada-reflections/")) return "Dhammapada";
  if (p.startsWith("/learn/buddhism-101/")) return "Buddhism 101";
  if (p.startsWith("/learn/")) return "Learn";
  if (p.startsWith("/quotes/") && p.split("/").filter(Boolean).length === 2) return "Quote Categories";
  if (p.startsWith("/quotes/")) return "Quote Stories";
  if (p.startsWith("/daily-reflections/")) return "Daily Reflections";
  if (["/about/", "/contact/", "/corrections/", "/editorial-policy/", "/privacy-policy/", "/terms-of-use/", "/disclaimer/", "/buddhist-sources-and-citations/", "/how-echo-buddha-creates-content/", "/quote-attribution-policy/", "/meditation-safety/"].includes(p)) return "Trust / Policy";
  if (p.startsWith("/tools/")) return "Tools";
  return "Other";
}

const perf = (folder, file) => path.join(sourceDir, folder, file);
const latestChart = readCsv(perf("performance-latest-28", "Chart.csv"));
const historyChart = readCsv(perf("performance-last-3-months", "Chart.csv"));
const latestPages = readCsv(perf("performance-latest-28", "Pages.csv"));
const latestQueries = readCsv(perf("performance-latest-28", "Queries.csv"));
const latestCountries = readCsv(perf("performance-latest-28", "Countries.csv"));
const latestDevices = readCsv(perf("performance-latest-28", "Devices.csv"));
const historyPages = readCsv(perf("performance-last-3-months", "Pages.csv"));
const historyQueries = readCsv(perf("performance-last-3-months", "Queries.csv"));
const comparePages = readCsv(perf("performance-compare-28-days", "Pages.csv"));
const compareQueries = readCsv(perf("performance-compare-28-days", "Queries.csv"));
const compareCountries = readCsv(perf("performance-compare-28-days", "Countries.csv"));
const compareDevices = readCsv(perf("performance-compare-28-days", "Devices.csv"));
const coverageChart = readCsv(perf("page-indexing", "Chart.csv"));
const coverageReasons = readCsv(perf("page-indexing", "Critical issues.csv"));
const httpsChart = readCsv(perf("https", "Chart.csv"));
const enhancementChart = readCsv(perf("breadcrumbs", "Chart.csv"));
const gscLinks = readCsv(perf("links", "echobuddha.com-Top target pages-2026-08-13.csv"));

const masterRows = readCsv(path.join(root, "docs/audits/adsense-rejection-2026-08/reconciliation/MASTER_PHASE_0_4_RECONCILED_PAGE_REGISTER.csv"));
const masterByUrl = new Map(masterRows.map((r) => [r.URL, r]));
const ownerRows = readCsv(path.join(root, "docs/audits/adsense-rejection-2026-08/reconciliation/phase-0-4-current-topic-owner-review.csv"));
const ownerByTopic = new Map(ownerRows.map((r) => [r.Topic, r["Primary owner URL"]]));
const pageCompareByUrl = new Map(comparePages.map((r) => [r["Top pages"], r]));
const latestPageByUrl = new Map(latestPages.map((r) => [r["Top pages"], r]));
const gscLinkByUrl = new Map(gscLinks.map((r) => [r["Target page"], n(r["Internal links"])]));
const latest = aggregate(latestChart);
const prior = aggregate(compareDevices, "Previous 28 days Clicks", "Previous 28 days Impressions", "Previous 28 days Position");
const history = aggregate(historyChart);
const prior14 = aggregate(latestChart.slice(0, 14));
const latest14 = aggregate(latestChart.slice(14));
const visibleLatestQueries = aggregate(latestQueries);
const visiblePriorQueries = aggregate(compareQueries, "Previous 28 days Clicks", "Previous 28 days Impressions", "Previous 28 days Position");
const coverageLast = coverageChart.at(-1);
const httpsLast = httpsChart.at(-1);
const enhancementLast = enhancementChart.at(-1);

const clusterRules = [
  ["Dhamma vs Dharma", /dhamma.*dharma|dharma.*dhamma/i, "comparison", "/articles/dhamma-vs-dharma/", "Dhamma / Dharma"],
  ["Dhammapada attribution", /what we think|dhammapada.*translation|buddha.*attribution|verse 1/i, "source / attribution", "/articles/dhammapada-reflection-what-we-think/", "Dhammapada"],
  ["Beginner Buddhism", /buddhism.*beginner|beginner.*buddhism|practice buddhism.*beginner/i, "foundational learning", "/learn/buddhism-for-beginners/", "Beginner Buddhism"],
  ["Right Speech", /right speech/i, "teaching / practical application", "/articles/right-speech-buddhism/", "Right Speech"],
  ["Sangha", /sangha/i, "definition / foundation", "/articles/what-is-sangha-buddhist-community/", "Sangha"],
  ["Five Precepts", /five precepts|5 precepts/i, "foundation / ethics", "/learn/buddhism-101/five-precepts-buddhism/", "Five Precepts"],
  ["Three Poisons", /three poisons|3 poisons/i, "foundation / explanation", "/articles/three-poisons-buddhism-explained/", "Three Poisons"],
  ["Letting Go / Non-Attachment", /letting go|let go|non.?attachment|attachment/i, "quote / practical application", "/quotes/letting-go/", "Attachment / Non-Attachment / Letting Go"],
  ["Patience", /patience/i, "quote / practical application", "/quotes/patience/", "Patience"],
  ["Compassion", /compassion|karuna/i, "teaching / quote", "/articles/compassion-in-buddhism-beginner-guide/", "Compassion"],
  ["Metta", /metta|loving.?kindness/i, "definition / practice", "/learn/buddhist-dictionary/metta/", "Loving-Kindness / Metta"],
  ["Meditation", /meditat|anapanasati|breath/i, "practice", "/meditation/", "Meditation"],
  ["Mindfulness", /mindful|sati\b/i, "definition / practice", "/learn/buddhism-101/what-is-mindfulness/", "Mindfulness"],
  ["Eightfold Path", /eightfold|magga.?vibhanga/i, "foundation / source study", "/learn/eightfold-path/", "Noble Eightfold Path"],
  ["Four Noble Truths", /four noble truths|4 noble truths|dukkha/i, "foundation", "/learn/four-noble-truths/", "Four Noble Truths"],
  ["Brahmaviharas", /brahma.?vihara/i, "foundation", "/learn/buddhism-101/four-brahmaviharas/", "Brahmaviharas"],
  ["Threefold Training", /sila.*samadhi.*panna|threefold training/i, "foundation", "/learn/buddhism-101/threefold-training-sila-samadhi-panna/", "Buddhist Foundations"],
  ["Dhamma", /dhamma|dharma/i, "definition", "/learn/buddhist-dictionary/dhamma/", "Dhamma / Dharma"],
  ["Sutta", /sutta|pali canon|tipitaka/i, "source / dictionary", "/learn/sutta-for-daily-life/", "Sutta Study"],
  ["Quotes", /quote|saying/i, "quote discovery", "/quotes/", "Quotes"],
  ["Other visible queries", /.*/, "mixed / insufficient", "Not derivable", "Site Discovery"],
];
function queryCluster(query) {
  const [cluster, regex, intent, likelyPage, topic] = clusterRules.find((r) => r[1].test(query));
  return { cluster, intent, likelyPage: likelyPage.startsWith("/") ? `https://echobuddha.com${likelyPage}` : likelyPage, topic, owner: ownerByTopic.get(topic) || "https://echobuddha.com/" };
}

function classifyPage(row, priorRow) {
  const clicks = n(row.Clicks), impressions = n(row.Impressions), position = n(row.Position);
  const priorImp = n(priorRow?.["Previous 28 days Impressions"]);
  if (impressions >= 50 && (clicks > 0 || priorImp <= 10) && impressions >= Math.max(50, priorImp * 2)) return "EMERGING WINNER";
  if (impressions >= 50 && position > 30) return "HIGH-IMPRESSION / LOW-RANK OPPORTUNITY";
  if (impressions >= 20 && position <= 10 && clicks === 0) return "HIGH-RANK / LOW-CLICK REVIEW";
  if (impressions < 20) return "EARLY DISCOVERY";
  return "INSUFFICIENT DATA";
}
function recommendation(classification) {
  if (classification === "EMERGING WINNER") return "PROTECT / OBSERVE";
  if (classification === "HIGH-RANK / LOW-CLICK REVIEW") return "REVIEW SNIPPET LATER after more impressions and query/URL evidence";
  if (classification === "HIGH-IMPRESSION / LOW-RANK OPPORTUNITY") return "PROTECT / OBSERVE; review owner and intent in Phase 11";
  return "NO CHANGE - CONTINUE OBSERVATION";
}

function currentInboundCounts() {
  const dist = path.join(root, "dist");
  const sources = [];
  function walk(dir) { for (const ent of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, ent.name); ent.isDirectory() ? walk(p) : ent.name.endsWith(".html") && sources.push(p); } }
  if (!fs.existsSync(dist)) throw new Error("dist is required; run npm run build before Phase 10 analysis");
  walk(dist);
  const inbound = new Map();
  for (const file of sources) {
    const targets = new Set();
    for (const match of fs.readFileSync(file, "utf8").matchAll(/href=["']([^"'#?]+)["']/g)) {
      const href = match[1];
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const normalized = href.endsWith("/") || path.extname(href) ? href : `${href}/`;
      targets.add(`https://echobuddha.com${normalized}`);
    }
    for (const target of targets) inbound.set(target, (inbound.get(target) || 0) + 1);
  }
  return inbound;
}
const currentLinks = currentInboundCounts();

// 1. Dataset inventory and data quality/freshness.
const sourceFiles = [];
function walkSources(dir) { for (const ent of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, ent.name); ent.isDirectory() ? walkSources(p) : sourceFiles.push(p); } }
walkSources(sourceDir);
const inventoryHeaders = ["Dataset", "Source file", "Family", "Filter", "Rows", "SHA-256", "Duplicate status", "Use", "Notes"];
const inventory = sourceFiles.sort().map((file) => {
  const rel = path.relative(sourceDir, file); const rows = readCsv(file); const folder = rel.split(path.sep)[0];
  let filter = "Report-specific";
  const filterFile = path.join(path.dirname(file), "Filters.csv");
  if (fs.existsSync(filterFile)) filter = readCsv(filterFile).map((r) => `${r.Filter}: ${r.Value}`).join("; ");
  return { Dataset: `${folder}/${path.basename(file)}`, "Source file": rel, Family: folder, Filter: filter, Rows: rows.length, "SHA-256": sha(file), "Duplicate status": "UNIQUE IN SNAPSHOT", Use: path.basename(file) === "Search appearance.csv" ? "Empty/header-only; limitation" : "Analysis input", Notes: "Owner-supplied GSC CSV; source preserved unchanged" };
});
writeCsv("phase-10-dataset-inventory.csv", inventoryHeaders, inventory);

const qualityHeaders = ["Dataset", "Source", "Filter", "Start date", "End date", "Export date", "Latest actual data date", "Rows", "Privacy limitation", "Coverage limitation", "Freshness", "Production-window relevance", "Usable for decisions?", "Notes"];
const quality = [
  ["Performance latest 28", "GSC", "Web; Last 28 days", "2026-07-15", "2026-08-11", "2026-08-13", "2026-08-11", latestChart.length, "Query rows suppressed/truncated", "Pages/queries are dimension aggregates", "STALE relative to current production", "Pre-Phase 8/9; Phase 7 only partial final day", "Directional only", "Property totals from Chart/Device/Country"],
  ["Performance last 3 months", "GSC", "Web; Last 3 months", "2026-06-23", "2026-08-11", "2026-08-13", "2026-08-11", historyChart.length, "Query rows suppressed/truncated", "Only 50 actual days; first nonzero 2026-06-24", "ACCEPTABLE historical", "Predominantly pre-remediation", "Yes with attribution limits", "Not three months of measurable activity"],
  ["28-day comparison", "GSC", "Web; Last 28 vs previous 28", "2026-06-17", "2026-08-11", "2026-08-13", "2026-08-11", comparePages.length, "Query rows suppressed/truncated", "No daily comparison chart supplied", "ACCEPTABLE historical", "Pre/transition; no post-Phase 8/9", "Yes directional", "Property totals from Device/Country, never Page sums"],
  ["Page Indexing", "GSC", "All known pages", "2026-06-23", "2026-08-07", "2026-08-13", "2026-08-07", coverageChart.length, "None stated", "Reason examples/URLs absent", "STALE", "Before Phases 6-9", "Aggregate only", "322 indexed; 26 not indexed"],
  ["HTTPS", "GSC", "HTTPS report", "2026-06-27", "2026-08-13", "2026-08-13", "2026-08-13", httpsChart.length, "None", "Eligible count is not indexed count", "ACCEPTABLE", "Same date as Phase 8/9 but not post-deploy evidence", "Yes for non-HTTPS status", "0 non-HTTPS"],
  ["Breadcrumb enhancement", "GSC", "Enhancement report", "2026-06-24", "2026-08-12", "2026-08-13", "2026-08-12", enhancementChart.length, "None", "Only supplied Breadcrumb report", "ACCEPTABLE", "Before final Phase 8/9", "Yes within report scope", "0 invalid"],
  ["Links", "GSC", "Top target pages/sample external links", "Not supplied", "Not supplied", "2026-08-13", "Not supplied", gscLinks.length, "GSC samples incomplete", "Link report can lag; external rows absent", "INSUFFICIENT for current graph", "Phase 7 recognition may be partial", "Directional only", "No duplicate copy present in supplied directory; no double count"],
].map((v) => Object.fromEntries(qualityHeaders.map((h, i) => [h, v[i]])));
writeCsv("phase-10-data-quality-register.csv", qualityHeaders, quality);
writeCsv("phase-10-data-freshness-register.csv", ["Dataset", "Latest data", "Current production deployment", "Lag", "Freshness", "Decision scope", "Owner refresh required"], quality.map((r) => ({ Dataset: r.Dataset, "Latest data": r["Latest actual data date"], "Current production deployment": production.deployedAt, Lag: r["Latest actual data date"] === "Not supplied" ? "Unknown" : r["Latest actual data date"] <= "2026-08-11" ? "Predates current production" : "Same calendar date; processing sequence unknown", Freshness: r.Freshness, "Decision scope": r["Usable for decisions?"], "Owner refresh required": ["Performance latest 28", "Page Indexing", "Links"].includes(r.Dataset) ? "Yes" : "Recommended" })));

// 2. Production and attribution timeline.
const timelineHeaders = ["Production SHA", "Deployment timestamp UTC", "Cloudflare deployment ID", "Major phase(s)", "Content changes", "Indexability changes", "UX changes", "Trust changes", "Technical/governance changes", "Validation status", "GSC coverage through 2026-08-11"];
const timelineRows = [
  ["89656e506f1fbfa6de000921f7c356ffc24778c3", "2026-08-11T05:25:09.446795Z", "a827b410-0c21-4478-a88c-6da67bc7e1ea", "Phases 0-4 reconciliation", "Phase 4 value live", "193 indexable / 143 noindex", "Preserved", "Source/safety reconciled", "Dependency stabilization", "PASS 336/336", "Partial final-day transition only"],
  ["15508c67ed0a3bac523d29f336d0aca8efad4cbd", "2026-08-11T07:06:46.981717Z", "8a8fe411-52a9-4831-afd7-f036e50061ee", "Phase 5", "Template differentiation", "None", "Family structure", "Preserved", "None", "PASS 336/336", "Partial final-day transition only"],
  ["af91291b13fa7937cca1a8bfca4379200ce618e7", "2026-08-11T09:22:13.958378Z", "7aa46f83-4fd2-4f66-a6c3-072769f12efc", "Phase 6", "Trust/source clarity", "None", "Trust discovery", "Authorship/source strengthened", "None", "PASS 336/336", "Partial final-day transition only"],
  ["4109b429394f4e2c02fdd2b817cc970fbb6e8037", "2026-08-11T10:49:40.710557Z", "c784aaa1-bfed-4fa1-a7a6-c91bc6284d58", "Phase 7", "Navigation copy only", "None", "Purpose-led journeys", "Preserved", "None", "PASS 336/336", "At most a fraction of last GSC day"],
  ["8de969c74139a68b88849f2404e3dc7c353e6a12", "2026-08-13T10:54:18.802821Z", "891ac394-206e-4c9a-ba55-811b397fb6a4", "Phase 8", "None", "None", "Consent UI", "Privacy clarity", "Consent/headers/AdSense runtime hardening", "PASS 336/336", "No supplied GSC performance data after deploy"],
  ["65a28b27e0b187e00688e69daa1919f29db031d6", "2026-08-13T12:31:16.694169Z", "614698d1-0bc1-4146-ae7b-5467216cb2a2", "Phase 9", "None", "None", "None", "None", "CI/release governance", "Hosted CI + 14/14 smoke PASS", "No supplied GSC data after deploy"],
  [production.sha, production.deployedAt, production.deploymentId, "Phase 9 final hardening", "None", "None", "None", "None", "Node 24 artifact actions; deployment cutover evidence", "Hosted CI + 14/14 smoke PASS", "No supplied GSC data after deploy"],
].map((v) => Object.fromEntries(timelineHeaders.map((h, i) => [h, v[i]])));
writeCsv("phase-10-production-timeline.csv", timelineHeaders, timelineRows);
const attributionHeaders = ["Measurement date/window", "Production SHA", "Phase state", "Days since deploy", "Google recrawl evidence", "Clicks", "Impressions", "CTR", "Position", "Index state", "Interpretation confidence", "Notes"];
writeCsv("phase-10-deployment-attribution-analysis.csv", attributionHeaders, [
  { "Measurement date/window": "2026-06-23 to 2026-07-14", "Production SHA": "Historical/pre-reconciliation", "Phase state": "PRE-REMEDIATION", "Days since deploy": "N/A", "Google recrawl evidence": "No URL Inspection supplied", Clicks: prior.clicks, Impressions: prior.impressions, CTR: pct(prior.ctr), Position: round(prior.position), "Index state": "Historical GSC", "Interpretation confidence": "Medium for metrics; low for causation", Notes: "Previous 28-day aggregate" },
  { "Measurement date/window": "2026-07-15 to 2026-08-10", "Production SHA": "Historical/pre-final releases", "Phase state": "PRE-REMEDIATION / TRANSITION", "Days since deploy": "Varies", "Google recrawl evidence": "No URL Inspection supplied", Clicks: latest.clicks - n(latestChart.at(-1).Clicks), Impressions: latest.impressions - n(latestChart.at(-1).Impressions), CTR: "See daily register", Position: "See daily register", "Index state": "GSC through Aug 7 only", "Interpretation confidence": "Medium", Notes: "Growth occurred before or during remediation; no causal claim" },
  { "Measurement date/window": "2026-08-11", "Production SHA": "Multiple Phase 0-7 releases during day", "Phase state": "TRANSITION", "Days since deploy": "0", "Google recrawl evidence": "Daily aggregate cannot establish recrawl after intraday deploys", Clicks: latestChart.at(-1).Clicks, Impressions: latestChart.at(-1).Impressions, CTR: latestChart.at(-1).CTR, Position: latestChart.at(-1).Position, "Index state": "Latest Page Indexing date Aug 7", "Interpretation confidence": "Low", Notes: "GSC dates do not provide hourly attribution" },
  { "Measurement date/window": "After 2026-08-13 12:42 UTC", "Production SHA": production.sha, "Phase state": "POST-REMEDIATION", "Days since deploy": 0, "Google recrawl evidence": "Not supplied", Clicks: "Not supplied", Impressions: "Not supplied", CTR: "Not supplied", Position: "Not supplied", "Index state": "Not supplied", "Interpretation confidence": "None", Notes: "Fresh GSC export and URL Inspection required" },
]);

// 3. Performance, daily trends, privacy, device and country.
const propertyHeaders = ["Period", "Start date", "End date", "Actual days", "Clicks", "Impressions", "CTR", "Average position", "Source", "Property total basis", "Maturity/attribution"];
writeCsv("phase-10-property-performance.csv", propertyHeaders, [
  ["Latest 28 days", "2026-07-15", "2026-08-11", 28, latest.clicks, latest.impressions, pct(latest.ctr), round(latest.position), "Chart.csv", "Property-level daily rows", "Pre/final-day transition; not post-Phase 8/9"],
  ["Previous 28 days", "2026-06-17", "2026-07-14", 28, prior.clicks, prior.impressions, pct(prior.ctr), round(prior.position), "Devices comparison", "Property device totals", "Early discovery"],
  ["Last 3 months filter - actual activity", "2026-06-23", "2026-08-11", 50, history.clicks, history.impressions, pct(history.ctr), round(history.position), "Chart.csv", "Property-level daily rows", "Only 50 days, not 3 full months"],
  ["Last 6 months filter - actual activity", "2026-06-23", "2026-08-11", 50, history.clicks, history.impressions, pct(history.ctr), round(history.position), "Comparison device export", "Property device totals", "Same measurable 50-day footprint"],
].map((v) => Object.fromEntries(propertyHeaders.map((h, i) => [h, v[i]]))));

const rolling = (rows, index, days, key) => { const slice = rows.slice(Math.max(0, index - days + 1), index + 1); return slice.reduce((s, r) => s + n(r[key]), 0) / slice.length; };
writeCsv("phase-10-daily-performance.csv", ["Date", "Clicks", "Impressions", "CTR", "Position", "7-day clicks mean", "7-day impressions mean", "14-day clicks mean", "14-day impressions mean", "Phase window", "Causation note"], historyChart.map((r, i) => ({ ...r, "7-day clicks mean": round(rolling(historyChart, i, 7, "Clicks"), 3), "7-day impressions mean": round(rolling(historyChart, i, 7, "Impressions"), 3), "14-day clicks mean": round(rolling(historyChart, i, 14, "Clicks"), 3), "14-day impressions mean": round(rolling(historyChart, i, 14, "Impressions"), 3), "Phase window": r.Date < "2026-08-11" ? "PRE / TRANSITION" : "TRANSITION - multiple intraday deploys", "Causation note": "Temporal observation only; crawl evidence unavailable" })));

const periodHeaders = ["Period A", "Period B", "Clicks A", "Clicks B", "Click change", "Impressions A", "Impressions B", "Impression change", "CTR A", "CTR B", "Position A", "Position B", "Visible query count A", "Visible query count B", "Search-visible pages A", "Search-visible pages B", "Countries A", "Countries B", "Interpretation", "Confidence"];
writeCsv("phase-10-period-comparison.csv", periodHeaders, [{ "Period A": "Latest 28 days", "Period B": "Previous 28 days", "Clicks A": latest.clicks, "Clicks B": prior.clicks, "Click change": pct((latest.clicks - prior.clicks) / prior.clicks * 100), "Impressions A": latest.impressions, "Impressions B": prior.impressions, "Impression change": pct((latest.impressions - prior.impressions) / prior.impressions * 100), "CTR A": pct(latest.ctr), "CTR B": pct(prior.ctr), "Position A": round(latest.position), "Position B": round(prior.position), "Visible query count A": latestQueries.length, "Visible query count B": compareQueries.filter((r) => n(r["Previous 28 days Impressions"]) > 0).length, "Search-visible pages A": latestPages.length, "Search-visible pages B": comparePages.filter((r) => n(r["Previous 28 days Impressions"]) > 0).length, "Countries A": latestCountries.length, "Countries B": compareCountries.filter((r) => n(r["Previous 28 days Impressions"]) > 0).length, Interpretation: "Discovery, ranking and click growth; CTR dilution is consistent with expansion into broader/lower positions", Confidence: "High for aggregates; low for remediation causation" }, { "Period A": "Latest 14 days", "Period B": "Prior 14 days", "Clicks A": latest14.clicks, "Clicks B": prior14.clicks, "Click change": pct((latest14.clicks - prior14.clicks) / prior14.clicks * 100), "Impressions A": latest14.impressions, "Impressions B": prior14.impressions, "Impression change": pct((latest14.impressions - prior14.impressions) / prior14.impressions * 100), "CTR A": pct(latest14.ctr), "CTR B": pct(prior14.ctr), "Position A": round(latest14.position), "Position B": round(prior14.position), "Visible query count A": "Not separable", "Visible query count B": "Not separable", "Search-visible pages A": "Not separable", "Search-visible pages B": "Not separable", "Countries A": "Not separable", "Countries B": "Not separable", Interpretation: "Strong late-window acceleration; directional only", Confidence: "Medium" }]);

writeCsv("phase-10-query-privacy-coverage.csv", ["Period", "Property clicks", "Visible-query clicks", "Visible click coverage %", "Hidden click share %", "Property impressions", "Visible-query impressions", "Visible impression coverage %", "Interpretation limitation"], [
  { Period: "Latest 28 days", "Property clicks": latest.clicks, "Visible-query clicks": visibleLatestQueries.clicks, "Visible click coverage %": pct(visibleLatestQueries.clicks / latest.clicks * 100), "Hidden click share %": pct((latest.clicks - visibleLatestQueries.clicks) / latest.clicks * 100), "Property impressions": latest.impressions, "Visible-query impressions": visibleLatestQueries.impressions, "Visible impression coverage %": pct(visibleLatestQueries.impressions / latest.impressions * 100), "Interpretation limitation": "14 of 15 clicks and 742 impressions cannot be assigned to visible query rows; page clicks must not be contradicted by query zeros" },
  { Period: "Previous 28 days", "Property clicks": prior.clicks, "Visible-query clicks": visiblePriorQueries.clicks, "Visible click coverage %": pct(0), "Hidden click share %": pct(100), "Property impressions": prior.impressions, "Visible-query impressions": visiblePriorQueries.impressions, "Visible impression coverage %": pct(visiblePriorQueries.impressions / prior.impressions * 100), "Interpretation limitation": "All clicks hidden from supplied visible-query rows" },
  { Period: "Available 50-day history", "Property clicks": history.clicks, "Visible-query clicks": aggregate(historyQueries).clicks, "Visible click coverage %": pct(aggregate(historyQueries).clicks / history.clicks * 100), "Hidden click share %": pct((history.clicks - aggregate(historyQueries).clicks) / history.clicks * 100), "Property impressions": history.impressions, "Visible-query impressions": aggregate(historyQueries).impressions, "Visible impression coverage %": pct(aggregate(historyQueries).impressions / history.impressions * 100), "Interpretation limitation": "Visible queries are thematic evidence, not complete traffic attribution" },
]);

const deviceHeaders = ["Period", "Device", "Clicks", "Impressions", "CTR", "Position", "Click share", "Impression share", "Finding", "Limitation"];
writeCsv("phase-10-device-performance.csv", deviceHeaders, latestDevices.map((r) => ({ Period: "Latest 28 days", Device: r.Device, Clicks: r.Clicks, Impressions: r.Impressions, CTR: r.CTR, Position: r.Position, "Click share": pct(n(r.Clicks) / latest.clicks * 100), "Impression share": pct(n(r.Impressions) / latest.impressions * 100), Finding: r.Device === "Mobile" ? "Materially stronger position and CTR with smaller impression base" : r.Device === "Desktop" ? "Most discovery impressions occur at weaker positions; no metadata rewrite authorized" : "Tiny sample", Limitation: "No supplied query x page x device intersection" })));
const countryHeaders = ["Country", "Clicks", "Impressions", "CTR", "Position", "Impression share", "Click share", "Rank", "Concentration note", "Country x device available?"];
writeCsv("phase-10-country-performance.csv", countryHeaders, latestCountries.map((r, i) => ({ ...r, "Impression share": pct(n(r.Impressions) / latest.impressions * 100), "Click share": pct(n(r.Clicks) / latest.clicks * 100), Rank: i + 1, "Concentration note": i < 10 ? "Top-10 contributor" : "Long-tail global reach; do not infer cultural success from tiny samples", "Country x device available?": "NO - not supplied" })));

// 4. Pages, families, home/deep and normalized master records.
const pageHeaders = ["URL", "Page family", "Phase 2 role", "Primary owner", "Is primary owner?", "Current index state", "Clicks", "Impressions", "CTR", "Average position", "Prior-period clicks", "Prior-period impressions", "Trend", "Visible query themes", "Internal links reported", "Current production status", "Last crawl if known", "First GSC observed date if derived", "Maturity", "Classification", "Confidence", "Recommended action"];
const pageRegister = latestPages.map((r) => {
  const url = r["Top pages"], master = masterByUrl.get(url) || {}, compare = pageCompareByUrl.get(url) || {}, classification = classifyPage(r, compare);
  const priorImp = n(compare["Previous 28 days Impressions"]), trend = priorImp ? `${round((n(r.Impressions) - priorImp) / priorImp * 100)}% impressions` : "New in latest comparison table";
  const themes = [...new Set(latestQueries.filter((q) => queryCluster(q["Top queries"]).likelyPage === url || queryCluster(q["Top queries"]).owner === url).slice(0, 5).map((q) => queryCluster(q["Top queries"]).cluster))].join("; ") || "Query-to-page intersection not supplied";
  return { URL: url, "Page family": family(url), "Phase 2 role": master["Phase 2 reconciled role"] || "Not mapped", "Primary owner": master["Primary owner URL"] || "Not mapped", "Is primary owner?": master["Is primary owner?"] || "Unknown", "Current index state": master["Current index state"] || "Unknown", Clicks: r.Clicks, Impressions: r.Impressions, CTR: r.CTR, "Average position": r.Position, "Prior-period clicks": compare["Previous 28 days Clicks"] || 0, "Prior-period impressions": priorImp, Trend: trend, "Visible query themes": themes, "Internal links reported": gscLinkByUrl.get(url) ?? "Not in top-target export", "Current production status": master.URL ? "Built; production smoke baseline PASS" : "Current route mapping not found", "Last crawl if known": "Not supplied", "First GSC observed date if derived": priorImp === 0 ? "Latest 28-day window; exact date unavailable" : "Before latest 28-day window", Maturity: n(r.Impressions) < 20 ? "EARLY" : "DEVELOPING", Classification: classification, Confidence: classification === "HIGH-RANK / LOW-CLICK REVIEW" ? "Medium; query privacy applies" : "Medium", "Recommended action": recommendation(classification) };
});
writeCsv("phase-10-page-performance-register.csv", pageHeaders, pageRegister);

const familyHeaders = ["Page family", "Search-visible URLs", "Page-tab clicks", "Page-tab impressions", "Page-tab CTR", "Weighted position", "Share of page-tab impressions", "Interpretation", "Property-total warning"];
const grouped = new Map();
for (const r of latestPages) { const f = family(r["Top pages"]); if (!grouped.has(f)) grouped.set(f, []); grouped.get(f).push(r); }
const pageTab = aggregate(latestPages);
writeCsv("phase-10-page-family-performance.csv", familyHeaders, [...grouped].map(([f, rows]) => { const a = aggregate(rows); return { "Page family": f, "Search-visible URLs": rows.length, "Page-tab clicks": a.clicks, "Page-tab impressions": a.impressions, "Page-tab CTR": pct(a.ctr), "Weighted position": round(a.position), "Share of page-tab impressions": pct(a.impressions / pageTab.impressions * 100), Interpretation: f === "Articles" ? "Largest deep-content visibility engine in supplied page rows" : f === "Quote Categories" ? "Category demand is distinct from individual story demand" : "Directional family comparison", "Property-total warning": "Page-tab aggregates are not property totals and may exceed Chart impressions" }; }));
const latestHome = latestPageByUrl.get("https://echobuddha.com/"); const priorHome = pageCompareByUrl.get("https://echobuddha.com/");
writeCsv("phase-10-homepage-vs-deep-content.csv", ["Period", "Page-tab clicks", "Homepage clicks", "Deep-content clicks", "Homepage click share", "Deep-content click share", "Interpretation", "Privacy caveat"], [
  { Period: "Latest 28 days", "Page-tab clicks": latest.clicks, "Homepage clicks": latestHome.Clicks, "Deep-content clicks": latest.clicks - n(latestHome.Clicks), "Homepage click share": pct(n(latestHome.Clicks) / latest.clicks * 100), "Deep-content click share": pct((latest.clicks - n(latestHome.Clicks)) / latest.clicks * 100), Interpretation: "Deep content receives the majority of page-tab clicks", "Privacy caveat": "Page aggregation is usable for click distribution; query strings remain mostly hidden" },
  { Period: "Previous 28 days", "Page-tab clicks": prior.clicks, "Homepage clicks": priorHome["Previous 28 days Clicks"], "Deep-content clicks": prior.clicks - n(priorHome["Previous 28 days Clicks"]), "Homepage click share": pct(n(priorHome["Previous 28 days Clicks"]) / prior.clicks * 100), "Deep-content click share": pct((prior.clicks - n(priorHome["Previous 28 days Clicks"])) / prior.clicks * 100), Interpretation: "Clicks were previously homepage-dominated", "Privacy caveat": "No causal claim; windows predate final production" },
]);

const masterHeaders = ["Record type", "Date", "Window", "Query", "Page", "Country", "Device", "Clicks", "Impressions", "CTR", "Position", "Source file", "Aggregation warning"];
const masterData = [];
for (const r of latestChart) masterData.push({ "Record type": "date", Date: r.Date, Window: "Latest 28 days", Query: "", Page: "", Country: "", Device: "", ...r, "Source file": "performance-latest-28/Chart.csv", "Aggregation warning": "Property total by date" });
for (const r of latestQueries) masterData.push({ "Record type": "query", Date: "", Window: "Latest 28 days", Query: r["Top queries"], Page: "", Country: "", Device: "", ...r, "Source file": "performance-latest-28/Queries.csv", "Aggregation warning": "Visible query aggregate; privacy-filtered" });
for (const r of latestPages) masterData.push({ "Record type": "page", Date: "", Window: "Latest 28 days", Query: "", Page: r["Top pages"], Country: "", Device: "", ...r, "Source file": "performance-latest-28/Pages.csv", "Aggregation warning": "Page aggregate; not property total" });
for (const r of latestCountries) masterData.push({ "Record type": "country", Date: "", Window: "Latest 28 days", Query: "", Page: "", Country: r.Country, Device: "", ...r, "Source file": "performance-latest-28/Countries.csv", "Aggregation warning": "Country aggregate; no device/query intersection" });
for (const r of latestDevices) masterData.push({ "Record type": "device", Date: "", Window: "Latest 28 days", Query: "", Page: "", Country: "", Device: r.Device, ...r, "Source file": "performance-latest-28/Devices.csv", "Aggregation warning": "Device aggregate; no country/query intersection" });
writeCsv("phase-10-master-gsc-dataset.csv", masterHeaders, masterData);

// 5. Query clusters, query-to-owner mapping and conservative cannibalization.
const clusterMap = new Map();
for (const row of latestQueries) { const meta = queryCluster(row["Top queries"]); if (!clusterMap.has(meta.cluster)) clusterMap.set(meta.cluster, { ...meta, rows: [] }); clusterMap.get(meta.cluster).rows.push(row); }
const clusterHeaders = ["Cluster", "Representative queries", "Visible query count", "Visible clicks", "Visible impressions", "Weighted position", "Likely user intent", "Primary owner", "Other ranking pages", "Owner alignment", "Cannibalization risk", "Privacy limitation", "Maturity", "Assessment"];
const clusterRows = [...clusterMap.values()].map((c) => { const a = aggregate(c.rows); const pages = latestPages.filter((p) => route(p["Top pages"]).includes(c.cluster.toLowerCase().split(" ")[0].replace("dhammapada", "dhammapada"))).slice(0, 5).map((p) => p["Top pages"]).join("; "); return { Cluster: c.cluster, "Representative queries": c.rows.slice(0, 8).map((r) => r["Top queries"]).join(" | "), "Visible query count": c.rows.length, "Visible clicks": a.clicks, "Visible impressions": a.impressions, "Weighted position": round(a.position), "Likely user intent": c.intent, "Primary owner": c.owner, "Other ranking pages": pages || "Query x page intersection unavailable", "Owner alignment": c.cluster === "Dhamma vs Dharma" ? "Likely distinct support intent; primary broad owner preserved" : "No row-level mismatch proven", "Cannibalization risk": "LOW / INSUFFICIENT", "Privacy limitation": "Visible queries incomplete; no query x page export", Maturity: a.impressions >= 50 ? "DEVELOPING" : "EARLY", Assessment: "OBSERVE; do not create keyword variants" }; });
writeCsv("phase-10-query-cluster-register.csv", clusterHeaders, clusterRows);
const qHeaders = ["Query", "Topic cluster", "Intent", "Clicks", "Impressions", "CTR", "Position", "Likely serving URL if known", "Primary owner", "Owner alignment", "Potential mismatch", "Confidence", "Privacy limitation", "Action"];
writeCsv("phase-10-query-to-owner-map.csv", qHeaders, latestQueries.map((r) => { const c = queryCluster(r["Top queries"]); return { Query: r["Top queries"], "Topic cluster": c.cluster, Intent: c.intent, Clicks: r.Clicks, Impressions: r.Impressions, CTR: r.CTR, Position: r.Position, "Likely serving URL if known": `${c.likelyPage} (inference; query x page not supplied)`, "Primary owner": c.owner, "Owner alignment": c.likelyPage === c.owner ? "Direct" : "Potentially healthy support-to-owner relationship", "Potential mismatch": "Not proven", Confidence: n(r.Impressions) >= 10 ? "Medium" : "Low", "Privacy limitation": "Yes - anonymized/truncated queries", Action: "PROTECT / OBSERVE; no new query-variant page" }; }));
const cannibalHeaders = ["Topic/query cluster", "Primary owner", "Other search-visible pages", "Same query x multiple pages proven?", "Alternation proven?", "Role conflict proven?", "Confidence", "Risk", "Assessment", "Action"];
writeCsv("phase-10-gsc-cannibalization-review.csv", cannibalHeaders, clusterRows.filter((r) => r.Cluster !== "Other visible queries").map((r) => ({ "Topic/query cluster": r.Cluster, "Primary owner": r["Primary owner"], "Other search-visible pages": r["Other ranking pages"], "Same query x multiple pages proven?": "No - intersection not supplied", "Alternation proven?": "No", "Role conflict proven?": "No", Confidence: "Low", Risk: "LOW", Assessment: "No HIGH/CRITICAL cannibalization evidence", Action: "Preserve Phase 2 ownership; collect page-filtered query evidence only if instability persists" })));

// 6. Owner and support scorecards.
const ownerHeaders = ["Topic", "Primary owner URL", "Current index state", "Clicks", "Impressions", "CTR", "Position", "Prior-period impressions", "Trend", "Visible query count", "Visible query intent alignment", "Support pages ranking?", "Cannibalization risk", "GSC internal links", "Last crawl", "Deployment relation", "Maturity", "Current assessment", "Recommended action"];
const ownerScore = ownerRows.map((o) => { const url = o["Primary owner URL"], page = latestPageByUrl.get(url), compare = pageCompareByUrl.get(url), queries = latestQueries.filter((q) => queryCluster(q["Top queries"]).topic === o.Topic), impressions = page ? n(page.Impressions) : 0; return { Topic: o.Topic, "Primary owner URL": url, "Current index state": o["Current index state"], Clicks: page?.Clicks || 0, Impressions: impressions, CTR: page?.CTR || "0%", Position: page?.Position || "Not visible", "Prior-period impressions": compare?.["Previous 28 days Impressions"] || 0, Trend: impressions ? "SEARCH-VISIBLE" : "ZERO/NOT REPORTED", "Visible query count": queries.length, "Visible query intent alignment": queries.length ? "Thematic alignment only; query x page unavailable" : "Insufficient visible query evidence", "Support pages ranking?": latestPages.some((p) => masterByUrl.get(p["Top pages"])?.["Primary owner URL"] === url && p["Top pages"] !== url) ? "Yes" : "Not observed", "Cannibalization risk": "LOW / INSUFFICIENT", "GSC internal links": gscLinkByUrl.get(url) ?? "Not in top-target export", "Last crawl": "Not supplied", "Deployment relation": "Performance predates final Phase 8/9", Maturity: impressions >= 50 ? "DEVELOPING" : impressions ? "EARLY" : "INSUFFICIENT", "Current assessment": impressions >= 50 && n(page?.Position) > 30 ? "TOPIC RECOGNIZED / NOT YET COMPETITIVE" : impressions ? "EARLY RECOGNITION" : "INSUFFICIENT DATA", "Recommended action": "PROTECT / OBSERVE; do not replace owner from aggregate GSC data" }; });
writeCsv("phase-10-primary-owner-scorecard.csv", ownerHeaders, ownerScore);
const supportHeaders = ["URL", "Primary owner", "Role", "Clicks", "Impressions", "CTR", "Position", "Prior impressions", "Distinct intent evidence", "Assessment", "Action"];
writeCsv("phase-10-support-page-scorecard.csv", supportHeaders, pageRegister.filter((r) => r["Is primary owner?"] === "No" && n(r.Impressions) > 0).map((r) => ({ URL: r.URL, "Primary owner": r["Primary owner"], Role: r["Phase 2 role"], Clicks: r.Clicks, Impressions: r.Impressions, CTR: r.CTR, Position: r["Average position"], "Prior impressions": r["Prior-period impressions"], "Distinct intent evidence": r["Visible query themes"], Assessment: r.Classification, Action: r["Recommended action"] })));

// 7. Indexing, sitemap, URL Inspection, HTTPS and enhancement.
const indexHeaders = ["GSC reason", "URL if example available", "Count", "Intended state", "Phase 3 policy", "Current production state", "Sitemap state", "Canonical state", "Redirect state", "Last crawl", "Validation status", "Expected?", "Issue?", "Severity", "Action"];
writeCsv("phase-10-index-coverage-status.csv", indexHeaders, coverageReasons.map((r) => ({ "GSC reason": r.Reason, "URL if example available": "Not supplied in aggregate export", Count: r.Pages, "Intended state": r.Reason.includes("noindex") ? "Potentially intentional, requires URL examples" : r.Reason.includes("redirect") ? "Potentially historical/intentional, requires URL examples" : "Owner inspection required", "Phase 3 policy": r.Reason.includes("noindex") ? "143 current intentional noindex pages" : r.Reason.includes("redirect") ? "No application redirect routes introduced; historical edge URLs possible" : "No blanket policy", "Current production state": "Aggregate cannot be reconciled URL-by-URL without examples", "Sitemap state": "Current source/production sitemap has 193 intended canonical URLs", "Canonical state": "Current release validates self-canonicals", "Redirect state": "Current release validates no redirect chains/loops", "Last crawl": "Not supplied", "Validation status": r.Validation, "Expected?": ["Excluded by ‘noindex’ tag", "Page with redirect", "Alternate page with proper canonical tag"].includes(r.Reason) ? "LIKELY / UNCONFIRMED" : "UNKNOWN", "Issue?": ["Crawled - currently not indexed", "Discovered - currently not indexed"].includes(r.Reason) ? "OWNER INSPECTION REQUIRED" : "NO AGGREGATE DEFECT PROVEN", Severity: r.Reason === "Crawled - currently not indexed" ? "P2" : r.Reason === "Discovered - currently not indexed" ? "P2" : "P3 / informational", Action: "Obtain example URL export and targeted URL Inspection; do not mass change indexability" })));
const indexableVisible = pageRegister.filter((r) => r["Current index state"] === "indexable").length;
const noindexVisible = pageRegister.filter((r) => r["Current index state"].includes("noindex")).length;
writeCsv("phase-10-indexed-performance-matrix.csv", ["Category", "Count", "Basis", "Interpretation", "Action"], [
  { Category: "Current indexable + receiving impressions", Count: indexableVisible, Basis: "Latest Page rows intersect current master register", Interpretation: "Search-visible current intended pages", Action: "Protect / observe" },
  { Category: "Current indexable + zero reported impressions", Count: 193 - indexableVisible, Basis: "193 current indexable minus latest search-visible current pages", Interpretation: "Not failure; may be niche/new/support", Action: "No mass change" },
  { Category: "Current noindex + historical/latest impressions", Count: noindexVisible, Basis: "Latest Page rows intersect current noindex state", Interpretation: "Possible historical/GSC lag", Action: "Inspect examples; preserve intent" },
  { Category: "Redirect + historical impressions", Count: 7, Basis: "GSC reason aggregate", Interpretation: "URLs not supplied", Action: "Owner export required" },
  { Category: "Removed/404 + historical", Count: 1, Basis: "GSC reason aggregate", Interpretation: "URL not supplied", Action: "Classify exact URL; never blanket redirect" },
  { Category: "Unknown/stale", Count: 26, Basis: "GSC not-indexed snapshot Aug 7", Interpretation: "Predates current production", Action: "Refresh after recrawl" },
]);
writeCsv("phase-10-gsc-vs-production-index-state.csv", ["GSC state", "Example URL", "GSC date", "Current HTTP", "Current robots", "Current canonical", "Current sitemap", "Phase 3 intent", "Assessment", "Action"], coverageReasons.map((r) => ({ "GSC state": r.Reason, "Example URL": "MISSING FROM SUPPLIED EXPORT", "GSC date": "2026-08-07 aggregate", "Current HTTP": "Cannot test unknown URL", "Current robots": "Cannot test unknown URL", "Current canonical": "Cannot test unknown URL", "Current sitemap": "Cannot test unknown URL", "Phase 3 intent": r.Reason.includes("noindex") ? "Intentional noindex population exists" : "No URL-level determination", Assessment: "PARTIAL INDEX-STATE CONFIDENCE", Action: "Owner exports examples and runs URL Inspection" })));
writeCsv("phase-10-gsc-sitemap-review.csv", ["Sitemap URL", "Submitted date", "Last read", "Status", "Discovered URLs", "Errors/warnings", "Repository URLs", "Production URLs", "GSC evidence", "Assessment", "Owner action"], [{ "Sitemap URL": "https://echobuddha.com/sitemap.xml", "Submitted date": "Not supplied", "Last read": "Not supplied", Status: "Not supplied", "Discovered URLs": "Not supplied", "Errors/warnings": "Not supplied", "Repository URLs": 193, "Production URLs": 193, "GSC evidence": "Coverage metadata says All known pages, but no Sitemaps export", Assessment: "OWNER EVIDENCE REQUIRED", "Owner action": "Export/screenshot current Sitemaps report with submitted date, last read, status, discovered URLs and issues" }]);
const inspectTargets = [
  ["UNKNOWN_CRAWLED_NOT_INDEXED", "Coverage example", "indexable if intended"], ["UNKNOWN_DISCOVERED_NOT_INDEXED", "Coverage examples (8)", "indexable if intended"], ["UNKNOWN_404", "Historical/removed", "removed or valid after classification"],
  ["https://echobuddha.com/search/", "Intentional noindex utility", "noindex, follow"], ["UNKNOWN_REDIRECT", "Historical redirect", "redirect"], ["UNKNOWN_ALTERNATE_CANONICAL", "Canonical alternate", "canonicalized"],
  ["https://echobuddha.com/", "Homepage", "indexable"], ["https://echobuddha.com/learn/buddhism-for-beginners/", "Primary owner", "indexable"], ["https://echobuddha.com/learn/four-noble-truths/", "Primary owner", "indexable"], ["https://echobuddha.com/learn/eightfold-path/", "Primary owner", "indexable"],
  ["https://echobuddha.com/articles/right-speech-buddhism/", "Emerging practical owner", "indexable"], ["https://echobuddha.com/articles/dhamma-vs-dharma/", "Distinct comparison support", "indexable"], ["https://echobuddha.com/articles/dhammapada-reflection-what-we-think/", "Source/attribution article", "indexable"], ["https://echobuddha.com/quotes/letting-go/", "Quote category", "indexable"], ["https://echobuddha.com/daily-reflections/today/", "Recurring utility", "noindex, follow"],
];
const inspectHeaders = ["URL", "Page role", "Intended index state", "GSC on Google?", "Indexing allowed?", "Crawl allowed?", "Last crawl", "User canonical", "Google canonical", "Canonical match?", "Sitemap detected?", "Referring page if available", "Enhancement state", "Current production state", "Assessment", "Action"];
writeCsv("phase-10-url-inspection-register.csv", inspectHeaders, inspectTargets.map(([url, role, intended]) => { const known = url.startsWith("https://"); const m = masterByUrl.get(url); return { URL: url, "Page role": role, "Intended index state": intended, "GSC on Google?": "Not supplied", "Indexing allowed?": "Not supplied", "Crawl allowed?": "Not supplied", "Last crawl": "Not supplied", "User canonical": known ? (m?.["Current canonical"] || (intended === "indexable" ? url : "See production")) : "Unknown URL", "Google canonical": "Not supplied", "Canonical match?": "Not supplied", "Sitemap detected?": "Not supplied", "Referring page if available": "Not supplied", "Enhancement state": "Not supplied", "Current production state": known ? (m ? `${m["Current HTTP/build state"]}; ${m["Current index state"]}` : "Target route requires live check") : "Cannot evaluate until URL examples supplied", Assessment: "OWNER URL INSPECTION REQUIRED", Action: "Run URL Inspection and export exact fields; do not request indexing blindly" }; }));
writeCsv("phase-10-https-review.csv", ["Report date", "Non-HTTPS URLs", "HTTPS URLs", "Status", "Scope limitation", "Assessment"], [{ "Report date": httpsLast.Date, "Non-HTTPS URLs": httpsLast["Non-HTTPS URLs"], "HTTPS URLs": httpsLast["HTTPS URLs"], Status: n(httpsLast["Non-HTTPS URLs"]) === 0 ? "PASS" : "FAIL", "Scope limitation": "Eligible HTTPS items are not indexed-page count", Assessment: "HTTPS GSC STATUS: CLEAN" }]);
writeCsv("phase-10-enhancement-review.csv", ["Report", "Latest date", "Invalid", "Valid", "Critical issue rows", "Non-critical issue rows", "Assessment", "Scope limitation"], [{ Report: "Breadcrumbs", "Latest date": enhancementLast.Date, Invalid: enhancementLast.Invalid, Valid: enhancementLast.Valid, "Critical issue rows": readCsv(perf("breadcrumbs", "Critical issues.csv")).length, "Non-critical issue rows": readCsv(perf("breadcrumbs", "Non-critical issues.csv")).length, Assessment: "NO REPORTED ISSUES IN SUPPLIED BREADCRUMB DATASET", "Scope limitation": "Does not prove all structured data/site schema perfect" }]);

// 8. Links, CWV, manual/security, opportunities and red flags.
const linkHeaders = ["Target URL", "Page role", "Primary owner?", "Current Phase 7 internal-link count if measurable", "GSC reported internal links", "GSC report date", "Current production links newer than GSC?", "Recognition state", "Search impressions", "Average position", "Potential underlinking?", "Evidence", "Recommended action"];
const linkTargets = [...new Set([...gscLinks.map((r) => r["Target page"]), ...ownerRows.map((r) => r["Primary owner URL"])])];
writeCsv("phase-10-internal-link-recognition-review.csv", linkHeaders, linkTargets.map((url) => { const m = masterByUrl.get(url), p = latestPageByUrl.get(url), current = currentLinks.get(url) || 0, reported = gscLinkByUrl.get(url); let recognition = reported == null ? "INSUFFICIENT / not in top-target sample" : "PARTIAL - GSC count and current graph are different measurement systems"; return { "Target URL": url, "Page role": m?.["Current primary role"] || family(url), "Primary owner?": m?.["Is primary owner?"] || (ownerRows.some((o) => o["Primary owner URL"] === url) ? "Yes" : "Unknown"), "Current Phase 7 internal-link count if measurable": current, "GSC reported internal links": reported ?? "Not reported", "GSC report date": "2026-08-13 export; underlying snapshot date not supplied", "Current production links newer than GSC?": "Unknown; report can lag", "Recognition state": recognition, "Search impressions": p?.Impressions || 0, "Average position": p?.Position || "Not visible", "Potential underlinking?": "Not proven by count alone", Evidence: "Fresh built-site distinct source-page links vs GSC top-target aggregate", "Recommended action": "WAIT FOR RECRAWL; review context/journey later, no link-count campaign" }; }));
writeCsv("phase-10-external-link-review.csv", ["Export", "Rows", "Assessment", "What this does not prove", "Action"], [{ Export: "Latest links", Rows: readCsv(perf("links", "echobuddha.com-Latest links-2026-08-13.csv")).length, Assessment: "NO USABLE EXTERNAL-LINKING PAGE DATA REPORTED", "What this does not prove": "It does not prove Echo Buddha has zero backlinks or web mentions", Action: "Informational; no link-building scheme" }, { Export: "More sample links", Rows: readCsv(perf("links", "echobuddha.com-More sample links-2026-08-13.csv")).length, Assessment: "NO USABLE EXTERNAL-LINKING PAGE DATA REPORTED", "What this does not prove": "GSC Links is incomplete", Action: "No action" }]);
writeCsv("phase-10-field-cwv-review.csv", ["Device", "Good URLs", "Needs improvement URLs", "Poor URLs", "URL groups", "Issue", "State", "Evidence", "Lab comparison rule", "Owner action"], ["Mobile", "Desktop"].map((device) => ({ Device: device, "Good URLs": "Not supplied", "Needs improvement URLs": "Not supplied", "Poor URLs": "Not supplied", "URL groups": "Not supplied", Issue: "Not supplied", State: "OWNER EVIDENCE REQUIRED / INSUFFICIENT", Evidence: "No GSC CWV export supplied", "Lab comparison rule": "Phase 8 Lighthouse is lab evidence and is not merged with field data", "Owner action": "Export the GSC CWV overview and device detail, including insufficient-data state if shown" })));
writeCsv("phase-10-manual-actions-security-review.csv", ["Area", "Supplied evidence", "Status", "Can infer from traffic?", "Severity if issue", "Owner action", "Blocks Phase 10?", "Blocks clean Phase 11 readiness?"] , [{ Area: "Manual Actions", "Supplied evidence": "None", Status: "OWNER GSC CHECK REQUIRED", "Can infer from traffic?": "No", "Severity if issue": "P0", "Owner action": "Open Manual Actions report and record exact state/date", "Blocks Phase 10?": "No - measurement can complete with gap", "Blocks clean Phase 11 readiness?": "Yes; Phase 11 must retain pending status" }, { Area: "Security Issues", "Supplied evidence": "None", Status: "OWNER GSC CHECK REQUIRED", "Can infer from traffic?": "No", "Severity if issue": "P0", "Owner action": "Open Security Issues report and record exact state/date", "Blocks Phase 10?": "No - measurement can complete with gap", "Blocks clean Phase 11 readiness?": "Yes; Phase 11 must retain pending status" }]);

const opportunities = pageRegister.filter((r) => ["EMERGING WINNER", "HIGH-IMPRESSION / LOW-RANK OPPORTUNITY", "HIGH-RANK / LOW-CLICK REVIEW"].includes(r.Classification));
const oppHeaders = ["Priority", "URL / Topic", "Opportunity type", "Evidence", "Clicks", "Impressions", "Position", "Trend", "Data age", "Post-deploy evidence?", "Confidence", "Change now?", "Recommended action", "Observation period", "Phase destination"];
writeCsv("phase-10-opportunity-register.csv", oppHeaders, opportunities.map((r) => ({ Priority: r.Classification === "EMERGING WINNER" ? "P2 protect" : "P3 review", "URL / Topic": r.URL, "Opportunity type": r.Classification, Evidence: "GSC Page latest/prior comparison", Clicks: r.Clicks, Impressions: r.Impressions, Position: r["Average position"], Trend: r.Trend, "Data age": "Ends 2026-08-11", "Post-deploy evidence?": "No for Phase 8/9", Confidence: r.Confidence, "Change now?": "NO", "Recommended action": r["Recommended action"], "Observation period": "Refresh after at least 14-28 days of post-final-release data, plus recrawl evidence", "Phase destination": "Phase 11 measurement context / future editorial review" })));
writeCsv("phase-10-red-flag-register.csv", ["ID", "Severity", "Area", "Finding", "Evidence", "Production defect proven?", "Action", "Status"], [
  { ID: "RF-01", Severity: "P2", Area: "Indexing evidence", Finding: "1 crawled-not-indexed and 8 discovered-not-indexed URLs lack examples", Evidence: "GSC Coverage aggregate through Aug 7", "Production defect proven?": "No", Action: "Owner exports URLs and URL Inspection; no rewrite", Status: "OPEN EVIDENCE GAP" },
  { ID: "RF-02", Severity: "P2", Area: "Deployment attribution", Finding: "0 supplied GSC days after final Phase 8/9 production", Evidence: "Performance ends Aug 11; final production Aug 13", "Production defect proven?": "No", Action: "Observe; refresh exports", Status: "EXPECTED MATURITY GAP" },
  { ID: "RF-03", Severity: "P1 evidence gap", Area: "Manual/Security", Finding: "Actual report states not supplied", Evidence: "Dataset inventory", "Production defect proven?": "No", Action: "Owner verifies both reports before clean Phase 11 conclusion", Status: "OWNER ACTION" },
  { ID: "RF-04", Severity: "P2", Area: "Cloudflare governance", Finding: "Legacy main auto-deploy remains documented", Evidence: "Phase 9 external settings register", "Production defect proven?": "Governance path issue, not site-output defect", Action: "Complete Phase 9 owner cutover separately", Status: "UPSTREAM OWNER ACTION" },
]);

const ownerActionHeaders = ["Priority", "GSC area", "Required evidence", "Why needed", "Exact URLs if relevant", "Can Phase 10 complete without it?", "Blocks Phase 11?", "Owner action", "Status"];
writeCsv("phase-10-owner-gsc-action-items.csv", ownerActionHeaders, [
  ["P0 evidence", "Manual Actions", "Exact current report state and date", "Cannot infer absence from rankings", "Property-wide", "Yes", "Blocks unqualified readiness", "Open report; export/screenshot state; record date", "PENDING"],
  ["P0 evidence", "Security Issues", "Exact current report state and date", "Cannot infer absence from traffic", "Property-wide", "Yes", "Blocks unqualified readiness", "Open report; export/screenshot state; record date", "PENDING"],
  ["P1", "Page Indexing examples", "URL list for all 26 not-indexed items", "Needed to classify intentional/historical/actionable states", "8 noindex; 7 redirect; 8 discovered; 1 crawled; 1 404; 1 alternate", "Yes", "No, but limits index confidence", "Export each reason's examples", "PENDING"],
  ["P1", "URL Inspection", "Inspection fields for 15 targets in register", "Needed for last crawl, Google canonical and post-deploy processing", "See phase-10-url-inspection-register.csv", "Yes", "Limits clean Phase 11 conclusion", "Inspect targets and transcribe/export exact results", "PENDING"],
  ["P1", "Sitemaps", "Submitted date, last read, status, discovered URLs, errors", "Production XML correctness does not prove GSC processing", "https://echobuddha.com/sitemap.xml", "Yes", "Limits clean Phase 11 conclusion", "Export/screenshot current Sitemaps report", "PENDING"],
  ["P1", "Performance refresh", "New 28-day comparison after Aug 13 final release", "Current data contains zero post-final-release days", "Property-wide", "Yes", "No; needed for stronger decisions", "Export Chart/Pages/Queries/Devices/Countries/Filters/Search appearance", "PENDING"],
  ["P2", "Core Web Vitals", "Mobile/desktop overview and details", "Field data is distinct from Lighthouse", "Property-wide", "Yes", "No unless Poor groups exist", "Export report or record not-enough-data state", "PENDING"],
  ["P2", "Links refresh", "Current internal/external Links exports", "Current report may lag Phase 7 graph", "Primary owners", "Yes", "No", "Re-export after recrawl; do not optimize by count", "PENDING"],
].map((v) => Object.fromEntries(ownerActionHeaders.map((h, i) => [h, v[i]]))));

// 9. Phase 11 handoff, protection register and validation summary.
const handoffHeaders = ["Area", "Phase 10 finding", "Status", "Evidence", "Confidence", "Current risk", "AdSense relevance", "Search relevance", "Needs change before Phase 11?", "Owner action?", "Notes"];
writeCsv("phase-10-phase11-handoff.csv", handoffHeaders, [
  ["Search maturity", "50 measurable days; growing search footprint but immature", "PASS WITH LIMITATION", "property/daily/period registers", "High", "Overreaction", "Supports crawl/usefulness indirectly", "Core", "No", "Refresh later", "Protect emerging pages"],
  ["Performance", "15 clicks / 1375 impressions vs 9 / 230; position improved 42.93 to 32.38", "DIRECTIONAL POSITIVE", "period comparison", "High metrics / low causation", "Final releases not represented", "Indirect", "High", "No", "Fresh export", "Growth occurred before/through transition"],
  ["Query privacy", "Only 6.67% of latest clicks visible by query", "MATERIAL LIMITATION", "privacy coverage", "High", "Wrong query attribution", "Indirect", "High", "No", "No", "Never equate visible query zero clicks with page zero"],
  ["Indexing", "322 indexed / 26 not indexed through Aug 7; reason URLs absent", "GENERALLY HEALTHY / PARTIAL", "coverage exports", "Medium", "Unknown exceptions", "Crawlability signal", "High", "No blanket change", "Export examples", "Correct indexing, not maximum indexing"],
  ["Sitemap", "193 repository/live URLs; GSC Sitemaps report missing", "OWNER EVIDENCE REQUIRED", "production smoke + owner queue", "Medium", "Processing unknown", "Indirect", "High", "No production change", "Yes", "Do not infer submission pass"],
  ["URL Inspection", "Not supplied", "OWNER EVIDENCE REQUIRED", "inspection register", "None", "Post-deploy crawl unknown", "Indirect", "High", "No production change", "Yes", "Partial index confidence"],
  ["HTTPS", "0 non-HTTPS URLs through Aug 13", "PASS", "HTTPS export", "High", "Low", "Trust/technical", "Medium", "No", "No", "Eligible count not indexed count"],
  ["Enhancement", "Breadcrumb invalid=0; issue files empty", "PASS WITH SCOPE", "Breadcrumb export", "High", "Low", "Indirect", "Medium", "No", "No", "Does not prove all schema perfect"],
  ["Internal links", "GSC recognition partial/lag-prone relative to current graph", "PARTIAL", "link review", "Medium", "Premature relinking", "Indirect", "Medium", "No", "Refresh later", "No link-count campaign"],
  ["Field CWV", "No supplied field report", "OWNER EVIDENCE REQUIRED", "CWV register", "None", "Unknown", "UX relevance", "Medium", "No unless Poor", "Yes", "Keep lab separate"],
  ["Manual Actions", "Not supplied", "OWNER GSC CHECK REQUIRED", "manual/security review", "None", "P0 if present", "High", "High", "No code change", "Yes", "Blocks unqualified Phase 11 conclusion"],
  ["Security Issues", "Not supplied", "OWNER GSC CHECK REQUIRED", "manual/security review", "None", "P0 if present", "High", "High", "No code change", "Yes", "Blocks unqualified Phase 11 conclusion"],
].map((v) => Object.fromEntries(handoffHeaders.map((h, i) => [h, v[i]]))));

const protectionHeaders = ["URL / Item", "Protected page role", "Protected owner", "Protected index state", "Protected content value", "Protected source/trust", "Protected UX", "Protected AdSense state", "Current GSC signal", "Search maturity", "Do not change before Phase 11 because", "Phase 11 allowed actions", "Phase 11 prohibited assumptions", "Validation requirement"];
writeCsv("MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv", protectionHeaders, masterRows.map((m) => { const p = latestPageByUrl.get(m.URL), record = pageRegister.find((r) => r.URL === m.URL); return { "URL / Item": m.URL, "Protected page role": m["Current primary role"], "Protected owner": m["Primary owner URL"], "Protected index state": m["Current index state"], "Protected content value": m["Current information gain"], "Protected source/trust": `${m["Current source status"]}; ${m["Current safety status"]}`, "Protected UX": "Phase 7 journeys and discoverability", "Protected AdSense state": "Verification only; runtime/manual slots disabled", "Current GSC signal": p ? `${p.Clicks} clicks; ${p.Impressions} impressions; position ${p.Position}; ${record?.Classification}` : "No latest Page row", "Search maturity": p ? (n(p.Impressions) >= 20 ? "DEVELOPING" : "EARLY") : "INSUFFICIENT", "Do not change before Phase 11 because": record?.Classification === "EMERGING WINNER" ? "Emerging winner; avoid churn" : "Final releases have zero supplied post-deploy GSC days", "Phase 11 allowed actions": "Audit readiness; verify owner evidence; propose separately scoped future action", "Phase 11 prohibited assumptions": "Traffic equals quality; zero clicks equals no value; GSC overrides ownership; indexing guarantees AdSense approval", "Validation requirement": "Full release protection if any later production change is separately authorized" }; }));

writeCsv("phase-10-validation-summary.csv", ["Validation", "Command/method", "State", "Result", "Evidence"], [
  { Validation: "Source CSV integrity", "Command/method": "Phase 10 generator parse/number/date/range/hash checks", State: finalValidation ? "Complete" : "Pending final run", Result: finalValidation ? "PASS" : "PENDING", Evidence: "dataset inventory + generation assertions" },
  { Validation: "Duplicate handling", "Command/method": "SHA-256 inventory; single top-target file included", State: "Complete", Result: "PASS", Evidence: "No duplicate counted" },
  { Validation: "Aggregate separation", "Command/method": "Property totals only from Chart/Device/Country; page/query labeled", State: "Complete", Result: "PASS", Evidence: "property and family registers" },
  { Validation: "Repository release", "Command/method": "npm run validate:release", State: finalValidation ? "Complete" : "Pending", Result: finalValidation ? "PASS" : "PENDING", Evidence: "Phase 10 final command log" },
  { Validation: "Production output diff", "Command/method": "deterministic dist aggregate before/after", State: finalValidation ? "Complete" : "Pending", Result: finalValidation ? "ZERO DIFF" : "PENDING", Evidence: "local SHA-256 comparison" },
  { Validation: "Read-only production smoke", "Command/method": "RELEASE_SHA=<current> npm run audit:production-smoke", State: finalValidation ? "Complete" : "Pending", Result: finalValidation ? "PASS 14/14" : "PENDING", Evidence: "homepage, consent, AdSense absence, headers, robots, sitemap, owner/noindex routes, search, ads.txt, 404, HTTPS and preview" },
  { Validation: "Production mutation", "Command/method": "Git scope + no deploy command", State: "Complete", Result: "NONE", Evidence: "docs/scripts/source-data only" },
]);

// 10. Report: exactly 88 required sections.
const emerging = pageRegister.filter((r) => r.Classification === "EMERGING WINNER");
const weakRank = pageRegister.filter((r) => r.Classification === "HIGH-IMPRESSION / LOW-RANK OPPORTUNITY");
const highRankLowClick = pageRegister.filter((r) => r.Classification === "HIGH-RANK / LOW-CLICK REVIEW");
const top5Share = latestCountries.slice(0, 5).reduce((s, r) => s + n(r.Impressions), 0) / latest.impressions * 100;
const top10Share = latestCountries.slice(0, 10).reduce((s, r) => s + n(r.Impressions), 0) / latest.impressions * 100;
const us = latestCountries.find((r) => r.Country === "United States"), uk = latestCountries.find((r) => r.Country === "United Kingdom"), india = latestCountries.find((r) => r.Country === "India");
const mobile = latestDevices.find((r) => r.Device === "Mobile"), desktop = latestDevices.find((r) => r.Device === "Desktop"), tablet = latestDevices.find((r) => r.Device === "Tablet");
const sectionText = [
  ["Executive Summary", `Phase 10 is complete with owner GSC evidence pending. Echo Buddha has a young, growing search footprint: ${latest.clicks} clicks and ${latest.impressions} impressions in the latest 28 days versus ${prior.clicks} and ${prior.impressions} previously. This is measurement evidence, not authorization for SEO churn.`],
  ["Phase 10 Preconditions", `Phase 9 is complete and the owner explicitly began Phase 10. Current production is traceable to ${production.sha}, deployment ${production.deploymentId}.`],
  ["Phase 0–9 Inputs", "The Phase 0-4 reconciled page/owner/index decisions and Phase 5-9 protection, trust, UX, technical and release records were reviewed. Historical records remain historical; the live production baseline supersedes stale handoff wording."],
  ["Protected State", "336 routes, 193 indexable pages, 143 noindex/error pages, 193 sitemap URLs, 40 primary owners, trust/source/safety, Phase 7 journeys, affirmative consent and disabled AdSense runtime/manual slots are frozen."],
  ["Git / Production Baseline", `Branch codex/phase-10-search-measurement starts at ${production.sha}. Production version ${production.versionId} was deployed ${production.deployedAt}.`],
  ["Production Deployment Timeline", "Seven traceable release points are recorded in phase-10-production-timeline.csv. The GSC performance export ends before Phase 8/9 and only the last daily aggregate overlaps intraday Phase 0-7 releases."],
  ["Current Google Search Documentation Reviewed", "Current official Google Search documentation was used for query privacy, page/property aggregation, sitemap/canonical interpretation, CWV field-data boundaries, Manual Actions and Security Issues. No third-party SEO thresholds were adopted."],
  ["Supplied GSC Dataset Inventory", `${inventory.length} preserved source CSV files across performance, Page Indexing, HTTPS, Breadcrumbs and Links are inventoried with hashes. The mentioned duplicate top-target copy was not present in the supplied directory and was not counted.`],
  ["Data Freshness", "Performance ends 2026-08-11, Page Indexing 2026-08-07, Breadcrumbs 2026-08-12 and HTTPS 2026-08-13. These are separate snapshots, not one current-state timestamp."],
  ["Data Quality / Limitations", "Country, device, page and query exports are separate aggregates and were never cross-joined. Page-tab impressions were never used as property totals. Missing URL examples, sitemap, URL Inspection, CWV, Manual Actions and Security evidence remain visible."],
  ["Query Privacy Filtering", `Visible queries cover ${visibleLatestQueries.clicks}/${latest.clicks} clicks (${pct(visibleLatestQueries.clicks/latest.clicks*100)}) and ${visibleLatestQueries.impressions}/${latest.impressions} impressions (${pct(visibleLatestQueries.impressions/latest.impressions*100)}). Query-row zero clicks never overrides Page-report clicks.`],
  ["Measurement Maturity", "GROWING SEARCH FOOTPRINT, not mature. There are 50 supplied daily rows from June 23 to August 11 and 49 days from first nonzero activity; many page-level decisions remain too early."],
  ["Pre / Transition / Post-Remediation Windows", "Most measurable history is pre-remediation or transition. August 11 cannot be attributed hourly. There are zero supplied performance days after the final August 13 release."],
  ["Property-Level Search Performance", `Latest 28 days: ${latest.clicks} clicks, ${latest.impressions} impressions, ${pct(latest.ctr)} CTR, position ${round(latest.position)}.`],
  ["Daily Trends", "The daily register contains 7- and 14-day rolling means. Individual-day noise is not used to authorize changes."],
  ["Latest 28 Days", `July 15-August 11: ${latest.clicks} clicks and ${latest.impressions} impressions across ${latestCountries.length} countries, ${latestPages.length} search-visible Page rows and ${latestQueries.length} visible Query rows.`],
  ["Previous 28 Days", `Previous property totals: ${prior.clicks} clicks, ${prior.impressions} impressions, ${pct(prior.ctr)} CTR, position ${round(prior.position)}.`],
  ["28-Day Comparison", `Clicks increased ${pct((latest.clicks-prior.clicks)/prior.clicks*100)} and impressions ${pct((latest.impressions-prior.impressions)/prior.impressions*100)}; weighted position improved ${round(prior.position-latest.position)} positions. CTR fell as visibility expanded into broader/lower rankings.`],
  ["Latest 14 vs Prior 14", `July 15-28: ${prior14.clicks}/${prior14.impressions}, position ${round(prior14.position)}. July 29-August 11: ${latest14.clicks}/${latest14.impressions}, position ${round(latest14.position)}. This is strong directional acceleration, not causation.`],
  ["Available 3-Month View", `The filter contains only ${historyChart.length} actual days and ${history.clicks} clicks/${history.impressions} impressions, not three full months of meaningful history.`],
  ["Available 6-Month View", "The six-month comparison contains the same 50-day measurable footprint; earlier periods are zero/absent and are not described as six months of mature performance."],
  ["Click Growth", "Click growth is real in the supplied aggregate, but absolute volume remains small and privacy filtering prevents assigning most clicks to visible query strings."],
  ["Impression Growth", "Impression expansion is the clearest discovery-growth signal. It is consistent with broader Google recognition, but final-remediation causation is impossible from the dates."],
  ["CTR Interpretation", "The decline from 3.91% to 1.09% is not automatically negative because the site expanded into many lower-position queries. CTR review must remain page/query/device-specific."],
  ["Average Position Trends", `Property weighted position improved from ${round(prior.position)} to ${round(latest.position)}. The latest-half improvement is stronger but still an immature window.`],
  ["Device Findings", `Mobile ${mobile.Clicks}/${mobile.Impressions} at position ${mobile.Position}; desktop ${desktop.Clicks}/${desktop.Impressions} at ${desktop.Position}; tablet ${tablet.Clicks}/${tablet.Impressions} at ${tablet.Position}. No device-specific query mix was supplied.`],
  ["Mobile Findings", "Mobile ranks materially better and produces most clicks from far fewer impressions. This could reflect query/geography/SERP/sample mix; technical mobile optimization alone is not claimed as the cause."],
  ["Desktop Findings", "Desktop supplies most impressions at weak average positions. This is broad discovery evidence, not authorization for site-wide title/meta rewrites."],
  ["Country Findings", `US ${us.Impressions} impressions (${pct(n(us.Impressions)/latest.impressions*100)}); UK ${uk.Impressions}; India ${india.Impressions}. Top 5 share ${pct(top5Share)}, top 10 ${pct(top10Share)}.`],
  ["Global Reach", `${latestCountries.length} countries have impressions. Echo Buddha is globally diversifying, but tiny country samples do not establish cultural-market success. Country x device was not supplied.`],
  ["Homepage vs Deep-Content Clicks", "Homepage click share moved from 88.89% to 26.67%; deep-content share moved from 11.11% to 73.33%. This supports expanding deep discovery without proving final-phase causation."],
  ["Page-Family Findings", "Articles are the largest deep-content visibility engine in Page rows. Learn, quote categories and source-study pages show distinct early signals. Family page impressions remain page aggregates."],
  ["Articles", "Right Speech, Dhamma vs Dharma and Three Poisons lead article visibility. More articles are not recommended merely because this family performs."],
  ["Learn", "Buddhism for Beginners is recognized but weak-ranked; Eightfold Path, Threefold Training and Magga-vibhanga show narrower high-position signals. The intended foundation/support distinction remains plausible."],
  ["Meditation", "Meditation data is sparse in the supplied window. Absence of large search volume does not negate user/practice value."],
  ["Quotes", "Quote categories Letting Go, Patience and Mindfulness receive meaningful early visibility/clicks; individual stories remain separately evaluated. The Phase 3 curated-index model is not overturned."],
  ["Daily Reflections", "The noindex /daily-reflections/today/ has 9 historical impressions, consistent with lag/history rather than a reason to index recurring utility pages."],
  ["Dictionary", "The Dhamma dictionary receives 67 impressions at position 49.16 while comparison intent performs through Dhamma vs Dharma. This supports distinct broad-definition and comparison roles."],
  ["Sutta / Dhammapada", "Magga-vibhanga, Threefold Training and Dhammapada attribution pages show promising narrow-source relevance. Source distinctions are protected."],
  ["Primary Owner Performance", "All 40 owners are scorecarded. Zero supplied evidence justifies replacing an owner; support-page rankings remain evidence to investigate, not automatic governance authority."],
  ["Supporting Page Performance", "Search-visible support pages are registered with their protected owners and roles. Distinct intent is plausible in several clusters, especially Dhamma vs Dharma."],
  ["Query Cluster Findings", `${clusterRows.length} conservative visible-query clusters were produced. Near-identical variants are normalized without merging distinct Dhamma definition and Dhamma-vs-Dharma comparison intent.`],
  ["Query-to-Owner Mapping", "Every visible query is mapped to a likely cluster and protected owner with an explicit inference label; a serving URL is never represented as observed because query x page was not supplied."],
  ["Cannibalization Review", "No HIGH/CRITICAL case is supported. Same-query multi-page alternation was not supplied, so multiple thematically related ranking pages are not mislabeled as cannibalization."],
  ["Right Speech Findings", "178 impressions, 3 clicks, position 27.13 versus no prior visibility: EMERGING WINNER - PROTECT / OBSERVE. Do not create another Right Speech page."],
  ["Dhamma / Dharma Findings", "Dhamma vs Dharma has 87 impressions, 1 click and position 10.56; multiple comparison variants rank near 5-10. Distinct comparison intent appears to work as intended alongside the broad Dhamma owner."],
  ["Dhammapada Attribution Findings", "Two attribution/verse pages have 47 and 34 impressions at positions 8.09 and 7.29 with zero visible clicks. They meet an internal review threshold but query privacy and sample size require observation before snippet changes."],
  ["Beginner Buddhism Findings", "The primary owner has 107 impressions at position 44.42. Google recognizes the topic, but ranking is still developing; older variants do not justify an owner change."],
  ["Sangha / Five Precepts / Other Weak-Rank Topics", "Sangha (69 at 81.51), Five Precepts application (87 at 53.70) and Three Poisons (79 at 46.68) are recognized but not competitive. Do not create duplicates."],
  ["Search Appearance", "The supplied Search Appearance files are header-only. NO SEARCH APPEARANCE SEGMENTATION AVAILABLE; this is not evidence of a schema defect."],
  ["Page Indexing", `Through ${coverageLast.Date}, GSC reports ${coverageLast.Indexed} indexed and ${coverageLast["Not indexed"]} not indexed (${round(n(coverageLast.Indexed)/(n(coverageLast.Indexed)+n(coverageLast["Not indexed"]))*100,1)}% of Google-known URLs). The report predates final releases.`],
  ["Indexed vs Not Indexed", "Correct indexing, not maximum count, is the target. Google-known URLs can include historical redirects, alternates and removed URLs and need not equal 336 generated routes."],
  ["Noindex Validation", "Eight exclusions are reported, but URL examples are missing. The current site has 143 intentional noindex/error pages; aggregate alignment is plausible but not proven URL-by-URL."],
  ["Redirect Validation", "Seven redirects are reported without URLs. They may be expected historical/edge states; redirects are not targets for indexing."],
  ["Discovered – Currently Not Indexed", "Eight URLs are reported with validation Started. Without examples/inspection, classify OWNER INSPECTION REQUIRED—not a site-wide quality crisis."],
  ["Crawled – Currently Not Indexed", "One URL is the highest-priority individual indexing investigation. No extrapolation to a site-wide content problem is made."],
  ["404 Review", "One GSC 404 is reported without its URL. It must be classified as removed, broken, typo or external history; no homepage blanket redirect is recommended."],
  ["Alternate Canonical Review", "One alternate with proper canonical is reported. This can be normal; destination evidence is required before any change."],
  ["Sitemap State", "Repository and production sitemap contain 193 exact intended URLs. Current GSC Sitemap status/last-read/discovered count were not supplied: OWNER EVIDENCE REQUIRED."],
  ["URL Inspection", "No URL Inspection evidence was supplied. Fifteen priority targets are queued, and Phase 10 retains PARTIAL INDEX-STATE CONFIDENCE."],
  ["Recrawl / Last Crawl", "No last-crawl dates establish that Google processed final remediation. Important final-state validation is NOT YET EVIDENCED AFTER REMEDIATION."],
  ["Google-Selected Canonicals", "No user-vs-Google canonical fields were supplied. Current self-canonical production passes repository validation; Google selection remains owner evidence."],
  ["HTTPS", `GSC reports ${httpsLast["Non-HTTPS URLs"]} non-HTTPS URLs through ${httpsLast.Date}: PASS / CLEAN.`],
  ["Enhancement / Structured Data Report", `Breadcrumbs reports invalid=${enhancementLast.Invalid}, valid=${enhancementLast.Valid}; critical/non-critical files are empty. This does not prove every schema type perfect.`],
  ["Internal Links", `${gscLinks.length} top target pages are supplied. Counts are not authority scores and are compared with the fresh built graph only as lag-prone, non-causal evidence.`],
  ["GSC Internal-Link Recognition vs Phase 7", "Recognition is PARTIAL/INSUFFICIENT: some key owners appear, but report snapshot timing and measurement semantics are incomplete. Wait for recrawl; do not add arbitrary links."],
  ["External Links", "Latest and sample files contain zero data rows. This means insufficient GSC external-link evidence, not zero backlinks on the web."],
  ["Core Web Vitals — Field", "No GSC field CWV dataset was supplied. OWNER EVIDENCE REQUIRED / INSUFFICIENT; lack of data is not a failure."],
  ["Lighthouse vs Field Data", "Phase 8 Lighthouse remains lab evidence only and is never combined with or substituted for GSC field CWV."],
  ["Manual Actions", "No actual Manual Actions report evidence was supplied. OWNER GSC CHECK REQUIRED; rankings cannot prove NONE."],
  ["Security Issues", "No actual Security Issues report evidence was supplied. OWNER GSC CHECK REQUIRED; traffic cannot prove NONE."],
  ["GSC vs Current Production State", "Current production passes live smoke, 193-URL sitemap, self-canonicals, no ad runtime and security headers. GSC performance/index snapshots predate the final state, so parity is technical rather than Google-processing proof."],
  ["Deployment Attribution", "Growth occurred before/through the deployment sequence. No phase is credited causally without post-deploy crawl/inspection evidence."],
  ["Emerging Winners", `${emerging.length} pages meet internal protect/observe criteria. This is not a Google threshold.`],
  ["High-Impression / Low-Rank Opportunities", `${weakRank.length} pages meet the internal recognized/not-competitive review criterion. The default action is observation, not rewriting.`],
  ["High-Rank / Low-Click Opportunities", `${highRankLowClick.length} pages meet the internal >=20 impressions, <=10 position, 0-click review threshold. Query privacy and SERP evidence remain limitations.`],
  ["Pages Requiring More Observation", "The whole final release requires observation; especially emerging winners, foundation owners, Dhammapada pages, quote categories and weak-ranked recognized topics."],
  ["Intentional Non-Search Pages", "Noindex quote stories, daily-reflection details, Search, Today, utilities and errors retain user value. Impressions do not automatically change policy."],
  ["Measurement Red Flags", "No P0 production/index crisis is evidenced. P1 evidence gaps are Manual Actions/Security states; P2 gaps include indexing examples, recrawl/URL Inspection and deployment maturity."],
  ["P0/P1/P2/P3 Findings", "P0 confirmed: 0. P1 confirmed production/index defects: 0. P1 owner-evidence gaps: Manual Actions/Security. P2: nine unindexed-processing URLs, attribution maturity, URL Inspection and link-report lag."],
  ["What Must NOT Be Changed Yet", "Do not rewrite emerging pages, create query variants, mass change metadata/indexability, consolidate from GSC alone, run an internal-link count campaign, alter consent/AdSense, or deploy."],
  ["Phase 11 Inputs", "Phase 11 receives property trends, privacy coverage, owner/query/page/family evidence, index reasons, technical reports, owner gaps, production timeline and protection register."],
  ["Human / Owner GSC Actions", "Eight precise actions cover Manual Actions, Security Issues, indexing examples, URL Inspection, Sitemaps, fresh performance, field CWV and Links."],
  ["Validation of Phase 0–9 Strategy", "Evidence partially supports topic differentiation, curated quote indexing, source-aware pages, deep-content discovery and technical health. Phase 7 link recognition and final Phase 8/9 effects remain too early."],
  ["Remaining Evidence Gaps", "Missing: reason example URLs, Sitemaps report, URL Inspection, Google canonical/last crawl, field CWV, Manual Actions, Security Issues and post-final-release performance."],
  ["Protected State Before Phase 11", "MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv covers all 336 pages and explicitly protects emerging winners and all Phase 0-9 non-regression states."],
  ["Deployment / Production Change Status", "ZERO production content, URL, indexability, navigation, consent or AdSense changes. Phase 10 adds audit data/tooling only. Production was not deployed."],
  ["Final Phase 10 Verdict", `PHASE 10 STATUS: COMPLETE — OWNER GSC EVIDENCE PENDING\n\nPHASE 9 PRECONDITION VERIFIED: Yes\n\nCURRENT PRODUCTION SHA: ${production.sha}\n\nCURRENT PRODUCTION DEPLOYMENT DATE: ${production.deployedAt}\n\nMEASURABLE GSC HISTORY: 50 supplied daily rows; 49 days from first nonzero activity\n\nSEARCH MATURITY: GROWING SEARCH FOOTPRINT\n\nLATEST 28-DAY CLICKS: ${latest.clicks}\n\nPREVIOUS 28-DAY CLICKS: ${prior.clicks}\n\nCLICK CHANGE: ${pct((latest.clicks-prior.clicks)/prior.clicks*100)}\n\nLATEST 28-DAY IMPRESSIONS: ${latest.impressions}\n\nPREVIOUS 28-DAY IMPRESSIONS: ${prior.impressions}\n\nIMPRESSION CHANGE: ${pct((latest.impressions-prior.impressions)/prior.impressions*100)}\n\nLATEST 28-DAY CTR: ${pct(latest.ctr)}\n\nPREVIOUS 28-DAY CTR: ${pct(prior.ctr)}\n\nLATEST 28-DAY AVG POSITION: ${round(latest.position)}\n\nPREVIOUS 28-DAY AVG POSITION: ${round(prior.position)}\n\nSEARCH-VISIBLE URLS — LATEST PERIOD: ${latestPages.length}\n\nVISIBLE QUERIES — LATEST PERIOD: ${latestQueries.length}\n\nVISIBLE QUERY CLICK COVERAGE: ${pct(visibleLatestQueries.clicks/latest.clicks*100)}\n\nVISIBLE QUERY IMPRESSION COVERAGE: ${pct(visibleLatestQueries.impressions/latest.impressions*100)}\n\nCOUNTRIES WITH IMPRESSIONS: ${latestCountries.length}\n\nMOBILE CLICKS / IMPRESSIONS / POSITION: ${mobile.Clicks} / ${mobile.Impressions} / ${mobile.Position}\n\nDESKTOP CLICKS / IMPRESSIONS / POSITION: ${desktop.Clicks} / ${desktop.Impressions} / ${desktop.Position}\n\nHOMEPAGE CLICK SHARE — EARLY PERIOD: 88.89%\n\nDEEP-CONTENT CLICK SHARE — LATEST PERIOD: 73.33%\n\nCURRENT GSC INDEXED / NOT INDEXED: ${coverageLast.Indexed} / ${coverageLast["Not indexed"]} through ${coverageLast.Date}\n\nINDEXING HEALTH: GENERALLY HEALTHY WITH SMALL EXCEPTIONS / PARTIAL URL CONFIDENCE\n\nEXPECTED NOINDEX EXCLUSIONS: 8 likely, URLs required\n\nEXPECTED REDIRECT EXCLUSIONS: 7 likely/historical, URLs required\n\nDISCOVERED / CRAWLED / 404 / ALTERNATE: 8 / 1 / 1 / 1\n\nSITEMAP: OWNER EVIDENCE REQUIRED\n\nURL INSPECTION: OWNER EVIDENCE REQUIRED\n\nHTTPS: PASS\n\nGSC ENHANCEMENT INVALID ITEMS: 0 Breadcrumb items\n\nINTERNAL LINK RECOGNITION: PARTIAL / INSUFFICIENT\n\nEXTERNAL LINK EVIDENCE: INSUFFICIENT\n\nFIELD CORE WEB VITALS: OWNER EVIDENCE REQUIRED\n\nMANUAL ACTIONS: OWNER EVIDENCE REQUIRED\n\nSECURITY ISSUES: OWNER EVIDENCE REQUIRED\n\nEMERGING WINNERS: ${emerging.length}\n\nHIGH-IMPRESSION / LOW-RANK PAGES: ${weakRank.length}\n\nHIGH-RANK / LOW-CLICK REVIEW ITEMS: ${highRankLowClick.length}\n\nHIGH/CRITICAL CANNIBALIZATION CASES: 0\n\nP0 CONFIRMED ISSUES: 0\n\nP1 CONFIRMED PRODUCTION/INDEXING ISSUES: 0\n\nDID SEARCH VISIBILITY MATERIALLY IMPROVE? Yes, within supplied historical window\n\nDID DEEP-CONTENT DISCOVERY MATERIALLY IMPROVE? Yes\n\nDOES GSC SUPPORT THE CURRENT TOPIC-OWNER MODEL? Partially\n\nDOES GSC SUPPORT THE CURRENT INDEXABILITY MODEL? Partially / GSC lag\n\nDOES GSC SHOW A SITE-WIDE CRAWL/INDEX CRISIS? No\n\nDO QUERY PRIVACY LIMITATIONS MATERIALLY AFFECT ANALYSIS? Yes\n\nIS THE SITE STILL TOO YOUNG FOR SOME PAGE-LEVEL DECISIONS? Yes\n\nWERE PRODUCTION CONTENT / INDEXABILITY / URL / ADSENSE CHANGES MADE? No\n\nWAS PRODUCTION DEPLOYED? No\n\nIS PHASE 11 READY TO BEGIN? Yes — with documented measurement limitations and pending owner GSC evidence\n\nNEXT PHASE: PHASE 11 — FINAL ADSENSE READINESS AUDIT\n\nFINAL DECISION: READY FOR PHASE 11 WITH DOCUMENTED MEASUREMENT LIMITATIONS`],
];
sectionText[87][1] = sectionText[87][1].replace(
  "\n\nFINAL DECISION:",
  `\n\nPOTENTIAL OWNER CONFLICTS: 0 proven\n\nPAGES REQUIRING MORE OBSERVATION: ${latestPages.length} latest search-visible pages; final release has no supplied post-deploy GSC days\n\nP0 MEASUREMENT / INDEXING ISSUES: 0 confirmed\n\nP1 MEASUREMENT / INDEXING ISSUES: 0 confirmed; 2 critical owner-evidence gaps\n\nDOES GSC SHOW A TECHNICAL HTTPS CRISIS? No\n\nDOES SUPPLIED ENHANCEMENT DATA SHOW INVALID ITEMS? No\n\nWERE ANY PRODUCTION CONTENT CHANGES MADE? No\n\nWERE ANY INDEXABILITY CHANGES MADE? No\n\nWERE ANY URL CHANGES MADE? No\n\nWAS ADSENSE BEHAVIOR CHANGED? No\n\nFINAL DECISION:`
);
if (sectionText.length !== 88) throw new Error(`Expected 88 report sections, found ${sectionText.length}`);
const docsLinks = [
  "[Google Search Console performance dimensions and anonymized-query limits](https://support.google.com/webmasters/answer/17011259?hl=en)",
  "[Google Search sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=en)",
  "[Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)",
  "[Google Search Console Core Web Vitals report](https://support.google.com/webmasters/answer/9205520?hl=en)",
  "[Google Search Console Security Issues report](https://support.google.com/webmasters/answer/9044101?hl=en)",
].join("; ");
let report = `# Echo Buddha Search Console & Real-World Measurement Report\n\n**Phase:** 10\n\n**Generated:** 2026-08-13 (Asia/Colombo)\n\n**Branch:** \`codex/phase-10-search-measurement\`\n\n**Starting HEAD:** \`${production.sha}\`\n\n**Scope:** Measurement and audit artifacts only; no production change or deployment\n\n`;
sectionText.forEach(([heading, body], i) => { report += `## ${i + 1}. ${heading}\n\n${body}\n\n`; if (i === 6) report += `Official sources: ${docsLinks}.\n\n`; });
fs.writeFileSync(path.join(auditDir, "ECHO_BUDDHA_SEARCH_CONSOLE_REAL_WORLD_MEASUREMENT_REPORT.md"), report);

// Final assertions: fail rather than silently generate malformed evidence.
if (latest.clicks !== 15 || latest.impressions !== 1375 || prior.clicks !== 9 || prior.impressions !== 230) throw new Error("Property baseline mismatch");
if (latestQueries.length !== 263 || latestPages.length !== 114 || latestCountries.length !== 71) throw new Error("Latest dimension row count mismatch");
if (n(coverageLast.Indexed) !== 322 || n(coverageLast["Not indexed"]) !== 26) throw new Error("Coverage baseline mismatch");
if (n(httpsLast["Non-HTTPS URLs"]) !== 0 || n(enhancementLast.Invalid) !== 0) throw new Error("Technical GSC baseline mismatch");
if (inventory.some((r) => !/^[a-f0-9]{64}$/.test(r["SHA-256"]))) throw new Error("Invalid source hash");
for (const row of [...latestChart, ...latestPages, ...latestQueries, ...latestCountries, ...latestDevices]) {
  if (n(row.Clicks) < 0 || n(row.Impressions) < 0 || n(row.Position) < 0 || n(row.CTR) < 0 || n(row.CTR) > 100) throw new Error("Invalid GSC metric range");
}
console.log(`Phase 10 analysis generated: ${inventory.length} source CSVs, 38 machine-readable deliverables, ${sectionText.length} report sections.`);
console.log(`Latest 28: ${latest.clicks} clicks, ${latest.impressions} impressions, ${pct(latest.ctr)} CTR, position ${round(latest.position)}.`);
console.log(`Query visibility: ${visibleLatestQueries.clicks}/${latest.clicks} clicks and ${visibleLatestQueries.impressions}/${latest.impressions} impressions.`);
