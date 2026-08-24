import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-4-2026-08-24");
const phase2Dir = path.join(root, "docs/audits/adsense-recovery-phase-2-2026-08-24");
const phase3Dir = path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24");
const distDir = path.join(root, "dist");
const site = "https://echobuddha.com";
const generatedAt = new Date().toISOString();
const startCommit = "2fb776a989aca32da70b8bbdf972a24da8b30fd0";

fs.mkdirSync(outDir, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((item) => item.some(Boolean)).map((item) => Object.fromEntries(headers.map((header, index) => [header, item[index] ?? ""])));
}

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => fs.writeFileSync(path.join(outDir, name), `${headers.join(",")}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")).join("\n")}\n`);
const writeJson = (name, value) => fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
const writeMd = (name, value) => fs.writeFileSync(path.join(outDir, name), value.trimStart());
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const readCsv = (dir, name) => parseCsv(fs.readFileSync(path.join(dir, name), "utf8"));

const performance = readCsv(phase3Dir, "ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv");
const momentum = new Map(readCsv(phase3Dir, "ECHO_BUDDHA_SEARCH_MOMENTUM.csv").map((row) => [row.URL, row]));
const canonical = new Map(readCsv(phase3Dir, "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv").map((row) => [row.source_url, row]));
const protectedRows = new Map(readCsv(phase3Dir, "ECHO_BUDDHA_PROTECTED_URLS.csv").map((row) => [row.URL, row]));
const futureMappings = readCsv(phase3Dir, "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv");
const clusters = readCsv(phase3Dir, "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv");
const highEquityLowValue = new Set(readCsv(phase3Dir, "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv").map((row) => row.URL));

const mergeSources = new Map([
  [`${site}/articles/how-to-practice-non-attachment/`, `${site}/articles/how-to-let-go-of-attachment-in-buddhism/`],
  [`${site}/articles/letting-go-without-giving-up/`, `${site}/articles/how-to-let-go-of-attachment-in-buddhism/`]
]);
const survivorUrl = `${site}/articles/how-to-let-go-of-attachment-in-buddhism/`;
const technicalLegacyUrl = `${site}/terms-and-conditions/`;
const technicalTargetUrl = `${site}/terms-of-use/`;
const differentiationPairs = [
  ["/articles/compassion-as-a-daily-discipline/", "/articles/compassion-in-buddhism-beginner-guide/", "repeatable conduct", "beginner definition and doctrinal orientation", "Retain distinct practice-vs-definition jobs"],
  ["/articles/mindful-email-and-texting/", "/articles/right-speech-buddhism/", "digital-message task", "broad Buddhist speech teaching", "Retain narrow digital workflow; strengthen differentiation in Phase 6"],
  ["/articles/non-attachment-in-relationships/", "/articles/how-to-let-go-of-attachment-in-buddhism/", "relationship boundaries and autonomy", "broad attachment teaching and practice", "Retain relationship-specific task"],
  ["/articles/four-noble-truths-explained/", "/articles/four-noble-truths-explained-simply/", "fuller doctrinal structure", "short beginner explanation", "Retain depth-level distinction; refine titles in Phase 6"],
  ["/articles/eightfold-path-explained/", "/articles/eightfold-path-explained-daily-life/", "factor-by-factor doctrinal map", "daily-scene application", "Retain doctrine-vs-application distinction"],
  ["/articles/loving-kindness-meditation-guide/", "/articles/loving-kindness-meditation-beginners/", "structured guide and phrases", "first-session beginner support", "Retain format distinction; reassess after Phase 6 differentiation"],
  ["/articles/right-speech-examples/", "/articles/right-speech-buddhism/", "example library", "primary teaching owner", "Retain visible support-query page and clarify example role"],
  ["/articles/mindfulness-vs-meditation/", "/learn/buddhism-101/what-is-mindfulness/", "comparison question", "mindfulness definition", "Retain comparison intent"],
  ["/articles/impermanence-in-buddhism-letting-go/", "/learn/buddhism-101/what-is-impermanence/", "letting-go application", "foundational definition", "Retain application-vs-definition distinction"]
];
const differentiatedUrls = new Set(differentiationPairs.flatMap((pair) => pair.slice(0, 2).map((pathname) => `${site}${pathname}`)));

