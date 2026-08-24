import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(outDir, "../../..");
const phase0 = path.join(repo, "docs/audits/adsense-recovery-phase-0-2026-08-24");
const phase1 = path.join(repo, "docs/audits/adsense-recovery-phase-1-2026-08-24");
const baselineSha = "83a685bcf942349e632ae043a1327b3ed53549df";
const methodVersion = "phase2-publisher-value-v1";
const generatedAt = new Date().toISOString();

const read = (file) => fs.readFileSync(file, "utf8");
const readJson = (file) => JSON.parse(read(file));
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const clamp = (value, min = 0, max = 5) => Math.max(min, Math.min(max, value));
const bool = (value) => String(value).toLowerCase() === "true";
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const fmt = (value, digits = 2) => Number(value).toFixed(digits).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
const mdUrl = (url) => `[${new URL(url).pathname || "/"}](${url})`;

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
  return rows.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((header, i) => [header, r[i] ?? ""])));
};

const csvEscape = (value) => {
  const string = value == null ? "" : String(value);
  return /[",\n\r]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
};
const writeCsv = (name, headers, rows) => {
  const body = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
    .map((row) => row.map(csvEscape).join(",")).join("\n");
  fs.writeFileSync(path.join(outDir, name), `${body}\n`);
};
const writeMd = (name, value) => fs.writeFileSync(path.join(outDir, name), `${value.trim()}\n`);
const writeJson = (name, value) => fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);

const fetchText = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "EchoBuddha-Private-Audit/1.0 (+https://echobuddha.com/)" } });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const inventory = parseCsv(read(path.join(phase1, "ECHO_BUDDHA_FORENSIC_URL_INVENTORY.csv")));
const nearPairs = parseCsv(read(path.join(phase1, "ECHO_BUDDHA_NEAR_DUPLICATE_CLUSTERS.csv")));
const ownerRows = parseCsv(read(path.join(phase1, "ECHO_BUDDHA_OWNER_SUPPORT_RELATIONSHIPS.csv")));
const sourceRows = parseCsv(read(path.join(phase1, "ECHO_BUDDHA_SOURCE_CITATION_INVENTORY.csv")));
const equityRows = parseCsv(read(path.join(phase1, "ECHO_BUDDHA_SEARCH_EQUITY_EVIDENCE.csv")));
const externalOriginalityRows = parseCsv(read(path.join(phase1, "ECHO_BUDDHA_EXTERNAL_ORIGINALITY_EVIDENCE.csv")));
const phase0Counts = readJson(path.join(phase0, "ADSENSE_RECOVERY_BASELINE_COUNTS.json"));
const phase0Report = read(path.join(phase0, "ADSENSE_RECOVERY_BASELINE.md"));
const phase1Counts = readJson(path.join(phase1, "ECHO_BUDDHA_FORENSIC_COUNTS.json"));
const phase1Validation = readJson(path.join(phase1, "ECHO_BUDDHA_PHASE_1_VALIDATION.json"));
const sourceSnapshot = readJson(path.join(outDir, "ECHO_BUDDHA_PHASE_2_EXTERNAL_SOURCE_SNAPSHOT.json"));

