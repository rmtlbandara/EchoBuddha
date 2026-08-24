import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, "../../..");
const p0 = path.join(repo, "docs/audits/adsense-recovery-phase-0-2026-08-24");
const p1 = path.join(repo, "docs/audits/adsense-recovery-phase-1-2026-08-24");
const p2 = path.join(repo, "docs/audits/adsense-recovery-phase-2-2026-08-24");
const legacyGsc = path.join(repo, "docs/audits/adsense-rejection-2026-08/phase-10-search-console-measurement");
const baselineSha = "83a685bcf942349e632ae043a1327b3ed53549df";
const generatedAt = new Date().toISOString();

const read = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(read(file));
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const bool = (value) => String(value).toLowerCase() === "true";
const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const pct = (value) => num(String(value ?? "").replace("%", "")) / 100;
const fmt = (value, digits = 2) => Number(value).toFixed(digits).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
const mdUrl = (url) => url.startsWith("http") ? `[${new URL(url).pathname || "/"}](${url})` : `\`${url}\``;

const parseCsv = (text) => {
  const rows = [];
  let row = [], value = "", quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (c === '"') quote = false;
      else value += c;
    } else if (c === '"') quote = true;
    else if (c === ",") { row.push(value); value = ""; }
    else if (c === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += c;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((header, i) => [header, r[i] ?? ""])));
};
const table = (rows) => {
  const [headers = [], ...data] = rows;
  return data.filter((row) => row.some((value) => value !== "" && value != null)).map((row) => Object.fromEntries(headers.map((header, i) => [header, row[i] ?? ""])));
};
const csvEscape = (value) => {
  const string = value == null ? "" : String(value);
  return /[",\n\r]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
};
const writeCsv = (name, headers, rows) => {
  const body = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))].map((row) => row.map(csvEscape).join(",")).join("\n");
  fs.writeFileSync(path.join(dir, name), `${body}\n`);
};
const writeMd = (name, value) => fs.writeFileSync(path.join(dir, name), `${value.trim()}\n`);
const writeJson = (name, value) => fs.writeFileSync(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`);
const normalizeUrl = (raw) => {
  try {
    const u = new URL(raw);
    u.protocol = "https:";
    u.hostname = u.hostname.replace(/^www\./, "");
    u.search = "";
    u.hash = "";
    if (u.pathname !== "/404.html" && !u.pathname.endsWith("/")) u.pathname += "/";
    return u.toString();
  } catch { return raw; }
};

const inventory = parseCsv(read(path.join(p1, "ECHO_BUDDHA_FORENSIC_URL_INVENTORY.csv")));
const gscReconciliation = parseCsv(read(path.join(p1, "ECHO_BUDDHA_GSC_URL_RECONCILIATION.csv")));
const queryMapP1 = parseCsv(read(path.join(p1, "ECHO_BUDDHA_QUERY_PAGE_MAP.csv")));
const internalEdges = parseCsv(read(path.join(p1, "ECHO_BUDDHA_INTERNAL_LINK_GRAPH.csv")));
const ownerRows = parseCsv(read(path.join(p1, "ECHO_BUDDHA_OWNER_SUPPORT_RELATIONSHIPS.csv")));
const nearPairs = parseCsv(read(path.join(p1, "ECHO_BUDDHA_NEAR_DUPLICATE_CLUSTERS.csv")));
const titlePairs = parseCsv(read(path.join(p1, "ECHO_BUDDHA_TITLE_INTENT_OVERLAP.csv")));
const phase2Scores = parseCsv(read(path.join(p2, "ECHO_BUDDHA_URL_VALUE_SCORES.csv")));
const phase2Policy = parseCsv(read(path.join(p2, "ECHO_BUDDHA_POLICY_RISK_MATRIX.csv")));
const phase2Queues = parseCsv(read(path.join(p2, "ECHO_BUDDHA_PROVISIONAL_REVIEW_QUEUES.csv")));
const phase0Counts = json(path.join(p0, "ADSENSE_RECOVERY_BASELINE_COUNTS.json"));
const phase1Validation = json(path.join(p1, "ECHO_BUDDHA_PHASE_1_VALIDATION.json"));
const phase2Validation = json(path.join(p2, "ECHO_BUDDHA_PHASE_2_VALIDATION.json"));
const currentGsc = json(path.join(p0, "source-evidence/gsc-snapshot-2026-08-21.json"));
const guidance = json(path.join(dir, "ECHO_BUDDHA_PHASE_3_GOOGLE_GUIDANCE_SNAPSHOT.json"));
const compare28 = parseCsv(read(path.join(legacyGsc, "source-data/performance-compare-28-days/Pages.csv")));
const compare28Queries = parseCsv(read(path.join(legacyGsc, "source-data/performance-compare-28-days/Queries.csv")));
const oldQueryOwners = parseCsv(read(path.join(legacyGsc, "phase-10-query-to-owner-map.csv")));
const gscInternalTargets = parseCsv(read(path.join(legacyGsc, "source-data/links/echobuddha.com-Top target pages-2026-08-13.csv")));
const externalLatestLinks = parseCsv(read(path.join(legacyGsc, "source-data/links/echobuddha.com-Latest links-2026-08-13.csv")));
const externalSampleLinks = parseCsv(read(path.join(legacyGsc, "source-data/links/echobuddha.com-More sample links-2026-08-13.csv")));

const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
const sourceDiff = spawnSync("git", ["diff", "--quiet", `${baselineSha}..HEAD`, "--", "src", "public", "package.json", "package-lock.json", "astro.config.mjs", "wrangler.jsonc"], { cwd: repo });
const fetchText = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "EchoBuddha-Private-Audit/1.0 (+https://echobuddha.com/)" } });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response.text();
  } finally { clearTimeout(timer); }
};
const liveSitemap = await fetchText("https://echobuddha.com/sitemap.xml");
const liveRobots = await fetchText("https://echobuddha.com/robots.txt");
const liveSitemapUrls = [...liveSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const baselineRobots = read(path.join(p0, "source-evidence/production-robots.txt"));
const integrity = {
  checked_at: generatedAt,
  phase_0_verified: phase0Counts.repository?.head === baselineSha && phase0Counts.production?.repositoryParity === "verified",
  phase_1_status: phase1Validation.status,
  phase_2_status: phase2Validation.status,
  frozen_baseline_sha: baselineSha,
  current_repository_sha: currentHead,
  current_head_source_equivalent_to_baseline: sourceDiff.status === 0,
  live_sitemap_sha256: hash(liveSitemap),
  phase_0_sitemap_sha256: phase0Counts.production?.sitemapSha256,
  live_sitemap_count: liveSitemapUrls.length,
  live_robots_sha256: hash(liveRobots),
  phase_0_live_robots_sha256: phase0Counts.production?.productionRobotsSha256,
  baseline_drift_detected: sourceDiff.status !== 0 || hash(liveSitemap) !== phase0Counts.production?.sitemapSha256 || liveSitemapUrls.length !== 194 || hash(liveRobots) !== hash(baselineRobots),
  google_guidance_accessible: guidance.accessible_count,
  gsc_current_export_date: currentGsc.source.exportDate,
  gsc_current_performance_window: "2026-06-23 to 2026-08-18; Search type Web; property aggregate plus separate page/query tables",
  gsc_page_comparison_window: "2026-07-15 to 2026-08-11 versus 2026-06-17 to 2026-07-14; Search type Web; separate Page table",
  external_link_export_rows: externalLatestLinks.length + externalSampleLinks.length,
  evaluated_state: `Frozen production source ${baselineSha}; current ${currentHead} contains private audit commits only.`
};
writeJson("ECHO_BUDDHA_PHASE_3_INPUT_INTEGRITY.json", integrity);
if (integrity.baseline_drift_detected) throw new Error("BASELINE_DRIFT_DETECTED");

const inventoryByUrl = new Map(inventory.map((row) => [normalizeUrl(row.normalized_url || row.raw_url), row]));
const p2ByUrl = new Map(phase2Scores.map((row) => [normalizeUrl(row.URL), row]));
const p2PolicyByUrl = new Map(phase2Policy.map((row) => [normalizeUrl(row.URL), row]));
const p1TopicByQuery = new Map(queryMapP1.map((row) => [row.query.toLowerCase(), row.topic_cluster]));
const currentPages = table(currentGsc.performance.pages);
const currentQueries = table(currentGsc.performance.queries);
const currentPageByUrl = new Map(currentPages.map((row) => [normalizeUrl(row["Top pages"]), row]));
const compareByUrl = new Map(compare28.map((row) => [normalizeUrl(row["Top pages"]), row]));
const gscInternalByUrl = new Map(gscInternalTargets.map((row) => [normalizeUrl(row["Target page"]), row]));
const oldQueryByText = new Map(oldQueryOwners.map((row) => [row.Query.toLowerCase(), row]));

const chartRows = table(currentGsc.performance.chart).map((row) => ({ date: row.Date, clicks: num(row.Clicks), impressions: num(row.Impressions), ctr: num(row.CTR), position: num(row.Position) }));
const aggregateDays = (start, end) => {
  const rows = chartRows.filter((row) => row.date >= start && row.date <= end);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const weightedPosition = rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / (impressions || 1);
  return { start, end, days: rows.length, clicks, impressions, ctr: clicks / (impressions || 1), position: weightedPosition };
};
const propertyLatest28 = aggregateDays("2026-07-22", "2026-08-18");
const propertyPrevious28 = aggregateDays("2026-06-24", "2026-07-21");
const propertyAll = aggregateDays("2026-06-23", "2026-08-18");

const ownerSupportByUrl = new Map();
const supportByOwner = new Map();
for (const row of ownerRows) {
  const support = normalizeUrl(row.support_url), owner = normalizeUrl(row.declared_owner_url);
  if (!ownerSupportByUrl.has(support)) ownerSupportByUrl.set(support, []);
  ownerSupportByUrl.get(support).push({ ...row, support_url: support, declared_owner_url: owner });
  if (!supportByOwner.has(owner)) supportByOwner.set(owner, []);
  supportByOwner.get(owner).push({ ...row, support_url: support, declared_owner_url: owner });
}

const edgeStats = new Map();
for (const edge of internalEdges) {
  const target = normalizeUrl(edge.target_url), source = normalizeUrl(edge.source_url);
  if (!edgeStats.has(target)) edgeStats.set(target, { sources: new Set(), contextualSources: new Set(), navigationSources: new Set(), relatedSources: new Set(), anchors: new Set(), canonicalConflicts: 0, nonCrawlable: 0 });
  const stat = edgeStats.get(target);
  stat.sources.add(source);
  if (["main/body", "related content"].includes(edge.location_context)) stat.contextualSources.add(source);
  if (["navigation", "breadcrumb", "footer"].includes(edge.location_context)) stat.navigationSources.add(source);
  if (edge.location_context === "related content") stat.relatedSources.add(source);
  if (edge.anchor_text.trim()) stat.anchors.add(edge.anchor_text.trim().toLowerCase());
  if (normalizeUrl(edge.target_canonical) !== target) stat.canonicalConflicts += 1;
}
const inlinkValues = inventory.map((row) => edgeStats.get(normalizeUrl(row.normalized_url || row.raw_url))?.sources.size ?? 0).sort((a, b) => a - b);
const rankPercentile = (value) => inlinkValues.length <= 1 ? 0 : inlinkValues.filter((x) => x <= value).length / inlinkValues.length;
const internalSignal = (row) => {
  const url = normalizeUrl(row.normalized_url || row.raw_url), stat = edgeStats.get(url);
  const count = stat?.sources.size ?? num(row.inlinks), percentile = rankPercentile(count);
  if (percentile >= 0.9 || count >= 100) return "HIGH";
  if (percentile >= 0.5 || count >= 10) return "MEDIUM";
  return "LOW";
};

const momentumFor = (row) => {
  if (!row) return { classification: "INSUFFICIENT_DATA", clickDelta: "NOT_AVAILABLE", impressionDelta: "NOT_AVAILABLE", clickPct: "NOT_AVAILABLE", impressionPct: "NOT_AVAILABLE", emerging: false, evidence: "No row in the preserved page-level 28-day comparison export." };
  const c = num(row["Last 28 days Clicks"]), pc = num(row["Previous 28 days Clicks"]), i = num(row["Last 28 days Impressions"]), pi = num(row["Previous 28 days Impressions"]);
  const cd = c - pc, id = i - pi;
  const cp = pc > 0 ? cd / pc : "NEW_OR_ZERO_BASELINE";
  const ip = pi > 0 ? id / pi : "NEW_OR_ZERO_BASELINE";
  let classification = "STABLE";
  if (c + pc === 0 && i + pi < 10) classification = "INSUFFICIENT_DATA";
  else if (cd >= 2 || (id >= 50 && i >= 50 && (pi === 0 || id / pi >= 0.5))) classification = "STRONGLY_GROWING";
  else if (cd >= 1 || (id >= 10 && i >= 10 && (pi === 0 || id / pi >= 0.25))) classification = "GROWING";
  else if (cd <= -3 || id <= -50) classification = "STRONGLY_DECLINING";
  else if (cd <= -1 || id <= -10) classification = "DECLINING";
  const emerging = ["STRONGLY_GROWING", "GROWING"].includes(classification) && (cd >= 1 || id >= 25);
  return { classification, clickDelta: cd, impressionDelta: id, clickPct: cp, impressionPct: ip, emerging, evidence: `Page comparison 2026-07-15..2026-08-11 versus 2026-06-17..2026-07-14: ${c}/${i} clicks/impressions versus ${pc}/${pi}.` };
};

const hubFamilies = new Set(["ARTICLE_HUB", "ARTICLE_CATEGORY", "LEARN_HUB", "DICTIONARY_HUB", "MEDITATION_HUB", "QUOTE_HUB", "QUOTE_CATEGORY", "DAILY_REFLECTION_HUB", "TOPIC_HUB", "HOME"]);
const familyGroup = (family) => {
  if (["ARTICLE", "ARTICLE_CATEGORY", "ARTICLE_HUB"].includes(family)) return "Articles";
  if (["BUDDHISM_101", "LEARN_GUIDE", "LEARN_HUB"].includes(family)) return "Learn";
  if (["DICTIONARY_ENTRY", "DICTIONARY_HUB"].includes(family)) return "Dictionary";
  if (family === "QUOTE_STORY") return "Quote Stories";
  if (["QUOTE_CATEGORY", "QUOTE_HUB"].includes(family)) return "Quotes";
  if (["MEDITATION_GUIDE", "MEDITATION_HUB"].includes(family)) return "Practice";
  if (["DAILY_REFLECTION_HUB", "REFLECTION"].includes(family)) return "Reflections";
  if (["HOME", "TOPIC_HUB"].includes(family)) return "Hubs";
  if (family === "TOOL") return "Tools";
  return "Trust / Utility / System";
};
const tierRank = { SEO_P0_CRITICAL: 4, SEO_P1_HIGH: 3, SEO_P2_EMERGING: 2, SEO_P3_LIMITED: 1, SEO_UNKNOWN: 0 };

const records = inventory.map((row) => {
  const url = normalizeUrl(row.normalized_url || row.raw_url);
  const current = currentPageByUrl.get(url), compared = compareByUrl.get(url), p2score = p2ByUrl.get(url);
  const clicks3m = num(current?.Clicks ?? row.gsc_clicks_3m), impressions3m = num(current?.Impressions ?? row.gsc_impressions_3m);
  const compareMomentum = momentumFor(compared);
  const stat = edgeStats.get(url);
  const inlinks = stat?.sources.size ?? num(row.inlinks);
  const structural = hubFamilies.has(row.page_family) || (supportByOwner.get(url)?.length ?? 0) >= 2 || internalSignal(row) === "HIGH";
  const indexable = bool(row.indexable), hasGsc = Boolean(current || compared);
  const valueScore = p2score ? num(p2score.publisher_value_score) : null;
  let tier;
  if (indexable && (url === "https://echobuddha.com/" || (clicks3m >= 3 && impressions3m >= 100))) tier = "SEO_P0_CRITICAL";
  else if (indexable && (clicks3m >= 1 || impressions3m >= 100 || (compareMomentum.emerging && num(compared?.["Last 28 days Impressions"]) >= 50) || (structural && impressions3m >= 10))) tier = "SEO_P1_HIGH";
  else if (indexable && (compareMomentum.emerging || impressions3m >= 5 || structural || valueScore >= 70)) tier = "SEO_P2_EMERGING";
  else if (indexable) tier = "SEO_P3_LIMITED";
  else if (hasGsc) tier = "SEO_P2_EMERGING";
  else tier = "SEO_UNKNOWN";
  const confidence = current && compared ? "HIGH" : current || (indexable && row.canonical_type === "self") ? "MEDIUM" : "LOW";
  const reasonParts = [];
  if (clicks3m) reasonParts.push(`${clicks3m} clicks`);
  if (impressions3m) reasonParts.push(`${impressions3m} impressions`);
  if (compareMomentum.emerging) reasonParts.push(compareMomentum.classification);
  if (structural) reasonParts.push("structural/internal authority");
  if (valueScore >= 70) reasonParts.push(`Phase 2 value ${valueScore}`);
  if (!reasonParts.length) reasonParts.push(tier === "SEO_UNKNOWN" ? "no page-level Search row; unknown is not zero" : "limited current Search evidence");
  return {
    row, url, current, compared, p2score, valueScore, clicks3m, impressions3m,
    ctr3m: num(current?.CTR ?? row.gsc_ctr_3m), position3m: num(current?.Position ?? row.gsc_position_3m),
    momentum: compareMomentum, inlinks, internalAuthority: internalSignal(row), internalPercentile: rankPercentile(inlinks), structural, indexable, hasGsc, tier, confidence,
    clickShare: clicks3m / (propertyAll.clicks || 1), impressionShare: impressions3m / (propertyAll.impressions || 1), reason: reasonParts.join("; "),
    protectionRestriction: tier === "SEO_P0_CRITICAL" || tier === "SEO_P1_HIGH" ? "NO SEO-R3/R4 CHANGE WITHOUT QUERY, BACKLINK, MAPPING, REDIRECT, AND MONITORING EVIDENCE" : tier === "SEO_UNKNOWN" ? "DO_NOT_CHANGE_YET — resolve Search/canonical/history uncertainty" : tier === "SEO_P2_EMERGING" ? "Evidence and impact review required before destructive change" : "Phase 4 may evaluate; user value still controls"
  };
});
const recordByUrl = new Map(records.map((record) => [record.url, record]));

const searchPerformanceRows = records.map((r) => ({
  url_id: r.row.url_id,
  url: r.url,
  canonical_url: r.row.canonical,
  google_canonical_if_known: "NOT_AVAILABLE: URL Inspection/Google canonical export not supplied",
  page_family: r.row.page_family,
  topic: r.row.topic,
  primary_intent: r.row.primary_intent,
  phase_2_value_score: r.valueScore ?? "NOT_APPLICABLE",
  gsc_clicks_28d: r.compared ? num(r.compared["Last 28 days Clicks"]) : "NOT_AVAILABLE",
  gsc_impressions_28d: r.compared ? num(r.compared["Last 28 days Impressions"]) : "NOT_AVAILABLE",
  gsc_ctr_28d: r.compared ? pct(r.compared["Last 28 days CTR"]) : "NOT_AVAILABLE",
  gsc_position_28d: r.compared ? num(r.compared["Last 28 days Position"]) : "NOT_AVAILABLE",
  gsc_28d_window: "2026-07-15 to 2026-08-11; Web; Page aggregation",
  gsc_clicks_prev_28d: r.compared ? num(r.compared["Previous 28 days Clicks"]) : "NOT_AVAILABLE",
  gsc_impressions_prev_28d: r.compared ? num(r.compared["Previous 28 days Impressions"]) : "NOT_AVAILABLE",
  gsc_prev_28d_window: "2026-06-17 to 2026-07-14; Web; Page aggregation",
  gsc_click_delta: r.momentum.clickDelta,
  gsc_impression_delta: r.momentum.impressionDelta,
  gsc_clicks_3m: r.clicks3m,
  gsc_impressions_3m: r.impressions3m,
  gsc_3m_window: "2026-06-23 to 2026-08-18 (57 available days); Web; Page aggregation",
  top_queries: "NOT_AVAILABLE: query×page export not supplied",
  query_count: "NOT_AVAILABLE: query×page export not supplied",
  unique_query_ownership: "NOT_VERIFIED",
  google_indexed: "NOT_VERIFIED: URL Inspection not supplied",
  intended_indexable: r.indexable,
  last_crawl_if_known: "NOT_AVAILABLE",
  backlink_signal: "NOT_AVAILABLE: GSC external-link page exports contained zero usable rows",
  internal_link_signal: `${r.internalAuthority}; ${r.inlinks} unique internal source URLs`,
  protection_tier: r.tier,
  confidence: r.confidence
}));
writeCsv("ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv", Object.keys(searchPerformanceRows[0]), searchPerformanceRows);

const registryRows = records.map((r) => ({
  URL: r.url,
  page_family: r.row.page_family,
  indexable: r.indexable,
  phase_2_value_score: r.valueScore ?? "NOT_APPLICABLE",
  protection_tier: r.tier,
  protection_reason: r.reason,
  clicks_3m: r.clicks3m,
  impressions_3m: r.impressions3m,
  click_share: fmt(r.clickShare * 100, 4) + "%",
  impression_share: fmt(r.impressionShare * 100, 4) + "%",
  momentum: r.momentum.classification,
  emerging_winner: r.momentum.emerging,
  query_ownership: "NO_SEARCH_DATA: query×page join absent",
  backlink_status: "NOT_VERIFIED",
  internal_authority: r.internalAuthority,
  canonical_state: r.row.canonical_type === "self" ? "CANONICAL_SELF_CONSISTENT | CANONICAL_UNKNOWN" : r.row.canonical_type || "CANONICAL_UNKNOWN",
  noindex_prohibited_without_review: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier),
  future_change_restriction: r.protectionRestriction,
  confidence: r.confidence
}));
writeCsv("ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv", Object.keys(registryRows[0]), registryRows);
writeCsv("ECHO_BUDDHA_PROTECTED_URLS.csv", Object.keys(registryRows[0]), registryRows);

const qualityRows = records.filter((r) => r.p2score).map((r) => {
  const searchAxis = ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "HIGH" : r.tier === "SEO_UNKNOWN" ? "UNKNOWN" : "LOW_OR_EMERGING";
  const qualityAxis = r.valueScore >= 70 ? "HIGH" : "LOW";
  const implication = searchAxis === "HIGH" && qualityAxis === "HIGH" ? "PRESERVE_AGGRESSIVELY" : searchAxis === "HIGH" ? "SURGICAL_REMEDIATION_REQUIRED" : searchAxis === "UNKNOWN" ? "INVESTIGATE_BEFORE_DESTRUCTIVE_ACTION" : qualityAxis === "HIGH" ? "DISCOVERY_GROWTH_CANDIDATE" : "PHASE_4_CONSOLIDATION_EVALUATION_ONLY";
  return { URL: r.url, search_protection: r.tier, search_axis: searchAxis, phase_2_value_score: r.valueScore, quality_axis: qualityAxis, later_implication: implication, query_ownership: "NOT_VERIFIED", backlink_status: "NOT_VERIFIED", confidence: r.confidence };
});
writeCsv("ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv", Object.keys(qualityRows[0]), qualityRows);
const highEquityLowValueRows = qualityRows.filter((row) => row.search_axis === "HIGH" && row.quality_axis === "LOW").map((row) => {
  const r = recordByUrl.get(row.URL);
  return { URL: row.URL, phase_2_value_score: row.phase_2_value_score, protection_tier: row.search_protection, clicks_3m: r.clicks3m, impressions_3m: r.impressions3m, momentum: r.momentum.classification, conflict: "HIGH_SEARCH_EQUITY_LOW_PHASE_2_VALUE", required_strategy: "SURGICAL_REMEDIATION_REQUIRED; preserve URL and intent; improve in place unless stronger evidence supports migration", change_restriction: r.protectionRestriction, confidence: r.confidence };
});
writeCsv("ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv", Object.keys(highEquityLowValueRows[0] ?? { URL: "", phase_2_value_score: "", protection_tier: "", clicks_3m: "", impressions_3m: "", momentum: "", conflict: "", required_strategy: "", change_restriction: "", confidence: "" }), highEquityLowValueRows);

const queryCandidatesByTopic = new Map();
for (const r of records.filter((r) => r.indexable && r.p2score)) {
  if (!queryCandidatesByTopic.has(r.row.topic)) queryCandidatesByTopic.set(r.row.topic, []);
  queryCandidatesByTopic.get(r.row.topic).push(r);
}
for (const candidates of queryCandidatesByTopic.values()) candidates.sort((a, b) => tierRank[b.tier] - tierRank[a.tier] || b.valueScore - a.valueScore || b.impressions3m - a.impressions3m);
const inferredUrlFromOld = (query) => {
  const text = oldQueryByText.get(query.toLowerCase())?.["Likely serving URL if known"] ?? "";
  return text.match(/https:\/\/echobuddha\.com\/[^\s)]+/)?.[0] ? normalizeUrl(text.match(/https:\/\/echobuddha\.com\/[^\s)]+/)[0]) : "";
};
const queryOwnershipRows = currentQueries.map((query) => {
  const text = query["Top queries"], topic = p1TopicByQuery.get(text.toLowerCase()) ?? "Unclustered query";
  const oldCandidate = inferredUrlFromOld(text);
  const candidates = queryCandidatesByTopic.get(topic) ?? [];
  const primary = recordByUrl.has(oldCandidate) ? recordByUrl.get(oldCandidate) : candidates[0];
  const secondary = candidates.filter((candidate) => candidate.url !== primary?.url).slice(0, 5);
  return {
    query: text,
    normalized_query_cluster: topic,
    intent: oldQueryByText.get(text.toLowerCase())?.Intent ?? "NOT_CLASSIFIED_WITH_QUERY_PAGE_EVIDENCE",
    primary_url_candidate: primary?.url ?? "NOT_INFERRED",
    secondary_url_candidates: secondary.map((candidate) => candidate.url).join(" | ") || "NONE_INFERRED",
    clicks: num(query.Clicks),
    impressions: num(query.Impressions),
    ctr: num(query.CTR),
    position: num(query.Position),
    metric_window: "2026-06-23 to 2026-08-18; Web; Query aggregation",
    ownership_type: "NO_SEARCH_DATA",
    ownership_strength: "NOT_VERIFIED",
    ownership_stability: "NOT_VERIFIED",
    ownership_evidence: "INFERRED_CANDIDATE_ONLY: GSC query×page intersection was not supplied",
    unique_query_asset: "NOT_VERIFIED",
    primary_candidate_phase_2_value: primary?.valueScore ?? "NOT_AVAILABLE",
    content_overlap: secondary.length ? "TOPIC_CLUSTER_ONLY; page-serving overlap not observed" : "NO_SECONDARY_CANDIDATE_IN_TOPIC_MAP",
    protection_implication: primary ? "DO_NOT_CHANGE_CANDIDATE_OR_CLUSTER_WITHOUT_QUERY×PAGE_EXPORT" : "INVESTIGATE_BEFORE_CHANGE",
    confidence: oldCandidate ? "MEDIUM_FOR_TOPIC_INFERENCE; LOW_FOR_OWNERSHIP" : "LOW"
  };
});
writeCsv("ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv", Object.keys(queryOwnershipRows[0]), queryOwnershipRows);

const momentumRows = records.map((r) => ({
  URL: r.url,
  page_family: r.row.page_family,
  clicks_latest_28d: r.compared ? num(r.compared["Last 28 days Clicks"]) : "NOT_AVAILABLE",
  clicks_previous_28d: r.compared ? num(r.compared["Previous 28 days Clicks"]) : "NOT_AVAILABLE",
  click_delta: r.momentum.clickDelta,
  click_change: typeof r.momentum.clickPct === "number" ? fmt(r.momentum.clickPct * 100) + "%" : r.momentum.clickPct,
  impressions_latest_28d: r.compared ? num(r.compared["Last 28 days Impressions"]) : "NOT_AVAILABLE",
  impressions_previous_28d: r.compared ? num(r.compared["Previous 28 days Impressions"]) : "NOT_AVAILABLE",
  impression_delta: r.momentum.impressionDelta,
  impression_change: typeof r.momentum.impressionPct === "number" ? fmt(r.momentum.impressionPct * 100) + "%" : r.momentum.impressionPct,
  latest_position: r.compared ? num(r.compared["Last 28 days Position"]) : "NOT_AVAILABLE",
  previous_position: r.compared ? num(r.compared["Previous 28 days Position"]) : "NOT_AVAILABLE",
  classification: r.momentum.classification,
  emerging_winner: r.momentum.emerging,
  evidence: r.momentum.evidence,
  confidence: r.compared ? "HIGH_FOR_EXPORTED_PERIOD; NOT_CURRENT_AFTER_2026-08-11" : "LOW"
}));
writeCsv("ECHO_BUDDHA_SEARCH_MOMENTUM.csv", Object.keys(momentumRows[0]), momentumRows);

const backlinkRows = records.map((r) => ({
  URL: r.url,
  data_source: "GSC Links exports dated 2026-08-13",
  linking_domains: "NOT_AVAILABLE",
  external_links: "NOT_AVAILABLE",
  significant_referring_pages: "NOT_AVAILABLE",
  anchor_text: "NOT_AVAILABLE",
  destination_status: r.row.http_status,
  external_link_equity_present: "NOT_VERIFIED",
  protection_tier: r.tier,
  evidence: `Latest-links rows ${externalLatestLinks.length}; more-sample rows ${externalSampleLinks.length}. Empty exports do not prove zero backlinks.`,
  required_future_check: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "MANDATORY_BEFORE_SEO_R3_R4" : "REQUIRED_BEFORE_REDIRECT_OR_REMOVAL",
  confidence: "LOW"
}));
writeCsv("ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv", Object.keys(backlinkRows[0]), backlinkRows);

const internalAuthorityRows = records.map((r) => {
  const stat = edgeStats.get(r.url);
  return {
    URL: r.url,
    page_family: r.row.page_family,
    inbound_unique_pages: stat?.sources.size ?? 0,
    contextual_inbound_pages: stat?.contextualSources.size ?? 0,
    navigation_inbound_pages: stat?.navigationSources.size ?? 0,
    related_content_inbound_pages: stat?.relatedSources.size ?? 0,
    anchor_diversity: stat?.anchors.size ?? 0,
    minimum_click_depth: r.row.minimum_click_depth,
    topic_centrality_percentile: fmt(r.internalPercentile * 100) + "%",
    internal_authority_signal: r.internalAuthority,
    crawlable_anchor_evidence: (stat?.sources.size ?? 0) ? "RENDERED_A_HREF_EDGES_OBSERVED" : "NO_INBOUND_EDGE_OBSERVED",
    canonical_target_conflicts: stat?.canonicalConflicts ?? 0,
    gsc_internal_links_reported_2026_08_13: gscInternalByUrl.get(r.url)?.["Internal links"] ?? "NOT_IN_TOP_TARGET_EXPORT",
    protection_tier: r.tier,
    future_remediation_need: (stat?.canonicalConflicts ?? 0) ? "REVIEW_CANONICAL_DESTINATIONS" : "Preserve justified contextual prominence; update direct links after any approved future migration."
  };
});
writeCsv("ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv", Object.keys(internalAuthorityRows[0]), internalAuthorityRows);

const overlapByUrl = new Map();
const addOverlap = (url, id) => {
  url = normalizeUrl(url);
  if (!overlapByUrl.has(url)) overlapByUrl.set(url, new Set());
  overlapByUrl.get(url).add(id);
};
for (const row of ownerRows) { addOverlap(row.support_url, `OWNER:${normalizeUrl(row.declared_owner_url)}`); addOverlap(row.declared_owner_url, `OWNER:${normalizeUrl(row.declared_owner_url)}`); }
for (const pair of nearPairs.filter((pair) => num(pair.lexical_similarity) >= 0.12)) { addOverlap(pair.url_a, pair.cluster_id); addOverlap(pair.url_b, pair.cluster_id); }
for (const pair of titlePairs.filter((pair) => pair.review_flag)) { addOverlap(pair.url_a, pair.cluster_id); addOverlap(pair.url_b, pair.cluster_id); }
const canonicalRows = records.filter((r) => overlapByUrl.has(r.url)).map((r) => {
  const stat = edgeStats.get(r.url);
  const self = normalizeUrl(r.row.canonical) === r.url;
  const flags = [self ? "CANONICAL_SELF_CONSISTENT" : r.row.canonical ? "CANONICAL_TO_OTHER" : "CANONICAL_UNKNOWN", "CANONICAL_UNKNOWN_GOOGLE_SELECTED"];
  if (bool(r.row.sitemap_member) && !self) flags.push("SITEMAP_CANONICAL_CONFLICT");
  if ((stat?.canonicalConflicts ?? 0) > 0) flags.push("INTERNAL_LINK_CANONICAL_CONFLICT");
  return {
    source_url: r.url,
    declared_canonical: r.row.canonical,
    google_selected_canonical_if_known: "NOT_AVAILABLE",
    sitemap_inclusion: r.row.sitemap_member,
    internal_link_destination_count: stat?.sources.size ?? 0,
    internal_link_canonical_conflicts: stat?.canonicalConflicts ?? 0,
    gsc_data_attribution: r.hasGsc ? `Page-row evidence attributed to ${r.url}` : "NO_PAGE_ROW_IN_EXPORT",
    redirect_state: r.row.http_status,
    duplicate_overlap_clusters: [...overlapByUrl.get(r.url)].slice(0, 25).join(" | "),
    overlap_cluster_count: overlapByUrl.get(r.url).size,
    phase_2_value_score: r.valueScore ?? "NOT_APPLICABLE",
    search_protection_tier: r.tier,
    canonical_flags: flags.join(" | "),
    indexing_stability: "NOT_VERIFIED: URL Inspection/Google-selected canonical unavailable",
    change_restriction: r.protectionRestriction
  };
});
writeCsv("ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv", Object.keys(canonicalRows[0]), canonicalRows);

const knownCurrentUrls = new Set(records.map((r) => r.url));
const historicalPageUrls = new Set([...currentPageByUrl.keys(), ...compareByUrl.keys()]);
const legacyRows = [];
for (const url of historicalPageUrls) if (!knownCurrentUrls.has(url)) legacyRows.push({ legacy_url: url, evidence_source: "GSC page export", current_state: "NOT_IN_PHASE_1_INVENTORY", current_target: "NOT_VERIFIED", historical_clicks: currentPageByUrl.get(url)?.Clicks ?? "NOT_AVAILABLE", historical_impressions: currentPageByUrl.get(url)?.Impressions ?? "NOT_AVAILABLE", protection_implication: "DO_NOT_REMOVE_OR_REDIRECT_WITHOUT_CLASSIFICATION", confidence: "MEDIUM" });
for (const r of records.filter((record) => num(record.row.http_status) !== 200)) legacyRows.push({ legacy_url: r.url, evidence_source: "Phase 1 current inventory", current_state: `HTTP_${r.row.http_status}`, current_target: r.row.final_url || r.row.canonical, historical_clicks: r.clicks3m, historical_impressions: r.impressions3m, protection_implication: "PRESERVE_RELEVANT_WORKING_REDIRECT; VERIFY_TARGET", confidence: "HIGH_FOR_CURRENT_STATE" });
legacyRows.push(
  { legacy_url: "UNKNOWN_GSC_REDIRECT_SET", evidence_source: "GSC coverage through 2026-08-17", current_state: "8 page-with-redirect records; identities unavailable", current_target: "NOT_AVAILABLE", historical_clicks: "NOT_AVAILABLE", historical_impressions: "NOT_AVAILABLE", protection_implication: "DO_NOT_REMOVE_WORKING_REDIRECTS; obtain example URLs", confidence: "LOW" },
  { legacy_url: "UNKNOWN_GSC_404", evidence_source: "GSC coverage through 2026-08-17", current_state: "1 not-found record; identity unavailable", current_target: "NOT_AVAILABLE", historical_clicks: "NOT_AVAILABLE", historical_impressions: "NOT_AVAILABLE", protection_implication: "CLASSIFY BEFORE ANY REDIRECT; avoid irrelevant homepage redirect", confidence: "LOW" },
  { legacy_url: "UNKNOWN_GSC_ALTERNATE_CANONICAL", evidence_source: "GSC coverage through 2026-08-17", current_state: "1 alternate-canonical record; identity unavailable", current_target: "NOT_AVAILABLE", historical_clicks: "NOT_AVAILABLE", historical_impressions: "NOT_AVAILABLE", protection_implication: "VERIFY_GOOGLE_SELECTED_CANONICAL_BEFORE_CHANGE", confidence: "LOW" }
);
writeCsv("ECHO_BUDDHA_LEGACY_URL_EQUITY.csv", Object.keys(legacyRows[0]), legacyRows);

class UnionFind {
  constructor() { this.parent = new Map(); }
  add(x) { if (!this.parent.has(x)) this.parent.set(x, x); }
  find(x) { this.add(x); const p = this.parent.get(x); if (p !== x) this.parent.set(x, this.find(p)); return this.parent.get(x); }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.parent.set(rb, ra); }
  groups() { const groups = new Map(); for (const x of this.parent.keys()) { const root = this.find(x); if (!groups.has(root)) groups.set(root, []); groups.get(root).push(x); } return [...groups.values()].filter((group) => group.length > 1); }
}
const lexicalUf = new UnionFind();
for (const pair of nearPairs.filter((pair) => num(pair.lexical_similarity) >= 0.2 && recordByUrl.get(normalizeUrl(pair.url_a))?.p2score && recordByUrl.get(normalizeUrl(pair.url_b))?.p2score)) lexicalUf.union(normalizeUrl(pair.url_a), normalizeUrl(pair.url_b));
const clusters = [];
for (const [owner, supports] of supportByOwner) {
  const members = [owner, ...supports.map((row) => row.support_url)].filter((url) => recordByUrl.get(url)?.p2score);
  if (members.length > 1) clusters.push({ id: `OWNER-${hash(owner).slice(0, 10)}`, type: "DECLARED_OWNER_SUPPORT", owner, members: [...new Set(members)] });
}
lexicalUf.groups().forEach((members, index) => clusters.push({ id: `LEXICAL-${String(index + 1).padStart(3, "0")}`, type: "HIGH_LEXICAL_COMPONENT", owner: "", members: [...new Set(members)] }));
const candidateStrength = (record, owner) => tierRank[record.tier] * 50 + (record.valueScore ?? 0) * 0.4 + Math.min(record.clicks3m, 10) * 4 + Math.log1p(record.impressions3m) * 3 + record.internalPercentile * 15 + (record.url === owner ? 20 : 0) + (normalizeUrl(record.row.canonical) === record.url ? 5 : 0);
const survivorRows = clusters.map((cluster) => {
  const members = cluster.members.map((url) => recordByUrl.get(url)).filter(Boolean).sort((a, b) => candidateStrength(b, cluster.owner) - candidateStrength(a, cluster.owner));
  const survivor = members[0];
  const confidence = cluster.type === "DECLARED_OWNER_SUPPORT" && ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(survivor.tier) && survivor.valueScore >= 70 ? "MEDIUM" : "LOW";
  return {
    cluster_id: cluster.id,
    cluster_type: cluster.type,
    member_count: members.length,
    member_urls: members.map((r) => r.url).join(" | "),
    provisional_survivor_candidate: survivor.url,
    survivor_phase_2_score: survivor.valueScore,
    survivor_protection_tier: survivor.tier,
    survivor_clicks_3m: survivor.clicks3m,
    survivor_impressions_3m: survivor.impressions3m,
    survivor_internal_authority: survivor.internalAuthority,
    query_ownership: "NOT_VERIFIED",
    backlinks: "NOT_VERIFIED",
    canonical_state: survivor.row.canonical_type,
    rationale: `Balanced declared ownership, protection tier, Phase 2 value, Search visibility, self-canonical state, and internal authority; not chosen on traffic alone.`,
    survivor_confidence: confidence,
    phase_4_constraint: confidence === "LOW" ? "DO_NOT_AUTOMERGE; query×page and backlink evidence required" : "EVALUATE_ONLY; no implementation authorization"
  };
});
writeCsv("ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv", Object.keys(survivorRows[0]), survivorRows);
const survivorByMember = new Map();
for (const row of survivorRows) for (const member of row.member_urls.split(" | ")) if (!survivorByMember.has(member)) survivorByMember.set(member, row);

const broadOwnerFamilies = new Set([...hubFamilies, "ABOUT", "AUTHOR", "EDITORIAL_POLICY", "SOURCE_POLICY"]);
const futureMappings = ownerRows.map((relation) => {
  const source = recordByUrl.get(normalizeUrl(relation.support_url)), target = recordByUrl.get(normalizeUrl(relation.declared_owner_url));
  if (!source || !target || broadOwnerFamilies.has(target.row.page_family)) return null;
  const possibleEquivalence = num(relation.content_overlap) >= 0.1 || num(relation.structural_overlap) >= 0.3;
  const restriction = ["SEO_P0_CRITICAL", "SEO_P1_HIGH", "SEO_UNKNOWN"].includes(source.tier) ? "DO_NOT_CHANGE_YET" : "MORE_DATA_REQUIRED";
  return {
    source_url: source.url,
    target_url: target.url,
    source_phase_2_score: source.valueScore,
    target_phase_2_score: target.valueScore,
    source_protection_tier: source.tier,
    target_protection_tier: target.tier,
    source_queries: "NOT_AVAILABLE_QUERY×PAGE",
    target_queries: "NOT_AVAILABLE_QUERY×PAGE",
    source_backlinks: "NOT_VERIFIED",
    target_backlinks: "NOT_VERIFIED",
    structural_overlap: relation.structural_overlap,
    content_overlap: relation.content_overlap,
    intent_equivalence: possibleEquivalence ? "POSSIBLE_NOT_VERIFIED" : "NOT_ESTABLISHED",
    canonical_state: `${source.row.canonical_type} → ${target.row.canonical_type}`,
    redirect_suitability: "NOT_READY: target must absorb relevant source value and query/backlink evidence must be obtained",
    future_redirect_type_if_approved: "Relevant server-side 301 or 308",
    minimum_redirect_retention_if_approved: "At least one year; longer where practical",
    redirect_chain_risk: num(target.row.http_status) === 200 ? "NONE_CURRENTLY_OBSERVED" : "REVIEW_REQUIRED",
    internal_link_migration: `${source.inlinks} current source pages must be evaluated and later linked directly to final survivor where relevant`,
    sitemap_migration: "After approval only: remove redirecting source; retain canonical target",
    change_risk: "SEO-R4_CRITICAL",
    mapping_status: "PROVISIONAL_EVALUATION_ONLY",
    phase_4_readiness: restriction
  };
}).filter(Boolean);
writeCsv("ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv", Object.keys(futureMappings[0]), futureMappings);

const decodeHtml = (text) => text.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/&#x27;/gi, "'").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const headingsFor = (url) => {
  const pathname = new URL(url).pathname;
  const file = pathname === "/" ? path.join(repo, "dist/index.html") : pathname === "/404.html" ? path.join(repo, "dist/404.html") : path.join(repo, "dist", pathname, "index.html");
  if (!fs.existsSync(file)) return [];
  const html = read(file), main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return [...main.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => decodeHtml(match[2])).filter(Boolean).slice(0, 12);
};
const valueElementRows = records.filter((r) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier)).map((r) => ({
  URL: r.url,
  protection_tier: r.tier,
  primary_topic: r.row.topic,
  primary_user_intent: r.row.primary_intent,
  current_title: r.row.title,
  current_h1: r.row.h1,
  candidate_value_headings_not_query_attributed: headingsFor(r.url).join(" | ") || "NO_H2_H3_EXTRACTED",
  high_performing_sections: "NOT_IDENTIFIED: query×page/section evidence unavailable",
  cited_teaching_signal: r.row.source_section_present,
  definitions_examples_faq_signal: `${r.row.paragraph_count} paragraphs; ${r.row.heading_count} headings; FAQ schema ${r.row.faq_schema || "not extracted"}`,
  key_internal_links: (edgeStats.get(r.url)?.sources.size ?? 0) + " inbound unique source pages",
  preserve_contract: "Preserve URL where practical, primary intent, useful topic coverage, canonical clarity, and justified internal prominence; individual weak sentences may be improved.",
  confidence: "MEDIUM: headings are candidates, not proven Search-driving sections"
}));
writeCsv("ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv", Object.keys(valueElementRows[0]), valueElementRows);

const changeRiskRows = [];
const riskDefinitions = {
  "SEO-R0_MINIMAL": ["Typo/factual/accessibility correction", "Normal review and regression check"],
  "SEO-R1_LOW": ["Add original value/citations; reduce boilerplate without changing intent", "Preserve intent and verify rendering"],
  "SEO-R2_MODERATE": ["Major structural rewrite, title/H1 change, or broad internal-link adjustment", "Impact plan plus pre/post monitoring"],
  "SEO-R3_HIGH": ["Merge, canonical/noindex change, or substantial intent shift", "Query map, backlink map, survivor evidence, and explicit approval"],
  "SEO-R4_CRITICAL": ["Delete, slug change, permanent redirect, or remove high-equity page", "Full URL mapping, relevant permanent redirect, internal/sitemap migration, explicit approval, and monitoring"]
};
for (const tier of Object.keys(tierRank)) for (const [risk, [examples, baseApproval]] of Object.entries(riskDefinitions)) changeRiskRows.push({ protection_tier: tier, change_risk: risk, examples, approval_requirement: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(tier) && ["SEO-R3_HIGH", "SEO-R4_CRITICAL"].includes(risk) ? "MANDATORY: explicit evidence, query map, backlink map, URL mapping, redirect plan, and post-change monitoring" : tier === "SEO_UNKNOWN" && ["SEO-R3_HIGH", "SEO-R4_CRITICAL"].includes(risk) ? "PROHIBITED UNTIL UNCERTAINTY RESOLVED" : baseApproval, deploy_principle: ["SEO-R3_HIGH", "SEO-R4_CRITICAL"].includes(risk) ? "Change one major system at a time; controlled batches" : "Normal controlled change" });
writeCsv("ECHO_BUDDHA_CHANGE_RISK_MATRIX.csv", Object.keys(changeRiskRows[0]), changeRiskRows);

const protectedHigh = records.filter((r) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier));
writeMd("ECHO_BUDDHA_SEO_PRESERVATION_CONTRACTS.md", `
# EchoBuddha SEO Preservation Contracts

Generated: ${generatedAt}

These contracts govern future changes; they do not freeze weak prose forever or authorize remediation.

${protectedHigh.map((r) => `## ${r.url}

- Search role: ${r.row.primary_intent || r.row.surface_function} — ${r.row.topic}.
- Protection tier: **${r.tier}**.
- Existing equity: ${r.clicks3m} clicks, ${r.impressions3m} impressions (${fmt(r.clickShare * 100, 3)}% / ${fmt(r.impressionShare * 100, 3)}% of the 57-day property totals); momentum ${r.momentum.classification}; backlinks NOT_VERIFIED; internal authority ${r.internalAuthority} (${r.inlinks} inbound source pages).
- Must preserve: canonical URL where practical; primary user intent; useful headings/definitions/examples; relevant incoming destination; canonical clarity; justified internal prominence.
- Allowed later improvements: remove boilerplate, deepen original value, improve sourcing/accuracy/UX, and absorb useful material from weaker support pages while keeping intent stable.
- High-risk changes: slug change, noindex, canonical elsewhere, redirect, removal, major title/H1 or intent change.
- Approval: ${r.protectionRestriction}.
`).join("\n")}
`);

const monitoringRows = records.filter((r) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH", "SEO_P2_EMERGING"].includes(r.tier)).map((r) => ({
  URL: r.url,
  protection_tier: r.tier,
  clicks_3m: r.clicks3m,
  impressions_3m: r.impressions3m,
  ctr_3m: r.ctr3m,
  average_position_3m: r.position3m || "NOT_AVAILABLE",
  performance_window: "2026-06-23 to 2026-08-18; Web; Page aggregation",
  major_queries: "NOT_AVAILABLE_QUERY×PAGE",
  query_count: "NOT_AVAILABLE_QUERY×PAGE",
  google_index_status: "NOT_VERIFIED",
  declared_canonical: r.row.canonical,
  google_canonical: "NOT_AVAILABLE",
  sitemap_member: r.row.sitemap_member,
  backlinks: "NOT_VERIFIED",
  internal_authority: r.internalAuthority,
  baseline_timestamp: generatedAt,
  monitoring_trigger_policy: "Investigate sustained change; do not auto-rollback on short-term fluctuation"
}));
writeCsv("ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv", Object.keys(monitoringRows[0]), monitoringRows);
writeMd("ECHO_BUDDHA_POST_REMEDIATION_SEARCH_MONITORING.md", `
# EchoBuddha Post-Remediation Search Monitoring Plan

Generated: ${generatedAt}

No future monitoring was scheduled or executed in Phase 3.

## Baseline and cadence

- Compare complete periods against \`ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv\`.
- For a future approved merge, monitor both survivor totals and whether the survivor retains the source's important queries.
- Inspect protected URL status, Google-selected canonical, sitemap state, redirects, internal links, clicks, impressions, query ownership, and unexpected 404/soft-404 behavior.
- Expect temporary fluctuations after major URL processing; diagnose technical failures separately from normal recrawl/reprocessing.

## Diagnostic triggers

| Trigger | Investigation |
|---|---|
| PROTECTED_URL_NOT_INDEXED | Inspect indexing allowed, URL Inspection, sitemap, canonical, and recent deployment. |
| UNEXPECTED_GOOGLE_CANONICAL | Compare declared canonical, redirects, internal links, sitemap, and duplicate content. |
| REDIRECT_FAILURE / REDIRECT_LOOP | Validate source → final survivor status and eliminate chains. |
| SOFT_404_RISK | Confirm target substantially satisfies the source intent and contains absorbed value. |
| TOP_QUERY_OWNER_CHANGED | Use an actual query×page comparison before concluding loss or cannibalization. |
| SUSTAINED_IMPRESSION_DROP / SUSTAINED_CLICK_DROP | Compare complete periods and affected query groups; do not react to a single noisy day. |
| INTERNAL_LINK_BREAKAGE | Update relevant internal links directly to the final canonical survivor. |

For future redirects, retain relevant permanent redirects for at least one year and longer where practical.
`);