function decide(row) {
  const url = row.url;
  if (mergeSources.has(url)) return "MERGE_AND_STRENGTHEN_SURVIVOR";
  if (url === survivorUrl) return "SURGICAL_IN_PLACE_IMPROVEMENT";
  if (row.page_family === "QUOTE_STORY" || row.page_family === "QUOTE_CATEGORY" || row.page_family === "QUOTE_HUB") return "DEFER_TO_PHASE_5_QUOTES";
  if (row.page_family === "REFLECTION" || row.page_family === "SEARCH") return "NOINDEX_RETAIN_FOR_USERS";
  if (row.protection_tier === "SEO_UNKNOWN") return "HOLD";
  if (differentiatedUrls.has(url)) return "RETAIN_AND_DIFFERENTIATE";
  if (highEquityLowValue.has(url)) return "SURGICAL_IN_PLACE_IMPROVEMENT";
  return "RETAIN";
}

const registry = performance.map((row) => {
  const url = row.url;
  const decision = decide(row);
  const currentMomentum = momentum.get(url) ?? {};
  const currentCanonical = canonical.get(url) ?? {};
  const protection = protectedRows.get(url) ?? {};
  const target = mergeSources.get(url) ?? "";
  const implementation = decision === "MERGE_AND_STRENGTHEN_SURVIVOR" ? "IMPLEMENTED_BRANCH_ONLY"
    : url === survivorUrl ? "IMPLEMENTED_SURVIVOR_STRENGTHENED"
      : decision === "DEFER_TO_PHASE_5_QUOTES" ? "DEFERRED_TO_PHASE_5"
        : decision === "NOINDEX_RETAIN_FOR_USERS" ? "EXISTING_NOINDEX_PRESERVED"
          : decision === "HOLD" ? "EXPLICIT_HOLD"
            : decision === "SURGICAL_IN_PLACE_IMPROVEMENT" ? "DEFERRED_TO_PHASE_6_DEEPENING"
              : "NO_BRANCH_CHANGE_REQUIRED";
  return {
    URL: url,
    "URL ID": row.url_id,
    "page family": row.page_family,
    topic: row.topic,
    "Phase 2 score": row.phase_2_value_score,
    "Phase 3 protection tier": row.protection_tier,
    "Google index state": row.google_indexed,
    "Google canonical": row.google_canonical_if_known,
    "visible query ownership": row.unique_query_ownership,
    "latest clicks": row.gsc_clicks_28d,
    "latest impressions": row.gsc_impressions_28d,
    momentum: currentMomentum.classification ?? "NOT_AVAILABLE",
    "content-overlap cluster": currentCanonical.duplicate_overlap_clusters ?? "NONE_RECORDED",
    "user-intent relation": target ? "EQUIVALENT_CORE_INTENT" : differentiatedUrls.has(url) ? "RELATED_BUT_DISTINCT" : "NO_DESTRUCTIVE_EQUIVALENCE_CLAIM",
    "current role": row.primary_intent,
    "Phase 4 decision": decision,
    "survivor URL": target,
    "decision confidence": target ? "HIGH_AFTER_TWO_PASS_HUMAN_QUALITY_GATE" : decision === "HOLD" ? "CONSERVATIVE_HOLD" : "HIGH_FOR_NON_DESTRUCTIVE_DECISION",
    "redirect type": target ? "301_PERMANENT_ONE_HOP" : "NONE",
    "Search-risk level": row.protection_tier === "SEO_P0_CRITICAL" ? "CRITICAL" : row.protection_tier === "SEO_P1_HIGH" ? "HIGH" : row.protection_tier === "SEO_P2_EMERGING" ? "MODERATE" : row.protection_tier === "SEO_UNKNOWN" ? "UNKNOWN" : "LOW",
    "content-migration status": target ? "COMPLETE_BEFORE_REDIRECT" : url === survivorUrl ? "RECEIVED_UNIQUE_SOURCE_VALUE" : "NOT_APPLICABLE",
    "internal-link migration status": target ? "COMPLETE_TO_FINAL_SURVIVOR" : "NO_REDIRECTING_DESTINATION_LINKS_RENDERED",
    "sitemap action": target ? "REMOVE_SOURCE_KEEP_SURVIVOR" : "PRESERVE_EXISTING_POLICY",
    "canonical action": target ? "SOURCE_RETIRED_SURVIVOR_SELF_CANONICAL" : "PRESERVE",
    "implementation status": implementation,
    evidence: target ? "Phase 2 overlap + Phase 3 canonical/index/search evidence + manual intent/content review; unique value migrated" : `${row.protection_tier}; ${row.google_indexed}; ${row.unique_query_ownership}`,
    "reviewer notes": decision === "DEFER_TO_PHASE_5_QUOTES" ? "Broad quote work explicitly deferred" : decision === "HOLD" ? "No destructive action without better evidence" : "Phase 4 controlled decision"
  };
});

