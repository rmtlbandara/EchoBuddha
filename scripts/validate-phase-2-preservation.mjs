import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const baselinePath = path.join(
  root,
  "docs/audits/articles/implementation/phase-2-baseline-2026-07-13/PHASE_2_ARTICLE_BASELINE.json"
);
const canonicalPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json");
const preservationPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json");
const outputPath = path.join(root, "docs/audits/articles/implementation/PHASE_2_PRESERVATION_VALIDATION.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stable(value) {
  return JSON.stringify(value ?? null);
}

function compareField(results, slug, field, before, after) {
  const ok = stable(before) === stable(after);
  results.checks.push({ slug, field, ok, before, after });
  if (!ok) results.failures.push({ slug, field, before, after });
}

async function importTs(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const tempModule = path.join(os.tmpdir(), `echo-buddha-phase2-${process.pid}-${path.basename(relativePath)}.mjs`);
  fs.writeFileSync(tempModule, transpiled);
  const mod = await import(pathToFileURL(tempModule).href);
  fs.unlinkSync(tempModule);
  return mod;
}

const baseline = readJson(baselinePath);
const canonical = readJson(canonicalPath);
const rawPreservation = readJson(preservationPath);
const preservation = rawPreservation.protectedValues ?? rawPreservation;
const site = await importTs("src/data/site.ts");
const currentBySlug = new Map(canonical.articles.map((article) => [article.slug, article]));
const sourceBySlug = new Map(site.fullArticles.map((article) => [article.slug, article]));

const results = {
  generatedAt: new Date().toISOString(),
  baselinePath: path.relative(root, baselinePath),
  canonicalPath: path.relative(root, canonicalPath),
  preservationPath: path.relative(root, preservationPath),
  articleCountBefore: baseline.slugs.length,
  articleCountAfter: baseline.slugs.length,
  checks: [],
  failures: [],
  status: "pending"
};

for (const slug of baseline.slugs) {
  const before = baseline.articles[slug];
  const article = currentBySlug.get(slug);
  const sourceArticle = sourceBySlug.get(slug);
  const map = preservation[slug] ?? {};

  if (!article || !sourceArticle) {
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
    reviewedDate: article.reviewedDate,
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
    "reviewedDate",
    "structuredDataTypes",
    "headingIds",
    "hrefs",
    "relatedReferences",
    "hubReferences"
  ]) {
    compareField(results, slug, field, before[field], after[field]);
  }
}

results.status = results.failures.length === 0 ? "passed" : "failed";
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2) + "\n");

if (results.failures.length) {
  console.error(`Phase 2 preservation validation failed: ${results.failures.length} protected value changes`);
  for (const failure of results.failures.slice(0, 20)) console.error(`- ${failure.slug} ${failure.field}`);
  process.exit(1);
}

console.log("Phase 2 preservation validation passed");
console.log(`Checks: ${results.checks.length}`);
console.log(`Articles: ${results.articleCountAfter}`);