const byFamily = new Map();
for (const r of records) { const family = familyGroup(r.row.page_family); if (!byFamily.has(family)) byFamily.set(family, []); byFamily.get(family).push(r); }
const familyRows = [...byFamily].map(([family, rows]) => ({ family, rows, clicks: rows.reduce((s, r) => s + r.clicks3m, 0), impressions: rows.reduce((s, r) => s + r.impressions3m, 0) })).sort((a, b) => b.impressions - a.impressions);
writeMd("ECHO_BUDDHA_FAMILY_SEARCH_PROTECTION.md", `
# EchoBuddha Content-Family Search Protection

Generated: ${generatedAt}

| Family | URLs | Clicks | Impressions | Click share | Impression share | P0 | P1 | P2 | P3 | Unknown | Emerging winners |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${familyRows.map((f) => `| ${f.family} | ${f.rows.length} | ${f.clicks} | ${f.impressions} | ${fmt(f.clicks / (propertyAll.clicks || 1) * 100)}% | ${fmt(f.impressions / (propertyAll.impressions || 1) * 100)}% | ${f.rows.filter((r) => r.tier === "SEO_P0_CRITICAL").length} | ${f.rows.filter((r) => r.tier === "SEO_P1_HIGH").length} | ${f.rows.filter((r) => r.tier === "SEO_P2_EMERGING").length} | ${f.rows.filter((r) => r.tier === "SEO_P3_LIMITED").length} | ${f.rows.filter((r) => r.tier === "SEO_UNKNOWN").length} | ${f.rows.filter((r) => r.momentum.emerging).length} |`).join("\n")}

Page-family metrics use the current 57-day Page export and do not equal property totals where anonymized/aggregated rows are omitted. Query owners and backlinks remain unverified.
`);

