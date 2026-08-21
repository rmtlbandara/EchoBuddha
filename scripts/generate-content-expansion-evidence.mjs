import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const outDir = path.join(root, "docs/content-expansion");
const site = "https://echobuddha.com";
const stageArg = process.argv.find((arg) => arg.startsWith("--stage="));
const stage = stageArg?.split("=")[1] ?? "pre";

if (!new Set(["pre", "post"]).has(stage)) {
  throw new Error("Use --stage=pre or --stage=post.");
}

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const writeCsv = (fileName, headers, rows) => {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, fileName), `${body}\n`);
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};

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

const decode = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

const plainText = (html) => decode(stripBlocks(html)
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim());

const classify = (route) => {
  if (route === "/") return "homepage";
  if (route === "/404.html") return "error";
  if (route.startsWith("/articles/category/")) return "articleCategory";
  if (route.startsWith("/articles/") && route !== "/articles/") return "article";
  if (route.startsWith("/quotes/") && route.split("/").filter(Boolean).length === 3) return "quoteStory";
  if (route.startsWith("/quotes/") && route !== "/quotes/") return "quoteCategory";
  if (route === "/daily-reflections/today/") return "todayReflection";
  if (route.startsWith("/daily-reflections/") && route !== "/daily-reflections/") return "dailyReflection";
  if (route.startsWith("/learn/") && route.split("/").filter(Boolean).length === 3) return "learningDetail";
  if (route.startsWith("/learn/") && route !== "/learn/") return "learningHub";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "meditationDetail";
  if (["/about/", "/contact/", "/editorial-policy/", "/privacy-policy/", "/terms-of-use/", "/disclaimer/", "/authors/echo-buddha-editorial/"].includes(route)) return "trustPolicy";
  if (["/learn/", "/articles/", "/quotes/", "/daily-reflections/", "/meditation/", "/mindful-living/", "/start-here/", "/tools/"].includes(route)) return "hub";
  return "other";
};

const sourcePathFor = (route, family) => {
  if (["article", "articleCategory", "quoteStory", "quoteCategory"].includes(family)) return "src/data/site.ts";
  if (["dailyReflection", "todayReflection"].includes(family)) return "src/data/dailyReflections.ts";
  if (["learningDetail", "meditationDetail"].includes(family)) return "src/data/learn.ts";
  if (route === "/") return "src/pages/index.astro";
  if (route === "/quotes/") return "src/pages/quotes.astro";
  const direct = path.join(root, "src/pages", `${route.replace(/^\//, "").replace(/\/$/, "")}.astro`);
  if (fs.existsSync(direct)) return path.relative(root, direct).split(path.sep).join("/");
  if (route.startsWith("/learn/") && route.split("/").filter(Boolean).length === 2) return `src/pages/${route.replace(/^\//, "").replace(/\/$/, "")}.astro`;
  if (family === "article") return "src/pages/articles/[slug].astro + src/data/site.ts";
  if (family === "articleCategory") return "src/pages/articles/category/[category].astro + src/data/site.ts";
  if (family === "quoteStory") return "src/pages/quotes/[category]/[story].astro + src/data/site.ts";
  if (family === "quoteCategory") return "src/pages/quotes/[category].astro + src/data/site.ts";
  if (family === "dailyReflection") return "src/pages/daily-reflections/[slug].astro + src/data/dailyReflections.ts";
  if (family === "learningDetail") return "src/pages/learn/[section]/[slug].astro + src/data/learn.ts";
  if (family === "meditationDetail") return "src/pages/meditation/[slug].astro + src/data/learn.ts";
  return "src/pages/**";
};

const templateFor = (family) => ({
  article: "src/pages/articles/[slug].astro",
  articleCategory: "src/pages/articles/category/[category].astro",
  quoteStory: "src/pages/quotes/[category]/[story].astro",
  quoteCategory: "src/pages/quotes/[category].astro",
  dailyReflection: "src/pages/daily-reflections/[slug].astro",
  todayReflection: "src/pages/daily-reflections/today.astro",
  learningDetail: "src/pages/learn/[section]/[slug].astro",
  learningHub: "src/pages/learn/[section]/index.astro or authored Learn page",
  meditationDetail: "src/pages/meditation/[slug].astro",
}[family] ?? "authored Astro page");

