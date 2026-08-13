import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const dist = path.join(root, "dist");
const out = path.dirname(fileURLToPath(import.meta.url));
const origin = "https://echobuddha.com";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const normalizeSpace = (value = "") => value.replace(/\s+/g, " ").trim();
const stripTags = (value = "") => normalizeSpace(value.replace(/<[^>]*>/g, " "));
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const match = (html, pattern) => html.match(pattern)?.[1]?.trim() || "";
const routeFor = (file) => {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const robots = (html) => match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
  match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["'][^>]*>/i) || "index, follow (implicit)";
const canonical = (html) => match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i) ||
  match(html, /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["'][^>]*>/i);
const visibleText = (html) => normalizeSpace(html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]*>/g, " "));
const jsonLd = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map((item) => {
    try { return JSON.stringify(JSON.parse(item[1])); } catch { return normalizeSpace(item[1]); }
  }).sort();
const internalLinks = (html) => [...html.matchAll(/\shref=["']([^"'#]+)["']/gi)]
  .map((item) => item[1])
  .filter((href) => href.startsWith("/") || href.startsWith(origin))
  .map((href) => href.startsWith(origin) ? href.slice(origin.length) || "/" : href)
  .map((href) => href.split("?")[0])
  .sort();
const pageFacts = (html) => ({
  title: stripTags(match(html, /<title[^>]*>([\s\S]*?)<\/title>/i)),
  h1: stripTags(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)),
  robots: robots(html),
  canonical: canonical(html),
  textHash: sha256(visibleText(html)),
  schemaHash: sha256(JSON.stringify(jsonLd(html))),
  linksHash: sha256(JSON.stringify(internalLinks(html)))
});
const escapeCsv = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const htmlFiles = walk(dist).filter((file) => file.endsWith(".html")).sort();
const rows = new Array(htmlFiles.length);
let cursor = 0;
async function worker() {
  while (cursor < htmlFiles.length) {
    const index = cursor++;
    const file = htmlFiles[index];
    const route = routeFor(file);
    const localHtml = fs.readFileSync(file, "utf8");
    const local = pageFacts(localHtml);
    const started = Date.now();
    try {
      const response = await fetch(`${origin}${route}`, { redirect: "follow", headers: { "user-agent": "EchoBuddha-Phase7-Parity/1.0" } });
      const productionHtml = await response.text();
      const production = pageFacts(productionHtml);
      const metadataMatch = ["title", "h1", "robots", "canonical"].every((key) => local[key] === production[key]);
      const textMatch = local.textHash === production.textHash;
      const schemaMatch = local.schemaHash === production.schemaHash;
      const linksMatch = local.linksHash === production.linksHash;
      rows[index] = {
        url: `${origin}${route}`, route, status: response.status, finalUrl: response.url,
        metadataMatch, textMatch, schemaMatch, linksMatch,
        fullParity: response.status === 200 && metadataMatch && textMatch && schemaMatch && linksMatch,
        productionRobots: production.robots, expectedRobots: local.robots,
        productionCanonical: production.canonical, expectedCanonical: local.canonical,
        elapsedMs: Date.now() - started, error: ""
      };
    } catch (error) {
      rows[index] = { url: `${origin}${route}`, route, status: 0, finalUrl: "", metadataMatch: false, textMatch: false, schemaMatch: false, linksMatch: false, fullParity: false, productionRobots: "", expectedRobots: local.robots, productionCanonical: "", expectedCanonical: local.canonical, elapsedMs: Date.now() - started, error: error.message };
    }
  }
}
await Promise.all(Array.from({ length: 12 }, () => worker()));

const localSitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const productionSitemapResponse = await fetch(`${origin}/sitemap.xml`);
const productionSitemap = await productionSitemapResponse.text();
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => item[1]).sort();
const localSitemapUrls = locs(localSitemap);
const productionSitemapUrls = locs(productionSitemap);

const expectedHeaders = [
  "x-content-type-options", "referrer-policy", "x-frame-options", "permissions-policy",
  "strict-transport-security", "content-security-policy-report-only"
];
const representativeRoutes = ["/", "/start-here/", "/learn/", "/meditation/", "/articles/", "/search/", "/about/", "/privacy-policy/"];
const security = [];
for (const route of representativeRoutes) {
  const response = await fetch(`${origin}${route}`);
  const present = expectedHeaders.filter((header) => response.headers.has(header));
  security.push({ route, status: response.status, present, missing: expectedHeaders.filter((header) => !response.headers.has(header)), pass: response.status === 200 && present.length === expectedHeaders.length });
}