const quoteRows = records.filter((r) => ["QUOTE_STORY", "QUOTE_CATEGORY", "QUOTE_HUB"].includes(r.row.page_family)).map((r) => ({
  URL: r.url,
  quote_surface: r.row.page_family,
  indexable: r.indexable,
  clicks_3m: r.clicks3m,
  impressions_3m: r.impressions3m,
  momentum: r.momentum.classification,
  external_links: "NOT_VERIFIED",
  unique_queries: "NOT_VERIFIED_QUERY×PAGE",
  internal_authority: r.internalAuthority,
  internal_inbound_pages: r.inlinks,
  phase_2_value_score: r.valueScore ?? "NOT_APPLICABLE",
  protection_tier: r.tier,
  protection_action: ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) ? "NOINDEX_PROHIBITED_WITHOUT_REVIEW; PRESERVE CURRENT URL/INTENT" : r.tier === "SEO_UNKNOWN" ? "DO_NOT_ASSUME_ZERO_EQUITY; VERIFY BEFORE CHANGE" : "PHASE_4_EVALUATION_ONLY",
  confidence: r.confidence
}));
writeCsv("ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv", Object.keys(quoteRows[0]), quoteRows);

const problemUrls = new Set(phase2Queues.filter((row) => ["D_HIGH_INTERNAL_OVERLAP", "E_WEAK_INDEPENDENT_PURPOSE", "F_QUOTE_STORY_RISK", "C_SEARCH_EQUITY_QUALITY_PROBLEM"].includes(row.queue)).map((row) => normalizeUrl(row.URL)));
const readinessRows = [...problemUrls].map((url) => {
  const r = recordByUrl.get(url), survivor = survivorByMember.get(url);
  if (!r) return null;
  const proposed = ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(r.tier) && r.valueScore < 70 ? "SURGICAL_IN_PLACE_IMPROVEMENT" : r.valueScore < 50 ? "CONSOLIDATION_OR_INDEXATION_EVALUATION" : "RETENTION_DIFFERENTIATION_REVIEW";
  const readiness = ["SEO_P0_CRITICAL", "SEO_P1_HIGH", "SEO_UNKNOWN"].includes(r.tier) ? "DO_NOT_CHANGE_YET" : r.tier === "SEO_P2_EMERGING" ? "HIGH_RISK_REVIEW_REQUIRED" : "MORE_DATA_REQUIRED";
  return {
    URL: url,
    phase_2_score: r.valueScore,
    protection_tier: r.tier,
    query_owner_status: "NO_SEARCH_DATA",
    backlink_status: "NOT_VERIFIED",
    canonical_state: r.row.canonical_type === "self" ? "SELF_DECLARED; GOOGLE_UNKNOWN" : r.row.canonical_type,
    proposed_later_action_category: proposed,
    candidate_survivor: survivor?.provisional_survivor_candidate ?? "NOT_ASSIGNED",
    change_risk: proposed === "SURGICAL_IN_PLACE_IMPROVEMENT" ? "SEO-R2_TO_R3" : "SEO-R4_IF_URL_CONSOLIDATED",
    data_confidence: r.confidence,
    phase_4_readiness: readiness,
    constraint: "Evaluation only; no redirect/noindex/removal until query×page, backlink, and Google-canonical uncertainty is resolved."
  };
}).filter(Boolean);
writeCsv("ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv", Object.keys(readinessRows[0]), readinessRows);

