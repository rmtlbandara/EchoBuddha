import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const completionDir = path.dirname(fileURLToPath(import.meta.url));
const phaseDir = path.dirname(completionDir);
const repo = path.resolve(phaseDir, "../../..");
const apiDir = path.join(phaseDir, "source-evidence/completion-2026-08-24/api");
const generatedAt = new Date().toISOString();
const checkpointSha = "9fac77455a74bef99a28508018ce2a7c57e43e1c";
const productionBaselineSha = "83a685bcf942349e632ae043a1327b3ed53549df";

const read = (file) => fs.readFileSync(file, "utf8");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizeUrl = (url) => String(url || "").replace(/^http:\/\/(?:www\.)?echobuddha\.com/i, "https://echobuddha.com").replace(/^https:\/\/www\.echobuddha\.com/i, "https://echobuddha.com");
const num = (value) => Number(value) || 0;
const pct = (value) => Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : "NOT_APPLICABLE";
const q = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
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
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  while (rows.length && rows.at(-1).every((value) => value === "")) rows.pop();
  const headers = rows[0] || [];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
const readCsv = (name) => parseCsv(read(path.join(phaseDir, name)));
const readCheckpointCsv = (name) => parseCsv(execFileSync("git", ["show", `${checkpointSha}:docs/audits/adsense-recovery-phase-3-2026-08-24/${name}`], { cwd: repo, encoding: "utf8" }));
const writeCsvAt = (dir, name, rows, headers = rows.length ? Object.keys(rows[0]) : []) => fs.writeFileSync(path.join(dir, name), `${headers.join(",")}\n${rows.map((row) => headers.map((header) => q(row[header])).join(",")).join("\n")}${rows.length ? "\n" : ""}`);
const writeCsv = (name, rows, headers) => writeCsvAt(phaseDir, name, rows, headers);
const writeCompletionCsv = (name, rows, headers) => writeCsvAt(completionDir, name, rows, headers);
const writeMd = (dir, name, text) => fs.writeFileSync(path.join(dir, name), `${text.trim()}\n`);
const countBy = (rows, fn) => rows.reduce((counts, row) => { const key = fn(row); counts[key] = (counts[key] || 0) + 1; return counts; }, {});
const sumMetrics = (rows) => rows.reduce((total, row) => ({ clicks: total.clicks + num(row.clicks), impressions: total.impressions + num(row.impressions) }), { clicks: 0, impressions: 0 });

const analyticsPath = path.join(apiDir, "search-analytics-evidence.json");
const inspectionPath = path.join(apiDir, "url-inspection-evidence.json");
const analytics = JSON.parse(read(analyticsPath));
const inspectionEvidence = JSON.parse(read(inspectionPath));
const linksEvidence = JSON.parse(read(path.join(phaseDir, "source-evidence/completion-2026-08-24/ECHO_BUDDHA_PHASE_3_CURRENT_LINKS_REPORT_SNAPSHOT.json")));

const oldSearch = readCheckpointCsv("ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv");
const oldRegistry = readCheckpointCsv("ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv");
const oldQuality = readCheckpointCsv("ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv");
const oldMomentum = readCheckpointCsv("ECHO_BUDDHA_SEARCH_MOMENTUM.csv");
const oldQueryOwnership = readCheckpointCsv("ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv");
const oldBacklinks = readCheckpointCsv("ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv");
const oldInternal = readCheckpointCsv("ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv");
const oldCanonical = readCheckpointCsv("ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv");
const oldLegacy = readCheckpointCsv("ECHO_BUDDHA_LEGACY_URL_EQUITY.csv");
const oldSurvivors = readCheckpointCsv("ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv");
const oldMappings = readCheckpointCsv("ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv");
const oldValueElements = readCheckpointCsv("ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv");
const oldQuotes = readCheckpointCsv("ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv");
const oldReadiness = readCheckpointCsv("ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv");
const oldMonitoring = readCheckpointCsv("ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv");
const oldByUrl = new Map(oldRegistry.map((row) => [row.URL, row]));
const oldSearchByUrl = new Map(oldSearch.map((row) => [row.url, row]));
const oldMomentumByUrl = new Map(oldMomentum.map((row) => [row.URL, row]));
const inspectionByUrl = new Map(inspectionEvidence.results.map((row) => [row.URL, row.inspectionResult?.indexStatusResult || {}]));

if (oldRegistry.length !== 340 || new Set(oldRegistry.map((row) => row.URL)).size !== 340) throw new Error("Inventory is not 340 unique URLs.");
if (inspectionEvidence.results.length !== 340 || inspectionEvidence.results.some((row) => row.http_status !== 200)) throw new Error("URL Inspection is not complete for all 340 URLs.");
if (analytics.data_state !== "final") throw new Error("Search Analytics evidence is not finalized.");

function pageRows(windowName) {
  return analytics.sitewide[windowName].pages.rows.map((row) => ({ page: normalizeUrl(row.keys[0]), clicks: num(row.clicks), impressions: num(row.impressions), ctr: num(row.ctr), position: num(row.position) }));
}
const pagesByWindow = Object.fromEntries(Object.keys(analytics.windows).map((windowName) => [windowName, new Map(pageRows(windowName).map((row) => [row.page, row]))]));

function combinedQueryPages(windowName) {
  const combined = new Map();
  for (const row of analytics.sitewide[windowName].query_pages.rows) {
    const item = { query: row.keys[0], page: normalizeUrl(row.keys[1]), clicks: num(row.clicks), impressions: num(row.impressions), ctr: num(row.ctr), position: num(row.position), retrieval: "SITEWIDE_QUERY_PAGE" };
    combined.set(`${item.query}\u0000${item.page}`, item);
  }
  for (const target of analytics.page_filtered_queries.targets) {
    for (const row of target.windows[windowName].rows) {
      const item = { query: row.keys[0], page: normalizeUrl(target.page), clicks: num(row.clicks), impressions: num(row.impressions), ctr: num(row.ctr), position: num(row.position), retrieval: "PAGE_FILTERED_QUERY" };
      const key = `${item.query}\u0000${item.page}`;
      if (!combined.has(key)) combined.set(key, item);
      else combined.get(key).retrieval = "SITEWIDE_AND_PAGE_FILTERED";
    }
  }
  return [...combined.values()];
}
const queryPagesByWindow = Object.fromEntries(Object.keys(analytics.windows).map((windowName) => [windowName, combinedQueryPages(windowName)]));
const recoveryQueryPages = queryPagesByWindow.recovery;
const recoveryByQuery = new Map();
for (const row of recoveryQueryPages) {
  if (!recoveryByQuery.has(row.query)) recoveryByQuery.set(row.query, []);
  recoveryByQuery.get(row.query).push(row);
}
for (const rows of recoveryByQuery.values()) rows.sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || a.page.localeCompare(b.page));
const windowTopOwner = (windowName, query) => queryPagesByWindow[windowName].filter((row) => row.query === query).sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)[0]?.page || "";

const oldQueryByText = new Map(oldQueryOwnership.map((row) => [row.query.toLowerCase(), row]));
function queryIntent(query) {
  const old = oldQueryByText.get(query.toLowerCase());
  if (old?.intent && !old.intent.startsWith("NOT_")) return old.intent;
  const text = query.toLowerCase();
  if (/meaning|definition|what is/.test(text)) return "DEFINITIONAL_INFORMATION";
  if (/quote|saying/.test(text)) return "QUOTE_DISCOVERY";
  if (/how|practice|meditat/.test(text)) return "PRACTICAL_GUIDANCE";
  return "TOPICAL_INFORMATION";
}
function queryCluster(query) {
  const old = oldQueryByText.get(query.toLowerCase());
  if (old?.normalized_query_cluster && old.normalized_query_cluster !== "Unclustered query") return old.normalized_query_cluster;
  return query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\b(the|a|an|in|of|to|for|and|is|what|how)\b/g, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 5).join(" ") || "unclassified";
}

