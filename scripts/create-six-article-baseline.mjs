import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const dateStamp = "2026-07-13";
const outDir = path.join(root, `docs/audits/articles/implementation/six-new-articles-baseline-${dateStamp}`);
const canonicalPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json");
const preservationPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json");
const matrixPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv");
const priorityPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.csv");
const baselinePath = path.join(outDir, "SIX_NEW_ARTICLES_PROTECTED_BASELINE.json");

async function importSite() {
  const sourcePath = path.join(root, "src/data/site.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const tempModule = path.join(os.tmpdir(), `echo-buddha-six-article-baseline-${process.pid}.mjs`);
  fs.writeFileSync(tempModule, transpiled);
  const mod = await import(pathToFileURL(tempModule).href);
  fs.unlinkSync(tempModule);
  return mod;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const canonical = readJson(canonicalPath);
const preservation = readJson(preservationPath);
const site = await importSite();

const canonicalBySlug = new Map(canonical.articles.map((article) => [article.slug, article]));
const preservationBySlug = preservation.protectedValues ?? {};

const articles = Object.fromEntries(
  site.fullArticles.map((article) => {
    const canonicalArticle = canonicalBySlug.get(article.slug);
    const seo = site.getArticleSeoDetails(article.slug);
    const protectedMap = preservationBySlug[article.slug] ?? {};

    return [
      article.slug,
      {
        slug: article.slug,
        url: `/articles/${article.slug}/`,
        title: article.title,
        seoTitle: article.seoTitle ?? article.title,
        description: article.description,
        h1: article.title,
        category: article.category,
        canonical: `${site.SITE.url}/articles/${article.slug}/`,
        publicationDate: article.date,
        reviewedDate: seo?.reviewedDate ?? null,
        author: article.author,
        thumbnail: article.thumbnail,
        imageAlt: article.imageAlt,
        tags: article.tags,
        relatedSlugs: article.relatedSlugs ?? [],
        headingIds: canonicalArticle?.headingIds ?? [],
        hrefs: protectedMap.hrefs ?? [],
        hubReferences: protectedMap.hubReferences ?? [],
        relatedReferences: protectedMap.relatedReferences ?? [],
        structuredDataTypes: canonicalArticle?.metadata?.structuredDataTypes ?? ["BlogPosting", "Article", "BreadcrumbList", "FAQPage"],
        faqCount: seo?.faqs?.length ?? 0,
        takeawayCount: seo?.takeaways?.length ?? 0
      }
    ];
  })
);

const categoryCounts = Object.fromEntries(
  site.articleCategories.map((category) => [
    category.name,
    site.fullArticles.filter((article) => article.category === category.name).length
  ])
);

const baseline = {
  createdAt: new Date().toISOString(),
  phase: "six-new-articles-pre-implementation",
  expectedFinalArticleCount: site.fullArticles.length + 6,
  originalArticleCount: site.fullArticles.length,
  originalSlugs: site.fullArticles.map((article) => article.slug),
  categoryCounts,
  sitemapArticleCount: site.fullArticles.length,
  searchIndexArticleCount: site.fullArticles.length,
  canonicalAuditSummary: canonical.summary,
  exactDuplication: canonical.exactDuplication,
  highOverlapPairCount: canonical.summary?.finalHighOverlapPairCount,
  mediumOverlapPairCount: canonical.summary?.finalMediumOverlapPairCount,
  articles
};

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(canonicalPath, path.join(outDir, "ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.before-six-new-articles.json"));
fs.copyFileSync(preservationPath, path.join(outDir, "ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.before-six-new-articles.json"));
fs.copyFileSync(matrixPath, path.join(outDir, "ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.before-six-new-articles.csv"));
fs.copyFileSync(priorityPath, path.join(outDir, "ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.before-six-new-articles.csv"));
fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");

console.log(`Created six-article baseline for ${baseline.originalArticleCount} existing articles`);
console.log(`Expected final article count: ${baseline.expectedFinalArticleCount}`);