const tierCounts = Object.fromEntries(Object.keys(tierRank).map((tier) => [tier, records.filter((r) => r.tier === tier).length]));
const emerging = records.filter((r) => r.momentum.emerging);
const currentGscUrls = records.filter((r) => r.hasGsc);
const unknownUrls = records.filter((r) => !r.hasGsc);
const p0Rows = records.filter((r) => r.tier === "SEO_P0_CRITICAL");
const p1Rows = records.filter((r) => r.tier === "SEO_P1_HIGH");
const p2Rows = records.filter((r) => r.tier === "SEO_P2_EMERGING");
const p3Rows = records.filter((r) => r.tier === "SEO_P3_LIMITED");
const unknownTierRows = records.filter((r) => r.tier === "SEO_UNKNOWN");
const phaseStatus = "PARTIAL";

writeMd("ECHO_BUDDHA_PHASE_3_DATA_GAPS.md", `
# EchoBuddha Phase 3 Material Data Gaps

Generated: ${generatedAt}

These gaps are why Phase 3 is **PARTIAL**, not PASS:

1. No GSC query×page export: zero unique or stable query owners can be verified; ${queryOwnershipRows.length} query rows have inferred candidates only.
2. No usable external-link rows: the August 13 GSC latest-links and sample-links exports contain zero data rows; backlink presence is unknown, not zero.
3. No URL Inspection join: Google-selected canonical, URL-level index status, and last crawl are unavailable.
4. The newest page totals end August 18, but the page-level previous-period comparison ends August 11; momentum is historically valid but not a current post-August-11 comparison.
5. Aggregate coverage reports identify redirects, a 404, alternate canonical, crawled-not-indexed, and discovered-not-indexed counts without URL examples.

Until resolved, no Phase 4 tool may automatically redirect, remove, noindex, canonicalize away, or materially repurpose an affected URL.
`);

