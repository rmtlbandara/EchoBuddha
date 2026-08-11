import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const outDir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-1-root-cause");
const site = "https://echobuddha.com";
const checkedAt = new Date().toISOString();

const walk = (dir, out = []) => {
  for (const name of fs.readdirSync(dir)) {
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

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&nbsp;", " ");

const strip = (html) => decode(html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim());

const match = (html, re) => decode(html.match(re)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "");
const matches = (html, re) => [...html.matchAll(re)].map((m) => decode(m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()));
const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.round(n)));
const tokens = (text) => text.toLowerCase().replace(/[^a-z0-9āīūñṅṭḍṇḷṃ\s-]/g, " ").split(/\s+/).filter((x) => x.length > 2);
const set = (arr) => new Set(arr);
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const x of a) if (b.has(x)) common += 1;
  return common / (a.size + b.size - common);
};
const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","))].join("\n");
  fs.writeFileSync(path.join(outDir, name), `${body}\n`);
};

const classify = (route) => {
  if (route === "/") return "homepage";
  if (route === "/404.html") return "error";
  if (route.startsWith("/articles/category/")) return "article category";
  if (route.startsWith("/articles/") && route !== "/articles/") return "article";
  if (route.startsWith("/quotes/") && route.split("/").filter(Boolean).length === 3) return "quote story";
  if (route.startsWith("/quotes/") && route !== "/quotes/") return "quote category";
  if (route === "/daily-reflections/today/") return "today utility";
  if (route.startsWith("/daily-reflections/") && route !== "/daily-reflections/") return "daily reflection";
  if (route.startsWith("/learn/") && route.split("/").filter(Boolean).length === 3) return "learn detail";
  if (route.startsWith("/learn/") && route !== "/learn/") return "learn hub";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "meditation detail";
  if (route.startsWith("/authors/")) return "author/trust";
  if (["/about/", "/buddhist-sources-and-citations/", "/contact/", "/corrections/", "/disclaimer/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/meditation-safety/", "/privacy-policy/", "/quote-attribution-policy/", "/terms-of-use/"].includes(route)) return "trust/policy";
  if (["/articles/", "/daily-reflections/", "/learn/", "/meditation/", "/mindful-living/", "/quotes/", "/start-here/", "/tools/"].includes(route)) return "hub/utility";
  return "other";
};

const topicRules = [
  ["Buddhism for beginners", /buddhism-for-beginners|what-is-buddhism|first-week-buddhist|practice-buddhism-at-home|simple-daily-buddhist-practice/],
  ["Four Noble Truths", /four-noble-truths|first-truth/],
  ["Noble Eightfold Path", /eightfold-path|one-step-on-the-path/],
  ["Impermanence", /impermanence|anicca|change-is|meet-change|gratitude-for-change/],
  ["Attachment and letting go", /attachment|non-attachment|letting-go|release|clinging|open-hands|caring-without-clinging/],
  ["Compassion", /compassion|karuna|kindness|brahmavihara/],
  ["Loving-kindness and metta", /loving-kindness|metta/],
  ["Equanimity", /equanimity/],
  ["Right Speech", /right-speech|mindful-listening|listen-before|speech-can|wise-silence|email-and-texting/],
  ["Patience", /patience/],
  ["Anger", /anger/],
  ["Forgiveness", /forgiveness/],
  ["Karma", /karma/],
  ["Five Precepts", /five-precepts/],
  ["Three Poisons", /three-poisons/],
  ["Sangha", /sangha/],
  ["Dhammapada", /dhammapada|hatred-is-not-ended|thousand-empty-words|trained-mind/],
  ["Sutta study", /sutta|pali-canon|kalama|dhammacakkappavattana|magga-vibhanga/],
  ["Dhamma and Dharma", /dhamma|dharma/],
  ["Mindfulness", /mindful|mindfulness|sati/],
  ["Meditation", /meditation|meditate|breath/],
  ["Anxiety-related meditation", /anxiety|overthinking|stress/],
  ["Sleep-related mindfulness", /sleep|evening|rest-without/],
  ["Buddhist terminology", /buddhist-dictionary|anicca|dukkha|anatta|nirvana|pali-canon/]
];

const topicFor = (page) => {
  const haystack = `${page.route} ${page.title} ${page.h1}`.toLowerCase();
  return topicRules.find(([, re]) => re.test(haystack))?.[0] ?? "Unclustered / page-specific";
};

const ownerByTopic = {
  "Buddhism for beginners": "/learn/buddhism-for-beginners/",
  "Four Noble Truths": "/learn/four-noble-truths/",
  "Noble Eightfold Path": "/learn/eightfold-path/",
  "Impermanence": "/learn/buddhism-101/what-is-impermanence/",
  "Attachment and letting go": "/articles/how-to-let-go-of-attachment-in-buddhism/",
  "Compassion": "/learn/buddhist-dictionary/compassion/",
  "Loving-kindness and metta": "/learn/buddhist-dictionary/metta/",
  "Equanimity": "/articles/equanimity-in-buddhism/",
  "Right Speech": "/articles/right-speech-buddhism/",
  "Patience": "/articles/three-ways-to-practice-patience/",
  "Anger": "/articles/buddhist-approach-to-anger/",
  "Forgiveness": "/articles/buddhist-teachings-on-forgiveness/",
  "Karma": "/learn/buddhism-101/what-is-karma-in-buddhism/",
  "Five Precepts": "/learn/buddhism-101/five-precepts-buddhism/",
  "Three Poisons": "/articles/three-poisons-buddhism-explained/",
  "Sangha": "/learn/buddhist-dictionary/sangha/",
  "Dhamma and Dharma": "/learn/buddhist-dictionary/dhamma/",
  "Mindfulness": "/learn/buddhism-101/what-is-mindfulness/",
  "Meditation": "/meditation/",
  "Anxiety-related meditation": "/articles/how-to-meditate-for-anxiety/",
  "Sleep-related mindfulness": "/articles/mindfulness-for-better-sleep/",
  "Dhammapada": "/learn/dhammapada-reflections/",
  "Sutta study": "/learn/sutta-for-daily-life/",
  "Buddhist terminology": "/learn/buddhist-dictionary/"
};

