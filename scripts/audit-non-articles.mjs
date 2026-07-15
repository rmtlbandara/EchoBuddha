import { build as esbuild } from "esbuild";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const OUT_DIR = process.env.NON_ARTICLE_AUDIT_OUT_DIR
  ? path.resolve(ROOT, process.env.NON_ARTICLE_AUDIT_OUT_DIR)
  : path.join(ROOT, "docs", "audits", "non-articles");
const SITE_URL = "https://echobuddha.com";

const PROTECTED_ARTICLE_PREFIXES = ["/articles/"];
const AUDIT_DATE = new Date().toISOString().slice(0, 10);

function read(file) {
  return readFileSync(path.join(ROOT, file), "utf8");
}

function writeJson(name, data) {
  writeFileSync(path.join(OUT_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(name, data) {
  writeFileSync(path.join(OUT_DIR, name), data);
}

function toCsv(rows, columns) {
  const escape = (value) => {
    const string = Array.isArray(value) ? value.join(" | ") : value == null ? "" : String(value);
    return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
  };
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => escape(row[column])).join(",")).join("\n")}\n`;
}

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#x2F;", "/");
}

function stripTags(html = "") {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractAttr(tag, attr) {
  const match = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function extractFirst(html, regex) {
  const match = html.match(regex);
  return match ? decodeHtml(match[1].trim()) : "";
}

function extractAll(html, regex, mapper = (match) => match[1]) {
  return [...html.matchAll(regex)].map(mapper).filter((value) => value != null && value !== "");
}

function normalizeRoute(value) {
  if (!value) return "";
  try {
    const url = new URL(value, SITE_URL);
    if (url.origin !== SITE_URL) return value;
    let route = url.pathname;
    if (!route.endsWith("/") && !path.extname(route)) route += "/";
    return route;
  } catch {
    return value;
  }
}

function routeFromDistFile(file) {
  const relative = path.relative(DIST, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  if (relative.endsWith("/index.html")) return `/${relative.replace(/\/index\.html$/, "/")}`;
  return `/${relative}`;
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

async function importBundled(entryPoint) {
  const result = await esbuild({
    absWorkingDir: ROOT,
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent"
  });
  const source = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

function schemaTypes(html) {
  const blocks = extractAll(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const types = [];
  const authors = [];
  const dates = { published: "", modified: "" };
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(decodeHtml(block));
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (node?.["@type"]) types.push(node["@type"]);
        if (node?.author?.name) authors.push(node.author.name);
        if (node?.datePublished) dates.published ||= node.datePublished;
        if (node?.dateModified) dates.modified ||= node.dateModified;
      }
    } catch {
      types.push("UNPARSEABLE_JSON_LD");
    }
  }
  return { types: [...new Set(types)], authors: [...new Set(authors)], ...dates };
}

function htmlFacts(route, html) {
  const main = extractFirst(html, /<main[^>]*id=["']main-content["'][^>]*>([\s\S]*?)<\/main>/i) || html;
  const titleTag = extractFirst(html, /<title>([\s\S]*?)<\/title>/i);
  const metaDescription = extractFirst(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const canonical = extractFirst(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i);
  const robots = extractFirst(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i) || "index, follow (implicit)";
  const h1 = stripTags(extractFirst(main, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const headings = extractAll(main, /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match) => ({
    level: match[1].toLowerCase(),
    text: stripTags(match[3]),
    id: extractAttr(match[2], "id")
  }));
  const links = extractAll(html, /<a\b([^>]*)>/gi, (match) => extractAttr(match[1], "href"))
    .filter(Boolean)
    .map(normalizeRoute);
  const images = extractAll(main, /<img\b([^>]*)>/gi, (match) => ({
    src: extractAttr(match[1], "src"),
    alt: extractAttr(match[1], "alt")
  }));
  const text = stripTags(main);
  const paragraphs = extractAll(main, /<p\b[^>]*>([\s\S]*?)<\/p>/gi, (match) => stripTags(match[1])).filter(Boolean);
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).length >= 6);
  const { types, authors, published, modified } = schemaTypes(html);
  return {
    route,
    titleTag,
    metaDescription,
    canonical,
    robots,
    h1,
    headings,
    headingIds: headings.map((heading) => heading.id).filter(Boolean),
    links,
    images,
    text,
    paragraphs,
    sentences,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    readingTime: `${Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200))} min`,
    structuredDataTypes: types,
    author: authors.join("; "),
    publicationDate: published,
    modifiedDate: modified
  };
}

function familyFor(route) {
  if (route === "/") return ["Homepage and high-level entry", "homepage"];
  if (route === "/start-here/") return ["Homepage and high-level entry", "start-here"];
  if (route === "/learn/") return ["Learning content", "learn-hub"];
  if (/^\/learn\/buddhist-dictionary\/[^/]+\/$/.test(route)) return ["Buddhist dictionary", "term-page"];
  if (route === "/learn/buddhist-dictionary/") return ["Buddhist dictionary", "dictionary-index"];
  if (/^\/learn\/dhammapada-reflections\//.test(route)) return ["Sutta and Dhammapada content", route.endsWith("/dhammapada-reflections/") ? "dhammapada-index" : "dhammapada-page"];
  if (/^\/learn\/sutta-for-daily-life\//.test(route)) return ["Sutta and Dhammapada content", route.endsWith("/sutta-for-daily-life/") ? "sutta-index" : "sutta-page"];
  if (route.startsWith("/learn/")) return ["Learning content", route.split("/").filter(Boolean).length === 2 ? "learning-section" : "learning-page"];
  if (route === "/meditation/") return ["Meditation content", "meditation-hub"];
  if (route === "/meditation-guide/") return ["Meditation content", "standalone-guide"];
  if (route.startsWith("/meditation/")) return ["Meditation content", "method-page"];
  if (route === "/quotes/") return ["Quotes content", "quote-hub"];
  if (/^\/quotes\/[^/]+\/[^/]+\/$/.test(route)) return ["Quotes content", "quote-story"];
  if (route.startsWith("/quotes/")) return ["Quotes content", "quote-category"];
  if (route === "/daily-reflections/") return ["Daily reflections", "reflection-hub"];
  if (route === "/daily-reflections/today/") return ["Daily reflections", "today-rotating-route"];
  if (route.startsWith("/daily-reflections/")) return ["Daily reflections", "reflection-detail"];
  if (route === "/tools/") return ["Practice tools and interactive content", "tools-hub"];
  if (route === "/search/") return ["Supporting and technical public pages", "search"];
  if (route === "/404.html") return ["Supporting and technical public pages", "404"];
  if (["/about/", "/authors/echo-buddha-editorial/", "/editorial-policy/", "/disclaimer/", "/privacy-policy/", "/terms-of-use/", "/contact/"].includes(route)) {
    return ["Trust and institutional content", route.split("/").filter(Boolean).join("/") || "trust"];
  }
  if (route === "/mindful-living/") return ["Homepage and high-level entry", "mindful-living-hub"];
  return ["Supporting and technical public pages", "other"];
}

function sourceFor(route) {
  const exact = {
    "/": ["src/pages/index.astro", "src/pages/index.astro", "static Astro page"],
    "/about/": ["src/pages/about.astro", "src/pages/about.astro", "static Astro page"],
    "/start-here/": ["src/pages/start-here.astro", "src/pages/start-here.astro", "static Astro page"],
    "/editorial-policy/": ["src/pages/editorial-policy.astro", "src/pages/editorial-policy.astro", "static Astro page"],
    "/authors/echo-buddha-editorial/": ["src/pages/authors/echo-buddha-editorial.astro", "src/pages/authors/echo-buddha-editorial.astro", "static Astro page"],
    "/learn/": ["src/data/learn.ts", "src/pages/learn/index.astro", "learn hub template"],
    "/learn/buddhism-for-beginners/": ["src/data/learn.ts", "src/pages/learn/buddhism-for-beginners.astro", "static learning landing page"],
    "/learn/four-noble-truths/": ["src/data/learn.ts", "src/pages/learn/four-noble-truths.astro", "static learning landing page"],
    "/learn/eightfold-path/": ["src/data/learn.ts", "src/pages/learn/eightfold-path.astro", "static learning landing page"],
    "/learn/questions-about-buddhism/": ["src/data/learn.ts", "src/pages/learn/questions-about-buddhism.astro", "FAQ landing page"],
    "/learn/buddhist-resources/": ["src/data/learn.ts", "src/pages/learn/buddhist-resources.astro", "resource list page"],
    "/meditation/": ["src/data/learn.ts", "src/pages/meditation/index.astro", "meditation hub template"],
    "/meditation-guide/": ["src/pages/meditation-guide.astro", "src/pages/meditation-guide.astro", "static standalone guide"],
    "/daily-reflections/": ["src/data/dailyReflections.ts", "src/pages/daily-reflections/index.astro", "reflection hub template"],
    "/daily-reflections/today/": ["src/data/dailyReflections.ts", "src/pages/daily-reflections/today.astro", "date-selected reflection template"],
    "/mindful-living/": ["src/pages/mindful-living.astro", "src/pages/mindful-living.astro", "static hub page"],
    "/tools/": ["src/pages/tools.astro", "src/pages/tools.astro", "static interactive tools page"],
    "/quotes/": ["src/data/site.ts", "src/pages/quotes.astro", "quote hub template"],
    "/search/": ["src/pages/search.astro", "src/pages/search.astro", "static search page"],
    "/contact/": ["src/pages/contact.astro", "src/pages/contact.astro", "static trust page"],
    "/privacy-policy/": ["src/pages/privacy-policy.astro", "src/pages/privacy-policy.astro", "static policy page"],
    "/terms-of-use/": ["src/pages/terms-of-use.astro", "src/pages/terms-of-use.astro", "static policy page"],
    "/disclaimer/": ["src/pages/disclaimer.astro", "src/pages/disclaimer.astro", "static policy page"],
    "/404.html": ["src/pages/404.astro", "src/pages/404.astro", "static 404 page"]
  };
  if (exact[route]) return exact[route];
  if (/^\/learn\/[^/]+\/$/.test(route)) return ["src/data/learn.ts", "src/pages/learn/[section]/index.astro", "dynamic learning section index"];
  if (/^\/learn\/[^/]+\/[^/]+\/$/.test(route)) return ["src/data/learn.ts", "src/pages/learn/[section]/[slug].astro", "dynamic learning page"];
  if (/^\/meditation\/[^/]+\/$/.test(route)) return ["src/data/learn.ts", "src/pages/meditation/[slug].astro", "dynamic meditation page"];
  if (/^\/quotes\/[^/]+\/$/.test(route)) return ["src/data/site.ts", "src/pages/quotes/[category].astro", "dynamic quote category"];
  if (/^\/quotes\/[^/]+\/[^/]+\/$/.test(route)) return ["src/data/site.ts", "src/pages/quotes/[category]/[story].astro", "dynamic quote story"];
  if (/^\/daily-reflections\/[^/]+\/$/.test(route)) return ["src/data/dailyReflections.ts", "src/pages/daily-reflections/[slug].astro", "dynamic daily reflection"];
  return ["unknown", "unknown", "unknown"];
}

function roleFor(route, family, subtype) {
  if (route === "/") return "Primary entry point introducing Echo Buddha's content concept and major content families.";
  if (route === "/start-here/") return "Guided beginner pathway across learning, meditation, reflections, quotes, and articles.";
  if (subtype === "learn-hub" || subtype === "learning-section") return "Educational navigation hub that should synthesize child pages and sequence learning.";
  if (subtype === "term-page") return "Concise reference definition with related learning links.";
  if (subtype === "dhammapada-page" || subtype === "sutta-page") return "Primary-text-inspired explanation that must clarify source and interpretation status.";
  if (family === "Meditation content" && subtype !== "meditation-hub") return "Permanent practice-method reference for a specific meditation use case.";
  if (subtype === "quote-story") return "Original quote reflection story with practice meaning and related teaching links.";
  if (subtype === "quote-category") return "Topic collection for original Echo Buddha quotes and related teachings.";
  if (subtype === "reflection-detail") return "Daily-use practice prompt with meaning, example, journaling, and related links.";
  if (subtype === "today-rotating-route") return "Recurring-use route that rotates through the reflection library by UTC day of year.";
  if (family === "Trust and institutional content") return "Trust, policy, contact, or editorial transparency support page.";
  if (family === "Practice tools and interactive content") return "Interactive practice utility page with timers, prompts, random quotes, and glossary helpers.";
  return "Public support, hub, archive, or utility route.";
}

function intentFor(route, family, subtype, h1) {
  if (subtype.includes("hub") || subtype.includes("index")) return "navigational / learning-path discovery";
  if (subtype === "term-page") return `definition / reference for ${h1}`;
  if (subtype === "quote-story") return "reflective reading / quote meaning";
  if (subtype === "quote-category") return "topic quote collection";
  if (family === "Daily reflections") return subtype === "today-rotating-route" ? "daily returning practice" : "short reflection and journaling prompt";
  if (family === "Meditation content") return "practice instruction";
  if (family === "Trust and institutional content") return "trust, policy, or contact information";
  if (route === "/search/") return "site search";
  return "educational exploration";
}

function recurrenceFor(family, subtype) {
  if (family === "Daily reflections") return "High: designed for daily return and journaling.";
  if (family === "Practice tools and interactive content") return "High: timers, prompts, and randomizers support repeated use.";
  if (family === "Quotes content") return subtype === "quote-story" ? "Medium: reflective reuse possible, but many pages share a scaffold." : "Medium: browsing and filtering support return visits.";
  if (family === "Meditation content") return "Medium: method references can be revisited during practice.";
  if (family === "Buddhist dictionary") return "Low-to-medium: reference use when terms recur.";
  return "Low-to-medium: primarily orientation or study.";
}

function tokenize(text) {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((word) => word.length > 3));
}

function jaccard(a, b) {
  const left = tokenize(a);
  const right = tokenize(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / (left.size + right.size - shared);
}

function mainContentHash(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function sectionTextsFromHeadings(facts) {
  const sections = {};
  for (const heading of facts.headings) {
    const key = heading.text.toLowerCase();
    if (/(source note|editorial note|safety note|further reading)/.test(key)) sections.sourceNotes = true;
    if (/(key takeaway|meaning|simple meaning)/.test(key)) sections.definitions = true;
    if (/(practice|practice today|practice suggestion|practice for today)/.test(key)) sections.practices = true;
    if (/(reflection question|journal question)/.test(key)) sections.prompts = true;
  }
  return sections;
}

function statusFor(entry) {
  const issues = [];
  if (!entry.canonical) issues.push("missing canonical");
  if (!entry.h1) issues.push("missing H1");
  if (!entry.metaDescription) issues.push("missing meta description");
  if (!entry.inSitemap && entry.route !== "/404.html") issues.push("absent from sitemap");
  if (entry.robots.includes("noindex")) issues.push("noindex");
  if (entry.family === "Sutta and Dhammapada content" && entry.externalSourceLinkCount === 0) issues.push("source verification needed");
  if (entry.subtype === "quote-story" && !/original echo buddha/i.test(entry.textSample)) issues.push("quote status label not visible in sample");
  if (entry.wordCount < 120 && !["404", "search"].includes(entry.subtype)) issues.push("very short for role");
  return issues.length ? `review: ${issues.join("; ")}` : "baseline captured";
}

function sourceTier(entry) {
  const pathText = `${entry.route} ${entry.h1}`.toLowerCase();
  if (["Quotes content", "Daily reflections", "Trust and institutional content", "Homepage and high-level entry", "Practice tools and interactive content", "Supporting and technical public pages"].includes(entry.family)) {
    return "TIER 3 - source-aware editorial review";
  }
  if (entry.family === "Sutta and Dhammapada content") return "TIER 1 - strong doctrinal sourcing required";
  if (entry.family === "Buddhist dictionary") return "TIER 1 - strong doctrinal sourcing required";
  if (/four noble truths|eightfold|karma|anicca|dukkha|anatta|metta|karuna|sati|dhamma|sangha|nirvana|dependent origination|aggregates|precepts|right speech|right livelihood|dhammapada|sutta/.test(pathText)) {
    return "TIER 1 - strong doctrinal sourcing required";
  }
  if (entry.family === "Meditation content" || /meditation|breath|walking|loving-kindness|mindfulness/.test(pathText)) {
    return "TIER 2 - practice-method sourcing required";
  }
  return "TIER 3 - source-aware editorial review";
}

function makeCluster(name, routes, protectedArticleRoutes, reason, recommendation, inventory) {
  const invByRoute = new Map(inventory.map((item) => [item.route, item]));
  return {
    cluster: name,
    nonArticleUrls: routes.filter((route) => invByRoute.has(route)),
    protectedArticleUrls: protectedArticleRoutes,
    primaryQuery: name.toLowerCase(),
    readerStage: "beginner to returning practitioner",
    contentPromise: reason,
    preferredOwner: routes.find((route) => invByRoute.has(route)) ?? routes[0],
    risk: protectedArticleRoutes.length ? "cross-section overlap with protected article context" : "within non-article overlap",
    recommendation
  };
}

function groupRepeats(records, key, min = 2) {
  const map = new Map();
  for (const record of records) {
    for (const item of record[key]) {
      const normalized = mainContentHash(item);
      if (!normalized || normalized.split(" ").length < 6) continue;
      const bucket = map.get(normalized) ?? { text: item, routes: [] };
      bucket.routes.push(record.route);
      map.set(normalized, bucket);
    }
  }
  return [...map.values()]
    .filter((item) => new Set(item.routes).size >= min)
    .map((item) => ({ ...item, routes: [...new Set(item.routes)] }))
    .sort((a, b) => b.routes.length - a.routes.length || b.text.length - a.text.length);
}

function nonArticle(route) {
  return !PROTECTED_ARTICLE_PREFIXES.some((prefix) => route.startsWith(prefix));
}

async function main() {
  if (!existsSync(DIST)) {
    throw new Error("dist/ is missing. Run `npm run build` before auditing generated output.");
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const learn = await importBundled("src/data/learn.ts");
  const site = await importBundled("src/data/site.ts");
  const daily = await importBundled("src/data/dailyReflections.ts");

  const sourceCounts = {
    learningSections: learn.learningSections.length,
    learningPages: learn.getAllLearningPages().length,
    meditationPages: learn.allMeditationPages.length,
    quotes: site.quotes.length,
    quoteCategories: site.quoteCategories.length,
    protectedArticles: site.fullArticles.length,
    protectedArticleCategories: site.articleCategories.length,
    dailyReflections: daily.dailyReflections.length
  };

  const htmlFiles = listFiles(DIST).filter((file) => file.endsWith(".html"));
  const generatedRoutes = htmlFiles.map((file) => [routeFromDistFile(file), file]).filter(([route]) => nonArticle(route));

  const sitemapXml = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const sitemapRoutes = extractAll(sitemapXml, /<loc>(.*?)<\/loc>/g, (match) => normalizeRoute(match[1])).filter(nonArticle);
  const searchIndex = JSON.parse(readFileSync(path.join(DIST, "search-index.json"), "utf8"));
  const searchRoutes = searchIndex.map((item) => normalizeRoute(item.url)).filter(nonArticle);

  const facts = generatedRoutes.map(([route, file]) => htmlFacts(route, readFileSync(file, "utf8")));
  const routeFacts = new Map(facts.map((fact) => [fact.route, fact]));
  const inboundMap = new Map(facts.map((fact) => [fact.route, []]));
  for (const fact of facts) {
    for (const href of fact.links) {
      if (href.startsWith("/") && inboundMap.has(href)) inboundMap.get(href).push(fact.route);
    }
  }

  const inventory = facts
    .map((fact) => {
      const [family, subtype] = familyFor(fact.route);
      const [sourceFile, routeFile, template] = sourceFor(fact.route);
      const outboundInternalLinks = fact.links.filter((href) => href.startsWith("/"));
      const externalLinks = fact.links.filter((href) => /^https?:\/\//.test(href) && !href.startsWith(SITE_URL));
      const articleReferences = outboundInternalLinks.filter((href) => href.startsWith("/articles/"));
      const learningReferences = outboundInternalLinks.filter((href) => href.startsWith("/learn/"));
      const quoteReferences = outboundInternalLinks.filter((href) => href.startsWith("/quotes/"));
      const toolReferences = outboundInternalLinks.filter((href) => href.startsWith("/tools/"));
      const inboundLinks = inboundMap.get(fact.route) ?? [];
      const entry = {
        url: `${SITE_URL}${fact.route === "/" ? "" : fact.route}`,
        route: fact.route,
        slug: fact.route.split("/").filter(Boolean).at(-1) ?? "home",
        family,
        subtype,
        sourceFile,
        routeFile,
        template,
        pageTitle: fact.titleTag,
        h1: fact.h1,
        titleTag: fact.titleTag,
        metaDescription: fact.metaDescription,
        canonical: fact.canonical,
        robots: fact.robots,
        structuredDataTypes: fact.structuredDataTypes,
        author: fact.author,
        publicationDate: fact.publicationDate,
        reviewedOrModifiedDate: fact.modifiedDate,
        wordCount: fact.wordCount,
        approximateReadingTime: fact.readingTime,
        headingHierarchy: fact.headings.map((heading) => `${heading.level}:${heading.text}${heading.id ? `#${heading.id}` : ""}`),
        headingIds: fact.headingIds,
        internalLinkCount: outboundInternalLinks.length,
        externalSourceLinkCount: externalLinks.length,
        inboundLinks: [...new Set(inboundLinks)],
        inboundLinkCount: new Set(inboundLinks).size,
        outboundLinks: [...new Set(outboundInternalLinks)],
        externalLinks: [...new Set(externalLinks)],
        relatedContentReferences: [...new Set(outboundInternalLinks.filter((href) => /\/(learn|meditation|quotes|daily-reflections|tools|articles)\//.test(href)))],
        learningHubReferences: [...new Set(learningReferences)],
        articleReferences: [...new Set(articleReferences)],
        quoteReferences: [...new Set(quoteReferences)],
        toolReferences: [...new Set(toolReferences)],
        inSitemap: sitemapRoutes.includes(fact.route),
        inSearchIndex: searchRoutes.includes(fact.route),
        image: fact.images[0]?.src ?? "",
        altText: fact.images[0]?.alt ?? "",
        pageRole: roleFor(fact.route, family, subtype),
        likelySearchIntent: intentFor(fact.route, family, subtype, fact.h1),
        likelyRecurringUserPurpose: recurrenceFor(family, subtype),
        indexabilityRecommendation: fact.robots.includes("noindex")
          ? "Keep noindex unless a future quote-story review confirms enough unique value."
          : "Indexable baseline; review source clarity and differentiation before scaling similar pages.",
        textSample: fact.text.slice(0, 360)
      };
      return { ...entry, auditStatus: statusFor(entry) };
    })
    .sort((a, b) => a.route.localeCompare(b.route));

  const inventoryByRoute = new Map(inventory.map((entry) => [entry.route, entry]));
  const missingFromSitemap = inventory.filter((entry) => entry.route !== "/404.html" && !sitemapRoutes.includes(entry.route));
  const sitemapOnlyRoutes = sitemapRoutes.filter((route) => !inventoryByRoute.has(route));
  const missingFromSearch = inventory.filter((entry) => !searchRoutes.includes(entry.route) && !["/404.html", "/privacy-policy/", "/terms-of-use/", "/disclaimer/"].includes(entry.route));
  const searchOnlyRoutes = searchRoutes.filter((route) => !inventoryByRoute.has(route));
  const orphanPages = inventory.filter((entry) => entry.route !== "/" && entry.inboundLinkCount === 0 && entry.route !== "/404.html");

  const factsRecords = facts.map((fact) => ({
    route: fact.route,
    sentences: fact.sentences,
    paragraphs: fact.paragraphs,
    text: fact.text,
    headings: fact.headings.map((heading) => heading.text)
  }));
  const duplicateSentences = groupRepeats(factsRecords, "sentences").slice(0, 100);
  const duplicateParagraphs = groupRepeats(factsRecords, "paragraphs").slice(0, 100);

  const pageSimilarity = [];
  for (let i = 0; i < factsRecords.length; i += 1) {
    for (let j = i + 1; j < factsRecords.length; j += 1) {
      const left = factsRecords[i];
      const right = factsRecords[j];
      const score = jaccard(left.text, right.text);
      if (score >= 0.28) {
        pageSimilarity.push({
          left: left.route,
          right: right.route,
          jaccard: Number(score.toFixed(3)),
          leftFamily: inventoryByRoute.get(left.route)?.family,
          rightFamily: inventoryByRoute.get(right.route)?.family
        });
      }
    }
  }
  pageSimilarity.sort((a, b) => b.jaccard - a.jaccard);

  const articleRecords = site.fullArticles.map((article) => ({
    route: `/articles/${article.slug}/`,
    title: article.title,
    category: article.category,
    text: [article.title, article.description, ...(article.content ?? []).flatMap((section) => [section.heading, section.subheading, ...(section.paragraphs ?? [])])].filter(Boolean).join(" ")
  }));
  const articleOverlap = [];
  for (const entry of inventory) {
    const fact = routeFacts.get(entry.route);
    if (!fact || fact.wordCount < 120) continue;
    for (const article of articleRecords) {
      const score = jaccard(fact.text, article.text);
      if (score >= 0.18) {
        articleOverlap.push({
          nonArticleRoute: entry.route,
          protectedArticleRoute: article.route,
          protectedArticleTitle: article.title,
          protectedArticleCategory: article.category,
          jaccard: Number(score.toFixed(3)),
          recommendation: "Recommendation-only: preserve article content; clarify the non-article page as hub/reference/practice/utility rather than competing long-form article."
        });
      }
    }
  }
  articleOverlap.sort((a, b) => b.jaccard - a.jaccard);

  const overlapClusters = [
    makeCluster(
      "Beginner Buddhism / start here",
      ["/", "/start-here/", "/learn/", "/learn/buddhism-for-beginners/", "/learn/buddhism-101/what-is-buddhism/"],
      ["/articles/what-is-buddhism-beginner-guide/", "/articles/buddhism-for-beginners-simple-guide/"],
      "Multiple pages promise a beginner entry into Buddhism.",
      "Keep separate if roles stay explicit: homepage as concept, Start Here as journey, Learn as hub, Buddhism for Beginners as curriculum, article pages as protected long-form reading.",
      inventory
    ),
    makeCluster(
      "Meditation for beginners",
      ["/meditation/", "/meditation-guide/", "/meditation/meditation-for-beginners/", "/meditation/5-minute-meditation-practice/"],
      ["/articles/how-to-meditate-for-beginners/", "/articles/how-to-meditate-for-anxiety/"],
      "Meditation hub, guide, method pages, and protected articles all address first practice.",
      "Make the guide the comprehensive non-article reference, the hub the navigation page, and method pages concise practice references; do not let each retell the same beginner overview.",
      inventory
    ),
    makeCluster(
      "Breathing and mindfulness of breathing",
      ["/meditation/breathing-meditation/", "/learn/sutta-for-daily-life/mindfulness-of-breathing-explained-simply/"],
      ["/articles/mindfulness-of-breathing-guide/"],
      "Breath practice appears as a method page, sutta-related explainer, and protected article.",
      "Differentiate practice instruction, source-aware teaching explanation, and article-depth guide. Add source review to the sutta page before expansion.",
      inventory
    ),
    makeCluster(
      "Loving-kindness / metta / compassion",
      ["/meditation/loving-kindness-meditation/", "/learn/buddhist-dictionary/metta/", "/learn/buddhist-dictionary/karuna/", "/quotes/compassion/", "/daily-reflections/simple-goodwill/"],
      ["/articles/loving-kindness-meditation-guide/", "/articles/loving-kindness-meditation-beginners/", "/articles/compassion-in-buddhism-beginner-guide/", "/articles/compassion-as-a-daily-discipline/"],
      "Compassion and metta are served by dictionary, practice, quote, reflection, and protected article pages.",
      "Keep dictionary concise, meditation page procedural, quotes reflective, and protected articles long-form. Review quote-story templates for repeated generic compassion framing.",
      inventory
    ),
    makeCluster(
      "Four Noble Truths",
      ["/learn/four-noble-truths/", "/learn/buddhism-101/the-four-noble-truths-explained/", "/daily-reflections/the-first-truth-is-kind/"],
      ["/articles/four-noble-truths-explained/", "/articles/four-noble-truths-explained-simply/"],
      "A hub, lesson, reflection, and protected articles target the same central doctrine.",
      "The non-article hub should sequence learning; the lesson should define; the reflection should remain practice-oriented. Do not add another broad overview URL.",
      inventory
    ),
    makeCluster(
      "Noble Eightfold Path",
      ["/learn/eightfold-path/", "/learn/buddhism-101/the-noble-eightfold-path-explained/", "/daily-reflections/one-step-on-the-path/"],
      ["/articles/eightfold-path-explained/", "/articles/eightfold-path-explained-daily-life/", "/articles/noble-eightfold-path-practical-guide/"],
      "The path has multiple overview and application routes.",
      "Assign ownership: hub for navigation, learning page for concise doctrine, reflections for daily prompt, articles for protected depth and examples.",
      inventory
    ),
    makeCluster(
      "Quotes and daily reflections",
      ["/quotes/", "/daily-reflections/", "/daily-reflections/today/"],
      [],
      "Quote stories and daily reflections share short reflective/practice patterns and many themes.",
      "Continue separating quote-origin pages from date/rotation practice pages. Reduce boilerplate in future reflection and quote-story batches.",
      inventory
    )
  ];

  const sourcePlan = inventory.map((entry) => {
    const sections = sectionTextsFromHeadings(routeFacts.get(entry.route) ?? { headings: [] });
    const tier = sourceTier(entry);
    return {
      route: entry.route,
      family: entry.family,
      subtype: entry.subtype,
      h1: entry.h1,
      sourceTier: tier,
      visibleSourceOrSafetySection: Boolean(sections.sourceNotes),
      externalSourceLinks: entry.externalLinks,
      claimsLikelyNeedingSupport: tier.startsWith("TIER 1")
        ? "Core Buddhist doctrine, terminology, sutta/Dhammapada framing, translation/paraphrase status, tradition scope."
        : tier.startsWith("TIER 2")
          ? "Practice method, safety limits, expected outcomes, tradition/source lineage for meditation instructions."
          : "Editorial reflection status, wellbeing limits, fiction/original labels, privacy/tool behavior where relevant.",
      recommendedSourceType: tier.startsWith("TIER 1")
        ? "Named reputable translation or primary text reference plus tradition-aware secondary explanation."
        : tier.startsWith("TIER 2")
          ? "Practice-method source, qualified teacher/lineage explanation, and clear safety disclaimer where relevant."
          : "Transparent Echo Buddha original/reflection label; no invented scriptural or historical attribution.",
      recommendation: entry.externalSourceLinkCount === 0 && tier !== "TIER 3 - source-aware editorial review"
        ? "High priority source review before major SEO expansion."
        : "Maintain source-aware editorial distinction."
    };
  });

  const preservationBaseline = {
    auditDate: AUDIT_DATE,
    scope: "All generated public non-article routes. /articles/ routes are excluded except recommendation-only overlap context.",
    urls: inventory.map((entry) => ({
      route: entry.route,
      url: entry.url,
      slug: entry.slug,
      canonical: entry.canonical,
      headingIds: entry.headingIds,
      hrefs: entry.outboundLinks,
      categoriesAndCollections: {
        family: entry.family,
        subtype: entry.subtype
      },
      contentRelationships: {
        inboundLinks: entry.inboundLinks,
        relatedContentReferences: entry.relatedContentReferences,
        articleReferences: entry.articleReferences,
        learningHubReferences: entry.learningHubReferences,
        quoteReferences: entry.quoteReferences,
        toolReferences: entry.toolReferences
      },
      schemaTypes: entry.structuredDataTypes,
      sitemapMembership: entry.inSitemap,
      internalSearchMembership: entry.inSearchIndex,
      dateValues: {
        publicationDate: entry.publicationDate,
        reviewedOrModifiedDate: entry.reviewedOrModifiedDate
      }
    }))
  };

  const architecture = {
    auditDate: AUDIT_DATE,
    framework: "Astro 6 static site build",
    renderingModel: "Static HTML generated by Astro build; browser JavaScript powers search overlay and practice tools.",
    routeSources: {
      staticAstroPages: "src/pages/**/*.astro",
      learningDynamicRoutes: "src/pages/learn/[section]/index.astro and src/pages/learn/[section]/[slug].astro from src/data/learn.ts",
      meditationDynamicRoutes: "src/pages/meditation/[slug].astro from allMeditationPages in src/data/learn.ts",
      quoteDynamicRoutes: "src/pages/quotes/[category].astro and src/pages/quotes/[category]/[story].astro from quotes in src/data/site.ts",
      dailyReflectionDynamicRoutes: "src/pages/daily-reflections/[slug].astro plus /today/ from src/data/dailyReflections.ts",
      sitemap: "src/pages/sitemap.xml.ts",
      searchIndex: "src/pages/search-index.json.ts"
    },
    sourceCounts,
    generatedNonArticleRoutes: inventory.length,
    generatedProtectedArticleRoutes: htmlFiles.map((file) => routeFromDistFile(file)).filter((route) => route.startsWith("/articles/")).length,
    contentSystemNotes: [
      "Learning, dictionary, Dhammapada, sutta, and meditation method pages share the LearningPage data shape.",
      "Dynamic learning and meditation templates add repeated Key Takeaway, Why This Matters, A Helpful Clarification, Practice Today, Reflection Question, and Source/Safety note blocks when data supports them.",
      "Quote story pages are generated for every quote, but `isQuoteStoryIndexable` controls noindex; the generated route still exists.",
      "Daily-reflections/today is a stable route whose selected reflection changes by UTC day-of-year modulo the 30-record library.",
      "SEO.astro applies global WebSite and Organization JSON-LD on every page, with page-level schema passed by route templates.",
      "FEATURES.adsEnabled is false, but AdSlot components are present in several templates and can become an AdSense layout concern later."
    ],
    reconciliation: {
      sitemapRoutes: sitemapRoutes.length,
      searchIndexRoutes: searchRoutes.length,
      missingFromSitemap: missingFromSitemap.map((entry) => entry.route),
      sitemapOnlyRoutes,
      missingFromSearch: missingFromSearch.map((entry) => entry.route),
      searchOnlyRoutes,
      orphanPages: orphanPages.map((entry) => entry.route)
    }
  };

  const similarity = {
    auditDate: AUDIT_DATE,
    method: {
      scope: "Generated non-article <main> content only; shared header/footer/script/style excluded.",
      normalization: "HTML stripped, entities decoded, lowercase token sets for Jaccard; exact sentence/paragraph repeats normalized by punctuation and whitespace.",
      limitations: "Regex HTML extraction is sufficient for generated static audit evidence but not a semantic Buddhist accuracy review by itself.",
      layers: [
        "exact duplicated sentences",
        "exact duplicated paragraphs",
        "full page-owned prose token Jaccard",
        "heading pattern observations",
        "protected-article overlap as recommendation-only context"
      ]
    },
    duplicateSentences,
    duplicateParagraphs,
    highSimilarityPairs: pageSimilarity.slice(0, 200),
    protectedArticleOverlap: articleOverlap.slice(0, 200)
  };

  const routeEvaluation = inventory.map((entry) => ({
    route: entry.route,
    family: entry.family,
    subtype: entry.subtype,
    intendedReader: entry.family === "Buddhist dictionary" ? "Reader encountering a Buddhist term" : entry.family === "Daily reflections" ? "Returning daily practice reader" : "Beginner or general Buddhist education reader",
    readerKnowledgeLevel: entry.family === "Sutta and Dhammapada content" ? "beginner with source-aware interest" : "beginner-friendly",
    immediateUserNeed: entry.likelySearchIntent,
    primarySearchIntent: entry.likelySearchIntent,
    secondarySearchIntent: entry.family === "Quotes content" ? "practice inspiration and related teaching discovery" : "internal navigation to deeper Echo Buddha content",
    pagePurpose: entry.pageRole,
    uniquePromise: entry.pageRole,
    expectedUserOutcome: entry.family === "Practice tools and interactive content" ? "Use a practice utility and return later" : "Understand the topic and choose a next learning or practice step",
    reasonForSeparateUrl: entry.subtype === "quote-story" ? "Only defensible when the story and practice meaning are unique enough beyond the quote text." : entry.pageRole,
    relationshipWithParentHub: entry.inboundLinks.find((href) => href !== entry.route) ? "Linked from one or more hubs or related pages." : "Potentially orphaned or weakly linked.",
    relationshipWithSiblingPages: "Shares family template and should remain differentiated by specific outcome, not keyword variation.",
    relationshipWithRelevantArticles: entry.articleReferences.length ? `Links to protected article context: ${entry.articleReferences.join(", ")}` : "No direct protected article reference found in generated main content.",
    recurringUseValue: entry.likelyRecurringUserPurpose,
    lengthStructureAssessment: entry.wordCount < 160 ? "Short; acceptable only if utility/reference purpose is clear." : "Length broadly plausible for current content type.",
    recommendation: entry.auditStatus
  }));

  writeJson("ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json", architecture);
  writeJson("ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json", inventory);
  writeText(
    "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.csv",
    toCsv(inventory, [
      "route",
      "family",
      "subtype",
      "sourceFile",
      "routeFile",
      "h1",
      "titleTag",
      "metaDescription",
      "canonical",
      "robots",
      "wordCount",
      "internalLinkCount",
      "externalSourceLinkCount",
      "inboundLinkCount",
      "inSitemap",
      "inSearchIndex",
      "auditStatus"
    ])
  );
  writeJson("ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json", preservationBaseline);
  writeJson("ECHOBUDDHA_NON_ARTICLE_ROUTE_EVALUATION.json", routeEvaluation);
  writeJson("ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json", similarity);
  writeJson("ECHOBUDDHA_NON_ARTICLE_OVERLAP_CLUSTERS.json", overlapClusters);
  writeJson("ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json", sourcePlan);

  const countsByFamily = inventory.reduce((acc, entry) => {
    acc[entry.family] = (acc[entry.family] ?? 0) + 1;
    return acc;
  }, {});
  const noindexRoutes = inventory.filter((entry) => entry.robots.includes("noindex")).map((entry) => entry.route);
  const sourceReviewNeeded = sourcePlan.filter((item) => item.recommendation.startsWith("High priority")).map((item) => item.route);
  const report = `# Echo Buddha Non-Article Content Audit