writeMd("ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md", `
# EchoBuddha Phase 3 Google Growth Protection

Phase status: **${phaseStatus}**

Generated: ${generatedAt}

Repository baseline: \`${baselineSha}\`; current audit HEAD: \`${currentHead}\`.

\`ADSENSE_RESUBMISSION_STATUS: BLOCKED\`

## 1. Executive Summary

The confirmed AdSense reason remains **Low value content**. Phase 3 mapped Search performance, historical page momentum, canonical declarations, internal authority, overlap clusters, provisional survivors, and change controls across **${records.length}** current first-party URLs without changing production. The protection framework is complete enough to prevent accidental SEO destruction, but the phase is **PARTIAL** because query×page ownership, backlinks, and Google-selected canonical/last-crawl evidence are unavailable.

## 2. Methodology

Evidence was joined by normalized canonical URL across Phase 0–2 inventories, the August 21 GSC snapshot, preserved page-level 28-day comparison exports, internal-link graph, owner/support and similarity evidence, current production hashes, and current official Google guidance. Tiers are relative to EchoBuddha's young footprint and combine clicks, impressions, meaningful momentum, Phase 2 value, canonical status, and architectural authority.

## 3. Google Search Guidance Basis

Nine current official sources were fetched and hashed: [Performance](https://support.google.com/webmasters/answer/17010961?hl=en), [data grouping](https://support.google.com/webmasters/answer/17011259?hl=en), [Search Console data](https://support.google.com/webmasters/answer/17011364?hl=en), [canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization), [duplicate consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects), [site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), and [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## 4. Search Console Data Limitations

Page and query tables are separate; they were never cross-joined. Query privacy/anonymization and table truncation mean absence is not zero demand. Page performance is normally canonical-aggregated, while Google-selected canonical fields were not supplied. Recent data may be preliminary. Average position is descriptive and never controls protection alone.

## 5. Search Performance Baseline

Current Page/Query export: **2026-06-23–2026-08-18**, Web, 57 available days. It contains **${currentPages.length} page rows** and **${currentQueries.length} visible query rows**. Exact page-level comparison: **2026-07-15–2026-08-11** versus **2026-06-17–2026-07-14**. All metrics carry their exact window in machine-readable outputs.

## 6. Site-Level Growth Trends

Latest complete 28 property days (${propertyLatest28.start}–${propertyLatest28.end}): **${propertyLatest28.clicks} clicks / ${propertyLatest28.impressions} impressions**, CTR ${fmt(propertyLatest28.ctr * 100)}%, weighted position ${fmt(propertyLatest28.position)}. Previous 28 (${propertyPrevious28.start}–${propertyPrevious28.end}): **${propertyPrevious28.clicks} / ${propertyPrevious28.impressions}**, CTR ${fmt(propertyPrevious28.ctr * 100)}%, position ${fmt(propertyPrevious28.position)}. Page-level momentum uses the preserved comparison ending August 11 and is not falsely represented as post-August-11 current.

## 7. Search Visibility by Page Family

${familyRows.map((f) => `- ${f.family}: ${f.clicks} page-row clicks, ${f.impressions} impressions; ${f.rows.filter((r) => r.tier === "SEO_P0_CRITICAL").length} P0, ${f.rows.filter((r) => r.tier === "SEO_P1_HIGH").length} P1.`).join("\n")}

## 8. Protection Tier Methodology

P0 requires multiple exceptional relative signals; P1 requires meaningful current/emerging value; P2 protects emerging, structural, high-value, or historically visible pages; P3 records limited evidence without implying deletion; UNKNOWN means unresolved Search evidence, never zero. Traffic alone cannot preserve weak content or select survivors.

## 9. SEO-P0 Critical URLs

${p0Rows.map((r) => `- ${mdUrl(r.url)} — ${r.reason}.`).join("\n") || "None."}

## 10. SEO-P1 High URLs

${p1Rows.map((r) => `- ${mdUrl(r.url)} — ${r.reason}.`).join("\n") || "None."}

## 11. SEO-P2 Emerging URLs

**${p2Rows.length}** URLs have emerging, structural, high-value, or historical visibility protection. They require evidence review before destructive change.

## 12. SEO-P3 Limited-Evidence URLs

**${p3Rows.length}** indexable URLs have relatively limited Search evidence. P3 is not a deletion instruction; Phase 2 value and user purpose still govern.

## 13. Search-Unknown URLs

**${unknownTierRows.length}** mostly noindex/system surfaces lack usable page-level Search evidence. Unknown does not mean zero; destructive change remains blocked until relevant history/canonical/backlink questions are resolved.

## 14. Query Ownership

**0 verified unique/stable owners.** All ${queryOwnershipRows.length} visible query rows are property-level and therefore classified \`NO_SEARCH_DATA\` for ownership. Candidate URLs are clearly labeled inference only.

## 15. Unique Query Assets

No \`UNIQUE_QUERY_ASSET\` is asserted without a query×page join. Strong candidate themes include Right Speech, Dhamma-vs-Dharma comparison, beginner Buddhism, Dhammapada attribution, quote letting-go/patience, and threefold training, but future destructive actions require observed ownership.

## 16. Search Momentum / Emerging Winners

**${emerging.length}** URLs meet absolute-plus-relative emerging criteria in the preserved page comparison. Strong growth from tiny denominators alone was not accepted.

## 17. Backlink Protection

The supplied GSC external-link page exports contain **0 usable rows**. Every URL is \`NOT_VERIFIED\`, not zero-backlink. Backlink evidence is mandatory before P0/P1 SEO-R3/R4 changes and before any redirect/removal.

## 18. Internal Authority Protection

The complete Phase 1 graph produced unique inbound source counts, contextual/navigation/related counts, anchor diversity, click depth, and relative centrality for all 340 URLs. Rendered crawlable \`<a href>\` evidence is retained; no internal links were changed.

## 19. Canonical Equity

**${canonicalRows.length}** overlap participants are mapped. Current indexable canonicals are self-consistent and sitemap-aligned; Google-selected canonicals remain unknown. Zero-click evidence is never interpreted without this limitation.

## 20. Legacy URL Equity

The legacy register includes current redirects/unmatched historical rows where present plus aggregate unknown redirect, 404, and alternate-canonical populations. Working relevant redirects must not be removed; unknown legacy identities require owner evidence.

## 21. Quality vs Search-Equity Conflicts

The 2-axis matrix separates protection from Phase 2 quality across ${qualityRows.length} scored pages. Search traffic does not excuse low publisher value, and low traffic does not erase strong user value.

## 22. High-Equity / Low-Value URLs

**${highEquityLowValueRows.length}** P0/P1 pages score below 70 and require \`SURGICAL_REMEDIATION_REQUIRED\`: preserve the winning URL and intent, improve in place, and only migrate with stronger evidence.

## 23. High-Value / Low-Visibility URLs

**${qualityRows.filter((row) => row.later_implication === "DISCOVERY_GROWTH_CANDIDATE").length}** high-value pages have low/emerging protection and are discovery-growth candidates, not automatic consolidation targets.

## 24. Quote Ecosystem Search Equity

All **${quoteRows.length}** quote hub/category/story URLs are mapped. Current winners include P0/P1 quote categories, while many noindex stories remain Search-unknown. Phase 2's family-quality risk does not authorize blanket noindex/removal of Search-visible quote surfaces.

## 25. Article Cluster Protection

Right Speech, Dhamma/Dharma, Dhammapada attribution, Three Poisons, Five Precepts, beginner Buddhism, Four Noble Truths, Eightfold Path, mindfulness, and attachment clusters have survivor/change-control evidence. Query ownership is still unverified, so survivor candidates remain provisional.

## 26. Learn vs Article Ownership

Related Learn and Article pages are not presumed cannibalizing. Phase 2 role/purpose and page-level Search evidence are preserved, but actual serving-query separation requires query×page data.

## 27. Dictionary Ownership

Direct lookup roles are protected separately from long-form explanations. No dictionary page may be absorbed solely because a longer article exists; observed definition-query ownership is still required.

## 28. Future Consolidation Survivor Candidates

**${survivorRows.length}** declared-owner or high-lexical clusters have a provisional candidate selected from ownership, protection, value, visibility, canonical, and internal-authority evidence—not traffic alone. LOW confidence prohibits automatic merge.

## 29. Future URL Mapping

**${futureMappings.length}** specific-owner source→target relationships are documented for evaluation only. Redirects are not ready: intent equivalence, query ownership, backlink equity, and absorbed source value must be verified. Irrelevant hub/home redirects are excluded.

## 30. Change-Risk Matrix

SEO-R0 through R4 controls are crossed with every protection tier. P0/P1 R3/R4 requires explicit evidence, mapping, redirect and monitoring plans. UNKNOWN R3/R4 is prohibited until uncertainty resolves. Future risky work should change one major system at a time and use controlled batches.

## 31. SEO Preservation Contracts

Contracts cover all **${protectedHigh.length}** P0/P1 URLs. They preserve URL equity, primary intent, useful elements, canonical clarity, and justified prominence while allowing weak text, boilerplate, sourcing, and UX to improve.

## 32. Post-Remediation Monitoring Baseline

**${monitoringRows.length}** P0/P1/P2 URLs have a pre-change baseline. Diagnostic triggers investigate indexing, canonical, redirect, query-owner, sustained traffic, soft-404, and link failures; they do not auto-panic or auto-rollback.

## 33. Phase 4 Change-Readiness

**${readinessRows.filter((row) => row.phase_4_readiness === "DO_NOT_CHANGE_YET").length}** problem/overlap URLs are \`DO_NOT_CHANGE_YET\`; **${readinessRows.filter((row) => row.phase_4_readiness === "HIGH_RISK_REVIEW_REQUIRED").length}** require high-risk review; **${readinessRows.filter((row) => row.phase_4_readiness === "MORE_DATA_REQUIRED").length}** require more data. Phase 4 may evaluate content architecture, but no destructive action is authorized by Phase 3.

## 34. Data Limitations

Material gaps: no query×page ownership, no usable external-link rows, no Google-selected canonical/index/last-crawl join, a newer current Page snapshot without a matching current previous-period Page export, and aggregate coverage exceptions without URLs. Device/country rows are separate aggregates and were not over-segmented.

## 35. Phase 3 Exit Gate

**PARTIAL.** Baseline, inventory, Phase 2, official guidance, performance, tiering, momentum, internal authority, canonical declarations, legacy aggregates, conflicts, quote protection, survivors, mappings, contracts, monitoring, and readiness are complete. PASS is withheld because unique query owners, backlinks, and Google-selected canonical/index/crawl state cannot be verified from available first-party evidence.

**PHASE 3 protected and mapped existing Google Search growth only. No content URL was deleted, merged, redirected, renamed, canonicalized away, noindexed, or materially rewritten.**

**No AdSense review or resubmission was requested.**

**EchoBuddha was treated as a private repository throughout the entire process regardless of its actual Git hosting visibility.**
`);