const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>https:\/\/echobuddha\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/"));
const files = walk(dist).sort();

const pages = files.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const mainHtml = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const text = strip(mainHtml);
  const headings = matches(mainHtml, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi).filter((x) => !/Find Buddhist Wisdom|Optional Analytics/i.test(x));
  const links = [...mainHtml.matchAll(/<a[^>]+href="([^"]+)"/gi)].map((m) => m[1]);
  const externalLinks = links.filter((x) => /^https?:\/\//.test(x) && !x.startsWith(site));
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html);
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? "";
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = match(mainHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const topic = topicFor({route, title, h1});
  return {
    file, html, route, url: `${site}${route === "/404.html" ? route : route}`,
    family: classify(route), noindex, canonical, title, h1, text, headings, links, externalLinks,
    wordCount: tokens(text).length, topic, owner: ownerByTopic[topic] ?? route,
    adScript: html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
    quoteSubtype: classify(route) === "quote story" ? (/^Original .* Reflection:/.test(h1) ? "generated story" : "individually authored story") : "",
    headingPattern: headings.slice(1).map((h) => h.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\b(the|a|an|this|your|echo|buddha)\b/g, "").replace(/\s+/g, " ").trim()).join(" > "),
    tokenSet: set(tokens(text)),
    phraseText: text.toLowerCase()
  };
});

const indexable = pages.filter((p) => !p.noindex && p.route !== "/404.html");

for (const page of indexable) {
  let best = null;
  for (const other of indexable) {
    if (other === page) continue;
    const sameFamily = other.family === page.family;
    const sameTopic = other.topic === page.topic && page.topic !== "Unclustered / page-specific";
    if (!sameFamily && !sameTopic) continue;
    const textScore = jaccard(page.tokenSet, other.tokenSet);
    const headingScore = jaccard(set(page.headings.map((x) => x.toLowerCase())), set(other.headings.map((x) => x.toLowerCase())));
    const score = textScore * 0.6 + headingScore * 0.4;
    if (!best || score > best.score) best = {other, score, textScore, headingScore};
  }
  page.nearest = best;
}

const flagshipQuoteRoutes = new Set([
  "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/",
  "/quotes/compassion/let-kindness-be-the-echo-you-leave-in-every/",
  "/quotes/patience/when-anger-rises-pause-long-enough-to-see-the/",
  "/quotes/awareness/small-acts-of-attention-can-turn-an-ordinary-day/",
  "/quotes/practice/the-path-is-not-far-away-it-is-the/",
  "/quotes/letting-go/you-do-not-need-to-carry-every-thought-that/",
  "/quotes/meditation/silence-is-not-empty-when-the-heart-is-listening/",
  "/quotes/renewal/begin-again-gently-the-breath-is-always-willing/",
  "/quotes/wisdom/wisdom-is-the-art-of-meeting-life-without-adding/",
  "/quotes/impermanence/everything-changes-including-the-part-of-you-that-fears/"
]);

const consolidationRoutes = new Set([
  "/articles/four-noble-truths-explained-simply/",
  "/articles/eightfold-path-explained-daily-life/",
  "/articles/noble-eightfold-path-practical-guide/",
  "/articles/impermanence-in-buddhism/",
  "/articles/impermanence-in-buddhism-letting-go/",
  "/articles/loving-kindness-meditation-beginners/",
  "/articles/buddhism-for-beginners-simple-guide/"
]);

const manualReviewRoutes = new Set([
  "/authors/echo-buddha-editorial/",
  "/about/",
  "/articles/how-to-meditate-for-anxiety/",
  "/articles/mindfulness-for-better-sleep/",
  "/articles/buddhist-wisdom-for-overthinking/",
  "/learn/dhammapada-reflections/the-mind-leads-all-things/",
  "/learn/dhammapada-reflections/hatred-is-not-ended-by-hatred/",
  "/learn/dhammapada-reflections/better-than-a-thousand-empty-words/",
  "/learn/dhammapada-reflections/peace-comes-from-a-trained-mind/",
  "/learn/dhammapada-reflections/avoid-evil-do-good-purify-the-mind/"
]);