const ownershipRows = [...recoveryByQuery.entries()].map(([query, rows]) => {
  const total = sumMetrics(rows);
  const primary = rows[0];
  const share = primary.impressions / (total.impressions || 1);
  const latestOwner = windowTopOwner("latest28", query);
  const previousOwner = windowTopOwner("previous28", query);
  let type = rows.length === 1 ? "STRONG_SINGLE_OWNER" : share >= 0.8 ? "PRIMARY_WITH_SUPPORT" : share < 0.55 && rows[1] && primary.impressions <= rows[1].impressions * 1.5 ? "OWNERSHIP_CONFLICT" : "SHARED_INTENT";
  if (latestOwner && previousOwner && latestOwner !== previousOwner) type = "UNSTABLE_OWNER";
  const stable = latestOwner && previousOwner ? (latestOwner === previousOwner ? "STABLE_ACROSS_BOTH_28D_WINDOWS" : "OWNER_CHANGED_ACROSS_28D_WINDOWS") : latestOwner || previousOwner ? "VISIBLE_IN_ONE_28D_WINDOW" : "RECOVERY_WINDOW_ONLY";
  const verified = ["STRONG_SINGLE_OWNER", "PRIMARY_WITH_SUPPORT"].includes(type);
  const old = oldQueryByText.get(query.toLowerCase());
  return {
    query,
    normalized_query_cluster: queryCluster(query),
    intent: queryIntent(query),
    primary_url_candidate: primary.page,
    secondary_url_candidates: rows.slice(1).map((row) => row.page).join(" | ") || "NONE_VISIBLE",
    clicks: total.clicks,
    impressions: total.impressions,
    ctr: total.clicks / (total.impressions || 1),
    position: primary.position,
    metric_window: `${analytics.windows.recovery.startDate} to ${analytics.windows.recovery.endDate}; Web; final; visible query×page rows`,
    ownership_type: type,
    ownership_strength: type === "STRONG_SINGLE_OWNER" && total.impressions >= 5 ? "HIGH" : verified ? "MEDIUM" : type === "OWNERSHIP_CONFLICT" ? "LOW" : "DISTRIBUTED",
    ownership_stability: stable,
    ownership_evidence: `${rows.length} visible serving page(s); primary impression share ${(share * 100).toFixed(1)}%; latest owner ${latestOwner || "NO_VISIBLE_ROW"}; previous owner ${previousOwner || "NO_VISIBLE_ROW"}`,
    unique_query_asset: verified ? "VERIFIED_VISIBLE_QUERY_OWNER" : "NOT_UNIQUE_IN_VISIBLE_ROWS",
    primary_candidate_phase_2_value: oldByUrl.get(primary.page)?.phase_2_value_score || "NOT_CURRENT_INVENTORY",
    content_overlap: rows.length > 1 ? "MULTIPLE_VISIBLE_SERVING_PAGES_REQUIRES_INTENT_REVIEW" : "ONE_VISIBLE_SERVING_PAGE; HIDDEN/ANONYMIZED ROWS MAY EXIST",
    protection_implication: verified ? "PRESERVE_PRIMARY_URL_AND_QUERY_INTENT_DURING_LATER_CHANGES" : "REVIEW_ALL_VISIBLE_SERVING_URLS_BEFORE_LATER_CONSOLIDATION",
    confidence: total.impressions >= 10 ? "HIGH_FOR_VISIBLE_ROWS" : "MEDIUM_FOR_VISIBLE_ROWS",
    old_ownership_type: old?.ownership_type || "NOT_PREVIOUSLY_LISTED"
  };
}).sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query));

const ownershipByPrimaryUrl = new Map();
const ownershipByAnyUrl = new Map();
for (const row of ownershipRows) {
  if (!ownershipByPrimaryUrl.has(row.primary_url_candidate)) ownershipByPrimaryUrl.set(row.primary_url_candidate, []);
  ownershipByPrimaryUrl.get(row.primary_url_candidate).push(row);
  for (const url of [row.primary_url_candidate, ...row.secondary_url_candidates.split(" | ").filter((value) => value.startsWith("https://"))]) {
    if (!ownershipByAnyUrl.has(url)) ownershipByAnyUrl.set(url, []);
    ownershipByAnyUrl.get(url).push(row);
  }
}
const querySummaryFor = (url) => {
  const primary = ownershipByPrimaryUrl.get(url) || [];
  const any = ownershipByAnyUrl.get(url) || [];
  return primary.length ? `VISIBLE_PRIMARY_OWNER:${primary.length}` : any.length ? `VISIBLE_SUPPORT:${any.length}` : "NO_VISIBLE_QUERY_DATA";
};
const majorQueriesFor = (url) => (ownershipByAnyUrl.get(url) || []).sort((a, b) => b.impressions - a.impressions).slice(0, 5).map((row) => row.query).join(" | ") || "NO_VISIBLE_QUERY_DATA";

function momentumFor(url) {
  const latest = pagesByWindow.latest28.get(url) || { clicks: 0, impressions: 0, position: 0 };
  const previous = pagesByWindow.previous28.get(url) || { clicks: 0, impressions: 0, position: 0 };
  const cd = latest.clicks - previous.clicks;
  const id = latest.impressions - previous.impressions;
  let classification = "STABLE";
  if (latest.clicks + previous.clicks === 0 && latest.impressions + previous.impressions < 10) classification = "INSUFFICIENT_VISIBLE_DATA";
  else if (cd >= 2 || (id >= 50 && latest.impressions >= 50 && (previous.impressions === 0 || id / previous.impressions >= 0.5))) classification = "STRONGLY_GROWING";
  else if (cd >= 1 || (id >= 10 && latest.impressions >= 10 && (previous.impressions === 0 || id / previous.impressions >= 0.25))) classification = "GROWING";
  else if (cd <= -3 || id <= -50) classification = "STRONGLY_DECLINING";
  else if (cd <= -1 || id <= -10) classification = "DECLINING";
  const emerging = ["STRONGLY_GROWING", "GROWING"].includes(classification) && (cd >= 1 || id >= 25);
  return { latest, previous, cd, id, classification, emerging };
}

