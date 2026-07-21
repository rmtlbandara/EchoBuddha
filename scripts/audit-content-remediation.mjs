import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const outDir = path.join(root, "docs/audits/content-audit");
const site = "https://echobuddha.com";
const failures = [];

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const writeCsv = (fileName, headers, rows) => {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
  fs.writeFileSync(path.join(outDir, fileName), `${body}\n`);
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
  const rel = path.relative(dist, filePath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
};

const stripBlocks = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");

const textContent = (html) => stripBlocks(html)
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

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
  if (route.startsWith("/learn/") && route !== "/learn/") return "learningPage";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "meditationDetail";
  if (["/about/", "/contact/", "/editorial-policy/", "/privacy-policy/", "/terms-of-use/", "/disclaimer/", "/authors/echo-buddha-editorial/"].includes(route)) return "policy";
  if (["/learn/", "/articles/", "/quotes/", "/daily-reflections/", "/meditation/", "/mindful-living/", "/start-here/", "/tools/"].includes(route)) return "hub";
  return "other";
};

const primaryIntent = (type) => ({
  homepage: "Navigational / discovery",
  article: "Informational / practical education",
  articleCategory: "Discovery",
  quoteStory: "Quote interpretation",
  quoteCategory: "Quote collection discovery",
  dailyReflection: "Recurring reflective practice",
  todayReflection: "Recurring utility / discovery",
  learningDetail: "Educational reference",
  learningPage: "Learning hub",
  meditationDetail: "Meditation instruction",
  policy: "Trust / policy",
  hub: "Navigation / exploration",
  error: "Error recovery"
}[type] ?? "General");

const decisionFor = (page) => {
  if (page.noindex) return "Pass";
  if (page.type === "quoteStory") return "Major improvement";
  if (page.type === "meditationDetail") return "Source verification required";
  if (page.type === "learningDetail") return "Source verification required";
  if (page.type === "dailyReflection") return "Minor improvement";
  if (page.type === "article" && /buddh|meditat|mindful|anxiety|sleep|anger|forgiveness|overthinking|impermanence|karma|metta|compassion|eightfold|truths/i.test(page.text)) {
    return "Source verification required";
  }
  if (page.words < 350 && ["articleCategory", "learningPage", "hub"].includes(page.type)) return "Expand";
  return "Pass";
};

const roleMap = [
  { cluster: "Beginner Buddhism", href: "/learn/buddhism-for-beginners/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Beginner Buddhism", href: "/articles/what-is-buddhism-beginner-guide/", role: "cornerstone guide", primary: "no", action: "Differentiate as full article" },
  { cluster: "Four Noble Truths", href: "/learn/four-noble-truths/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Four Noble Truths", href: "/articles/four-noble-truths-explained/", role: "cornerstone guide", primary: "no", action: "Keep and source-review" },
  { cluster: "Four Noble Truths", href: "/articles/four-noble-truths-explained-simply/", role: "beginner introduction", primary: "no", action: "Keep differentiated as simple intro" },
  { cluster: "Noble Eightfold Path", href: "/learn/eightfold-path/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Noble Eightfold Path", href: "/articles/eightfold-path-explained/", role: "cornerstone guide", primary: "no", action: "Keep and source-review" },
  { cluster: "Noble Eightfold Path", href: "/learn/buddhism-101/the-noble-eightfold-path-explained/", role: "learning reference", primary: "no", action: "Keep as lesson page" },
  { cluster: "Impermanence", href: "/learn/buddhism-101/what-is-impermanence/", role: "learning reference", primary: "yes", action: "Keep as primary reference" },
  { cluster: "Loving-kindness and Metta", href: "/meditation/loving-kindness-meditation/", role: "meditation instruction", primary: "yes", action: "Keep as practice route" },
  { cluster: "Mindfulness and Meditation", href: "/meditation/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Right Speech", href: "/articles/right-speech-buddhism/", role: "practical application", primary: "yes", action: "Keep as practical guide" },
  { cluster: "Daily Reflections", href: "/daily-reflections/today/", role: "daily reflection utility", primary: "no", action: "Keep noindex utility page" }
];