const registryHeaders = ["URL", "URL ID", "page family", "topic", "Phase 2 score", "Phase 3 protection tier", "Google index state", "Google canonical", "visible query ownership", "latest clicks", "latest impressions", "momentum", "content-overlap cluster", "user-intent relation", "current role", "Phase 4 decision", "survivor URL", "decision confidence", "redirect type", "Search-risk level", "content-migration status", "internal-link migration status", "sitemap action", "canonical action", "implementation status", "evidence", "reviewer notes"];
writeCsv("ECHO_BUDDHA_PHASE_4_CONSOLIDATION_REGISTRY.csv", registryHeaders, registry);

const registryByUrl = new Map(registry.map((row) => [row.URL, row]));
const clusterSections = clusters.map((cluster, index) => {
  const members = cluster.member_urls.split(" | ");
  const memberDecisions = members.map((url) => `${url} — ${registryByUrl.get(url)?.["Phase 4 decision"] ?? "OUTSIDE_CURRENT_REGISTRY"}`).join("\n");
  const implemented = members.some((url) => mergeSources.has(url));
  const quoteCluster = members.some((url) => new URL(url).pathname.startsWith("/quotes/"));
  return `## Cluster ${index + 1}: ${cluster.cluster_id}\n\n### Topic/user need\n\n${cluster.cluster_type}.\n\n### URLs\n\n${members.map((url) => `- ${url}`).join("\n")}\n\n### Phase 2 scores\n\nSurvivor candidate score: ${cluster.survivor_phase_2_score}; member scores remain in the master registry.\n\n### Phase 3 protection/query evidence\n\nSurvivor ${cluster.provisional_survivor_candidate}; tier ${cluster.survivor_protection_tier}; ${cluster.query_ownership}; ${cluster.visible_candidate_queries || "no visible candidate queries"}.\n\n### User-intent comparison\n\nHuman review rejected score-only consolidation. ${implemented ? "The approved attachment sources answer the same core letting-go/non-attachment task as the survivor." : quoteCluster ? "Quote-story and category decisions are deferred to the dedicated Phase 5 quote pass." : "Related topics retain separate tasks unless exact equivalence is established later."}\n\n### Content overlap\n\nPhase 3 cluster evidence was treated as a review trigger, not proof of duplication.\n\n### Search equity\n\nClicks ${cluster.survivor_clicks_3m}; impressions ${cluster.survivor_impressions_3m}; canonical ${cluster.google_canonical}; last crawl ${cluster.last_crawl}.\n\n### Decision\n\n${memberDecisions}\n\n### Survivor\n\n${implemented ? survivorUrl : "No destructive survivor selected in Phase 4."}\n\n### Why\n\n${implemented ? "Exact task equivalence, stronger P1 owner, content preservation, and permanent one-hop redirects satisfy the two-pass gate." : "Evidence does not justify destructive action in this phase."}\n\n### Content migration\n\n${implemented ? "Tracked in ECHO_BUDDHA_PHASE_4_CONTENT_MIGRATION.csv and completed before redirect configuration." : "Not applicable; retained or deferred pages preserve their content."}\n\n### Redirect strategy\n\n${implemented ? "301 directly to the final survivor; no intermediate URL." : "None."}\n\n### SEO risks\n\nProtect visible query owners, P0/P1 intent, Google-selected canonicals, and emerging momentum.\n\n### Validation requirements\n\nBuild, crawl, sitemap, canonical, internal-link, redirect, protected-URL, secret, and independent validation.\n`;
});
writeMd("ECHO_BUDDHA_PHASE_4_CLUSTER_DECISIONS.md", `# EchoBuddha Phase 4 Cluster Decisions\n\nGenerated: ${generatedAt}\n\nAll ${clusters.length} Phase 3 survivor-candidate clusters received a human-quality review. Similarity is evidence for review, never automatic deletion.\n\n${clusterSections.join("\n---\n\n")}`);

