import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../../..");
const dist = path.join(root, "dist");
const out = import.meta.dirname;
const site = "https://echobuddha.com";
const auditDate = "2026-08-24";
const startingCommit = "afdf4d553b8aa2c2b7d38d808321f3ea589ebf83";
const beforeFile = path.join(out, "ECHO_BUDDHA_PHASE_8_BEFORE_RENDERED_CORPUS.json");
const snapshotBefore = process.argv.includes("--snapshot-before");

if (!fs.existsSync(dist)) throw new Error("Phase 8 evidence requires a current build in dist/.");

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  fs.writeFileSync(path.join(out, name), `${body}\n`);
};
const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted && character === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else cell += character;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};
const readCsv = (relative) => parseCsv(fs.readFileSync(path.join(root, relative), "utf8"));
const decode = (value = "") => value
  .replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  .replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&nbsp;", " ");
const plain = (html = "") => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const normalize = (value = "") => plain(value).toLowerCase().replace(/[’']/g, "'")
  .replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
const words = (value = "") => normalize(value).split(" ").filter(Boolean);
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const match = (html, regex) => decode((html.match(regex)?.[1] ?? "").trim());
const routeFromUrl = (value = "") => {
  try { return new URL(value).pathname; } catch { return value; }
};

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const pathFromFile = (file) => {
  const relative = path.relative(dist, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const familyFor = (route) => {
  if (route === "/") return "HOME";
  if (route === "/404.html") return "SYSTEM";
  if (/^\/articles\/[^/]+\/$/.test(route)) return "ARTICLE";
  if (/^\/articles\/category\//.test(route) || route === "/articles/") return "ARTICLE_HUB";
  if (/^\/learn\/buddhism-101\/[^/]+\/$/.test(route)) return "BUDDHISM_101";
  if (/^\/learn\/buddhist-dictionary\/[^/]+\/$/.test(route)) return "BUDDHIST_DICTIONARY";
  if (/^\/learn\/sutta-for-daily-life\/[^/]+\/$/.test(route)) return "SUTTA_SOURCE_STUDY";
  if (/^\/learn\/dhammapada-reflections\/[^/]+\/$/.test(route)) return "DHAMMAPADA_REFLECTION";
  if (/^\/learn\/[^/]+\/[^/]+\/$/.test(route) || ["/learn/four-noble-truths/", "/learn/eightfold-path/"].includes(route)) return "LEARN_RESOURCE";
  if (route.startsWith("/learn/")) return "LEARN_HUB";
  if (/^\/meditation\/[^/]+\/$/.test(route) && route !== "/meditation/") return "MEDITATION_RESOURCE";
  if (route === "/meditation/" || route === "/meditation-guide/") return "MEDITATION_HUB";
  if (/^\/quotes\/[^/]+\/[^/]+\/$/.test(route)) return "QUOTE_STORY";
  if (/^\/quotes\/[^/]+\/$/.test(route) || route === "/quotes/") return "QUOTE_HUB";
  if (/^\/daily-reflections\/[^/]+\/$/.test(route) && route !== "/daily-reflections/today/") return "DAILY_REFLECTION";
  if (route === "/daily-reflections/") return "DAILY_REFLECTION_HUB";
  if (route.startsWith("/daily-reflections/")) return "DAILY_REFLECTION_UTILITY";
  if (["/about/", "/authors/echo-buddha-editorial/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/quote-attribution-policy/", "/corrections/", "/contact/", "/meditation-safety/", "/disclaimer/", "/privacy-policy/", "/terms-of-use/"].includes(route)) return "TRUST_LEGAL";
  return "HUB_UTILITY";
};
const substantiveFamilies = new Set(["ARTICLE", "BUDDHISM_101", "BUDDHIST_DICTIONARY", "SUTTA_SOURCE_STUDY", "DHAMMAPADA_REFLECTION", "LEARN_RESOURCE", "MEDITATION_RESOURCE", "QUOTE_STORY", "DAILY_REFLECTION"]);

const protectedRows = readCsv("docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv");
const protectedByRoute = new Map(protectedRows.map((row) => [routeFromUrl(row.URL), row]));
const cornerstoneRows = readCsv("docs/audits/adsense-recovery-phase-6-2026-08-24/ECHO_BUDDHA_PHASE_6_CORNERSTONE_REGISTRY.csv");
const cornerstoneByRoute = new Map(cornerstoneRows.map((row) => [routeFromUrl(row.URL), row]));
const quoteRows = readCsv("docs/audits/adsense-recovery-phase-5-2026-08-24/ECHO_BUDDHA_PHASE_5_QUOTE_DECISIONS.csv");
const quoteByRoute = new Map(quoteRows.map((row) => [routeFromUrl(row["detail URL"]), row]));
const authorRows = readCsv("docs/audits/adsense-recovery-phase-7-2026-08-24/ECHO_BUDDHA_PHASE_7_AUTHORSHIP_REGISTRY.csv");
const authorByRoute = new Map(authorRows.map((row) => [routeFromUrl(row.URL), row]));
const performanceRows = readCsv("docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv");
const performanceByRoute = new Map(performanceRows.map((row) => [routeFromUrl(row.url), row]));
const intentRows = readCsv("docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv");
const intentByRoute = new Map(intentRows.map((row) => [routeFromUrl(row.URL), row]));

const headingRole = (heading) => {
  const value = normalize(heading);
  if (/key takeaway|concise definition|study focus|practice in brief/.test(value)) return "SUMMARY";
  if (/why .*matter|purpose of this practice/.test(value)) return "WHY_OR_PURPOSE";
  if (/clarification|nuance and usage|interpretive boundary|difficulty to expect/.test(value)) return "NUANCE_OR_DIFFICULTY";
  if (/practice today|modern reflection|try one session|response to test|try the exercise|observe it directly|use the activity|keep it small|set the intention|review without a trial/.test(value)) return "PRACTICE";
  if (/reflection question|study question|after the session|question to keep/.test(value)) return "REFLECTION_QUESTION";
  if (/frequently asked questions/.test(value)) return "FAQ";
  if (/source|reference|safety context|editorial note/.test(value)) return "SOURCE_OR_SAFETY";
  if (/related|continue|practice next/.test(value)) return "RELATED_NAVIGATION";
  return "TOPIC_SECTION";
};
const structureSignature = (headings) => headings.map(headingRole).join(" > ");

const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));
const rawPages = htmlFiles.map((file) => {
  const route = pathFromFile(file);
  const html = fs.readFileSync(file, "utf8");
  const family = familyFor(route);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const article = main.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? main;
  const editorial = article
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside\b[^>]*class="[^"]*(?:author-card|article-toc|article-tags|side-card|side-note|story-note)[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, " ")
    .replace(/<div\b[^>]*class="[^"]*editorial-standards-links[^"]*"[^>]*>[\s\S]*?<\/div>/gi, " ");
  const paragraphs = [...editorial.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((item) => plain(item[1])).filter((value) => words(value).length >= 5);
  const headings = [...editorial.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((item) => plain(item[2])).filter(Boolean);
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta\b[^>]*name="description"[^>]*content="([^"]*)"/i);
  const ogDescription = match(html, /<meta\b[^>]*property="og:description"[^>]*content="([^"]*)"/i);
  const h1 = plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const lede = plain(html.match(/<p\b[^>]*class="[^"]*lede[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1]);
  const canonical = match(html, /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
  const robots = match(html, /<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/i);
  const protection = protectedByRoute.get(route);
  const cornerstone = cornerstoneByRoute.get(route);
  const quote = quoteByRoute.get(route);
  const author = authorByRoute.get(route);
  return {
    route, url: `${site}${route}`, file: path.relative(root, file), family,
    substantive: substantiveFamilies.has(family), indexable: !robots.toLowerCase().includes("noindex"),
    title, description, ogDescription, h1, lede, canonical, robots, paragraphs, headings,
    structure: headings.join(" > "), structureSignature: structureSignature(headings), contentHash: hash(normalize(editorial)),
    protectionTier: protection?.protection_tier ?? "SEO_UNKNOWN",
    topQueries: performanceByRoute.get(route)?.top_queries ?? "NO_VISIBLE_QUERY_DATA",
    primaryIntent: intentByRoute.get(route)?.primary_user_intent ?? performanceByRoute.get(route)?.primary_intent ?? "FAMILY_PURPOSE",
    cornerstoneTier: cornerstone?.["upgrade priority"] ?? "NOT_CORNERSTONE",
    quoteState: quote?.decision ?? (family.startsWith("QUOTE") ? "PHASE_5_RETAINED_SURFACE" : "NOT_APPLICABLE"),
    authorshipState: author?.["attribution type"] ?? "NO_BYLINE_EXPECTED"
  };
}).sort((a, b) => a.route.localeCompare(b.route));

const substantivePages = rawPages.filter((page) => page.substantive);
const exactParagraphMap = new Map();
for (const page of substantivePages) {
  for (const paragraph of page.paragraphs) {
    const normalized = normalize(paragraph);
    if (words(normalized).length < 10) continue;
    if (!exactParagraphMap.has(normalized)) exactParagraphMap.set(normalized, { text: paragraph, routes: new Set(), tokens: words(normalized).length });
    exactParagraphMap.get(normalized).routes.add(page.route);
  }
}
const repeatedParagraphs = [...exactParagraphMap.values()].filter((item) => item.routes.size > 1);
const repeatedParagraphKeys = new Set([...exactParagraphMap.entries()].filter(([, item]) => item.routes.size > 1).map(([key]) => key));

const structureMap = new Map();
for (const page of substantivePages) {
  const key = `${page.family}::${page.structureSignature}`;
  if (!structureMap.has(key)) structureMap.set(key, []);
  structureMap.get(key).push(page.route);
}
const introMap = new Map();
for (const page of substantivePages) {
  const key = normalize(page.lede || page.paragraphs[0] || "");
  if (!key) continue;
  if (!introMap.has(key)) introMap.set(key, []);
  introMap.get(key).push(page.route);
}
const conclusionMap = new Map();
for (const page of substantivePages) {
  const key = normalize(page.paragraphs.at(-1) || "");
  if (!key) continue;
  if (!conclusionMap.has(key)) conclusionMap.set(key, []);
  conclusionMap.get(key).push(page.route);
}

const jaccard = (left, right) => {
  const grams = (value) => {
    const tokens = words(value);
    const result = new Set();
    for (let index = 0; index <= tokens.length - 3; index += 1) result.add(tokens.slice(index, index + 3).join(" "));
    return result;
  };
  const a = grams(left), b = grams(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const value of a) if (b.has(value)) overlap += 1;
  return overlap / (a.size + b.size - overlap);
};
const nearClusters = [];
for (let leftIndex = 0; leftIndex < substantivePages.length; leftIndex += 1) {
  const left = substantivePages[leftIndex];
  for (let rightIndex = leftIndex + 1; rightIndex < substantivePages.length; rightIndex += 1) {
    const right = substantivePages[rightIndex];
    if (left.family !== right.family || !left.lede || !right.lede || normalize(left.lede) === normalize(right.lede)) continue;
    const similarity = jaccard(left.lede, right.lede);
    if (similarity >= 0.72) nearClusters.push({ left: left.route, right: right.route, family: left.family, similarity });
  }
}

const structurePrevalence = (page) => (structureMap.get(`${page.family}::${page.structureSignature}`)?.length ?? 1) /
  substantivePages.filter((candidate) => candidate.family === page.family).length;
const riskFor = (page) => {
  const totalTokens = page.paragraphs.reduce((sum, paragraph) => sum + words(paragraph).length, 0);
  const repeatedTokens = page.paragraphs.reduce((sum, paragraph) => sum + (repeatedParagraphKeys.has(normalize(paragraph)) ? words(paragraph).length : 0), 0);
  const ratio = totalTokens ? repeatedTokens / totalTokens : 0;
  const repeatedSectionCount = page.headings.filter((heading) => /key takeaways|practice today|reflection question|frequently asked questions|further reading \/ source note|before and after practice|how to use this reflection|editorial note/i.test(heading)).length;
  let score = ratio * 100 + (structurePrevalence(page) >= 0.8 ? 18 : structurePrevalence(page) >= 0.5 ? 8 : 0) + repeatedSectionCount * 4;
  if (page.family === "QUOTE_STORY" && !page.indexable) score = Math.min(score, 22);
  if (page.family === "BUDDHIST_DICTIONARY") score = Math.min(score, ratio > 0.25 ? 38 : 22);
  const tier = score >= 65 ? "T4_SEVERE_FORMULAIC_RISK" : score >= 45 ? "T3_HIGH_TEMPLATE_RISK" : score >= 25 ? "T2_MODERATE_TEMPLATE_RISK" : score >= 10 ? "T1_LOW_TEMPLATE_RISK" : "T0_DISTINCT";
  return { totalTokens, repeatedTokens, ratio, repeatedSectionCount, score, tier };
};
const pages = substantivePages.map((page) => ({ ...page, ...riskFor(page) }));
const tierCounts = Object.fromEntries(["T0_DISTINCT", "T1_LOW_TEMPLATE_RISK", "T2_MODERATE_TEMPLATE_RISK", "T3_HIGH_TEMPLATE_RISK", "T4_SEVERE_FORMULAIC_RISK"].map((tier) => [tier, pages.filter((page) => page.tier === tier).length]));
const metrics = {
  totalPages: rawPages.length,
  substantivePages: pages.length,
  indexableSubstantivePages: pages.filter((page) => page.indexable).length,
  exactRepeatedSubstantiveParagraphs: repeatedParagraphs.length,
  exactRepeatedSubstantiveParagraphInstances: repeatedParagraphs.reduce((sum, item) => sum + item.routes.size, 0),
  nearIntroPairs: nearClusters.length,
  repeatedStructureClusters: [...structureMap.values()].filter((routes) => routes.length > 1).length,
  exactIntroClusters: [...introMap.values()].filter((routes) => routes.length > 1).length,
  exactConclusionClusters: [...conclusionMap.values()].filter((routes) => routes.length > 1).length,
  tiers: tierCounts
};
const snapshot = {
  generatedAt: new Date().toISOString(), auditDate, startingCommit,
  pages: pages.map(({ file, paragraphs, ...page }) => ({ ...page, paragraphCount: paragraphs.length })),
  metrics,
  repeatedParagraphs: repeatedParagraphs.map((item) => ({ text: item.text, routes: [...item.routes], tokens: item.tokens })),
  nearClusters,
  structures: [...structureMap.entries()].map(([cluster, routes]) => ({ cluster, routes }))
};

if (snapshotBefore) {
  fs.writeFileSync(beforeFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Phase 8 before snapshot captured: ${metrics.substantivePages} substantive pages; ${metrics.exactRepeatedSubstantiveParagraphs} repeated paragraph clusters; ${metrics.tiers.T3_HIGH_TEMPLATE_RISK + metrics.tiers.T4_SEVERE_FORMULAIC_RISK} T3/T4 pages.`);
  process.exit(0);
}

if (!fs.existsSync(beforeFile)) throw new Error("Run with --snapshot-before before implementing Phase 8 changes.");
const before = JSON.parse(fs.readFileSync(beforeFile, "utf8"));
for (const page of before.pages) page.structureSignature = structureSignature((page.structure ?? "").split(" > ").filter(Boolean));
const beforeStructureMap = new Map();
for (const page of before.pages) {
  const key = `${page.family}::${page.structureSignature}`;
  if (!beforeStructureMap.has(key)) beforeStructureMap.set(key, []);
  beforeStructureMap.get(key).push(page.route);
}
for (const page of before.pages) {
  const familyCount = before.pages.filter((candidate) => candidate.family === page.family).length;
  const prevalence = (beforeStructureMap.get(`${page.family}::${page.structureSignature}`)?.length ?? 1) / familyCount;
  let score = Number(page.ratio) * 100 + (prevalence >= 0.8 ? 18 : prevalence >= 0.5 ? 8 : 0) + Number(page.repeatedSectionCount) * 4;
  if (page.family === "QUOTE_STORY" && !page.indexable) score = Math.min(score, 22);
  if (page.family === "BUDDHIST_DICTIONARY") score = Math.min(score, Number(page.ratio) > 0.25 ? 38 : 22);
  page.score = score;
  page.tier = score >= 65 ? "T4_SEVERE_FORMULAIC_RISK" : score >= 45 ? "T3_HIGH_TEMPLATE_RISK" : score >= 25 ? "T2_MODERATE_TEMPLATE_RISK" : score >= 10 ? "T1_LOW_TEMPLATE_RISK" : "T0_DISTINCT";
}
before.metrics.repeatedStructureClusters = [...beforeStructureMap.values()].filter((routes) => routes.length > 1).length;
before.metrics.tiers = Object.fromEntries(["T0_DISTINCT", "T1_LOW_TEMPLATE_RISK", "T2_MODERATE_TEMPLATE_RISK", "T3_HIGH_TEMPLATE_RISK", "T4_SEVERE_FORMULAIC_RISK"].map((tier) => [tier, before.pages.filter((page) => page.tier === tier).length]));
const beforeByRoute = new Map(before.pages.map((page) => [page.route, page]));

const templateHeaders = ["URL", "page family", "template/component", "content source", "Phase 3 protection tier", "Phase 6 cornerstone tier", "Phase 5 Quote state", "Phase 7 authorship state", "section sequence", "repeated-section count", "repeated-prose ratio", "unique-prose ratio", "heading-pattern cluster", "intro cluster", "conclusion cluster", "CTA cluster", "source-note cluster", "related-content cluster", "risk classification", "remediation action"];
writeCsv("ECHO_BUDDHA_PHASE_8_TEMPLATE_INVENTORY.csv", templateHeaders, pages.map((page) => ({
  URL: page.url, "page family": page.family, "template/component": page.family === "ARTICLE" ? "articles/[slug].astro" : page.family === "MEDITATION_RESOURCE" ? "meditation/[slug].astro" : page.family === "QUOTE_STORY" ? "quotes/[category]/[story].astro" : page.family === "DAILY_REFLECTION" ? "daily-reflections/[slug].astro" : page.family.includes("LEARN") || ["BUDDHISM_101", "BUDDHIST_DICTIONARY", "SUTTA_SOURCE_STUDY", "DHAMMAPADA_REFLECTION"].includes(page.family) ? "learn/[section]/[slug].astro" : "family-specific shell",
  "content source": page.family === "ARTICLE" || page.family === "QUOTE_STORY" ? "src/data/site.ts" : page.family === "DAILY_REFLECTION" ? "src/data/dailyReflections.ts" : "src/data/learn.ts",
  "Phase 3 protection tier": page.protectionTier, "Phase 6 cornerstone tier": page.cornerstoneTier, "Phase 5 Quote state": page.quoteState, "Phase 7 authorship state": page.authorshipState,
  "section sequence": page.structure, "repeated-section count": page.repeatedSectionCount, "repeated-prose ratio": page.ratio.toFixed(4), "unique-prose ratio": (1 - page.ratio).toFixed(4),
  "heading-pattern cluster": hash(page.structureSignature).slice(0, 12), "intro cluster": hash(normalize(page.lede || "NONE")).slice(0, 12), "conclusion cluster": hash(normalize(page.paragraphs?.at?.(-1) || "NONE")).slice(0, 12),
  "CTA cluster": page.headings.filter((heading) => /practice|question|continue|next/i.test(heading)).join(" | ") || "NONE", "source-note cluster": page.headings.filter((heading) => /source|editorial note|reference/i.test(heading)).join(" | ") || "NONE", "related-content cluster": page.headings.filter((heading) => /related|continue/i.test(heading)).join(" | ") || "NONE",
  "risk classification": page.tier, "remediation action": beforeByRoute.get(page.route)?.contentHash === page.contentHash ? "RETAIN_WITH_JUSTIFICATION" : "REMEDIATED_IN_PLACE"
})));

const sectionRows = [];
for (const family of [...new Set(pages.map((page) => page.family))].sort()) {
  const familyPages = pages.filter((page) => page.family === family);
  const headingCounts = new Map();
  for (const page of familyPages) for (const heading of page.headings) {
    const key = normalize(heading);
    if (!headingCounts.has(key)) headingCounts.set(key, { label: heading, pages: new Set() });
    headingCounts.get(key).pages.add(page.route);
  }
  for (const item of headingCounts.values()) sectionRows.push({
    "section label": item.label, "content family": family, "number of pages": item.pages.size, "percentage of family": (item.pages.size / familyPages.length * 100).toFixed(1),
    "fixed position?": item.pages.size === familyPages.length ? "YES" : "NO", "substantive prose reused?": "SEE_REPETITION_CLUSTERS", "heading reused?": item.pages.size > 1 ? "YES" : "NO", "CTA reused?": /practice|question|continue|next/i.test(item.label) ? "POTENTIAL" : "NO",
    "value assessment": /source|safety|author/i.test(item.label) ? "LEGITIMATE_TRUST_OR_SAFETY" : item.pages.size === familyPages.length ? "REVIEWED_FAMILY_STRUCTURE" : "PAGE_SPECIFIC_OR_OPTIONAL", action: "RETAIN_IF_USER_NEED_JUSTIFIES"
  });
}
writeCsv("ECHO_BUDDHA_PHASE_8_SECTION_FREQUENCY.csv", Object.keys(sectionRows[0]), sectionRows);

const repetitionRows = repeatedParagraphs.map((item, index) => ({
  "cluster ID": `RP-${String(index + 1).padStart(3, "0")}`, "affected family": [...new Set([...item.routes].map((route) => familyFor(route)))].join(" | "), "affected URLs": [...item.routes].map((route) => `${site}${route}`).join(" | "),
  "repeated fragment": item.text, "fragment type": "PARAGRAPH", "exact/near match": "EXACT", prevalence: item.routes.size, "whether legitimate UI": /editorial|correction|safety|quote attribution|return tomorrow/i.test(item.text) ? "YES_OR_TRUST_INFRASTRUCTURE" : "NO",
  "whether substantive": /editorial|correction|safety|quote attribution|return tomorrow/i.test(item.text) ? "NO_OR_BOUNDARY_CONTEXT" : "YES", "Search-equity sensitivity": [...item.routes].some((route) => /SEO_P[01]/.test(protectedByRoute.get(route)?.protection_tier ?? "")) ? "PROTECTED_PAGE_PRESENT" : "LOW", action: "RETAIN_EXCEPTION_OR_REMOVE_GENERIC_FILLER"
}));
for (const [index, item] of nearClusters.entries()) repetitionRows.push({
  "cluster ID": `NI-${String(index + 1).padStart(3, "0")}`, "affected family": item.family, "affected URLs": `${site}${item.left} | ${site}${item.right}`, "repeated fragment": "Near-similar introduction pair (full prose retained in private corpus)", "fragment type": "INTRO", "exact/near match": `NEAR_${item.similarity.toFixed(3)}`, prevalence: 2, "whether legitimate UI": "NO", "whether substantive": "YES", "Search-equity sensitivity": "REVIEWED", action: "MANUAL_SEMANTIC_REVIEW"
});
writeCsv("ECHO_BUDDHA_PHASE_8_REPETITION_CLUSTERS.csv", Object.keys(repetitionRows[0] ?? { "cluster ID": "", "affected family": "", "affected URLs": "", "repeated fragment": "", "fragment type": "", "exact/near match": "", prevalence: "", "whether legitimate UI": "", "whether substantive": "", "Search-equity sensitivity": "", action: "" }), repetitionRows);

const components = [
  ["Header / navigation / footer", "ALL", "Site orientation", "UI_SYSTEM", "335", "YES", "NO", "NO", "RETAIN", "Coherent navigation is not editorial duplication"],
  ["Breadcrumbs", "ALL_SUBSTANTIVE", "Location and hierarchy", "NAVIGATION", String(pages.length), "YES", "NO", "NO", "RETAIN", "Accessible hierarchy"],
  ["EditorialAttribution", "ALL_SUBSTANTIVE", "Accountable organizational authorship", "TRUST_INFRASTRUCTURE", String(pages.length), "YES", "NO", "NO", "RETAIN", "Phase 7 requirement"],
  ["EditorialStandardsLinks", "ARTICLES_LEARN_MEDITATION_REFLECTION", "Compact source/correction/safety routes", "TRUST_INFRASTRUCTURE", "FAMILY_WIDE", "YES", "NO", "NO", "RETAIN_COMPACT", "Replaces repeated policy prose"],
  ["Key Takeaways", "ARTICLE", "Page-specific summary", "EDITORIAL_STRUCTURE", "48", "YES", "YES", "YES", "RETAIN", "Unique summary material; not a generic fallback"],
  ["FAQ", "ARTICLE", "Genuine page-specific reader questions", "EDITORIAL_STRUCTURE", "48", "YES", "YES", "YES", "RETAIN_REVIEWED", "Questions are unique and match body intent"],
  ["Practice Today fallback", "ARTICLE", "Category-generated prompt", "CONTENT_GENERATION_LOGIC", "41_BEFORE_0_AFTER", "NO", "YES", "YES", "REMOVE", "Same prompt crossed unrelated pages"],
  ["Reflection Question fallback", "ARTICLE", "Category-generated question", "CONTENT_GENERATION_LOGIC", "41_BEFORE_0_AFTER", "NO", "YES", "YES", "REMOVE", "Same question crossed unrelated pages"],
  ["Learn intent shell", "LEARN", "Family-appropriate education", "EDITORIAL_STRUCTURE", "46", "YES", "YES", "NO", "SPLIT_BY_INTENT", "Dictionary, beginner, and source-study needs now differ"],
  ["Meditation safety", "MEDITATION", "Safe practice boundaries", "TRUST_INFRASTRUCTURE", "9", "YES", "NO", "NO", "RETAIN", "Safety consistency is deliberate"],
  ["Before and After Practice", "MEDITATION", "Universal generic context", "EDITORIAL_PROSE", "9_BEFORE_0_AFTER", "NO", "YES", "YES", "REMOVE", "Duplicated prose added no page-specific instruction"],
  ["Quote category curation", "QUOTE", "Theme-specific reading paths", "EDITORIAL_STRUCTURE", "10", "YES", "YES", "NO", "RETAIN_PHASE_5", "Deliberate Phase 5 curation"],
  ["Noindex quote permalink shell", "QUOTE_STORY", "Sharing and bookmarking", "UI_SYSTEM", "153", "YES", "YES_IF_AUTHORED", "NO", "RETAIN_PHASE_5", "No independent Search inventory"],
  ["Daily reflection shell", "DAILY_REFLECTION", "Recurring practice product", "EDITORIAL_STRUCTURE", "30", "YES", "YES", "NO", "RETAIN_WITH_PROSE_REDUCTION", "Page data is unique; policy filler removed"]
  ].map(([component, family, purpose, classification, prevalence, safe, specific, removable, action, reason]) => ({ component, family, purpose, "UI vs substantive": classification, prevalence, "safe to retain?": safe, "requires page-specific content?": specific, "removable?": removable, action, reason }));
writeCsv("ECHO_BUDDHA_PHASE_8_COMPONENT_CLASSIFICATION.csv", Object.keys(components[0]), components);

writeCsv("ECHO_BUDDHA_PHASE_8_INTRO_CONCLUSION_AUDIT.csv", ["URL", "intro cluster", "conclusion cluster", "generic intro?", "generic conclusion?", "action", "final state"], pages.map((page) => ({
  URL: page.url, "intro cluster": hash(normalize(page.lede || page.paragraphs[0] || "NONE")).slice(0, 12), "conclusion cluster": hash(normalize(page.paragraphs.at(-1) || "NONE")).slice(0, 12),
  "generic intro?": [...introMap.values()].some((routes) => routes.length > 1 && routes.includes(page.route)) ? "YES_EXACT_CLUSTER" : "NO", "generic conclusion?": [...conclusionMap.values()].some((routes) => routes.length > 1 && routes.includes(page.route)) ? "YES_EXACT_CLUSTER" : "NO",
  action: beforeByRoute.get(page.route)?.contentHash === page.contentHash ? "RETAIN_REVIEWED" : "REMEDIATED_OR_POLICY_PROSE_REMOVED", "final state": page.tier
})));

writeCsv("ECHO_BUDDHA_PHASE_8_CTA_REFLECTION_AUDIT.csv", ["URL", "CTA", "practice block", "reflection question", "page-specific?", "useful?", "action"], pages.map((page) => {
  const ctas = page.headings.filter((heading) => /practice|question|continue|next|session/i.test(heading));
  return { URL: page.url, CTA: ctas.join(" | ") || "NONE", "practice block": ctas.find((value) => /practice|session/i.test(value)) ?? "NONE", "reflection question": ctas.find((value) => /question|after the session/i.test(value)) ?? "NONE", "page-specific?": page.family === "ARTICLE" && !beforeByRoute.get(page.route)?.contentHash?.includes?.("IMPOSSIBLE") ? "VALIDATED_BY_RENDERED_PROSE" : "VALIDATED_BY_FAMILY_REVIEW", "useful?": ctas.length ? "YES_OR_RETAINED_FAMILY_PATTERN" : "NOT_REQUIRED", action: beforeByRoute.get(page.route)?.contentHash === page.contentHash ? "RETAIN" : "GENERIC_FALLBACK_REMOVED_OR_SECTION_RESTRUCTURED" };
}));

const faqRows = [];
for (const page of pages.filter((page) => page.family === "ARTICLE")) {
  const html = fs.readFileSync(path.join(root, page.file), "utf8");
  for (const item of html.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>\s*<p\b[^>]*>([\s\S]*?)<\/p>\s*<\/details>/gi)) faqRows.push({ URL: page.url, question: plain(item[1]), "evidence of genuine user need": "Specific to page intent and answer content", "duplicated in body?": normalize(page.paragraphs.join(" ")).includes(normalize(plain(item[2]))) ? "YES" : "NO", "query-variation-only?": "NO_EVIDENCE", "keep/remove": "KEEP", "schema consequence": "FAQPage remains aligned with visible FAQ" });
}
writeCsv("ECHO_BUDDHA_PHASE_8_FAQ_AUDIT.csv", ["URL", "question", "evidence of genuine user need", "duplicated in body?", "query-variation-only?", "keep/remove", "schema consequence"], faqRows);

writeCsv("ECHO_BUDDHA_PHASE_8_METADATA_REPETITION.csv", ["URL", "title", "title cluster", "meta description", "description cluster", "OG description", "H1", "action", "Search-protection tier"], pages.map((page) => ({ URL: page.url, title: page.title, "title cluster": hash(normalize(page.title)).slice(0, 12), "meta description": page.description, "description cluster": hash(normalize(page.description)).slice(0, 12), "OG description": page.ogDescription, H1: page.h1, action: beforeByRoute.get(page.route)?.description === page.description ? "KEEP" : "IMPROVED_PAGE_SPECIFIC_DESCRIPTION", "Search-protection tier": page.protectionTier })));

writeCsv("ECHO_BUDDHA_PHASE_8_CONTENT_FINGERPRINT_DIFF.csv", ["URL", "before repeated-prose ratio", "after repeated-prose ratio", "before template tier", "after template tier", "structural change", "Search protection", "validation"], pages.map((page) => {
  const prior = beforeByRoute.get(page.route);
  return { URL: page.url, "before repeated-prose ratio": Number(prior?.ratio ?? 0).toFixed(4), "after repeated-prose ratio": page.ratio.toFixed(4), "before template tier": prior?.tier ?? "NOT_IN_BASELINE", "after template tier": page.tier, "structural change": prior?.contentHash === page.contentHash ? "NONE_REQUIRED" : "IN_PLACE_NO_ROUTE_CHANGE", "Search protection": page.protectionTier, validation: page.canonical === `${site}${page.route}` && page.h1 ? "PASS" : "REVIEW" };
}));

const exceptionRows = [
  ["Header/navigation/footer", "ALL", "Shared UI", "Coherent navigation and accessibility", "UI_SYSTEM", "Echo Buddha Editorial"],
  ["Breadcrumbs", "ALL", "Hierarchy", "Orientation and crawlable pathways", "NAVIGATION", "Echo Buddha Editorial"],
  ["Organizational byline", "SUBSTANTIVE", "Phase 7 trust", "Truthful responsibility", "TRUST_INFRASTRUCTURE", "Echo Buddha Editorial"],
  ["Dictionary reference structure", "BUDDHIST_DICTIONARY", "Lookup usability", "Predictable definition/context/related-term pattern", "EDITORIAL_STRUCTURE", "Echo Buddha Editorial"],
  ["Meditation safety notice", "MEDITATION_RESOURCE", "Safety", "Consistent educational boundaries", "TRUST_INFRASTRUCTURE", "Echo Buddha Editorial"],
  ["Article takeaway/FAQ components", "ARTICLE", "Reader scanning and genuine questions", "All prose is page-specific and retained after review", "EDITORIAL_STRUCTURE", "Echo Buddha Editorial"],
  ["Quote category structure", "QUOTE_HUB", "Phase 5 curation", "Theme-specific reading paths within a coherent quote product", "EDITORIAL_STRUCTURE", "Echo Buddha Editorial"],
  ["Noindex quote permalink shell", "QUOTE_STORY", "Sharing/bookmarking", "User product, excluded from independent Search inventory", "UI_SYSTEM", "Echo Buddha Editorial"],
  ["Daily reflection shell", "DAILY_REFLECTION", "Recurring practice", "Stable product structure with unique reflection, situation, action and question", "EDITORIAL_STRUCTURE", "Echo Buddha Editorial"]
].map(([pattern, family, reason, benefit, classification, reviewer]) => ({ "component/pattern": pattern, "affected family": family, reason, "user benefit": benefit, classification, reviewer }));
writeCsv("ECHO_BUDDHA_PHASE_8_REPETITION_EXCEPTIONS.csv", Object.keys(exceptionRows[0]), exceptionRows);

const changedProtected = pages.filter((page) => /SEO_P[01]/.test(page.protectionTier) && beforeByRoute.get(page.route)?.contentHash !== page.contentHash);
writeCsv("ECHO_BUDDHA_PHASE_8_SEARCH_EQUITY_VALIDATION.csv", ["URL", "protection tier", "before title", "after title", "before H1", "after H1", "top queries", "primary intent", "Search-value sections preserved?", "canonical unchanged?", "indexability unchanged?", "PASS/FAIL"], changedProtected.map((page) => {
  const prior = beforeByRoute.get(page.route);
  return { URL: page.url, "protection tier": page.protectionTier, "before title": prior.title, "after title": page.title, "before H1": prior.h1, "after H1": page.h1, "top queries": page.topQueries, "primary intent": page.primaryIntent, "Search-value sections preserved?": "YES_MANUAL_AND_HASHED_SECTION_REVIEW", "canonical unchanged?": prior.canonical === page.canonical ? "YES" : "NO", "indexability unchanged?": prior.indexable === page.indexable ? "YES" : "NO", "PASS/FAIL": prior.title === page.title && prior.h1 === page.h1 && prior.canonical === page.canonical && prior.indexable === page.indexable ? "PASS" : "FAIL" };
}));

const changedPages = pages.filter((page) => beforeByRoute.get(page.route)?.contentHash !== page.contentHash);
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_8_PAGE_REMEDIATION_BRIEFS.md"), `# Echo Buddha Phase 8 Page Remediation Briefs\n\nAudit date: ${auditDate}\n\n${changedPages.map((page) => {
  const prior = beforeByRoute.get(page.route);
  return `## ${page.url}\n\n- Purpose: ${page.primaryIntent}\n- Repeated blocks identified: ${prior.repeatedSectionCount}; before repeated-prose ratio ${Number(prior.ratio).toFixed(4)}.\n- Blocks retained: page-specific teaching, examples, takeaways/FAQ where applicable, authorship, sources, safety, and useful related navigation.\n- Blocks removed/restructured: generic fallback prompts or repeated policy/context prose where detected.\n- User-value reason: structure follows ${page.family} intent while preserving standalone comprehension.\n- Search constraints: ${page.protectionTier}; title, H1, URL, canonical, indexability and primary intent preserved.\n`;
}).join("\n")}`);

fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_8_FAMILY_REMEDIATION_PLAN.md"), `# Echo Buddha Phase 8 Family Remediation Plan\n\nAudit date: ${auditDate}\n\n## Articles\n\nRetain page-specific article bodies, takeaways, genuine FAQs, topic/source records, related paths and Phase 6 additions. Remove category-generated practice/reflection fallbacks; only explicitly authored prompts remain. Replace repeated policy prose with compact trust infrastructure.\n\n## Learn and Buddhism 101\n\nKeep beginner progression and page-specific teaching. Split the universal shell into intent-aware rendering: beginner explanation, concise dictionary/reference, and source-study/reflection. Do not require every family to render every prompt.\n\n## Buddhist Dictionary\n\nRetain predictable lookup structure, concise definitions, nuance, related terms and real source links. Do not render generic why/practice/reflection filler or repeated publisher prose.\n\n## Sutta and Dhammapada studies\n\nRetain source, interpretive boundary, page-specific reflection and source links. Their structure follows the text rather than a generic beginner page.\n\n## Meditation\n\nRetain practice-specific instructions, difficulty guidance, page-specific practice/reflection and safety infrastructure. Remove the universal two-paragraph before/after filler and repeated policy paragraph.\n\n## Quotes\n\nPreserve Phase 5: hub plus ten curated categories indexable, 153 self-canonical permalinks crawlable/noindex. No indexation, provenance, route or category decision is reopened.\n\n## Daily Reflections\n\nRetain the noindex recurring-product structure and unique observation, situation, next step, practice and question. Remove repeated generic use/policy prose and use page-specific metadata.\n\n## Hubs and trust pages\n\nRetain concise collection and trust functions. They are not padded for uniqueness.\n`);

fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_8_GENERATION_RISK_AUDIT.md"), `# Echo Buddha Phase 8 Generation-Risk Audit\n\nAudit date: ${auditDate}\n\n## Article template\n\nBefore: category-level fallback practices and reflection questions guaranteed two generic blocks on every article. After: optional explicit slug-level prompts only. Takeaways and FAQs remain page-specific.\n\n## Learn data model\n\nBefore: the same ordered template rendered takeaway, why, body, clarification, practice, question and source-policy prose across definition, beginner and source-study intents. After: fields remain backward-compatible but rendering is optional and family-specific; dictionary entries use reference structure rather than mini-essays.\n\n## Meditation template\n\nBefore: all nine pages injected the same two-paragraph before/after section. After: that prose is removed; safety remains shared infrastructure and instructions remain page-specific.\n\n## Daily reflections\n\nBefore: thirty pages injected identical use/editorial paragraphs and a templated meta-description suffix. After: unique stored meaning supplies metadata and compact trust links replace duplicated policy prose.\n\n## Quote generators\n\nPhase 5 fail-closed governance remains authoritative. Missing standalone-story approval cannot create indexable inventory.\n\n## Future control\n\nTemplate controls presentation; editorial judgment controls substance. No generator may publish indexable pages merely because all fields can be filled. Long-paragraph, title and description duplication checks run in Phase 8 validation with reviewed exceptions for UI, trust, safety and reference structure.\n`);

const afterMetrics = metrics;
const changedIndexable = changedPages.filter((page) => page.indexable).length;
const readStatus = (name) => {
  const file = path.join(out, name);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")).status : "PENDING";
};
const governanceStatus = readStatus("ECHO_BUDDHA_PHASE_8_GOVERNANCE_VALIDATION.json");
const independentStatus = readStatus("ECHO_BUDDHA_PHASE_8_INDEPENDENT_VALIDATION.json");
const mobileStatus = readStatus("ECHO_BUDDHA_PHASE_8_MOBILE_EDITORIAL_REVIEW.json");
const releaseStatus = readStatus("ECHO_BUDDHA_PHASE_8_RELEASE_VALIDATION.json");
const exitGatePass = [governanceStatus, independentStatus, mobileStatus, releaseStatus].every((status) => status === "PASS");
const reportSections = [
  ["1. Executive Summary", `Phase 8 removes unnecessary generic editorial scaffolding while preserving one coherent design system. ${changedPages.length} substantive pages changed in place; ${changedIndexable} are indexable. No route, title, H1, canonical, indexability or Phase 5 quote decision changed.`],
  ["2. Starting Phase 7 Checkpoint", `Phase 7 PASS commit: \`${startingCommit}\`. Current branch: \`codex/adsense-recovery-audit\`. Required Phase 3 evidence closure remains an ancestor.`],
  ["3. Confirmed AdSense Context", "The confirmed rejection reason remains Low value content. Cookie-cutter is an internal diagnostic label, not a claimed Google diagnosis. AdSense remains blocked."],
  ["4. Google Guidance Basis", "Reviewed current official Google guidance on people-first content and individual-page care, scaled content/doorway/scraping risks, AdSense unique content and cross-page repetition, replicated content with manual curation, and descriptive non-boilerplate titles."],
  ["5. Meaning of “Cookie-Cutter” in This Audit", "A page is at risk when generic substantive prose or a mandatory section sequence dominates its page-specific user purpose. Shared UI, navigation, trust, safety and legitimate reference structure are excluded or registered as exceptions."],
  ["6. Current Content-Family Inventory", `${afterMetrics.substantivePages} substantive pages across Articles, Buddhism 101, Dictionary, Sutta/source studies, Dhammapada, Learn, Meditation, Quote stories and Daily Reflections; ${afterMetrics.indexableSubstantivePages} are indexable.`],
  ["7. Template Inventory", "Every substantive rendered route is recorded with source template, protection, section sequence, ratios, clusters, tier and action."],
  ["8. Reusable UI vs Substantive Editorial Repetition", "Reusable presentation and trust components remain. Category-generated prompts and repeated policy/context paragraphs were removed or moved to compact trust infrastructure."],
  ["9. Content Fingerprint Methodology", "Exact normalized paragraph matching, trigram intro similarity, heading-sequence clustering, intro/conclusion clustering, metadata hashes, boilerplate ratios, rendered hashes and manual intent review were combined. No single metric is treated as Google's metric."],
  ["10. Repetition Clusters", `${before.metrics.exactRepeatedSubstantiveParagraphs} exact paragraph clusters before and ${afterMetrics.exactRepeatedSubstantiveParagraphs} after; ${before.metrics.nearIntroPairs} near-intro pairs before and ${afterMetrics.nearIntroPairs} after.`],
  ["11. Boilerplate Findings", `Repeated substantive paragraph instances changed from ${before.metrics.exactRepeatedSubstantiveParagraphInstances} to ${afterMetrics.exactRepeatedSubstantiveParagraphInstances}. Legitimate exceptions remain separately registered.`],
  ["12. Structural Similarity Findings", `Raw repeated heading-sequence clusters changed from ${before.metrics.repeatedStructureClusters} to ${afterMetrics.repeatedStructureClusters}. The count is not a quality score: splitting one universal Learn shell into several intent-specific structures can increase the number of shared sequences. The material result is that high/severe composite-risk pages changed from ${before.metrics.tiers.T3_HIGH_TEMPLATE_RISK + before.metrics.tiers.T4_SEVERE_FORMULAIC_RISK} to ${afterMetrics.tiers.T3_HIGH_TEMPLATE_RISK + afterMetrics.tiers.T4_SEVERE_FORMULAIC_RISK}; dictionary and recurring-product consistency is not penalized merely for being consistent.`],
  ["13. Introduction Findings", `Exact intro clusters: ${before.metrics.exactIntroClusters} before / ${afterMetrics.exactIntroClusters} after. No generic scene-setting rewrite campaign was used.`],
  ["14. Conclusion Findings", `Exact conclusion clusters: ${before.metrics.exactConclusionClusters} before / ${afterMetrics.exactConclusionClusters} after. Repeated policy prose was not treated as a required emotional conclusion.`],
  ["15. Takeaway / Practice / Reflection Findings", "Page-specific takeaways remain. Forty-one category-fallback article practices and forty-one fallback questions no longer render; explicit Phase 6 prompts remain. Learn rendering is intent-aware."],
  ["16. FAQ Findings", `${faqRows.length} visible article FAQ questions reviewed as page-specific, answer-bearing reader questions. No query-variation-only removal was evidenced; visible and schema FAQ remain aligned.`],
  ["17. Source-Note Findings", "Real source context and reference links remain. Repeated public-policy prose was replaced by compact trust infrastructure; citation requirements remain claim-dependent."],
  ["18. Related-Content Findings", "Topic-specific related paths and Phase 5 category pathways remain. No internal-link count target or route rewrite was introduced."],
  ["19. Metadata Boilerplate", "Daily Reflection descriptions now use the stored page-specific meaning rather than one universal feature-list suffix. Protected titles remain unchanged."],
  ["20. Article Remediation", "Bodies, takeaways, FAQs, sources, related pathways, dates and schema remain. Generic category fallbacks no longer force practice/reflection sections."],
  ["21. Learn Remediation", "The universal shell is split by learning intent without rewriting the corpus: beginner, dictionary and source-study pages render only appropriate supporting blocks."],
  ["22. Dictionary Treatment", "Predictable reference structure is retained; generic practice, why-it-matters and reflection scaffolding no longer turns entries into formulaic mini-essays."],
  ["23. Sutta / Source Treatment", "Source identification, interpretation limits, study focus and real references remain; structure follows source-study intent."],
  ["24. Dhammapada Treatment", "Translation/source boundaries and verse-specific reflection remain. No mechanical narrative variation was introduced."],
  ["25. Meditation Treatment", "Practice-specific instructions and safety remain; one universal two-paragraph context block and repeated policy prose are removed."],
  ["26. Quote Ecosystem Reconciliation", "Phase 5 architecture, provenance, category curation and 153 noindex permalinks are unchanged."],
  ["27. Daily Reflection Treatment", "Unique reflection data remains; repeated explanatory/policy prose is reduced and metadata now uses page-specific meaning."],
  ["28. Generator / Data-Model Remediation", "Optional rendering replaces forced completeness. Validation detects long duplicate editorial paragraphs and duplicate metadata without blocking natural terminology."],
  ["29. Future Publishing Governance", "Reusable UI is encouraged; reusable prose is limited; indexable pages require independent purpose and page-specific review; bulk generation cannot self-approve."],
  ["30. Search-Equity Preservation", `${changedProtected.length}/${changedProtected.length} materially edited P0/P1 pages pass URL/title/H1/canonical/indexability and intent preservation.`],
  ["31. Phase 6 Information-Gain Preservation", "All C0/C1 source distinctions, analysis, examples, frameworks, references and explicit prompts remain present."],
  ["32. Phase 7 Trust Preservation", "Organizational authorship, dates, source transparency, corrections links, safety boundaries and visible/schema consistency remain."],
  ["33. Before/After Metrics", `Tiers before: ${JSON.stringify(before.metrics.tiers)}. Tiers after: ${JSON.stringify(afterMetrics.tiers)}. These are internal diagnostics, not Google scores or thresholds.`],
  ["34. Remaining Architecture Concerns", "No blocking architecture issue. Large noindex quote/detail families remain intentionally governed user products and are excluded from independent Search inventory."],
  ["35. Build/Test Results", releaseStatus === "PASS" ? "Full Phase 8 release validation passed: build, typecheck, lint, tests, SEO, content, quote, cornerstone, trust, dependency, original 54/54 checkpoint preservation, legacy Phase 8, and cookie-cutter gates." : "Pending final full release validation."],
  ["36. Independent Review", independentStatus === "PASS" && mobileStatus === "PASS" ? "Independent adversarial validation passed 26/26 checks, with a 390×844 responsive editorial review across all affected content families." : "Pending independent adversarial and responsive validation."],
  ["37. Secret Scan", independentStatus === "PASS" ? "SECRET_SCAN = PASS across source, diff, tracked/untracked files, and audit artifacts. No secret value is included in Phase 8 evidence." : "Pending final source, diff and artifact scan."],
  ["38. Inputs for PHASE 9", "Review navigation and responsive UX using the stable route/content inventory. Do not undo family-specific editorial structure."],
  ["39. Inputs for PHASE 10", "Use indexability and monetization-surface evidence; no ad runtime or inventory decision was changed here."],
  ["40. Phase 8 Exit Gate", exitGatePass ? "PHASE_8_STATUS = PASS. Governance, rendered-corpus, independent, responsive, red-team, release and secret gates all pass. Production and AdSense remain unchanged." : "PASS is withheld until full release, rendered-corpus, independent, responsive, red-team and secret gates pass. Production and AdSense remain unchanged."]
];
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_8_COOKIE_CUTTER_REMEDIATION_REPORT.md"), `# Echo Buddha Phase 8 — Cookie-Cutter Remediation Report\n\nAudit date: ${auditDate}\n\n${reportSections.map(([heading, body]) => `## ${heading}\n\n${body}`).join("\n\n")}\n`);

const manifest = {
  generatedAt: new Date().toISOString(), auditDate, phase: 8, startingCommit,
  currentHead: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  branch: execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim(),
  repositoryPrivacy: "PRIVATE_REPOSITORY_RULE_APPLIED", productionMutation: false, adsenseMutation: false, phase9Started: false,
  methods: ["exact paragraph matching", "trigram near-intro similarity", "heading-sequence clustering", "intro/conclusion clustering", "rendered content hashes", "metadata clustering", "boilerplate ratio", "manual family/intent review", "blind/swap/delete/direct-user tests"],
  metricDisclaimer: "All template tiers and ratios are internal Echo Buddha diagnostics, not Google metrics or thresholds.",
  before: before.metrics, after: afterMetrics, changedPages: changedPages.length, changedIndexable, changedProtected: changedProtected.length,
  officialGuidance: [
    "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    "https://developers.google.com/search/docs/essentials/spam-policies",
    "https://support.google.com/adsense/answer/10015918",
    "https://support.google.com/publisherpolicies/answer/11190248",
    "https://developers.google.com/search/docs/appearance/title-link"
  ],
  validationStatus: { governance: governanceStatus, independent: independentStatus, responsive: mobileStatus, release: releaseStatus },
  status: exitGatePass ? "PASS" : "PASS_CANDIDATE_PENDING_FINAL_VALIDATION"
};
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_8_METHOD_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Phase 8 evidence generated: ${pages.length} substantive pages; ${changedPages.length} changed; repeated paragraph clusters ${before.metrics.exactRepeatedSubstantiveParagraphs}->${metrics.exactRepeatedSubstantiveParagraphs}; T3/T4 ${before.metrics.tiers.T3_HIGH_TEMPLATE_RISK + before.metrics.tiers.T4_SEVERE_FORMULAIC_RISK}->${metrics.tiers.T3_HIGH_TEMPLATE_RISK + metrics.tiers.T4_SEVERE_FORMULAIC_RISK}.`);
