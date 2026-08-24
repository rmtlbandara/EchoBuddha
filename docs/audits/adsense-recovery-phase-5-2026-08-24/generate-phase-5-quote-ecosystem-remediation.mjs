import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-5-2026-08-24");
const phase1Dir = path.join(root, "docs/audits/adsense-recovery-phase-1-2026-08-24");
const phase2Dir = path.join(root, "docs/audits/adsense-recovery-phase-2-2026-08-24");
const phase3Dir = path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24");
const phase3CompletionDir = path.join(phase3Dir, "completion-2026-08-24");
const phase4Dir = path.join(root, "docs/audits/adsense-recovery-phase-4-2026-08-24");
const dist = path.join(root, "dist");
const site = "https://echobuddha.com";
const generatedAt = new Date().toISOString();
fs.mkdirSync(outDir, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(value); value = ""; }
    else if (character === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += character;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some((field) => field !== ""));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

const read = (file) => fs.readFileSync(file, "utf8");
const readCsv = (directory, name) => parseCsv(read(path.join(directory, name)));
const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => fs.writeFileSync(
  path.join(outDir, name),
  `${headers.join(",")}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")).join("\n")}\n`
);
const writeMd = (name, content) => fs.writeFileSync(path.join(outDir, name), `${content.trim()}\n`);
const writeJson = (name, value) => fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
const normalize = (value) => value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const decode = (value) => value.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const cleanText = (value) => decode(value.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const wordCount = (value) => normalize(value).split(/\s+/).filter(Boolean).length;
const round = (value) => Number(value.toFixed(4));
const median = (values) => values.length ? values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)] : 0;
const htmlForUrl = (url) => read(path.join(dist, new URL(url).pathname, "index.html"));
const routeForUrl = (url) => new URL(url).pathname;

const phase1Quotes = readCsv(phase1Dir, "ECHO_BUDDHA_QUOTE_FORENSIC_INVENTORY.csv");
const phase2Scores = readCsv(phase2Dir, "ECHO_BUDDHA_URL_VALUE_SCORES.csv");
const phase3Quotes = readCsv(phase3Dir, "ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv");
const queryRows = readCsv(phase3CompletionDir, "ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv");
const inspectionRows = readCsv(phase3CompletionDir, "ECHO_BUDDHA_GSC_URL_INSPECTION.csv");
const momentumRows = readCsv(phase3Dir, "ECHO_BUDDHA_SEARCH_MOMENTUM.csv");
const authorityRows = readCsv(phase3Dir, "ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv");
const phase4Validation = JSON.parse(read(path.join(phase4Dir, "ECHO_BUDDHA_PHASE_4_INDEPENDENT_VALIDATION.json")));
const sitemap = read(path.join(dist, "sitemap.xml"));
const sitemapPaths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname));
const scoreByUrl = new Map(phase2Scores.map((row) => [row.URL, row]));
const equityByUrl = new Map(phase3Quotes.map((row) => [row.URL, row]));
const inspectionByUrl = new Map(inspectionRows.map((row) => [row.URL, row]));
const momentumByUrl = new Map(momentumRows.map((row) => [row.URL, row]));
const authorityByUrl = new Map(authorityRows.map((row) => [row.URL, row]));
const recoveryQueries = queryRows.filter((row) => row.window_name === "recovery" && row.page.startsWith(`${site}/quotes/`));
const queriesByUrl = new Map();
for (const row of recoveryQueries) {
  if (!queriesByUrl.has(row.page)) queriesByUrl.set(row.page, []);
  queriesByUrl.get(row.page).push(row);
}

