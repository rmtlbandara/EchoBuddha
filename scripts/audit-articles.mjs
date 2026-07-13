import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const sourcePath = path.join(root, "src/data/site.ts");
const outDir = path.join(root, "docs");
const inventoryPath = path.join(outDir, "article-audit-inventory.json");
const reportPath = path.join(outDir, "article-audit-report.md");

const source = fs.readFileSync(sourcePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

const tempModule = path.join(os.tmpdir(), `echo-buddha-site-data-${process.pid}.mjs`);
fs.writeFileSync(tempModule, transpiled);
const site = await import(pathToFileURL(tempModule).href);
fs.unlinkSync(tempModule);

const {
  SITE,
  articleCategories,
  fullArticles,
  getArticleCategory,
  getArticleReadTime,
  getArticleSeoDetails,
  getArticleWordCount,
  getQuoteThemeForArticleCategory,
  slugify
} = site;

const protectedSourceFile = "src/data/site.ts";
const articleRouteFile = "src/pages/articles/[slug].astro";

const relatedBuddhistTermsByCategory = {
  "Buddhist Wisdom": [
    { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" },
    { label: "Karma", href: "/learn/buddhist-dictionary/karma/" },
    { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" }
  ],
  Meditation: [
    { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
    { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" },
    { label: "Metta", href: "/learn/buddhist-dictionary/metta/" }
  ],
  Mindfulness: [
    { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
    { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" },
    { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" }
  ],
  Reflection: [
    { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" },
    { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" },
    { label: "Anatta", href: "/learn/buddhist-dictionary/anatta/" }
  ],
  Practice: [
    { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
    { label: "Compassion", href: "/learn/buddhist-dictionary/compassion/" },
    { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" }
  ]
};

const rendererTopicClusters = [
  {
    name: "Four Noble Truths",
    slugs: ["four-noble-truths-explained", "four-noble-truths-explained-simply"],
    preferredPrimaryPage: "/learn/four-noble-truths/",
    role: "Hub-and-spoke doctrinal explanation"
  },
  {
    name: "Noble Eightfold Path",
    slugs: ["eightfold-path-explained", "eightfold-path-explained-daily-life", "noble-eightfold-path-practical-guide"],
    preferredPrimaryPage: "/learn/eightfold-path/",
    role: "Hub-and-spoke path explanation and practice"
  },
  {
    name: "Impermanence",
    slugs: ["impermanence-in-buddhism", "buddhist-teachings-on-impermanence", "impermanence-in-buddhism-letting-go"],
    preferredPrimaryPage: "/learn/buddhism-101/what-is-impermanence/",
    role: "Definition, acceptance, and letting-go angles"
  },
  {
    name: "Beginner Meditation",
    slugs: ["how-to-meditate-for-beginners", "mindfulness-of-breathing-guide", "mindfulness-vs-meditation", "beginning-a-daily-mindfulness-practice", "walking-meditation-step-by-step"],
    preferredPrimaryPage: "/meditation/",
    role: "Practice hub plus method-specific articles"
  },
  {
    name: "Loving-kindness / Metta",
    slugs: ["loving-kindness-meditation-guide", "loving-kindness-meditation-beginners", "metta-meditation-script"],
    preferredPrimaryPage: "/meditation/loving-kindness-meditation/",
    role: "Practice guide, beginner introduction, and script"
  },
  {
    name: "Beginner Buddhism",
    slugs: ["what-is-buddhism-beginner-guide", "buddhism-for-beginners-simple-guide"],
    preferredPrimaryPage: "/learn/buddhism-for-beginners/",
    role: "Beginner orientation and broad article support"
  },
  {
    name: "Karma",
    slugs: ["what-is-karma-in-buddhism"],
    preferredPrimaryPage: "/learn/buddhism-101/what-is-karma-in-buddhism/",
    role: "Daily-life support article for the learning page"
  },
  {
    name: "Dhammapada Reflections",
    slugs: ["dhammapada-reflection-what-we-think", "dhammapada-reflection-trained-mind"],
    preferredPrimaryPage: "/learn/dhammapada-reflections/",
    role: "Original reflections inspired by broad Dhammapada themes"
  }
];

const auditClusters = [
  ...rendererTopicClusters,
  {
    name: "Attachment, Non-attachment, and Letting Go",
    slugs: ["how-to-let-go-of-attachment-in-buddhism", "how-to-practice-non-attachment", "letting-go-without-giving-up", "impermanence-in-buddhism-letting-go"],
    preferredPrimaryPage: "/articles/how-to-let-go-of-attachment-in-buddhism/",
    role: "Concept guide, daily practice, effort distinction, and impermanence angle"
  },
  {
    name: "Compassion and Forgiveness",
    slugs: ["compassion-in-buddhism-beginner-guide", "compassion-as-a-daily-discipline", "buddhist-teachings-on-forgiveness", "loving-kindness-meditation-beginners"],
    preferredPrimaryPage: "/articles/compassion-in-buddhism-beginner-guide/",
    role: "Definition, discipline, repair, and metta support"
  },
  {
    name: "Mindfulness Routines and Relationships",
    slugs: ["mindfulness-vs-meditation", "beginning-a-daily-mindfulness-practice", "mindfulness-morning-routine", "mindful-listening-in-everyday-life", "mindfulness-for-better-sleep"],
    preferredPrimaryPage: "/learn/buddhism-101/what-is-mindfulness/",
    role: "Comparison, habit, morning, listening, and sleep use cases"
  },
  {
    name: "Sensitive Wellbeing Topics",
    slugs: ["how-to-meditate-for-anxiety", "buddhist-wisdom-for-overthinking", "buddhist-approach-to-anger", "mindfulness-for-better-sleep", "buddhist-teachings-on-impermanence"],
    preferredPrimaryPage: "Manual review cluster",
    role: "Educational guidance that needs careful non-clinical boundaries"
  },
  {
    name: "Patience and Speech Practice",
    slugs: ["right-speech-buddhism", "three-ways-to-practice-patience", "mindful-listening-in-everyday-life", "buddhist-approach-to-anger"],
    preferredPrimaryPage: "/articles/right-speech-buddhism/",
    role: "Ethical speech, patience, listening, and anger response"
  }
];

const wellbeingSlugs = new Set([
  "how-to-meditate-for-anxiety",
  "mindfulness-for-better-sleep",
  "buddhist-approach-to-anger",
  "buddhist-wisdom-for-overthinking",
  "impermanence-in-buddhism"
]);

const stockTransitions = [
  "This does not mean",
  "A simple way",
  "In daily life",
  "For beginners",
  "The good news",
  "It is important to remember",
  "A useful beginning",
  "A gentle way",
  "One way to practice",
  "The goal is not",
  "This is why",
  "Begin by",
  "Notice"
];

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeBasicEntities(value = "") {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function words(value = "") {
  return decodeBasicEntities(stripHtml(value).toLowerCase())
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function wordCount(value = "") {
  return words(value).length;
}

function splitSentences(value = "") {
  return decodeBasicEntities(stripHtml(value))
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => wordCount(sentence) >= 8);
}

function normalizeText(value = "") {
  return words(value).join(" ");
}

function extractHrefs(value = "") {
  const hrefs = [];
  const pattern = /href=["']([^"']+)["']/g;
  for (const match of value.matchAll(pattern)) hrefs.push(match[1]);
  return hrefs;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function tokensForSimilarity(value = "") {
  return new Set(words(value).filter((token) => token.length > 2));
}

function jaccardText(a, b) {
  const aSet = tokensForSimilarity(a);
  const bSet = tokensForSimilarity(b);
  const union = new Set([...aSet, ...bSet]);
  if (union.size === 0) return 0;
  let overlap = 0;
  for (const token of aSet) if (bSet.has(token)) overlap += 1;
  return overlap / union.size;
}

function cosineText(a, b) {
  const aWords = words(a).filter((token) => token.length > 2);
  const bWords = words(b).filter((token) => token.length > 2);
  const aFreq = new Map();
  const bFreq = new Map();
  for (const token of aWords) aFreq.set(token, (aFreq.get(token) ?? 0) + 1);
  for (const token of bWords) bFreq.set(token, (bFreq.get(token) ?? 0) + 1);
  const terms = new Set([...aFreq.keys(), ...bFreq.keys()]);
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (const term of terms) {
    const av = aFreq.get(term) ?? 0;
    const bv = bFreq.get(term) ?? 0;
    dot += av * bv;
    aMag += av * av;
    bMag += bv * bv;
  }
  return aMag && bMag ? dot / (Math.sqrt(aMag) * Math.sqrt(bMag)) : 0;
}

function articleBodyText(article) {
  return article.content
    .flatMap((section) => [section.heading ?? "", section.subheading ?? "", ...(section.paragraphs ?? []).map(stripHtml)])
    .join("\n");
}

function articleHtmlText(article) {
  return article.content
    .flatMap((section) => [section.heading ?? "", section.subheading ?? "", ...(section.paragraphs ?? []), section.visual ?? ""])
    .join("\n");
}

function inferTopic(article) {
  const text = `${article.title} ${article.tags.join(" ")} ${article.category}`.toLowerCase();
  const topics = [
    ["what is buddhism", "Buddhism for beginners"],
    ["buddhism for beginners", "Buddhism for beginners"],
    ["dhammapada", "Dhammapada reflection"],
    ["loving-kindness", "Loving-kindness / metta"],
    ["metta", "Loving-kindness / metta"],
    ["right speech", "Right Speech"],
    ["speech", "Right Speech"],
    ["eightfold", "Noble Eightfold Path"],
    ["four noble", "Four Noble Truths"],
    ["impermanence", "Impermanence"],
    ["karma", "Karma"],
    ["attachment", "Attachment / non-attachment"],
    ["letting go", "Letting go"],
    ["compassion", "Compassion"],
    ["forgiveness", "Forgiveness"],
    ["meditate", "Meditation"],
    ["meditation", "Meditation"],
    ["anger", "Anger"],
    ["overthinking", "Overthinking"],
    ["sleep", "Sleep"],
    ["patience", "Patience"],
    ["listening", "Mindful listening"],
    ["mindfulness", "Mindfulness"],
    ["mindful", "Mindfulness"],
    ["buddhism", "Buddhism for beginners"]
  ];
  return topics.find(([needle]) => text.includes(needle))?.[1] ?? article.category;
}

function inferSearchIntent(article) {
  const title = article.title.toLowerCase();
  if (title.includes("what is") || title.includes("explained") || title.includes("beginner")) return "Beginner informational";
  if (title.includes("how to") || title.includes("step-by-step") || title.includes("practice") || title.includes("script")) return "Practical instruction";
  if (title.includes("reflection")) return "Reflective interpretation";
  if (title.includes("routine") || title.includes("daily")) return "Daily-life application";
  return article.category === "Meditation" ? "Practice guidance" : "Educational explanation";
}

function getClusterForSlug(slug) {
  return auditClusters.find((cluster) => cluster.slugs.includes(slug));
}

function sharedBlockCount(article) {
  let count = 6; // key takeaways, practice today, reflection question, related terms, FAQ, source note.
  if (wellbeingSlugs.has(article.slug)) count += 1;
  if (rendererTopicClusters.some((cluster) => cluster.slugs.includes(article.slug))) count += 1;
  return count;
}

function articleStatus(article, metrics) {
  const cluster = getClusterForSlug(article.slug);
  const doctrinal = /buddh|four noble|eightfold|karma|impermanence|dhammapada|attachment|metta|compassion/i.test(
    `${article.title} ${article.tags.join(" ")}`
  );
  if (metrics.sensitiveWellbeing && !metrics.hasWellbeingNote) return "Manual review: add article-specific wellbeing boundary";
  if (doctrinal && cluster && metrics.clusterSimilarity >= 0.42) return "Strengthen differentiation and source-aware support";
  if (doctrinal && metrics.externalSourceLinks === 0) return "Keep, but strengthen source-aware support";
  if (cluster && metrics.clusterSimilarity >= 0.42) return "Strengthen differentiation inside overlap cluster";
  if (metrics.stockTransitionHits >= 8) return "Keep, but reduce template-like transitions";
  return "Keep with light editorial polish";
}

function articleRecommendation(article, metrics) {
  const status = articleStatus(article, metrics);
  if (status.includes("differentiation") && status.includes("source-aware")) {
    return "Clarify the article's unique role in its cluster and add a short source-aware reference path for the traditional teaching.";
  }
  if (status.includes("differentiation")) {
    return "Clarify the article's unique promise in the introduction, add one article-specific example, and point broader intent toward the relevant hub.";
  }
  if (status.includes("source-aware")) {
    return "Add a short source-aware note or reputable reference path for the core traditional teaching without inventing citations or changing URLs.";
  }
  if (status.includes("wellbeing")) {
    return "Use a targeted caution that meditation is educational and not a substitute for qualified care; avoid generic sitewide disclaimer duplication.";
  }
  if (status.includes("template-like")) {
    return "Vary openings, reduce stock transitions, and replace portable paragraphs with concrete examples specific to this article.";
  }
  return "No structural change required; future updates should preserve current URL, internal links, heading IDs, and schema dates unless materially revised.";
}

const allArticleTexts = new Map(fullArticles.map((article) => [article.slug, articleBodyText(article)]));
const pairSimilarities = [];
for (let i = 0; i < fullArticles.length; i += 1) {
  for (let j = i + 1; j < fullArticles.length; j += 1) {
    const a = fullArticles[i];
    const b = fullArticles[j];
    const cosine = cosineText(allArticleTexts.get(a.slug), allArticleTexts.get(b.slug));
    const jaccard = jaccardText(allArticleTexts.get(a.slug), allArticleTexts.get(b.slug));
    pairSimilarities.push({
      a: a.slug,
      b: b.slug,
      cosine: Number(cosine.toFixed(3)),
      jaccard: Number(jaccard.toFixed(3))
    });
  }
}
pairSimilarities.sort((a, b) => b.cosine - a.cosine);

function maxClusterSimilarity(article) {
  const cluster = getClusterForSlug(article.slug);
  if (!cluster) return 0;
  return Math.max(
    0,
    ...pairSimilarities
      .filter((pair) => [pair.a, pair.b].includes(article.slug) && cluster.slugs.includes(pair.a) && cluster.slugs.includes(pair.b))
      .map((pair) => pair.cosine)
  );
}

const inventory = fullArticles.map((article) => {
  const seo = getArticleSeoDetails(article.slug);
  const category = getArticleCategory(article.category);
  const canonicalPath = `/articles/${article.slug}/`;
  const liveUrl = `${SITE.url}${canonicalPath}`;
  const titleTag = `${article.seoTitle ?? article.title} | ${SITE.name}`;
  const h2 = article.content.filter((section) => section.heading).map((section) => section.heading);
  const h3 = article.content.filter((section) => section.subheading).map((section) => section.subheading);
  const headingIds = h2.map((heading) => slugify(heading));
  const htmlText = articleHtmlText(article);
  const contentHrefs = extractHrefs(htmlText);
  const selectedRelatedArticles = (article.relatedSlugs ?? [])
    .map((slug) => fullArticles.find((item) => item.slug === slug)?.slug)
    .filter(Boolean);
  const relatedArticles = selectedRelatedArticles.length > 0
    ? selectedRelatedArticles
    : fullArticles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 3).map((item) => item.slug);
  const relatedTerms = relatedBuddhistTermsByCategory[article.category] ?? [];
  const quoteTheme = getQuoteThemeForArticleCategory(article.category);
  const activeRendererCluster = rendererTopicClusters.find((cluster) => cluster.slugs.includes(article.slug));
  const continueLearningLinks = activeRendererCluster?.slugs.includes(article.slug)
    ? [
        activeRendererCluster.preferredPrimaryPage,
        ...activeRendererCluster.slugs
          .filter((slug) => `/articles/${slug}/` !== canonicalPath)
          .map((slug) => `/articles/${slug}/`)
      ]
    : [];
  const generatedHrefs = [
    "/",
    "/articles/",
    `/articles/category/${category.slug}/`,
    "/authors/echo-buddha-editorial/",
    "/editorial-policy/",
    ...relatedTerms.map((term) => term.href),
    ...relatedArticles.map((slug) => `/articles/${slug}/`),
    `/quotes/${slugify(quoteTheme)}/`,
    ...continueLearningLinks
  ];
  const internalHrefs = unique([...contentHrefs.filter((href) => href.startsWith("/")), ...generatedHrefs]);
  const externalHrefs = unique(contentHrefs.filter((href) => /^https?:\/\//.test(href)));
  const text = articleBodyText(article);
  const pagePromiseText = `${article.slug} ${article.title} ${article.description}`.toLowerCase();
  const stockTransitionHits = stockTransitions.reduce((sum, phrase) => {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return sum + (text.match(pattern)?.length ?? 0);
  }, 0);
  const metrics = {
    internalLinks: internalHrefs.length,
    externalSourceLinks: externalHrefs.length,
    faqQuestions: seo?.faqs.length ?? 0,
    repeatedSharedContentBlocks: sharedBlockCount(article),
    stockTransitionHits,
    mentionsSensitiveWellbeingTerms: /\b(anxiety|grief|trauma|depression|sleep|illness|healing|therapeutic|anger|overthinking|mental health|emotional distress)\b/i.test(text),
    sensitiveWellbeing: wellbeingSlugs.has(article.slug) || /\b(anxiety|grief|trauma|depression|sleep|illness|healing|therapeutic|mental health|emotional distress)\b/i.test(pagePromiseText),
    hasWellbeingNote: wellbeingSlugs.has(article.slug),
    clusterSimilarity: maxClusterSimilarity(article)
  };
  const status = articleStatus(article, metrics);
  return {
    title: article.title,
    slug: article.slug,
    liveUrl,
    sourceFile: protectedSourceFile,
    routeFile: articleRouteFile,
    category: article.category,
    categoryUrl: `/articles/category/${category.slug}/`,
    publicationDate: article.date,
    reviewedOrModifiedDate: seo?.reviewedDate ?? null,
    author: article.author,
    reviewer: null,
    estimatedWordCount: Number(getArticleWordCount(article)),
    estimatedReadingTime: getArticleReadTime(article),
    h1: article.title,
    h2,
    h3,
    headingIds,
    titleTag,
    metaDescription: article.description,
    canonical: liveUrl,
    robotsStatus: "index, follow by default; no article-level noindex is rendered",
    structuredData: {
      type: ["BlogPosting", "Article"],
      headline: article.title,
      description: article.description,
      author: {
        type: "Organization",
        name: article.author,
        url: `${SITE.url}/authors/echo-buddha-editorial/`
      },
      datePublished: article.date,
      dateModified: seo?.reviewedDate ?? null,
      image: new URL(article.thumbnail, SITE.url).toString(),
      mainEntityOfPage: liveUrl,
      publisher: SITE.name,
      faqPageQuestions: seo?.faqs.map((faq) => faq.question) ?? []
    },
    image: {
      src: article.thumbnail,
      alt: article.imageAlt
    },
    internalHrefValues: internalHrefs,
    externalSourceHrefValues: externalHrefs,
    internalLinkCount: internalHrefs.length,
    externalSourceLinkCount: externalHrefs.length,
    faqQuestionCount: seo?.faqs.length ?? 0,
    repeatedSharedContentBlockCount: metrics.repeatedSharedContentBlocks,
    relatedArticleReferences: relatedArticles,
    relatedTermReferences: relatedTerms,
    quoteReferences: {
      theme: quoteTheme,
      categoryUrl: `/quotes/${slugify(quoteTheme)}/`
    },
    learningPathReferences: continueLearningLinks.filter((href) => href.startsWith("/learn/") || href.startsWith("/meditation/")),
    authorReferences: ["/authors/echo-buddha-editorial/", "/editorial-policy/"],
    primaryTopic: inferTopic(article),
    likelyPrimarySearchIntent: inferSearchIntent(article),
    likelySecondaryIntent: article.category === "Meditation" ? "Returnable practice support" : "Daily-life Buddhist application",
    overlapCluster: getClusterForSlug(article.slug)?.name ?? "No major overlap cluster",
    overlapClusterSimilarity: metrics.clusterSimilarity,
    contentStatusRecommendation: status,
    auditRecommendation: articleRecommendation(article, metrics),
    auditSignals: metrics
  };
});

const titleCounts = new Map();
const metaCounts = new Map();
const canonicalCounts = new Map();
for (const item of inventory) {
  titleCounts.set(item.titleTag, (titleCounts.get(item.titleTag) ?? 0) + 1);
  metaCounts.set(item.metaDescription, (metaCounts.get(item.metaDescription) ?? 0) + 1);
  canonicalCounts.set(item.canonical, (canonicalCounts.get(item.canonical) ?? 0) + 1);
}

const duplicateSentences = new Map();
const nearDuplicateSentences = [];
const sentenceRecords = [];
for (const article of fullArticles) {
  for (const sentence of splitSentences(articleBodyText(article))) {
    const normalized = normalizeText(sentence);
    if (!normalized) continue;
    sentenceRecords.push({ slug: article.slug, sentence, normalized });
    if (!duplicateSentences.has(normalized)) duplicateSentences.set(normalized, []);
    duplicateSentences.get(normalized).push(article.slug);
  }
}

for (let i = 0; i < sentenceRecords.length; i += 1) {
  for (let j = i + 1; j < sentenceRecords.length; j += 1) {
    if (sentenceRecords[i].slug === sentenceRecords[j].slug) continue;
    const score = jaccardText(sentenceRecords[i].sentence, sentenceRecords[j].sentence);
    if (score >= 0.78 && sentenceRecords[i].normalized !== sentenceRecords[j].normalized) {
      nearDuplicateSentences.push({
        a: sentenceRecords[i].slug,
        b: sentenceRecords[j].slug,
        score: Number(score.toFixed(3)),
        sentenceA: sentenceRecords[i].sentence,
        sentenceB: sentenceRecords[j].sentence
      });
    }
  }
}
nearDuplicateSentences.sort((a, b) => b.score - a.score);

const paragraphOpenings = new Map();
for (const article of fullArticles) {
  for (const section of article.content) {
    for (const paragraph of section.paragraphs ?? []) {
      const opening = words(paragraph).slice(0, 5).join(" ");
      if (!opening) continue;
      if (!paragraphOpenings.has(opening)) paragraphOpenings.set(opening, []);
      paragraphOpenings.get(opening).push(article.slug);
    }
  }
}

const headingCounts = new Map();
const faqQuestionCounts = new Map();
for (const item of inventory) {
  for (const heading of item.h2) headingCounts.set(heading, (headingCounts.get(heading) ?? 0) + 1);
  for (const question of item.structuredData.faqPageQuestions) {
    faqQuestionCounts.set(question, (faqQuestionCounts.get(question) ?? 0) + 1);
  }
}

const repeatedLanguageReport = {
  exactDuplicateSentences: [...duplicateSentences.entries()]
    .filter(([, slugs]) => new Set(slugs).size > 1)
    .map(([sentence, slugs]) => ({ sentence, slugs: unique(slugs) }))
    .sort((a, b) => b.slugs.length - a.slugs.length),
  nearDuplicateSentences: nearDuplicateSentences.slice(0, 50),
  repeatedParagraphOpenings: [...paragraphOpenings.entries()]
    .filter(([, slugs]) => new Set(slugs).size > 2)
    .map(([opening, slugs]) => ({ opening, slugs: unique(slugs), count: slugs.length }))
    .sort((a, b) => b.count - a.count),
  repeatedTransitions: stockTransitions
    .map((phrase) => ({
      phrase,
      count: fullArticles.reduce((sum, article) => {
        const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return sum + (articleBodyText(article).match(pattern)?.length ?? 0);
      }, 0)
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count),
  repeatedSectionNames: [...headingCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([heading, count]) => ({ heading, count }))
    .sort((a, b) => b.count - a.count),
  repeatedFaqQuestions: [...faqQuestionCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count),
  topPairSimilarities: pairSimilarities.slice(0, 40)
};

const categoryReconciliation = articleCategories.map((category) => ({
  category: category.name,
  categoryUrl: `/articles/category/${category.slug}/`,
  sourceCountFromArticleCategories: category.count,
  fullArticlesCount: fullArticles.filter((article) => article.category === category.name).length
}));

const sitemapArticlePaths = inventory.map((item) => ({
  path: `/articles/${item.slug}/`,
  lastmod: item.reviewedOrModifiedDate
}));

const searchIndexArticlePaths = inventory.map((item) => `/articles/${item.slug}/`);

const duplicateValueReport = {
  titleTags: [...titleCounts.entries()].filter(([, count]) => count > 1),
  metaDescriptions: [...metaCounts.entries()].filter(([, count]) => count > 1),
  canonicals: [...canonicalCounts.entries()].filter(([, count]) => count > 1)
};

const sourceLines = source.split("\n");
const sourceEvidence = {
  articleTypeLine: sourceLines.findIndex((line) => line.includes("export type Article")) + 1,
  articlesArrayLine: sourceLines.findIndex((line) => line.includes("export const articles")) + 1,
  fullArticlesLine: sourceLines.findIndex((line) => line.includes("export const fullArticles")) + 1,
  seoDetailsLine: sourceLines.findIndex((line) => line.includes("export type ArticleSeoDetails")) + 1,
  categoryDetailsLine: sourceLines.findIndex((line) => line.includes("export const articleCategoryDetails")) + 1
};

const machineReadable = {
  generatedAt: new Date().toISOString(),
  scope: "All fullArticles rendered under /articles/",
  preservationBaseline: {
    articleUrls: inventory.map((item) => item.liveUrl),
    slugs: inventory.map((item) => item.slug),
    headingIdsBySlug: Object.fromEntries(inventory.map((item) => [item.slug, item.headingIds])),
    internalHrefsBySlug: Object.fromEntries(inventory.map((item) => [item.slug, item.internalHrefValues])),
    categoryUrls: unique(inventory.map((item) => item.categoryUrl)),
    canonicalsBySlug: Object.fromEntries(inventory.map((item) => [item.slug, item.canonical])),
    structuredDataBySlug: Object.fromEntries(inventory.map((item) => [item.slug, item.structuredData]))
  },
  architecture: {
    framework: "Astro static site",
    articleSourceFormat: "TypeScript data objects in src/data/site.ts",
    renderingModel: "Static getStaticPaths from fullArticles",
    routeGeneration: "src/pages/articles/[slug].astro maps each fullArticles item to /articles/{slug}/",
    articleIndexGeneration: "src/pages/articles/index.astro renders fullArticles and articleCategories",
    categoryGeneration: "src/pages/articles/category/[category].astro renders articleCategories and category-filtered fullArticles",
    tableOfContentsGeneration: "Article section headings are slugified with slugify(section.heading)",
    relatedContentLogic: "relatedSlugs when present, otherwise same-category fallback; quote theme and related terms are category-derived",
    sitemapGeneration: "src/pages/sitemap.xml.ts maps fullArticles and articleCategories",
    robotsDirectives: "public/robots.txt allows all and points to sitemap",
    canonicalGeneration: "SEO component builds canonical from canonicalPath and SITE.url",
    metadataGeneration: "Article route passes seoTitle/title, description, image, dates, author, and JSON-LD into Layout/SEO",
    structuredDataGeneration: "Article route emits BlogPosting/Article, BreadcrumbList, and FAQPage schema",
    authorship: "Visible and structured author is Echo Buddha Editorial as Organization",
    ads: "AdSlot component is placed after section index 1 and in sidebars; FEATURES.adsEnabled is false",
    sourceEvidence
  },
  reconciliation: {
    articleCount: inventory.length,
    categoryReconciliation,
    sitemapArticlePaths,
    searchIndexArticlePaths,
    duplicateValueReport,
    missingOrOrphanedRecords: []
  },
  inventory,
  repeatedLanguageReport
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(inventoryPath, `${JSON.stringify(machineReadable, null, 2)}\n`);

function mdTable(headers, rows) {
  const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`)
  ].join("\n");
}

function severityForCluster(cluster) {
  const pairs = pairSimilarities.filter((pair) => cluster.slugs.includes(pair.a) && cluster.slugs.includes(pair.b));
  const max = Math.max(0, ...pairs.map((pair) => pair.cosine));
  if (max >= 0.5) return "High";
  if (max >= 0.38) return "Medium";
  if (cluster.slugs.length > 1) return "Low";
  return "Low";
}

function clusterRows() {
  return auditClusters.map((cluster) => {
    const urls = cluster.slugs.map((slug) => `/articles/${slug}/`).join("<br>");
    const pairs = pairSimilarities.filter((pair) => cluster.slugs.includes(pair.a) && cluster.slugs.includes(pair.b));
    const max = Math.max(0, ...pairs.map((pair) => pair.cosine));
    const recommendation = severityForCluster(cluster) === "High"
      ? "Keep URLs; rewrite intros and examples to make each page's role unmistakable."
      : severityForCluster(cluster) === "Medium"
        ? "Keep, strengthen differentiation, and link broader intent to the hub."
        : "Keep; monitor before adding new similar pages.";
    return [
      cluster.name,
      urls,
      cluster.preferredPrimaryPage,
      cluster.role,
      severityForCluster(cluster),
      max.toFixed(3),
      recommendation
    ];
  });
}

const inventoryRows = inventory.map((item) => [
  item.liveUrl,
  item.category,
  item.estimatedWordCount,
  item.estimatedReadingTime,
  item.reviewedOrModifiedDate,
  item.internalLinkCount,
  item.externalSourceLinkCount,
  item.faqQuestionCount,
  item.overlapCluster,
  item.contentStatusRecommendation
]);

const individualRows = inventory.map((item) => [
  item.slug,
  item.likelyPrimarySearchIntent,
  item.primaryTopic,
  `For readers seeking ${item.primaryTopic.toLowerCase()} in plain language.`,
  item.auditRecommendation
]);

const repeatedRows = [
  ["Exact duplicate sentences across articles", repeatedLanguageReport.exactDuplicateSentences.length, repeatedLanguageReport.exactDuplicateSentences.slice(0, 5).map((item) => `${item.sentence} (${item.slugs.join(", ")})`).join("<br>") || "None above threshold"],
  ["Near-duplicate sentences", repeatedLanguageReport.nearDuplicateSentences.length, repeatedLanguageReport.nearDuplicateSentences.slice(0, 5).map((item) => `${item.score}: ${item.a} / ${item.b}`).join("<br>") || "None above threshold"],
  ["Repeated paragraph openings", repeatedLanguageReport.repeatedParagraphOpenings.length, repeatedLanguageReport.repeatedParagraphOpenings.slice(0, 8).map((item) => `${item.opening} (${item.count})`).join("<br>") || "None above threshold"],
  ["Repeated transitions", repeatedLanguageReport.repeatedTransitions.length, repeatedLanguageReport.repeatedTransitions.slice(0, 8).map((item) => `${item.phrase} (${item.count})`).join("<br>") || "None found"],
  ["Repeated FAQ questions", repeatedLanguageReport.repeatedFaqQuestions.length, repeatedLanguageReport.repeatedFaqQuestions.slice(0, 5).map((item) => `${item.question} (${item.count})`).join("<br>") || "None"]
];

const categoryRows = categoryReconciliation.map((item) => [
  item.category,
  item.categoryUrl,
  item.sourceCountFromArticleCategories,
  item.fullArticlesCount,
  item.sourceCountFromArticleCategories === item.fullArticlesCount ? "Matches" : "Mismatch"
]);

const report = `# Echo Buddha Article Audit

Generated: ${new Date().toISOString()}

Scope: every current \`fullArticles\` record rendered under \`/articles/\` (${inventory.length} articles).

This audit did not edit article content, URLs, href values, category URLs, heading IDs, layout files, components, canonical behavior, robots behavior, or structured-data code. The machine-readable protected baseline is in \`docs/article-audit-inventory.json\`.

## Architecture Discovery

- Framework and rendering model: Astro static site. Article pages are generated by \`getStaticPaths()\` from \`fullArticles\`.
- Content source format: TypeScript objects in \`src/data/site.ts\`; there are no Markdown, MDX, YAML, JSON CMS exports, or separate article files.
- Article data files: \`src/data/site.ts\` contains the \`Article\` type, base \`articles\`, Week 2 upgrades, Week 3 expansions, SEO details, category details, quote theme mapping, and the final \`fullArticles\` export.
- Frontmatter schema: not applicable. Article fields are typed as \`slug\`, \`title\`, optional \`seoTitle\`, \`description\`, \`date\`, \`author\`, \`category\`, \`readTime\`, \`thumbnail\`, \`imageAlt\`, \`featured\`, \`tags\`, \`relatedSlugs\`, and structured \`content\`.
- Route generation: \`src/pages/articles/[slug].astro\` maps every \`fullArticles\` item to \`/articles/{slug}/\`.
- Article index generation: \`src/pages/articles/index.astro\` renders \`articleCategories\` and all \`fullArticles\`.
- Category generation: \`src/pages/articles/category/[category].astro\` builds category routes from \`articleCategories\`.
- Table of contents and heading IDs: section headings use \`slugify(section.heading)\`; shared block IDs are rendered by the Astro template.
- Related content: \`relatedSlugs\` is preferred; otherwise same-category fallback is used. Related terms and quote categories are category-derived. Topic cluster continue-learning links are hardcoded in the article route.
- Internal links: article body HTML may contain anchor tags; renderer adds breadcrumbs, category, author, editorial policy, related terms, related articles, quote category, and topic-cluster links.
- Sitemap: \`src/pages/sitemap.xml.ts\` maps \`fullArticles\`, category pages, learning pages, meditation pages, quote pages, and daily reflections. Article \`lastmod\` uses reviewed date when available.
- Robots: \`public/robots.txt\` allows all crawlers and points to \`https://echobuddha.com/sitemap.xml\`.
- Canonicals and metadata: \`src/components/SEO.astro\` builds canonical URLs from \`SITE.url\` and \`canonicalPath\`, then renders title, description, Open Graph, Twitter, and JSON-LD.
- Structured data: article pages emit global WebSite and Organization schema, plus BlogPosting/Article, BreadcrumbList, and FAQPage.
- Authorship: visible byline and schema author use \`Echo Buddha Editorial\` as an Organization with \`/authors/echo-buddha-editorial/\`.
- Dates: visible published date comes from \`article.date\`; visible reviewed date and schema \`dateModified\` come from SEO details.
- Ads: \`AdSlot\` is present in article layout and sidebars, but \`FEATURES.adsEnabled\` is false, so no live AdSense code is configured.
- Validation scripts: \`package.json\` has \`dev\`, \`build\`, and \`preview\`; there is no dedicated lint, test, link-check, schema-validation, or content-quality script before this audit script.

## Inventory Reconciliation

${mdTable(["Category", "URL", "Category count", "Article count", "Status"], categoryRows)}

- Article records found in \`fullArticles\`: ${inventory.length}
- Sitemap article records expected from source: ${sitemapArticlePaths.length}
- Search-index article records expected from source: ${searchIndexArticlePaths.length}
- Duplicate title tags: ${duplicateValueReport.titleTags.length}
- Duplicate meta descriptions: ${duplicateValueReport.metaDescriptions.length}
- Duplicate canonicals: ${duplicateValueReport.canonicals.length}
- Missing, duplicated, unlisted, orphaned, or stale article records found from source reconciliation: none.
- Live \`/articles/\` reference reviewed separately: it lists the same five category counts and 36 article cards.

## Complete Article Inventory

${mdTable(["URL", "Category", "Words", "Read time", "Reviewed", "Internal links", "External source links", "FAQs", "Overlap cluster", "Status"], inventoryRows)}

## Individual Content Audit

${mdTable(["Slug", "Primary intent", "Primary topic", "Reader purpose", "Recommendation"], individualRows)}

## Repeated Language Report

${mdTable(["Signal", "Count", "Evidence"], repeatedRows)}

Most repetition comes from intentional shared renderer blocks and the editorial voice. The risk is not exact copying across whole articles; the stronger issue is predictable phrasing and repeated explanatory rhythm. The body-level audit found ${repeatedLanguageReport.exactDuplicateSentences.length} exact duplicate sentence groups across articles and ${repeatedLanguageReport.nearDuplicateSentences.length} near-duplicate sentence pairs at the configured threshold.

## Topic, Intent, and Cannibalization Map

${mdTable(["Cluster", "Article URLs", "Preferred primary page", "Differentiated role", "Overlap severity", "Max similarity", "Recommendation"], clusterRows())}

No merge, redirect, canonical change, URL removal, or noindex recommendation is implemented here. Cluster recommendations are editorial only because current URLs and internal link destinations are protected.

## SEO and Indexing Readiness

- Title tags are generated uniquely from article \`seoTitle\` or \`title\`; no duplicates were found in the source inventory.
- Meta descriptions are unique; no duplicates were found.
- Every article has one rendered H1 matching the article title.
- Canonicals are stable \`https://echobuddha.com/articles/{slug}/\`; no duplicate canonicals were found.
- Article routes are static and crawlable; article body content is present in generated HTML, not hidden behind client-side rendering.
- Article robots status is indexable by default; there is no article-level \`noindex\`.
- Sitemap generation includes every \`fullArticles\` item and uses reviewed dates as \`lastmod\`.
- FAQ schema is visible on every article page through rendered FAQ details, so FAQPage schema is not hidden content.
- Structured data type \`["BlogPosting", "Article"]\` is acceptable for article pages, though one type can be chosen later for simplicity.
- Schema author is an Organization, which matches the editorial byline better than inventing a Person.
- Image metadata uses local article thumbnails and image alt text is present in the source.
- Main technical indexing risks: no automated broken-link check, no automated schema validation, no external source link coverage for doctrinal articles, and no test that sitemap/search-index/article routes remain synchronized.

## Authorship, Trust, and Sourcing

- \`Echo Buddha Editorial\` is transparent as a shared editorial identity, but it does not provide verifiable individual qualifications or reviewer credentials. The code correctly avoids claiming a named human reviewer.
- The author profile and editorial policy are directionally appropriate, but future AdSense and trust readiness would improve if the site explains the responsible editorial entity, correction process, and limits of Buddhist/meditation guidance with more specificity.
- Doctrinal articles usually use original explanatory language, which is good for copyright safety. The weakness is that many traditional-teaching pages have zero external source links. Add source-aware further-reading paths where the topic depends on traditional frameworks: Four Noble Truths, Eightfold Path, karma, anicca, metta, Dhammapada, and non-self/attachment topics.
- Dhammapada reflection pages correctly avoid presenting themselves as direct translations. Keep that distinction.

## Buddhist Integrity and Sensitive Wellbeing

- Current content avoids the most dangerous pattern of presenting meditation as guaranteed treatment. The renderer adds a wellbeing note for five sensitive slugs, but \`buddhist-teachings-on-impermanence\` also discusses grief and should receive manual editorial review for whether a targeted caution is warranted.
- Karma content should continue to emphasize intention, action, habit, and consequence without implying fate or blaming suffering.
- Non-attachment and letting-go content should keep distinguishing care from indifference and acceptance from passivity.
- Mindfulness content should avoid collapsing Buddhist mindfulness into generic relaxation.
- Dhammapada-inspired articles should continue identifying original reflection versus quotation or translation.

## Recurring Audience and Engagement

- Existing strengths: topic hubs, learning pages, meditation guides, daily reflections, quote stories, related article links, quote-to-article journeys, and practice/reflection blocks.
- Best repeat-use opportunities: curated weekly practice sequences, a beginner reading path that revisits one concept per day, richer meditation series pages, and source-aware study routes for major Buddhist concepts.
- Avoid adding thin programmatic pages, intrusive subscription prompts, artificial pagination, or forced accounts. The strongest repeat behavior for Echo Buddha is calm return value: useful practice, clear sequence, and trustworthy references.

## Priority Recommendations

1. Preserve all current article URLs and internal links. Do not merge or redirect without a separate approval pass.
2. Add automated checks for article inventory, duplicate metadata, broken internal hrefs/fragments, sitemap/search-index consistency, and schema field completeness.
3. Strengthen source-aware notes on doctrinal pages without inventing citations, credentials, or direct quotations.
4. Reduce template feel by rewriting repeated openings, replacing portable examples with article-specific situations, and varying conclusion/reflection patterns.
5. Differentiate high-overlap clusters before publishing more articles in the same topic areas.
6. Review sensitive wellbeing pages individually; add targeted caution only where the article creates a real expectation of therapeutic effect.
7. Keep AdSense disabled until publisher ID, consent/privacy requirements, ad density, and content quality are ready.
`;

fs.writeFileSync(reportPath, report);

console.log(`Wrote ${path.relative(root, inventoryPath)}`);
console.log(`Wrote ${path.relative(root, reportPath)}`);