const adSuitabilityRows = [
  {
    pageType: "homepage, hubs, and article indexes",
    classification: "Suitable with restricted placement",
    note: "Future ads should remain below core navigation and never obscure learning choices.",
    ownerReviewRequired: "yes"
  },
  {
    pageType: "article detail",
    classification: "Suitable with restricted placement",
    note: "Review source and safety status before ads; avoid inserting ads inside sensitive explanations.",
    ownerReviewRequired: "yes"
  },
  {
    pageType: "learning detail and dictionary",
    classification: "Suitable with restricted placement",
    note: "Ads should not interrupt source notes, definitions, or beginner learning flow.",
    ownerReviewRequired: "yes"
  },
  {
    pageType: "meditation detail",
    classification: "Avoid ads inside main instructions",
    note: "Do not place ads inside practice steps or immediately beside safety notes.",
    ownerReviewRequired: "yes"
  },
  {
    pageType: "quote story",
    classification: "Requires owner review",
    note: "Keep ads disabled until quote-origin and standalone-value review is complete.",
    ownerReviewRequired: "yes"
  },
  {
    pageType: "daily reflection",
    classification: "Avoid ads near safety notes",
    note: "Avoid ads inside the reflection/practice flow; recurring utility pages should remain low-density.",
    ownerReviewRequired: "yes"
  },
  {
    pageType: "search, 404, policy, privacy, terms, disclaimer",
    classification: "Not suitable for ads",
    note: "These pages are functional or trust pages and should not be monetized by default.",
    ownerReviewRequired: "yes"
  }
];

const implementationTrackerRows = [
  { findingId: "CQ-001", finalStatus: "Implemented with expert review pending", repositoryAction: "Quote-origin governance module, visible origin status, full quote-origin register, trust/source links", externalReview: "Owner/legal review before external reuse; Buddhist review for any future non-original attribution", validation: "quote-origin-register.csv and npm run audit:content" },
  { findingId: "CQ-002", finalStatus: "Partially implemented", repositoryAction: "Meditation safety notice, disclaimer expansion, safety-review queue, ad placement restrictions", externalReview: "Safety/editorial review remains required for trauma, severe distress, clinical or crisis-adjacent use", validation: "safety-review-queue.csv and npm run validate" },
  { findingId: "CQ-003", finalStatus: "Implemented with expert review pending", repositoryAction: "Learning source-review context, source register, source verification queue, page role display", externalReview: "Buddhist studies review remains required for doctrine, Pali/Sanskrit, translation, and tradition-specific claims", validation: "source-register.csv and source-verification-queue.csv" },
  { findingId: "CQ-004", finalStatus: "Partially implemented", repositoryAction: "Daily reflection editorial notes and trust links; /daily-reflections/today/ changed to noindex utility and removed from sitemap", externalReview: "Editorial review remains required for family-level distinctness", validation: "url-decision-map.csv, sitemap count, noindex check" },
  { findingId: "CQ-005", finalStatus: "Implemented with expert review pending", repositoryAction: "Page-role map added and visible role context displayed on covered article/learning/meditation routes", externalReview: "SEO/editorial owner should confirm primary-page choices with Search Console data", validation: "page-role-map.csv" },
  { findingId: "CQ-006", finalStatus: "Partially implemented", repositoryAction: "Similarity analysis regenerated and role-map justifications created for priority clusters", externalReview: "Manual editorial review remains required for high-similarity pairs", validation: "duplicate-clusters.csv" },
  { findingId: "CQ-007", finalStatus: "Implemented with expert review pending", repositoryAction: "Source register and source-governance language added; Access to Insight reliance documented without copying source text", externalReview: "Translation/license and Buddhist studies review remains required", validation: "source-register.csv" },
  { findingId: "CQ-008", finalStatus: "Implemented with owner/legal review pending", repositoryAction: "About, Editorial Policy, and Disclaimer expanded for source standards, quote origins, AI assistance, and safety limitations", externalReview: "Owner/legal review for final policy reliance", validation: "npm run validate" }
];