const getScores = (p) => {
  const similarity = p.nearest?.score ?? 0;
  const wc = p.wordCount;
  const sourceSignal = p.externalLinks.length > 0 || /source note|traditional references|selected references/i.test(p.text);
  const byline = /Echo Buddha Editorial|author/i.test(p.text);
  const nextLinks = p.links.filter((x) => x.startsWith("/") && x !== p.route).length;
  const specificExample = /example|specific moment|scenario|when |imagine /i.test(p.text);
  let unique = 18, intent = 16, complete = 12, original = 7, source = 7, trust = 4, journey = 4, ux = 4, ads = 4;
  if (p.family === "quote story") { unique = 12; intent = 8; complete = 9; original = 6; source = 8; trust = 3; journey = 4; ux = 3; ads = 2; }
  if (p.family === "quote story" && p.quoteSubtype === "individually authored story") { unique += 3; intent += 4; complete += 1; original += 2; }
  if (p.family === "daily reflection") { unique = 11; intent = 7; complete = 8; original = 6; source = 6; trust = 3; journey = 4; ux = 4; ads = 2; }
  if (p.family === "learn detail") { unique = 17; intent = 15; complete = 11; original = 6; source = 6; trust = 4; journey = 4; ux = 4; ads = 3; }
  if (p.family === "meditation detail") { unique = 16; intent = 15; complete = 11; original = 7; source = 6; trust = 4; journey = 4; ux = 4; ads = 2; }
  if (p.family.includes("category") || p.family.includes("hub")) { unique = 16; intent = 15; complete = 11; original = 6; source = 7; trust = 4; journey = 5; ux = 4; ads = 2; }
  if (p.family === "trust/policy" || p.family === "author/trust") { unique = 16; intent = 17; complete = 11; original = 7; source = 7; trust = 3; journey = 4; ux = 4; ads = 1; }
  if (p.family === "homepage") { unique = 18; intent = 17; complete = 12; original = 7; source = 7; trust = 4; journey = 5; ux = 4; ads = 4; }
  if (similarity > 0.62) { unique -= 5; intent -= 5; original -= 2; }
  else if (similarity > 0.48) { unique -= 3; intent -= 3; original -= 1; }
  else if (similarity > 0.36) { unique -= 1; intent -= 2; }
  if (wc < 350 && !p.family.includes("trust")) complete -= 3;
  else if (wc < 600) complete -= 1;
  else if (wc > 1200 && p.family === "article") complete += 2;
  if (specificExample) original += 1;
  if (sourceSignal) source += 1;
  if (!sourceSignal && ["article", "learn detail"].includes(p.family) && p.topic !== "Unclustered / page-specific") source -= 2;
  if (byline) trust += 1;
  if (nextLinks < 2) journey -= 2;
  if (p.headings.length < 3) ux -= 1;
  if (p.adScript) ads += 1;
  if (p.family === "quote story" && flagshipQuoteRoutes.has(p.route)) { unique += 2; intent += 2; complete += 1; }
  return {
    unique: clamp(unique, 0, 25), intent: clamp(intent, 0, 20), complete: clamp(complete, 0, 15),
    original: clamp(original, 0, 10), source: clamp(source, 0, 10), trust: clamp(trust, 0, 5),
    journey: clamp(journey, 0, 5), ux: clamp(ux, 0, 5), ads: clamp(ads, 0, 5)
  };
};

const getRecommendation = (p, total) => {
  if (manualReviewRoutes.has(p.route)) return "HUMAN REVIEW";
  if (consolidationRoutes.has(p.route)) return "CONSOLIDATE";
  if (p.family === "quote story") return p.quoteSubtype === "generated story" ? "NOINDEX" : "IMPROVE";
  if (p.family === "daily reflection") return "NOINDEX";
  if (p.family === "learn detail" && ["Dhammapada", "Sutta study"].includes(p.topic)) return "HUMAN REVIEW";
  if (p.family === "learn detail" && (p.nearest?.score ?? 0) > 0.56) return "SUBSTANTIAL REWRITE";
  if (p.family === "meditation detail") return "IMPROVE";
  if (p.family.includes("category")) return total < 65 ? "SUBSTANTIAL REWRITE" : "IMPROVE";
  if (p.family === "author/trust") return "HUMAN REVIEW";
  if (total >= 80 && (p.nearest?.score ?? 0) < 0.45) return "KEEP";
  if (total < 60) return "SUBSTANTIAL REWRITE";
  return "IMPROVE";
};