const primaryIntentFor = (family) => ({
  homepage: "Navigational and discovery",
  article: "Practical Buddhist education",
  articleCategory: "Article discovery",
  quoteStory: "Original quote interpretation",
  quoteCategory: "Quote collection discovery",
  dailyReflection: "Recurring reflective practice",
  todayReflection: "Recurring utility",
  learningDetail: "Beginner educational reference",
  learningHub: "Structured learning navigation",
  meditationDetail: "Guided meditation practice",
  trustPolicy: "Trust and user protection",
  hub: "Navigation and exploration",
  error: "Error recovery",
}[family] ?? "General informational");

const contentRoleFor = (family) => ({
  article: "practical/support article",
  articleCategory: "category hub",
  quoteStory: "quote reflection",
  quoteCategory: "quote hub",
  dailyReflection: "recurring reflection",
  todayReflection: "noindex recurring utility",
  learningDetail: "learning reference",
  learningHub: "learning hub",
  meditationDetail: "meditation instruction",
  trustPolicy: "trust/policy",
  hub: "site hub",
  homepage: "site entry",
}[family] ?? family);

if (!fs.existsSync(dist)) throw new Error("Missing dist. Run npm run build first.");
fs.mkdirSync(outDir, { recursive: true });

const gscPath = process.env.GSC_EVIDENCE_PATH
  ? path.resolve(root, process.env.GSC_EVIDENCE_PATH)
  : path.join(outDir, "source-data/gsc-snapshot-2026-08-21.json");
const gsc = fs.existsSync(gscPath)
  ? JSON.parse(fs.readFileSync(gscPath, "utf8"))
  : { performance: { pages: [] } };
const pageRows = gsc.performance.pages.slice(1);
const gscPages = new Map(pageRows.map(([url, clicks, impressions, ctr, position]) => [url, { clicks, impressions, ctr, position }]));

const roleRegisterPath = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-2-search-intent-ownership/master-page-role-register.csv");
const roleRegister = parseCsv(fs.readFileSync(roleRegisterPath, "utf8"));
const roles = new Map(roleRegister.map((row) => [row.URL, row]));

const sitemapXml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname));
const htmlFiles = walk(dist, (filePath) => filePath.endsWith(".html"));
const routeSet = new Set(htmlFiles.map(routeFromHtml));
const rawPages = htmlFiles.map((filePath) => {
  const html = fs.readFileSync(filePath, "utf8");
  const route = routeFromHtml(filePath);
  const url = new URL(route, site).toString();
  const cleaned = stripBlocks(html);
  const family = classify(route);
  const title = decode(html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() ?? "");
  const description = decode(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1]?.trim() ?? "");
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1]?.trim() ?? "";
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)/i)?.[1]?.trim() ?? "index, follow";
  const noindex = robots.toLowerCase().includes("noindex");
  const h1 = decode(cleaned.match(/<h1\b[^>]*>(.*?)<\/h1>/is)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "");
  const text = plainText(html);
  const words = (text.match(/\b[A-Za-z][A-Za-z'’-]*\b/g) ?? []).length;
  const hrefs = [...cleaned.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)].map((match) => match[1]);
  const internalOutbound = [...new Set(hrefs
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => new URL(href, site).pathname)
    .filter((pathname) => pathname !== route && routeSet.has(pathname)))];
  const external = [...new Set(hrefs.filter((href) => /^https?:\/\//.test(href) && !href.startsWith(site)))];
  const schemaTypes = [];
  let published = "";
  let modified = "";
  let author = "";
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(match[1]);
      for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
        const type = Array.isArray(item["@type"]) ? item["@type"].join("|") : item["@type"];
        if (type) schemaTypes.push(type);
        published ||= item.datePublished ?? "";
        modified ||= item.dateModified ?? "";
        author ||= typeof item.author === "string" ? item.author : item.author?.name ?? "";
      }
    } catch {
      schemaTypes.push("invalid");
    }
  }
  const role = roles.get(url) ?? {};
  const metrics = gscPages.get(url) ?? {};
  return {
    route,
    url,
    family,
    title,
    h1,
    description,
    canonical,
    robots,
    indexability: noindex ? "noindex" : "indexable",
    sitemapStatus: sitemapRoutes.has(route) ? "in sitemap" : "not in sitemap",
    schemaType: [...new Set(schemaTypes)].join("|"),
    sourcePath: sourcePathFor(route, family),
    pageTemplate: templateFor(family),
    words,
    publishedDate: published,
    reviewedDate: modified,
    authorship: author || "Echo Buddha Editorial",
    sourceStatus: external.length ? "external references present" : "no external references detected",
    externalCitationCount: external.length,
    outboundLinkCount: internalOutbound.length,
    outboundLinks: internalOutbound.join(" | "),
    parentPillar: role["Parent pillar"] || role["Primary topic owner URL"] || "",
    contentRole: role["Primary page role"] || contentRoleFor(family),
    primaryIntent: role["Primary user intent"] || primaryIntentFor(family),
    secondaryIntent: role["Secondary page role"] || "",
    uniqueReaderPromise: role["Unique information gain"] || description,
    topicCluster: role["Topic cluster"] || "",
    primaryOwner: role["Primary topic owner URL"] || "",
    isPrimaryOwner: role["Is primary owner?"] || "",
    cannibalizationRisk: role["Cannibalization risk"] || "unclassified",
    gscClicks: metrics.clicks ?? 0,
    gscImpressions: metrics.impressions ?? 0,
    gscCtr: metrics.ctr ?? 0,
    gscPosition: metrics.position ?? "",
    text,
    contentHash: crypto.createHash("sha256").update(text).digest("hex"),
  };
}).sort((a, b) => a.route.localeCompare(b.route));

