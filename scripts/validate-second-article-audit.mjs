import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const auditDir = path.join(root, "docs/audits/articles");
const canonicalPath = path.join(auditDir, "ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json");
const matrixPath = path.join(auditDir, "ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv");
const priorityPath = path.join(auditDir, "ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.csv");
const linkMapPath = path.join(auditDir, "ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json");
const finalPath = path.join(auditDir, "ECHOBUDDHA_SECOND_AUDIT_FINAL_REPORT.md");

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function csvLineCount(file) {
  return fs.readFileSync(file, "utf8").trim().split(/\r?\n/).length;
}

function unique(values) {
  return [...new Set(values)];
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function importTs(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const tempModule = path.join(os.tmpdir(), `echo-buddha-validate-${process.pid}-${path.basename(relativePath)}.mjs`);
  fs.writeFileSync(tempModule, transpiled);
  const mod = await import(pathToFileURL(tempModule).href);
  fs.unlinkSync(tempModule);
  return mod;
}

const canonical = readJson(canonicalPath);
const linkMap = readJson(linkMapPath);
const finalReport = fs.readFileSync(finalPath, "utf8");
const site = await importTs("src/data/site.ts");

const articles = canonical.articles;
const slugs = articles.map((article) => article.slug);
const sourceSlugs = site.fullArticles.map((article) => article.slug);
assert(articles.length === 36, `Expected 36 canonical articles, found ${articles.length}`);
assert(articles.length === site.fullArticles.length, "Canonical article count does not match fullArticles");
assert(unique(slugs).length === slugs.length, "Duplicate canonical slugs found");
assert(JSON.stringify(slugs) === JSON.stringify(sourceSlugs), "Canonical article order/slugs do not match fullArticles");

const titles = articles.map((article) => article.title);
const seoTitles = articles.map((article) => article.metadata.seoTitle);
const descriptions = articles.map((article) => article.metadata.metaDescription);
const canonicals = articles.map((article) => article.metadata.canonical);
assert(unique(titles).length === titles.length, "Duplicate article titles found");
assert(unique(seoTitles).length === seoTitles.length, "Duplicate SEO titles found");
assert(unique(descriptions).length === descriptions.length, "Duplicate meta descriptions found");
assert(unique(canonicals).length === canonicals.length, "Duplicate canonicals found");

for (const article of articles) {
  assert(article.h1 && article.h1 === article.title, `Missing or mismatched H1 for ${article.slug}`);
  assert(article.category, `Missing category for ${article.slug}`);
  assert(article.metadata.image, `Missing image for ${article.slug}`);
  assert(article.metadata.imageAlt, `Missing image alt for ${article.slug}`);
  assert(article.reviewedDate, `Missing reviewed date for ${article.slug}`);
  assert(unique(article.headingIds).length === article.headingIds.length, `Duplicate heading IDs inside ${article.slug}`);
  const sourceArticle = site.fullArticles.find((item) => item.slug === article.slug);
  const expectedHeadingIds = sourceArticle.content.map((section) => section.heading).filter(Boolean).map(slugify);
  assert(JSON.stringify(expectedHeadingIds) === JSON.stringify(article.headingIds), `Heading ID stability mismatch for ${article.slug}`);
  assert(article.metadata.structuredDataTypes.includes("BlogPosting"), `Missing BlogPosting schema baseline for ${article.slug}`);
  assert(article.metadata.structuredDataTypes.includes("FAQPage"), `Missing FAQPage schema baseline for ${article.slug}`);
  assert(article.author === site.SITE.author, `Visible/schema author mismatch candidate for ${article.slug}`);
}

const categoryCounts = Object.fromEntries(site.articleCategories.map((category) => [
  category.name,
  site.fullArticles.filter((article) => article.category === category.name).length
]));
for (const category of site.articleCategories) {
  assert(category.count === categoryCounts[category.name], `Category count mismatch for ${category.name}`);
}

const knownPaths = new Set([
  "/",
  "/about/",
  "/start-here/",
  "/editorial-policy/",
  "/authors/echo-buddha-editorial/",
  "/learn/",
  "/daily-reflections/",
  "/daily-reflections/today/",
  "/mindful-living/",
  "/tools/",
  "/quotes/",
  "/articles/",
  "/meditation/",
  "/meditation-guide/",
  "/contact/",
  "/privacy-policy/",
  "/terms-of-use/",
  "/disclaimer/",
  "/search/",
  ...site.fullArticles.map((article) => `/articles/${article.slug}/`),
  ...site.articleCategories.map((category) => `/articles/category/${category.slug}/`),
  ...site.quoteCategories.map((category) => `/quotes/${category.slug}/`),
  ...site.quotes.filter(site.isQuoteStoryIndexable).map(site.getQuoteStoryPath),
  ...sourceDiscoveredHrefs(),
  ...distDiscoveredPaths()
]);

const invalidHrefs = [];
for (const [slug, item] of Object.entries(linkMap.protectedValues)) {
  for (const href of item.hrefs) {
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) continue;
    const [pathOnly] = href.split("#");
    if (!knownPaths.has(pathOnly)) invalidHrefs.push({ slug, href });
  }
}
assert(invalidHrefs.length === 0, `Invalid internal href(s): ${JSON.stringify(invalidHrefs.slice(0, 10))}`);