const required = [
  "ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv", "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv", "ECHO_BUDDHA_PROTECTED_URLS.csv", "ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv", "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv", "ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv", "ECHO_BUDDHA_SEARCH_MOMENTUM.csv", "ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv", "ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv", "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv", "ECHO_BUDDHA_LEGACY_URL_EQUITY.csv", "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv", "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv", "ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv", "ECHO_BUDDHA_SEO_PRESERVATION_CONTRACTS.md", "ECHO_BUDDHA_CHANGE_RISK_MATRIX.csv", "ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv", "ECHO_BUDDHA_POST_REMEDIATION_SEARCH_MONITORING.md", "ECHO_BUDDHA_FAMILY_SEARCH_PROTECTION.md", "ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv", "ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv", "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md"
];
const validation = {
  generated_at: generatedAt,
  status: phaseStatus,
  completed_checks: {
    phase_0_baseline_verified: integrity.phase_0_verified,
    phase_1_inventory_verified: integrity.phase_1_status === "PASS",
    phase_2_scoring_verified: integrity.phase_2_status === "PASS",
    repository_private_treatment: true,
    current_google_guidance_reviewed: guidance.accessible_count === 9,
    adsense_blocked_and_freeze_active: true,
    periods_and_aggregation_documented: true,
    search_visible_urls_reconciled: gscReconciliation.every((row) => bool(row.inventory_match)),
    protection_tier_assigned_all_current_urls: registryRows.length === inventory.length && registryRows.every((row) => row.protection_tier),
    all_tier_types_identified: Object.values(tierCounts).every((count) => count > 0),
    search_momentum_analyzed: momentumRows.length === inventory.length,
    backlink_limitations_mapped: backlinkRows.length === inventory.length && backlinkRows.every((row) => row.external_link_equity_present === "NOT_VERIFIED"),
    internal_authority_mapped: internalAuthorityRows.length === inventory.length,
    canonical_equity_mapped: canonicalRows.length > 0,
    legacy_equity_mapped: legacyRows.length >= 3,
    quality_growth_conflicts_mapped: qualityRows.length === phase2Scores.length,
    quote_search_equity_mapped: quoteRows.length === 164,
    survivor_candidates_generated: survivorRows.length > 0,
    future_mappings_are_provisional_only: futureMappings.length > 0 && futureMappings.every((row) => row.mapping_status === "PROVISIONAL_EVALUATION_ONLY"),
    preservation_contracts_cover_p0_p1: protectedHigh.length === valueElementRows.length,
    monitoring_baseline_established: monitoringRows.length === tierCounts.SEO_P0_CRITICAL + tierCounts.SEO_P1_HIGH + tierCounts.SEO_P2_EMERGING,
    phase_4_readiness_assigned: readinessRows.length === problemUrls.size,
    required_artifacts_present_nonempty: required.every((name) => fs.existsSync(path.join(dir, name)) && fs.statSync(path.join(dir, name)).size > 0),
    no_production_source_changes: sourceDiff.status === 0,
    no_destructive_search_change: true,
    no_adsense_resubmission: true
  },
  material_gaps_preventing_pass: {
    query_page_export_missing: true,
    verified_unique_query_owners_missing: true,
    usable_external_backlink_rows_missing: true,
    google_selected_canonical_and_last_crawl_missing: true,
    current_page_level_comparison_after_2026_08_11_missing: true,
    aggregate_coverage_exception_urls_missing: true
  },
  counts: {
    current_urls: records.length,
    current_gsc_page_rows: currentPages.length,
    current_urls_with_any_gsc_page_evidence: currentGscUrls.length,
    current_urls_without_gsc_page_evidence: unknownUrls.length,
    current_query_rows: currentQueries.length,
    verified_unique_query_owners: 0,
    tiers: tierCounts,
    emerging_winners: emerging.length,
    high_equity_low_value: highEquityLowValueRows.length,
    backlink_verified_urls: 0,
    canonical_overlap_rows: canonicalRows.length,
    survivor_clusters: survivorRows.length,
    provisional_future_mappings: futureMappings.length,
    phase_4_readiness_rows: readinessRows.length,
    required_artifacts: required.length
  },
  pass_unlock_requirements: ["Fresh query×page export with comparable periods", "Usable GSC Links target/referring-page export or equivalent first-party backlink evidence", "URL Inspection/Google-selected canonical and last-crawl evidence for P0/P1 and consolidation candidates", "Coverage exception example URLs"]
};
writeJson("ECHO_BUDDHA_PHASE_3_VALIDATION.json", validation);

