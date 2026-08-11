import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "docs/audits/adsense-rejection-2026-08/reconciliation");
const phase0Dir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-0-retroactive-baseline");
const historicalRoot = process.env.ECHO_BUDDHA_FORENSIC_WORKTREE;

if (!historicalRoot) {
  throw new Error("Set ECHO_BUDDHA_FORENSIC_WORKTREE to the isolated a1cd457 worktree.");
}

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[\",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const writeCsv = async (file, rows, headers) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  await writeFile(path.join(outputDir, file), `${body}\n`);
};

const walk = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir)) {
    const absolute = path.join(dir, entry);
    const info = await stat(absolute);
    if (info.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
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

const first = (html, regex) => decode((html.match(regex)?.[1] ?? "").replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim());
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const routeForFile = (dist, file) => {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};

const familyForRoute = (route) => {
  if (route === "/") return "homepage";
  if (route === "/404.html") return "error utility";
  const segment = route.split("/").filter(Boolean)[0] ?? "other";
  if (["about", "editorial-policy", "how-echo-buddha-creates-content", "buddhist-sources-and-citations", "quote-attribution-policy", "meditation-safety", "privacy-policy", "terms-of-use", "contact", "corrections", "disclaimer", "authors"].includes(segment)) return "trust/policy";
  if (["search", "tools", "start-here"].includes(segment)) return "utility/navigation";
  return segment;
};

const collectBuild = async (buildRoot, label) => {
  const dist = path.join(buildRoot, "dist");
  const htmlFiles = (await walk(dist)).filter((file) => file.endsWith(".html")).sort();
  const sitemapText = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const sitemapUrls = new Set([...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
  const rows = [];
  const knownRoutes = new Set(htmlFiles.map((file) => routeForFile(dist, file)));

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const route = routeForFile(dist, file);
    const url = route === "/404.html" ? "https://echobuddha.com/404.html" : `https://echobuddha.com${route}`;
    const robots = first(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i) || "index, follow (implicit)";
    const canonical = first(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const title = first(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1 = first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const description = first(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const text = cleanText(html);
    const hrefs = [...html.matchAll(/<a\b[^>]*\shref=["']([^"'#?]+)[^"']*["']/gi)].map((match) => match[1]);
    const internalRoutes = hrefs
      .filter((href) => href.startsWith("/") || href.startsWith("https://echobuddha.com/"))
      .map((href) => href.replace(/^https:\/\/echobuddha\.com/, "").replace(/\?.*$/, ""));
    const broken = [...new Set(internalRoutes.filter((href) => !href.startsWith("/search/") && !href.includes(".") && !knownRoutes.has(href.endsWith("/") ? href : `${href}/`)))];
    const schemaTypes = [...html.matchAll(/["']@type["']\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]);
    const adsenseScripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']*(?:adsbygoogle|googlesyndication)[^"']*)["'][^>]*>/gi)].map((match) => match[1]);
    const publisherIds = [...new Set([...html.matchAll(/ca-pub-\d+/g)].map((match) => match[0]))];
    rows.push({
      snapshot: label,
      route,
      url,
      family: familyForRoute(route),
      title,
      h1,
      description,
      words: text ? text.split(/\s+/).length : 0,
      robots,
      indexable: /noindex/i.test(robots) ? "No" : "Yes",
      canonical,
      canonical_matches_url: canonical === url ? "Yes" : canonical ? "No" : "N/A",
      in_sitemap: sitemapUrls.has(url) ? "Yes" : "No",
      internal_links: internalRoutes.length,
      broken_internal_routes: broken.join(" | "),
      schema_types: [...new Set(schemaTypes)].join(" | "),
      adsense_script_count: adsenseScripts.length,
      adsense_script_urls: adsenseScripts.join(" | "),
      publisher_ids: publisherIds.join(" | "),
      html_sha256: sha256(html),
      text_sha256: sha256(text),
    });
  }
  return { rows, sitemapUrls, sitemapText };
};

const current = await collectBuild(root, "CURRENT_REPOSITORY_WORKING_TREE");
const historical = await collectBuild(historicalRoot, "FORENSIC_BASELINE_COMMIT_a1cd457");
const currentByRoute = new Map(current.rows.map((row) => [row.route, row]));
const historicalByRoute = new Map(historical.rows.map((row) => [row.route, row]));

const routeRows = current.rows.map((row) => ({
  Route: row.route,
  URL: row.url,
  "Page family": row.family,
  "Historical route present?": historicalByRoute.has(row.route) ? "Yes" : "No",
  "Current route present?": "Yes",
  "Route drift": historicalByRoute.has(row.route) ? "NONE" : "ADDED_SINCE_FORENSIC_BASELINE",
  "Current title": row.title,
  "Current H1": row.h1,
  Evidence: "Current dist build plus forensic a1cd457 isolated dist build",
}));
await writeCsv("phase-0-4-current-route-inventory.csv", routeRows, Object.keys(routeRows[0]));

const contentRows = current.rows.map((row) => {
  const old = historicalByRoute.get(row.route);
  return {
    URL: row.url,
    "Page family": row.family,
    "Current title": row.title,
    "Current H1": row.h1,
    "Current rendered words": row.words,
    "Forensic baseline rendered words": old?.words ?? "NOT_PRESENT",
    "Rendered text changed?": old ? (old.text_sha256 === row.text_sha256 ? "No" : "Yes") : "N/A_NEW_ROUTE",
    "Current schema types": row.schema_types,
    "Current rendered text SHA-256": row.text_sha256,
  };
});
await writeCsv("phase-0-4-current-content-inventory.csv", contentRows, Object.keys(contentRows[0]));

const indexRows = current.rows.map((row) => {
  const old = historicalByRoute.get(row.route);
  return {
    URL: row.url,
    "Page family": row.family,
    "Forensic baseline indexable?": old?.indexable ?? "NOT_PRESENT",
    "Current indexable?": row.indexable,
    "Current robots": row.robots,
    "Forensic baseline sitemap?": old?.in_sitemap ?? "NOT_PRESENT",
    "Current sitemap?": row.in_sitemap,
    "Current canonical": row.canonical,
    "Canonical matches route?": row.canonical_matches_url,
    "Index-state drift": !old ? "NEW_ROUTE" : old.indexable === row.indexable && old.in_sitemap === row.in_sitemap ? "NONE" : `${old.indexable}/${old.in_sitemap} -> ${row.indexable}/${row.in_sitemap}`,
  };
});
await writeCsv("phase-0-4-current-indexability-inventory.csv", indexRows, Object.keys(indexRows[0]));

const sitemapRows = current.rows.map((row) => ({
  URL: row.url,
  "Current indexable?": row.indexable,
  "In current sitemap?": row.in_sitemap,
  "In forensic sitemap?": historicalByRoute.get(row.route)?.in_sitemap ?? "NOT_PRESENT",
  Result: row.indexable === row.in_sitemap ? "PASS" : row.route === "/404.html" && row.indexable === "No" && row.in_sitemap === "No" ? "PASS" : "FAIL",
}));
await writeCsv("phase-0-4-current-sitemap-review.csv", sitemapRows, Object.keys(sitemapRows[0]));

const canonicalRows = current.rows.map((row) => ({
  URL: row.url,
  Canonical: row.canonical,
  "Canonical matches route?": row.canonical_matches_url,
  Result: row.route === "/404.html" && !row.canonical ? "PASS" : row.canonical_matches_url === "Yes" ? "PASS" : "FAIL",
}));
await writeCsv("phase-0-4-current-canonical-review.csv", canonicalRows, Object.keys(canonicalRows[0]));

const internalRows = current.rows.map((row) => ({
  URL: row.url,
  "Internal link occurrences": row.internal_links,
  "Broken internal route candidates": row.broken_internal_routes,
  Result: row.broken_internal_routes ? "REVIEW" : "PASS",
}));
await writeCsv("phase-0-4-current-internal-link-review.csv", internalRows, Object.keys(internalRows[0]));

const adsenseRows = current.rows.map((row) => ({
  URL: row.url,
  "AdSense script count": row.adsense_script_count,
  "AdSense script URLs": row.adsense_script_urls,
  "Publisher IDs": row.publisher_ids,
  "Indexable?": row.indexable,
  Result: row.adsense_script_count > 0 && row.publisher_ids ? "SCRIPT_AND_PUBLISHER_PRESENT" : "NO_ADSENSE_SCRIPT_DETECTED",
}));
await writeCsv("phase-0-4-current-adsense-review.csv", adsenseRows, Object.keys(adsenseRows[0]));

const historicalRows = historical.rows.map((row) => ({
  URL: row.url,
  "Page family": row.family,
  Title: row.title,
  H1: row.h1,
  "Rendered words": row.words,
  Robots: row.robots,
  Indexable: row.indexable,
  Canonical: row.canonical,
  "In sitemap": row.in_sitemap,
  "HTML SHA-256": row.html_sha256,
  "Evidence class": "PRIMARY_REPOSITORY_EVIDENCE",
  "Evidence locator": "Git commit a1cd457345587670133bfc58af1cafd80d038e6e; isolated reproducible build",
}));
await writeCsv(path.join("..", "phase-0-retroactive-baseline", "phase-0-historical-route-content-indexability.csv"), historicalRows, Object.keys(historicalRows[0]));

const historicalAdsenseRows = historical.rows.map((row) => ({
  URL: row.url,
  "AdSense script count": row.adsense_script_count,
  "AdSense script URLs": row.adsense_script_urls,
  "Publisher IDs": row.publisher_ids,
  "Evidence class": "PRIMARY_REPOSITORY_EVIDENCE",
}));
const historicalAdsenseBody = [Object.keys(historicalAdsenseRows[0]).join(","), ...historicalAdsenseRows.map((row) => Object.keys(row).map((header) => csvEscape(row[header])).join(","))].join("\n");
await writeFile(path.join(phase0Dir, "phase-0-historical-adsense-implementation.csv"), `${historicalAdsenseBody}\n`);

const summary = {
  generatedAt: new Date().toISOString(),
  forensicBaselineCommit: "a1cd457345587670133bfc58af1cafd80d038e6e",
  historical: {
    routes: historical.rows.length,
    indexable: historical.rows.filter((row) => row.indexable === "Yes").length,
    noindex: historical.rows.filter((row) => row.indexable === "No").length,
    sitemapUrls: historical.sitemapUrls.size,
    adsenseRoutes: historical.rows.filter((row) => row.adsense_script_count > 0).length,
  },
  current: {
    routes: current.rows.length,
    indexable: current.rows.filter((row) => row.indexable === "Yes").length,
    noindex: current.rows.filter((row) => row.indexable === "No").length,
    sitemapUrls: current.sitemapUrls.size,
    adsenseRoutes: current.rows.filter((row) => row.adsense_script_count > 0).length,
    canonicalFailures: canonicalRows.filter((row) => row.Result === "FAIL").length,
    sitemapFailures: sitemapRows.filter((row) => row.Result === "FAIL").length,
    internalLinkReviewRows: internalRows.filter((row) => row.Result === "REVIEW").length,
  },
  comparison: {
    addedRoutes: current.rows.filter((row) => !historicalByRoute.has(row.route)).map((row) => row.route),
    removedRoutes: historical.rows.filter((row) => !currentByRoute.has(row.route)).map((row) => row.route),
    indexStateChanges: indexRows.filter((row) => row["Index-state drift"] !== "NONE").length,
    renderedTextChanges: contentRows.filter((row) => row["Rendered text changed?"] === "Yes").length,
  },
};
await writeFile(path.join(phase0Dir, "phase-0-historical-repository-baseline.json"), `${JSON.stringify(summary, null, 2)}\n`);
await writeFile(path.join(outputDir, "phase-0-4-inventory-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
