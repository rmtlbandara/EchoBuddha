import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs/audits/phase-0-baseline-and-protection");
const dist = path.join(root, "dist");
const site = "https://echobuddha.com";

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const parseCsv = (filePath) => {
  const text = fs.readFileSync(filePath, "utf8");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      if (row.some((item) => item !== "")) rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...data] = rows;
  return data.map((dataRow) => Object.fromEntries(header.map((heading, index) => [heading, dataRow[index] ?? ""])));
};

const numberValue = (value) => value === "" ? 0 : Number(value);

const walk = (dir, matcher, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) walk(filePath, matcher, out);
    else if (matcher(filePath)) out.push(filePath);
  }
  return out;
};

const routeFromHtml = (filePath) => {
  const relative = path.relative(dist, filePath).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};

const stripBlocks = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");

const textContent = (html) => stripBlocks(html)
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const classify = (route) => {
  const parts = route.split("/").filter(Boolean);
  if (route === "/") return "homepage";
  if (route === "/404.html") return "error";
  if (route.startsWith("/articles/category/")) return "article category";
  if (route.startsWith("/articles/") && route !== "/articles/") return "article";
  if (route.startsWith("/quotes/") && parts.length === 3) return "quote story";
  if (route.startsWith("/quotes/") && route !== "/quotes/") return "quote category";
  if (route === "/daily-reflections/today/") return "daily reflection utility";
  if (route.startsWith("/daily-reflections/") && route !== "/daily-reflections/") return "daily reflection";
  if (route.startsWith("/learn/") && parts.length === 3) return "learn detail";
  if (route.startsWith("/learn/") && route !== "/learn/") return "learn hub";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "meditation detail";
  if ([
    "/about/",
    "/contact/",
    "/editorial-policy/",
    "/privacy-policy/",
    "/terms-of-use/",
    "/disclaimer/",
    "/authors/echo-buddha-editorial/"
  ].includes(route)) return "trust/policy";
  if ([
    "/learn/",
    "/articles/",
    "/quotes/",
    "/daily-reflections/",
    "/meditation/",
    "/mindful-living/",
    "/start-here/",
    "/tools/",
    "/meditation-guide/"
  ].includes(route)) return "hub";
  return "other";
};

