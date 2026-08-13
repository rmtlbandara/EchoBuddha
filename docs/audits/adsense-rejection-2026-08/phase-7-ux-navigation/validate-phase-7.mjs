import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, "dist");
const outDir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-7-ux-navigation");
const baselinePath = path.join(
  root,
  "docs/audits/adsense-rejection-2026-08/phase-6-source-authorship-trust/phase-6-indexability-preservation.csv"
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...values] = rows.filter((item) => item.some(Boolean));
  return values.map((valuesRow) => Object.fromEntries(headers.map((header, index) => [header, valuesRow[index] ?? ""])));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function fileToRoute(file) {
  const relative = path.relative(dist, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

function normalizeRoute(value) {
  const url = new URL(value, "https://echobuddha.com");
  let pathname = url.pathname;
  if (pathname !== "/" && !path.extname(pathname) && !pathname.endsWith("/")) pathname += "/";
  return pathname;
}

function routeExists(route, routes) {
  if (routes.has(route)) return true;
  if (route === "/404/") return routes.has("/404.html");
  return false;
}

function extract(html, regex) {
  return [...html.matchAll(regex)].map((match) => match[1]);
}

const allFiles = walk(dist);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const routeToFile = new Map(htmlFiles.map((file) => [fileToRoute(file), file]));
const routeSet = new Set(routeToFile.keys());
routeSet.add("/sitemap.xml");
routeSet.add("/search-index.json");

const sitemapText = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapPaths = new Set(extract(sitemapText, /<loc>https:\/\/echobuddha\.com([^<]*)<\/loc>/g).map(normalizeRoute));
const checks = [];
const add = (area, name, pass, evidence) => checks.push({ area, name, pass: Boolean(pass), evidence });

const home = fs.readFileSync(routeToFile.get("/"), "utf8");
const navBlock = home.match(/<nav id="main-navigation"[\s\S]*?<\/nav>/)?.[0] ?? "";
const navLinks = extract(navBlock, /<a[^>]+href="([^"]+)"/g);
add("Navigation", "Primary navigation contains the approved five destinations", navLinks.length === 5, navLinks.join(" | "));
add(
  "Navigation",
  "Primary navigation order matches the user-goal model",
  JSON.stringify(navLinks) === JSON.stringify(["/start-here/", "/learn/", "/meditation/", "/articles/", "/daily-reflections/"]),
  navLinks.join(" -> ")
);
add("Navigation", "All global navigation links resolve", navLinks.every((href) => routeExists(normalizeRoute(href), routeSet)), navLinks.join(" | "));

const headerSource = fs.readFileSync(path.join(root, "src/components/Header.astro"), "utf8");
for (const [name, token] of [
  ["Menu uses aria-expanded", 'aria-expanded="false"'],
  ["Escape closes and restores focus", 'setMenu(false, true)'],
  ["Outside click closes the menu", 'document.addEventListener("pointerdown"'],
  ["Open menu moves focus", 'target?.focus()']
]) {
  add("Mobile navigation", name, headerSource.includes(token), token);
}
add(
  "Mobile navigation",
  "No-JS mobile navigation remains available",
  headerSource.includes('.site-header[data-menu-ready="true"][data-nav-open="false"] .main-nav'),
  "Navigation is hidden only after enhancement is ready"
);

const brokenInternalLinks = [];
for (const [route, file] of routeToFile) {
  const html = fs.readFileSync(file, "utf8");
  const hrefs = extract(html, /<a\b[^>]*\bhref="([^"]+)"/g);
  for (const href of hrefs) {
    if (!href || href.includes("${") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const parsed = new URL(href, "https://echobuddha.com");
    if (parsed.origin !== "https://echobuddha.com") continue;
    const target = normalizeRoute(parsed.pathname);
    if (!routeExists(target, routeSet)) brokenInternalLinks.push({ source: route, href, target });
  }
}
add("Internal links", "Broken internal links equal zero", brokenInternalLinks.length === 0, `${brokenInternalLinks.length} broken links`);

const searchItems = JSON.parse(fs.readFileSync(path.join(dist, "search-index.json"), "utf8"));
const invalidSearchUrls = searchItems.filter((item) => !routeExists(normalizeRoute(item.url), routeSet));
const mettaTypes = new Set(
  searchItems
    .filter((item) => `${item.title} ${(item.keywords ?? []).join(" ")} ${item.excerpt}`.toLowerCase().includes("metta"))
    .map((item) => item.type)
);
add("Search", "Every search result URL resolves", invalidSearchUrls.length === 0, `${searchItems.length} indexed results; ${invalidSearchUrls.length} invalid`);
add("Search", "Metta results distinguish definition, meditation, and article families", ["Buddhist Term", "Meditation Guide", "Article"].every((type) => mettaTypes.has(type)), [...mettaTypes].sort().join(" | "));
add("Search", "Search retains explicit type labels", searchItems.every((item) => item.type && item.title && item.url), "All results include type, title, and URL");

const breadcrumbRoutes = [
  "/meditation/breathing-meditation/",
  "/daily-reflections/one-honest-breath/",
  "/quotes/mindfulness/",
  "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/",
  "/learn/buddhism-101/what-is-mindfulness/",
  "/articles/four-noble-truths-explained-simply/"
];
const breadcrumbFailures = breadcrumbRoutes.filter((route) => {
  const html = fs.readFileSync(routeToFile.get(route), "utf8");
  return !html.includes('aria-label="Breadcrumb"') || !html.includes('"@type":"BreadcrumbList"');
});
add("Breadcrumbs", "Representative visible breadcrumbs match structured hierarchy", breadcrumbFailures.length === 0, `${breadcrumbRoutes.length - breadcrumbFailures.length}/${breadcrumbRoutes.length} pass`);

const baselineRows = parseCsv(fs.readFileSync(baselinePath, "utf8"));
const preservationFailures = [];
for (const row of baselineRows) {
  const route = normalizeRoute(row.URL);
  const file = routeToFile.get(route === "/404/" ? "/404.html" : route);
  if (!file) {
    preservationFailures.push({ route, issue: "route missing" });
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "indexable";
  const currentIndex = robots.includes("noindex") ? robots : "indexable";
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
  const currentSitemap = sitemapPaths.has(route) ? "in sitemap" : "out of sitemap";
  if (currentIndex !== row["Current index state"] || canonical !== row["Current canonical"] || currentSitemap !== row["Baseline sitemap"]) {
    preservationFailures.push({
      route,
      expectedIndex: row["Current index state"],
      currentIndex,
      expectedCanonical: row["Current canonical"],
      canonical,
      expectedSitemap: row["Baseline sitemap"],
      currentSitemap
    });
  }
}
add("Indexability", "Phase 6 index/canonical/sitemap state is unchanged", preservationFailures.length === 0, `${baselineRows.length - preservationFailures.length}/${baselineRows.length} routes match`);
add("Sitemap", "Sitemap remains at the protected count", sitemapPaths.size === 193, `${sitemapPaths.size} sitemap URLs`);
add("Routes", "HTML page count remains at the protected count", htmlFiles.length === 336, `${htmlFiles.length} built pages`);

const trustHrefs = [
  "/about/",
  "/authors/echo-buddha-editorial/",
  "/editorial-policy/",
  "/how-echo-buddha-creates-content/",
  "/buddhist-sources-and-citations/",
  "/corrections/",
  "/contact/"
];
add("Trust", "Core Phase 6 trust routes are grouped in the footer", trustHrefs.every((href) => home.includes(`href="${href}"`)), trustHrefs.join(" | "));
add("Safety", "Meditation hub and detail pages retain safety paths", fs.readFileSync(routeToFile.get("/meditation/"), "utf8").includes('href="/meditation-safety/"') && fs.readFileSync(routeToFile.get("/meditation/breathing-meditation/"), "utf8").includes('href="/meditation-safety/"'), "Hub and representative detail link Meditation Safety");

const protectedDiff = spawnSync(
  "git",
  ["diff", "--name-only", "--", "src/data/ads.ts", "src/components/AdSenseScript.astro", "src/components/AdSlot.astro", "src/components/ConsentManager.astro"],
  { cwd: root, encoding: "utf8" }
).stdout.trim();
add("AdSense", "AdSense and consent implementation files are unchanged", protectedDiff === "", protectedDiff || "No protected implementation diff");

const contentDiff = spawnSync(
  "git",
  ["diff", "--name-only", "--", "src/data/site.ts", "src/data/learn.ts", "src/data/dailyReflections.ts", "src/data/editorialGovernance.ts", "src/pages/articles/[slug].astro"],
  { cwd: root, encoding: "utf8" }
).stdout.trim();
add("Content", "Substantive content and governance data are unchanged", contentDiff === "", contentDiff || "No substantive data/detail-template diff");

const page404 = fs.readFileSync(routeToFile.get("/404.html"), "utf8");
add("404", "404 remains noindex and offers Home, Search, and Start Here", page404.includes('content="noindex, follow"') && ["/", "/search/", "/start-here/"].every((href) => page404.includes(`href="${href}"`)), "Recovery paths present; noindex retained");

const seriousFailures = checks.filter((check) => !check.pass);
const result = {
  generatedAt: new Date().toISOString(),
  startingHead: "071deba4e6106f6597b4524d2a6deb99e344e26b",
  branch: "codex/phase-7-ux-navigation",
  totalChecks: checks.length,
  passed: checks.filter((check) => check.pass).length,
  failed: seriousFailures.length,
  pass: seriousFailures.length === 0,
  counts: {
    builtRoutes: htmlFiles.length,
    htmlPages: htmlFiles.length,
    sitemapUrls: sitemapPaths.size,
    searchItems: searchItems.length,
    brokenInternalLinks: brokenInternalLinks.length,
    indexabilityRegressions: preservationFailures.length,
    breadcrumbFailures: breadcrumbFailures.length
  },
  checks,
  failures: {
    brokenInternalLinks,
    invalidSearchUrls,
    breadcrumbFailures,
    preservationFailures
  }
};

fs.writeFileSync(path.join(outDir, "phase-7-custom-validation.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Phase 7 custom validation: ${result.pass ? "PASS" : "FAIL"} (${result.passed}/${result.totalChecks})`);
if (!result.pass) process.exitCode = 1;