const inbound = new Map(rawPages.map((page) => [page.route, []]));
for (const page of rawPages) {
  for (const target of page.outboundLinks.split(" | ").filter(Boolean)) {
    inbound.get(target)?.push(page.route);
  }
}
const pages = rawPages.map((page) => ({
  ...page,
  inboundLinkCount: new Set(inbound.get(page.route) ?? []).size,
  inboundLinks: [...new Set(inbound.get(page.route) ?? [])].join(" | "),
}));

const inventoryHeaders = [
  "url", "family", "title", "h1", "description", "canonical", "robots", "indexability", "sitemapStatus",
  "sourcePath", "pageTemplate", "words", "publishedDate", "reviewedDate", "authorship", "sourceStatus",
  "externalCitationCount", "inboundLinkCount", "outboundLinkCount", "parentPillar", "contentRole", "primaryIntent",
  "secondaryIntent", "uniqueReaderPromise", "topicCluster", "primaryOwner", "isPrimaryOwner", "gscImpressions",
  "gscClicks", "gscCtr", "gscPosition", "cannibalizationRisk", "contentHash",
];

if (stage === "pre") {
  writeCsv("current-indexable-content-inventory.csv", inventoryHeaders, pages.filter((page) => page.indexability === "indexable"));
  writeCsv("current-noindex-content-inventory.csv", inventoryHeaders, pages.filter((page) => page.indexability === "noindex"));
}

const fingerprintHeaders = [
  "url", "title", "h1", "description", "canonical", "robots", "indexability", "schemaType", "sitemapStatus", "sourcePath", "contentHash",
];
const fingerprintName = stage === "pre" ? "pre-change-production-fingerprint.csv" : "post-change-production-fingerprint.csv";
writeCsv(fingerprintName, fingerprintHeaders, pages.filter((page) => page.indexability === "indexable"));

if (stage === "post") {
  const before = parseCsv(fs.readFileSync(path.join(outDir, "pre-change-production-fingerprint.csv"), "utf8"));
  const after = parseCsv(fs.readFileSync(path.join(outDir, "post-change-production-fingerprint.csv"), "utf8"));
  const beforeMap = new Map(before.map((row) => [row.url, row]));
  const afterMap = new Map(after.map((row) => [row.url, row]));
  const fields = fingerprintHeaders.filter((header) => header !== "url");
  const changes = [];
  for (const [url, prior] of beforeMap) {
    const current = afterMap.get(url);
    if (!current) {
      changes.push({ url, changeType: "REMOVED", field: "url", before: url, after: "" });
      continue;
    }
    for (const field of fields) {
      if (prior[field] !== current[field]) changes.push({ url, changeType: "CHANGED", field, before: prior[field], after: current[field] });
    }
  }
  for (const [url] of afterMap) {
    if (!beforeMap.has(url)) changes.push({ url, changeType: "ADDED", field: "url", before: "", after: url });
  }
  writeCsv("pre-post-fingerprint-diff.csv", ["url", "changeType", "field", "before", "after"], changes);
  fs.writeFileSync(path.join(outDir, "pre-post-fingerprint-summary.json"), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    preIndexableCount: before.length,
    postIndexableCount: after.length,
    removedCount: changes.filter((row) => row.changeType === "REMOVED").length,
    addedCount: changes.filter((row) => row.changeType === "ADDED").length,
    existingFieldChangeCount: changes.filter((row) => row.changeType === "CHANGED").length,
    changes,
  }, null, 2)}\n`);
}

console.log(`Generated ${stage}-change content expansion evidence for ${pages.length} HTML routes.`);
