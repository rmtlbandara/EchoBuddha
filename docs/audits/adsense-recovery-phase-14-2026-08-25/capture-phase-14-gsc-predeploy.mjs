import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outDir, "../../..");
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
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: client.client_id, client_secret: client.client_secret, refresh_token: storedToken.refresh_token, grant_type: "refresh_token" }) });
  if (!response.ok) throw new Error(`OAuth refresh failed: HTTP ${response.status}`);
  const body = await response.json(); accessToken = body.access_token; expiresAt = Date.now() + Number(body.expires_in || 3600) * 1000; return accessToken;
}
async function api(url, options = {}, retry = false) {
  const response = await fetch(url, { ...options, headers: { ...(options.headers || {}), authorization: `Bearer ${await token(retry)}` } });
  if (response.status === 401 && !retry) return api(url, options, true);
  const text = await response.text(); let body = {}; try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }
  if (!response.ok) throw new Error(`GSC API HTTP ${response.status}: ${body?.error?.status || "UNKNOWN"}`);
  return body;
}
const analyticsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
const query = (request) => api(analyticsUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...request, rowLimit: 25000 }) });
const isoOffset = (date, days) => { const value = new Date(`${date}T00:00:00Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10); };
const dateProbe = await query({ startDate: isoOffset(new Date().toISOString().slice(0, 10), -21), endDate: new Date().toISOString().slice(0, 10), dimensions: ["date"], type: "web", dataState: "final" });
const finalizedEnd = (dateProbe.rows || []).map((row) => row.keys?.[0]).filter(Boolean).sort().at(-1);
if (!finalizedEnd) throw new Error("No finalized Search Analytics date returned.");
const windows = {
  latest28: { startDate: isoOffset(finalizedEnd, -27), endDate: finalizedEnd },
  previous28: { startDate: isoOffset(finalizedEnd, -55), endDate: isoOffset(finalizedEnd, -28) }
};

function parseCsv(text) {
  const rows=[];let row=[],field="",quoted=false;
  for(let i=0;i<text.length;i+=1){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i+=1;}else if(c==='"')quoted=false;else field+=c;}else if(c==='"')quoted=true;else if(c===','){row.push(field);field="";}else if(c==='\n'){row.push(field.replace(/\r$/, ""));rows.push(row);row=[];field="";}else field+=c;}if(field||row.length){row.push(field);rows.push(row);}const [headers,...records]=rows.filter((item)=>item.some(Boolean));return records.map((record)=>Object.fromEntries(headers.map((header,index)=>[header,record[index]??""])));
}
const csvEscape=(value)=>{const text=String(value??"");return /[",\n\r]/.test(text)?`"${text.replaceAll('"','""')}"`:text;};
const writeCsv=(name,rows)=>{const headers=Object.keys(rows[0]||{});fs.writeFileSync(path.join(outDir,name),`${[headers,...rows.map((row)=>headers.map((header)=>row[header]))].map((row)=>row.map(csvEscape).join(",")).join("\n")}\n`);};
const protection = parseCsv(fs.readFileSync(path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv"), "utf8"));
const p0 = protection.filter((row) => row.protection_tier === "SEO_P0_CRITICAL").map((row) => row.URL).sort();
const p1 = protection.filter((row) => row.protection_tier === "SEO_P1_HIGH").map((row) => row.URL).sort();
const priority = [...new Set([...p0, ...p1.slice(0, 10),
  "https://echobuddha.com/articles/right-speech-buddhism/",
  "https://echobuddha.com/quotes/letting-go/",
  "https://echobuddha.com/start-here/",
  "https://echobuddha.com/daily-reflections/today/",
  "https://echobuddha.com/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/"
])].sort();

const rows = [];
const raw = { generated_at: new Date().toISOString(), property, scope: requiredScope, data_state: "final", finalized_end_date: finalizedEnd, windows, sitemap: null, inspections: [] };
for (const [windowName, window] of Object.entries(windows)) {
  const common = { ...window, type: "web", dataState: "final" };
  const [totals, pages, queryPages] = await Promise.all([
    query(common),
    query({ ...common, dimensions: ["page"], aggregationType: "byPage" }),
    query({ ...common, dimensions: ["query", "page"], aggregationType: "byPage" })
  ]);
  const total = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  rows.push({ row_type: "SITE_TOTAL", window: windowName, start_date: window.startDate, end_date: window.endDate, URL: "SITE", query_hash: "", clicks: total.clicks, impressions: total.impressions, ctr: total.ctr, position: total.position, protection_tier: "SITE", evidence: "GSC_API_FINAL" });
  const pageMap = new Map((pages.rows || []).map((row) => [row.keys?.[0], row]));
  for (const URL of [...p0, ...p1]) {
    const item = pageMap.get(URL) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    rows.push({ row_type: "PROTECTED_PAGE", window: windowName, start_date: window.startDate, end_date: window.endDate, URL, query_hash: "", clicks: item.clicks, impressions: item.impressions, ctr: item.ctr, position: item.position, protection_tier: p0.includes(URL) ? "SEO_P0_CRITICAL" : "SEO_P1_HIGH", evidence: pageMap.has(URL) ? "VISIBLE_GSC_PAGE_ROW" : "NO_VISIBLE_PAGE_ROW_NOT_ZERO_CLAIM" });
  }
  for (const item of queryPages.rows || []) {
    const [queryText, URL] = item.keys || [];
    if (![...p0, ...p1].includes(URL)) continue;
    rows.push({ row_type: "PROTECTED_QUERY_PAGE", window: windowName, start_date: window.startDate, end_date: window.endDate, URL, query_hash: crypto.createHash("sha256").update(queryText || "").digest("hex").slice(0, 16), clicks: item.clicks, impressions: item.impressions, ctr: item.ctr, position: item.position, protection_tier: p0.includes(URL) ? "SEO_P0_CRITICAL" : "SEO_P1_HIGH", evidence: "QUERY_TEXT_REDACTED_HASHED" });
  }
}
raw.sitemap = await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps`);
for (const URL of priority) {
  const response = await api("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ inspectionUrl: URL, siteUrl: property, languageCode: "en-US" }) });
  const result = response.inspectionResult?.indexStatusResult || {};
  raw.inspections.push({ URL, inspected_at: new Date().toISOString(), verdict: result.verdict || "", coverageState: result.coverageState || "", robotsTxtState: result.robotsTxtState || "", indexingState: result.indexingState || "", lastCrawlTime: result.lastCrawlTime || "", pageFetchState: result.pageFetchState || "", googleCanonical: result.googleCanonical || "", userCanonical: result.userCanonical || "", crawledAs: result.crawledAs || "" });
}
writeCsv("ECHO_BUDDHA_PHASE_14_SEARCH_BASELINE.csv", rows);
fs.mkdirSync(path.join(outDir, "source-evidence"), { recursive: true });
fs.writeFileSync(path.join(outDir, "source-evidence/ECHO_BUDDHA_PHASE_14_GSC_PREDEPLOY_SUMMARY.json"), `${JSON.stringify(raw, null, 2)}\n`);
console.log(JSON.stringify({ finalized_end_date: finalizedEnd, search_baseline_rows: rows.length, priority_inspections: raw.inspections.length, sitemap_entries: raw.sitemap.sitemap?.length || 0, scope: requiredScope }, null, 2));