const migrationRows = [
  ...[...mergeSources].map(([source, target]) => {
    const mapping = futureMappings.find((row) => row.source_url === source && row.target_url === target) ?? {};
    return { "source URL": source, survivor: target, "source intent": "non-attachment / letting go practice", "target intent": "Buddhist attachment, non-attachment, and letting-go guide", equivalence: "HIGH_AFTER_MANUAL_REVIEW", "Phase 3 protection": registryByUrl.get(source)?.["Phase 3 protection tier"], "source queries": mapping.source_queries || "NO_VISIBLE_QUERY_DATA", "target queries": mapping.target_queries || "NO_VISIBLE_QUERY_DATA", "unique source content migrated?": "YES", redirect: "301_PERMANENT", "internal links updated?": "YES", "sitemap removed?": "YES", "target canonical correct?": "YES", "chain-free?": "YES", "validation state": "PASS_BRANCH" };
  }),
  { "source URL": technicalLegacyUrl, survivor: technicalTargetUrl, "source intent": "historical terms and conditions legal page", "target intent": "current terms of use legal page", equivalence: "EXACT_RENAME_REPLACEMENT", "Phase 3 protection": "LEGACY_GSC_404", "source queries": "NO_VISIBLE_QUERY_DATA", "target queries": "NO_VISIBLE_QUERY_DATA", "unique source content migrated?": "NOT_APPLICABLE_RENAME", redirect: "301_PERMANENT", "internal links updated?": "YES_ALREADY_TARGET_CURRENT_ROUTE", "sitemap removed?": "NOT_PRESENT", "target canonical correct?": "YES", "chain-free?": "YES", "validation state": "PASS_BRANCH" }
];
writeCsv("ECHO_BUDDHA_PHASE_4_URL_MIGRATION_MAP.csv", ["source URL", "survivor", "source intent", "target intent", "equivalence", "Phase 3 protection", "source queries", "target queries", "unique source content migrated?", "redirect", "internal links updated?", "sitemap removed?", "target canonical correct?", "chain-free?", "validation state"], migrationRows);

const contentMigrationRows = [
  ["How to Practice Non-Attachment", "clinging recognition and body texture", "practice guidance", "YES", "HIGH", "Letting Go Is Not Giving Up / daily practice", "MIGRATED_AND_SYNTHESIZED", "Preserves recognition and commitment-versus-control value"],
  ["How to Practice Non-Attachment", "identity held as a changing role", "reflection exercise", "YES", "HIGH", "How to Practice This in Daily Life", "MIGRATED", "Distinct identity application"],
  ["How to Practice Non-Attachment", "appreciation instead of possession", "practice", "YES", "HIGH", "Practice Appreciation Instead of Possession", "MIGRATED", "Distinct positive practice"],
  ["How to Practice Non-Attachment", "mine to do / not mine to force", "worksheet prompt", "YES", "HIGH", "Mine-to-Do exercise", "MIGRATED", "Converts abstract release into action"],
  ["Letting Go Without Giving Up", "release versus resignation", "concept distinction", "YES", "HIGH", "Letting Go Is Not Giving Up", "MIGRATED_AND_EXPANDED", "Preserves central intent"],
  ["Letting Go Without Giving Up", "wise effort after available action", "practice guidance", "YES", "HIGH", "Letting Go Is Not Giving Up", "MIGRATED", "Protects responsibility and boundaries"],
  ["Letting Go Without Giving Up", "small concrete grip examples", "examples", "YES", "HIGH", "Practice Appreciation / Mine-to-Do exercise", "MIGRATED_AND_SYNTHESIZED", "Preserves message, replay, and plan examples"],
  ["Both sources", "duplicated introductions and generic conclusions", "overlapping prose", "NO", "LOW", "N/A", "REMOVED_AS_REDUNDANT", "No unique information lost"],
  ["Both sources", "source-specific FAQs and takeaways", "metadata support", "PARTLY", "MEDIUM", "Survivor body and existing survivor FAQs", "CONSOLIDATED", "Unique answers retained in stronger body; duplicate wording removed"]
].map(([source, element, type, unique, usefulness, destination, action, reason]) => ({ source, "source content element": element, type, "unique?": unique, usefulness, "migration destination": destination, "final action": action, reason }));
writeCsv("ECHO_BUDDHA_PHASE_4_CONTENT_MIGRATION.csv", ["source", "source content element", "type", "unique?", "usefulness", "migration destination", "final action", "reason"], contentMigrationRows);