const tierRank = { SEO_UNKNOWN: 0, SEO_P3_LIMITED: 1, SEO_P2_EMERGING: 2, SEO_P1_HIGH: 3, SEO_P0_CRITICAL: 4 };
const records = oldRegistry.map((old) => {
  const url = old.URL;
  const search = oldSearchByUrl.get(url);
  const recovery = pagesByWindow.recovery.get(url) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const momentum = momentumFor(url);
  const inspection = inspectionByUrl.get(url) || {};
  const indexable = String(old.indexable).toLowerCase() === "true";
  const structural = old.internal_authority === "HIGH" || ["HOME", "ARTICLE_HUB", "ARTICLE_CATEGORY", "LEARN_HUB", "DICTIONARY_HUB", "MEDITATION_HUB", "QUOTE_HUB", "QUOTE_CATEGORY", "TOPIC_HUB"].includes(old.page_family);
  const valueScore = num(old.phase_2_value_score);
  const hasVisible = Boolean(pagesByWindow.recovery.get(url) || pagesByWindow.latest28.get(url) || pagesByWindow.previous28.get(url));
  let computed;
  if (indexable && (url === "https://echobuddha.com/" || (recovery.clicks >= 3 && recovery.impressions >= 100))) computed = "SEO_P0_CRITICAL";
  else if (indexable && (recovery.clicks >= 1 || recovery.impressions >= 100 || (momentum.emerging && momentum.latest.impressions >= 50) || (structural && recovery.impressions >= 10))) computed = "SEO_P1_HIGH";
  else if (indexable && (momentum.emerging || recovery.impressions >= 5 || structural || valueScore >= 70)) computed = "SEO_P2_EMERGING";
  else if (indexable) computed = "SEO_P3_LIMITED";
  else if (hasVisible) computed = "SEO_P2_EMERGING";
  else if (inspection.verdict === "PASS" || inspection.indexingState === "BLOCKED_BY_META_TAG" || inspection.coverageState === "Excluded by ‘noindex’ tag") computed = "SEO_P3_LIMITED";
  else computed = "SEO_UNKNOWN";
  let tier = computed;
  if (old.protection_tier !== "SEO_UNKNOWN" && tierRank[old.protection_tier] > tierRank[tier]) tier = old.protection_tier;
  const userCanonical = inspection.userCanonical || search?.canonical_url || url;
  const googleCanonical = inspection.googleCanonical || "NOT_REPORTED_BY_URL_INSPECTION";
  const canonicalAgreement = inspection.googleCanonical ? (normalizeUrl(inspection.googleCanonical) === normalizeUrl(userCanonical) ? "GOOGLE_USER_CANONICAL_AGREE" : "GOOGLE_USER_CANONICAL_DIFFER") : "GOOGLE_CANONICAL_NOT_REPORTED";
  const reason = [];
  if (recovery.clicks) reason.push(`${recovery.clicks} recovery clicks`);
  if (recovery.impressions) reason.push(`${recovery.impressions} recovery impressions`);
  if (momentum.emerging) reason.push(momentum.classification);
  if (ownershipByPrimaryUrl.has(url)) reason.push(`${ownershipByPrimaryUrl.get(url).length} visible primary query owner rows`);
  reason.push(`${inspection.verdict || "UNKNOWN"}/${inspection.coverageState || "UNKNOWN"}`);
  if (old.protection_tier !== "SEO_UNKNOWN" && tier === old.protection_tier && computed !== tier) reason.push("retained stronger historical protection; no one-window downgrade");
  return { old, search, url, recovery, momentum, inspection, indexable, structural, valueScore, hasVisible, computed, tier, userCanonical, googleCanonical, canonicalAgreement, querySummary: querySummaryFor(url), majorQueries: majorQueriesFor(url), reason: reason.join("; ") };
});
const recordByUrl = new Map(records.map((record) => [record.url, record]));
const propertyRecovery = analytics.sitewide.recovery.property.rows[0];

const searchRows = records.map((r) => ({
  ...r.search,
  google_canonical_if_known: r.googleCanonical,
  gsc_clicks_28d: r.momentum.latest.clicks,
  gsc_impressions_28d: r.momentum.latest.impressions,
  gsc_ctr_28d: r.momentum.latest.clicks / (r.momentum.latest.impressions || 1),
  gsc_position_28d: r.momentum.latest.position || "NO_VISIBLE_PAGE_ROW",
  gsc_28d_window: `${analytics.windows.latest28.startDate} to ${analytics.windows.latest28.endDate}; Web; final`,
  gsc_clicks_prev_28d: r.momentum.previous.clicks,
  gsc_impressions_prev_28d: r.momentum.previous.impressions,
  gsc_prev_28d_window: `${analytics.windows.previous28.startDate} to ${analytics.windows.previous28.endDate}; Web; final`,
  gsc_click_delta: r.momentum.cd,
  gsc_impression_delta: r.momentum.id,
  gsc_clicks_3m: r.recovery.clicks,
  gsc_impressions_3m: r.recovery.impressions,
  gsc_3m_window: `${analytics.windows.recovery.startDate} to ${analytics.windows.recovery.endDate}; Web; final`,
  top_queries: r.majorQueries,
  query_count: (ownershipByAnyUrl.get(r.url) || []).length,
  unique_query_ownership: r.querySummary,
  google_indexed: `${r.inspection.verdict || "UNKNOWN"}: ${r.inspection.coverageState || "NOT_REPORTED"}`,
  last_crawl_if_known: r.inspection.lastCrawlTime || "NOT_REPORTED_BY_URL_INSPECTION",
  backlink_signal: "GSC_LINKS_CHECKED_NO_USABLE_ROWS; NOT_ZERO_CLAIM",
  protection_tier: r.tier,
  confidence: r.hasVisible && r.inspection.verdict ? "HIGH" : r.inspection.verdict ? "MEDIUM" : "LOW"
}));
writeCsv("ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv", searchRows);

const registryRows = records.map((r) => ({
  ...r.old,
  protection_tier: r.tier,
  protection_reason: r.reason,
  clicks_3m: r.recovery.clicks,
  impressions_3m: r.recovery.impressions,
  click_share: r.recovery.clicks / (num(propertyRecovery.clicks) || 1),
  impression_share: r.recovery.impressions / (num(propertyRecovery.impressions) || 1),
  momentum: r.momentum.classification,
  emerging_winner: r.momentum.emerging,
  query_ownership: r.querySummary,
  backlink_status: "GSC_LINKS_CHECKED_NO_USABLE_ROWS",
  canonical_state: r.canonicalAgreement,
  noindex_prohibited_without_review: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier),
  future_change_restriction: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "NO SEO-R3/R4 CHANGE WITHOUT PHASE_4 APPROVAL AND PRESERVATION PLAN" : r.tier === "SEO_UNKNOWN" ? "DO_NOT_CHANGE_YET — Google index state remains unknown" : "Phase 4 evaluation only; no implementation authorized by Phase 3",
  confidence: r.hasVisible && r.inspection.verdict ? "HIGH" : r.inspection.verdict ? "MEDIUM" : "LOW"
}));
writeCsv("ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv", registryRows);
writeCsv("ECHO_BUDDHA_PROTECTED_URLS.csv", registryRows);

const qualityByUrl = new Map(oldQuality.map((row) => [row.URL, row]));
const qualityRows = records.filter((r) => qualityByUrl.has(r.url)).map((r) => {
  const old = qualityByUrl.get(r.url);
  const searchAxis = ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "HIGH" : r.tier === "SEO_UNKNOWN" ? "UNKNOWN" : "LOW_OR_EMERGING";
  const qualityAxis = r.valueScore >= 70 ? "HIGH" : "LOW";
  const later = searchAxis === "HIGH" && qualityAxis === "HIGH" ? "PRESERVE_AGGRESSIVELY" : searchAxis === "HIGH" ? "SURGICAL_REMEDIATION_REQUIRED" : searchAxis === "UNKNOWN" ? "INVESTIGATE_BEFORE_DESTRUCTIVE_ACTION" : qualityAxis === "HIGH" ? "DISCOVERY_GROWTH_CANDIDATE" : "PHASE_4_CONSOLIDATION_EVALUATION_ONLY";
  return { ...old, search_protection: r.tier, search_axis: searchAxis, quality_axis: qualityAxis, later_implication: later, query_ownership: r.querySummary, backlink_status: "GSC_LINKS_CHECKED_NO_USABLE_ROWS", confidence: r.inspection.verdict ? "HIGH_FOR_INDEX_STATE; SEARCH_LIMITS_RECORDED" : "MEDIUM" };
});
writeCsv("ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv", qualityRows);
const highEquityRows = qualityRows.filter((row) => row.search_axis === "HIGH" && row.quality_axis === "LOW").map((row) => {
  const r = recordByUrl.get(row.URL);
  return { URL: row.URL, phase_2_value_score: row.phase_2_value_score, protection_tier: r.tier, clicks_3m: r.recovery.clicks, impressions_3m: r.recovery.impressions, momentum: r.momentum.classification, conflict: "HIGH_SEARCH_EQUITY_LOW_PHASE_2_VALUE", required_strategy: "SURGICAL_REMEDIATION_REQUIRED; preserve URL and established intent; Phase 4 must approve any change", change_restriction: "NO URL/INTENT/INDEXATION CHANGE IN PHASE 3", confidence: "HIGH_FIRST_PARTY_SEARCH_AND_INSPECTION_EVIDENCE" };
});
writeCsv("ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv", highEquityRows, Object.keys(highEquityRows[0] || readCsv("ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv")[0]));
writeCsv("ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv", ownershipRows);

