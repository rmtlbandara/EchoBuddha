import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const auditDir = path.join(root, "docs", "audits", "phase-1-resolve-strengthen-protect-2026-09-29");
const siteUrl = "https://echobuddha.com";
const generatedAt = "2026-09-29T00:00:00.000Z";

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(read(file));
const normalizeRoute = (value) => {
  const pathname = new URL(value, siteUrl).pathname;
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") || path.extname(pathname) ? pathname : `${pathname}/`;
};
const htmlFileForRoute = (route) => route === "/" ? path.join(dist, "index.html") : path.join(dist, route, "index.html");
const decodeHtml = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&#39;", "'")
  .replaceAll("&quot;", '"')
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");
const stripHtml = (value) => decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const unique = (values) => [...new Set(values)];

const checks = [];
function check(name, condition, details) {
  checks.push({ name, status: condition ? "PASS" : "FAIL", details });
}

const sitemapXml = read("dist/sitemap.xml");
const sitemapRoutes = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => normalizeRoute(match[1]));
const sitemapSet = new Set(sitemapRoutes);
const registryPayload = readJson("docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/INTENT_OWNERSHIP_REGISTRY.json");
const registry = registryPayload.records;
const registrySet = new Set(registry.map((row) => row.url));
const searchIndex = readJson("dist/search-index.json");
const searchRoutes = searchIndex.map((row) => normalizeRoute(row.url));
const searchSet = new Set(searchRoutes);
const intentionallySearchExcluded = new Set([
  "/articles/",
  "/privacy-policy/",
  "/terms-of-use/",
  "/disclaimer/",
  "/articles/category/buddhist-wisdom/",
  "/articles/category/meditation/",
  "/articles/category/mindfulness/",
  "/articles/category/reflection/",
  "/articles/category/practice/",
  "/quotes/mindfulness/",
  "/quotes/compassion/",
  "/quotes/patience/",
  "/quotes/awareness/",
  "/quotes/practice/",
  "/quotes/letting-go/",
  "/quotes/meditation/",
  "/quotes/renewal/",
  "/quotes/wisdom/",
  "/quotes/impermanence/"
]);
const priority = registry.filter((row) => !row.declaredOwnerCluster.startsWith("Standalone:"));
const clusters = unique(priority.map((row) => row.declaredOwnerCluster));
const changedRows = read("docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/CONTENT_CHANGE_REGISTER.csv")
  .trim().split("\n").slice(1).map((line) => line.match(/^([^,]+)/)?.[1]).filter(Boolean);
const protectionCsv = read("docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/SEARCH_PROTECTION_BEFORE_AFTER.csv");
const sourceCsv = read("docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/SOURCE_REVIEW_REGISTER.csv");

check("Sitemap URLs are unique", sitemapRoutes.length === sitemapSet.size, `${sitemapRoutes.length} entries; ${sitemapSet.size} unique`);
check("Registry covers the complete sitemap", registry.length === sitemapRoutes.length && registrySet.size === registry.length && sitemapRoutes.every((route) => registrySet.has(route)), `${registry.length} registry records; ${sitemapRoutes.length} sitemap URLs`);
const searchMissing = sitemapRoutes.filter((route) => !searchSet.has(route));
check("On-site search exclusions match the intentional route policy", searchMissing.length === intentionallySearchExcluded.size && searchMissing.every((route) => intentionallySearchExcluded.has(route)), `${searchIndex.length} search records; ${searchMissing.length} intentionally excluded navigation/policy routes`);
check("Six protected clusters are registered", clusters.length === 6, `${clusters.length} clusters; ${priority.length} priority URLs`);
check("Each protected cluster has one broad owner", clusters.every((cluster) => priority.filter((row) => row.declaredOwnerCluster === cluster && row.primaryOwner).length === 1), clusters.map((cluster) => `${cluster}: ${priority.filter((row) => row.declaredOwnerCluster === cluster && row.primaryOwner).length}`).join("; "));

const htmlByRoute = new Map();
for (const route of sitemapRoutes) {
  const file = htmlFileForRoute(route);
  if (fs.existsSync(file)) htmlByRoute.set(route, fs.readFileSync(file, "utf8"));
}
check("Every sitemap route has rendered HTML", htmlByRoute.size === sitemapRoutes.length, `${htmlByRoute.size}/${sitemapRoutes.length}`);