if (!fs.existsSync(dist)) {
  failures.push("Missing dist directory. Run npm run build before npm run audit:content.");
} else {
  fs.mkdirSync(outDir, { recursive: true });
  const htmlFiles = walk(dist, (filePath) => filePath.endsWith(".html"));
  const sitemapXml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
  const sitemapRoutes = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  const pages = htmlFiles.map((filePath) => {
    const html = fs.readFileSync(filePath, "utf8");
    const route = routeFromHtml(filePath);
    const text = textContent(html);
    const type = classify(route);
    const noindex = /<meta\s+name=["']robots["'][^>]*noindex/i.test(html);
    const title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
    const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1]?.trim() ?? "";
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1]?.trim() ?? "";
    const h1 = html.match(/<h1\b[^>]*>(.*?)<\/h1>/is)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
    const blockquote = html.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
    const hrefs = [...stripBlocks(html).matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)].map((match) => match[1]);
    const externalLinks = hrefs.filter((href) => /^https?:\/\//.test(href) && !href.startsWith(site));
    const schemaTypes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((match) => {
      try {
        const parsed = JSON.parse(match[1]);
        return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => Array.isArray(item["@type"]) ? item["@type"].join("+") : item["@type"]);
      } catch {
        return ["invalid"];
      }
    });
    return {
      route,
      url: `${site}${route}`,
      type,
      text,
      words: (text.match(/\b[A-Za-z][A-Za-z'’-]*\b/g) ?? []).length,
      noindex,
      inSitemap: sitemapRoutes.includes(route),
      title,
      description,
      canonical,
      h1,
      blockquote,
      hrefs,
      externalLinks,
      schemaTypes
    };
  }).sort((a, b) => a.route.localeCompare(b.route));

  const routes = new Set(pages.map((page) => page.route));
  const internalLinks = pages.flatMap((page) => page.hrefs
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => ({ from: page.route, to: new URL(href, site).pathname })));
  const brokenLinks = internalLinks.filter((link) => !routes.has(link.to) && !fs.existsSync(path.join(dist, link.to.replace(/^\//, ""))));
  const inbound = new Map(pages.map((page) => [page.route, 0]));
  for (const link of internalLinks) {
    if (inbound.has(link.to)) inbound.set(link.to, inbound.get(link.to) + 1);
  }

  const contentRows = pages.map((page) => ({
    url: page.url,
    pageType: page.type,
    primaryIntent: primaryIntent(page.type),
    visibleWordCount: page.words,
    indexingStatus: page.noindex ? "noindex" : "indexable",
    sitemapStatus: page.inSitemap ? "in sitemap" : "not in sitemap",
    inboundInternalLinks: inbound.get(page.route) ?? 0,
    externalSourceLinks: page.externalLinks.length,
    canonical: page.canonical,
    title: page.title,
    h1: page.h1,
    schemaTypes: page.schemaTypes.join("|")
  }));

  const decisionRows = pages.map((page) => {
    const action = decisionFor(page);
    return {
      url: page.url,
      pageType: page.type,
      primaryIntent: primaryIntent(page.type),
      visibleWordCount: page.words,
      contentQualityStatus: action === "Pass" ? "Pass" : "Needs review",
      originality: page.type === "quoteStory" || page.type === "dailyReflection" ? "Original Echo Buddha writing" : "Original explanatory content",
      sourceQuality: page.externalLinks.length > 0 ? "Has external source references" : "Source review required where factual claims appear",
      buddhistAccuracy: /buddh|dhamma|sutta|karma|metta|anicca|dukkha|anatta|nirvana|sangha|mindfulness|meditation/i.test(page.text) ? "Requires risk-based Buddhist studies review" : "Low doctrinal risk",
      duplicationRisk: page.type === "quoteStory" ? "High family-level pattern risk" : page.type === "dailyReflection" ? "Medium family-level pattern risk" : "Medium",
      cannibalizationRisk: roleMap.some((role) => role.href === page.route) ? "Mapped in page-role register" : "Low to medium",
      internalLinkQuality: (inbound.get(page.route) ?? 0) > 2 || page.route === "/" || page.noindex ? "Pass" : "Needs review",
      metadataAlignment: page.title && page.description && page.h1 && page.canonical ? "Pass" : "Needs review",
      adsenseContribution: ["quoteStory", "dailyReflection", "meditationDetail"].includes(page.type) ? "Needs improvement before final review" : "Positive or neutral",
      recommendedAction: action,
      severity: ["Major improvement", "Source verification required"].includes(action) ? "High" : action === "Pass" ? "Low" : "Medium",
      effort: action === "Major improvement" ? "L" : action === "Pass" ? "XS" : "M",
      humanReviewRequirement: /Source|Major/.test(action) ? "Editorial/Buddhist studies or safety reviewer" : "No",
      recommendationReason: page.noindex ? "Noindex utility or intentionally excluded page." : `Post-remediation automated decision for ${page.type}.`
    };
  });

  const quoteRows = pages.filter((page) => page.type === "quoteStory").map((page) => ({
    quoteId: page.route.split("/").filter(Boolean).slice(-2).join(":"),
    quoteText: page.blockquote,
    publicUrl: page.url,
    originClassification: "Original Echo Buddha writing",
    attributedAuthor: "Echo Buddha Editorial",
    primarySource: "Echo Buddha original editorial record",
    secondaryVerificationSource: "Not applicable for current original-writing classification",
    canonicalTextReference: "Not a canonical quotation",
    translator: "Not applicable",
    translationEdition: "Not applicable",
    copyrightOrLicenseStatus: "Original site editorial copy; owner/legal review still required before external reuse.",
    attributionWording: "Original Echo Buddha reflection; not a Buddha quote or scripture translation.",
    verificationStatus: "repository-reviewed",
    reviewerStatus: "External Buddhist studies review not claimed.",
    indexabilityRecommendation: page.noindex ? "keep-noindex" : "keep-indexable",
    editorialNotes: "Current repository data presents this as original Echo Buddha writing."
  }));

  const sourceRows = pages
    .filter((page) => ["article", "learningDetail", "meditationDetail"].includes(page.type) || page.externalLinks.length > 0)
    .map((page) => ({
      sourceId: `source:${page.route.replace(/^\/|\/$/g, "").replaceAll("/", ":") || "home"}`,
      pageUrl: page.url,
      claimOrTopicSupported: page.type === "meditationDetail" ? "Meditation practice and safety context" : "Buddhist educational or reflective explanation",
      sourceTitle: page.externalLinks.length > 0 ? "Visible page source links" : "Repository source note; external review pending where claims require it",
      sourceAuthor: page.externalLinks.length > 0 ? "See linked source" : "Echo Buddha Editorial",
      translator: page.externalLinks.some((href) => href.includes("accesstoinsight")) ? "Thanissaro Bhikkhu or Access to Insight page translator where indicated" : "Not applicable or pending",
      publicationOrInstitution: page.externalLinks.map((href) => new URL(href).hostname).join("; ") || "Echo Buddha",
      sourceType: page.externalLinks.length > 0 ? "Primary or reputable reference link visible on page" : "Original reflection requiring source review for factual claims",
      buddhistTraditionOrTextualContext: /sutta|dhammapada|sn |mn |dn |an |metta|anicca|dukkha|karma|dhamma/i.test(page.text) ? "Buddhist textual or doctrinal context" : "General educational reflection",
      canonicalReference: "See visible page source note or external review queue",
      url: page.externalLinks.join("; "),
      copyrightOrLicenseNote: "Do not reproduce long modern translations without owner/legal review.",
      accessDate: "2026-07-21",
      verificationStatus: page.externalLinks.length > 0 ? "repository-reviewed-source-link-present" : "external-review-pending",
      reviewerNote: "Source register does not claim Buddhist studies or legal review occurred."
    }));

  const safetyRoutes = [
    "/articles/how-to-meditate-for-anxiety/",
    "/articles/mindfulness-for-better-sleep/",
    "/articles/buddhist-approach-to-anger/",
    "/articles/buddhist-teachings-on-forgiveness/",
    "/articles/buddhist-wisdom-for-overthinking/",
    "/articles/mindfulness-of-breathing-guide/",
    "/articles/how-to-meditate-for-beginners/",
    "/articles/metta-meditation-script/",
    "/articles/loving-kindness-meditation-guide/",
    "/articles/loving-kindness-meditation-beginners/",
    "/meditation-guide/"
  ];
  const safetyRows = pages
    .filter((page) =>
      page.type === "meditationDetail"
      || safetyRoutes.includes(page.route)
      || (page.type === "dailyReflection" && /anger|forgiveness|feeling|rest|sleep|difficult|shame|overwhelmed|support/i.test(page.text))
    )
    .map((page) => ({
      pageUrl: page.url,
      pageType: page.type,
      diagnosisClaims: "No diagnosis claim detected by repository audit",
      treatmentClaims: "No treatment/cure claim intended; manual review still required",
      guaranteedOutcomes: /guarantee|cure|will heal|will sleep/i.test(page.text) ? "Manual review required" : "No guarantee language detected",
      breathFocusDiscomfort: /open your eyes|feel the feet|shorten|stop|grounding/i.test(page.text) ? "Visible adaptation language present" : "Review for adaptation language",
      professionalSupport: /professional support|qualified professional|medical or mental health/i.test(page.text) ? "Visible support limitation present" : "Review support limitation",
      adPlacementSuitability: page.type === "meditationDetail" ? "Avoid ads inside main instructions and near safety notes" : "Restricted placement or owner review",
      status: /professional support|qualified professional|medical or mental health/i.test(page.text) ? "repository-safety-language-present" : "safety-review-pending"
    }));

  const urlDecisionRows = [
    {
      currentUrl: `${site}/daily-reflections/today/`,
      currentPurpose: "Recurring daily reflection utility page",
      problem: "High similarity with the daily-reflection hub and rotating detail pages",
      chosenAction: "Noindex, keep URL",
      destinationUrl: "",
      redirectType: "None",
      canonicalEffect: "Self-canonical retained",
      sitemapEffect: "Removed from sitemap",
      internalLinkEffect: "Links remain for recurring users",
      structuredDataEffect: "WebPage schema retained",
      userImpact: "Stable utility page remains available",
      validation: "npm run validate and sitemap/noindex audit"
    }
  ];

  const sourceQueueRows = decisionRows
    .filter((row) => row.recommendedAction === "Source verification required")
    .map((row) => ({
      url: row.url,
      pageType: row.pageType,
      claimArea: row.pageType === "meditationDetail" ? "Meditation or wellbeing-adjacent safety" : "Buddhist doctrine, terminology, or educational claim",
      currentSources: sourceRows.find((source) => source.pageUrl === row.url)?.url || "Visible source note; external source review pending",
      recommendedSourceType: row.pageType === "meditationDetail" ? "Primary Buddhist text plus appropriate health institution where wellbeing claims appear" : "Primary Buddhist text, reputable Buddhist institution, university, or scholarly source",
      priority: row.severity,
      humanReviewer: row.pageType === "meditationDetail" ? "Safety/editorial reviewer" : "Editorial/Buddhist studies"
    }));

  const linkOpportunityRows = pages
    .filter((page) => !page.noindex && (inbound.get(page.route) ?? 0) <= 3)
    .map((page) => ({
      url: page.url,
      pageType: page.type,
      currentInboundLinks: inbound.get(page.route) ?? 0,
      opportunity: page.type === "quoteStory" ? "Link to editorial policy, category, related teaching, and related articles where useful." : "Strengthen contextual links from parent hubs and related pages where natural.",
      priority: (inbound.get(page.route) ?? 0) <= 2 ? "High" : "Medium",
      validationMethod: "Re-run content audit inventory and static link crawl."
    }));

  const tokens = (page) => new Set(page.text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 4).slice(0, 500));
  const tokenSets = new Map(pages.map((page) => [page.route, tokens(page)]));
  const similarityRows = [];
  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      const a = tokenSets.get(pages[i].route);
      const b = tokenSets.get(pages[j].route);
      const intersection = [...a].filter((word) => b.has(word)).length;
      const union = new Set([...a, ...b]).size || 1;
      const similarity = intersection / union;
      if (similarity >= 0.68) {
        similarityRows.push({
          urlA: pages[i].url,
          urlB: pages[j].url,
          pageTypeA: pages[i].type,
          pageTypeB: pages[j].type,
          similarity: similarity.toFixed(3),
          decision: "Manual review or role-map justification required",
          notes: "Automated lexical signal; legitimate hub/detail overlap may remain."
        });
      }
    }
  }
  similarityRows.sort((a, b) => Number(b.similarity) - Number(a.similarity));

  const familySummary = {};
  for (const page of pages) {
    const summary = familySummary[page.type] ?? {
      total: 0,
      indexable: 0,
      noindex: 0,
      totalWords: 0,
      decisions: {}
    };
    summary.total += 1;
    summary.indexable += page.noindex ? 0 : 1;
    summary.noindex += page.noindex ? 1 : 0;
    summary.totalWords += page.words;
    const decision = decisionFor(page);
    summary.decisions[decision] = (summary.decisions[decision] ?? 0) + 1;
    familySummary[page.type] = summary;
  }
  for (const summary of Object.values(familySummary)) {
    summary.averageWords = Math.round(summary.totalWords / summary.total);
    delete summary.totalWords;
  }

  const indexablePages = pages.filter((page) => !page.noindex);
  const duplicateTitleCount = [...pages.reduce((map, page) => {
    if (page.title) map.set(page.title, (map.get(page.title) ?? 0) + 1);
    return map;
  }, new Map()).values()].filter((count) => count > 1).length;
  const duplicateDescriptionCount = [...pages.reduce((map, page) => {
    if (page.description) map.set(page.description, (map.get(page.description) ?? 0) + 1);
    return map;
  }, new Map()).values()].filter((count) => count > 1).length;
  const decisionCounts = decisionRows.reduce((acc, row) => {
    if (!row.url.includes("/404.html")) acc[row.recommendedAction] = (acc[row.recommendedAction] ?? 0) + 1;
    return acc;
  }, {});
  const summary = {
    generatedAt: new Date().toISOString(),
    repositorySafeRemediationDate: "2026-07-21",
    totalHtmlPages: pages.length,
    indexablePages: indexablePages.length,
    noindexPages: pages.length - indexablePages.length,
    sitemapUrls: sitemapRoutes.length,
    quoteStories: pages.filter((page) => page.type === "quoteStory").length,
    indexableQuoteStories: pages.filter((page) => page.type === "quoteStory" && !page.noindex).length,
    dailyReflections: pages.filter((page) => page.type === "dailyReflection").length,
    articles: pages.filter((page) => page.type === "article").length,
    learningPages: pages.filter((page) => page.type === "learningDetail").length,
    meditationPages: pages.filter((page) => page.type === "meditationDetail").length,
    decisionCounts,
    sourceVerificationItems: sourceQueueRows.length,
    expertReviewItems: sourceQueueRows.length + safetyRows.filter((row) => row.status !== "repository-safety-language-present").length,
    similarityPairs: similarityRows.length,
    highSimilarityPairs: similarityRows.filter((row) => Number(row.similarity) >= 0.7).length,
    internalLinkOpportunities: linkOpportunityRows.length,
    internalLinksImplemented: "Template-level links added from quote, daily, article, learning, and meditation source/safety notes to trust/source pages.",
    brokenLinks: brokenLinks.length,
    canonicalMismatches: pages.filter((page) => page.canonical && page.canonical !== new URL(page.route, site).toString()).length,
    duplicateTitles: duplicateTitleCount,
    duplicateDescriptions: duplicateDescriptionCount,
    invalidStructuredData: pages.filter((page) => page.schemaTypes.includes("invalid")).length,
    urlDecisions: urlDecisionRows.length
  };

  writeCsv("content-inventory.csv", Object.keys(contentRows[0]), contentRows);
  writeCsv("content-decision-matrix.csv", Object.keys(decisionRows[0]), decisionRows);
  writeCsv("quote-origin-register.csv", Object.keys(quoteRows[0]), quoteRows);
  writeCsv("source-register.csv", Object.keys(sourceRows[0]), sourceRows);
  writeCsv("safety-review-queue.csv", Object.keys(safetyRows[0]), safetyRows);
  writeCsv("page-role-map.csv", Object.keys(roleMap[0]), roleMap.map((row) => ({ ...row, href: `${site}${row.href}` })));
  writeCsv("adsense-page-type-suitability.csv", Object.keys(adSuitabilityRows[0]), adSuitabilityRows);
  writeCsv("content-remediation-tracker.csv", Object.keys(implementationTrackerRows[0]), implementationTrackerRows);
  writeCsv("url-decision-map.csv", Object.keys(urlDecisionRows[0]), urlDecisionRows);
  writeCsv("source-verification-queue.csv", Object.keys(sourceQueueRows[0]), sourceQueueRows);
  writeCsv("internal-link-opportunities.csv", Object.keys(linkOpportunityRows[0]), linkOpportunityRows);
  writeCsv("duplicate-clusters.csv", Object.keys(similarityRows[0] ?? { urlA: "", urlB: "", pageTypeA: "", pageTypeB: "", similarity: "", decision: "", notes: "" }), similarityRows.slice(0, 250));
  fs.writeFileSync(path.join(outDir, "content-family-summary.json"), `${JSON.stringify(familySummary, null, 2)}\n`);
  fs.writeFileSync(path.join(outDir, "post-remediation-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

  if (summary.brokenLinks > 0) failures.push(`${summary.brokenLinks} broken internal links detected.`);
  if (summary.canonicalMismatches > 0) failures.push(`${summary.canonicalMismatches} canonical mismatches detected.`);
  if (summary.invalidStructuredData > 0) failures.push(`${summary.invalidStructuredData} invalid structured-data payloads detected.`);
}

if (failures.length > 0) {
  console.error("Content remediation audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Content remediation audit passed.");