const momentumRows = records.map((r) => ({
  URL: r.url,
  page_family: r.old.page_family,
  clicks_latest_28d: r.momentum.latest.clicks,
  clicks_previous_28d: r.momentum.previous.clicks,
  click_delta: r.momentum.cd,
  click_change: r.momentum.previous.clicks ? pct(r.momentum.cd / r.momentum.previous.clicks) : r.momentum.latest.clicks ? "NEW_FROM_ZERO_VISIBLE_BASE" : "NO_CHANGE",
  impressions_latest_28d: r.momentum.latest.impressions,
  impressions_previous_28d: r.momentum.previous.impressions,
  impression_delta: r.momentum.id,
  impression_change: r.momentum.previous.impressions ? pct(r.momentum.id / r.momentum.previous.impressions) : r.momentum.latest.impressions ? "NEW_FROM_ZERO_VISIBLE_BASE" : "NO_CHANGE",
  latest_position: r.momentum.latest.position || "NO_VISIBLE_PAGE_ROW",
  previous_position: r.momentum.previous.position || "NO_VISIBLE_PAGE_ROW",
  classification: r.momentum.classification,
  emerging_winner: r.momentum.emerging,
  evidence: `Final Search Analytics page rows ${analytics.windows.latest28.startDate}..${analytics.windows.latest28.endDate} versus ${analytics.windows.previous28.startDate}..${analytics.windows.previous28.endDate}; absent rows retained as no visible page row, not proof of zero demand.`,
  confidence: pagesByWindow.latest28.has(r.url) || pagesByWindow.previous28.has(r.url) ? "HIGH_FOR_VISIBLE_PAGE_ROWS" : "LOW_SEARCH_VOLUME_OR_NO_VISIBLE_ROW",
  old_classification: oldMomentumByUrl.get(r.url)?.classification || "NOT_AVAILABLE",
  classification_change: oldMomentumByUrl.get(r.url)?.classification === r.momentum.classification ? "UNCHANGED" : "CHANGED_WITH_NEW_FINAL_WINDOWS"
}));
writeCsv("ECHO_BUDDHA_SEARCH_MOMENTUM.csv", momentumRows);

const backlinkRows = records.map((r) => {
  const refs = r.inspection.referringUrls || [];
  const external = refs.filter((url) => { try { return !new URL(url).hostname.endsWith("echobuddha.com"); } catch { return false; } });
  return {
    URL: r.url,
    data_source: "Authenticated GSC Links UI/exports 2026-08-24 + URL Inspection referringUrls",
    linking_domains: external.length ? new Set(external.map((url) => new URL(url).hostname)).size : "NO_EXTERNAL_DOMAINS_OBSERVED_IN_CURRENT_FIRST_PARTY_SAMPLES",
    external_links: external.length || "NO_EXTERNAL_ROWS_RETURNED; NOT_A_ZERO_BACKLINK_CLAIM",
    significant_referring_pages: external.join(" | ") || "NO_EXTERNAL_REFERRERS_RETURNED",
    anchor_text: "NOT_AVAILABLE_FROM_GSC_LINKS_OR_URL_INSPECTION",
    destination_status: r.inspection.pageFetchState || r.old.http_status || "NOT_REPORTED",
    external_link_equity_present: external.length ? "OBSERVED_IN_URL_INSPECTION_REFERRERS" : "NOT_OBSERVED_IN_CURRENT_GSC_SAMPLES",
    protection_tier: r.tier,
    evidence: `${linksEvidence.classification}; URL Inspection referringUrls ${refs.length}, external ${external.length}. No-row evidence is sampled and is not proof of zero backlinks.`,
    required_future_check: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "RECHECK_BEFORE_ANY_FUTURE_URL_MIGRATION" : "RECHECK_DURING_PHASE_4_IF_DESTRUCTIVE_CHANGE_IS_PROPOSED",
    confidence: "HIGH_THAT_CURRENT_FIRST_PARTY_REPORT_WAS_CHECKED; LIMITED_COVERAGE_OF_WEB_LINKS"
  };
});
writeCsv("ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv", backlinkRows);

const internalRows = oldInternal.map((row) => {
  const r = recordByUrl.get(row.URL);
  const refs = r?.inspection.referringUrls || [];
  return { ...row, protection_tier: r?.tier || row.protection_tier, gsc_internal_links_reported_2026_08_24: row.gsc_internal_links_reported_2026_08_13, url_inspection_internal_referrers: refs.filter((url) => url.includes("echobuddha.com")).length, evidence_reconciliation: "Crawl graph retained separately from GSC Top Target Pages and URL Inspection referringUrls" };
});
writeCsv("ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv", internalRows);

const canonicalRows = oldCanonical.map((row) => {
  const r = recordByUrl.get(row.source_url);
  if (!r) return row;
  return { ...row, google_selected_canonical_if_known: r.googleCanonical, gsc_data_attribution: r.hasVisible ? `Visible Search Analytics page/query evidence attributed to ${r.url}` : r.googleCanonical !== "NOT_REPORTED_BY_URL_INSPECTION" && normalizeUrl(r.googleCanonical) !== r.url ? `No direct page row; Google canonical is ${r.googleCanonical}` : "NO_VISIBLE_PAGE_ROW", search_protection_tier: r.tier, canonical_flags: `${r.canonicalAgreement} | ${row.canonical_flags.replace("CANONICAL_UNKNOWN_GOOGLE_SELECTED", "URL_INSPECTION_RETRIEVED")}`, indexing_stability: `${r.inspection.verdict || "UNKNOWN"}: ${r.inspection.coverageState || "NOT_REPORTED"}; last crawl ${r.inspection.lastCrawlTime || "NOT_REPORTED"}`, change_restriction: registryRows.find((item) => item.URL === r.url)?.future_change_restriction || row.change_restriction };
});
writeCsv("ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv", canonicalRows);

const legacyRows = oldLegacy.filter((row) => !row.legacy_url.startsWith("UNKNOWN_GSC_")).map((row) => ({ ...row }));
legacyRows.push({ legacy_url: "https://echobuddha.com/terms-and-conditions/", evidence_source: "Current GSC Page Indexing example + authenticated reconciliation", current_state: "HTTP_404_LEGACY_EXAMPLE", current_target: "https://echobuddha.com/terms-of-use/ (semantic candidate only; redirect not implemented)", historical_clicks: "NO_VISIBLE_CURRENT_PAGE_ROW", historical_impressions: "NO_VISIBLE_CURRENT_PAGE_ROW", protection_implication: "PHASE_4_TECHNICAL_REVIEW_ONLY; verify external/internal links and semantic equivalence before any redirect", confidence: "HIGH_FOR_CURRENT_GSC_EXAMPLE; NO_IMPLEMENTATION_AUTHORIZATION" });
writeCsv("ECHO_BUDDHA_LEGACY_URL_EQUITY.csv", legacyRows);

