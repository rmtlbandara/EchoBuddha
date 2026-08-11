import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/reconciliation");
const BASE = "https://echobuddha.com";
const USER_AGENT = "EchoBuddha-PostDeploy-Validation/1.0 (+site-owner validation)";

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[\",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const writeCsv = async (name, rows) => {
  const headers = Object.keys(rows[0] ?? {});
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  await writeFile(path.join(OUT, name), `${body}\n`);
};

const decode = (text) => text
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const cleanText = (html) => decode(html
  .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replaceAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
  .replaceAll(/<[^>]+>/g, " ")
  .replaceAll(/\s+/g, " ")
  .trim());

const first = (html, regex) => decode((html.match(regex)?.[1] ?? "")
  .replaceAll(/<[^>]+>/g, " ")
  .replaceAll(/\s+/g, " ")
  .trim());

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const walk = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir)) {
    const absolute = path.join(dir, entry);
    const info = await stat(absolute);
    files.push(...(info.isDirectory() ? await walk(absolute) : [absolute]));
  }
  return files;
};

const routeForFile = (file) => {
  const relative = path.relative(DIST, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};

const documentFields = (html) => ({
  title: first(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
  h1: first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
  robots: first(html, /<meta\s+name=["']robots["'][^>]+content=["']([^"']+)["']/i) || "index, follow (implicit)",
  canonical: first(html, /<link\s+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i),
  textHash: sha256(cleanText(html)),
});

const htmlFiles = (await walk(DIST)).filter((file) => file.endsWith(".html")).sort();
const local = new Map();
for (const file of htmlFiles) local.set(routeForFile(file), documentFields(await readFile(file, "utf8")));

const fetchRoute = async (route) => {
  const requestedUrl = `${BASE}${route}`;
  const startedAt = Date.now();
  try {
    const response = await fetch(requestedUrl, {
      redirect: "follow",
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(30000),
    });
    const html = await response.text();
    const fields = documentFields(html);
    const expected = local.get(route);
    const fieldsMatch = fields.title === expected.title
      && fields.h1 === expected.h1
      && fields.robots === expected.robots
      && fields.canonical === expected.canonical;
    const textMatches = fields.textHash === expected.textHash;
    return {
      URL: requestedUrl,
      Route: route,
      Status: response.status,
      "Final URL": response.url,
      "Title/H1/robots/canonical match": fieldsMatch ? "Yes" : "No",
      "Rendered text matches": textMatches ? "Yes" : "No",
      "Full parity": response.status === 200 && fieldsMatch && textMatches ? "Yes" : "No",
      "Production robots": fields.robots,
      "Expected robots": expected.robots,
      "Production canonical": fields.canonical,
      "Expected canonical": expected.canonical,
      "Elapsed ms": Date.now() - startedAt,
      Error: "",
    };
  } catch (error) {
    return {
      URL: requestedUrl,
      Route: route,
      Status: "ERROR",
      "Final URL": "",
      "Title/H1/robots/canonical match": "No",
      "Rendered text matches": "No",
      "Full parity": "No",
      "Production robots": "",
      "Expected robots": local.get(route).robots,
      "Production canonical": "",
      "Expected canonical": local.get(route).canonical,
      "Elapsed ms": Date.now() - startedAt,
      Error: error.message,
    };
  }
};

const rows = [];
const routes = [...local.keys()];
const concurrency = 12;
for (let offset = 0; offset < routes.length; offset += concurrency) {
  rows.push(...await Promise.all(routes.slice(offset, offset + concurrency).map(fetchRoute)));
}

const specialTargets = [
  "http://echobuddha.com/",
  "https://www.echobuddha.com/",
  `${BASE}/this-route-must-not-exist-phase-0-4/`,
  `${BASE}/robots.txt`,
  `${BASE}/sitemap.xml`,
  `${BASE}/ads.txt`,
];
const special = [];
for (const requestedUrl of specialTargets) {
  try {
    const response = await fetch(requestedUrl, {
      redirect: "manual",
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.text();
    special.push({
      requestedUrl,
      status: response.status,
      location: response.headers.get("location") ?? "",
      contentType: response.headers.get("content-type") ?? "",
      bodyHash: sha256(body),
      bodyBytes: Buffer.byteLength(body),
    });
  } catch (error) {
    special.push({ requestedUrl, status: "ERROR", location: "", contentType: "", bodyHash: "", bodyBytes: 0, error: error.message });
  }
}

const productionSitemap = await (await fetch(`${BASE}/sitemap.xml`, { headers: { "user-agent": USER_AGENT } })).text();
const localSitemap = await readFile(path.join(DIST, "sitemap.xml"), "utf8");
const sitemapUrls = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
const productionSitemapUrls = sitemapUrls(productionSitemap);
const localSitemapUrls = sitemapUrls(localSitemap);
const productionIndexable = rows.filter((row) => row.Status === 200 && !/noindex/i.test(row["Production robots"])).length;
const productionNoindex = rows.filter((row) => row.Status === 200 && /noindex/i.test(row["Production robots"])).length;

const summary = {
  checkedAt: new Date().toISOString(),
  baseUrl: BASE,
  routesExpected: routes.length,
  status200: rows.filter((row) => row.Status === 200).length,
  fullParity: rows.filter((row) => row["Full parity"] === "Yes").length,
  parityFailures: rows.filter((row) => row["Full parity"] !== "Yes").map((row) => ({ route: row.Route, status: row.Status, error: row.Error })),
  productionIndexable,
  productionNoindex,
  productionSitemapUrls: productionSitemapUrls.length,
  localSitemapUrls: localSitemapUrls.length,
  sitemapExactMatch: JSON.stringify(productionSitemapUrls) === JSON.stringify(localSitemapUrls),
  special,
};
summary.status = summary.status200 === summary.routesExpected
  && summary.fullParity === summary.routesExpected
  && summary.productionIndexable === 193
  && summary.productionNoindex === 143
  && summary.productionSitemapUrls === 193
  && summary.sitemapExactMatch
  && special.find((row) => row.requestedUrl.includes("this-route-must-not-exist"))?.status === 404
  ? "PASS"
  : "FAIL";

await writeCsv("phase-0-4-post-deploy-production-parity.csv", rows);
await writeFile(path.join(OUT, "phase-0-4-post-deploy-production-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
if (summary.status !== "PASS") process.exitCode = 1;