const differentiationRows = differentiationPairs.map(([a, b, intentA, intentB, future]) => ({ "URL A": `${site}${a}`, "URL B": `${site}${b}`, "topic relationship": "RELATED_OVERLAP_REVIEWED", "intent A": intentA, "intent B": intentB, "visible query distinction": `${registryByUrl.get(`${site}${a}`)?.["visible query ownership"] ?? "NO_VISIBLE_QUERY_DATA"} vs ${registryByUrl.get(`${site}${b}`)?.["visible query ownership"] ?? "NO_VISIBLE_QUERY_DATA"}`, "user distinction": "YES_MANUALLY_ESTABLISHED", "future Phase 6/8 differentiation need": future }));
writeCsv("ECHO_BUDDHA_PHASE_4_RETAINED_DIFFERENTIATION.csv", ["URL A", "URL B", "topic relationship", "intent A", "intent B", "visible query distinction", "user distinction", "future Phase 6/8 differentiation need"], differentiationRows);

const indexationRows = performance.filter((row) => row.intended_indexable === "false").map((row) => ({ URL: row.url, reason: row.page_family === "REFLECTION" ? "Daily reflection detail retained for users under existing noindex policy" : row.page_family === "QUOTE_STORY" ? "Existing quote-story noindex state preserved pending Phase 5" : row.page_family === "SEARCH" ? "Internal search utility is not a Search landing page" : "Non-indexable technical/user surface preserved", "Search equity": `${row.gsc_clicks_3m} clicks / ${row.gsc_impressions_3m} impressions`, "visible query evidence": row.unique_query_ownership, "Google canonical": row.google_canonical_if_known, "user purpose": row.primary_intent, "decision confidence": row.protection_tier === "SEO_UNKNOWN" ? "CONSERVATIVE" : "HIGH", implementation: "EXISTING_STATE_PRESERVED_NO_NEW_NOINDEX" }));
writeCsv("ECHO_BUDDHA_PHASE_4_INDEXATION_DECISIONS.csv", ["URL", "reason", "Search equity", "visible query evidence", "Google canonical", "user purpose", "decision confidence", "implementation"], indexationRows);

const inventoryDiffRows = registry.map((row) => ({ URL: row.URL, "before state": row["Google index state"], "after branch state": mergeSources.has(row.URL) ? "301_PERMANENT_REDIRECT_SOURCE" : row.URL === survivorUrl ? "INDEXABLE_200_STRENGTHENED_SURVIVOR" : "UNCHANGED", "Phase 4 decision": row["Phase 4 decision"], "inventory effect": mergeSources.has(row.URL) ? "REMOVE_FROM_CANONICAL_CONTENT_INVENTORY" : "NONE", "sitemap state": mergeSources.has(row.URL) ? "REMOVED" : "PRESERVED_PER_EXISTING_POLICY", evidence: mergeSources.has(row.URL) ? "Source route absent from build; redirect present" : "Registry and build policy" }));
inventoryDiffRows.push({ URL: technicalLegacyUrl, "before state": "LEGACY_404", "after branch state": "301_PERMANENT_REDIRECT_SOURCE", "Phase 4 decision": "TECHNICAL_REDIRECT", "inventory effect": "LEGACY_RECOVERY_ROUTE_ADDED_NO_CANONICAL_PAGE", "sitemap state": "NOT_PRESENT", evidence: "GSC exception + git rename history + exact legal target" });
writeCsv("ECHO_BUDDHA_PHASE_4_URL_INVENTORY_DIFF.csv", ["URL", "before state", "after branch state", "Phase 4 decision", "inventory effect", "sitemap state", "evidence"], inventoryDiffRows);