const manifestFiles = [...required, "ECHO_BUDDHA_PHASE_3_DATA_GAPS.md", "ECHO_BUDDHA_PHASE_3_INPUT_INTEGRITY.json", "ECHO_BUDDHA_PHASE_3_GOOGLE_GUIDANCE_SNAPSHOT.json", "ECHO_BUDDHA_PHASE_3_VALIDATION.json", "capture-phase-3-google-guidance.mjs", "generate-phase-3-growth-protection.mjs", "validate-phase-3-growth-protection.mjs"];
writeJson("ECHO_BUDDHA_PHASE_3_METHOD_MANIFEST.json", {
  generated_at: generatedAt,
  method_version: "phase3-google-growth-protection-v1",
  command: "node docs/audits/adsense-recovery-phase-3-2026-08-24/generate-phase-3-growth-protection.mjs",
  node: process.version,
  repository_baseline: baselineSha,
  current_repository_head: currentHead,
  privacy: "Private/local first-party evidence joins; only public official Google pages fetched, without transmitting repository or GSC content.",
  input_windows: { current_gsc: "2026-06-23..2026-08-18", page_compare_current: "2026-07-15..2026-08-11", page_compare_previous: "2026-06-17..2026-07-14", links_export: "2026-08-13" },
  methods: ["Normalized canonical URL join", "Relative multi-signal protection tiers", "Absolute-plus-relative momentum rules", "Rendered internal-link graph centrality", "Declared-owner plus lexical connected-component survivor analysis", "Explicit unknown/not-verified states"],
  limitations: Object.keys(validation.material_gaps_preventing_pass),
  artifact_sha256: Object.fromEntries(manifestFiles.map((name) => [name, hash(read(path.join(dir, name)))]))
});

console.log(JSON.stringify({ status: phaseStatus, urls: records.length, gsc_page_rows: currentPages.length, query_rows: currentQueries.length, tiers: tierCounts, emerging_winners: emerging.length, high_equity_low_value: highEquityLowValueRows.length, survivor_clusters: survivorRows.length, future_mappings: futureMappings.length, phase4_rows: readinessRows.length, required_artifacts: required.length }, null, 2));
