import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { canonicalInspectionUrls, bingPriorityCohort, fetchSearchEvidence } from "./search-inspection-policy.mjs";

const SITE = "https://echobuddha.com/";
const METHODS = ["GetUserSites", "GetFeeds", "GetRankAndTrafficStats", "GetCrawlStats"];

export function summarizeBing(evidence) {
  const data = (method) => Array.isArray(evidence[method]?.data) ? evidence[method].data : [];
  const site = data("GetUserSites").find(row => row.Url === SITE);
  const traffic = data("GetRankAndTrafficStats");
  const totals = traffic.reduce((sum, row) => ({ clicks: sum.clicks + Number(row.Clicks || 0), impressions: sum.impressions + Number(row.Impressions || 0) }), { clicks: 0, impressions: 0 });
  return {
    generatedAt: new Date().toISOString(), site: SITE, verified: site?.IsVerified === true,
    endpoints: Object.fromEntries(METHODS.map(method => [method, { status: evidence[method]?.status, rows: data(method).length }])),
    sitemaps: data("GetFeeds").map(row => ({ url: row.Url, status: row.Status, urls: row.UrlCount, lastCrawled: row.LastCrawled })),
    traffic: { ...totals, returnedDates: traffic.map(row => row.Date).sort(), note: "Totals cover only the API-returned dates; no invented comparison period or release attribution." },
    crawl: { returnedRows: data("GetCrawlStats").length },
    urlDiagnostics: evidence.urlDiagnostics || [],
    limitations: ["A submitted sitemap or IndexNow receipt does not prove indexing.", "API-returned traffic and crawl intervals may differ from dashboard selections.", "Raw account records and verification codes are never uploaded in this aggregate report."]
  };
}

export async function collectBing({ key, out, fetcher = fetch, diagnosticUrls = [], sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
  if (!key) throw new Error("Existing Bing API credential is required");
  fs.mkdirSync(out, { recursive: true });
  const evidence = {};
  for (const method of METHODS) {
    const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
    url.searchParams.set("apikey", key);
    if (method !== "GetUserSites") url.searchParams.set("siteUrl", SITE);
    try {
      const response = await fetcher(url, { signal: AbortSignal.timeout(30_000) });
      const body = await response.json();
      // Discard unrelated properties and authentication/verification codes.
      const data = method === "GetUserSites" ? (body.d || []).filter(row => row.Url === SITE).map(row => ({ Url: row.Url, IsVerified: row.IsVerified })) : body.d;
      evidence[method] = { status: response.status, data };
      console.log(`${method}: HTTP ${response.status}`);
    } catch {
      // Never log a request URL, fetch exception, API key, or response error body.
      evidence[method] = { status: "UNAVAILABLE", data: [] };
      console.log(`${method}: unavailable`);
    }
  }
  evidence.urlDiagnostics = [];
  let blockedCode = null;
  let diagnosticCalls = 0;
  for (const page of diagnosticUrls) {
    const target = new URL(page);
    if (target.origin !== new URL(SITE).origin || target.username || target.password || target.search || target.hash) throw new Error("Bing diagnostics require a public same-site canonical URL");
    if (blockedCode !== null) {
      evidence.urlDiagnostics.push({ url: target.href, status: "NOT_ATTEMPTED", apiErrorCode: blockedCode, classification: "API_LIMIT_OR_ACCESS_BLOCKED" });
      continue;
    }
    // Avoid burst diagnostics. Bing can return typed throttling as HTTP 400,
    // rather than 429; retain only its numeric code, never its raw error body.
    if (diagnosticCalls++) await sleep(7000);
    const url = new URL("https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo");
    url.searchParams.set("apikey", key);
    url.searchParams.set("siteUrl", SITE);
    url.searchParams.set("url", target.href);
    try {
      const response = await fetcher(url, { signal: AbortSignal.timeout(30_000) });
      const body = await response.json();
      const row = body.d || {};
      const apiErrorCode = Number.isInteger(body.ErrorCode) ? body.ErrorCode : null;
      if ([3, 4, 5, 6, 14, 18].includes(apiErrorCode)) blockedCode = apiErrorCode;
      evidence.urlDiagnostics.push({ url: target.href, status: response.status, apiErrorCode, classification: [4, 5].includes(apiErrorCode) ? "RATE_LIMITED" : response.status === 200 ? "CRAWL_DATA_ONLY" : "API_ERROR_UNKNOWN_INDEX_STATUS", isPage: row.IsPage ?? null, httpStatus: row.HttpStatus ?? null, lastCrawledDate: row.LastCrawledDate ?? null, discoveryDate: row.DiscoveryDate ?? null, note: "GetUrlInfo crawl evidence; IsPage alone is not an indexed-status assertion or a reconciliation of all dashboard views." });
    } catch {
      evidence.urlDiagnostics.push({ url: target.href, status: "UNAVAILABLE" });
    }
  }
  fs.writeFileSync(path.join(out, "raw.json"), JSON.stringify(evidence, null, 2) + "\n", { mode: 0o600 });
  const summary = summarizeBing(evidence);
  fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  if (!summary.verified || METHODS.some(method => evidence[method].status !== 200)) throw new Error("Bing read-only collection incomplete; see sanitized status summary");
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const file = process.env.ECHOBUDDHA_BING_KEY_FILE;
  if (!file) throw new Error("Set ECHOBUDDHA_BING_KEY_FILE to an existing private credential file");
  const sitemap = await fetchSearchEvidence(`${SITE}sitemap.xml`);
  if (!sitemap.ok) throw new Error("Current canonical sitemap could not be fetched");
  await collectBing({ key: fs.readFileSync(file, "utf8").trim(), out: process.env.BING_OUT_DIR || ".artifacts/bing", diagnosticUrls: bingPriorityCohort(canonicalInspectionUrls(await sitemap.text())) });
}