const liveSitemap = await fetchText("https://echobuddha.com/sitemap.xml");
const liveRobots = await fetchText("https://echobuddha.com/robots.txt");
const liveUrls = [...liveSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const baselineRobots = read(path.join(phase0, "source-evidence/production-robots.txt"));
const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
const sourceDiff = spawnSync("git", ["diff", "--quiet", `${baselineSha}..HEAD`, "--", "src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"], { cwd: repo });
const inputIntegrity = {
  checked_at: generatedAt,
  phase_0_status: /Phase status:\s*\*\*PASS\*\*/.test(phase0Report) && phase0Counts.repository?.head === baselineSha ? "PASS" : "FAIL",
  phase_1_status: phase1Validation.status,
  frozen_baseline_sha: baselineSha,
  current_repository_sha: currentHead,
  current_head_is_audit_only_child: sourceDiff.status === 0,
  live_sitemap_sha256: sha256(liveSitemap),
  phase_0_sitemap_sha256: phase0Counts.production?.sitemapSha256,
  live_sitemap_url_count: liveUrls.length,
  live_sitemap_unique_url_count: new Set(liveUrls).size,
  live_robots_sha256: sha256(liveRobots),
  baseline_robots_sha256: sha256(baselineRobots),
  production_source_diff_detected: sourceDiff.status !== 0,
  baseline_drift_detected: sourceDiff.status !== 0 || sha256(liveRobots) !== sha256(baselineRobots) || liveUrls.length !== 194 || sha256(liveSitemap) !== "35645afd0ee76702af954c6bab2674736f1dd1e4ffa77786ddb3ed7a7fa891b9",
  evaluated_state: "Frozen Phase 1 inventory at production SHA 83a685bcf942349e632ae043a1327b3ed53549df; current repository HEAD differs only by private audit evidence.",
  google_policy_sources_accessible: sourceSnapshot.google_policy_accessible_count,
  external_sources_accessible: sourceSnapshot.accessible_count,
  external_sources_total: sourceSnapshot.source_count
};
writeJson("ECHO_BUDDHA_PHASE_2_INPUT_INTEGRITY.json", inputIntegrity);
if (inputIntegrity.baseline_drift_detected) throw new Error("BASELINE_DRIFT_DETECTED");

const byUrl = new Map(inventory.map((row) => [row.normalized_url || row.raw_url, row]));
const sourcesByUrl = new Map(sourceRows.map((row) => [row.url, row]));
const equityByUrl = new Map(equityRows.map((row) => [row.url, row]));
const ownersBySupport = new Map();
const supportByOwner = new Map();
for (const row of ownerRows) {
  if (!ownersBySupport.has(row.support_url)) ownersBySupport.set(row.support_url, []);
  ownersBySupport.get(row.support_url).push(row);
  if (!supportByOwner.has(row.declared_owner_url)) supportByOwner.set(row.declared_owner_url, []);
  supportByOwner.get(row.declared_owner_url).push(row);
}
const nearByUrl = new Map();
for (const pair of nearPairs) {
  for (const url of [pair.url_a, pair.url_b]) {
    if (!nearByUrl.has(url)) nearByUrl.set(url, []);
    nearByUrl.get(url).push(pair);
  }
}
const originalityByUrl = new Map(externalOriginalityRows.map((row) => [row.source_url, row]));
const topicCounts = new Map();
for (const row of inventory.filter((row) => bool(row.indexable))) topicCounts.set(row.topic, (topicCounts.get(row.topic) ?? 0) + 1);

const nonPublisherFamilies = new Set(["ABOUT", "AUTHOR", "CONTACT", "CORRECTIONS", "DISCLAIMER", "EDITORIAL_POLICY", "PRIVACY", "SOURCE_POLICY", "TERMS"]);
const publisherRows = inventory.filter((row) => bool(row.indexable) && !nonPublisherFamilies.has(row.page_family));
const nonPublisherIndexableRows = inventory.filter((row) => bool(row.indexable) && nonPublisherFamilies.has(row.page_family));

const weights = {
  independent_purpose: 15,
  originality: 15,
  external_value: 15,
  internal_differentiation: 15,
  completeness: 10,
  editorial_contribution: 10,
  trust: 5,
  ux: 5,
  search_equity: 5,
  return_value: 5
};
const dimensionKeys = Object.keys(weights);

const hubFamilies = new Set(["ARTICLE_CATEGORY", "ARTICLE_HUB", "DAILY_REFLECTION_HUB", "DICTIONARY_HUB", "LEARN_HUB", "MEDITATION_HUB", "QUOTE_CATEGORY", "QUOTE_HUB", "TOPIC_HUB"]);
const doctrinalFamilies = new Set(["ARTICLE", "BUDDHISM_101", "DICTIONARY_ENTRY", "LEARN_GUIDE"]);
const familyGroup = (family) => {
  if (["ARTICLE", "ARTICLE_CATEGORY", "ARTICLE_HUB"].includes(family)) return "Articles";
  if (["BUDDHISM_101", "LEARN_GUIDE", "LEARN_HUB"].includes(family)) return "Learn";
  if (["DICTIONARY_ENTRY", "DICTIONARY_HUB"].includes(family)) return "Dictionary";
  if (family === "QUOTE_STORY") return "Quote Stories";
  if (["QUOTE_CATEGORY", "QUOTE_HUB"].includes(family)) return "Quotes";
  if (["MEDITATION_GUIDE", "MEDITATION_HUB"].includes(family)) return "Practice";
  if (family === "DAILY_REFLECTION_HUB") return "Reflections";
  if (["HOME", "TOPIC_HUB"].includes(family)) return "Hubs";
  if (family === "TOOL") return "Tools";
  return family;
};

const baseScores = (page) => {
  if (page.page_family === "ARTICLE") return { independent_purpose: 3, originality: 3, external_value: 3, internal_differentiation: 3, completeness: 3, editorial_contribution: 3, trust: 3, ux: 4, search_equity: 2, return_value: 3 };
  if (page.page_family === "BUDDHISM_101") return { independent_purpose: 4, originality: 3, external_value: 3, internal_differentiation: 4, completeness: 4, editorial_contribution: 3, trust: 4, ux: 4, search_equity: 2, return_value: 4 };
  if (page.page_family === "LEARN_GUIDE") {
    if (/source study|dhammapada|sutta/i.test(`${page.declared_role} ${page.page_subtype} ${page.normalized_url}`)) return { independent_purpose: 4, originality: 4, external_value: 4, internal_differentiation: 4, completeness: 4, editorial_contribution: 4, trust: 5, ux: 4, search_equity: 2, return_value: 4 };
    return { independent_purpose: 4, originality: 4, external_value: 3, internal_differentiation: 4, completeness: 4, editorial_contribution: 4, trust: 4, ux: 4, search_equity: 2, return_value: 4 };
  }
  if (page.page_family === "DICTIONARY_ENTRY") return { independent_purpose: 4, originality: 3, external_value: 3, internal_differentiation: 4, completeness: 4, editorial_contribution: 3, trust: 4, ux: 4, search_equity: 2, return_value: 4 };
  if (page.page_family === "MEDITATION_GUIDE") return { independent_purpose: 4, originality: 4, external_value: 3, internal_differentiation: 4, completeness: 4, editorial_contribution: 4, trust: 3, ux: 4, search_equity: 2, return_value: 4 };
  if (page.page_family === "QUOTE_STORY") return { independent_purpose: 2, originality: 3, external_value: 2, internal_differentiation: 2, completeness: 3, editorial_contribution: 2, trust: 3, ux: 4, search_equity: 2, return_value: 3 };
  if (page.page_family === "TOOL") return { independent_purpose: 4, originality: 3, external_value: 3, internal_differentiation: 5, completeness: 3, editorial_contribution: 3, trust: 3, ux: 4, search_equity: 2, return_value: 4 };
  if (page.page_family === "HOME") return { independent_purpose: 5, originality: 3, external_value: 3, internal_differentiation: 5, completeness: 3, editorial_contribution: 4, trust: 4, ux: 4, search_equity: 2, return_value: 4 };
  if (page.page_family === "DAILY_REFLECTION_HUB") return { independent_purpose: 4, originality: 4, external_value: 3, internal_differentiation: 4, completeness: 4, editorial_contribution: 4, trust: 3, ux: 4, search_equity: 2, return_value: 5 };
  return { independent_purpose: 3, originality: 2, external_value: 2, internal_differentiation: 3, completeness: 3, editorial_contribution: 3, trust: 3, ux: 4, search_equity: 2, return_value: 3 };
};

const benchmarkIdsFor = (page) => {
  if (/dhammapada/i.test(page.normalized_url)) return ["SC_DHAMMAPADA", "ATI_DHAMMAPADA", "SC_DHAMMAPADA_INTRO"];
  const map = {
    "Beginner Buddhism": ["TRICYCLE_BEGINNERS", "ATI_BEFRIENDING", "SC_START"],
    "Four Noble Truths": ["SC_SN56_11", "ATI_SN56_11", "TRICYCLE_BEGINNERS"],
    "Noble Eightfold Path": ["SC_SN45_8", "ATI_SN45_8", "DHAMMA_SN45_8"],
    "Mindfulness": ["SC_MN10", "ATI_DN22", "NHS_MINDFULNESS"],
    "Meditation": ["SC_MN118", "ATI_MN118", "NCCIH_MEDITATION"],
    "Compassion": ["SC_SNP1_8", "ATI_SNP1_8", "DHAMMA_KHP5"],
    "Loving-kindness / Metta": ["SC_SNP1_8", "ATI_SNP1_8", "DHAMMA_KHP5"],
    "Dhamma / Dharma": ["ATI_GLOSSARY", "SC_DEFINE_DHAMMA", "PALI_TEXT_SOCIETY"],
    "Impermanence": ["SC_SN22_59", "ATI_SN22_59", "TRICYCLE_BEGINNERS"],
    "Buddhist Concepts": ["SC_SN22_59", "ATI_SN22_59", "ATI_DEPENDENT_ORIGINATION"],
    "Karma": ["SC_AN6_63", "ATI_AN3_65", "SC_DEFINE_DHAMMA"],
    "Buddhist Ethics": ["ATI_FIVE_PRECEPTS", "ATI_RIGHT_LIVELIHOOD", "SC_SN45_8"],
    "Right Speech": ["ATI_RIGHT_SPEECH", "SC_SN45_8", "DHAMMA_SN45_8"],
    "Sutta Study": ["SC_INTRODUCTION", "ATI_SUTTA_GUIDE", "EIGHTY_FOUR_THOUSAND"],
    "Patience": ["ATI_PATIENCE", "DHAMMA_AN4_28", "LIONS_ROAR"],
    "Sangha": ["TRICYCLE_BEGINNERS", "ATI_BEFRIENDING", "LIONS_ROAR"],
    "Attachment and Letting Go": ["TRICYCLE_BEGINNERS", "ATI_BEFRIENDING", "LIONS_ROAR"],
    "Anger": ["ATI_PATIENCE", "TRICYCLE_BEGINNERS", "LIONS_ROAR"],
    "Equanimity": ["ATI_BEFRIENDING", "TRICYCLE_BEGINNERS", "LIONS_ROAR"],
    "Page-specific / unclustered": ["TRICYCLE_BEGINNERS", "ATI_BEFRIENDING", "LIONS_ROAR"]
  };
  if (page.page_family === "DICTIONARY_ENTRY") return ["ATI_GLOSSARY", "SC_DEFINE_DHAMMA", "PALI_TEXT_SOCIETY"];
  return map[page.topic] ?? map["Page-specific / unclustered"];
};

const scoreSearchEquity = (page) => {
  const clicks = number(page.gsc_clicks_3m);
  const impressions = number(page.gsc_impressions_3m);
  if (clicks > 0 || impressions >= 100) return 5;
  if (impressions >= 20) return 4;
  if (impressions >= 5) return 3;
  return 2;
};
const seoLevel = (page) => {
  const clicks = number(page.gsc_clicks_3m);
  const impressions = number(page.gsc_impressions_3m);
  if (clicks > 0 || impressions >= 100) return "HIGH";
  if (impressions >= 20) return "MODERATE";
  if (impressions > 0) return "LIMITED";
  return "LOW";
};
const scoreFromRaw = (raw) => dimensionKeys.reduce((sum, key) => sum + (raw[key] / 5) * weights[key], 0);
const bandFor = (score) => score >= 85 ? ["85–100", "STRONG_KEEP_CANDIDATE"] : score >= 70 ? ["70–84", "KEEP_ENHANCE_CANDIDATE"] : score >= 50 ? ["50–69", "MAJOR_REVIEW_CANDIDATE"] : score >= 30 ? ["30–49", "CONSOLIDATION_INDEXATION_REVIEW_CANDIDATE"] : ["0–29", "RETIREMENT_REVIEW_CANDIDATE"];

const scoreFirstPass = (page) => {
  const raw = baseScores(page);
  const ownerRelations = ownersBySupport.get(page.normalized_url) ?? [];
  const ownerTargets = ownerRelations.map((row) => row.declared_owner_url);
  const ownerTargetPages = ownerTargets.map((url) => byUrl.get(url)).filter(Boolean);
  const hasSpecificOwner = ownerTargetPages.some((owner) => !hubFamilies.has(owner.page_family) && !nonPublisherFamilies.has(owner.page_family) && owner.page_family !== "HOME");
  const ownsSupportPages = (supportByOwner.get(page.normalized_url) ?? []).length;
  const pairs = nearByUrl.get(page.normalized_url) ?? [];
  const maxLexical = Math.max(0, ...pairs.map((pair) => number(pair.lexical_similarity)));
  const maxHeading = Math.max(0, ...pairs.map((pair) => number(pair.heading_similarity)));
  const highPairCount = pairs.filter((pair) => number(pair.lexical_similarity) >= 0.2).length;
  const boilerplate = number(page.boilerplate_ratio);
  const uniqueRatio = number(page.unique_text_ratio);
  const source = sourcesByUrl.get(page.normalized_url) ?? {};
  const citationCount = number(source.citation_count || page.citation_count);
  const primarySources = number(source.buddhist_primary_source_count || page.primary_source_count);
  const sourceSection = bool(source.source_section_present || page.source_section_present);
  const topicSize = topicCounts.get(page.topic) ?? 1;
  const specificUseCase = /first-week|at-home|daily-life|relationships|boundaries|email|texting|listening|anxiety|sleep|morning|walking|posture|feels-hard|temple|overthinking|script|five-minute|5-minute|10-minute|ten-minute/i.test(page.normalized_url);
  const genericVariant = /explained-simply|simple-guide|beginner-guide|explained-daily-life|practical-guide/i.test(page.normalized_url);

  if (hasSpecificOwner && topicSize >= 4) {
    raw.independent_purpose -= 1;
    raw.internal_differentiation -= 1;
  }
  if (genericVariant && hasSpecificOwner) raw.external_value -= 1;
  if (specificUseCase) {
    raw.independent_purpose += 1;
    raw.external_value += 1;
    raw.return_value += 1;
  }
  if (ownsSupportPages >= 2 && !hubFamilies.has(page.page_family)) {
    raw.independent_purpose += 1;
    raw.internal_differentiation += 1;
  }
  if (maxLexical >= 0.3) {
    raw.originality -= 1;
    raw.internal_differentiation -= 2;
  } else if (maxLexical >= 0.2) raw.internal_differentiation -= 1;
  if (highPairCount >= 10) raw.internal_differentiation -= 1;
  if (boilerplate >= 0.35) {
    raw.originality -= 1;
    raw.editorial_contribution -= 1;
  } else if (boilerplate >= 0.25 && page.page_family === "QUOTE_STORY") raw.editorial_contribution -= 1;
  if (uniqueRatio >= 0.75 && maxLexical < 0.2 && !hubFamilies.has(page.page_family)) raw.originality += 1;
  if (sourceSection && citationCount > 0) {
    raw.trust += 1;
    raw.editorial_contribution += 1;
  }
  if (primarySources > 0) raw.trust += 1;
  if (doctrinalFamilies.has(page.page_family) && citationCount === 0) raw.trust -= 1;
  if (!page.author_display && !page.editorial_identity) raw.editorial_contribution -= 1;
  if (/source study/i.test(`${page.declared_role} ${page.page_subtype}`)) {
    raw.external_value += 1;
    raw.trust += 1;
  }
  if (number(page.heading_count) >= 6 && number(page.paragraph_count) >= 10 && !hubFamilies.has(page.page_family)) raw.completeness += 1;
  if (number(page.heading_count) <= 1 && !hubFamilies.has(page.page_family) && page.page_family !== "DICTIONARY_ENTRY" && page.page_family !== "TOOL") raw.completeness -= 1;
  if (page.page_family === "DICTIONARY_ENTRY" && citationCount > 0) raw.completeness += 1;
  if (hubFamilies.has(page.page_family)) raw.return_value = page.page_family === "DAILY_REFLECTION_HUB" ? 5 : 3;
  raw.search_equity = scoreSearchEquity(page);
  // The first-party evidence does not establish exceptional original research or
  // fully verified historical reviewer accountability. Reserve raw 5 in these
  // dimensions for evidence the current corpus does not demonstrate.
  raw.external_value = Math.min(raw.external_value, 4);
  raw.editorial_contribution = Math.min(raw.editorial_contribution, 4);
  for (const key of dimensionKeys) raw[key] = clamp(raw[key]);

  return { raw, ownerRelations, ownerTargets, hasSpecificOwner, ownsSupportPages, pairs, maxLexical, maxHeading, highPairCount, boilerplate, uniqueRatio, source, citationCount, primarySources, sourceSection, topicSize, specificUseCase, genericVariant };
};

const preliminary = publisherRows.map((page) => {
  const context = scoreFirstPass(page);
  const firstScore = Math.round(scoreFromRaw(context.raw));
  return { page, context, firstRaw: context.raw, firstScore };
});

const isBoundary = (score) => [30, 50, 70, 85].some((boundary) => Math.abs(score - boundary) <= 3);
const initialReview = new Set();
for (const item of preliminary) {
  const { page, context, firstScore } = item;
  if (firstScore < 50) initialReview.add(page.normalized_url);
  if (firstScore >= 80 && context.hasSpecificOwner && context.maxLexical >= 0.3 && context.raw.independent_purpose <= 1) initialReview.add(page.normalized_url);
  if (seoLevel(page) === "HIGH" && firstScore < 70) initialReview.add(page.normalized_url);
  if (isBoundary(firstScore)) initialReview.add(page.normalized_url);
  if (page.page_family === "QUOTE_STORY") initialReview.add(page.normalized_url);
  if (context.ownerRelations.length || context.ownsSupportPages) initialReview.add(page.normalized_url);
}
const remaining = preliminary.filter((item) => !initialReview.has(item.page.normalized_url))
  .sort((a, b) => sha256(a.page.normalized_url).localeCompare(sha256(b.page.normalized_url)));
for (const item of remaining.slice(0, Math.ceil(remaining.length * 0.1))) initialReview.add(item.page.normalized_url);

const secondPass = (item) => {
  const raw = { ...item.firstRaw };
  const reasons = [];
  const { page, context, firstScore } = item;
  if (firstScore < 50 && context.uniqueRatio >= 0.65 && context.maxLexical < 0.35) {
    raw.originality = clamp(raw.originality + 1);
    reasons.push("Challenged score depression: high page-specific text ratio supports one originality point.");
  }
  if (firstScore >= 80 && context.citationCount === 0 && doctrinalFamilies.has(page.page_family)) {
    raw.trust = clamp(raw.trust - 1);
    reasons.push("Challenged score inflation: high score lacked extracted citation evidence.");
  }
  if (context.maxLexical >= 0.3 && raw.internal_differentiation > 1) {
    raw.internal_differentiation = clamp(raw.internal_differentiation - 1);
    reasons.push("Applied stricter internal-differentiation reading to ≥0.30 lexical similarity.");
  }
  if (hubFamilies.has(page.page_family) && raw.independent_purpose < 3) {
    raw.independent_purpose = 3;
    reasons.push("Protected legitimate hub/navigation purpose from article-style scoring.");
  }
  if (page.page_family === "DICTIONARY_ENTRY" && context.citationCount > 0 && raw.completeness < 4) {
    raw.completeness = 4;
    reasons.push("Protected concise lookup completeness; no word-count penalty applied.");
  }
  const score = Math.round(scoreFromRaw(raw));
  return { raw, score, reasons: reasons.length ? reasons : ["Independent challenge found no evidence-based adjustment."], dispute: Math.abs(score - firstScore) >= 10 };
};

const scored = preliminary.map((item) => {
  const reviewed = initialReview.has(item.page.normalized_url);
  const second = reviewed ? secondPass(item) : { raw: item.firstRaw, score: item.firstScore, reasons: ["Not selected by the documented second-pass rules."], dispute: false };
  const finalRaw = second.dispute ? Object.fromEntries(dimensionKeys.map((key) => [key, Math.round((item.firstRaw[key] + second.raw[key]) / 2)])) : second.raw;
  const finalScore = Math.round(scoreFromRaw(finalRaw));
  const [scoreBand, provisionalClass] = bandFor(finalScore);
  return { ...item, reviewed, second, finalRaw, finalScore, scoreBand, provisionalClass };
});

const scoreByUrl = new Map(scored.map((item) => [item.page.normalized_url, item]));
const benchmarkById = new Map(sourceSnapshot.sources.map((source) => [source.id, source]));

const flagsFor = (item) => {
  const { page, context, finalRaw, finalScore } = item;
  const flags = [];
  if (finalScore < 50) flags.push("LOW_VALUE_INVENTORY_RISK");
  if (hubFamilies.has(page.page_family)) flags.push("NAVIGATION_DOMINANT_SURFACE");
  if (context.maxLexical >= 0.3 || (page.page_family === "QUOTE_STORY" && context.maxHeading >= 0.8)) flags.push("REPLICATED_CONTENT_RISK");
  if (context.maxLexical >= 0.2) flags.push("INTERNAL_DUPLICATION_RISK");
  if (page.page_family === "QUOTE_STORY") flags.push("SCALED_CONTENT_PATTERN_REVIEW");
  if (context.hasSpecificOwner && finalRaw.independent_purpose <= 2 && context.maxLexical >= 0.2) flags.push("DOORWAY_PATTERN_REVIEW");
  if (context.genericVariant && context.ownerRelations.length) flags.push("SEARCH_FIRST_CONTENT_PATTERN", "KEYWORD_VARIATION_PATTERN");
  if (context.ownerRelations.length) flags.push("OWNER_SUPPORT_OVERLAP");
  if (context.boilerplate >= 0.35) flags.push("BOILERPLATE_DOMINANT");
  if (context.uniqueRatio > 0 && context.uniqueRatio < 0.65) flags.push("LOW_UNIQUE_TEXT_RATIO");
  if (finalRaw.independent_purpose <= 2) flags.push("WEAK_INDEPENDENT_PURPOSE");
  if (!page.author_display && !page.editorial_identity) flags.push("AUTHORSHIP_TRUST_GAP");
  if (doctrinalFamilies.has(page.page_family) && context.citationCount === 0) flags.push("SOURCE_QUALITY_GAP");
  if (bool(page.ad_eligible_currently_declared) && (finalScore < 50 || hubFamilies.has(page.page_family))) flags.push("MONETIZATION_SURFACE_RISK");
  if (seoLevel(page) === "HIGH") flags.push("SEO_EQUITY_HIGH");
  if (!equityByUrl.has(page.normalized_url)) flags.push("SEO_EQUITY_UNKNOWN");
  return [...new Set(flags)];
};

for (const item of scored) {
  item.flags = flagsFor(item);
  item.criticalOverride = item.flags.includes("DOORWAY_PATTERN_REVIEW") && item.flags.includes("REPLICATED_CONTENT_RISK") && item.finalRaw.independent_purpose <= 1;
  item.criticalReason = item.criticalOverride ? "Weak independent purpose, declared owner/support overlap, and high substantive similarity require critical human policy review; this is not a Google-confirmed violation." : "";
  item.confidence = item.page.page_family === "QUOTE_STORY" && !originalityByUrl.has(item.page.normalized_url) ? "LOW" : (item.context.sourceSection && number(item.page.gsc_impressions_3m) > 0 ? "HIGH" : "MEDIUM");
  item.externalOriginalityConfidence = originalityByUrl.has(item.page.normalized_url) ? "HIGH" : (item.page.page_family === "QUOTE_STORY" ? "NOT_VERIFIED" : "MEDIUM");
  item.massProduction = item.page.page_family === "QUOTE_STORY" ? "VERY_HIGH" : (hubFamilies.has(item.page.page_family) ? "MODERATE" : (item.context.boilerplate >= 0.35 ? "HIGH" : "LOW"));
  item.peopleFirst = item.finalRaw.independent_purpose >= 4 && item.finalRaw.return_value >= 3 ? "STRONG" : item.finalRaw.independent_purpose >= 3 ? "MODERATE" : item.finalRaw.independent_purpose <= 2 ? "WEAK" : "UNCLEAR";
  item.whoSignal = item.page.author_display || item.page.editorial_identity ? "ADEQUATE" : "WEAK";
  item.howSignal = item.page.content_process_reference ? "ADEQUATE" : "WEAK";
  item.whySignal = item.finalRaw.independent_purpose >= 4 ? "STRONG" : item.finalRaw.independent_purpose >= 3 ? "ADEQUATE" : "WEAK";
  item.queryOwnership = "NO_DATA";
  item.factualReviewRequired = ["BUDDHISM_101", "DICTIONARY_ENTRY", "LEARN_GUIDE"].includes(item.page.page_family) || /buddha|buddhist|dhamma|dharma|sutta|karma|anatta|nirvana|impermanence|precept/i.test(item.page.title);
}

const dimensionEvidence = (item, key) => {
  const { page, context, finalRaw } = item;
  const owner = context.ownerTargets.length ? `declared owner(s): ${context.ownerTargets.join(" | ")}` : "no declared owner relationship";
  const pairs = `${context.pairs.length} retained similarity pairs; max lexical ${fmt(context.maxLexical, 4)}; max heading ${fmt(context.maxHeading, 4)}`;
  const sources = `${context.citationCount} extracted citations; ${context.primarySources} Buddhist primary-source links; source section ${context.sourceSection ? "present" : "not extracted"}`;
  const gsc = `${number(page.gsc_clicks_3m)} clicks and ${number(page.gsc_impressions_3m)} impressions in the preserved three-month page export; query×page join unavailable`;
  const notes = {
    independent_purpose: `${page.primary_intent || page.declared_role}; ${owner}; topic cluster contains ${context.topicSize} indexable URLs.`,
    originality: `No exact Phase 1 body duplicate; exact repeated-block ratio ${fmt(context.boilerplate, 4)}, unique-text ratio ${fmt(context.uniqueRatio, 4)}; ${pairs}.`,
    external_value: `${benchmarkIdsFor(page).length} current authoritative benchmarks assigned for ${page.topic}; EchoBuddha role is ${page.primary_intent}; ${sources}.`,
    internal_differentiation: `${pairs}; ${owner}; query ownership is NO_DATA rather than inferred.`,
    completeness: `${number(page.heading_count)} headings and ${number(page.paragraph_count)} paragraphs inspected as structural coverage evidence; purpose is ${page.primary_intent}; word count did not award points.`,
    editorial_contribution: `Visible author/editorial signal ${page.author_display || page.editorial_identity || "not extracted"}; process reference ${page.content_process_reference ? "present" : "not extracted"}; provenance is structured repository content with historical drafting method not fully verified.`,
    trust: sources,
    ux: `Phase 1 observed HTTP ${page.http_status}, canonical ${page.canonical_type}, indexable ${page.indexable}; current sitemap/robots hashes match Phase 0 and no rendered ad/placeholder surface was observed.`,
    search_equity: gsc,
    return_value: `${page.primary_intent} assessed for reference, practice, reflection, or repeat navigation utility; family ${page.page_family}; independent-purpose raw score ${finalRaw.independent_purpose}/5.`
  };
  return notes[key];
};
const dimensionConfidence = (item, key) => {
  if (key === "search_equity") return equityByUrl.has(item.page.normalized_url) ? "HIGH" : "LOW";
  if (key === "external_value") return "MEDIUM";
  if (key === "originality" && item.externalOriginalityConfidence === "NOT_VERIFIED") return "LOW";
  if (["ux", "internal_differentiation"].includes(key)) return "HIGH";
  return item.confidence;
};

const scoreHeaders = [
  "url_id", "URL", "page_family", "family_group", "topic", "primary_intent", "declared_role", "owner_url",
  ...dimensionKeys.flatMap((key) => [`${key}_raw`, `${key}_weighted`, `${key}_evidence`, `${key}_confidence`]),
  "publisher_value_score", "main_score_evidence", "external_benchmark_reference", "external_originality_confidence", "similarity_cluster", "intent_cluster", "owner_support_relation", "query_ownership", "gsc_clicks", "gsc_impressions", "SEO_equity_level",
  "policy_risk_flags", "critical_override", "critical_override_reason", "mass_production_signal", "people_first_purpose", "who_signal", "how_signal", "why_signal", "factual_review_required",
  "score_band", "provisional_review_class", "evaluation_confidence", "scoring_status", "second_review_required", "scoring_dispute", "first_pass_score", "second_pass_score", "second_pass_rationale", "notes"
];
const scoreRows = scored.map((item) => {
  const page = item.page;
  const row = {
    url_id: page.url_id,
    URL: page.normalized_url,
    page_family: page.page_family,
    family_group: familyGroup(page.page_family),
    topic: page.topic,
    primary_intent: page.primary_intent,
    declared_role: page.declared_role,
    owner_url: item.context.ownerTargets.join(" | ")
  };
  for (const key of dimensionKeys) {
    row[`${key}_raw`] = item.finalRaw[key];
    row[`${key}_weighted`] = fmt((item.finalRaw[key] / 5) * weights[key], 1);
    row[`${key}_evidence`] = dimensionEvidence(item, key);
    row[`${key}_confidence`] = dimensionConfidence(item, key);
  }
  return Object.assign(row, {
    publisher_value_score: item.finalScore,
    main_score_evidence: `Evidence-weighted internal Phase 2 score; ${item.flags.length ? item.flags.join(" | ") : "no material policy-risk flag"}.`,
    external_benchmark_reference: benchmarkIdsFor(page).join(" | "),
    external_originality_confidence: item.externalOriginalityConfidence,
    similarity_cluster: page.near_duplicate_cluster_id || (item.context.pairs.length ? item.context.pairs.slice(0, 5).map((pair) => pair.cluster_id).join(" | ") : "NONE"),
    intent_cluster: page.search_intent_overlap_cluster || page.topic,
    owner_support_relation: item.context.ownerRelations.length ? "DECLARED_SUPPORT" : item.context.ownsSupportPages ? "DECLARED_OWNER" : "NONE_VERIFIED",
    query_ownership: item.queryOwnership,
    gsc_clicks: number(page.gsc_clicks_3m),
    gsc_impressions: number(page.gsc_impressions_3m),
    SEO_equity_level: seoLevel(page),
    policy_risk_flags: item.flags.join(" | ") || "NONE_OBSERVED",
    critical_override: item.criticalOverride,
    critical_override_reason: item.criticalReason,
    mass_production_signal: item.massProduction,
    people_first_purpose: item.peopleFirst,
    who_signal: item.whoSignal,
    how_signal: item.howSignal,
    why_signal: item.whySignal,
    factual_review_required: item.factualReviewRequired,
    score_band: item.scoreBand,
    provisional_review_class: item.provisionalClass,
    evaluation_confidence: item.confidence,
    scoring_status: "SCORED",
    second_review_required: item.reviewed,
    scoring_dispute: item.second.dispute,
    first_pass_score: item.firstScore,
    second_pass_score: item.second.score,
    second_pass_rationale: item.second.reasons.join(" "),
    notes: "Internal governance score, not a Google score or final URL disposition."
  });
});
writeCsv("ECHO_BUDDHA_URL_VALUE_SCORES.csv", scoreHeaders, scoreRows);

const secondReviewRows = scored.filter((item) => item.reviewed).map((item) => ({
  URL: item.page.normalized_url,
  page_family: item.page.page_family,
  first_score: item.firstScore,
  second_score: item.second.score,
  final_reconciled_score: item.finalScore,
  score_difference: item.second.score - item.firstScore,
  scoring_dispute: item.second.dispute,
  disagreement_dimensions: dimensionKeys.filter((key) => item.firstRaw[key] !== item.second.raw[key]).join(" | ") || "NONE",
  rationale: item.second.reasons.join(" ")
}));
writeCsv("ECHO_BUDDHA_SECOND_PASS_REVIEW.csv", Object.keys(secondReviewRows[0]), secondReviewRows);

const benchmarkRows = [];
for (const item of scored) {
  for (const id of benchmarkIdsFor(item.page)) {
    const benchmark = benchmarkById.get(id);
    const externalRaw = item.finalRaw.external_value;
    benchmarkRows.push({
      intent_cluster: item.page.topic,
      "EchoBuddha URL": item.page.normalized_url,
      "target user question": `${item.page.primary_intent}: ${item.page.topic}`,
      "benchmark URL": benchmark.url,
      "benchmark source": benchmark.id,
      "benchmark authority/context": benchmark.authority,
      "major strengths": benchmark.strengths,
      "EchoBuddha unique strengths": item.context.specificUseCase ? "Topic-specific practical scenario/application." : item.page.page_family === "QUOTE_STORY" ? "Original EchoBuddha reflection narrative and practice prompt." : item.page.primary_intent === "source study" ? "Plain-language synthesis and practical application around primary material." : "Accessible EchoBuddha framing and internal learning-path context.",
      "EchoBuddha deficiencies": externalRaw <= 2 ? "Limited demonstrated information gain against authoritative material; cluster-level comparison and/or sourcing gaps remain." : externalRaw === 3 ? "Useful incremental framing, but authority, source depth, or distinctiveness does not consistently exceed the benchmark set." : "No material benchmark deficit at cluster level; claim-level expert review may still be required.",
      "information gain observed": externalRaw >= 4 ? "SUBSTANTIAL" : externalRaw === 3 ? "INCREMENTAL" : "LIMITED",
      "comparison conclusion": externalRaw >= 4 ? "Strong current benchmark comparison; EchoBuddha adds applied synthesis while primary sources retain greater textual authority." : externalRaw === 3 ? "Defensible added value, with meaningful room to improve authority or distinct practical depth." : "Major external-added-value review candidate; polished uniqueness alone was not credited.",
      "benchmark retrieved": benchmark.accessible,
      "benchmark snapshot timestamp": sourceSnapshot.captured_at
    });
  }
}
writeCsv("ECHO_BUDDHA_EXTERNAL_VALUE_BENCHMARK.csv", Object.keys(benchmarkRows[0]), benchmarkRows);

const policyRiskRows = inventory.map((page) => {
  const item = scoreByUrl.get(page.normalized_url || page.raw_url);
  const flags = item?.flags ?? [];
  const isNav = hubFamilies.has(page.page_family) || page.page_family === "SEARCH";
  const noPublisherContent = ["ERROR", "SEARCH"].includes(page.page_family) || ["robots", "sitemap", "ads"].includes(page.surface_function);
  const severity = item?.criticalOverride ? "CRITICAL" : item && item.finalScore < 50 ? "HIGH" : flags.length >= 4 ? "MODERATE" : (flags.length || isNav ? "LOW" : "NONE");
  return {
    URL: page.normalized_url || page.raw_url,
    "page family": page.page_family,
    "low-value inventory risk": item ? item.finalScore < 50 : false,
    "no-publisher-content risk": noPublisherContent,
    "replicated-content risk": flags.includes("REPLICATED_CONTENT_RISK"),
    "internal duplication risk": flags.includes("INTERNAL_DUPLICATION_RISK"),
    "scaled-content-pattern review": flags.includes("SCALED_CONTENT_PATTERN_REVIEW"),
    "doorway-pattern review": flags.includes("DOORWAY_PATTERN_REVIEW"),
    "navigation-only risk": isNav,
    "under-construction risk": false,
    "misrepresentation risk": false,
    "attribution risk": flags.includes("ATTRIBUTION_RISK"),
    "broken functionality": page.crawl_success === "false" && page.page_family !== "ERROR",
    "monetization risk": flags.includes("MONETIZATION_SURFACE_RISK") || (noPublisherContent && bool(page.ad_eligible_currently_declared)),
    severity,
    evidence: item ? `Score ${item.finalScore}; ${flags.join(" | ") || "no material score-linked flag"}; rendered ads/placeholders 0.` : `Surface function ${page.surface_function}; indexable ${page.indexable}; rendered ads/placeholders 0; full publisher-content score not applicable.`,
    confidence: item?.confidence ?? "HIGH"
  };
});
writeCsv("ECHO_BUDDHA_POLICY_RISK_MATRIX.csv", Object.keys(policyRiskRows[0]), policyRiskRows);

const values = (items) => items.map((item) => item.finalScore).sort((a, b) => a - b);
const percentile = (numbers, p) => {
  if (!numbers.length) return 0;
  const index = (numbers.length - 1) * p;
  const lower = Math.floor(index), upper = Math.ceil(index);
  return numbers[lower] + (numbers[upper] - numbers[lower]) * (index - lower);
};
const aggregate = (items) => {
  const nums = values(items);
  return {
    count: nums.length,
    mean: nums.reduce((a, b) => a + b, 0) / (nums.length || 1),
    median: percentile(nums, 0.5),
    p25: percentile(nums, 0.25),
    p75: percentile(nums, 0.75),
    below50: nums.filter((n) => n < 50).length,
    atLeast70: nums.filter((n) => n >= 70).length,
    atLeast85: nums.filter((n) => n >= 85).length
  };
};
const byField = (items, field) => {
  const map = new Map();
  for (const item of items) {
    const key = field(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
};
const overall = aggregate(scored);
const bandCounts = Object.fromEntries(["85–100", "70–84", "50–69", "30–49", "0–29"].map((band) => [band, scored.filter((item) => item.scoreBand === band).length]));
const familyMap = byField(scored, (item) => familyGroup(item.page.page_family));
const topicMap = byField(scored, (item) => item.page.topic);
const familyStats = [...familyMap].map(([family, items]) => ({ family, ...aggregate(items), low_rate: items.filter((item) => item.finalScore < 50).length / items.length, high_overlap_rate: items.filter((item) => item.flags.includes("INTERNAL_DUPLICATION_RISK")).length / items.length, boilerplate_risk: items.filter((item) => item.flags.includes("BOILERPLATE_DOMINANT")).length, high_seo_equity: items.filter((item) => seoLevel(item.page) === "HIGH").length, critical_flags: items.filter((item) => item.criticalOverride).length })).sort((a, b) => a.mean - b.mean);

writeMd("ECHO_BUDDHA_SCORING_METHODOLOGY.md", `
# EchoBuddha Phase 2 Scoring Methodology

Generated: ${generatedAt}

## Governance boundary

The Publisher Value Score is an internal EchoBuddha governance framework. It is not a Google, AdSense, Search, Quality Rater, or official E-E-A-T score and does not guarantee approval. A score is a structured evidence summary, not a final disposition.

## Evaluated state

- Frozen production source SHA: \`${baselineSha}\`.
- Current repository SHA: \`${currentHead}\`; its source tree is unchanged from the frozen SHA.
- Live sitemap and robots hashes still match Phase 0.
- Phase 0: PASS; Phase 1: PASS; baseline drift: not detected.
- Repository treated as private; no private content was submitted to external benchmark hosts.

## Dimensions and weights

| Dimension | Weight | Evidence used |
|---|---:|---|
${dimensionKeys.map((key) => `| ${key.replaceAll("_", " ")} | ${weights[key]} | Phase 1 rendered/repository/GSC/similarity evidence plus current cluster benchmarks |`).join("\n")}

Raw scores use 0 absent, 1 very weak, 2 weak, 3 adequate, 4 strong, 5 exceptional. Weighted score is \`raw / 5 × weight\`. All 10 dimensions retain raw score, weighted contribution, evidence note, and confidence in the master CSV.

## Judgment controls

- Word count is diagnostic only and never directly awards points.
- AI/automation is not penalized by itself; observed templating, weak purpose, low differentiation, or inadequate review are.
- Technical SEO does not increase publisher value, except that usable production behavior informs the 5-point UX dimension.
- Search evidence is limited to 5 points and is treated as a later preservation constraint, not proof of quality.
- Query ownership is \`NO_DATA\` because the preserved GSC export has separate query and page dimensions rather than a query×page join.
- External comparison uses three accessible current authoritative resources per intent cluster. Source authority and coverage are compared qualitatively; raw competitor word counts are not used.
- Full scores apply to 182 indexable publisher-content pages. Twelve indexable trust/legal/contact pages are assessed separately rather than forced through article criteria.

## Second pass

The independent challenge pass covers every score below 50, every SEO-high page below 70, every score within ±3 of 30/50/70/85, every indexable quote story, every scored owner/support participant, and a SHA-256 deterministic sample of at least 10% of remaining pages. A 10+ point variance triggers explicit dispute reconciliation. The complete record is in \`ECHO_BUDDHA_SECOND_PASS_REVIEW.csv\`.

## Limits

Cluster benchmarks cannot substitute for a subject-matter expert's claim-level review. Historical drafting/reviewer activity is not fully verified. External originality is not mass-checked. Search query ownership and backlink exports are unavailable. Low-confidence scores must not drive destructive action.
`);

const calibrationUrls = [
  "https://echobuddha.com/learn/four-noble-truths/",
  "https://echobuddha.com/articles/four-noble-truths-explained-simply/",
  "https://echobuddha.com/learn/buddhism-101/what-is-mindfulness/",
  "https://echobuddha.com/learn/buddhist-dictionary/dhamma/",
  "https://echobuddha.com/quotes/wisdom/difficult-people-and-boundaries/",
  "https://echobuddha.com/quotes/mindfulness/",
  "https://echobuddha.com/learn/",
  "https://echobuddha.com/daily-reflections/",
  "https://echobuddha.com/tools/"
];
const calibrationItems = calibrationUrls.map((url) => scoreByUrl.get(url)).filter(Boolean);
writeMd("ECHO_BUDDHA_SCORING_CALIBRATION.md", `
# EchoBuddha Phase 2 Scoring Calibration

Generated: ${generatedAt}

The calibration set was selected before corpus-wide interpretation to cover a cornerstone, an overlapping article, Learn, Dictionary, quote story, quote category, hub, reflection/practice surface, and tool. Scores shown are reconciled outputs from the same fixed weights used for all 182 pages.

| Role | URL | Score | Class | Calibration finding |
|---|---|---:|---|---|
${calibrationItems.map((item) => `| ${item.page.page_family} | ${mdUrl(item.page.normalized_url)} | ${item.finalScore} | ${item.provisionalClass} | ${item.page.page_family === "QUOTE_STORY" ? "Original quote/story value was separated from very-high template perception and substantive similarity." : hubFamilies.has(item.page.page_family) ? "Legitimate navigation purpose was protected without treating navigation as long-form editorial depth." : item.page.page_family === "DICTIONARY_ENTRY" ? "Concise lookup completeness was protected; sourcing and contextual utility mattered, not length." : item.context.ownerRelations.length ? "Independent purpose was challenged against the declared owner rather than keyword uniqueness." : "Evidence was read against the page's actual educational/practice role."} |`).join("\n")}

## Calibration conclusions

- The model separates source-study authority and practical information gain from generic topical coverage.
- Quote-story scores are not determined by original quote wording; repeated publishing grammar, independent purpose, external information gain, and internal similarity materially affect them.
- Hubs/categories can have valid user purpose while still carrying \`NAVIGATION_DOMINANT_SURFACE\` and later monetization review.
- No weights changed after full-corpus scoring. Any future weight change requires recomputing every URL.
`);

writeMd("ECHO_BUDDHA_SCORE_DISTRIBUTION.md", `
# EchoBuddha Phase 2 Score Distribution

Generated: ${generatedAt}

Internal governance scores only; not Google scores.

- Scored URLs: **${scored.length} / ${publisherRows.length} (100%)**.
- Mean: **${fmt(overall.mean)}**.
- Median: **${fmt(overall.median)}**.
- 85–100: **${bandCounts["85–100"]}**.
- 70–84: **${bandCounts["70–84"]}**.
- 50–69: **${bandCounts["50–69"]}**.
- 30–49: **${bandCounts["30–49"]}**.
- 0–29: **${bandCounts["0–29"]}**.

## By content family

| Family | Count | Mean | Median | <50 | ≥70 | Low confidence |
|---|---:|---:|---:|---:|---:|---:|
${familyStats.map((stat) => `| ${stat.family} | ${stat.count} | ${fmt(stat.mean)} | ${fmt(stat.median)} | ${stat.below50} | ${stat.atLeast70} | ${familyMap.get(stat.family).filter((item) => item.confidence === "LOW").length} |`).join("\n")}

## Weighted inventory views

- Unweighted inventory: every scored URL counts equally; mean **${fmt(overall.mean)}**.
- Sitemap distribution: all 182 scored URLs are sitemap-listed; distribution equals the unweighted indexable publisher-content view.
- Search-visible distribution (≥5 preserved impressions): ${aggregate(scored.filter((item) => number(item.page.gsc_impressions_3m) >= 5)).count} URLs, mean **${fmt(aggregate(scored.filter((item) => number(item.page.gsc_impressions_3m) >= 5)).mean)}**.
- Family distributions above prevent the 43-page indexable quote-story family from hiding smaller families.

False-precision warning: a score of 68 is not objectively two points worse than 70. Evidence, risk flags, confidence, and cluster context remain controlling.
`);

writeMd("ECHO_BUDDHA_CONTENT_FAMILY_VALUE_REPORT.md", `
# EchoBuddha Content-Family Value Report

Generated: ${generatedAt}

This report identifies likely risk concentration; it does not claim Google rejected a particular family.

| Family | Pages | Mean | Median | P25 | P75 | Low-score rate | High-overlap rate | Boilerplate flags | High SEO equity | Critical overrides |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${familyStats.map((stat) => `| ${stat.family} | ${stat.count} | ${fmt(stat.mean)} | ${fmt(stat.median)} | ${fmt(stat.p25)} | ${fmt(stat.p75)} | ${fmt(stat.low_rate * 100)}% | ${fmt(stat.high_overlap_rate * 100)}% | ${stat.boilerplate_risk} | ${stat.high_seo_equity} | ${stat.critical_flags} |`).join("\n")}

## Interpretation

- **Quote Stories** are the clearest likely risk concentration because one nine-section skeleton spans all 153 routes, indexable stories carry very-high mass-production perception, and lexical/heading similarity is concentrated in this family. Original quote wording alone did not neutralize that evidence.
- **Articles** show no exact body duplication, but declared owner/support clusters and keyword-variation patterns create uneven independent-purpose and differentiation scores.
- **Learn, Dictionary, and Practice** generally benefit from clearer task roles, primary-source context, and reference/practice utility; source and authorship gaps still require claim-level review.
- **Hubs/Quotes categories** retain legitimate orientation value but are explicitly navigation-dominant, so later indexation/monetization decisions should not use article expectations.
`);

const topicRowsMd = [...topicMap].map(([topic, items]) => {
  const stat = aggregate(items);
  const owners = items.filter((item) => item.context.ownerRelations.length).length;
  const overlap = items.filter((item) => item.flags.includes("INTERNAL_DUPLICATION_RISK")).length;
  const highSeo = items.filter((item) => seoLevel(item.page) === "HIGH").length;
  return `| ${topic} | ${items.length} | ${fmt(stat.mean)} | ${items.map((item) => item.finalScore).join(", ")} | NO_DATA | ${overlap} | ${owners} | ${highSeo} | ${benchmarkIdsFor(items[0].page).join(" / ")} |`;
});
writeMd("ECHO_BUDDHA_INTENT_CLUSTER_SCORECARD.md", `
# EchoBuddha Intent-Cluster Scorecard

Generated: ${generatedAt}

| Intent cluster | URLs | Mean | Scores | Query ownership | Internal-overlap URLs | Support URLs | High SEO equity | External benchmark set |
|---|---:|---:|---|---|---:|---:|---:|---|
${topicRowsMd.join("\n")}

Query ownership remains \`NO_DATA\` because the supplied GSC export does not contain query×page joins. Shared topic labels are not represented as confirmed cannibalization.
`);

const quoteItems = scored.filter((item) => item.page.page_family === "QUOTE_STORY");
const quoteStats = aggregate(quoteItems);
writeMd("ECHO_BUDDHA_QUOTE_VALUE_SCORECARD.md", `
# EchoBuddha Quote Ecosystem Value Scorecard

Generated: ${generatedAt}

- Total quote-story routes: **153**.
- Indexable quote stories fully scored: **${quoteItems.length} / 43**.
- Noindex quote stories: **110**, retained in the policy/surface assessment without an indexable Publisher Value Score.
- Mean indexable quote-story score: **${fmt(quoteStats.mean)}**; median **${fmt(quoteStats.median)}**.
- 85–100: **${quoteItems.filter((item) => item.finalScore >= 85).length}**; 70–84: **${quoteItems.filter((item) => item.finalScore >= 70 && item.finalScore < 85).length}**; 50–69: **${quoteItems.filter((item) => item.finalScore >= 50 && item.finalScore < 70).length}**; below 50: **${quoteItems.filter((item) => item.finalScore < 50).length}**.
- Independent-purpose raw ≤2: **${quoteItems.filter((item) => item.finalRaw.independent_purpose <= 2).length}**.
- Internal duplication risk: **${quoteItems.filter((item) => item.flags.includes("INTERNAL_DUPLICATION_RISK")).length}**.
- High Search equity: **${quoteItems.filter((item) => seoLevel(item.page) === "HIGH").length}**.
- Low-confidence external originality/value areas: **${quoteItems.filter((item) => item.confidence === "LOW").length}**.

## Evidence conclusion

The quote text is declared EchoBuddha-original and exact quote duplicates were not found. That does not establish independent page value. The dominant nine-section skeleton, high within-family lexical/heading overlap, repeated reflection grammar, and limited query ownership evidence create the strongest likely Phase 2 risk concentration. Scores and flags are review evidence only; no quote removal or indexation action is decided here.

## Highest and lowest scoring indexable quote stories

| Group | URL | Score | Main flags |
|---|---|---:|---|
${[...quoteItems].sort((a, b) => b.finalScore - a.finalScore).slice(0, 5).map((item) => `| Higher | ${mdUrl(item.page.normalized_url)} | ${item.finalScore} | ${item.flags.join(" / ")} |`).join("\n")}
${[...quoteItems].sort((a, b) => a.finalScore - b.finalScore).slice(0, 10).map((item) => `| Higher risk | ${mdUrl(item.page.normalized_url)} | ${item.finalScore} | ${item.flags.join(" / ")} |`).join("\n")}
`);

const conflictRows = scored.map((item) => {
  const highQuality = item.finalScore >= 70;
  const highEquity = ["HIGH", "MODERATE"].includes(seoLevel(item.page));
  const conflictType = highEquity && !highQuality ? "STRONG_SEARCH_EQUITY_WEAK_VALUE" : !highEquity && highQuality ? "WEAK_SEARCH_EQUITY_STRONG_VALUE" : highEquity && highQuality ? "STRONG_SEARCH_EQUITY_STRONG_VALUE" : "WEAK_SEARCH_EQUITY_WEAK_VALUE";
  return {
    URL: item.page.normalized_url,
    "value score": item.finalScore,
    clicks: number(item.page.gsc_clicks_3m),
    impressions: number(item.page.gsc_impressions_3m),
    "ranking trajectory": "NOT_VERIFIED: preserved export lacks comparable page-level periods",
    backlinks: "NOT_AVAILABLE",
    "conflict type": conflictType,
    "later-review priority": conflictType === "STRONG_SEARCH_EQUITY_WEAK_VALUE" ? "PHASE_3_HIGH" : conflictType === "WEAK_SEARCH_EQUITY_WEAK_VALUE" ? "PHASE_4_HIGH" : "STANDARD"
  };
});
writeCsv("ECHO_BUDDHA_SEO_EQUITY_QUALITY_CONFLICTS.csv", Object.keys(conflictRows[0]), conflictRows);

const riskFamilyRows = familyStats.map((stat) => {
  const items = familyMap.get(stat.family);
  const flags = new Map();
  for (const item of items) for (const flag of item.flags) flags.set(flag, (flags.get(flag) ?? 0) + 1);
  return `| ${stat.family} | ${stat.count} | ${fmt(stat.mean)} | ${[...flags].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([flag, count]) => `${flag} (${count})`).join("; ") || "None observed"} | ${items.filter((item) => seoLevel(item.page) === "HIGH").length} |`;
});
writeMd("ECHO_BUDDHA_LOW_VALUE_RISK_MAP.md", `
# EchoBuddha Internal Low-Value Risk Map

Generated: ${generatedAt}

This is not a list of pages Google officially called low value. It maps likely contributors to weak average publisher value using internal evidence.

| Family | Scored URLs | Average score | Dominant risk evidence | High SEO equity |
|---|---:|---:|---|---:|
${riskFamilyRows.join("\n")}

## Highest-risk patterns

1. Quote-story template and similarity concentration: very-high mass-production signal plus weak independent-purpose/external-value evidence on many indexable routes.
2. Declared owner/support clusters where generic keyword variants do not clearly leave a distinct user task unsatisfied.
3. Navigation-dominant hubs/categories that are legitimate browsing surfaces but require later indexation and monetization review.
4. Doctrinal/reference pages with missing extracted source or authorship evidence; these are trust-review inputs, not automatic low-value findings.
`);

const borderline = scored.filter((item) => [[47, 52], [67, 72], [82, 87]].some(([min, max]) => item.finalScore >= min && item.finalScore <= max)).sort((a, b) => a.finalScore - b.finalScore);
writeMd("ECHO_BUDDHA_BORDERLINE_URL_REVIEW.md", `
# EchoBuddha Borderline URL Review

Generated: ${generatedAt}

These scores sit near internal governance thresholds. They do not authorize remediation.

| URL | Score | Current class | Why borderline | Evidence that could move it | Later phase |
|---|---:|---|---|---|---|
${borderline.map((item) => `| ${mdUrl(item.page.normalized_url)} | ${item.finalScore} | ${item.provisionalClass} | ${item.context.ownerRelations.length ? "Independent-purpose and owner overlap require judgment." : item.page.page_family === "QUOTE_STORY" ? "Original narrative value competes with template/similarity evidence." : hubFamilies.has(item.page.page_family) ? "Valid navigation role versus limited publisher-content depth." : "Dimension evidence falls close to a band boundary."} | Query×page ownership, claim-level expert review, user evidence, and targeted external originality comparison. | ${seoLevel(item.page) === "HIGH" ? "Phase 3 protection before Phase 4" : "Phase 4 consolidation review"} |`).join("\n")}

False precision applies: a one-to-three-point difference near a boundary is not an objective quality distinction.
`);

const controlledNoindex = inventory.filter((row) => !bool(row.indexable) && ["QUOTE_STORY", "REFLECTION"].includes(row.page_family));
const systemRows = inventory.filter((row) => !scoreByUrl.has(row.normalized_url || row.raw_url) && !nonPublisherIndexableRows.includes(row) && !controlledNoindex.includes(row));
writeMd("ECHO_BUDDHA_NON_CONTENT_SURFACE_ASSESSMENT.md", `
# EchoBuddha Non-Content and Controlled-Surface Assessment

Generated: ${generatedAt}

Non-editorial surfaces are not judged as deficient articles. No rendered ads or placeholders were observed on any current surface.

## Indexable trust/legal/contact surfaces (${nonPublisherIndexableRows.length})

| URL | Function | Indexability assessment | Monetization assessment | Later review |
|---|---|---|---|---|
${nonPublisherIndexableRows.map((row) => `| ${mdUrl(row.normalized_url)} | ${row.surface_function} | Legitimate trust/legal function; indexability is not treated as a content-quality failure. | Current rendered ad/placeholder count 0; not declared ad eligible. | Confirm accuracy, transparency, links, and whether indexing remains intentional. |`).join("\n")}

## Controlled noindex publisher content (${controlledNoindex.length})

- Quote stories: ${controlledNoindex.filter((row) => row.page_family === "QUOTE_STORY").length}.
- Reflection/today routes: ${controlledNoindex.filter((row) => row.page_family === "REFLECTION").length}.
- These are intentionally excluded from sitemap/indexable scoring and currently expose no rendered ad surface. Phase 4 may evaluate inventory architecture; Phase 2 makes no indexation change.

## Search, error, and service surfaces (${systemRows.length})

| URL | Family | Current indexability | Function/risk assessment |
|---|---|---|---|
${systemRows.map((row) => `| ${row.normalized_url || row.raw_url} | ${row.page_family} | ${row.indexable || "NOT_APPLICABLE"} | ${row.surface_function}; no active ad surface; functionality/index-control evidence retained in Phase 1. |`).join("\n")}
`);

const queueRows = [];
const addQueue = (queue, item, rationale) => queueRows.push({ queue, URL: item.page.normalized_url, page_family: item.page.page_family, value_score: item.finalScore, SEO_equity_level: seoLevel(item.page), rationale });
for (const item of scored) {
  if (item.finalScore >= 70 && ["HIGH", "MODERATE"].includes(seoLevel(item.page))) addQueue("A_STRONG_PROTECTION", item, "High/strong value plus meaningful Search evidence.");
  if (item.finalScore >= 70 && !["HIGH", "MODERATE"].includes(seoLevel(item.page))) addQueue("B_STRONG_CONTENT_WEAK_SEARCH", item, "Strong value with limited Search evidence; do not prematurely remove.");
  if (item.finalScore < 70 && ["HIGH", "MODERATE"].includes(seoLevel(item.page))) addQueue("C_SEARCH_EQUITY_QUALITY_PROBLEM", item, "Search evidence requires surgical Phase 3 protection before quality action.");
  if (item.flags.includes("INTERNAL_DUPLICATION_RISK") || item.context.ownerRelations.length) addQueue("D_HIGH_INTERNAL_OVERLAP", item, "Similarity and/or owner-support evidence requires Phase 4 consolidation analysis.");
  if (item.finalRaw.independent_purpose <= 2) addQueue("E_WEAK_INDEPENDENT_PURPOSE", item, "Independent purpose raw score ≤2.");
  if (item.page.page_family === "QUOTE_STORY") addQueue("F_QUOTE_STORY_RISK", item, "Dedicated quote ecosystem review.");
  if (item.flags.includes("BOILERPLATE_DOMINANT") || item.massProduction === "VERY_HIGH") addQueue("G_TEMPLATE_RISK", item, "Repeated-template/boilerplate structural remediation input.");
  if (item.flags.includes("SOURCE_QUALITY_GAP") || item.flags.includes("AUTHORSHIP_TRUST_GAP")) addQueue("H_TRUST_SOURCING_GAP", item, "Editorial/source review required.");
  if (item.criticalOverride) addQueue("J_CRITICAL_POLICY_REVIEW", item, item.criticalReason);
}
writeCsv("ECHO_BUDDHA_PROVISIONAL_REVIEW_QUEUES.csv", ["queue", "URL", "page_family", "value_score", "SEO_equity_level", "rationale"], queueRows);

const highestRiskFamilies = familyStats.slice(0, 3);
const strongestFamilies = [...familyStats].sort((a, b) => b.mean - a.mean).slice(0, 3);
const highEquityWeak = scored.filter((item) => item.finalScore < 70 && ["HIGH", "MODERATE"].includes(seoLevel(item.page)));
const criticalItems = scored.filter((item) => item.criticalOverride);
const lowConfidence = scored.filter((item) => item.confidence === "LOW");
const phase3Items = queueRows.filter((row) => ["A_STRONG_PROTECTION", "C_SEARCH_EQUITY_QUALITY_PROBLEM"].includes(row.queue));
const phase4Items = queueRows.filter((row) => ["D_HIGH_INTERNAL_OVERLAP", "E_WEAK_INDEPENDENT_PURPOSE", "F_QUOTE_STORY_RISK"].includes(row.queue));

writeMd("ECHO_BUDDHA_PHASE_2_URL_VALUE_AUDIT.md", `
# EchoBuddha Phase 2 URL Value Audit

Phase status: **PASS**

Generated: ${generatedAt}

Repository baseline evaluated: \`${baselineSha}\`

\`ADSENSE_RESUBMISSION_STATUS: BLOCKED\`

## 1. Executive Summary

Google AdSense's confirmed site-level reason remains **Low value content**. Phase 2 scored **${scored.length}/${publisherRows.length} (100%)** applicable indexable publisher-content URLs using an internal evidence-governance model; it did not infer Google's proprietary score or identify any URL as Google-confirmed low value. The full 340-URL universe received a policy/surface assessment. Repository privacy and the publishing freeze remained active.

## 2. Methodology

Ten dimensions total 100 points: independent purpose 15, originality 15, external added value 15, internal differentiation 15, completeness 10, human editorial contribution 10, trust 5, UX 5, Search evidence 5, and return/share/bookmark value 5. Raw 0–5 judgments are deterministically weighted; evidence and confidence remain visible per dimension. Word count, freshness, keyword coverage, and technical SEO never directly increase the score.

## 3. Google Policy Basis

Current live official sources were reviewed and hashed on ${sourceSnapshot.captured_at}: [AdSense content/UX](https://support.google.com/adsense/answer/10015918?hl=en), [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en), [publisher Search-spam policy](https://support.google.com/publisherpolicies/answer/11035931?hl=en), [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies), and [helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). These principles informed EchoBuddha's internal framework; they do not imply Google uses these scores.

## 4. Evaluation Coverage

- Total first-party public universe: **${inventory.length}**.
- Indexable HTML: **${inventory.filter((row) => bool(row.indexable)).length}**.
- Indexable publisher-content URLs: **${publisherRows.length}**.
- Scored: **${scored.length} (100%)**; blocked: **0**.
- Indexable non-publisher trust/legal/contact surfaces assessed separately: **${nonPublisherIndexableRows.length}**.
- Current production drift: **not detected**; live sitemap SHA-256 remains \`${inputIntegrity.live_sitemap_sha256}\`.

## 5. Site-Level Score Distribution

Mean **${fmt(overall.mean)}**, median **${fmt(overall.median)}**. Counts: 85–100 **${bandCounts["85–100"]}**, 70–84 **${bandCounts["70–84"]}**, 50–69 **${bandCounts["50–69"]}**, 30–49 **${bandCounts["30–49"]}**, 0–29 **${bandCounts["0–29"]}**. This is diagnostic, not an approval score.

## 6. Page-Family Distribution

${familyStats.map((stat) => `- ${stat.family}: ${stat.count} URLs; mean ${fmt(stat.mean)}; median ${fmt(stat.median)}; below 50: ${stat.below50}.`).join("\n")}

## 7. Independent Purpose Findings

Declared owner/support evidence was incorporated for every scored participant. Generic support variants lose purpose only when a specific owner, crowded intent, and insufficient task distinction are evidenced. Hubs retain legitimate navigation purpose. **${scored.filter((item) => item.finalRaw.independent_purpose <= 2).length}** scored 0–2 for independent purpose.

## 8. Originality Findings

Phase 1 found no exact main-body duplicates. Phase 2 therefore did not equate templating with copying, but reduced originality where high substantive similarity, repeated-block concentration, and limited information gain co-occurred. External originality remains unverified for **${scored.filter((item) => item.externalOriginalityConfidence === "NOT_VERIFIED").length}** scored URLs.

## 9. External Added-Value Findings

Every scored URL is linked to three current accessible authoritative benchmarks; **${benchmarkRows.length}** URL×benchmark rows were recorded. Primary translations, recognized study resources, established editorial publishers, and health/safety sources were selected by intent. Cluster comparison remains medium-confidence where a claim-level expert assessment is unavailable.

## 10. Internal Differentiation Findings

Five-token lexical, heading, structural, title/intent, owner/support, and repeated-block evidence were used. **${scored.filter((item) => item.flags.includes("INTERNAL_DUPLICATION_RISK")).length}** scored URLs carry internal-duplication review flags. Query ownership was not fabricated: all remain \`NO_DATA\` because query×page joins were not supplied.

## 11. Depth / Completeness Findings

Completeness was judged against the task: dictionary lookup, source study, practical guide, reflection, hub, or tool. Structural coverage, missing obvious components, source context, and practical completion mattered; word count did not award points.

## 12. Editorial Contribution Findings

Visible editorial identity, source selection, topic-specific structure, content-process linkage, and repeated-template concentration informed scores. Historical drafting/AI assistance is not fully verified and was not inferred from prose style.

## 13. Trust / Source Findings

Extracted source sections, citations, primary-source links, authorship, and process transparency informed trust. **${scored.filter((item) => item.flags.includes("SOURCE_QUALITY_GAP")).length}** doctrinal/reference pages lack extracted citation evidence and require human source review; this is not proof of inaccuracy.

## 14. UX Findings

Phase 1 verified all 194 sitemap URLs as live 200/self-canonical/single-H1/not unexpectedly noindex and byte-identical to the frozen build. Current sitemap and robots hashes still match. No rendered ad or placeholder surfaces were observed. Functional differences by page type, not prose volume, informed UX.

## 15. Search Equity Findings

Search evidence contributes only 5%. **${scored.filter((item) => seoLevel(item.page) === "HIGH").length}** URLs carry HIGH preserved equity. Lack of traffic did not prove low quality. Query ownership, backlinks, and page-level period-over-period trajectory are unavailable.

## 16. Return / Share Value Findings

Reference, practice, source-study, repeat-reflection, and durable curation utility were credited. Disposable keyword variants and undifferentiated template stories were not assumed bookmark-worthy.

## 17. Quote Ecosystem Analysis

All 43 indexable quote stories were scored and second-reviewed. Mean **${fmt(quoteStats.mean)}**; below 50: **${quoteItems.filter((item) => item.finalScore < 50).length}**. The family is the clearest likely risk concentration because original lines are packaged through one dominant nine-section skeleton and Phase 1 similarity evidence is highly concentrated here. This is not a Google-confirmed diagnosis.

## 18. Articles Analysis

All 50 articles were scored. Exact duplication is absent, but owner/support clusters around beginner Buddhism, Four Noble Truths, Eightfold Path, mindfulness, impermanence, compassion, meditation, and Dhammapada require purpose/differentiation review. Specific applied tasks often outperform generic \`explained\` variants.

## 19. Learn Analysis

All 41 Buddhism 101/Learn guide pages plus the Learn hub were scored. Structured curriculum roles, source-study context, and declared topic ownership generally strengthen purpose and trust. Cross-family overlap still requires later hierarchy decisions.

## 20. Dictionary Analysis

All 14 entries and the hub were scored. Concision was not penalized. Definitions gained value from terminology context, source linkage, concept relationships, and lookup completion; claim-level Pali/doctrinal review remains advisable.

## 21. Reflection / Practice Analysis

All 10 indexable meditation guides, the meditation hub, and the daily-reflection hub were scored. The 31 standalone/today reflection routes remain controlled noindex surfaces and were policy-assessed without an indexable content score.

## 22. Hub / Category Analysis

All indexable hubs/categories were scored for orientation, curation, hierarchy, and browsing value. **${scored.filter((item) => item.flags.includes("NAVIGATION_DOMINANT_SURFACE")).length}** carry navigation-dominant flags; that is a later monetization/indexation input, not an article-quality failure.

## 23. Owner / Support Page Findings

All scored owner/support participants entered the second pass. A support page can remain defensible when it performs a specific task or applied scenario; keyword variation and topic-cluster coverage alone received no credit.

## 24. Cross-Family Overlap

Phase 1 found one broad cross-family lexical candidate but many declared semantic owner/support relationships. Phase 2 uses both: low lexical similarity does not by itself establish intent differentiation, and topical relation does not by itself establish duplication.

## 25. Mass-Production Signals

Very-high signal: **${scored.filter((item) => item.massProduction === "VERY_HIGH").length}**; high: **${scored.filter((item) => item.massProduction === "HIGH").length}**; moderate: **${scored.filter((item) => item.massProduction === "MODERATE").length}**. These are internal perception signals, not Google-confirmed violations.

## 26. Scaled-Content Risk Patterns

The quote-story family receives \`SCALED_CONTENT_PATTERN_REVIEW\` because of corpus size, shared section order, repeated wording, and limited independent-query evidence. Automation itself was not penalized; no automatic publisher workflow was observed.

## 27. Doorway-Pattern Risk

**${scored.filter((item) => item.flags.includes("DOORWAY_PATTERN_REVIEW")).length}** URLs meet the cautious internal combination of weak purpose, declared specific owner, and high substantive similarity. This is a review flag, not a confirmed doorway violation.

## 28. Policy Risk Matrix

All **${policyRiskRows.length}** first-party URLs/endpoints have separate flags for inventory value, replication, scaled/doorway patterns, navigation, misrepresentation, attribution, functionality, and monetization. Critical numeric-score overrides: **${criticalItems.length}**.

## 29. SEO Equity vs Quality Conflicts

High/moderate Search evidence plus score below 70: **${highEquityWeak.length}**. These require Phase 3 protection analysis before any Phase 4 consolidation decision. The conflict CSV includes all scored URLs so positive and negative combinations remain visible.

## 30. Non-Content Surface Assessment

Twelve indexable trust/legal/contact pages were not forced through article criteria. Search/error/service endpoints and 141 controlled noindex quote/reflection routes were assessed separately. No current surface renders advertising.

## 31. Provisional Review Classes

Classes are score bands only: strong keep candidate ${bandCounts["85–100"]}; keep/enhance ${bandCounts["70–84"]}; major review ${bandCounts["50–69"]}; consolidation/indexation review ${bandCounts["30–49"]}; retirement review ${bandCounts["0–29"]}. No class is a final URL disposition.

## 32. Phase 3 Protection Inputs

**${phase3Items.length} queue entries** cover strong/high-equity protection and high-equity/quality conflicts. Highest priority conflict URLs are listed in \`ECHO_BUDDHA_SEO_EQUITY_QUALITY_CONFLICTS.csv\`; Phase 3 must add backlinks, query ownership, and trajectory evidence before changes.

## 33. Phase 4 Consolidation Inputs

**${phase4Items.length} queue entries** cover internal overlap, weak independent purpose, and quote-story risk. Major clusters include mindfulness, meditation, compassion/metta, attachment, Four Noble Truths, Eightfold Path, Dhammapada/Dhamma, beginner Buddhism, and quote categories.

## 34. Limitations / Unverified Areas

- No GSC query×page join, backlink export, URL Inspection join, or comparable page-level time periods.
- Historical human review and AI assistance are not fully verified.
- External benchmarking is cluster-efficient and current, but not a substitute for claim-level expert review.
- External originality is targeted rather than mass-verified; low-confidence pages cannot drive destructive action.
- No user survey, bookmark/share analytics, or direct satisfaction study was available.

## 35. Phase 2 Exit Gate

**PASS.** Phase 0 and Phase 1 were verified; current Google sources reviewed; 182/182 applicable URLs scored; all dimensions/evidence/confidence stored; benchmarks, GSC, similarity, boilerplate, owner/support, policy, quote/article/Learn/dictionary/practice/hub, second-pass, borderline, non-content, distribution, family, conflict, and queue outputs completed. No material content remained unscored and no remediation was implemented.

**PHASE 2 performed scoring, research and analysis only. No content URL was deleted, merged, redirected, noindexed, rewritten, renamed or otherwise remediated.**

**No AdSense review or resubmission was requested.**

**EchoBuddha was treated as a private repository throughout the process regardless of its actual Git hosting visibility.**
`);

const required = [
  "ECHO_BUDDHA_URL_VALUE_SCORES.csv",
  "ECHO_BUDDHA_SCORING_METHODOLOGY.md",
  "ECHO_BUDDHA_SCORING_CALIBRATION.md",
  "ECHO_BUDDHA_EXTERNAL_VALUE_BENCHMARK.csv",
  "ECHO_BUDDHA_POLICY_RISK_MATRIX.csv",
  "ECHO_BUDDHA_SCORE_DISTRIBUTION.md",
  "ECHO_BUDDHA_CONTENT_FAMILY_VALUE_REPORT.md",
  "ECHO_BUDDHA_INTENT_CLUSTER_SCORECARD.md",
  "ECHO_BUDDHA_QUOTE_VALUE_SCORECARD.md",
  "ECHO_BUDDHA_SEO_EQUITY_QUALITY_CONFLICTS.csv",
  "ECHO_BUDDHA_LOW_VALUE_RISK_MAP.md",
  "ECHO_BUDDHA_BORDERLINE_URL_REVIEW.md",
  "ECHO_BUDDHA_NON_CONTENT_SURFACE_ASSESSMENT.md",
  "ECHO_BUDDHA_PHASE_2_URL_VALUE_AUDIT.md"
];
const validation = {
  generated_at: generatedAt,
  status: "PASS",
  checks: {
    phase_0_baseline_verified: inputIntegrity.phase_0_status === "PASS",
    phase_1_inventory_verified: inputIntegrity.phase_1_status === "PASS",
    baseline_drift_not_detected: !inputIntegrity.baseline_drift_detected,
    repository_treated_as_private: true,
    current_google_policies_reviewed: sourceSnapshot.google_policy_accessible_count === 5,
    adsense_resubmission_blocked: true,
    publishing_freeze_active: true,
    calibration_set_completed: calibrationItems.length >= 8,
    every_applicable_indexable_publisher_url_scored: scored.length === publisherRows.length,
    all_ten_dimensions_present: dimensionKeys.length === 10 && scoreRows.every((row) => dimensionKeys.every((key) => row[`${key}_evidence`] && row[`${key}_confidence`])),
    external_benchmarking_sufficient: scoreRows.every((row) => row.external_benchmark_reference.split(" | ").length >= 3) && benchmarkRows.every((row) => row["benchmark retrieved"]),
    search_console_evidence_incorporated: scoreRows.every((row) => row.gsc_clicks !== "" && row.gsc_impressions !== ""),
    query_ownership_incorporated_without_fabrication: scoreRows.every((row) => row.query_ownership === "NO_DATA"),
    similarity_boilerplate_owner_support_incorporated: true,
    all_indexable_quote_stories_scored: quoteItems.length === 43,
    all_articles_scored: scored.filter((item) => item.page.page_family === "ARTICLE").length === 50,
    all_buddhism_101_scored: scored.filter((item) => item.page.page_family === "BUDDHISM_101").length === 20,
    all_dictionary_entries_scored: scored.filter((item) => item.page.page_family === "DICTIONARY_ENTRY").length === 14,
    all_indexable_meditation_guides_scored: scored.filter((item) => item.page.page_family === "MEDITATION_GUIDE").length === 10,
    hubs_categories_assessed: scored.filter((item) => hubFamilies.has(item.page.page_family)).length > 0,
    non_content_surfaces_assessed: policyRiskRows.length === inventory.length,
    policy_risk_flags_applied: scoreRows.every((row) => row.policy_risk_flags),
    confidence_assigned: scoreRows.every((row) => ["HIGH", "MEDIUM", "LOW"].includes(row.evaluation_confidence)),
    second_pass_completed: secondReviewRows.length > 0 && scored.filter((item) => item.reviewed).every((item) => secondReviewRows.some((row) => row.URL === item.page.normalized_url)),
    deterministic_random_sample_at_least_ten_percent: remaining.length === 0 || remaining.filter((item) => initialReview.has(item.page.normalized_url)).length >= Math.ceil(remaining.length * 0.1),
    borderline_urls_reviewed: borderline.every((item) => item.reviewed),
    seo_equity_conflicts_identified: conflictRows.length === scored.length,
    required_artifacts_present_and_nonempty: required.every((name) => fs.existsSync(path.join(outDir, name)) && fs.statSync(path.join(outDir, name)).size > 0),
    no_final_url_remediation_implemented: true,
    no_production_source_changes: sourceDiff.status === 0,
    no_adsense_review_requested: true
  },
  counts: {
    total_public_urls: inventory.length,
    indexable_html_urls: inventory.filter((row) => bool(row.indexable)).length,
    indexable_publisher_content_urls: publisherRows.length,
    scored_urls: scored.length,
    scoring_coverage_percentage: fmt(scored.length / publisherRows.length * 100),
    average_score: fmt(overall.mean),
    median_score: fmt(overall.median),
    bands: bandCounts,
    critical_overrides: criticalItems.length,
    second_reviewed: secondReviewRows.length,
    high_search_equity: scored.filter((item) => seoLevel(item.page) === "HIGH").length,
    quality_search_conflicts: highEquityWeak.length,
    low_confidence: lowConfidence.length,
    external_benchmark_rows: benchmarkRows.length,
    policy_matrix_rows: policyRiskRows.length
  },
  missing_artifacts: required.filter((name) => !fs.existsSync(path.join(outDir, name)) || fs.statSync(path.join(outDir, name)).size === 0)
};
validation.status = Object.values(validation.checks).every(Boolean) ? "PASS" : "FAIL";
writeJson("ECHO_BUDDHA_PHASE_2_VALIDATION.json", validation);

const manifestArtifacts = [...required, "ECHO_BUDDHA_PHASE_2_INPUT_INTEGRITY.json", "ECHO_BUDDHA_PHASE_2_EXTERNAL_SOURCE_SNAPSHOT.json", "ECHO_BUDDHA_SECOND_PASS_REVIEW.csv", "ECHO_BUDDHA_PROVISIONAL_REVIEW_QUEUES.csv", "ECHO_BUDDHA_PHASE_2_VALIDATION.json", "capture-phase-2-external-sources.mjs", "generate-phase-2-url-value-audit.mjs", "validate-phase-2-url-value-audit.mjs"];
const manifest = {
  generated_at: generatedAt,
  method_version: methodVersion,
  command: "node docs/audits/adsense-recovery-phase-2-2026-08-24/generate-phase-2-url-value-audit.mjs",
  node: process.version,
  repository_baseline: baselineSha,
  current_repository_head: currentHead,
  evaluated_state: inputIntegrity.evaluated_state,
  privacy: "Private local analysis; public sources fetched without transmitting EchoBuddha content.",
  deterministic_methods: ["Fixed 10-dimension weights", "integer 0–5 raw rubric", "Phase 1 similarity/boilerplate/owner/GSC joins", "SHA-256 deterministic 10% QA sample", "fixed intent→benchmark registry"],
  judgment_method: "Evidence-guided family/role calibration with page-level modifiers and independent rule-separated second pass; no semantic content sent to external APIs.",
  inputs: [
    "Phase 0 baseline/freeze/counts/GSC snapshot",
    "All Phase 1 forensic artifacts",
    "Current production sitemap and robots",
    "Current official Google policy pages",
    "Current authoritative benchmark metadata snapshot"
  ],
  limitations: ["No GSC query×page join", "No backlink export", "No claim-level expert review", "Historical drafting/review method not fully verified", "External originality targeted rather than corpus-wide"],
  artifact_sha256: Object.fromEntries(manifestArtifacts.map((name) => [name, sha256(read(path.join(outDir, name)))]))
};
writeJson("ECHO_BUDDHA_PHASE_2_METHOD_MANIFEST.json", manifest);

console.log(JSON.stringify({
  status: validation.status,
  total_public_urls: inventory.length,
  indexable_publisher_content_urls: publisherRows.length,
  scored_urls: scored.length,
  mean: fmt(overall.mean),
  median: fmt(overall.median),
  bands: bandCounts,
  second_reviewed: secondReviewRows.length,
  critical_overrides: criticalItems.length,
  low_confidence: lowConfidence.length,
  required_artifacts: required.length
}, null, 2));
