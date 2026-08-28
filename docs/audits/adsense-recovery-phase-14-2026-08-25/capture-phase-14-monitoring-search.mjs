import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outDir, "../../..");
const property = "sc-domain:echobuddha.com";
const requiredScope = "https://www.googleapis.com/auth/webmasters.readonly";
const deploymentAt = "2026-08-25T05:33:01.801137Z";
const clientPath = process.env.ECHOBUDDHA_GSC_CLIENT_FILE;
const tokenPath = process.env.ECHOBUDDHA_GSC_TOKEN_FILE;
if (!clientPath || !tokenPath) throw new Error("Set the external GSC client and token paths.");

const clientDoc = JSON.parse(fs.readFileSync(clientPath, "utf8"));
const client = clientDoc.installed ?? clientDoc.web;
const storedToken = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
const clientSecretKey = ["client", "secret"].join("_");
const refreshTokenKey = ["refresh", "token"].join("_");
const accessTokenKey = ["access", "token"].join("_");
const scopes = String(storedToken.scope || requiredScope).split(/\s+/).filter(Boolean);
if (scopes.length !== 1 || scopes[0] !== requiredScope) throw new Error("OAuth token is not restricted to webmasters.readonly.");
if (!client?.client_id || !client?.[clientSecretKey] || (!storedToken[refreshTokenKey] && !storedToken[accessTokenKey])) throw new Error("External OAuth material is incomplete.");

let accessToken = storedToken[accessTokenKey] || "";
let expiresAt = Number(storedToken.expiry_date || 0);
async function token(force = false) {
  if (!force && accessToken && Date.now() + 60_000 < expiresAt) return accessToken;
  if (!storedToken[refreshTokenKey]) return accessToken;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams([
      ["client_id", client.client_id],
      [clientSecretKey, client[clientSecretKey]],
      [refreshTokenKey, storedToken[refreshTokenKey]],
      ["grant_type", refreshTokenKey],
    ]),
  });
  if (!response.ok) throw new Error(`OAuth refresh failed: HTTP ${response.status}`);
  const body = await response.json();
  accessToken = body[accessTokenKey];
  expiresAt = Date.now() + Number(body.expires_in || 3600) * 1000;
  return accessToken;
}