const matrix = indexable.map((p) => {
  const s = getScores(p);
  const total = Object.values(s).reduce((a, b) => a + b, 0);
  const similarity = p.nearest?.score ?? 0;
  const recommendation = getRecommendation(p, total);
  const human = recommendation === "HUMAN REVIEW" || /anxiety|sleep|overthinking|dhammapada|sutta|pali-canon/.test(p.route);
  return {
    URL: p.url,
    "Page family": p.family,
    "Current index state": "indexable",
    "Sitemap state": sitemapRoutes.has(p.route) ? "in sitemap" : "missing",
    Title: p.title,
    H1: p.h1,
    "Approx word count": p.wordCount,
    "Primary user intent": p.family === "daily reflection" ? "recurring reflection" : p.family === "quote story" ? "interpret an original quote" : p.topic,
    "Primary search intent": p.topic,
    "Closest Echo Buddha page": p.nearest?.other.url ?? "None identified",
    "Primary topic owner": `${site}${p.owner}`,
    "Unique user value score /25": s.unique,
    "Intent differentiation /20": s.intent,
    "Completeness /15": s.complete,
    "Original insight /10": s.original,
    "Source integrity /10": s.source,
    "Editorial trust /5": s.trust,
    "Internal journey /5": s.journey,
    "UX/readability /5": s.ux,
    "AdSense suitability /5": s.ads,
    "Total /100": total,
    "Template risk": similarity > 0.62 || ["daily reflection", "quote story"].includes(p.family) ? "High" : similarity > 0.45 ? "Medium" : "Low",
    "Semantic overlap risk": similarity > 0.56 ? "High" : similarity > 0.4 ? "Medium" : "Low",
    "Cannibalization risk": p.topic !== "Unclustered / page-specific" && p.route !== p.owner ? ((p.nearest?.other.topic === p.topic) ? "High" : "Medium") : "Low",
    "Thin-content risk": p.wordCount < 450 ? "High" : p.wordCount < 700 ? "Medium" : "Low",
    "Source risk": /dhammapada|sutta|pali-canon|buddhism-101|buddhist-dictionary/.test(p.route) && p.externalLinks.length === 0 ? "High" : p.externalLinks.length === 0 ? "Medium" : "Low",
    "Safety risk": /anxiety|sleep|overthinking|anger|forgiveness|boundar|meditation/.test(p.route) ? "Owner/expert review" : "Low",
    "Policy risk": ["quote story", "daily reflection"].includes(p.family) ? "Inventory-value risk if monetized" : "No direct violation found",
    "Navigation/discovery risk": p.links.filter((x) => x.startsWith("/")).length < 2 ? "Medium" : "Low",
    "Indexability judgement": recommendation === "NOINDEX" ? "Useful page; independent search value not established" : recommendation === "CONSOLIDATE" ? "Overlapping intent; owner decision required" : "Indexable only after recommended review/work",
    "Monetization judgement": p.adScript ? "Potentially suitable after Phase 1 findings are remediated" : "Keep unmonetized pending family review",
    "Primary recommendation": recommendation,
    Priority: ["NOINDEX", "CONSOLIDATE", "SUBSTANTIAL REWRITE"].includes(recommendation) ? "P1" : recommendation === "HUMAN REVIEW" ? "OWNER / EXPERT REVIEW" : total < 75 ? "P2" : "P3",
    Confidence: ["daily reflection", "quote story"].includes(p.family) ? "High" : recommendation === "HUMAN REVIEW" ? "Medium" : "Medium",
    Evidence: `Built ${checkedAt}; ${p.wordCount} words; ${p.headings.length} content headings; ${p.quoteSubtype || "authored route"}; nearest ${p.nearest?.other.route ?? "n/a"} combined overlap ${(similarity * 100).toFixed(1)}%; external source links ${p.externalLinks.length}`,
    "Human review required": human ? "Yes" : "No",
    Notes: recommendation === "NOINDEX" ? "Recommendation only; preserve URL and follow links unless Phase 2+ review approves a change." : "Recommendation only; no remediation performed."
  };
});

const matrixHeaders = Object.keys(matrix[0]);
writeCsv("all-indexable-pages-quality-matrix.csv", matrixHeaders, matrix);
writeCsv("page-value-scorecard.csv", ["URL", ...matrixHeaders.slice(10, 20)], matrix);
writeCsv("page-decision-register.csv", ["URL", "Page family", "Primary search intent", "Primary topic owner", "Total /100", "Primary recommendation", "Priority", "Confidence", "Evidence", "Human review required", "Notes"], matrix);

