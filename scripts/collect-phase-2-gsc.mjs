import fs from "node:fs";
import path from "node:path";
import {
  CLUSTERS,
  GSC_PROPERTY,
  PHASE_1,
  WATCHLIST,
  isoDateOffset,
  resolveRawDir
} from "./phase-2-measurement-lib.mjs";

const READ_ONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const clientPath = process.env.ECHOBUDDHA_GSC_CLIENT_FILE;
const tokenPath = process.env.ECHOBUDDHA_GSC_TOKEN_FILE;
const outputDir = resolveRawDir();
const mode = process.argv[2] || "all";

if (!["all", "analytics", "inspection"].includes(mode)) {
  throw new Error("Usage: npm run collect:phase2:gsc -- [all|analytics|inspection]");
}
if (!clientPath || !tokenPath) {
  throw new Error(
    "Authenticated GSC collection requires ECHOBUDDHA_GSC_CLIENT_FILE and ECHOBUDDHA_GSC_TOKEN_FILE. " +
    "Keep both files outside the repository. For export-based ingestion, use the documented private-evidence CSV format instead."
  );
}

const clientDocument = JSON.parse(fs.readFileSync(clientPath, "utf8"));
const client = clientDocument.installed ?? clientDocument.web;
const storedToken = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
if (!client?.client_id || !client?.client_secret) throw new Error("OAuth client configuration is incomplete.");
if (!storedToken.refresh_token && !storedToken.access_token) throw new Error("OAuth token is incomplete.");
const tokenScopes = String(storedToken.scope || READ_ONLY_SCOPE).split(/\s+/).filter(Boolean);
if (tokenScopes.length !== 1 || tokenScopes[0] !== READ_ONLY_SCOPE) {
  throw new Error(`OAuth token must be restricted to ${READ_ONLY_SCOPE}.`);
}

fs.mkdirSync(outputDir, { recursive: true });

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
  const result = await response.json();
  accessToken = result.access_token;
  accessTokenExpiresAt = Date.now() + Number(result.expires_in || 3600) * 1000;
  return accessToken;
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function apiFetch(url, options = {}, attempt = 0) {
  const token = await refreshAccessToken(attempt > 0);
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30_000),
    headers: { ...(options.headers ?? {}), authorization: `Bearer ${token}` }
  });
  if (response.status === 401 && attempt === 0) return apiFetch(url, options, 1);
  if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 5) {
    await wait(Math.min(30_000, 1000 * 2 ** attempt));
    return apiFetch(url, options, attempt + 1);
  }
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { parseError: true, responseText: text.slice(0, 500) };
  }
  return { ok: response.ok, status: response.status, body };
}

const analyticsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`;

async function analyticsQuery(request) {
  const response = await apiFetch(analyticsUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    const status = response.body?.error?.status ?? "UNKNOWN";
    throw new Error(`Search Analytics failed with HTTP ${response.status}: ${status}`);
  }
  return response.body;
}

async function pagedAnalytics(request) {
  const rows = [];
  const pageSize = 25_000;
  let startRow = 0;
  let aggregationType = "";
  for (;;) {
    const result = await analyticsQuery({ ...request, rowLimit: pageSize, startRow });
    const batch = result.rows ?? [];
    rows.push(...batch);
    aggregationType ||= result.responseAggregationType || "";
    if (batch.length < pageSize) break;
    startRow += pageSize;
  }
  return { rowCount: rows.length, responseAggregationType: aggregationType, rows };
}

async function optionalPagedAnalytics(request) {
  try {
    return { available: true, ...(await pagedAnalytics(request)) };
  } catch (error) {
    return { available: false, rowCount: 0, rows: [], reason: String(error.message || error) };
  }
}

async function latestFinalizedDate() {
  const today = new Date().toISOString().slice(0, 10);
  const probe = await pagedAnalytics({
    startDate: isoDateOffset(today, -21),
    endDate: today,
    dimensions: ["date"],
    type: "web",
    dataState: "final"
  });
  return probe.rows.map((row) => row.keys?.[0]).filter(Boolean).sort().at(-1) ?? null;
}

function windowDefinitions(finalizedEndDate) {
  const definitions = {
    pre: { startDate: PHASE_1.preStart, endDate: PHASE_1.preEnd, complete: finalizedEndDate >= PHASE_1.preEnd },
    post: {
      startDate: PHASE_1.postStart,
      endDate: finalizedEndDate >= PHASE_1.postStart
        ? [finalizedEndDate, PHASE_1.postEnd].sort()[0]
        : PHASE_1.postStart,
      complete: finalizedEndDate >= PHASE_1.postEnd
    },
    context90: {
      startDate: isoDateOffset(finalizedEndDate, -89),
      endDate: finalizedEndDate,
      complete: true
    }
  };
  definitions.post.available = finalizedEndDate >= PHASE_1.postStart;
  const retentionStart = new Date(`${finalizedEndDate}T00:00:00Z`);
  retentionStart.setUTCMonth(retentionStart.getUTCMonth() - 16);
  definitions.history = { startDate: retentionStart.toISOString().slice(0, 10), endDate: finalizedEndDate, complete: true };
  const registerPath = "governance/measurement-interventions.json";
  if (fs.existsSync(registerPath)) {
    const deployed = JSON.parse(fs.readFileSync(registerPath, "utf8")).interventions
      .filter(item => item.productionDeployedAt).sort((a, b) => a.productionDeployedAt.localeCompare(b.productionDeployedAt)).at(-1);
    if (deployed) {
      const deploymentDayPt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(deployed.productionDeployedAt));
      const startDate = isoDateOffset(deploymentDayPt, 1);
      const plannedEndDate = isoDateOffset(startDate, 27);
      definitions.revisedPost = {
        startDate, endDate: finalizedEndDate >= startDate ? [finalizedEndDate, plannedEndDate].sort()[0] : startDate,
        plannedEndDate, excludedDeploymentDayPt: deploymentDayPt,
        available: finalizedEndDate >= startDate, complete: finalizedEndDate >= plannedEndDate
      };
    }
  }
  return definitions;
}

async function collectWindow(name, window, searchType = "web") {
  if (window.available === false) return { ...window, searchType, available: false, datasets: {} };
  const common = {
    startDate: window.startDate,
    endDate: window.endDate,
    type: searchType,
    dataState: "final"
  };
  const [property, daily, pages, queries, queryPages, countries, devices, appearance] = await Promise.all([
    pagedAnalytics(common),
    pagedAnalytics({ ...common, dimensions: ["date"] }),
    pagedAnalytics({ ...common, dimensions: ["page"], aggregationType: "byPage" }),
    pagedAnalytics({ ...common, dimensions: ["query"] }),
    pagedAnalytics({ ...common, dimensions: ["query", "page"], aggregationType: "byPage" }),
    pagedAnalytics({ ...common, dimensions: ["country"] }),
    pagedAnalytics({ ...common, dimensions: ["device"] }),
    optionalPagedAnalytics({ ...common, dimensions: ["searchAppearance"] })
  ]);
  const weeklyQueryPages = [];
  if (name === "post" && searchType === "web") {
    for (let weekIndex = 0; weekIndex < 4; weekIndex += 1) {
      const weekStart = isoDateOffset(PHASE_1.postStart, weekIndex * 7);
      const plannedWeekEnd = isoDateOffset(weekStart, 6);
      if (weekStart > window.endDate) continue;
      const weekEnd = [plannedWeekEnd, window.endDate].sort()[0];
      const result = await pagedAnalytics({
        startDate: weekStart,
        endDate: weekEnd,
        type: "web",
        dataState: "final",
        dimensions: ["query", "page"],
        aggregationType: "byPage"
      });
      weeklyQueryPages.push({ week: `W${weekIndex + 1}`, startDate: weekStart, endDate: weekEnd, ...result });
    }
  }
  return {
    ...window,
    searchType,
    available: true,
    request: common,
    datasets: { property, daily, pages, queries, queryPages, weeklyQueryPages, countries, devices, appearance }
  };
}

async function collectAnalytics() {
  const finalizedEndDate = await latestFinalizedDate();
  if (!finalizedEndDate) throw new Error("Search Console returned no finalized date.");
  const windows = windowDefinitions(finalizedEndDate);
  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    property: GSC_PROPERTY,
    scope: READ_ONLY_SCOPE,
    dataState: "final",
    timezone: "America/Los_Angeles",
    finalizedEndDate,
    transitionDayExcluded: PHASE_1.transitionDayPt,
    limitations: [
      "Search Analytics returns top rows and does not guarantee every possible query row.",
      "Privacy filtering can make query totals lower than property or page totals.",
      "Performance is generally attributed to Google's selected canonical URL.",
      "Property, page, and query totals must not be treated as interchangeable."
    ],
    windows: {},
    imageSearch: {}
  };
  for (const [name, window] of Object.entries(windows)) {
    output.windows[name] = await collectWindow(name, window, "web");
    output.imageSearch[name] = await collectWindow(name, window, "image");
    console.log(`${name}: web=${output.windows[name].available}; image=${output.imageSearch[name].available}`);
  }
  const outputPath = path.join(outputDir, "gsc-api-evidence.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, { mode: 0o600 });
  console.log(`Private analytics evidence written to ${outputPath}`);
}

async function collectInspection() {
  const monitored = [...new Set([
    ...CLUSTERS.map((cluster) => cluster.owner),
    ...WATCHLIST.map((item) => item.url)
  ])].map((route) => new URL(route, "https://echobuddha.com").toString()).sort();
  const results = [];
  for (let index = 0; index < monitored.length; index += 1) {
    const inspectionUrl = monitored[index];
    const response = await apiFetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inspectionUrl, siteUrl: GSC_PROPERTY, languageCode: "en-US" })
    });
    results.push(response.ok
      ? { inspectionUrl, httpStatus: response.status, inspectionResult: response.body.inspectionResult ?? {} }
      : {
          inspectionUrl,
          httpStatus: response.status,
          error: {
            code: response.body?.error?.code ?? response.status,
            status: response.body?.error?.status ?? "UNKNOWN",
            message: response.body?.error?.message ?? "Unspecified API error"
          }
        });
    console.log(`URL Inspection ${index + 1}/${monitored.length}`);
  }
  const outputPath = path.join(outputDir, "url-inspection-evidence.json");
  fs.writeFileSync(outputPath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    property: GSC_PROPERTY,
    scope: READ_ONLY_SCOPE,
    urlsRequested: monitored.length,
    results
  }, null, 2)}\n`, { mode: 0o600 });
  console.log(`Private inspection evidence written to ${outputPath}`);
}

if (mode === "all" || mode === "analytics") await collectAnalytics();
if (mode === "all" || mode === "inspection") await collectInspection();
