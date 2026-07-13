import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const outDir = path.join(root, "docs/audits/articles/implementation/phase-3-baseline-2026-07-13");
const canonicalPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json");
const preservationPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json");
const outputPath = path.join(outDir, "PHASE_3_ARTICLE_BASELINE.json");

const slugs = [
  "what-is-buddhism-beginner-guide",
  "buddhism-for-beginners-simple-guide",
  "four-noble-truths-explained-simply",
  "four-noble-truths-explained",
  "noble-eightfold-path-practical-guide",
  "eightfold-path-explained",
  "eightfold-path-explained-daily-life",
  "impermanence-in-buddhism",
  "buddhist-teachings-on-impermanence",
  "loving-kindness-meditation-guide",
  "loving-kindness-meditation-beginners",
  "metta-meditation-script",
  "compassion-in-buddhism-beginner-guide",
  "compassion-as-a-daily-discipline",
  "buddhist-teachings-on-forgiveness",
  "right-speech-buddhism",
  "buddhist-approach-to-anger",
  "three-ways-to-practice-patience",
  "mindful-listening-in-everyday-life",
  "dhammapada-reflection-what-we-think",
  "dhammapada-reflection-trained-mind",
  "what-is-karma-in-buddhism",
  "buddhist-wisdom-for-overthinking",
  "creating-a-peaceful-corner-at-home"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function importSite() {
  const sourcePath = path.join(root, "src/data/site.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const tempModule = path.join(os.tmpdir(), `echo-buddha-phase3-baseline-${process.pid}.mjs`);
  fs.writeFileSync(tempModule, transpiled);
  const mod = await import(pathToFileURL(tempModule).href);
  fs.unlinkSync(tempModule);
  return mod;
}

const canonical = readJson(canonicalPath);
const preservation = readJson(preservationPath).protectedValues;
const site = await importSite();
const canonicalBySlug = new Map(canonical.articles.map((article) => [article.slug, article]));
const sourceBySlug = new Map(site.fullArticles.map((article) => [article.slug, article]));

const articles = {};
for (const slug of slugs) {
  const article = canonicalBySlug.get(slug);
  const sourceArticle = sourceBySlug.get(slug);
  const map = preservation[slug] ?? {};
  const seo = site.getArticleSeoDetails(slug);

  if (!article || !sourceArticle) throw new Error(`Missing article in baseline: ${slug}`);

  articles[slug] = {
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
    hubReferences: map.hubReferences ?? [],
    body: sourceArticle.content,
    faqs: seo?.faqs ?? [],
    takeaways: seo?.takeaways ?? [],
    score: article.score,
    finalRecommendation: article.finalRecommendation,
    primaryCluster: article.primaryCluster
  };
}

const baseline = {
  createdAt: new Date().toISOString(),
  phase: 3,
  slugs,
  articles,
  pairwiseSimilarityResults: canonical.pairwiseSimilarityResults,
  summary: canonical.summary,
  exactDuplication: canonical.exactDuplication
};

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(canonicalPath, path.join(outDir, "ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.before-phase-3.json"));
fs.copyFileSync(preservationPath, path.join(outDir, "ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.before-phase-3.json"));
fs.copyFileSync(
  path.join(root, "docs/audits/articles/ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv"),
  path.join(outDir, "ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.before-phase-3.csv")
);
fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2) + "\n");

console.log(`Created Phase 3 baseline for ${slugs.length} articles`);