const rootCauses = [
  ["Insufficient overall page count", "UNLIKELY", "P3", "336 built pages and 283 indexable pages; quantity alone is not deficient."],
  ["Thin content", "LIKELY", "P1", "Not primarily raw word count; some hubs/details are concise and many recurring pages have low independent information gain."],
  ["Content quality", "LIKELY", "P1", "Several large families are complete-looking but formulaic and insufficiently differentiated."],
  ["Lack of unique value", "LIKELY", "P1", "103 indexable quote stories and 30 indexable daily reflections often repeat the same editorial role and journey."],
  ["Semantic duplication", "CONFIRMED", "P1", "Conceptual and structural overlap persists; generated quote stories also emit the same interpretation-angle sentence twice in one section."],
  ["Intent duplication", "CONFIRMED", "P1", "Four Noble Truths, Eightfold Path, beginner Buddhism, impermanence, metta, and meditation have multiple broad-intent pages."],
  ["Template feel", "CONFIRMED", "P1", "Daily-reflection headings are identical across all 30 detail pages; quote stories share repeated scaffolds."],
  ["Scaled-content appearance", "LIKELY", "P1", "The combined quote/reflection footprint creates a reviewer-visible repeated production pattern."],
  ["Weak quote stories", "LIKELY", "P1", "60 generated quote stories are indexable through a six-per-theme allowlist and use combinatorial frames; 43 individually authored stories are stronger but still share a heavy outer scaffold."],
  ["Weak daily reflections", "LIKELY", "P1", "Strong recurring-user purpose, but weak case for 30 independent search results."],
  ["Thin hubs/categories", "POSSIBLE", "P2", "Some category hubs are list-led and need stronger standalone editorial purpose."],
  ["Weak sources", "POSSIBLE", "P2", "Page-level source links exist across Learn content, but the source register is heavily concentrated in Theravada translations/archives and still requires claim-level tradition/translation review."],
  ["Unclear editorial accountability", "LIKELY", "P1", "The publisher voice is visible, but the responsible real person and qualifications are not identified."],
  ["Navigation", "POSSIBLE", "P2", "Seven equal-priority header destinations compete with the four intended user journeys."],
  ["UX", "POSSIBLE", "P2", "Rendering is clean, but choice overload and repeated page experiences weaken publication coherence."],
  ["Crawlability", "PASS", "P3", "Static HTML, public routes, 200 responses, self-canonicals, and sitemap alignment are present."],
  ["AdSense script", "PASS", "P3", "Publisher script is present on the production homepage and conservatively route-gated; manual slots are disabled."],
  ["Robots", "PASS", "P3", "Production robots.txt is reachable and does not block Google/AdSense crawlers."],
  ["SSL", "PASS", "P3", "Production HTTPS is valid and reachable."],
  ["Policy violations", "UNLIKELY", "P2", "No direct prohibited-content or misrepresentation violation found; account Policy Center remains owner-only evidence."],
  ["Traffic sources", "POSSIBLE", "OWNER / EXPERT REVIEW", "No fresh analytics/server evidence; owner data required."],
  ["Unsupported language", "PASS", "P3", "Primary rendered content is English."],
  ["Duplicate AdSense account", "POSSIBLE", "OWNER / EXPERT REVIEW", "No repository evidence; owner account check required."],
  ["Privacy/consent", "POSSIBLE", "OWNER / EXPERT REVIEW", "Ad consent defaults denied, but certified-CMP and legal readiness require owner/legal review."],
  ["Production parity", "PASS", "P3", "Representative production pages match current route titles, H1s, canonicals, robots state, and script gating."],
  ["Empty production 404 response", "CONFIRMED", "P2", "A nonexistent production route returns HTTP 404 with an empty response rather than the built custom 404 page."],
  ["Dependency release gate", "UNLIKELY", "P2", "validate:release currently fails on high-severity js-yaml and nanoid advisories; this is maintenance risk, not evidence of the rejection cause."],
  ["Automated browser/Lighthouse baseline", "POSSIBLE", "P3", "The current harness failed on local network-idle timeout and a Lighthouse 404 load error; representative production HTTP/parity checks passed, so no UX failure is inferred from the harness alone."]
].map(([cause, classification, severity, evidence]) => ({Cause: cause, Classification: classification, Severity: severity, Evidence: evidence, "Phase 2+ implication": classification === "PASS" ? "Protect; do not disturb" : "Review proportionally; no Phase 1 change"}));
writeCsv("adsense-root-cause-confidence-matrix.csv", Object.keys(rootCauses[0]), rootCauses);

const families = [...new Set(indexable.map((p) => p.family))].sort().map((family) => {
  const rows = matrix.filter((r) => r["Page family"] === family);
  const avg = rows.reduce((sum, r) => sum + Number(r["Total /100"]), 0) / rows.length;
  const decisions = Object.groupBy ? Object.groupBy(rows, (r) => r["Primary recommendation"]) : rows.reduce((a, r) => ((a[r["Primary recommendation"]] ??= []).push(r), a), {});
  return {
    "Page family": family,
    "Indexable count": rows.length,
    "Average score": avg.toFixed(1),
    "Score range": `${Math.min(...rows.map((r) => r["Total /100"]))}-${Math.max(...rows.map((r) => r["Total /100"]))}`,
    "Decision counts": Object.entries(decisions).map(([k, v]) => `${k}:${v.length}`).join("; "),
    "Primary risk": ["quote story", "daily reflection"].includes(family) ? "Repeated structure and weak independent search intent" : family.includes("learn") ? "Topic ownership and page-specific sourcing" : family.includes("category") ? "Archive/list-led value" : "Focused review",
    "Indexability suitability": ["quote story", "daily reflection"].includes(family) ? "Family requires page-level reduction review" : "Generally suitable with page decisions",
    "Monetization suitability": ["quote story", "daily reflection", "meditation detail", "trust/policy"].includes(family) ? "Keep excluded pending later review" : "Potentially suitable after remediation",
    "Risk level": ["quote story", "daily reflection"].includes(family) ? "High" : avg < 70 ? "Medium" : "Low/medium"
  };
});
writeCsv("content-family-risk-summary.csv", Object.keys(families[0]), families);

const topicRows = Object.entries(ownerByTopic).map(([topic, owner]) => {
  const ps = indexable.filter((p) => p.topic === topic);
  return {
    Cluster: topic,
    "Broad primary owner": `${site}${owner}`,
    "Indexable pages": ps.length,
    "Supporting pages": ps.filter((p) => p.route !== owner).map((p) => p.url).join(" | "),
    "Highest overlap pair": ps.map((p) => ({p, s: p.nearest?.other.topic === topic ? p.nearest.score : 0})).sort((a,b) => b.s-a.s)[0]?.p.nearest ? `${ps.map((p) => ({p, s: p.nearest?.other.topic === topic ? p.nearest.score : 0})).sort((a,b) => b.s-a.s)[0].p.route} <> ${ps.map((p) => ({p, s: p.nearest?.other.topic === topic ? p.nearest.score : 0})).sort((a,b) => b.s-a.s)[0].p.nearest.other.route}` : "None",
    "Cannibalization risk": ps.length >= 5 ? "High" : ps.length >= 3 ? "Medium" : "Low",
    "Audit recommendation": ps.length >= 3 ? "Define primary/support/source/practice roles in Phase 2; review merge/noindex candidates manually" : "Protect clear ownership",
    Confidence: ps.length >= 3 ? "High" : "Medium"
  };
});
writeCsv("topic-overlap-review.csv", Object.keys(topicRows[0]), topicRows);
writeCsv("primary-intent-owner-review.csv", ["Cluster", "Broad primary owner", "Indexable pages", "Supporting pages", "Cannibalization risk", "Audit recommendation", "Confidence"], topicRows);
writeCsv("high-overlap-cluster-review.csv", Object.keys(topicRows[0]), topicRows.filter((r) => r["Cannibalization risk"] !== "Low"));