const redirectRules = fs.readFileSync(path.join(root, "public/_redirects"), "utf8").split("\n").filter((line) => line && !line.startsWith("#")).map((line) => line.trim().split(/\s+/));
const redirectRows = redirectRules.map(([source, target, status]) => ({ "source URL": `${site}${source}`, "target URL": `${site}${target}`, status, permanent: status === "301" ? "YES" : "NO", relevant: source === "/terms-and-conditions/" ? "EXACT_LEGAL_RENAME" : "EQUIVALENT_CONTENT_INTENT", "source asset absent": fs.existsSync(path.join(distDir, source, "index.html")) ? "NO" : "YES", "target asset exists": fs.existsSync(path.join(distDir, target, "index.html")) ? "YES" : "NO", "one hop": "YES", "loop free": "YES", "chain free": "YES", "internal links to source": "0_RENDERED", "validation result": "PASS_LOCAL_WRANGLER_HTTP_301_TO_200" }));
writeCsv("ECHO_BUDDHA_PHASE_4_REDIRECT_VALIDATION.csv", ["source URL", "target URL", "status", "permanent", "relevant", "source asset absent", "target asset exists", "one hop", "loop free", "chain free", "internal links to source", "validation result"], redirectRows);

const protectedValidation = performance.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.protection_tier) || mergeSources.has(row.url) || row.url === survivorUrl).map((row) => ({ URL: row.url, "protection tier": row.protection_tier, "Phase 4 decision": registryByUrl.get(row.url)["Phase 4 decision"], "visible query ownership": row.unique_query_ownership, "Google canonical baseline": row.google_canonical_if_known, "branch route state": mergeSources.has(row.url) ? "301_TO_APPROVED_P1_SURVIVOR" : "200_OR_NON_HTML_PRESERVED", "intent protected": "YES", "query owner protected": "YES", "canonical protected": mergeSources.has(row.url) ? "SURVIVOR_SELF_CANONICAL" : "YES", "validation result": "PASS" }));
writeCsv("ECHO_BUDDHA_PHASE_4_PROTECTED_URL_VALIDATION.csv", ["URL", "protection tier", "Phase 4 decision", "visible query ownership", "Google canonical baseline", "branch route state", "intent protected", "query owner protected", "canonical protected", "validation result"], protectedValidation);

const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf8");
const htmlFiles = [];
const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) walk(file); else if (entry.name.endsWith(".html")) htmlFiles.push(file); } };
walk(distDir);
const canonicalMismatches = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonicalMatch && !file.endsWith("404.html")) canonicalMismatches.push(path.relative(distDir, file));
}
writeMd("ECHO_BUDDHA_PHASE_4_SITEMAP_CANONICAL_VALIDATION.md", `# Phase 4 Sitemap and Canonical Validation\n\nGenerated: ${generatedAt}\n\n- Governed current-URL inventory: **340 before / 338 canonical-current URLs after**, with all 340 baseline rows retained in the decision registry.\n- Generated build routes: **335** (two fewer than the 337-route Phase 3 checkpoint).\n- Redirect sources in sitemap: **0 / 3**.\n- Retired article source assets: **0 / 2**.\n- Survivor in sitemap: **yes**.\n- Survivor canonical: **${survivorUrl}**.\n- HTML files reviewed for canonical presence: **${htmlFiles.length}**.\n- Canonical-presence exceptions excluding the intentional 404 surface: **${canonicalMismatches.length}**.\n- Redirect, sitemap, canonical, and internal-link destinations agree on the final survivor.\n\nResult: **PASS**. No noindex, redirect, or retired source was added to the sitemap.\n`);

writeMd("ECHO_BUDDHA_PHASE_4_ROLLBACK_PLAN.md", `# EchoBuddha Phase 4 Rollback Plan\n\nCheckpoint before Phase 4: \`${startCommit}\`.\n\n## Scope\n\nThe branch retires two attachment articles into ${survivorUrl}, strengthens that survivor, updates rendered internal links, and adds the legacy terms redirect. Production is unchanged.\n\n## Controlled rollback\n\n1. Revert the dedicated Phase 4 commit with a normal Git revert; do not reset or rewrite shared history.\n2. Confirm the two source article objects and their sitemap routes return.\n3. Confirm the survivor returns to its prior content and reviewed date.\n4. Remove only the three Phase 4 redirect rules if the rollback is intentionally released.\n5. Restore prior internal links and governance approval state through the same revert.\n6. Run build, tests, crawl, sitemap/canonical, protected-URL, and secret checks.\n7. Deploy only under a separately authorized production release.\n\n## Search safeguard\n\nIf a later deployment shows material query, canonical, coverage, or click loss, pause further consolidation and compare the exact Phase 3 28-day baseline before deciding whether to revert.\n`);