const canonicalFailures = [];
const noindexFailures = [];
const missingH1 = [];
const metadata = [];
for (const [route, html] of htmlByRoute) {
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] ?? "";
  if (canonical !== `${siteUrl}${route}`) canonicalFailures.push(`${route} -> ${canonical || "MISSING"}`);
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) noindexFailures.push(route);
  const h1 = stripHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  if (!h1) missingH1.push(route);
  metadata.push({
    route,
    title: stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    description: html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "",
    canonical
  });
}
check("Indexable routes remain self-canonical", canonicalFailures.length === 0, canonicalFailures.join("; ") || `${sitemapRoutes.length} self-canonicals`);
check("Sitemap contains no noindex routes", noindexFailures.length === 0, noindexFailures.join("; ") || "0 noindex conflicts");
check("Every indexable page has one visible H1", missingH1.length === 0, missingH1.join("; ") || `${sitemapRoutes.length} pages with H1`);

const duplicatesFor = (key) => {
  const groups = new Map();
  for (const row of metadata) {
    const value = row[key].trim().toLowerCase();
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), row.route]);
  }
  return [...groups.values()].filter((routes) => routes.length > 1);
};
const duplicateTitles = duplicatesFor("title");
const duplicateDescriptions = duplicatesFor("description");
check("Indexable titles are unique", duplicateTitles.length === 0, duplicateTitles.map((routes) => routes.join(" | ")).join("; ") || "0 duplicate title groups");
check("Indexable descriptions are unique", duplicateDescriptions.length === 0, duplicateDescriptions.map((routes) => routes.join(" | ")).join("; ") || "0 duplicate description groups");

const ownerLinkFailures = [];
for (const row of priority) {
  if (row.url === row.ownerUrl) continue;
  const html = htmlByRoute.get(row.url) ?? "";
  const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)].map((match) => normalizeRoute(match[1]));
  if (!hrefs.includes(row.ownerUrl)) ownerLinkFailures.push(`${row.url} -> ${row.ownerUrl}`);
}
check("Priority support pages link to their declared owner", ownerLinkFailures.length === 0, ownerLinkFailures.join("; ") || `${priority.length} priority relationships verified`);