const htmlFiles = walk(dist, (filePath) => filePath.endsWith(".html"));
const routeSet = new Set(htmlFiles.map(routeFromHtml));
const sitemapXml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapRoutes = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
const sitemapSet = new Set(sitemapRoutes);
const pages = [];
const links = [];

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const route = routeFromHtml(filePath);
  const cleaned = stripBlocks(html);
  const text = textContent(html);
  const title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1]?.trim() ?? "";
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1]?.trim() ?? "";
  const robots = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']*)/i)?.[1]?.trim() ?? "";
  const noindex = /noindex/i.test(robots);
  const h1s = [...cleaned.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gis)]
    .map((match) => match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
  const hrefs = [...cleaned.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)].map((match) => match[1]);

  for (const href of hrefs) {
    if (href.startsWith("/") && !href.startsWith("//")) links.push({ from: route, to: new URL(href, site).pathname });
  }

  const externalLinks = hrefs.filter((href) => /^https?:\/\//.test(href) && !href.startsWith(site));
  const sourceSignals = [];
  if (/Selected sources|source note|source context|Access to Insight|Dhammapada|SuttaCentral|Dhammatalks/i.test(text)) {
    sourceSignals.push("source-context-visible");
  }
  if (/Original Echo Buddha quote|not presented as a direct Buddha quote|paraphrase|translation|historical saying/i.test(text)) {
    sourceSignals.push("quote-origin-visible");
  }
  if (/not medical advice|stop|ground|adapt|professional support|crisis|emergency/i.test(text)) {
    sourceSignals.push("safety-boundary-visible");
  }

  pages.push({
    path: route,
    url: `${site}${route}`,
    page_family: classify(route),
    title,
    h1: h1s.join(" | "),
    meta_description: description,
    indexability: noindex ? "noindex, follow" : "indexable",
    canonical,
    sitemap_status: sitemapSet.has(route) ? "in sitemap" : "not in sitemap",
    word_count_estimate: (text.match(/\b[A-Za-z][A-Za-z'-]*\b/g) ?? []).length,
    h1_count: h1s.length,
    internal_outlinks: hrefs.filter((href) => href.startsWith("/") && !href.startsWith("//")).length,
    external_outlinks: externalLinks.length,
    source_attribution_signals: sourceSignals.join("; ") || "none detected by static parser"
  });
}

const inbound = new Map(pages.map((page) => [page.path, 0]));
for (const link of links) {
  if (inbound.has(link.to)) inbound.set(link.to, (inbound.get(link.to) || 0) + 1);
}
for (const page of pages) page.internal_inlinks = inbound.get(page.path) || 0;
pages.sort((a, b) => a.path.localeCompare(b.path));

const pageRows = parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Pages.csv"));
const gscByPath = new Map();
for (const row of pageRows) {
  const url = row["Top pages"];
  if (!url) continue;
  const route = new URL(url).pathname;
  const existing = gscByPath.get(route) ?? { clicks: 0, impressions: 0, weightedPositionNumerator: 0 };
  const impressions = numberValue(row.Impressions);
  existing.clicks += numberValue(row.Clicks);
  existing.impressions += impressions;
  existing.weightedPositionNumerator += impressions * numberValue(row.Position);
  gscByPath.set(route, existing);
}
for (const value of gscByPath.values()) {
  value.ctr = value.impressions ? `${((value.clicks / value.impressions) * 100).toFixed(2)}%` : "";
  value.position = value.impressions ? (value.weightedPositionNumerator / value.impressions).toFixed(2) : "";
  delete value.weightedPositionNumerator;
}

const routeInventory = pages.map((page) => ({
  ...page,
  gsc_clicks: gscByPath.get(page.path)?.clicks ?? 0,
  gsc_impressions: gscByPath.get(page.path)?.impressions ?? 0,
  gsc_ctr: gscByPath.get(page.path)?.ctr ?? "",
  gsc_position: gscByPath.get(page.path)?.position ?? ""
}));

const routeHeaders = [
  "path",
  "url",
  "page_family",
  "title",
  "h1",
  "meta_description",
  "indexability",
  "canonical",
  "sitemap_status",
  "word_count_estimate",
  "h1_count",
  "internal_inlinks",
  "internal_outlinks",
  "external_outlinks",
  "source_attribution_signals",
  "gsc_clicks",
  "gsc_impressions",
  "gsc_ctr",
  "gsc_position"
];
fs.writeFileSync(
  path.join(outDir, "phase-0-route-inventory.csv"),
  `${[routeHeaders.join(","), ...routeInventory.map((row) => routeHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n")}\n`
);
fs.writeFileSync(
  path.join(outDir, "phase-0-route-inventory.json"),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "dist build after Phase 0 validation build",
    site,
    counts: {
      builtHtml: pages.length,
      sitemap: sitemapRoutes.length,
      indexable: pages.filter((page) => page.indexability === "indexable").length,
      noindex: pages.filter((page) => page.indexability !== "indexable").length
    },
    routes: routeInventory
  }, null, 2)}\n`
);

const indexableNotSitemap = pages.filter((page) => page.indexability === "indexable" && !sitemapSet.has(page.path)).map((page) => page.path);
const noindexInSitemap = pages.filter((page) => page.indexability !== "indexable" && sitemapSet.has(page.path)).map((page) => page.path);
const sitemapNotBuilt = sitemapRoutes.filter((route) => !routeSet.has(route));
const builtNotSitemap = pages.filter((page) => !sitemapSet.has(page.path)).map((page) => page.path);
fs.writeFileSync(
  path.join(outDir, "phase-0-sitemap-comparison.json"),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    builtHtmlCount: pages.length,
    sitemapUrlCount: sitemapRoutes.length,
    indexableCount: pages.filter((page) => page.indexability === "indexable").length,
    noindexCount: pages.filter((page) => page.indexability !== "indexable").length,
    indexableNotSitemap,
    noindexInSitemap,
    sitemapNotBuilt,
    builtNotSitemapCount: builtNotSitemap.length,
    builtNotSitemap
  }, null, 2)}\n`
);

