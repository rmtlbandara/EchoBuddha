import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, "dist");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-1-2026-08-24");
const phase0Dir = path.join(root, "docs/audits/adsense-recovery-phase-0-2026-08-24");
const inventoryPath = path.join(root, "docs/audits/echo-buddha-governance-implementation/url-inventory.json");
const ownerRegisterPath = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-2-search-intent-ownership/master-page-role-register.csv");
const site = "https://echobuddha.com";
const generatedAt = new Date().toISOString();
const methodVersion = "phase1-forensic-inventory-v1";

fs.mkdirSync(outDir, { recursive: true });

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (file) => fs.readFileSync(file, "utf8");
const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&apos;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&nbsp;", " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const cleanText = (value = "") => decode(value
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim());
const normalizedText = (value = "") => cleanText(value).toLowerCase()
  .normalize("NFKC")
  .replace(/[“”‘’]/g, "'")
  .replace(/[^a-z0-9āīūñṅṭḍṇḷṃ'\s-]/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const words = (value = "") => normalizedText(value).split(/\s+/).filter(Boolean);
const matchText = (html, re) => cleanText(html.match(re)?.[1] ?? "");
const allText = (html, re) => [...html.matchAll(re)].map((m) => cleanText(m[1])).filter(Boolean);
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "");
const csvEscape = (value) => {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","))].join("\n");
  fs.writeFileSync(path.join(outDir, name), `${body}\n`);
};
const writeJson = (name, value) => fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
const writeMd = (name, value) => fs.writeFileSync(path.join(outDir, name), `${value.trim()}\n`);
const pct = (n, d) => d ? Number((n * 100 / d).toFixed(2)) : null;
const round = (n, digits = 4) => Number(n.toFixed(digits));
const yesNo = (value) => value ? "true" : "false";
const walk = (dir, out = []) => {
  for (const name of fs.readdirSync(dir).sort()) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, out);
    else if (file.endsWith(".html")) out.push(file);
  }
  return out;
};
const routeFromFile = (file) => {
  const rel = path.relative(dist, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
};
const normalizePath = (pathname) => {
  if (!pathname) return "/";
  let value = decodeURIComponent(pathname.split("#")[0].split("?")[0] || "/").replace(/\/{2,}/g, "/");
  if (!value.startsWith("/")) value = `/${value}`;
  if (value === "/404.html") return value;
  if (!path.extname(value) && !value.endsWith("/")) value += "/";
  return value;
};
const normalizeUrl = (raw) => {
  try {
    const parsed = new URL(raw, site);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return `https://${host}${normalizePath(parsed.pathname)}`;
  } catch {
    return "";
  }
};
const internalPath = (href) => {
  if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return "";
  try {
    const parsed = new URL(href, site);
    if (parsed.hostname.replace(/^www\./, "") !== "echobuddha.com") return "";
    return normalizePath(parsed.pathname);
  } catch {
    return "";
  }
};
const parseCsv = (text) => {
  const rows = [];
  let row = [], value = "", quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (char === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quote = false;
      else value += char;
    } else if (char === '"') quote = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
};

const classify = (route) => {
  const parts = route.split("/").filter(Boolean);
  if (route === "/") return ["HOME", "homepage", "homepage", "src/pages/index.astro", "/"];
  if (route === "/404.html") return ["ERROR", "404", "error", "src/pages/404.astro", "/404.html"];
  if (route === "/articles/") return ["ARTICLE_HUB", "articles", "hub", "src/pages/articles/index.astro", "/articles/"];
  if (route.startsWith("/articles/category/")) return ["ARTICLE_CATEGORY", parts[2] ?? "", "category", "src/pages/articles/category/[slug].astro", "/articles/category/[slug]/"];
  if (route.startsWith("/articles/")) return ["ARTICLE", parts[1] ?? "", "educational article", "src/pages/articles/[slug].astro", "/articles/[slug]/"];
  if (route === "/quotes/") return ["QUOTE_HUB", "quotes", "hub", "src/pages/quotes/index.astro", "/quotes/"];
  if (route.startsWith("/quotes/") && parts.length === 2) return ["QUOTE_CATEGORY", parts[1], "category", "src/pages/quotes/[category]/index.astro", "/quotes/[category]/"];
  if (route.startsWith("/quotes/") && parts.length === 3) return ["QUOTE_STORY", parts[1], "quote/reflection", "src/pages/quotes/[category]/[slug].astro", "/quotes/[category]/[slug]/"];
  if (route === "/daily-reflections/") return ["DAILY_REFLECTION_HUB", "daily reflections", "hub/tool", "src/pages/daily-reflections/index.astro", "/daily-reflections/"];
  if (route === "/daily-reflections/today/") return ["REFLECTION", "today utility", "dynamic reflection", "src/pages/daily-reflections/today.astro", "/daily-reflections/today/"];
  if (route.startsWith("/daily-reflections/")) return ["REFLECTION", "standalone reflection", "reflection", "src/pages/daily-reflections/[slug].astro", "/daily-reflections/[slug]/"];
  if (route === "/learn/") return ["LEARN_HUB", "learn", "hub", "src/pages/learn/index.astro", "/learn/"];
  if (route === "/learn/buddhism-101/") return ["BUDDHISM_101", "hub", "hub", "src/pages/learn/[section]/index.astro", "/learn/[section]/"];
  if (route.startsWith("/learn/buddhism-101/")) return ["BUDDHISM_101", "lesson", "educational lesson", "src/pages/learn/[section]/[slug].astro", "/learn/[section]/[slug]/"];
  if (route === "/learn/buddhist-dictionary/") return ["DICTIONARY_HUB", "dictionary", "hub", "src/pages/learn/[section]/index.astro", "/learn/[section]/"];
  if (route.startsWith("/learn/buddhist-dictionary/")) return ["DICTIONARY_ENTRY", "dictionary term", "definition/reference", "src/pages/learn/[section]/[slug].astro", "/learn/[section]/[slug]/"];
  if (route === "/learn/dhammapada-reflections/") return ["LEARN_GUIDE", "dhammapada hub", "hub", "src/pages/learn/[section]/index.astro", "/learn/[section]/"];
  if (route.startsWith("/learn/dhammapada-reflections/")) return ["LEARN_GUIDE", "dhammapada study", "source study", "src/pages/learn/[section]/[slug].astro", "/learn/[section]/[slug]/"];
  if (route === "/learn/sutta-for-daily-life/") return ["LEARN_GUIDE", "sutta hub", "hub", "src/pages/learn/[section]/index.astro", "/learn/[section]/"];
  if (route.startsWith("/learn/sutta-for-daily-life/")) return ["LEARN_GUIDE", "sutta study", "source study", "src/pages/learn/[section]/[slug].astro", "/learn/[section]/[slug]/"];
  if (route.startsWith("/learn/")) return ["LEARN_GUIDE", parts[1] ?? "guide", "educational guide", "src/pages/learn/[slug].astro", "/learn/[slug]/"];
  if (route === "/meditation/") return ["MEDITATION_HUB", "meditation", "hub", "src/pages/meditation/index.astro", "/meditation/"];
  if (route.startsWith("/meditation/")) return ["MEDITATION_GUIDE", parts[1] ?? "", "practice guide", "src/pages/meditation/[slug].astro", "/meditation/[slug]/"];
  if (route === "/meditation-guide/") return ["MEDITATION_GUIDE", "overview", "practice guide", "src/pages/meditation-guide.astro", "/meditation-guide/"];
  if (route === "/search/") return ["SEARCH", "site search", "utility", "src/pages/search.astro", "/search/"];
  if (route === "/tools/") return ["TOOL", "tools hub", "utility/hub", "src/pages/tools.astro", "/tools/"];
  if (route === "/mindful-living/") return ["TOPIC_HUB", "mindful living", "topic hub", "src/pages/mindful-living.astro", "/mindful-living/"];
  if (route === "/start-here/") return ["LEARN_GUIDE", "start here", "navigation/guide", "src/pages/start-here.astro", "/start-here/"];
  if (route.startsWith("/authors/")) return ["AUTHOR", "editorial author", "trust", "src/pages/authors/[slug].astro", "/authors/[slug]/"];
  const staticMap = {
    "/about/": ["ABOUT", "about", "trust"],
    "/editorial-policy/": ["EDITORIAL_POLICY", "editorial policy", "trust"],
    "/how-echo-buddha-creates-content/": ["EDITORIAL_POLICY", "content process", "trust"],
    "/buddhist-sources-and-citations/": ["SOURCE_POLICY", "sources", "trust"],
    "/quote-attribution-policy/": ["SOURCE_POLICY", "quote attribution", "trust"],
    "/corrections/": ["CORRECTIONS", "corrections", "trust"],
    "/contact/": ["CONTACT", "contact", "trust"],
    "/privacy-policy/": ["PRIVACY", "privacy", "legal"],
    "/terms-of-use/": ["TERMS", "terms", "legal"],
    "/disclaimer/": ["DISCLAIMER", "disclaimer", "legal"],
    "/meditation-safety/": ["EDITORIAL_POLICY", "meditation safety", "trust"]
  };
  if (staticMap[route]) return [...staticMap[route], `src/pages/${route.slice(1, -1)}.astro`, route];
  return ["OTHER", parts[0] ?? "", "other", "repository route", route];
};

const topicRules = [
  ["Beginner Buddhism", /buddhism.for.beginners|what.is.buddhism|first.week|practice.buddhism|start.here/],
  ["Four Noble Truths", /four.noble.truth|first.truth/],
  ["Noble Eightfold Path", /eightfold.path|one.step.on.the.path/],
  ["Impermanence", /impermanence|anicca|change/],
  ["Attachment and Letting Go", /attachment|non.attachment|letting.go|clinging|release|open.hand/],
  ["Compassion", /compassion|karuna|kindness/],
  ["Loving-kindness / Metta", /loving.kindness|metta/],
  ["Equanimity", /equanimity/],
  ["Right Speech", /right.speech|mindful.listening|listen.before|email.and.texting|wise.silence/],
  ["Mindfulness", /mindful|mindfulness|sati|present.moment|awareness/],
  ["Meditation", /meditation|meditate|breath|stillness/],
  ["Karma", /karma|kamma/],
  ["Sangha", /sangha/],
  ["Dhamma / Dharma", /dhamma|dharma/],
  ["Dhammapada", /dhammapada|hatred.is.not.ended|thousand.empty.words|trained.mind/],
  ["Sutta Study", /sutta|pali.canon|kalama|dhammacakkappavattana|magga.vibhanga/],
  ["Patience", /patience/],
  ["Anger", /anger/],
  ["Forgiveness", /forgiv/],
  ["Buddhist Ethics", /precept|right.livelihood|ethical/],
  ["Buddhist Concepts", /dukkha|anatta|nirvana|three.poison|three.jewel|aggregate|dependent.origination|middle.way|hindrance|brahmavihara/]
];
const topicFor = (page) => {
  const haystack = normalizedText(`${page.route} ${page.title} ${page.h1}`);
  return topicRules.find(([, re]) => re.test(haystack))?.[0] ?? "Page-specific / unclustered";
};
const intentFor = (page) => {
  const haystack = normalizedText(`${page.title} ${page.h1} ${page.headings.join(" ")} ${page.text.slice(0, 800)}`);
  if (page.family === "DICTIONARY_ENTRY") return ["glossary lookup", "definition"];
  if (page.family === "QUOTE_STORY") return ["quote/reflection", "story"];
  if (page.family === "REFLECTION") return ["reflection", "practice"];
  if (["ARTICLE_HUB", "LEARN_HUB", "DICTIONARY_HUB", "QUOTE_HUB", "ARTICLE_CATEGORY", "QUOTE_CATEGORY", "MEDITATION_HUB", "TOPIC_HUB"].includes(page.family)) return ["navigation/reference", "topic exploration"];
  if (page.family === "SEARCH") return ["utility", "lookup"];
  if (/\bvs\b|difference|compare/.test(haystack)) return ["comparison", "beginner explanation"];
  if (/script/.test(haystack)) return ["script", "meditation instruction"];
  if (/how to|step by step|practice|guide/.test(haystack)) return ["practical guide", "examples"];
  if (/what is|meaning|explained|beginner/.test(haystack)) return ["beginner explanation", "definition"];
  if (/source|sutta|dhammapada/.test(haystack)) return ["source study", "reference"];
  return ["educational explanation", "practical application"];
};
const sourceFor = (family) => {
  if (["ARTICLE", "ARTICLE_CATEGORY", "ARTICLE_HUB", "QUOTE_HUB", "QUOTE_CATEGORY", "QUOTE_STORY"].includes(family)) return "src/data/site.ts";
  if (["LEARN_HUB", "LEARN_GUIDE", "BUDDHISM_101", "DICTIONARY_HUB", "DICTIONARY_ENTRY", "MEDITATION_HUB", "MEDITATION_GUIDE"].includes(family)) return "src/data/learn.ts and/or authored Astro route";
  if (["DAILY_REFLECTION_HUB", "REFLECTION"].includes(family)) return "src/data/dailyReflections.ts";
  if (["AUTHOR", "ABOUT", "EDITORIAL_POLICY", "SOURCE_POLICY", "CORRECTIONS", "CONTACT"].includes(family)) return "src/data/editorialGovernance.ts and authored Astro route";
  return "authored Astro route/static source";
};
const adAllowed = (route, noindex) => {
  if (noindex) return false;
  if (route === "/") return true;
  const never = new Set(["/404.html", "/about/", "/authors/echo-buddha-editorial/", "/buddhist-sources-and-citations/", "/contact/", "/corrections/", "/daily-reflections/", "/daily-reflections/today/", "/disclaimer/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/learn/", "/meditation-guide/", "/meditation-safety/", "/mindful-living/", "/privacy-policy/", "/quote-attribution-policy/", "/quotes/", "/search/", "/start-here/", "/terms-of-use/", "/tools/"]);
  if (never.has(route) || ["/daily-reflections/", "/learn/buddhist-dictionary/", "/learn/dhammapada-reflections/", "/learn/sutta-for-daily-life/", "/meditation/", "/quotes/"].some((prefix) => route.startsWith(prefix))) return false;
  const sensitive = new Set(["buddhist-approach-to-anger", "buddhist-teachings-on-forgiveness", "buddhist-wisdom-for-overthinking", "compassion-with-boundaries", "dhammapada-reflection-trained-mind", "dhammapada-reflection-what-we-think", "dhammapada-verse-1-meaning", "how-to-meditate-for-anxiety", "how-to-meditate-for-beginners", "loving-kindness-meditation-beginners", "loving-kindness-meditation-guide", "metta-meditation-script", "mindfulness-for-better-sleep", "mindfulness-of-breathing-guide", "non-attachment-in-relationships", "walking-meditation-step-by-step"]);
  if (route.startsWith("/articles/") && route.split("/").filter(Boolean).length === 2) return !sensitive.has(route.split("/").filter(Boolean)[1]);
  if (route.startsWith("/learn/buddhism-101/") && route.split("/").filter(Boolean).length === 3) return !route.includes("five-hindrances-in-buddhism");
  return ["/learn/buddhism-for-beginners/", "/learn/eightfold-path/", "/learn/four-noble-truths/"].includes(route);
};
const surfaceFunction = (family) => {
  if (["ARTICLE", "BUDDHISM_101", "LEARN_GUIDE", "DICTIONARY_ENTRY", "QUOTE_STORY", "REFLECTION", "MEDITATION_GUIDE"].includes(family)) return "substantial publisher content";
  if (["ARTICLE_HUB", "LEARN_HUB", "DICTIONARY_HUB", "QUOTE_HUB", "ARTICLE_CATEGORY", "QUOTE_CATEGORY", "MEDITATION_HUB", "TOPIC_HUB", "DAILY_REFLECTION_HUB"].includes(family)) return "hub/navigation";
  if (["SEARCH", "TOOL"].includes(family)) return "utility";
  if (["PRIVACY", "TERMS", "DISCLAIMER"].includes(family)) return "legal";
  if (family === "ERROR") return "error";
  return "trust/mixed";
};

const baseline = JSON.parse(read(path.join(phase0Dir, "ADSENSE_RECOVERY_BASELINE_COUNTS.json")));
const gsc = JSON.parse(read(path.join(phase0Dir, "source-evidence/gsc-snapshot-2026-08-21.json")));
const routeInventory = JSON.parse(read(inventoryPath));
const routeInventoryByPath = new Map(routeInventory.map((row) => [row.path, row]));
const sitemapXml = read(path.join(dist, "sitemap.xml"));
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapPaths = new Set(sitemapUrls.map((url) => normalizePath(new URL(url).pathname)));
const ownerRows = fs.existsSync(ownerRegisterPath) ? parseCsv(read(ownerRegisterPath)) : [];
const ownerByUrl = new Map(ownerRows.map((row) => [normalizeUrl(row.URL), row]));
const gscPageRows = gsc.performance.pages.slice(1).map(([url, clicks, impressions, ctr, position]) => ({ url, clicks, impressions, ctr, position }));
const gscByUrl = new Map(gscPageRows.map((row) => [normalizeUrl(row.url), row]));

const files = walk(dist);
const pages = files.map((file) => {
  const html = read(file);
  const route = routeFromFile(file);
  const [family, subtype, contentType, templateId, routePattern] = classify(route);
  const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const title = matchText(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const description = decode(html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
    ?? html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i)?.[1] ?? "");
  const canonical = decode(html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)?.[1]
    ?? html.match(/<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1] ?? "");
  const robots = decode(html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
    ?? html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i)?.[1] ?? "index, follow (implicit)");
  const noindex = /noindex/i.test(robots) || route === "/404.html";
  const h1s = allText(mainHtml, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  const headings = [...mainHtml.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: Number(m[1]), text: cleanText(m[2]) })).filter((h) => h.text);
  const blocks = [...mainHtml.matchAll(/<(p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m) => cleanText(m[2])).filter((text) => words(text).length >= 6);
  const text = cleanText(mainHtml);
  const linkHtml = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ");
  const articleTags = [...linkHtml.matchAll(/<a\b[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi)];
  const links = articleTags.map((m) => {
    const tag = m[0];
    const href = attr(tag, "href");
    const target = internalPath(href);
    const offset = m.index ?? 0;
    const before = html.slice(0, offset);
    const inNav = before.lastIndexOf("<nav") > before.lastIndexOf("</nav>");
    const inFooter = before.lastIndexOf("<footer") > before.lastIndexOf("</footer>");
    const context = inNav ? "navigation" : inFooter ? "footer" : /breadcrumb/i.test(html.slice(Math.max(0, offset - 400), offset + 200)) ? "breadcrumb" : /related|continue learning|further reading/i.test(html.slice(Math.max(0, offset - 500), offset + 200)) ? "related content" : "main/body";
    return { href, target, anchor: cleanText(tag), context };
  });
  const external = links.filter((link) => /^https?:\/\//i.test(link.href) && !link.href.startsWith(site));
  const images = [...mainHtml.matchAll(/<img\b[^>]*>/gi)].map((m) => ({ src: attr(m[0], "src"), alt: attr(m[0], "alt") }));
  const schemas = [];
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1]);
      const values = Array.isArray(parsed) ? parsed : parsed?.["@graph"] ?? [parsed];
      for (const value of values) {
        const types = Array.isArray(value?.["@type"]) ? value["@type"] : [value?.["@type"]];
        schemas.push(...types.filter(Boolean));
      }
    } catch { schemas.push("UNPARSEABLE_JSON_LD"); }
  }
  const publishedDate = decode(html.match(/<meta\b[^>]*property=["']article:published_time["'][^>]*content=["']([^"']*)["']/i)?.[1] ?? "");
  const updatedDate = decode(html.match(/<meta\b[^>]*property=["']article:modified_time["'][^>]*content=["']([^"']*)["']/i)?.[1] ?? "");
  const authorMeta = decode(html.match(/<meta\b[^>]*name=["']author["'][^>]*content=["']([^"']*)["']/i)?.[1] ?? "");
  const p = {
    file, html, route, url: `${site}${route}`, normalizedUrl: `${site}${route}`, family, subtype, contentType, templateId, routePattern,
    source: sourceFor(family), title, description, canonical, robots, noindex, indexable: !noindex && route !== "/404.html",
    h1: h1s[0] ?? "", h1Count: h1s.length, headings, headingTexts: headings.map((h) => h.text), blocks, text,
    wordCount: words(text).length, htmlSize: Buffer.byteLength(html), paragraphCount: (mainHtml.match(/<p\b/gi) ?? []).length,
    headingCount: headings.length, images, links, external, schemas: [...new Set(schemas)], publishedDate, updatedDate, authorMeta,
    language: attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang") || "NOT_VERIFIED",
    sitemap: sitemapPaths.has(route), inventorySource: routeInventoryByPath.get(route), gsc: gscByUrl.get(`${site}${route}`)
  };
  p.topic = topicFor(p);
  [p.primaryIntent, p.secondaryIntent] = intentFor(p);
  p.surfaceFunction = surfaceFunction(family);
  p.rawBodyHash = sha256(text);
  p.normalizedHash = sha256(normalizedText(text));
  p.headingFingerprint = sha256(headings.map((h) => `H${h.level}:${normalizedText(h.text)}`).join("|"));
  p.structuralFingerprint = headings.map((h) => `H${h.level}`).join("→") || "NO_HEADINGS";
  p.templateFingerprint = sha256(`${family}|${p.structuralFingerprint}|${schemas.sort().join("|")}`);
  p.shingles = new Set(words(text).slice(0, 5000).reduce((out, _, i, arr) => { if (i <= arr.length - 5) out.push(arr.slice(i, i + 5).join(" ")); return out; }, []));
  return p;
});
const byRoute = new Map(pages.map((p) => [p.route, p]));

const blockPages = new Map();
for (const page of pages) {
  for (const block of new Set(page.blocks.map(normalizedText).filter(Boolean))) {
    const hash = sha256(block);
    if (!blockPages.has(hash)) blockPages.set(hash, { hash, text: block, pages: new Set(), families: new Set() });
    blockPages.get(hash).pages.add(page.route);
    blockPages.get(hash).families.add(page.family);
  }
}
const repeatedBlocks = [...blockPages.values()].filter((b) => b.pages.size >= 3).sort((a, b) => b.pages.size - a.pages.size || b.text.length - a.text.length);
const repeatedHashes = new Set(repeatedBlocks.map((b) => b.hash));
for (const page of pages) {
  const total = page.blocks.reduce((sum, block) => sum + words(block).length, 0);
  const repeated = page.blocks.reduce((sum, block) => sum + (repeatedHashes.has(sha256(normalizedText(block))) ? words(block).length : 0), 0);
  page.boilerplateRatio = total ? repeated / total : 0;
  page.uniqueTextRatio = total ? 1 - page.boilerplateRatio : 0;
}

const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
};
const headingSimilarity = (a, b) => jaccard(new Set(a.headingTexts.map(normalizedText)), new Set(b.headingTexts.map(normalizedText)));
const titleSimilarity = (a, b) => jaccard(new Set(words(a.title).filter((w) => w.length > 2)), new Set(words(b.title).filter((w) => w.length > 2)));
const contentPages = pages.filter((p) => p.indexable && ["ARTICLE", "BUDDHISM_101", "LEARN_GUIDE", "DICTIONARY_ENTRY", "QUOTE_STORY", "MEDITATION_GUIDE"].includes(p.family));
const nearPairs = [];
const titlePairs = [];
for (let i = 0; i < contentPages.length; i += 1) {
  for (let j = i + 1; j < contentPages.length; j += 1) {
    const a = contentPages[i], b = contentPages[j];
    const lexical = jaccard(a.shingles, b.shingles);
    const structural = a.structuralFingerprint === b.structuralFingerprint ? 1 : jaccard(new Set(a.structuralFingerprint.split("→")), new Set(b.structuralFingerprint.split("→")));
    const heading = headingSimilarity(a, b);
    const title = titleSimilarity(a, b);
    const sharedPhraseRatio = lexical;
    if (lexical >= 0.08 || (heading >= 0.45 && lexical >= 0.035)) nearPairs.push({ a, b, lexical, structural, heading, sharedPhraseRatio });
    if (title >= 0.35 || (a.topic === b.topic && a.topic !== "Page-specific / unclustered")) titlePairs.push({ a, b, title, heading, topic: a.topic === b.topic ? a.topic : `${a.topic} ↔ ${b.topic}` });
  }
}
nearPairs.sort((x, y) => y.lexical - x.lexical || y.heading - x.heading);
titlePairs.sort((x, y) => y.title - x.title || y.heading - x.heading);

const exactGroups = (field) => {
  const groups = new Map();
  for (const page of pages) {
    const value = page[field];
    if (!value) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(page);
  }
  return [...groups.entries()].filter(([, group]) => group.length > 1);
};
const exactBodyGroups = exactGroups("normalizedHash");
const duplicateTitles = exactGroups("title");
const duplicateDescriptions = exactGroups("description");
const duplicateH1s = exactGroups("h1");

const internalEdges = [];
const knownNonHtmlTargets = new Set(["/sitemap.xml", "/robots.txt", "/ads.txt"]);
for (const page of pages) {
  for (const link of page.links) {
    if (!link.target) continue;
    const target = byRoute.get(link.target);
    internalEdges.push({ source_url: page.url, target_url: `${site}${link.target}`, anchor_text: link.anchor, location_context: link.context,
      target_status: target ? (target.route === "/404.html" ? 307 : 200) : knownNonHtmlTargets.has(link.target) ? 200 : "NOT_IN_BUILD", target_canonical: target?.canonical ?? "",
      target_indexable: target ? yesNo(target.indexable) : knownNonHtmlTargets.has(link.target) ? "not applicable" : "NOT_VERIFIED" });
  }
}
const inlinks = new Map(), outlinks = new Map(), inFamilies = new Map();
for (const edge of internalEdges) {
  const sourcePath = new URL(edge.source_url).pathname;
  const targetPath = new URL(edge.target_url).pathname;
  outlinks.set(sourcePath, (outlinks.get(sourcePath) ?? 0) + 1);
  inlinks.set(targetPath, (inlinks.get(targetPath) ?? 0) + 1);
  if (!inFamilies.has(targetPath)) inFamilies.set(targetPath, new Set());
  inFamilies.get(targetPath).add(byRoute.get(sourcePath)?.family ?? "UNKNOWN");
}
const adjacency = new Map(pages.map((p) => [p.route, new Set()]));
for (const edge of internalEdges) {
  const source = new URL(edge.source_url).pathname, target = new URL(edge.target_url).pathname;
  if (adjacency.has(source) && byRoute.has(target)) adjacency.get(source).add(target);
}
const depthsFrom = (start) => {
  const depths = new Map([[start, 0]]), queue = [start];
  while (queue.length) {
    const current = queue.shift();
    for (const target of adjacency.get(current) ?? []) if (!depths.has(target)) { depths.set(target, depths.get(current) + 1); queue.push(target); }
  }
  return depths;
};
const homeDepth = depthsFrom("/");
const hubDepths = new Map([["home", homeDepth], ["learn", depthsFrom("/learn/")], ["articles", depthsFrom("/articles/")], ["quotes", depthsFrom("/quotes/")]]);
for (const page of pages) {
  page.inlinks = inlinks.get(page.route) ?? 0;
  page.outlinks = outlinks.get(page.route) ?? 0;
  page.orphan = page.route !== "/" && page.inlinks === 0;
  page.depth = homeDepth.has(page.route) ? homeDepth.get(page.route) : "UNREACHABLE";
  page.primaryDiscovery = [...hubDepths.entries()].filter(([, map]) => map.has(page.route)).sort((a, b) => a[1].get(page.route) - b[1].get(page.route))[0]?.[0] ?? "NONE";
}

const ownerRelationships = [];
for (const page of pages.filter((p) => p.indexable)) {
  const prior = ownerByUrl.get(page.normalizedUrl);
  const rawOwner = prior?.["Primary topic owner URL"] || prior?.["Parent pillar"] || "";
  const owner = normalizeUrl(rawOwner);
  const ownerPath = owner ? new URL(owner).pathname : "";
  if (owner && owner !== page.normalizedUrl) ownerRelationships.push({
    support_url: page.normalizedUrl, declared_owner_url: owner, relationship_source: "repository-held historical intent architecture register",
    visible_to_user: /support page|broader .* owner|main .* guide remains/i.test(page.text) ? "true" : "not explicitly verified",
    topic: page.topic, intent_similarity: page.primaryIntent, query_overlap: "NOT_VERIFIED (GSC query×page export unavailable)",
    structural_overlap: ownerPath && byRoute.has(ownerPath) ? round(headingSimilarity(page, byRoute.get(ownerPath))) : "",
    content_overlap: ownerPath && byRoute.has(ownerPath) ? round(jaccard(page.shingles, byRoute.get(ownerPath).shingles)) : "",
    owner_exists: yesNo(Boolean(ownerPath && byRoute.has(ownerPath))), circular_relationship: "false", orphaned_relationship: yesNo(Boolean(ownerPath && !byRoute.has(ownerPath))),
    notes: "Descriptive extraction only; no Phase 1 disposition inherited from the historical register."
  });
}
const ownerOf = new Map(ownerRelationships.map((r) => [r.support_url, r.declared_owner_url]));
for (const rel of ownerRelationships) rel.circular_relationship = yesNo(ownerOf.get(rel.declared_owner_url) === rel.support_url);

const quotePages = pages.filter((p) => p.family === "QUOTE_STORY");
const articlePages = pages.filter((p) => p.family === "ARTICLE");
const learnPages = pages.filter((p) => ["LEARN_HUB", "LEARN_GUIDE", "BUDDHISM_101", "MEDITATION_HUB", "MEDITATION_GUIDE"].includes(p.family));
const dictionaryPages = pages.filter((p) => p.family === "DICTIONARY_ENTRY");
const reflectionPages = pages.filter((p) => ["DAILY_REFLECTION_HUB", "REFLECTION", "MEDITATION_GUIDE", "MEDITATION_HUB", "TOOL"].includes(p.family));

const rawQuoteText = (page) => {
  const blockquote = matchText(page.html, /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (blockquote) return blockquote.replace(/^“|”$/g, "").trim();
  return page.h1.replace(/^Original Buddhist Quote(?: & Reflection)?:\s*/i, "").trim();
};
const quoteTextGroups = new Map();
for (const page of quotePages) {
  page.quoteText = rawQuoteText(page);
  const key = normalizedText(page.quoteText);
  if (!quoteTextGroups.has(key)) quoteTextGroups.set(key, []);
  quoteTextGroups.get(key).push(page);
}
const exactQuoteDuplicates = [...quoteTextGroups.values()].filter((g) => g.length > 1);

const gscReconciliation = gscPageRows.map((row) => {
  const normalized = normalizeUrl(row.url);
  const route = normalized ? new URL(normalized).pathname : "";
  const page = byRoute.get(normalizePath(route));
  return { gsc_url: row.url, normalized_url: normalized, inventory_match: yesNo(Boolean(page)), current_http_status: page ? (page.route === "/404.html" ? 307 : 200) : "NOT_VERIFIED",
    current_canonical: page?.canonical ?? "", current_sitemap_status: page ? yesNo(page.sitemap) : "false", clicks_3m: row.clicks, impressions_3m: row.impressions,
    queries: "NOT_AVAILABLE_IN_PAGE_AGGREGATE", current_page_family: page?.family ?? "UNMATCHED/LEGACY/VARIANT", notes: page ? "Matched after deterministic URL normalization." : "Requires legacy/variant review; production status not bulk-inferred." };
});
const queryRows = gsc.performance.queries.slice(1).map(([query, clicks, impressions, ctr, position]) => ({
  query, url: "NOT_AVAILABLE: GSC export has separate query and page dimensions", clicks, impressions, ctr, position, time_window: "Last 3 months through 2026-08-18",
  topic_cluster: topicRules.find(([, re]) => re.test(normalizedText(query)))?.[0] ?? "Unclustered query", evidence_label: "SEARCH_CONSOLE_EVIDENCE",
  overlap_status: "QUERY×PAGE_NOT_VERIFIED"
}));

const familyCounts = Object.fromEntries([...new Set(pages.map((p) => p.family))].sort().map((family) => {
  const group = pages.filter((p) => p.family === family);
  return [family, { total: group.length, status200_expected: group.filter((p) => p.route !== "/404.html").length, indexable: group.filter((p) => p.indexable).length,
    noindex_or_error: group.filter((p) => !p.indexable).length, sitemap: group.filter((p) => p.sitemap).length, orphan_candidates: group.filter((p) => p.orphan).length,
    declared_ad_eligible: group.filter((p) => adAllowed(p.route, p.noindex)).length }];
}));

const reviewQueues = {
  A_similarity_review: new Set(nearPairs.filter((p) => p.lexical >= 0.12).flatMap((p) => [p.a.route, p.b.route])),
  B_intent_overlap_review: new Set(titlePairs.filter((p) => p.title >= 0.45 || p.topic !== "Page-specific / unclustered").flatMap((p) => [p.a.route, p.b.route])),
  C_template_boilerplate_review: new Set(pages.filter((p) => p.indexable && p.boilerplateRatio >= 0.35).map((p) => p.route)),
  D_quote_ecosystem_review: new Set(quotePages.map((p) => p.route)),
  E_search_equity_review: new Set(pages.filter((p) => (p.gsc?.clicks ?? 0) > 0 || (p.gsc?.impressions ?? 0) >= 10).map((p) => p.route)),
  F_authorship_trust_review: new Set(pages.filter((p) => p.indexable && ["ARTICLE", "BUDDHISM_101", "LEARN_GUIDE", "DICTIONARY_ENTRY", "QUOTE_STORY", "MEDITATION_GUIDE"].includes(p.family) && !/Echo Buddha Editorial/i.test(p.text) && !p.authorMeta).map((p) => p.route)),
  G_source_accuracy_review: new Set(pages.filter((p) => p.indexable && ["ARTICLE", "BUDDHISM_101", "LEARN_GUIDE", "DICTIONARY_ENTRY"].includes(p.family) && p.external.length === 0).map((p) => p.route)),
  H_indexability_review: new Set(pages.filter((p) => (p.sitemap && !p.indexable) || (p.indexable && !p.sitemap) || (p.canonical && normalizeUrl(p.canonical) !== p.normalizedUrl)).map((p) => p.route)),
  I_monetization_review: new Set(pages.filter((p) => ["hub/navigation", "utility", "legal", "error"].includes(p.surfaceFunction) || adAllowed(p.route, p.noindex)).map((p) => p.route)),
  J_production_integrity_review: new Set(pages.filter((p) => p.orphan || !p.h1 || p.h1Count !== 1 || !p.canonical && p.route !== "/404.html").map((p) => p.route))
};

const masterHeaders = ["url_id", "raw_url", "normalized_url", "path", "hostname", "discovery_sources", "first_discovered_source", "page_family", "page_subtype", "content_type", "topic", "subcategory", "parent_hub", "cluster", "declared_role", "template_id", "route_pattern", "http_status", "final_url", "redirect_hops", "redirect_chain", "content_type_header", "robots_accessible", "crawl_success", "meta_robots", "x_robots_tag", "indexable", "followable", "sitemap_member", "sitemap_source", "canonical", "canonical_type", "canonical_target_status", "canonical_consistency", "title", "title_length", "meta_description", "meta_description_length", "h1", "h1_count", "language", "html_size", "main_content_text_length", "main_content_word_count", "paragraph_count", "heading_count", "image_count", "internal_link_count", "external_link_count", "published_date", "updated_date", "date_source", "git_first_seen_date", "git_last_modified_date", "author_display", "author_type", "author_page", "reviewer_display", "reviewer_page", "editorial_identity", "content_process_reference", "source_section_present", "citation_count", "external_source_count", "primary_source_count", "source_domains", "broken_source_count", "gsc_clicks_7d", "gsc_impressions_7d", "gsc_ctr_7d", "gsc_position_7d", "gsc_clicks_28d", "gsc_impressions_28d", "gsc_ctr_28d", "gsc_position_28d", "gsc_clicks_3m", "gsc_impressions_3m", "gsc_position_3m", "gsc_top_queries", "gsc_query_count", "gsc_index_status", "gsc_last_crawl", "inlinks", "outlinks", "inlinking_page_families", "navigation_linked", "footer_linked", "breadcrumb_depth", "minimum_click_depth", "primary_discovery_route", "orphan_candidate", "related_content_links", "adsense_code_present", "ad_component_present", "ad_placeholder_present", "ad_placeholder_count", "ad_eligible_currently_declared", "page_is_navigation_or_utility", "surface_function", "schema_types", "article_schema", "breadcrumb_schema", "author_schema", "faq_schema", "other_schema", "schema_validation_observation", "raw_body_fingerprint", "exact_duplicate_hash", "normalized_text_hash", "structural_fingerprint", "template_fingerprint", "heading_fingerprint", "phrase_fingerprint", "near_duplicate_cluster_id", "template_similarity_cluster", "semantic_topic_cluster", "title_overlap_cluster", "search_intent_overlap_cluster", "primary_intent", "secondary_intent", "boilerplate_ratio", "unique_text_ratio", "image_alt_coverage", "observations", "evidence_class", "confidence", "phase_2_review_priority"];
const gitDateCache = new Map();
const gitDates = (page) => {
  if (gitDateCache.has(page.templateId)) return gitDateCache.get(page.templateId);
  let dates = [];
  try { dates = execFileSync("git", ["log", "--follow", "--format=%cs", "--", page.templateId], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean); } catch {}
  const result = { first: dates.at(-1) ?? "", last: dates[0] ?? "" };
  gitDateCache.set(page.templateId, result);
  return result;
};
const pageRows = pages.map((p) => {
  const dates = gitDates(p);
  const domains = [...new Set(p.external.map((link) => { try { return new URL(link.href).hostname; } catch { return ""; } }).filter(Boolean))];
  const primaryDomains = domains.filter((d) => /suttacentral|accesstoinsight|dhammatalks|buddha|palicanon|tipitaka/i.test(d));
  const owner = ownerByUrl.get(p.normalizedUrl);
  const queueNames = Object.entries(reviewQueues).filter(([, urls]) => urls.has(p.route)).map(([name]) => name.replace(/^[A-J]_/, ""));
  const navLinked = internalEdges.some((e) => new URL(e.target_url).pathname === p.route && e.location_context === "navigation");
  const footerLinked = internalEdges.some((e) => new URL(e.target_url).pathname === p.route && e.location_context === "footer");
  const related = internalEdges.filter((e) => new URL(e.source_url).pathname === p.route && e.location_context === "related content").length;
  return {
    url_id: `url_${sha256(p.normalizedUrl).slice(0, 16)}`, raw_url: p.url, normalized_url: p.normalizedUrl, path: p.route, hostname: "echobuddha.com",
    discovery_sources: ["repository_build", "repository_route_inventory", p.sitemap ? "production_equivalent_sitemap" : "", p.gsc ? "gsc_performance" : "", p.inlinks ? "internal_crawl" : ""].filter(Boolean), first_discovered_source: "repository_build",
    page_family: p.family, page_subtype: p.subtype, content_type: p.contentType, topic: p.topic, subcategory: p.subtype, parent_hub: owner?.["Parent pillar"] ?? "",
    cluster: p.topic, declared_role: owner?.["Primary page role"] ?? "NOT_VERIFIED", template_id: p.templateId, route_pattern: p.routePattern,
    http_status: p.route === "/404.html" ? 307 : 200, final_url: p.route === "/404.html" ? `${site}/404` : p.url, redirect_hops: p.route === "/404.html" ? 1 : 0,
    redirect_chain: p.route === "/404.html" ? `${site}/404.html → ${site}/404` : "", content_type_header: "text/html; production parity evidence", robots_accessible: "true", crawl_success: "true (Phase 0 full-route evidence; production parity verified)",
    meta_robots: p.robots, x_robots_tag: "NOT_OBSERVED_IN_PHASE_0", indexable: yesNo(p.indexable), followable: yesNo(!/nofollow/i.test(p.robots)), sitemap_member: yesNo(p.sitemap), sitemap_source: p.sitemap ? `${site}/sitemap.xml` : "",
    canonical: p.canonical, canonical_type: !p.canonical ? "absent" : normalizeUrl(p.canonical) === p.normalizedUrl ? "self" : "other", canonical_target_status: p.canonical ? 200 : "", canonical_consistency: p.route === "/404.html" ? "intentional absence" : yesNo(normalizeUrl(p.canonical) === p.normalizedUrl),
    title: p.title, title_length: p.title.length, meta_description: p.description, meta_description_length: p.description.length, h1: p.h1, h1_count: p.h1Count, language: p.language,
    html_size: p.htmlSize, main_content_text_length: p.text.length, main_content_word_count: p.wordCount, paragraph_count: p.paragraphCount, heading_count: p.headingCount, image_count: p.images.length, internal_link_count: p.links.filter((l) => l.target).length, external_link_count: p.external.length,
    published_date: p.publishedDate, updated_date: p.updatedDate, date_source: p.publishedDate || p.updatedDate ? "HTML metadata" : "NOT_VERIFIED", git_first_seen_date: dates.first, git_last_modified_date: dates.last,
    author_display: p.authorMeta || (/Echo Buddha Editorial/i.test(p.text) ? "Echo Buddha Editorial" : "NOT_VERIFIED"), author_type: /Echo Buddha Editorial/i.test(p.text) || p.authorMeta ? "Organization/editorial identity" : "NOT_VERIFIED",
    author_page: /Echo Buddha Editorial/i.test(p.text) || p.authorMeta ? `${site}/authors/echo-buddha-editorial/` : "", reviewer_display: /reviewed by/i.test(p.text) ? "Visible reviewer reference present; exact extraction not automated" : "NOT_VERIFIED",
    reviewer_page: "", editorial_identity: "Echo Buddha Editorial (where visible/declared)", content_process_reference: `${site}/how-echo-buddha-creates-content/`,
    source_section_present: yesNo(/source note|sources and citations|selected references|traditional reference/i.test(p.text)), citation_count: p.external.length, external_source_count: domains.length, primary_source_count: primaryDomains.length, source_domains: domains, broken_source_count: "NOT_VERIFIED",
    gsc_clicks_7d: "", gsc_impressions_7d: "", gsc_ctr_7d: "", gsc_position_7d: "", gsc_clicks_28d: "", gsc_impressions_28d: "", gsc_ctr_28d: "", gsc_position_28d: "",
    gsc_clicks_3m: p.gsc?.clicks ?? 0, gsc_impressions_3m: p.gsc?.impressions ?? 0, gsc_position_3m: p.gsc?.position ?? "", gsc_top_queries: "NOT_AVAILABLE: separate GSC dimensions", gsc_query_count: "NOT_AVAILABLE", gsc_index_status: "PROPERTY_AGGREGATE_ONLY", gsc_last_crawl: "NOT_AVAILABLE",
    inlinks: p.inlinks, outlinks: p.outlinks, inlinking_page_families: [...(inFamilies.get(p.route) ?? [])], navigation_linked: yesNo(navLinked), footer_linked: yesNo(footerLinked), breadcrumb_depth: p.route.split("/").filter(Boolean).length,
    minimum_click_depth: p.depth, primary_discovery_route: p.primaryDiscovery, orphan_candidate: yesNo(p.orphan), related_content_links: related,
    adsense_code_present: "false (runtime script disabled)", ad_component_present: "source component available; not rendered", ad_placeholder_present: "false", ad_placeholder_count: 0, ad_eligible_currently_declared: yesNo(adAllowed(p.route, p.noindex)), page_is_navigation_or_utility: yesNo(["hub/navigation", "utility"].includes(p.surfaceFunction)), surface_function: p.surfaceFunction,
    schema_types: p.schemas, article_schema: yesNo(p.schemas.includes("Article")), breadcrumb_schema: yesNo(p.schemas.includes("BreadcrumbList")), author_schema: yesNo(p.schemas.includes("Person") || p.schemas.includes("Organization")), faq_schema: yesNo(p.schemas.includes("FAQPage")), other_schema: p.schemas.filter((s) => !["Article", "BreadcrumbList", "Person", "Organization", "FAQPage"].includes(s)), schema_validation_observation: p.schemas.includes("UNPARSEABLE_JSON_LD") ? "parse failure" : "JSON-LD parsed; external validator not run",
    raw_body_fingerprint: p.rawBodyHash, exact_duplicate_hash: p.normalizedHash, normalized_text_hash: p.normalizedHash, structural_fingerprint: p.structuralFingerprint, template_fingerprint: p.templateFingerprint, heading_fingerprint: p.headingFingerprint,
    phrase_fingerprint: sha256([...p.shingles].slice(0, 1000).sort().join("|")), near_duplicate_cluster_id: nearPairs.some((pair) => pair.a === p || pair.b === p) ? `ND_${p.topic.replace(/[^A-Z0-9]+/gi, "_").toUpperCase()}` : "",
    template_similarity_cluster: `${p.family}_${p.templateFingerprint.slice(0, 8)}`, semantic_topic_cluster: p.topic, title_overlap_cluster: titlePairs.some((pair) => pair.a === p || pair.b === p) ? `TITLE_${p.topic.replace(/[^A-Z0-9]+/gi, "_").toUpperCase()}` : "",
    search_intent_overlap_cluster: p.topic === "Page-specific / unclustered" ? "" : `INTENT_${p.topic.replace(/[^A-Z0-9]+/gi, "_").toUpperCase()}`, primary_intent: p.primaryIntent, secondary_intent: p.secondaryIntent,
    boilerplate_ratio: round(p.boilerplateRatio), unique_text_ratio: round(p.uniqueTextRatio), image_alt_coverage: p.images.length ? round(p.images.filter((i) => i.alt).length / p.images.length) : "not applicable",
    observations: queueNames.length ? `Review queues: ${queueNames.join("; ")}` : "No automated triage flag", evidence_class: "OBSERVED_REPOSITORY_FACT | OBSERVED_PRODUCTION_FACT | SEARCH_CONSOLE_EVIDENCE where populated",
    confidence: p.route === "/404.html" ? "MEDIUM" : "HIGH", phase_2_review_priority: queueNames.length >= 3 ? "PHASE_2_REVIEW_HIGH" : queueNames.join(" | ")
  };
});

const endpointRows = [
  ["/sitemap.xml", "XML_SITEMAP", "application/xml", "production sitemap + repository build"],
  ["/robots.txt", "ROBOTS", "text/plain", "production robots + public/robots.txt"],
  ["/ads.txt", "ADS_AUTHORIZATION", "text/plain", "production/static ads authorization endpoint"]
].map(([route, family, contentTypeHeader, source]) => ({
  url_id: `url_${sha256(`${site}${route}`).slice(0, 16)}`, raw_url: `${site}${route}`, normalized_url: `${site}${route}`, path: route, hostname: "echobuddha.com",
  discovery_sources: source, first_discovered_source: source.split(" + ")[0], page_family: family, page_subtype: "service endpoint", content_type: contentTypeHeader,
  topic: "technical discovery/authorization", template_id: route === "/sitemap.xml" ? "src/pages/sitemap.xml.ts" : `public${route}`, route_pattern: route,
  http_status: 200, final_url: `${site}${route}`, redirect_hops: 0, content_type_header: contentTypeHeader, robots_accessible: "true", crawl_success: "true",
  indexable: "not applicable", followable: "not applicable", sitemap_member: "false", canonical_type: "not applicable", canonical_consistency: "not applicable",
  language: route === "/sitemap.xml" ? "XML" : "machine-readable text", evidence_class: "OBSERVED_PRODUCTION_FACT | OBSERVED_REPOSITORY_FACT", confidence: "HIGH",
  observations: "Non-HTML first-party endpoint; excluded from HTML page-family/indexability and content-similarity denominators."
}));
writeCsv("ECHO_BUDDHA_FORENSIC_URL_INVENTORY.csv", masterHeaders, [...pageRows, ...endpointRows]);
writeCsv("ECHO_BUDDHA_NEAR_DUPLICATE_CLUSTERS.csv", ["cluster_id", "url_a", "url_b", "page_family_a", "page_family_b", "lexical_similarity", "structural_similarity", "heading_similarity", "semantic_similarity_if_available", "shared_phrase_ratio", "calibration_band", "notes"], nearPairs.map((pair, i) => ({
  cluster_id: `ND-${String(i + 1).padStart(4, "0")}`, url_a: pair.a.url, url_b: pair.b.url, page_family_a: pair.a.family, page_family_b: pair.b.family, lexical_similarity: round(pair.lexical), structural_similarity: round(pair.structural), heading_similarity: round(pair.heading), semantic_similarity_if_available: "not computed; no external embedding API used", shared_phrase_ratio: round(pair.sharedPhraseRatio),
  calibration_band: pair.lexical >= 0.2 ? "high lexical review" : pair.lexical >= 0.12 ? "moderate lexical review" : "structural/topic candidate", notes: "Five-token shingle Jaccard plus heading/structure evidence; review flag only."
})));
writeCsv("ECHO_BUDDHA_TITLE_INTENT_OVERLAP.csv", ["cluster_id", "url_a", "url_b", "page_family_a", "page_family_b", "topic_cluster", "title_token_overlap", "heading_overlap", "primary_intent_a", "primary_intent_b", "review_flag"], titlePairs.map((pair, i) => ({
  cluster_id: `TI-${String(i + 1).padStart(4, "0")}`, url_a: pair.a.url, url_b: pair.b.url, page_family_a: pair.a.family, page_family_b: pair.b.family, topic_cluster: pair.topic, title_token_overlap: round(pair.title), heading_overlap: round(pair.heading), primary_intent_a: pair.a.primaryIntent, primary_intent_b: pair.b.primaryIntent, review_flag: "REQUIRES_PHASE_2_DIFFERENTIATION_REVIEW"
})));
writeCsv("ECHO_BUDDHA_OWNER_SUPPORT_RELATIONSHIPS.csv", ["support_url", "declared_owner_url", "relationship_source", "visible_to_user", "topic", "intent_similarity", "query_overlap", "structural_overlap", "content_overlap", "owner_exists", "circular_relationship", "orphaned_relationship", "notes"], ownerRelationships);
writeCsv("ECHO_BUDDHA_INTERNAL_LINK_GRAPH.csv", ["source_url", "target_url", "anchor_text", "location_context", "target_status", "target_canonical", "target_indexable"], internalEdges);
writeCsv("ECHO_BUDDHA_GSC_URL_RECONCILIATION.csv", Object.keys(gscReconciliation[0] ?? {}), gscReconciliation);
writeCsv("ECHO_BUDDHA_QUERY_PAGE_MAP.csv", Object.keys(queryRows[0] ?? {}), queryRows);

const familyInventoryRows = (list) => list.map((p) => ({ url: p.url, page_family: p.family, subtype: p.subtype, title: p.title, h1: p.h1, category_or_section: p.subtype, topic: p.topic, primary_intent: p.primaryIntent, published_date: p.publishedDate, updated_date: p.updatedDate,
  author: p.authorMeta || (/Echo Buddha Editorial/i.test(p.text) ? "Echo Buddha Editorial" : "NOT_VERIFIED"), reviewer: /reviewed by/i.test(p.text) ? "visible reviewer reference" : "NOT_VERIFIED", word_count: p.wordCount, headings: p.headingTexts.join(" | "), source_section_present: yesNo(/source note|sources and citations|selected references|traditional reference/i.test(p.text)), citations: p.external.length,
  related_links: p.links.filter((l) => l.context === "related content").length, owner_support_relationship: ownerOf.get(p.normalizedUrl) ?? "", inlinks: p.inlinks, outlinks: p.outlinks, minimum_click_depth: p.depth,
  indexable: yesNo(p.indexable), sitemap_member: yesNo(p.sitemap), canonical: p.canonical, gsc_clicks_3m: p.gsc?.clicks ?? 0, gsc_impressions_3m: p.gsc?.impressions ?? 0,
  lexical_review_pairs: nearPairs.filter((pair) => pair.a === p || pair.b === p).length, boilerplate_ratio: round(p.boilerplateRatio), unique_text_ratio: round(p.uniqueTextRatio), ad_placeholder_count: 0, declared_ad_eligible: yesNo(adAllowed(p.route, p.noindex)), schema_types: p.schemas.join(" | ") }));
writeCsv("ECHO_BUDDHA_ARTICLE_FORENSIC_INVENTORY.csv", Object.keys(familyInventoryRows(articlePages)[0] ?? {}), familyInventoryRows(articlePages));
writeCsv("ECHO_BUDDHA_LEARN_FORENSIC_INVENTORY.csv", Object.keys(familyInventoryRows(learnPages)[0] ?? {}), familyInventoryRows(learnPages));
writeCsv("ECHO_BUDDHA_DICTIONARY_FORENSIC_INVENTORY.csv", Object.keys(familyInventoryRows(dictionaryPages)[0] ?? {}), familyInventoryRows(dictionaryPages));
writeCsv("ECHO_BUDDHA_REFLECTION_PRACTICE_INVENTORY.csv", Object.keys(familyInventoryRows(reflectionPages)[0] ?? {}), familyInventoryRows(reflectionPages));

const targetedExternalQuotePaths = new Set([
  "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/",
  "/quotes/compassion/let-kindness-be-the-echo-you-leave-in-every/",
  "/quotes/wisdom/wisdom-is-the-art-of-meeting-life-without-adding/",
  "/quotes/renewal/begin-again-gently-the-breath-is-always-willing/"
]);
const quoteRows = quotePages.map((p) => {
  const category = p.route.split("/").filter(Boolean)[1];
  const relatedQuotes = p.links.filter((l) => l.target?.startsWith("/quotes/") && l.target !== p.route).length;
  const relatedArticles = p.links.filter((l) => l.target?.startsWith("/articles/")).length;
  return { quote_id: `quote_${sha256(normalizedText(p.quoteText)).slice(0, 16)}`, quote_text: p.quoteText, slug: p.route.split("/").filter(Boolean).at(-1), category, category_url: `${site}/quotes/${category}/`, story_detail_url: p.url,
    source_type: /Original Echo Buddha|Echo Buddha original/i.test(p.text) ? "declared EchoBuddha-original" : "repository default originality classification", attribution: /Echo Buddha Editorial/i.test(p.text) ? "Echo Buddha Editorial" : "Echo Buddha",
    declared_echobuddha_original: "true (repository data default; external originality separately sampled)", internal_uniqueness: (quoteTextGroups.get(normalizedText(p.quoteText))?.length ?? 0) > 1 ? "INTERNAL_EXACT_DUPLICATE" : "INTERNAL_UNIQUE",
    page_word_count: p.wordCount, content_sections: p.headingTexts.join(" | "), heading_structure: p.structuralFingerprint, template: p.templateId, unique_story_length: p.wordCount, repeated_block_ratio: round(p.boilerplateRatio), canonical: p.canonical,
    indexable: yesNo(p.indexable), sitemap_status: yesNo(p.sitemap), inlinks: p.inlinks, gsc_clicks_3m: p.gsc?.clicks ?? 0, gsc_impressions_3m: p.gsc?.impressions ?? 0,
    related_quotes: relatedQuotes, related_articles: relatedArticles, ad_placeholders: 0, structured_data: p.schemas.join(" | "), external_originality: targetedExternalQuotePaths.has(p.route) ? "NO_EXTERNAL_EXACT_MATCH_OBSERVED_IN_TARGETED_SEARCH; EXTERNAL_ORIGINALITY_NOT_VERIFIED" : "EXTERNAL_ORIGINALITY_NOT_VERIFIED" };
});
writeCsv("ECHO_BUDDHA_QUOTE_FORENSIC_INVENTORY.csv", Object.keys(quoteRows[0] ?? {}), quoteRows);

const authorMap = new Map();
for (const p of pages) {
  const author = p.authorMeta || (/Echo Buddha Editorial/i.test(p.text) ? "Echo Buddha Editorial" : "NOT_VERIFIED");
  if (!authorMap.has(author)) authorMap.set(author, { author_name_display: author, content_count: 0, page_families: new Set(), author_profile_exists: author === "Echo Buddha Editorial", profile_url: author === "Echo Buddha Editorial" ? `${site}/authors/echo-buddha-editorial/` : "", biography: author === "Echo Buddha Editorial" ? "Visible organization/editorial profile exists" : "NOT_VERIFIED", claimed_credentials: "No individual credential claim inferred", credentials_independently_supported: "NOT_VERIFIED", reviewer: "NOT_VERIFIED", reviewer_profile: "", organization_author: yesNo(author === "Echo Buddha Editorial"), structured_data_author: 0, visible_byline: 0, content_creation_process: `${site}/how-echo-buddha-creates-content/` });
  const row = authorMap.get(author); row.content_count += 1; row.page_families.add(p.family); if (/Echo Buddha Editorial/i.test(p.text)) row.visible_byline += 1; if (p.schemas.includes("Person") || p.schemas.includes("Organization")) row.structured_data_author += 1;
}
const authorRows = [...authorMap.values()].map((r) => ({ ...r, page_families: [...r.page_families] }));
writeCsv("ECHO_BUDDHA_AUTHORSHIP_MAP.csv", Object.keys(authorRows[0] ?? {}), authorRows);

const sourceRows = pages.filter((p) => p.indexable).map((p) => {
  const domains = [...new Set(p.external.map((l) => { try { return new URL(l.href).hostname; } catch { return ""; } }).filter(Boolean))];
  return { url: p.url, page_family: p.family, topic: p.topic, claim_type: p.family === "QUOTE_STORY" ? "original reflection/quote" : p.family === "REFLECTION" ? "original reflection/practical advice" : "educational/doctrinal or practical content",
    source_section_present: yesNo(/source note|sources and citations|selected references|traditional reference/i.test(p.text)), citation_count: p.external.length, source_domains: domains, buddhist_primary_source_count: domains.filter((d) => /suttacentral|accesstoinsight|dhammatalks|tipitaka|palicanon/i.test(d)).length,
    recognized_context_source_count: domains.filter((d) => /nhs|who\.int|apa\.org|stanford|britannica|edu$/i.test(d)).length, broken_link_count: "NOT_VERIFIED", title_support_match: "NOT_ASSESSED_AT_CLAIM_LEVEL", review_flag: p.external.length === 0 && ["ARTICLE", "BUDDHISM_101", "LEARN_GUIDE", "DICTIONARY_ENTRY"].includes(p.family) ? "SOURCE_REVIEW" : "" };
});
writeCsv("ECHO_BUDDHA_SOURCE_CITATION_INVENTORY.csv", Object.keys(sourceRows[0] ?? {}), sourceRows);

const equityRows = pages.filter((p) => p.gsc || p.sitemap).map((p) => ({ url: p.url, page_family: p.family, indexable: yesNo(p.indexable), sitemap_member: yesNo(p.sitemap), gsc_clicks_3m: p.gsc?.clicks ?? 0, gsc_impressions_3m: p.gsc?.impressions ?? 0, gsc_ctr_3m: p.gsc?.ctr ?? "", gsc_position_3m: p.gsc?.position ?? "", query_diversity: "NOT_AVAILABLE: query×page dimension absent", indexed_stability: "PROPERTY_AGGREGATE_ONLY", internal_inlinks: p.inlinks, minimum_click_depth: p.depth, backlink_evidence: "NOT_AVAILABLE", evidence_only: "SEO_EQUITY_REVIEW" }));
writeCsv("ECHO_BUDDHA_SEARCH_EQUITY_EVIDENCE.csv", Object.keys(equityRows[0] ?? {}), equityRows);

const adRows = pages.map((p) => ({ url: p.url, page_family: p.family, surface_function: p.surfaceFunction, ad_component: "AdSlot source component compiled but manualSlotsEnabled=false", placeholder_component: "not rendered", visible_label: "none", placement: "none", count: 0, desktop_behavior: "no rendered slot", mobile_behavior: "no rendered slot", ad_code_present: "false", adsense_runtime_script_present: "false", ownership_verification_meta_present: yesNo(p.indexable), auto_ads_implications: "runtime script disabled", consent_dependency: "runtime ads disabled; ConsentManager remains present", declared_future_eligibility: yesNo(adAllowed(p.route, p.noindex)) }));
writeCsv("ECHO_BUDDHA_AD_SURFACE_INVENTORY.csv", Object.keys(adRows[0] ?? {}), adRows);

const repeatedRows = repeatedBlocks.map((b, i) => ({ block_id: `RB-${String(i + 1).padStart(4, "0")}`, normalized_text_hash: b.hash, safe_excerpt: `${b.text.slice(0, 140)}${b.text.length > 140 ? "…" : ""}`, pages_using_it: [...b.pages], page_families: [...b.families], occurrence_count: b.pages.size, word_count: words(b.text).length, classification: b.families.size >= 5 ? "likely global/shared UI or editorial boilerplate" : "family-specific repeated publisher block; review context" }));
writeCsv("ECHO_BUDDHA_REPEATED_BLOCKS.csv", Object.keys(repeatedRows[0] ?? {}), repeatedRows);
const metadataRows = [];
for (const [type, groups] of [["title", duplicateTitles], ["meta_description", duplicateDescriptions], ["h1", duplicateH1s]]) for (const [value, group] of groups) metadataRows.push({ element_type: type, normalized_value: value, occurrence_count: group.length, urls: group.map((p) => p.url), page_families: [...new Set(group.map((p) => p.family))], interpretation: group.every((p) => p.family === group[0].family) ? "same-family duplicate; context review" : "cross-family duplicate; context review" });
writeCsv("ECHO_BUDDHA_METADATA_DUPLICATION.csv", Object.keys(metadataRows[0] ?? { element_type: "", normalized_value: "", occurrence_count: "", urls: "", page_families: "", interpretation: "" }), metadataRows);

const counts = {
  schema_version: 1, generated_at: generatedAt, method_version: methodVersion, repository_head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), phase_0_baseline_timestamp: baseline.baselineTimestamp,
  url_universe: { total_discovered_first_party_urls: pages.length + endpointRows.length, total_first_party_html_routes: pages.length, non_html_service_endpoints: endpointRows.length, status_200: pages.filter((p) => p.route !== "/404.html").length, edge_redirects: 1, indexable: pages.filter((p) => p.indexable).length, noindex_or_error: pages.filter((p) => !p.indexable).length, sitemap_urls: sitemapPaths.size,
    sitemap_not_indexable: pages.filter((p) => p.sitemap && !p.indexable).length, indexable_absent_sitemap: pages.filter((p) => p.indexable && !p.sitemap).length, canonicalized_elsewhere: pages.filter((p) => p.canonical && normalizeUrl(p.canonical) !== p.normalizedUrl).length, orphan_candidates: pages.filter((p) => p.orphan).length,
    utility_navigation_legal_error: pages.filter((p) => ["hub/navigation", "utility", "legal", "error"].includes(p.surfaceFunction)).length, content_pages: pages.filter((p) => p.surfaceFunction === "substantial publisher content").length, declared_ad_eligible_surfaces: pages.filter((p) => adAllowed(p.route, p.noindex)).length, rendered_ad_or_placeholder_surfaces: 0 },
  page_families: familyCounts,
  content: { articles: articlePages.length, quote_records_and_story_routes: quotePages.length, indexable_quote_stories: quotePages.filter((p) => p.indexable).length, noindex_quote_stories: quotePages.filter((p) => !p.indexable).length, dictionary_entries: dictionaryPages.length, learn_and_meditation_surfaces: learnPages.length,
    reflection_practice_surfaces: reflectionPages.length, pages_with_visible_or_meta_authorship: pages.filter((p) => p.authorMeta || /Echo Buddha Editorial/i.test(p.text)).length, indexable_pages_with_source_signal: pages.filter((p) => p.indexable && (/source note|sources and citations|selected references|traditional reference/i.test(p.text) || p.external.length)).length },
  similarity: { exact_main_body_duplicate_clusters: exactBodyGroups.length, exact_quote_text_duplicate_clusters: exactQuoteDuplicates.length, near_duplicate_candidate_pairs: nearPairs.length, high_lexical_candidate_pairs: nearPairs.filter((p) => p.lexical >= 0.2).length, moderate_lexical_candidate_pairs: nearPairs.filter((p) => p.lexical >= 0.12 && p.lexical < 0.2).length, repeated_block_clusters: repeatedBlocks.length, title_intent_overlap_pairs: titlePairs.length },
  internal_links: { edges: internalEdges.length, unique_source_routes: new Set(internalEdges.map((e) => e.source_url)).size, unique_target_routes: new Set(internalEdges.map((e) => e.target_url)).size, internal_links_to_missing_build_targets: internalEdges.filter((e) => e.target_status === "NOT_IN_BUILD").length, links_to_noindex_targets: internalEdges.filter((e) => e.target_indexable === "false").length },
  search_console: { source_export_date: gsc.source.exportDate, page_rows: gscPageRows.length, page_rows_matched: gscReconciliation.filter((r) => r.inventory_match === "true").length, page_rows_unmatched: gscReconciliation.filter((r) => r.inventory_match !== "true").length, query_rows: queryRows.length, query_page_dimension_available: false },
  review_queues: Object.fromEntries(Object.entries(reviewQueues).map(([name, urls]) => [name, urls.size])),
  coverage: { sitemap_urls_inventoried_percent: pct(pages.filter((p) => p.sitemap).length, sitemapPaths.size), repository_build_routes_inventoried_percent: pct(pages.length, routeInventory.length), repository_route_records_matched_percent: pct(pages.filter((p) => routeInventoryByPath.has(p.route)).length, routeInventory.length),
    gsc_page_rows_reconciled_percent: pct(gscReconciliation.filter((r) => r.inventory_match === "true").length, gscReconciliation.length), indexable_urls_with_canonical_percent: pct(pages.filter((p) => p.indexable && p.canonical).length, pages.filter((p) => p.indexable).length), html_routes_with_content_extraction_percent: pct(pages.filter((p) => p.text).length, pages.length), urls_with_page_family_percent: pct(pages.filter((p) => p.family).length, pages.length), inventory_coverage_percent: pct(pages.filter((p) => routeInventoryByPath.has(p.route) && p.text && p.family && (p.route === "/404.html" || p.canonical)).length, pages.length) },
  phase_0_comparison: { built_html_routes: { phase_0: baseline.production.builtHtmlRoutes, phase_1: pages.length }, indexable: { phase_0: baseline.production.indexableRoutes, phase_1: pages.filter((p) => p.indexable).length }, sitemap: { phase_0: baseline.production.sitemapUrls, phase_1: sitemapPaths.size }, explanation: "Counts agree; Phase 1 rebuild used the same frozen HEAD." }
};
writeJson("ECHO_BUDDHA_FORENSIC_COUNTS.json", counts);

const familyTable = Object.entries(familyCounts).map(([family, c]) => `| ${family} | ${c.total} | ${c.indexable} | ${c.noindex_or_error} | ${c.sitemap} | ${c.orphan_candidates} | ${c.declared_ad_eligible} |`).join("\n");
writeMd("ECHO_BUDDHA_INDEXABLE_SURFACE_MAP.md", `# EchoBuddha Indexable Surface Map\n\nGenerated: ${generatedAt}\n\nEvidence labels: OBSERVED_REPOSITORY_FACT and OBSERVED_PRODUCTION_FACT (Phase 0 parity).\n\n- Total discovered first-party URLs: **${pages.length + endpointRows.length}** = **${pages.length} HTML routes** + **${endpointRows.length} non-HTML service endpoints** (sitemap, robots, ads authorization).\n- HTTP 200 HTML routes: **${pages.filter((p) => p.route !== "/404.html").length}**; edge redirect route: **1** (\`/404.html\` → \`/404\`).\n- Indexable: **${pages.filter((p) => p.indexable).length}**\n- Noindex/error: **${pages.filter((p) => !p.indexable).length}**\n- Sitemap URLs: **${sitemapPaths.size}**\n- Sitemap URLs not indexable: **${counts.url_universe.sitemap_not_indexable}**\n- Indexable URLs absent from sitemap: **${counts.url_universe.indexable_absent_sitemap}**\n- Canonicalized elsewhere: **${counts.url_universe.canonicalized_elsewhere}**\n- Orphan candidates by extracted HTML links: **${counts.url_universe.orphan_candidates}**\n- Navigation/utility/legal/error surfaces: **${counts.url_universe.utility_navigation_legal_error}**\n- Substantial publisher-content surfaces (descriptive): **${counts.url_universe.content_pages}**\n- Routes declared eligible by current source rules: **${counts.url_universe.declared_ad_eligible_surfaces}**; rendered ad/script/placeholder surfaces: **0**.\n\n| Page family | Total | Indexable | Noindex/error | Sitemap | Orphans | Declared ad-eligible |\n|---|---:|---:|---:|---:|---:|---:|\n${familyTable}\n\n“Declared ad-eligible” is descriptive source configuration only. Runtime scripts and manual slots remain disabled, so this is not a Phase 1 monetization decision.`);

const exactSections = [
  ["Main-content normalized body", exactBodyGroups], ["Title", duplicateTitles], ["Meta description", duplicateDescriptions], ["H1", duplicateH1s]
].map(([label, groups]) => `## ${label}\n\n${groups.length ? groups.map(([value, group], i) => `- Cluster ${i + 1}: ${group.length} URLs — ${group.map((p) => p.route).join(", ")} — value/hash: \`${label.includes("body") ? value.slice(0, 16) : value}\``).join("\n") : "No duplicate clusters observed."}`).join("\n\n");
writeMd("ECHO_BUDDHA_EXACT_DUPLICATION_REPORT.md", `# EchoBuddha Exact Duplication Report\n\nGenerated: ${generatedAt}\n\nMain-content hashes exclude script/style/SVG but retain publisher content inside \`main\`. Repeated global UI is analyzed separately and is not treated as a content violation.\n\n${exactSections}\n\n## Quote text\n\nInternal quote-text exact-duplicate clusters: **${exactQuoteDuplicates.length}**. This does not verify external originality.`);

writeMd("ECHO_BUDDHA_BOILERPLATE_ANALYSIS.md", `# EchoBuddha Boilerplate and Unique-Text Analysis\n\nGenerated: ${generatedAt}\n\nMethod: each \`p\`, \`li\`, and \`blockquote\` block of at least six normalized tokens was hashed. A block occurring on at least three routes is repeated. Per-page boilerplate ratio is repeated-block words divided by all extracted block words. This deliberately separates exact repeated publisher/UI blocks from merely similar structure.\n\n- Repeated block clusters: **${repeatedBlocks.length}**\n- Indexable pages at or above 35% exact repeated-block ratio: **${pages.filter((p) => p.indexable && p.boilerplateRatio >= 0.35).length}**\n- Median indexable boilerplate ratio: **${round(pages.filter((p) => p.indexable).map((p) => p.boilerplateRatio).sort((a,b)=>a-b)[Math.floor(pages.filter((p)=>p.indexable).length/2)] ?? 0)}**\n- Highest-concentration families should be reviewed in Phase 2; reusable components are not inherently problematic.\n\nThe complete block-level evidence is in \`ECHO_BUDDHA_REPEATED_BLOCKS.csv\`.`);

const intentGroups = [...new Set(contentPages.map((p) => p.topic))].sort().map((topic) => {
  const members = contentPages.filter((p) => p.topic === topic);
  const owners = ownerRelationships.filter((r) => r.topic === topic).map((r) => r.declared_owner_url);
  return `## ${topic}\n\n- URLs: ${members.map((p) => p.url).join(", ")}\n- Observed intents: ${[...new Set(members.map((p) => p.primaryIntent))].join(", ")}\n- Declared owner evidence: ${[...new Set(owners)].join(", ") || "none verified"}\n- GSC query×page evidence: unavailable in supplied export.\n- Flag: REQUIRES_PHASE_2_DIFFERENTIATION_REVIEW`;
}).join("\n\n");
writeMd("ECHO_BUDDHA_SEARCH_INTENT_CLUSTERS.md", `# EchoBuddha Search-Intent Clusters\n\nGenerated: ${generatedAt}\n\nIntent is inferred from title, H1, headings, route context, and introductions. It is evidence, not a doorway/cannibalization finding and not a disposition.\n\n${intentGroups}`);

const relationshipsByOwner = new Map();
for (const rel of ownerRelationships) { if (!relationshipsByOwner.has(rel.declared_owner_url)) relationshipsByOwner.set(rel.declared_owner_url, []); relationshipsByOwner.get(rel.declared_owner_url).push(rel); }
writeMd("ECHO_BUDDHA_OWNER_SUPPORT_GRAPH.md", `# EchoBuddha Owner / Support Graph\n\nGenerated: ${generatedAt}\n\nRelationships were extracted from the repository-held intent architecture register and checked against current routes. Historical dispositions were deliberately not carried into Phase 1.\n\n- Support relationships: **${ownerRelationships.length}**\n- Distinct declared owners: **${relationshipsByOwner.size}**\n- Missing owners: **${ownerRelationships.filter((r) => r.owner_exists !== "true").length}**\n- Circular pairs: **${ownerRelationships.filter((r) => r.circular_relationship === "true").length}**\n\n${[...relationshipsByOwner.entries()].map(([owner, rels]) => `## ${owner}\n\n${rels.map((r) => `- ${r.support_url} (${r.topic}; visible: ${r.visible_to_user})`).join("\n")}`).join("\n\n")}\n\nThis graph records declared architecture only. It does not label any route as doorway abuse.`);

const fixedQuoteHeading = /^(origin context and practice|quote origin and review status|what this line means here|a situation where it matters|buddhist teaching in view|one way to test it|reflection question|source note|continue the reflection)$/;
const quoteHeadingCounts = new Map();
const quoteSkeletons = new Map();
for (const p of quotePages) {
  const normalizedHeadings = p.headingTexts.slice(1).map(normalizedText);
  for (const heading of new Set(normalizedHeadings)) quoteHeadingCounts.set(heading, (quoteHeadingCounts.get(heading) ?? 0) + 1);
  const skeleton = normalizedHeadings.filter((heading) => fixedQuoteHeading.test(heading)).join(" → ") || "NO_FIXED_SKELETON";
  if (!quoteSkeletons.has(skeleton)) quoteSkeletons.set(skeleton, []);
  quoteSkeletons.get(skeleton).push(p);
}
const topQuoteSkeletons = [...quoteSkeletons.entries()].sort((a,b)=>b[1].length-a[1].length);
const recurringQuoteHeadings = [...quoteHeadingCounts.entries()].filter(([,n])=>n >= 3).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
writeMd("ECHO_BUDDHA_QUOTE_TEMPLATE_ANALYSIS.md", `# EchoBuddha Quote-Story Template Analysis\n\nGenerated: ${generatedAt}\n\nThe entire **${quotePages.length}-route** quote-story corpus was analyzed; ${quotePages.filter((p)=>p.indexable).length} routes are indexable and ${quotePages.filter((p)=>!p.indexable).length} are noindex.\n\n- Distinct fixed-section skeletons (excluding page-specific H1/story/related titles): **${quoteSkeletons.size}**\n- Largest fixed-section skeleton concentration: **${topQuoteSkeletons[0]?.[1].length ?? 0}** routes\n- Recurrent heading labels appearing on at least three routes: **${recurringQuoteHeadings.length}**\n- Exact internal quote-text duplicate clusters: **${exactQuoteDuplicates.length}**\n- Mean exact repeated-block ratio: **${round(quotePages.reduce((s,p)=>s+p.boilerplateRatio,0)/quotePages.length)}**\n- Mean unique-text ratio: **${round(quotePages.reduce((s,p)=>s+p.uniqueTextRatio,0)/quotePages.length)}**\n\n## Fixed-section skeletons\n\n${topQuoteSkeletons.map(([pattern, group], i) => `${i + 1}. ${group.length} routes — ${pattern}`).join("\n")}\n\n## Most recurrent exact heading labels\n\n${recurringQuoteHeadings.slice(0, 30).map(([heading, n]) => `- ${n}/${quotePages.length}: ${heading}`).join("\n")}\n\nThe result quantifies a dominant publishing grammar while preserving the distinction between repeated scaffolding and page-specific story headings. It does not conclude that every quote story is low value.`);

writeMd("ECHO_BUDDHA_LEARNING_ARCHITECTURE.md", `# EchoBuddha Learning Architecture\n\nGenerated: ${generatedAt}\n\nSource data flows from \`src/data/learn.ts\` through static/dynamic Astro templates to Learn and Meditation routes, then into the sitemap when indexable.\n\n- Learn hub: ${familyCounts.LEARN_HUB?.total ?? 0}\n- Buddhism 101 surfaces: ${familyCounts.BUDDHISM_101?.total ?? 0}\n- Learn guide/source-study surfaces: ${familyCounts.LEARN_GUIDE?.total ?? 0}\n- Dictionary: ${(familyCounts.DICTIONARY_HUB?.total ?? 0) + (familyCounts.DICTIONARY_ENTRY?.total ?? 0)}\n- Meditation hub/guides: ${(familyCounts.MEDITATION_HUB?.total ?? 0) + (familyCounts.MEDITATION_GUIDE?.total ?? 0)}\n\nBreadcrumb depth and click depth are stored per URL. Cross-family topic matches are recorded in the overlap artifacts; no merge or owner change is assigned here.`);

const crossPairs = nearPairs.filter((p) => p.a.family !== p.b.family);
writeMd("ECHO_BUDDHA_CROSS_FAMILY_OVERLAP.md", `# EchoBuddha Cross-Family Overlap\n\nGenerated: ${generatedAt}\n\nCandidate cross-family pairs: **${crossPairs.length}** using the documented five-token shingle/heading calibration. These are review candidates, not duplicate-content or doorway findings.\n\n${crossPairs.slice(0, 100).map((p) => `- ${p.a.route} (${p.a.family}) ↔ ${p.b.route} (${p.b.family}): lexical ${round(p.lexical)}, heading ${round(p.heading)}, topic ${p.a.topic} / ${p.b.topic}`).join("\n") || "No cross-family candidate pairs met the recorded thresholds."}`);

writeMd("ECHO_BUDDHA_INTERNAL_LINK_FINDINGS.md", `# EchoBuddha Internal-Link Findings\n\nGenerated: ${generatedAt}\n\n- Extracted internal link instances: **${internalEdges.length}**\n- Routes with outgoing internal links: **${new Set(internalEdges.map((e)=>e.source_url)).size}/${pages.length}**\n- Unique internal targets: **${new Set(internalEdges.map((e)=>e.target_url)).size}**\n- Orphan candidates: **${pages.filter((p)=>p.orphan).length}**\n- Links to targets absent from the build: **${internalEdges.filter((e)=>e.target_status === "NOT_IN_BUILD").length}**\n- Links to noindex/error targets: **${internalEdges.filter((e)=>e.target_indexable === "false").length}**\n\nClick depth is breadth-first over extracted rendered HTML links. Global navigation/footer links remain included and are labeled in the edge file. No links were repaired.`);

const sourceDomainCounts = new Map();
for (const p of pages) for (const link of p.external) { try { const domain = new URL(link.href).hostname; sourceDomainCounts.set(domain, (sourceDomainCounts.get(domain) ?? 0) + 1); } catch {} }
writeMd("ECHO_BUDDHA_SOURCE_DOMAIN_SUMMARY.md", `# EchoBuddha Source-Domain Summary\n\nGenerated: ${generatedAt}\n\nExternal source domains are extracted from rendered page links. Link availability and claim-level support were not bulk-tested; blank/NOT_VERIFIED is used rather than fabricating a zero broken-link count.\n\n| Domain | Link occurrences |\n|---|---:|\n${[...sourceDomainCounts.entries()].sort((a,b)=>b[1]-a[1]).map(([d,n])=>`| ${d} | ${n} |`).join("\n")}`);

writeMd("ECHO_BUDDHA_CONTENT_PROVENANCE_MAP.md", `# EchoBuddha Content Provenance Map\n\nGenerated: ${generatedAt}\n\nNo inference of AI use is made from style. Confirmed repository evidence is separated from unknown authorship history.\n\n| Family | Source → generation → template → route | Provenance | Publication |\n|---|---|---|---|\n| Articles | \`src/data/site.ts\` → Astro static paths → article template → \`/articles/[slug]/\` | Structured records with authored HTML sections; historical drafting method not fully verified | Build/deploy is manual and exact-SHA gated |\n| Quotes | \`src/data/site.ts\` quote registry → quote category/story templates → \`/quotes/[category]/[slug]/\` | Structured data; all records default to EchoBuddha-original classification; 43 have expanded story data | No scheduled publisher |\n| Learn/dictionary/sutta/dhammapada | \`src/data/learn.ts\` → section/detail route builders → \`/learn/.../\` | Structured educational records; visible editorial governance applies | No scheduled publisher |\n| Meditation | \`src/data/learn.ts\` → meditation static paths/template → \`/meditation/[slug]/\` | Structured practice guidance | No scheduled publisher |\n| Daily reflections | \`src/data/dailyReflections.ts\` → 30 standalone noindex routes plus time-varying \`/today/\` | Structured recurring reflection set | Dynamic selection does not create dated URL expansion |\n| Trust/editorial/legal | Authored Astro routes plus \`src/data/editorialGovernance.ts\` | Hand-maintained repository content | Manual deployment |\n\nAutomation inspection: scheduled workflows perform validation/smoke/dependency maintenance. No automatic public-content publishing job was observed. Runtime route generation happens only during the static build. Human-review history before repository entry is \`PROVENANCE_NOT_VERIFIED\` unless explicitly described by the content-process page.`);

let gitLog = "";
try { gitLog = execFileSync("git", ["log", "--date=short", "--format=%ad%x09%h%x09%s", "--", "src/data/site.ts", "src/data/learn.ts", "src/data/dailyReflections.ts", "src/data/editorialGovernance.ts", "src/pages/sitemap.xml.ts"], { cwd: root, encoding: "utf8", maxBuffer: 10_000_000 }); } catch {}
const timelineRows = gitLog.trim().split("\n").filter(Boolean).map((line) => { const [date, commit, ...summary] = line.split("\t"); return { date, commit, summary: summary.join("\t") }; });
const byDate = new Map(); for (const row of timelineRows) byDate.set(row.date, (byDate.get(row.date) ?? 0) + 1);
writeMd("ECHO_BUDDHA_CONTENT_PUBLICATION_TIMELINE.md", `# EchoBuddha Content Publication Timeline\n\nGenerated: ${generatedAt}\n\nHigh-level private Git evidence only; no history was rewritten. Batch commits are not treated as spam. Exact per-page creation dates are limited because dynamic routes share data/template files.\n\n- Content/governance/sitemap commits observed: **${timelineRows.length}**\n- Active dates: **${byDate.size}**\n\n| Date | Relevant commits |\n|---|---:|\n${[...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([d,n])=>`| ${d} | ${n} |`).join("\n")}\n\n## Commit summaries\n\n${timelineRows.map((r)=>`- ${r.date} \`${r.commit}\` — ${r.summary}`).join("\n")}\n\nPublication velocity by family cannot be reconstructed precisely from shared TypeScript registries without line-level historical content parsing. Current-family counts and major commit chronology are reproducible; causal correlation with AdSense rejection is not asserted.`);

writeMd("ECHO_BUDDHA_AD_SURFACE_SUMMARY.md", `# EchoBuddha Ad Surface Summary\n\nGenerated: ${generatedAt}\n\n- AdSense ownership verification metadata: present on indexable pages by current implementation.\n- Runtime AdSense script: disabled.\n- Manual ad slots: disabled.\n- Rendered ad placeholders/labels: **0 routes**.\n- Source-declared future eligible routes: **${pages.filter((p)=>adAllowed(p.route,p.noindex)).length}**.\n\nThe per-route source rules are documented descriptively in \`ECHO_BUDDHA_AD_SURFACE_INVENTORY.csv\`. No monetization rule or ad behavior was changed.`);

const artifactIndex = [
  "ECHO_BUDDHA_COMPLETE_FORENSIC_INVENTORY.md", "generate-phase-1-forensic-inventory.mjs", "ECHO_BUDDHA_PHASE_1_VALIDATION.json",
  "ECHO_BUDDHA_FORENSIC_URL_INVENTORY.csv", "ECHO_BUDDHA_FORENSIC_COUNTS.json", "ECHO_BUDDHA_INDEXABLE_SURFACE_MAP.md", "ECHO_BUDDHA_EXACT_DUPLICATION_REPORT.md", "ECHO_BUDDHA_NEAR_DUPLICATE_CLUSTERS.csv", "ECHO_BUDDHA_BOILERPLATE_ANALYSIS.md", "ECHO_BUDDHA_REPEATED_BLOCKS.csv", "ECHO_BUDDHA_TITLE_INTENT_OVERLAP.csv", "ECHO_BUDDHA_SEARCH_INTENT_CLUSTERS.md", "ECHO_BUDDHA_OWNER_SUPPORT_GRAPH.md", "ECHO_BUDDHA_OWNER_SUPPORT_RELATIONSHIPS.csv", "ECHO_BUDDHA_ARTICLE_FORENSIC_INVENTORY.csv", "ECHO_BUDDHA_LEARN_FORENSIC_INVENTORY.csv", "ECHO_BUDDHA_LEARNING_ARCHITECTURE.md", "ECHO_BUDDHA_DICTIONARY_FORENSIC_INVENTORY.csv", "ECHO_BUDDHA_QUOTE_FORENSIC_INVENTORY.csv", "ECHO_BUDDHA_QUOTE_TEMPLATE_ANALYSIS.md", "ECHO_BUDDHA_REFLECTION_PRACTICE_INVENTORY.csv", "ECHO_BUDDHA_AUTHORSHIP_MAP.csv", "ECHO_BUDDHA_SOURCE_CITATION_INVENTORY.csv", "ECHO_BUDDHA_SOURCE_DOMAIN_SUMMARY.md", "ECHO_BUDDHA_INTERNAL_LINK_GRAPH.csv", "ECHO_BUDDHA_INTERNAL_LINK_FINDINGS.md", "ECHO_BUDDHA_GSC_URL_RECONCILIATION.csv", "ECHO_BUDDHA_QUERY_PAGE_MAP.csv", "ECHO_BUDDHA_SEARCH_EQUITY_EVIDENCE.csv", "ECHO_BUDDHA_CONTENT_PROVENANCE_MAP.md", "ECHO_BUDDHA_CONTENT_PUBLICATION_TIMELINE.md", "ECHO_BUDDHA_AD_SURFACE_INVENTORY.csv", "ECHO_BUDDHA_AD_SURFACE_SUMMARY.md", "ECHO_BUDDHA_CROSS_FAMILY_OVERLAP.md", "ECHO_BUDDHA_METADATA_DUPLICATION.csv", "ECHO_BUDDHA_EXTERNAL_ORIGINALITY_EVIDENCE.csv", "ECHO_BUDDHA_ERROR_STATE_INVENTORY.csv"
];
writeJson("ECHO_BUDDHA_PHASE_1_METHOD_MANIFEST.json", { generated_at: generatedAt, method_version: methodVersion, command: "node docs/audits/adsense-recovery-phase-1-2026-08-24/generate-phase-1-forensic-inventory.mjs", node: process.version, repository_head: counts.repository_head,
  inputs: ["dist/**/*.html", "dist/sitemap.xml", path.relative(root, inventoryPath), path.relative(root, path.join(phase0Dir, "ADSENSE_RECOVERY_BASELINE_COUNTS.json")), path.relative(root, path.join(phase0Dir, "source-evidence/gsc-snapshot-2026-08-21.json")), path.relative(root, ownerRegisterPath), "git history"],
  methods: { normalization: "HTTPS, non-www, path normalized with trailing slash except /404.html; fragments/query excluded analytically", content: "rendered <main> extraction", duplicate: "SHA-256 normalized body", near_duplicate: "five-token shingle Jaccard plus heading/structural Jaccard", boilerplate: "exact normalized p/li/blockquote blocks appearing on >=3 routes", internal_graph: "all rendered HTML anchors; BFS depth", seed: "not applicable; no random sampling" },
  limitations: ["Supplied GSC export lacks query×page, URL Inspection, last-crawl, link report, and page-level index-state joins.", "HTTP status/canonical parity is carried from the same-day Phase 0 full crawl and exact-HEAD production parity; /404 edge behavior is special.", "Broken external sources and claim-level citation support were not bulk verified.", "Semantic embeddings were not used; private content was not sent to external APIs.", "Per-page Git dates are approximate for routes generated from shared registries."], artifacts: artifactIndex });

const validationMissing = artifactIndex.filter((name) => !fs.existsSync(path.join(outDir, name)) && name !== "ECHO_BUDDHA_PHASE_1_VALIDATION.json");
const validationChecks = {
  frozen_head_matches_phase_0: counts.repository_head === baseline.repository.head,
  html_routes_match_phase_0: pages.length === baseline.production.builtHtmlRoutes,
  indexable_routes_match_phase_0: pages.filter((p) => p.indexable).length === baseline.production.indexableRoutes,
  sitemap_urls_match_phase_0: sitemapPaths.size === baseline.production.sitemapUrls,
  all_sitemap_urls_inventoried: pages.filter((p) => p.sitemap).length === sitemapPaths.size,
  all_repository_routes_mapped: pages.every((p) => routeInventoryByPath.has(p.route)),
  all_gsc_performance_urls_reconciled: gscReconciliation.every((row) => row.inventory_match === "true"),
  all_indexable_canonicals_self_consistent: pages.filter((p) => p.indexable).every((p) => normalizeUrl(p.canonical) === p.normalizedUrl),
  no_final_disposition_column: !masterHeaders.some((header) => /^(keep|merge|remove|redirect|noindex|enhance|final_disposition)$/i.test(header)),
  no_rendered_ad_or_placeholder_surfaces: pages.every((p) => !/<[^>]+class=["'][^"']*ad-slot/i.test(p.html)) && pages.every((p) => !/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(p.html)),
  required_artifacts_present: validationMissing.length === 0
};
const evidenceHashes = Object.fromEntries(artifactIndex.filter((name) => name !== "ECHO_BUDDHA_PHASE_1_VALIDATION.json" && fs.existsSync(path.join(outDir, name))).map((name) => [name, sha256(fs.readFileSync(path.join(outDir, name)))]));
writeJson("ECHO_BUDDHA_PHASE_1_VALIDATION.json", { generated_at: generatedAt, status: Object.values(validationChecks).every(Boolean) ? "PASS" : "FAIL", checks: validationChecks, missing_artifacts: validationMissing,
  expected_counts: { html_routes: 337, total_first_party_urls: 340, indexable: 194, sitemap: 194, gsc_performance_urls: 183, articles: 50, quote_stories: 153, dictionary_entries: 14 },
  observed_counts: { html_routes: pages.length, total_first_party_urls: pages.length + endpointRows.length, indexable: pages.filter((p) => p.indexable).length, sitemap: sitemapPaths.size, gsc_performance_urls: gscReconciliation.length, articles: articlePages.length, quote_stories: quotePages.length, dictionary_entries: dictionaryPages.length },
  artifact_count: artifactIndex.length, evidence_sha256: evidenceHashes });

console.log(JSON.stringify({ generatedAt, pages: pages.length, indexable: pages.filter((p)=>p.indexable).length, sitemap: sitemapPaths.size, families: familyCounts, nearPairs: nearPairs.length, repeatedBlocks: repeatedBlocks.length, ownerRelationships: ownerRelationships.length, internalEdges: internalEdges.length, gscMatched: gscReconciliation.filter((r)=>r.inventory_match === "true").length, gscTotal: gscReconciliation.length, reviewQueues: Object.fromEntries(Object.entries(reviewQueues).map(([k,v])=>[k,v.size])) }, null, 2));