const expectedMatrixRows = articles.length * articles.length + 1;
assert(csvLineCount(matrixPath) === expectedMatrixRows, `Pairwise matrix row count mismatch; expected ${expectedMatrixRows}, got ${csvLineCount(matrixPath)}`);
assert(csvLineCount(priorityPath) === articles.length + 1, `Priority matrix row count mismatch; expected ${articles.length + 1}, got ${csvLineCount(priorityPath)}`);

const summary = canonical.summary;
const requiredSnippets = [
  `Articles audited: ${summary.articlesAudited}`,
  `Previous artifacts inspected: ${summary.previousAuditArtifactsInspected}`,
  `Inconsistencies found and resolved: ${summary.inconsistenciesFoundAndResolved}`,
  `Exact duplicated sentence groups: ${summary.finalExactDuplicateSentenceGroupCount}`,
  `Near-duplicate pair count: ${summary.finalNearDuplicatePairCount}`,
  `High-overlap cluster count: ${summary.highOverlapClusterCount}`,
  `Articles requiring substantial rewrite: ${summary.substantialRewriteCount}`,
  `Articles requiring targeted rewrite or cluster repositioning: ${summary.targetedRewriteCount}`,
  `Articles requiring only light polish/no change: ${summary.lightPolishOrNoChangeCount}`,
  `Articles requiring source-aware review: ${summary.sourceAwareReviewCount}`,
  `Articles requiring wellbeing review: ${summary.wellbeingReviewCount}`
];
for (const snippet of requiredSnippets) {
  assert(finalReport.includes(snippet), `Final report missing canonical snippet: ${snippet}`);
}

const duplicateSentenceGroups = canonical.exactDuplication.exactDuplicatedSentenceGroupCount;
const highPairs = canonical.pairwiseSimilarityResults.filter((pair) => pair.editorialOverlap === "High" && pair.articleA < pair.articleB).length;
assert(duplicateSentenceGroups === summary.finalExactDuplicateSentenceGroupCount, "Exact duplicate sentence regression count mismatch");
assert(highPairs === summary.finalHighOverlapPairCount, "High-similarity pair regression count mismatch");

console.log("Second audit validation passed");
console.log(`Articles: ${articles.length}`);
console.log(`Matrix rows: ${expectedMatrixRows - 1}`);
console.log(`Invalid hrefs: ${invalidHrefs.length}`);
console.log(`High pairs: ${highPairs}`);
console.log(`Exact duplicate sentence groups: ${duplicateSentenceGroups}`);

function sourceDiscoveredHrefs() {
  const files = [
    "src/data/learn.ts",
    "src/data/dailyReflections.ts",
    "src/data/site.ts",
    "src/pages/index.astro",
    "src/pages/start-here.astro",
    "src/pages/mindful-living.astro",
    "src/pages/quotes/[category].astro"
  ];
  const hrefs = [];
  for (const file of files) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, "utf8");
    for (const match of text.matchAll(/href:\s*["']([^"']+)["']|href=["']([^"']+)["']/g)) {
      const href = match[1] ?? match[2];
      if (href?.startsWith("/")) hrefs.push(href.split("#")[0]);
    }
  }
  return hrefs;
}

function distDiscoveredPaths() {
  const dist = path.join(root, "dist");
  if (!fs.existsSync(dist)) return [];
  const paths = [];
  walk(dist, (file) => {
    if (!file.endsWith("index.html")) return;
    const rel = path.relative(dist, file).replace(/\\/g, "/");
    paths.push(rel === "index.html" ? "/" : `/${rel.replace(/index\.html$/, "")}`);
  });
  return paths;
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, callback);
    else callback(abs);
  }
}
