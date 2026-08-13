import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST = process.env.PHASE5_DIST || path.join(ROOT, "dist");
const RECON = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/reconciliation");
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-5-template-content-remediation");
const BASE = "https://echobuddha.com";
const stage = process.argv.includes("--post") ? "post" : "pre";
await mkdir(OUT, { recursive: true });

const decode = (text) => text
  .replaceAll("&nbsp;", " ").replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
const clean = (html) => decode(html.replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replaceAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
  .replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim());
const first = (html, regex) => clean(html.match(regex)?.[1] ?? "");
const normalize = (text) => text.toLowerCase().replaceAll(/[“”‘’]/g, "'").replaceAll(/[^a-z0-9' ]+/g, " ").replaceAll(/\s+/g, " ").trim();
const hash = (value) => createHash("sha256").update(value).digest("hex").slice(0, 16);
const csvEscape = (value) => /[",\n\r]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
const writeCsv = async (name, rows, headers = Object.keys(rows[0] ?? {})) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  await writeFile(path.join(OUT, name), `${body}\n`);
};
const parseCsv = (text) => {
  const records = []; let record = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { record.push(field); field = ""; }
    else if (char === "\n") { record.push(field); records.push(record); record = []; field = ""; }
    else if (char !== "\r") field += char;
  }
  const headers = records.shift() ?? [];
  return records.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
};
const walk = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir)) {
    const absolute = path.join(dir, entry);
    const info = await stat(absolute);
    files.push(...(info.isDirectory() ? await walk(absolute) : [absolute]));
  }
  return files;
};
const routeFor = (file) => {
  const relative = path.relative(DIST, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -10)}`;
  return `/${relative}`;
};
const groupBy = (items, key) => {
  const groups = new Map();
  for (const item of items) {
    const value = key(item);
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), item]);
  }
  return groups;
};
const countMatches = (text, patterns) => patterns.reduce((total, pattern) => total + (text.match(pattern)?.length ?? 0), 0);
const clamp = (value, max) => Math.min(max, Math.round(value));
const similarity = (left, right) => {
  const a = new Set(left); const b = new Set(right);
  const union = new Set([...a, ...b]);
  return union.size ? [...a].filter((value) => b.has(value)).length / union.size : 0;
};

const masterRows = parseCsv(await readFile(path.join(RECON, "MASTER_PHASE_0_4_RECONCILED_PAGE_REGISTER.csv"), "utf8"));
const masterByUrl = new Map(masterRows.map((row) => [row.URL, row]));
const handoffRows = parseCsv(await readFile(path.join(RECON, "phase-0-4-phase5-handoff.csv"), "utf8"));
const handoffByUrl = new Map(handoffRows.map((row) => [row["URL / Page family"], row]));

const protectedFamily = (family, route) => /trust|policy|legal|utility|error|search|author|contact|about|tool/i.test(family) || ["/", "/start-here/"].includes(route);
const transitionPatterns = [/\bnotice\b/gi, /\bpause\b/gi, /\bbegin by\b/gi, /\bin daily life\b/gi, /\bthis does not mean\b/gi, /\bone way to practice\b/gi, /\bfor one day\b/gi, /\bwhen this happens\b/gi, /\bthe goal is not\b/gi, /\binstead of\b/gi, /\bask yourself\b/gi, /\ba useful reflection\b/gi];
const genericIntroPatterns = [/\bin (?:today's|modern) (?:busy )?(?:life|world)\b/gi, /\bbuddhist (?:teaching|wisdom|practice) (?:offers|helps|invites)\b/gi, /\bfor beginners\b/gi, /\bmany people\b/gi, /\bit is easy to\b/gi, /\bcan help (?:us|you)\b/gi];
const fillerPatterns = [/\byou do not need to\b/gi, /\bsmall (?:step|practice|moment)\b/gi, /\bgently\b/gi, /\bmore peaceful\b/gi, /\bbring .* into (?:daily|ordinary) life\b/gi];
const practiceTerms = ["pause", "breath", "breathe", "notice", "name", "soften", "return", "reflect", "journal"];
const examplePatterns = [/\bdifficult (?:email|message)\b/gi, /\btraffic\b/gi, /\bworkplace\b/gi, /\bfamily (?:argument|disagreement|conversation)\b/gi, /\bslow (?:queue|line)\b/gi, /\bphone\b/gi];
const conclusionPatterns = [/\bsmall (?:step|practice|moment)\b/gi, /\bpeace\b/gi, /\bcarry .* into (?:the|your) day\b/gi, /\bpractice (?:today|daily)\b/gi, /\bnotice\b/gi, /\bbegin again\b/gi];

const files = (await walk(DIST)).filter((file) => file.endsWith(".html")).sort();
const pages = [];
for (const file of files) {
  const route = routeFor(file); const url = `${BASE}${route}`; const html = await readFile(file, "utf8");
  const master = masterByUrl.get(url) ?? {};
  const family = master["Page family"] || "unmapped";
  const role = master["Current primary role"] || "UNMAPPED";
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  // Hub pages contain repeated card <article> elements. Restrict article extraction to
  // long-form detail families so a hub is fingerprinted as a hub, not as its first card.
  const article = /^(article|daily reflection|quote story|learn detail|meditation detail)$/i.test(family)
    ? main.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? main
    : main;
  const headings = [...article.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => clean(match[2])).filter(Boolean);
  const paragraphs = [...article.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => clean(match[1])).filter((text) => text.length > 20);
  const lede = first(article, /<p\b[^>]*class=["'][^"']*\blede\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) || paragraphs[0] || "";
  const firstSentence = lede.split(/(?<=[.!?])\s+/)[0] ?? lede;
  const ending = paragraphs.slice(-3).join(" ");
  const bodyText = clean(article);
  const normalizedText = normalize(bodyText);
  const faqHeadings = headings.filter((heading) => /faq|common questions?|questions? about|can beginners|how often/i.test(heading));
  const practiceHits = practiceTerms.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(bodyText));
  pages.push({
    route, url, html, article, title: first(html, /<title[^>]*>([\s\S]*?)<\/title>/i), h1: first(article, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    family, role, master, handoff: handoffByUrl.get(url), headings, headingKey: headings.map(normalize).join(" > "), paragraphs,
    lede, firstSentence, firstSentenceKey: normalize(firstSentence), ending, endingKey: normalize(ending), bodyText, normalizedText,
    faqHeadings, faqSchema: /"@type"\s*:\s*"FAQPage"/i.test(html), practiceHits,
    hasPractice: headings.some((heading) => /practice|meditat|try|exercise|today/i.test(heading)) || practiceHits.length >= 4,
    hasExample: headings.some((heading) => /example|scenario|situation|story|moment/i.test(heading)),
    hasSource: headings.some((heading) => /source|reference|reading|origin|translation/i.test(heading)),
    hasSafety: headings.some((heading) => /safety|gentle practice|before.*practice/i.test(heading)) || /professional support|not medical advice|unsafe|abuse|coercion/i.test(bodyText),
    hasReflection: headings.some((heading) => /reflection|journal|question/i.test(heading)),
    indexState: master["Current index state"] || (/noindex/i.test(html) ? "noindex, follow" : "indexable")
  });
}

const introGroups = groupBy(pages, (page) => page.firstSentenceKey);
const headingGroups = groupBy(pages, (page) => page.headingKey);
const endingGroups = groupBy(pages, (page) => page.endingKey);
const sentenceGroups = new Map(); const paragraphGroups = new Map();
for (const page of pages) {
  for (const sentence of page.bodyText.split(/(?<=[.!?])\s+/).map(normalize).filter((value) => value.split(" ").length >= 10)) {
    sentenceGroups.set(sentence, new Set([...(sentenceGroups.get(sentence) ?? []), page.url]));
  }
  for (const paragraph of page.paragraphs.map(normalize).filter((value) => value.split(" ").length >= 18)) {
    paragraphGroups.set(paragraph, new Set([...(paragraphGroups.get(paragraph) ?? []), page.url]));
  }
}
const duplicatedSentenceGroups = [...sentenceGroups.entries()].filter(([, urls]) => urls.size > 1);
const duplicatedParagraphGroups = [...paragraphGroups.entries()].filter(([, urls]) => urls.size > 1);

for (const page of pages) {
  const introCluster = introGroups.get(page.firstSentenceKey) ?? [];
  const headingCluster = headingGroups.get(page.headingKey) ?? [];
  const endingCluster = endingGroups.get(page.endingKey) ?? [];
  const genericIntroHits = countMatches(page.lede, genericIntroPatterns);
  const introRisk = protectedFamily(page.family, page.route) ? 0 : clamp((introCluster.length > 2 ? 8 : introCluster.length > 1 ? 4 : 0) + genericIntroHits * 3, 15);
  const crossFamilyInHeadingCluster = new Set(headingCluster.map((item) => item.family)).size > 1;
  const headingRisk = protectedFamily(page.family, page.route) ? 0 : clamp((headingCluster.length > 8 ? 8 : headingCluster.length > 2 ? 5 : 0) + (crossFamilyInHeadingCluster ? 7 : 0), 15);
  const transitionHits = countMatches(page.bodyText, transitionPatterns);
  const transitionRisk = protectedFamily(page.family, page.route) ? 0 : clamp((transitionHits / Math.max(1, page.bodyText.split(/\s+/).length)) * 350, 10);
  const scaffoldCount = page.practiceHits.length;
  // Practice vocabulary is expected on genuine practice content. Include the page's
  // title and reconciled topic cluster so a meditation article is not misclassified
  // merely because the broad register family is "article".
  const practiceRelevant = /meditation|mindful|daily reflection|quote|practice|breath/i.test(
    `${page.family} ${page.role} ${page.title} ${page.h1} ${page.master["Primary topic cluster"] ?? ""}`
  );
  const practiceRisk = page.hasPractice ? clamp((scaffoldCount >= 7 ? 10 : scaffoldCount >= 5 ? 7 : 3) + (!practiceRelevant && scaffoldCount >= 5 ? 5 : 0), 15) : 0;
  const faqMismatch = page.faqSchema && page.faqHeadings.length === 0;
  const faqRisk = clamp((faqMismatch ? 10 : 0) + (page.faqHeadings.length > 3 ? 6 : page.faqHeadings.length ? 3 : 0), 10);
  const conclusionHits = countMatches(page.ending, conclusionPatterns);
  const conclusionRisk = protectedFamily(page.family, page.route) ? 0 : clamp((endingCluster.length > 2 ? 6 : 0) + conclusionHits * 2, 10);
  const exampleHits = countMatches(page.bodyText, examplePatterns);
  const exampleRisk = protectedFamily(page.family, page.route) ? 0 : clamp(exampleHits * 2, 10);
  let closest; let closestScore = 0;
  for (const candidate of pages) {
    if (candidate.url === page.url || candidate.family === page.family) continue;
    const score = similarity(page.headings.map(normalize), candidate.headings.map(normalize));
    if (score > closestScore) { closest = candidate; closestScore = score; }
  }
  const crossRisk = protectedFamily(page.family, page.route) ? 0 : clamp(closestScore * 10, 10);
  const fillerHits = countMatches(page.bodyText, fillerPatterns);
  const fillerRisk = protectedFamily(page.family, page.route) ? 0 : clamp(fillerHits, 5);
  const score = introRisk + headingRisk + transitionRisk + practiceRisk + faqRisk + conclusionRisk + exampleRisk + crossRisk + fillerRisk;
  const classification = score >= 60 ? "CRITICAL" : score >= 40 ? "HIGH" : score >= 20 ? "MODERATE" : "LOW";
  Object.assign(page, { introCluster, headingCluster, endingCluster, genericIntroHits, introRisk, headingRisk, transitionHits, transitionRisk, scaffoldCount, practiceRisk, faqMismatch, faqRisk, conclusionHits, conclusionRisk, exampleHits, exampleRisk, closest, closestScore, crossRisk, fillerHits, fillerRisk, score, classification });
}

const riskRows = pages.map((page) => ({
  URL: page.url, "Page family": page.family, "Topic cluster": page.master["Primary topic cluster"] ?? "", "Page role": page.role,
  "Primary owner": page.master["Primary owner URL"] ?? "", "Current index state": page.indexState, "Phase 4 quality state": page.master["Phase 4 reconciled content state"] ?? "",
  "Repeated introduction risk": page.introRisk, "Heading-sequence risk": page.headingRisk, "Transition risk": page.transitionRisk,
  "Practice-scaffold risk": page.practiceRisk, "FAQ risk": page.faqRisk, "Conclusion risk": page.conclusionRisk,
  "Portable example risk": page.exampleRisk, "Cross-family structural risk": page.crossRisk, "Generic filler risk": page.fillerRisk,
  "Protected repetition present?": page.hasSafety || page.hasSource || protectedFamily(page.family, page.route) ? "Yes" : "No",
  "Total template-risk score": page.score, "Risk classification": page.classification,
  Validation: stage === "post" ? "POST_EDIT_DIAGNOSTIC_COMPLETE" : "PRE_EDIT_BASELINE_CAPTURED",
  "Human review required?": ["CRITICAL", "HIGH"].includes(page.classification) || page.handoff?.["Human review needed?"] === "Yes" ? "Yes" : "No",
  Evidence: `intro cluster ${page.introCluster.length}; heading cluster ${page.headingCluster.length}; transition hits ${page.transitionHits}; practice terms ${page.scaffoldCount}; closest cross-family ${page.closest?.url ?? "N/A"} ${(page.closestScore * 100).toFixed(1)}%`,
  "Recommended action": page.classification === "CRITICAL" ? "P0 manual editorial remediation" : page.classification === "HIGH" ? "P1 targeted remediation" : page.classification === "MODERATE" ? "Review only if pattern is substantively portable" : "Protect; no edit required"
}));

const fingerprintRows = pages.map((page) => ({
  URL: page.url, "Page family": page.family, Role: page.role,
  "Heading 1": page.headings[0] ?? "", "Heading 2": page.headings[1] ?? "", "Heading 3": page.headings[2] ?? "", "Heading 4": page.headings[3] ?? "", "Heading 5": page.headings[4] ?? "",
  "Heading count": page.headings.length, "FAQ present?": page.faqHeadings.length || page.faqSchema ? "Yes" : "No", "Practice block?": page.hasPractice ? "Yes" : "No",
  "Example block?": page.hasExample ? "Yes" : "No", "Source block?": page.hasSource ? "Yes" : "No", "Safety block?": page.hasSafety ? "Yes" : "No", "Reflection block?": page.hasReflection ? "Yes" : "No",
  "Conclusion type": page.conclusionHits ? "GENERIC_PATTERN_PRESENT" : "TOPIC_SPECIFIC_OR_NONE", "Next-step type": page.headings.some((heading) => /continue|related|next/i.test(heading)) ? "RELATED_LINK_BLOCK" : "NONE_OR_INLINE",
  Fingerprint: hash(page.headingKey), "Closest structural match": page.closest?.url ?? "", "Similarity level": `${(page.closestScore * 100).toFixed(1)}%`,
  "Legitimate similarity?": page.closestScore < 0.6 || protectedFamily(page.family, page.route) ? "Yes / low or protected" : "Human review required",
  Reason: page.closestScore < 0.6 ? "No high cross-family heading overlap" : "Different families share a substantial heading vocabulary"
}));

const queueRows = pages.filter((page) => ["CRITICAL", "HIGH"].includes(page.classification)).map((page) => ({
  Priority: page.classification === "CRITICAL" && /index/i.test(page.indexState) && !/noindex/i.test(page.indexState) ? "P0" : page.classification === "HIGH" ? "P1" : "P2",
  URL: page.url, "Page family": page.family, Role: page.role, "Phase 4 quality score/state": page.master["Current quality score"] ?? "", "Template-risk score": page.score,
  "Main pattern problem": [page.introRisk >= 8 ? "introduction" : "", page.headingRisk >= 8 ? "structure" : "", page.practiceRisk >= 8 ? "practice" : "", page.conclusionRisk >= 6 ? "conclusion" : ""].filter(Boolean).join(" + ") || "combined portable pattern",
  "Introduction issue": page.introRisk, "Structure issue": page.headingRisk, "Transition issue": page.transitionRisk, "Practice issue": page.practiceRisk, "FAQ issue": page.faqRisk,
  "Conclusion issue": page.conclusionRisk, "Example issue": page.exampleRisk, "Protected content": page.master["Current information gain"] ?? "", "Protected source claims": page.master["Current source status"] ?? "",
  "Protected safety language": page.master["Current safety status"] ?? "", "Required editorial action": "Manual purpose-specific review; edit only harmful portable scaffolding",
  "Human review?": "Yes", Status: "QUEUED_PRE_EDIT"
}));
const queueHeaders = ["Priority", "URL", "Page family", "Role", "Phase 4 quality score/state", "Template-risk score", "Main pattern problem", "Introduction issue", "Structure issue", "Transition issue", "Practice issue", "FAQ issue", "Conclusion issue", "Example issue", "Protected content", "Protected source claims", "Protected safety language", "Required editorial action", "Human review?", "Status"];

const summary = Object.fromEntries(["LOW", "MODERATE", "HIGH", "CRITICAL"].map((classification) => [classification, pages.filter((page) => page.classification === classification).length]));
const duplicateIntroClusters = [...introGroups.values()].filter((group) => group.length > 1);
const duplicateHeadingClusters = [...headingGroups.values()].filter((group) => group.length > 1);
const duplicateEndingClusters = [...endingGroups.values()].filter((group) => group.length > 1);
const highCrossPairs = pages.filter((page) => page.closestScore >= 0.7);
const familySummary = [...groupBy(pages, (page) => page.family).entries()].map(([family, group]) => ({
  "Page family": family, Pages: group.length, Low: group.filter((page) => page.classification === "LOW").length, Moderate: group.filter((page) => page.classification === "MODERATE").length,
  High: group.filter((page) => page.classification === "HIGH").length, Critical: group.filter((page) => page.classification === "CRITICAL").length,
  "Average score": (group.reduce((total, page) => total + page.score, 0) / group.length).toFixed(1)
})).sort((a, b) => Number(b["Average score"]) - Number(a["Average score"]));

await writeCsv(stage === "post" ? "phase-5-page-template-risk-post.csv" : "phase-5-page-template-risk.csv", riskRows);
await writeCsv(stage === "post" ? "phase-5-structure-fingerprint-register-post.csv" : "phase-5-structure-fingerprint-register.csv", fingerprintRows);
await writeCsv(stage === "post" ? "phase-5-remediation-queue-post.csv" : "phase-5-remediation-queue.csv", queueRows, queueHeaders);
await writeCsv(stage === "post" ? "phase-5-template-risk-post.csv" : "phase-5-template-risk-baseline.csv", familySummary);
const reviewName = (name) => stage === "post" ? name.replace(".csv", "-post.csv") : name;
await writeCsv(reviewName("phase-5-introduction-pattern-review.csv"), pages.map((page) => ({ URL: page.url, Introduction: page.lede, "Exact opening cluster size": page.introCluster.length, "Generic pattern hits": page.genericIntroHits, Risk: page.introRisk, Action: page.introRisk >= 8 ? "REVIEW" : "KEEP" })));
await writeCsv(reviewName("phase-5-heading-pattern-review.csv"), pages.map((page) => ({ URL: page.url, "Page family": page.family, "Heading sequence": page.headings.join(" | "), "Exact sequence cluster size": page.headingCluster.length, "Closest cross-family URL": page.closest?.url ?? "", "Cross-family similarity": `${(page.closestScore * 100).toFixed(1)}%`, Risk: page.headingRisk, Action: page.headingRisk >= 8 ? "REVIEW" : "KEEP" })));
await writeCsv(reviewName("phase-5-transition-pattern-review.csv"), pages.map((page) => ({ URL: page.url, "Transition hits": page.transitionHits, Risk: page.transitionRisk, Action: page.transitionRisk >= 7 ? "REVIEW" : "KEEP" })));
await writeCsv(reviewName("phase-5-practice-scaffold-review.csv"), pages.map((page) => ({ URL: page.url, "Page family": page.family, "Practice terms": page.practiceHits.join(" | "), "Practice term count": page.scaffoldCount, "Practice block": page.hasPractice ? "Yes" : "No", Risk: page.practiceRisk, Action: page.practiceRisk >= 8 ? "REVIEW_FOR_TOPIC_SPECIFICITY" : "KEEP" })));
await writeCsv(reviewName("phase-5-example-pattern-review.csv"), pages.map((page) => ({ URL: page.url, "Portable scenario hits": page.exampleHits, Risk: page.exampleRisk, Action: page.exampleRisk >= 6 ? "REVIEW" : "KEEP" })));
await writeCsv(reviewName("phase-5-faq-pattern-review.csv"), pages.map((page) => ({ URL: page.url, "FAQ headings": page.faqHeadings.join(" | "), "FAQ schema": page.faqSchema ? "Yes" : "No", "Schema mismatch": page.faqMismatch ? "Yes" : "No", Risk: page.faqRisk, Action: page.faqMismatch ? "FIX" : page.faqRisk >= 6 ? "REVIEW" : "KEEP" })));
await writeCsv(reviewName("phase-5-conclusion-pattern-review.csv"), pages.map((page) => ({ URL: page.url, "Ending excerpt": page.ending.slice(0, 500), "Exact ending cluster size": page.endingCluster.length, "Generic conclusion hits": page.conclusionHits, Risk: page.conclusionRisk, Action: page.conclusionRisk >= 6 ? "REVIEW" : "KEEP" })));
await writeCsv("phase-5-protected-language-allowlist.csv", [
  { Category: "Safety", Examples: "stop or adapt; professional support; not medical advice; unsafe situations", Reason: "Consistent boundaries reduce harm", Penalty: "Excluded where clearly safety-critical" },
  { Category: "Source and attribution", Examples: "original Echo Buddha quote; not a scripture translation; source note", Reason: "Accuracy and attribution governance", Penalty: "Excluded" },
  { Category: "Legal and consent", Examples: "privacy; terms; denied defaults; policy wording", Reason: "Consistency is required", Penalty: "Excluded" },
  { Category: "Accessibility and UI", Examples: "skip links; navigation labels; search labels", Reason: "Stable interface language", Penalty: "Excluded" },
  { Category: "Canonical Buddhist terminology", Examples: "dukkha; anicca; metta; karma; Dhamma; Sangha", Reason: "Doctrinal consistency", Penalty: "Excluded" },
  { Category: "Governance distinctions", Examples: "traditional teaching; modern application; educational reflection", Reason: "Prevents source overstatement", Penalty: "Excluded" }
]);

const topFamilies = familySummary.slice(0, 10).map((row) => `- ${row["Page family"]}: ${row.Pages} pages; average ${row["Average score"]}; ${row.High} high; ${row.Critical} critical`).join("\n");
const topPages = [...pages].sort((a, b) => b.score - a.score).slice(0, 20).map((page) => `- ${page.url}: ${page.score} ${page.classification}; heading cluster ${page.headingCluster.length}; closest cross-family ${(page.closestScore * 100).toFixed(1)}%`).join("\n");
const diagnostic = `# Phase 5 Pre-Edit Template Diagnostic\n\n**Captured:** ${new Date().toISOString()}\n**Branch:** codex/phase-5-template-differentiation\n**Starting commit:** 4bbeef7a85d071752f9c1d0ec23e0ce1ff348505\n**Pages analyzed:** ${pages.length}\n\n## Current template-risk summary\n\n- Low: ${summary.LOW}\n- Moderate: ${summary.MODERATE}\n- High: ${summary.HIGH}\n- Critical: ${summary.CRITICAL}\n- Exact duplicated opening clusters: ${duplicateIntroClusters.length}\n- Exact duplicated heading-sequence clusters: ${duplicateHeadingClusters.length}\n- Exact duplicated ending clusters: ${duplicateEndingClusters.length}\n- Exact duplicated sentence groups (10+ words): ${duplicatedSentenceGroups.length}\n- Exact duplicated paragraph groups (18+ words): ${duplicatedParagraphGroups.length}\n- High cross-family structural matches (70%+): ${highCrossPairs.length}\n\n## Highest-risk page families\n\n${topFamilies}\n\n## Highest-risk pages\n\n${topPages}\n\n## Strongest observed patterns\n\n1. Quote stories inherit a long shared origin/meaning/example/teaching/practice/story/reflection/source journey; generated stories also reuse portable scenario and closing prose.\n2. Daily reflection details use a recurring product format but carry more article-like sections than a compact returning-user reflection needs.\n3. Learning and meditation templates share generic callout labels such as Key Takeaway, Why This Matters, A Helpful Clarification, Practice Today, and Reflection Question even when family roles differ.\n4. Repeated transition verbs (notice, pause, begin, return, soften) become risky when they replace topic-specific method, but remain legitimate in some meditation and mindfulness instructions.\n5. Source, attribution, safety, legal, accessibility, UI, consent, and canonical terminology repetition is intentionally protected.\n\n## False-positive considerations\n\nThe score is a queueing instrument, not a Google or quality score. Shared structure inside a coherent family may be legitimate. Daily reflections are allowed a stable product cadence; meditation safety wording and quote attribution must remain consistent. No page will be edited from score alone.\n`;
if (stage === "pre") await writeFile(path.join(OUT, "PHASE_5_PRE_EDIT_TEMPLATE_DIAGNOSTIC.md"), diagnostic);
await writeFile(path.join(OUT, `phase-5-${stage}-edit-metrics.json`), `${JSON.stringify({ capturedAt: new Date().toISOString(), pages: pages.length, risk: summary, introductionClusters: duplicateIntroClusters.length, headingClusters: duplicateHeadingClusters.length, conclusionClusters: duplicateEndingClusters.length, duplicatedSentenceGroups: duplicatedSentenceGroups.length, duplicatedParagraphGroups: duplicatedParagraphGroups.length, highCrossFamilyPairs: highCrossPairs.length }, null, 2)}\n`);
console.log(JSON.stringify({ pages: pages.length, risk: summary, queue: queueRows.length, introductionClusters: duplicateIntroClusters.length, headingClusters: duplicateHeadingClusters.length, conclusionClusters: duplicateEndingClusters.length, duplicatedSentenceGroups: duplicatedSentenceGroups.length, duplicatedParagraphGroups: duplicatedParagraphGroups.length, highCrossFamilyPairs: highCrossPairs.length, topFamilies: familySummary.slice(0, 8) }, null, 2));