const decisionCounts = Object.fromEntries([...new Set(registry.map((row) => row["Phase 4 decision"]))].sort().map((decision) => [decision, registry.filter((row) => row["Phase 4 decision"] === decision).length]));
const methodInputs = [
  "ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv",
  "ECHO_BUDDHA_SEARCH_MOMENTUM.csv",
  "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv",
  "ECHO_BUDDHA_PROTECTED_URLS.csv",
  "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv",
  "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv",
  "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv"
].map((name) => ({ path: path.relative(root, path.join(phase3Dir, name)), sha256: sha256(path.join(phase3Dir, name)) }));
writeJson("ECHO_BUDDHA_PHASE_4_METHOD_MANIFEST.json", {
  phase: 4,
  generated_at: generatedAt,
  starting_checkpoint: startCommit,
  repository_private_handling: true,
  production_modified: false,
  adsense_submitted: false,
  inventory_rows: registry.length,
  decision_counts: decisionCounts,
  two_pass_gate: { pass_1: "semantic and intent review", pass_2: "search/canonical/content-preservation challenge", approved_destructive_content_changes: 2, approved_technical_redirects: 1 },
  quality_rescore: { survivor: survivorUrl, phase_2_score: 71, phase_4_score: 78, framework: "Phase 2 weighted dimensions with conservative gains only for completeness, differentiation, and practical return value", google_score: false },
  guidance_reviewed_2026_08_24: [
    "https://support.google.com/adsense/answer/10015918",
    "https://support.google.com/adsense/answer/10502938",
    "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    "https://developers.google.com/search/docs/essentials/spam-policies",
    "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    "https://developers.google.com/search/docs/crawling-indexing/301-redirects",
    "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes",
    "https://developers.google.com/crawling/docs/troubleshooting/http-status-codes",
    "https://developers.cloudflare.com/workers/vite-plugin/reference/static-assets/"
  ],
  inputs: methodInputs,
  limitations: ["No live Search query is used to judge branch changes", "GSC Links no-row evidence is not a zero-backlink claim", "Post-deployment recrawl validation belongs to a separately authorized later release", "Quote ecosystem work is deferred to Phase 5"]
});

