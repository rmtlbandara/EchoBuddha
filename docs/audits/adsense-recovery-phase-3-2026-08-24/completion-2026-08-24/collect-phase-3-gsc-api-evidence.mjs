import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const phaseDir = path.dirname(outDir);
const sourceDir = path.join(phaseDir, "source-evidence/completion-2026-08-24/api");
const property = "sc-domain:echobuddha.com";
const requiredScope = "https://www.googleapis.com/auth/webmasters.readonly";
const clientPath = process.env.ECHOBUDDHA_GSC_CLIENT_FILE;
const tokenPath = process.env.ECHOBUDDHA_GSC_TOKEN_FILE;
const mode = process.argv[2] || "all";

if (!clientPath || !tokenPath) throw new Error("Set ECHOBUDDHA_GSC_CLIENT_FILE and ECHOBUDDHA_GSC_TOKEN_FILE.");
if (!["all", "analytics", "inspection"].includes(mode)) throw new Error(`Unknown mode: ${mode}`);

fs.mkdirSync(sourceDir, { recursive: true });

const clientDoc = JSON.parse(fs.readFileSync(clientPath, "utf8"));
const client = clientDoc.installed ?? clientDoc.web;
const storedToken = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
if (!client?.client_id || !client?.client_secret) throw new Error("OAuth client is incomplete.");
if (!storedToken.refresh_token && !storedToken.access_token) throw new Error("OAuth token is incomplete.");
const scopes = String(storedToken.scope || requiredScope).split(/\s+/).filter(Boolean);
if (scopes.length !== 1 || scopes[0] !== requiredScope) throw new Error("OAuth token is not restricted to webmasters.readonly.");

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

const readCsv = (name) => parseCsv(fs.readFileSync(path.join(phaseDir, name), "utf8"));
const registry = readCsv("ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv");
if (registry.length !== 340 || new Set(registry.map((row) => row.URL)).size !== 340) throw new Error("Current inventory is not exactly 340 unique URLs.");

let accessToken = storedToken.access_token || "";
let accessTokenExpiresAt = Number(storedToken.expiry_date || 0);
async function refreshAccessToken(force = false) {
  if (!force && accessToken && Date.now() + 60_000 < accessTokenExpiresAt) return accessToken;
  if (!storedToken.refresh_token) return accessToken;
  const body = new URLSearchParams({
    client_id: client.client_id,
    client_secret: client.client_secret,
    refresh_token: storedToken.refresh_token,
    grant_type: "refresh_token"
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) throw new Error(`OAuth refresh failed with HTTP ${response.status}.`);
  const bodyJson = await response.json();
  accessToken = bodyJson.access_token;
  accessTokenExpiresAt = Date.now() + Number(bodyJson.expires_in || 3600) * 1000;
  return accessToken;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function apiFetch(url, options = {}, attempt = 0) {
  const token = await refreshAccessToken(attempt > 0);
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), authorization: `Bearer ${token}` }
  });
  if (response.status === 401 && attempt === 0) return apiFetch(url, options, 1);
  if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 5) {
    await delay(Math.min(30_000, 1000 * 2 ** attempt));
    return apiFetch(url, options, attempt + 1);
  }
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { parse_error: true }; }
  return { ok: response.ok, status: response.status, body };
}

const analyticsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
async function analyticsQuery(request) {
  const response = await apiFetch(analyticsUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error(`Search Analytics failed with HTTP ${response.status}: ${response.body?.error?.status || "UNKNOWN"}`);
  return response.body;
}

async function pagedAnalytics(baseRequest) {
  const rows = [];
  const pageSize = 25_000;
  let startRow = 0;
  let aggregationType = "";
  for (;;) {
    const result = await analyticsQuery({ ...baseRequest, rowLimit: pageSize, startRow });
    const batch = result.rows ?? [];
    aggregationType ||= result.responseAggregationType || "";
    rows.push(...batch);
    if (batch.length < pageSize) break;
    startRow += pageSize;
  }
  return { rows, responseAggregationType: aggregationType };
}

function isoOffset(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function collectTargetUrls() {
  const urls = new Set(registry.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.protection_tier)).map((row) => row.URL));
  for (const row of readCsv("ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv")) urls.add(row.URL);
  for (const row of readCsv("ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv")) {
    if (["DO_NOT_CHANGE_YET", "HIGH_RISK_REVIEW_REQUIRED"].includes(row.phase_4_readiness)) urls.add(row.URL);
  }
  for (const row of readCsv("ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv")) {
    urls.add(row.provisional_survivor_candidate);
    for (const url of String(row.member_urls).split(/\s*\|\s*/).filter((value) => value.startsWith("https://"))) urls.add(url);
  }
  for (const row of readCsv("ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv")) {
    urls.add(row.source_url);
    urls.add(row.target_url);
  }
  const inventory = new Set(registry.map((row) => row.URL));
  return [...urls].filter((url) => inventory.has(url)).sort();
}

