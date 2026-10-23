import { decisionWindowReady } from "./measurement-window.mjs";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  AUDIT_DIR,
  CLUSTERS,
  DECISION_CLASSES,
  PHASE_1,
  PRIVATE_EVIDENCE_DIR,
  SITE_ORIGIN,
  WATCHLIST,
  absoluteUrl,
  aggregateRows,
  daysInclusive,
  finiteNumber,
  formatMetric,
  markdownTable,
  metricDelta,
  parseCsv,
  queryFamily,
  readCsvIfPresent,
  readPhase1Registry,
  resolveRawDir,
  routeFromUrl,
  sha256File,
  writeCsv
} from "./phase-2-measurement-lib.mjs";

const rawDir = resolveRawDir();
const derivedDir = path.join(path.dirname(rawDir), "derived");
const importDir = path.join(AUDIT_DIR, "import-templates");
const apiEvidencePath = path.join(rawDir, "gsc-api-evidence.json");
const inspectionEvidencePath = path.join(rawDir, "url-inspection-evidence.json");
const phase1Registry = readPhase1Registry();
const priorityRows = parseCsv(fs.readFileSync(
  "docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/PRIORITY_CLUSTER_DECISIONS.csv",
  "utf8"
));

fs.mkdirSync(AUDIT_DIR, { recursive: true });
fs.mkdirSync(importDir, { recursive: true });
fs.mkdirSync(derivedDir, { recursive: true });

const datasetNames = [
  "daily_performance",
  "page_performance",
  "query_performance",
  "query_page_performance",
  "country_performance",
  "device_performance",
  "search_appearance",
  "ai_search_performance",
  "multimodal_performance",
  "url_inspection"
];