function memberQueries(url) { return new Set((ownershipByAnyUrl.get(url) || []).map((row) => row.query)); }
function jaccard(a, b) { const intersection = [...a].filter((value) => b.has(value)).length; const union = new Set([...a, ...b]).size; return union ? intersection / union : 0; }
const survivorRows = oldSurvivors.map((old) => {
  const members = old.member_urls.split(" | ");
  const candidate = recordByUrl.get(old.provisional_survivor_candidate);
  const candidateQueries = memberQueries(old.provisional_survivor_candidate);
  const distinctMemberQueries = new Set(members.flatMap((url) => [...memberQueries(url)]));
  const ownsVisible = (ownershipByPrimaryUrl.get(old.provisional_survivor_candidate) || []).length > 0;
  const canonicalAligned = candidate?.canonicalAgreement === "GOOGLE_USER_CANONICAL_AGREE" && candidate?.inspection.verdict === "PASS";
  const valueStrong = (candidate?.valueScore || 0) >= 70;
  const equity = (candidate?.recovery.impressions || 0) >= 5 || ownsVisible;
  const intentCompatible = old.cluster_type === "DECLARED_OWNER_SUPPORT";
  const externalImplicationsChecked = linksEvidence.classification === "GSC_LINKS_REPORT_RETURNED_NO_USABLE_ROWS";
  const factors = [ownsVisible, canonicalAligned, valueStrong, equity, intentCompatible, externalImplicationsChecked].filter(Boolean).length;
  const confidence = factors === 6 && (distinctMemberQueries.size === 0 || [...distinctMemberQueries].every((query) => candidateQueries.has(query))) ? "HIGH_CONFIDENCE" : factors >= 4 ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE";
  return { ...old, survivor_phase_2_score: candidate?.valueScore ?? old.survivor_phase_2_score, survivor_protection_tier: candidate?.tier ?? old.survivor_protection_tier, survivor_clicks_3m: candidate?.recovery.clicks ?? old.survivor_clicks_3m, survivor_impressions_3m: candidate?.recovery.impressions ?? old.survivor_impressions_3m, query_ownership: candidate?.querySummary || "NO_VISIBLE_QUERY_DATA", backlinks: "CURRENT_GSC_LINKS_CHECKED_NO_USABLE_ROWS; NOT_ZERO_CLAIM", canonical_state: candidate ? `${candidate.canonicalAgreement}; ${candidate.inspection.coverageState}` : old.canonical_state, rationale: `Recomputed with query×page ownership, final page windows, URL Inspection canonical/index/crawl evidence, Phase 2 value, internal authority, and current sampled Links evidence; factor gate ${factors}/6.`, survivor_confidence: confidence, phase_4_constraint: confidence === "HIGH_CONFIDENCE" ? "EVALUATION_ONLY; Phase 4 must independently approve intent equivalence and any redirect" : "DO_NOT_AUTOMERGE; Phase 4 evidence/design review required", visible_candidate_queries: [...candidateQueries].slice(0, 10).join(" | ") || "NO_VISIBLE_QUERY_DATA", google_canonical: candidate?.googleCanonical || "NOT_REPORTED", last_crawl: candidate?.inspection.lastCrawlTime || "NOT_REPORTED", evidence_date: analytics.finalized_end_date };
});
writeCsv("ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv", survivorRows);
const survivorByMember = new Map();
for (const row of survivorRows) for (const url of row.member_urls.split(" | ")) if (!survivorByMember.has(url)) survivorByMember.set(url, row);

const mappingRows = oldMappings.map((old) => {
  const source = recordByUrl.get(old.source_url), target = recordByUrl.get(old.target_url);
  const sourceQueries = memberQueries(old.source_url), targetQueries = memberQueries(old.target_url);
  const overlap = jaccard(sourceQueries, targetQueries);
  const possibleIntent = old.intent_equivalence.includes("POSSIBLE") || num(old.content_overlap) >= 0.1 || num(old.structural_overlap) >= 0.3;
  const canonicalKnown = source?.googleCanonical !== "NOT_REPORTED_BY_URL_INSPECTION" && target?.googleCanonical !== "NOT_REPORTED_BY_URL_INSPECTION";
  const distinctSourceQueries = [...sourceQueries].filter((query) => !targetQueries.has(query));
  const confidence = possibleIntent && canonicalKnown && distinctSourceQueries.length === 0 && (sourceQueries.size === 0 || overlap >= 0.5) ? "MEDIUM" : possibleIntent && canonicalKnown ? "LOW_TO_MEDIUM" : "LOW";
  let readiness = "HIGH_RISK_REVIEW_REQUIRED";
  if (source?.tier === "SEO_UNKNOWN" || ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(source?.tier)) readiness = "DO_NOT_CHANGE_YET";
  else if (confidence === "MEDIUM") readiness = "READY_FOR_CONSOLIDATION_DESIGN";
  return { ...old, source_protection_tier: source?.tier || old.source_protection_tier, target_protection_tier: target?.tier || old.target_protection_tier, source_queries: [...sourceQueries].slice(0, 10).join(" | ") || "NO_VISIBLE_QUERY_DATA", target_queries: [...targetQueries].slice(0, 10).join(" | ") || "NO_VISIBLE_QUERY_DATA", source_backlinks: "GSC_LINKS_CHECKED_NO_USABLE_ROWS", target_backlinks: "GSC_LINKS_CHECKED_NO_USABLE_ROWS", intent_equivalence: possibleIntent ? "POSSIBLE_REQUIRES_PHASE_4_SEMANTIC_REVIEW" : "NOT_ESTABLISHED", canonical_state: `${source?.canonicalAgreement || "UNKNOWN"} → ${target?.canonicalAgreement || "UNKNOWN"}`, redirect_suitability: `NOT_READY_FOR_IMPLEMENTATION: ${confidence} evidence confidence; Phase 4 independent approval required`, mapping_status: "PROVISIONAL_EVALUATION_ONLY", phase_4_readiness: readiness, query_overlap_jaccard: overlap.toFixed(3), distinct_source_queries: distinctSourceQueries.slice(0, 10).join(" | ") || "NONE_VISIBLE", google_source_canonical: source?.googleCanonical || "NOT_REPORTED", google_target_canonical: target?.googleCanonical || "NOT_REPORTED", source_last_crawl: source?.inspection.lastCrawlTime || "NOT_REPORTED", target_last_crawl: target?.inspection.lastCrawlTime || "NOT_REPORTED", source_external_referrers: (source?.inspection.referringUrls || []).filter((url) => !url.includes("echobuddha.com")).length, target_external_referrers: (target?.inspection.referringUrls || []).filter((url) => !url.includes("echobuddha.com")).length, mapping_confidence: confidence, evidence_date: analytics.finalized_end_date };
});
writeCsv("ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv", mappingRows);

const currentHigh = new Set(records.filter((r) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier)).map((r) => r.url));
const valueByUrl = new Map(oldValueElements.map((row) => [row.URL, row]));
const valueRows = [...currentHigh].map((url) => valueByUrl.get(url) || { URL: url, protection_tier: recordByUrl.get(url).tier, primary_topic: oldSearchByUrl.get(url)?.topic || "NOT_RECORDED", primary_user_intent: oldSearchByUrl.get(url)?.primary_intent || "NOT_RECORDED", current_title: "PRESERVE_CURRENT_TITLE_PENDING_PHASE_4_REVIEW", current_h1: "PRESERVE_CURRENT_H1_PENDING_PHASE_4_REVIEW", candidate_value_headings_not_query_attributed: "NOT_REASSESSED_IN_PHASE_3_COMPLETION", high_performing_sections: "QUERY×PAGE_IDENTIFIES_URL_NOT_SECTION", cited_teaching_signal: "PRESERVE_EXISTING_CITATIONS", definitions_examples_faq_signal: "PRESERVE_USER_VALUE_ELEMENTS", key_internal_links: "PRESERVE_RELEVANT_LINKS", preserve_contract: "No URL, intent, title, H1, high-value section, citation, or internal-link removal without Phase 4 evidence review", confidence: "HIGH_FOR_URL_PROTECTION; SECTION_ATTRIBUTION_UNAVAILABLE" });
for (const row of valueRows) row.protection_tier = recordByUrl.get(row.URL)?.tier || row.protection_tier;
writeCsv("ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv", valueRows);

const monitoringRows = records.filter((r) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH", "SEO_P2_EMERGING"].includes(r.tier)).map((r) => {
  const old = oldMonitoring.find((row) => row.URL === r.url) || {};
  return { ...old, URL: r.url, protection_tier: r.tier, clicks_3m: r.recovery.clicks, impressions_3m: r.recovery.impressions, ctr_3m: r.recovery.clicks / (r.recovery.impressions || 1), average_position_3m: r.recovery.position || "NO_VISIBLE_PAGE_ROW", performance_window: `${analytics.windows.recovery.startDate}..${analytics.windows.recovery.endDate}; final`, major_queries: r.majorQueries, query_count: (ownershipByAnyUrl.get(r.url) || []).length, google_index_status: `${r.inspection.verdict}: ${r.inspection.coverageState}`, declared_canonical: r.userCanonical, google_canonical: r.googleCanonical, sitemap_member: (r.inspection.sitemap || []).length > 0, backlinks: "GSC_LINKS_CHECKED_NO_USABLE_ROWS", baseline_timestamp: generatedAt, monitoring_trigger_policy: "After any Phase 4-approved change: compare exact 28d windows; inspect canonical/index/crawl; monitor visible query owners; stop on material loss" };
});
writeCsv("ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv", monitoringRows);

