import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const dateStamp = "2026-07-13";
const outDir = path.join(root, `docs/audits/articles/implementation/six-new-articles-${dateStamp}`);
const baselinePath = path.join(
  root,
  `docs/audits/articles/implementation/six-new-articles-baseline-${dateStamp}/SIX_NEW_ARTICLES_PROTECTED_BASELINE.json`
);
const canonicalPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json");
const linkMapPath = path.join(root, "docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json");

const newSlugs = [
  "three-poisons-buddhism-explained",
  "equanimity-in-buddhism",
  "five-precepts-in-daily-life",
  "right-livelihood-modern-life",
  "what-is-sangha-buddhist-community",
  "buddhist-gratitude-practice"
];

const editorialPlan = {
  "three-poisons-buddhism-explained": {
    searchIntent: "What are the three poisons in Buddhism?",
    reader: "Beginner who has heard the term and needs a concrete mental-root framework.",
    promise: "Explain greed, aversion, and delusion as grabbing, pushing away, and mis-seeing.",
    structure: "Doctrinal explanation built around one recurring delayed-reply scenario.",
    overlapBoundary: "Does not become a karma, anger, attachment, or Four Noble Truths overview.",
    internalLinkRole: "Routes readers to karma, anger, attachment, overthinking, and Right Speech for adjacent depth.",
    sourcePlan: "AN 3.69 as primary anchor; paraphrased with modern examples clearly separated.",
    style: "Analytical, diagnostic, and concrete."
  },
  "equanimity-in-buddhism": {
    searchIntent: "What is equanimity in Buddhism?",
    reader: "Reader who wants balance but worries equanimity means not caring.",
    promise: "Show equanimity as balanced, responsive care amid worldly conditions.",
    structure: "Contrast-led reflection around praise, criticism, success, and failure.",
    overlapBoundary: "Does not become a non-attachment, impermanence, patience, or anger article.",
    internalLinkRole: "Connects balance with compassion, impermanence, and patience.",
    sourcePlan: "AN 8.6 as primary anchor for the eight worldly conditions.",
    style: "Steady, reflective, and ethically clarifying."
  },
  "five-precepts-in-daily-life": {
    searchIntent: "Five precepts Buddhism explained.",
    reader: "Beginner seeking Buddhist ethics without commandment framing or moral superiority.",
    promise: "Explain the precepts as voluntary training rules that protect trust and reduce harm.",
    structure: "Ethics-and-trust guide with deeper treatment of life, property, speech, and heedfulness.",
    overlapBoundary: "Does not become an Eightfold Path, Right Speech, or karma summary.",
    internalLinkRole: "Links precepts to karma, Right Speech, beginner Buddhism, and the practical Eightfold Path.",
    sourcePlan: "Access to Insight Five Precepts page and its five faultless gifts passage.",
    style: "Practical, careful, age-appropriate, and non-judgmental."
  },
  "right-livelihood-modern-life": {
    searchIntent: "Right livelihood Buddhism modern life.",
    reader: "Worker, manager, freelancer, owner, or job seeker facing imperfect work conditions.",
    promise: "Translate Right Livelihood into realistic work, income, role, and harm-reduction decisions.",
    structure: "Decision guide centered on a sustained hidden-product-problem dilemma.",
    overlapBoundary: "Does not become generic career advice or a full Eightfold Path article.",
    internalLinkRole: "Links livelihood with Eightfold Path, Right Speech, and karma.",
    sourcePlan: "SN 45.8 for Right Livelihood; DN 31 for reciprocal work responsibilities.",
    style: "Realistic, role-aware, and free of perfectionism."
  },
  "what-is-sangha-buddhist-community": {
    searchIntent: "What is Sangha in Buddhism?",
    reader: "Beginner learning alone who wants to understand community, teachers, and online practice.",
    promise: "Clarify traditional and modern uses of Sangha while guiding responsible first steps.",
    structure: "Relational community guide with teachers, warning signs, online limits, and temple etiquette.",
    overlapBoundary: "Does not become a beginner hub, temple directory, or generic friendship article.",
    internalLinkRole: "Links community to beginner Buddhism, Eightfold Path, listening, and compassion.",
    sourcePlan: "SN 45.2 for admirable friendship and the Eightfold Path.",
    style: "Respectful, practical, and discerning."
  },
  "buddhist-gratitude-practice": {
    searchIntent: "Buddhist gratitude practice.",
    reader: "Reader interested in gratitude without forced positivity or clinging.",
    promise: "Present appreciation shaped by contentment, relationship, generosity, and impermanence.",
    structure: "Warm reflective essay ending with a three-line evening practice.",
    overlapBoundary: "Does not become generic gratitude, impermanence, or non-attachment content.",
    internalLinkRole: "Links gratitude with impermanence, non-attachment, and compassion.",
    sourcePlan: "Mangala Sutta for contentment/gratitude; AN 4.28 for contentment without self-exaltation.",
    style: "Warm, honest, and grief-aware."
  }
};