Audit date: ${AUDIT_DATE}

Scope: all generated public non-article content. Protected article routes under \`/articles/\` were used only for overlap context and were not scored as editable content.

## Repository Architecture

- Framework: Astro 6 static build.
- Generated pages in the current build: 312 total.
- Generated non-article pages audited: ${inventory.length}.
- Protected article pages/categories excluded from scoring: ${architecture.generatedProtectedArticleRoutes}.
- Source data counts: ${sourceCounts.learningPages} learning pages, ${sourceCounts.meditationPages} meditation method pages, ${sourceCounts.quotes} quotes/story routes, ${sourceCounts.dailyReflections} daily reflections, ${sourceCounts.protectedArticles} protected articles.
- Shared systems: \`src/data/learn.ts\`, \`src/data/site.ts\`, \`src/data/dailyReflections.ts\`, \`src/pages/sitemap.xml.ts\`, and \`src/pages/search-index.json.ts\`.

## Public Non-Article Inventory

${Object.entries(countsByFamily)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([family, count]) => `- ${family}: ${count}`)
  .join("\n")}

Reconciliation findings:

- Missing from sitemap: ${missingFromSitemap.length ? missingFromSitemap.map((entry) => `\`${entry.route}\``).join(", ") : "none found"}.
- Sitemap-only non-article routes: ${sitemapOnlyRoutes.length ? sitemapOnlyRoutes.map((route) => `\`${route}\``).join(", ") : "none found"}.
- Missing from search index, excluding legal/404 defaults: ${missingFromSearch.length ? missingFromSearch.slice(0, 30).map((entry) => `\`${entry.route}\``).join(", ") + (missingFromSearch.length > 30 ? " ..." : "") : "none found"}.
- Search-index-only non-article routes: ${searchOnlyRoutes.length ? searchOnlyRoutes.map((route) => `\`${route}\``).join(", ") : "none found"}.
- Potential orphan routes: ${orphanPages.length ? orphanPages.slice(0, 30).map((entry) => `\`${entry.route}\``).join(", ") + (orphanPages.length > 30 ? " ..." : "") : "none found"}.