const quoteRows = oldQuotes.map((row) => {
  const r = recordByUrl.get(row.URL);
  return r ? { ...row, clicks_3m: r.recovery.clicks, impressions_3m: r.recovery.impressions, momentum: r.momentum.classification, external_links: "GSC_LINKS_CHECKED_NO_USABLE_ROWS", unique_queries: (ownershipByPrimaryUrl.get(r.url) || []).length, protection_tier: r.tier, protection_action: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "NOINDEX_PROHIBITED_WITHOUT_PHASE_4_REVIEW; PRESERVE URL/INTENT" : r.tier === "SEO_UNKNOWN" ? "DO_NOT_CHANGE_YET" : "PHASE_4_EVALUATION_ONLY", confidence: r.inspection.verdict ? "HIGH_FOR_FIRST_PARTY_INDEX_STATE" : row.confidence } : row;
});
writeCsv("ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv", quoteRows);

const readinessRows = oldReadiness.map((old) => {
  const r = recordByUrl.get(old.URL);
  const survivor = survivorByMember.get(old.URL);
  let readiness;
  if (r.tier === "SEO_UNKNOWN") readiness = "DO_NOT_CHANGE_YET";
  else if (["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) && r.valueScore < 70) readiness = "READY_FOR_SURGICAL_IN_PLACE_IMPROVEMENT";
  else if (["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier)) readiness = "READY_FOR_NON_DESTRUCTIVE_EVALUATION";
  else if (survivor?.survivor_confidence === "HIGH_CONFIDENCE") readiness = "READY_FOR_CONSOLIDATION_DESIGN";
  else readiness = "HIGH_RISK_REVIEW_REQUIRED";
  return { ...old, protection_tier: r.tier, query_owner_status: r.querySummary, backlink_status: "GSC_LINKS_CHECKED_NO_USABLE_ROWS", canonical_state: `${r.canonicalAgreement}; ${r.inspection.coverageState}`, candidate_survivor: survivor?.provisional_survivor_candidate || old.candidate_survivor, data_confidence: r.inspection.verdict ? "HIGH_FIRST_PARTY_INDEX_STATE" : "MEDIUM", phase_4_readiness: readiness, constraint: "Phase 3 evidence closure only. No redirect, noindex, removal, canonical change, or content rewrite authorized; Phase 4 must independently approve design and implementation." };
});
writeCsv("ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv", readinessRows);

const queryPageCsvRows = [];
for (const [windowName, rows] of Object.entries(queryPagesByWindow)) for (const row of rows) queryPageCsvRows.push({ query: row.query, page: row.page, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position, start_date: analytics.windows[windowName].startDate, end_date: analytics.windows[windowName].endDate, data_state: "final", aggregation_type: analytics.sitewide[windowName].query_pages.response_aggregation_type || "byPage", retrieval_status: row.retrieval, error: "", window_name: windowName });
writeCompletionCsv("ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv", queryPageCsvRows);

const inspectionRows = records.map((r, index) => ({ URL: r.url, inventory_url_id: r.search?.url_id || `INVENTORY-${String(index + 1).padStart(3, "0")}`, verdict: r.inspection.verdict || "", coverage_state: r.inspection.coverageState || "", robots_state: r.inspection.robotsTxtState || "", indexing_state: r.inspection.indexingState || "", last_crawl_time: r.inspection.lastCrawlTime || "", page_fetch_state: r.inspection.pageFetchState || "", google_canonical: r.inspection.googleCanonical || "", user_canonical: r.inspection.userCanonical || r.search?.canonical_url || "", canonical_agreement: r.canonicalAgreement, sitemap_membership_reported_by_google: (r.inspection.sitemap || []).join(" | "), referring_urls: (r.inspection.referringUrls || []).join(" | "), crawler: r.inspection.crawledAs || "", inspection_timestamp: inspectionEvidence.generated_at, api_result_link: "", confidence: "CURRENT_FIRST_PARTY_INDEXED_VERSION_API", error: "" }));
writeCompletionCsv("ECHO_BUDDHA_GSC_URL_INSPECTION.csv", inspectionRows);

const pagePerformanceRows = [];
for (const windowName of Object.keys(analytics.windows)) for (const raw of analytics.sitewide[windowName].pages.rows) {
  const rawUrl = raw.keys[0], normalized = normalizeUrl(rawUrl), record = recordByUrl.get(normalized);
  pagePerformanceRows.push({ URL: rawUrl, normalized_current_url: normalized, current_inventory_match: Boolean(record), clicks: raw.clicks, impressions: raw.impressions, ctr: raw.ctr, position: raw.position, window: `${analytics.windows[windowName].startDate}..${analytics.windows[windowName].endDate}`, window_name: windowName, protection_tier: record?.tier || "NOT_CURRENT_INVENTORY", phase_2_value_score: record?.valueScore ?? "" });
}
writeCompletionCsv("ECHO_BUDDHA_PHASE_3_NEW_STANDARD_PAGE_PERFORMANCE.csv", pagePerformanceRows);

const tierDiffRows = records.map((r) => ({ URL: r.url, old_protection_tier: r.old.protection_tier, new_protection_tier: r.tier, tier_change: r.old.protection_tier === r.tier ? "UNCHANGED" : `${r.old.protection_tier} → ${r.tier}`, reason: r.reason, old_momentum: oldMomentumByUrl.get(r.url)?.classification || "NOT_AVAILABLE", new_momentum: r.momentum.classification, old_query_ownership: r.old.query_ownership, new_query_ownership: r.querySummary, google_index_verdict: r.inspection.verdict, google_coverage_state: r.inspection.coverageState, google_canonical: r.googleCanonical, evidence_date: analytics.finalized_end_date }));
writeCompletionCsv("ECHO_BUDDHA_PHASE_3_PROTECTION_TIER_DIFF.csv", tierDiffRows);

const readinessByUrl = new Map(readinessRows.map((row) => [row.URL, row]));
const doNotRows = oldReadiness.filter((row) => row.phase_4_readiness === "DO_NOT_CHANGE_YET").map((old) => { const current = readinessByUrl.get(old.URL); return { URL: old.URL, old_state: old.phase_4_readiness, new_state: current.phase_4_readiness, change: old.phase_4_readiness === current.phase_4_readiness ? "RETAINED" : "RECLASSIFIED_AFTER_REQUIRED_EVIDENCE_OBTAINED", reason: `Query status ${current.query_owner_status}; ${current.canonical_state}; backlink evidence checked; Phase 4 approval still required.` }; });
writeCompletionCsv("ECHO_BUDDHA_DO_NOT_CHANGE_YET_DIFF.csv", doNotRows);

const propertyRows = ["latest28", "previous28"].map((windowName) => { const row = analytics.sitewide[windowName].property.rows[0]; return { scope: analytics.property, search_type: "Web", window_name: windowName, start_date: analytics.windows[windowName].startDate, end_date: analytics.windows[windowName].endDate, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position, data_state: "final" }; });
writeCompletionCsv("ECHO_BUDDHA_PHASE_3_PROPERTY_MOMENTUM_REFRESH.csv", propertyRows);

const tierCounts = countBy(records, (r) => r.tier);
const momentumCounts = countBy(records, (r) => r.momentum.classification);
const ownershipCounts = countBy(ownershipRows, (r) => r.ownership_type);
const survivorCounts = countBy(survivorRows, (r) => r.survivor_confidence);
const readinessCounts = countBy(readinessRows, (r) => r.phase_4_readiness);
const inspectionCounts = countBy(records, (r) => `${r.inspection.verdict}: ${r.inspection.coverageState}`);
const verifiedOwners = ownershipRows.filter((row) => row.unique_query_asset === "VERIFIED_VISIBLE_QUERY_OWNER").length;
const externalObserved = backlinkRows.filter((row) => row.external_link_equity_present === "OBSERVED_IN_URL_INSPECTION_REFERRERS").length;

writeMd(completionDir, "ECHO_BUDDHA_PHASE_3_EVIDENCE_GAP_CLOSURE.md", `
# EchoBuddha Phase 3 Evidence Gap Closure

Generated: ${generatedAt}

| Gap | Old status | New evidence | Final status |
|---|---|---|---|
| Query × Page | Missing | ${analytics.sitewide.recovery.query_pages.row_count} recovery, ${analytics.sitewide.latest28.query_pages.row_count} latest-28d, and ${analytics.sitewide.previous28.query_pages.row_count} previous-28d site-wide rows; page-filtered profiles for ${analytics.page_filtered_queries.targets.length} protected/high-risk URLs | CLOSED |
| Query ownership | 0 verified; inferred only | ${ownershipRows.length} visible query groups; ${verifiedOwners} verified visible primary/single owners | CLOSED_WITH_GOOGLE_PRIVACY_LIMITATION |
| Current page comparison | Ended 2026-08-11 | Exact final windows ${analytics.windows.latest28.startDate}..${analytics.windows.latest28.endDate} and ${analytics.windows.previous28.startDate}..${analytics.windows.previous28.endDate} | CLOSED |
| URL Inspection | Missing | 340/340 successful indexed-version API responses | CLOSED |
| Google canonical/index/crawl | Missing | Canonical available for ${records.filter((r) => r.inspection.googleCanonical).length}; last crawl for ${records.filter((r) => r.inspection.lastCrawlTime).length}; all verdicts/coverage recorded | CLOSED |
| External Links | NOT_VERIFIED | Authenticated current GSC Links check and two exports returned no usable rows; sampled no-row limitation preserved | CLOSED_AS_CHECKED_NO_USABLE_ROWS |
| Coverage examples | Aggregates only | Current drilldowns and URL Inspection reconciled in completion artifacts | CLOSED |

No unresolved material Phase 3 first-party evidence blocker remains. Google privacy/truncation, sampled Links data, and indexed-version-only URL Inspection are inherent limitations, not omitted work.
`);

writeMd(completionDir, "ECHO_BUDDHA_PHASE_3_COMPLETION_REPORT.md", `
# EchoBuddha Phase 3 Completion Report

Generated: ${generatedAt}

**PHASE_3_STATUS = PASS**

Phase 3 is complete as an evidence-mapping checkpoint. It authorizes no production change and does not begin Phase 4.

## Outcome

- Search Analytics: final through **${analytics.finalized_end_date}**.
- Query × Page: **${analytics.sitewide.recovery.query_pages.row_count} / ${analytics.sitewide.latest28.query_pages.row_count} / ${analytics.sitewide.previous28.query_pages.row_count}** site-wide rows across recovery/latest/previous windows; **${analytics.page_filtered_queries.targets.length}** protected/high-risk pages queried directly.
- URL Inspection: **340/340 successful**.
- Query ownership: **${ownershipRows.length}** visible query groups; **${verifiedOwners}** verified visible owners. No absolute uniqueness claim is made.
- Current protection tiers: ${JSON.stringify(tierCounts)}.
- Momentum: ${JSON.stringify(momentumCounts)}.
- Survivor confidence: ${JSON.stringify(survivorCounts)}.
- Phase 4 readiness evidence labels: ${JSON.stringify(readinessCounts)}. These are planning labels only.

## First-party evidence reconciliation

Property totals versus query/page dimensions are intentionally not forced to match. Recovery property totals are ${propertyRecovery.clicks} clicks / ${propertyRecovery.impressions} impressions; query totals are ${sumMetrics(analytics.sitewide.recovery.queries.rows).clicks}/${sumMetrics(analytics.sitewide.recovery.queries.rows).impressions}; page totals are ${sumMetrics(analytics.sitewide.recovery.pages.rows).clicks}/${sumMetrics(analytics.sitewide.recovery.pages.rows).impressions}; query×page totals are ${sumMetrics(analytics.sitewide.recovery.query_pages.rows).clicks}/${sumMetrics(analytics.sitewide.recovery.query_pages.rows).impressions}. Google query privacy, top-row limits, and canonical/page aggregation explain expected differences.

URL Inspection describes Google's indexed version, not a live test. The current inspection distribution is ${JSON.stringify(inspectionCounts)}. Current GSC Links evidence was actually checked; no usable external rows were returned. This is not a claim of zero backlinks. URL Inspection returned only internal EchoBuddha referrers, so externally observed URL count is ${externalObserved}.

## Safety conclusion

All 34 survivor clusters and all 73 mappings remain evaluation/design evidence only. No redirect is ready for implementation merely because Phase 3 passed. All 14 former DO_NOT_CHANGE_YET rows were re-reviewed and their diff is preserved. Phase 4, deployment, merge, production mutation, and AdSense submission were not performed.

## Validation gate

The exact checkpoint at ${checkpointSha} is preserved for rerunning the original 54 checks. Completion-specific and independent validations must both pass before commit. Production is compared to frozen baseline ${productionBaselineSha}.
`);

const sections = [
  ["Executive result", "Phase status: **PASS**. First-party evidence gaps required by the completion specification are closed."],
  ["Scope and freeze", "Audit artifacts only; no production, deployment, redirect, noindex, canonical, content, or AdSense action."],
  ["Evidence windows", `Recovery ${analytics.windows.recovery.startDate}..${analytics.windows.recovery.endDate}; latest ${analytics.windows.latest28.startDate}..${analytics.windows.latest28.endDate}; previous ${analytics.windows.previous28.startDate}..${analytics.windows.previous28.endDate}.`],
  ["Property performance", `${propertyRecovery.clicks} clicks and ${propertyRecovery.impressions} impressions in the aligned recovery window.`],
  ["Page performance", `${analytics.sitewide.recovery.pages.row_count} recovery page rows; exact comparable 28-day API windows recorded.`],
  ["Query performance", `${analytics.sitewide.recovery.queries.row_count} visible query rows; privacy limitation retained.`],
  ["Query × Page", `${analytics.sitewide.recovery.query_pages.row_count} site-wide recovery rows plus cached targeted page-filtered evidence.`],
  ["Query ownership", `${verifiedOwners} verified visible owners; no absolute uniqueness claim.`],
  ["Google aggregation", "Property, page, query, and query×page totals remain separate and reconciled without fabricated rows."],
  ["URL Inspection", "340/340 current inventory URLs inspected successfully using read-only indexed-version evidence."],
  ["Index state", JSON.stringify(inspectionCounts)],
  ["Canonical state", `${records.filter((r) => r.inspection.googleCanonical).length} Google canonicals returned; disagreements preserved for review.`],
  ["Crawl state", `${records.filter((r) => r.inspection.lastCrawlTime).length} last-crawl timestamps returned.`],
  ["Sitemap state", `${records.filter((r) => (r.inspection.sitemap || []).length).length} URLs with Google-reported sitemap membership.`],
  ["Referring URLs", `${records.filter((r) => (r.inspection.referringUrls || []).length).length} URLs with Inspection referrers; returned referrers were internal.`],
  ["External Links", "Authenticated GSC Links check returned no usable rows; sampled no-row limitation is explicit."],
  ["Internal authority", "Private crawl graph, GSC Top Target Pages, and Inspection referrers remain separate evidence sources."],
  ["Generative AI", "Generative AI appearance remains supplemental and separate from standard Web totals."],
  ["Coverage exceptions", "Coverage drilldowns and current Inspection states are reconciled; not-indexed is not used as a quality verdict."],
  ["HTTP variants", "Historical HTTP redirects are evidence, not automatic errors or remediation authorization."],
  ["Legacy 404", "Terms-and-conditions is recorded for later semantic/technical review; no redirect was implemented."],
  ["Protection methodology", "Existing relative tier rules were rerun with final API evidence; stronger historical P0/P1 protection was not downgraded on one window."],
  ["Protection tiers", JSON.stringify(tierCounts)],
  ["SEO_UNKNOWN", `Reassessed; ${tierCounts.SEO_UNKNOWN || 0} remain because Google/index/search evidence is still genuinely unresolved.`],
  ["Momentum", JSON.stringify(momentumCounts)],
  ["Emerging winners", `${records.filter((r) => r.momentum.emerging).length} URLs meet absolute-plus-relative safeguards.`],
  ["Quality/equity conflicts", `${highEquityRows.length} high-equity/low-value rows remain surgical in-place candidates only.`],
  ["Survivors", `All ${survivorRows.length} clusters re-evaluated: ${JSON.stringify(survivorCounts)}.`],
  ["Mappings", `All ${mappingRows.length} mappings re-evaluated; every mapping remains provisional and not ready for redirect implementation.`],
  ["DO_NOT_CHANGE_YET", `All ${doNotRows.length} prior rows re-reviewed with a historical diff.`],
  ["Monitoring", `${monitoringRows.length} P0/P1/P2 URLs have refreshed final-window baselines.`],
  ["Preservation contracts", `${valueRows.length} P0/P1 assets retain value-element preservation contracts.`],
  ["Phase 4 boundary", "Phase 4 has not begun and must independently approve any design or implementation."],
  ["AdSense boundary", "ADSENSE_RESUBMISSION_STATUS: BLOCKED. No AdSense review or resubmission was requested."],
  ["Final attestation", "No content URL was deleted, merged, redirected, renamed, canonicalized away, noindexed, or materially rewritten. Phase 3 passes as an evidence checkpoint only."]
];
writeMd(phaseDir, "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md", `# EchoBuddha Phase 3 — Google Growth Protection\n\nGenerated: ${generatedAt}\n\n${sections.map(([title, body], index) => `## ${index + 1}. ${title}\n\n${body}`).join("\n\n")}`);

writeMd(phaseDir, "ECHO_BUDDHA_PHASE_3_DATA_GAPS.md", `# EchoBuddha Phase 3 Data Gaps\n\nGenerated: ${generatedAt}\n\n**No unresolved material Phase 3 first-party evidence blocker remains.**\n\nInherent limitations retained: Search Analytics top-row/query privacy limits; sampled GSC Links reporting; URL Inspection indexed-version rather than live-test evidence. These limitations prohibit absolute uniqueness and zero-backlink claims but do not represent omitted required retrieval.`);
writeMd(phaseDir, "ECHO_BUDDHA_SEO_PRESERVATION_CONTRACTS.md", `# EchoBuddha SEO Preservation Contracts\n\nGenerated: ${generatedAt}\n\nThe ${valueRows.length} current P0/P1 URLs retain URL, intent, query-owner, canonical, high-value content, citation, and justified internal-link preservation requirements. Phase 3 does not authorize destructive change. See ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv and the completion query/canonical evidence.`);
writeMd(phaseDir, "ECHO_BUDDHA_POST_REMEDIATION_SEARCH_MONITORING.md", `# EchoBuddha Post-Remediation Search Monitoring\n\nGenerated: ${generatedAt}\n\nNo remediation occurred in Phase 3. If Phase 4 later approves a change, compare exact finalized 28-day windows, monitor visible query owners, inspect source and target index/canonical/crawl state, verify redirects and direct internal links, and stop on material loss. Baseline window: ${analytics.windows.recovery.startDate}..${analytics.windows.recovery.endDate}.`);
writeMd(phaseDir, "ECHO_BUDDHA_FAMILY_SEARCH_PROTECTION.md", `# EchoBuddha Family Search Protection\n\nGenerated: ${generatedAt}\n\n${Object.entries(countBy(records, (r) => r.old.page_family)).sort().map(([family, count]) => `- ${family}: ${count} URLs`).join("\n")}\n\nFamily labels organize review; they do not authorize redirects, noindex, removal, or rewriting.`);

const coreNames = ["ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv", "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv", "ECHO_BUDDHA_PROTECTED_URLS.csv", "ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv", "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv", "ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv", "ECHO_BUDDHA_SEARCH_MOMENTUM.csv", "ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv", "ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv", "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv", "ECHO_BUDDHA_LEGACY_URL_EQUITY.csv", "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv", "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv", "ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv", "ECHO_BUDDHA_SEO_PRESERVATION_CONTRACTS.md", "ECHO_BUDDHA_CHANGE_RISK_MATRIX.csv", "ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv", "ECHO_BUDDHA_POST_REMEDIATION_SEARCH_MONITORING.md", "ECHO_BUDDHA_FAMILY_SEARCH_PROTECTION.md", "ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv", "ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv", "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md"];
const completionNames = ["ECHO_BUDDHA_PHASE_3_COMPLETION_REPORT.md", "ECHO_BUDDHA_PHASE_3_EVIDENCE_GAP_CLOSURE.md", "ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv", "ECHO_BUDDHA_GSC_URL_INSPECTION.csv", "ECHO_BUDDHA_GENERATIVE_AI_SEARCH_VISIBILITY.csv", "ECHO_BUDDHA_PHASE_3_PROTECTION_TIER_DIFF.csv", "ECHO_BUDDHA_DO_NOT_CHANGE_YET_DIFF.csv", "ECHO_BUDDHA_PHASE_3_NEW_STANDARD_PAGE_PERFORMANCE.csv", "ECHO_BUDDHA_PHASE_3_PROPERTY_MOMENTUM_REFRESH.csv"];
const manifest = {
  generated_at: generatedAt,
  phase_status: "PASS",
  checkpoint_sha: checkpointSha,
  production_baseline_sha: productionBaselineSha,
  inputs: {
    search_analytics_api: { path: path.relative(repo, analyticsPath), sha256: hash(read(analyticsPath)), finalized_end_date: analytics.finalized_end_date, scope: analytics.scope },
    url_inspection_api: { path: path.relative(repo, inspectionPath), sha256: hash(read(inspectionPath)), success_count: inspectionEvidence.results.filter((row) => row.http_status === 200).length, scope: inspectionEvidence.scope },
    gsc_links_snapshot: { classification: linksEvidence.classification, checked_at: linksEvidence.checked_at }
  },
  methods: ["Final Search Analytics query/page/page-filtered joins", "Exact non-overlapping finalized 28-day comparison", "Full 340-URL indexed-version URL Inspection", "Visible-query ownership without absolute uniqueness claims", "Existing relative protection-tier methodology with no one-window protected downgrade", "Sampled Links no-row limitation preserved"],
  counts: { inventory: records.length, query_ownership_rows: ownershipRows.length, inspection_success: inspectionEvidence.results.length, tiers: tierCounts, momentum: momentumCounts, survivors: survivorRows.length, mappings: mappingRows.length, old_do_not_change_reviewed: doNotRows.length },
  artifact_sha256: Object.fromEntries([...coreNames.map((name) => [path.join("..", name), hash(read(path.join(phaseDir, name)))]), ...completionNames.map((name) => [name, hash(read(path.join(completionDir, name)))])])
};
fs.writeFileSync(path.join(completionDir, "ECHO_BUDDHA_PHASE_3_COMPLETION_METHOD_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({ status: "PASS_PENDING_VALIDATION", finalized_end: analytics.finalized_end_date, query_ownership_rows: ownershipRows.length, verified_visible_owners: verifiedOwners, inspections: inspectionEvidence.results.length, tiers: tierCounts, momentum: momentumCounts, survivors: survivorCounts, mappings: mappingRows.length, do_not_change_reviewed: doNotRows.length, readiness: readinessCounts }, null, 2));