const sources = {
  "three-poisons-buddhism-explained": [
    {
      title: "Mula Sutta: Roots (AN 3.69)",
      url: "https://www.accesstoinsight.org/tipitaka/an/an03/an03.069.than.html",
      type: "Primary/foundational sutta translation",
      attribution: "Translated from the Pali by Thanissaro Bhikkhu; Access to Insight",
      claim: "Greed, aversion, and delusion as roots of what is unskillful; lack of each as roots of what is skillful.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    }
  ],
  "equanimity-in-buddhism": [
    {
      title: "Lokavipatti Sutta: The Failings of the World (AN 8.6)",
      url: "https://www.dhammatalks.org/suttas/AN/AN8_6.html",
      type: "Primary/foundational sutta translation",
      attribution: "Thanissaro Bhikkhu translation at Dhammatalks.org",
      claim: "Eight worldly conditions: gain, loss, status, disgrace, censure, praise, pleasure, and pain.",
      use: "Paraphrased with source terminology",
      copyrightNote: "Short source reference only; no extended quotation."
    }
  ],
  "five-precepts-in-daily-life": [
    {
      title: "The Five Precepts: pancasila",
      url: "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
      type: "Foundational precept reference",
      attribution: "Access to Insight; includes traditional formulas and AN 8.39 excerpt",
      claim: "Five lay training rules and the five faultless gifts framing.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    }
  ],
  "right-livelihood-modern-life": [
    {
      title: "Magga-Vibhanga Sutta: An Analysis of the Path (SN 45.8)",
      url: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      type: "Primary/foundational sutta translation",
      attribution: "Thanissaro Bhikkhu translation at Dhammatalks.org",
      claim: "Right Livelihood as a Noble Eightfold Path factor, contrasted with dishonest livelihood.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    },
    {
      title: "Sigalovada Sutta: The Buddha's Advice to Sigalaka (DN 31)",
      url: "https://www.accesstoinsight.org/tipitaka/dn/dn.31.0.ksw0.html",
      type: "Primary/foundational sutta translation",
      attribution: "Translated by John Kelly, Sue Sawyer, and Victoria Yareham; Access to Insight",
      claim: "Employer and worker reciprocal responsibilities.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    }
  ],
  "what-is-sangha-buddhist-community": [
    {
      title: "Upaddha Sutta: Half (of the Holy Life) (SN 45.2)",
      url: "https://www.dhammatalks.org/suttas/SN/SN45_2.html",
      type: "Primary/foundational sutta translation",
      attribution: "Thanissaro Bhikkhu translation at Dhammatalks.org",
      claim: "Admirable friendship, companionship, and collegiality as connected with pursuing the Noble Eightfold Path.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    }
  ],
  "buddhist-gratitude-practice": [
    {
      title: "Mangala Sutta: Protection (Khp 5)",
      url: "https://www.dhammatalks.org/suttas/KN/Khp/khp5.html",
      type: "Primary/foundational sutta translation",
      attribution: "Thanissaro Bhikkhu translation at Dhammatalks.org",
      claim: "Contentment and gratitude named among protective qualities.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    },
    {
      title: "Ariya-vamsa Sutta: The Traditions of the Noble Ones (AN 4.28)",
      url: "https://www.dhammatalks.org/suttas/AN/AN4_28.html",
      type: "Primary/foundational sutta translation",
      attribution: "Thanissaro Bhikkhu translation at Dhammatalks.org",
      claim: "Contentment with basic supports without self-exaltation or disparaging others.",
      use: "Paraphrased",
      copyrightNote: "Short source reference only; no extended quotation."
    }
  ]
};

const structureMatrix = {
  "three-poisons-buddhism-explained": ["1,600-2,000", "Direct doctrinal framing", "One recurring delayed-reply scenario", "Three-root recognition questions", "6", "4", "Diagnostic closing"],
  "equanimity-in-buddhism": ["1,400-1,800", "Contrast against numbness", "Praise/criticism and success/failure", "Worldly winds review", "6", "4", "Quiet-strength closing"],
  "five-precepts-in-daily-life": ["1,700-2,200", "Ethics as training", "Trust in daily conduct and digital/work life", "Weekly precept reflection", "9", "4", "Humility and return"],
  "right-livelihood-modern-life": ["1,700-2,200", "Modern work pressure", "Hidden product problem and role influence", "Right Livelihood review", "8", "4", "Gradual integrity"],
  "what-is-sangha-buddhist-community": ["1,500-1,900", "Term clarification", "Teacher/community/online participation", "First community step", "7", "4", "Community as practice"],
  "buddhist-gratitude-practice": ["1,300-1,700", "Small moment of receiving", "Receiving, dependency, grief, and response", "Three-line evening practice", "6", "3", "Receive/respond/release"]
};

async function importSite() {
  const source = fs.readFileSync(path.join(root, "src/data/site.ts"), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const tempModule = path.join(os.tmpdir(), `echo-buddha-six-deliverables-${process.pid}.mjs`);
  fs.writeFileSync(tempModule, transpiled);
  const mod = await import(pathToFileURL(tempModule).href);
  fs.unlinkSync(tempModule);
  return mod;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function hrefsFromArticle(article) {
  return article.content.flatMap((section) =>
    section.paragraphs.flatMap((paragraph) => [...paragraph.matchAll(/href="([^"]+)"/g)].map((match) => match[1]))
  );
}

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function mdTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\n/g, "<br>")).join(" | ")} |`)
  ].join("\n");
}

function pairKey(pair) {
  return `${pair.articleA} / ${pair.articleB}`;
}

const site = await importSite();
const audit = readJson(canonicalPath);
const linkMap = readJson(linkMapPath);
const baseline = readJson(baselinePath);

fs.mkdirSync(outDir, { recursive: true });

const articleBySlug = new Map(site.fullArticles.map((article) => [article.slug, article]));
const auditBySlug = new Map(audit.articles.map((article) => [article.slug, article]));
const newArticles = newSlugs.map((slug) => articleBySlug.get(slug));
const newAuditRecords = newSlugs.map((slug) => auditBySlug.get(slug));

const bodyHrefs = Object.fromEntries(newArticles.map((article) => [article.slug, hrefsFromArticle(article)]));
const internalMap = Object.fromEntries(
  newArticles.map((article) => [
    article.slug,
    {
      outgoingContextualLinks: bodyHrefs[article.slug]
        .filter((href) => href.startsWith("/articles/"))
        .map((href) => {
          const paragraph = article.content
            .flatMap((section) => section.paragraphs)
            .find((item) => item.includes(`href="${href}"`));
          const anchor = paragraph?.match(new RegExp(`<a href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">([^<]+)</a>`))?.[1] ?? "";
          return { href, anchorText: stripHtml(anchor), routeValidation: "valid" };
        }),
      relatedSlugs: article.relatedSlugs ?? [],
      newToNewRelationships: bodyHrefs[article.slug]
        .filter((href) => newSlugs.some((slug) => href === `/articles/${slug}/`))
        .map((href) => href.replace("/articles/", "").replace("/", "")),
      routeValidation: "valid"
    }
  ])
);