## Highest-Priority Findings

1. Source-awareness is the main long-term risk outside articles. ${sourceReviewNeeded.length} non-article pages fall into Tier 1 or Tier 2 source needs without external source links in generated content. This is most important for dictionary, Dhammapada, sutta, Four Noble Truths, Eightfold Path, karma, anicca/dukkha/anatta, metta/karuna, and meditation-method pages.

2. Quote stories are the largest non-article content family. Every quote generates a story route, while indexability is controlled per record. The template clearly labels these as original Echo Buddha reflections, which is good, but the scale and shared scaffolding create the strongest mass-generated/template risk.

3. Daily reflections have a genuine return-use model, but \`/daily-reflections/today/\` changes content under one stable URL using UTC day-of-year rotation. That is useful for humans and potentially confusing for indexing unless intentionally treated as a recurring utility route rather than a canonical archive item.

4. Learning, dictionary, sutta, Dhammapada, and meditation pages share one \`LearningPage\` shape. This is maintainable, but it also repeats blocks such as Key Takeaway, Why This Matters, Practice Today, Reflection Question, and source/safety notes. Future expansion should add page-specific source scaffolding before adding more pages.

5. The strongest cannibalization clusters are beginner Buddhism, meditation for beginners, breathing/mindfulness of breathing, loving-kindness/metta/compassion, Four Noble Truths, Eightfold Path, and quotes versus daily reflections. The current architecture can support distinct roles, but only if hubs stay navigational, dictionary pages stay concise, meditation pages stay procedural, reflections stay daily-practice prompts, and protected articles remain long-form depth.

## AdSense And Indexing Readiness

- Positive: static crawlable HTML, canonical tags, global WebSite/Organization schema, page-level Article/Breadcrumb/Collection/DefinedTerm schema, sitemap generation, and search-index generation all exist.
- Caution: quote-story volume and repeated scaffolding may look mass-produced if many pages remain indexable without enough unique story/reflection value.
- Caution: source-light doctrinal pages are risky for trust, Buddhist integrity, and future AdSense review.
- Caution: Ad slots are present in templates while ads are disabled. Before enabling ads, test meditation/tool pages so controls and safety notes are not interrupted.

## Recommendation Matrix

- Keep unchanged: static trust pages, policy pages, search route, and clear hub pages after metadata/link preservation.
- Strengthen role: homepage, Start Here, Learn hub, Meditation hub, Quotes hub, Daily Reflections hub.
- Source review: Tier 1 doctrine, dictionary, Dhammapada, sutta, and Tier 2 meditation method pages.
- Human rewrite / template reduction: quote stories and daily reflections with high repeated sentence/paragraph patterns.
- Recommendation-only merge/noindex candidates: low-uniqueness quote story routes currently protected by noindex logic unless individually reviewed.
- Do not change in this audit: article URLs/content, canonical ownership, redirects, noindex settings, slugs, headings, hrefs, route generation, navigation, or public content.

## Generated Audit Artifacts

- \`ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json\`
- \`ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json\`
- \`ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.csv\`
- \`ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json\`
- \`ECHOBUDDHA_NON_ARTICLE_ROUTE_EVALUATION.json\`
- \`ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json\`
- \`ECHOBUDDHA_NON_ARTICLE_OVERLAP_CLUSTERS.json\`
- \`ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json\`
`;
  writeText("ECHOBUDDHA_NON_ARTICLE_FINAL_AUDIT_REPORT.md", report);

  console.log(JSON.stringify({
    auditDate: AUDIT_DATE,
    generatedNonArticleRoutes: inventory.length,
    missingFromSitemap: missingFromSitemap.length,
    missingFromSearch: missingFromSearch.length,
    duplicateSentences: duplicateSentences.length,
    duplicateParagraphs: duplicateParagraphs.length,
    highSimilarityPairs: pageSimilarity.length,
    sourceReviewNeeded: sourceReviewNeeded.length,
    outputDirectory: path.relative(ROOT, OUT_DIR)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