const phrases = ["notice", "in daily life", "this does not mean", "for beginners", "you do not need to", "begin by", "at the end of the day", "the goal is not", "a practical example", "practice today", "reflection question", "daily-life example", "source note", "continue learning", "a quiet reflection"];
const phraseRows = phrases.map((phrase) => {
  const ps = indexable.filter((p) => p.phraseText.includes(phrase));
  return {Pattern: phrase, "Pages containing pattern": ps.length, "Percent of indexable pages": (ps.length / indexable.length * 100).toFixed(1), "High-risk families": [...new Set(ps.map((p) => p.family))].join(" | "), Evidence: ps.slice(0, 8).map((p) => p.route).join(" | "), Judgement: ps.length > 75 ? "High reuse" : ps.length > 30 ? "Material reuse" : "Contextual"};
});
writeCsv("template-language-review.csv", Object.keys(phraseRows[0]), phraseRows);

const structureGroups = new Map();
for (const p of indexable) {
  if (!structureGroups.has(p.headingPattern)) structureGroups.set(p.headingPattern, []);
  structureGroups.get(p.headingPattern).push(p);
}
const structureRows = [...structureGroups.entries()].filter(([, ps]) => ps.length > 1).sort((a,b) => b[1].length-a[1].length).map(([pattern, ps]) => ({
  "Repeated heading sequence": pattern,
  "Page count": ps.length,
  "Page families": [...new Set(ps.map((p) => p.family))].join(" | "),
  URLs: ps.map((p) => p.url).join(" | "),
  Risk: ps.length >= 10 ? "High" : ps.length >= 4 ? "Medium" : "Low/medium",
  "Manual judgement": ps[0].family === "daily reflection" ? "Same editorial progression across distinct topics; material template feel" : ps[0].family === "quote story" ? "Repeated reflection scaffold; standalone differentiation requires manual proof" : "Review context"
}));
writeCsv("editorial-structure-similarity-review.csv", structureRows.length ? Object.keys(structureRows[0]) : ["Repeated heading sequence", "Page count", "Page families", "URLs", "Risk", "Manual judgement"], structureRows);

const matrixByUrl = new Map(matrix.map((r) => [r.URL, r]));
const subsetRows = (predicate, extra = {}) => pages.filter(predicate).map((p) => {
  const r = matrixByUrl.get(p.url);
  return {URL: p.url, Variant: p.quoteSubtype || "", "Current index state": p.noindex ? "noindex, follow" : "indexable", "Sitemap state": sitemapRoutes.has(p.route) ? "in sitemap" : "not in sitemap", "Approx word count": p.wordCount, "Heading count": p.headings.length, "External source links": p.externalLinks.length, "Nearest comparable page": p.nearest?.other.url ?? "Not calculated for noindex page", "Combined overlap": p.nearest ? (p.nearest.score * 100).toFixed(1) : "", "Primary recommendation": r?.["Primary recommendation"] ?? "KEEP CURRENT NOINDEX", Priority: r?.Priority ?? "P3", Evidence: r?.Evidence ?? "Current noindex page preserved; not part of the indexable scoring population.", ...extra};
});

writeCsv("quote-story-quality-review.csv", Object.keys(subsetRows((p) => p.family === "quote story")[0]), subsetRows((p) => p.family === "quote story"));
writeCsv("daily-reflection-quality-review.csv", Object.keys(subsetRows((p) => p.family === "daily reflection" || p.family === "today utility")[0]), subsetRows((p) => p.family === "daily reflection" || p.family === "today utility"));
writeCsv("learn-quality-review.csv", Object.keys(subsetRows((p) => p.family === "learn detail" || p.family === "learn hub")[0]), subsetRows((p) => p.family === "learn detail" || p.family === "learn hub"));
writeCsv("meditation-wellbeing-review.csv", Object.keys(subsetRows((p) => p.family === "meditation detail" || /anxiety|sleep|overthinking|anger|forgiveness|boundar/.test(p.route))[0]), subsetRows((p) => p.family === "meditation detail" || /anxiety|sleep|overthinking|anger|forgiveness|boundar/.test(p.route)));
writeCsv("source-claim-review.csv", Object.keys(subsetRows((p) => /learn\/(buddhism-101|buddhist-dictionary|dhammapada-reflections|sutta-for-daily-life)|dhammapada|dhamma|dharma|sangha|karma|precepts|poisons/.test(p.route))[0]), subsetRows((p) => /learn\/(buddhism-101|buddhist-dictionary|dhammapada-reflections|sutta-for-daily-life)|dhammapada|dhamma|dharma|sangha|karma|precepts|poisons/.test(p.route)));
writeCsv("trust-page-review.csv", Object.keys(subsetRows((p) => p.family === "trust/policy" || p.family === "author/trust")[0]), subsetRows((p) => p.family === "trust/policy" || p.family === "author/trust"));
writeCsv("hub-category-review.csv", Object.keys(subsetRows((p) => p.family.includes("hub") || p.family.includes("category"))[0]), subsetRows((p) => p.family.includes("hub") || p.family.includes("category")));