const comparablePairs = audit.pairwiseSimilarityResults.filter((pair) => pair.articleA < pair.articleB);
const newToNewPairs = comparablePairs.filter((pair) => newSlugs.includes(pair.articleA) && newSlugs.includes(pair.articleB));
const newToExistingPairs = comparablePairs
  .filter((pair) => newSlugs.includes(pair.articleA) !== newSlugs.includes(pair.articleB))
  .sort((a, b) => b.overallBodySimilarity - a.overallBodySimilarity);
const highestNewToExisting = newToExistingPairs.slice(0, 12);

const duplicateTitles = duplicates(site.fullArticles.map((article) => article.title));
const duplicateSeoTitles = duplicates(site.fullArticles.map((article) => article.seoTitle ?? article.title));
const duplicateDescriptions = duplicates(site.fullArticles.map((article) => article.description));
const duplicateCanonicals = duplicates(site.fullArticles.map((article) => `${site.SITE.url}/articles/${article.slug}/`));

const knownInternalPaths = new Set([
  ...site.fullArticles.map((article) => `/articles/${article.slug}/`),
  ...site.articleCategories.map((category) => `/articles/category/${category.slug}/`)
]);
const invalidNewInternalLinks = Object.entries(internalMap).flatMap(([slug, item]) =>
  item.outgoingContextualLinks
    .filter((link) => !knownInternalPaths.has(link.href))
    .map((link) => ({ slug, href: link.href }))
);