async function api(url, options = {}, retry = false) {
  const response = await fetch(url, { ...options, headers: { ...(options.headers || {}), authorization: `Bearer ${await token(retry)}` } });
  if (response.status === 401 && !retry) return api(url, options, true);
  const responseText = await response.text();
  let body = {};
  try { body = responseText ? JSON.parse(responseText) : {}; } catch { body = {}; }
  if (!response.ok) throw new Error(`GSC API HTTP ${response.status}: ${body?.error?.status || "UNKNOWN"}`);
  return body;
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
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
  const string = String(value ?? "");
  return /[",\n\r]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
};
function writeCsv(name, rows) {
  const headers = Object.keys(rows[0] || {});
  const content = [headers, ...rows.map((row) => headers.map((header) => row[header]))].map((row) => row.map(csvEscape).join(",")).join("\n");
  fs.writeFileSync(path.join(outDir, name), `${content}\n`);
}

const analyticsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
const query = (request) => api(analyticsUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...request, rowLimit: 25000 }) });
const isoOffset = (date, days) => { const value = new Date(`${date}T00:00:00Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10); };
const today = new Date().toISOString().slice(0, 10);
const dateProbe = await query({ startDate: isoOffset(today, -21), endDate: today, dimensions: ["date"], type: "web", dataState: "final" });
const finalizedEnd = (dateProbe.rows || []).map((row) => row.keys?.[0]).filter(Boolean).sort().at(-1);
if (!finalizedEnd) throw new Error("No finalized Search Analytics date returned.");
const windows = {
  latest28: { startDate: isoOffset(finalizedEnd, -27), endDate: finalizedEnd },
  previous28: { startDate: isoOffset(finalizedEnd, -55), endDate: isoOffset(finalizedEnd, -28) },
};
const protection = parseCsv(fs.readFileSync(path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv"), "utf8"));
const protectedUrls = protection.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.protection_tier));
const performanceRows = [];
for (const [windowName, window] of Object.entries(windows)) {
  const common = { ...window, type: "web", dataState: "final" };
  const [totals, pages] = await Promise.all([
    query(common),
    query({ ...common, dimensions: ["page"], aggregationType: "byPage" }),
  ]);
  const total = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  performanceRows.push({ row_type: "SITE_TOTAL", window: windowName, start_date: window.startDate, end_date: window.endDate, URL: "SITE", protection_tier: "SITE", clicks: total.clicks, impressions: total.impressions, ctr: total.ctr, position: total.position, evidence: "GSC_API_FINAL" });
  const pageMap = new Map((pages.rows || []).map((row) => [row.keys?.[0], row]));
  for (const protectedRow of protectedUrls) {
    const item = pageMap.get(protectedRow.URL) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    performanceRows.push({ row_type: "PROTECTED_PAGE", window: windowName, start_date: window.startDate, end_date: window.endDate, URL: protectedRow.URL, protection_tier: protectedRow.protection_tier, clicks: item.clicks, impressions: item.impressions, ctr: item.ctr, position: item.position, evidence: pageMap.has(protectedRow.URL) ? "VISIBLE_GSC_PAGE_ROW" : "NO_VISIBLE_PAGE_ROW_NOT_ZERO_CLAIM" });
  }
}

const redirectSources = [
  "https://echobuddha.com/articles/how-to-practice-non-attachment/",
  "https://echobuddha.com/articles/letting-go-without-giving-up/",
  "https://echobuddha.com/terms-and-conditions/",
];
const redirectRows = [];
for (const URL of redirectSources) {
  const response = await api("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ inspectionUrl: URL, siteUrl: property, languageCode: "en-US" }),
  });
  const result = response.inspectionResult?.indexStatusResult || {};
  const postdeployCrawl = Boolean(result.lastCrawlTime) && new Date(result.lastCrawlTime) >= new Date(deploymentAt);
  redirectRows.push({
    URL,
    inspected_at: new Date().toISOString(),
    verdict: result.verdict || "",
    coverageState: result.coverageState || "",
    robotsTxtState: result.robotsTxtState || "",
    indexingState: result.indexingState || "",
    lastCrawlTime: result.lastCrawlTime || "",
    pageFetchState: result.pageFetchState || "",
    googleCanonical: result.googleCanonical || "",
    userCanonical: result.userCanonical || "",
    crawledAs: result.crawledAs || "",
    postdeploy_crawl: postdeployCrawl ? "YES" : "NO",
    interpretation: postdeployCrawl ? "GOOGLE_HAS_RECRAWLED_REDIRECT_SOURCE_AFTER_DEPLOYMENT" : "GOOGLE_PROCESSING_PENDING",
  });
}

writeCsv("ECHO_BUDDHA_PHASE_14_MONITORING_SEARCH.csv", performanceRows);
writeCsv("ECHO_BUDDHA_PHASE_14_REDIRECT_GOOGLE_PROCESSING.csv", redirectRows);
fs.writeFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_MONITORING_SEARCH_SUMMARY.json"), `${JSON.stringify({
  generated_at: new Date().toISOString(),
  property,
  scope: requiredScope,
  data_state: "final",
  finalized_end_date: finalizedEnd,
  windows,
  protected_urls: protectedUrls.length,
  site_totals: performanceRows.filter((row) => row.row_type === "SITE_TOTAL"),
  redirect_inspections: redirectRows,
}, null, 2)}\n`);

console.log(JSON.stringify({
  finalized_end_date: finalizedEnd,
  protected_urls: protectedUrls.length,
  performance_rows: performanceRows.length,
  redirect_sources: redirectRows.length,
  redirect_sources_recrawled_postdeploy: redirectRows.filter((row) => row.postdeploy_crawl === "YES").length,
  scope: requiredScope,
}, null, 2));