const priorityPaths = [
  "/",
  "/learn/buddhist-dictionary/dhamma/",
  "/quotes/patience/",
  "/quotes/letting-go/",
  "/articles/right-speech-buddhism/",
  "/articles/what-is-sangha-buddhist-community/",
  "/learn/buddhist-dictionary/sangha/",
  "/learn/buddhism-for-beginners/",
  "/articles/three-poisons-buddhism-explained/",
  "/articles/five-precepts-in-daily-life/",
  "/quotes/compassion/",
  "/articles/compassion-in-buddhism-beginner-guide/",
  "/articles/dhammapada-reflection-what-we-think/",
  "/learn/buddhist-dictionary/sati/"
];

const roleNotes = {
  "/": "Homepage entry point; preserve concept and route users to Buddhist learning, meditation, quotes, and reflections.",
  "/learn/buddhist-dictionary/dhamma/": "Primary Dhamma dictionary candidate; protect as concise source-aware term page until Phase 1 rewrite.",
  "/quotes/patience/": "Quote category candidate; should support patience/right speech/anger cluster without becoming generic quote farm.",
  "/quotes/letting-go/": "Quote category candidate; should support attachment/non-attachment and impermanence cluster.",
  "/articles/right-speech-buddhism/": "Narrow ethical practice article under Eightfold Path; avoid competing with broad path pillar.",
  "/articles/what-is-sangha-buddhist-community/": "Deeper beginner Sangha article; should pair with concise dictionary definition.",
  "/learn/buddhist-dictionary/sangha/": "Concise Sangha term reference; protect against duplicating the article.",
  "/learn/buddhism-for-beginners/": "Primary beginner Buddhism hub; Start Here remains orientation only.",
  "/articles/three-poisons-buddhism-explained/": "Doctrine article support for ethics/karma/mind clusters; needs source and snippet clarity later.",
  "/articles/five-precepts-in-daily-life/": "Ethics article support; should link to Right Speech and beginner practice clusters.",
  "/quotes/compassion/": "Quote category with GSC signal; protect original-quote disclosure and metta/compassion links.",
  "/articles/compassion-in-buddhism-beginner-guide/": "Compassion support article; avoid creating a broad competing hub until cluster grows.",
  "/articles/dhammapada-reflection-what-we-think/": "Dhammapada attribution candidate; must distinguish paraphrase, translation, and Echo Buddha reflection.",
  "/learn/buddhist-dictionary/sati/": "Dictionary page with one GSC click; monitor, but not a declared Phase 1 priority in the final plan."
};

const phaseNotes = {
  "/": "Preserve in Phase 1; gentle entry-path optimization only.",
  "/learn/buddhist-dictionary/dhamma/": "Phase 1 priority 1.",
  "/quotes/patience/": "Phase 1 priority 4.",
  "/quotes/letting-go/": "Phase 1 priority 3.",
  "/articles/right-speech-buddhism/": "Phase 1 priority 6.",
  "/articles/what-is-sangha-buddhist-community/": "Phase 1 priority 7 cluster work.",
  "/learn/buddhist-dictionary/sangha/": "Phase 1 priority 7 cluster work.",
  "/learn/buddhism-for-beginners/": "Phase 1 priority 2.",
  "/articles/three-poisons-buddhism-explained/": "Phase 1 priority 8.",
  "/articles/five-precepts-in-daily-life/": "Phase 1 priority 8.",
  "/quotes/compassion/": "Later quote-category refinement / monitor.",
  "/articles/compassion-in-buddhism-beginner-guide/": "Later compassion cluster refinement / monitor.",
  "/articles/dhammapada-reflection-what-we-think/": "Phase 1 priority 5.",
  "/learn/buddhist-dictionary/sati/": "Monitor; later dictionary/source-quality refinement."
};