async function collectAnalytics() {
  const analyticsOutputPath = path.join(sourceDir, "search-analytics-evidence.json");
  const priorEvidence = fs.existsSync(analyticsOutputPath) ? JSON.parse(fs.readFileSync(analyticsOutputPath, "utf8")) : null;
  const latestDates = await pagedAnalytics({
    startDate: isoOffset(new Date().toISOString().slice(0, 10), -21),
    endDate: new Date().toISOString().slice(0, 10),
    dimensions: ["date"],
    type: "web",
    dataState: "final"
  });
  const dates = latestDates.rows.map((row) => row.keys?.[0]).filter(Boolean).sort();
  const finalizedEnd = dates.at(-1);
  if (!finalizedEnd) throw new Error("Search Analytics returned no finalized dates.");
  const windows = {
    recovery: { startDate: "2026-06-23", endDate: finalizedEnd },
    latest28: { startDate: isoOffset(finalizedEnd, -27), endDate: finalizedEnd },
    previous28: { startDate: isoOffset(finalizedEnd, -55), endDate: isoOffset(finalizedEnd, -28) }
  };
  const evidence = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    property,
    scope: requiredScope,
    data_state: "final",
    limitations: [
      "Search Analytics API returns top rows rather than guaranteeing every possible row.",
      "Query privacy/anonymization can cause query-dimension totals to be lower than property or page totals."
    ],
    finalized_end_date: finalizedEnd,
    windows,
    latest_final_date_probe: { request: { dimensions: ["date"], dataState: "final" }, row_count: latestDates.rows.length },
    sitewide: {},
    page_filtered_queries: { target_selection: "P0/P1 + high-equity/low-value + DO_NOT_CHANGE_YET/HIGH_RISK + survivor/mapping members", targets: [] }
  };

  for (const [windowName, window] of Object.entries(windows)) {
    const common = { ...window, type: "web", dataState: "final" };
    const [propertyTotals, queries, pages, queryPages] = await Promise.all([
      pagedAnalytics(common),
      pagedAnalytics({ ...common, dimensions: ["query"] }),
      pagedAnalytics({ ...common, dimensions: ["page"], aggregationType: "byPage" }),
      pagedAnalytics({ ...common, dimensions: ["query", "page"], aggregationType: "byPage" })
    ]);
    evidence.sitewide[windowName] = {
      request: common,
      property: { row_count: propertyTotals.rows.length, response_aggregation_type: propertyTotals.responseAggregationType, rows: propertyTotals.rows },
      queries: { row_count: queries.rows.length, response_aggregation_type: queries.responseAggregationType, rows: queries.rows },
      pages: { row_count: pages.rows.length, response_aggregation_type: pages.responseAggregationType, rows: pages.rows },
      query_pages: { row_count: queryPages.rows.length, response_aggregation_type: queryPages.responseAggregationType, rows: queryPages.rows }
    };
    console.log(`Search Analytics ${windowName}: ${propertyTotals.rows.length} property row; ${queries.rows.length} query rows; ${pages.rows.length} page rows; ${queryPages.rows.length} query×page rows.`);
  }

  const targetUrls = collectTargetUrls();
  console.log(`Search Analytics page-filtered target URLs: ${targetUrls.length}.`);
  const reusableTargets = priorEvidence?.finalized_end_date === finalizedEnd
    ? new Map((priorEvidence.page_filtered_queries?.targets ?? []).map((target) => [target.page, target]))
    : new Map();
  for (let index = 0; index < targetUrls.length; index += 1) {
    const page = targetUrls[index];
    const reusable = reusableTargets.get(page);
    if (reusable && Object.keys(windows).every((windowName) => reusable.windows?.[windowName])) {
      evidence.page_filtered_queries.targets.push(reusable);
      continue;
    }
    const target = { page, windows: {} };
    for (const [windowName, window] of Object.entries(windows)) {
      const result = await pagedAnalytics({
        ...window,
        type: "web",
        dataState: "final",
        dimensions: ["query"],
        aggregationType: "byPage",
        dimensionFilterGroups: [{ groupType: "and", filters: [{ dimension: "page", operator: "equals", expression: page }] }]
      });
      target.windows[windowName] = { row_count: result.rows.length, response_aggregation_type: result.responseAggregationType, rows: result.rows };
    }
    evidence.page_filtered_queries.targets.push(target);
    if ((index + 1) % 25 === 0 || index + 1 === targetUrls.length) console.log(`Page-filtered query progress: ${index + 1}/${targetUrls.length}.`);
  }
  fs.writeFileSync(analyticsOutputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Search Analytics evidence stored: ${path.relative(phaseDir, analyticsOutputPath)}`);
}

async function collectInspection() {
  const outputPath = path.join(sourceDir, "url-inspection-evidence.json");
  let evidence = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    property,
    scope: requiredScope,
    inventory_count: registry.length,
    results: []
  };
  if (fs.existsSync(outputPath)) {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    if (existing.property === property && existing.inventory_count === registry.length) evidence = existing;
  }
  const completed = new Set(evidence.results.filter((row) => row.http_status === 200).map((row) => row.URL));
  const pending = registry.map((row) => row.URL).filter((URL) => !completed.has(URL));
  let pendingIndex = 0;
  let processed = completed.size;
  async function inspectWorker() {
    for (;;) {
      const currentIndex = pendingIndex;
      pendingIndex += 1;
      if (currentIndex >= pending.length) return;
      const URL = pending[currentIndex];
    const response = await apiFetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inspectionUrl: URL, siteUrl: property, languageCode: "en-US" })
    });
    const record = response.ok
      ? { URL, http_status: response.status, inspectionResult: response.body.inspectionResult ?? {} }
      : { URL, http_status: response.status, error: { code: response.body?.error?.code ?? response.status, status: response.body?.error?.status ?? "UNKNOWN", message: response.body?.error?.message ?? "Unspecified API error" } };
    evidence.results = evidence.results.filter((row) => row.URL !== URL);
    evidence.results.push(record);
    evidence.generated_at = new Date().toISOString();
    fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
      processed += 1;
      if (processed % 25 === 0 || processed === registry.length) console.log(`URL Inspection progress: ${processed}/${registry.length}.`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, pending.length) }, () => inspectWorker()));
  evidence.results.sort((a, b) => a.URL.localeCompare(b.URL));
  evidence.generated_at = new Date().toISOString();
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  const successes = evidence.results.filter((row) => row.http_status === 200).length;
  console.log(`URL Inspection evidence stored: ${successes}/${registry.length} successful.`);
}

if (mode === "all" || mode === "analytics") await collectAnalytics();
if (mode === "all" || mode === "inspection") await collectInspection();