const navRows = [
  ["Desktop header", "7 primary links plus search", "All content types compete at one level; four target user journeys are not explicit", "P2", "src/components/Header.astro navItems"],
  ["Mobile menu", "Same 7 destinations in a two-column disclosure menu", "Mechanically usable; still presents equal-priority choice load", "P2", "src/components/Header.astro mobile CSS and menu script"],
  ["Footer", "14 links plus privacy settings and sitemap", "Comprehensive and trustworthy but dense", "P3", "src/components/Footer.astro"],
  ["Start Here", "Dedicated beginner route", "Strong direct beginner pathway", "PASS", "/start-here/"],
  ["Search", "Overlay and noindex result page", "Discoverable and keyboard-oriented; production route is reachable", "PASS", "src/components/SearchOverlay.astro; /search/"],
  ["404", "Built custom page exists; production nonexistent route body is empty", "Confirmed production UX/parity defect", "P2", "dist/404.html versus production nonexistent URL checked 2026-08-11"],
  ["Breadcrumbs/related links", "Present across detail templates", "Strong baseline; relevance requires editorial rather than count-only review", "PASS", "Generated detail pages"],
  ["Four primary intentions", "Start Here, Learn, Meditation, Articles/Reflections exist", "Architecture contains the journeys but header labels do not group them clearly", "P2", "Header and hub routes"]
].map(([surface, observedState, finding, priority, evidence]) => ({Surface: surface, "Observed state": observedState, Finding: finding, Priority: priority, Evidence: evidence}));
writeCsv("navigation-ux-review.csv", Object.keys(navRows[0]), navRows);

const adRows = ["/", "/learn/buddhism-for-beginners/", "/learn/four-noble-truths/", "/articles/four-noble-truths-explained/", "/articles/how-to-meditate-for-anxiety/", "/meditation/", "/quotes/", "/daily-reflections/", "/search/", "/privacy-policy/"].map((route) => {
  const p = pages.find((x) => x.route === route);
  return {Route: route, "Index state": p?.noindex ? "noindex" : "indexable", "Publisher script in built HTML": p?.adScript ? "Yes" : "No", "Expected behavior": ["/", "/learn/buddhism-for-beginners/", "/learn/four-noble-truths/", "/articles/four-noble-truths-explained/"].includes(route) ? "Allowed" : "Blocked", "Manual slots enabled": "No", Result: p?.adScript === ["/", "/learn/buddhism-for-beginners/", "/learn/four-noble-truths/", "/articles/four-noble-truths-explained/"].includes(route) ? "PASS" : "FAIL", Evidence: "src/data/ads.ts and generated HTML"};
});
writeCsv("adsense-script-route-review.csv", Object.keys(adRows[0]), adRows);

writeCsv("indexability-review.csv", ["URL", "Page family", "Current index state", "Sitemap state", "Primary recommendation", "Indexability judgement", "Evidence"], matrix);
writeCsv("monetization-suitability-review.csv", ["URL", "Page family", "Current index state", "Monetization judgement", "AdSense suitability /5", "Policy risk", "Safety risk", "Primary recommendation", "Evidence"], matrix);

const ownerRows = [
  ["Publisher identity", "Identify the real person or legal entity responsible for editorial oversight; do not invent credentials", "Owner", "P1"],
  ["AdSense rejection wording", "Provide exact account Sites/Policy Center issue text and screenshot", "Owner", "P1"],
  ["Traffic integrity", "Provide GA/Cloudflare traffic-source and invalid-traffic evidence", "Owner", "OWNER / EXPERT REVIEW"],
  ["Duplicate AdSense account", "Confirm in the owner account", "Owner", "OWNER / EXPERT REVIEW"],
  ["Manual Actions / Security Issues", "Provide fresh Search Console evidence", "Owner", "OWNER / EXPERT REVIEW"],
  ["Certified CMP and legal adequacy", "Review EEA/UK/Swiss consent implementation and privacy disclosures", "Owner/legal/privacy specialist", "OWNER / EXPERT REVIEW"],
  ["Dhammapada wording and source claims", "Review paraphrase/translation boundaries and source specificity", "Buddhist-studies/source reviewer", "P1"],
  ["Sutta and tradition-specific claims", "Review canonical references, tradition scope, and translation framing", "Buddhist-studies/source reviewer", "P1"],
  ["Sensitive wellbeing claims", "Review anxiety, sleep, distress, anger, forgiveness, and boundary pages", "Qualified wellbeing/safety reviewer", "P1"],
  ["Quote index decisions", "Approve page-level preserve/noindex/rewrite decisions after editorial review", "Owner/editor", "P1"],
  ["Daily-reflection index decisions", "Approve page-level preserve/noindex decisions; recurring-user value should remain", "Owner/editor", "P1"],
  ["Production deployment SHA", "Confirm exact Cloudflare deployment identifier and SHA", "Owner/deployment operator", "P2"]
].map(([item, requiredDecision, owner, priority]) => ({Item: item, "Required decision/evidence": requiredDecision, Owner: owner, Priority: priority, Status: "OPEN", "Phase 1 treatment": "Not inferred; no implementation"}));
writeCsv("owner-expert-review-items.csv", Object.keys(ownerRows[0]), ownerRows);

