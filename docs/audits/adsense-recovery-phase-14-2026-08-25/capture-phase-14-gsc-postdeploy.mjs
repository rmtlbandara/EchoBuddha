import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const property = "sc-domain:echobuddha.com";
const requiredScope = "https://www.googleapis.com/auth/webmasters.readonly";
const clientPath = process.env.ECHOBUDDHA_GSC_CLIENT_FILE;
const tokenPath = process.env.ECHOBUDDHA_GSC_TOKEN_FILE;
if (!clientPath || !tokenPath) throw new Error("Set the external GSC client and token paths.");

const clientDoc = JSON.parse(fs.readFileSync(clientPath, "utf8"));
const client = clientDoc.installed ?? clientDoc.web;
const storedToken = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
const scopes = String(storedToken.scope || requiredScope).split(/\s+/).filter(Boolean);
if (scopes.length !== 1 || scopes[0] !== requiredScope) throw new Error("OAuth token is not restricted to webmasters.readonly.");
if (!client?.client_id || !client?.client_secret || (!storedToken.refresh_token && !storedToken.access_token)) throw new Error("External OAuth material is incomplete.");

let accessToken = storedToken.access_token || "";
let expiresAt = Number(storedToken.expiry_date || 0);
async function token(force = false) {
  if (!force && accessToken && Date.now() + 60_000 < expiresAt) return accessToken;
  if (!storedToken.refresh_token) return accessToken;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: client.client_id,
      client_secret: client.client_secret,
      refresh_token: storedToken.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`OAuth refresh failed: HTTP ${response.status}`);
  const body = await response.json();
  accessToken = body.access_token;
  expiresAt = Date.now() + Number(body.expires_in || 3600) * 1000;
  return accessToken;
}

async function api(url, options = {}, retry = false) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), authorization: `Bearer ${await token(retry)}` },
  });
  if (response.status === 401 && !retry) return api(url, options, true);
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }
  if (!response.ok) throw new Error(`GSC API HTTP ${response.status}: ${body?.error?.status || "UNKNOWN"}`);
  return body;
}

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
const writeCsv = (name, rows) => {
  const headers = Object.keys(rows[0] || {});
  const content = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
    .map((row) => row.map(csvEscape).join(",")).join("\n");
  fs.writeFileSync(path.join(outDir, name), `${content}\n`);
};

const predeploy = JSON.parse(fs.readFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_GSC_PREDEPLOY_SUMMARY.json"), "utf8"));
const crawl = parseCsv(fs.readFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_14_PRODUCTION_CRAWL.csv"), "utf8"));
const liveByUrl = new Map(crawl.map((row) => [row.URL, row]));
const urls = predeploy.inspections.map((item) => item.URL);
const inspectedAt = new Date().toISOString();
const rows = [];

for (const URL of urls) {
  const response = await api("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ inspectionUrl: URL, siteUrl: property, languageCode: "en-US" }),
  });
  const result = response.inspectionResult?.indexStatusResult || {};
  const live = liveByUrl.get(URL);
  const productionMatch = live
    ? (Number(live.final_http_status || live.actual_http_status) === 200 && (!result.userCanonical || result.userCanonical === live.canonical))
    : false;
  rows.push({
    URL,
    inspected_at: inspectedAt,
    verdict: result.verdict || "",
    coverageState: result.coverageState || "",
    robotsTxtState: result.robotsTxtState || "",
    indexingState: result.indexingState || "",
    lastCrawlTime: result.lastCrawlTime || "",
    pageFetchState: result.pageFetchState || "",
    googleCanonical: result.googleCanonical || "",
    userCanonical: result.userCanonical || "",
    crawledAs: result.crawledAs || "",
    production_live_match: productionMatch ? "YES" : "PENDING_OR_NOT_COMPARABLE",
    interpretation: "GOOGLE_INDEXED_STATE_MAY_PRECEDE_PHASE_14_DEPLOYMENT",
  });
}

const sitemap = await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps`);
writeCsv("ECHO_BUDDHA_PHASE_14_URL_INSPECTION.csv", rows);
fs.writeFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_GSC_POSTDEPLOY_SUMMARY.json"), `${JSON.stringify({
  generated_at: inspectedAt,
  property,
  scope: requiredScope,
  inspections: rows,
  sitemap,
}, null, 2)}\n`);

console.log(JSON.stringify({
  inspected_at: inspectedAt,
  inspections: rows.length,
  pass_verdicts: rows.filter((row) => row.verdict === "PASS").length,
  sitemap_entries: sitemap.sitemap?.length || 0,
  scope: requiredScope,
}, null, 2));