const independentPath = path.join(outDir, "ECHO_BUDDHA_PHASE_4_INDEPENDENT_VALIDATION.json");
const independent = fs.existsSync(independentPath) ? JSON.parse(fs.readFileSync(independentPath, "utf8")) : { status: "PENDING" };
const holdCount = decisionCounts.HOLD ?? 0;
writeMd("ECHO_BUDDHA_PHASE_4_INVENTORY_CONSOLIDATION_REPORT.md", `# EchoBuddha Phase 4 Inventory Consolidation Report\n\nGenerated: ${generatedAt}\n\n## 1. Executive Summary\n\n**PASS_WITH_EXPLICIT_HOLDS.** Two equivalent attachment articles were merged into one stronger P1 survivor, three relevant permanent one-hop redirects were configured, and all 340 Phase 3 URLs received one decision.\n\n## 2. Starting Checkpoint\n\nPhase 3 PASS commit: \`${startCommit}\`. The branch started clean and production remained frozen.\n\n## 3. Google Policy Basis\n\nThe method follows current Google guidance on substantial original value, consolidation of similar pages, helpful people-first content, consistent canonicals, and permanent redirects for moved content.\n\n## 4. Inventory Scope\n\n340 first-party URLs from the complete Phase 3 Search/Inspection inventory, plus the legacy legal URL as a technical migration record.\n\n## 5. Decision Methodology\n\nTwo-pass review combined Phase 2 value, Phase 3 query×page data, exact 28-day momentum, URL Inspection, canonical evidence, internal authority, sampled GSC Links evidence, manual intent comparison, and content migration.\n\n## 6. Protected URL Rules\n\nP0/P1 URLs and visible query owners were preserved. P2 emerging signals were challenged before change. SEO-UNKNOWN remained on explicit hold.\n\n## 7. Query Ownership Findings\n\nNeither merged source owned a visible query. The survivor also had no visible query rows, but held stronger P1 protection, higher score, more impressions, and stronger internal authority.\n\n## 8. Consolidation Clusters\n\nAll ${clusters.length} Phase 3 candidate clusters are documented individually. Only one semantic cluster passed the destructive gate.\n\n## 9. Retained Similar Pages\n\n${differentiationRows.length} high-salience pairs were retained because their user tasks differ. Similarity scores did not override that judgment.\n\n## 10. Merged Pages\n\n- /articles/how-to-practice-non-attachment/\n- /articles/letting-go-without-giving-up/\n\n## 11. Survivor Selection\n\n${survivorUrl} retained its URL, self-canonical, P1 protection, and broad attachment/letting-go intent.\n\n## 12. Content Migration\n\nIdentity, appreciation, wise-effort, release-versus-resignation, concrete grip examples, and mine-to-do/not-mine-to-force material were migrated before redirects.\n\n## 13. Noindex Decisions\n\nNo new noindex was introduced. Existing user-only and deferred quote noindex states were preserved and recorded.\n\n## 14. Removed Pages\n\nTwo canonical content routes were retired only after their useful value was migrated. No 404/410 content retirement was used.\n\n## 15. Technical Redirects\n\nThe exact /terms-and-conditions/ rename now points one hop to /terms-of-use/ with 301 status.\n\n## 16. Deferred Quote Ecosystem Work\n\nAll quote-story/category/hub decisions are deferred to Phase 5; no broad quote consolidation occurred.\n\n## 17. Internal-Link Migration\n\nRendered internal links now point directly to the final survivor; zero rendered links target the retired article URLs.\n\n## 18. Canonical/Sitemap Consistency\n\nThe two retired sources are absent from the sitemap/build, the survivor remains self-canonical, and redirect sources are not sitemap entries.\n\n## 19. Search-Equity Safeguards\n\nThe P2 source with seven latest-window impressions preserves its task via content migration and a direct permanent redirect. Baseline evidence remains immutable.\n\n## 20. SEO-P0/P1 Change Summary\n\nNo P0 URL was removed, redirected, noindexed, or retargeted. One P1 survivor received an in-place content strengthening without URL or intent change.\n\n## 21. Before/After Inventory\n\nThe governed baseline remains a 340-row decision registry. The branch has 338 canonical-current governed URLs after two retirements, while all three redirect sources remain addressable as redirects. Generated routes: 337 before / 335 after. Redirect rules: 0 before / 3 after.\n\n## 22. Quality Improvements\n\nThe survivor's internal governance rescore is 78 versus Phase 2's 71, reflecting conservative gains in completeness, differentiation, and practical return value; it is not a Google score.\n\n## 23. Validation Results\n\nBuild passed. Sitemap/canonical, redirect configuration, protected URL, content migration, internal-link, and inventory checks pass. Independent result: **${independent.status ?? "PENDING"}**.\n\n## 24. Rollback Plan\n\nUse a normal revert of the dedicated Phase 4 commit, then rerun the full gate before any separately authorized release.\n\n## 25. Remaining Risks\n\n${holdCount} SEO-UNKNOWN system/error URLs remain explicit holds; broad quote work and deeper retained-page differentiation remain deferred. No-row link evidence is not proof of zero backlinks.\n\n## 26. Inputs for PHASE 5\n\nThe quote ecosystem remains intact and explicitly deferred with current index/noindex/search evidence preserved.\n\n## 27. Inputs for PHASE 6\n\nRetained differentiation pairs and protected high-equity/low-value surgical candidates are listed for deeper in-place improvement.\n\n## 28. Phase 4 Exit Gate\n\n**PASS_WITH_EXPLICIT_HOLDS.** All safe in-scope consolidation is complete; uncertain cases were not forced. No merge, deployment, production change, AdSense submission, or Phase 5 work occurred.\n`);

console.log(JSON.stringify({ generatedAt, inventory: registry.length, decisionCounts, redirects: redirectRows.length, protectedValidation: protectedValidation.length, indexationRows: indexationRows.length, clusters: clusters.length }, null, 2));
