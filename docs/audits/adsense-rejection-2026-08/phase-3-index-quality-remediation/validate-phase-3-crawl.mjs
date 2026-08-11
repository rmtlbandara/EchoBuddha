import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-3-index-quality-remediation/phase-3-full-crawl-validation.json");
const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4321";
const SITE = "https://echobuddha.com";

function walk(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target, result);
    else result.push(target);
  }
  return result;
}

function routeForHtml(file) {
  const relative = path.relative(DIST, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
}

function hasNoindex(html) {
  return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta\s+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

function canonicalFor(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i)?.[1]
    || "";
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const pages = htmlFiles.map((file) => ({ route: routeForHtml(file), file, html: fs.readFileSync(file, "utf8") }));
const publicPages = pages.filter((page) => page.route !== "/404.html");
const publicRoutes = new Set(publicPages.map((page) => page.route));
const publicFiles = new Set(allFiles.map((file) => `/${path.relative(DIST, file).split(path.sep).join("/")}`));
const sitemapXml = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname));

const canonicalIssues = [];
const robotsSitemapIssues = [];
const brokenInternalLinks = [];
const noindexRoutes = [];
const indexableRoutes = [];

for (const page of pages) {
  const noindex = hasNoindex(page.html);
  const canonical = canonicalFor(page.html);
  if (noindex) noindexRoutes.push(page.route);
  else indexableRoutes.push(page.route);

  if (page.route !== "/404.html") {
    const expectedCanonical = new URL(page.route, SITE).href;
    if (canonical !== expectedCanonical) canonicalIssues.push({ route: page.route, canonical, expectedCanonical });
    if (noindex === sitemapRoutes.has(page.route)) {
      robotsSitemapIssues.push({ route: page.route, noindex, inSitemap: sitemapRoutes.has(page.route) });
    }
  }

  const linkMarkup = page.html.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const match of linkMarkup.matchAll(/<(?:a|link)\s+[^>]*(?:href)=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let target;
    try { target = new URL(href, SITE); } catch { continue; }
    if (target.origin !== SITE) continue;
    const pathname = target.pathname;
    const resolves = publicRoutes.has(pathname)
      || publicFiles.has(pathname)
      || publicFiles.has(`${pathname.replace(/\/$/, "")}/index.html`)
      || pathname === "/sitemap.xml";
    if (!resolves) brokenInternalLinks.push({ source: page.route, href, target: pathname });
  }
}

const httpResults = [];
let cursor = 0;
async function worker() {
  while (cursor < publicPages.length) {
    const page = publicPages[cursor++];
    try {
      const response = await fetch(`${BASE}${page.route}`, { redirect: "manual" });
      httpResults.push({ route: page.route, status: response.status, location: response.headers.get("location") || "" });
    } catch (error) {
      httpResults.push({ route: page.route, status: 0, error: error.message });
    }
  }
}
await Promise.all(Array.from({ length: 12 }, worker));
const statusIssues = httpResults.filter((row) => row.status !== 200);
const redirectResponses = httpResults.filter((row) => row.status >= 300 && row.status < 400);
const missingResponse = await fetch(`${BASE}/missing-phase-3-crawl-check/`, { redirect: "manual" });

const searchIndex = JSON.parse(fs.readFileSync(path.join(DIST, "search-index.json"), "utf8"));
const searchRoutes = new Set(searchIndex.map((entry) => new URL(entry.url, SITE).pathname));
const noindexContentRoutes = publicPages
  .filter((page) => hasNoindex(page.html) && (/^\/quotes\/.+\/.+\/$/.test(page.route) || /^\/daily-reflections\/(?!today\/)[^/]+\/$/.test(page.route)))
  .map((page) => page.route);
const missingFromInternalSearch = noindexContentRoutes.filter((route) => !searchRoutes.has(route));

const result = {
  checkedAt: new Date().toISOString(),
  baseUrl: BASE,
  summary: {
    htmlDocuments: pages.length,
    publicRoutes: publicPages.length,
    indexableDocuments: indexableRoutes.length,
    noindexDocuments: noindexRoutes.length,
    sitemapUrls: sitemapRoutes.size,
    fetched200: httpResults.filter((row) => row.status === 200).length,
    statusIssues: statusIssues.length,
    redirectResponses: redirectResponses.length,
    missingRouteStatus: missingResponse.status,
    canonicalIssues: canonicalIssues.length,
    robotsSitemapIssues: robotsSitemapIssues.length,
    brokenInternalLinks: brokenInternalLinks.length,
    noindexContentRoutesCheckedInSearch: noindexContentRoutes.length,
    missingFromInternalSearch: missingFromInternalSearch.length
  },
  passed: pages.length === 336
    && indexableRoutes.length === 193
    && noindexRoutes.length === 143
    && sitemapRoutes.size === 193
    && statusIssues.length === 0
    && redirectResponses.length === 0
    && missingResponse.status === 404
    && canonicalIssues.length === 0
    && robotsSitemapIssues.length === 0
    && brokenInternalLinks.length === 0
    && missingFromInternalSearch.length === 0,
  issues: { statusIssues, redirectResponses, canonicalIssues, robotsSitemapIssues, brokenInternalLinks, missingFromInternalSearch }
};

fs.writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.summary, null, 2));
if (!result.passed) process.exitCode = 1;