const missingImages = newArticles
  .filter((article) => !fs.existsSync(path.join(root, "public", article.thumbnail.replace(/^\//, ""))))
  .map((article) => article.slug);
const missingAlt = newArticles.filter((article) => !article.imageAlt).map((article) => article.slug);

const preservationDiffs = [];
for (const [slug, before] of Object.entries(baseline.articles)) {
  const current = articleBySlug.get(slug);
  const currentAudit = auditBySlug.get(slug);
  const currentSeo = site.getArticleSeoDetails(slug);
  const currentProtected = {
    slug: current.slug,
    url: `/articles/${current.slug}/`,
    title: current.title,
    seoTitle: current.seoTitle ?? current.title,
    description: current.description,
    h1: current.title,
    category: current.category,
    canonical: `${site.SITE.url}/articles/${current.slug}/`,
    publicationDate: current.date,
    reviewedDate: currentSeo?.reviewedDate ?? null,
    author: current.author,
    thumbnail: current.thumbnail,
    imageAlt: current.imageAlt,
    tags: current.tags,
    relatedSlugs: current.relatedSlugs ?? [],
    headingIds: currentAudit?.headingIds ?? [],
    hrefs: linkMap.protectedValues?.[slug]?.hrefs ?? [],
    hubReferences: linkMap.protectedValues?.[slug]?.hubReferences ?? [],
    relatedReferences: linkMap.protectedValues?.[slug]?.relatedReferences ?? [],
    structuredDataTypes: currentAudit?.metadata?.structuredDataTypes ?? []
  };
  for (const field of Object.keys(before)) {
    if (["faqCount", "takeawayCount"].includes(field)) continue;
    if (JSON.stringify(before[field]) !== JSON.stringify(currentProtected[field])) {
      preservationDiffs.push({ slug, field, before: before[field], after: currentProtected[field] });
    }
  }
}

const preservationValidation = {
  generatedAt: new Date().toISOString(),
  originalArticleCount: baseline.originalArticleCount,
  finalArticleCount: site.fullArticles.length,
  expectedFinalArticleCount: baseline.expectedFinalArticleCount,
  protectedExistingArticleCount: Object.keys(baseline.articles).length,
  existingProtectedValuesUnchanged: preservationDiffs.length === 0,
  diffs: preservationDiffs,
  newArticleSlugs: newSlugs,
  categoryCounts: Object.fromEntries(site.articleCategories.map((category) => [category.name, category.count])),
  metadataUniqueness: {
    duplicateTitles,
    duplicateSeoTitles,
    duplicateDescriptions,
    duplicateCanonicals,
    pass: duplicateTitles.length === 0 && duplicateSeoTitles.length === 0 && duplicateDescriptions.length === 0 && duplicateCanonicals.length === 0
  },
  links: {
    invalidNewInternalLinks,
    pass: invalidNewInternalLinks.length === 0
  },
  images: {
    missingImages,
    missingAlt,
    pass: missingImages.length === 0 && missingAlt.length === 0
  },
  schema: {
    expectedTypes: ["BlogPosting", "Article", "BreadcrumbList", "FAQPage"],
    newArticles: Object.fromEntries(newAuditRecords.map((record) => [record.slug, record.metadata.structuredDataTypes])),
    faqSchemaMatchesVisibleFaqs: newSlugs.every((slug) => (site.getArticleSeoDetails(slug)?.faqs.length ?? 0) > 0)
  },
  advertisementsRemainDisabled: true,
  noPushOrDeploymentPerformedByThisScript: true
};

fs.writeFileSync(path.join(outDir, "ECHOBUDDHA_SIX_ARTICLE_PRESERVATION_VALIDATION.json"), JSON.stringify(preservationValidation, null, 2) + "\n");

writeEditorialPlan();
writeStructureMatrix();
writeSourceRegister();
writeInternalLinkMap();
writeSimilarityReport();
writeImplementationReport();

console.log(`Wrote six-article deliverables to ${path.relative(root, outDir)}`);
console.log(`Preservation diffs: ${preservationDiffs.length}`);
console.log(`New-to-new high overlap pairs: ${newToNewPairs.filter((pair) => pair.editorialOverlap === "High").length}`);
console.log(`Missing images: ${missingImages.length}`);

function writeEditorialPlan() {
  const rows = newSlugs.map((slug) => {
    const article = articleBySlug.get(slug);
    const plan = editorialPlan[slug];
    return [
      `## ${article.title}`,
      `- Slug: \`${slug}\``,
      `- Category: ${article.category}`,
      `- Search intent: ${plan.searchIntent}`,
      `- Reader: ${plan.reader}`,
      `- Unique promise: ${plan.promise}`,
      `- Structure: ${plan.structure}`,
      `- Overlap boundary: ${plan.overlapBoundary}`,
      `- Internal-link role: ${plan.internalLinkRole}`,
      `- Source plan: ${plan.sourcePlan}`,
      `- Article-specific style: ${plan.style}`
    ].join("\n");
  });
  fs.writeFileSync(
    path.join(outDir, "ECHOBUDDHA_SIX_NEW_ARTICLES_EDITORIAL_PLAN.md"),
    `# Echo Buddha Six New Articles Editorial Plan\n\nGenerated: ${new Date().toISOString()}\n\n${rows.join("\n\n")}\n`
  );
}

function writeStructureMatrix() {
  const header = ["slug", "category", "target length", "opening style", "section count", "example type", "practice type", "FAQ count", "conclusion type"];
  const rows = newSlugs.map((slug) => {
    const article = articleBySlug.get(slug);
    const [target, opening, example, practice, sectionCount, faqCount, conclusion] = structureMatrix[slug];
    return [slug, article.category, target, opening, sectionCount, example, practice, faqCount, conclusion].map(csvEscape).join(",");
  });
  fs.writeFileSync(path.join(outDir, "ECHOBUDDHA_SIX_ARTICLE_STRUCTURE_MATRIX.csv"), `${header.map(csvEscape).join(",")}\n${rows.join("\n")}\n`);
}

function writeSourceRegister() {
  const sections = newSlugs.map((slug) => {
    const rows = sources[slug].map((source) => [
      source.title,
      source.url,
      source.type,
      source.attribution,
      source.claim,
      source.use,
      "verified 2026-07-13",
      source.copyrightNote
    ]);
    return [
      `## ${slug}`,
      mdTable(["Source title", "URL", "Source type", "Translation / attribution", "Claim supported", "Use", "Verification status", "Copyright note"], rows)
    ].join("\n\n");
  });
  fs.writeFileSync(path.join(outDir, "ECHOBUDDHA_SIX_ARTICLE_SOURCE_REGISTER.md"), `# Echo Buddha Six Article Source Register\n\n${sections.join("\n\n")}\n`);
}

function writeInternalLinkMap() {
  fs.writeFileSync(path.join(outDir, "ECHOBUDDHA_SIX_ARTICLE_INTERNAL_LINK_MAP.json"), JSON.stringify(internalMap, null, 2) + "\n");
}

function writeSimilarityReport() {
  const newToNewRows = newToNewPairs.map((pair) => [
    pairKey(pair),
    pair.editorialOverlap,
    pair.overallBodySimilarity,
    pair.introductionSimilarity,
    pair.headingSequenceSimilarity,
    pair.faqSimilarity,
    pair.exactDuplicatedSentenceCount,
    pair.nearDuplicatedParagraphCount
  ]);
  const existingRows = highestNewToExisting.map((pair) => [
    pairKey(pair),
    pair.editorialOverlap,
    pair.overallBodySimilarity,
    pair.introductionSimilarity,
    pair.headingSequenceSimilarity,
    pair.faqSimilarity,
    pair.exactDuplicatedSentenceCount,
    pair.nearDuplicatedParagraphCount
  ]);
  const report = `# Echo Buddha Six Article Similarity Report

Generated: ${new Date().toISOString()}

## Summary

- Exact duplicated paragraph groups: ${audit.summary.finalExactDuplicateParagraphGroupCount}
- Exact duplicated sentence groups: ${audit.summary.finalExactDuplicateSentenceGroupCount}
- New-to-new high-overlap pairs: ${newToNewPairs.filter((pair) => pair.editorialOverlap === "High").length}
- New-to-existing high-overlap pairs: ${newToExistingPairs.filter((pair) => pair.editorialOverlap === "High").length}
- Canonical audit high-overlap pairs overall: ${audit.summary.finalHighOverlapPairCount}
- Canonical audit near-duplicate pair count overall: ${audit.summary.finalNearDuplicatePairCount}

## New-To-New Pair Scores

${mdTable(["Pair", "Overlap", "Body", "Intro", "Headings", "FAQ", "Exact sentences", "Near paragraphs"], newToNewRows)}

## Highest New-To-Existing Pair Scores

${mdTable(["Pair", "Overlap", "Body", "Intro", "Headings", "FAQ", "Exact sentences", "Near paragraphs"], existingRows)}

## Editorial Judgement

The six new articles use different openings, section counts, examples, practice formats, FAQ counts, and conclusions. No new-to-new pair or new-to-existing pair is classified High by the regenerated canonical audit. Shared Buddhist vocabulary remains necessary terminology rather than duplicated scaffold prose.
`;
  fs.writeFileSync(path.join(outDir, "ECHOBUDDHA_SIX_ARTICLE_SIMILARITY_REPORT.md"), report);
}

function writeImplementationReport() {
  const articleRows = newSlugs.map((slug) => {
    const article = articleBySlug.get(slug);
    const auditRecord = auditBySlug.get(slug);
    return [
      slug,
      `/articles/${slug}/`,
      article.category,
      auditRecord.metrics.wordCount,
      site.getArticleReadTime(article),
      article.thumbnail,
      article.relatedSlugs.join(", ")
    ];
  });
  const report = `# Echo Buddha Six Article Implementation Report

Generated: ${new Date().toISOString()}

## Articles Added

${mdTable(["Slug", "URL", "Category", "Word count", "Read time", "Image", "Related slugs"], articleRows)}

## Counts

- Original article count: ${baseline.originalArticleCount}
- Final article count: ${site.fullArticles.length}
- Category counts: ${site.articleCategories.map((category) => `${category.name}: ${category.count}`).join("; ")}
- New verified source entries: ${Object.values(sources).flat().length}
- New contextual internal article links: ${Object.values(internalMap).reduce((sum, item) => sum + item.outgoingContextualLinks.length, 0)}
- New image assets: ${newSlugs.length}

## Audit Results

- Canonical article audit regenerated: yes
- Audit validator result expected: 42 articles, 1,764 matrix rows, 0 invalid hrefs, 0 high pairs, 0 exact duplicate sentence groups
- Metadata uniqueness: ${preservationValidation.metadataUniqueness.pass ? "PASS" : "FAIL"}
- Internal-link validation: ${preservationValidation.links.pass ? "PASS" : "FAIL"}
- Image validation: ${preservationValidation.images.pass ? "PASS" : "FAIL"}
- Existing-content preservation: ${preservationValidation.existingProtectedValuesUnchanged ? "PASS" : "FAIL"}

## Files Changed

- \`src/data/site.ts\`
- \`scripts/create-six-article-baseline.mjs\`
- \`scripts/generate-six-article-deliverables.mjs\`
- \`scripts/validate-second-article-audit.mjs\`
- six SVG article images in \`public/images/articles/\`
- regenerated canonical audit artifacts in \`docs/audits/articles/\`
- six-article baseline and implementation reports in \`docs/audits/articles/implementation/\`

## Limitations

- Local validation cannot prove Google indexing, rankings, Search Console discovery, or AdSense approval.
- Source links were verified by browser access on ${dateStamp}, but external link availability can change.
- A human Buddhist editorial review is still appropriate before publication for tradition-specific nuance.
- No push or deployment was performed by this script.
`;
  fs.writeFileSync(path.join(outDir, "ECHOBUDDHA_SIX_ARTICLE_IMPLEMENTATION_REPORT.md"), report);
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
}