const homeResponse = await fetch(origin);
const home = await homeResponse.text();
const navLabels = [...home.matchAll(/<nav[^>]+id=["']main-navigation["'][\s\S]*?<\/nav>/gi)]
  .flatMap((nav) => [...nav[0].matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((item) => [item[1], stripTags(item[2])]));
const expectedNav = [["/start-here/", "Start Here"], ["/learn/", "Learn"], ["/meditation/", "Meditation"], ["/articles/", "Articles"], ["/daily-reflections/", "Daily Reflection"]];
const navPass = JSON.stringify(navLabels) === JSON.stringify(expectedNav);
const searchResponse = await fetch(`${origin}/search-index.json`);
const searchItems = await searchResponse.json();
const localSearchItems = JSON.parse(fs.readFileSync(path.join(dist, "search-index.json"), "utf8"));
const missingResponse = await fetch(`${origin}/phase-7-production-parity-missing/`, { redirect: "manual" });
const httpResponse = await fetch("http://echobuddha.com/", { redirect: "manual" });
const wwwResponse = await fetch("https://www.echobuddha.com/", { redirect: "manual" });
const robotsResponse = await fetch(`${origin}/robots.txt`);
const adsResponse = await fetch(`${origin}/ads.txt`);

const summary = {
  generatedAt: new Date().toISOString(), origin,
  pages: { expected: rows.length, status200: rows.filter((row) => row.status === 200).length, fullParity: rows.filter((row) => row.fullParity).length, failures: rows.filter((row) => !row.fullParity).length },
  sitemap: { status: productionSitemapResponse.status, expectedCount: localSitemapUrls.length, productionCount: productionSitemapUrls.length, exactMatch: JSON.stringify(localSitemapUrls) === JSON.stringify(productionSitemapUrls) },
  navigation: { expected: expectedNav, actual: navLabels, pass: navPass },
  search: { status: searchResponse.status, expectedItems: localSearchItems.length, productionItems: searchItems.length, exactMatch: sha256(JSON.stringify(localSearchItems)) === sha256(JSON.stringify(searchItems)) },
  security: { routes: security.length, passed: security.filter((row) => row.pass).length, expectedHeaders, rows: security },
  edge: {
    missingStatus: missingResponse.status,
    httpStatus: httpResponse.status, httpLocation: httpResponse.headers.get("location") || "",
    wwwStatus: wwwResponse.status, wwwLocation: wwwResponse.headers.get("location") || "",
    robotsStatus: robotsResponse.status, adsTxtStatus: adsResponse.status
  }
};
summary.pass = summary.pages.failures === 0 && summary.sitemap.exactMatch && summary.navigation.pass && summary.search.exactMatch && summary.security.passed === summary.security.routes && summary.edge.missingStatus === 404 && [301, 302, 307, 308].includes(summary.edge.httpStatus) && [301, 302, 307, 308].includes(summary.edge.wwwStatus) && summary.edge.robotsStatus === 200;

const csvColumns = ["URL", "Route", "Status", "Final URL", "Title/H1/robots/canonical match", "Rendered text matches", "Structured data matches", "Internal links match", "Full parity", "Production robots", "Expected robots", "Production canonical", "Expected canonical", "Elapsed ms", "Error"];
const csvRows = rows.map((row) => [row.url, row.route, row.status, row.finalUrl, row.metadataMatch ? "Yes" : "No", row.textMatch ? "Yes" : "No", row.schemaMatch ? "Yes" : "No", row.linksMatch ? "Yes" : "No", row.fullParity ? "Yes" : "No", row.productionRobots, row.expectedRobots, row.productionCanonical, row.expectedCanonical, row.elapsedMs, row.error]);
fs.writeFileSync(path.join(out, "phase-7-post-deploy-production-parity.csv"), [csvColumns, ...csvRows].map((row) => row.map(escapeCsv).join(",")).join("\n") + "\n");
fs.writeFileSync(path.join(out, "phase-7-post-deploy-production-summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(`Phase 7 production parity: ${summary.pass ? "PASS" : "FAIL"} (${summary.pages.fullParity}/${summary.pages.expected} pages; sitemap ${summary.sitemap.productionCount}; security ${summary.security.passed}/${summary.security.routes})`);
if (!summary.pass) {
  console.error(JSON.stringify({ pageFailures: rows.filter((row) => !row.fullParity).slice(0, 10), summary }, null, 2));
  process.exitCode = 1;
}