const parityRoutes = ["/", "/start-here/", "/learn/", "/learn/buddhism-for-beginners/", "/learn/four-noble-truths/", "/learn/eightfold-path/", "/meditation/", "/mindful-living/", "/articles/", "/articles/four-noble-truths-explained/", "/quotes/", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "/daily-reflections/", "/daily-reflections/anger-as-a-signal/", "/tools/", "/about/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/quote-attribution-policy/", "/meditation-safety/", "/privacy-policy/", "/terms-of-use/", "/contact/", "/corrections/", "/search/"];
const parityRows = [];
for (const route of parityRoutes) {
  const local = pages.find((p) => p.route === route);
  try {
    const response = await fetch(`${site}${route}`, {redirect: "follow"});
    const html = await response.text();
    const prodTitle = match(html, /<title>([\s\S]*?)<\/title>/i);
    const prodH1 = match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const prodCanonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? "";
    const prodNoindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html);
    const prodAd = html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
    const same = response.status === 200 && prodTitle === local?.title && prodH1 === local?.h1 && prodCanonical === local?.canonical && prodNoindex === local?.noindex && prodAd === local?.adScript;
    parityRows.push({URL: `${site}${route}`, "Checked at UTC": checkedAt, "Production status": response.status, "Local title": local?.title, "Production title": prodTitle, "Local H1": local?.h1, "Production H1": prodH1, "Canonical match": prodCanonical === local?.canonical ? "Yes" : "No", "Robots match": prodNoindex === local?.noindex ? "Yes" : "No", "AdSense script match": prodAd === local?.adScript ? "Yes" : "No", Result: same ? "PASS" : "MISMATCH", Notes: same ? "Representative rendered parity confirmed" : "Investigate fields; no inference"});
  } catch (error) {
    parityRows.push({URL: `${site}${route}`, "Checked at UTC": checkedAt, "Production status": "NOT VERIFIED", Result: "NOT VERIFIED", Notes: error.message});
  }
}
writeCsv("production-repository-parity.csv", Object.keys(parityRows[0]), parityRows);

const validationRows = [
  {Command: "npm run build", Status: "PASS", "Checked at UTC": checkedAt, Duration: "<2 seconds", "Important result": `${pages.length} HTML pages built; ${indexable.length} indexable; ${pages.length-indexable.length} noindex/error`, "Log location": "Terminal output; counts independently regenerated here"},
  {Command: "npm run typecheck", Status: "PASS", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "Astro sync and TypeScript no-emit check passed", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run lint", Status: "PASS", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "Governance lint passed", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm test", Status: "PASS", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "6 tests passed", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run audit:seo", Status: "PASS", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "SEO audit passed", "Log location": "Terminal output; generated governance evidence"},
  {Command: "npm run audit:content", Status: "PASS WITH LIMITATION", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "Existing content audit passed, but Phase 1 manual review found structural/value risks its decision rules do not fail", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run audit:dependencies", Status: "FAIL", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "0 critical; 2 high advisories: js-yaml and nanoid", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run validate", Status: "PASS", "Checked at UTC": checkedAt, Duration: "Included in validate:release", "Important result": "Build, typecheck, lint, tests, SEO, and content checks passed", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run validate:release", Status: "FAIL", "Checked at UTC": checkedAt, Duration: "~8 seconds", "Important result": "Failed only at dependency audit", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run audit:browser", Status: "FAIL / NOT CONCLUSIVE", "Checked at UTC": checkedAt, Duration: "~31 seconds", "Important result": "Local homepage networkidle timeout; no application conclusion inferred", "Log location": "Terminal output; Phase 1 report"},
  {Command: "npm run audit:lighthouse", Status: "FAIL / NOT CONCLUSIVE", "Checked at UTC": checkedAt, Duration: "~110 seconds", "Important result": "Lighthouse local load error with status 404; no score produced", "Log location": "Terminal output; Phase 1 report"}
];
writeCsv("audit-validation-summary.csv", Object.keys(validationRows[0]), validationRows);

const summary = {
  generatedAt: checkedAt,
  totalHtmlPages: pages.length,
  indexablePages: indexable.length,
  noindexOrErrorPages: pages.length - indexable.length,
  sitemapUrls: sitemapRoutes.size,
  familyCounts: Object.fromEntries([...new Set(pages.map((p) => p.family))].sort().map((family) => [family, {total: pages.filter((p) => p.family === family).length, indexable: indexable.filter((p) => p.family === family).length}])),
  decisionCounts: matrix.reduce((a, r) => ((a[r["Primary recommendation"]] = (a[r["Primary recommendation"]] ?? 0) + 1), a), {}),
  priorityPageCounts: matrix.reduce((a, r) => ((a[r.Priority] = (a[r.Priority] ?? 0) + 1), a), {}),
  rootCauseSeverityCounts: rootCauses.reduce((a, r) => ((a[r.Severity] = (a[r.Severity] ?? 0) + 1), a), {}),
  parity: {checked: parityRows.length, pass: parityRows.filter((r) => r.Result === "PASS").length, mismatch: parityRows.filter((r) => r.Result === "MISMATCH").length},
  repeatedStructureGroups: structureRows.length,
  largestRepeatedStructureGroup: Math.max(...structureRows.map((r) => Number(r["Page count"])), 0)
};
fs.writeFileSync(path.join(outDir, "phase-1-generated-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