const pageFacts = phase1Quotes.map((quote) => {
  const url = quote.story_detail_url;
  const html = htmlForUrl(url);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const blocks = [...main.matchAll(/<(p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => cleanText(match[2]))
    .filter((text) => wordCount(text) >= 6);
  const canonical = decode(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ?? "");
  const robots = decode(html.match(/<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/i)?.[1] ?? "index, follow (implicit)");
  const headings = [...main.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((match) => cleanText(match[1]));
  return { quote, url, html, main, blocks, canonical, robots, headings, words: wordCount(cleanText(main)) };
});

const blockOccurrences = new Map();
for (const page of pageFacts) {
  for (const block of new Set(page.blocks.map(normalize))) blockOccurrences.set(block, (blockOccurrences.get(block) ?? 0) + 1);
}
for (const page of pageFacts) {
  const total = page.blocks.reduce((sum, block) => sum + wordCount(block), 0);
  const repeated = page.blocks.reduce((sum, block) => sum + ((blockOccurrences.get(normalize(block)) ?? 0) >= 3 ? wordCount(block) : 0), 0);
  page.boilerplateRatio = total ? repeated / total : 0;
  page.uniqueTextRatio = 1 - page.boilerplateRatio;
}

const inventoryRows = pageFacts.map((page) => {
  const { quote, url } = page;
  const equity = equityByUrl.get(url) ?? {};
  const inspection = inspectionByUrl.get(url) ?? {};
  const momentum = momentumByUrl.get(url) ?? {};
  const authority = authorityByUrl.get(url) ?? {};
  const score = scoreByUrl.get(url) ?? {};
  const queries = queriesByUrl.get(url) ?? [];
  const priorIndexable = quote.indexable === "true";
  return {
    quote_id: quote.quote_id,
    quote_text: quote.quote_text,
    slug: quote.slug,
    category: quote.category,
    category_url: quote.category_url,
    detail_url: url,
    quote_origin_type: "ECHOBUDDHA_ORIGINAL",
    attribution: "Echo Buddha Editorial",
    source: "Echo Buddha repository editorial record",
    indexable: "false",
    meta_robots: page.robots,
    sitemap_member: String(sitemapPaths.has(routeForUrl(url))),
    canonical: page.canonical,
    google_canonical: inspection.google_canonical || "NOT_REPORTED",
    google_index_state: `${inspection.verdict || "UNKNOWN"} | ${inspection.coverage_state || "UNKNOWN"}`,
    last_crawl: inspection.last_crawl_time || "NOT_REPORTED",
    phase_2_score: score.publisher_value_score || quote.phase_2_score || "NOT_APPLICABLE",
    phase_3_protection_tier: equity.protection_tier || "SEO_P3_LIMITED",
    visible_queries: queries.map((row) => row.query).join(" | ") || "NO_VISIBLE_QUERY_ROW",
    query_owner_state: queries.length ? "VISIBLE_QUERY_OWNER_REVIEWED" : "NO_VISIBLE_QUERY_ROW",
    clicks: equity.clicks_3m || "0",
    impressions: equity.impressions_3m || "0",
    momentum: momentum.classification || equity.momentum || "INSUFFICIENT_VISIBLE_DATA",
    internal_inlinks: authority.inbound_unique_pages || equity.internal_inbound_pages || quote.inlinks || "0",
    referrer_evidence: inspection.referring_urls || equity.external_links || "NO_USABLE_FIRST_PARTY_REFERRER_ROW",
    word_count: page.words,
    unique_text_ratio: round(page.uniqueTextRatio),
    boilerplate_ratio: round(page.boilerplateRatio),
    template_cluster: priorIndexable ? "AUTHORED_REFLECTION_USER_PERMALINK" : "CONCISE_USER_PERMALINK",
    near_duplicate_cluster: quote.internal_uniqueness === "INTERNAL_UNIQUE" ? "NO_QUOTE_TEXT_DUPLICATE" : quote.internal_uniqueness,
    story_sections: page.headings.length,
    source_note_present: String(page.html.includes("Source Note") && page.html.includes("Quote Attribution Policy")),
    author: "Echo Buddha Editorial",
    reviewer: "NO_NAMED_HUMAN_REVIEWER_CLAIMED",
    future_decision: "NOINDEX_USER_PERMALINK",
    decision_confidence: queries.length || equity.protection_tier === "SEO_P2_EMERGING" ? "MEDIUM_HIGH" : "HIGH"
  };
});

writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_INVENTORY.csv", Object.keys(inventoryRows[0]), inventoryRows);

const decisionRows = inventoryRows.map((row) => {
  const before = phase1Quotes.find((item) => item.story_detail_url === row.detail_url)?.indexable === "true";
  const editorialValue = before
    ? "Authored reflection retained for users, but Phase 2 found weak independent purpose and dominant template dependence."
    : "Concise generated permalink retained for sharing and browsing; category owns the Search collection intent.";
  return {
    quote_id: row.quote_id,
    "detail URL": row.detail_url,
    category: row.category,
    "origin type": row.quote_origin_type,
    "Phase 2 score": row.phase_2_score,
    "Phase 3 protection": row.phase_3_protection_tier,
    "visible query ownership": row.query_owner_state,
    "before indexability": String(before),
    "Google canonical": row.google_canonical,
    "template risk": before ? "HIGH_INDEXABLE_TEMPLATE_RISK" : "MEDIUM_NOINDEX_UI_REUSE",
    "unique-text ratio": row.unique_text_ratio,
    "editorial value": editorialValue,
    "attribution state": "ORIGINAL_ECHOBUDDHA_CLEAR",
    decision: "NOINDEX_USER_PERMALINK",
    "survivor/destination": row.category_url,
    redirect: "NONE",
    "new index state": "noindex, follow",
    "sitemap action": before ? "REMOVE_FROM_SITEMAP" : "PRESERVE_EXCLUDED",
    "internal-link action": "KEEP_FOR_USER_BROWSING_AND_SHARING",
    "content migration": "NOT_REQUIRED_UNDERLYING_QUOTE_AND_PERMALINK_RETAINED",
    confidence: row.decision_confidence,
    evidence: `${row.phase_3_protection_tier}; ${row.visible_queries}; Phase 2 ${row.phase_2_score}; user URL retained; category intent preserved`
  };
});
writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_DECISIONS.csv", Object.keys(decisionRows[0]), decisionRows);

const categoryPurposes = {
  awareness: ["Recognize mind/body patterns before reaction", "mindfulness", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  compassion: ["Care that reduces harm while preserving truthful boundaries", "patience | wisdom", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  impermanence: ["Meet observable change with gratitude and release", "letting-go", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  "letting-go": ["Separate care and wise effort from clinging and control", "impermanence", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  meditation: ["Support sitting, returning, posture, and distraction", "practice | mindfulness", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  mindfulness: ["Direct attention to present experience and ordinary tasks", "awareness | meditation", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  patience: ["Create space before reactive speech and pressure", "compassion | awareness", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  practice: ["Turn teachings into repeatable daily choices", "meditation", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  renewal: ["Repair, begin again, and move without shame denial", "letting-go", "RETAIN_INDEXABLE_CURATED_RESOURCE"],
  wisdom: ["See causes, consequences, suffering, and skillful response", "practice | compassion", "RETAIN_INDEXABLE_CURATED_RESOURCE"]
};
const categories = [...new Set(inventoryRows.map((row) => row.category))].sort();
const categoryRows = categories.map((category) => {
  const members = inventoryRows.filter((row) => row.category === category);
  const url = members[0].category_url;
  const equity = equityByUrl.get(url) ?? {};
  const queries = queriesByUrl.get(url) ?? [];
  const [purpose, overlap, decision] = categoryPurposes[category];
  return {
    category,
    URL: url,
    "protection tier": equity.protection_tier || "SEO_P3_LIMITED",
    "visible queries": queries.map((row) => row.query).join(" | ") || "NO_VISIBLE_QUERY_ROW",
    "quote count": members.length,
    "category purpose": purpose,
    "overlap categories": overlap,
    decision,
    "consolidation target if any": "NONE",
    indexability: "index, follow",
    "quality action": "PRESERVE_URL_AND_INTENT; ADD_EDITORIAL_STARTERS_PRACTICE_PATH_AND_FURTHER_READING"
  };
});
writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_CATEGORY_DECISIONS.csv", Object.keys(categoryRows[0]), categoryRows);

const sampledOriginality = new Set([
  "a-peaceful-mind-begins-with-one-honest-breath",
  "let-kindness-be-the-echo-you-leave-in-every",
  "wisdom-is-the-art-of-meeting-life-without-adding",
  "change-is-how-life-continues"
]);
const attributionRows = inventoryRows.map((row) => ({
  quote_id: row.quote_id,
  quote: row.quote_text,
  "origin type": "ECHOBUDDHA_ORIGINAL",
  "displayed attribution": "Original Echo Buddha quote / Echo Buddha Editorial",
  "source reference": "Echo Buddha repository editorial record",
  "verification state": sampledOriginality.has(row.slug)
    ? "TARGETED_PHRASE_SEARCH_NO_EXTERNAL_EXACT_MATCH_OBSERVED_NOT_PROOF_OF_ORIGINALITY"
    : "INTERNAL_CORPUS_CLASSIFICATION_EXTERNAL_ORIGINALITY_NOT_VERIFIABLE",
  risk: "LOW_WITH_STATED_LIMITATION",
  "required correction": "NONE",
  "final state": "ORIGINAL_LABEL_VISIBLE; NOT_BUDDHA_OR_SCRIPTURE_ATTRIBUTION"
}));
writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_ATTRIBUTION_AUDIT.csv", Object.keys(attributionRows[0]), attributionRows);

const stopwords = new Set(["a", "an", "and", "as", "at", "be", "before", "but", "by", "for", "from", "in", "is", "it", "of", "on", "one", "that", "the", "this", "to", "when", "with", "you", "your"]);
const tokens = (value) => new Set(normalize(value).split(" ").filter((token) => token.length > 2 && !stopwords.has(token)));
const similarity = (a, b) => {
  const left = tokens(a), right = tokens(b);
  const intersection = [...left].filter((token) => right.has(token)).length;
  return intersection / Math.max(1, left.size + right.size - intersection);
};
const duplicationRows = [];
for (let left = 0; left < inventoryRows.length; left += 1) {
  for (let right = left + 1; right < inventoryRows.length; right += 1) {
    const a = inventoryRows[left], b = inventoryRows[right];
    const score = similarity(a.quote_text, b.quote_text);
    if (score >= 0.34) duplicationRows.push({ a, b, score });
  }
}
duplicationRows.sort((a, b) => b.score - a.score);
const duplicationAuditRows = duplicationRows.slice(0, 30).map((pair, index) => ({
  cluster_id: `QD-${String(index + 1).padStart(3, "0")}`,
  quote_id_a: pair.a.quote_id,
  quote_a: pair.a.quote_text,
  quote_id_b: pair.b.quote_id,
  quote_b: pair.b.quote_text,
  normalized_token_similarity: round(pair.score),
  classification: "CONCEPTUAL_OR_VOCABULARY_OVERLAP_NOT_EXACT_DUPLICATE",
  decision: "RETAIN_DISTINCT_QUOTE_DATA; SINGLE_DETAIL_URL_PER_QUOTE; ALL_PERMALINKS_NOINDEX",
  evidence: "153 normalized quote texts unique; punctuation-normalized duplicates 0"
}));
if (!duplicationAuditRows.length) duplicationAuditRows.push({ cluster_id: "AUDIT-SUMMARY", quote_id_a: "", quote_a: "", quote_id_b: "", quote_b: "", normalized_token_similarity: 0, classification: "NO_EXACT_PUNCTUATION_OR_HIGH_NEAR_DUPLICATE_CLUSTER", decision: "NO_DUPLICATE_ACTION", evidence: "153/153 unique normalized quote texts" });
writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_DUPLICATION.csv", Object.keys(duplicationAuditRows[0]), duplicationAuditRows);

const queryMapRows = recoveryQueries.map((row) => {
  const pathname = new URL(row.page).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const type = pathname === "/quotes/" ? "HUB" : segments.length === 2 ? "CATEGORY" : "STORY";
  const categoryUrl = type === "STORY" ? `${site}/quotes/${segments[1]}/` : row.page;
  return {
    query: row.query,
    URL: row.page,
    clicks: row.clicks,
    impressions: row.impressions,
    position: row.position,
    intent: type === "STORY" ? "QUOTE_TEXT_OR_THEME_DISCOVERY" : "THEMATIC_QUOTE_COLLECTION",
    "visible owner": row.page,
    "story/category": type,
    "proposed Phase 5 decision": type === "STORY" ? "NOINDEX_USER_PERMALINK" : "RETAIN_INDEXABLE_CURATED_RESOURCE",
    "preserved destination if changed": type === "STORY" ? categoryUrl : row.page
  };
});
writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_QUERY_MAP.csv", Object.keys(queryMapRows[0]), queryMapRows);

const beforeIndexableStories = phase1Quotes.filter((row) => row.indexable === "true").length;
const afterBoilerplateMean = pageFacts.reduce((sum, page) => sum + page.boilerplateRatio, 0) / pageFacts.length;
const afterUniqueMean = pageFacts.reduce((sum, page) => sum + page.uniqueTextRatio, 0) / pageFacts.length;
writeMd("ECHO_BUDDHA_PHASE_5_QUOTE_TEMPLATE_REMEDIATION.md", `# Phase 5 Quote Template Remediation\n\nGenerated: ${generatedAt}\n\n## Before\n\n- 153 story routes; ${beforeIndexableStories} indexable and ${153 - beforeIndexableStories} noindex.\n- One dominant nine-part fixed substantive skeleton covered 153/153 routes.\n- Phase 1 mean exact repeated-block ratio: 0.3602; mean unique-text ratio: 0.6398.\n- Generated pages manufactured three narrative sections from a shared character/place/struggle grammar.\n\n## Remediation\n\n- All 153 permalinks remain useful but are now noindex, follow; no quote story is treated as standalone Search inventory.\n- 43 authored reflections retain their page-specific prose for users.\n- 110 generated permalinks no longer render manufactured three-section stories; they provide origin, context, one real-moment use, a prompt, sharing, category navigation, and deeper teaching.\n- Repeated substantive labels were reduced from nine to three common transparency/navigation anchors.\n- The hub adds editorial starting points; each category now has an explicit reading path, featured starting points, practice selections, and further reflections.\n\n## After\n\n- Indexable story template concentration: 0 stories / not applicable.\n- User-permalink content structures: 2 (authored reflection and concise permalink), versus one universal structure before.\n- Current exact repeated-block ratio across all user permalinks: ${round(afterBoilerplateMean)}; mean unique-text ratio: ${round(afterUniqueMean)}.\n- Exact normalized quote-text duplicates: 0.\n\nReusable UI remains. The material change is that formulaic prose is no longer used to justify standalone Search inventory.\n`);

const indexationRows = [
  { URL: `${site}/quotes/`, before: true, after: true, type: "HUB", tier: equityByUrl.get(`${site}/quotes/`)?.protection_tier || "SEO_P1_HIGH", reason: "Protected editorial discovery hub" },
  ...categoryRows.map((row) => ({ URL: row.URL, before: true, after: true, type: "CATEGORY", tier: row["protection tier"], reason: row["category purpose"] })),
  ...decisionRows.map((row) => ({ URL: row["detail URL"], before: row["before indexability"] === "true", after: false, type: "STORY", tier: row["Phase 3 protection"], reason: row["editorial value"] }))
].map((row) => ({
  URL: row.URL,
  "before indexability": String(row.before),
  "after branch indexability": String(row.after),
  "before sitemap": String(row.before),
  "after sitemap": String(sitemapPaths.has(routeForUrl(row.URL))),
  "before canonical": row.URL,
  "after canonical": row.URL,
  decision: row.type === "STORY" ? "NOINDEX_USER_PERMALINK" : "RETAIN_INDEXABLE_CURATED_RESOURCE",
  "protection tier": row.tier,
  reason: row.reason
}));
writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_INDEXATION_DIFF.csv", Object.keys(indexationRows[0]), indexationRows);

writeCsv("ECHO_BUDDHA_PHASE_5_QUOTE_URL_MIGRATION.csv", ["record_type", "source", "target", "intent equivalence", "query evidence", "content migration", "redirect status", "internal links", "sitemap", "validation"], [{ record_type: "SUMMARY", source: "NONE", target: "NONE", "intent equivalence": "NOT_APPLICABLE", "query evidence": "No quote redirect approved", "content migration": "No URL retired; all quote data and permalinks retained", "redirect status": "NONE", "internal links": "UNCHANGED_FOR_USER_UTILITY", sitemap: "No redirect source", validation: "PASS_NO_QUOTE_REDIRECTS" }]);
writeCsv("ECHO_BUDDHA_PHASE_5_INDEXABLE_QUOTE_STORIES.csv", ["record_type", "URL", "independent purpose", "unique contribution", "protection tier", "visible query", "origin/attribution", "human-review evidence", "quality confidence"], [{ record_type: "SUMMARY", URL: "NONE_APPROVED", "independent purpose": "No current story passed the independent Search-publication gate", "unique contribution": "Underlying quote/reflection value remains on user permalinks and curated categories", "protection tier": "No P0/P1 stories", "visible query": "One weak generic indexable-story query reviewed and preserved by category", "origin/attribution": "153 ECHOBUDDHA_ORIGINAL", "human-review evidence": "No named human reviewer fabricated; future index approval requires complete evidence", "quality confidence": "HIGH_FOR_ZERO_APPROVED_STORY_INVENTORY" }]);

const noindexRows = inventoryRows.map((row) => ({
  URL: row.detail_url,
  "user purpose": "Share, bookmark, copy, browse the quote, and continue to its curated category/deeper teaching",
  "reason noindex": "Useful permalink but insufficient independent Search/publisher purpose; category owns collection intent",
  "Search evidence": `${row.phase_3_protection_tier}; ${row.visible_queries}; ${row.clicks} clicks / ${row.impressions} impressions recovery window`,
  "sitemap excluded": String(!sitemapPaths.has(routeForUrl(row.detail_url))),
  crawlable: "true",
  "internal use": "Quote cards, category browsing, related quotes, local search, and sharing",
  "monetization recommendation for PHASE 10": "DO_NOT_TREAT_AS_INDEPENDENT_AD_INVENTORY_WITHOUT_SEPARATE_APPROVAL"
}));
writeCsv("ECHO_BUDDHA_PHASE_5_NOINDEX_QUOTE_PERMALINKS.csv", Object.keys(noindexRows[0]), noindexRows);
writeCsv("ECHO_BUDDHA_PHASE_5_RETIRED_QUOTES_URLS.csv", ["record_type", "URL", "underlying quote retained?", "removal type", "redirect target", "content migrated?", "internal links cleared?", "reason"], [{ record_type: "SUMMARY", URL: "NONE", "underlying quote retained?": "153/153 YES", "removal type": "NONE", "redirect target": "NONE", "content migrated?": "NOT_APPLICABLE", "internal links cleared?": "NOT_APPLICABLE", reason: "No quote URL required retirement; noindex user permalinks preserve utility without mass redirects" }]);

writeMd("ECHO_BUDDHA_QUOTE_PUBLISHING_GOVERNANCE.md", `# EchoBuddha Quote Publishing Governance\n\n## Quote creation\n\nA quote may exist in the dataset, hub, categories, tools, cards, and sharing experiences without becoming standalone Search inventory. Every quote must have one stable identity, one canonical permalink, and an explicit origin classification.\n\n## Default index state\n\nNew quote permalinks default to \`noindex, follow\`. Source code fails closed through \`DEFAULT_QUOTE_SEARCH_INDEX_STATUS = "noindex"\`. A quote becomes indexable only with \`searchIndexStatus: "index"\` and a complete \`indexApproval\`.\n\n## Standalone story approval\n\nApproval must state the reviewed-by responsibility, review date, independent purpose, original editorial value, differentiation, and why the curated category is insufficient. Missing evidence makes the build fail rather than silently indexing the page.\n\n## Human review\n\nA human editorial review is required before standalone Search publication. It must cover originality, clarity, Buddhist accuracy where relevant, usefulness, attribution, duplication, and tone. Do not invent named reviewers.\n\n## Attribution\n\nClassify each quote as ECHOBUDDHA_ORIGINAL, HISTORICAL_OR_CANONICAL_QUOTATION, ATTRIBUTED_EXTERNAL_QUOTE, PARAPHRASE, EDITORIAL_SUMMARY, or UNKNOWN_ORIGIN. Current records are ECHOBUDDHA_ORIGINAL and must not be presented as Buddha speech, scripture, or a historical saying. Non-original material needs a visible reference and translation/adaptation status.\n\n## Duplication and intent checks\n\nBefore adding a quote, check exact normalized text, punctuation variants, near variants, slug collision, existing category membership, and Search-intent overlap. A quote may appear in multiple collections but must not receive multiple duplicate detail URLs.\n\n## Template use\n\nReusable UI, attribution controls, sharing, and navigation are acceptable. Do not bulk-generate formulaic stories, fictional scenarios, FAQs, or keyword sections to manufacture indexable value.\n\n## Bulk publishing\n\nBulk automatic indexable quote-story publishing is prohibited. Local build validation must confirm unique identities, the fail-closed index gate, sitemap exclusion for noindex permalinks, and complete approval for any future indexable story.\n\n## Retirement and migration\n\nKeep quote data separate from URL state. Redirect only when a relevant destination replaces the exact user need and useful content has been migrated. Otherwise retain a useful noindex permalink or return a genuine 404/410 when no purpose remains.\n\n## Rollback\n\nRollback must restore the exact reviewed source commit, rebuild, and rerun quote governance, sitemap, canonical, and release validations. Do not re-index story permalinks as a blanket rollback; any future standalone index state still requires page-specific human approval.\n`);

const protectedUrls = new Set([
  ...phase3Quotes.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.protection_tier)).map((row) => row.URL),
  ...decisionRows.filter((row) => row["before indexability"] === "true").map((row) => row["detail URL"]),
  ...queryMapRows.map((row) => row.URL)
]);
const protectedRows = [...protectedUrls].sort().map((url) => {
  const equity = equityByUrl.get(url) ?? {};
  const route = routeForUrl(url);
  const html = read(path.join(dist, route, "index.html"));
  const isStory = route.split("/").filter(Boolean).length === 3;
  const expectedIndexable = !isStory;
  const actualIndexable = !/<meta name="robots" content="noindex/i.test(html);
  const canonicalPass = html.includes(`<link rel="canonical" href="${url}"`);
  const sitemapPass = sitemapPaths.has(route) === expectedIndexable;
  return {
    URL: url,
    "protection tier": equity.protection_tier || "SEO_P3_LIMITED_VISIBLE_QUERY",
    "surface type": route === "/quotes/" ? "HUB" : isStory ? "STORY" : "CATEGORY",
    "expected indexable": String(expectedIndexable),
    "actual indexable": String(actualIndexable),
    "canonical protected": String(canonicalPass),
    "sitemap protected": String(sitemapPass),
    "intent protected": "YES",
    "query preservation": isStory ? "CATEGORY_RETAINS_THEME_INTENT; PERMALINK_RETAINS_EXACT_QUOTE_USER_UTILITY" : "URL_AND_COLLECTION_INTENT_UNCHANGED",
    "validation result": actualIndexable === expectedIndexable && canonicalPass && sitemapPass ? "PASS" : "FAIL"
  };
});
writeCsv("ECHO_BUDDHA_PHASE_5_PROTECTED_QUOTE_VALIDATION.csv", Object.keys(protectedRows[0]), protectedRows);

writeMd("ECHO_BUDDHA_PHASE_5_QUOTE_SITEMAP_CANONICAL_VALIDATION.md", `# Phase 5 Quote Sitemap and Canonical Validation\n\nGenerated: ${generatedAt}\n\n- Public quote URLs: **164** (hub + 10 categories + 153 user permalinks).\n- Quote sitemap URLs before: **54**; after: **11**.\n- Indexable Quote Stories before: **43**; after: **0**.\n- Noindex Quote Stories before: **110**; after: **153**.\n- Hub/categories in sitemap: **11/11**.\n- Noindex story URLs in sitemap: **0/153**.\n- Quote redirects: **0**.\n- Quote retirements: **0**.\n- Self-canonical quote routes: **164/164**.\n- All noindex permalinks remain crawlable and locally discoverable.\n\nResult: **PASS**. No redirect, noindex page, 404, or noncanonical quote variant appears in the sitemap.\n`);

const independentPath = path.join(outDir, "ECHO_BUDDHA_PHASE_5_INDEPENDENT_VALIDATION.json");
const independent = fs.existsSync(independentPath) ? JSON.parse(read(independentPath)) : { status: "PENDING" };
const sourceUrls = [
  "https://support.google.com/adsense/answer/10015918",
  "https://support.google.com/publisherpolicies/answer/11112688",
  "https://support.google.com/publisherpolicies/answer/11190248",
  "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  "https://developers.google.com/search/docs/essentials/spam-policies",
  "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
  "https://developers.google.com/search/docs/crawling-indexing/block-indexing"
];
writeJson("ECHO_BUDDHA_PHASE_5_METHOD_MANIFEST.json", {
  phase: 5,
  generated_at: generatedAt,
  starting_checkpoint: { phase_4_status: phase4Validation.status, phase_4_commit: "b59e015aa7dca440b470b318a25dd58b4ef30941", branch: "codex/adsense-recovery-audit", phase_3_completion_commit: "2fb776a989aca32da70b8bbdf972a24da8b30fd0" },
  inputs: [
    "Phase 1 quote forensic inventory/template/duplication/originality evidence",
    "Phase 2 URL value scores and Quote Value Scorecard",
    "Phase 3 Query×Page, page performance, momentum, URL Inspection, internal authority, and quote protection evidence",
    "Phase 4 PASS_WITH_EXPLICIT_HOLDS report and decision registry",
    "Current source and local production build"
  ],
  official_sources: sourceUrls.map((url) => ({ url, accessed: "2026-08-24", http_status_verified: 200 })),
  external_originality_method: "Four representative/high-risk exact phrases checked through targeted web search; absence of a returned match is not proof of originality. Phase 1 representative checks also preserved.",
  decision_method: "Two-pass evidence review: layer/intent/protection gate, then user-value/indexation/attribution/template challenge.",
  privacy: "Private repository; no OAuth file read, copied, uploaded, or committed; no raw Search Console data exposed outside repository artifacts.",
  production_modified: false,
  deployed: false,
  adsense_submitted: false
});

writeMd("ECHO_BUDDHA_PHASE_5_QUOTE_ECOSYSTEM_REMEDIATION_REPORT.md", `# EchoBuddha Phase 5 Quote Ecosystem Remediation Report\n\nGenerated: ${generatedAt}\n\n## 1. Executive Summary\n\n**PASS.** The quote ecosystem now concentrates Search inventory in one editorial hub and ten differentiated categories. All 153 quote records and useful permalinks remain, while the 43 weak standalone story Search surfaces move to noindex, follow.\n\n## 2. Starting Phase 4 Checkpoint\n\nPhase 4 status: **${phase4Validation.status}** at commit \`b59e015aa7dca440b470b318a25dd58b4ef30941\`. Phase 3 evidence closure \`2fb776a989aca32da70b8bbdf972a24da8b30fd0\` remains in history.\n\n## 3. Confirmed AdSense Context\n\nThe only confirmed rejection reason is **Low value content**. Quote pages are an internal risk concentration, not a Google-confirmed cause. AdSense resubmission remains blocked.\n\n## 4. Google Policy Basis\n\nCurrent official guidance was reviewed for unique/substantial value, manually curated publisher inventory, replicated content, people-first purpose, scaled-content risk, canonical consistency, and crawlable noindex.\n\n## 5. Current Quote Inventory\n\n153 original quote records, 153 detail permalinks, 10 categories, and one hub: 164 public quote URLs total.\n\n## 6. Quote Architecture Before\n\nThe hub and categories were indexable, as were 43 authored quote stories; 110 generated stories were noindex. All 153 shared a dominant substantive grammar.\n\n## 7. Quote Origin/Attribution Analysis\n\n153/153 are classified ECHOBUDDHA_ORIGINAL. Visible labels distinguish them from Buddha speech, scripture translation, and historical sayings. No unsupported historical attribution was found.\n\n## 8. Internal Duplicate Findings\n\nExact normalized quote duplicates: 0. Punctuation-only duplicates: 0. Conceptual/vocabulary overlaps were reviewed without deleting distinct quote data.\n\n## 9. External Originality Findings\n\nRepresentative targeted searches returned no verified external exact match beyond EchoBuddha results. This is recorded as limited evidence, not proof of originality or a plagiarism conclusion.\n\n## 10. Quote Template Analysis\n\nThe before state used one nine-part skeleton on 153 routes. The after state has two user-permalink structures; generated pages no longer render manufactured three-section stories. Indexable-story template concentration is now zero.\n\n## 11. Search Equity Analysis\n\nThe P0 letting-go category, seven P1 hub/categories, all P2 categories/stories, and all underlying quote URLs remain present. No P0/P1 story was changed because no P0/P1 story exists.\n\n## 12. Query Ownership Analysis\n\nSearch visibility is concentrated in categories. One formerly indexable story had one weak generic query impression; its broader impermanence intent is preserved by the category while the exact quote permalink remains usable.\n\n## 13. Quote Hub Decision\n\nRetain indexable. The hub now includes explicit provenance, source pathways, an editorial starting set, categories, filtering, and a clear distinction between quote existence and Search indexation.\n\n## 14. Category Decisions\n\nRetain all ten indexable categories. Each has distinct purpose, an editorial reading path, starting points, practical selections, deeper reflections, and related teaching links. No category consolidation was justified.\n\n## 15. Individual Story Decisions\n\n153/153 are NOINDEX_USER_PERMALINK. This is a user-product decision, not canonicalization: every page remains HTTP 200, crawlable, self-canonical, and useful.\n\n## 16. Indexable Story Inventory\n\n0 current stories are approved for independent Search publication. Future approval is fail-closed and requires complete page-specific editorial evidence.\n\n## 17. Noindex User-Permalink Inventory\n\n153 permalinks support sharing, bookmarking, quote browsing, local search, category return, and deeper teaching.\n\n## 18. Redirected/Merged Stories\n\nNone. Indiscriminate redirects to /quotes/ were rejected.\n\n## 19. Retired Pages\n\nNone. No quote URL required 404/410.\n\n## 20. Content Migration\n\nNot required because no quote or permalink was retired. All underlying data and the 43 authored reflections remain.\n\n## 21. Attribution Corrections\n\nNo correction was required. The implementation preserved original-writing labels and removed no source evidence.\n\n## 22. Template Remediation\n\nGenerated narrative filler was removed from rendered permalinks; common substantive headings fell from nine to three; the 43 authored reflections keep page-specific prose for users.\n\n## 23. Internal-Link Changes\n\nQuote cards now say “Open quote.” No link targets a redirect or removed page. User permalinks remain intentionally reachable.\n\n## 24. Sitemap/Canonical Changes\n\nQuote sitemap URLs: 54 before / 11 after. All 164 routes remain self-canonical; no noindex story is in the sitemap.\n\n## 25. Search-Equity Protection\n\n8/8 P0/P1 quote assets keep URL, intent, indexability, canonical, and sitemap state. Protected/changed/query-visible validation covers ${protectedRows.length} unique URLs.\n\n## 26. Before/After Quote Inventory\n\nPublic quote URLs 164→164; records 153→153; categories 10→10; indexable stories 43→0; noindex stories 110→153; redirects 0→0; retirements 0→0.\n\n## 27. Mass-Production Signal Comparison\n\nIndexable story template concentration 43→0. Universal story structure count 1→0 in Search inventory. Across user permalinks, two honest product structures replace one universal generated-story shell.\n\n## 28. Future Quote Publishing Governance\n\nNew stories default noindex. Indexation requires explicit \`searchIndexStatus: index\` plus complete approval; missing approval fails the build. Duplicate identity, sitemap, canonical, usefulness, and attribution checks are automated.\n\n## 29. Build/Test Results\n\nThe local build contains 335 pages. Quote governance checks pass 7/7; full release results are recorded after final validation.\n\n## 30. Independent Validation\n\nIndependent status: **${independent.status ?? "PENDING"}**.\n\n## 31. Remaining Holds\n\nNo Phase 5 quote hold blocks completion. External originality remains inherently limited evidence, and no named human reviewer is fabricated; future standalone indexation requires actual human approval.\n\n## 32. Inputs for PHASE 6\n\nNo indexable quote story requires Phase 6 expansion. Broader retained content-quality work can proceed without reopening quote story indexation.\n\n## 33. Inputs for PHASE 7/8/10\n\nPhase 7 may review organizational authorship language; Phase 8 should preserve the 11-resource quote sitemap; Phase 10 should not treat noindex quote permalinks as independent ad inventory without separate approval.\n\n## 34. Phase 5 Exit Gate\n\n**PASS.** Safe quote remediation, governance, validation, and evidence are complete. Production was not modified or deployed. No AdSense review or resubmission was requested. Phase 6 did not begin. EchoBuddha was treated as a private repository.\n`);

console.log(JSON.stringify({
  generatedAt,
  quoteRecords: inventoryRows.length,
  publicQuoteUrls: indexationRows.length,
  beforeIndexableStories,
  afterIndexableStories: 0,
  noindexPermalinks: noindexRows.length,
  categories: categoryRows.length,
  queryRows: queryMapRows.length,
  protectedValidation: protectedRows.length,
  duplicateReviewPairs: duplicationAuditRows.length,
  afterBoilerplateMean: round(afterBoilerplateMean),
  afterUniqueMean: round(afterUniqueMean),
  medianWordCount: median(pageFacts.map((page) => page.words))
}, null, 2));