const brokenLinks = [];
const brokenFragments = [];
for (const [sourceRoute, html] of htmlByRoute) {
  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)) {
    const href = decodeHtml(match[1]);
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const url = new URL(href, siteUrl);
    const targetRoute = normalizeRoute(url.pathname);
    const targetHtmlFile = htmlFileForRoute(targetRoute);
    const targetAssetFile = path.join(dist, url.pathname.replace(/^\//, ""));
    if (!fs.existsSync(targetHtmlFile) && !fs.existsSync(targetAssetFile)) {
      brokenLinks.push(`${sourceRoute} -> ${href}`);
      continue;
    }
    if (url.hash && fs.existsSync(targetHtmlFile)) {
      const targetHtml = fs.readFileSync(targetHtmlFile, "utf8");
      const id = decodeURIComponent(url.hash.slice(1));
      if (!new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(targetHtml)) brokenFragments.push(`${sourceRoute} -> ${href}`);
    }
  }
}
check("Rendered internal links resolve", brokenLinks.length === 0, brokenLinks.slice(0, 20).join("; ") || "0 broken internal hrefs");
check("Rendered internal fragments resolve", brokenFragments.length === 0, brokenFragments.slice(0, 20).join("; ") || "0 broken internal fragments");

const distHtml = [...htmlByRoute.values()].join("\n");
check("Obsolete FAQPage schema is absent", !distHtml.includes('"@type":"FAQPage"') && !distHtml.includes('"@type": "FAQPage"'), "Visible FAQs remain; 0 FAQPage objects in indexable output");
check("Obsolete HowTo schema is absent", !distHtml.includes('"@type":"HowTo"') && !distHtml.includes('"@type": "HowTo"'), "Visible meditation steps remain; 0 HowTo objects in indexable output");

const changedSchemaFailures = [];
const visibleFaqFailures = [];
for (const route of changedRows) {
  const html = htmlByRoute.get(route) ?? "";
  if (!/"@type":(?:"BlogPosting"|\["BlogPosting","Article"\])/.test(html) || !html.includes('"@type":"BreadcrumbList"')) changedSchemaFailures.push(route);
  if (!/Frequently asked questions/i.test(html)) visibleFaqFailures.push(route);
}
check("Changed articles retain Article and breadcrumb schema", changedSchemaFailures.length === 0, changedSchemaFailures.join("; ") || `${changedRows.length} article schema pairs verified`);
check("Changed articles retain visible reader FAQs", visibleFaqFailures.length === 0, visibleFaqFailures.join("; ") || `${changedRows.length} visible FAQ sections verified`);

const numberedTocHtml = htmlByRoute.get("/articles/noble-eightfold-path-practical-guide/") ?? "";
check("Explicitly numbered headings avoid duplicate TOC markers", /class="already-numbered"/.test(numberedTocHtml), "Numbered Eightfold Path review headings use the already-numbered class");

const paragraphs = new Map();
for (const route of changedRows) {
  const html = htmlByRoute.get(route) ?? "";
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  for (const match of main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = stripHtml(match[1]).replace(/\s+/g, " ").trim();
    if (text.length < 300 || /meditation material is educational|this article is educational|not a substitute for|Echo Buddha Editorial/i.test(text)) continue;
    const key = text.toLowerCase();
    paragraphs.set(key, [...(paragraphs.get(key) ?? []), route]);
  }
}
const duplicatedLongParagraphs = [...paragraphs.values()].filter((routes) => unique(routes).length > 1);
check("Changed articles do not duplicate long substantive paragraphs", duplicatedLongParagraphs.length === 0, duplicatedLongParagraphs.map((routes) => unique(routes).join(" | ")).join("; ") || "0 duplicated substantive paragraphs of 300+ characters");

check("Changed pages retain named source context", sourceCsv.split("\n").slice(1).filter(Boolean).length === changedRows.length && !sourceCsv.includes(",0,"), `${changedRows.length} source-review rows`);
check("Growth protections remain non-destructive", !protectionCsv.match(/,(?:[1-9]\d*),(?:[1-9]\d*),/) && !protectionCsv.includes(",NOINDEX,") && [...protectionCsv.matchAll(/https:\/\/echobuddha\.com([^,\n]+),https:\/\/echobuddha\.com([^,\n]+)/g)].every((match) => match[1] === match[2]), "0 redirects; 0 noindex changes; 0 cross-page canonical changes");

const result = {
  generatedAt,
  status: checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL",
  totalChecks: checks.length,
  passed: checks.filter((item) => item.status === "PASS").length,
  failed: checks.filter((item) => item.status === "FAIL").length,
  counts: {
    sitemapUrls: sitemapRoutes.length,
    registryRecords: registry.length,
    searchRecords: searchIndex.length,
    priorityUrls: priority.length,
    changedArticles: changedRows.length
  },
  checks
};

fs.mkdirSync(auditDir, { recursive: true });
fs.writeFileSync(path.join(auditDir, "PHASE_1_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(auditDir, "TECHNICAL_SEO_VALIDATION.md"), `# Technical SEO Validation\n\nStatus: **${result.status}**  \nChecked: 2026-09-29\n\n- Build output: ${sitemapRoutes.length} indexable routes with rendered HTML.\n- Canonicals: ${canonicalFailures.length ? `${canonicalFailures.length} failures` : "all sitemap routes self-canonical"}.\n- Robots/indexability: ${noindexFailures.length ? `${noindexFailures.length} sitemap/noindex conflicts` : "no sitemap/noindex conflicts"}.\n- Sitemap: ${sitemapRoutes.length} unique URLs; exact registry coverage.\n- Search index: ${searchIndex.length} records; ${sitemapRoutes.length - searchMissing.length}/${sitemapRoutes.length} sitemap routes are intentionally searchable and the remaining ${searchMissing.length} navigation/policy routes match the explicit exclusion set.\n- Schema: Article/BreadcrumbList retained on ${changedRows.length} changed articles; obsolete FAQPage and HowTo objects removed while visible content remains.\n- Redirects: none introduced.\n- Broken links: ${brokenLinks.length}; broken fragments: ${brokenFragments.length}.\n- Metadata: ${duplicateTitles.length} duplicate title groups; ${duplicateDescriptions.length} duplicate description groups.\n\n## Automated checks\n\n${checks.map((item) => `- ${item.status === "PASS" ? "PASS" : "FAIL"}: ${item.name} — ${item.details}`).join("\n")}\n`);

for (const item of checks) console.log(`${item.status.padEnd(4)} ${item.name}: ${item.details}`);
if (result.status !== "PASS") {
  console.error(`Phase 1 validation failed: ${result.failed}/${result.totalChecks} checks failed.`);
  process.exit(1);
}
console.log(`Phase 1 validation passed: ${result.passed}/${result.totalChecks} checks.`);