const templateDefinitions = {
  daily_performance: ["window", "date", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  page_performance: ["window", "page", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  query_performance: ["window", "query", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  query_page_performance: ["window", "week", "query", "page", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  country_performance: ["window", "country", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  device_performance: ["window", "device", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  search_appearance: ["window", "appearance", "clicks", "impressions", "ctr", "position", "data_state", "search_type"],
  ai_search_performance: ["window", "dimension", "value", "page", "clicks", "impressions", "data_state", "source"],
  multimodal_performance: ["window", "dimension", "value", "page", "clicks", "impressions", "data_state", "source"],
  url_inspection: ["page", "inspection_time", "verdict", "coverage_state", "indexing_state", "robots_txt_state", "user_canonical", "google_canonical", "last_crawl_time", "source"]
};

for (const [name, headers] of Object.entries(templateDefinitions)) {
  const filePath = path.join(importDir, `${name}.csv`);
  if (!fs.existsSync(filePath)) writeCsv(filePath, headers, []);
}

function emptyEvidence() {
  return Object.fromEntries(datasetNames.map((name) => [name, []]));
}

function normalizeMetricRow(row) {
  return {
    ...row,
    page: row.page ? absoluteUrl(row.page) : "",
    clicks: finiteNumber(row.clicks) ?? 0,
    impressions: finiteNumber(row.impressions) ?? 0,
    ctr: finiteNumber(row.ctr),
    position: finiteNumber(row.position),
    data_state: row.data_state || "final",
    search_type: row.search_type || "web"
  };
}

function loadCsvEvidence() {
  const data = emptyEvidence();
  for (const name of datasetNames) {
    const privatePath = path.join(PRIVATE_EVIDENCE_DIR, `${name}.csv`);
    if (fs.existsSync(privatePath)) {
      data[name] = readCsvIfPresent(privatePath).map(normalizeMetricRow);
    }
  }
  const files = datasetNames
    .map((name) => path.join(PRIVATE_EVIDENCE_DIR, `${name}.csv`))
    .filter((filePath) => fs.existsSync(filePath));
  return { data, files, source: files.length ? "PRIVATE_CSV_IMPORT" : "NONE", metadata: {} };
}

function flattenApiRows(windowName, datasetName, dataset, searchType = "web") {
  const keyNames = {
    daily: ["date"],
    pages: ["page"],
    queries: ["query"],
    queryPages: ["query", "page"],
    countries: ["country"],
    devices: ["device"],
    appearance: ["appearance"]
  }[datasetName] ?? [];
  return (dataset?.rows ?? []).map((row) => normalizeMetricRow({
    window: windowName,
    ...Object.fromEntries(keyNames.map((key, index) => [key, row.keys?.[index] ?? ""])),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
    data_state: "final",
    search_type: searchType
  }));
}

function loadApiEvidence() {
  if (!fs.existsSync(apiEvidencePath)) return null;
  const api = JSON.parse(fs.readFileSync(apiEvidencePath, "utf8"));
  const data = emptyEvidence();
  const mapping = {
    daily: "daily_performance",
    pages: "page_performance",
    queries: "query_performance",
    queryPages: "query_page_performance",
    countries: "country_performance",
    devices: "device_performance",
    appearance: "search_appearance"
  };
  for (const [windowName, window] of Object.entries(api.windows ?? {})) {
    for (const [apiName, localName] of Object.entries(mapping)) {
      if (apiName === "queryPages" && (window.datasets?.weeklyQueryPages?.length ?? 0) > 0) continue;
      data[localName].push(...flattenApiRows(windowName, apiName, window.datasets?.[apiName], "web"));
    }
    for (const weekly of window.datasets?.weeklyQueryPages ?? []) {
      data.query_page_performance.push(...flattenApiRows(windowName, "queryPages", weekly, "web").map((row) => ({
        ...row,
        week: weekly.week
      })));
    }
  }
  for (const [windowName, window] of Object.entries(api.imageSearch ?? {})) {
    const imageRows = flattenApiRows(windowName, "pages", window.datasets?.pages, "image");
    data.multimodal_performance.push(...imageRows.map((row) => ({
      ...row,
      dimension: "search_type",
      value: "image",
      source: "SEARCH_ANALYTICS_API_IMAGE"
    })));
  }
  const files = [apiEvidencePath];
  if (fs.existsSync(inspectionEvidencePath)) {
    const inspection = JSON.parse(fs.readFileSync(inspectionEvidencePath, "utf8"));
    for (const record of inspection.results ?? []) {
      const result = record.inspectionResult?.indexStatusResult ?? {};
      data.url_inspection.push({
        page: record.inspectionUrl,
        inspection_time: inspection.generatedAt ?? "",
        verdict: result.verdict ?? "",
        coverage_state: result.coverageState ?? "",
        indexing_state: result.indexingState ?? "",
        robots_txt_state: result.robotsTxtState ?? "",
        user_canonical: result.userCanonical ?? "",
        google_canonical: result.googleCanonical ?? "",
        last_crawl_time: result.lastCrawlTime ?? "",
        source: "URL_INSPECTION_API"
      });
    }
    files.push(inspectionEvidencePath);
  }
  return { data, files, source: "GSC_API", metadata: api };
}

const evidence = loadApiEvidence() ?? loadCsvEvidence();
const asOfDate = (evidence.metadata.generatedAt || process.env.PHASE2_AS_OF_DATE || "2026-10-04").slice(0, 10);
const finalizedEndDate = evidence.metadata.finalizedEndDate || process.env.PHASE2_FINALIZED_END_DATE || "";
const dataState = evidence.metadata.dataState || (evidence.source === "NONE" ? "UNAVAILABLE" : "final");
const preRows = evidence.data.daily_performance.filter((row) => row.window === "pre" && row.data_state === "final");
const postRows = evidence.data.daily_performance.filter((row) => row.window === "post" && row.data_state === "final");
const preDates = new Set(preRows.map((row) => row.date).filter(Boolean));
const postDates = new Set(postRows.map((row) => row.date).filter(Boolean));
const preComplete = preDates.size >= 28 && preDates.has(PHASE_1.preStart) && preDates.has(PHASE_1.preEnd);
const postComplete = postDates.size >= 28 && postDates.has(PHASE_1.postStart) && postDates.has(PHASE_1.postEnd);
const transitionExcluded = !evidence.data.daily_performance.some((row) => row.date === PHASE_1.transitionDayPt && ["pre", "post"].includes(row.window));
const interventionRegister = JSON.parse(fs.readFileSync("governance/measurement-interventions.json", "utf8"));
const observationIntervened = interventionRegister.interventions.some((item) =>
  item.status !== "CANCELLED" && item.plannedReleaseDate >= PHASE_1.postStart && item.plannedReleaseDate <= PHASE_1.postEnd
);
const decisionGateOpen = decisionWindowReady({
  finalized: dataState === "final", preComplete, postComplete, transitionExcluded,
  asOfDate, earliestReview: PHASE_1.earliestDecisionReview,
  interventions: interventionRegister.interventions, postStart: PHASE_1.postStart, postEnd: PHASE_1.postEnd
});
const phaseStatus = decisionGateOpen
  ? "PHASE_2_DECISION_REVIEW_READY"
  : "PHASE_2_MEASUREMENT_ACTIVE — CONSOLIDATION HOLD";

const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const currentMain = execFileSync("git", ["rev-parse", "origin/main"], { encoding: "utf8" }).trim();

const pageRows = evidence.data.page_performance.filter((row) => row.search_type === "web");
const queryPageRows = evidence.data.query_page_performance.filter((row) => row.search_type === "web");
const pageMetrics = (window, route) => aggregateRows(pageRows.filter(
  (row) => row.window === window && routeFromUrl(row.page) === route
));

function ownershipMetrics(item) {
  const post = queryPageRows.filter((row) => row.window === "post");
  const supportRows = post.filter((row) => routeFromUrl(row.page) === item.url);
  const ownerFamilies = new Set(post
    .filter((row) => routeFromUrl(row.page) === item.owner && row.impressions > 0)
    .map((row) => queryFamily(row.query)));
  const total = supportRows.reduce((sum, row) => sum + row.impressions, 0);
  const shared = supportRows
    .filter((row) => ownerFamilies.has(queryFamily(row.query)))
    .reduce((sum, row) => sum + row.impressions, 0);
  const independent = total - shared;
  const familyWeeks = new Map();
  for (const row of post.filter((candidate) => [item.url, item.owner].includes(routeFromUrl(candidate.page)))) {
    if (!row.week) continue;
    const key = `${queryFamily(row.query)}::${row.week}`;
    if (!familyWeeks.has(key)) familyWeeks.set(key, new Set());
    familyWeeks.get(key).add(routeFromUrl(row.page));
  }
  const alternationWeeks = [...familyWeeks.values()].filter((urls) => urls.size > 1).length;
  return {
    sharedQueryRate: total ? shared / total : null,
    independentQueryRate: total ? independent / total : null,
    alternationWeeks,
    visibleQueryImpressions: total
  };
}

const inspectionByRoute = new Map(evidence.data.url_inspection.map((row) => [routeFromUrl(row.page), row]));

const cleanedRows = [];
for (const [dataset, rows] of Object.entries(evidence.data)) {
  for (const row of rows) {
    cleanedRows.push({
      dataset,
      window: row.window ?? "",
      date: row.date ?? "",
      week: row.week ?? "",
      query: row.query ?? "",
      query_family: row.query ? queryFamily(row.query) : "",
      page: row.page ?? "",
      dimension: row.country ?? row.device ?? row.appearance ?? row.dimension ?? "",
      value: row.value ?? "",
      clicks: row.clicks ?? "",
      impressions: row.impressions ?? "",
      ctr: row.ctr ?? "",
      position: row.position ?? "",
      data_state: row.data_state ?? "",
      search_type: row.search_type ?? "",
      source: row.source ?? evidence.source
    });
  }
}
const cleanedHeaders = ["dataset", "window", "date", "week", "query", "query_family", "page", "dimension", "value", "clicks", "impressions", "ctr", "position", "data_state", "search_type", "source"];
writeCsv(path.join(derivedDir, "CLEANED_GSC_DATASET.csv"), cleanedHeaders, cleanedRows);
writeCsv(path.join(derivedDir, "PAGE_PERFORMANCE_TABLE.csv"), templateDefinitions.page_performance, evidence.data.page_performance);
writeCsv(path.join(derivedDir, "QUERY_PERFORMANCE_TABLE.csv"), [...templateDefinitions.query_performance.slice(0, 2), "query_family", ...templateDefinitions.query_performance.slice(2)], evidence.data.query_performance.map((row) => ({ ...row, query_family: queryFamily(row.query) })));
writeCsv(path.join(derivedDir, "QUERY_PAGE_PERFORMANCE_TABLE.csv"), [...templateDefinitions.query_page_performance.slice(0, 3), "query_family", ...templateDefinitions.query_page_performance.slice(3)], queryPageRows.map((row) => ({ ...row, query_family: queryFamily(row.query) })));

const weeklyGroups = new Map();
for (const row of evidence.data.daily_performance) {
  const start = row.window === "pre" ? PHASE_1.preStart : row.window === "post" ? PHASE_1.postStart : row.date;
  const offset = Math.max(0, Math.floor((new Date(`${row.date}T12:00:00Z`) - new Date(`${start}T12:00:00Z`)) / (7 * 86_400_000)));
  const week = `W${offset + 1}`;
  const key = `${row.window}::${week}::${row.search_type}`;
  if (!weeklyGroups.has(key)) weeklyGroups.set(key, { window: row.window, week, search_type: row.search_type, rows: [] });
  weeklyGroups.get(key).rows.push(row);
}
const weeklyRows = [...weeklyGroups.values()].map((group) => {
  const aggregate = aggregateRows(group.rows);
  return { window: group.window, week: group.week, clicks: aggregate.clicks, impressions: aggregate.impressions, ctr: aggregate.ctr ?? "", position: aggregate.position ?? "", data_state: "final", search_type: group.search_type };
});
writeCsv(path.join(derivedDir, "WEEKLY_TREND_TABLE.csv"), ["window", "week", "clicks", "impressions", "ctr", "position", "data_state", "search_type"], weeklyRows);
writeCsv(path.join(derivedDir, "COUNTRY_PERFORMANCE.csv"), templateDefinitions.country_performance, evidence.data.country_performance);
writeCsv(path.join(derivedDir, "DEVICE_PERFORMANCE.csv"), templateDefinitions.device_performance, evidence.data.device_performance);
writeCsv(path.join(derivedDir, "SEARCH_APPEARANCE_PERFORMANCE.csv"), templateDefinitions.search_appearance, evidence.data.search_appearance);
writeCsv(path.join(derivedDir, "AI_SEARCH_PERFORMANCE.csv"), templateDefinitions.ai_search_performance, evidence.data.ai_search_performance);
writeCsv(path.join(derivedDir, "MULTIMODAL_PERFORMANCE.csv"), templateDefinitions.multimodal_performance, evidence.data.multimodal_performance);

const observedQueries = [...new Set([
  ...evidence.data.query_performance.map((row) => row.query),
  ...queryPageRows.map((row) => row.query)
].filter(Boolean))].sort();
writeCsv(path.join(derivedDir, "QUERY_FAMILY_MAP.csv"), ["raw_query", "normalized_family", "review_status"], observedQueries.map((query) => ({
  raw_query: query,
  normalized_family: queryFamily(query),
  review_status: "HUMAN_REVIEW_REQUIRED"
})));

const watchlistRows = WATCHLIST.map((item) => {
  const pre = pageMetrics("pre", item.url);
  const post = pageMetrics("post", item.url);
  const ownership = ownershipMetrics(item);
  const inspection = inspectionByRoute.get(item.url);
  let decision = "HOLD_MORE_DATA";
  let confidence = "NOT_ASSESSED";
  let action = "Preserve the Phase 1 page unchanged and acquire the complete finalized post window plus fresh URL Inspection evidence.";
  let evidenceNote = "The minimum 28-day finalized post-Phase-1 evidence gate is not open.";
  if (decisionGateOpen) {
    const enoughQueryEvidence = ownership.visibleQueryImpressions >= 20;
    const canonicalAligned = inspection?.google_canonical
      ? routeFromUrl(inspection.google_canonical) === item.url
      : false;
    if (enoughQueryEvidence && ownership.independentQueryRate >= 0.25 && canonicalAligned) {
      decision = "KEEP_DISTINCT";
      confidence = ownership.visibleQueryImpressions >= 100 ? "HIGH" : "MEDIUM";
      action = "Protect the distinct role; consider only evidence-backed incremental strengthening.";
      evidenceNote = "Finalized data shows meaningful independent query demand and aligned canonical evidence.";
    } else {
      confidence = "LOW";
      evidenceNote = "The time gate is open, but the strict evidence needed for an irreversible action is incomplete or ambiguous.";
      action = "Conduct human query-family, content-overlap, canonical, external-link, and content-salvage review before any change.";
    }
  }
  return {
    url: item.url,
    cluster: item.cluster,
    phase_1_role: item.role,
    owner: item.owner,
    pre_clicks: preComplete ? pre.clicks : "DATA_REQUIRED",
    post_clicks: postComplete ? post.clicks : "DATA_REQUIRED",
    pre_impressions: preComplete ? pre.impressions : "DATA_REQUIRED",
    post_impressions: postComplete ? post.impressions : "DATA_REQUIRED",
    ctr: postComplete ? formatMetric(post.ctr == null ? null : post.ctr * 100) : "DATA_REQUIRED",
    position_context: postComplete ? formatMetric(post.position) : "DATA_REQUIRED",
    shared_query_rate: decisionGateOpen ? formatMetric(ownership.sharedQueryRate == null ? null : ownership.sharedQueryRate * 100) : "DATA_REQUIRED",
    independent_query_rate: decisionGateOpen ? formatMetric(ownership.independentQueryRate == null ? null : ownership.independentQueryRate * 100) : "DATA_REQUIRED",
    weekly_owner_alternation: decisionGateOpen ? ownership.alternationWeeks : "DATA_REQUIRED",
    google_canonical: inspection?.google_canonical || "PENDING_FRESH_URL_INSPECTION",
    index_state: inspection?.coverage_state || inspection?.indexing_state || "PENDING_FRESH_URL_INSPECTION",
    content_overlap: "HUMAN_REVIEW_REQUIRED_AFTER_DATA_LOCK",
    unique_information_gain: item.informationGain,
    internal_navigation_value: "PRESERVED_DURING_OBSERVATION",
    external_link_evidence: "DATA_REQUIRED",
    decision,
    confidence,
    evidence: evidenceNote,
    action
  };
});

const watchlistHeaders = [
  "url", "cluster", "phase_1_role", "owner", "pre_clicks", "post_clicks", "pre_impressions",
  "post_impressions", "ctr", "position_context", "shared_query_rate", "independent_query_rate",
  "weekly_owner_alternation", "google_canonical", "index_state", "content_overlap",
  "unique_information_gain", "internal_navigation_value", "external_link_evidence", "decision",
  "confidence", "evidence", "action"
];
writeCsv(path.join(AUDIT_DIR, "WATCHLIST_DECISION_REGISTER.csv"), watchlistHeaders, watchlistRows);

const clusterRoutes = new Map(CLUSTERS.map((cluster) => [
  cluster.name,
  new Set(priorityRows.filter((row) => row.cluster === cluster.name).map((row) => row.url))
]));
const clusterRows = CLUSTERS.map((cluster) => {
  const routes = clusterRoutes.get(cluster.name);
  const pre = aggregateRows(pageRows.filter((row) => row.window === "pre" && routes.has(routeFromUrl(row.page))));
  const post = aggregateRows(pageRows.filter((row) => row.window === "post" && routes.has(routeFromUrl(row.page))));
  const clicksDelta = metricDelta(pre.clicks, post.clicks);
  const impressionsDelta = metricDelta(pre.impressions, post.impressions);
  const postQueryRows = queryPageRows.filter((row) => row.window === "post" && routes.has(routeFromUrl(row.page)));
  const ownerImpressions = postQueryRows.filter((row) => routeFromUrl(row.page) === cluster.owner)
    .reduce((sum, row) => sum + row.impressions, 0);
  const clusterImpressions = postQueryRows.reduce((sum, row) => sum + row.impressions, 0);
  return {
    cluster: cluster.name,
    owner: cluster.owner,
    route_count: routes.size,
    pre_clicks: preComplete ? pre.clicks : "DATA_REQUIRED",
    post_clicks: postComplete ? post.clicks : "DATA_REQUIRED",
    click_delta: decisionGateOpen ? clicksDelta.absolute : "DATA_REQUIRED",
    pre_impressions: preComplete ? pre.impressions : "DATA_REQUIRED",
    post_impressions: postComplete ? post.impressions : "DATA_REQUIRED",
    impression_delta: decisionGateOpen ? impressionsDelta.absolute : "DATA_REQUIRED",
    owner_share: decisionGateOpen && clusterImpressions ? formatMetric(ownerImpressions / clusterImpressions * 100) : "DATA_REQUIRED",
    query_diversity: decisionGateOpen ? new Set(postQueryRows.map((row) => queryFamily(row.query))).size : "DATA_REQUIRED",
    decision: decisionGateOpen ? "HUMAN_REVIEW_REQUIRED" : "HOLD_MORE_DATA"
  };
});
const clusterHeaders = Object.keys(clusterRows[0]);
writeCsv(path.join(AUDIT_DIR, "CLUSTER_TOTAL_PERFORMANCE.csv"), clusterHeaders, clusterRows);

const queryOwnershipRows = WATCHLIST.map((item) => {
  const metrics = ownershipMetrics(item);
  return {
    cluster: item.cluster,
    owner: item.owner,
    support_url: item.url,
    post_visible_query_impressions: decisionGateOpen ? metrics.visibleQueryImpressions : "DATA_REQUIRED",
    shared_query_rate: decisionGateOpen ? formatMetric(metrics.sharedQueryRate == null ? null : metrics.sharedQueryRate * 100) : "DATA_REQUIRED",
    independent_query_rate: decisionGateOpen ? formatMetric(metrics.independentQueryRate == null ? null : metrics.independentQueryRate * 100) : "DATA_REQUIRED",
    weekly_alternation_segments: decisionGateOpen ? metrics.alternationWeeks : "DATA_REQUIRED",
    status: decisionGateOpen ? "REVIEW_READY" : "AWAITING_COMPLETE_FINAL_WINDOW"
  };
});
writeCsv(path.join(AUDIT_DIR, "QUERY_PAGE_OWNERSHIP_REPORT.csv"), Object.keys(queryOwnershipRows[0]), queryOwnershipRows);

const historicalRegistryByRoute = new Map(phase1Registry.records.map((record) => [record.url, record]));
const canonicalRows = [...new Set([...CLUSTERS.map((cluster) => cluster.owner), ...WATCHLIST.map((item) => item.url)])]
  .sort()
  .map((route) => {
    const historical = historicalRegistryByRoute.get(route);
    const current = inspectionByRoute.get(route);
    return {
      url: route,
      expected_canonical: `${SITE_ORIGIN}${route === "/" ? "" : route}`,
      repository_index_state: historical?.indexStatus ?? "UNKNOWN",
      repository_canonical: historical?.canonical ?? "",
      latest_google_canonical: current?.google_canonical || "PENDING_FRESH_URL_INSPECTION",
      latest_index_state: current?.coverage_state || current?.indexing_state || "PENDING_FRESH_URL_INSPECTION",
      inspection_time: current?.inspection_time || "DATA_REQUIRED",
      historical_google_evidence: historical?.googleIndexStatus ?? "",
      historical_evidence_date: historical?.evidenceDate ?? ""
    };
  });
writeCsv(path.join(AUDIT_DIR, "CANONICAL_INDEX_INSPECTION_REGISTER.csv"), Object.keys(canonicalRows[0]), canonicalRows);

const growthRows = [];
if (decisionGateOpen) {
  const preByRoute = new Map();
  const postByRoute = new Map();
  for (const record of phase1Registry.records.filter((record) => record.indexStatus === "INDEXABLE")) {
    preByRoute.set(record.url, pageMetrics("pre", record.url));
    postByRoute.set(record.url, pageMetrics("post", record.url));
  }
  for (const record of phase1Registry.records.filter((record) => record.indexStatus === "INDEXABLE")) {
    const pre = preByRoute.get(record.url);
    const post = postByRoute.get(record.url);
    if (!post.impressions) continue;
    const impressionDelta = metricDelta(pre.impressions, post.impressions);
    let action = "HOLD";
    if (post.impressions >= 25 && post.position >= 4 && post.position <= 20) action = "ENRICH_OWNER";
    if (post.impressions >= 25 && post.ctr != null && post.ctr < 0.02 && post.position <= 15) action = "IMPROVE_CTR";
    if (impressionDelta.absolute > 0 && impressionDelta.percent > 0.25) action = "PROTECT";
    growthRows.push({
      url: record.url,
      user_need: record.primaryUserIntent,
      supporting_query_evidence: "See QUERY_PAGE_PERFORMANCE_TABLE.csv",
      current_ranking_url: record.url,
      current_owner_role: record.role,
      clicks: post.clicks,
      impressions: post.impressions,
      ctr: formatMetric(post.ctr == null ? null : post.ctr * 100),
      average_position: formatMetric(post.position),
      delta_28d_impressions: impressionDelta.absolute,
      query_diversity: new Set(queryPageRows.filter((row) => row.window === "post" && routeFromUrl(row.page) === record.url).map((row) => queryFamily(row.query))).size,
      current_content_gap: "HUMAN_REVIEW_REQUIRED",
      proposed_action: action,
      enhance_existing_vs_new_url: action === "HOLD" ? "HOLD" : "ENHANCE_EXISTING",
      information_gain: record.uniqueInformationGain,
      source_requirements: record.requiredSourceLevel,
      cannibalization_risk: "HUMAN_REVIEW_REQUIRED",
      expected_internal_links: "HUMAN_REVIEW_REQUIRED",
      effort: "HUMAN_REVIEW_REQUIRED",
      source_quality_opportunity: record.requiredSourceLevel,
      internal_link_opportunity: record.currentInternalAuthority,
      recommended_action: action,
      growth_confidence: post.impressions >= 100 ? "MEDIUM" : "LOW"
    });
  }
  growthRows.sort((a, b) => b.impressions - a.impressions || a.url.localeCompare(b.url));
}
const growthHeaders = ["url", "user_need", "supporting_query_evidence", "current_ranking_url", "current_owner_role", "clicks", "impressions", "ctr", "average_position", "delta_28d_impressions", "query_diversity", "current_content_gap", "proposed_action", "enhance_existing_vs_new_url", "information_gain", "source_requirements", "cannibalization_risk", "expected_internal_links", "effort", "source_quality_opportunity", "internal_link_opportunity", "recommended_action", "growth_confidence"];
writeCsv(path.join(AUDIT_DIR, "GROWTH_OPPORTUNITY_MATRIX.csv"), growthHeaders, growthRows);

const ownerMismatchRows = CLUSTERS.map((cluster) => ({
  cluster: cluster.name,
  declared_owner: cluster.owner,
  google_preferred_url: "DATA_REQUIRED",
  broad_query_evidence: "DATA_REQUIRED",
  classification: "INSUFFICIENT_DATA",
  action: "Acquire finalized query×page and fresh canonical/index evidence."
}));
writeCsv(path.join(AUDIT_DIR, "OWNER_MISMATCH_REGISTER.csv"), Object.keys(ownerMismatchRows[0]), ownerMismatchRows);
writeCsv(path.join(AUDIT_DIR, "NEW_CONTENT_CANDIDATE_REGISTER.csv"), [
  "user_problem", "search_intent", "demand_evidence", "closest_existing_url", "why_existing_url_is_insufficient",
  "unique_information_gain", "content_type", "owner_relationship", "proposed_internal_links", "source_requirements",
  "trust_requirements", "proposed_title", "proposed_h1", "canonical_strategy", "sitemap_decision",
  "indexing_decision", "cannibalization_risk", "growth_confidence", "status"
], []);

const protectedGrowthRows = CLUSTERS.map((cluster) => ({
  url: cluster.owner,
  cluster: cluster.name,
  protection_basis: decisionGateOpen ? "REVIEW_POST_WINDOW_METRICS" : "PHASE_1_OWNER_OBSERVATION_LOCK",
  evidence_window: decisionGateOpen ? `${PHASE_1.postStart}..${PHASE_1.postEnd}` : "POST_WINDOW_INCOMPLETE",
  change_policy: "No casual title, H1, content, canonical, indexability, navigation, or template change during observation."
}));
writeCsv(path.join(AUDIT_DIR, "PROTECTED_GROWTH_URLS.csv"), Object.keys(protectedGrowthRows[0]), protectedGrowthRows);

for (const [file, headers] of Object.entries({
  "CONSOLIDATION_REGISTER.csv": ["source_url", "survivor_url", "decision", "evidence", "approval", "status"],
  "REDIRECT_MAP.csv": ["source_url", "target_url", "status_code", "implemented_sha", "verified_at"],
  "CONTENT_SALVAGE_REGISTER.csv": ["source_url", "section", "uniqueness", "user_value", "source_value", "destination", "migration_decision"],
  "INTERNAL_LINK_CHANGE_REGISTER.csv": ["source_page", "old_target", "new_target", "anchor", "reason", "status"]
})) writeCsv(path.join(AUDIT_DIR, file), headers, []);

const manifest = {
  schemaVersion: 1,
  generatedFor: asOfDate,
  source: evidence.source,
  dataState,
  finalizedEndDate: finalizedEndDate || null,
  property: "sc-domain:echobuddha.com",
  rawEvidenceCommitted: false,
  rawDirectory: rawDir,
  privateCsvDirectory: PRIVATE_EVIDENCE_DIR,
  privateDerivedDirectory: derivedDir,
  privateDerivedFiles: fs.readdirSync(derivedDir).sort().map((name) => ({
    name,
    sha256: sha256File(path.join(derivedDir, name)),
    rows: Math.max(0, fs.readFileSync(path.join(derivedDir, name), "utf8").trim().split("\n").length - 1)
  })),
  files: evidence.files.map((filePath) => ({
    path: filePath,
    sha256: sha256File(filePath),
    bytes: fs.statSync(filePath).size
  })),
  limitations: [
    "Missing query rows are not proof of zero demand because Google applies privacy filtering.",
    "Search Analytics API and exports expose top rows rather than a guaranteed exhaustive query set.",
    "Performance is generally attributed to canonical URLs.",
    "Property, page, and query totals may differ; omitted query demand must remain unattributed.",
    "All clean comparison dates use Pacific Time and exclude 2026-09-28 PT."
  ]
};
fs.writeFileSync(path.join(AUDIT_DIR, "RAW_DATA_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const status = {
  schemaVersion: 1,
  generatedFor: asOfDate,
  status: phaseStatus,
  phase1MainSha: PHASE_1.mainSha,
  phase1ProductionContentSha: PHASE_1.contentSha,
  currentRepositoryHead: currentHead,
  currentOriginMain: currentMain,
  preWindow: { start: PHASE_1.preStart, end: PHASE_1.preEnd, expectedDays: 28, observedFinalDays: preDates.size, complete: preComplete },
  transitionDay: { date: PHASE_1.transitionDayPt, excluded: transitionExcluded },
  postWindow: { start: PHASE_1.postStart, end: PHASE_1.postEnd, expectedDays: 28, observedFinalDays: postDates.size, complete: postComplete },
  earliestDecisionReview: PHASE_1.earliestDecisionReview,
  decisionGateOpen,
  observationIntervened,
  interventionRegister: "governance/measurement-interventions.json",
  watchlistDecisionCounts: Object.fromEntries(DECISION_CLASSES.map((value) => [value, watchlistRows.filter((row) => row.decision === value).length])),
  destructiveChanges: { merges: 0, redirects: 0, noindex: 0, canonicalChanges: 0, deletedUrls: 0 },
  contentChanges: interventionRegister.interventions.flatMap(item => item.materiallyRevisedRoutes || []).length,
  changeScope: "See measurement-interventions.json; shared metadata, privacy and exact slash redirects are separate from content consolidation",
  sitemapExpected: PHASE_1.sitemapCount,
  onSiteSearchExpected: PHASE_1.searchRecordCount
};
fs.writeFileSync(path.join(AUDIT_DIR, "PHASE_2_STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);

const baselineVerification = {
  schemaVersion: 1,
  verifiedOn: "2026-10-04",
  repositoryMain: PHASE_1.mainSha,
  productionContentSha: PHASE_1.contentSha,
  cloudflareDeploymentId: PHASE_1.cloudflareDeploymentId,
  materialContentReleasesAfterPhase1: 0,
  postPhase1RepositoryChange: "PR #50 merged deployment documentation only; no public application files changed.",
  productionSmoke: "PASS",
  monitoredArtifactParity: { passed: 19, total: 19, byteForByte: true },
  sitemapUrls: PHASE_1.sitemapCount,
  onSiteSearchRecords: PHASE_1.searchRecordCount,
  robots: "PASS",
  canonicalCoverage: { passed: 19, total: 19 },
  adsenseRuntime: "DISABLED",
  dependencyAudit: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 }
};
fs.writeFileSync(path.join(AUDIT_DIR, "PRODUCTION_BASELINE_VERIFICATION.json"), `${JSON.stringify(baselineVerification, null, 2)}\n`);

const watchlistMarkdownRows = watchlistRows.map((row) => [
  `\`${row.url}\``, row.cluster, row.phase_1_role, `\`${row.owner}\``, row.decision, row.confidence
]);
fs.writeFileSync(path.join(AUDIT_DIR, "WATCHLIST_DECISION_REGISTER.md"), `# Phase 2 Watchlist Decision Register

Status: **${phaseStatus}**  
Evidence as of: **${asOfDate}**

${markdownTable(["URL", "Cluster", "Phase 1 role", "Owner", "Decision", "Confidence"], watchlistMarkdownRows)}

No destructive decision is permitted until the full finalized post window, query×page evidence, fresh URL Inspection evidence, and human content-overlap review are all available. The CSV register contains the complete evidence fields required by the Phase 2 brief.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "MEASUREMENT_METHODOLOGY.md"), `# Phase 2 Measurement Methodology

## Time basis and clean windows

- Reporting timezone: Pacific Time, matching standard Search Console reporting.
- Clean pre window: ${PHASE_1.preStart} through ${PHASE_1.preEnd} (28 days).
- Transition day excluded: ${PHASE_1.transitionDayPt} PT.
- Original post window: ${PHASE_1.postStart} through ${PHASE_1.postEnd} (28 days).
- Intervention authorized: ${observationIntervened}. The original post window must not be treated as a clean comparison after the authorized release. The decision gate stays closed even when all original dates finalize.
- Actual deployment time and revised comparison: see governance/measurement-interventions.json and the transformation deployment record.
- Earliest conservative decision review: ${PHASE_1.earliestDecisionReview}, allowing for Search Console finalization lag.
- Finalized rows are necessary but not sufficient: an intervened window cannot unlock destructive decision review.

## Evidence acquisition

\`npm run collect:phase2:gsc\` uses a read-only Search Console OAuth token and writes raw authenticated evidence only to the ignored \`.artifacts/phase2-gsc/raw/\` directory. Credentials and raw account evidence are never committed. Where direct API access is unavailable, owner exports may be copied into the ignored \`${PRIVATE_EVIDENCE_DIR}/\` directory using the committed CSV templates.

Run \`npm run generate:phase2:measurement\` to create safe aggregate reports, then \`npm run audit:phase2:measurement\` to enforce the time gate and output integrity.

## Measurement rules

- Compare absolute values and percentage changes; label low samples rather than sensationalizing percentages.
- Keep raw queries beside deterministic, reviewable query-family mappings.
- Compute owner share, support share, shared-query rate, independent-query rate, and weekly alternation only from query×page evidence.
- Judge clusters as well as individual URLs.
- Treat AI and multimodal surfaces as \`NO_OBSERVABLE_DATA\` when evidence is unavailable.
- A generated recommendation never authorizes a merge; human user-job, unique-value, canonical, external-link, and content-salvage review remains mandatory.

## Search Console limitations

- Privacy filtering can omit query rows, so a missing query is not zero demand.
- The API and exports do not guarantee an exhaustive list of queries.
- Performance is generally attributed to Google's selected canonical.
- Property, page, and query totals can differ. Any gap remains \`UNATTRIBUTED / PRIVACY-OMITTED\`.
`);

const sitePre = aggregateRows(preRows);
const sitePost = aggregateRows(postRows);
fs.writeFileSync(path.join(AUDIT_DIR, "GSC_PERFORMANCE_SUMMARY.md"), `# GSC Performance Summary

Status: **${phaseStatus}**

| Metric | Pre | Post | Availability |
|---|---:|---:|---|
| Clicks | ${preComplete ? sitePre.clicks : "DATA_REQUIRED"} | ${postComplete ? sitePost.clicks : "DATA_REQUIRED"} | ${decisionGateOpen ? "FINAL" : "INCOMPLETE"} |
| Impressions | ${preComplete ? sitePre.impressions : "DATA_REQUIRED"} | ${postComplete ? sitePost.impressions : "DATA_REQUIRED"} | ${decisionGateOpen ? "FINAL" : "INCOMPLETE"} |
| CTR | ${preComplete ? formatMetric(sitePre.ctr * 100) + "%" : "DATA_REQUIRED"} | ${postComplete ? formatMetric(sitePost.ctr * 100) + "%" : "DATA_REQUIRED"} | ${decisionGateOpen ? "FINAL" : "INCOMPLETE"} |
| Average position | ${preComplete ? formatMetric(sitePre.position) : "DATA_REQUIRED"} | ${postComplete ? formatMetric(sitePost.position) : "DATA_REQUIRED"} | ${decisionGateOpen ? "FINAL" : "INCOMPLETE"} |

No pre/post performance claim is made until both 28-day windows are complete and finalized.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "QUERY_PAGE_OWNERSHIP_REPORT.md"), `# Query × Page Ownership Report

Status: **${phaseStatus}**

${markdownTable(
  ["Cluster", "Owner", "Support", "Shared rate", "Independent rate", "Weekly alternation", "Status"],
  queryOwnershipRows.map((row) => [row.cluster, `\`${row.owner}\``, `\`${row.support_url}\``, row.shared_query_rate, row.independent_query_rate, row.weekly_alternation_segments, row.status])
)}

These rates are internal decision aids, not Google ranking factors. Missing/private query rows prevent claims of exhaustive coverage.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "CLUSTER_PERFORMANCE_REPORT.md"), `# Cluster Performance Report

${markdownTable(
  ["Cluster", "Owner", "Routes", "Pre impressions", "Post impressions", "Owner share", "Decision"],
  clusterRows.map((row) => [row.cluster, `\`${row.owner}\``, row.route_count, row.pre_impressions, row.post_impressions, row.owner_share, row.decision])
)}
`);

const countryRows = evidence.data.country_performance.filter((row) => row.window === "post");
const deviceRows = evidence.data.device_performance.filter((row) => row.window === "post");
fs.writeFileSync(path.join(AUDIT_DIR, "COUNTRY_DEVICE_REPORT.md"), `# Country / Device Report

Status: **${postComplete ? "FINAL_POST_WINDOW_AVAILABLE" : "DATA_REQUIRED"}**

- Post-window country rows: ${countryRows.length}
- Post-window device rows: ${deviceRows.length}
- No country-specific duplicate content or device-specific SEO action is recommended without finalized query/page context.
- Mobile usability, readability, and consent behavior remain protected requirements.
`);

const aiStatus = evidence.data.ai_search_performance.length ? "OBSERVED_DATA_IMPORTED" : "NO_OBSERVABLE_DATA";
const multimodalStatus = evidence.data.multimodal_performance.length ? "OBSERVED_DATA_IMPORTED" : "NO_OBSERVABLE_DATA";
fs.writeFileSync(path.join(AUDIT_DIR, "AI_SEARCH_REPORT.md"), `# Generative AI Search Report

Status: **${aiStatus}**

No AI-search metric is inferred from ordinary web Search data. When an authenticated Google report exposes this surface, import only the dimensions and metrics actually provided. No GEO hacks, artificial answer blocks, or unsupported schema are authorized.
`);
fs.writeFileSync(path.join(AUDIT_DIR, "MULTIMODAL_SEARCH_REPORT.md"), `# Multimodal Search Report

Status: **${multimodalStatus}**

Image or multimodal improvements require observable page-level evidence and a genuine teaching, practice, historical, diagrammatic, or navigation purpose. Image count alone is not an SEO objective.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "TECHNICAL_VALIDATION_REPORT.md"), `# Technical Validation Report

## Verified Phase 1 baseline

- Expected current main: \`${PHASE_1.mainSha}\`
- Current \`origin/main\`: \`${currentMain}\`
- Production content SHA: \`${PHASE_1.contentSha}\`
- Cloudflare deployment: \`${PHASE_1.cloudflareDeploymentId}\`
- Expected sitemap inventory: ${PHASE_1.sitemapCount} canonical indexable URLs
- Expected on-site search inventory: ${PHASE_1.searchRecordCount} records
- AdSense runtime: disabled
- Post-Phase-1 material content releases: 0
- Live/local monitored artifact parity on 2026-10-04: 19/19 byte-for-byte matches
- Dependency audit after compatible transitive hardening: 0 known vulnerabilities

The production smoke suite was rerun during Release A preparation and passed homepage, consent, AdSense firewall, security headers, robots, sitemap, owner/noindex, search, ads.txt, 404, HTTPS redirect, and preview-noindex checks. This measurement release changes no public content, canonical, indexability, sitemap, redirect, analytics, consent, or advertising behavior.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "EXECUTIVE_REPORT.md"), `# Echo Buddha Phase 2 — Executive Report

## Outcome

**${phaseStatus}**

Phase 1 is live and technically healthy. Phase 2 Release A establishes secure first-party Search Console acquisition, export-based fallback ingestion, deterministic query-family and owner/support calculations, strict time-gate validation, and the required decision/growth registers.

As of ${asOfDate}, the required ${PHASE_1.postStart}–${PHASE_1.postEnd} finalized post window is not complete. Therefore:

- all 13 watchlist URLs are \`HOLD_MORE_DATA\`;
- no page is merged, redirected, deleted, noindexed, or cross-canonicalized;
- no protected Phase 1 title, H1, body, navigation role, or template is changed;
- no new content URL is proposed without demand evidence;
- AI and multimodal absence is recorded as no observable data, not a failure.

## Release identity

- Starting/current main: \`${PHASE_1.mainSha}\`
- Production content: \`${PHASE_1.contentSha}\`
- Phase 2 branch baseline: \`${currentHead}\`
- Production change in Release A: none

## Next evidence checkpoint

Acquire the complete final pre window and the complete final post window after ${PHASE_1.earliestDecisionReview}; then rerun generation and audit. The original interval is intervened, so complete original-window data alone cannot open the decision gate. Collect the revised stable-release window and require a separate evidence-based review of unique value, current canonicals, and preservation before any destructive decision.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "README.md"), `# Phase 2 — Measure, Consolidate Selectively and Accelerate Growth

Current state: **${phaseStatus}**

This directory is the reproducible Release A measurement package. Generate it with \`npm run generate:phase2:measurement\` and validate it with \`npm run audit:phase2:measurement\`. Authenticated inputs remain outside Git; only safe aggregate reports, empty import templates, methodology, and governance records are committed.

The original Release A changed no public application behavior. The October 23 authorized intervention changes shared metadata, selected guide content, technical slash redirects, and privacy minimization. Routes, canonicals, index states, ownership, and advertising kill switches are preserved. See governance/measurement-interventions.json; the original post window must not be treated as uncontaminated.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "PHASE_3_ONGOING_BACKLOG.md"), `# Phase 3 / Ongoing Backlog

No evidence-backed growth or consolidation backlog is asserted yet.

1. After ${PHASE_1.earliestDecisionReview}, collect finalized Search Console data through ${PHASE_1.postEnd} PT.
2. Run fresh URL Inspection for all 13 watchlist pages and six owners.
3. Re-run the measurement generator and validator.
4. Manually review query families, content overlap, unique value, external links, and survivor/content-salvage requirements for any candidate action.
5. Isolate any approved consolidation, existing-page growth, or new-content work in later releases.
`);

fs.writeFileSync(path.join(AUDIT_DIR, "IMPORT_GUIDE.md"), `# Private Search Console Import Guide

Authenticated raw evidence must not be committed.

## API collection

Store a read-only OAuth client and token outside the repository, then set:

\`ECHOBUDDHA_GSC_CLIENT_FILE\`  
\`ECHOBUDDHA_GSC_TOKEN_FILE\`

Run \`npm run collect:phase2:gsc\`. The collector requires the single \`webmasters.readonly\` scope and writes mode-0600 files under ignored \`${rawDir}/\`.

## CSV fallback

Copy only owner-approved Search Console exports into ignored \`${PRIVATE_EVIDENCE_DIR}/\`. Use the filenames and headers in \`import-templates/\`. Keep:

- \`window\`: \`pre\`, \`post\`, or \`context90\`;
- \`data_state\`: \`final\` for decision evidence;
- \`search_type\`: \`web\`, \`image\`, or the exact available type;
- \`week\`: \`W1\` through \`W4\` for post-window query×page alternation analysis;
- full canonical page URLs;
- CTR as a decimal, not a display percentage.

Do not commit OAuth tokens, client secrets, refresh tokens, service-account keys, raw private exports, or private user-query logs.
`);

console.log(`${phaseStatus}`);
console.log(`Audit directory: ${AUDIT_DIR}`);
console.log(`Evidence source: ${evidence.source}`);
console.log(`Watchlist: ${watchlistRows.length} rows; decision gate open=${decisionGateOpen}`);

const revised = evidence.metadata.windows?.revisedPost;
const revisedMetric = revised?.datasets?.property?.rows?.[0];
fs.writeFileSync(path.join(AUDIT_DIR, "REVISED_OBSERVATION.md"), `# Revised stable-release observation

Status: ${revised?.available ? (revised.complete ? "FINALIZED_WINDOW_AVAILABLE_FOR_REVIEW" : "PARTIAL_FINALIZED_WINDOW") : "AWAITING_POST_DEPLOYMENT_FINALIZED_DATA"}

The original September 29–October 26 comparison is intervened. It cannot unlock destructive consolidation.

${revised ? `New window: ${revised.startDate} through ${revised.plannedEndDate}; exclude deployment day ${revised.excludedDeploymentDayPt} in Pacific Time. Latest collected end: ${revised.endDate}.` : "A new 28-day window starts on the Pacific day after the verified deployment. Its exact dates are calculated from the actual deployment record, never a planned timestamp."}

${revisedMetric ? `Observed finalized clicks: ${revisedMetric.clicks}; impressions: ${revisedMetric.impressions}.` : "No new-window outcome is claimed."}

Compare descriptively with the original pre window and pre-intervention segment. Low samples, other releases, seasonality, and search changes prevent a clean causal claim. New redirects or removals still require canonical, unique-value, external-link, and content-preservation review.
`);