const priority = priorityPaths.map((route) => {
  const page = routeInventory.find((item) => item.path === route);
  return {
    path: route,
    url: `${site}${route}`,
    page_family: page?.page_family ?? "missing",
    current_title: page?.title ?? "MISSING",
    h1: page?.h1 ?? "MISSING",
    meta_description: page?.meta_description ?? "MISSING",
    indexability_canonical_status: page
      ? `${page.indexability}; canonical ${page.canonical || "missing"}; ${page.sitemap_status}`
      : "missing from build",
    word_count_or_visible_estimate: page?.word_count_estimate ?? "",
    source_attribution_notes: page?.source_attribution_signals ?? "",
    internal_link_role: roleNotes[route] ?? "",
    current_gsc_signal: gscByPath.has(route)
      ? `${gscByPath.get(route).clicks} clicks / ${gscByPath.get(route).impressions} impressions / ${gscByPath.get(route).ctr} CTR / avg position ${gscByPath.get(route).position}`
      : "No row in Pages.csv baseline",
    recommended_later_phase_no_rewrite_yet: phaseNotes[route] ?? "No Phase 1 action assigned"
  };
});

const priorityHeaders = [
  "path",
  "url",
  "page_family",
  "current_title",
  "h1",
  "meta_description",
  "indexability_canonical_status",
  "word_count_or_visible_estimate",
  "source_attribution_notes",
  "internal_link_role",
  "current_gsc_signal",
  "recommended_later_phase_no_rewrite_yet"
];
fs.writeFileSync(
  path.join(outDir, "phase-0-priority-page-baseline.csv"),
  `${[priorityHeaders.join(","), ...priority.map((row) => priorityHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n")}\n`
);
fs.writeFileSync(
  path.join(outDir, "phase-0-priority-page-baseline.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source: "dist build plus archived GSC Pages.csv", pages: priority }, null, 2)}\n`
);

const chart = parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Chart.csv"));
const queries = parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Queries.csv"));
const devices = parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Devices.csv"));
const countries = parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Countries.csv"));
const totals = chart.reduce((accumulator, row) => {
  accumulator.clicks += numberValue(row.Clicks);
  accumulator.impressions += numberValue(row.Impressions);
  if (numberValue(row.Impressions) > 0) {
    accumulator.weightedPosition += numberValue(row.Impressions) * numberValue(row.Position);
  }
  return accumulator;
}, { clicks: 0, impressions: 0, weightedPosition: 0 });
totals.ctr = totals.impressions ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : "";
totals.position = totals.impressions ? (totals.weightedPosition / totals.impressions).toFixed(2) : "";
delete totals.weightedPosition;

fs.writeFileSync(
  path.join(outDir, "phase-0-gsc-baseline-summary.json"),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    dateRange: {
      from: chart.find((row) => numberValue(row.Impressions) > 0 || numberValue(row.Clicks) > 0)?.Date,
      to: [...chart].reverse().find((row) => numberValue(row.Impressions) > 0 || numberValue(row.Clicks) > 0)?.Date,
      filter: parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Filters.csv"))
    },
    totals,
    devices,
    countriesTop10: countries.slice(0, 10),
    topPages: pageRows.slice(0, 20),
    topQueries: queries.slice(0, 30),
    searchAppearanceRows: parseCsv(path.join(outDir, "gsc-baseline-2026-08-05", "Search appearance.csv")).length
  }, null, 2)}\n`
);

console.log(JSON.stringify({
  routes: pages.length,
  sitemap: sitemapRoutes.length,
  indexable: pages.filter((page) => page.indexability === "indexable").length,
  noindex: pages.filter((page) => page.indexability !== "indexable").length,
  indexableNotSitemap: indexableNotSitemap.length,
  noindexInSitemap: noindexInSitemap.length,
  sitemapNotBuilt: sitemapNotBuilt.length,
  priority: priority.length,
  gscTotals: totals
}, null, 2));
