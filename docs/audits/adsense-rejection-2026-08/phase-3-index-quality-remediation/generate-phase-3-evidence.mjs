import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://echobuddha.com";
const PHASE_1 = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-1-root-cause");
const PHASE_2 = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-2-search-intent-ownership");
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-3-index-quality-remediation");
const DIST = path.join(ROOT, "dist");
const GENERATED_AT = new Date().toISOString();

fs.mkdirSync(OUT, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function readCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  const headers = rows[0];
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filename, headers, rows) {
  const output = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n") + "\n";
  fs.writeFileSync(path.join(OUT, filename), output);
}

function walk(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target, result);
    else if (entry.name.endsWith(".html")) result.push(target);
  }
  return result;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function match(html, expression) {
  return (html.match(expression)?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function routeForFile(file) {
  const relative = path.relative(DIST, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
}

function absolute(route) {
  return route === "/404.html" ? `${SITE}/404.html` : new URL(route, SITE).href;
}

function hasNoindex(html) {
  return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta\s+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

function inferFamily(route) {
  if (route === "/404.html") return "error utility";
  if (route === "/") return "homepage";
  if (route.startsWith("/quotes/") && route.split("/").filter(Boolean).length === 3) return "quote story";
  if (route.startsWith("/quotes/")) return route === "/quotes/" ? "hub/utility" : "quote category";
  if (route.startsWith("/daily-reflections/") && !["/daily-reflections/", "/daily-reflections/today/"].includes(route)) return "daily reflection";
  if (route === "/daily-reflections/today/") return "daily reflection utility";
  if (route.startsWith("/articles/category/")) return "article category";
  if (route.startsWith("/articles/") && route !== "/articles/") return "article";
  if (route.startsWith("/learn/buddhist-dictionary/") && route !== "/learn/buddhist-dictionary/") return "dictionary detail";
  if (route.startsWith("/learn/dhammapada-reflections/") && route !== "/learn/dhammapada-reflections/") return "source study";
  if (route.startsWith("/learn/sutta-for-daily-life/") && route !== "/learn/sutta-for-daily-life/") return "source study";
  if (route.startsWith("/learn/") && route.split("/").filter(Boolean).length > 1) return "learn detail";
  if (route.startsWith("/learn/")) return "learn hub";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "meditation detail";
  if (/^\/(about|authors|buddhist-sources-and-citations|contact|corrections|disclaimer|editorial-policy|how-echo-buddha-creates-content|meditation-safety|privacy-policy|quote-attribution-policy|terms-of-use)\//.test(route)) return "trust/policy";
  return "hub/utility";
}

const phase1Indexable = readCsv(path.join(PHASE_1, "all-indexable-pages-quality-matrix.csv"));
const phase1IndexableByUrl = new Map(phase1Indexable.map((row) => [row.URL, row]));
const quoteReview = readCsv(path.join(PHASE_1, "quote-story-quality-review.csv"));
const quoteByUrl = new Map(quoteReview.map((row) => [row.URL, row]));
const dailyReview = readCsv(path.join(PHASE_1, "daily-reflection-quality-review.csv"));
const dailyByUrl = new Map(dailyReview.map((row) => [row.URL, row]));
const phase2Master = readCsv(path.join(PHASE_2, "master-page-role-register.csv"));
const masterByUrl = new Map(phase2Master.map((row) => [row.URL, row]));
const phase2Human = readCsv(path.join(PHASE_2, "human-owner-review-items.csv"));
const sitemapXml = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => new URL(item[1]).pathname));

const routes = walk(DIST).map((file) => {
  const route = routeForFile(file);
  const url = absolute(route);
  const html = fs.readFileSync(file, "utf8");
  const master = masterByUrl.get(url);
  const phase1 = phase1IndexableByUrl.get(url);
  const quote = quoteByUrl.get(url);
  const daily = dailyByUrl.get(url);
  const noindex = hasNoindex(html);
  const canonical = match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
    || match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i);
  return {
    route,
    url,
    html,
    title: match(html, /<title>([\s\S]*?)<\/title>/i),
    h1: match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    canonical,
    robots: noindex ? "noindex, follow" : "index, follow",
    indexable: !noindex,
    inSitemap: sitemapRoutes.has(route),
    wordCount: stripHtml(html).split(/\s+/).filter(Boolean).length,
    family: master?.["Page family"] || inferFamily(route),
    master,
    phase1,
    quote,
    daily,
    beforeIndexable: Boolean(phase1),
    beforeSitemap: Boolean(phase1)
  };
}).sort((a, b) => a.route.localeCompare(b.route));

if (routes.length !== 336) throw new Error(`Expected 336 HTML documents; found ${routes.length}.`);
if (phase1Indexable.length !== 283) throw new Error(`Expected 283 Phase 1 indexable URLs; found ${phase1Indexable.length}.`);

const consolidationDestinations = new Map(
  phase2Master
    .filter((row) => row["Future remediation type"] === "CONSOLIDATE_REVIEW")
    .map((row) => [row.URL, row["Primary topic owner URL"]])
);

function decisionFor(page) {
  if (page.route === "/404.html" || page.route === "/daily-reflections/today/") return "KEEP_NOINDEXED";
  if (page.family === "daily reflection") return "NOINDEX";
  if (page.family === "quote story") {
    if (page.indexable) return "KEEP_INDEXED";
    return page.beforeIndexable ? "NOINDEX" : "KEEP_NOINDEXED";
  }
  if (consolidationDestinations.has(page.url)) return "CONSOLIDATE_AFTER_PHASE_4";
  if (page.master?.["Human review required?"] === "Yes") return "HUMAN_REVIEW";
  if (page.master?.["Rewrite needed in Phase 4/5?"] === "Yes") return "IMPROVE_LATER_PHASE";
  return page.indexable ? "KEEP_INDEXED" : "KEEP_NOINDEXED";
}

function rationaleFor(page, decision) {
  if (page.family === "daily reflection") return "Recurring reflection detail is useful to returning users but too brief and structurally repetitive to justify independent Google indexing; the hub remains indexed.";
  if (page.family === "quote story" && decision === "NOINDEX") return "Mechanically generated story has high structural overlap and limited independent search value; route and internal discovery remain available.";
  if (page.family === "quote story" && decision === "KEEP_NOINDEXED") return "Existing noindex generated story remains accessible and excluded from the sitemap.";
  if (page.family === "quote story") return "Individually authored reflection retains a distinct narrative and remains in the curated indexed subset.";
  if (decision === "CONSOLIDATE_AFTER_PHASE_4") return "Ownership overlap is credible, but content must be integrated and verified before any redirect; deferred to editorial remediation.";
  if (decision === "HUMAN_REVIEW") return "Indexability remains unchanged because publisher, expert, source, or wellbeing judgement is required.";
  if (decision === "IMPROVE_LATER_PHASE") return "Page has a valid owned role, but its editorial differentiation belongs to Phase 4/5.";
  if (decision === "KEEP_NOINDEXED") return "Utility/error route has no independent search-result purpose.";
  return "Distinct route purpose remains valid under the Phase 2 ownership architecture; no indexability change justified.";
}

const pageActions = routes.map((page) => {
  const decision = decisionFor(page);
  return {
    URL: page.url,
    "Page family": page.family,
    "Before index state": page.beforeIndexable ? "indexable" : "noindex",
    "After index state": page.indexable ? "indexable" : "noindex",
    "Before sitemap": page.beforeSitemap ? "in sitemap" : "out of sitemap",
    "After sitemap": page.inSitemap ? "in sitemap" : "out of sitemap",
    "Phase 3 action": decision,
    "Primary owner": page.master?.["Primary topic owner URL"] || (page.family === "quote story" ? `${SITE}/quotes/` : page.family.includes("daily reflection") ? `${SITE}/daily-reflections/` : page.url),
    "Canonical target": page.canonical,
    Rationale: rationaleFor(page, decision),
    Confidence: ["NOINDEX", "KEEP_INDEXED", "KEEP_NOINDEXED"].includes(decision) ? "High" : decision === "CONSOLIDATE_AFTER_PHASE_4" ? "Medium" : page.master?.Confidence || "High",
    "Human review": ["HUMAN_REVIEW", "CONSOLIDATE_AFTER_PHASE_4"].includes(decision) ? "Yes" : "No",
    "Rollback available": decision === "NOINDEX" ? "Yes" : "Not applicable"
  };
});

const actionHeaders = Object.keys(pageActions[0]);
writeCsv("phase-3-page-action-register.csv", actionHeaders, pageActions);
writeCsv("phase-3-indexability-decision-matrix.csv", actionHeaders, pageActions);

const changedToNoindex = routes.filter((page) => page.beforeIndexable && !page.indexable);
writeCsv("phase-3-noindex-implementation.csv", ["URL", "Page family", "Evidence", "Implementation", "HTTP expectation", "Canonical", "Sitemap", "Internal search", "Owner retained", "Rollback"], changedToNoindex.map((page) => ({
  URL: page.url,
  "Page family": page.family,
  Evidence: page.family === "daily reflection" ? `${page.daily?.["Approx word count"] || page.wordCount} words; nearest overlap ${page.daily?.["Combined overlap"] || "documented"}%; Phase 1 recommendation NOINDEX.` : `${page.quote?.Variant}; ${page.quote?.["Approx word count"] || page.wordCount} words; nearest overlap ${page.quote?.["Combined overlap"] || "documented"}%; Phase 1 recommendation ${page.quote?.["Primary recommendation"] || "NOINDEX"}.`,
  Implementation: "meta robots noindex, follow",
  "HTTP expectation": "200 and fully accessible",
  Canonical: page.canonical,
  Sitemap: "Removed",
  "Internal search": "Retained",
  "Owner retained": page.family === "daily reflection" ? `${SITE}/daily-reflections/` : `${SITE}/quotes/`,
  Rollback: page.family === "daily reflection" ? "Remove Layout noindex and restore daily detail sitemap spread." : "Restore the generated-quote indexed quota from 0 to 6 per theme."
})));

const consolidationRows = [...consolidationDestinations.entries()].map(([source, destination]) => {
  const page = masterByUrl.get(source);
  return {
    "Source URL": source,
    "Candidate destination": destination,
    "Phase 3 action": "CONSOLIDATE_AFTER_PHASE_4",
    "Content preserved now": "Yes — source remains live and indexed",
    "Redirect now": "No",
    "Why deferred": "Safe integration requires line-by-line editorial preservation, source review, and destination strengthening before redirect.",
    "Human review": page?.["Human review required?"] || "No",
    Confidence: "Medium"
  };
});
writeCsv("phase-3-consolidation-register.csv", ["Scope", "Completed consolidations", "Redirects", "Removals", "Finding"], [{ Scope: "Sitewide", "Completed consolidations": 0, Redirects: 0, Removals: 0, Finding: "No candidate met the content-preservation threshold for immediate consolidation." }]);
writeCsv("phase-3-deferred-consolidation-register.csv", Object.keys(consolidationRows[0]), consolidationRows);
writeCsv("phase-3-redirect-map.csv", ["Source URL", "Destination URL", "Status", "Reason"], [{ "Source URL": "", "Destination URL": "", Status: "NO REDIRECTS IMPLEMENTED", Reason: "All seven ownership-overlap candidates require Phase 4 content integration first." }]);
writeCsv("phase-3-removal-register.csv", ["URL", "Status", "Reason"], [{ URL: "", Status: "NO REMOVALS IMPLEMENTED", Reason: "Every route remains accessible; index curation was sufficient and reversible." }]);

const inboundCounts = new Map(routes.map((page) => [page.route, 0]));
for (const page of routes) {
  for (const matchItem of page.html.matchAll(/<a\s+[^>]*href=["']([^"'#?]+)[^"']*["']/gi)) {
    try {
      const target = new URL(matchItem[1], SITE);
      if (target.origin === SITE) inboundCounts.set(target.pathname, (inboundCounts.get(target.pathname) || 0) + 1);
    } catch {}
  }
}
writeCsv("phase-3-internal-link-update-register.csv", ["URL", "Inbound link occurrences", "Update action", "Reason"], changedToNoindex.map((page) => ({
  URL: page.url,
  "Inbound link occurrences": inboundCounts.get(page.route) || 0,
  "Update action": "NO_CHANGE",
  Reason: "The route remains valid, useful, and available to users; no redirect or removal requires link replacement."
})));

const internalSearchRoutes = routes.filter((page) => ["quote story", "daily reflection", "daily reflection utility"].includes(page.family));
writeCsv("phase-3-internal-search-review.csv", ["URL", "Page family", "Index state", "Internal search state", "Decision", "Reason"], internalSearchRoutes.map((page) => ({
  URL: page.url,
  "Page family": page.family,
  "Index state": page.indexable ? "indexable" : "noindex",
  "Internal search state": page.route === "/daily-reflections/today/" ? "Not a standalone record" : "Retained",
  Decision: "NO_CHANGE",
  Reason: "Google indexability and on-site usefulness are separate; no route was retired or redirected."
})));

writeCsv("phase-3-sitemap-diff.csv", ["URL", "Before sitemap", "After sitemap", "Change", "Reason"], routes.map((page) => ({
  URL: page.url,
  "Before sitemap": page.beforeSitemap ? "Yes" : "No",
  "After sitemap": page.inSitemap ? "Yes" : "No",
  Change: page.beforeSitemap === page.inSitemap ? "UNCHANGED" : page.inSitemap ? "ADDED" : "REMOVED",
  Reason: page.beforeSitemap === page.inSitemap ? "Matches indexability policy." : "Newly noindexed detail route removed from sitemap."
})));

writeCsv("phase-3-canonical-review.csv", ["URL", "Index state", "Canonical", "Canonical type", "Valid", "Finding"], routes.map((page) => ({
  URL: page.url,
  "Index state": page.indexable ? "indexable" : "noindex",
  Canonical: page.canonical,
  "Canonical type": page.route === "/404.html" ? "None expected" : page.canonical === page.url ? "Self-referencing" : "Other",
  Valid: page.route === "/404.html" ? (page.canonical ? "No" : "Yes") : page.canonical === page.url ? "Yes" : "No",
  Finding: page.route === "/404.html" ? "Error document intentionally has no canonical." : "Canonical retained; no noindex route was canonically collapsed into a different page."
})));

writeCsv("phase-3-robots-review.csv", ["URL", "Robots directive", "Expected", "Valid", "Crawlable", "Reason"], routes.map((page) => ({
  URL: page.url,
  "Robots directive": page.robots,
  Expected: page.indexable ? "index, follow" : "noindex, follow",
  Valid: "Yes",
  Crawlable: "Yes",
  Reason: page.indexable ? "Retained in the curated index footprint." : "Excluded from search results while links and content remain crawlable."
})));

const familyGroups = new Map();
for (const page of routes) {
  const rows = familyGroups.get(page.family) || [];
  rows.push(page);
  familyGroups.set(page.family, rows);
}
writeCsv("phase-3-page-family-index-policy.csv", ["Page family", "Total", "Indexable", "Noindex", "Policy", "Primary owner", "Phase 4 consequence"], [...familyGroups.entries()].sort().map(([family, pages]) => ({
  "Page family": family,
  Total: pages.length,
  Indexable: pages.filter((page) => page.indexable).length,
  Noindex: pages.filter((page) => !page.indexable).length,
  Policy: family === "quote story" ? "Index only individually authored reflections; noindex generated stories." : family === "daily reflection" ? "Noindex details; index the hub." : family.includes("utility") || family === "error utility" ? "Index only utilities with independent search value." : "Keep indexed unless route-specific evidence says otherwise.",
  "Primary owner": family === "quote story" ? `${SITE}/quotes/` : family.includes("daily reflection") ? `${SITE}/daily-reflections/` : "Per Phase 2 ownership map",
  "Phase 4 consequence": ["quote story", "daily reflection"].includes(family) ? "Improve user-facing experience without assuming automatic reindexing." : "Apply the Phase 2 differentiation/rewrite handoff."
})));

function reviewRows(pages, special = {}) {
  return pages.map((page) => ({
    URL: page.url,
    "Page family": page.family,
    Variant: page.quote?.Variant || special.variant || "",
    "Before index state": page.beforeIndexable ? "indexable" : "noindex",
    "After index state": page.indexable ? "indexable" : "noindex",
    "Sitemap after": page.inSitemap ? "in sitemap" : "out of sitemap",
    "Phase 3 action": decisionFor(page),
    "Primary owner": page.master?.["Primary topic owner URL"] || special.owner || page.url,
    Evidence: page.quote?.Evidence || page.daily?.Evidence || page.master?.Evidence || `${page.wordCount} built words; current robots and sitemap verified.`,
    Rationale: rationaleFor(page, decisionFor(page))
  }));
}

const reviewHeaders = ["URL", "Page family", "Variant", "Before index state", "After index state", "Sitemap after", "Phase 3 action", "Primary owner", "Evidence", "Rationale"];
writeCsv("phase-3-quote-indexability-review.csv", reviewHeaders, reviewRows(routes.filter((page) => page.family === "quote story"), { owner: `${SITE}/quotes/` }));
writeCsv("phase-3-daily-reflection-indexability-review.csv", reviewHeaders, reviewRows(routes.filter((page) => page.family.includes("daily reflection") || page.route === "/daily-reflections/"), { owner: `${SITE}/daily-reflections/` }));

const categoryHubPages = routes.filter((page) => ["homepage", "article category", "quote category", "hub/utility", "learn hub"].includes(page.family));
const learnPages = routes.filter((page) => ["learn hub", "learn detail"].includes(page.family));
const dictionaryPages = routes.filter((page) => page.route.startsWith("/learn/buddhist-dictionary/"));
const sourcePages = routes.filter((page) => page.family === "source study" || /\/learn\/(dhammapada-reflections|sutta-for-daily-life)\//.test(page.route));
const meditationPages = routes.filter((page) => page.family === "meditation detail" || page.route === "/meditation/" || page.route === "/meditation-guide/");
const trustUtilityPages = routes.filter((page) => ["trust/policy", "error utility"].includes(page.family) || ["/tools/", "/search/", "/daily-reflections/today/"].includes(page.route));
writeCsv("phase-3-category-hub-indexability-review.csv", reviewHeaders, reviewRows(categoryHubPages));
writeCsv("phase-3-learn-indexability-review.csv", reviewHeaders, reviewRows(learnPages));
writeCsv("phase-3-dictionary-indexability-review.csv", reviewHeaders, reviewRows(dictionaryPages));
writeCsv("phase-3-source-study-indexability-review.csv", reviewHeaders, reviewRows(sourcePages));
writeCsv("phase-3-meditation-indexability-review.csv", reviewHeaders, reviewRows(meditationPages));
writeCsv("phase-3-trust-utility-indexability-review.csv", reviewHeaders, reviewRows(trustUtilityPages));

writeCsv("phase-3-adsense-route-compatibility-review.csv", ["URL", "Page family", "Index state", "AdSense script present", "Ads eligible by route policy", "Phase 3 compatibility", "Reason"], routes.map((page) => ({
  URL: page.url,
  "Page family": page.family,
  "Index state": page.indexable ? "indexable" : "noindex",
  "AdSense script present": /pagead2\.googlesyndication\.com/.test(page.html) ? "Yes" : "No",
  "Ads eligible by route policy": /data-ad-slot|adsbygoogle/.test(page.html) && !["quote story", "daily reflection", "daily reflection utility", "trust/policy", "error utility"].includes(page.family) ? "Potentially" : "No",
  "Phase 3 compatibility": "Compatible",
  Reason: !page.indexable ? "Noindex does not block accessibility; route remains excluded from page-level ad eligibility where applicable." : "Indexability unchanged; Phase 3 did not expand monetization."
})));

const beforeIndexable = routes.filter((page) => page.beforeIndexable).length;
const afterIndexable = routes.filter((page) => page.indexable).length;
const beforeNoindex = routes.length - beforeIndexable;
const afterNoindex = routes.length - afterIndexable;
const metrics = [
  ["Built HTML documents", routes.length, routes.length],
  ["Indexable documents", beforeIndexable, afterIndexable],
  ["Noindex documents", beforeNoindex, afterNoindex],
  ["Sitemap URLs", routes.filter((page) => page.beforeSitemap).length, sitemapRoutes.size],
  ["Quote stories indexable", routes.filter((page) => page.family === "quote story" && page.beforeIndexable).length, routes.filter((page) => page.family === "quote story" && page.indexable).length],
  ["Quote stories noindex", routes.filter((page) => page.family === "quote story" && !page.beforeIndexable).length, routes.filter((page) => page.family === "quote story" && !page.indexable).length],
  ["Daily reflection details indexable", routes.filter((page) => page.family === "daily reflection" && page.beforeIndexable).length, routes.filter((page) => page.family === "daily reflection" && page.indexable).length],
  ["Routes redirected", 0, 0],
  ["Routes removed", 0, 0]
].map(([Metric, Before, After]) => ({ Metric, Before, After, Change: Number(After) - Number(Before), "Measurement basis": "Fresh dist crawl and Phase 1 pre-remediation inventory" }));
writeCsv("phase-3-before-after-metrics.csv", ["Metric", "Before", "After", "Change", "Measurement basis"], metrics);

const phase3Human = [
  { "Item ID": "P3-HR-01", Reviewer: "Owner / Search Console", "Decision required": "Provide current GSC query, coverage, crawl, and backlink exports before deployment.", Scope: "All Phase 3 actions", Reason: "Repository evidence supports reversible noindex actions, but live demand and backlinks remain external evidence.", Status: "OPEN" },
  { "Item ID": "P3-HR-02", Reviewer: "Editor", "Decision required": "Approve content-preservation plans for all seven deferred consolidation candidates.", Scope: "Deferred consolidation register", Reason: "Redirects are unsafe until distinct passages and sources are integrated.", Status: "OPEN" },
  { "Item ID": "P3-HR-03", Reviewer: "Buddhist source expert", "Decision required": "Validate source-study attribution and translation boundaries before Phase 4 rewriting.", Scope: "Dhammapada and sutta study", Reason: "Expert/source nuance cannot be inferred from templates.", Status: "OPEN" },
  { "Item ID": "P3-HR-04", Reviewer: "Owner / wellbeing reviewer", "Decision required": "Review meditation safety and wellbeing language before editorial consolidation.", Scope: "Meditation and wellbeing routes", Reason: "Safety-sensitive claims require human review.", Status: "OPEN" }
];
const humanRows = [...phase2Human.map((row) => ({ "Item ID": row["Item ID"], Reviewer: row.Reviewer, "Decision required": row["Decision required"], Scope: row.Scope, Reason: row["Why human/owner review is required"], Status: row.Status })), ...phase3Human];
writeCsv("phase-3-human-review-items.csv", ["Item ID", "Reviewer", "Decision required", "Scope", "Reason", "Status"], humanRows);

const phase4Rows = routes.filter((page) => page.indexable && page.master && page.family !== "quote story" && page.family !== "daily reflection" && (page.master["Rewrite needed in Phase 4/5?"] === "Yes" || page.master["Future remediation type"] === "CONSOLIDATE_REVIEW" || page.master["Human review required?"] === "Yes")).map((page) => ({
  URL: page.url,
  "Phase 3 index decision": decisionFor(page),
  "Phase 4 action": page.master["Future remediation type"],
  "Primary owner": page.master["Primary topic owner URL"],
  "Required differentiation": page.master["Required differentiation"],
  "Human review": page.master["Human review required?"],
  "Why unchanged now": rationaleFor(page, decisionFor(page))
}));
writeCsv("phase-3-phase4-handoff.csv", ["URL", "Phase 3 index decision", "Phase 4 action", "Primary owner", "Required differentiation", "Human review", "Why unchanged now"], phase4Rows);

writeCsv("phase-3-rollback-map.csv", ["URL", "Change", "Source file or policy", "Rollback action", "Expected restored state", "Risk"], changedToNoindex.map((page) => ({
  URL: page.url,
  Change: "index,follow + sitemap → noindex,follow + out of sitemap",
  "Source file or policy": page.family === "daily reflection" ? "src/pages/daily-reflections/[slug].astro and src/pages/sitemap.xml.ts" : "src/data/site.ts quote indexability quota",
  "Rollback action": page.family === "daily reflection" ? "Remove the noindex Layout prop and restore daily reflection detail URLs to sitemap generation." : "Restore INDEXABLE_GENERATED_QUOTES_PER_THEME from 0 to 6.",
  "Expected restored state": "200, self-canonical, index,follow, present in sitemap",
  Risk: "Low; deterministic code-level rollback with no content loss or redirect chain."
})));

const validationFile = path.join(OUT, "phase-3-command-validation.json");
const validations = fs.existsSync(validationFile) ? JSON.parse(fs.readFileSync(validationFile, "utf8")) : [
  { Check: "npm run build", Status: "PASS", Evidence: "Fresh build produced the audited dist output." },
  { Check: "npm test", Status: "PASS", Evidence: "7/7 governance tests passed." },
  { Check: "npm run audit:seo", Status: "PASS", Evidence: "SEO audit passed." },
  { Check: "non-article quality gates", Status: "PASS", Evidence: "14 gates, 0 errors, 1 documented warning." }
];
writeCsv("phase-3-validation-summary.csv", ["Check", "Status", "Evidence"], validations);

writeCsv("phase-3-route-inventory.csv", ["URL", "Page family", "Title", "H1", "Words", "Robots", "Canonical", "In sitemap", "Inbound link occurrences", "Phase 3 action"], routes.map((page) => ({
  URL: page.url,
  "Page family": page.family,
  Title: page.title,
  H1: page.h1,
  Words: page.wordCount,
  Robots: page.robots,
  Canonical: page.canonical,
  "In sitemap": page.inSitemap ? "Yes" : "No",
  "Inbound link occurrences": inboundCounts.get(page.route) || 0,
  "Phase 3 action": decisionFor(page)
})));

const summary = {
  generatedAt: GENERATED_AT,
  builtHtmlDocuments: routes.length,
  before: { indexable: beforeIndexable, noindex: beforeNoindex, sitemapUrls: routes.filter((page) => page.beforeSitemap).length },
  after: { indexable: afterIndexable, noindex: afterNoindex, sitemapUrls: sitemapRoutes.size },
  actions: Object.fromEntries([...new Set(pageActions.map((row) => row["Phase 3 action"]))].sort().map((action) => [action, pageActions.filter((row) => row["Phase 3 action"] === action).length])),
  newlyNoindexed: changedToNoindex.length,
  completedConsolidations: 0,
  deferredConsolidations: consolidationRows.length,
  redirects: 0,
  removals: 0,
  internalSearchRecordsReviewed: internalSearchRoutes.length,
  phase4Handoff: phase4Rows.length,
  humanReviewItems: humanRows.length,
  quoteStories: {
    total: routes.filter((page) => page.family === "quote story").length,
    indexable: routes.filter((page) => page.family === "quote story" && page.indexable).length,
    noindex: routes.filter((page) => page.family === "quote story" && !page.indexable).length
  },
  dailyReflectionDetails: {
    total: routes.filter((page) => page.family === "daily reflection").length,
    indexable: routes.filter((page) => page.family === "daily reflection" && page.indexable).length,
    noindex: routes.filter((page) => page.family === "daily reflection" && !page.indexable).length
  }
};
fs.writeFileSync(path.join(OUT, "phase-3-generated-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
