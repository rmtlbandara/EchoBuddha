import fs from "node:fs";
import path from "node:path";
import { mainContent, plainText, editorialAction, lexicalTokens, similarityDecision, repeatedParagraphs, anchorHrefs, metaContent, canonicalHref, quoteOriginDeclaration } from "./content-audit-lib.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const outDir = path.resolve(root, process.env.CONTENT_AUDIT_OUT_DIR || "docs/audits/content-audit");
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

const decisionFor = editorialAction;

const roleMap = [
  { cluster: "Beginner Buddhism", href: "/learn/buddhism-for-beginners/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Beginner Buddhism", href: "/articles/what-is-buddhism-beginner-guide/", role: "cornerstone guide", primary: "no", action: "Differentiate as full article" },
  { cluster: "Four Noble Truths", href: "/learn/four-noble-truths/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Four Noble Truths", href: "/articles/four-noble-truths-explained/", role: "cornerstone guide", primary: "no", action: "Keep and source-review" },
  { cluster: "Four Noble Truths", href: "/articles/four-noble-truths-explained-simply/", role: "beginner introduction", primary: "no", action: "Keep differentiated as simple intro" },
  { cluster: "Noble Eightfold Path", href: "/learn/eightfold-path/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Noble Eightfold Path", href: "/articles/eightfold-path-explained/", role: "cornerstone guide", primary: "no", action: "Keep and source-review" },
  { cluster: "Noble Eightfold Path", href: "/articles/eightfold-path-explained-daily-life/", role: "practical application", primary: "no", action: "Keep as applied daily-life article" },
  { cluster: "Noble Eightfold Path", href: "/articles/noble-eightfold-path-practical-guide/", role: "practical application", primary: "no", action: "Keep as practice checklist article" },
  { cluster: "Noble Eightfold Path", href: "/learn/buddhism-101/the-noble-eightfold-path-explained/", role: "learning reference", primary: "no", action: "Keep as lesson page" },
  { cluster: "Impermanence", href: "/learn/buddhism-101/what-is-impermanence/", role: "learning reference", primary: "yes", action: "Keep as primary reference" },
  { cluster: "Impermanence", href: "/articles/buddhist-teachings-on-impermanence/", role: "source-study page", primary: "no", action: "Keep as teaching-focused article" },
  { cluster: "Impermanence", href: "/articles/impermanence-in-buddhism/", role: "practical application", primary: "no", action: "Keep as applied reflection on accepting change" },
  { cluster: "Impermanence", href: "/articles/impermanence-in-buddhism-letting-go/", role: "supporting article", primary: "no", action: "Keep as letting-go application" },
  { cluster: "Loving-kindness and Metta", href: "/meditation/loving-kindness-meditation/", role: "meditation instruction", primary: "yes", action: "Keep as practice route" },
  { cluster: "Loving-kindness and Metta", href: "/learn/buddhist-dictionary/metta/", role: "dictionary definition", primary: "no", action: "Keep as term reference" },
  { cluster: "Loving-kindness and Metta", href: "/learn/buddhist-dictionary/karuna/", role: "dictionary definition", primary: "no", action: "Keep as compassion term reference" },
  { cluster: "Loving-kindness and Metta", href: "/articles/loving-kindness-meditation-guide/", role: "practical application", primary: "no", action: "Keep as guided practice explainer" },
  { cluster: "Loving-kindness and Metta", href: "/articles/loving-kindness-meditation-beginners/", role: "beginner introduction", primary: "no", action: "Keep as gentle beginner entry" },
  { cluster: "Loving-kindness and Metta", href: "/articles/metta-meditation-script/", role: "meditation instruction", primary: "no", action: "Keep as script support page" },
  { cluster: "Loving-kindness and Metta", href: "/articles/compassion-in-buddhism-beginner-guide/", role: "beginner introduction", primary: "no", action: "Keep as compassion beginner guide" },
  { cluster: "Loving-kindness and Metta", href: "/articles/compassion-as-a-daily-discipline/", role: "practical application", primary: "no", action: "Keep as daily-discipline article" },
  { cluster: "Mindfulness and Meditation", href: "/meditation/", role: "topic hub", primary: "yes", action: "Keep as primary route" },
  { cluster: "Mindfulness and Meditation", href: "/articles/how-to-meditate-for-beginners/", role: "beginner introduction", primary: "no", action: "Keep as first-session guide" },
  { cluster: "Mindfulness and Meditation", href: "/articles/mindfulness-of-breathing-guide/", role: "meditation instruction", primary: "no", action: "Keep as breath-practice guide" },
  { cluster: "Mindfulness and Meditation", href: "/articles/mindfulness-vs-meditation/", role: "beginner introduction", primary: "no", action: "Keep as comparison-intent article" },
  { cluster: "Mindfulness and Meditation", href: "/learn/buddhism-101/what-is-mindfulness/", role: "learning reference", primary: "no", action: "Keep as terminology lesson" },
  { cluster: "Mindfulness and Meditation", href: "/meditation/breathing-meditation/", role: "meditation instruction", primary: "no", action: "Keep as concise breathing instruction" },
  { cluster: "Mindfulness and Meditation", href: "/meditation/meditation-for-beginners/", role: "meditation instruction", primary: "no", action: "Keep as beginner practice route" },
  { cluster: "Right Speech", href: "/articles/right-speech-buddhism/", role: "practical application", primary: "yes", action: "Keep as practical guide" },
  { cluster: "Right Speech", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/", role: "source-study page", primary: "no", action: "Keep as sutta-context study" },
  { cluster: "Right Livelihood", href: "/learn/buddhism-101/right-livelihood-buddhism/", role: "learning reference", primary: "yes", action: "Keep as source-aware primary route" },
  { cluster: "Right Livelihood", href: "/articles/right-livelihood-modern-life/", role: "practical application", primary: "no", action: "Keep as modern applied article" },
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

// Preserve the dated tracker as historical context, never as fresh certification.
const historicalImplementationTrackerRows = [
  { queueItemId: "CQ-001", urlOrGroup: "153 quote-story URLs", sourceFile: "src/data/site.ts", currentStatus: "repository origin classified", requiredAction: "Keep original-writing classification visible; verify future non-original quotes before publication", evidence: "quote-origin-register.csv", reviewerRequirement: "Owner/legal review before external reuse; Buddhist review for future non-original attribution", repositoryAction: "Quote-origin governance and visible source wording retained", finalStatus: "repository-complete; external review not claimed", validationMethod: "quote-origin-register.csv and npm run audit:content" },
  { queueItemId: "CQ-002", urlOrGroup: "Meditation and wellbeing-sensitive pages", sourceFile: "article, meditation, and daily templates", currentStatus: "repository safety language present", requiredAction: "Avoid treatment, cure, diagnosis, guarantee, and unsafe practice framing", evidence: "safety-review-queue.csv", reviewerRequirement: "Safety/editorial review for trauma, crisis, clinical, or severe-distress topics", repositoryAction: "Safety/adaptation/support wording and ad restrictions retained", finalStatus: "repository-complete; future external safety review documented", validationMethod: "safety-review-queue.csv and npm run validate" },
  { queueItemId: "CQ-003", urlOrGroup: "Article, learning, and meditation source records", sourceFile: "src/data/editorialGovernance.ts and src/data/learn.ts", currentStatus: "visible source context present or original-reflection context documented", requiredAction: "Keep external references visible for doctrinal/meditation claims; avoid copying long translations", evidence: "source-register.csv and source-verification-queue.csv", reviewerRequirement: "Buddhist studies and translation/license review before claiming expert approval", repositoryAction: "Added article selected references and source-register classification", finalStatus: "repository-complete; expert approval not claimed", validationMethod: "source-register.csv and source-verification-queue.csv" },
  { queueItemId: "CQ-004", urlOrGroup: "30 daily-reflection detail URLs plus /today/", sourceFile: "src/data/dailyReflections.ts and daily templates", currentStatus: "all detail pages reviewed by generated distinctness register; /today/ noindex retained", requiredAction: "Keep detail URLs stable; keep /today/ out of sitemap; review future entries for unique prompts", evidence: "daily-reflection-review.csv and url-decision-map.csv", reviewerRequirement: "Editorial review if daily family expands materially", repositoryAction: "Generated page-level daily-reflection review evidence", finalStatus: "repository-complete", validationMethod: "daily-reflection-review.csv and sitemap/noindex audit" },
  { queueItemId: "CQ-005", urlOrGroup: "Priority overlap clusters", sourceFile: "src/data/editorialGovernance.ts", currentStatus: "role map expanded", requiredAction: "Keep one primary route per cluster and visible support roles on related pages", evidence: "page-role-map.csv", reviewerRequirement: "SEO/editorial owner should confirm primary choices with Search Console data", repositoryAction: "Expanded role map for Eightfold Path, Four Truths, impermanence, metta/compassion, mindfulness/meditation, right speech/livelihood", finalStatus: "repository-complete; production data pending", validationMethod: "page-role-map.csv and duplicate-clusters.csv" },
  { queueItemId: "CQ-006", urlOrGroup: "Top similarity clusters", sourceFile: "templates and generated pages", currentStatus: "automated similarity retained with role-map decisions", requiredAction: "Treat mapped clusters as justified; manually review future high-volume expansions", evidence: "duplicate-clusters.csv", reviewerRequirement: "Editorial review if Search Console shows cannibalization or low-value behavior", repositoryAction: "Duplicate rows now mark role-map/daily/quote-family decisions", finalStatus: "repository-complete; monitoring pending", validationMethod: "duplicate-clusters.csv" },
  { queueItemId: "CQ-007", urlOrGroup: "Translation and copyright governance", sourceFile: "source register and reports", currentStatus: "long modern translation reuse prohibited without review", requiredAction: "Keep translator/license notes in source register; do not fabricate permissions", evidence: "source-register.csv", reviewerRequirement: "Owner/legal and Buddhist studies review before substantial quoted translations", repositoryAction: "Source-register notes retained and article references linked without reproducing long excerpts", finalStatus: "repository-complete; legal approval not claimed", validationMethod: "source-register.csv and docs" },
  { queueItemId: "CQ-008", urlOrGroup: "AdSense page-type suitability", sourceFile: "docs/audits/content-audit/adsense-page-type-suitability.csv", currentStatus: "ads disabled and restricted page types documented", requiredAction: "Run separate final AdSense pre-application review before applying or enabling ads", evidence: "adsense-page-type-suitability.csv", reviewerRequirement: "Owner/legal/policy review", repositoryAction: "No ad code or publisher ID added", finalStatus: "repository-complete; separate final review required", validationMethod: "npm run validate and source diff review" }
];

const implementationTrackerRows = historicalImplementationTrackerRows.map((row) => {
  const { currentStatus, requiredAction, finalStatus, ...historicalContext } = row;
  return {
    ...historicalContext,
    historicalCurrentStatus: currentStatus,
    historicalRequiredAction: requiredAction,
    historicalStatus: finalStatus,
    currentStatus: "Not determined by this automated inventory",
    requiredAction: "Use current page-level editorial, source, safety and technical evidence; historical tracker wording does not resolve current findings",
    finalStatus: "CURRENT_REVIEW_NOT_CERTIFIED",
    currentReviewNotCertified: true,
    statusContext: "Legacy CQ tracker retained for traceability. Historical actions and completion claims are not a current editorial review, source verification or AdSense readiness decision."
  };
});

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
    const mainHtml = mainContent(html);
    const text = plainText(mainHtml);
    const type = classify(route);
    const noindex = /<meta\s+name=["']robots["'][^>]*noindex/i.test(html);
    const title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
    const description = metaContent(html, "description").trim();
    const canonical = canonicalHref(html).trim();
    const h1 = html.match(/<h1\b[^>]*>(.*?)<\/h1>/is)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
    const blockquote = html.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
    const hrefs = anchorHrefs(html);
    const externalLinks = anchorHrefs(mainHtml).filter(href => /^https?:\/\//.test(href) && new URL(href).origin !== site);
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
      mainHtml,
      quoteDeclaration: type === "quoteStory" ? quoteOriginDeclaration(mainHtml) : undefined,
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
      contentQualityStatus: "Not certified by automation; see page-level editorial review",
      originality: page.type === "quoteStory" || page.type === "dailyReflection"
        ? "Presented as original Echo Buddha writing; extraction does not independently establish originality"
        : "Not determined by static extraction; evaluate the page purpose, attribution and original contribution",
      sourceQuality: page.externalLinks.length > 0 ? "Has external source references" : "Repository original/reflection context; external review required before claiming expert approval",
      buddhistAccuracy: /buddh|dhamma|sutta|karma|metta|anicca|dukkha|anatta|nirvana|sangha|mindfulness|meditation/i.test(page.text) ? "Requires risk-based Buddhist studies review" : "Low doctrinal risk",
      duplicationRisk: page.type === "quoteStory" ? "High family-level pattern risk" : page.type === "dailyReflection" ? "Medium family-level pattern risk" : "Medium",
      cannibalizationRisk: roleMap.some((role) => role.href === page.route) ? "Mapped in page-role register" : "Low to medium",
      internalLinkQuality: (inbound.get(page.route) ?? 0) > 0 || page.route === "/" ? "Inbound links present; relevance needs review" : "No inbound links detected; review discoverability",
      metadataAlignment: page.title && page.description && page.h1 && page.canonical ? "Pass" : "Needs review",
      adsenseContribution: "Not determined by automation",
      recommendedAction: action,
      severity: "Review signal; not a confirmed defect grade",
      effort: "Determine from qualitative findings",
      humanReviewRequirement: "Editorial review appropriate to the page purpose; source/safety expertise where needed",
      recommendationReason: `Automated diagnostic for ${page.type}. ${page.noindex ? "Intentional noindex does not establish reader value." : "Indexability does not establish reader value."}`
    };
  });

  const quoteRows = pages.filter((page) => page.type === "quoteStory").map((page) => ({
    quoteId: page.route.split("/").filter(Boolean).slice(-2).join(":"),
    quoteText: page.blockquote,
    publicUrl: page.url,
    originClassification: page.quoteDeclaration.originClassification || "Missing visible declaration",
    attributedAuthor: "See visible attribution wording; not independently verified by extraction",
    primarySource: "Not verified by extraction",
    secondaryVerificationSource: "Not verified by extraction",
    canonicalTextReference: page.quoteDeclaration.canonicalTextReference || "Missing visible scripture status",
    translator: "Not verified by extraction; consult the declared edition where applicable",
    translationEdition: "Not verified by extraction",
    copyrightOrLicenseStatus: "Not verified by extraction; review the actual origin and permissions before external reuse.",
    attributionWording: page.quoteDeclaration.attributionWording || "Missing visible attribution wording",
    verificationStatus: page.quoteDeclaration.declarationPresent ? "visible-declaration-present-not-independently-verified" : "visible-declaration-missing-or-incomplete",
    reviewerStatus: "External Buddhist studies review not claimed.",
    indexabilityRecommendation: page.noindex ? "keep-noindex" : "keep-indexable",
    editorialNotes: "Records the page's actual visible declaration; neither completeness nor its wording proves attribution accuracy."
  }));

  const sourceRows = pages
    .filter((page) => ["article", "learningDetail", "meditationDetail"].includes(page.type) || page.externalLinks.length > 0)
    .map((page) => ({
      sourceId: `source:${page.route.replace(/^\/|\/$/g, "").replaceAll("/", ":") || "home"}`,
      pageUrl: page.url,
      claimOrTopicSupported: page.type === "meditationDetail" ? "Meditation practice and safety context" : "Buddhist educational or reflective explanation",
      sourceTitle: page.externalLinks.length > 0 ? "Visible page source links" : "Repository source note; external review pending where claims require it",
      sourceAuthor: page.externalLinks.length > 0 ? "See linked source" : "Echo Buddha Editorial",
      translator: "Not verified by link extraction; consult the specific source/edition",
      publicationOrInstitution: page.externalLinks.map((href) => new URL(href).hostname).join("; ") || "Echo Buddha",
      sourceType: page.externalLinks.length > 0 ? "External link present; authority and claim support need source review" : "Original reflection requiring source review for factual claims",
      buddhistTraditionOrTextualContext: /sutta|dhammapada|sn |mn |dn |an |metta|anicca|dukkha|karma|dhamma/i.test(page.text) ? "Buddhist textual or doctrinal context" : "General educational reflection",
      canonicalReference: "See visible page source note or external review queue",
      url: page.externalLinks.join("; "),
      copyrightOrLicenseNote: "Do not reproduce long modern translations without owner/legal review.",
      accessDate: "Not collected; static link extraction does not access the destination",
      verificationStatus: page.externalLinks.length > 0 ? "link-present-not-claim-verified" : "no-external-link-extracted-review-purpose-and-claims",
      reviewerNote: "Repository review does not claim Buddhist studies, clinical, or legal approval."
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
      diagnosisClaims: "Not evaluated by this phrase-presence diagnostic; review claims in context",
      treatmentClaims: "Not certified by static extraction; review treatment/cure wording in context",
      guaranteedOutcomes: /guarantee|cure|will heal|will sleep/i.test(page.text) ? "Manual review required" : "No guarantee language detected",
      breathFocusDiscomfort: /open your eyes|feel the feet|shorten|stop|grounding/i.test(page.text) ? "Visible adaptation language present" : "Review for adaptation language",
      professionalSupport: /professional support|qualified professional|medical or mental health/i.test(page.text) ? "Visible support limitation present" : "Review support limitation",
      adPlacementSuitability: page.type === "meditationDetail" ? "Avoid ads inside main instructions and near safety notes" : "Restricted placement or owner review",
      status: /professional support|qualified professional|medical or mental health/i.test(page.text) ? "repository-safety-language-present" : "safety-review-pending"
    }));

  const dailyReflectionRows = pages
    .filter((page) => page.type === "dailyReflection" || page.type === "todayReflection")
    .map((page) => ({
      url: page.url,
      pageType: page.type,
      title: page.h1,
      visibleWordCount: page.words,
      indexingStatus: page.noindex ? "noindex" : "indexable",
      sitemapStatus: page.inSitemap ? "in sitemap" : "not in sitemap",
      distinctThemeDecision: page.noindex ? "Preserve existing noindex; review independent reader purpose" : "Preserve current index intent; review independent reader purpose",
      repeatedStructureRisk: "Requires editorial comparison; noindex and unique wording do not establish distinctness",
      safetyDecision: /professional support|qualified professional|medical or mental health/i.test(page.text) ? "Support limitation visible" : "Review support limitation",
      repositoryAction: page.type === "todayReflection" ? "Noindex and sitemap exclusion retained" : "No URL, sitemap, or indexability change",
      finalStatus: "Automated inventory only; editorial distinctness not certified"
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

  const tokens = (page) => lexicalTokens(page.text);
  const tokenSets = new Map(pages.map((page) => [page.route, tokens(page)]));
  const roleClusterByHref = new Map(roleMap.map((role) => [role.href, role.cluster]));
  const duplicateDecisionFor = (pageA, pageB) => {
    const clusterA = roleClusterByHref.get(pageA.route);
    const clusterB = roleClusterByHref.get(pageB.route);
    return similarityDecision(pageA, pageB, clusterA, clusterB);
  };
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
          decision: duplicateDecisionFor(pages[i], pages[j]),
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
  const sourceQueueHeaders = ["url", "pageType", "claimArea", "currentSources", "recommendedSourceType", "priority", "humanReviewer"];
  const linkOpportunityHeaders = ["url", "pageType", "currentInboundLinks", "opportunity", "priority", "validationMethod"];
  const unresolvedSimilarityRows = similarityRows;
  const paragraphRows = repeatedParagraphs(pages);
  const safetyReviewPendingItems = safetyRows.filter((row) => row.status !== "repository-safety-language-present").length;
  const quoteOriginPendingItems = quoteRows.filter(row => row.verificationStatus === "visible-declaration-missing-or-incomplete").length;
  const summary = {
    generatedAt: new Date().toISOString(),
    editorialCertification: "None. Technical success and automated review queues are not an editorial approval or AdSense readiness result.",
    wordCountScope: "Main content only; diagnostic metadata, no minimum-word threshold",
    repeatedParagraphGroups: paragraphRows.length,
    historicalRepositorySafeRemediationDate: "2026-07-21",
    historicalTargetedRemediationPhaseDate: "2026-07-21",
    queueInterpretation: "Signals need qualitative disposition. A missing source link may be appropriate for original practical advice; a present link is not source verification. Historical tracker records do not close current findings.",
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
    quoteOriginPendingItems,
    quoteOriginPendingInterpretation: "Counts missing/incomplete visible declarations only. No origin is independently verified by extraction; use the separate origin-governance gate and current editorial evidence to assess attribution accuracy.",
    sourceVerificationItems: sourceQueueRows.length,
    safetyReviewItems: safetyReviewPendingItems,
    safetyReviewRows: safetyRows.length,
    dailyReflectionReviewItems: dailyReflectionRows.length,
    dailyReflectionIndexabilityChanges: 0,
    expertReviewItems: sourceQueueRows.length + safetyReviewPendingItems,
    similarityPairs: similarityRows.length,
    highSimilarityPairs: similarityRows.filter((row) => Number(row.similarity) >= 0.7).length,
    unresolvedSimilarityPairs: unresolvedSimilarityRows.length,
    unresolvedHighSimilarityPairs: unresolvedSimilarityRows.filter((row) => Number(row.similarity) >= 0.7).length,
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
  writeCsv("daily-reflection-review.csv", Object.keys(dailyReflectionRows[0]), dailyReflectionRows);
  writeCsv("page-role-map.csv", Object.keys(roleMap[0]), roleMap.map((row) => ({ ...row, href: `${site}${row.href}` })));
  writeCsv("adsense-page-type-suitability.csv", Object.keys(adSuitabilityRows[0]), adSuitabilityRows);
  writeCsv("content-remediation-tracker.csv", Object.keys(implementationTrackerRows[0]), implementationTrackerRows);
  writeCsv("url-decision-map.csv", Object.keys(urlDecisionRows[0]), urlDecisionRows);
  writeCsv("source-verification-queue.csv", sourceQueueHeaders, sourceQueueRows);
  writeCsv("internal-link-opportunities.csv", linkOpportunityHeaders, linkOpportunityRows);
  writeCsv("duplicate-clusters.csv", Object.keys(similarityRows[0] ?? { urlA: "", urlB: "", pageTypeA: "", pageTypeB: "", similarity: "", decision: "", notes: "" }), similarityRows);
  writeCsv("repeated-paragraphs.csv", ["paragraph", "pageCount", "urls", "disposition"], paragraphRows);
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
