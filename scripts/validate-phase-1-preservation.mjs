import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baselinePath = path.join(
  root,
  "docs/audits/articles/implementation/phase-1-baseline-2026-07-13/PHASE_1_PROTECTED_VALUES_BASELINE.json"
);
const canonicalPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json");
const preservationPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json");
const outputPath = path.join(root, "docs/audits/articles/implementation/PHASE_1_PRESERVATION_VALIDATION.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stable(value) {
  return JSON.stringify(value ?? null);
}

function compareField(results, slug, field, before, after) {
  const ok = stable(before) === stable(after);
  results.checks.push({ slug, field, ok, before, after });
  if (!ok) {
    results.failures.push({ slug, field, before, after });
  }
}

const baseline = readJson(baselinePath);
const canonical = readJson(canonicalPath);
const rawPreservation = readJson(preservationPath);
const preservation = rawPreservation.protectedValues ?? rawPreservation;
const currentBySlug = new Map(canonical.articles.map((article) => [article.slug, article]));

const results = {
  generatedAt: new Date().toISOString(),
  baselinePath: path.relative(root, baselinePath),
  canonicalPath: path.relative(root, canonicalPath),
  preservationPath: path.relative(root, preservationPath),
  articleCountBefore: Object.keys(baseline.articles).length,
  articleCountAfter: canonical.articles.length,
  checks: [],
  failures: [],
  status: "pending"
};

for (const [slug, before] of Object.entries(baseline.articles)) {
  const article = currentBySlug.get(slug);
  const map = preservation[slug] ?? {};

  if (!article) {
    results.failures.push({ slug, field: "article", before: "present", after: "missing" });
    continue;
  }

  const after = {
    url: article.url,
    slug: article.slug,
    title: article.title,
    h1: article.h1,
    category: article.category,
    canonical: article.metadata.canonical,
    publicationDate: article.publicationDate,
    structuredDataTypes: article.metadata.structuredDataTypes,
    headingIds: article.headingIds,
    hrefs: map.hrefs ?? [],
    relatedReferences: map.relatedReferences ?? [],
    hubReferences: map.hubReferences ?? []
  };

  for (const field of [
    "url",
    "slug",
    "title",
    "h1",
    "category",
    "canonical",
    "publicationDate",
    "structuredDataTypes",
    "headingIds",
    "hrefs",
    "relatedReferences",
    "hubReferences"
  ]) {
    compareField(results, slug, field, before[field], after[field]);
  }
}

const beforeSlugs = Object.keys(baseline.articles).sort();
const afterSlugs = canonical.articles.map((article) => article.slug).sort();
compareField(results, "_all", "articleSlugs", beforeSlugs, afterSlugs);

results.status = results.failures.length === 0 ? "passed" : "failed";
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2) + "\n");

if (results.failures.length) {
  console.error(`Phase 1 preservation validation failed: ${results.failures.length} protected value changes`);
  for (const failure of results.failures.slice(0, 20)) {
    console.error(`- ${failure.slug} ${failure.field}`);
  }
  process.exit(1);
}

console.log("Phase 1 preservation validation passed");
console.log(`Checks: ${results.checks.length}`);
console.log(`Articles: ${results.articleCountAfter}`);
